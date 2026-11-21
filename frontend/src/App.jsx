import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Eager: home page, login, and the route guard wrapper.
import Landing from './pages/Landing';
import Login from './pages/Login';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Entry dashboard (lazy)
const EntryDashboard = lazy(() => import('./pages/entry/EntryDashboard'));
const EntryHome = lazy(() => import('./pages/entry/EntryHome'));
const NewReceipt = lazy(() => import('./pages/entry/NewReceipt'));
const PendingApprovals = lazy(() => import('./pages/entry/PendingApprovals'));
const ReceiptHistory = lazy(() => import('./pages/entry/ReceiptHistory'));
const Locations = lazy(() =>
  import('./pages/Stubs').then((m) => ({ default: m.Locations }))
);

// Engineer dashboard (lazy)
const EngineerDashboard = lazy(() => import('../../dashboards/engineer/EngineerDashboard'));
const EngineerHome = lazy(() => import('../../dashboards/engineer/EngineerHome'));
const NLQuery = lazy(() => import('../../dashboards/engineer/NLQuery'));
const MaterialCatalog = lazy(() => import('../../dashboards/engineer/MaterialCatalog'));
const InventoryMap = lazy(() => import('../../dashboards/engineer/InventoryMap'));
const ProcurementSearch = lazy(() => import('../../dashboards/engineer/ProcurementSearch'));
const EquivalenceChecker = lazy(() => import('../../dashboards/engineer/EquivalenceChecker'));

// Accounts dashboard (lazy)
const AccountsDashboard = lazy(() => import('../../dashboards/AccountsDashboard'));
const AccountsHome = lazy(() => import('../../dashboards/pages/AccountsHome'));
const PriceIntelligence = lazy(() => import('../../dashboards/pages/PriceIntelligence'));
const StockValuation = lazy(() => import('../../dashboards/pages/StockValuation'));
const VendorAnalysis = lazy(() => import('../../dashboards/pages/VendorAnalysis'));
const PurchaseHistory = lazy(() => import('../../dashboards/pages/PurchaseHistory'));

// Admin dashboard (lazy)
const AdminDashboard = lazy(() => import('../../dashboards/AdminDashboard'));
const AdminHome = lazy(() => import('../../dashboards/pages/AdminHome'));
const MaterialGovernance = lazy(() => import('../../dashboards/pages/MaterialGovernance'));
const AuditTrail = lazy(() => import('../../dashboards/pages/AuditTrail'));
const DuplicateDetection = lazy(() => import('../../dashboards/pages/DuplicateDetection'));
const UserManagement = lazy(() => import('../../dashboards/pages/UserManagement'));
const SystemHealth = lazy(() => import('../../dashboards/pages/SystemHealth'));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50/40">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-100 border-t-slate-600" />
    </div>
  );
}

function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute requiredRole="entry_operator" />}>
          <Route path="/entry" element={<EntryDashboard />}>
            <Route index element={<EntryHome />} />
            <Route path="new-receipt" element={<NewReceipt />} />
            <Route path="approvals" element={<PendingApprovals />} />
            <Route path="history" element={<ReceiptHistory />} />
            <Route path="locations" element={<Locations />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRole="engineer" />}>
          <Route path="/engineer" element={<EngineerDashboard />}>
            <Route index element={<EngineerHome />} />
            <Route path="nl-query" element={<NLQuery />} />
            <Route path="catalog" element={<MaterialCatalog />} />
            <Route path="inventory-map" element={<InventoryMap />} />
            <Route path="procurement" element={<ProcurementSearch />} />
            <Route path="equivalence" element={<EquivalenceChecker />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRole="accounts" />}>
          <Route path="/accounts" element={<AccountsDashboard />}>
            <Route index element={<AccountsHome />} />
            <Route path="price-intelligence" element={<PriceIntelligence />} />
            <Route path="stock-valuation" element={<StockValuation />} />
            <Route path="vendor-analysis" element={<VendorAnalysis />} />
            <Route path="purchase-history" element={<PurchaseHistory />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminHome />} />
            <Route path="material-governance" element={<MaterialGovernance />} />
            <Route path="audit-trail" element={<AuditTrail />} />
            <Route path="duplicate-detection" element={<DuplicateDetection />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="system-health" element={<SystemHealth />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
