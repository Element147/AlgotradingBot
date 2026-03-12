import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
      },
    ],
  }),
  useGetBacktestsQuery: () => ({
    data: [
      {
        id: 42,
        strategyId: 'BOLLINGER_BANDS',
        datasetName: 'BTC 1h 2025',
        symbol: 'BTC/USDT',
        timeframe: '1h',
        executionStatus: 'COMPLETED',
        validationStatus: 'PASSED',
        feesBps: 10,
        slippageBps: 3,
        timestamp: '2026-03-10T10:00:00',
        initialBalance: 1000,
        finalBalance: 1080,
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
      errorMessage: null,
    },
  }),
  useUploadBacktestDatasetMutation: () => [vi.fn(), { isLoading: false }],
  useRunBacktestMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./BacktestResults', () => ({
  BacktestResults: ({ details }: { details: { id: number; strategyId: string; datasetName: string; validationStatus: string } }) => (
    <div>
      <div>{`Backtest Details #${details.id}`}</div>
      <div>{`Algorithm: ${details.strategyId}`}</div>
      <div>{`Dataset: ${details.datasetName}`}</div>
      <div>{`Validation: ${details.validationStatus}`}</div>
    </div>
  ),
}));

describe('BacktestPage', { timeout: 15000 }, () => {
  it('renders upload section and run form', () => {
    render(<BacktestPage />);

    expect(screen.getByText('Backtest')).toBeInTheDocument();
    expect(screen.getByText('Dataset Upload')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Run New Backtest' })).toBeInTheDocument();
    expect(screen.getByText('Backtest History')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders details including algorithm and dataset', () => {
    render(<BacktestPage />);

    expect(screen.getByText('Backtest Details #42')).toBeInTheDocument();
    expect(screen.getByText(/Algorithm: BOLLINGER_BANDS/)).toBeInTheDocument();
    expect(screen.getByText(/Dataset: BTC 1h 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Validation: PASSED/)).toBeInTheDocument();
  });
});
