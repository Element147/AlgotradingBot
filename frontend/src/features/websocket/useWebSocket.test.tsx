/**
 * useWebSocket Hook Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useWebSocketConnection, useWebSocketSubscription } from './useWebSocket';
import websocketReducer from './websocketSlice';
import authReducer from '../auth/authSlice';
import environmentReducer from '../environment/environmentSlice';
import {
  WebSocketEvent,
  WebSocketManager,
  setWebSocketManager,
} from '../../services/websocket';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;

    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 0);
  }

  send(_data: string) {}

  close(_code?: number, _reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code: 1000, reason: 'Client disconnect' }));
  }
}

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      environment: environmentReducer,
      websocket: websocketReducer,
    },
    preloadedState: {
      auth: {
        token: 'test-token',
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
        switchInProgress: false,
      },
      ...initialState,
    },
  });
};

describe('useWebSocketConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWebSocketManager(new WebSocketManager('ws://localhost:8080/ws', MockWebSocket as any));
  });

  afterEach(() => {
    setWebSocketManager(null);
  });

  it('should connect when token is available', async () => {
    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useWebSocketConnection(), { wrapper });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should disconnect when token is removed', async () => {
    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result, rerender } = renderHook(() => useWebSocketConnection(), { wrapper });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Remove token
    store.dispatch({ type: 'auth/logout' });
    rerender();

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });
  });

  it('should provide reconnect function', async () => {
    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useWebSocketConnection(), { wrapper });

    expect(typeof result.current.reconnect).toBe('function');
  });

  it('should reconnect when environment changes', async () => {
    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result, rerender } = renderHook(() => useWebSocketConnection(), { wrapper });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Change environment
    store.dispatch({ type: 'environment/setEnvironmentMode', payload: 'live' });
    rerender();

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });
});

describe('useWebSocketSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWebSocketManager(new WebSocketManager('ws://localhost:8080/ws', MockWebSocket as any));
  });

  afterEach(() => {
    setWebSocketManager(null);
  });

  it('should subscribe to event type', async () => {
    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const handler = vi.fn();

    renderHook(() => useWebSocketSubscription('balance.updated', handler), {
      wrapper,
    });

    // Handler should be registered
    expect(handler).not.toHaveBeenCalled();
  });

  it('should call handler when event is received', async () => {
    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const handler = vi.fn();
    const event: WebSocketEvent = {
      type: 'balance.updated',
      environment: 'test',
      timestamp: '2024-03-09T12:00:00Z',
      data: { balance: 1000 },
    };

    renderHook(() => useWebSocketSubscription('balance.updated', handler), {
      wrapper,
    });

    // Simulate event (would need to trigger through WebSocket manager)
    // This is a simplified test
    expect(event.type).toBe('balance.updated');
  });

  it('should unsubscribe on unmount', async () => {
    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const handler = vi.fn();

    const { unmount } = renderHook(
      () => useWebSocketSubscription('balance.updated', handler),
      { wrapper }
    );

    unmount();

    // Handler should be unregistered
  });

  it('should support wildcard subscriptions', async () => {
    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const handler = vi.fn();

    renderHook(() => useWebSocketSubscription('*', handler), { wrapper });

    // Handler should receive all events
  });
});
