import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SettingsPage from './SettingsPage';

const mockDispatch = vi.fn();
let writeTextMock: ReturnType<typeof vi.fn>;

const mockState = {
  settings: {
    theme: 'light' as const,
    currency: 'USD' as const,
    timezone: 'UTC',
    textScale: 1,
    notifications: {
      emailAlerts: true,
      telegramAlerts: false,
      profitLossThreshold: 5,
      drawdownThreshold: 15,
      riskThreshold: 75,
    },
  },
  environment: {
    mode: 'test' as const,
  },
  auth: {
    user: {
      role: 'admin' as const,
    },
  },
};

vi.mock('./exchangeApi', () => ({
  useGetSystemInfoQuery: () => ({ data: undefined, isError: true }),
  useGetExchangeBalanceQuery: () => ({
    data: undefined,
    isError: true,
    error: { status: 409, data: { message: 'Live account reads are unavailable on this backend.' } },
    refetch: vi.fn(),
  }),
  useGetExchangeOrdersQuery: () => ({ data: [], isError: false, error: undefined }),
  useGetExchangeConnectionStatusQuery: () => ({ data: undefined, isError: true, error: undefined }),
  useGetAuditEventsQuery: () => ({
    data: {
      summary: {
        visibleEventCount: 1,
        totalMatchingEvents: 1,
        successCount: 1,
        failedCount: 0,
        uniqueActors: 1,
        uniqueActions: 1,
        testEventCount: 0,
        paperEventCount: 1,
        liveEventCount: 0,
        latestEventAt: '2026-03-12T10:00:00',
      },
      events: [
        {
          id: 1,
          actor: 'admin',
          action: 'BACKTEST_RUN_STARTED',
          environment: 'paper',
          targetType: 'BACKTEST',
          targetId: '42',
          outcome: 'SUCCESS',
          details: 'strategy=BOLLINGER_BANDS, datasetId=7',
          createdAt: '2026-03-12T10:00:00',
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useTestExchangeConnectionMutation: () => [vi.fn(), { isLoading: false }],
  useTriggerBackupMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/services/axiosClient', () => ({
  getErrorMessage: () => 'error',
}));

describe('SettingsPage', { timeout: 15000 }, () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });
  });

  it('renders tab navigation and api section', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'API Config' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Audit Trail' })).toBeInTheDocument();
    expect(screen.getByText('API Configuration')).toBeInTheDocument();
    expect(screen.getByText('Local Commands (CMD)')).toBeInTheDocument();
  });

  it('switches to notifications tab', () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
  });

  it('renders enriched audit trail panel', () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('tab', { name: 'Audit Trail' }));

    expect(screen.getByText('Current Audit Window')).toBeInTheDocument();
    expect(screen.getByText('Backtest Run Started')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
  });

  it('copies command to clipboard', async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Copy' })[0]);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Command copied to clipboard.')).toBeInTheDocument();
    });
  });

  it('shows backend capability message for exchange balance errors', () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('tab', { name: 'Exchange' }));

    expect(screen.getByText('Live account reads are unavailable on this backend.')).toBeInTheDocument();
  });
});
