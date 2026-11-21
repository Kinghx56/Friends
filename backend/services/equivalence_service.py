"""Engineering Equivalence Engine.

Orchestrates a structured technical comparison between two materials:
  1. Retrieve supporting documentation from You.com in parallel (best-effort —
     degrades gracefully when the key is absent or the service is unavailable).
  2. Run a Gemini-powered parameter-by-parameter comparison.
  3. Return a structured report: parameters table, verdict, confidence, evidence.

Safety rules (non-negotiable):
  - Gemini assists with document interpretation. It never makes the final
    safety decision — verdict is always advisory.
  - Any unknown or non-whitelisted verdict from Gemini is coerced to
    "engineering_review_required", the safest possible outcome.
  - This function never raises. Every failure path returns a structured dict
    so the router always has something useful to return to the client.
"""
import asyncio
import json
import logging

from config import settings
from services.ai_common import AIServiceError, generate_text
from services.json_utils import extract_json
from services.youcom_service import YouComError, search_docs

logger = logging.getLogger(__name__)

# The only three allowed verdict values. Anything else Gemini returns gets
# coerced to the safe default below.
_VALID_VERDICTS = {"equivalent", "not_equivalent", "engineering_review_required"}
_SAFE_VERDICT = "engineering_review_required"

# Cap on evidence sources included in the Gemini prompt.
# 3 per material × 2 = 6 max, keeping prompt size predictable.
_MAX_EVIDENCE_IN_PROMPT = 6


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _material_summary(m: dict) -> dict:
    """Minimal safe representation of a material for the response payload."""
    return {
        "id": m.get("id") or "",
        "cnmc": m.get("cnmc") or "",
        "standard_description": m.get("standard_description") or "",
        "spec": m.get("spec") or "",
        "technical_specs": m.get("technical_specs") or {},
    }


def _evidence_text(docs_a: list[dict], docs_b: list[dict]) -> str:
    """Flatten evidence lists into a single text block for the prompt.

    Prefers extracted_text (full page from You.com Extract API) over the snippet
    when available, so Gemini has more specification detail to reason over.
    """
    all_docs = (docs_a + docs_b)[:_MAX_EVIDENCE_IN_PROMPT]
    if not all_docs:
        return "No external documentation retrieved."
    lines = []
    for doc in all_docs:
        title = doc.get("title") or ""
        url = doc.get("url") or ""
        # Use full extracted text if available, fall back to snippet
        body = (doc.get("extracted_text") or "").strip()
        if not body:
            body = (doc.get("snippet") or "").strip()
        if body:
            lines.append(f"[{title}] ({url})\n{body}")
    return "\n\n".join(lines) if lines else "No external documentation retrieved."


def _build_prompt(material_a: dict, material_b: dict, evidence: str) -> str:
    return f"""You are an expert materials engineer at an Indian oil & gas company.
Compare these two materials and determine if they are technically interchangeable.

MATERIAL A: {material_a.get("standard_description") or ""}
Specs: {material_a.get("spec") or "not specified"}
Technical specs: {json.dumps(material_a.get("technical_specs") or {})}
CNMC: {material_a.get("cnmc") or "not assigned"}

MATERIAL B: {material_b.get("standard_description") or ""}
Specs: {material_b.get("spec") or "not specified"}
Technical specs: {json.dumps(material_b.get("technical_specs") or {})}
CNMC: {material_b.get("cnmc") or "not assigned"}

EXTERNAL EVIDENCE (retrieved via You.com Search + Extract APIs — may include full datasheet text):
{evidence}

Compare every available parameter. Return ONLY a raw JSON object with no markdown fences:
{{
  "parameters": [
    {{
      "name": "<parameter name>",
      "value_a": "<value from material A, or 'not specified'>",
      "value_b": "<value from material B, or 'not specified'>",
      "match": "<match|mismatch|unverified>",
      "safety_critical": <true|false>,
      "notes": "<important note, or empty string>"
    }}
  ],
  "verdict": "<equivalent|not_equivalent|engineering_review_required>",
  "verdict_reason": "<one sentence explanation>",
  "confidence": <float between 0.0 and 1.0>
}}

Rules you must follow:
- Use "equivalent" ONLY when ALL safety-critical parameters are confirmed matches.
- Use "not_equivalent" when ANY safety-critical parameter is a confirmed mismatch.
- Use "engineering_review_required" when safety-critical parameters are unverified
  or the available evidence is insufficient to make a determination.
- Never approve substitution when dimensions, load ratings, pressure ratings,
  material grade, temperature rating, or sealing standard are unverified.
- If the two materials appear identical (same CNMC or same description), still
  enumerate all parameters and set verdict to "equivalent" with confidence 1.0.
"""


