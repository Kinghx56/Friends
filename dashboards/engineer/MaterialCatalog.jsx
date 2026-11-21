import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ChevronRight, Package, Tag, Layers, X, ShoppingCart, GitMerge } from 'lucide-react';
import api from '../../frontend/src/lib/api';

const CATEGORY_TREE = {
  MECH: ['FSTNR', 'PIPE', 'VALVE', 'PUMP', 'BEARING', 'GEAR', 'SEAL'],
  ELEC: ['CABLE', 'MOTOR', 'CTRL', 'LIGHT', 'PANEL', 'RELAY'],
  CHEM: ['ACID', 'BASE', 'SOLV', 'LUBE', 'PAINT'],
  CONS: ['PPE', 'TOOL', 'CLEAN', 'PACK'],
  MISC: [],
};

const StatusBadge = ({ status }) => {
  const map = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    deprecated: 'bg-stone-100 text-stone-500',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || 'bg-stone-100 text-stone-500'}`}>
      {status}
    </span>
  );
};

export default function MaterialCatalog() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // Detail pane
  const [detailMaterial, setDetailMaterial] = useState(null);
  const [detailInventory, setDetailInventory] = useState([]);
  const [detailEquivalents, setDetailEquivalents] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
        search: search || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      };
      const [listRes, countRes] = await Promise.all([
        api.get('/materials', { params }),
        api.get('/materials/count', { params }),
      ]);
      setMaterials(listRes.data || []);
      setTotal(countRes.data.total || 0);
    } catch (err) {
      console.error('MaterialCatalog fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSubcategory, search, page]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchMaterials(), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const openDetail = async (material) => {
    setDetailMaterial(material);
    setDetailLoading(true);
    setDetailInventory([]);
    setDetailEquivalents([]);
    try {
      const [invRes, eqRes] = await Promise.all([
        api.get('/inventory', { params: { material_id: material.id, limit: 200 } }),
        api.get(`/materials/${material.id}/equivalents`),
      ]);
      setDetailInventory(invRes.data || []);
      setDetailEquivalents(eqRes.data || []);
    } catch (_) {} finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex gap-0 h-full min-w-0 overflow-hidden">
      {/* Category Tree */}
      <div className="w-52 shrink-0 bg-white border-r border-orange-100 flex flex-col overflow-y-auto">
        <div className="px-4 py-3 border-b border-orange-100">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Categories</h3>
        </div>
        <nav className="flex-1 py-2">
          <button
            onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setPage(0); }}
            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${!selectedCategory ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-orange-50/40'}`}
          >
            All Categories
          </button>
          {Object.entries(CATEGORY_TREE).map(([cat, subs]) => (
            <div key={cat}>
              <button
                onClick={() => {
                  setSelectedCategory(cat === selectedCategory ? null : cat);
                  setSelectedSubcategory(null);
                  setPage(0);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center justify-between transition-colors ${selectedCategory === cat ? 'bg-orange-50 text-orange-700' : 'text-stone-700 hover:bg-orange-50/40'}`}
              >
                <span>{cat}</span>
                {subs.length > 0 && <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedCategory === cat ? 'rotate-90' : ''}`} />}
              </button>
              {selectedCategory === cat && subs.length > 0 && subs.map(sub => (
                <button
                  key={sub}
                  onClick={() => { setSelectedSubcategory(sub === selectedSubcategory ? null : sub); setPage(0); }}
                  className={`w-full text-left pl-8 pr-4 py-1.5 text-xs transition-colors ${selectedSubcategory === sub ? 'text-orange-700 font-semibold' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Search bar */}
        <div className="bg-white border-b border-orange-100 px-5 py-3 flex items-center gap-3">
          <div className="search-input-wrap flex-1">
            <Search className="search-icon w-4 h-4" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by description or CNMC..."
              aria-label="Search materials by description or CNMC"
              className="w-full text-sm border border-orange-100 rounded-lg py-2 text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-xs text-stone-400 whitespace-nowrap shrink-0">{total.toLocaleString()} results</span>
        </div>

        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Table */}
          <div className={`flex-1 overflow-y-auto ${detailMaterial ? 'hidden md:block' : ''}`}>
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-12 bg-stone-100 rounded animate-pulse" />
                ))}
              </div>
            ) : materials.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                <BookOpen className="w-12 h-12 mb-4 text-stone-200" />
                <p className="font-medium">No materials found</p>
                <p className="text-sm mt-1">Try a different search or category</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-orange-50/40 text-stone-500 text-xs uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="px-5 py-3">CNMC</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">UoM</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {materials.map(m => (
                    <tr
                      key={m.id}
                      onClick={() => openDetail(m)}
                      className={`hover:bg-orange-50 cursor-pointer transition-colors ${detailMaterial?.id === m.id ? 'bg-orange-50' : ''}`}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-stone-600 whitespace-nowrap">{m.cnmc || '—'}</td>
                      <td className="px-5 py-3 font-medium text-stone-800 max-w-xs">
                        <p className="truncate">{m.standard_description}</p>
                        {m.short_description && <p className="text-xs text-stone-400 truncate">{m.short_description}</p>}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        <span className="text-stone-600">{m.category}</span>
                        {m.subcategory && <span className="text-stone-400"> › {m.subcategory}</span>}
                      </td>
                      <td className="px-5 py-3 text-stone-500 text-xs">{m.unit_of_measure || '—'}</td>
                      <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-orange-100 bg-white">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="text-sm text-stone-600 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                >
                  ← Previous
                </button>
                <span className="text-xs text-stone-400">Page {page + 1} of {totalPages}</span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="text-sm text-stone-600 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {detailMaterial && (
            <div className="w-full md:w-96 border-l border-orange-100 bg-white overflow-y-auto flex flex-col shrink-0">
              <div className="px-5 py-4 border-b border-orange-100 flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-orange-600 font-semibold">{detailMaterial.cnmc || '—'}</p>
                  <h3 className="font-bold text-stone-800 mt-0.5 leading-snug">{detailMaterial.standard_description}</h3>
                </div>
                <button onClick={() => setDetailMaterial(null)} className="text-stone-400 hover:text-stone-600 mt-0.5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
                {/* Specs */}
                <div className="px-5 py-4 space-y-3">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Material Specs
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {[
                      ['Category', detailMaterial.category],
                      ['Subcategory', detailMaterial.subcategory],
                      ['Type', detailMaterial.material_type],
                      ['Spec', detailMaterial.spec],
                      ['Quality', detailMaterial.quality_grade],
                      ['UoM', detailMaterial.unit_of_measure],
                      ['Status', null],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-xs text-stone-400">{label}</p>
                        {label === 'Status' ? (
                          <StatusBadge status={detailMaterial.status} />
                        ) : (
                          <p className="font-medium text-stone-700">{val || '—'}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inventory */}
                <div className="px-5 py-4 space-y-3">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Inventory by Location
                  </p>
                  {detailLoading ? (
                    <div className="h-16 bg-stone-100 rounded animate-pulse" />
                  ) : detailInventory.length === 0 ? (
                    <p className="text-xs text-stone-400">No inventory records</p>
                  ) : (
                    <div className="space-y-2">
                      {detailInventory.map((inv, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-orange-50/40 rounded-lg">
                          <span className="text-xs text-stone-600 font-mono">{inv.location_code}</span>
                          <span className={`text-sm font-bold ${inv.quantity <= 5 ? 'text-red-600' : inv.quantity <= 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {inv.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Equivalents */}
                {detailEquivalents.length > 0 && (
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Related / Equivalent Materials
                    </p>
                    <div className="space-y-2">
                      {detailEquivalents.map((eq, i) => (
                        <div key={i} className="p-2 bg-orange-50 rounded-lg">
                          <p className="text-xs font-mono text-orange-700">{eq.cnmc}</p>
                          <p className="text-xs text-stone-700 mt-0.5">{eq.standard_description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------- */}
                {/* Intelligence Actions — always visible at the bottom  */}
                {/* -------------------------------------------------- */}
                <div className="px-5 py-4 space-y-3 border-t border-orange-100 bg-orange-50/40">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Material Intelligence
                  </p>

                  {/* SerpApi — Procurement Search */}
                  <button
                    onClick={() => navigate(`/engineer/procurement?material_id=${detailMaterial.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm group"
                  >
                    <ShoppingCart className="w-4 h-4 shrink-0" />
                    <div className="text-left flex-1">
                      <div className="text-sm">Find External Suppliers</div>
                      <div className="text-xs text-orange-200 font-normal">Powered by SerpApi</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-orange-200 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* You.com + Gemini — Equivalence Check */}
                  <button
                    onClick={() => navigate(`/engineer/equivalence?material_a_id=${detailMaterial.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm group"
                  >
                    <GitMerge className="w-4 h-4 shrink-0" />
                    <div className="text-left flex-1">
                      <div className="text-sm">Check Substitutability</div>
                      <div className="text-xs text-orange-200 font-normal">Powered by You.com + Gemini</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-orange-200 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <p className="text-xs text-stone-400 text-center leading-relaxed">
                    Supplier search uses live Google Shopping data.<br />
                    Substitution analysis retrieves manufacturer datasheets and runs a parameter-by-parameter engineering comparison.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
