/**
 * Saarthi — sample data for the single-page site.
 *
 * Every value here is illustrative "sample" data (clearly labelled as such in
 * the UI). Nothing is fetched from a backend, SerpApi, You.com or Gemini.
 * Keep all demo content in this file so the components stay presentational.
 *
 * Narrative: the product is procurement + engineering equivalence intelligence
 * — source any material (SerpApi), prove any substitute (You.com + Gemini).
 */

export const BRAND = {
  wordmark: 'saarthi',
  hindi: 'सारथी',
  tagline: 'source any material. prove any substitute.',
  introCounterTo: 100,
};

/* ── Hero interactive demo ───────────────────────────────────── */
export const HERO_DEMO_STEPS = [
  { id: 'source', label: 'Source', detail: 'SerpApi searches live Google Shopping for verified external suppliers.' },
  { id: 'verify', label: 'Verify', detail: 'You.com retrieves datasheets; Gemini compares specs parameter by parameter.' },
];

/* ── Hero demo — procurement (SerpApi) + equivalence (You.com + Gemini) ── */
export const HERO_DEMO_PROCUREMENT = {
  query: 'Stainless steel hex bolt M8 × 25 mm A2-70',
  poweredBy: 'SerpApi · Google Shopping',
  summary: '5 listings · ₹12.50 – ₹18.00',
  results: [
    { source: 'IndustryBuying', title: 'Hex Bolt M8x25 SS304 A2-70', price: 12.5, rating: 4.3, inStock: true },
    { source: 'Moglix', title: 'Stainless Steel Hex Bolt M8 25mm A2-70', price: 14.0, rating: 4.5, inStock: true },
    { source: 'Amazon IN', title: 'M8x25 A2-70 Hex Bolt SS304 (Pack of 50)', price: 18.0, rating: 4.2, inStock: false },
  ],
};

export const HERO_DEMO_EQUIVALENCE = {
  poweredBy: 'You.com + Gemini',
  materialA: { tag: 'Requested', desc: 'Hex bolt M8 × 25 A2-70', cnmc: 'NMC-0410-22817' },
  materialB: { tag: 'In-stock', desc: 'Hex bolt M8 × 25 A4-80', cnmc: 'NMC-0410-22831' },
  parameters: [
    { name: 'Dimensions', a: 'M8 × 25 mm', b: 'M8 × 25 mm', match: 'match', critical: false },
    { name: 'Material grade', a: 'A2-70 (304)', b: 'A4-80 (316)', match: 'mismatch', critical: true },
    { name: 'Tensile strength', a: '700 MPa', b: '800 MPa', match: 'mismatch', critical: true },
  ],
  verdict: 'not_equivalent',
  verdictLabel: 'not equivalent',
  confidence: 91,
  reason: 'Material grade differs (A2-70 vs A4-80) — safety-critical. Do not substitute.',
  evidence: { title: 'ISO 3506 — Mechanical properties of stainless steel fasteners', url: 'https://www.iso.org/standard/63160.html' },
};

/* ── Marquee ─────────────────────────────────────────────────── */
export const MARQUEE_ITEMS = ['source it', 'prove the substitute', 'sourced · verified'];

/* ── Problem ──────────────────────────────────────────────────── */
export const PROBLEM = {
  headline: 'the same part hides in five catalogs. sourcing it is guesswork.',
  stat: { value: '1 in 3', label: 'field substitutions that fail review — sample' },
  pains: [
    {
      title: 'Fragmented suppliers',
      body: 'A part runs low and you open six tabs to find a vendor. There is no single place to see live external prices, stock and ratings for a catalogued material.',
    },
    {
      title: 'Unverified substitutes',
      body: 'Engineers approve swaps on description alone. "A2-70" vs "A4-80" looks close enough — until a safety-critical grade difference fails in the field.',
    },
    {
      title: 'Price blindness',
      body: 'Without live market prices, buyers accept the first quote. Fragmented, small-lot orders mean you never see what the part actually costs across the market.',
    },
  ],
};

