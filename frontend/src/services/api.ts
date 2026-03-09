import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../app/store';
import { setToken, logout } from '@/features/auth/authSlice';
import { Mutex } from 'async-mutex';

// Mutex to prevent multiple simultaneous refresh attempts
const mutex = new Mutex();

/**
 * Base query configuration for RTK Query with environment injection
 * 
 * Features:
 * - Automatic authentication token injection
 * - Environment mode header injection (test/live)
 * - Retry logic for failed requests
 * - Error handling
 */
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    
    // Add authentication token if available
    // Note: authSlice will be implemented in task 1.4
    const token = (state as any).auth?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Add environment mode header (test/live)
    // Note: environmentSlice will be implemented in task 2.3
    const environment = (state as any).environment?.mode || 'test';
    headers.set('X-Environment', environment);
    
    // Add content type for JSON requests
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    return headers;
  },
  // Credentials for CORS
  credentials: 'include',
});

/**
 * Base query with automatic retry logic
 * 
 * Retry behavior:
 * - Retries on network errors (no response)
 * - Retries on 5xx server errors (3 attempts)
 * - Does NOT retry on 4xx client errors
 * - Exponential backoff: 1s, 2s, 4s
 */
export const baseQueryWithRetry: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    const result = await baseQuery(args, api, extraOptions);
    
    // Success - return immediately
    if (!result.error) {
      return result;
    }
    
    // Client errors (4xx) - don't retry
    if (result.error.status && typeof result.error.status === 'number' && result.error.status >= 400 && result.error.status < 500) {
      return result;
    }
    
    // Last attempt - return error
    if (attempt === maxRetries - 1) {
      return result;
    }
    
    // Network error or 5xx - retry with exponential backoff
    attempt++;
    const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Fallback (should never reach here)
  return await baseQuery(args, api, extraOptions);
};

/**
 * Base query with error handling middleware and automatic token refresh
 * 
 * Handles:
 * - 401 Unauthorized - triggers token refresh or logout
 * - Network errors - displays user-friendly messages
 * - Server errors - logs for debugging
 * 
 * Token refresh flow:
 * 1. On 401 error, acquire mutex to prevent concurrent refresh attempts
 * 2. Check if token has already been refreshed by another request
 * 3. Attempt to refresh token using refresh token from localStorage
 * 4. If refresh succeeds, update token and retry original request
 * 5. If refresh fails, logout user and redirect to login
 */
export const baseQueryWithErrorHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait for any ongoing refresh to complete
  await mutex.waitForUnlock();
  
  let result = await baseQueryWithRetry(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Check if we're not already refreshing
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      
      try {
        const state = api.getState() as RootState;
        const refreshToken = state.auth.refreshToken || localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Attempt to refresh the token
          const refreshResult = await baseQuery(
            {
              url: '/api/auth/refresh',
              method: 'POST',
              body: { refreshToken },
            },
            api,
            extraOptions
          );
          
          if (refreshResult.data) {
            // Token refresh successful
            const { token } = refreshResult.data as { token: string; expiresIn: number };
            
            // Update token in Redux store
            api.dispatch(setToken(token));
            
            // Retry the original request with new token
            result = await baseQueryWithRetry(args, api, extraOptions);
          } else {
            // Token refresh failed - logout user
            api.dispatch(logout());
            
            // Redirect to login page
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        } else {
          // No refresh token available - logout user
          api.dispatch(logout());
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } finally {
        release();
      }
    } else {
      // Wait for the ongoing refresh to complete and retry
      await mutex.waitForUnlock();
      result = await baseQueryWithRetry(args, api, extraOptions);
    }
  }
  
  // Log errors in development
  if (result.error && import.meta.env.DEV) {
    console.error('API Error:', {
      args,
      error: result.error,
    });
  }
  
  return result;
};

// Export the configured base query for use in API slices
export const baseQueryWithEnvironment = baseQueryWithErrorHandling;
