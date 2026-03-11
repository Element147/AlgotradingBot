import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithEnvironment } from '@/services/api';

export interface ExchangeBalanceResponse {
  total: string;
  available: string;
  locked: string;
  assets: Array<{
    symbol: string;
    amount: string;
    valueUSD: string;
  }>;
  lastSync: string;
  exchange?: string;
}

export interface ExchangeOrder {
  id: string | number;
  symbol: string;
  side: string;
  entryPrice: string;
  quantity: string;
  status: string;
}

export interface ExchangeConnectionStatus {
  connected: boolean;
  exchange: string;
  lastSync: string;
  rateLimitUsage: string;
  error?: string;
}

export interface SystemInfo {
  applicationVersion: string;
  lastDeploymentDate: string;
  databaseStatus: string;
  kafkaStatus: string;
}

const asText = (value: unknown, fallback = ''): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;

export const exchangeApi = createApi({
  reducerPath: 'exchangeApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['Exchange', 'System'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getExchangeBalance: builder.query<ExchangeBalanceResponse, void>({
      query: () => ({
        url: '/api/account/balance',
        params: { env: 'live' },
      }),
      transformResponse: (response: ExchangeBalanceResponse) => ({
        ...response,
        exchange: response.exchange ?? 'Live Exchange',
      }),
      providesTags: ['Exchange'],
    }),
    getExchangeOrders: builder.query<ExchangeOrder[], void>({
      query: () => ({
        url: '/api/trades/recent',
        params: { env: 'live', limit: 20 },
      }),
      transformResponse: (response: Array<Record<string, unknown>>) =>
        response.map((item) => ({
          id: asText(item.id),
          symbol: asText(item.symbol),
          side: asText(item.side),
          entryPrice: asText(item.entryPrice),
          quantity: asText(item.quantity ?? item.positionSize),
          status: asText(item.status, 'OPEN'),
        })),
      providesTags: ['Exchange'],
    }),
    testExchangeConnection: builder.mutation<ExchangeConnectionStatus, void>({
      query: () => ({
        url: '/api/system/test-connection',
        method: 'POST',
      }),
      invalidatesTags: ['Exchange'],
    }),
    getExchangeConnectionStatus: builder.query<ExchangeConnectionStatus, void>({
      query: () => '/api/exchange/connection-status',
      providesTags: ['Exchange'],
    }),
    getSystemInfo: builder.query<SystemInfo, void>({
      query: () => '/api/system/info',
      providesTags: ['System'],
    }),
    triggerBackup: builder.mutation<{ path: string; size: string }, void>({
      query: () => ({
        url: '/api/system/backup',
        method: 'POST',
      }),
      invalidatesTags: ['System'],
    }),
  }),
});

export const {
  useGetExchangeBalanceQuery,
  useGetExchangeOrdersQuery,
  useTestExchangeConnectionMutation,
  useGetExchangeConnectionStatusQuery,
  useGetSystemInfoQuery,
  useTriggerBackupMutation,
} = exchangeApi;
