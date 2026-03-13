/**
 * WebSocket Manager
 * Handles WebSocket connection lifecycle, reconnection logic, and event routing
 */

export type WebSocketEventType =
  | 'balance.updated'
  | 'trade.executed'
  | 'position.updated'
  | 'strategy.status'
  | 'risk.alert'
  | 'system.error';

export interface WebSocketEvent {
  type: WebSocketEventType;
  environment: 'test' | 'live';
  timestamp: string;
  data: unknown;
}

export type WebSocketEventHandler = (event: WebSocketEvent) => void;

interface SubscriptionHandlers {
  [channel: string]: Set<WebSocketEventHandler>;
}

interface WebSocketLike {
  readyState: number;
  onopen: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export type WebSocketLikeConstructor = new (url: string) => WebSocketLike;

interface ResolveWebSocketUrlOptions {
  pageUrl?: string;
  production?: boolean;
}

const WS_CONNECTING = 0;
const WS_OPEN = 1;
const WS_CLOSING = 2;
const WS_CLOSED = 3;

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error('Unknown WebSocket error');

const getDefaultPageUrl = (): string => {
  if (typeof window !== 'undefined' && window.location?.href) {
    return window.location.href;
  }

  return 'http://localhost:5173/';
};

const buildLocalDevWebSocketUrl = (): string => {
  const url = new URL('http://localhost:8080/ws');
  url.protocol = 'ws:';
  return url.toString();
};

export const resolveWebSocketUrl = (
  configuredUrl?: string,
  options: ResolveWebSocketUrlOptions = {}
): string => {
  const production = options.production ?? import.meta.env.PROD;
  const pageUrl = new URL(options.pageUrl ?? getDefaultPageUrl());

  if (!configuredUrl || configuredUrl.trim() === '') {
    if (!production) {
      return buildLocalDevWebSocketUrl();
    }

    const sameOriginUrl = new URL('/ws', pageUrl);
    sameOriginUrl.protocol = 'wss:';
    return sameOriginUrl.toString();
  }

  const resolvedUrl = new URL(configuredUrl, pageUrl);

  if (production) {
    if (resolvedUrl.protocol === 'wss:') {
      return resolvedUrl.toString();
    }

    if (
      (resolvedUrl.protocol === 'http:' || resolvedUrl.protocol === 'https:') &&
      resolvedUrl.origin === pageUrl.origin
    ) {
      resolvedUrl.protocol = 'wss:';
      return resolvedUrl.toString();
    }

    throw new Error(
      'Production WebSocket URL must resolve to a secure same-origin WebSocket endpoint'
    );
  }

  if (resolvedUrl.protocol === 'http:' || resolvedUrl.protocol === 'https:') {
    resolvedUrl.protocol = resolvedUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  }

  return resolvedUrl.toString();
};

export class WebSocketManager {
  private ws: WebSocketLike | null = null;
  private url: string;
  private token: string | null = null;
  private environment: 'test' | 'live' = 'test';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 5000; // 5 seconds
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private subscriptions: SubscriptionHandlers = {};
  private isConnecting = false;
  private shouldReconnect = true;
  private webSocketConstructor: WebSocketLikeConstructor;

  constructor(url: string, webSocketConstructor?: WebSocketLikeConstructor) {
    this.url = url;
    this.webSocketConstructor =
      webSocketConstructor ?? (WebSocket as unknown as WebSocketLikeConstructor);
  }

  /**
   * Connect to WebSocket server with authentication token
   */
  connect(token: string, environment: 'test' | 'live' = 'test'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WS_OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.token = token;
      this.environment = environment;
      this.isConnecting = true;
      this.shouldReconnect = true;

      try {
        // Include auth token and environment in URL
        const wsUrl = `${this.url}?token=${encodeURIComponent(token)}&env=${environment}`;
        this.ws = new this.webSocketConstructor(wsUrl);

        this.ws.onopen = () => {
          console.warn('[WebSocket] Connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.subscribeToChannels();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.isConnecting = false;
        };

        this.ws.onclose = (event) => {
          console.warn('[WebSocket] Connection closed:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;

          if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(toError(error));
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.subscriptions = {};
    this.reconnectAttempts = 0;
  }

  /**
   * Subscribe to WebSocket events
   */
  subscribe(channel: string, handler: WebSocketEventHandler): () => void {
    if (!this.subscriptions[channel]) {
      this.subscriptions[channel] = new Set();
    }

    this.subscriptions[channel].add(handler);

    // Return unsubscribe function
    return () => {
      this.subscriptions[channel]?.delete(handler);
      if (this.subscriptions[channel]?.size === 0) {
        delete this.subscriptions[channel];
      }
    };
  }

  /**
   * Get current connection state
   */
  getState(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.ws) return 'closed';

    switch (this.ws.readyState) {
      case WS_CONNECTING:
        return 'connecting';
      case WS_OPEN:
        return 'open';
      case WS_CLOSING:
        return 'closing';
      case WS_CLOSED:
        return 'closed';
      default:
        return 'closed';
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WS_OPEN;
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const rawMessage =
        typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
      const message = JSON.parse(rawMessage) as WebSocketEvent;

      // Route event to subscribed handlers
      const handlers = this.subscriptions[message.type];
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            console.error('[WebSocket] Handler error:', error);
          }
        });
      }

      // Also notify wildcard subscribers
      const wildcardHandlers = this.subscriptions['*'];
      if (wildcardHandlers) {
        wildcardHandlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            console.error('[WebSocket] Wildcard handler error:', error);
          }
        });
      }
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error);
    }
  }

  /**
   * Subscribe to environment-aware channels
   */
  private subscribeToChannels(): void {
    if (!this.ws || this.ws.readyState !== WS_OPEN) {
      return;
    }

    const channels = [
      `${this.environment}.balance`,
      `${this.environment}.trades`,
      `${this.environment}.positions`,
      `${this.environment}.strategies`,
      `${this.environment}.risk`,
    ];

    this.ws.send(
      JSON.stringify({
        type: 'subscribe',
        channels,
      })
    );

    console.warn('[WebSocket] Subscribed to channels:', channels);
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    console.warn(
      `[WebSocket] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      if (this.token && this.shouldReconnect) {
        console.warn(
          `[WebSocket] Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.connect(this.token, this.environment).catch((error) => {
          console.error('[WebSocket] Reconnection failed:', error);
        });
      }
    }, this.reconnectDelay);
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

/**
 * Get or create WebSocket manager instance
 */
export const getWebSocketManager = (): WebSocketManager => {
  if (!wsManager) {
    const wsUrl = resolveWebSocketUrl(import.meta.env.VITE_WS_URL);
    wsManager = new WebSocketManager(wsUrl);
  }
  return wsManager;
};

/**
 * Set WebSocket manager instance (for testing)
 */
export const setWebSocketManager = (manager: WebSocketManager | null): void => {
  wsManager = manager;
};
