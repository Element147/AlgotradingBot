import { Alert, Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';

import type { RiskStatus } from './riskApi';

interface RiskMetricsProps {
  status: RiskStatus | undefined;
  loading: boolean;
}

const colorForRatio = (ratio: number): 'success' | 'warning' | 'error' => {
  if (ratio >= 0.9) {
    return 'error';
  }
  if (ratio >= 0.7) {
    return 'warning';
  }
  return 'success';
};

export function RiskMetrics({ status, loading }: RiskMetricsProps) {
  const drawdownRatio = status ? status.currentDrawdown / Math.max(status.maxDrawdownLimit, 0.0001) : 0;
  const dailyLossRatio = status ? status.dailyLoss / Math.max(status.dailyLossLimit, 0.0001) : 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Risk Status
        </Typography>

        {loading || !status ? (
          <Typography>Loading risk status...</Typography>
        ) : (
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2">
                Current Drawdown: {status.currentDrawdown.toFixed(2)}% / {status.maxDrawdownLimit.toFixed(2)}%
              </Typography>
              <LinearProgress
                color={colorForRatio(drawdownRatio)}
                variant="determinate"
                value={Math.min(100, drawdownRatio * 100)}
              />
            </Box>
            <Box>
              <Typography variant="body2">
                Daily Loss: {status.dailyLoss.toFixed(2)}% / {status.dailyLossLimit.toFixed(2)}%
              </Typography>
              <LinearProgress
                color={colorForRatio(dailyLossRatio)}
                variant="determinate"
                value={Math.min(100, dailyLossRatio * 100)}
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
  );
}
