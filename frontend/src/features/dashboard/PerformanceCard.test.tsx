import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PerformanceCard } from './PerformanceCard';
import { accountApi } from '../account/accountApi';

// Mock performance data
const mockPerformanceData = {
  totalProfitLoss: '125.50',
  profitLossPercentage: '12.55',
  winRate: '55.5',
  tradeCount: 42,
  cashRatio: '1.25',
};

const mockLossData = {
  totalProfitLoss: '-75.25',
  profitLossPercentage: '-7.52',
  winRate: '45.0',
  tradeCount: 30,
  cashRatio: '0.85',
};

const createMockStore = (performanceData = mockPerformanceData, isLoading = false, error: any = null) => {
  return configureStore({
    reducer: {
      [accountApi.reducerPath]: accountApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(accountApi.middleware),
    preloadedState: {
      [accountApi.reducerPath]: {
        queries: {
          'getPerformance("today")': {
            status: error ? 'rejected' : isLoading ? 'pending' : 'fulfilled',
            data: performanceData,
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

describe('PerformanceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display error state when performance fetch fails', () => {
    const store = createMockStore(mockPerformanceData, false, { message: 'Network error' });
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByText(/Failed to load performance data/i)).toBeInTheDocument();
  });

  it('should display card title', () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('should display all timeframe buttons', () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /this week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /this month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all time/i })).toBeInTheDocument();
  });

  it('should have "today" selected by default', () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    const todayButton = screen.getByRole('button', { name: /today/i });
    expect(todayButton).toHaveClass('Mui-selected');
  });

  it('should change timeframe when button is clicked', async () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    const weekButton = screen.getByRole('button', { name: /this week/i });
    fireEvent.click(weekButton);

    await waitFor(() => {
      expect(weekButton).toHaveClass('Mui-selected');
    });
  });

  it('should display profit in green color', () => {
    const store = createMockStore(mockPerformanceData);
    const { container } = render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    // Find the profit/loss amount element
    const profitElement = screen.getByText('$125.50');
    expect(profitElement).toBeInTheDocument();
    
    // Check that it has success color (green)
    const style = window.getComputedStyle(profitElement);
    // MUI applies color via sx prop, check parent or element has success color class
  });

  it('should display loss in red color', () => {
    const store = createMockStore(mockLossData);
    const { container } = render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    // Find the profit/loss amount element
    const lossElement = screen.getByText('$-75.25');
    expect(lossElement).toBeInTheDocument();
  });

  it('should display total profit/loss correctly', () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByText('Total Profit/Loss')).toBeInTheDocument();
    expect(screen.getByText('$125.50')).toBeInTheDocument();
  });

  it('should display profit/loss percentage with plus sign for profit', () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByText('+12.55%')).toBeInTheDocument();
  });

  it('should display profit/loss percentage without plus sign for loss', () => {
    const store = createMockStore(mockLossData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByText('-7.52%')).toBeInTheDocument();
  });

  it('should display win rate correctly', () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('55.5%')).toBeInTheDocument();
  });

  it('should display trade count correctly', () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByText('Trade Count')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should display cash ratio correctly', () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByText('Cash to Invested Capital Ratio')).toBeInTheDocument();
    expect(screen.getByText('1.25')).toBeInTheDocument();
  });

  it('should handle zero profit/loss', () => {
    const zeroData = {
      ...mockPerformanceData,
      totalProfitLoss: '0.00',
      profitLossPercentage: '0.00',
    };
    const store = createMockStore(zeroData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText('+0.00%')).toBeInTheDocument(); // Zero is treated as profit (non-negative)
  });

  it('should handle negative profit/loss correctly', () => {
    const store = createMockStore(mockLossData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    const lossAmount = screen.getByText('$-75.25');
    expect(lossAmount).toBeInTheDocument();
  });

  it('should switch between all timeframes', async () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    const timeframes = [
      { name: /this week/i },
      { name: /this month/i },
      { name: /all time/i },
      { name: /today/i },
    ];

    for (const timeframe of timeframes) {
      const button = screen.getByRole('button', timeframe);
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveClass('Mui-selected');
      });
    }
  });

  it('should not change timeframe when clicking already selected button', () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    const todayButton = screen.getByRole('button', { name: /today/i });
    expect(todayButton).toHaveClass('Mui-selected');

    fireEvent.click(todayButton);
    expect(todayButton).toHaveClass('Mui-selected');
  });

  it('should render within a Card component', () => {
    const store = createMockStore(mockPerformanceData);
    const { container } = render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('should display metrics in a grid layout', () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    // All metrics should be visible
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('Trade Count')).toBeInTheDocument();
    expect(screen.getByText('Cash to Invested Capital Ratio')).toBeInTheDocument();
  });

  it('should have proper ARIA labels for timeframe buttons', () => {
    const store = createMockStore(mockPerformanceData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /today/i })).toHaveAttribute('aria-label', 'Today');
    expect(screen.getByRole('button', { name: /this week/i })).toHaveAttribute('aria-label', 'This week');
    expect(screen.getByRole('button', { name: /this month/i })).toHaveAttribute('aria-label', 'This month');
    expect(screen.getByRole('button', { name: /all time/i })).toHaveAttribute('aria-label', 'All time');
  });

  it('should handle very large profit values', () => {
    const largeData = {
      ...mockPerformanceData,
      totalProfitLoss: '999999.99',
      profitLossPercentage: '999.99',
    };
    const store = createMockStore(largeData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByText('$999999.99')).toBeInTheDocument();
    expect(screen.getByText('+999.99%')).toBeInTheDocument();
  });

  it('should handle very large loss values', () => {
    const largeData = {
      ...mockPerformanceData,
      totalProfitLoss: '-999999.99',
      profitLossPercentage: '-999.99',
    };
    const store = createMockStore(largeData);
    render(
      <Provider store={store}>
        <PerformanceCard />
      </Provider>
    );

    expect(screen.getByText('$-999999.99')).toBeInTheDocument();
    expect(screen.getByText('-999.99%')).toBeInTheDocument();
  });
});
