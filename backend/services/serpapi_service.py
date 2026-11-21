"""SerpApi Google Shopping integration for external procurement price intelligence.

Uses httpx.AsyncClient (already in requirements) — no new dependencies.
If SERPAPI_KEY is not configured, returns an empty list immediately without making
any network call, so the router can still return a 200 with serpapi_configured=False.
"""
import logging
import re
from typing import Optional

import httpx

from config import settings

logger = logging.getLogger(__name__)

_SERPAPI_ENDPOINT = "https://serpapi.com/search.json"
_TIMEOUT_SECONDS = 15.0


class SerpApiError(Exception):
    """Raised when a SerpApi HTTP/network call fails.

    The message is safe to surface to the client — the API key is never included.
    """


def _build_query(material: dict) -> str:
    """Build a human-readable search query from material fields.

    Joins standard_description, spec, and unit_of_measure, skipping any that are
    absent or blank. At minimum, standard_description is always present for a
    catalogued material, so the query will never be empty.
    """
    parts = [
        (material.get("standard_description") or "").strip(),
        (material.get("spec") or "").strip(),
        (material.get("unit_of_measure") or "").strip(),
    ]
    return " ".join(p for p in parts if p)


def _parse_price(raw: str) -> Optional[float]:
    """Strip currency symbols and formatting from a price string; return None on failure."""
    if not raw:
        return None
    # Keep only digits, dots, and commas; drop everything else (₹, $, spaces, etc.)
    cleaned = re.sub(r"[^\d.,]", "", raw)
    # Remove grouping commas (e.g. "1,250.00" → "1250.00"), but only when they look like
    # thousand-separators (digit, comma, exactly 3 digits). A trailing comma is just removed.
    cleaned = re.sub(r",(?=\d{3}(?:[.,]|$))", "", cleaned)
    # Any remaining comma is treated as a decimal separator (European style).
    cleaned = cleaned.replace(",", ".")
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None


def _parse_result(item: dict) -> dict:
    """Map one shopping_results entry to our API contract shape."""
    raw_price = item.get("price", "")
    availability = item.get("availability", "")
    in_stock: Optional[bool] = True if "in stock" in availability.lower() else None

    rating: Optional[float] = None
    if "rating" in item:
        try:
            rating = float(item["rating"])
        except (ValueError, TypeError):
            pass

    reviews: Optional[int] = None
    if "reviews" in item:
        try:
            reviews = int(item["reviews"])
        except (ValueError, TypeError):
            pass

    return {
        "title": item.get("title", ""),
        "source": item.get("source", ""),
        "price_inr": _parse_price(raw_price),
        "currency": "INR",
        "link": item.get("link", "") or item.get("product_link", ""),
        "thumbnail": item.get("thumbnail") or None,
        "rating": rating,
        "reviews": reviews,
        "in_stock": in_stock,
        "snippet": (item.get("snippet") or item.get("description") or "")[:300],
    }


async def search_shopping(material: dict) -> list[dict]:
    """Query SerpApi's Google Shopping endpoint for a material and return parsed listings.

    Returns an empty list immediately (no HTTP call) when SERPAPI_KEY is not configured.
    Raises SerpApiError on any HTTP or network failure — the API key is never included
    in the error message.
    """
    if not settings.SERPAPI_KEY:
        return []

    query = _build_query(material)
    params = {
        "engine": "google_shopping",
        "q": query,
        "api_key": settings.SERPAPI_KEY,
        "gl": "in",
        "hl": "en",
        "num": "10",
    }

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
            response = await client.get(_SERPAPI_ENDPOINT, params=params)
    except httpx.TimeoutException:
        raise SerpApiError("External market search timed out. Please try again.")
    except httpx.RequestError as exc:
        logger.warning("SerpApi network error: %s", type(exc).__name__)
        raise SerpApiError("External market search is temporarily unavailable. Please try again.")

    if response.status_code == 401:
        logger.error("SerpApi returned 401 — API key may be invalid or expired")
        raise SerpApiError("External market search is not authorised. Contact your system administrator.")
    if response.status_code == 429:
        logger.warning("SerpApi quota exceeded (HTTP 429)")
        raise SerpApiError("External market search quota exceeded. Please try again later.")
    if response.status_code >= 400:
        logger.warning("SerpApi returned HTTP %s", response.status_code)
        raise SerpApiError(
            f"External market search returned an error (HTTP {response.status_code}). Please try again."
        )

    try:
        data = response.json()
    except Exception as exc:
        logger.warning("SerpApi response was not valid JSON: %s", exc)
        raise SerpApiError("External market search returned an unexpected response. Please try again.")

    shopping_results = data.get("shopping_results") or []
    return [_parse_result(item) for item in shopping_results]
