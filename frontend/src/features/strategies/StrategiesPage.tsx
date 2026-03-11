import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
  DialogContentText,
  DialogTitle,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
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
import { StrategyConfigModal } from './StrategyConfigModal';
import { getAllStrategyProfiles } from './strategyProfiles';
import type { StrategyConfigOutput } from './strategyValidation';

import { AppLayout } from '@/components/layout/AppLayout';

type ActionDialogState = {
  strategy: Strategy;
  action: 'start' | 'stop';
} | null;

const statusColor = (status: Strategy['status']): 'success' | 'warning' | 'error' => {
  if (status === 'RUNNING') {
    return 'success';
  }
  if (status === 'ERROR') {
    return 'error';
  }
  return 'warning';
};

interface HeaderCellProps {
  label: string;
  description: string;
}

function HeaderCellWithTooltip({ label, description }: HeaderCellProps) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <span>{label}</span>
      <Tooltip title={description} arrow>
        <InfoOutlinedIcon fontSize="inherit" color="action" sx={{ cursor: 'help' }} />
      </Tooltip>
    </Stack>
  );
}

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

        {!isLoading && !isError ? (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Available Strategies
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <HeaderCellWithTooltip
                        label="Name"
                        description="Human-readable strategy identifier used in operations and reporting."
                      />
                    </TableCell>
                    <TableCell>
                      <HeaderCellWithTooltip
                        label="Type"
                        description="Underlying strategy model (for example mean reversion or trend-following logic)."
                      />
                    </TableCell>
                    <TableCell>
                      <HeaderCellWithTooltip
                        label="Status"
                        description="Current runtime state in paper mode."
                      />
                    </TableCell>
                    <TableCell>
                      <HeaderCellWithTooltip
                        label="Market"
                        description="Configured symbol and timeframe this strategy monitors."
                      />
                    </TableCell>
                    <TableCell>
                      <HeaderCellWithTooltip
                        label="Risk/Trade"
                        description="Fraction of equity risked per trade according to current config."
                      />
                    </TableCell>
                    <TableCell>
                      <HeaderCellWithTooltip
                        label="P&L"
                        description="Current strategy profit or loss value as reported by backend metrics."
                      />
                    </TableCell>
                    <TableCell>
                      <HeaderCellWithTooltip
                        label="Trades"
                        description="Number of trades associated with current strategy state."
                      />
                    </TableCell>
                    <TableCell>
                      <HeaderCellWithTooltip
                        label="Drawdown"
                        description="Current decline from recent equity peak. Lower is generally safer."
                      />
                    </TableCell>
                    <TableCell align="right">
                      <HeaderCellWithTooltip
                        label="Actions"
                        description="Start/stop execution and open configuration edit dialog."
                      />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {strategies.map((strategy) => (
                    <TableRow key={strategy.id} hover>
                      <TableCell>{strategy.name}</TableCell>
                      <TableCell>{strategy.type}</TableCell>
                      <TableCell>
                        <Chip label={strategy.status} size="small" color={statusColor(strategy.status)} />
                      </TableCell>
                      <TableCell>
                        {strategy.symbol} ({strategy.timeframe})
                      </TableCell>
                      <TableCell>{(strategy.riskPerTrade * 100).toFixed(2)}%</TableCell>
                      <TableCell>{strategy.profitLoss.toFixed(2)}</TableCell>
                      <TableCell>{strategy.tradeCount}</TableCell>
                      <TableCell>{strategy.currentDrawdown.toFixed(2)}%</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {strategy.status === 'RUNNING' ? (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              disabled={isBusy}
                              onClick={() => setActionDialog({ strategy, action: 'stop' })}
                            >
                              Stop
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={isBusy}
                              onClick={() => setActionDialog({ strategy, action: 'start' })}
                            >
                              Start
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={isBusy}
                            onClick={() => setSelectedStrategy(strategy)}
                          >
                            Edit
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
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
