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
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import {
  useCancelMarketDataJobMutation,
  useCreateMarketDataJobMutation,
  useGetMarketDataJobsQuery,
  useGetMarketDataProvidersQuery,
  useRetryMarketDataJobMutation,
  type CreateMarketDataJobPayload,
  type MarketDataImportJob,
  type MarketDataProvider,
} from './marketDataApi';

import { AppLayout } from '@/components/layout/AppLayout';
import { FieldTooltip } from '@/components/ui/FieldTooltip';
import { getApiErrorMessage } from '@/services/api';
import { sanitizeText } from '@/utils/security';

type FormState = {
  providerId: string;
  assetType: 'STOCK' | 'CRYPTO';
  symbolsText: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  datasetName: string;
  adjusted: boolean;
  regularSessionOnly: boolean;
};

const DEFAULT_FORM: FormState = {
  providerId: 'binance',
  assetType: 'CRYPTO',
  symbolsText: 'BTC/USDT\nETH/USDT\nSOL/USDT',
  timeframe: '1h',
  startDate: '2024-03-12',
  endDate: '2026-03-12',
  datasetName: '',
  adjusted: false,
  regularSessionOnly: false,
};

const splitSymbols = (symbolsText: string): string[] =>
  symbolsText
    .split(/[\n,]+/)
    .map((symbol) => symbol.trim())
    .filter((symbol) => symbol.length > 0);

const resolveAssetType = (
  provider: MarketDataProvider | null,
  assetType: FormState['assetType']
): FormState['assetType'] =>
  provider?.supportedAssetTypes.includes(assetType) ? assetType : (provider?.supportedAssetTypes[0] ?? assetType);

const resolveTimeframe = (provider: MarketDataProvider | null, timeframe: string): string =>
  provider?.supportedTimeframes.includes(timeframe) ? timeframe : (provider?.supportedTimeframes[0] ?? timeframe);

const statusColor = (status: MarketDataImportJob['status']): 'default' | 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'RUNNING':
      return 'warning';
    case 'WAITING_RETRY':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
};

const providerCredentialMessage = (configuredSource: MarketDataProvider['apiKeyConfiguredSource'], envVar: string | null) => {
  switch (configuredSource) {
    case 'DATABASE':
      return 'API key configured from the encrypted database setting.';
    case 'ENVIRONMENT':
      return envVar
        ? `API key configured from ${envVar}.`
        : 'API key configured from the backend environment.';
    case 'DATABASE_LOCKED':
      return 'A stored database key exists, but the backend master key is missing so the provider cannot use it yet.';
    default:
      return envVar ? `Set ${envVar} in Settings or backend environment before creating jobs.` : 'Configure an API key before creating jobs.';
  }
};

