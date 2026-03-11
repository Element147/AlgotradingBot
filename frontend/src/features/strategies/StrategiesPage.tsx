import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import {
  type Strategy,
  useGetStrategiesQuery,
  useStartStrategyMutation,
  useStopStrategyMutation,
  useUpdateStrategyConfigMutation,
} from './strategiesApi';
import { getAllStrategyProfiles, getStrategyProfile } from './strategyProfiles';

import { AppLayout } from '@/components/layout/AppLayout';

interface ConfigForm {
  symbol: string;
  timeframe: string;
  riskPerTrade: string;
  minPositionSize: string;
  maxPositionSize: string;
}

const emptyForm: ConfigForm = {
  symbol: '',
  timeframe: '',
  riskPerTrade: '',
  minPositionSize: '',
  maxPositionSize: '',
};

const statusColor = (status: Strategy['status']): 'success' | 'warning' | 'error' => {
  if (status === 'RUNNING') {
    return 'success';
  }
  if (status === 'ERROR') {
    return 'error';
  }
  return 'warning';
};

export default function StrategiesPage() {
  const { data: strategies = [], isLoading, isError, error } = useGetStrategiesQuery();
  const [startStrategy, { isLoading: isStarting }] = useStartStrategyMutation();
  const [stopStrategy, { isLoading: isStopping }] = useStopStrategyMutation();
  const [updateConfig, { isLoading: isSavingConfig }] = useUpdateStrategyConfigMutation();

  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [form, setForm] = useState<ConfigForm>(emptyForm);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const isBusy = isStarting || isStopping || isSavingConfig;
  const strategyProfiles = getAllStrategyProfiles();

  const validationError = useMemo(() => {
    const risk = Number(form.riskPerTrade);
    const minPosition = Number(form.minPositionSize);
    const maxPosition = Number(form.maxPositionSize);

    if (!selectedStrategy) {
      return null;
    }

    if (!form.symbol.trim()) {
      return 'Symbol is required';
    }
    if (!form.timeframe.trim()) {
      return 'Timeframe is required';
    }
    if (Number.isNaN(risk) || risk < 0.01 || risk > 0.05) {
      return 'Risk per trade must be between 0.01 and 0.05';
    }
    if (Number.isNaN(minPosition) || minPosition <= 0) {
      return 'Min position size must be positive';
    }
    if (Number.isNaN(maxPosition) || maxPosition <= 0) {
      return 'Max position size must be positive';
    }
    if (maxPosition < minPosition) {
      return 'Max position size must be greater than or equal to min position size';
    }

    return null;
  }, [form, selectedStrategy]);

  const openConfigDialog = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setForm({
      symbol: strategy.symbol,
      timeframe: strategy.timeframe,
      riskPerTrade: String(strategy.riskPerTrade),
      minPositionSize: String(strategy.minPositionSize),
      maxPositionSize: String(strategy.maxPositionSize),
    });
  };

  const closeConfigDialog = () => {
    setSelectedStrategy(null);
    setForm(emptyForm);
  };

  const handleStart = async (strategyId: number) => {
    try {
      await startStrategy(strategyId).unwrap();
      setFeedback({ severity: 'success', message: 'Strategy started in paper mode.' });
    } catch {
      setFeedback({ severity: 'error', message: 'Failed to start strategy.' });
    }
  };

  const handleStop = async (strategyId: number) => {
    try {
      await stopStrategy(strategyId).unwrap();
      setFeedback({ severity: 'success', message: 'Strategy stopped.' });
    } catch {
      setFeedback({ severity: 'error', message: 'Failed to stop strategy.' });
    }
  };

  const handleSave = async () => {
    if (!selectedStrategy || validationError) {
      return;
    }

    try {
      await updateConfig({
        strategyId: selectedStrategy.id,
        symbol: form.symbol.trim(),
        timeframe: form.timeframe.trim(),
        riskPerTrade: Number(form.riskPerTrade),
        minPositionSize: Number(form.minPositionSize),
        maxPositionSize: Number(form.maxPositionSize),
      }).unwrap();

      setFeedback({ severity: 'success', message: 'Strategy configuration updated.' });
      closeConfigDialog();
    } catch {
      setFeedback({ severity: 'error', message: 'Failed to update strategy config.' });
    }
  };

  return (
    <AppLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Strategy Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          All strategy execution is paper-mode only by default.
        </Typography>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Strategy Guide
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Use this quick guide when choosing strategy behavior for backtesting and paper trading.
            </Typography>
            <Grid container spacing={2}>
              {strategyProfiles.map((profile) => (
                <Grid key={profile.key} size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {profile.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profile.shortDescription}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Entry: {profile.entryRule}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Exit: {profile.exitRule}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Best for: {profile.bestFor}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Risk note: {profile.riskNotes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {feedback && (
          <Alert
            severity={feedback.severity}
            sx={{ mb: 2 }}
            onClose={() => setFeedback(null)}
          >
            {feedback.message}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {isError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load strategies. {String((error as { status?: string })?.status ?? '')}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          {strategies.map((strategy) => (
            <Grid key={strategy.id} size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  {(() => {
                    const profile = getStrategyProfile(strategy.type);
                    return profile ? (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <strong>{profile.title}:</strong> {profile.shortDescription}
                      </Alert>
                    ) : null;
                  })()}

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6">{strategy.name}</Typography>
                    <Chip
                      color={statusColor(strategy.status)}
                      label={strategy.status}
                      size="small"
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary">Type: {strategy.type}</Typography>
                  <Typography variant="body2" color="text.secondary">Market: {strategy.symbol} ({strategy.timeframe})</Typography>
                  <Typography variant="body2" color="text.secondary">Risk/Trade: {(strategy.riskPerTrade * 100).toFixed(2)}%</Typography>
                  <Typography variant="body2" color="text.secondary">P&L: {strategy.profitLoss.toFixed(2)}</Typography>
                  <Typography variant="body2" color="text.secondary">Trades: {strategy.tradeCount}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Drawdown: {strategy.currentDrawdown.toFixed(2)}%
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    {strategy.status === 'RUNNING' ? (
                      <Button
                        variant="contained"
                        color="warning"
                        disabled={isBusy}
                        onClick={() => void handleStop(strategy.id)}
                      >
                        Stop
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        disabled={isBusy}
                        onClick={() => void handleStart(strategy.id)}
                      >
                        Start
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      disabled={isBusy}
                      onClick={() => openConfigDialog(strategy)}
                    >
                      Configure
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={Boolean(selectedStrategy)} onClose={closeConfigDialog} fullWidth maxWidth="sm">
        <DialogTitle>Update Strategy Configuration</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Symbol"
              value={form.symbol}
              onChange={(event) => setForm((prev) => ({ ...prev, symbol: event.target.value }))}
              helperText="Market pair to trade (for example BTC/USDT)."
              fullWidth
            />
            <TextField
              label="Timeframe"
              value={form.timeframe}
              onChange={(event) => setForm((prev) => ({ ...prev, timeframe: event.target.value }))}
              helperText="Candle interval such as 15m, 1h, or 4h."
              fullWidth
            />
            <TextField
              label="Risk Per Trade (0.01 - 0.05)"
              type="number"
              value={form.riskPerTrade}
              onChange={(event) => setForm((prev) => ({ ...prev, riskPerTrade: event.target.value }))}
              fullWidth
              inputProps={{ step: '0.001' }}
              helperText="Fraction of account risked per position. 0.02 means 2%."
            />
            <TextField
              label="Min Position Size"
              type="number"
              value={form.minPositionSize}
              onChange={(event) => setForm((prev) => ({ ...prev, minPositionSize: event.target.value }))}
              helperText="Lower position bound used by execution sizing logic."
              fullWidth
            />
            <TextField
              label="Max Position Size"
              type="number"
              value={form.maxPositionSize}
              onChange={(event) => setForm((prev) => ({ ...prev, maxPositionSize: event.target.value }))}
              helperText="Upper position bound to limit exposure per trade."
              fullWidth
            />
            {validationError ? <Alert severity="error">{validationError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfigDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={Boolean(validationError) || isSavingConfig}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
