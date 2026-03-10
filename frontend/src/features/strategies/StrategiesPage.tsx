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
              fullWidth
            />
            <TextField
              label="Timeframe"
              value={form.timeframe}
              onChange={(event) => setForm((prev) => ({ ...prev, timeframe: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Risk Per Trade (0.01 - 0.05)"
              type="number"
              value={form.riskPerTrade}
              onChange={(event) => setForm((prev) => ({ ...prev, riskPerTrade: event.target.value }))}
              fullWidth
              inputProps={{ step: '0.001' }}
            />
            <TextField
              label="Min Position Size"
              type="number"
              value={form.minPositionSize}
              onChange={(event) => setForm((prev) => ({ ...prev, minPositionSize: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Max Position Size"
              type="number"
              value={form.maxPositionSize}
              onChange={(event) => setForm((prev) => ({ ...prev, maxPositionSize: event.target.value }))}
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
