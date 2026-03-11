import { Alert, Box, Grid, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import { CircuitBreakerPanel } from './CircuitBreakerPanel';
import { PositionSizingCalculator } from './PositionSizingCalculator';
import { useGetRiskAlertsQuery, useGetRiskConfigQuery, useGetRiskStatusQuery, useOverrideCircuitBreakerMutation, useUpdateRiskConfigMutation } from './riskApi';
import { RiskConfigForm } from './RiskConfigForm';
import { RiskMetrics } from './RiskMetrics';

import { AppLayout } from '@/components/layout/AppLayout';

const playAlertTone = () => {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return;
  }
  const audio = new window.AudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(880, audio.currentTime);
  gain.gain.setValueAtTime(0.04, audio.currentTime);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.15);
};

export default function RiskPage() {
  const { data: status, isLoading: isStatusLoading } = useGetRiskStatusQuery(undefined, {
    pollingInterval: 30000,
    skipPollingIfUnfocused: true,
  });
  const { data: config, isLoading: isConfigLoading } = useGetRiskConfigQuery();
  const { data: alerts = [] } = useGetRiskAlertsQuery(undefined, {
    pollingInterval: 5000,
    skipPollingIfUnfocused: true,
  });

  const [updateConfig, { isLoading: isSavingConfig }] = useUpdateRiskConfigMutation();
  const [overrideCircuitBreaker, { isLoading: isOverriding }] = useOverrideCircuitBreakerMutation();
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error' | 'warning'; message: string } | null>(
    null
  );

  const seenAlertIds = useRef<Set<number>>(new Set());
  const highAlerts = useMemo(() => alerts.filter((alert) => alert.severity === 'HIGH'), [alerts]);

  useEffect(() => {
    const newHighAlert = highAlerts.find((alert) => !seenAlertIds.current.has(alert.id));
    alerts.forEach((alert) => seenAlertIds.current.add(alert.id));

    if (newHighAlert) {
      playAlertTone();
      setFeedback({
        severity: 'warning',
        message: `High priority risk alert: ${newHighAlert.message}`,
      });
    }
  }, [alerts, highAlerts]);

  const saveRiskConfig = async (payload: {
    maxRiskPerTrade: number;
    maxDailyLossLimit: number;
    maxDrawdownLimit: number;
    maxOpenPositions: number;
    correlationLimit: number;
  }) => {
    try {
      await updateConfig(payload).unwrap();
      setFeedback({ severity: 'success', message: 'Risk configuration saved.' });
    } catch {
      setFeedback({ severity: 'error', message: 'Failed to save risk configuration.' });
    }
  };

  const overrideBreaker = async (payload: { confirmationCode: string; reason: string }) => {
    try {
      await overrideCircuitBreaker(payload).unwrap();
      setFeedback({ severity: 'success', message: 'Circuit breaker override accepted.' });
    } catch {
      setFeedback({
        severity: 'error',
        message: 'Override rejected. Verify confirmation code and reason.',
      });
    }
  };

  return (
    <AppLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Risk Controls
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Protective controls are active for test/paper workflows; live override is blocked.
        </Typography>

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
            {feedback.message}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <RiskMetrics status={status} loading={isStatusLoading} />
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <RiskConfigForm
              config={config}
              loading={isConfigLoading}
              busy={isSavingConfig}
              onSave={saveRiskConfig}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <CircuitBreakerPanel alerts={alerts} busy={isOverriding} onOverride={overrideBreaker} />
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <PositionSizingCalculator />
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
