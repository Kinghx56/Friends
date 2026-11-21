import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { 
  Shield, 
  Home, 
  Database, 
  Activity, 
  Users, 
  Copy, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const navItems = [
  { to: '/admin', label: 'Home', icon: Home, end: true },
  { to: '/admin/material-governance', label: 'Material Governance', icon: Database },
  { to: '/admin/audit-trail', label: 'Audit Trail', icon: Activity },
  { to: '/admin/duplicate-detection', label: 'Duplicate Detection', icon: Copy },
  { to: '/admin/user-management', label: 'User Management', icon: Users },
  { to: '/admin/system-health', label: 'System Health', icon: Shield },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { mobileOpen, close } = useSidebar();
  const location = useLocation();

  // Close mobile sidebar on navigation
  React.useEffect(() => { close(); }, [location.pathname]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop md:hidden" onClick={close} />
      )}
      <aside className={cn(
        'fixed left-0 top-0 h-full bg-amber-50 border-r border-orange-100 text-stone-700 flex flex-col transition-all duration-300 z-40',
        // Mobile: slide in/out
        'max-md:translate-x-[-100%] max-md:w-72',
        mobileOpen && 'max-md:translate-x-0',
        // Desktop: collapsible
        collapsed ? 'md:w-16' : 'md:w-60'
      )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-2 px-4 py-5 border-b border-orange-100', collapsed && 'justify-center px-2')}>
        <Shield className="h-7 w-7 text-orange-500 shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-bold text-lg leading-tight text-stone-800">Saarthi</div>
            <div className="text-xs text-stone-400 leading-tight">BharatOil Admin</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
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
