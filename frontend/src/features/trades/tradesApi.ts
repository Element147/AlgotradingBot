import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithEnvironment } from '@/services/api';

export interface TradeHistoryItem {
  id: number;
  pair: string;
  entryTime: string;
  entryPrice: number;
  exitTime: string | null;
  exitPrice: number | null;
  signal: 'BUY' | 'SELL';
  positionSize: number;
  riskAmount: number;
  pnl: number;
  feesActual: number;
  slippageActual: number;
  stopLoss: number | null;
  takeProfit: number | null;
}

export interface TradeHistoryQuery {
  accountId?: number;
  symbol?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const tradesApi = createApi({
  reducerPath: 'tradesApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['TradeHistory'],
  endpoints: (builder) => ({
    getTradeHistory: builder.query<TradeHistoryItem[], TradeHistoryQuery | void>({
      query: (params) => ({
        url: '/api/trades/history',
        params: params ?? undefined,
      }),
      providesTags: ['TradeHistory'],
    }),
  }),
});

export const { useGetTradeHistoryQuery } = tradesApi;
