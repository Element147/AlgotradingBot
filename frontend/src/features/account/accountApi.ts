import { createApi } from '@reduxjs/toolkit/query/react';

import type { BalanceData, PerformanceMetrics, PerformanceTimeframe } from './accountContract';
import {
  normalizeBalanceData,
  normalizeOpenPositions,
  normalizePerformanceMetrics,
  normalizeRecentTrades,
} from './accountContract';

import { baseQueryWithEnvironment } from '@/services/api';
import type { Position, Trade } from '@/types/domain.types';

export type { BalanceData, PerformanceMetrics, PerformanceTimeframe } from './accountContract';

/**
 * Account API slice for balance and performance data
 *
 * Features:
 * - Environment-aware queries (test/live mode via X-Environment header)
 * - Cache invalidation tags for data freshness
 * - Polling for live environment (60 second interval)
 * - Automatic refetch on environment switch
 */
export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['Balance', 'Performance', 'Positions', 'Trades'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    /**
     * Get account balance
     *
     * Fetches balance data from the appropriate environment (test or live)
     * based on the X-Environment header set by baseQueryWithEnvironment.
     *
     * In live mode, polling is enabled with 60 second interval.
     */
    getBalance: builder.query<BalanceData, void>({
      query: () => '/api/account/balance',
      transformResponse: normalizeBalanceData,
      providesTags: ['Balance'],
    }),

    /**
     * Get performance metrics
     *
     * Fetches performance data for the specified timeframe.
     *
     * @param timeframe - Time period for metrics (today, week, month, all)
     */
    getPerformance: builder.query<PerformanceMetrics, PerformanceTimeframe>({
      query: (timeframe) => ({
        url: '/api/account/performance',
        params: { timeframe },
      }),
      transformResponse: normalizePerformanceMetrics,
      providesTags: ['Performance'],
    }),

    /**
     * Get open positions
     *
     * Fetches all currently open positions for the active environment.
     * Updates in real-time via WebSocket events.
     */
    getOpenPositions: builder.query<Position[], void>({
      query: () => '/api/positions/open',
      transformResponse: normalizeOpenPositions,
      providesTags: ['Positions'],
    }),

    /**
     * Get recent trades
     *
     * Fetches the most recent completed trades.
     *
     * @param limit - Number of trades to fetch (default: 10)
     */
    getRecentTrades: builder.query<Trade[], number | void>({
      query: (limit = 10) => ({
        url: '/api/trades/recent',
        params: { limit },
      }),
      transformResponse: normalizeRecentTrades,
      providesTags: ['Trades'],
    }),
  }),
});

export const {
  useGetBalanceQuery,
  useGetPerformanceQuery,
  useGetOpenPositionsQuery,
  useGetRecentTradesQuery,
} = accountApi;
