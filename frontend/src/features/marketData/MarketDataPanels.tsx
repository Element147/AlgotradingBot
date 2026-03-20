import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import type { MarketDataImportJob, MarketDataProvider } from './marketDataApi';
import {
  formatLiveImportEventTimestamp,
  formatOptionalDateTime,
  formatRelativeUpdate,
  providerCredentialMessage,
  statusColor,
  type MarketDataFormState,
} from './marketDataPageState';

import { FieldTooltip } from '@/components/ui/FieldTooltip';
import { formatNumber } from '@/utils/formatters';

interface MarketDataTransportAlertProps {
  transportConnected: boolean;
  lastImportEventAt: string | null;
  websocketError: string | null;
}

export function MarketDataTransportAlert({
  transportConnected,
  lastImportEventAt,
  websocketError,
}: MarketDataTransportAlertProps) {
  return (
    <Alert severity={transportConnected ? 'success' : 'info'} sx={{ mb: 2 }}>
      Import transport: {transportConnected ? 'live WebSocket stream connected' : 'fallback polling active'}.
      {' '}Last pushed import event: {formatLiveImportEventTimestamp(lastImportEventAt)}.
      {' '}Safety poll cadence: {transportConnected ? '30 seconds' : '5 seconds'}.
      {!transportConnected && websocketError ? ` Stream status: ${websocketError}.` : ''}
    </Alert>
  );
}

interface MarketDataWaitingJobsAlertProps {
  waitingJobCount: number;
}

export function MarketDataWaitingJobsAlert({
  waitingJobCount,
}: MarketDataWaitingJobsAlertProps) {
  if (waitingJobCount === 0) {
    return null;
  }

  return (
    <Alert severity="info" icon={<HourglassTopIcon />} sx={{ mb: 2 }}>
      {waitingJobCount} job{waitingJobCount === 1 ? '' : 's'} waiting for provider retry windows.
    </Alert>
  );
}

interface MarketDataTelemetryCardProps {
  trackedJob: MarketDataImportJob;
  transportConnected: boolean;
  lastImportEventAt: string | null;
}

