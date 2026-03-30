import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import environmentReducer from '../environment/environmentSlice';
import websocketReducer from '../websocket/websocketSlice';

import BacktestPage from './BacktestPage';

vi.mock('./backtestApi', () => ({
  useGetBacktestAlgorithmsQuery: () => ({
    data: [
      { id: 'BOLLINGER_BANDS', label: 'Bollinger Bands', description: '...', selectionMode: 'SINGLE_SYMBOL' },
      { id: 'SMA_CROSSOVER', label: 'SMA Crossover', description: '...', selectionMode: 'SINGLE_SYMBOL' },
    ],
  }),
  useGetBacktestDatasetsQuery: () => ({
    data: [
      {
        id: 7,
        name: 'BTC 1h 2025',
        originalFilename: 'btc.csv',
        rowCount: 100,
        symbolsCsv: 'BTC/USDT',
        dataStart: '2025-01-01T00:00:00',
        dataEnd: '2025-01-05T00:00:00',
        uploadedAt: '2026-03-10T10:00:00',
        checksumSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        schemaVersion: 'ohlcv-v1',
        archived: false,
        archivedAt: null,
        archiveReason: null,
        usageCount: 1,
        lastUsedAt: '2026-03-10T10:00:00',
        usedByBacktests: true,
        duplicateCount: 1,
        retentionStatus: 'ACTIVE',
      },
    ],
  }),
  useGetBacktestDatasetRetentionReportQuery: () => ({
    data: {
      totalDatasets: 1,
      activeDatasets: 1,
      archivedDatasets: 0,
      archiveCandidateDatasets: 0,
      duplicateDatasetCount: 0,
      referencedDatasetCount: 1,
      oldestActiveUploadedAt: '2026-03-10T10:00:00',
      newestUploadedAt: '2026-03-10T10:00:00',
    },
  }),
  useGetBacktestExperimentSummariesQuery: () => ({
    data: [
      {
        experimentKey: 'btc-mean-reversion-retest',
        experimentName: 'BTC Mean Reversion Retest',
        latestBacktestId: 42,
        strategyId: 'BOLLINGER_BANDS',
        datasetName: 'BTC 1h 2025',
        symbol: 'BTC/USDT',
        timeframe: '1h',
        latestExecutionStatus: 'COMPLETED',
        latestValidationStatus: 'PASSED',
        runCount: 3,
        latestRunAt: '2026-03-10T10:00:00',
        averageReturnPercent: 6.5,
        bestFinalBalance: 1120,
        worstMaxDrawdown: 18,
      },
    ],
  }),
  useGetBacktestsQuery: () => ({
    data: [
      {
        id: 42,
        strategyId: 'BOLLINGER_BANDS',
        datasetName: 'BTC 1h 2025',
        experimentName: 'BTC Mean Reversion Retest',
        symbol: 'BTC/USDT',
        timeframe: '1h',
        executionStatus: 'COMPLETED',
        validationStatus: 'PASSED',
        feesBps: 10,
        slippageBps: 3,
        timestamp: '2026-03-10T10:00:00',
        initialBalance: 1000,
        finalBalance: 1080,
        executionStage: 'COMPLETED',
        progressPercent: 100,
        processedCandles: 8760,
        totalCandles: 8760,
        currentDataTimestamp: '2025-12-31T00:00:00',
        statusMessage: 'Backtest completed. Metrics and trade series are ready to review.',
        lastProgressAt: '2026-03-10T10:00:00',
        startedAt: '2026-03-10T09:58:00',
        completedAt: '2026-03-10T10:00:00',
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useGetBacktestDetailsQuery: () => ({
    data: {
      id: 42,
      strategyId: 'BOLLINGER_BANDS',
      datasetId: 7,
      datasetName: 'BTC 1h 2025',
      experimentName: 'BTC Mean Reversion Retest',
      experimentKey: 'btc-mean-reversion-retest',
      symbol: 'BTC/USDT',
      timeframe: '1h',
      executionStatus: 'COMPLETED',
      validationStatus: 'PASSED',
      feesBps: 10,
      slippageBps: 3,
      timestamp: '2026-03-10T10:00:00',
      initialBalance: 1000,
      finalBalance: 1080,
      sharpeRatio: 1.2,
      profitFactor: 1.6,
      winRate: 52,
      maxDrawdown: 18,
      totalTrades: 80,
      startDate: '2025-01-01T00:00:00',
      endDate: '2025-12-31T00:00:00',
      executionStage: 'COMPLETED',
      progressPercent: 100,
      processedCandles: 8760,
      totalCandles: 8760,
      currentDataTimestamp: '2025-12-31T00:00:00',
      statusMessage: 'Backtest completed. Metrics and trade series are ready to review.',
      lastProgressAt: '2026-03-10T10:00:00',
      startedAt: '2026-03-10T09:58:00',
      completedAt: '2026-03-10T10:00:00',
      errorMessage: null,
      availableTelemetrySymbols: ['BTC/USDT'],
    },
    refetch: vi.fn(),
  }),
  useGetBacktestSummaryQuery: () => ({
    data: undefined,
  }),
  useUploadBacktestDatasetMutation: () => [vi.fn(), { isLoading: false }],
  useArchiveBacktestDatasetMutation: () => [vi.fn(), { isLoading: false }],
  useRestoreBacktestDatasetMutation: () => [vi.fn(), { isLoading: false }],
  useRunBacktestMutation: () => [vi.fn(), { isLoading: false }],
  useReplayBacktestMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteBacktestMutation: () => [vi.fn(), { isLoading: false }],
  useLazyCompareBacktestsQuery: () => [vi.fn(), { data: undefined, isFetching: false, error: undefined }],
}));

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./BacktestResults', () => ({
  BacktestResults: ({
    details,
  }: {
    details: {
      id: number;
      experimentName: string;
      strategyId: string;
      datasetName: string;
      validationStatus: string;
    };
  }) => (
    <div>
      <div>{`Backtest Details #${details.id}`}</div>
      <div>{`Experiment: ${details.experimentName}`}</div>
      <div>{`Algorithm: ${details.strategyId}`}</div>
      <div>{`Dataset: ${details.datasetName}`}</div>
      <div>{`Validation: ${details.validationStatus}`}</div>
    </div>
  ),
}));

vi.mock('./BacktestComparisonPanel', () => ({
  BacktestComparisonPanel: () => <div>comparison panel</div>,
}));

vi.mock('@/services/axiosClient', () => ({
  default: {
    get: vi.fn(),
  },
  getErrorMessage: () => 'error',
}));

describe('BacktestPage', { timeout: 15000 }, () => {
  const renderPage = () => {
    const store = configureStore({
      reducer: {
        environment: environmentReducer,
        websocket: websocketReducer,
      },
      preloadedState: {
        environment: {
          mode: 'test',
          connectedExchange: null,
          lastSyncTime: null,
        },
        websocket: {
          connected: true,
          connecting: false,
          error: null,
          lastReconnectAttempt: null,
          reconnectAttempts: 0,
          subscribedChannels: ['test.backtests'],
          lastEventTime: '2026-03-10T10:00:00',
          lastEventByType: {
            'backtest.progress': '2026-03-10T10:00:00',
          },
        },
      },
    });

    return render(
      <MemoryRouter>
        <Provider store={store}>
          <BacktestPage />
        </Provider>
      </MemoryRouter>
    );
  };

  it('renders upload section and run form', () => {
    renderPage();

    expect(screen.getByText('Research-only workflow')).toBeInTheDocument();
    expect(screen.getByText(/Backtest transport: live WebSocket stream connected/i)).toBeInTheDocument();
    expect(screen.getByText('Dataset Upload')).toBeInTheDocument();
    expect(screen.getByText('Dataset Inventory')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Run New Backtest' })).toBeInTheDocument();
    expect(screen.getByText('Experiment Summaries')).toBeInTheDocument();
    expect(screen.getAllByText('BTC Mean Reversion Retest').length).toBeGreaterThan(0);
    expect(screen.getByRole('tab', { name: 'History and comparison' })).toBeInTheDocument();
    expect(screen.queryByText('Backtest History')).not.toBeInTheDocument();
  });

  it('opens history and comparison on demand', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('tab', { name: 'History and comparison' }));

    expect(screen.getByText('Backtest History')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compare Selected/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders details including algorithm and dataset', () => {
    renderPage();

    expect(screen.getByText('Backtest Details #42')).toBeInTheDocument();
    expect(screen.getByText(/Experiment: BTC Mean Reversion Retest/)).toBeInTheDocument();
    expect(screen.getByText(/Dataset: BTC 1h 2025/)).toBeInTheDocument();
    expect(screen.getAllByText(/Validation: PASSED/).length).toBeGreaterThan(0);
  });
});
