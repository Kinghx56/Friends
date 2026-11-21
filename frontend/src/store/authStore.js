import { create } from 'zustand';
import supabase from '@/lib/supabase';
import api from '@/lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  session: null,
  isLoading: true,
  login: (session, user, role) => set({ session, user, role, isLoading: false }),
  logout: () => {
    // Revoke the session server-side (best-effort). Capture the token first so the
    // request is authenticated even though we clear localStorage immediately after.
    let token = null;
    try {
      const stored = localStorage.getItem('mock_auth');
      if (stored) token = JSON.parse(stored)?.session?.access_token ?? null;
    } catch {
      token = null;
    }
    if (token) {
      api
        .post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } })
        .catch(() => {});
    }
    localStorage.removeItem('mock_auth');
    supabase.auth.signOut().catch(() => {});
    set({ session: null, user: null, role: null, isLoading: false });
  },
  setUser: (user) => set({ user }),
  init: async () => {
    try {
      const stored = localStorage.getItem('mock_auth');
      if (stored) {
        const { session, user, role } = JSON.parse(stored);
        if (session?.access_token && session?.refresh_token) {
          // Restore the real Supabase client session too, so RLS-gated
          // direct Supabase queries (Admin/Accounts/Engineer dashboards)
          // keep working after a page refresh, not just right after login.
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
        }
        set({ session, user, role, isLoading: false });
        return;
      }
    } catch (e) {
      // corrupted localStorage entry or expired session — fall through to logged-out state
    }
    set({ session: null, user: null, role: null, isLoading: false });
  },
}));
