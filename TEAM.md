# Saarthi — Team Work Distribution

**Feature:** Material Intelligence (Phase 11)
**Branch:** `feature/material-intelligence`
**Three people, three independent tracks. Each person owns their track end-to-end and opens a PR when done.**

---

## Ground rules

- Pull `main` before starting. Create your own branch: `git checkout -b feature/material-intelligence-track-<A|B|C>`.
- Never commit into another person's track files without coordinating first.
- Keep commits small and descriptive. Local commits are fine; do not push directly to `main`.
- **Backend (Tracks A & B):** run `venv\Scripts\python -m pytest` before every commit. All tests must pass.
- **Frontend (Track C):** run `npm run build` inside `frontend/` before every commit. Zero errors.
- If you are blocked or need a decision, add a note under your track's **Blockers** section below and flag the team in the group chat.
- No database schema changes in this phase — no new tables, no migrations, no Supabase SQL.

---

## Track A — Backend: External Procurement Intelligence (SerpApi)

**Owner:** Person A
**Goal:** A working `GET /procurement/search` endpoint that accepts a `material_id`, queries SerpApi's Google Shopping API, and returns ranked external vendor listings.

### Files to create / modify

| File | Action |
|---|---|
| `backend/services/serpapi_service.py` | **Create** |
| `backend/routers/procurement.py` | **Create** |
| `backend/config.py` | **Modify** — add `SERPAPI_KEY: str = ""` |
| `backend/main.py` | **Modify** — register procurement router |
| `backend/.env.example` | **Modify** — document `SERPAPI_KEY` |
| `backend/requirements.txt` | **Modify** — confirm httpx is present (no new package needed) |
| `backend/tests/test_procurement.py` | **Create** |

### Steps in order

1. Add `SERPAPI_KEY: str = ""` to `Settings` in `config.py` (after `GEMINI_API_KEY`).
2. Document it in `.env.example`: `SERPAPI_KEY=   # https://serpapi.com — free tier 100 searches/month`.
3. Write `services/serpapi_service.py` (spec below).
4. Write `routers/procurement.py` (spec below).
5. Register the router in `main.py`: `from routers import ... procurement` and `app.include_router(procurement.router, prefix="/procurement", tags=["Procurement"])`.
6. Write `tests/test_procurement.py` (minimum 4 tests — see below).
7. Run `python -m pytest tests/test_procurement.py -v` — all pass.
8. Run the full suite `python -m pytest` — zero regressions.

### API contract

```
GET /procurement/search?material_id={uuid}&qty={int}
Authorization: Bearer <token>
Allowed roles: engineer, accounts, admin

200 OK:
{
  "material": {
    "id": "...",
    "cnmc": "...",
    "standard_description": "...",
    "spec": "...",
    "unit_of_measure": "..."
  },
  "query_used": "Stainless steel hex bolt M8 25mm A2-70",
  "results": [
    {
      "title": "...",
      "source": "...",
      "price_inr": 12.50,       // null if not parseable
      "currency": "INR",
      "link": "https://...",
      "thumbnail": "https://...", // null if absent
      "rating": 4.2,             // null if absent
      "reviews": 128,            // null if absent
      "in_stock": true           // null if unknown
    }
  ],
  "result_count": 5,
  "serpapi_configured": true,    // false when SERPAPI_KEY is empty
  "qty_requested": 500
}

404: material not found
503: SERPAPI_KEY set but SerpApi call failed
200 with results=[], serpapi_configured=false: key not set
```

### `serpapi_service.py` spec

- Use `httpx.AsyncClient` (already in requirements) with a 15-second timeout.
- Endpoint: `https://serpapi.com/search.json`
- Params: `engine=google_shopping`, `q=<query>`, `api_key=<SERPAPI_KEY>`, `gl=in`, `hl=en`, `num=10`.
- Build query string: `"{standard_description} {spec} {unit_of_measure}"` (skip empty parts).
- Parse `shopping_results` from the JSON response. Per item:
  - `title` ← `item["title"]`
  - `source` ← `item["source"]`
  - `price_inr` ← strip non-numeric from `item.get("price","")`, parse to float, return `None` on failure
  - `link` ← `item["link"]`
  - `thumbnail` ← `item.get("thumbnail")` or `None`
  - `rating` ← `float(item["rating"])` if present else `None`
  - `reviews` ← `int(item["reviews"])` if present else `None`
  - `in_stock` ← `True` if `"in stock"` in `item.get("availability","").lower()` else `None`
- If `SERPAPI_KEY` is empty string, return `[]` immediately — no HTTP call.
- On any HTTP/network failure, raise `SerpApiError(user_safe_message)`. Never expose the key.
- Use a custom exception class `SerpApiError(Exception)`.

