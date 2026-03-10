/**
 * WebSocket Redux Slice
 * Manages WebSocket connection state in Redux store
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastReconnectAttempt: string | null;
  reconnectAttempts: number;
  subscribedChannels: string[];
  lastEventTime: string | null;
}

const initialState: WebSocketState = {
  connected: false,
  connecting: false,
  error: null,
  lastReconnectAttempt: null,
  reconnectAttempts: 0,
  subscribedChannels: [],
  lastEventTime: null,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    connectionStarted: (state) => {
      state.connecting = true;
      state.error = null;
    },
    connectionEstablished: (state, action: PayloadAction<string[]>) => {
      state.connected = true;
      state.connecting = false;
      state.error = null;
      state.reconnectAttempts = 0;
      state.subscribedChannels = action.payload;
    },
    connectionFailed: (state, action: PayloadAction<string>) => {
      state.connected = false;
      state.connecting = false;
      state.error = action.payload;
    },
    connectionClosed: (state) => {
      state.connected = false;
      state.connecting = false;
      state.subscribedChannels = [];
    },
    reconnectAttempted: (state) => {
      state.reconnectAttempts += 1;
      state.lastReconnectAttempt = new Date().toISOString();
    },
    eventReceived: (state, action: PayloadAction<string>) => {
      state.lastEventTime = action.payload;
    },
    resetState: () => initialState,
  },
});

export const {
  connectionStarted,
  connectionEstablished,
  connectionFailed,
  connectionClosed,
  reconnectAttempted,
  eventReceived,
  resetState,
} = websocketSlice.actions;

// Selectors
const selectWebSocketSlice = (state: { websocket?: WebSocketState }) => state.websocket ?? initialState;

export const selectWebSocketState = (state: { websocket?: WebSocketState }) =>
  selectWebSocketSlice(state);
export const selectIsConnected = (state: { websocket?: WebSocketState }) =>
  selectWebSocketSlice(state).connected;
export const selectIsConnecting = (state: { websocket?: WebSocketState }) =>
  selectWebSocketSlice(state).connecting;
export const selectConnectionError = (state: { websocket?: WebSocketState }) =>
  selectWebSocketSlice(state).error;
export const selectReconnectAttempts = (state: { websocket?: WebSocketState }) =>
  selectWebSocketSlice(state).reconnectAttempts;
export const selectSubscribedChannels = (state: { websocket?: WebSocketState }) =>
  selectWebSocketSlice(state).subscribedChannels;
export const selectLastEventTime = (state: { websocket?: WebSocketState }) =>
  selectWebSocketSlice(state).lastEventTime;
export default websocketSlice.reducer;

