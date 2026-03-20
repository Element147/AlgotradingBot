import { Alert, Box, Grid, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import {
  useCancelMarketDataJobMutation,
  useCreateMarketDataJobMutation,
  useGetMarketDataJobsQuery,
  useGetMarketDataProvidersQuery,
  useRetryMarketDataJobMutation,
  type CreateMarketDataJobPayload,
} from './marketDataApi';
import {
  defaultMarketDataForm,
  resolveAssetType,
  resolveTimeframe,
  splitSymbols,
  type MarketDataFormState,
} from './marketDataPageState';
import {
  MarketDataHowToPanel,
  MarketDataJobFormPanel,
  MarketDataJobsPanel,
  MarketDataProviderSetupPanel,
  MarketDataTelemetryCard,
  MarketDataTransportAlert,
  MarketDataWaitingJobsAlert,
} from './MarketDataPanels';

import { useAppSelector } from '@/app/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { selectEnvironmentMode } from '@/features/environment/environmentSlice';
import {
  selectConnectionError,
  selectIsConnected,
  selectLastEventTimeForType,
  selectSubscribedChannels,
} from '@/features/websocket/websocketSlice';
import { getApiErrorMessage } from '@/services/api';
import { sanitizeText } from '@/utils/security';

export default function MarketDataPage() {
  const environmentMode = useAppSelector(selectEnvironmentMode);
  const websocketConnected = useAppSelector(selectIsConnected);
  const websocketError = useAppSelector(selectConnectionError);
  const subscribedChannels = useAppSelector(selectSubscribedChannels);
  const lastImportEventAt = useAppSelector((state) =>
    selectLastEventTimeForType(state, 'marketData.import.progress')
  );
  const marketDataLiveTransportConnected =
    websocketConnected && subscribedChannels.includes(`${environmentMode}.marketData`);
  const marketDataPollingInterval = marketDataLiveTransportConnected ? 30000 : 5000;

  const [form, setForm] = useState<MarketDataFormState>(defaultMarketDataForm);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(
    null
  );

  const { data: providers = [] } = useGetMarketDataProvidersQuery();
  const { data: jobs = [] } = useGetMarketDataJobsQuery(undefined, {
    pollingInterval: marketDataPollingInterval,
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
  const trackedJob = useMemo(
    () => activeJobs[0] ?? waitingJobs[0] ?? jobs[0] ?? null,
    [activeJobs, jobs, waitingJobs]
  );

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
      adjusted:
        stockOptionsEnabled && Boolean(nextProvider?.supportsAdjusted)
          ? current.adjusted
          : false,
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
          Create provider-backed import jobs that fetch historical bars, wait through provider
          limits, and import completed datasets directly into the backtest catalog.
        </Typography>

        {feedback ? (
          <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        <MarketDataTransportAlert
          transportConnected={marketDataLiveTransportConnected}
          lastImportEventAt={lastImportEventAt}
          websocketError={websocketError}
        />
        <MarketDataWaitingJobsAlert waitingJobCount={waitingJobs.length} />

        {trackedJob ? (
          <MarketDataTelemetryCard
            trackedJob={trackedJob}
            transportConnected={marketDataLiveTransportConnected}
            lastImportEventAt={lastImportEventAt}
          />
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <MarketDataJobFormPanel
              providers={providers}
              selectedProvider={selectedProvider}
              form={form}
              effectiveAssetType={effectiveAssetType}
              effectiveTimeframe={effectiveTimeframe}
              adjustedEnabled={adjustedEnabled}
              regularSessionEnabled={regularSessionEnabled}
              isCreating={isCreating}
              onProviderChange={handleProviderChange}
              onAssetTypeChange={handleAssetTypeChange}
              onTimeframeChange={(timeframe) =>
                setForm((current) => ({ ...current, timeframe }))
              }
              onSymbolsChange={(symbolsText) =>
                setForm((current) => ({ ...current, symbolsText }))
              }
              onStartDateChange={(startDate) =>
                setForm((current) => ({ ...current, startDate }))
              }
              onEndDateChange={(endDate) =>
                setForm((current) => ({ ...current, endDate }))
              }
              onDatasetNameChange={(datasetName) =>
                setForm((current) => ({
                  ...current,
                  datasetName: sanitizeText(datasetName),
                }))
              }
              onAdjustedChange={(adjusted) =>
                setForm((current) => ({ ...current, adjusted }))
              }
              onRegularSessionOnlyChange={(regularSessionOnly) =>
                setForm((current) => ({ ...current, regularSessionOnly }))
              }
              onSubmit={onSubmit}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <MarketDataProviderSetupPanel selectedProvider={selectedProvider} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <MarketDataHowToPanel />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <MarketDataJobsPanel
              jobs={jobs}
              activeJobCount={activeJobs.length}
              waitingJobCount={waitingJobs.length}
              jobStateUpdating={isRetrying || isCancelling}
              onRetry={onRetry}
              onCancel={onCancel}
            />
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
