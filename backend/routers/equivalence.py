"""Equivalence router — engineering interchangeability analysis.

POST /equivalence/check
  Body: { "material_a_id": "uuid", "material_b_id": "uuid" }
  Roles: engineer, accounts, admin

GET /equivalence/suggest-substitutes?material_a_id=<uuid>
  Roles: engineer, accounts, admin
  Returns AI-suggested in-catalog substitutes for a given material (Material A).

Returns a structured AI-assisted comparison report. The report is ephemeral —
nothing is saved to the database. A qualified engineer must review and approve
any substitution decision before it is acted upon.
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from supabase import Client

from dependencies import CurrentUser, get_current_user, get_supabase, require_roles
from services import equivalence_service
from services.validators import require_uuid

logger = logging.getLogger(__name__)

router = APIRouter()

_ALLOWED_ROLES = ("engineer", "accounts", "admin")

# Full material row — everything the equivalence engine needs
_MATERIAL_SELECT = (
    "id, cnmc, standard_description, short_description, spec, "
    "quality_grade, unit_of_measure, category, subcategory, "
    "material_type, technical_specs, status"
)


class EquivalenceCheckRequest(BaseModel):
    material_a_id: str = Field(..., description="UUID of the first material (the requested one)")
    material_b_id: str = Field(..., description="UUID of the second material (the candidate substitute)")


def _fetch_material(supabase: Client, material_id: str, label: str) -> dict:
    """Fetch a single approved or pending material row, or raise 404."""
    resp = (
        supabase.table("materials")
        .select(_MATERIAL_SELECT)
        .eq("id", material_id)
        .maybe_single()
        .execute()
    )
    if not resp or not resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"{label} not found")
    return resp.data


@router.get("/suggest-substitutes")
async def suggest_substitutes(
    material_a_id: str = Query(..., description="UUID of the material that needs a substitute"),
    supabase: Client = Depends(get_supabase),
    current_user: CurrentUser = Depends(require_roles(*_ALLOWED_ROLES)),
):
    """Suggest potential in-catalog substitutes for Material A.

    Uses AI to analyse Material A's specs and retrieve similar materials
    from the catalog that could potentially substitute it.
    Returns a list of candidate materials with a brief reasoning.
    Nothing is written to the database.
    """
    id_a = require_uuid(material_a_id, "Material A")
    material_a = _fetch_material(supabase, id_a, "Material A")

    logger.info(
        "Substitute suggestion requested by %s for material %s",
        current_user.id,
        material_a.get("cnmc") or id_a,
    )

    # Search the catalog for similar materials in the same category
    category = material_a.get("category") or ""
    description = material_a.get("standard_description") or ""

    # Fetch approved catalog materials in the same category (up to 20 candidates).
    # We intentionally keep this strict — only same-category materials are shown
    # so the AI is never presented with obviously unrelated items as substitutes.
    query = supabase.table("materials").select(_MATERIAL_SELECT).eq("status", "approved")
    if category:
        query = query.eq("category", category)

    resp = query.neq("id", id_a).limit(20).execute()
    catalog_candidates = resp.data or []

    # If the category yielded nothing (very small catalog), widen to all approved —
    # but only as a last resort so the engineer always gets relevant results first.
    if not catalog_candidates:
        resp2 = (
            supabase.table("materials")
            .select(_MATERIAL_SELECT)
            .eq("status", "approved")
            .neq("id", id_a)
            .limit(20)
            .execute()
        )
        catalog_candidates = resp2.data or []

    suggestions = await equivalence_service.suggest_substitutes(material_a, catalog_candidates)
    return suggestions


@router.post("/check")
async def check_equivalence(
    body: EquivalenceCheckRequest,
    supabase: Client = Depends(get_supabase),
    current_user: CurrentUser = Depends(require_roles(*_ALLOWED_ROLES)),
):
    """Check whether two materials are technically interchangeable.

    Returns an AI-assisted structured comparison. The result is advisory only —
    a qualified engineer must review and approve any substitution decision.
    Nothing is written to the database.
    """
    id_a = require_uuid(body.material_a_id, "Material A")
    id_b = require_uuid(body.material_b_id, "Material B")

    if id_a == id_b:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="material_a_id and material_b_id must refer to different materials",
        )

    material_a = _fetch_material(supabase, id_a, "Material A")
    material_b = _fetch_material(supabase, id_b, "Material B")

    logger.info(
        "Equivalence check requested by %s: %s vs %s",
        current_user.id,
        material_a.get("cnmc") or id_a,
        material_b.get("cnmc") or id_b,
    )

    report = await equivalence_service.check(material_a, material_b)
    return report
