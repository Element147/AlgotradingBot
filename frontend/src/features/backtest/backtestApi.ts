import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithEnvironment } from '@/services/api';

export interface BacktestAlgorithm {
  id: string;
  label: string;
  description: string;
  selectionMode: 'SINGLE_SYMBOL' | 'DATASET_UNIVERSE';
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
  checksumSha256: string;
  schemaVersion: string;
  archived: boolean;
  archivedAt: string | null;
  archiveReason: string | null;
  usageCount: number;
  lastUsedAt: string | null;
  usedByBacktests: boolean;
  duplicateCount: number;
  retentionStatus:
    | 'ACTIVE'
    | 'ACTIVE_DUPLICATE_RETAINED'
    | 'ACTIVE_STALE_RETAINED'
    | 'ARCHIVE_CANDIDATE_DUPLICATE'
    | 'ARCHIVE_CANDIDATE_UNUSED'
    | 'ARCHIVED';
}

export interface BacktestDatasetRetentionReport {
  totalDatasets: number;
  activeDatasets: number;
  archivedDatasets: number;
  archiveCandidateDatasets: number;
  duplicateDatasetCount: number;
  referencedDatasetCount: number;
  oldestActiveUploadedAt: string | null;
  newestUploadedAt: string | null;
}

export interface BacktestHistoryItem {
  id: number;
  strategyId: string;
  datasetName: string | null;
  experimentName: string;
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
  experimentKey: string;
  datasetChecksumSha256: string | null;
  datasetSchemaVersion: string | null;
  datasetUploadedAt: string | null;
  datasetArchived: boolean | null;
  sharpeRatio: number;
  profitFactor: number;
  winRate: number;
  maxDrawdown: number;
  totalTrades: number;
  startDate: string;
  endDate: string;
  errorMessage: string | null;
  equityCurve: Array<{
    timestamp: string;
    equity: number;
    drawdownPct: number;
  }>;
  tradeSeries: Array<{
    symbol: string;
    entryTime: string;
    exitTime: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    entryValue: number;
    exitValue: number;
    returnPct: number;
  }>;
}

export interface BacktestComparisonItem {
  id: number;
  strategyId: string;
  datasetName: string | null;
  datasetChecksumSha256: string | null;
  datasetSchemaVersion: string | null;
  datasetUploadedAt: string | null;
  datasetArchived: boolean | null;
  symbol: string;
  timeframe: string;
  executionStatus: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  validationStatus: 'PENDING' | 'PASSED' | 'FAILED' | 'PRODUCTION_READY';
  feesBps: number;
  slippageBps: number;
  timestamp: string;
  initialBalance: number;
  finalBalance: number;
  totalReturnPercent: number;
  sharpeRatio: number;
  profitFactor: number;
  winRate: number;
  maxDrawdown: number;
  totalTrades: number;
  finalBalanceDelta: number;
  totalReturnDeltaPercent: number;
}

export interface BacktestComparisonResponse {
  baselineBacktestId: number;
  items: BacktestComparisonItem[];
}

export interface BacktestExperimentSummary {
  experimentKey: string;
  experimentName: string;
  latestBacktestId: number;
  strategyId: string;
  datasetName: string | null;
  symbol: string;
  timeframe: string;
  latestExecutionStatus: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  latestValidationStatus: 'PENDING' | 'PASSED' | 'FAILED' | 'PRODUCTION_READY';
  runCount: number;
  latestRunAt: string;
  averageReturnPercent: number;
  bestFinalBalance: number;
  worstMaxDrawdown: number;
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
  experimentName?: string;
}

export const backtestApi = createApi({
  reducerPath: 'backtestApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['Backtests', 'BacktestDatasets'],
  keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getBacktests: builder.query<BacktestHistoryItem[], void>({
      query: () => '/api/backtests?limit=20',
      providesTags: ['Backtests'],
    }),
    getBacktestExperimentSummaries: builder.query<BacktestExperimentSummary[], void>({
      query: () => '/api/backtests/experiments',
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
    getBacktestDatasetRetentionReport: builder.query<BacktestDatasetRetentionReport, void>({
      query: () => '/api/backtests/datasets/retention-report',
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
    archiveBacktestDataset: builder.mutation<
      BacktestDataset,
      { datasetId: number; reason?: string }
    >({
      query: ({ datasetId, reason }) => ({
        url: `/api/backtests/datasets/${datasetId}/archive`,
        method: 'POST',
        body: reason?.trim() ? { reason: reason.trim() } : {},
      }),
      invalidatesTags: ['BacktestDatasets'],
    }),
    restoreBacktestDataset: builder.mutation<BacktestDataset, number>({
      query: (datasetId) => ({
        url: `/api/backtests/datasets/${datasetId}/restore`,
        method: 'POST',
      }),
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
    replayBacktest: builder.mutation<{ id: number; status: string; timestamp: string }, number>({
      query: (backtestId) => ({
        url: `/api/backtests/${backtestId}/replay`,
        method: 'POST',
      }),
      invalidatesTags: ['Backtests'],
    }),
    compareBacktests: builder.query<BacktestComparisonResponse, number[]>({
      query: (ids) => {
        const params = ids.map((id) => `ids=${encodeURIComponent(String(id))}`).join('&');
        return `/api/backtests/compare?${params}`;
      },
    }),
  }),
});

export const {
  useGetBacktestsQuery,
  useGetBacktestExperimentSummariesQuery,
  useGetBacktestDetailsQuery,
  useGetBacktestAlgorithmsQuery,
  useGetBacktestDatasetsQuery,
  useGetBacktestDatasetRetentionReportQuery,
  useUploadBacktestDatasetMutation,
  useArchiveBacktestDatasetMutation,
  useRestoreBacktestDatasetMutation,
  useRunBacktestMutation,
  useReplayBacktestMutation,
  useCompareBacktestsQuery,
  useLazyCompareBacktestsQuery,
} = backtestApi;
