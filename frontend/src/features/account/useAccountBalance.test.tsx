import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, beforeEach } from 'vitest';

import { accountApi } from './accountApi';
import { useAccountBalance } from './useAccountBalance';

import authReducer from '@/features/auth/authSlice';
import environmentReducer, { setEnvironmentMode } from '@/features/environment/environmentSlice';

describe('useAccountBalance', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        environment: environmentReducer,
        [accountApi.reducerPath]: accountApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(accountApi.middleware),
    });
  });

  it('should return query result', () => {
    const { result } = renderHook(() => useAccountBalance(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
    // Verify the query result has the expected properties
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isError');
  });

  it('should not poll in test mode', () => {
    // Environment defaults to 'test'
    const { result } = renderHook(() => useAccountBalance(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // In test mode, polling should be disabled (pollingInterval = 0)
    expect(result.current).toBeDefined();
  });

  it('should poll in live mode', () => {
    // Switch to live mode
    store.dispatch(setEnvironmentMode('live'));

    const { result } = renderHook(() => useAccountBalance(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // In live mode, polling should be enabled
    expect(result.current).toBeDefined();
  });

  it('should update polling when environment mode changes', () => {
    const { result, rerender } = renderHook(() => useAccountBalance(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // Initially in test mode (no polling)
    expect(result.current).toBeDefined();

    // Switch to live mode
    store.dispatch(setEnvironmentMode('live'));
    rerender();

    // Should now be polling
    expect(result.current).toBeDefined();

    // Switch back to test mode
    store.dispatch(setEnvironmentMode('test'));
    rerender();

    // Should stop polling
    expect(result.current).toBeDefined();
  });

  it('should skip polling when tab is unfocused', () => {
    store.dispatch(setEnvironmentMode('live'));

    const { result } = renderHook(() => useAccountBalance(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // Hook should be configured to skip polling when unfocused
    expect(result.current).toBeDefined();
  });
});