### `procurement.py` spec

- `GET /procurement/search` — `Depends(require_roles("engineer","accounts","admin"))`.
- Validate `material_id` with `require_uuid`.
- Fetch from `materials` table (id, cnmc, standard_description, short_description, spec, unit_of_measure, category, status).
- If `SERPAPI_KEY` empty → return 200 with `results=[]`, `serpapi_configured=False`, skip HTTP call.
- Call `await search_shopping(material)`.
- On `SerpApiError` → raise `HTTPException(503, detail=str(exc))`.

### Test cases (`test_procurement.py`)

1. Happy path — mock `httpx.AsyncClient.get` returning 2 shopping results → assert `result_count=2`, `serpapi_configured=True`.
2. Material not found → assert 404.
3. `SERPAPI_KEY` not set → assert 200, `serpapi_configured=False`, `results=[]`.
4. SerpApi returns HTTP 429 → assert 503 with quota message.

### Blockers

_None yet._

---

## Track B — Backend: Engineering Equivalence Engine (You.com + Gemini)

**Owner:** Person B
**Goal:** A working `POST /equivalence/check` endpoint that accepts two material IDs, retrieves technical documentation via You.com, runs a Gemini-powered spec comparison, and returns an evidence-backed report. **Ephemeral — nothing is saved to the database.**

### Files to create / modify

| File | Action |
|---|---|
| `backend/services/youcom_service.py` | **Create** |
| `backend/services/equivalence_service.py` | **Create** |
| `backend/routers/equivalence.py` | **Create** |
| `backend/config.py` | **Modify** — add `YOUCOM_API_KEY: str = ""` |
| `backend/main.py` | **Modify** — register equivalence router |
| `backend/.env.example` | **Modify** — document `YOUCOM_API_KEY` |
| `backend/tests/test_equivalence.py` | **Create** |

### Steps in order

1. Add `YOUCOM_API_KEY: str = ""` to `Settings` in `config.py` (after `SERPAPI_KEY`).
2. Document it in `.env.example`: `YOUCOM_API_KEY=   # https://api.you.com — free research tier`.
3. Write `services/youcom_service.py` (spec below).
4. Write `services/equivalence_service.py` (spec below).
5. Write `routers/equivalence.py` (spec below).
6. Register the router in `main.py`: `from routers import ... equivalence` and `app.include_router(equivalence.router, prefix="/equivalence", tags=["Equivalence"])`.
7. Write `tests/test_equivalence.py` (minimum 5 tests — see below).
8. Run `python -m pytest tests/test_equivalence.py -v` — all pass.
9. Run the full suite `python -m pytest` — zero regressions.

### API contract

```
POST /equivalence/check
Authorization: Bearer <token>
Allowed roles: engineer, accounts, admin
Body: { "material_a_id": "uuid", "material_b_id": "uuid" }

200 OK:
{
  "material_a": { "id":"...", "cnmc":"...", "standard_description":"...", "spec":"...", "technical_specs":{} },
  "material_b": { "id":"...", "cnmc":"...", "standard_description":"...", "spec":"...", "technical_specs":{} },
  "parameters": [
    {
      "name": "Dimensions",
      "value_a": "M8 × 25 mm",
      "value_b": "M8 × 25 mm",
      "match": "match",          // "match" | "mismatch" | "unverified"
      "safety_critical": true,
      "notes": ""
    }
  ],
  "verdict": "equivalent",       // "equivalent" | "not_equivalent" | "engineering_review_required"
  "verdict_reason": "All safety-critical parameters match.",
  "evidence": [
    { "url": "https://...", "title": "...", "snippet": "..." }
  ],
  "youcom_configured": true,
  "ai_configured": true,
  "confidence": 0.87
}

404: either material not found
422: same material_id used for both
```

### `youcom_service.py` spec

- Use `httpx.AsyncClient` with a 20-second timeout.
- Endpoint: `https://api.ydc-index.io/search`
- Headers: `X-API-Key: {YOUCOM_API_KEY}`
- Params: `query="{standard_description} {spec} technical specifications datasheet"`, `num_web_results=5`.
- Parse `hits` list from response. Per hit: `title`, `url`, `snippets` (list of strings — join with space, cap at 500 chars).
- Return list of `{"url":..., "title":..., "snippet":...}`.
- If `YOUCOM_API_KEY` empty → return `[]` immediately.
- On failure → raise `YouComError(user_safe_message)`.

### `equivalence_service.py` spec

Orchestrates in three stages — **never raises, always returns a structured dict**:

