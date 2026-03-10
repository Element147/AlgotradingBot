import { configureStore } from '@reduxjs/toolkit';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi } from 'vitest';

import environmentReducer from './environmentSlice';
import { EnvironmentSwitch } from './EnvironmentSwitch';

const createMockStore = (initialState = {}) => configureStore({
    reducer: {
      environment: environmentReducer,
    },
    preloadedState: {
      environment: {
        mode: 'test',
        connectedExchange: null,
        lastSyncTime: null,
        ...initialState,
      },
    },
  });

describe('EnvironmentSwitch', () => {
  it('should render toggle buttons for test and live modes', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /test environment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /live trading/i })).toBeInTheDocument();
  });

  it('should display current mode as selected', () => {
    const store = createMockStore({ mode: 'test' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    const testButton = screen.getByRole('button', { name: /test environment/i });
    expect(testButton).toHaveClass('Mui-selected');
  });

  it('should display environment badge with correct label for test mode', () => {
    const store = createMockStore({ mode: 'test' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    expect(screen.getByText('Test Environment')).toBeInTheDocument();
  });

  it('should display environment badge with correct label for live mode', () => {
    const store = createMockStore({ mode: 'live' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    // Use getAllByText since "Live Trading" appears in both button and badge
    const liveTradingElements = screen.getAllByText('Live Trading');
    expect(liveTradingElements.length).toBeGreaterThan(0);
  });

  it('should display connected exchange name when in live mode', () => {
    const store = createMockStore({ mode: 'live', connectedExchange: 'binance' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    expect(screen.getByText('Binance')).toBeInTheDocument();
  });

  it('should open confirmation dialog when switching modes', async () => {
    const store = createMockStore({ mode: 'test' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    const liveButton = screen.getByRole('button', { name: /live trading/i });
    fireEvent.click(liveButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Switch to Live Trading Environment/i)).toBeInTheDocument();
    });
  });

  it('should display appropriate warning message for live mode switch', async () => {
    const store = createMockStore({ mode: 'test' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    const liveButton = screen.getByRole('button', { name: /live trading/i });
    fireEvent.click(liveButton);

    await waitFor(() => {
      expect(screen.getByText(/real trading data/i)).toBeInTheDocument();
    });
  });

  it('should display appropriate warning message for test mode switch', async () => {
    const store = createMockStore({ mode: 'live' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    const testButton = screen.getByRole('button', { name: /test environment/i });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText(/simulated trading data/i)).toBeInTheDocument();
    });
  });

  it('should close dialog and not switch mode when cancel is clicked', async () => {
    const store = createMockStore({ mode: 'test' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    const liveButton = screen.getByRole('button', { name: /live trading/i });
    fireEvent.click(liveButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Mode should still be test
    expect(store.getState().environment.mode).toBe('test');
  });

  it('should switch mode and close dialog when confirm is clicked', async () => {
    const store = createMockStore({ mode: 'test' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    const liveButton = screen.getByRole('button', { name: /live trading/i });
    fireEvent.click(liveButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm switch/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Mode should be updated to live
    expect(store.getState().environment.mode).toBe('live');
  });

  it('should call onSwitch callback when mode is changed', async () => {
    const onSwitch = vi.fn();
    const store = createMockStore({ mode: 'test' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch onSwitch={onSwitch} />
      </Provider>
    );

    const liveButton = screen.getByRole('button', { name: /live trading/i });
    fireEvent.click(liveButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm switch/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onSwitch).toHaveBeenCalledWith('live');
    });
  });

  it('should not open dialog when clicking the already selected mode', () => {
    const store = createMockStore({ mode: 'test' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    const testButton = screen.getByRole('button', { name: /test environment/i });
    fireEvent.click(testButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should persist mode to localStorage when confirmed', async () => {
    localStorage.clear();
    const store = createMockStore({ mode: 'test' });
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );

    const liveButton = screen.getByRole('button', { name: /live trading/i });
    fireEvent.click(liveButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm switch/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(localStorage.getItem('environment_mode')).toBe('live');
    });
  });
});
