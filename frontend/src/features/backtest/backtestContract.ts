import { z } from 'zod';

import type {
  BacktestAlgorithm,
  BacktestComparisonResponse,
  BacktestDataset,
  BacktestDatasetRetentionReport,
  BacktestDetails,
  BacktestExperimentSummary,
  BacktestHistoryItem,
  BacktestSummary,
  BacktestRunSubmission,
  RunBacktestPayload,
} from './backtestTypes';

import type { components } from '@/generated/openapi';

type RawBacktestAlgorithm = components['schemas']['BacktestAlgorithmResponse'];
type RawBacktestComparisonResponse = components['schemas']['BacktestComparisonResponse'];
type RawBacktestDataset = components['schemas']['BacktestDatasetResponse'];
type RawBacktestDatasetRetentionReport =
  components['schemas']['BacktestDatasetRetentionReportResponse'];
type RawBacktestDetails = components['schemas']['BacktestDetailsResponse'] & {
  telemetry?: RawBacktestSymbolTelemetry[];
};
type RawBacktestExperimentSummary = components['schemas']['BacktestExperimentSummaryResponse'];
type RawBacktestHistoryItem = components['schemas']['BacktestHistoryItemResponse'];
type RawBacktestSummary = components['schemas']['BacktestSummaryResponse'];
type RawBacktestRunRequest = components['schemas']['RunBacktestRequest'];
type RawBacktestRunSubmission = components['schemas']['BacktestRunResponse'];
type RawBacktestSymbolTelemetry = {
  symbol: string;
  points: RawBacktestTelemetryPoint[];
  actions: RawBacktestActionMarker[];
  indicators: RawBacktestIndicatorSeries[];
};
type RawBacktestTelemetryPoint = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  exposurePct: number;
  regime: 'WARMUP' | 'RANGE' | 'TREND_UP' | 'TREND_DOWN';
};
type RawBacktestActionMarker = {
  timestamp: string;
  action: 'BUY' | 'SELL' | 'SHORT' | 'COVER';
  price: number;
  label: string;
};
type RawBacktestIndicatorSeries = {
  key: string;
  label: string;
  pane: 'PRICE' | 'OSCILLATOR';
  points: RawBacktestIndicatorPoint[];
};
type RawBacktestIndicatorPoint = {
  timestamp: string;
  value: number | null;
};

const selectionModeSchema = z.enum(['SINGLE_SYMBOL', 'DATASET_UNIVERSE']);
const executionStatusSchema = z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']);
const validationStatusSchema = z.enum(['PENDING', 'PASSED', 'FAILED', 'PRODUCTION_READY']);
const executionStageSchema = z.enum([
  'QUEUED',
  'VALIDATING_REQUEST',
  'LOADING_DATASET',
  'FILTERING_CANDLES',
  'SIMULATING',
  'PERSISTING_RESULTS',
  'COMPLETED',
  'FAILED',
]);
const retentionStatusSchema = z.enum([
  'ACTIVE',
  'ACTIVE_DUPLICATE_RETAINED',
  'ACTIVE_STALE_RETAINED',
  'ARCHIVE_CANDIDATE_DUPLICATE',
  'ARCHIVE_CANDIDATE_UNUSED',
  'ARCHIVED',
]);
const tradeSideSchema = z.enum(['LONG', 'SHORT']);
const actionTypeSchema = z.enum(['BUY', 'SELL', 'SHORT', 'COVER']);
const indicatorPaneSchema = z.enum(['PRICE', 'OSCILLATOR']);
const regimeSchema = z.enum(['WARMUP', 'RANGE', 'TREND_UP', 'TREND_DOWN']);

const backtestAlgorithmSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  selectionMode: selectionModeSchema,
});

const backtestDatasetSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  originalFilename: z.string().min(1),
  rowCount: z.number().int(),
  symbolsCsv: z.string(),
  dataStart: z.string().min(1),
  dataEnd: z.string().min(1),
  uploadedAt: z.string().min(1),
  checksumSha256: z.string().min(1),
  schemaVersion: z.string().min(1),
  archived: z.boolean(),
  archivedAt: z.string().nullable(),
  archiveReason: z.string().nullable(),
  usageCount: z.number().int(),
  lastUsedAt: z.string().nullable(),
  usedByBacktests: z.boolean(),
  duplicateCount: z.number().int(),
  retentionStatus: retentionStatusSchema,
});

