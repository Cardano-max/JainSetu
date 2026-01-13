import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

export type Environment = 'development' | 'staging' | 'production';

const ENV_CONFIG: Record<Environment, { apiUrl: string }> = {
  development: {
    apiUrl: Platform.OS === 'android'
      ? 'http://10.0.2.2:3000/api'  // Android emulator
      : 'http://localhost:3000/api', // iOS simulator
  },
  staging: {
    apiUrl: 'https://staging-api.jainsetu.com/api',
  },
  production: {
    apiUrl: 'https://api.jainsetu.com/api',
  },
};

const getEnvironment = (): Environment => {
  const envOverride = process.env.EXPO_PUBLIC_ENV as Environment;
  if (envOverride && ENV_CONFIG[envOverride]) {
    return envOverride;
  }

  if (__DEV__) {
    return 'development';
  }

  return 'production';
};

const getApiUrl = (): string => {
  // Allow explicit URL override
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const env = getEnvironment();
  return ENV_CONFIG[env].apiUrl;
};

export const API_URL = getApiUrl();
export const CURRENT_ENV = getEnvironment();

console.log(`[API] Environment: ${CURRENT_ENV}, URL: ${API_URL}`);

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  userMessage: string;
  details?: any;
  statusCode?: number;
  retryable: boolean;
}

const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  [ApiErrorCode.NETWORK_ERROR]: 'Unable to connect. Please check your internet connection.',
  [ApiErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
  [ApiErrorCode.UNAUTHORIZED]: 'Your session has expired. Please login again.',
  [ApiErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ApiErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ApiErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ApiErrorCode.CONFLICT]: 'This action conflicts with existing data.',
  [ApiErrorCode.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',
  [ApiErrorCode.SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
  [ApiErrorCode.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

export const classifyError = (error: AxiosError): ApiError => {
  // Network errors (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        code: ApiErrorCode.TIMEOUT,
        message: error.message,
        userMessage: ERROR_MESSAGES[ApiErrorCode.TIMEOUT],
        retryable: true,
      };
    }
    return {
      code: ApiErrorCode.NETWORK_ERROR,
      message: error.message || 'Network error',
      userMessage: ERROR_MESSAGES[ApiErrorCode.NETWORK_ERROR],
      retryable: true,
    };
  }

  const status = error.response.status;
  const responseData = error.response.data as any;
  const serverMessage = responseData?.error || responseData?.message || error.message;

  switch (status) {
    case 400:
      return {
        code: ApiErrorCode.VALIDATION_ERROR,
        message: serverMessage,
        userMessage: responseData?.details?.length > 0
          ? responseData.details.map((d: any) => d.message).join('. ')
          : ERROR_MESSAGES[ApiErrorCode.VALIDATION_ERROR],
        details: responseData?.details,
        statusCode: status,
        retryable: false,
      };
    case 401:
      return {
        code: ApiErrorCode.UNAUTHORIZED,
        message: serverMessage,
        userMessage: ERROR_MESSAGES[ApiErrorCode.UNAUTHORIZED],
        statusCode: status,
        retryable: false,
      };
    case 403:
      return {
        code: ApiErrorCode.FORBIDDEN,
        message: serverMessage,
        userMessage: ERROR_MESSAGES[ApiErrorCode.FORBIDDEN],
        statusCode: status,
        retryable: false,
      };
    case 404:
      return {
        code: ApiErrorCode.NOT_FOUND,
        message: serverMessage,
        userMessage: ERROR_MESSAGES[ApiErrorCode.NOT_FOUND],
        statusCode: status,
        retryable: false,
      };
    case 409:
      return {
        code: ApiErrorCode.CONFLICT,
        message: serverMessage,
        userMessage: serverMessage || ERROR_MESSAGES[ApiErrorCode.CONFLICT],
        statusCode: status,
        retryable: false,
      };
    case 429:
      return {
        code: ApiErrorCode.RATE_LIMITED,
        message: serverMessage,
        userMessage: ERROR_MESSAGES[ApiErrorCode.RATE_LIMITED],
        statusCode: status,
        retryable: true,
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        code: ApiErrorCode.SERVER_ERROR,
        message: serverMessage,
        userMessage: ERROR_MESSAGES[ApiErrorCode.SERVER_ERROR],
        statusCode: status,
        retryable: true,
      };
    default:
      return {
        code: ApiErrorCode.UNKNOWN,
        message: serverMessage,
        userMessage: serverMessage || ERROR_MESSAGES[ApiErrorCode.UNKNOWN],
        statusCode: status,
        retryable: false,
      };
  }
};

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
} as const;

