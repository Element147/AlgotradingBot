import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/mocks/server';

import { EnvironmentSwitch } from './EnvironmentSwitch';
import environmentReducer from './environmentSlice';
import authReducer from '@/features/auth/authSlice';
import { accountApi } from '@/features/account/accountApi';
import { WebSocketManager } from '@/services/websocket';

const API_BASE_URL = 'http://localhost:8080';

const waitForDialogToClose = async () => {
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
};

/**
 * Integration Tests: Environment Switching
 * 
 * Tests the complete environment switching flow including:
 * - X-Environment header updates in API calls
 * - Different data fetching for test vs live environments
 * - WebSocket reconnection with new environment channels
 * - Environment mode persistence across page reloads
 * 
 * Validates Requirements: 30.19
 */
describe('Environment Switching Integration Tests', () => {
  let store: ReturnType<typeof configureStore>;
  let mockWebSocketManager: WebSocketManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Set initial environment to 'test' for consistent test state
    localStorage.setItem('environment_mode', 'test');

    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        environment: environmentReducer,
        auth: authReducer,
        [accountApi.reducerPath]: accountApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(accountApi.middleware),
    });

    // Mock WebSocket manager
    mockWebSocketManager = new WebSocketManager('ws://localhost:8080/ws');
    vi.spyOn(mockWebSocketManager, 'connect');
    vi.spyOn(mockWebSocketManager, 'disconnect');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Environment switch updates X-Environment header in API calls
   * 
   * Validates that when switching from test to live environment,
   * subsequent API calls include the correct X-Environment header.
   */
  it('should update X-Environment header in API calls when switching environments', async () => {
    const user = userEvent.setup();
    let capturedHeaders: Headers | null = null;

    // Mock balance endpoint to capture headers
    server.use(
      http.get(`${API_BASE_URL}/api/account/balance`, ({ request }) => {
        capturedHeaders = request.headers;
        const environment = request.headers.get('X-Environment');

        if (environment === 'test') {
          return HttpResponse.json({
            total: '1000.00',
            available: '800.00',
            locked: '200.00',
            assets: [
              { symbol: 'USDT', amount: '1000.00', valueUSD: '1000.00' },
            ],
            lastSync: new Date().toISOString(),
          });
        } else if (environment === 'live') {
          return HttpResponse.json({
            total: '5000.00',
            available: '4500.00',
            locked: '500.00',
            assets: [
              { symbol: 'USDT', amount: '3000.00', valueUSD: '3000.00' },
              { symbol: 'BTC', amount: '0.05', valueUSD: '2000.00' },
            ],
            lastSync: new Date().toISOString(),
          });
        }

        return HttpResponse.json({ error: 'Invalid environment' }, { status: 400 });
      })
    );

    // Render component
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    // Initial state should be 'test'
    const testButton = screen.getByRole('button', { name: /test environment/i });
    expect(testButton).toHaveAttribute('aria-pressed', 'true');

    // Trigger balance fetch in test mode
    store.dispatch(accountApi.endpoints.getBalance.initiate());
    await waitFor(() => {
      expect(capturedHeaders).not.toBeNull();
    });

    // Verify X-Environment header is 'test'
    expect(capturedHeaders?.get('X-Environment')).toBe('test');

    // Reset captured headers
    capturedHeaders = null;

    // Switch to live environment
    await user.click(screen.getByRole('button', { name: /live trading/i }));

    // Confirm dialog should appear
    expect(
      screen.getByText(/switch to live trading environment/i)
    ).toBeInTheDocument();

    // Confirm the switch
    await user.click(screen.getByRole('button', { name: /confirm switch/i }));

    // Wait for dialog to close
    await waitForDialogToClose();

    // Verify live mode is active
    const liveButton = screen.getByRole('button', { name: /live trading/i });
    await waitFor(() => {
      expect(liveButton).toHaveAttribute('aria-pressed', 'true');
    });

    // Reset captured headers
    capturedHeaders = null;

    // Trigger balance fetch in live mode (force refetch)
    store.dispatch(accountApi.endpoints.getBalance.initiate(undefined, { forceRefetch: true }));
    await waitFor(() => {
      expect(capturedHeaders).not.toBeNull();
    });

    // Verify X-Environment header is now 'live'
    expect(capturedHeaders?.get('X-Environment')).toBe('live');
  });

  /**
   * Test: Switching from test to live fetches different balance data
   * 
   * Validates that the API returns different data based on the
   * environment mode, and the UI reflects the correct data.
   */
  it('should fetch different balance data when switching from test to live', async () => {
    const user = userEvent.setup();

    // Mock balance endpoint with environment-specific data
    server.use(
      http.get(`${API_BASE_URL}/api/account/balance`, ({ request }) => {
        const environment = request.headers.get('X-Environment');

        if (environment === 'test') {
          return HttpResponse.json({
            total: '1000.00',
            available: '800.00',
            locked: '200.00',
            assets: [
              { symbol: 'USDT', amount: '1000.00', valueUSD: '1000.00' },
            ],
            lastSync: new Date().toISOString(),
          });
        } else if (environment === 'live') {
          return HttpResponse.json({
            total: '5000.00',
            available: '4500.00',
            locked: '500.00',
            assets: [
              { symbol: 'USDT', amount: '3000.00', valueUSD: '3000.00' },
              { symbol: 'BTC', amount: '0.05', valueUSD: '2000.00' },
            ],
            lastSync: new Date().toISOString(),
          });
        }

        return HttpResponse.json({ error: 'Invalid environment' }, { status: 400 });
      })
    );

    // Render component
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    // Fetch balance in test mode
    const testBalancePromise = store.dispatch(
      accountApi.endpoints.getBalance.initiate()
    );
    const testBalanceResult = await testBalancePromise;

    // Verify test environment data
    expect(testBalanceResult.data).toEqual(
      expect.objectContaining({
        total: '1000.00',
        available: '800.00',
        locked: '200.00',
      })
    );
    expect(testBalanceResult.data?.assets).toHaveLength(1);
    expect(testBalanceResult.data?.assets[0].symbol).toBe('USDT');

    // Switch to live environment
    await user.click(screen.getByRole('button', { name: /live trading/i }));
    await user.click(screen.getByRole('button', { name: /confirm switch/i }));

    // Wait for switch to complete
    await waitForDialogToClose();
    const liveButton = screen.getByRole('button', { name: /live trading/i });
    await waitFor(() => {
      expect(liveButton).toHaveAttribute('aria-pressed', 'true');
    });

    // Fetch balance in live mode (force refetch to bypass cache)
    const liveBalancePromise = store.dispatch(
      accountApi.endpoints.getBalance.initiate(undefined, { forceRefetch: true })
    );
    const liveBalanceResult = await liveBalancePromise;

    // Verify live environment data (different from test)
    expect(liveBalanceResult.data).toEqual(
      expect.objectContaining({
        total: '5000.00',
        available: '4500.00',
        locked: '500.00',
      })
    );
    expect(liveBalanceResult.data?.assets).toHaveLength(2);
    expect(liveBalanceResult.data?.assets[0].symbol).toBe('USDT');
    expect(liveBalanceResult.data?.assets[1].symbol).toBe('BTC');

    // Verify data is different
    expect(testBalanceResult.data?.total).not.toBe(liveBalanceResult.data?.total);
  });

  /**
   * Test: WebSocket reconnects with new environment channels
   * 
   * Validates that when switching environments, the WebSocket
   * connection is closed and reopened with the new environment channels.
   */
  it('should reconnect WebSocket with new environment channels when switching', async () => {
    const user = userEvent.setup();

    // Mock WebSocket connection
    const mockConnect = vi.fn().mockResolvedValue(undefined);
    const mockDisconnect = vi.fn();
    mockWebSocketManager.connect = mockConnect;
    mockWebSocketManager.disconnect = mockDisconnect;

    // Render component with WebSocket integration
    render(
      <Provider store={store}>
        <EnvironmentSwitch
          onSwitch={(mode) => {
            // Simulate WebSocket reconnection on environment switch
            mockWebSocketManager.disconnect();
            mockWebSocketManager.connect('mock-token', mode);
          }}
        />
      </Provider>
    );

    // Initial connection in test mode
    await mockWebSocketManager.connect('mock-token', 'test');
    expect(mockConnect).toHaveBeenCalledWith('mock-token', 'test');

    // Switch to live environment
    await user.click(screen.getByRole('button', { name: /live trading/i }));
    await user.click(screen.getByRole('button', { name: /confirm switch/i }));

    // Wait for switch to complete
    await waitForDialogToClose();
    const liveButton = screen.getByRole('button', { name: /live trading/i });
    await waitFor(() => {
      expect(liveButton).toHaveAttribute('aria-pressed', 'true');
    });

    // Verify WebSocket was disconnected and reconnected with new environment
    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockConnect).toHaveBeenCalledWith('mock-token', 'live');
    expect(mockConnect).toHaveBeenCalledTimes(2); // Initial + after switch
  });

  /**
   * Test: Environment mode persists across page reload
   * 
   * Validates that the selected environment mode is saved to
   * localStorage and restored when the application reloads.
   */
  it('should persist environment mode to localStorage and restore on reload', async () => {
    const user = userEvent.setup();

    // Render component
    const { unmount } = render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    // Initial state should be 'test'
    const testButton = screen.getByRole('button', { name: /test environment/i });
    expect(testButton).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('environment_mode')).toBe('test');

    // Switch to live environment
    await user.click(screen.getByRole('button', { name: /live trading/i }));
    await user.click(screen.getByRole('button', { name: /confirm switch/i }));

    // Wait for switch to complete
    await waitForDialogToClose();
    const liveButton = screen.getByRole('button', { name: /live trading/i });
    await waitFor(() => {
      expect(liveButton).toHaveAttribute('aria-pressed', 'true');
    });

    // Verify localStorage was updated
    expect(localStorage.getItem('environment_mode')).toBe('live');

    // Unmount component (simulate page unload)
    unmount();

    // Create new store (simulates page reload)
    const newStore = configureStore({
      reducer: {
        environment: environmentReducer,
        auth: authReducer,
        [accountApi.reducerPath]: accountApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(accountApi.middleware),
    });

    // Render component again (simulate page reload)
    render(
      <Provider store={newStore}>
        <EnvironmentSwitch />
      </Provider>
    );

    // Verify environment mode was restored from localStorage
    const restoredLiveButton = screen.getByRole('button', { name: /live trading/i });
    expect(restoredLiveButton).toHaveAttribute('aria-pressed', 'true');
    expect(newStore.getState().environment.mode).toBe('live');
  });

  /**
   * Test: Environment switch invalidates cached API data
   * 
   * Validates that when switching environments, cached API data
   * is invalidated and fresh data is fetched for the new environment.
   */
  it('should invalidate cached data when switching environments', async () => {
    const user = userEvent.setup();
    let requestCount = 0;

    // Mock balance endpoint to track request count
    server.use(
      http.get(`${API_BASE_URL}/api/account/balance`, ({ request }) => {
        requestCount++;
        const environment = request.headers.get('X-Environment');

        return HttpResponse.json({
          total: environment === 'test' ? '1000.00' : '5000.00',
          available: environment === 'test' ? '800.00' : '4500.00',
          locked: environment === 'test' ? '200.00' : '500.00',
          assets: [],
          lastSync: new Date().toISOString(),
        });
      })
    );

    // Render component
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    // Fetch balance in test mode (first request)
    await store.dispatch(accountApi.endpoints.getBalance.initiate());
    expect(requestCount).toBe(1);

    // Fetch again - should use cache (no new request)
    await store.dispatch(accountApi.endpoints.getBalance.initiate());
    expect(requestCount).toBe(1); // Still 1, used cache

    // Switch to live environment
    await user.click(screen.getByRole('button', { name: /live trading/i }));
    await user.click(screen.getByRole('button', { name: /confirm switch/i }));

    await waitForDialogToClose();
    const liveButton = screen.getByRole('button', { name: /live trading/i });
    await waitFor(() => {
      expect(liveButton).toHaveAttribute('aria-pressed', 'true');
    });

    // Fetch balance in live mode - should make new request (different environment = different cache key)
    await store.dispatch(accountApi.endpoints.getBalance.initiate());
    
    // Wait for request to complete
    await waitFor(() => {
      expect(requestCount).toBe(2);
    });
  });

  /**
   * Test: Cancel environment switch dialog
   * 
   * Validates that canceling the confirmation dialog does not
   * change the environment mode or trigger any side effects.
   */
  it('should not switch environment when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onSwitchMock = vi.fn();

    // Render component
    render(
      <Provider store={store}>
        <EnvironmentSwitch onSwitch={onSwitchMock} />
      </Provider>
    );

    // Initial state should be 'test'
    const testButton = screen.getByRole('button', { name: /test environment/i });
    expect(testButton).toHaveAttribute('aria-pressed', 'true');

    // Click live trading button
    await user.click(screen.getByRole('button', { name: /live trading/i }));

    // Confirm dialog should appear
    expect(
      screen.getByText(/switch to live trading environment/i)
    ).toBeInTheDocument();

    // Click cancel
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Wait for dialog to close
    await waitForDialogToClose();

    // Verify environment did not change
    const stillTestButton = screen.getByRole('button', { name: /test environment/i });
    expect(stillTestButton).toHaveAttribute('aria-pressed', 'true');
    expect(store.getState().environment.mode).toBe('test');
    expect(localStorage.getItem('environment_mode')).toBe('test');

    // Verify callback was not called
    expect(onSwitchMock).not.toHaveBeenCalled();
  });

  /**
   * Test: Environment badge displays correct label
   * 
   * Validates that the environment badge shows the correct label
   * based on the current environment mode and connected exchange.
   */
  it('should display correct environment badge label', async () => {
    const user = userEvent.setup();

    // Render component
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    // Initial badge should show "Test Environment"
    expect(screen.getByText('Test Environment')).toBeInTheDocument();

    // Switch to live environment
    await user.click(screen.getByRole('button', { name: /live trading/i }));
    await user.click(screen.getByRole('button', { name: /confirm switch/i }));

    // Wait for dialog to close and state to update
    await waitForDialogToClose();

    // Badge should show "Live Trading"
    await waitFor(() => {
      const chip = screen.queryByRole('status', { hidden: true }) ??
        document.querySelector('.MuiChip-label');
      expect(chip).not.toBeNull();
      expect(chip).toHaveTextContent('Live Trading');
    });

    // Verify the live button is now pressed
    const liveButton = screen.getByRole('button', { name: /live trading/i });
    expect(liveButton).toHaveAttribute('aria-pressed', 'true');
    const chip = screen.getByText('Live Trading', { selector: '.MuiChip-label' });
    expect(chip).toBeInTheDocument();
  });
});






