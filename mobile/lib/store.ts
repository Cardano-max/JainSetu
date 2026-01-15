import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { tokenStorage, classifyError, ApiErrorCode } from './api';
import axios from 'axios';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface User {
  id: string;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  role: 'USER' | 'SUPER_ADMIN' | 'SANGH_ADMIN' | 'TRUST_ADMIN' | 'MATRIMONY_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  city?: { id: string; name: string };
  sect?: string;
  gotra?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  isProfileVerified?: boolean;
  phonePrivacy?: 'PUBLIC' | 'CONTACTS' | 'PRIVATE';
  emailPrivacy?: 'PUBLIC' | 'CONTACTS' | 'PRIVATE';
  profilePrivacy?: 'PUBLIC' | 'CONTACTS' | 'PRIVATE';
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastError: string | null;

  // Actions
  login: (phone: string) => Promise<{ isNewUser: boolean; registrationToken?: string }>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
  resetAuth: () => void;
}

export interface RegisterData {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  cityId?: string;
  sect?: string;
  sanghId?: string;
  gotra?: string;
  registrationToken: string;
}

// ============================================================================
// AUTH STORE
// ============================================================================

const initialAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  lastError: null,
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Set up auth state listener for token refresh failures
  api.setAuthStateListener((isAuthenticated) => {
    if (!isAuthenticated) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        lastError: 'Session expired. Please login again.',
      });
    }
  });

  return {
    ...initialAuthState,

    login: async (phone: string) => {
      try {
        set({ lastError: null });

        // Demo mode: Skip OTP verification
        // Try to login directly or check if user exists
        try {
          const response = await api.post<{
            success: boolean;
            isNewUser: boolean;
            registrationToken?: string;
            user?: User;
            accessToken?: string;
            refreshToken?: string;
          }>('/auth/login-demo', { phone });

          const { isNewUser, registrationToken, user, accessToken, refreshToken } = response;

          if (!isNewUser && user && accessToken && refreshToken) {
            await tokenStorage.setTokens(accessToken, refreshToken);
            set({ user, isAuthenticated: true, isLoading: false });
          }

          return { isNewUser, registrationToken };
        } catch (apiError) {
          // If API fails, use demo login (for offline/demo mode)
          console.log('Using demo login mode');

          // Create a demo user for testing
          const demoUser: User = {
            id: 'demo-' + phone,
            phone: phone,
            email: null,
            firstName: 'Demo',
            lastName: 'User',
            profilePhoto: null,
            role: 'USER',
            status: 'ACTIVE',
          };

          // For demo, treat as existing user
          set({ user: demoUser, isAuthenticated: true, isLoading: false });
          return { isNewUser: false };
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const apiError = classifyError(error);
          set({ lastError: apiError.userMessage });
        }
        throw error;
      }
    },

    register: async (data: RegisterData) => {
      try {
        set({ lastError: null });

        const response = await api.post<{
          success: boolean;
          user: User;
          accessToken: string;
          refreshToken: string;
        }>('/auth/register', data);

        const { user, accessToken, refreshToken } = response;

        await tokenStorage.setTokens(accessToken, refreshToken);
        set({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const apiError = classifyError(error);
          set({ lastError: apiError.userMessage });
        }
        throw error;
      }
    },

    logout: async () => {
      try {
        // Call backend to invalidate refresh tokens
        await api.post('/auth/logout').catch(() => {
          // Ignore errors during logout - we're logging out anyway
        });
      } finally {
        // Always clear local state regardless of API call result
        await tokenStorage.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          lastError: null,
        });
      }
    },

    checkAuth: async () => {
      try {
        const token = await tokenStorage.getAccessToken();

        if (!token) {
          set({ isLoading: false, isAuthenticated: false, user: null });
          return;
        }

        const response = await api.get<{ success: boolean; user: User }>('/auth/me');
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        // Clear tokens on any error during auth check
        await tokenStorage.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },

    updateUser: (data: Partial<User>) => {
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, ...data } });
      }
    },

    clearError: () => {
      set({ lastError: null });
    },

    resetAuth: () => {
      set(initialAuthState);
    },
  };
});

// ============================================================================
// CART STORE WITH PERSISTENCE
// ============================================================================

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  stock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isInCart: (id: string) => boolean;
  getCartItem: (id: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.id === item.id);

        if (existing) {
          // Update quantity if item exists
          const newQuantity = existing.quantity + (item.quantity || 1);
          // Respect stock limits if provided
          const maxQuantity = item.stock ? Math.min(newQuantity, item.stock) : newQuantity;

          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: maxQuantity } : i
            ),
          });
        } else {
          // Add new item
          set({ items: [...items, { ...item, quantity: item.quantity || 1 }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const item = get().items.find((i) => i.id === id);
        if (item) {
          // Respect stock limits if provided
          const maxQuantity = item.stock ? Math.min(quantity, item.stock) : quantity;
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity: maxQuantity } : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      isInCart: (id) => get().items.some((i) => i.id === id),

      getCartItem: (id) => get().items.find((i) => i.id === id),
    }),
    {
      name: 'jainsetu-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================================================
// NETWORK STATE STORE
// ============================================================================

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  setNetworkState: (state: Partial<Omit<NetworkState, 'setNetworkState'>>) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true,
  isInternetReachable: null,
  connectionType: null,
  setNetworkState: (state) => set(state),
}));

// ============================================================================
// APP STATE STORE
// ============================================================================

interface AppState {
  isAppReady: boolean;
  hasOnboarded: boolean;
  selectedCity: { id: string; name: string } | null;
  lastRefreshTime: number | null;

  setAppReady: (ready: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  setSelectedCity: (city: { id: string; name: string } | null) => void;
  setLastRefreshTime: (time: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAppReady: false,
      hasOnboarded: false,
      selectedCity: null,
      lastRefreshTime: null,

      setAppReady: (ready) => set({ isAppReady: ready }),
      setOnboarded: (onboarded) => set({ hasOnboarded: onboarded }),
      setSelectedCity: (city) => set({ selectedCity: city }),
      setLastRefreshTime: (time) => set({ lastRefreshTime: time }),
    }),
    {
      name: 'jainsetu-app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        selectedCity: state.selectedCity,
      }),
    }
  )
);

// ============================================================================
// UI STATE STORE (Non-persisted)
// ============================================================================

interface UIState {
  isRefreshing: boolean;
  activeModal: string | null;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | 'warning' | null;

  setRefreshing: (refreshing: boolean) => void;
  showModal: (modal: string) => void;
  hideModal: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isRefreshing: false,
  activeModal: null,
  toastMessage: null,
  toastType: null,

  setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
  showModal: (modal) => set({ activeModal: modal }),
  hideModal: () => set({ activeModal: null }),
  showToast: (message, type) => set({ toastMessage: message, toastType: type }),
  hideToast: () => set({ toastMessage: null, toastType: null }),
}));
