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
  configVersion: number;
  lastConfigChangedAt: string | null;
}

export interface StrategyConfigHistoryEntry {
  id: number;
  versionNumber: number;
  changeReason: string;
  symbol: string;
  timeframe: string;
  riskPerTrade: number;
  minPositionSize: number;
  maxPositionSize: number;
  status: string;
  paperMode: boolean;
  changedAt: string;
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
  keepUnusedDataFor: 300,
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
      async onQueryStarted(strategyId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          strategiesApi.util.updateQueryData('getStrategies', undefined, (draft) => {
            const match = draft.find((strategy) => strategy.id === strategyId);
            if (match) {
              match.status = 'RUNNING';
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Strategies'],
    }),
    stopStrategy: builder.mutation<{ strategyId: number; status: string }, number>({
      query: (strategyId) => ({
        url: `/api/strategies/${strategyId}/stop`,
        method: 'POST',
      }),
      async onQueryStarted(strategyId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          strategiesApi.util.updateQueryData('getStrategies', undefined, (draft) => {
            const match = draft.find((strategy) => strategy.id === strategyId);
            if (match) {
              match.status = 'STOPPED';
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
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
    getStrategyConfigHistory: builder.query<StrategyConfigHistoryEntry[], number>({
      query: (strategyId) => `/api/strategies/${strategyId}/config-history`,
    }),
  }),
});

export const {
  useGetStrategiesQuery,
  useStartStrategyMutation,
  useStopStrategyMutation,
  useUpdateStrategyConfigMutation,
  useGetStrategyConfigHistoryQuery,
} = strategiesApi;
