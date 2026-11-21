import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';

const roleBadgeVariant = {
  entry_operator: 'default',
  engineer: 'secondary',
  accounts: 'outline',
  admin: 'destructive',
};

const roleLabel = {
  entry_operator: 'Entry Operator',
  engineer: 'Engineer',
  accounts: 'Accounts',
  admin: 'Admin',
};

export default function Header({ title = 'Dashboard' }) {
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-amber-50 border-b border-orange-100 flex items-center justify-between px-4 sm:px-6 shadow-sm min-w-0 overflow-hidden">
      <h1 className="text-lg sm:text-xl font-semibold text-stone-800 truncate min-w-0 mr-3">{title}</h1>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="hidden sm:block text-sm text-stone-600 font-medium truncate max-w-[140px]">
          {user?.full_name || 'User'}
        </span>
        <Badge variant={roleBadgeVariant[role] || 'secondary'}>
          {roleLabel[role] || role}
        </Badge>
        <Button variant="ghost" onClick={handleLogout} title="Logout" className="gap-1.5 px-2 sm:px-3">
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