1. **Retrieve docs** (best-effort): call `search_docs(material_a)` and `search_docs(material_b)` in parallel with `asyncio.gather`. On `YouComError` or any exception, log a warning and continue with empty docs.
2. **Gemini comparison**: build a prompt (see below), call `generate_text(settings.GEMINI_MODEL_MATCHING, prompt)`, parse JSON with `extract_json`. On any `AIServiceError` or `ValueError`, return degraded response.
3. **Validate and return**: coerce all parameter fields to safe lengths and known enum values; validate verdict against `{"equivalent","not_equivalent","engineering_review_required"}`; clamp confidence to `[0.0, 1.0]`.

**Degraded response** (returned on any service failure):
```python
{
  "material_a": <summary>,
  "material_b": <summary>,
  "parameters": [],
  "verdict": "engineering_review_required",
  "verdict_reason": "<reason why analysis is incomplete>",
  "evidence": <whatever was retrieved>,
  "youcom_configured": <bool>,
  "ai_configured": <bool>,
  "confidence": 0.0
}
```

**Gemini prompt** (use this structure exactly):
```
You are an expert materials engineer at an Indian oil & gas company.
Compare these two materials and determine if they are technically interchangeable.

MATERIAL A: {material_a['standard_description']}
Specs: {material_a.get('spec') or 'not specified'}
Technical specs: {json.dumps(material_a.get('technical_specs') or {})}
CNMC: {material_a.get('cnmc') or 'not assigned'}

MATERIAL B: {material_b['standard_description']}
Specs: {material_b.get('spec') or 'not specified'}
Technical specs: {json.dumps(material_b.get('technical_specs') or {})}
CNMC: {material_b.get('cnmc') or 'not assigned'}

EXTERNAL EVIDENCE (from manufacturer documentation):
{evidence_text}

Return ONLY a raw JSON object with no markdown fences:
{
  "parameters": [
    {
      "name": "<parameter name>",
      "value_a": "<value from A or 'not specified'>",
      "value_b": "<value from B or 'not specified'>",
      "match": "<match|mismatch|unverified>",
      "safety_critical": <true|false>,
      "notes": "<note or empty string>"
    }
  ],
  "verdict": "<equivalent|not_equivalent|engineering_review_required>",
  "verdict_reason": "<one sentence>",
  "confidence": <float 0.0–1.0>
}

Rules:
- "equivalent" only when ALL safety-critical parameters are confirmed matches.
- "not_equivalent" when ANY safety-critical parameter is a confirmed mismatch.
- "engineering_review_required" when safety-critical parameters are unverified or evidence is thin.
- Never approve substitution when dimensions, load ratings, pressure ratings, material grade,
  temperature rating, or sealing standard are unverified.
```

### `equivalence.py` spec

- `POST /equivalence/check` — `Depends(require_roles("engineer","accounts","admin"))`.
- Validate both IDs with `require_uuid`. Raise 422 if `id_a == id_b`.
- Fetch both materials (full row) from `materials` table; 404 if either missing.
- Call `await equivalence_service.check(material_a, material_b)` and return the result.

### Test cases (`test_equivalence.py`)

1. Happy path — mock You.com and Gemini returning valid structured response → assert `verdict`, `parameters` list, `confidence`.
2. Material A not found → assert 404.
3. Same ID for both → assert 422.
4. `YOUCOM_API_KEY` not set → assert 200, `youcom_configured=False`, `verdict="engineering_review_required"`.
5. Gemini unavailable — mock `generate_text` raising `AIServiceError` → assert 200, `verdict="engineering_review_required"`, `parameters=[]`.

### Blockers

_None yet._

---

## Track C — Frontend: Procurement Search + Equivalence Checker UI

**Owner:** Person C
**Goal:** Two new pages in the Engineer dashboard wired to the Track A and B endpoints, with sidebar nav entries and routes.

> ⚠️ Track C depends on Tracks A and B. You can build and style the pages using hardcoded mock responses first, but the final merged version must call the real API endpoints.

### Files to create / modify

| File | Action |
|---|---|
| `dashboards/engineer/ProcurementSearch.jsx` | **Create** |
| `dashboards/engineer/EquivalenceChecker.jsx` | **Create** |
| `dashboards/engineer/EngineerSidebar.jsx` | **Modify** — add 2 nav items |
| `dashboards/engineer/EngineerDashboard.jsx` | **Modify** — add 2 page titles |
| `frontend/src/App.jsx` | **Modify** — add 2 routes |

### Steps in order

1. Read `EngineerSidebar.jsx`, `EngineerDashboard.jsx`, and `App.jsx` fully before touching them.
2. Add sidebar entries, page titles, and routes (spec below).
3. Build `ProcurementSearch.jsx` (spec below).
4. Build `EquivalenceChecker.jsx` (spec below).
5. Run `npm run build` in `frontend/` — zero errors.