const backtestDatasetRetentionReportSchema = z.object({
  totalDatasets: z.number().int(),
  activeDatasets: z.number().int(),
  archivedDatasets: z.number().int(),
  archiveCandidateDatasets: z.number().int(),
  duplicateDatasetCount: z.number().int(),
  referencedDatasetCount: z.number().int(),
  oldestActiveUploadedAt: z.string().nullable(),
  newestUploadedAt: z.string().nullable(),
});

const backtestHistoryItemSchema = z.object({
  id: z.number().int(),
  strategyId: z.string().min(1),
  datasetName: z.string().nullable(),
  experimentName: z.string().min(1),
  symbol: z.string().min(1),
  timeframe: z.string().min(1),
  executionStatus: executionStatusSchema,
  validationStatus: validationStatusSchema,
  feesBps: z.number().int(),
  slippageBps: z.number().int(),
  timestamp: z.string().min(1),
  initialBalance: z.number(),
  finalBalance: z.number(),
  executionStage: executionStageSchema,
  progressPercent: z.number().int(),
  processedCandles: z.number().int(),
  totalCandles: z.number().int(),
  currentDataTimestamp: z.string().nullable(),
  statusMessage: z.string().nullable(),
  lastProgressAt: z.string().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

const backtestEquityPointSchema = z.object({
  timestamp: z.string().min(1),
  equity: z.number(),
  drawdownPct: z.number(),
});

const backtestTradeSeriesItemSchema = z.object({
  symbol: z.string().min(1),
  side: tradeSideSchema,
  entryTime: z.string().min(1),
  exitTime: z.string().min(1),
  entryPrice: z.number(),
  exitPrice: z.number(),
  quantity: z.number(),
  entryValue: z.number(),
  exitValue: z.number(),
  returnPct: z.number(),
});

const backtestTelemetryPointSchema = z.object({
  timestamp: z.string().min(1),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  exposurePct: z.number(),
  regime: regimeSchema,
});

const backtestActionMarkerSchema = z.object({
  timestamp: z.string().min(1),
  action: actionTypeSchema,
  price: z.number(),
  label: z.string().min(1),
});

const backtestIndicatorPointSchema = z.object({
  timestamp: z.string().min(1),
  value: z.number().nullable(),
});

const backtestIndicatorSeriesSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  pane: indicatorPaneSchema,
  points: z.array(backtestIndicatorPointSchema),
});

const backtestSymbolTelemetrySchema = z.object({
  symbol: z.string().min(1),
  points: z.array(backtestTelemetryPointSchema),
  actions: z.array(backtestActionMarkerSchema),
  indicators: z.array(backtestIndicatorSeriesSchema),
});

