"""Tests for POST /equivalence/check.

All external calls (You.com, Gemini) are mocked — no real network or quota used.
Five test cases per TEAM.md spec, plus two extras for edge cases.
"""
import os

import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from dependencies import get_current_user, get_supabase
from main import app
from tests.conftest import make_user, MATERIAL_A, MATERIAL_B

# A second distinct material UUID for tests that need two valid materials
MATERIAL_C = "cccccccc-cccc-cccc-cccc-cccccccccccc"

# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

MATERIAL_A_ROW = {
    "id": MATERIAL_A,
    "cnmc": "MECH-FSTNR-BOLT-M8X25-SS304-A",
    "standard_description": "Hexagonal Head Bolt M8x25mm SS304",
    "short_description": "Hex Bolt M8",
    "spec": "M8X25-SS304",
    "quality_grade": "A",
    "unit_of_measure": "EA",
    "category": "MECH",
    "subcategory": "FSTNR",
    "material_type": "BOLT",
    "technical_specs": {"thread_size": "M8", "length_mm": 25, "material": "SS304"},
    "status": "approved",
}

MATERIAL_C_ROW = {
    "id": MATERIAL_C,
    "cnmc": "MECH-FSTNR-BOLT-M8X30-SS316-A",
    "standard_description": "Hexagonal Head Bolt M8x30mm SS316",
    "short_description": "Hex Bolt M8 SS316",
    "spec": "M8X30-SS316",
    "quality_grade": "A",
    "unit_of_measure": "EA",
    "category": "MECH",
    "subcategory": "FSTNR",
    "material_type": "BOLT",
    "technical_specs": {"thread_size": "M8", "length_mm": 30, "material": "SS316"},
    "status": "approved",
}

# A realistic Gemini response for a successful comparison
GEMINI_RESPONSE = """{
  "parameters": [
    {
      "name": "Thread Size",
      "value_a": "M8",
      "value_b": "M8",
      "match": "match",
      "safety_critical": true,
      "notes": ""
    },
    {
      "name": "Length",
      "value_a": "25 mm",
      "value_b": "30 mm",
      "match": "mismatch",
      "safety_critical": true,
      "notes": "Length differs by 5mm — not interchangeable without engineering review"
    },
    {
      "name": "Material Grade",
      "value_a": "SS304",
      "value_b": "SS316",
      "match": "mismatch",
      "safety_critical": true,
      "notes": "SS316 has higher corrosion resistance — may be acceptable upgrade, needs engineer sign-off"
    }
  ],
  "verdict": "not_equivalent",
  "verdict_reason": "Length and material grade differ on safety-critical parameters.",
  "confidence": 0.92
}"""

GEMINI_EQUIVALENT_RESPONSE = """{
  "parameters": [
    {
      "name": "Thread Size",
      "value_a": "M8",
      "value_b": "M8",
      "match": "match",
      "safety_critical": true,
      "notes": ""
    },
    {
      "name": "Length",
      "value_a": "25 mm",
      "value_b": "25 mm",
      "match": "match",
      "safety_critical": true,
      "notes": ""
    }
  ],
  "verdict": "equivalent",
  "verdict_reason": "All safety-critical parameters match.",
  "confidence": 0.97
}"""


@pytest.fixture
def eq_client(db):
    """TestClient as an engineer, with MATERIAL_C seeded in the fake DB."""
    db.seed(
        "materials",
        id=MATERIAL_C,
        cnmc="MECH-FSTNR-BOLT-M8X30-SS316-A",
        status="approved",
        standard_description="Hexagonal Head Bolt M8x30mm SS316",
        spec="M8X30-SS316",
        technical_specs={"thread_size": "M8", "length_mm": 30, "material": "SS316"},
        created_at="2020-01-01T00:00:00+00:00",
    )
    app.dependency_overrides[get_supabase] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: make_user("engineer")
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Test 1 — Happy path: full comparison returns structured report
# ---------------------------------------------------------------------------

def test_equivalence_happy_path(eq_client):
    """Full flow: You.com returns docs, Gemini returns a valid comparison."""
    you_docs = [{"url": "http://example.com/bolt", "title": "Bolt Spec", "snippet": "M8 bolt specs here"}]

    with patch("services.equivalence_service.search_docs", new=AsyncMock(return_value=you_docs)), \
         patch("services.equivalence_service.generate_text", new=AsyncMock(return_value=GEMINI_RESPONSE)):

        resp = eq_client.post("/equivalence/check", json={
            "material_a_id": MATERIAL_A,
            "material_b_id": MATERIAL_C,
        })

    assert resp.status_code == 200
    data = resp.json()

    # Structure
    assert "material_a" in data
    assert "material_b" in data
    assert "parameters" in data
    assert "verdict" in data
    assert "confidence" in data
    assert "evidence" in data
    assert "youcom_configured" in data
    assert "ai_configured" in data

    # Values
    assert data["verdict"] == "not_equivalent"
    assert len(data["parameters"]) == 3
    assert data["confidence"] == pytest.approx(0.92)
    assert data["verdict_reason"] != ""

    # Parameter shape
    p = data["parameters"][0]
    assert p["name"] == "Thread Size"
    assert p["match"] == "match"
    assert p["safety_critical"] is True

    # Material summaries present
    assert data["material_a"]["cnmc"] == "MECH-FSTNR-BOLT-M8X25-SS304-A"
    assert data["material_b"]["cnmc"] == "MECH-FSTNR-BOLT-M8X30-SS316-A"


