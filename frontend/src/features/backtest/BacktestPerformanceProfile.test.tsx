import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { BacktestResults } from './BacktestResults';

let mockedEquityCurve: Array<{ timestamp: string; equity: number; drawdownPct: number }> = [];
let mockedTradeSeries: Array<{
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryValue: number;
  exitValue: number;
  returnPct: number;
}> = [];
let mockedTelemetryResponse:
  | {
      requestedSymbol: string;
      resolvedSymbol: string;
      availableSymbols: string[];
      telemetry: {
        symbol: string;
        points: Array<{
          timestamp: string;
          open: number;
          high: number;
          low: number;
          close: number;
          volume: number;
          exposurePct: number;
          regime: 'WARMUP' | 'RANGE' | 'TREND_UP' | 'TREND_DOWN';
        }>;
        actions: Array<{
          timestamp: string;
          action: 'BUY' | 'SELL' | 'SHORT' | 'COVER';
          price: number;
          label: string;
        }>;
        indicators: Array<{
          key: string;
          label: string;
          pane: 'PRICE' | 'OSCILLATOR';
          points: Array<{ timestamp: string; value: number | null }>;
        }>;
      };
    }
  | undefined;

vi.mock('./backtestApi', () => ({
  useGetBacktestEquityCurveQuery: () => ({ data: mockedEquityCurve }),
  useGetBacktestTradeSeriesQuery: () => ({ data: mockedTradeSeries }),
  useGetBacktestTelemetryQuery: () => ({ data: mockedTelemetryResponse }),
}));

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

vi.mock('./BacktestWorkspaceChart', () => ({
  BacktestWorkspaceChart: ({ series }: { series: { symbol: string } }) => (
    <div>chart workspace {series.symbol}</div>
  ),
}));

const buildDetails = () => {
  const tradeSeries = Array.from({ length: 320 }, (_, index) => ({
    symbol: index % 2 === 0 ? 'BTC/USDT' : 'ETH/USDT',
    side: index % 3 === 0 ? 'SHORT' : 'LONG',
    entryTime: new Date(Date.UTC(2025, 0, 1, index * 6)).toISOString().slice(0, 19),
    exitTime: new Date(Date.UTC(2025, 0, 1, index * 6 + 4)).toISOString().slice(0, 19),
    entryPrice: 100 + index,
    exitPrice: 101 + index,
    quantity: 1.25,
    entryValue: 125 + index,
    exitValue: 126 + index,
    returnPct: Number(((index % 9) - 4) * 0.75).toFixed(2),
  }));

  const telemetryPoints = Array.from({ length: 2400 }, (_, index) => ({
    timestamp: new Date(Date.UTC(2025, 0, 1, index)).toISOString().slice(0, 19),
    open: 100 + index,
    high: 101 + index,
    low: 99 + index,
    close: 100 + index,
    volume: 1000 + index,
    exposurePct: index % 2 === 0 ? 95 : 0,
    regime: index < 200 ? 'WARMUP' : index % 3 === 0 ? 'TREND_UP' : 'RANGE',
  }));

  const telemetry = ['BTC/USDT', 'ETH/USDT'].map((symbol, symbolIndex) => ({
    symbol,
    points: telemetryPoints,
    actions: tradeSeries
      .filter((trade) => trade.symbol === symbol)
      .flatMap((trade) => [
        {
          timestamp: trade.entryTime,
          action: trade.side === 'SHORT' ? 'SHORT' : 'BUY',
          price: trade.entryPrice,
          label: trade.side === 'SHORT' ? 'Short entry' : 'Long entry',
        },
        {
          timestamp: trade.exitTime,
          action: trade.side === 'SHORT' ? 'COVER' : 'SELL',
          price: trade.exitPrice,
          label: trade.side === 'SHORT' ? 'Cover short' : 'Exit long',
        },
      ]),
    indicators: [
      {
        key: `ema_50_${symbolIndex}`,
        label: 'EMA 50',
        pane: 'PRICE',
        points: telemetryPoints.map((point, index) => ({
          timestamp: point.timestamp,
          value: index < 49 ? null : 100 + index * 0.98,
        })),
      },
      {
        key: `adx_14_${symbolIndex}`,
        label: 'ADX 14',
        pane: 'OSCILLATOR',
        points: telemetryPoints.map((point, index) => ({
          timestamp: point.timestamp,
          value: index < 14 ? null : 20 + (index % 20),
        })),
      },
    ],
    provenance: [],
  }));

  return {
    id: 42,
    strategyId: 'TREND_FIRST_ADAPTIVE_ENSEMBLE',
    datasetId: 7,
    datasetName: 'Profiling Dataset',
    experimentName: 'Backtest Performance Profile',
    experimentKey: 'backtest-performance-profile',
    datasetChecksumSha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    datasetSchemaVersion: 'ohlcv-v1',
    datasetUploadedAt: '2026-03-25T10:00:00',
    datasetArchived: false,
    symbol: 'BTC/USDT',
    timeframe: '1h',
    executionStatus: 'COMPLETED' as const,
    validationStatus: 'PASSED' as const,
    feesBps: 10,
    slippageBps: 3,
    timestamp: '2026-03-25T10:05:00',
    initialBalance: 1000,
    finalBalance: 1240,
    sharpeRatio: 1.42,
    profitFactor: 1.55,
    winRate: 54,
    maxDrawdown: 12,
    totalTrades: tradeSeries.length,
    startDate: '2025-01-01T00:00:00',
    endDate: '2025-04-11T00:00:00',
    executionStage: 'COMPLETED' as const,
    progressPercent: 100,
    processedCandles: telemetryPoints.length * 2,
    totalCandles: telemetryPoints.length * 2,
    currentDataTimestamp: '2025-04-11T00:00:00',
    statusMessage: 'Backtest completed. Metrics and trade series are ready to review.',
    lastProgressAt: '2026-03-25T10:05:00',
    startedAt: '2026-03-25T10:00:00',
    completedAt: '2026-03-25T10:05:00',
    errorMessage: null,
    availableTelemetrySymbols: telemetry.map((series) => series.symbol),
  };
};

