import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
  id: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (phone: string, otp: string) => {
        const response = await api.post('/auth/verify-otp', { phone, otp, purpose: 'login' });
        const { user, accessToken } = response.data;

        if (!['SUPER_ADMIN', 'SANGH_ADMIN', 'TRUST_ADMIN', 'MATRIMONY_ADMIN'].includes(user.role)) {
          throw new Error('Access denied. Admin role required.');
        }

        // Set token in axios defaults immediately
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, token: accessToken, isAuthenticated: true });
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('jainsetu-admin-auth');
      },

      setAuth: (user: User, token: string) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ user, token, isAuthenticated: true });
      },
    }),
    {
      name: 'jainsetu-admin-auth',
      onRehydrateStorage: () => (state) => {
        // Called after rehydration is complete
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

// Initialize auth on module load - restore token from storage immediately
const initAuth = () => {
  try {
    const stored = localStorage.getItem('jainsetu-admin-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${parsed.state.token}`;
      }
    }
  } catch (e) {
    console.error('Failed to initialize auth:', e);
  }
};
initAuth();
