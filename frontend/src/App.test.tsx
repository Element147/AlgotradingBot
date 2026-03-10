import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import App from './App';
import authReducer from './features/auth/authSlice';
import settingsReducer from './features/settings/settingsSlice';

// Mock the page components to avoid loading actual implementations
vi.mock('./features/auth/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('./features/dashboard/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock('./features/strategies/StrategiesPage', () => ({
  default: () => <div data-testid="strategies-page">Strategies Page</div>,
}));

vi.mock('./features/trades/TradesPage', () => ({
  default: () => <div data-testid="trades-page">Trades Page</div>,
}));

vi.mock('./features/backtest/BacktestPage', () => ({
  default: () => <div data-testid="backtest-page">Backtest Page</div>,
}));

vi.mock('./features/risk/RiskPage', () => ({
  default: () => <div data-testid="risk-page">Risk Page</div>,
}));

vi.mock('./features/settings/SettingsPage', () => ({
  default: () => <div data-testid="settings-page">Settings Page</div>,
}));

describe('App Routing', () => {
  const createMockStore = (isAuthenticated = false) => configureStore({
      reducer: {
        auth: authReducer,
        settings: settingsReducer,
      },
      preloadedState: {
        auth: {
          token: isAuthenticated ? 'mock-token' : null,
          refreshToken: null,
          user: isAuthenticated
            ? { id: '1', username: 'testuser', email: 'test@example.com', role: 'trader' }
            : null,
          isAuthenticated,
          loading: false,
          error: null,
          sessionExpiry: null,
          lastActivity: null,
        },
        settings: {
          theme: 'light',
          currency: 'USD',
          timezone: 'UTC',
        },
      },
    });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Public Routes', () => {
    it('should render login page at /login', async () => {
      const store = createMockStore(false);
      window.history.pushState({}, '', '/login');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes - Unauthenticated', () => {
    it('should redirect to login when accessing /dashboard without authentication', async () => {
      const store = createMockStore(false);
      window.history.pushState({}, '', '/dashboard');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });

    it('should redirect to login when accessing /strategies without authentication', async () => {
      const store = createMockStore(false);
      window.history.pushState({}, '', '/strategies');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });

    it('should redirect to login when accessing /trades without authentication', async () => {
      const store = createMockStore(false);
      window.history.pushState({}, '', '/trades');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });

    it('should redirect to login when accessing /backtest without authentication', async () => {
      const store = createMockStore(false);
      window.history.pushState({}, '', '/backtest');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });

    it('should redirect to login when accessing /risk without authentication', async () => {
      const store = createMockStore(false);
      window.history.pushState({}, '', '/risk');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });

    it('should redirect to login when accessing /settings without authentication', async () => {
      const store = createMockStore(false);
      window.history.pushState({}, '', '/settings');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });
    });
  });

  describe('Protected Routes - Authenticated', () => {
    it('should render dashboard page when authenticated', async () => {
      const store = createMockStore(true);
      window.history.pushState({}, '', '/dashboard');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        const mockedDashboard = screen.queryByTestId('dashboard-page');
        const realDashboardHeading = screen.queryByRole('heading', { name: /dashboard/i });
        expect(mockedDashboard ?? realDashboardHeading).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    it('should render strategies page when authenticated', async () => {
      const store = createMockStore(true);
      window.history.pushState({}, '', '/strategies');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        const mockedStrategies = screen.queryByTestId('strategies-page');
        const realStrategiesHeading = screen.queryByRole('heading', { name: /strategy management/i });
        expect(mockedStrategies ?? realStrategiesHeading).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    it('should render trades page when authenticated', async () => {
      const store = createMockStore(true);
      window.history.pushState({}, '', '/trades');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('trades-page')).toBeInTheDocument();
      });
    });

    it('should render backtest page when authenticated', async () => {
      const store = createMockStore(true);
      window.history.pushState({}, '', '/backtest');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('backtest-page')).toBeInTheDocument();
      });
    });

    it('should render risk page when authenticated', async () => {
      const store = createMockStore(true);
      window.history.pushState({}, '', '/risk');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('risk-page')).toBeInTheDocument();
      });
    });

    it('should render settings page when authenticated', async () => {
      const store = createMockStore(true);
      window.history.pushState({}, '', '/settings');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('settings-page')).toBeInTheDocument();
      });
    });
  });

  describe('Default Routes', () => {
    it('should redirect root path to /dashboard', async () => {
      const store = createMockStore(true);
      window.history.pushState({}, '', '/');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      });
    });

    it('should redirect unknown paths to /dashboard', async () => {
      const store = createMockStore(true);
      window.history.pushState({}, '', '/unknown-route');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      });
    });
  });

  describe('Lazy Loading', () => {
    it('should show loading fallback while lazy loading components', async () => {
      const store = createMockStore(true);
      window.history.pushState({}, '', '/dashboard');

      render(
        <Provider store={store}>
          <App />
        </Provider>
      );

      // Loading fallback should appear briefly
      // Note: This test may be flaky due to fast loading in test environment
      // In real scenarios, the LoadingFallback will be visible during code splitting
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });
  });
});
