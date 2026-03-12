import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SettingsPage from './SettingsPage';

const mockDispatch = vi.fn();
const saveProviderCredentialMock = vi.fn();
const deleteProviderCredentialMock = vi.fn();
const marketDataCredentialSettings = [
  {
    providerId: 'twelvedata',
    providerLabel: 'Twelve Data',
    apiKeyEnvironmentVariable: 'ALGOTRADING_MARKET_DATA_TWELVEDATA_API_KEY',
    apiKeyRequired: true,
    hasStoredCredential: false,
    hasEnvironmentCredential: false,
    effectiveCredentialConfigured: false,
    credentialSource: 'NONE',
    storageEncryptionConfigured: true,
    note: null,
    updatedAt: null,
    docsUrl: 'https://example.com/docs',
    signupUrl: 'https://example.com/signup',
    accountNotes: 'Free API key required.',
  },
];

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
    exchangeConnections: [
      {
        id: 'binance-paper',
        name: 'Binance Paper',
        exchange: 'binance',
        apiKey: '',
        apiSecret: '',
        testnet: true,
      },
    ],
    activeExchangeConnectionId: 'binance-paper',
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

vi.mock('@/features/marketData/marketDataApi', () => ({
  useGetMarketDataProviderCredentialsQuery: () => ({
    data: marketDataCredentialSettings,
  }),
  useSaveMarketDataProviderCredentialMutation: () => [
    saveProviderCredentialMock,
    { isLoading: false },
  ],
  useDeleteMarketDataProviderCredentialMutation: () => [
    deleteProviderCredentialMock,
    { isLoading: false },
  ],
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
    saveProviderCredentialMock.mockReset();
    deleteProviderCredentialMock.mockReset();
    saveProviderCredentialMock.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    deleteProviderCredentialMock.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });

  it('renders tab navigation and api section', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'API Config' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Audit Trail' })).toBeInTheDocument();
    expect(screen.getByText('API Configuration')).toBeInTheDocument();
    expect(screen.getByText('Market Data Provider Credentials')).toBeInTheDocument();
    expect(screen.getByLabelText('Saved Connection')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set Active' })).toBeInTheDocument();
    expect(screen.queryByText('Local Commands (CMD)')).not.toBeInTheDocument();
  });

  it('saves a market data provider key and note from settings', async () => {
    render(<SettingsPage />);

    fireEvent.change(screen.getByLabelText('Twelve Data API Key'), {
      target: { value: 'demo-key' },
    });
    fireEvent.change(screen.getByLabelText('Note'), {
      target: { value: 'Use for 2y liquid stock imports' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Provider Setting' }));

    await waitFor(() => {
      expect(saveProviderCredentialMock).toHaveBeenCalledWith({
        providerId: 'twelvedata',
        apiKey: 'demo-key',
        note: 'Use for 2y liquid stock imports',
      });
    });
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

  it('keeps display edits local until save is clicked', async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('tab', { name: 'Display' }));
    fireEvent.change(screen.getByLabelText('Text Scale'), { target: { value: '1.5' } });

    expect(mockDispatch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Save Display Settings' }));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  it('shows backend capability message for exchange balance errors', () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('tab', { name: 'Exchange' }));

    expect(screen.getByText('Live account reads are unavailable on this backend.')).toBeInTheDocument();
  });
});