# ---------------------------------------------------------------------------
# Test 2 — Material A not found → 404
# ---------------------------------------------------------------------------

def test_equivalence_material_a_not_found(eq_client):
    missing_id = "ffffffff-ffff-ffff-ffff-ffffffffffff"
    resp = eq_client.post("/equivalence/check", json={
        "material_a_id": missing_id,
        "material_b_id": MATERIAL_C,
    })
    assert resp.status_code == 404
    assert "Material A" in resp.json()["detail"]


# ---------------------------------------------------------------------------
# Test 3 — Same ID for both materials → 422
# ---------------------------------------------------------------------------

def test_equivalence_same_material(eq_client):
    resp = eq_client.post("/equivalence/check", json={
        "material_a_id": MATERIAL_A,
        "material_b_id": MATERIAL_A,
    })
    assert resp.status_code == 422
    assert "different" in resp.json()["detail"].lower()


# ---------------------------------------------------------------------------
# Test 4 — YOUCOM_API_KEY not set → degrades gracefully, still returns report
# ---------------------------------------------------------------------------

def test_equivalence_youcom_key_absent(eq_client):
    """When You.com key is missing, the check runs with internal specs only."""
    import config as cfg

    original = cfg.settings.YOUCOM_API_KEY
    # Pydantic models are immutable by default; use object.__setattr__ to patch
    object.__setattr__(cfg.settings, "YOUCOM_API_KEY", "")
    try:
        with patch("services.equivalence_service.generate_text", new=AsyncMock(return_value=GEMINI_EQUIVALENT_RESPONSE)):
            resp = eq_client.post("/equivalence/check", json={
                "material_a_id": MATERIAL_A,
                "material_b_id": MATERIAL_C,
            })
    finally:
        object.__setattr__(cfg.settings, "YOUCOM_API_KEY", original)

    assert resp.status_code == 200
    data = resp.json()
    assert data["youcom_configured"] is False
    # Gemini still ran — verdict is populated
    assert data["verdict"] in {"equivalent", "not_equivalent", "engineering_review_required"}


# ---------------------------------------------------------------------------
# Test 5 — Gemini unavailable → safe degraded response, never crashes
# ---------------------------------------------------------------------------

def test_equivalence_gemini_unavailable(eq_client):
    """When Gemini fails, verdict must be engineering_review_required, params empty."""
    from services.ai_common import AIServiceError

    with patch("services.equivalence_service.search_docs", new=AsyncMock(return_value=[])), \
         patch("services.equivalence_service.generate_text", new=AsyncMock(side_effect=AIServiceError("quota"))):

        resp = eq_client.post("/equivalence/check", json={
            "material_a_id": MATERIAL_A,
            "material_b_id": MATERIAL_C,
        })

    assert resp.status_code == 200
    data = resp.json()
    assert data["verdict"] == "engineering_review_required"
    assert data["parameters"] == []
    assert data["confidence"] == 0.0
    assert data["ai_configured"] is True  # key is set; it was the call that failed


# ---------------------------------------------------------------------------
# Test 6 — Gemini returns a bad/unknown verdict → coerced to safe default
# ---------------------------------------------------------------------------

def test_equivalence_bad_verdict_coerced(eq_client):
    bad_gemini = """{
      "parameters": [],
      "verdict": "probably_fine",
      "verdict_reason": "Looks okay to me.",
      "confidence": 0.8
    }"""

    with patch("services.equivalence_service.search_docs", new=AsyncMock(return_value=[])), \
         patch("services.equivalence_service.generate_text", new=AsyncMock(return_value=bad_gemini)):

        resp = eq_client.post("/equivalence/check", json={
            "material_a_id": MATERIAL_A,
            "material_b_id": MATERIAL_C,
        })

    assert resp.status_code == 200
    assert resp.json()["verdict"] == "engineering_review_required"


# ---------------------------------------------------------------------------
# Test 7 — Unauthenticated request → 403
# ---------------------------------------------------------------------------

def test_equivalence_wrong_role(db):
    """entry_operator role should be rejected."""
    app.dependency_overrides[get_supabase] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: make_user("entry_operator")
    with TestClient(app, raise_server_exceptions=False) as c:
        resp = c.post("/equivalence/check", json={
            "material_a_id": MATERIAL_A,
            "material_b_id": MATERIAL_C,
        })
    app.dependency_overrides.clear()
    assert resp.status_code == 403
