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
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchId?: number;
}

export interface TradeHistoryResult {
  items: TradeHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

interface TradeHistoryPagedResponse {
  items?: TradeHistoryItem[];
  content?: TradeHistoryItem[];
  total?: number;
  totalElements?: number;
  page?: number;
  number?: number;
  pageSize?: number;
  size?: number;
}

const normalizeTradeHistory = (
  response: TradeHistoryItem[] | TradeHistoryPagedResponse,
  fallback: { page: number; pageSize: number }
): TradeHistoryResult => {
  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length,
      page: fallback.page,
      pageSize: fallback.pageSize,
    };
  }

  const items = response.items ?? response.content ?? [];
  return {
    items,
    total: response.total ?? response.totalElements ?? items.length,
    page: response.page ?? response.number ?? fallback.page,
    pageSize: response.pageSize ?? response.size ?? fallback.pageSize,
  };
};

export const tradesApi = createApi({
  reducerPath: 'tradesApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['TradeHistory'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getTradeHistory: builder.query<TradeHistoryResult, TradeHistoryQuery | void>({
      query: (params) => ({
        url: '/api/trades/history',
        params: params ?? undefined,
      }),
      transformResponse: (
        response: TradeHistoryItem[] | TradeHistoryPagedResponse,
        _meta,
        arg
      ) =>
        normalizeTradeHistory(response, {
          page: arg?.page ?? 1,
          pageSize: arg?.pageSize ?? arg?.limit ?? 50,
        }),
      providesTags: ['TradeHistory'],
    }),
    getTradeDetails: builder.query<TradeHistoryItem | null, { id: number; accountId?: number }>({
      query: ({ accountId }) => ({
        url: '/api/trades/history',
        params: {
          ...(accountId ? { accountId } : {}),
          limit: 1000,
        },
      }),
      transformResponse: (
        response: TradeHistoryItem[] | TradeHistoryPagedResponse,
        _meta,
        arg
      ) => {
        const {items} = normalizeTradeHistory(response, { page: 1, pageSize: 1000 });
        return items.find((trade) => trade.id === arg.id) ?? null;
      },
      providesTags: (_result, _error, arg) => [{ type: 'TradeHistory', id: arg.id }],
    }),
  }),
});

export const { useGetTradeHistoryQuery, useGetTradeDetailsQuery } = tradesApi;
