import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithEnvironment } from '@/services/api';

export interface Strategy {
  id: number;
  name: string;
  type: string;
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  symbol: string;
  timeframe: string;
  riskPerTrade: number;
  minPositionSize: number;
  maxPositionSize: number;
  profitLoss: number;
  tradeCount: number;
  currentDrawdown: number;
  paperMode: boolean;
}

export interface UpdateStrategyConfigPayload {
  strategyId: number;
  symbol: string;
  timeframe: string;
  riskPerTrade: number;
  minPositionSize: number;
  maxPositionSize: number;
}

export const strategiesApi = createApi({
  reducerPath: 'strategiesApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['Strategies'],
  endpoints: (builder) => ({
    getStrategies: builder.query<Strategy[], void>({
      query: () => '/api/strategies',
      providesTags: ['Strategies'],
    }),
    startStrategy: builder.mutation<{ strategyId: number; status: string }, number>({
      query: (strategyId) => ({
        url: `/api/strategies/${strategyId}/start`,
        method: 'POST',
      }),
      invalidatesTags: ['Strategies'],
    }),
    stopStrategy: builder.mutation<{ strategyId: number; status: string }, number>({
      query: (strategyId) => ({
        url: `/api/strategies/${strategyId}/stop`,
        method: 'POST',
      }),
      invalidatesTags: ['Strategies'],
    }),
    updateStrategyConfig: builder.mutation<Strategy, UpdateStrategyConfigPayload>({
      query: ({ strategyId, ...body }) => ({
        url: `/api/strategies/${strategyId}/config`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Strategies'],
    }),
  }),
});

export const {
  useGetStrategiesQuery,
  useStartStrategyMutation,
  useStopStrategyMutation,
  useUpdateStrategyConfigMutation,
} = strategiesApi;