def _validate_parameters(raw: list) -> list[dict]:
    """Coerce and validate the parameters list from Gemini's response.

    Drops malformed entries rather than crashing; caps string fields to safe
    lengths; enforces the match enum.
    """
    valid_matches = {"match", "mismatch", "unverified"}
    result = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        match_val = str(item.get("match") or "unverified").lower().strip()
        if match_val not in valid_matches:
            match_val = "unverified"
        result.append({
            "name": str(item.get("name") or "Unknown parameter")[:100],
            "value_a": str(item.get("value_a") or "not specified")[:200],
            "value_b": str(item.get("value_b") or "not specified")[:200],
            "match": match_val,
            "safety_critical": bool(item.get("safety_critical", False)),
            "notes": str(item.get("notes") or "")[:300],
        })
    return result


def _parse_verdict(raw: dict) -> tuple[str, str, float]:
    """Extract and validate verdict, reason, and confidence from Gemini's JSON."""
    verdict = str(raw.get("verdict") or "").lower().strip()
    if verdict not in _VALID_VERDICTS:
        logger.warning("Gemini returned unknown verdict %r — coercing to safe default", verdict)
        verdict = _SAFE_VERDICT

    reason = str(raw.get("verdict_reason") or "")[:500]

    try:
        confidence = float(raw.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))
    except (TypeError, ValueError):
        confidence = 0.5

    return verdict, reason, confidence


def _degraded_response(
    material_a: dict,
    material_b: dict,
    evidence: list[dict],
    reason: str,
    youcom_configured: bool,
    ai_configured: bool,
) -> dict:
    """Return a safe, structured response when any service is unavailable."""
    return {
        "material_a": _material_summary(material_a),
        "material_b": _material_summary(material_b),
        "parameters": [],
        "verdict": _SAFE_VERDICT,
        "verdict_reason": reason,
        "evidence": evidence,
        "youcom_configured": youcom_configured,
        "ai_configured": ai_configured,
        "confidence": 0.0,
    }


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def _build_suggest_prompt(material_a: dict, candidates: list[dict]) -> str:
    candidates_text = "\n".join(
        f"- ID:{m.get('id')} CNMC:{m.get('cnmc') or 'N/A'} | {m.get('standard_description')} | Spec: {m.get('spec') or 'N/A'}"
        for m in candidates[:15]
    )
    return f"""You are an expert materials engineer at an Indian oil & gas company.

A material is out of stock or running low. Identify which of the following in-catalog materials
could potentially substitute it, based on engineering compatibility.

REQUIRED MATERIAL (Material A):
Description: {material_a.get("standard_description") or ""}
Spec: {material_a.get("spec") or "not specified"}
Technical specs: {json.dumps(material_a.get("technical_specs") or {})}
Category: {material_a.get("category") or ""}
CNMC: {material_a.get("cnmc") or "not assigned"}

IN-CATALOG CANDIDATES:
{candidates_text if candidates_text else "No candidates found in catalog."}

Return ONLY a raw JSON object with no markdown fences:
{{
  "suggestions": [
    {{
      "material_id": "<id from candidates list>",
      "cnmc": "<cnmc>",
      "standard_description": "<description>",
      "compatibility_score": <float 0.0-1.0>,
      "reason": "<one-sentence explanation of why this could substitute>"
    }}
  ],
  "search_note": "<brief note about what you searched for or why suggestions may be limited>"
}}

Rules:
- Only include candidates that have genuine potential for substitution (compatibility_score >= 0.4).
- Order by compatibility_score descending.
- Maximum 5 suggestions.
- If no candidates are suitable, return an empty suggestions array.
- Never invent material IDs — only use IDs from the candidates list above.
"""


async def suggest_substitutes(material_a: dict, catalog_candidates: list[dict]) -> dict:
    """Use AI to suggest potential substitutes for material_a from catalog_candidates.

    Never raises. Returns a structured dict with suggestions list.
    """
    ai_configured = bool(settings.GEMINI_API_KEY)

    if not ai_configured:
        return {
            "material_a": _material_summary(material_a),
            "suggestions": [],
            "ai_configured": False,
            "search_note": "AI service not configured — cannot auto-suggest substitutes.",
        }

    if not catalog_candidates:
        return {
            "material_a": _material_summary(material_a),
            "suggestions": [],
            "ai_configured": True,
            "search_note": "No approved materials found in the catalog to compare against.",
        }

    prompt = _build_suggest_prompt(material_a, catalog_candidates)

    try:
        raw_text = await generate_text(settings.GEMINI_MODEL_MATCHING, prompt)
    except (AIServiceError, Exception) as exc:
        logger.warning("Gemini call failed during substitute suggestion: %s", exc)
        return {
            "material_a": _material_summary(material_a),
            "suggestions": [],
            "ai_configured": True,
            "search_note": "AI analysis temporarily unavailable.",
        }

    try:
        raw = extract_json(raw_text)
        if not isinstance(raw, dict):
            raise ValueError("Expected object")
    except ValueError:
        return {
            "material_a": _material_summary(material_a),
            "suggestions": [],
            "ai_configured": True,
            "search_note": "Could not parse AI response.",
        }

    # Validate suggestions — only keep those whose IDs are in the candidate set
    valid_ids = {m["id"] for m in catalog_candidates}
    raw_suggestions = raw.get("suggestions") or []
    suggestions = []
    for s in raw_suggestions:
        if not isinstance(s, dict):
            continue
        mid = s.get("material_id", "")
        if mid not in valid_ids:
            continue
        try:
            score = float(s.get("compatibility_score", 0))
            score = max(0.0, min(1.0, score))
        except (TypeError, ValueError):
            score = 0.0
        suggestions.append({
            "material_id": mid,
            "cnmc": str(s.get("cnmc") or "")[:50],
            "standard_description": str(s.get("standard_description") or "")[:200],
            "compatibility_score": score,
            "reason": str(s.get("reason") or "")[:300],
        })

    # Sort by score descending, cap at 5
    suggestions.sort(key=lambda x: x["compatibility_score"], reverse=True)
    suggestions = suggestions[:5]

    logger.info(
        "Substitute suggestion complete for %s: %d candidates → %d suggestions",
        material_a.get("cnmc") or material_a.get("id"),
        len(catalog_candidates),
        len(suggestions),
    )

    return {
        "material_a": _material_summary(material_a),
        "suggestions": suggestions,
        "ai_configured": True,
        "search_note": str(raw.get("search_note") or "")[:300],
    }


