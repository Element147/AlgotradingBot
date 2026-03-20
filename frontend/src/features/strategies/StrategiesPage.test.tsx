import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import StrategiesPage from './StrategiesPage';

const startMutation = vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({}) }));
const stopMutation = vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({}) }));
const updateMutation = vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({}) }));

vi.mock('./strategiesApi', () => ({
  useGetStrategiesQuery: () => ({
    data: [
      {
        id: 1,
        name: 'Bollinger BTC Mean Reversion',
        type: 'BOLLINGER_BANDS',
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
        shortSellingEnabled: true,
        configVersion: 1,
        lastConfigChangedAt: '2026-03-12T10:00:00',
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
  }),
  useStartStrategyMutation: () => [startMutation, { isLoading: false }],
  useStopStrategyMutation: () => [stopMutation, { isLoading: false }],
  useUpdateStrategyConfigMutation: () => [updateMutation, { isLoading: false }],
}));

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('StrategiesPage', () => {
  it('renders strategy management title and rows', () => {
    render(<StrategiesPage />);

    expect(screen.getByText('Paper-safe strategy desk')).toBeInTheDocument();
    expect(screen.getByText('Bollinger BTC Mean Reversion')).toBeInTheDocument();
    expect(screen.getByText('Available strategies')).toBeInTheDocument();
    expect(screen.getByText('BTC/USDT (1h)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('shows start confirmation dialog before mutation execution', async () => {
    const user = userEvent.setup();
    render(<StrategiesPage />);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to start/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(startMutation).toHaveBeenCalledWith(1);
  }, 15000);
});
