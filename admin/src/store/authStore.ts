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

        set({ user, token: accessToken, isAuthenticated: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];
      },

      setAuth: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },
    }),
    {
      name: 'jainsetu-admin-auth',
      onRehydrate: (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