export function MarketDataTelemetryCard({
  trackedJob,
  transportConnected,
  lastImportEventAt,
}: MarketDataTelemetryCardProps) {
  const currentSymbolIndex = Math.min(
    trackedJob.currentSymbolIndex + (trackedJob.currentSymbol ? 1 : 0),
    trackedJob.totalSymbols || 0
  );

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="h6">Current Import Telemetry</Typography>
              <Typography variant="body2" color="text.secondary">
                Tracking job #{trackedJob.id} for {trackedJob.providerLabel} on{' '}
                {trackedJob.symbolsCsv}.
              </Typography>
            </Box>
            <Chip size="small" color={statusColor(trackedJob.status)} label={trackedJob.status} />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              color={transportConnected ? 'success' : 'warning'}
              label={`Transport: ${transportConnected ? 'WebSocket live' : 'Polling fallback'}`}
              variant={transportConnected ? 'filled' : 'outlined'}
            />
            <Chip
              size="small"
              label={`Current symbol: ${trackedJob.currentSymbol ?? 'Waiting for first symbol'}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Symbol cursor: ${currentSymbolIndex} / ${trackedJob.totalSymbols}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Rows imported: ${formatNumber(trackedJob.importedRowCount)}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Current chunk start: ${formatOptionalDateTime(trackedJob.currentChunkStart)}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Last backend update: ${formatRelativeUpdate(trackedJob.updatedAt)}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Last pushed event: ${formatLiveImportEventTimestamp(lastImportEventAt)}`}
              variant="outlined"
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {trackedJob.statusMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Attempts: {trackedJob.attemptCount} | Started: {formatOptionalDateTime(trackedJob.startedAt)}
            {trackedJob.nextRetryAt ? ` | Next retry: ${formatOptionalDateTime(trackedJob.nextRetryAt)}` : ''}
            {trackedJob.completedAt ? ` | Completed: ${formatOptionalDateTime(trackedJob.completedAt)}` : ''}
          </Typography>
          {(trackedJob.status === 'RUNNING' ||
            trackedJob.status === 'QUEUED' ||
            trackedJob.status === 'WAITING_RETRY') &&
          !transportConnected ? (
            <Alert severity="warning">
              Live stream is not connected, so this page is temporarily relying on polling for import
              updates.
            </Alert>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

interface MarketDataJobFormPanelProps {
  providers: MarketDataProvider[];
  selectedProvider: MarketDataProvider | null;
  form: MarketDataFormState;
  effectiveAssetType: MarketDataFormState['assetType'];
  effectiveTimeframe: string;
  adjustedEnabled: boolean;
  regularSessionEnabled: boolean;
  isCreating: boolean;
  onProviderChange: (providerId: string) => void;
  onAssetTypeChange: (assetType: string) => void;
  onTimeframeChange: (timeframe: string) => void;
  onSymbolsChange: (symbolsText: string) => void;
  onStartDateChange: (startDate: string) => void;
  onEndDateChange: (endDate: string) => void;
  onDatasetNameChange: (datasetName: string) => void;
  onAdjustedChange: (adjusted: boolean) => void;
  onRegularSessionOnlyChange: (regularSessionOnly: boolean) => void;
  onSubmit: () => void | Promise<void>;
}

export function MarketDataJobFormPanel({
  providers,
  selectedProvider,
  form,
  effectiveAssetType,
  effectiveTimeframe,
  adjustedEnabled,
  regularSessionEnabled,
  isCreating,
  onProviderChange,
  onAssetTypeChange,
  onTimeframeChange,
  onSymbolsChange,
  onStartDateChange,
  onEndDateChange,
  onDatasetNameChange,
  onAdjustedChange,
  onRegularSessionOnlyChange,
  onSubmit,
}: MarketDataJobFormPanelProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Create Import Job</Typography>
          <FieldTooltip title="Choose the provider that will supply the historical bars. The page shows the account or API-key requirement for the currently selected source.">
            <FormControl fullWidth>
              <InputLabel id="market-data-provider-label">Provider</InputLabel>
              <Select
                labelId="market-data-provider-label"
                value={selectedProvider?.id ?? ''}
                label="Provider"
                onChange={(event) => onProviderChange(event.target.value)}
              >
                {providers.map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    {provider.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FieldTooltip>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="market-data-asset-type-label">Asset Type</InputLabel>
                <Select
                  labelId="market-data-asset-type-label"
                  value={effectiveAssetType}
                  label="Asset Type"
                  onChange={(event) => onAssetTypeChange(event.target.value)}
                >
                  {(selectedProvider?.supportedAssetTypes ?? []).map((assetType) => (
                    <MenuItem key={assetType} value={assetType}>
                      {assetType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="market-data-timeframe-label">Timeframe</InputLabel>
                <Select
                  labelId="market-data-timeframe-label"
                  value={effectiveTimeframe}
                  label="Timeframe"
                  onChange={(event) => onTimeframeChange(event.target.value)}
                >
                  {(selectedProvider?.supportedTimeframes ?? []).map((timeframe) => (
                    <MenuItem key={timeframe} value={timeframe}>
                      {timeframe}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <FieldTooltip title="Provide one symbol per line or a comma-separated list. Use stock tickers for equities and provider-compatible spot pairs for crypto, for example BTC/USDT or BTC/USD.">
            <TextField
              label="Symbols"
              multiline
              minRows={4}
              value={form.symbolsText}
              onChange={(event) => onSymbolsChange(event.target.value.replace(/\r\n/g, '\n'))}
              helperText={
                selectedProvider
                  ? `Examples: ${selectedProvider.symbolExamples.join(', ')}`
                  : 'One symbol per line.'
              }
            />
          </FieldTooltip>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={form.startDate}
                onChange={(event) => onStartDateChange(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={form.endDate}
                onChange={(event) => onEndDateChange(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Dataset Name (optional)"
            value={form.datasetName}
            onChange={(event) => onDatasetNameChange(event.target.value)}
            placeholder="Binance BTC majors 1h 2024-2026"
            helperText="Leave blank to let the app generate a readable dataset name."
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={adjustedEnabled && form.adjusted}
                  disabled={!adjustedEnabled}
                  onChange={(event) => onAdjustedChange(event.target.checked)}
                />
              }
              label="Adjusted bars"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={regularSessionEnabled && form.regularSessionOnly}
                  disabled={!regularSessionEnabled}
                  onChange={(event) => onRegularSessionOnlyChange(event.target.checked)}
                />
              }
              label="Regular session only"
            />
          </Stack>

          <Button
            variant="contained"
            startIcon={<CloudDownloadOutlinedIcon />}
            onClick={() => void onSubmit()}
            disabled={isCreating || !selectedProvider}
          >
            Create Download Job
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface MarketDataProviderSetupPanelProps {
  selectedProvider: MarketDataProvider | null;
}

export function MarketDataProviderSetupPanel({
  selectedProvider,
}: MarketDataProviderSetupPanelProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">Provider Setup</Typography>
          {selectedProvider ? (
            <>
              <Typography variant="body2" color="text.secondary">
                {selectedProvider.description}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {selectedProvider.supportedAssetTypes.map((assetType) => (
                  <Chip key={assetType} label={assetType} size="small" />
                ))}
                {selectedProvider.supportedTimeframes.map((timeframe) => (
                  <Chip key={timeframe} label={timeframe} size="small" variant="outlined" />
                ))}
              </Stack>
              <Alert
                severity={
                  selectedProvider.apiKeyRequired && !selectedProvider.apiKeyConfigured
                    ? 'warning'
                    : 'info'
                }
              >
                {selectedProvider.apiKeyRequired ? (
                  <>
                    {providerCredentialMessage(
                      selectedProvider.apiKeyConfiguredSource,
                      selectedProvider.apiKeyEnvironmentVariable
                    )}
                  </>
                ) : (
                  <>This provider works without an API key.</>
                )}
              </Alert>
              <Typography variant="body2">{selectedProvider.accountNotes}</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  component={Link}
                  href={selectedProvider.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  endIcon={<OpenInNewIcon />}
                  size="small"
                >
                  Docs
                </Button>
                <Button
                  component={Link}
                  href={selectedProvider.signupUrl}
                  target="_blank"
                  rel="noreferrer"
                  endIcon={<OpenInNewIcon />}
                  size="small"
                >
                  Account / Key
                </Button>
              </Stack>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Loading provider metadata.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function MarketDataHowToPanel() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">How To Use It</Typography>
          <Typography variant="body2" color="text.secondary">
            1. Configure any required provider API key in your environment.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            2. Create a job here. The backend worker fetches bars in chunks and keeps retrying
            automatically when a provider asks it to wait.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            3. When a job completes, its dataset is available in the Backtest page.
          </Typography>
          <Button
            component={RouterLink}
            to="/backtest"
            size="small"
            startIcon={<PlayArrowOutlinedIcon />}
          >
            Open Backtest
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface MarketDataJobsPanelProps {
  jobs: MarketDataImportJob[];
  activeJobCount: number;
  waitingJobCount: number;
  jobStateUpdating: boolean;
  onRetry: (jobId: number) => void | Promise<void>;
  onCancel: (jobId: number) => void | Promise<void>;
}

export function MarketDataJobsPanel({
  jobs,
  activeJobCount,
  waitingJobCount,
  jobStateUpdating,
  onRetry,
  onCancel,
}: MarketDataJobsPanelProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="h6">Import Jobs</Typography>
              <Typography variant="body2" color="text.secondary">
                Active jobs: {activeJobCount} | Waiting to retry: {waitingJobCount}
              </Typography>
            </Box>
            {jobStateUpdating ? <Chip label="Updating job state" color="warning" size="small" /> : null}
          </Stack>

          {jobs.length === 0 ? (
            <Alert severity="info">
              No import jobs yet. Create one above to start building datasets automatically.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {jobs.map((job) => (
                <Grid key={job.id} size={{ xs: 12, lg: 6 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Typography variant="subtitle1">
                            #{job.id} {job.datasetName}
                          </Typography>
                          <Chip size="small" color={statusColor(job.status)} label={job.status} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {job.providerLabel} | {job.assetType} | {job.symbolsCsv} | {job.timeframe}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {job.startDate} to {job.endDate}
                        </Typography>
                        <Typography variant="body2">{job.statusMessage}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rows imported: {formatNumber(job.importedRowCount)} | Attempts:{' '}
                          {job.attemptCount}
                          {job.currentSymbol ? ` | Current symbol: ${job.currentSymbol}` : ''}
                          {job.currentChunkStart
                            ? ` | Chunk start: ${formatOptionalDateTime(job.currentChunkStart)}`
                            : ''}
                          {job.nextRetryAt
                            ? ` | Next retry: ${formatOptionalDateTime(job.nextRetryAt)}`
                            : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last backend update: {formatRelativeUpdate(job.updatedAt)} | Started:{' '}
                          {job.startedAt ? formatOptionalDateTime(job.startedAt) : 'queued only'}
                          {job.completedAt
                            ? ` | Completed: ${formatOptionalDateTime(job.completedAt)}`
                            : ''}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {job.status === 'FAILED' || job.status === 'CANCELLED' ? (
                            <Button
                              size="small"
                              startIcon={<RefreshIcon />}
                              onClick={() => void onRetry(job.id)}
                            >
                              Retry
                            </Button>
                          ) : null}
                          {job.status === 'QUEUED' ||
                          job.status === 'RUNNING' ||
                          job.status === 'WAITING_RETRY' ? (
                            <Button
                              size="small"
                              color="inherit"
                              startIcon={<CancelOutlinedIcon />}
                              onClick={() => void onCancel(job.id)}
                            >
                              Cancel
                            </Button>
                          ) : null}
                          {job.datasetReady && job.datasetId ? (
                            <Button
                              size="small"
                              component={RouterLink}
                              to="/backtest"
                              startIcon={<PlayArrowOutlinedIcon />}
                            >
                              Dataset #{job.datasetId} ready
                            </Button>
                          ) : null}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