/* ── 01 source (SerpApi) ──────────────────────────────────────── */
export const MATCH = {
  index: '01',
  title: 'source',
  blurb: 'When stock runs low, Saarthi searches live external markets for the exact catalogued material — prices, availability and ratings — via SerpApi. One query, every vendor.',
  bullets: [
    {
      title: 'Live Google Shopping results',
      body: 'Any catalogued material becomes a real search across external vendors in seconds — no manual browsing, no spreadsheets.',
    },
    {
      title: 'Price, stock and ratings',
      body: 'Each listing returns with a ₹ price, in-stock status and seller rating, so you compare options on the same axes.',
    },
    {
      title: 'Linked to your catalog',
      body: 'Searches start from your unified material code, so every result maps back to a known item — not a free-text guess.',
    },
  ],
  audit: {
    nationalCode: 'NMC-0410-22817',
    description: 'Stainless steel hex bolt M8 × 25 mm A2-70',
    rows: [
      { source: 'IndustryBuying', title: 'Hex Bolt M8x25 SS304 A2-70', price: '₹12.50', stock: 'In stock', rating: '4.3', diff: [] },
      { source: 'Moglix', title: 'Stainless Steel Hex Bolt M8 25mm A2-70', price: '₹14.00', stock: 'In stock', rating: '4.5', diff: ['price', 'rating'] },
      { source: 'Amazon IN', title: 'M8x25 A2-70 Hex Bolt SS304 (Pack of 50)', price: '₹18.00', stock: 'Backorder', rating: '4.2', diff: ['price', 'stock'] },
      { source: 'IndiaMART', title: 'SS304 Hex Head Bolt M8 x 25 A2-70', price: '₹13.20', stock: 'In stock', rating: '4.1', diff: ['price'] },
    ],
  },
};

/* ── 02 verify (You.com + Gemini) ─────────────────────────────── */
export const REVIEW = {
  index: '02',
  title: 'verify',
  blurb: 'Before you order or substitute, Saarthi retrieves manufacturer datasheets with You.com and compares every parameter with Gemini — dimensions, grade, load, seal. A verdict and confidence, always with an engineer sign-off.',
  queue: [
    { id: 'v1', codeA: 'NMC-0410-22817', descA: 'Hex bolt M8 × 25 A2-70', codeB: 'NMC-0410-22831', descB: 'Hex bolt M8 × 25 A4-80', score: 91.0, verdict: 'not_equivalent', reason: 'Material grade differs (A2-70 vs A4-80) — safety-critical mismatch.' },
    { id: 'v2', codeA: 'NMC-0403-22910', descA: 'LT PVC cable 4C 25 sq mm', codeB: 'NMC-0403-22955', descB: 'LT PVC cable 4C 25 sq mm FR', score: 78.0, verdict: 'review', reason: 'Flame-retardant variant unverified — confirm application before substituting.' },
    { id: 'v3', codeA: 'NMC-0412-77310', descA: 'Bearing 6205-2RS (25×52×15)', codeB: 'NMC-0412-77344', descB: 'Bearing 6205-2RS1 (25×52×15)', score: 99.0, verdict: 'equivalent', reason: 'Same dimensions, seal type and brand (SKF) — verified across datasheets.' },
    { id: 'v4', codeA: 'NMC-0412-88100', descA: 'Gate valve 8" 150# CI', codeB: 'NMC-0412-88140', descB: 'Gate valve 8" 300# CI', score: 64.0, verdict: 'not_equivalent', reason: 'Pressure rating differs (150# vs 300#) — not interchangeable.' },
  ],
};

