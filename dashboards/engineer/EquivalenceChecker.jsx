import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GitMerge, Search, X, Loader2, AlertTriangle,
  CheckCircle2, XCircle, Info, ExternalLink, ShieldAlert,
  Sparkles, ChevronRight, RefreshCw, ArrowRight
} from 'lucide-react';
import api from '../../frontend/src/lib/api';

// ── Material search-as-you-type ───────────────────────────────────────────────
function MaterialSelector({ value, onChange, label, placeholder }) {
  const [query, setQuery] = useState(value?.standard_description || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const timer = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (value?.standard_description) setQuery(value.standard_description);
    else if (!value) setQuery('');
  }, [value]);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setSearching(true);
    try {
      const { data } = await api.get('/materials', { params: { search: q, limit: 8 } });
      setResults(data || []);
      setOpen(true);
    } catch (_) {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (!q) { onChange(null); setResults([]); setOpen(false); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(q), 350);
  };

  const select = (m) => {
    setQuery(m.standard_description);
    setOpen(false);
    onChange(m);
  };

  const clear = () => {
    setQuery('');
    onChange(null);
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{label}</label>
      <div ref={wrapRef} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-stone-800 placeholder-stone-400"
          />
          {searching && <Loader2 className="absolute right-3 w-4 h-4 text-stone-400 animate-spin" />}
          {!searching && query && (
            <button onClick={clear} className="absolute right-3 text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {open && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {results.map((m) => (
              <button
                key={m.id}
                onClick={() => select(m)}
                className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors border-b border-stone-100 last:border-0"
              >
                <p className="text-sm font-medium text-stone-800 truncate">{m.standard_description}</p>
                <p className="text-xs text-stone-400 font-mono">{m.cnmc || '—'} · {m.category}</p>
              </button>
            ))}
          </div>
        )}
      </div>
      {value && (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
          <span className="text-xs font-mono text-orange-600 shrink-0">{value.cnmc || value.id?.slice(0, 8)}</span>
          <span className="text-xs text-stone-700 truncate flex-1">{value.standard_description}</span>
        </div>
      )}
    </div>
  );
}

