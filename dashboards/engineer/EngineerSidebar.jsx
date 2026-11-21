import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebar } from '../SidebarContext';
import {
  Wrench,
  Home,
  MessageSquare,
  BookOpen,
  Map,
  ShoppingCart,
  GitMerge,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Intelligence features sit at the top — they are the product's centerpiece.
const NAV = [
  {
    items: [{ to: '/engineer', label: 'Home', icon: Home, end: true }],
  },
  {
    label: 'intelligence',
    items: [
      { to: '/engineer/procurement', label: 'Procurement Search', icon: ShoppingCart },
      { to: '/engineer/equivalence', label: 'Equivalence Check', icon: GitMerge },
    ],
  },
  {
    label: 'catalog',
    items: [
      { to: '/engineer/nl-query', label: 'NL Query', icon: MessageSquare },
      { to: '/engineer/catalog', label: 'Material Catalog', icon: BookOpen },
      { to: '/engineer/inventory-map', label: 'Inventory Map', icon: Map },
    ],
  },
];

export default function EngineerSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { mobileOpen, close } = useSidebar();
  const location = useLocation();

  React.useEffect(() => { close(); }, [location.pathname]);

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-backdrop md:hidden" onClick={close} />
      )}
      <aside className={cn(
        'fixed left-0 top-0 h-full bg-amber-50 border-r border-orange-100 text-stone-700 flex flex-col transition-all duration-300 z-40',
        'max-md:translate-x-[-100%] max-md:w-72',
        mobileOpen && 'max-md:translate-x-0',
        collapsed ? 'md:w-16' : 'md:w-60'
      )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-2 px-4 py-5 border-b border-orange-100', collapsed && 'justify-center px-2')}>
        <Wrench className="h-7 w-7 text-orange-500 shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-bold text-lg leading-tight text-stone-800">Saarthi</div>
            <div className="text-xs text-stone-400 leading-tight">BharatOil Engineering</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {NAV.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && 'mt-4 pt-4 border-t border-orange-100')}>
            {group.label && !collapsed && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-stone-600 hover:bg-orange-50 hover:text-orange-700',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-orange-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 px-3 rounded-lg text-stone-400 hover:bg-orange-50 hover:text-orange-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <><ChevronLeft className="h-4 w-4 mr-2" /><span className="text-sm">Collapse</span></>
          )}
        </button>
      </div>
    </aside>
    </>
  );
}
