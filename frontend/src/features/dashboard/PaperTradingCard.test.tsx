import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { PaperTradingCard } from './PaperTradingCard';

vi.mock('@/features/paperApi', () => ({
  useGetPaperTradingStateQuery: () => ({
    data: {
      paperMode: true,
      cashBalance: 10000,
      positionCount: 2,
      totalOrders: 12,
      openOrders: 1,
      filledOrders: 10,
      cancelledOrders: 1,
      lastOrderAt: '2026-03-10T10:00:00',
      lastPositionUpdateAt: '2026-03-10T10:05:00',
      staleOpenOrderCount: 0,
      stalePositionCount: 0,
      recoveryStatus: 'HEALTHY',
      recoveryMessage: 'No stale paper-trading state detected after the latest activity.',
      incidentSummary: 'Paper trading is active with no current incident signals.',
      alerts: [
        {
          severity: 'INFO',
          code: 'PAPER_HEALTHY',
          summary: 'Paper-trading recovery telemetry is currently healthy.',
          recommendedAction:
            'Continue monitoring for stale orders or stale positions during the next restart cycle.',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

describe('PaperTradingCard', () => {
  it('renders paper trading state', () => {
    render(
      <BrowserRouter>
        <PaperTradingCard />
      </BrowserRouter>
    );

    expect(screen.getByText('Paper Trading')).toBeInTheDocument();
    expect(screen.getByText('Paper mode active')).toBeInTheDocument();
    expect(screen.getByText('Cash Balance: 10000.00')).toBeInTheDocument();
    expect(screen.getByText('Open Positions: 2')).toBeInTheDocument();
    expect(screen.getByText('Paper trading is active with no current incident signals.')).toBeInTheDocument();
    expect(screen.getByText(/Recovery status: HEALTHY/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open paper desk/i })).toHaveAttribute('href', '/paper');
  });
});
