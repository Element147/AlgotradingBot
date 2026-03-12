import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BacktestComparisonPanel } from './BacktestComparisonPanel';

describe('BacktestComparisonPanel', () => {
  it('blocks comparison export when provenance is incomplete', () => {
    render(
      <BacktestComparisonPanel
        comparison={{
          baselineBacktestId: 42,
          items: [
            {
              id: 42,
              strategyId: 'BOLLINGER_BANDS',
              datasetName: 'BTC 1h 2025',
              datasetChecksumSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              datasetSchemaVersion: 'ohlcv-v1',
              datasetUploadedAt: null,
              datasetArchived: false,
              symbol: 'BTC/USDT',
              timeframe: '1h',
              executionStatus: 'COMPLETED',
              validationStatus: 'PASSED',
              feesBps: 10,
              slippageBps: 3,
              timestamp: '2026-03-10T10:00:00',
              initialBalance: 1000,
              finalBalance: 1080,
              totalReturnPercent: 8,
              sharpeRatio: 1.2,
              profitFactor: 1.6,
              winRate: 52,
              maxDrawdown: 18,
              totalTrades: 80,
              finalBalanceDelta: 0,
              totalReturnDeltaPercent: 0,
            },
            {
              id: 43,
              strategyId: 'SMA_CROSSOVER',
              datasetName: 'BTC 1h 2025',
              datasetChecksumSha256: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
              datasetSchemaVersion: 'ohlcv-v1',
              datasetUploadedAt: '2026-03-11T10:00:00',
              datasetArchived: false,
              symbol: 'BTC/USDT',
              timeframe: '1h',
              executionStatus: 'COMPLETED',
              validationStatus: 'FAILED',
              feesBps: 10,
              slippageBps: 3,
              timestamp: '2026-03-11T10:00:00',
              initialBalance: 1000,
              finalBalance: 950,
              totalReturnPercent: -5,
              sharpeRatio: 0.8,
              profitFactor: 1.1,
              winRate: 45,
              maxDrawdown: 22,
              totalTrades: 48,
              finalBalanceDelta: -130,
              totalReturnDeltaPercent: -13,
            },
          ],
        }}
      />
    );

    expect(screen.getByText(/comparison export is blocked/i)).toBeInTheDocument();
    expect(screen.getByText(/comparison spans multiple dataset inputs/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeDisabled();
  });
});