export const tokenStorage = {
  getAccessToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
    } catch (error) {
      console.error('[Token] Failed to get access token:', error);
      return null;
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
    } catch (error) {
      console.error('[Token] Failed to get refresh token:', error);
      return null;
    }
  },

  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    try {
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, accessToken),
        SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, refreshToken),
      ]);
    } catch (error) {
      console.error('[Token] Failed to save tokens:', error);
      throw error;
    }
  },

  clearTokens: async (): Promise<void> => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS),
        SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH),
      ]);
    } catch (error) {
      console.error('[Token] Failed to clear tokens:', error);
    }
  },
};

// ============================================================================
// API CLIENT WITH TOKEN REFRESH
// ============================================================================

interface RefreshSubscriber {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: RefreshSubscriber[] = [];
  private authStateListener: ((isAuthenticated: boolean) => void) | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 second timeout
    });

    this.setupInterceptors();
  }

  setAuthStateListener(listener: (isAuthenticated: boolean) => void): void {
    this.authStateListener = listener;
  }

  private notifyAuthStateChange(isAuthenticated: boolean): void {
    if (this.authStateListener) {
      this.authStateListener(isAuthenticated);
    }
  }

  private subscribeToTokenRefresh(subscriber: RefreshSubscriber): void {
    this.refreshSubscribers.push(subscriber);
  }

  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((subscriber) => subscriber.resolve(token));
    this.refreshSubscribers = [];
  }

  private onTokenRefreshFailed(error: any): void {
    this.refreshSubscribers.forEach((subscriber) => subscriber.reject(error));
    this.refreshSubscribers = [];
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await tokenStorage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Check if this is a 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Don't retry token refresh or login endpoints
          const isAuthEndpoint = originalRequest.url?.includes('/auth/');
          if (isAuthEndpoint && !originalRequest.url?.includes('/auth/me')) {
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          // If already refreshing, wait for the refresh to complete
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.subscribeToTokenRefresh({
                resolve: (token: string) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(this.instance(originalRequest));
                },
                reject: (err: any) => {
                  reject(err);
                },
              });
            });
          }

          // Start refreshing
          this.isRefreshing = true;

          try {
            const refreshToken = await tokenStorage.getRefreshToken();

            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Call refresh endpoint directly (bypass interceptors for this call)
            const response = await axios.post(
              `${API_URL}/auth/refresh-token`,
              { refreshToken },
              { headers: { 'Content-Type': 'application/json' } }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Store new tokens
            await tokenStorage.setTokens(accessToken, newRefreshToken);

            // Notify subscribers
            this.onTokenRefreshed(accessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Token refresh failed - clear tokens and notify auth state change
            console.error('[API] Token refresh failed:', refreshError);
            await tokenStorage.clearTokens();
            this.onTokenRefreshFailed(refreshError);
            this.notifyAuthStateChange(false);
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Retry wrapper with exponential backoff
  async requestWithRetry<T>(
    config: AxiosRequestConfig,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.instance.request<T>(config);
        return response.data;
      } catch (error) {
        lastError = error;

        if (axios.isAxiosError(error)) {
          const apiError = classifyError(error);

          // Don't retry non-retryable errors
          if (!apiError.retryable) {
            throw error;
          }

          // Don't retry if this was the last attempt
          if (attempt === maxRetries) {
            throw error;
          }

          // Calculate delay with exponential backoff and jitter
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
          console.log(`[API] Retry ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }

    throw lastError;
  }

  // Standard request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  // Get the raw axios instance for special cases
  get axios(): AxiosInstance {
    return this.instance;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// For backward compatibility, export a default that matches the old API
const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config),
  setAuthStateListener: (listener: (isAuthenticated: boolean) => void) => apiClient.setAuthStateListener(listener),
  requestWithRetry: <T>(config: AxiosRequestConfig, maxRetries?: number, baseDelay?: number) =>
    apiClient.requestWithRetry<T>(config, maxRetries, baseDelay),
};

export { apiClient };
export default api;
