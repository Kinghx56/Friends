"""Procurement router — external supplier search via SerpApi Google Shopping.

GET /procurement/search?material_id=<uuid>&qty=<int>

Returns ranked external vendor listings for a catalogued material.
When SERPAPI_KEY is not configured, falls back to real clickable search links
(Google Shopping, IndiaMart, Moglix, TradeIndia) so users always get something useful.
"""
import logging
import urllib.parse
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from config import settings
from dependencies import CurrentUser, get_supabase, require_roles
from services.serpapi_service import SerpApiError, _build_query, search_shopping
from services.validators import require_uuid

logger = logging.getLogger(__name__)

router = APIRouter()

_MATERIAL_COLUMNS = (
    "id,cnmc,standard_description,short_description,spec,unit_of_measure,category,status"
)


def _extract_domain(url: str) -> str:
    try:
        return urllib.parse.urlparse(url).netloc.replace("www.", "")
    except Exception:
        return url


def _build_fallback_links(material: dict) -> list[dict]:
    """Real, clickable supplier search links — used when SerpApi is not configured."""
    desc = (material.get("standard_description") or "").strip()
    spec = (material.get("spec") or "").strip()
    query = f"{desc} {spec}".strip() or desc

    q = urllib.parse.quote_plus(query)
    d = urllib.parse.quote_plus(desc)

    return [
        {
            "title": f"Google Shopping — {desc}",
            "source": "google.com/shopping",
            "link": f"https://www.google.com/search?q={q}&tbm=shop",
            "snippet": f"Live prices from multiple suppliers for '{desc}' on Google Shopping.",
            "price_inr": None,
            "thumbnail": None,
            "rating": None,
            "reviews": None,
            "in_stock": None,
        },
        {
            "title": f"IndiaMart — {desc}",
            "source": "indiamart.com",
            "link": f"https://dir.indiamart.com/search.mp?ss={d}",
            "snippet": f"Find Indian manufacturers and B2B suppliers for '{desc}' on IndiaMart.",
            "price_inr": None,
            "thumbnail": None,
            "rating": None,
            "reviews": None,
            "in_stock": None,
        },
        {
            "title": f"Moglix Industrial — {desc}",
            "source": "moglix.com",
            "link": f"https://www.moglix.com/search?q={d}",
            "snippet": f"Industrial supply marketplace — search for '{desc}' on Moglix.",
            "price_inr": None,
            "thumbnail": None,
            "rating": None,
            "reviews": None,
            "in_stock": None,
        },
        {
            "title": f"TradeIndia — {desc}",
            "source": "tradeindia.com",
            "link": f"https://www.tradeindia.com/search.html?search_text={d}",
            "snippet": f"B2B supplier directory — browse TradeIndia for '{desc}'.",
            "price_inr": None,
            "thumbnail": None,
            "rating": None,
            "reviews": None,
            "in_stock": None,
        },
    ]


@router.get("/search")
async def procurement_search(
    material_id: str = Query(..., description="UUID of the catalogued material"),
    qty: int = Query(1, ge=1, description="Quantity being procured (informational)"),
    supabase: Client = Depends(get_supabase),
    current_user: CurrentUser = Depends(require_roles("engineer", "accounts", "admin")),
):
    """Search external markets for a material using SerpApi's Google Shopping API.

    Returns up to 10 ranked listings. When SERPAPI_KEY is not configured the
    response still returns real clickable fallback links (Google Shopping,
    IndiaMart, Moglix, TradeIndia) with serpapi_configured=False.
    """
    material_id = require_uuid(material_id, "Material")

    resp = (
        supabase.table("materials")
        .select(_MATERIAL_COLUMNS)
        .eq("id", material_id)
        .maybe_single()
        .execute()
    )
    if not resp or not resp.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Material not found")

    material = resp.data
    serpapi_configured = bool(settings.SERPAPI_KEY)

    if not serpapi_configured:
        logger.info(
            "procurement_search: SERPAPI_KEY not set, returning fallback links for material %s",
            material_id,
        )
        fallback = _build_fallback_links(material)
        return _build_response(
            material,
            query_used=_build_query(material),
            results=fallback,
            configured=False,
            qty=qty,
        )

    try:
        results = await search_shopping(material)
    except SerpApiError as exc:
        logger.warning("SerpApi call failed for material %s: %s", material_id, exc)
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))

    query_used = _build_query(material)
    return _build_response(material, query_used=query_used, results=results, configured=True, qty=qty)


def _build_response(
    material: dict,
    *,
    query_used: str,
    results: list[dict],
    configured: bool,
    qty: int,
) -> dict:
    return {
        "material": {
            "id": material.get("id"),
            "cnmc": material.get("cnmc"),
            "standard_description": material.get("standard_description"),
            "spec": material.get("spec"),
            "unit_of_measure": material.get("unit_of_measure"),
        },
        "query_used": query_used,
        "results": results,
        "result_count": len(results),
        "serpapi_configured": configured,
        "qty_requested": qty,
    }
