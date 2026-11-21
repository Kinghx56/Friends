// Engineer Dashboard Routes
// Usage: import engineerRoutes from './engineer/engineerRoutes';
// Then spread into your main App.jsx router config.

import EngineerDashboard from './EngineerDashboard';
import EngineerHome from './EngineerHome';
import NLQuery from './NLQuery';
import MaterialCatalog from './MaterialCatalog';
import InventoryMap from './InventoryMap';
import ProcurementSearch from './ProcurementSearch';
import EquivalenceChecker from './EquivalenceChecker';

const engineerRoutes = {
  path: '/engineer',
  element: <EngineerDashboard />,
  children: [
    { index: true, element: <EngineerHome /> },
    { path: 'nl-query', element: <NLQuery /> },
    { path: 'catalog', element: <MaterialCatalog /> },
    { path: 'inventory-map', element: <InventoryMap /> },
    { path: 'procurement', element: <ProcurementSearch /> },
    { path: 'equivalence', element: <EquivalenceChecker /> },
  ],
};

export default engineerRoutes;