// ── AI Suggestion Card ────────────────────────────────────────────────────────
function SuggestionCard({ suggestion, onSelect, selected }) {
  const pct = Math.round(suggestion.compatibility_score * 100);
  const scoreColor =
    pct >= 80 ? 'text-emerald-700 bg-emerald-100' :
    pct >= 60 ? 'text-amber-700 bg-amber-100' :
    'text-stone-600 bg-stone-100';

  return (
    <button
      onClick={() => onSelect(suggestion)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
        selected
          ? 'border-orange-400 bg-orange-50'
          : 'border-stone-200 bg-white hover:border-orange-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-semibold text-stone-800 leading-snug flex-1">{suggestion.standard_description}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${scoreColor}`}>
          {pct}%
        </span>
      </div>
      {suggestion.cnmc && (
        <p className="text-xs font-mono text-stone-400 mb-1.5">{suggestion.cnmc}</p>
      )}
      <p className="text-xs text-stone-500 leading-relaxed">{suggestion.reason}</p>
      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-orange-600">
        Select as substitute <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </button>
  );
}

// ── Verdict banner ────────────────────────────────────────────────────────────
function VerdictBanner({ verdict, reason, confidence }) {
  const cfg = {
    equivalent: {
      bg: 'bg-emerald-50 border-emerald-300',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />,
      label: '✓ Equivalent',
      text: 'text-emerald-800',
      badge: 'bg-emerald-100 text-emerald-700',
    },
    not_equivalent: {
      bg: 'bg-red-50 border-red-300',
      icon: <XCircle className="w-6 h-6 text-red-600 shrink-0" />,
      label: '✗ Not Equivalent',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-700',
    },
    engineering_review_required: {
      bg: 'bg-amber-50 border-amber-300',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />,
      label: '⚠ Engineering Review Required',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-700',
    },
  };
  const c = cfg[verdict] || cfg.engineering_review_required;

  return (
    <div className={`flex items-start gap-4 p-5 rounded-xl border-2 ${c.bg}`}>
      {c.icon}
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className={`text-lg font-bold ${c.text}`}>{c.label}</h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
            {(confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
        {reason && <p className={`text-sm mt-1 ${c.text} opacity-80`}>{reason}</p>}
      </div>
    </div>
  );
}

// ── Parameters table ──────────────────────────────────────────────────────────
function ParametersTable({ parameters }) {
  if (!parameters?.length) return null;

  const matchStyle = { match: 'bg-emerald-50', mismatch: 'bg-red-50', unverified: '' };
  const matchBadge = {
    match: 'bg-emerald-100 text-emerald-700',
    mismatch: 'bg-red-100 text-red-700',
    unverified: 'bg-stone-100 text-stone-500',
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-stone-100 bg-stone-50">
        <h4 className="text-sm font-semibold text-stone-700">Parameter Comparison</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Parameter</th>
              <th className="px-4 py-3">Material A</th>
              <th className="px-4 py-3">Material B</th>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {parameters.map((p, i) => (
              <tr key={i} className={matchStyle[p.match] || ''}>
                <td className={`px-4 py-3 ${p.safety_critical ? 'font-bold text-stone-800' : 'text-stone-700'}`}>
                  {p.name}
                  {p.safety_critical && (
                    <span className="ml-1.5 text-xs text-red-500 font-normal">⚠ critical</span>
                  )}
                </td>
                <td className="px-4 py-3 text-stone-700">{p.value_a}</td>
                <td className="px-4 py-3 text-stone-700">{p.value_b}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${matchBadge[p.match] || matchBadge.unverified}`}>
                    {p.match}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-stone-500">{p.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Evidence list ─────────────────────────────────────────────────────────────
function EvidenceList({ evidence }) {
  if (!evidence?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
      <h4 className="text-sm font-semibold text-stone-700">Source Evidence</h4>
      <div className="space-y-3">
        {evidence.map((e, i) => (
          <div key={i} className="border border-stone-100 rounded-lg p-3">
            <a
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-800 mb-1"
            >
              {e.title} <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {e.snippet && <p className="text-xs text-stone-500 leading-relaxed">{e.snippet}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ['Select Material A', 'AI Suggests Substitutes', 'Compare'];
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                done ? 'bg-orange-500 text-white' :
                active ? 'bg-orange-100 text-orange-700 border-2 border-orange-500' :
                'bg-stone-100 text-stone-400'
              }`}>
                {done ? '✓' : idx}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${
                active ? 'text-orange-700' : done ? 'text-stone-500' : 'text-stone-400'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${step > idx ? 'bg-orange-400' : 'bg-stone-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EquivalenceChecker() {
  const [searchParams] = useSearchParams();

  // Step 1: select Material A
  const [materialA, setMaterialA] = useState(null);

  // Step 2: AI suggests substitutes
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState(null); // null = not fetched yet
  const [suggestError, setSuggestError] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  // Step 2b: manual search override
  const [manualMode, setManualMode] = useState(false);
  const [materialB, setMaterialB] = useState(null);

  // Step 3: comparison
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  // Determine current step
  const step = !materialA ? 1 : !report ? 2 : 3;

  // Pre-fill Material A from URL param (?material_a_id=...)
  useEffect(() => {
    const id = searchParams.get('material_a_id');
    if (!id) return;
    api.get(`/materials/${id}`)
      .then(({ data }) => setMaterialA(data))
      .catch(() => {});
  }, [searchParams]);

  // When Material A changes, fetch AI suggestions
  useEffect(() => {
    if (!materialA) {
      setSuggestions(null);
      setSuggestError('');
      setSelectedSuggestion(null);
      setMaterialB(null);
      setReport(null);
      setManualMode(false);
      return;
    }
    fetchSuggestions(materialA);
  }, [materialA]);

  const fetchSuggestions = async (mat) => {
    setSuggesting(true);
    setSuggestions(null);
    setSuggestError('');
    setSelectedSuggestion(null);
    setMaterialB(null);
    setReport(null);
    setManualMode(false);
    try {
      const { data } = await api.get('/equivalence/suggest-substitutes', {
        params: { material_a_id: mat.id },
      });
      setSuggestions(data);
    } catch (err) {
      setSuggestError(err?.response?.data?.detail || 'Could not fetch suggestions.');
    } finally {
      setSuggesting(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    setSelectedSuggestion(suggestion);
    setManualMode(false);
    // Fetch full material object for materialB
    try {
      const { data } = await api.get(`/materials/${suggestion.material_id}`);
      setMaterialB(data);
    } catch (_) {
      setMaterialB({
        id: suggestion.material_id,
        cnmc: suggestion.cnmc,
        standard_description: suggestion.standard_description,
      });
    }
  };

  const effectiveMaterialB = materialB;
  const canCheck = materialA && effectiveMaterialB && materialA.id !== effectiveMaterialB.id;

  const handleCheck = async () => {
    if (!canCheck) return;
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const { data } = await api.post('/equivalence/check', {
        material_a_id: materialA.id,
        material_b_id: effectiveMaterialB.id,
      });
      setReport(data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMaterialA(null);
    setSuggestions(null);
    setSuggestError('');
    setSelectedSuggestion(null);
    setMaterialB(null);
    setReport(null);
    setError('');
    setManualMode(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Engineering Equivalence</h2>
              <p className="text-xs text-orange-100 font-mono">Powered by You.com + Gemini AI</p>
            </div>
          </div>
          {(materialA || report) && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-medium text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Check
            </button>
          )}
        </div>
        <p className="text-orange-100 text-sm mt-3">
          Select a material — Saarthi will automatically find in-catalog substitutes using AI, then
          run a parameter-by-parameter engineering comparison.
        </p>
      </div>

      {/* Step indicator */}
      <div className="bg-white rounded-xl border border-stone-200 px-5 py-3">
        <StepIndicator step={step} />
      </div>

      {/* ── STEP 1: Select Material A ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <MaterialSelector
          value={materialA}
          onChange={setMaterialA}
          label="Step 1 — Select the material you need"
          placeholder="Search by description, CNMC, or spec..."
        />
      </div>

      {/* ── STEP 2: AI Suggestions ── */}
      {materialA && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-800">Step 2 — AI-Suggested Substitutes</h3>
                <p className="text-xs text-stone-400">Gemini analysed your catalog and ranked these candidates</p>
              </div>
            </div>
            {suggestions && (
              <button
                onClick={() => fetchSuggestions(materialA)}
                className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            )}
          </div>

          {/* Loading suggestions */}
          {suggesting && (
            <div className="flex items-center gap-3 py-6 justify-center text-stone-400">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
              <p className="text-sm">Analysing catalog for potential substitutes…</p>
            </div>
          )}

          {/* Suggest error */}
          {suggestError && !suggesting && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{suggestError}</p>
            </div>
          )}

          {/* Suggestions list */}
          {suggestions && !suggesting && (
            <>
              {suggestions.suggestions?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {suggestions.suggestions.map((s) => (
                    <SuggestionCard
                      key={s.material_id}
                      suggestion={s}
                      onSelect={handleSelectSuggestion}
                      selected={selectedSuggestion?.material_id === s.material_id}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-5 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  <Sparkles className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-stone-500">No strong substitutes found in catalog</p>
                  <p className="text-xs text-stone-400 mt-1">
                    {suggestions.search_note || 'Try searching manually below.'}
                  </p>
                </div>
              )}

              {/* Search note */}
              {suggestions.search_note && suggestions.suggestions?.length > 0 && (
                <p className="text-xs text-stone-400 italic">{suggestions.search_note}</p>
              )}
            </>
          )}

          {/* Manual search toggle */}
          <div className="border-t border-stone-100 pt-3">
            <button
              onClick={() => setManualMode((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-orange-600 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              {manualMode ? 'Hide manual search' : 'Search for a specific substitute manually'}
            </button>

            {manualMode && (
              <div className="mt-3">
                <MaterialSelector
                  value={manualMode && selectedSuggestion === null ? materialB : null}
                  onChange={(m) => { setMaterialB(m); setSelectedSuggestion(null); }}
                  label="Manual substitute selection"
                  placeholder="Search for the in-stock alternative..."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3: Compare button + result ── */}
      {materialA && effectiveMaterialB && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          {/* Selection summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Material A — Requested</p>
              <p className="text-sm font-semibold text-stone-800 truncate">{materialA.standard_description}</p>
              <p className="text-xs text-stone-400 font-mono mt-0.5">{materialA.cnmc || '—'}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Material B — Substitute</p>
              <p className="text-sm font-semibold text-stone-800 truncate">{effectiveMaterialB.standard_description}</p>
              <p className="text-xs text-stone-400 font-mono mt-0.5">{effectiveMaterialB.cnmc || '—'}</p>
            </div>
          </div>

          {/* Same material warning */}
          {materialA.id === effectiveMaterialB.id && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">Please select two different materials to compare.</p>
            </div>
          )}

          <button
            onClick={handleCheck}
            disabled={!canCheck || loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />}
            {loading ? 'Analysing specifications and retrieving documentation…' : 'Run Equivalence Check'}
          </button>
        </div>
      )}

      {/* Degraded service banners */}
      {report && (!report.youcom_configured || !report.ai_configured) && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            {!report.ai_configured && <p><strong>AI service not configured</strong> — comparison is based on internal specs only.</p>}
            {report.ai_configured && !report.youcom_configured && <p><strong>Documentation retrieval not configured</strong> — comparison uses internal specs only, without external manufacturer datasheets.</p>}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="space-y-5">
          <VerdictBanner
            verdict={report.verdict}
            reason={report.verdict_reason}
            confidence={report.confidence}
          />
          <ParametersTable parameters={report.parameters} />
          <EvidenceList evidence={report.evidence} />

          {/* Engineer disclaimer */}
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs text-stone-600 leading-relaxed">
              <strong className="text-stone-800">Engineering review required.</strong> This analysis is
              AI-assisted and must be reviewed and approved by a qualified engineer before any
              substitution decision is acted upon. Saarthi does not automatically approve substitutions.
            </p>
          </div>
        </div>
      )}

      {/* Initial empty state — no material selected */}
      {!materialA && !loading && !error && (
        <div className="bg-white rounded-xl border border-dashed border-stone-200 p-12 text-center">
          <GitMerge className="w-12 h-12 text-stone-200 mx-auto mb-4" />
          <p className="font-semibold text-stone-500">Select a material above to get started</p>
          <p className="text-sm text-stone-400 mt-1">
            Saarthi will automatically suggest compatible substitutes from your catalog
          </p>
        </div>
      )}
    </div>
  );
}
