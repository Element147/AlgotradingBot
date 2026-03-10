/**
 * WebSocket Redux Middleware
 * 
 * Integrates WebSocket events with Redux store by:
 * - Subscribing to WebSocket events
 * - Dispatching Redux actions on event receipt
 * - Implementing event throttling (max 1 update per second per type)
 * - Pausing event processing when tab is inactive
 * 
 * Requirements: 15.3, 15.4, 15.5, 15.11, 15.12
 */

import type { Middleware } from '@reduxjs/toolkit';

import { getWebSocketManager, type WebSocketEvent, type WebSocketEventType } from '../../services/websocket';
import { accountApi } from '../account/accountApi';

import { eventReceived } from './websocketSlice';

/**
 * Throttle state for event types
 */
interface ThrottleState {
  lastUpdate: number;
  pendingEvent: WebSocketEvent | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
}

/**
 * WebSocket middleware for Redux integration
 * 
 * Handles WebSocket events and dispatches appropriate Redux actions:
 * - balance.updated: Invalidates balance cache
 * - trade.executed: Invalidates balance and performance cache
 * - position.updated: Invalidates balance cache
 * - strategy.status: (Future implementation)
 * - risk.alert: (Future implementation)
 * - system.error: (Future implementation)
 */
export const websocketMiddleware: Middleware = (storeApi) => {
  const wsManager = getWebSocketManager();
  const throttleStates = new Map<WebSocketEventType, ThrottleState>();
  const THROTTLE_INTERVAL = 1000; // 1 second
  let isTabActive = true;

  // Track tab visibility
  const handleVisibilityChange = () => {
    isTabActive = !document.hidden;
    
    if (isTabActive) {
      console.warn('[WebSocket Middleware] Tab became active, resuming event processing');
      // Process any pending throttled events when tab becomes active
      throttleStates.forEach((state) => {
        if (state.pendingEvent) {
          processEvent(state.pendingEvent);
          state.pendingEvent = null;
        }
      });
    } else {
      console.warn('[WebSocket Middleware] Tab became inactive, pausing event processing');
    }
  };

  // Add visibility change listener
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  /**
   * Process WebSocket event and dispatch appropriate Redux actions
   */
  const processEvent = (event: WebSocketEvent) => {
    const { dispatch } = storeApi;

    // Update last event time in websocket slice
    dispatch(eventReceived(event.timestamp));

    // Handle different event types
    switch (event.type) {
      case 'balance.updated':
        console.warn('[WebSocket Middleware] Balance updated, invalidating cache');
        // Invalidate balance cache to trigger refetch
        dispatch(
          accountApi.util.invalidateTags(['Balance'])
        );
        break;

      case 'trade.executed':
        console.warn('[WebSocket Middleware] Trade executed, invalidating caches');
        // Invalidate both balance and performance caches
        dispatch(
          accountApi.util.invalidateTags(['Balance', 'Performance'])
        );
        break;

      case 'position.updated':
        console.warn('[WebSocket Middleware] Position updated, invalidating balance cache');
        // Invalidate balance cache (positions affect available balance)
        dispatch(
          accountApi.util.invalidateTags(['Balance'])
        );
        break;

      case 'strategy.status':
        console.warn('[WebSocket Middleware] Strategy status updated');
        // Future: Dispatch strategy-specific actions
        // For now, just log the event
        break;

      case 'risk.alert':
        console.warn('[WebSocket Middleware] Risk alert received:', event.data);
        // Future: Dispatch notification action
        // For now, just log the event
        break;

      case 'system.error':
        console.error('[WebSocket Middleware] System error:', event.data);
        // Future: Dispatch error notification action
        // For now, just log the error
        break;

      default:
        console.warn('[WebSocket Middleware] Unknown event type:', event.type);
    }
  };

  /**
   * Throttle event processing (max 1 update per second per type)
   */
  const throttleEvent = (event: WebSocketEvent) => {
    const eventType = event.type;
    const now = Date.now();

    // Get or create throttle state for this event type
    let state = throttleStates.get(eventType);
    if (!state) {
      state = {
        lastUpdate: 0,
        pendingEvent: null,
        timeoutId: null,
      };
      throttleStates.set(eventType, state);
    }

    const timeSinceLastUpdate = now - state.lastUpdate;

    if (timeSinceLastUpdate >= THROTTLE_INTERVAL) {
      // Enough time has passed, process immediately
      state.lastUpdate = now;
      state.pendingEvent = null;
      
      // Clear any pending timeout
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
      }

      processEvent(event);
    } else {
      // Too soon, throttle the event
      state.pendingEvent = event;

      // Schedule processing if not already scheduled
      if (!state.timeoutId) {
        const delay = THROTTLE_INTERVAL - timeSinceLastUpdate;
        state.timeoutId = setTimeout(() => {
          if (state.pendingEvent && isTabActive) {
            state.lastUpdate = Date.now();
            processEvent(state.pendingEvent);
          }
          state.pendingEvent = null;
          state.timeoutId = null;
        }, delay);
      }
    }
  };

  /**
   * Handle WebSocket events
   */
  const handleWebSocketEvent = (event: WebSocketEvent) => {
    // Pause event processing when tab is inactive
    if (!isTabActive) {
      console.warn('[WebSocket Middleware] Tab inactive, deferring event:', event.type);
      
      // Store the event to process when tab becomes active
      const state = throttleStates.get(event.type);
      if (state) {
        state.pendingEvent = event;
      } else {
        throttleStates.set(event.type, {
          lastUpdate: 0,
          pendingEvent: event,
          timeoutId: null,
        });
      }
      return;
    }

    // Throttle event processing
    throttleEvent(event);
  };

  // Subscribe to all WebSocket events
  const eventTypes: (WebSocketEventType | '*')[] = [
    'balance.updated',
    'trade.executed',
    'position.updated',
    'strategy.status',
    'risk.alert',
    'system.error',
  ];

  eventTypes.forEach((eventType) => {
    wsManager.subscribe(eventType, handleWebSocketEvent);
  });

  console.warn('[WebSocket Middleware] Initialized and subscribed to events');

  // Return the middleware function
  return (next) => (action) => 
    // Pass all actions through
     next(action)
  ;
};

