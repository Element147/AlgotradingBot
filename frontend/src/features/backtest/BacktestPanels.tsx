import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import type {
  BacktestAlgorithm,
  BacktestExperimentSummary,
  BacktestHistoryItem,
} from './backtestApi';
import {
  executionProgressValue,
  executionStageDescription,
  executionStageLabel,
  executionStatusColor,
  formatLastUpdate,
  formatLiveEventTimestamp,
  formatProgressTimestamp,
  isExecutionActive,
  percentLeft,
  validationColor,
} from './backtestPageState';
import { formatBacktestMarketLabel } from './backtestTypes';

import { KeyValueGrid } from '@/components/ui/KeyValueGrid';
import type { StrategyProfile } from '@/features/strategies/strategyProfiles';
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercentage,
} from '@/utils/formatters';

const asyncStateLabel = (item: BacktestHistoryItem) =>
  item.asyncMonitor?.state ?? (item.executionStatus === 'PENDING' ? 'QUEUED' : item.executionStatus);

interface BacktestTransportStatusAlertProps {
  transportConnected: boolean;
  lastLiveEventAt: string | null;
  websocketError: string | null;
}

export function BacktestTransportStatusAlert({
  transportConnected,
  lastLiveEventAt,
  websocketError,
}: BacktestTransportStatusAlertProps) {
  return (
    <Alert severity={transportConnected ? 'success' : 'info'} sx={{ mb: 2 }}>
      Backtest transport: {transportConnected ? 'live WebSocket stream connected' : 'fallback polling active'}.
      {' '}Last pushed progress event: {formatLiveEventTimestamp(lastLiveEventAt)}.
      {' '}Safety poll cadence: {transportConnected ? '30 seconds' : '2 seconds'}.
      {!transportConnected && websocketError ? ` Stream status: ${websocketError}.` : ''}
    </Alert>
  );
}

interface BacktestTrackedRunCardProps {
  trackedRun: BacktestHistoryItem;
  transportConnected: boolean;
  lastLiveEventAt: string | null;
}

export function BacktestTrackedRunCard({
  trackedRun,
  transportConnected,
  lastLiveEventAt,
}: BacktestTrackedRunCardProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="h6">Current Run Progress</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                Tracking run #{trackedRun.id} for {trackedRun.strategyId} on{' '}
                {trackedRun.datasetName ?? 'dataset'}.
              </Typography>
            </Box>
            <Chip
              label={asyncStateLabel(trackedRun)}
              color={executionStatusColor(trackedRun.executionStatus)}
              variant={trackedRun.executionStatus === 'COMPLETED' ? 'filled' : 'outlined'}
            />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={executionProgressValue(trackedRun)}
            color={trackedRun.executionStatus === 'FAILED' ? 'error' : 'primary'}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <KeyValueGrid
            items={[
              {
                label: 'Transport',
                value: transportConnected ? 'WebSocket live' : 'Polling fallback',
                tone: transportConnected ? 'success' : 'warning',
              },
              { label: 'Stage', value: executionStageLabel(trackedRun.executionStage) },
              { label: 'Done', value: `${executionProgressValue(trackedRun)}%` },
              { label: 'Left', value: `${percentLeft(trackedRun)}%` },
              {
                label: 'Current data date',
                value: formatProgressTimestamp(trackedRun.currentDataTimestamp),
              },
              {
                label: 'Candles',
                value: `${formatNumber(trackedRun.processedCandles)} / ${formatNumber(trackedRun.totalCandles)}`,
              },
              { label: 'Last backend update', value: formatLastUpdate(trackedRun.lastProgressAt) },
              { label: 'Last pushed event', value: formatLiveEventTimestamp(lastLiveEventAt) },
              {
                label: 'Attempts',
                value: trackedRun.asyncMonitor
                  ? `${trackedRun.asyncMonitor.attemptCount} / ${trackedRun.asyncMonitor.maxAttempts ?? 1}`
                  : '1 / 1',
              },
            ]}
          />
          <Typography variant="body2" color="text.secondary">
            {executionStageDescription(trackedRun)}
          </Typography>
          {isExecutionActive(trackedRun) && !transportConnected ? (
            <Alert severity="warning">
              Live stream is not connected, so this page is temporarily relying on polling for
              execution updates.
            </Alert>
          ) : null}
          {trackedRun.asyncMonitor?.timedOut ? (
            <Alert severity="error">
              This run has not reported progress within the expected timeout window. Use replay to
              restart it if the worker does not recover.
            </Alert>
          ) : null}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              label={`Validation: ${trackedRun.validationStatus}`}
              sx={{ color: validationColor(trackedRun.validationStatus) }}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`${formatBacktestMarketLabel(trackedRun.symbol)} (${trackedRun.timeframe})`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`${trackedRun.feesBps} / ${trackedRun.slippageBps} bps`}
              variant="outlined"
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface BacktestRunLauncherPanelProps {
  selectedAlgorithm: BacktestAlgorithm | null;
  selectedAlgorithmProfile: StrategyProfile | null;
  requiresDatasetUniverse: boolean;
  hasActiveDatasets: boolean;
  onOpenConfigModal: () => void;
}

