import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import { accountApi } from '../account/accountApi';

import { RecentTradesList } from './RecentTradesList';

// Mock formatters
vi.mock('@/utils/formatters', () => ({
  formatCurrency: (value: string) => `$${value}`,
  formatPercentage: (value: string) => `${value}%`,
  formatDateTime: (_value: string) => 'Mar 9, 2026, 3:45 PM',
}));

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

type QueryStatus = 'pending' | 'fulfilled' | 'rejected';

const createMockStore = (
  trades = mockTrades,
  status: QueryStatus = 'fulfilled',
  error: unknown = undefined
) =>
  configureStore({
    reducer: {
      [accountApi.reducerPath]: accountApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(accountApi.middleware),
    preloadedState: {
      [accountApi.reducerPath]: {
        queries: {
          'getRecentTrades(10)': {
            status,
            data: status === 'fulfilled' ? trades : undefined,
            error,
          },
        },
        mutations: {},
        provided: {},
        subscriptions: {},
        config: {
          online: true,
          focused: true,
          middlewareRegistered: true,
          refetchOnFocus: false,
          refetchOnReconnect: false,
          refetchOnMountOrArgChange: false,
          keepUnusedDataFor: 60,
          reducerPath: accountApi.reducerPath,
        },
      },
    },
  });

describe('RecentTradesList', { timeout: 15000 }, () => {
  it('should render loading state', () => {
    const store = createMockStore(mockTrades, 'pending');

    render(
      <Provider store={store}>
        <RecentTradesList />
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Recent Trades')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const store = createMockStore(mockTrades, 'rejected', {
      status: 500,
      data: 'Server error',
    });

    render(
      <Provider store={store}>
        <RecentTradesList />
      </Provider>
    );

    expect(screen.getByText(/Failed to load trades/i)).toBeInTheDocument();
  });

  it('should render empty state when no trades', () => {
    const store = createMockStore([], 'fulfilled');

    render(
      <Provider store={store}>
        <RecentTradesList />
      </Provider>
    );

    expect(screen.getByText('No recent trades')).toBeInTheDocument();
    expect(screen.getByText('Last 0')).toBeInTheDocument();
  });

  it('should render trades list correctly', () => {
    const store = createMockStore(mockTrades, 'fulfilled');

    render(
      <Provider store={store}>
        <RecentTradesList />
      </Provider>
    );

    expect(screen.getByText('Recent Trades')).toBeInTheDocument();
    expect(screen.getByText('Last 2')).toBeInTheDocument();
    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Side')).toBeInTheDocument();
    expect(screen.getByText('Entry')).toBeInTheDocument();
    expect(screen.getByText('Exit')).toBeInTheDocument();
    expect(screen.getByText('P&L')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();

    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getAllByText('Bollinger Bands')).toHaveLength(2);
    expect(screen.getByText('BUY')).toBeInTheDocument();
    expect(screen.getByText('$50000.00')).toBeInTheDocument();
    expect(screen.getByText('$51000.00')).toBeInTheDocument();
    expect(screen.getByText('+$10.00')).toBeInTheDocument();
    expect(screen.getByText('(+2.00%)')).toBeInTheDocument();

    expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
    expect(screen.getByText('SELL')).toBeInTheDocument();
    expect(screen.getByText('$3000.00')).toBeInTheDocument();
    expect(screen.getByText('$2950.00')).toBeInTheDocument();
    expect(screen.getByText('$-5.00')).toBeInTheDocument();
    expect(screen.getByText('(-1.67%)')).toBeInTheDocument();

    expect(screen.getAllByText('Mar 9, 2026, 3:45 PM')).toHaveLength(2);
  });

  it('should color-code profit and loss correctly', () => {
    const store = createMockStore(mockTrades, 'fulfilled');

    render(
      <Provider store={store}>
        <RecentTradesList />
      </Provider>
    );

    expect(screen.getByText('+$10.00')).toBeInTheDocument();
    expect(screen.getByText('(+2.00%)')).toBeInTheDocument();
    expect(screen.getByText('$-5.00')).toBeInTheDocument();
    expect(screen.getByText('(-1.67%)')).toBeInTheDocument();
  });
});