/* ── 03 decide (engineer sign-off + audit) ────────────────────── */
export const GOVERN = {
  index: '03',
  title: 'decide',
  blurb: 'Every sourcing and substitution decision is logged: who requested it, who verified it, when, and why. A role-based chain keeps control, and nothing substitutes without an engineer sign-off.',
  chain: [
    { role: 'Maintenance', action: 'Flags a part as low / requests a substitute', tone: 'muted' },
    { role: 'Saarthi', action: 'Sources via SerpApi · verifies via You.com + Gemini', tone: 'muted' },
    { role: 'Engineer', action: 'Reviews the verdict and evidence', tone: 'muted' },
    { role: 'Engineer', action: 'Approves or rejects the substitution', tone: 'orange' },
  ],
  dryRun: { from: 47, to: 12, label: 'substitution requests → approved' },
  audit: [
    { actor: 'Amit Patel', role: 'Engineer', action: 'rejected substitution', entity: 'NMC-0410-22817 ↔ NMC-0410-22831', when: '2026-11-21 09:42', why: 'material grade mismatch (A2-70 vs A4-80)' },
    { actor: 'Sara Khan', role: 'Buyer', action: 'raised PO from SerpApi results', entity: 'NMC-0410-22817 · 500 EA', when: '2026-11-21 10:05', why: 'lowest verified in-stock vendor (₹12.50)' },
    { actor: 'Meera Nair', role: 'Engineer', action: 'approved substitution', entity: 'NMC-0412-77310 ↔ NMC-0412-77344', when: '2026-11-21 10:18', why: 'all safety-critical attributes verified' },
    { actor: 'Rohit Das', role: 'Engineer', action: 'flagged for review', entity: 'NMC-0403-22910 ↔ NMC-0403-22955', when: '2026-11-21 11:02', why: 'flame-retardant variant unverified' },
  ],
};

/* ── Analytics — price intelligence ───────────────────────────── */
export const ANALYTICS = {
  sectors: [
    { sector: 'Fasteners', duplicates: 4120, total: 11800 },
    { sector: 'Bearings', duplicates: 3680, total: 10200 },
    { sector: 'Valves', duplicates: 2940, total: 8600 },
    { sector: 'Cables', duplicates: 1810, total: 5400 },
    { sector: 'Fittings', duplicates: 1560, total: 4900 },
  ],
  cluster: {
    label: 'Bearing 6205-2RS — 4 external sources',
    nodes: [
      { id: 'mat', label: 'NMC-0412-77310', cpse: 'Material', x: 50, y: 50, hub: true },
      { id: 'v1', label: 'IndustryBuying ₹320', cpse: 'Vendor', x: 18, y: 22 },
      { id: 'v2', label: 'Moglix ₹345', cpse: 'Vendor', x: 82, y: 24 },
      { id: 'v3', label: 'Amazon ₹410', cpse: 'Vendor', x: 16, y: 78 },
      { id: 'v4', label: 'IndiaMART ₹335', cpse: 'Vendor', x: 84, y: 80 },
    ],
  },
  inventoryReduction: { value: '₹340 Cr', label: 'estimated procurement savings', sub: 'sample · live SerpApi pricing, over 3 years' },
  demand: [
    { material: 'Bearing 6205-2RS (NMC-0412-77310)', cpseDemand: '₹320 · ₹345 · ₹410 · ₹335', combinedQty: 4, saving: '22% vs median' },
    { material: 'Hex bolt M8×25 A2-70 (NMC-0410-22817)', cpseDemand: '₹12.50 · ₹14 · ₹18 · ₹13.20', combinedQty: 4, saving: '31% vs highest' },
    { material: 'LT PVC cable 4C 25sq (NMC-0403-22910)', cpseDemand: '₹184 · ₹201 · ₹176 · ₹195', combinedQty: 4, saving: '12% vs median' },
    { material: 'Gate valve 8" 150# CI (NMC-0412-88100)', cpseDemand: '₹4,200 · ₹4,650 · ₹4,050 · ₹4,380', combinedQty: 4, saving: '13% vs median' },
  ],
};