describe('BacktestPerformanceProfile', () => {
  it('writes a render profile report', { timeout: 20000 }, () => {
    const details = buildDetails();
    mockedEquityCurve = Array.from({ length: 2400 }, (_, index) => ({
      timestamp: new Date(Date.UTC(2025, 0, 1, index)).toISOString().slice(0, 19),
      equity: 1000 + index * 2,
      drawdownPct: Number((index % 25) * 0.1),
    }));
    mockedTradeSeries = Array.from({ length: 320 }, (_, index) => ({
      symbol: index % 2 === 0 ? 'BTC/USDT' : 'ETH/USDT',
      side: index % 3 === 0 ? 'SHORT' : 'LONG',
      entryTime: new Date(Date.UTC(2025, 0, 1, index * 6)).toISOString().slice(0, 19),
      exitTime: new Date(Date.UTC(2025, 0, 1, index * 6 + 4)).toISOString().slice(0, 19),
      entryPrice: 100 + index,
      exitPrice: 101 + index,
      quantity: 1.25,
      entryValue: 125 + index,
      exitValue: 126 + index,
      returnPct: Number(((index % 9) - 4) * 0.75),
    }));
    mockedTelemetryResponse = {
      requestedSymbol: 'BTC/USDT',
      resolvedSymbol: 'BTC/USDT',
      availableSymbols: ['BTC/USDT', 'ETH/USDT'],
      telemetry: {
        symbol: 'BTC/USDT',
        points: Array.from({ length: 2400 }, (_, index) => ({
          timestamp: new Date(Date.UTC(2025, 0, 1, index)).toISOString().slice(0, 19),
          open: 100 + index,
          high: 101 + index,
          low: 99 + index,
          close: 100 + index,
          volume: 1000 + index,
          exposurePct: index % 2 === 0 ? 95 : 0,
          regime: index < 200 ? 'WARMUP' : index % 3 === 0 ? 'TREND_UP' : 'RANGE',
        })),
        actions: mockedTradeSeries
          .filter((trade) => trade.symbol === 'BTC/USDT')
          .flatMap((trade) => [
            {
              timestamp: trade.entryTime,
              action: trade.side === 'SHORT' ? 'SHORT' : 'BUY',
              price: trade.entryPrice,
              label: trade.side === 'SHORT' ? 'Short entry' : 'Long entry',
            },
            {
              timestamp: trade.exitTime,
              action: trade.side === 'SHORT' ? 'COVER' : 'SELL',
              price: trade.exitPrice,
              label: trade.side === 'SHORT' ? 'Cover short' : 'Exit long',
            },
          ]),
        indicators: [
          {
            key: 'ema_50_0',
            label: 'EMA 50',
            pane: 'PRICE',
            points: Array.from({ length: 2400 }, (_, index) => ({
              timestamp: new Date(Date.UTC(2025, 0, 1, index)).toISOString().slice(0, 19),
              value: index < 49 ? null : 100 + index * 0.98,
            })),
          },
          {
            key: 'adx_14_0',
            label: 'ADX 14',
            pane: 'OSCILLATOR',
            points: Array.from({ length: 2400 }, (_, index) => ({
              timestamp: new Date(Date.UTC(2025, 0, 1, index)).toISOString().slice(0, 19),
              value: index < 14 ? null : 20 + (index % 20),
            })),
          },
        ],
      },
    };
    const payloadBytes = new TextEncoder().encode(JSON.stringify(details)).length;

    const startedAt = performance.now();
    const view = render(
      <MemoryRouter>
        <BacktestResults details={details} />
      </MemoryRouter>
    );
    const renderMs = performance.now() - startedAt;

    const report = `# Backtest Page Render Profile

Generated by \`npm run profile:backtest\` for task \`1C.1\`.

- Payload size: ${(payloadBytes / 1024).toFixed(2)} KB
- Render time: ${renderMs.toFixed(2)} ms
- Equity points: ${mockedEquityCurve.length}
- Trades: ${mockedTradeSeries.length}
- Telemetry symbols: ${details.availableTelemetrySymbols.length}
- Telemetry points in active symbol payload: ${mockedTelemetryResponse?.telemetry.points.length ?? 0}

Notes:
- This profile isolates route and workspace render orchestration in jsdom while mocking the heaviest chart primitives, so it is best read as frontend render-preparation cost rather than a full browser paint metric.
- Use it together with \`AlgotradingBot/build/reports/backend-workflow-profile/report.md\` to decompose the slow backtest page into backend assembly, payload size, and client render work.
`;

    const output = resolve(process.cwd(), 'build', 'reports', 'backtest-page-profile', 'report.md');
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, report, 'utf8');

    expect(renderMs).toBeGreaterThanOrEqual(0);
    expect(view.getByText('Run #42 research workspace')).toBeInTheDocument();
  });
});