async def check(material_a: dict, material_b: dict) -> dict:
    """Run a full equivalence check between two materials.

    Never raises. Always returns a structured report dict. On any service
    failure the verdict defaults to "engineering_review_required" so a human
    is always involved before any substitution is acted upon.
    """
    youcom_configured = bool(settings.YOUCOM_API_KEY)
    ai_configured = bool(settings.GEMINI_API_KEY)

    # ------------------------------------------------------------------
    # Stage 1 — Retrieve external documentation in parallel (best-effort)
    # ------------------------------------------------------------------
    docs_a: list[dict] = []
    docs_b: list[dict] = []

    if youcom_configured:
        try:
            docs_a, docs_b = await asyncio.gather(
                search_docs(material_a),
                search_docs(material_b),
            )
        except YouComError as exc:
            # Non-fatal — log and continue with internal specs only
            logger.warning("You.com retrieval failed (continuing without external docs): %s", exc)
        except Exception:
            logger.exception("Unexpected error during You.com retrieval — continuing without external docs")

    all_evidence = (docs_a + docs_b)[:8]  # cap the response payload too

    # ------------------------------------------------------------------
    # Stage 2 — Gemini comparison
    # ------------------------------------------------------------------
    if not ai_configured:
        return _degraded_response(
            material_a, material_b, all_evidence,
            "AI service is not configured — manual engineering review required.",
            youcom_configured=youcom_configured,
            ai_configured=False,
        )

    evidence_text = _evidence_text(docs_a, docs_b)
    prompt = _build_prompt(material_a, material_b, evidence_text)

    try:
        raw_text = await generate_text(settings.GEMINI_MODEL_MATCHING, prompt)
    except AIServiceError as exc:
        logger.warning("Gemini call failed during equivalence check: %s", exc)
        return _degraded_response(
            material_a, material_b, all_evidence,
            f"AI analysis unavailable ({exc.user_message}) — manual engineering review required.",
            youcom_configured=youcom_configured,
            ai_configured=ai_configured,
        )
    except Exception:
        logger.exception("Unexpected error during equivalence Gemini call")
        return _degraded_response(
            material_a, material_b, all_evidence,
            "Unexpected error during AI analysis — manual engineering review required.",
            youcom_configured=youcom_configured,
            ai_configured=ai_configured,
        )

    # ------------------------------------------------------------------
    # Stage 3 — Parse and validate the response
    # ------------------------------------------------------------------
    try:
        raw = extract_json(raw_text)
        if not isinstance(raw, dict):
            raise ValueError(f"Expected a JSON object, got {type(raw).__name__}")
    except ValueError as exc:
        logger.warning("Could not parse Gemini equivalence response: %s", exc)
        return _degraded_response(
            material_a, material_b, all_evidence,
            "AI returned an unreadable response — manual engineering review required.",
            youcom_configured=youcom_configured,
            ai_configured=ai_configured,
        )

    parameters = _validate_parameters(raw.get("parameters") or [])
    verdict, verdict_reason, confidence = _parse_verdict(raw)

    logger.info(
        "Equivalence check complete: %s vs %s → %s (confidence %.2f, %d parameters)",
        material_a.get("cnmc") or material_a.get("id"),
        material_b.get("cnmc") or material_b.get("id"),
        verdict,
        confidence,
        len(parameters),
    )

    return {
        "material_a": _material_summary(material_a),
        "material_b": _material_summary(material_b),
        "parameters": parameters,
        "verdict": verdict,
        "verdict_reason": verdict_reason,
        "evidence": all_evidence,
        "youcom_configured": youcom_configured,
        "ai_configured": ai_configured,
        "confidence": confidence,
    }
