import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Button,
  Chip,
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
  TableContainer,
  Tooltip,
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
import { StrategyConfigModal } from './StrategyConfigModal';
import { getAllStrategyProfiles, getStrategyProfile } from './strategyProfiles';
import type { StrategyConfigOutput } from './strategyValidation';

import { AppLayout } from '@/components/layout/AppLayout';
import {
  PageContent,
  PageIntro,
  type PageMetricItem,
  PageMetricStrip,
  PageSectionHeader,
} from '@/components/layout/PageContent';
import {
  EmptyState,
  NumericText,
  StatusPill,
  SurfacePanel,
} from '@/components/ui/Workbench';

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
  const {
    data: strategies = [],
    isLoading,
    isError,
    error,
  } = useGetStrategiesQuery(undefined, {
    pollingInterval: 30000,
    skipPollingIfUnfocused: true,
  });
  const [startStrategy, { isLoading: isStarting }] = useStartStrategyMutation();
  const [stopStrategy, { isLoading: isStopping }] = useStopStrategyMutation();
  const [updateConfig, { isLoading: isSavingConfig }] =
    useUpdateStrategyConfigMutation();

  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>(null);
  const [feedback, setFeedback] = useState<{
    severity: 'success' | 'error';
    message: string;
  } | null>(null);

  const isBusy = isStarting || isStopping || isSavingConfig;
  const strategyProfiles = getAllStrategyProfiles();
  const summaryItems = useMemo<PageMetricItem[]>(() => {
    const runningCount = strategies.filter((strategy) => strategy.status === 'RUNNING').length;
    const longOnlyCount = strategies.filter(
      (strategy) => !strategy.shortSellingEnabled
    ).length;

    return [
      {
        label: 'Catalog Coverage',
        value: `${strategyProfiles.length} templates`,
        detail: 'Canonical strategy profiles stay aligned with the backtest catalog.',
        tone: 'info',
      },
      {
        label: 'Running Now',
        value: `${runningCount} active`,
        detail: 'Running strategies stay in paper mode only.',
        tone: runningCount > 0 ? 'success' : 'default',
      },
      {
        label: 'Long-Only Default',
        value: `${longOnlyCount} configs`,
        detail: 'Short exposure remains opt-in per saved strategy config.',
        tone: 'success',
      },
      {
        label: 'Beginner Rule',
        value: 'Edit before Start',
        detail: 'Review risk per trade, symbol, timeframe, and shorting before you enable a strategy.',
        tone: 'warning',
      },
    ];
  }, [strategies, strategyProfiles.length]);

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
          actionDialog.action === 'start'
            ? 'Failed to start strategy.'
            : 'Failed to stop strategy.',
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
      <PageContent maxWidth="research">
        <PageIntro
          eyebrow="Paper-safe strategy desk"
          description="Pick a template, review how it behaves, then edit configuration before you start or stop anything in the paper workflow."
          chips={
            <>
              <Chip label="Start and stop remain paper-only" variant="outlined" />
              <Chip label="Short exposure is opt-in" variant="outlined" />
              <Chip label="Config history stays visible" variant="outlined" />
            </>
          }
        />

        <PageMetricStrip items={summaryItems} />

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        {isLoading ? <Alert severity="info">Loading strategy catalog...</Alert> : null}

        {isError ? (
          <Alert severity="error">
            Failed to load strategies. {String((error as { status?: string })?.status ?? '')}
          </Alert>
        ) : null}

        <Stack spacing={2}>
          <PageSectionHeader
            title="Strategy guide"
            description="Use these quick notes when you are learning what each profile is trying to do. The table below remains the place to start, stop, and edit saved configs."
          />

          <Grid container spacing={1.5}>
            {strategyProfiles.map((profile) => (
              <Grid key={profile.key} size={{ xs: 12, md: 6, xl: 4 }}>
                <SurfacePanel
                  title={profile.title}
                  description={profile.shortDescription}
                  sx={{ height: '100%' }}
                >
                  <Typography variant="caption" display="block">
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
                </SurfacePanel>
              </Grid>
            ))}
          </Grid>
        </Stack>

        {!isLoading && !isError ? (
          <SurfacePanel
            title="Saved strategy configs"
            description="Edit config first, then use the lighter action band to start or stop paper execution."
            actions={
              <StatusPill
                label={isBusy ? 'Updating strategy state' : 'Paper mode only'}
                tone={isBusy ? 'warning' : 'success'}
                variant="filled"
              />
            }
          >
            {strategies.length === 0 ? (
              <EmptyState
                title="No saved strategies returned"
                description="When the backend exposes saved strategy configs, they will appear here for review and editing."
                tone="info"
              />
            ) : (
              <TableContainer>
                <Table size="small" sx={{ minWidth: 1120 }}>
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
                        description="Underlying strategy model, such as mean reversion or trend following."
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
                        description="Current strategy profit or loss as reported by backend metrics."
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
                        description="Current decline from recent equity peak."
                      />
                    </TableCell>
                    <TableCell>
                      <HeaderCellWithTooltip
                        label="Config"
                        description="Current configuration version and last config update."
                      />
                    </TableCell>
                    <TableCell align="right">
                      <HeaderCellWithTooltip
                        label="Actions"
                        description="Start or stop execution and open the configuration editor."
                      />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {strategies.map((strategy) => {
                    const strategyProfile = getStrategyProfile(strategy.type);

                    return (
                      <TableRow key={strategy.id} hover>
                        <TableCell>
                          {strategy.name}
                          {strategyProfile ? (
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              {strategyProfile.shortDescription}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {strategyProfile?.title ?? strategy.type}
                          <Typography variant="caption" display="block" color="text.secondary">
                            Canonical ID: {strategy.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            label={strategy.status}
                            tone={statusColor(strategy.status)}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          {strategy.symbol} ({strategy.timeframe})
                          <Typography variant="caption" display="block" color="text.secondary">
                            {strategy.shortSellingEnabled ? 'Long + short enabled' : 'Long only'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <NumericText variant="body2">
                            {(strategy.riskPerTrade * 100).toFixed(2)}%
                          </NumericText>
                        </TableCell>
                        <TableCell>
                          <NumericText
                            variant="body2"
                            tone={strategy.profitLoss >= 0 ? 'success' : 'error'}
                          >
                            {strategy.profitLoss.toFixed(2)}
                          </NumericText>
                        </TableCell>
                        <TableCell>
                          <NumericText variant="body2">{strategy.tradeCount}</NumericText>
                        </TableCell>
                        <TableCell>
                          <NumericText variant="body2">
                            {strategy.currentDrawdown.toFixed(2)}%
                          </NumericText>
                        </TableCell>
                        <TableCell>
                          v{strategy.configVersion}
                          {strategy.lastConfigChangedAt ? (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {strategy.lastConfigChangedAt}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Button
                              size="small"
                              variant="contained"
                              disabled={isBusy}
                              onClick={() => setSelectedStrategy(strategy)}
                            >
                              Edit config
                            </Button>
                            {strategy.status === 'RUNNING' ? (
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                disabled={isBusy}
                                onClick={() => setActionDialog({ strategy, action: 'stop' })}
                              >
                                Stop
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                disabled={isBusy}
                                onClick={() => setActionDialog({ strategy, action: 'start' })}
                              >
                                Start
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                </Table>
              </TableContainer>
            )}
          </SurfacePanel>
        ) : null}
      </PageContent>

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
