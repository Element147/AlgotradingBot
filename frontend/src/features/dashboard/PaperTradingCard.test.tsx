import { render, screen } from '@testing-library/react';
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
    },
    isLoading: false,
    isError: false,
  }),
}));

describe('PaperTradingCard', () => {
  it('renders paper trading state', () => {
    render(<PaperTradingCard />);

    expect(screen.getByText('Paper Trading')).toBeInTheDocument();
    expect(screen.getByText('Paper mode active')).toBeInTheDocument();
    expect(screen.getByText('Cash Balance: 10000.00')).toBeInTheDocument();
    expect(screen.getByText('Open Positions: 2')).toBeInTheDocument();
  });
});