/* ── Connectors ──────────────────────────────────────────────── */
export const ERP = {
  connectors: [
    { name: 'SAP ECC', note: 'MM module export — your catalog', status: 'synced' },
    { name: 'SAP S/4HANA', note: 'CDS material view — your catalog', status: 'synced' },
    { name: 'SerpApi', note: 'Live Google Shopping — external vendors', status: 'synced' },
    { name: 'You.com', note: 'Manufacturer datasheets — equivalence', status: 'synced' },
  ],
};

/* ── How it works ─────────────────────────────────────────────── */
export const HOW_IT_WORKS = [
  { n: '01', title: 'connect', body: 'Point Saarthi at a read-only catalog export or upload a flat file. No write access to your ERP — reads only.' },
  { n: '02', title: 'source + verify', body: 'SerpApi searches live external markets for any catalogued material; You.com retrieves datasheets and Gemini compares specs parameter by parameter.' },
  { n: '03', title: 'decide', body: 'An engineer reviews the verdict and evidence, then approves or rejects. Every sourcing and substitution decision is logged with who, what, when, why.' },
];

/* ── Expected impact ─────────────────────────────────────────── */
export const IMPACT = [
  { title: 'Verified substitutes', body: 'Every substitution is checked against manufacturer datasheets before it is approved — no more grade mismatches in the field.' },
  { title: 'Fair market prices', body: 'Live SerpApi pricing means you see what a part actually costs across vendors, not just the first quote.' },
  { title: 'Fewer bad swaps', body: 'Safety-critical parameters — grade, load, pressure, seal — are flagged on every comparison, not left to a description match.' },
  { title: 'One source of truth', body: 'Searches start from your unified material code, so every vendor listing and every equivalence check maps to a known item.' },
  { title: 'Audit-ready', body: 'Every request, verdict and approval is logged with the engineer who decided and the evidence behind it.' },
  { title: 'Faster sourcing', body: 'A low-stock alert becomes a ranked vendor list in seconds, not an afternoon of phone calls.' },
  { title: 'Evidence-backed', body: 'Each verdict links to the datasheets and sources it was drawn from, so the reasoning is checkable, not a black box.' },
  { title: 'Engineer in control', body: 'Saarthi recommends; an engineer decides. No substitution ships without a human sign-off.' },
  { title: 'Lower spend', body: 'Comparing vendors and consolidating demand on one catalog cuts fragmented, small-lot overpaying.' },
];

/* ── FAQ ─────────────────────────────────────────────────────── */
export const FAQS = [
  { q: 'What does SerpApi do here?', a: 'SerpApi queries live Google Shopping for any catalogued material and returns external vendor listings — price, availability, rating and a link — so you can source without leaving Saarthi.' },
  { q: 'What do You.com + Gemini do?', a: 'You.com retrieves manufacturer datasheets and technical documentation for the two materials. Gemini then compares them parameter by parameter — dimensions, grade, load, seal — and returns a verdict with confidence and the evidence behind it.' },
  { q: 'Can Saarthi approve a substitution on its own?', a: 'No. Saarthi recommends; an engineer decides. A substitution never ships without a human sign-off. The AI surfaces the evidence; the engineer owns the call.' },
  { q: 'What counts as safety-critical?', a: 'Dimensions, material grade, load or pressure rating, temperature rating and sealing standard. If any of these is unverified, the verdict is "review required", never "equivalent".' },
  { q: 'Does Saarthi need write access to our ERP?', a: 'No. Catalog reads are read-only (SAP ECC, S/4HANA, Oracle EBS) or a flat-file upload. The external engines (SerpApi, You.com) are read-only market and document lookups.' },
  { q: 'Is the demo using live data?', a: 'This page runs on clearly-labelled sample data. Inside the portal, Procurement Search and Equivalence Check call the real SerpApi, You.com and Gemini services.' },
];

export const FINAL_CTA = {
  headline: 'source it. prove the substitute.',
  body: 'Search live external markets with SerpApi and prove engineering equivalence with You.com + Gemini — on one unified material catalog.',
  cta: 'see the demo',
};
