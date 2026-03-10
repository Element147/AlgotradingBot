import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import StrategiesPage from './StrategiesPage';

vi.mock('./strategiesApi', () => ({
  useGetStrategiesQuery: () => ({
    data: [
      {
        id: 1,
        name: 'Bollinger BTC Mean Reversion',
        type: 'bollinger-bands',
        status: 'STOPPED',
        symbol: 'BTC/USDT',
        timeframe: '1h',
        riskPerTrade: 0.02,
        minPositionSize: 10,
        maxPositionSize: 100,
        profitLoss: 0,
        tradeCount: 0,
        currentDrawdown: 0,
        paperMode: true,
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
  }),
  useStartStrategyMutation: () => [vi.fn(), { isLoading: false }],
  useStopStrategyMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateStrategyConfigMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('StrategiesPage', () => {
  it('renders strategy management title', () => {
    render(<StrategiesPage />);

    expect(screen.getByText('Strategy Management')).toBeInTheDocument();
  });

  it('renders strategies from API', () => {
    render(<StrategiesPage />);

    expect(screen.getByText('Bollinger BTC Mean Reversion')).toBeInTheDocument();
    expect(screen.getByText('Market: BTC/USDT (1h)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Configure' })).toBeInTheDocument();
  });
});
