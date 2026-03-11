import type { BacktestDetails } from './backtestApi';
import type { MonthlyReturnCell } from './MonthlyReturnsHeatmap';
import type { HistogramBin } from './TradeDistributionHistogram';

import type { DrawdownPoint } from '@/components/charts/DrawdownChart';
import type { EquityCurvePoint } from '@/components/charts/EquityCurve';


const daysBetween = (start: Date, end: Date): number => {
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

export const createSyntheticEquityCurve = (details: BacktestDetails): EquityCurvePoint[] => {
  const start = new Date(details.startDate);
  const end = new Date(details.endDate);
  const totalDays = daysBetween(start, end);
  const pointsCount = Math.min(180, Math.max(20, Math.floor(totalDays / 2)));
  const initial = details.initialBalance;
  const delta = details.finalBalance - details.initialBalance;
  const drawdownPressure = Math.max(0.02, details.maxDrawdown / 100);

  return Array.from({ length: pointsCount }, (_, index) => {
    const progress = index / Math.max(1, pointsCount - 1);
    const base = initial + delta * progress;
    const wave = Math.sin(progress * Math.PI * 6) * initial * 0.02;
    const dip = Math.max(0, Math.sin(progress * Math.PI * 2)) * initial * drawdownPressure * 0.2;
    const equity = base + wave - dip;
    const timestamp = new Date(start.getTime() + progress * (end.getTime() - start.getTime()));
    return {
      timestamp: timestamp.toISOString(),
      equity,
    };
  });
};

export const createDrawdownCurve = (equity: EquityCurvePoint[]): DrawdownPoint[] => {
  let peak = equity[0]?.equity ?? 0;
  return equity.map((point) => {
    peak = Math.max(peak, point.equity);
    const drawdownPct = peak === 0 ? 0 : ((peak - point.equity) / peak) * 100;
    return {
      timestamp: point.timestamp,
      drawdownPct,
    };
  });
};

export const createMonthlyReturns = (equity: EquityCurvePoint[]): MonthlyReturnCell[] => {
  const grouped = new Map<string, { start: number; end: number }>();
  equity.forEach((point) => {
    const date = new Date(point.timestamp);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, { start: point.equity, end: point.equity });
      return;
    }
    existing.end = point.equity;
  });

  return Array.from(grouped.entries()).map(([key, value]) => {
    const [yearStr, monthStr] = key.split('-');
    const returnPct = value.start === 0 ? 0 : ((value.end - value.start) / value.start) * 100;
    return {
      year: Number(yearStr),
      month: Number(monthStr),
      returnPct,
    };
  });
};

export const createTradeDistribution = (details: BacktestDetails): HistogramBin[] => {
  const trades = Math.max(1, details.totalTrades);
  const baseWinCount = Math.round((details.winRate / 100) * trades);
  const baseLossCount = trades - baseWinCount;
  const buckets = [
    { rangeLabel: '< -5%', count: Math.max(1, Math.round(baseLossCount * 0.15)) },
    { rangeLabel: '-5% to -2%', count: Math.max(1, Math.round(baseLossCount * 0.35)) },
    { rangeLabel: '-2% to 0%', count: Math.max(1, Math.round(baseLossCount * 0.5)) },
    { rangeLabel: '0% to 2%', count: Math.max(1, Math.round(baseWinCount * 0.45)) },
    { rangeLabel: '2% to 5%', count: Math.max(1, Math.round(baseWinCount * 0.35)) },
    { rangeLabel: '> 5%', count: Math.max(1, Math.round(baseWinCount * 0.2)) },
  ];
  return buckets;
};

export const createMonteCarloProjection = (details: BacktestDetails): {
  confidence95Floor: number;
  confidence95Ceiling: number;
  worstCase: number;
} => {
  const final = details.finalBalance;
  return {
    confidence95Floor: final * 0.88,
    confidence95Ceiling: final * 1.12,
    worstCase: final * 0.78,
  };
};

export const createWalkForwardProjection = (details: BacktestDetails): {
  inSampleProfitFactor: number;
  outOfSampleProfitFactor: number;
  degradationPct: number;
} => {
  const inSample = details.profitFactor;
  const outSample = Math.max(0, inSample * 0.88);
  const degradationPct = inSample === 0 ? 0 : ((inSample - outSample) / inSample) * 100;
  return {
    inSampleProfitFactor: inSample,
    outOfSampleProfitFactor: outSample,
    degradationPct,
  };
};
