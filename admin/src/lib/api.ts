import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to ensure auth header is always set
api.interceptors.request.use(
  (config) => {
    // Check if we already have an auth header set
    if (!config.headers['Authorization']) {
      // Try to get token from localStorage
      try {
        const stored = localStorage.getItem('jainsetu-admin-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.token) {
            config.headers['Authorization'] = `Bearer ${parsed.state.token}`;
          }
        }
      } catch (e) {
        console.error('Failed to get auth token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jainsetu-admin-auth');
      window.location.href = '/login';
    }
    // Enhance error message for debugging
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    }
    return Promise.reject(error);
  }
);

export default api;
