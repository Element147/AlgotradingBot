import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BacktestResults } from './BacktestResults';

vi.mock('@/components/charts/EquityCurve', () => ({
  EquityCurve: () => <div>equity curve</div>,
}));

vi.mock('@/components/charts/DrawdownChart', () => ({
  DrawdownChart: () => <div>drawdown chart</div>,
}));

vi.mock('./MonthlyReturnsHeatmap', () => ({
  MonthlyReturnsHeatmap: () => <div>monthly returns</div>,
}));

vi.mock('./TradeDistributionHistogram', () => ({
  TradeDistributionHistogram: () => <div>trade distribution</div>,
}));

const baseDetails = {
  id: 42,
  strategyId: 'BOLLINGER_BANDS',
  datasetId: 7,
  datasetName: 'BTC 1h 2025',
  experimentName: 'BTC Mean Reversion Retest',
  experimentKey: 'btc-mean-reversion-retest',
  datasetChecksumSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  datasetSchemaVersion: 'ohlcv-v1',
  datasetUploadedAt: '2026-03-10T10:00:00',
  datasetArchived: false,
  symbol: 'BTC/USDT',
  timeframe: '1h',
  executionStatus: 'COMPLETED' as const,
  validationStatus: 'PASSED' as const,
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
  executionStage: 'COMPLETED' as const,
  progressPercent: 100,
  processedCandles: 8760,
  totalCandles: 8760,
  currentDataTimestamp: '2025-12-31T00:00:00',
  statusMessage: 'Backtest completed. Metrics and trade series are ready to review.',
  lastProgressAt: '2026-03-10T10:00:00',
  startedAt: '2026-03-10T09:58:00',
  completedAt: '2026-03-10T10:00:00',
  errorMessage: null,
  equityCurve: [
    { timestamp: '2025-01-01T00:00:00', equity: 1000, drawdownPct: 0 },
    { timestamp: '2025-01-02T00:00:00', equity: 1080, drawdownPct: 0 },
  ],
  tradeSeries: [
    {
      symbol: 'BTC/USDT',
      side: 'LONG' as const,
      entryTime: '2025-01-01T00:00:00',
      exitTime: '2025-01-02T00:00:00',
      entryPrice: 100,
      exitPrice: 108,
      quantity: 9.5,
      entryValue: 950,
      exitValue: 1026,
      returnPct: 8,
    },
  ],
};

describe('BacktestResults', () => {
  it('blocks export when dataset provenance is incomplete', { timeout: 15000 }, () => {
    render(
      <BacktestResults
        details={{
          ...baseDetails,
          datasetChecksumSha256: null,
        }}
      />
    );

    expect(screen.getByText(/missing full dataset provenance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export PDF/i })).toBeDisabled();
  });
});
