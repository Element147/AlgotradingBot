import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PositionsList } from './PositionsList';
import { useGetOpenPositionsQuery } from '../account/accountApi';

// Mock the account API
vi.mock('../account/accountApi', () => ({
  useGetOpenPositionsQuery: vi.fn(),
}));

// Mock formatters
vi.mock('@/utils/formatters', () => ({
  formatCurrency: (value: string) => `$${value}`,
  formatPercentage: (value: string) => `${value}%`,
}));

describe('PositionsList', () => {
  const mockPositions = [
    {
      id: '1',
      strategyId: 'strat-1',
      strategyName: 'Bollinger Bands',
      symbol: 'BTC/USDT',
      side: 'BUY' as const,
      entryPrice: '50000.00',
      currentPrice: '51000.00',
      quantity: '0.01',
      entryTime: '2026-03-09T10:00:00Z',
      unrealizedPnL: '10.00',
      unrealizedPnLPercentage: '2.00',
      status: 'OPEN' as const,
    },
    {
      id: '2',
      strategyId: 'strat-1',
      strategyName: 'Bollinger Bands',
      symbol: 'ETH/USDT',
      side: 'SELL' as const,
      entryPrice: '3000.00',
      currentPrice: '3050.00',
      quantity: '0.1',
      entryTime: '2026-03-09T11:00:00Z',
      unrealizedPnL: '-5.00',
      unrealizedPnLPercentage: '-1.67',
      status: 'OPEN' as const,
    },
  ];

  it('should render loading state', () => {
    vi.mocked(useGetOpenPositionsQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as any);

    render(<PositionsList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Open Positions')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.mocked(useGetOpenPositionsQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: 'Server error' },
    } as any);

    render(<PositionsList />);
    expect(screen.getByText(/Failed to load positions/i)).toBeInTheDocument();
  });

  it('should render empty state when no positions', () => {
    vi.mocked(useGetOpenPositionsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    render(<PositionsList />);
    expect(screen.getByText('No open positions')).toBeInTheDocument();
    expect(screen.getByText('0 Positions')).toBeInTheDocument();
  });

  it('should render positions list correctly', () => {
    vi.mocked(useGetOpenPositionsQuery).mockReturnValue({
      data: mockPositions,
      isLoading: false,
      error: undefined,
    } as any);

    render(<PositionsList />);

    // Check title and count
    expect(screen.getByText('Open Positions')).toBeInTheDocument();
    expect(screen.getByText('2 Positions')).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Side')).toBeInTheDocument();
    expect(screen.getByText('Entry Price')).toBeInTheDocument();
    expect(screen.getByText('Current Price')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Unrealized P&L')).toBeInTheDocument();

    // Check first position data
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getAllByText('Bollinger Bands')).toHaveLength(2);
    expect(screen.getByText('BUY')).toBeInTheDocument();
    expect(screen.getByText('$50000.00')).toBeInTheDocument();
    expect(screen.getByText('$51000.00')).toBeInTheDocument();
    expect(screen.getByText('0.01')).toBeInTheDocument();
    expect(screen.getByText('+$10.00')).toBeInTheDocument();
    expect(screen.getByText('(+2.00%)')).toBeInTheDocument();

    // Check second position data
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
    expect(screen.getByText('SELL')).toBeInTheDocument();
    expect(screen.getByText('$3000.00')).toBeInTheDocument();
    expect(screen.getByText('$3050.00')).toBeInTheDocument();
    expect(screen.getByText('0.1')).toBeInTheDocument();
    expect(screen.getByText('$-5.00')).toBeInTheDocument();
    expect(screen.getByText('(-1.67%)')).toBeInTheDocument();
  });

  it('should display correct position count in singular form', () => {
    vi.mocked(useGetOpenPositionsQuery).mockReturnValue({
      data: [mockPositions[0]],
      isLoading: false,
      error: undefined,
    } as any);

    render(<PositionsList />);
    expect(screen.getByText('1 Position')).toBeInTheDocument();
  });

  it('should color-code profit and loss correctly', () => {
    vi.mocked(useGetOpenPositionsQuery).mockReturnValue({
      data: mockPositions,
      isLoading: false,
      error: undefined,
    } as any);

    render(<PositionsList />);

    // Check that profit is displayed (positive P&L with + sign)
    expect(screen.getByText('+$10.00')).toBeInTheDocument();
    expect(screen.getByText('(+2.00%)')).toBeInTheDocument();

    // Check that loss is displayed (negative P&L)
    expect(screen.getByText('$-5.00')).toBeInTheDocument();
    expect(screen.getByText('(-1.67%)')).toBeInTheDocument();
  });
});
