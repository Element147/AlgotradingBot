import AddIcon from '@mui/icons-material/Add';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import type {
  BacktestAlgorithm,
  BacktestComparisonResponse,
  BacktestDataset,
  BacktestDatasetRetentionReport,
  BacktestExperimentSummary,
  BacktestHistoryItem,
} from './backtestApi';
import { BacktestComparisonPanel } from './BacktestComparisonPanel';
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
  retentionChipColor,
  retentionLabel,
  validationColor,
} from './backtestPageState';
import { formatBacktestMarketLabel } from './backtestTypes';

import { FieldTooltip } from '@/components/ui/FieldTooltip';
import type { StrategyProfile } from '@/features/strategies/strategyProfiles';
import { formatDateTime, formatNumber } from '@/utils/formatters';

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
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="h6">Current Run Progress</Typography>
              <Typography variant="body2" color="text.secondary">
                Tracking run #{trackedRun.id} for {trackedRun.strategyId} on{' '}
                {trackedRun.datasetName ?? 'dataset'}.
              </Typography>
            </Box>
            <Chip
              label={trackedRun.executionStatus}
              color={executionStatusColor(trackedRun.executionStatus)}
              variant={trackedRun.executionStatus === 'COMPLETED' ? 'filled' : 'outlined'}
            />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={executionProgressValue(trackedRun)}
            color={trackedRun.executionStatus === 'FAILED' ? 'error' : 'primary'}
            sx={{ height: 10, borderRadius: 999 }}
          />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              color={transportConnected ? 'success' : 'warning'}
              label={`Transport: ${transportConnected ? 'WebSocket live' : 'Polling fallback'}`}
              variant={transportConnected ? 'filled' : 'outlined'}
            />
            <Chip
              size="small"
              label={`Stage: ${executionStageLabel(trackedRun.executionStage)}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Done: ${executionProgressValue(trackedRun)}%`}
              variant="outlined"
            />
            <Chip size="small" label={`Left: ${percentLeft(trackedRun)}%`} variant="outlined" />
            <Chip
              size="small"
              label={`Current data date: ${formatProgressTimestamp(trackedRun.currentDataTimestamp)}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Candles: ${formatNumber(trackedRun.processedCandles)} / ${formatNumber(trackedRun.totalCandles)}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Last backend update: ${formatLastUpdate(trackedRun.lastProgressAt)}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Last pushed event: ${formatLiveEventTimestamp(lastLiveEventAt)}`}
              variant="outlined"
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {executionStageDescription(trackedRun)}
          </Typography>
          {isExecutionActive(trackedRun) && !transportConnected ? (
            <Alert severity="warning">
              Live stream is not connected, so this page is temporarily relying on polling for
              execution updates.
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

interface BacktestDatasetPanelProps {
  datasetName: string;
  datasetFile: File | null;
  retentionReport?: BacktestDatasetRetentionReport;
  datasets: BacktestDataset[];
  hasActiveDatasets: boolean;
  isUploading: boolean;
  datasetLifecycleBusy: boolean;
  onDatasetNameChange: (value: string) => void;
  onDatasetFileChange: (file: File | null) => void;
  onUploadDataset: () => void;
  onDownloadDataset: (datasetId: number) => void | Promise<void>;
  onArchiveDataset: (dataset: BacktestDataset) => void | Promise<void>;
  onRestoreDataset: (datasetId: number) => void | Promise<void>;
}

export function BacktestDatasetPanel({
  datasetName,
  datasetFile,
  retentionReport,
  datasets,
  hasActiveDatasets,
  isUploading,
  datasetLifecycleBusy,
  onDatasetNameChange,
  onDatasetFileChange,
  onUploadDataset,
  onDownloadDataset,
  onArchiveDataset,
  onRestoreDataset,
}: BacktestDatasetPanelProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Dataset Upload
        </Typography>
        <Stack spacing={2}>
          <Alert severity="info">
            Beginner tip: if you are unsure, start with one clean symbol dataset first, then move to
            multi-symbol universe strategies after you understand the baseline behavior.
          </Alert>
          {retentionReport ? (
            <Alert severity={retentionReport.archiveCandidateDatasets > 0 ? 'warning' : 'info'}>
              Active: {retentionReport.activeDatasets} | Archived: {retentionReport.archivedDatasets}
              {' '}| Archive candidates: {retentionReport.archiveCandidateDatasets} | Referenced by
              backtests: {retentionReport.referencedDatasetCount}
            </Alert>
          ) : null}
          <FieldTooltip title="Human-readable dataset label. Clear naming prevents running backtests on the wrong file.">
            <TextField
              label="Dataset Name (optional)"
              value={datasetName}
              onChange={(event) => onDatasetNameChange(event.target.value)}
              placeholder="BTC 1h 2025"
              helperText="Optional label to identify symbol/timeframe/date range."
            />
          </FieldTooltip>
          <FieldTooltip title="CSV upload defines the historical data source. Incorrect format or timeframe invalidates results.">
            <Button variant="outlined" component="label">
              {datasetFile ? `Selected: ${datasetFile.name}` : 'Choose CSV File'}
              <input
                hidden
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => onDatasetFileChange(event.target.files?.[0] ?? null)}
              />
            </Button>
          </FieldTooltip>
          <Button variant="contained" onClick={onUploadDataset} disabled={!datasetFile || isUploading}>
            Upload Dataset
          </Button>
          <Typography variant="caption" color="text.secondary">
            CSV format: timestamp,symbol,open,high,low,close,volume
          </Typography>
          {!hasActiveDatasets ? (
            <Alert severity="warning">
              No active datasets are available for new runs. Restore an archived dataset or upload a
              new CSV.
            </Alert>
          ) : null}
          {datasets.length > 0 ? (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">Dataset Inventory</Typography>
                {datasets.map((dataset) => (
                  <Box
                    key={dataset.id}
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.25 }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {dataset.name}
                          </Typography>
                          <Chip
                            size="small"
                            color={retentionChipColor(dataset.retentionStatus)}
                            label={retentionLabel(dataset.retentionStatus)}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {dataset.originalFilename} | {dataset.rowCount} rows | {dataset.symbolsCsv}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Schema: {dataset.schemaVersion} | Checksum: {dataset.checksumSha256}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Used by backtests: {dataset.usageCount}
                          {dataset.lastUsedAt ? ` | Last used: ${dataset.lastUsedAt}` : ' | Never used'}
                          {dataset.duplicateCount > 1 ? ` | Duplicate uploads: ${dataset.duplicateCount}` : ''}
                        </Typography>
                        {dataset.archived && dataset.archiveReason ? (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Archive reason: {dataset.archiveReason}
                          </Typography>
                        ) : null}
                      </Box>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => void onDownloadDataset(dataset.id)}
                        >
                          Download
                        </Button>
                        {dataset.archived ? (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RestoreFromTrashIcon />}
                            disabled={datasetLifecycleBusy}
                            onClick={() => void onRestoreDataset(dataset.id)}
                          >
                            Restore
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            color="warning"
                            startIcon={<ArchiveOutlinedIcon />}
                            disabled={datasetLifecycleBusy}
                            onClick={() => void onArchiveDataset(dataset)}
                          >
                            Archive
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </>
          ) : null}
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
            Upload or restore an active dataset before opening the backtest configuration dialog.
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
    <Card>
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
                    <Typography variant="subtitle2">{summary.experimentName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Latest run #{summary.latestBacktestId} | {summary.strategyId} |{' '}
                      {summary.datasetName ?? '-'} | {formatBacktestMarketLabel(summary.symbol)} (
                      {summary.timeframe})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Runs: {summary.runCount} | Avg return: {summary.averageReturnPercent.toFixed(2)}%
                      {' '}| Best balance: {summary.bestFinalBalance.toFixed(2)} | Worst drawdown:{' '}
                      {summary.worstMaxDrawdown.toFixed(2)}%
                    </Typography>
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

interface BacktestHistoryPanelProps {
  history: BacktestHistoryItem[];
  comparison?: BacktestComparisonResponse;
  comparisonIds: number[];
  selectedId: number | null;
  comparisonIsStale: boolean;
  comparisonErrorMessage: string | null;
  lastLiveEventAt: string | null;
  isLoading: boolean;
  isError: boolean;
  isComparing: boolean;
  isReplaying: boolean;
  isDeletingBacktest: boolean;
  onCompareSelected: () => void | Promise<void>;
  onClearComparison: () => void;
  onToggleComparison: (backtestId: number) => void;
  onSelectRun: (backtestId: number) => void;
  onViewDetails: (backtestId: number) => void;
  onReplayBacktest: (backtestId: number) => void | Promise<void>;
  onDeleteResult: (item: BacktestHistoryItem) => void | Promise<void>;
}

export function BacktestHistoryPanel({
  history,
  comparison,
  comparisonIds,
  selectedId,
  comparisonIsStale,
  comparisonErrorMessage,
  lastLiveEventAt,
  isLoading,
  isError,
  isComparing,
  isReplaying,
  isDeletingBacktest,
  onCompareSelected,
  onClearComparison,
  onToggleComparison,
  onSelectRun,
  onViewDetails,
  onReplayBacktest,
  onDeleteResult,
}: BacktestHistoryPanelProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Backtest History
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => void onCompareSelected()}
            disabled={comparisonIds.length < 2 || isComparing}
          >
            Compare Selected ({comparisonIds.length})
          </Button>
          <Button
            variant="text"
            onClick={onClearComparison}
            disabled={comparisonIds.length === 0}
          >
            Clear Selection
          </Button>
        </Stack>
        {comparisonIsStale ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Comparison selection changed. Run compare again to refresh the analysis.
          </Alert>
        ) : null}
        {comparisonErrorMessage ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {comparisonErrorMessage}
          </Alert>
        ) : null}
        {isLoading ? <Typography>Loading history...</Typography> : null}
        {isError ? <Alert severity="error">Unable to load backtest history.</Alert> : null}

        {!isLoading && history.length > 0 ? (
          <TableContainer>
            <Table size="small" sx={{ minWidth: 1220 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <HeaderCellWithTooltip
                    label="Compare"
                    description="Select two or more completed runs to compare them side by side."
                  />
                </TableCell>
                <TableCell>
                  <HeaderCellWithTooltip
                    label="ID"
                    description="Unique run identifier. Select a row to open full details and charts."
                  />
                </TableCell>
                <TableCell>
                  <HeaderCellWithTooltip
                    label="Algorithm"
                    description="Strategy logic used for this backtest run."
                  />
                </TableCell>
                <TableCell>
                  <HeaderCellWithTooltip
                    label="Dataset"
                    description="Historical file used as market-data input."
                  />
                </TableCell>
                <TableCell>
                  <HeaderCellWithTooltip
                    label="Experiment"
                    description="Repeatable research group label for related runs."
                  />
                </TableCell>
                <TableCell>
                  <HeaderCellWithTooltip
                    label="Market"
                    description="Symbol and timeframe tested in the simulation."
                  />
                </TableCell>
                <TableCell>
                  <HeaderCellWithTooltip
                    label="Status"
                    description="Live execution stage, progress, and backend telemetry for the run."
                  />
                </TableCell>
                <TableCell>
                  <HeaderCellWithTooltip
                    label="Validation"
                    description="Quality gate result from internal checks; not proof of profitability."
                  />
                </TableCell>
                <TableCell>
                  <HeaderCellWithTooltip
                    label="Fees/Slippage"
                    description="Trading cost assumptions applied in basis points (bps)."
                  />
                </TableCell>
                <TableCell>
                  <HeaderCellWithTooltip
                    label="Actions"
                    description="Open detailed results, replay a prior setup, or delete finished runs."
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  onClick={() => onSelectRun(item.id)}
                  sx={{ cursor: 'pointer' }}
                  selected={item.id === selectedId}
                >
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={comparisonIds.includes(item.id)}
                      onChange={() => onToggleComparison(item.id)}
                      inputProps={{ 'aria-label': `Select backtest ${item.id} for comparison` }}
                    />
                  </TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.strategyId}</TableCell>
                  <TableCell>{item.datasetName ?? '-'}</TableCell>
                  <TableCell>{item.experimentName}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <span>
                        {formatBacktestMarketLabel(item.symbol)} ({item.timeframe})
                      </span>
                      {isExecutionActive(item) ? (
                        <LinearProgress
                          variant="determinate"
                          value={executionProgressValue(item)}
                          sx={{ height: 6, borderRadius: 999, minWidth: 120 }}
                        />
                      ) : null}
                      <Typography variant="caption" color="text.secondary">
                        {item.currentDataTimestamp
                          ? `Current data date: ${formatDateTime(item.currentDataTimestamp)}`
                          : 'Current data date: waiting for first candle'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Chip
                        size="small"
                        label={`${item.executionStatus} | ${executionProgressValue(item)}%`}
                        color={executionStatusColor(item.executionStatus)}
                        variant={item.executionStatus === 'COMPLETED' ? 'filled' : 'outlined'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {executionStageLabel(item.executionStage)} | {formatNumber(item.processedCandles)}
                        {' '}/ {formatNumber(item.totalCandles)} candles
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {executionStageDescription(item)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last backend update: {formatLastUpdate(item.lastProgressAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last pushed event: {formatLiveEventTimestamp(lastLiveEventAt)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: validationColor(item.validationStatus) }}>
                    {item.validationStatus}
                  </TableCell>
                  <TableCell>
                    {item.feesBps} bps / {item.slippageBps} bps
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                      <Button
                        size="small"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => onViewDetails(item.id)}
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        startIcon={<ReplayIcon />}
                        onClick={() => void onReplayBacktest(item.id)}
                        disabled={isReplaying}
                      >
                        Replay
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => void onDeleteResult(item)}
                        disabled={isDeletingBacktest || isExecutionActive(item)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </TableContainer>
        ) : null}

        {comparison ? <BacktestComparisonPanel comparison={comparison} /> : null}
      </CardContent>
    </Card>
  );
}
