import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithEnvironment } from '@/services/api';

export interface BacktestAlgorithm {
  id: string;
  label: string;
  description: string;
}

export interface BacktestDataset {
  id: number;
  name: string;
  originalFilename: string;
  rowCount: number;
  symbolsCsv: string;
  dataStart: string;
  dataEnd: string;
  uploadedAt: string;
}

export interface BacktestHistoryItem {
  id: number;
  strategyId: string;
  datasetName: string | null;
  symbol: string;
  timeframe: string;
  executionStatus: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  validationStatus: 'PENDING' | 'PASSED' | 'FAILED' | 'PRODUCTION_READY';
  feesBps: number;
  slippageBps: number;
  timestamp: string;
  initialBalance: number;
  finalBalance: number;
}

export interface BacktestDetails extends BacktestHistoryItem {
  datasetId: number | null;
  sharpeRatio: number;
  profitFactor: number;
  winRate: number;
  maxDrawdown: number;
  totalTrades: number;
  startDate: string;
  endDate: string;
  errorMessage: string | null;
}

export interface RunBacktestPayload {
  algorithmType: string;
  datasetId: number;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  feesBps: number;
  slippageBps: number;
}

export const backtestApi = createApi({
  reducerPath: 'backtestApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['Backtests', 'BacktestDatasets'],
  endpoints: (builder) => ({
    getBacktests: builder.query<BacktestHistoryItem[], void>({
      query: () => '/api/backtests?limit=20',
      providesTags: ['Backtests'],
    }),
    getBacktestDetails: builder.query<BacktestDetails, number>({
      query: (id) => `/api/backtests/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Backtests', id }],
    }),
    getBacktestAlgorithms: builder.query<BacktestAlgorithm[], void>({
      query: () => '/api/backtests/algorithms',
    }),
    getBacktestDatasets: builder.query<BacktestDataset[], void>({
      query: () => '/api/backtests/datasets',
      providesTags: ['BacktestDatasets'],
    }),
    uploadBacktestDataset: builder.mutation<BacktestDataset, { file: File; name?: string }>({
      query: ({ file, name }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (name?.trim()) {
          formData.append('name', name.trim());
        }

        return {
          url: '/api/backtests/datasets/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['BacktestDatasets'],
    }),
    runBacktest: builder.mutation<{ id: number; status: string }, RunBacktestPayload>({
      query: (body) => ({
        url: '/api/backtests/run',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Backtests'],
    }),
  }),
});

export const {
  useGetBacktestsQuery,
  useGetBacktestDetailsQuery,
  useGetBacktestAlgorithmsQuery,
  useGetBacktestDatasetsQuery,
  useUploadBacktestDatasetMutation,
  useRunBacktestMutation,
} = backtestApi;
