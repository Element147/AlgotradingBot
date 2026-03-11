import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithEnvironment } from '@/services/api';
import type { Position, Trade } from '@/types/domain.types';

/**
 * Balance data structure
 */
export interface BalanceData {
  total: string;
  available: string;
  locked: string;
  assets: Array<{
    symbol: string;
    amount: string;
    valueUSD: string;
  }>;
  lastSync: string;
}

/**
 * Performance metrics structure
 */
export interface PerformanceMetrics {
  totalProfitLoss: string;
  profitLossPercentage: string;
  winRate: string;
  tradeCount: number;
  cashRatio: string;
}

interface RawOpenPosition {
  id: string | number;
  strategyId?: string;
  strategyName?: string;
  symbol: string;
  side?: string;
  entryPrice: string;
  currentPrice?: string;
  quantity?: string;
  positionSize?: string;
  entryTime: string;
  unrealizedPnL: string;
  unrealizedPnLPercentage: string;
  status?: string;
}

interface RawRecentTrade {
  id: string | number;
  strategyId?: string;
  strategyName?: string;
  symbol: string;
  side?: string;
  entryPrice: string;
  exitPrice: string;
  quantity?: string;
  positionSize?: string;
  entryTime: string;
  exitTime: string;
  duration?: string;
  profitLoss: string;
  profitLossPercentage: string;
  fees?: string;
  slippage?: string;
  status?: string;
}

/**
 * Timeframe options for performance queries
 */
export type PerformanceTimeframe = 'today' | 'week' | 'month' | 'all';

const normalizeSide = (side?: string): Position['side'] =>
  side?.toUpperCase() === 'SELL' ? 'SELL' : 'BUY';

const normalizePosition = (position: RawOpenPosition): Position => ({
  id: String(position.id),
  strategyId: position.strategyId ?? 'unknown',
  strategyName: position.strategyName ?? 'N/A',
  symbol: position.symbol,
  side: normalizeSide(position.side),
  entryPrice: position.entryPrice,
  currentPrice: position.currentPrice ?? position.entryPrice,
  quantity: position.quantity ?? position.positionSize ?? '0',
  entryTime: position.entryTime,
  unrealizedPnL: position.unrealizedPnL,
  unrealizedPnLPercentage: position.unrealizedPnLPercentage,
  status: 'OPEN',
});

const normalizeTradeStatus = (status?: string): Trade['status'] =>
  status?.toUpperCase() === 'CANCELLED' ? 'CANCELLED' : 'CLOSED';

const normalizeTrade = (trade: RawRecentTrade): Trade => ({
  id: String(trade.id),
  strategyId: trade.strategyId ?? 'unknown',
  strategyName: trade.strategyName ?? 'N/A',
  symbol: trade.symbol,
  side: normalizeSide(trade.side),
  entryPrice: trade.entryPrice,
  exitPrice: trade.exitPrice,
  quantity: trade.quantity ?? trade.positionSize ?? '0',
  entryTime: trade.entryTime,
  exitTime: trade.exitTime,
  duration: trade.duration ?? 'N/A',
  profitLoss: trade.profitLoss,
  profitLossPercentage: trade.profitLossPercentage,
  fees: trade.fees ?? '0',
  slippage: trade.slippage ?? '0',
  status: normalizeTradeStatus(trade.status),
});

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
      transformResponse: (response: RawOpenPosition[]): Position[] =>
        response.map(normalizePosition),
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
      transformResponse: (response: RawRecentTrade[]): Trade[] =>
        response.map(normalizeTrade),
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
