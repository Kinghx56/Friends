"""You.com Web Search + Extract API integration for technical documentation retrieval.

Architecture (per the Saarthi Engineering Equivalence proposal):
  1. POST /v1/search  — finds the top relevant pages (datasheets, spec sheets, standards)
  2. For high-relevance hits, POST /v1/extract  — retrieves the full page text so Gemini
     can reason over actual specification numbers, not just page snippets.

Design constraints:
- Returns an empty list (not an error) when YOUCOM_API_KEY is not configured.
- Never exposes the API key in logs, error messages, or responses.
- All network I/O is async (httpx.AsyncClient).
- Extract is best-effort: if it fails we still return the search snippet.
- Snippets + extracted text are both capped so prompt payloads stay safe.
"""
import logging

import httpx

from config import settings

logger = logging.getLogger(__name__)

_YOUCOM_SEARCH_URL  = "https://api.you.com/v1/search"
_YOUCOM_EXTRACT_URL = "https://api.you.com/v1/extract"
_SEARCH_TIMEOUT  = 20.0
_EXTRACT_TIMEOUT = 15.0
_SNIPPET_CAP  = 400   # chars per joined snippet block
_EXTRACT_CAP  = 1200  # chars from full-page extract (richer for Gemini)
_RESULTS_PER_MATERIAL = 3   # search hits per material
_EXTRACT_TOP_N = 2          # extract full text from the top-N most relevant hits


class YouComError(Exception):
    """You.com call failed. Message is safe to surface to the client."""


def _build_query(material: dict) -> str:
    desc = material.get("standard_description") or ""
    spec = material.get("spec") or ""
    parts = [p.strip() for p in [desc, spec] if p.strip()]
    base = " ".join(parts)
    return f"{base} technical specifications datasheet"


def _normalise_hit(hit: dict) -> dict:
    snippets: list = hit.get("snippets") or []
    joined = " ".join(s.strip() for s in snippets if isinstance(s, str) and s.strip())
    return {
        "url": hit.get("url") or "",
        "title": hit.get("title") or "",
        "snippet": joined[:_SNIPPET_CAP],
        "extracted_text": "",   # filled in by _enrich_with_extract
    }


async def _extract_page(client: httpx.AsyncClient, url: str, headers: dict) -> str:
    """Call You.com Extract API for a single URL; return capped text or '' on failure."""
    if not url:
        return ""
    try:
        payload = {"url": url}
        resp = await client.post(
            _YOUCOM_EXTRACT_URL,
            headers=headers,
            json=payload,
            timeout=_EXTRACT_TIMEOUT,
        )
        if resp.status_code != 200:
            logger.debug("You.com Extract returned HTTP %s for %r", resp.status_code, url)
            return ""
        data = resp.json()
        # Response: {"text": "...", "title": "...", ...}
        text = str(data.get("text") or "").strip()
        return text[:_EXTRACT_CAP]
    except Exception as exc:
        logger.debug("You.com Extract failed for %r: %s", url, exc)
        return ""


async def search_docs(material: dict) -> list[dict]:
    """Search You.com for technical documentation for a material.

    Flow:
      1. Search for datasheets / spec pages via You.com Search API.
      2. Extract full text from the top-N most relevant results via Extract API.
      3. Return normalised hits with both snippet + extracted_text.

    Returns an empty list when YOUCOM_API_KEY is not configured.
    Raises YouComError on any network or API-level failure.
    """
    if not settings.YOUCOM_API_KEY:
        logger.debug("YOUCOM_API_KEY not set — skipping external doc retrieval")
        return []

    query = _build_query(material)
    headers = {
        "X-API-Key": settings.YOUCOM_API_KEY,
        "Content-Type": "application/json",
    }
    search_payload = {
        "query": query,
        "count": _RESULTS_PER_MATERIAL,
    }

    try:
        async with httpx.AsyncClient(timeout=_SEARCH_TIMEOUT) as client:
            response = await client.post(_YOUCOM_SEARCH_URL, headers=headers, json=search_payload)
            response.raise_for_status()
            data = response.json()

            # Response: {"results": {"web": [...]}, "metadata": {...}}
            web_results: list = (data.get("results") or {}).get("web") or []

            hits = []
            for item in web_results:
                try:
                    hits.append(_normalise_hit(item))
                except Exception:
                    logger.debug("Skipping malformed You.com result item", exc_info=True)

            # Enrich top-N hits with full extracted text (best-effort, same session)
            for i, hit in enumerate(hits[:_EXTRACT_TOP_N]):
                extracted = await _extract_page(client, hit["url"], headers)
                if extracted:
                    hits[i]["extracted_text"] = extracted
                    logger.debug(
                        "You.com Extract: got %d chars from %r",
                        len(extracted), hit["url"]
                    )

    except httpx.TimeoutException:
        logger.warning(
            "You.com request timed out for material %r",
            material.get("cnmc") or material.get("id")
        )
        raise YouComError(
            "Documentation retrieval timed out. The comparison will use internal specs only."
        )
    except httpx.HTTPStatusError as exc:
        code = exc.response.status_code
        logger.warning(
            "You.com returned HTTP %s for material %r",
            code, material.get("cnmc") or material.get("id")
        )
        if code in (401, 403):
            raise YouComError(
                "Documentation service authentication failed. Contact your system administrator."
            )
        if code == 429:
            raise YouComError(
                "Documentation service quota exceeded. The comparison will use internal specs only."
            )
        raise YouComError(
            f"Documentation service returned an error ({code}). "
            "The comparison will use internal specs only."
        )
    except httpx.RequestError as exc:
        logger.warning("You.com network error: %s", exc)
        raise YouComError(
            "Could not reach the documentation service. "
            "The comparison will use internal specs only."
        )

    logger.info(
        "You.com returned %d results (extract enriched: %d) for material %r",
        len(hits),
        sum(1 for h in hits if h.get("extracted_text")),
        material.get("cnmc") or material.get("standard_description", "")[:60],
    )
    return hits
