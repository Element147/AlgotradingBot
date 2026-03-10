import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { accountApi } from '@/features/account/accountApi';
import { authApi } from '@/features/auth/authApi';
import authReducer from '@/features/auth/authSlice';
import environmentReducer from '@/features/environment/environmentSlice';
import settingsReducer from '@/features/settings/settingsSlice';
import websocketReducer from '@/features/websocket/websocketSlice';
import { websocketMiddleware } from '@/features/websocket/websocketMiddleware';

/**
 * Redux store configuration with RTK Query integration
 * 
 * Features:
 * - Centralized state management
 * - RTK Query for API caching and data fetching
 * - Redux DevTools integration (development only)
 * - Automatic refetch on focus/reconnect
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    environment: environmentReducer,
    settings: settingsReducer,
    websocket: websocketReducer,
    [authApi.reducerPath]: authApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configure serialization checks for development
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      authApi.middleware,
      accountApi.middleware,
      websocketMiddleware
    ),
  // Enable Redux DevTools in development only
  devTools: import.meta.env.DEV,
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
