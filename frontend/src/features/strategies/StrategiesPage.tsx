import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  type Strategy,
  useGetStrategiesQuery,
  useStartStrategyMutation,
  useStopStrategyMutation,
  useUpdateStrategyConfigMutation,
} from './strategiesApi';
import { StrategyCard } from './StrategyCard';
import { StrategyConfigModal } from './StrategyConfigModal';
import { getAllStrategyProfiles } from './strategyProfiles';
import type { StrategyConfigOutput } from './strategyValidation';

import { AppLayout } from '@/components/layout/AppLayout';

type ActionDialogState = {
  strategy: Strategy;
  action: 'start' | 'stop';
} | null;

export default function StrategiesPage() {
  const { data: strategies = [], isLoading, isError, error } = useGetStrategiesQuery(undefined, {
    pollingInterval: 30000,
    skipPollingIfUnfocused: true,
  });
  const [startStrategy, { isLoading: isStarting }] = useStartStrategyMutation();
  const [stopStrategy, { isLoading: isStopping }] = useStopStrategyMutation();
  const [updateConfig, { isLoading: isSavingConfig }] = useUpdateStrategyConfigMutation();

  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>(null);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(
    null
  );

  const isBusy = isStarting || isStopping || isSavingConfig;
  const strategyProfiles = getAllStrategyProfiles();

  const runAction = async () => {
    if (!actionDialog) {
      return;
    }

    try {
      if (actionDialog.action === 'start') {
        await startStrategy(actionDialog.strategy.id).unwrap();
        setFeedback({ severity: 'success', message: 'Strategy started in paper mode.' });
      } else {
        await stopStrategy(actionDialog.strategy.id).unwrap();
        setFeedback({ severity: 'success', message: 'Strategy stopped.' });
      }
    } catch {
      setFeedback({
        severity: 'error',
        message:
          actionDialog.action === 'start' ? 'Failed to start strategy.' : 'Failed to stop strategy.',
      });
    } finally {
      setActionDialog(null);
    }
  };

  const handleSaveConfig = async (strategy: Strategy, payload: StrategyConfigOutput) => {
    if (strategy.status === 'RUNNING') {
      await stopStrategy(strategy.id).unwrap();
    }

    await updateConfig({
      strategyId: strategy.id,
      ...payload,
    }).unwrap();

    setFeedback({ severity: 'success', message: 'Strategy configuration updated.' });
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

        {feedback ? (
          <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

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
              <StrategyCard
                strategy={strategy}
                busy={isBusy}
                onStart={(selected) => setActionDialog({ strategy: selected, action: 'start' })}
                onStop={(selected) => setActionDialog({ strategy: selected, action: 'stop' })}
                onConfigure={setSelectedStrategy}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={Boolean(actionDialog)} onClose={() => setActionDialog(null)}>
        <DialogTitle>
          {actionDialog?.action === 'start' ? 'Start Strategy' : 'Stop Strategy'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionDialog
              ? `Are you sure you want to ${actionDialog.action} "${actionDialog.strategy.name}"?`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => void runAction()} disabled={isBusy}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {selectedStrategy ? (
        <StrategyConfigModal
          key={selectedStrategy.id}
          strategy={selectedStrategy}
          busy={isSavingConfig}
          onClose={() => setSelectedStrategy(null)}
          onSave={handleSaveConfig}
        />
      ) : null}
    </AppLayout>
  );
}
