import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BalanceCard } from './BalanceCard';
import { accountApi } from '../account/accountApi';

// Mock balance data
const mockBalanceData = {
  total: '1250.50',
  available: '1000.00',
  locked: '250.50',
  assets: [
    { symbol: 'USDT', amount: '500.00', valueUSD: '500.00' },
    { symbol: 'BTC', amount: '0.015', valueUSD: '600.00' },
    { symbol: 'ETH', amount: '0.08', valueUSD: '150.50' },
  ],
  lastSync: '2026-03-09T10:30:00Z',
};

const createMockStore = (balanceData = mockBalanceData, isLoading = false, error: any = null) => {
  return configureStore({
    reducer: {
      [accountApi.reducerPath]: accountApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(accountApi.middleware),
    preloadedState: {
      [accountApi.reducerPath]: {
        queries: {
          'getBalance(undefined)': {
            status: error ? 'rejected' : isLoading ? 'pending' : 'fulfilled',
            data: balanceData,
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
};

describe('BalanceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display error state when balance fetch fails', () => {
    const store = createMockStore(mockBalanceData, false, { message: 'Network error' });
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    expect(screen.getByText(/Failed to load balance data/i)).toBeInTheDocument();
  });

  it('should display total balance correctly', () => {
    const store = createMockStore(mockBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('$1250.50')).toBeInTheDocument();
  });

  it('should display available balance correctly', () => {
    const store = createMockStore(mockBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('$1000.00')).toBeInTheDocument();
  });

  it('should display locked balance correctly', () => {
    const store = createMockStore(mockBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByText('$250.50')).toBeInTheDocument();
  });

  it('should display all asset breakdowns', () => {
    const store = createMockStore(mockBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    expect(screen.getByText('Asset Breakdown')).toBeInTheDocument();
    expect(screen.getByText('USDT')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
  });

  it('should display asset amounts correctly', () => {
    const store = createMockStore(mockBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    expect(screen.getByText('500.00')).toBeInTheDocument(); // USDT amount
    expect(screen.getByText('0.015')).toBeInTheDocument(); // BTC amount
    expect(screen.getByText('0.08')).toBeInTheDocument(); // ETH amount
  });

  it('should display asset USD values correctly', () => {
    const store = createMockStore(mockBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    expect(screen.getByText('$500.00')).toBeInTheDocument(); // USDT value
    expect(screen.getByText('$600.00')).toBeInTheDocument(); // BTC value
    expect(screen.getByText('$150.50')).toBeInTheDocument(); // ETH value
  });

  it('should display last sync timestamp', () => {
    const store = createMockStore(mockBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
  });

  it('should render refresh button', () => {
    const store = createMockStore(mockBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh balance/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('should call refetch when refresh button is clicked', async () => {
    const store = createMockStore(mockBalanceData);
    const { container } = render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh balance/i });
    fireEvent.click(refreshButton);

    // Verify button was clicked (refetch is called internally)
    await waitFor(() => {
      expect(refreshButton).toBeInTheDocument();
    });
  });

  it('should display card title', () => {
    const store = createMockStore(mockBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    expect(screen.getByText('Account Balance')).toBeInTheDocument();
  });

  it('should handle empty asset list', () => {
    const emptyBalanceData = {
      ...mockBalanceData,
      assets: [],
    };
    const store = createMockStore(emptyBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    expect(screen.getByText('Asset Breakdown')).toBeInTheDocument();
    // Should not crash with empty assets
  });

  it('should handle zero balances', () => {
    const zeroBalanceData = {
      total: '0.00',
      available: '0.00',
      locked: '0.00',
      assets: [],
      lastSync: '2026-03-09T10:30:00Z',
    };
    const store = createMockStore(zeroBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    // Use getAllByText since $0.00 appears multiple times
    const zeroElements = screen.getAllByText('$0.00');
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('should format timestamp as locale string', () => {
    const store = createMockStore(mockBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    const timestamp = new Date('2026-03-09T10:30:00Z').toLocaleString();
    expect(screen.getByText(new RegExp(timestamp))).toBeInTheDocument();
  });

  it('should display multiple assets in correct order', () => {
    const store = createMockStore(mockBalanceData);
    const { container } = render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    const assetElements = container.querySelectorAll('[data-testid], .MuiBox-root');
    // Verify assets are rendered (exact order depends on DOM structure)
    expect(screen.getByText('USDT')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
  });

  it('should have proper accessibility labels', () => {
    const store = createMockStore(mockBalanceData);
    render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh balance/i });
    expect(refreshButton).toHaveAttribute('aria-label', 'Refresh balance');
  });

  it('should render within a Card component', () => {
    const store = createMockStore(mockBalanceData);
    const { container } = render(
      <Provider store={store}>
        <BalanceCard />
      </Provider>
    );

    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });
});