export function BacktestRunLauncherPanel({
  selectedAlgorithm,
  selectedAlgorithmProfile,
  requiresDatasetUniverse,
  hasActiveDatasets,
  onOpenConfigModal,
}: BacktestRunLauncherPanelProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Run Backtest
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Not sure what to choose? Start with <strong>Buy and Hold</strong> or{' '}
          <strong>SMA Crossover</strong>, a single active dataset, the recommended timeframe, and the
          default cost assumptions.
        </Alert>
        {selectedAlgorithm ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>{selectedAlgorithm.label}:</strong> {selectedAlgorithm.description}
            {selectedAlgorithmProfile ? ` Best use: ${selectedAlgorithmProfile.bestFor}` : ''}
            {requiresDatasetUniverse ? ' Uses all symbols in the selected dataset.' : ''}
          </Alert>
        ) : null}
        {!hasActiveDatasets ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Restore an archived dataset or create a provider import in Market Data before opening the
            backtest configuration dialog.
          </Alert>
        ) : null}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          onClick={onOpenConfigModal}
          disabled={!hasActiveDatasets}
        >
          Run New Backtest
        </Button>
      </CardContent>
    </Card>
  );
}

interface BacktestExperimentSummariesPanelProps {
  experimentSummaries: BacktestExperimentSummary[];
}

export function BacktestExperimentSummariesPanel({
  experimentSummaries,
}: BacktestExperimentSummariesPanelProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Experiment Summaries
        </Typography>
        {experimentSummaries.length === 0 ? (
          <Alert severity="info">Named experiment groups will appear here once runs are recorded.</Alert>
        ) : (
          <Stack spacing={1.25}>
            {experimentSummaries.slice(0, 6).map((summary) => (
              <Box
                key={summary.experimentKey}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.25 }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                      {summary.experimentName}
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                      <Chip size="small" label={`Run #${summary.latestBacktestId}`} variant="outlined" />
                      <Chip size="small" label={summary.strategyId} variant="outlined" />
                      <Chip
                        size="small"
                        label={`${formatBacktestMarketLabel(summary.symbol)} (${summary.timeframe})`}
                        variant="outlined"
                      />
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.75, overflowWrap: 'anywhere' }}
                    >
                      {summary.datasetName ?? 'No dataset label'} | Latest run at{' '}
                      {formatDateTime(summary.latestRunAt)}
                    </Typography>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 0.35, sm: 1.5 }}
                      sx={{ mt: 0.75 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Runs: {summary.runCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg return: {formatPercentage(summary.averageReturnPercent)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Best balance: {formatCurrency(summary.bestFinalBalance)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Worst drawdown: {formatPercentage(summary.worstMaxDrawdown)}
                      </Typography>
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label={`Exec: ${summary.latestExecutionStatus}`}
                      color={summary.latestExecutionStatus === 'COMPLETED' ? 'success' : 'default'}
                    />
                    <Chip
                      size="small"
                      label={`Validation: ${summary.latestValidationStatus}`}
                      sx={{ color: validationColor(summary.latestValidationStatus) }}
                    />
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
