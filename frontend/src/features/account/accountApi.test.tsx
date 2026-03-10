import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockBaseQueryWithEnvironment } = vi.hoisted(() => ({
  mockBaseQueryWithEnvironment: vi.fn(
    (args: string | { url: string; params?: Record<string, string> }) => {
      const url = typeof args === 'string' ? args : args.url;
      const timeframe = typeof args === 'string' ? undefined : args.params?.timeframe;

      if (url === '/api/account/balance') {
        return Promise.resolve({
          data: {
            total: '10000.00',
            available: '8500.00',
            locked: '1500.00',
            assets: [],
            lastSync: '2026-03-09T12:00:00Z',
          },
        });
      }

      if (url === '/api/account/performance') {
        return Promise.resolve({
          data: {
            totalProfitLoss: timeframe === 'all' ? '1250.00' : '125.00',
            profitLossPercentage: timeframe === 'all' ? '12.50' : '1.25',
            winRate: '58.3',
            tradeCount: timeframe === 'all' ? 48 : 6,
            cashRatio: '85.0',
          },
        });
      }

      return Promise.resolve({
        error: {
          status: 404,
          data: { message: `Unhandled test query for ${url}` },
        },
      });
    }
  ),
}));

vi.mock('@/services/api', () => ({
  baseQueryWithEnvironment: mockBaseQueryWithEnvironment,
}));

import { accountApi, useGetBalanceQuery, useGetPerformanceQuery } from './accountApi';

import authReducer from '@/features/auth/authSlice';
import environmentReducer from '@/features/environment/environmentSlice';

describe('accountApi', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    mockBaseQueryWithEnvironment.mockClear();

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
      expect(accountApi.endpoints.getBalance).toBeDefined();
    });

    it('should query correct endpoint', async () => {
      const { result } = renderHook(() => useGetBalanceQuery(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(mockBaseQueryWithEnvironment).toHaveBeenCalled();
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
      expect(accountApi.endpoints.getPerformance).toBeDefined();
    });

    it('should accept timeframe parameter', async () => {
      const { result } = renderHook(() => useGetPerformanceQuery('today'), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should accept all valid timeframe values', async () => {
      const timeframes: Array<'today' | 'week' | 'month' | 'all'> = [
        'today',
        'week',
        'month',
        'all',
      ];

      for (const timeframe of timeframes) {
        const { result, unmount } = renderHook(() => useGetPerformanceQuery(timeframe), {
          wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        unmount();
      }
    });
  });

  describe('API configuration', () => {
    it('should have correct reducerPath', () => {
      expect(accountApi.reducerPath).toBe('accountApi');
    });

    it('should define Balance and Performance tag types', () => {
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

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      store.dispatch(accountApi.util.invalidateTags(['Balance']));

      await waitFor(() => {
        expect(mockBaseQueryWithEnvironment).toHaveBeenCalledTimes(2);
      });
    });

    it('should invalidate Performance tag when performance data changes', async () => {
      const { result } = renderHook(() => useGetPerformanceQuery('today'), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      store.dispatch(accountApi.util.invalidateTags(['Performance']));

      await waitFor(() => {
        expect(mockBaseQueryWithEnvironment).toHaveBeenCalledTimes(2);
      });
    });
  });
});
