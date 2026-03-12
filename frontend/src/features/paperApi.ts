import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithEnvironment } from '@/services/api';

export interface PaperTradingState {
  paperMode: boolean;
  cashBalance: number;
  positionCount: number;
  totalOrders: number;
  openOrders: number;
  filledOrders: number;
  cancelledOrders: number;
  lastOrderAt: string | null;
  lastPositionUpdateAt: string | null;
  staleOpenOrderCount: number;
  stalePositionCount: number;
  recoveryStatus: 'HEALTHY' | 'IDLE' | 'ATTENTION';
  recoveryMessage: string;
  incidentSummary: string;
  alerts: Array<{
    severity: 'INFO' | 'WARNING';
    code: string;
    summary: string;
    recommendedAction: string;
  }>;
}

export const paperApi = createApi({
  reducerPath: 'paperApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['PaperTrading'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getPaperTradingState: builder.query<PaperTradingState, void>({
      query: () => '/api/paper/state',
      providesTags: ['PaperTrading'],
    }),
  }),
});

export const { useGetPaperTradingStateQuery } = paperApi;
