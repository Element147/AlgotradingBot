import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { store } from '../app/store';
import { setToken, logout } from '../features/auth/authSlice';

/**
 * Axios client instance with authentication and environment injection
 * 
 * This is an alternative to RTK Query for cases where direct HTTP calls are needed:
 * - File uploads/downloads
 * - Non-standard API interactions
 * - External API calls outside the main backend
 * 
 * For standard CRUD operations, prefer RTK Query APIs (authApi, tradesApi, etc.)
 */

// Create Axios instance with base configuration
const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for CORS
});

/**
 * Request interceptor
 * 
 * Automatically adds:
 * - Authentication token from Redux store
 * - Environment mode header (test/live)
 * - Request timestamp for debugging
 */
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    
    // Add authentication token if available
    const token = state.auth.token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add environment mode header (test/live)
    // Note: environmentSlice will be implemented in task 2.3
    const environment = (state as any).environment?.mode || 'test';
    if (config.headers) {
      config.headers['X-Environment'] = environment;
    }
    
    // Add request timestamp for debugging in development
    if (import.meta.env.DEV && config.headers) {
      config.headers['X-Request-Time'] = new Date().toISOString();
    }
    
    return config;
  },
  (error: AxiosError) => {
    // Log request errors in development
    if (import.meta.env.DEV) {
      console.error('Request Error:', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * 
 * Handles:
 * - Successful responses (pass through)
 * - 401 Unauthorized - attempts token refresh
 * - Other errors - logs and rejects
 */
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const state = store.getState();
        const refreshToken = state.auth.refreshToken || localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Attempt to refresh the token
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.data && response.data.token) {
            const { token } = response.data;
            
            // Update token in Redux store
            store.dispatch(setToken(token));
            
            // Update Authorization header for retry
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            
            // Retry the original request with new token
            return axiosClient(originalRequest);
          }
        }
        
        // Token refresh failed or no refresh token - logout user
        store.dispatch(logout());
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } catch (refreshError) {
        // Token refresh failed - logout user
        store.dispatch(logout());
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API errors consistently
 * 
 * Extracts error message from various error response formats
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Server responded with error
    if (error.response?.data) {
      const data = error.response.data as any;
      return data.message || data.error || 'An error occurred';
    }
    
    // Network error or no response
    if (error.request) {
      return 'Network error. Please check your connection.';
    }
    
    // Request setup error
    return error.message || 'Request failed';
  }
  
  // Non-Axios error
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Helper function for retry logic with exponential backoff
 * 
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @returns Promise with the result of the function
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (axios.isAxiosError(error) && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      // Last attempt - throw error
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export default axiosClient;
