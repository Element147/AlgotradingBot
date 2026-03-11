import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import type { RiskAlert } from './riskApi';

import { sanitizeText } from '@/utils/security';

interface CircuitBreakerPanelProps {
  alerts: RiskAlert[];
  onOverride: (payload: { confirmationCode: string; reason: string }) => Promise<void> | void;
  busy: boolean;
}

export function CircuitBreakerPanel({ alerts, onOverride, busy }: CircuitBreakerPanelProps) {
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
        <Stack spacing={2}>
          <TextField
            label="Confirmation Code"
            value={overrideCode}
            onChange={(event) => setOverrideCode(sanitizeText(event.target.value))}
            placeholder="OVERRIDE_PAPER_ONLY"
          />
          <TextField
            label="Override Reason"
            value={overrideReason}
            onChange={(event) => setOverrideReason(sanitizeText(event.target.value))}
          />
          <Button variant="outlined" color="warning" onClick={() => void submit()} disabled={!canSubmit}>
            Override Circuit Breaker
          </Button>
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
