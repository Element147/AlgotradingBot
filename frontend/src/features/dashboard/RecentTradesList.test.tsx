import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentTradesList } from './RecentTradesList';
import { useGetRecentTradesQuery } from '../account/accountApi';

// Mock the account API
vi.mock('../account/accountApi', () => ({
  useGetRecentTradesQuery: vi.fn(),
}));

// Mock formatters
vi.mock('@/utils/formatters', () => ({
  formatCurrency: (value: string) => `$${value}`,
  formatPercentage: (value: string) => `${value}%`,
  formatDateTime: (value: string) => 'Mar 9, 2026, 3:45 PM',
}));

describe('RecentTradesList', () => {
  const mockTrades = [
    {
      id: '1',
      strategyId: 'strat-1',
      strategyName: 'Bollinger Bands',
      symbol: 'BTC/USDT',
      side: 'BUY' as const,
      entryPrice: '50000.00',
      exitPrice: '51000.00',
      quantity: '0.01',
      entryTime: '2026-03-09T10:00:00Z',
      exitTime: '2026-03-09T12:00:00Z',
      duration: '2h',
      profitLoss: '10.00',
      profitLossPercentage: '2.00',
      fees: '0.50',
      slippage: '0.15',
      status: 'CLOSED' as const,
    },
    {
      id: '2',
      strategyId: 'strat-1',
      strategyName: 'Bollinger Bands',
      symbol: 'ETH/USDT',
      side: 'SELL' as const,
      entryPrice: '3000.00',
      exitPrice: '2950.00',
      quantity: '0.1',
      entryTime: '2026-03-09T11:00:00Z',
      exitTime: '2026-03-09T13:00:00Z',
      duration: '2h',
      profitLoss: '-5.00',
      profitLossPercentage: '-1.67',
      fees: '0.30',
      slippage: '0.09',
      status: 'CLOSED' as const,
    },
  ];

  it('should render loading state', () => {
    vi.mocked(useGetRecentTradesQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as any);

    render(<RecentTradesList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Recent Trades')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.mocked(useGetRecentTradesQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: 'Server error' },
    } as any);

    render(<RecentTradesList />);
    expect(screen.getByText(/Failed to load trades/i)).toBeInTheDocument();
  });

  it('should render empty state when no trades', () => {
    vi.mocked(useGetRecentTradesQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    render(<RecentTradesList />);
    expect(screen.getByText('No recent trades')).toBeInTheDocument();
    expect(screen.getByText('Last 0')).toBeInTheDocument();
  });

  it('should render trades list correctly', () => {
    vi.mocked(useGetRecentTradesQuery).mockReturnValue({
      data: mockTrades,
      isLoading: false,
      error: undefined,
    } as any);

    render(<RecentTradesList />);

    // Check title and count
    expect(screen.getByText('Recent Trades')).toBeInTheDocument();
    expect(screen.getByText('Last 2')).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Side')).toBeInTheDocument();
    expect(screen.getByText('Entry')).toBeInTheDocument();
    expect(screen.getByText('Exit')).toBeInTheDocument();
    expect(screen.getByText('P&L')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();

    // Check first trade data
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getAllByText('Bollinger Bands')).toHaveLength(2);
    expect(screen.getByText('BUY')).toBeInTheDocument();
    expect(screen.getByText('$50000.00')).toBeInTheDocument();
    expect(screen.getByText('$51000.00')).toBeInTheDocument();
    expect(screen.getByText('+$10.00')).toBeInTheDocument();
    expect(screen.getByText('(+2.00%)')).toBeInTheDocument();

    // Check second trade data
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
    expect(screen.getByText('SELL')).toBeInTheDocument();
    expect(screen.getByText('$3000.00')).toBeInTheDocument();
    expect(screen.getByText('$2950.00')).toBeInTheDocument();
    expect(screen.getByText('$-5.00')).toBeInTheDocument();
    expect(screen.getByText('(-1.67%)')).toBeInTheDocument();

    // Check timestamps are formatted
    expect(screen.getAllByText('Mar 9, 2026, 3:45 PM')).toHaveLength(2);
  });

  it('should pass correct limit parameter to query', () => {
    const mockQuery = vi.mocked(useGetRecentTradesQuery);
    mockQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    render(<RecentTradesList />);

    // Verify the query was called with limit of 10
    expect(mockQuery).toHaveBeenCalledWith(10);
  });

  it('should color-code profit and loss correctly', () => {
    vi.mocked(useGetRecentTradesQuery).mockReturnValue({
      data: mockTrades,
      isLoading: false,
      error: undefined,
    } as any);

    render(<RecentTradesList />);

    // Check that profit is displayed (positive P&L with + sign)
    expect(screen.getByText('+$10.00')).toBeInTheDocument();
    expect(screen.getByText('(+2.00%)')).toBeInTheDocument();

    // Check that loss is displayed (negative P&L)
    expect(screen.getByText('$-5.00')).toBeInTheDocument();
    expect(screen.getByText('(-1.67%)')).toBeInTheDocument();
  });
});
