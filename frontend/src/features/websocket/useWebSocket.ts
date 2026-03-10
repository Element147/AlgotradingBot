/**
 * useWebSocket Hook
 * Custom hook for managing WebSocket connections in React components
 */

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  getWebSocketManager,
  type WebSocketEventType,
  type WebSocketEventHandler,
} from '../../services/websocket';
import { selectAuthToken } from '../auth/authSlice';
import { selectEnvironmentMode } from '../environment/environmentSlice';

import {
  connectionStarted,
  connectionEstablished,
  connectionFailed,
  connectionClosed,
  eventReceived,
  selectIsConnected,
} from './websocketSlice';

/**
 * Hook to manage WebSocket connection lifecycle
 */
export const useWebSocketConnection = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const environment = useSelector(selectEnvironmentMode);
  const wsManager = getWebSocketManager();
  const isConnected = useSelector(selectIsConnected);

  useEffect(() => {
    if (!token) {
      // No token, disconnect if connected
      if (wsManager.isConnected()) {
        wsManager.disconnect();
        dispatch(connectionClosed());
      }
      return;
    }

    // Connect to WebSocket
    dispatch(connectionStarted());

    wsManager
      .connect(token, environment)
      .then(() => {
        const channels = [
          `${environment}.balance`,
          `${environment}.trades`,
          `${environment}.positions`,
          `${environment}.strategies`,
          `${environment}.risk`,
        ];
        dispatch(connectionEstablished(channels));
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Connection failed';
        dispatch(connectionFailed(message));
      });

    // Cleanup on unmount or token/environment change
    return () => {
      wsManager.disconnect();
      dispatch(connectionClosed());
    };
  }, [token, environment, dispatch, wsManager]);

  const reconnect = useCallback(() => {
    if (token) {
      dispatch(connectionStarted());
      wsManager
        .connect(token, environment)
        .then(() => {
          const channels = [
            `${environment}.balance`,
            `${environment}.trades`,
            `${environment}.positions`,
            `${environment}.strategies`,
            `${environment}.risk`,
          ];
          dispatch(connectionEstablished(channels));
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'Connection failed';
          dispatch(connectionFailed(message));
        });
    }
  }, [token, environment, dispatch, wsManager]);

  return {
    reconnect,
    isConnected,
    state: wsManager.getState(),
  };
};

/**
 * Hook to subscribe to WebSocket events
 */
export const useWebSocketSubscription = (
  eventType: WebSocketEventType | '*',
  handler: WebSocketEventHandler
) => {
  const dispatch = useDispatch();
  const wsManager = getWebSocketManager();

  useEffect(() => {
    // Wrap handler to dispatch eventReceived action
    const wrappedHandler: WebSocketEventHandler = (event) => {
      dispatch(eventReceived(new Date().toISOString()));
      handler(event);
    };

    // Subscribe to event
    const unsubscribe = wsManager.subscribe(eventType, wrappedHandler);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [eventType, handler, dispatch, wsManager]);
};




