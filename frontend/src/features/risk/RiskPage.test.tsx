import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import RiskPage from './RiskPage';

const mockRiskStatus = {
  currentDrawdown: 10,
  maxDrawdownLimit: 25,
  dailyLoss: 2,
  dailyLossLimit: 5,
  openRiskExposure: 20,
  positionCorrelation: 35,
  circuitBreakerActive: false,
  circuitBreakerReason: '',
};

const mockRiskConfig = {
  maxRiskPerTrade: 0.02,
  maxDailyLossLimit: 0.05,
  maxDrawdownLimit: 0.25,
  maxOpenPositions: 5,
  correlationLimit: 0.75,
  circuitBreakerActive: false,
  circuitBreakerReason: '',
};

const mockRiskAlerts = [
  {
    id: 1,
    type: 'CIRCUIT_BREAKER',
    severity: 'HIGH',
    message: 'Drawdown limit reached',
    actionTaken: 'Trading halted',
    timestamp: '2026-03-10T10:00:00',
  },
];

vi.mock('./riskApi', () => ({
  useGetRiskStatusQuery: () => ({
    data: mockRiskStatus,
    isLoading: false,
  }),
  useGetRiskConfigQuery: () => ({
    data: mockRiskConfig,
    isLoading: false,
  }),
  useGetRiskAlertsQuery: () => ({
    data: mockRiskAlerts,
  }),
  useUpdateRiskConfigMutation: () => [vi.fn(), { isLoading: false }],
  useOverrideCircuitBreakerMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('RiskPage', () => {
  it('renders risk sections', () => {
    render(<RiskPage />);

    expect(screen.getByText('Risk Controls')).toBeInTheDocument();
    expect(screen.getByText('Risk Status')).toBeInTheDocument();
    expect(screen.getByText('Risk Configuration')).toBeInTheDocument();
    expect(screen.getByText('Circuit Breaker Override')).toBeInTheDocument();
  });

  it('renders risk alert entries', () => {
    render(<RiskPage />);

    expect(screen.getByText('[CIRCUIT_BREAKER] Drawdown limit reached (Trading halted)')).toBeInTheDocument();
  });
});
