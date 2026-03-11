import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import {
  useGetRiskAlertsQuery,
  useGetRiskConfigQuery,
  useGetRiskStatusQuery,
  useOverrideCircuitBreakerMutation,
  useUpdateRiskConfigMutation,
} from './riskApi';

import { AppLayout } from '@/components/layout/AppLayout';

export default function RiskPage() {
  const { data: status, isLoading: isStatusLoading } = useGetRiskStatusQuery(undefined, { pollingInterval: 5000 });
  const { data: config, isLoading: isConfigLoading } = useGetRiskConfigQuery();
  const { data: alerts = [] } = useGetRiskAlertsQuery(undefined, { pollingInterval: 5000 });

  const [updateConfig, { isLoading: isSavingConfig }] = useUpdateRiskConfigMutation();
  const [overrideCircuitBreaker, { isLoading: isOverriding }] = useOverrideCircuitBreakerMutation();

  const [form, setForm] = useState<{
    maxRiskPerTrade: string;
    maxDailyLossLimit: string;
    maxDrawdownLimit: string;
    maxOpenPositions: string;
    correlationLimit: string;
  } | null>(null);
  const [overrideCode, setOverrideCode] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const formValues = useMemo(
    () =>
      form ?? {
        maxRiskPerTrade: String(config?.maxRiskPerTrade ?? '0.02'),
        maxDailyLossLimit: String(config?.maxDailyLossLimit ?? '0.05'),
        maxDrawdownLimit: String(config?.maxDrawdownLimit ?? '0.25'),
        maxOpenPositions: String(config?.maxOpenPositions ?? '5'),
        correlationLimit: String(config?.correlationLimit ?? '0.75'),
      },
    [config, form]
  );

  const configValidationError = useMemo(() => {
    const maxRiskPerTrade = Number(formValues.maxRiskPerTrade);
    const maxDailyLossLimit = Number(formValues.maxDailyLossLimit);
    const maxDrawdownLimit = Number(formValues.maxDrawdownLimit);
    const maxOpenPositions = Number(formValues.maxOpenPositions);
    const correlationLimit = Number(formValues.correlationLimit);

    if (Number.isNaN(maxRiskPerTrade) || maxRiskPerTrade < 0.01 || maxRiskPerTrade > 0.05) {
      return 'Max risk per trade must be between 0.01 and 0.05.';
    }
    if (Number.isNaN(maxDailyLossLimit) || maxDailyLossLimit < 0.01 || maxDailyLossLimit > 0.10) {
      return 'Max daily loss limit must be between 0.01 and 0.10.';
    }
    if (Number.isNaN(maxDrawdownLimit) || maxDrawdownLimit < 0.10 || maxDrawdownLimit > 0.50) {
      return 'Max drawdown limit must be between 0.10 and 0.50.';
    }
    if (!Number.isInteger(maxOpenPositions) || maxOpenPositions < 1 || maxOpenPositions > 10) {
      return 'Max open positions must be an integer between 1 and 10.';
    }
    if (Number.isNaN(correlationLimit) || correlationLimit < 0.10 || correlationLimit > 1.00) {
      return 'Correlation limit must be between 0.10 and 1.00.';
    }

    return null;
  }, [formValues]);

  const saveRiskConfig = async () => {
    try {
      await updateConfig({
        maxRiskPerTrade: Number(formValues.maxRiskPerTrade),
        maxDailyLossLimit: Number(formValues.maxDailyLossLimit),
        maxDrawdownLimit: Number(formValues.maxDrawdownLimit),
        maxOpenPositions: Number(formValues.maxOpenPositions),
        correlationLimit: Number(formValues.correlationLimit),
      }).unwrap();

      setFeedback({ severity: 'success', message: 'Risk configuration saved.' });
    } catch {
      setFeedback({ severity: 'error', message: 'Failed to save risk configuration.' });
    }
  };

  const overrideBreaker = async () => {
    try {
      await overrideCircuitBreaker({
        confirmationCode: overrideCode,
        reason: overrideReason,
      }).unwrap();

      setFeedback({ severity: 'success', message: 'Circuit breaker override accepted.' });
      setOverrideCode('');
      setOverrideReason('');
    } catch {
      setFeedback({ severity: 'error', message: 'Override rejected. Verify confirmation code and reason.' });
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
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Risk Status</Typography>

                {isStatusLoading || !status ? <Typography>Loading risk status...</Typography> : (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2">Current Drawdown: {status.currentDrawdown.toFixed(2)}% / {status.maxDrawdownLimit.toFixed(2)}%</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (status.currentDrawdown / Math.max(status.maxDrawdownLimit, 0.0001)) * 100)}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2">Daily Loss: {status.dailyLoss.toFixed(2)}% / {status.dailyLossLimit.toFixed(2)}%</Typography>
                      <LinearProgress
                        color={status.dailyLoss > status.dailyLossLimit ? 'error' : 'primary'}
                        variant="determinate"
                        value={Math.min(100, (status.dailyLoss / Math.max(status.dailyLossLimit, 0.0001)) * 100)}
                      />
                    </Box>
                    <Typography variant="body2">Open Risk Exposure: {status.openRiskExposure.toFixed(2)}%</Typography>
                    <Typography variant="body2">Position Correlation: {status.positionCorrelation.toFixed(2)}%</Typography>
                    {status.circuitBreakerActive ? (
                      <Alert severity="error">Circuit breaker active: {status.circuitBreakerReason || 'No reason provided'}</Alert>
                    ) : (
                      <Alert severity="success">Circuit breaker not active</Alert>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Risk Configuration</Typography>
                {isConfigLoading ? <Typography>Loading config...</Typography> : (
                  <Stack spacing={2}>
                    <TextField
                      label="Max Risk Per Trade (0.01 - 0.05)"
                      value={formValues.maxRiskPerTrade}
                      onChange={(event) => setForm((prev) => ({ ...(prev ?? formValues), maxRiskPerTrade: event.target.value }))}
                      helperText="Fraction of account equity risked on one new position."
                    />
                    <TextField
                      label="Max Daily Loss Limit (0.01 - 0.10)"
                      value={formValues.maxDailyLossLimit}
                      onChange={(event) => setForm((prev) => ({ ...(prev ?? formValues), maxDailyLossLimit: event.target.value }))}
                      helperText="Daily loss threshold that can pause strategy activity."
                    />
                    <TextField
                      label="Max Drawdown Limit (0.10 - 0.50)"
                      value={formValues.maxDrawdownLimit}
                      onChange={(event) => setForm((prev) => ({ ...(prev ?? formValues), maxDrawdownLimit: event.target.value }))}
                      helperText="Maximum peak-to-trough decline before circuit protection."
                    />
                    <TextField
                      label="Max Open Positions (1 - 10)"
                      value={formValues.maxOpenPositions}
                      onChange={(event) => setForm((prev) => ({ ...(prev ?? formValues), maxOpenPositions: event.target.value }))}
                      helperText="Upper limit of simultaneous open positions."
                    />
                    <TextField
                      label="Correlation Limit (0.10 - 1.00)"
                      value={formValues.correlationLimit}
                      onChange={(event) => setForm((prev) => ({ ...(prev ?? formValues), correlationLimit: event.target.value }))}
                      helperText="Controls how similar open positions can be."
                    />
                    {configValidationError ? <Alert severity="error">{configValidationError}</Alert> : null}
                    <Button
                      variant="contained"
                      onClick={() => void saveRiskConfig()}
                      disabled={isSavingConfig || Boolean(configValidationError)}
                    >
                      Save Risk Config
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Circuit Breaker Override</Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Override is test/paper only. Use confirmation code and reason for auditability.
                </Alert>
                <Stack spacing={2}>
                  <TextField
                    label="Confirmation Code"
                    value={overrideCode}
                    onChange={(event) => setOverrideCode(event.target.value)}
                    placeholder="OVERRIDE_PAPER_ONLY"
                    helperText="Safety code required for manual override."
                  />
                  <TextField
                    label="Override Reason"
                    value={overrideReason}
                    onChange={(event) => setOverrideReason(event.target.value)}
                    helperText="Write why override is needed and what safeguards are in place."
                  />
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => void overrideBreaker()}
                    disabled={isOverriding || !overrideCode || !overrideReason}
                  >
                    Override Circuit Breaker
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Risk Alerts</Typography>
                <Stack spacing={1}>
                  {alerts.length === 0 ? <Typography variant="body2">No recent alerts.</Typography> : null}
                  {alerts.slice(0, 10).map((alert) => (
                    <Alert key={alert.id} severity={alert.severity === 'HIGH' ? 'error' : 'warning'}>
                      [{alert.type}] {alert.message} ({alert.actionTaken})
                    </Alert>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