export default function MarketDataPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const { data: providers = [] } = useGetMarketDataProvidersQuery();
  const { data: jobs = [] } = useGetMarketDataJobsQuery(undefined, {
    pollingInterval: 5000,
    skipPollingIfUnfocused: true,
  });
  const [createJob, { isLoading: isCreating }] = useCreateMarketDataJobMutation();
  const [retryJob, { isLoading: isRetrying }] = useRetryMarketDataJobMutation();
  const [cancelJob, { isLoading: isCancelling }] = useCancelMarketDataJobMutation();

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === form.providerId) ?? providers[0] ?? null,
    [form.providerId, providers]
  );
  const effectiveAssetType = resolveAssetType(selectedProvider, form.assetType);
  const effectiveTimeframe = resolveTimeframe(selectedProvider, form.timeframe);
  const adjustedEnabled = Boolean(selectedProvider?.supportsAdjusted) && effectiveAssetType === 'STOCK';
  const regularSessionEnabled =
    Boolean(selectedProvider?.supportsRegularSessionOnly) && effectiveAssetType === 'STOCK';

  const waitingJobs = jobs.filter((job) => job.status === 'WAITING_RETRY');
  const activeJobs = jobs.filter((job) => job.status === 'RUNNING' || job.status === 'QUEUED');

  const onSubmit = async () => {
    const payload: CreateMarketDataJobPayload = {
      providerId: selectedProvider?.id ?? form.providerId,
      assetType: effectiveAssetType,
      symbols: splitSymbols(form.symbolsText),
      timeframe: effectiveTimeframe,
      startDate: form.startDate,
      endDate: form.endDate,
      datasetName: form.datasetName.trim() || undefined,
      adjusted: adjustedEnabled ? form.adjusted : false,
      regularSessionOnly: regularSessionEnabled ? form.regularSessionOnly : false,
    };

    try {
      const created = await createJob(payload).unwrap();
      setFeedback({
        severity: 'success',
        message: `Import job #${created.id} queued for ${created.providerLabel}. The downloader will keep retrying automatically if the provider asks it to wait.`,
      });
    } catch (error) {
      setFeedback({ severity: 'error', message: getApiErrorMessage(error) });
    }
  };

  const onRetry = async (jobId: number) => {
    try {
      await retryJob(jobId).unwrap();
      setFeedback({ severity: 'success', message: `Job #${jobId} restarted from the beginning.` });
    } catch (error) {
      setFeedback({ severity: 'error', message: getApiErrorMessage(error) });
    }
  };

  const onCancel = async (jobId: number) => {
    try {
      await cancelJob(jobId).unwrap();
      setFeedback({ severity: 'success', message: `Job #${jobId} cancelled.` });
    } catch (error) {
      setFeedback({ severity: 'error', message: getApiErrorMessage(error) });
    }
  };

  const handleProviderChange = (providerId: string) => {
    const nextProvider = providers.find((provider) => provider.id === providerId) ?? null;
    const nextAssetType = resolveAssetType(nextProvider, form.assetType);
    const nextTimeframe = resolveTimeframe(nextProvider, form.timeframe);
    const stockOptionsEnabled = nextAssetType === 'STOCK';

    setForm((current) => ({
      ...current,
      providerId,
      assetType: nextAssetType,
      timeframe: nextTimeframe,
      adjusted: stockOptionsEnabled && Boolean(nextProvider?.supportsAdjusted) ? current.adjusted : false,
      regularSessionOnly:
        stockOptionsEnabled && Boolean(nextProvider?.supportsRegularSessionOnly)
          ? current.regularSessionOnly
          : false,
    }));
  };

  const handleAssetTypeChange = (assetType: string) => {
    if (assetType !== 'STOCK' && assetType !== 'CRYPTO') {
      return;
    }

    setForm((current) => ({
      ...current,
      assetType,
      adjusted: assetType === 'STOCK' ? current.adjusted : false,
      regularSessionOnly: assetType === 'STOCK' ? current.regularSessionOnly : false,
    }));
  };

  return (
    <AppLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Market Data Downloader
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create provider-backed import jobs that fetch historical bars, wait through provider limits, and import completed datasets directly into the backtest catalog.
        </Typography>

        {feedback ? (
          <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        {waitingJobs.length > 0 ? (
          <Alert severity="info" icon={<HourglassTopIcon />} sx={{ mb: 2 }}>
            {waitingJobs.length} job{waitingJobs.length === 1 ? '' : 's'} waiting for provider retry windows.
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
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
                        onChange={(event) => handleProviderChange(event.target.value)}
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
                          onChange={(event) => handleAssetTypeChange(event.target.value)}
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
                          onChange={(event) => setForm((current) => ({ ...current, timeframe: event.target.value }))}
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
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          symbolsText: event.target.value.replace(/\r\n/g, '\n'),
                        }))
                      }
                      helperText={selectedProvider ? `Examples: ${selectedProvider.symbolExamples.join(', ')}` : 'One symbol per line.'}
                    />
                  </FieldTooltip>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Start Date"
                        value={form.startDate}
                        onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="End Date"
                        value={form.endDate}
                        onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Dataset Name (optional)"
                    value={form.datasetName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, datasetName: sanitizeText(event.target.value) }))
                    }
                    placeholder="Binance BTC majors 1h 2024-2026"
                    helperText="Leave blank to let the app generate a readable dataset name."
                  />

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={adjustedEnabled && form.adjusted}
                          disabled={!adjustedEnabled}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, adjusted: event.target.checked }))
                          }
                        />
                      }
                      label="Adjusted bars"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={regularSessionEnabled && form.regularSessionOnly}
                          disabled={!regularSessionEnabled}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              regularSessionOnly: event.target.checked,
                            }))
                          }
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
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={2}>
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
                        <Alert severity={selectedProvider.apiKeyRequired && !selectedProvider.apiKeyConfigured ? 'warning' : 'info'}>
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

              <Card>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="h6">How To Use It</Typography>
                    <Typography variant="body2" color="text.secondary">
                      1. Configure any required provider API key in your environment.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      2. Create a job here. The backend worker fetches bars in chunks and keeps retrying automatically when a provider asks it to wait.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      3. When a job completes, its dataset is available in the Backtest page.
                    </Typography>
                    <Button component={RouterLink} to="/backtest" size="small" startIcon={<PlayArrowOutlinedIcon />}>
                      Open Backtest
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="h6">Import Jobs</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active jobs: {activeJobs.length} | Waiting to retry: {waitingJobs.length}
                      </Typography>
                    </Box>
                    {(isRetrying || isCancelling) && (
                      <Chip label="Updating job state" color="warning" size="small" />
                    )}
                  </Stack>

                  {jobs.length === 0 ? (
                    <Alert severity="info">No import jobs yet. Create one above to start building datasets automatically.</Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {jobs.map((job) => (
                        <Grid key={job.id} size={{ xs: 12, lg: 6 }}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                              <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" spacing={1}>
                                  <Typography variant="subtitle1">#{job.id} {job.datasetName}</Typography>
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
                                  Rows imported: {job.importedRowCount} | Attempts: {job.attemptCount}
                                  {job.currentSymbol ? ` | Current symbol: ${job.currentSymbol}` : ''}
                                  {job.nextRetryAt ? ` | Next retry: ${new Date(job.nextRetryAt).toLocaleString()}` : ''}
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
                                  {job.status === 'QUEUED' || job.status === 'RUNNING' || job.status === 'WAITING_RETRY' ? (
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
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