### Sidebar additions — `EngineerSidebar.jsx`

Add imports at top: `ShoppingCart, GitMerge` from `lucide-react`.

Add to the `navItems` array after the Inventory Map entry:
```js
{ to: '/engineer/procurement', label: 'Procurement Search', icon: ShoppingCart },
{ to: '/engineer/equivalence', label: 'Equivalence Check', icon: GitMerge },
```

### Page title additions — `EngineerDashboard.jsx`

Add to `getPageTitle`:
```js
case pathname.startsWith('/engineer/procurement'): return 'Procurement Search';
case pathname.startsWith('/engineer/equivalence'): return 'Equivalence Check';
```

### Route additions — `App.jsx`

Under the engineer `ProtectedRoute` block, inside `<Route path="/engineer" element={<EngineerDashboard />}>`:
```jsx
import ProcurementSearch from '../../dashboards/engineer/ProcurementSearch';
import EquivalenceChecker from '../../dashboards/engineer/EquivalenceChecker';
// ...
<Route path="procurement" element={<ProcurementSearch />} />
<Route path="equivalence" element={<EquivalenceChecker />} />
```

### `ProcurementSearch.jsx` spec

**Use the shared `api` client**: `import api from '../../frontend/src/lib/api'`

**Layout (top to bottom):**
1. **Material selector** — text input, on change call `GET /materials?search=<text>&limit=10&status_filter=approved`, show a dropdown of matching materials (CNMC + description). Selecting one sets the active material.
2. **Qty input** — number input, default 1, min 1.
3. **"Search Suppliers" button** — disabled until a material is selected.
4. **Loading state** — spinner + `"Searching external markets..."`.
5. **`serpapi_configured: false` banner** — yellow info box: `"External procurement search is not configured. Contact your system administrator."` Show instead of results.
6. **Results** — grid of cards (2–3 per row on desktop). Each card shows:
   - Vendor name (`source`) as card header.
   - Product title.
   - Price: `₹{price_inr.toFixed(2)}` if available, else `"Contact for price"`.
   - Star rating if available.
   - Green `"In Stock"` / grey `"Contact Supplier"` badge based on `in_stock`.
   - `"View Listing"` button — opens `link` in a new tab (`target="_blank" rel="noopener noreferrer"`).
7. **Empty state** — `"No external listings found for this material."`.
8. **Error state** — red banner with the error message from the API.

### `EquivalenceChecker.jsx` spec

**Use the shared `api` client**.

**Layout (top to bottom):**
1. **Two side-by-side material selectors** — same search-as-you-type pattern as above. Label A as `"Material A (Requested)"`, B as `"Material B (Available Substitute)"`.
2. **"Check Equivalence" button** — disabled until both materials are selected AND they are different.
3. **Loading state** — spinner + `"Analysing specifications and retrieving documentation..."`.
4. **Degraded-service banner** — if `youcom_configured: false` or `ai_configured: false`, show a yellow info box explaining limited analysis. Still show results.
5. **Verdict banner**:
   - `equivalent` → green background, `"✓ Equivalent"`.
   - `not_equivalent` → red background, `"✗ Not Equivalent"`.
   - `engineering_review_required` → amber background, `"⚠ Engineering Review Required"`.
6. **Confidence** — `"{(confidence * 100).toFixed(0)}% confidence"` shown below the verdict.
7. **Verdict reason** — one sentence below confidence.
8. **Parameters table** — columns: `Parameter | Material A | Material B | Match | Safety Critical | Notes`.
   - `match === "match"` → green row tint.
   - `match === "mismatch"` → red row tint.
   - `match === "unverified"` → no tint (grey text).
   - `safety_critical === true` → bold text in that row.
9. **Evidence section** — list of source links (`url`) with `title` and `snippet` preview. Each is a clickable link opening in a new tab.
10. **Disclaimer** (always shown below results): `"⚠ This analysis is AI-assisted and must be reviewed and approved by a qualified engineer before any substitution decision is made."`
11. **Initial state** (before first search) — `"Select two materials above to check if they can be used interchangeably."`.
12. **Error state** — red banner with API error message.

### Blockers

_None yet._

---

## Coordination notes

- Tracks A and B both touch `config.py`, `main.py`, and `.env.example`. **Decide upfront who edits which lines**, or one person makes all config changes and the other adds on top.
- Track C depends on Tracks A and B. Build with mock data first; replace with real API calls before the final PR.
- The shared `api` client is at `frontend/src/lib/api.js`. **Do not modify it**.
- Do not change any file outside your track's table without coordinating first.
- When your track is done: open a PR against `main`, tag the other two people for review.
