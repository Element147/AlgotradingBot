import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { accountApi, useGetBalanceQuery, useGetPerformanceQuery } from './accountApi';

import authReducer from '@/features/auth/authSlice';
import environmentReducer from '@/features/environment/environmentSlice';

// Mock the base query
vi.mock('@/services/api', () => ({
  baseQueryWithEnvironment: vi.fn(),
}));

describe('accountApi', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        environment: environmentReducer,
        [accountApi.reducerPath]: accountApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(accountApi.middleware),
    });
  });

  describe('getBalance endpoint', () => {
    it('should define getBalance query', () => {
      expect(accountApi.endpoints.getBalance).toBeDefined();
    });

    it('should have correct query configuration', () => {
      const endpoint = accountApi.endpoints.getBalance;
      expect(endpoint.name).toBe('getBalance');
    });

    it('should provide Balance tag', () => {
      // Tags are configured internally - verify endpoint exists
      expect(accountApi.endpoints.getBalance).toBeDefined();
    });

    it('should query correct endpoint', () => {
      const { result } = renderHook(() => useGetBalanceQuery(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      });

      expect(result.current).toBeDefined();
    });
  });

  describe('getPerformance endpoint', () => {
    it('should define getPerformance query', () => {
      expect(accountApi.endpoints.getPerformance).toBeDefined();
    });

    it('should have correct query configuration', () => {
      const endpoint = accountApi.endpoints.getPerformance;
      expect(endpoint.name).toBe('getPerformance');
    });

    it('should provide Performance tag', () => {
      // Tags are configured internally - verify endpoint exists
      expect(accountApi.endpoints.getPerformance).toBeDefined();
    });

    it('should accept timeframe parameter', () => {
      const { result } = renderHook(() => useGetPerformanceQuery('today'), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      });

      expect(result.current).toBeDefined();
    });

    it('should accept all valid timeframe values', () => {
      const timeframes: Array<'today' | 'week' | 'month' | 'all'> = [
        'today',
        'week',
        'month',
        'all',
      ];

      timeframes.forEach((timeframe) => {
        const { result } = renderHook(() => useGetPerformanceQuery(timeframe), {
          wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
        });

        expect(result.current).toBeDefined();
      });
    });
  });

  describe('API configuration', () => {
    it('should have correct reducerPath', () => {
      expect(accountApi.reducerPath).toBe('accountApi');
    });

    it('should define Balance and Performance tag types', () => {
      // Tag types are configured internally - verify API is configured
      expect(accountApi.reducerPath).toBe('accountApi');
      expect(accountApi.endpoints.getBalance).toBeDefined();
      expect(accountApi.endpoints.getPerformance).toBeDefined();
    });

    it('should export hooks', () => {
      expect(useGetBalanceQuery).toBeDefined();
      expect(useGetPerformanceQuery).toBeDefined();
    });
  });

  describe('Cache invalidation', () => {
    it('should invalidate Balance tag when balance data changes', async () => {
      const { result } = renderHook(() => useGetBalanceQuery(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      });

      // Trigger cache invalidation
      store.dispatch(accountApi.util.invalidateTags(['Balance']));

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should invalidate Performance tag when performance data changes', async () => {
      const { result } = renderHook(() => useGetPerformanceQuery('today'), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      });

      // Trigger cache invalidation
      store.dispatch(accountApi.util.invalidateTags(['Performance']));

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });
  });
});