const backtestDetailsSchema = backtestHistoryItemSchema.extend({
  datasetId: z.number().int().nullable(),
  experimentKey: z.string().min(1),
  datasetChecksumSha256: z.string().nullable(),
  datasetSchemaVersion: z.string().nullable(),
  datasetUploadedAt: z.string().nullable(),
  datasetArchived: z.boolean().nullable(),
  sharpeRatio: z.number(),
  profitFactor: z.number(),
  winRate: z.number(),
  maxDrawdown: z.number(),
  totalTrades: z.number().int(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  errorMessage: z.string().nullable(),
  equityCurve: z.array(backtestEquityPointSchema),
  tradeSeries: z.array(backtestTradeSeriesItemSchema),
  telemetry: z.array(backtestSymbolTelemetrySchema).default([]),
});

const backtestSummarySchema = backtestHistoryItemSchema.extend({
  datasetId: z.number().int().nullable(),
  experimentKey: z.string().min(1),
  datasetChecksumSha256: z.string().nullable(),
  datasetSchemaVersion: z.string().nullable(),
  datasetUploadedAt: z.string().nullable(),
  datasetArchived: z.boolean().nullable(),
  sharpeRatio: z.number(),
  profitFactor: z.number(),
  winRate: z.number(),
  maxDrawdown: z.number(),
  totalTrades: z.number().int(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  errorMessage: z.string().nullable(),
});

const backtestComparisonItemSchema = z.object({
  id: z.number().int(),
  strategyId: z.string().min(1),
  datasetName: z.string().nullable(),
  datasetChecksumSha256: z.string().nullable(),
  datasetSchemaVersion: z.string().nullable(),
  datasetUploadedAt: z.string().nullable(),
  datasetArchived: z.boolean().nullable(),
  symbol: z.string().min(1),
  timeframe: z.string().min(1),
  executionStatus: executionStatusSchema,
  validationStatus: validationStatusSchema,
  feesBps: z.number().int(),
  slippageBps: z.number().int(),
  timestamp: z.string().min(1),
  initialBalance: z.number(),
  finalBalance: z.number(),
  totalReturnPercent: z.number(),
  sharpeRatio: z.number(),
  profitFactor: z.number(),
  winRate: z.number(),
  maxDrawdown: z.number(),
  totalTrades: z.number().int(),
  finalBalanceDelta: z.number(),
  totalReturnDeltaPercent: z.number(),
});

const backtestComparisonResponseSchema = z.object({
  baselineBacktestId: z.number().int(),
  items: z.array(backtestComparisonItemSchema),
});

const backtestExperimentSummarySchema = z.object({
  experimentKey: z.string().min(1),
  experimentName: z.string().min(1),
  latestBacktestId: z.number().int(),
  strategyId: z.string().min(1),
  datasetName: z.string().nullable(),
  symbol: z.string().min(1),
  timeframe: z.string().min(1),
  latestExecutionStatus: executionStatusSchema,
  latestValidationStatus: validationStatusSchema,
  runCount: z.number().int(),
  latestRunAt: z.string().min(1),
  averageReturnPercent: z.number(),
  bestFinalBalance: z.number(),
  worstMaxDrawdown: z.number(),
});

const backtestRunSubmissionSchema = z.object({
  id: z.number().int(),
  status: executionStatusSchema,
  submittedAt: z.string().min(1),
});

export const normalizeBacktestAlgorithms = (
  response: RawBacktestAlgorithm[]
): BacktestAlgorithm[] => z.array(backtestAlgorithmSchema).parse(response);

export const normalizeBacktestDatasets = (response: RawBacktestDataset[]): BacktestDataset[] =>
  z.array(backtestDatasetSchema).parse(response);

export const normalizeBacktestDataset = (response: RawBacktestDataset): BacktestDataset =>
  backtestDatasetSchema.parse(response);

export const normalizeBacktestDatasetRetentionReport = (
  response: RawBacktestDatasetRetentionReport
): BacktestDatasetRetentionReport => backtestDatasetRetentionReportSchema.parse(response);

export const normalizeBacktestHistory = (
  response: RawBacktestHistoryItem[]
): BacktestHistoryItem[] => z.array(backtestHistoryItemSchema).parse(response);

export const normalizeBacktestDetails = (response: RawBacktestDetails): BacktestDetails =>
  backtestDetailsSchema.parse(response);

export const normalizeBacktestSummary = (response: RawBacktestSummary): BacktestSummary =>
  backtestSummarySchema.parse(response);

export const normalizeBacktestExperimentSummaries = (
  response: RawBacktestExperimentSummary[]
): BacktestExperimentSummary[] => z.array(backtestExperimentSummarySchema).parse(response);

export const normalizeBacktestComparisonResponse = (
  response: RawBacktestComparisonResponse
): BacktestComparisonResponse => backtestComparisonResponseSchema.parse(response);

export const normalizeBacktestRunSubmission = (
  response: RawBacktestRunSubmission
): BacktestRunSubmission => backtestRunSubmissionSchema.parse(response);

export const toRunBacktestRequest = (payload: RunBacktestPayload): RawBacktestRunRequest => {
  const request: RawBacktestRunRequest = {
    algorithmType: payload.algorithmType,
    datasetId: payload.datasetId,
    timeframe: payload.timeframe,
    startDate: payload.startDate,
    endDate: payload.endDate,
    initialBalance: payload.initialBalance,
    feesBps: payload.feesBps,
    slippageBps: payload.slippageBps,
  };

  const experimentName = payload.experimentName?.trim();
  if (experimentName) {
    request.experimentName = experimentName;
  }

  const symbol = payload.symbol?.trim();
  if (symbol) {
    request.symbol = symbol;
  }

  return request;
};
