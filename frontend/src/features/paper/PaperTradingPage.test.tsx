import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import environmentReducer from '../environment/environmentSlice';

import PaperTradingPage from './PaperTradingPage';

const placeOrderMock = vi.fn();
const fillOrderMock = vi.fn();
const cancelOrderMock = vi.fn();

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/features/paperApi', () => ({
  useGetPaperTradingStateQuery: () => ({
    data: {
      paperMode: true,
      cashBalance: 10000,
      positionCount: 1,
      totalOrders: 2,
      openOrders: 1,
      filledOrders: 1,
      cancelledOrders: 0,
      lastOrderAt: '2026-03-20T09:00:00',
      lastPositionUpdateAt: '2026-03-20T09:05:00',
      staleOpenOrderCount: 0,
      stalePositionCount: 0,
      recoveryStatus: 'HEALTHY',
      recoveryMessage: 'Paper state looks healthy.',
      incidentSummary: 'No paper incidents detected.',
      alerts: [],
    },
    isLoading: false,
    isError: false,
  }),
  useGetPaperOrdersQuery: () => ({
    data: [
      {
        id: 11,
        symbol: 'BTC/USDT',
        side: 'BUY',
        status: 'NEW',
        quantity: 0.05,
        price: 50000,
        fillPrice: null,
        fees: null,
        slippage: null,
        createdAt: '2026-03-20T09:00:00',
      },
    ],
    isLoading: false,
    isError: false,
  }),
  usePlacePaperOrderMutation: () => [placeOrderMock, { isLoading: false }],
  useFillPaperOrderMutation: () => [fillOrderMock, { isLoading: false }],
  useCancelPaperOrderMutation: () => [cancelOrderMock, { isLoading: false }],
}));

vi.mock('@/services/api', () => ({
  getApiErrorMessage: () => 'failed',
}));

describe('PaperTradingPage', () => {
  const renderPage = () => {
    const store = configureStore({
      reducer: {
        environment: environmentReducer,
      },
      preloadedState: {
        environment: {
          mode: 'test',
          connectedExchange: null,
          lastSyncTime: null,
        },
      },
    });

    return render(
      <Provider store={store}>
        <PaperTradingPage />
      </Provider>
    );
  };

  beforeEach(() => {
    placeOrderMock.mockReset();
    fillOrderMock.mockReset();
    cancelOrderMock.mockReset();
    placeOrderMock.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          id: 12,
          status: 'FILLED',
        }),
    });
    fillOrderMock.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          id: 11,
          fillPrice: 50015,
          price: 50000,
        }),
    });
    cancelOrderMock.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 11 }),
    });
  });

  it('renders paper state and order queue', () => {
    renderPage();

    expect(screen.getByText('Paper-only execution')).toBeInTheDocument();
    expect(screen.getByText('Order entry')).toBeInTheDocument();
    expect(screen.getByText('Paper orders')).toBeInTheDocument();
    expect(screen.getAllByText('No paper incidents detected.').length).toBeGreaterThan(0);
    expect(screen.getByText('#11')).toBeInTheDocument();
  });

  it('submits a paper order with parsed numeric fields', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Symbol'), {
      target: { value: 'ETH/USDT' },
    });
    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '0.25' },
    });
    fireEvent.change(screen.getByLabelText('Price'), {
      target: { value: '3100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit paper order/i }));

    await waitFor(() => {
      expect(placeOrderMock).toHaveBeenCalledWith({
        symbol: 'ETH/USDT',
        side: 'BUY',
        quantity: 0.25,
        price: 3100,
        executeNow: true,
      });
    });
  });
});
