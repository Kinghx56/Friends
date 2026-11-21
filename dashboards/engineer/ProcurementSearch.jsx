import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingCart, Search, X, ExternalLink, Star,
  AlertTriangle, Loader2, Package, Info
} from 'lucide-react';
import api from '../../frontend/src/lib/api';

// ── Material search-as-you-type ──────────────────────────────────────────────
function MaterialSelector({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value?.standard_description || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const timer = useRef(null);
  const wrapRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setSearching(true);
    try {
      const { data } = await api.get('/materials', {
        params: { search: q, status_filter: 'approved', limit: 8 },
      });
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
    <div ref={wrapRef} className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
        />
        {searching && <Loader2 className="absolute right-3 w-4 h-4 text-stone-400 animate-spin" />}
        {!searching && query && (
          <button onClick={clear} className="absolute right-3 text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-orange-100 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {results.map((m) => (
            <button
              key={m.id}
              onClick={() => select(m)}
              className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors border-b border-orange-100 last:border-0"
            >
              <p className="text-sm font-medium text-stone-800 truncate">{m.standard_description}</p>
              <p className="text-xs text-stone-400 font-mono">{m.cnmc || '—'} · {m.category}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Star rating display ───────────────────────────────────────────────────────
function Stars({ rating }) {
  if (!rating) return null;
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < full ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`}
        />
      ))}
      <span className="text-xs text-stone-500 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────────
function ResultCard({ result }) {
  return (
    <div className="bg-white border border-orange-100 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
      {/* Thumbnail + source */}
      <div className="flex items-start gap-3">
        {result.thumbnail ? (
          <img
            src={result.thumbnail}
            alt={result.title}
            className="w-14 h-14 object-contain rounded-lg border border-orange-100 bg-orange-50/40 shrink-0"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-14 h-14 rounded-lg border border-orange-100 bg-orange-50/40 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-stone-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2">{result.title}</p>
          <p className="text-xs text-orange-600 font-medium mt-0.5 truncate">{result.source}</p>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-stone-900">
            {result.price_inr != null
              ? `₹${result.price_inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'Contact for price'}
          </p>
          {result.price_inr && <p className="text-xs text-stone-400">per unit (INR)</p>}
        </div>
        {result.in_stock != null && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            result.in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
          }`}>
            {result.in_stock ? 'In Stock' : 'Contact Supplier'}
          </span>
        )}
      </div>

      {/* Rating */}
      {result.rating && (
        <div className="flex items-center gap-2">
          <Stars rating={result.rating} />
          {result.reviews && (
            <span className="text-xs text-stone-400">({result.reviews.toLocaleString()} reviews)</span>
          )}
        </div>
      )}

      {/* CTA */}
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
      >
        View Listing <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProcurementSearch() {
  const [searchParams] = useSearchParams();
  const [material, setMaterial] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // null = not searched yet
  const [error, setError] = useState('');
  const [serpConfigured, setSerpConfigured] = useState(true);

  // Pre-fill material from URL param (?material_id=...)
  useEffect(() => {
    const id = searchParams.get('material_id');
    if (!id) return;
    api.get(`/materials/${id}`)
      .then(({ data }) => setMaterial(data))
      .catch(() => {});
  }, [searchParams]);

  const handleSearch = async () => {
    if (!material) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const { data } = await api.get('/procurement/search', {
        params: { material_id: material.id, qty },
      });
      setResults(data);
      setSerpConfigured(data.serpapi_configured);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-700 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Procurement Intelligence</h2>
            <p className="text-xs text-orange-100 font-mono">Powered by SerpApi · Google Shopping</p>
          </div>
        </div>
        <p className="text-orange-100 text-sm">
          Search live external markets for a catalogued material. Compare vendor prices,
          availability, and ratings without leaving Saarthi.
        </p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-visible">
          <div className="md:col-span-2 space-y-1 overflow-visible">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Material
            </label>
            <MaterialSelector
              value={material}
              onChange={setMaterial}
              placeholder="Search by description or CNMC..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Quantity Required
            </label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full py-2.5 px-3 text-sm border border-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Selected material chip */}
        {material && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <Package className="w-4 h-4 text-orange-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{material.standard_description}</p>
              <p className="text-xs text-orange-600 font-mono">{material.cnmc || '—'} · {material.unit_of_measure}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={!material || loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          {loading ? 'Searching external markets...' : 'Search Suppliers'}
        </button>
      </div>

      {/* Not configured banner */}
      {results && !serpConfigured && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">External procurement search is not configured</p>
            <p className="text-xs text-amber-700 mt-0.5">Contact your system administrator to enable SerpApi integration.</p>
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

      {/* Results */}
      {results && serpConfigured && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-stone-600">
              <span className="font-bold text-stone-800">{results.result_count}</span> listing{results.result_count !== 1 ? 's' : ''} found
              {results.query_used && (
                <span className="text-stone-400"> for "{results.query_used}"</span>
              )}
            </p>
            {results.qty_requested > 1 && (
              <span className="text-xs text-stone-400">Quantity needed: {results.qty_requested.toLocaleString()}</span>
            )}
          </div>

          {results.results.length === 0 ? (
            <div className="bg-white rounded-xl border border-orange-100 p-12 text-center">
              <Package className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <p className="font-semibold text-stone-600">No external listings found for this material</p>
              <p className="text-sm text-stone-400 mt-1">Try a different material or broaden the description</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.results.map((r, i) => (
                <ResultCard key={i} result={r} />
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-stone-400 text-center px-4">
            Listings sourced from Google Shopping via SerpApi. Prices and availability are indicative only.
            Verify with the supplier before raising a purchase order.
          </p>
        </div>
      )}

      {/* Initial empty state */}
      {results === null && !loading && (
        <div className="bg-white rounded-xl border border-dashed border-orange-100 p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-stone-200 mx-auto mb-4" />
          <p className="font-semibold text-stone-500">Select a material and click Search Suppliers</p>
          <p className="text-sm text-stone-400 mt-1">Live Google Shopping results will appear here</p>
        </div>
      )}
    </div>
  );
}
