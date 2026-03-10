import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardPage from './DashboardPage';
import authReducer from '../auth/authSlice';
import environmentReducer from '../environment/environmentSlice';

// Mock the child components
vi.mock('./BalanceCard', () => ({
  BalanceCard: () => <div data-testid="balance-card">Balance Card</div>,
}));

vi.mock('./PerformanceCard', () => ({
  PerformanceCard: () => <div data-testid="performance-card">Performance Card</div>,
}));

vi.mock('./PositionsList', () => ({
  PositionsList: () => <div data-testid="positions-list">Positions List</div>,
}));

vi.mock('./RecentTradesList', () => ({
  RecentTradesList: () => <div data-testid="recent-trades-list">Recent Trades</div>,
}));

vi.mock('./SystemHealthIndicator', () => ({
  SystemHealthIndicator: () => <div data-testid="system-health">System Health</div>,
}));

vi.mock('@/components/layout/AppLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

describe('DashboardPage', () => {
  const createMockStore = () => {
    return configureStore({
      reducer: {
        auth: authReducer,
        environment: environmentReducer,
      },
      preloadedState: {
        auth: {
          token: 'mock-token',
          refreshToken: null,
          user: null,
          isAuthenticated: true,
          loading: false,
          error: null,
          sessionExpiry: null,
          lastActivity: null,
        },
        environment: {
          mode: 'test',
          connectedExchange: null,
          lastSyncTime: null,
        },
      },
    });
  };

  it('should render dashboard page with title', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render within AppLayout', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  });

  it('should render BalanceCard component', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    expect(screen.getByTestId('balance-card')).toBeInTheDocument();
  });

  it('should render PerformanceCard component', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    expect(screen.getByTestId('performance-card')).toBeInTheDocument();
  });

  it('should render both cards in grid layout', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    const balanceCard = screen.getByTestId('balance-card');
    const performanceCard = screen.getByTestId('performance-card');

    expect(balanceCard).toBeInTheDocument();
    expect(performanceCard).toBeInTheDocument();
  });
});
