import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import EngineerSidebar from './EngineerSidebar';
import { SidebarProvider, useSidebar } from '../SidebarContext';
import { Menu } from 'lucide-react';
import Header from '../../frontend/src/components/layout/Header';

const getPageTitle = (pathname) => {
  switch (true) {
    case pathname === '/engineer': return 'Engineer Dashboard';
    case pathname.startsWith('/engineer/nl-query'): return 'NL Query — Material Search';
    case pathname.startsWith('/engineer/catalog'): return 'Material Catalog';
    case pathname.startsWith('/engineer/inventory-map'): return 'Inventory Map';
    case pathname.startsWith('/engineer/procurement'): return 'Procurement Search';
    case pathname.startsWith('/engineer/equivalence'): return 'Equivalence Check';
    default: return 'Engineer Dashboard';
  }
};

function EngineerShell() {
  const location = useLocation();
  const { toggle } = useSidebar();

  return (
    <div className="flex h-screen bg-orange-50/30 overflow-hidden font-sans dashboard-shell">
      <EngineerSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-60 transition-all duration-300 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center shrink-0">
          <button
            onClick={toggle}
            className="md:hidden p-2 ml-2 rounded-lg text-stone-500 hover:bg-orange-50 transition-colors focus-visible:outline-orange-500"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <Header title={getPageTitle(location.pathname)} />
          </div>
        </div>
        <main key={location.pathname} className="flex-1 overflow-y-auto p-4 sm:p-6 page-fade-in" style={{ overflowX: 'clip' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function EngineerDashboard() {
  return (
    <SidebarProvider>
      <EngineerShell />
    </SidebarProvider>
  );
}
