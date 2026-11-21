"""Tests for GET /procurement/search (Track A — SerpApi integration).

Four required cases:
  1. Happy path — mock httpx returning 2 shopping results → result_count=2, serpapi_configured=True.
  2. Material not found → 404.
  3. SERPAPI_KEY not set → 200, serpapi_configured=False, results=[].
  4. SerpApi returns HTTP 429 → 503 with quota message.
"""
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from dependencies import CurrentUser, get_current_user, get_supabase
from main import app
from tests.conftest import MATERIAL_A

MISSING_ID = "99999999-9999-9999-9999-999999999999"


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _engineer_user() -> CurrentUser:
    return CurrentUser(id="eng-1", email="eng@bharatoil.in", role="engineer", raw_token="tok")


def _make_client(db) -> TestClient:
    app.dependency_overrides[get_supabase] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: _engineer_user()
    return TestClient(app, raise_server_exceptions=False)


def _two_shopping_results() -> list[dict]:
    return [
        {
            "title": "Hex Bolt M8x25 SS304 A2-70 (Pack of 50)",
            "source": "IndiaMART",
            "price": "₹14.50",
            "link": "https://www.indiamart.com/prod1",
            "thumbnail": "https://cdn.indiamart.com/img1.jpg",
            "rating": "4.3",
            "reviews": "87",
            "availability": "In Stock",
        },
        {
            "title": "SS304 Hex Bolt M8 x 25mm",
            "source": "TradeIndia",
            "price": "₹12.00",
            "link": "https://www.tradeindia.com/prod2",
            "availability": "Contact supplier",
        },
    ]


def _mock_httpx_client(mock_response: MagicMock):
    """Return a context-manager mock for httpx.AsyncClient whose .get() returns mock_response."""
    mock_instance = AsyncMock()
    mock_instance.__aenter__ = AsyncMock(return_value=mock_instance)
    mock_instance.__aexit__ = AsyncMock(return_value=False)
    mock_instance.get = AsyncMock(return_value=mock_response)
    mock_client_cls = MagicMock(return_value=mock_instance)
    return mock_client_cls


# ---------------------------------------------------------------------------
# Test 1 — happy path
# ---------------------------------------------------------------------------

class TestProcurementHappyPath:
    def test_two_results_returned(self, db):
        # conftest already seeds MATERIAL_A — do NOT seed again or maybe_single raises
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"shopping_results": _two_shopping_results()}

        # Patch the name 'httpx' as it is bound inside serpapi_service, and patch 'settings'
        # as it is bound inside serpapi_service so SERPAPI_KEY reads as non-empty.
        with patch("services.serpapi_service.settings") as mock_settings, \
             patch("services.serpapi_service.httpx") as mock_httpx:
            mock_settings.SERPAPI_KEY = "test-key-abc"
            mock_httpx.AsyncClient.return_value.__aenter__ = AsyncMock(
                return_value=MagicMock(
                    get=AsyncMock(return_value=mock_resp)
                )
            )
            mock_httpx.AsyncClient.return_value.__aexit__ = AsyncMock(return_value=False)

            # Also patch router's settings so it doesn't see the real (empty) key
            with patch("routers.procurement.settings") as mock_router_settings:
                mock_router_settings.SERPAPI_KEY = "test-key-abc"
                client = _make_client(db)
                r = client.get(f"/procurement/search?material_id={MATERIAL_A}&qty=100")

        app.dependency_overrides.clear()

        assert r.status_code == 200, r.text
        body = r.json()
        assert body["result_count"] == 2
        assert body["serpapi_configured"] is True
        assert len(body["results"]) == 2
        assert body["qty_requested"] == 100

        first = body["results"][0]
        assert first["price_inr"] == 14.50
        assert first["currency"] == "INR"
        assert first["in_stock"] is True
        assert first["source"] == "IndiaMART"

        second = body["results"][1]
        assert second["in_stock"] is None

        assert body["material"]["id"] == MATERIAL_A
        assert "query_used" in body


# ---------------------------------------------------------------------------
# Test 2 — material not found
# ---------------------------------------------------------------------------

class TestProcurementMaterialNotFound:
    def test_missing_uuid_returns_404(self, db):
        client = _make_client(db)
        r = client.get(f"/procurement/search?material_id={MISSING_ID}")
        app.dependency_overrides.clear()
        assert r.status_code == 404

    def test_malformed_id_returns_404(self, db):
        client = _make_client(db)
        r = client.get("/procurement/search?material_id=not-a-uuid")
        app.dependency_overrides.clear()
        assert r.status_code == 404


# ---------------------------------------------------------------------------
# Test 3 — SERPAPI_KEY not configured
# ---------------------------------------------------------------------------

class TestProcurementKeyNotSet:
    def test_returns_200_configured_false_empty_results(self, db):
        # Patch settings in both the router and the service so neither sees a key
        with patch("routers.procurement.settings") as mock_router_settings, \
             patch("services.serpapi_service.settings") as mock_service_settings:
            mock_router_settings.SERPAPI_KEY = ""
            mock_service_settings.SERPAPI_KEY = ""

            client = _make_client(db)
            r = client.get(f"/procurement/search?material_id={MATERIAL_A}")

        app.dependency_overrides.clear()

        assert r.status_code == 200, r.text
        body = r.json()
        assert body["serpapi_configured"] is False
        assert body["results"] == []
        assert body["result_count"] == 0


# ---------------------------------------------------------------------------
# Test 4 — SerpApi returns HTTP 429 → expect 503
# ---------------------------------------------------------------------------

class TestProcurementSerpApiQuotaExceeded:
    def test_returns_503_on_429(self, db):
        mock_resp = MagicMock()
        mock_resp.status_code = 429

        with patch("services.serpapi_service.settings") as mock_settings, \
             patch("routers.procurement.settings") as mock_router_settings, \
             patch("services.serpapi_service.httpx") as mock_httpx:
            mock_settings.SERPAPI_KEY = "test-key-abc"
            mock_router_settings.SERPAPI_KEY = "test-key-abc"
            mock_httpx.AsyncClient.return_value.__aenter__ = AsyncMock(
                return_value=MagicMock(
                    get=AsyncMock(return_value=mock_resp)
                )
            )
            mock_httpx.AsyncClient.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_httpx.TimeoutException = Exception  # keep the except clause reachable
            mock_httpx.RequestError = type("RequestError", (Exception,), {})

            client = _make_client(db)
            r = client.get(f"/procurement/search?material_id={MATERIAL_A}&qty=50")

        app.dependency_overrides.clear()

        assert r.status_code == 503, r.text
        detail = r.json()["detail"]
        # Quota message must be present; API key must never leak
        assert any(w in detail.lower() for w in ("quota", "exceeded", "later"))
        assert "test-key-abc" not in detail
