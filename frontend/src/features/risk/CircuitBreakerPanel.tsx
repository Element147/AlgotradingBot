import { Alert, Button, Card, CardContent, Chip, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import type { RiskAlert, RiskConfig } from './riskApi';

import { FieldTooltip } from '@/components/ui/FieldTooltip';
import type { EnvironmentMode } from '@/features/environment/environmentSlice';
import { sanitizeText } from '@/utils/security';

interface CircuitBreakerPanelProps {
  alerts: RiskAlert[];
  circuitBreakers: RiskConfig[];
  environmentMode: EnvironmentMode;
  onOverride: (payload: { confirmationCode: string; reason: string }) => Promise<void> | void;
  busy: boolean;
}

export function CircuitBreakerPanel({
  alerts,
  circuitBreakers,
  environmentMode,
  onOverride,
  busy,
}: CircuitBreakerPanelProps) {
  const [overrideCode, setOverrideCode] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const canSubmit = useMemo(
    () => overrideCode.trim().length > 0 && overrideReason.trim().length > 0 && !busy,
    [overrideCode, overrideReason, busy]
  );

  const submit = async () => {
    if (!canSubmit) {
      return;
    }
    await onOverride({
      confirmationCode: overrideCode.trim(),
      reason: overrideReason.trim(),
    });
    setOverrideCode('');
    setOverrideReason('');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Circuit Breaker Override
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Override is test/paper only. Use confirmation code and reason for auditability.
        </Alert>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip size="small" label={`Environment: ${environmentMode}`} color={environmentMode === 'live' ? 'error' : 'success'} />
          <Chip size="small" label={`Configured breakers: ${circuitBreakers.length}`} variant="outlined" />
        </Stack>
        <Stack spacing={2}>
          <FieldTooltip title="Required confirmation token for manual override. Invalid code blocks the action.">
            <TextField
              label="Confirmation Code"
              value={overrideCode}
              onChange={(event) => setOverrideCode(sanitizeText(event.target.value))}
              placeholder="OVERRIDE_PAPER_ONLY"
              helperText="Used as a deliberate safety gate."
            />
          </FieldTooltip>
          <FieldTooltip title="Required audit reason. Weak or empty rationale reduces operational traceability.">
            <TextField
              label="Override Reason"
              value={overrideReason}
              onChange={(event) => setOverrideReason(sanitizeText(event.target.value))}
              helperText="Document why override is necessary and temporary."
            />
          </FieldTooltip>
          <Button variant="outlined" color="warning" onClick={() => void submit()} disabled={!canSubmit}>
            Override Circuit Breaker
          </Button>
        </Stack>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Circuit Breaker Inventory
        </Typography>
        <Stack spacing={1}>
          {circuitBreakers.length === 0 ? (
            <Typography variant="body2">No circuit-breaker configurations returned.</Typography>
          ) : (
            circuitBreakers.map((breaker, index) => (
              <Alert
                key={`${breaker.maxRiskPerTrade}-${breaker.maxDailyLossLimit}-${index}`}
                severity={breaker.circuitBreakerActive ? 'warning' : 'info'}
              >
                Max risk/trade: {(breaker.maxRiskPerTrade * 100).toFixed(2)}% | Daily loss:{' '}
                {(breaker.maxDailyLossLimit * 100).toFixed(2)}% | Drawdown:{' '}
                {(breaker.maxDrawdownLimit * 100).toFixed(2)}% | Max positions:{' '}
                {breaker.maxOpenPositions} | Correlation: {(breaker.correlationLimit * 100).toFixed(0)}%
                {breaker.circuitBreakerReason
                  ? ` | Active reason: ${breaker.circuitBreakerReason}`
                  : ' | Breaker currently inactive'}
              </Alert>
            ))
          )}
        </Stack>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Risk Alerts
        </Typography>
        <Stack spacing={1} aria-live="assertive">
          {alerts.length === 0 ? <Typography variant="body2">No recent alerts.</Typography> : null}
          {alerts.slice(0, 10).map((alert) => (
            <Alert key={alert.id} severity={alert.severity === 'HIGH' ? 'error' : 'warning'}>
              [{alert.type}] {alert.message} ({alert.actionTaken})
            </Alert>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
