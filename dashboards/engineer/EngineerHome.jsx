import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database, Package, MessageSquare, Map,
  ArrowRight, CheckCircle2, Clock, TrendingUp,
  ShoppingCart, GitMerge, Zap, AlertTriangle,
  ExternalLink, ChevronRight
} from 'lucide-react';
import api from '../../frontend/src/lib/api';

const MetricCard = ({ title, value, icon: Icon, color, description, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-orange-100 p-6 flex flex-col gap-3 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-stone-500">{title}</span>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="text-3xl font-bold text-stone-800">{value ?? '—'}</div>
    {description && <p className="text-xs text-stone-400">{description}</p>}
  </div>
);

const PoweredBy = ({ label, color }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
    {label}
  </span>
);

export default function EngineerHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMaterials: null,
    approvedMaterials: null,
    pendingMaterials: null,
    totalInventoryLocations: null,
  });
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data } = await api.get('/dashboard/engineer');
        setStats({
          totalMaterials: data.totalMaterials,
          approvedMaterials: data.approvedMaterials,
          pendingMaterials: data.pendingMaterials,
          totalInventoryLocations: data.totalInventoryLocations,
        });
        setRecentMaterials(data.recentMaterials || []);
        setLowStockItems(data.lowStock || []);
      } catch (err) {
        console.error('EngineerHome fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

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

  return (
    <div className="space-y-6">

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-gradient-to-r from-stone-900 via-orange-900 to-orange-800 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-400 shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">
                Material Intelligence
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight text-white">
              Find it. Source it. Substitute it.
            </h2>
            <p className="text-orange-200 text-sm max-w-xl leading-relaxed">
              Saarthi goes beyond the catalog. When stock runs low, discover verified external
              suppliers instantly via <span className="text-white font-semibold">SerpApi</span>.
              Before ordering, check if existing stock can substitute using
              AI-powered engineering analysis via <span className="text-white font-semibold">You.com + Gemini</span>.
            </p>
          </div>

          <div className="flex flex-row sm:flex-col gap-3 shrink-0">
            <button
              onClick={() => navigate('/engineer/procurement')}
              aria-label="Find External Suppliers via SerpApi"
              className="flex items-center gap-3 px-4 py-3 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-orange-500/30 group cursor-pointer focus-visible:outline-white"
            >
              <ShoppingCart className="w-5 h-5 shrink-0" aria-hidden="true" />
              <div className="text-left min-w-0">
                <div className="truncate">Find External Suppliers</div>
                <div className="text-xs text-orange-200 font-normal">Powered by SerpApi</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-0.5 transition-transform shrink-0" aria-hidden="true" />
            </button>

            <button
              onClick={() => navigate('/engineer/equivalence')}
              aria-label="Check Substitutability via You.com + Gemini"
              className="flex items-center gap-3 px-4 py-3 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-600/30 group cursor-pointer focus-visible:outline-white"
            >
              <GitMerge className="w-5 h-5 shrink-0" aria-hidden="true" />
              <div className="text-left min-w-0">
                <div className="truncate">Check Substitutability</div>
                <div className="text-xs text-amber-200 font-normal">Powered by You.com + Gemini</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-0.5 transition-transform shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Intelligence Feature Cards                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* SerpApi Card */}
        <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-150">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-white/20 rounded-lg shrink-0">
                <ShoppingCart className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-sm truncate">Procurement Intelligence</h3>
                <PoweredBy label="SerpApi · Google Shopping" color="bg-white/20 text-white" />
              </div>
            </div>
            <button
              onClick={() => navigate('/engineer/procurement')}
              className="p-2 bg-white/10 hover:bg-white/25 rounded-lg transition-colors shrink-0 ml-2 cursor-pointer"
              aria-label="Open Procurement Search"
            >
              <ExternalLink className="w-4 h-4 text-white" aria-hidden="true" />
            </button>
          </div>
          <div className="px-5 py-4 flex flex-col flex-1 gap-3">
            <p className="text-sm text-stone-600 leading-relaxed">
              When internal stock is insufficient, search live external markets for verified
              vendor listings — prices, availability, and ratings — without leaving Saarthi.
            </p>
            <div className="space-y-2 flex-1">
              {[
                'Live Google Shopping results for any catalog material',
                'Price comparison across external vendors in ₹INR',
                'In-stock availability and seller ratings',
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-stone-600">
                  <CheckCircle2Icon className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/engineer/procurement')}
              className="w-full py-2 text-sm font-semibold text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 active:bg-orange-100 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-auto"
            >
              Search Suppliers <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* You.com + Gemini Card */}
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-150">
          <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-white/20 rounded-lg shrink-0">
                <GitMerge className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-sm truncate">Engineering Equivalence</h3>
                <PoweredBy label="You.com + Gemini AI" color="bg-white/20 text-white" />
              </div>
            </div>
            <button
              onClick={() => navigate('/engineer/equivalence')}
              className="p-2 bg-white/10 hover:bg-white/25 rounded-lg transition-colors shrink-0 ml-2 cursor-pointer"
              aria-label="Open Equivalence Check"
            >
              <ExternalLink className="w-4 h-4 text-white" aria-hidden="true" />
            </button>
          </div>
          <div className="px-5 py-4 flex flex-col flex-1 gap-3">
            <p className="text-sm text-stone-600 leading-relaxed">
              Before raising a procurement request, verify whether an in-stock material
              can safely substitute using AI-retrieved manufacturer datasheets and
              parameter-by-parameter engineering comparison.
            </p>
            <div className="space-y-2 flex-1">
              {[
                'Technical datasheet retrieval via You.com Search',
                'Parameter-by-parameter safety analysis via Gemini',
                'Evidence-backed verdict — always requires engineer sign-off',
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-stone-600">
                  <CheckCircle2Icon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/engineer/equivalence')}
              className="w-full py-2 text-sm font-semibold text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50 active:bg-amber-100 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-auto"
            >
              Check Substitutability <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Cards                                                           */}
      {/* ------------------------------------------------------------------ */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Materials"
            value={stats.totalMaterials?.toLocaleString()}
            icon={Database}
            color="bg-orange-50 text-orange-600"
            description="In master catalog"
            onClick={() => navigate('/engineer/catalog')}
          />
          <MetricCard
            title="Approved CNMCs"
            value={stats.approvedMaterials?.toLocaleString()}
            icon={CheckCircle2}
            color="bg-emerald-50 text-emerald-600"
            description="Active & standardized"
            onClick={() => navigate('/engineer/catalog')}
          />
          <MetricCard
            title="Pending Review"
            value={stats.pendingMaterials?.toLocaleString()}
            icon={Clock}
            color="bg-amber-50 text-amber-600"
            description="Awaiting approval"
            onClick={() => navigate('/engineer/catalog')}
          />
          <MetricCard
            title="Inventory Slots"
            value={stats.totalInventoryLocations?.toLocaleString()}
            icon={Package}
            color="bg-orange-50 text-orange-600"
            description="Bin-level stock records"
            onClick={() => navigate('/engineer/inventory-map')}
          />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Low Stock                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-stone-800">Low Stock Alerts</h3>
            <span className="text-xs text-stone-400 ml-1">— act on each item with the intelligence tools below</span>
          </div>
          <button
            onClick={() => navigate('/engineer/inventory-map')}
            className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1"
          >
            View map <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-stone-100 rounded animate-pulse" />
            ))}
          </div>
        ) : lowStockItems.length === 0 ? (
          <p className="text-stone-400 text-sm py-8 text-center">
            No materials are at or below their reorder level
          </p>
        ) : (
          <div className="divide-y divide-stone-100">
            {lowStockItems.map((item) => (
              <div
                key={item.material_id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/40 transition-colors"
              >
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  item.alert_type === 'out_of_stock' ? 'bg-red-500' : 'bg-amber-400'
                }`} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">
                    {item.standard_description || item.cnmc}
                  </p>
                  <p className="text-xs text-stone-400 font-mono">
                    {item.cnmc} · reorder at {item.reorder_level} {item.unit_of_measure}
                  </p>
                </div>

                <span className={`text-sm font-bold tabular-nums shrink-0 ${
                  item.alert_type === 'out_of_stock' ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {item.total_quantity} {item.unit_of_measure}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/engineer/procurement?material_id=${item.material_id}`)}
                    title="Find external suppliers for this material via SerpApi"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg transition-colors border border-orange-200"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Find Suppliers
                  </button>
                  <button
                    onClick={() => navigate(`/engineer/equivalence?material_a_id=${item.material_id}`)}
                    title="Check if another in-stock material can substitute via You.com + Gemini"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg transition-colors border border-amber-200"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    Check Substitute
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && lowStockItems.length > 0 && (
          <div className="px-6 py-3 bg-orange-50/40 border-t border-stone-100 flex items-center gap-6 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-orange-500" />
              <strong className="text-orange-600">Find Suppliers</strong> — searches live Google Shopping via SerpApi
            </span>
            <span className="flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5 text-amber-500" />
              <strong className="text-amber-600">Check Substitute</strong> — retrieves datasheets via You.com, compares specs with Gemini
            </span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Quick Actions + Recent Materials                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 flex flex-col gap-2">
          <h3 className="font-bold text-stone-800 mb-1">Quick Actions</h3>
          {[
            { label: 'Find External Suppliers', sub: 'SerpApi · Google Shopping', to: '/engineer/procurement', icon: ShoppingCart, color: 'text-orange-600 bg-orange-50' },
            { label: 'Check Substitutability', sub: 'You.com + Gemini AI', to: '/engineer/equivalence', icon: GitMerge, color: 'text-amber-600 bg-amber-50' },
            { label: 'Ask a question about stock', sub: 'NL Query', to: '/engineer/nl-query', icon: MessageSquare, color: 'text-orange-600 bg-orange-50' },
            { label: 'Browse material catalog', sub: 'Material Catalog', to: '/engineer/catalog', icon: BookOpenIcon, color: 'text-stone-600 bg-stone-50' },
            { label: 'View warehouse map', sub: 'Inventory Map', to: '/engineer/inventory-map', icon: Map, color: 'text-orange-600 bg-orange-50' },
          ].map(({ label, sub, to, icon: Icon, color }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-orange-50/60 transition-colors text-left group"
            >
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-700 group-hover:text-orange-600 truncate">{label}</p>
                <p className="text-xs text-stone-400 truncate">{sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-800">Recently Approved Materials</h3>
            <button
              onClick={() => navigate('/engineer/catalog')}
              className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1"
            >
              Browse all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-orange-50/40 text-stone-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">CNMC</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-stone-100 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-stone-400">No materials found</td>
                  </tr>
                ) : recentMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-5 py-3 font-mono text-xs text-stone-600">{m.cnmc || '—'}</td>
                    <td className="px-5 py-3 font-medium text-stone-800 max-w-xs">
                      <p className="truncate">{m.standard_description}</p>
                    </td>
                    <td className="px-5 py-3 text-stone-500 text-xs">{m.category || '—'}</td>
                    <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/engineer/procurement?material_id=${m.id}`)}
                          title="Find suppliers"
                          className="p-1.5 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/engineer/equivalence?material_a_id=${m.id}`)}
                          title="Check substitute"
                          className="p-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors"
                        >
                          <GitMerge className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

const BookOpenIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CheckCircle2Icon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
