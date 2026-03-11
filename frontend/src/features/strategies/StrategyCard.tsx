import { Alert, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

import type { Strategy } from './strategiesApi';
import { getStrategyProfile } from './strategyProfiles';

export interface StrategyCardProps {
  strategy: Strategy;
  busy: boolean;
  onStart: (strategy: Strategy) => void;
  onStop: (strategy: Strategy) => void;
  onConfigure: (strategy: Strategy) => void;
}

const statusColor = (status: Strategy['status']): 'success' | 'warning' | 'error' => {
  if (status === 'RUNNING') {
    return 'success';
  }
  if (status === 'ERROR') {
    return 'error';
  }
  return 'warning';
};

export function StrategyCard({ strategy, busy, onStart, onStop, onConfigure }: StrategyCardProps) {
  const profile = getStrategyProfile(strategy.type);

  return (
    <Card>
      <CardContent>
        {profile ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>{profile.title}:</strong> {profile.shortDescription}
          </Alert>
        ) : null}

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6">{strategy.name}</Typography>
          <Chip color={statusColor(strategy.status)} label={strategy.status} size="small" />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Type: {strategy.type}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Market: {strategy.symbol} ({strategy.timeframe})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Risk/Trade: {(strategy.riskPerTrade * 100).toFixed(2)}%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          P&L: {strategy.profitLoss.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Trades: {strategy.tradeCount}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drawdown: {strategy.currentDrawdown.toFixed(2)}%
        </Typography>

        <Stack direction="row" spacing={1}>
          {strategy.status === 'RUNNING' ? (
            <Button
              variant="contained"
              color="warning"
              disabled={busy}
              onClick={() => onStop(strategy)}
            >
              Stop
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              disabled={busy}
              onClick={() => onStart(strategy)}
            >
              Start
            </Button>
          )}
          <Button variant="outlined" disabled={busy} onClick={() => onConfigure(strategy)}>
            Configure
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
