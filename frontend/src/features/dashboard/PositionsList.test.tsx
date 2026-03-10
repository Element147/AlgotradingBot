import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import { accountApi } from '../account/accountApi';

import { PositionsList } from './PositionsList';

// Mock formatters
vi.mock('@/utils/formatters', () => ({
  formatCurrency: (value: string) => `$${value}`,
  formatPercentage: (value: string) => `${value}%`,
}));

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

type QueryStatus = 'pending' | 'fulfilled' | 'rejected';

const createMockStore = (
  positions = mockPositions,
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
          'getOpenPositions(undefined)': {
            status,
            data: status === 'fulfilled' ? positions : undefined,
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

describe('PositionsList', () => {
  it('should render loading state', () => {
    const store = createMockStore(mockPositions, 'pending');

    render(
      <Provider store={store}>
        <PositionsList />
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Open Positions')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const store = createMockStore(mockPositions, 'rejected', {
      status: 500,
      data: 'Server error',
    });

    render(
      <Provider store={store}>
        <PositionsList />
      </Provider>
    );

    expect(screen.getByText(/Failed to load positions/i)).toBeInTheDocument();
  });

  it('should render empty state when no positions', () => {
    const store = createMockStore([], 'fulfilled');

    render(
      <Provider store={store}>
        <PositionsList />
      </Provider>
    );

    expect(screen.getByText('No open positions')).toBeInTheDocument();
    expect(screen.getByText('0 Positions')).toBeInTheDocument();
  });

  it('should render positions list correctly', () => {
    const store = createMockStore(mockPositions, 'fulfilled');

    render(
      <Provider store={store}>
        <PositionsList />
      </Provider>
    );

    expect(screen.getByText('Open Positions')).toBeInTheDocument();
    expect(screen.getByText('2 Positions')).toBeInTheDocument();
    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Side')).toBeInTheDocument();
    expect(screen.getByText('Entry Price')).toBeInTheDocument();
    expect(screen.getByText('Current Price')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Unrealized P&L')).toBeInTheDocument();

    expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getAllByText('Bollinger Bands')).toHaveLength(2);
    expect(screen.getByText('BUY')).toBeInTheDocument();
    expect(screen.getByText('$50000.00')).toBeInTheDocument();
    expect(screen.getByText('$51000.00')).toBeInTheDocument();
    expect(screen.getByText('0.01')).toBeInTheDocument();
    expect(screen.getByText('+$10.00')).toBeInTheDocument();
    expect(screen.getByText('(+2.00%)')).toBeInTheDocument();

    expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
    expect(screen.getByText('SELL')).toBeInTheDocument();
    expect(screen.getByText('$3000.00')).toBeInTheDocument();
    expect(screen.getByText('$3050.00')).toBeInTheDocument();
    expect(screen.getByText('0.1')).toBeInTheDocument();
    expect(screen.getByText('$-5.00')).toBeInTheDocument();
    expect(screen.getByText('(-1.67%)')).toBeInTheDocument();
  });

  it('should display correct position count in singular form', () => {
    const store = createMockStore([mockPositions[0]], 'fulfilled');

    render(
      <Provider store={store}>
        <PositionsList />
      </Provider>
    );

    expect(screen.getByText('1 Position')).toBeInTheDocument();
  });

  it('should color-code profit and loss correctly', () => {
    const store = createMockStore(mockPositions, 'fulfilled');

    render(
      <Provider store={store}>
        <PositionsList />
      </Provider>
    );

    expect(screen.getByText('+$10.00')).toBeInTheDocument();
    expect(screen.getByText('(+2.00%)')).toBeInTheDocument();
    expect(screen.getByText('$-5.00')).toBeInTheDocument();
    expect(screen.getByText('(-1.67%)')).toBeInTheDocument();
  });
});

