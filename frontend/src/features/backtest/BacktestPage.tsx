import { Alert, Button, Chip, Grid } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  useArchiveBacktestDatasetMutation,
  useDeleteBacktestMutation,
  useGetBacktestAlgorithmsQuery,
  useGetBacktestDatasetRetentionReportQuery,
  useGetBacktestDatasetsQuery,
  useGetBacktestDetailsQuery,
  useGetBacktestExperimentSummariesQuery,
  useGetBacktestsQuery,
  useLazyCompareBacktestsQuery,
  useReplayBacktestMutation,
  useRestoreBacktestDatasetMutation,
  useRunBacktestMutation,
  useUploadBacktestDatasetMutation,
  type BacktestDataset,
  type BacktestHistoryItem,
  type RunBacktestPayload,
} from './backtestApi';
import { BacktestConfigModal } from './BacktestConfigModal';
import {
  initialBacktestForm,
  isExecutionActive,
  parseSymbols,
  resolveFormState,
} from './backtestPageState';
import {
  BacktestDatasetPanel,
  BacktestExperimentSummariesPanel,
  BacktestHistoryPanel,
  BacktestRunLauncherPanel,
  BacktestTrackedRunCard,
  BacktestTransportStatusAlert,
} from './BacktestPanels';
import { BacktestResults } from './BacktestResults';

import { useAppSelector } from '@/app/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  PageContent,
  PageIntro,
  type PageMetricItem,
  PageMetricStrip,
} from '@/components/layout/PageContent';
import { selectEnvironmentMode } from '@/features/environment/environmentSlice';
import { getStrategyProfile } from '@/features/strategies/strategyProfiles';
import {
  selectConnectionError,
  selectIsConnected,
  selectLastEventTimeForType,
  selectSubscribedChannels,
} from '@/features/websocket/websocketSlice';
import axiosClient, { getErrorMessage } from '@/services/axiosClient';
import { sanitizeText } from '@/utils/security';

export default function BacktestPage() {
  const environmentMode = useAppSelector(selectEnvironmentMode);
  const websocketConnected = useAppSelector(selectIsConnected);
  const websocketError = useAppSelector(selectConnectionError);
  const subscribedChannels = useAppSelector(selectSubscribedChannels);
  const lastBacktestEventAt = useAppSelector((state) =>
    selectLastEventTimeForType(state, 'backtest.progress')
  );
  const backtestLiveTransportConnected =
    websocketConnected && subscribedChannels.includes(`${environmentMode}.backtests`);
  const backtestPollingInterval = backtestLiveTransportConnected ? 30000 : 2000;

  const [form, setForm] = useState(initialBacktestForm);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(
    null
  );
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [comparisonIds, setComparisonIds] = useState<number[]>([]);
  const [activeComparisonIds, setActiveComparisonIds] = useState<number[]>([]);
  const historySectionRef = useRef<HTMLDivElement | null>(null);

  const { data: algorithms = [] } = useGetBacktestAlgorithmsQuery();
  const { data: datasets = [] } = useGetBacktestDatasetsQuery();
  const { data: retentionReport } = useGetBacktestDatasetRetentionReportQuery();
  const { data: experimentSummaries = [] } = useGetBacktestExperimentSummariesQuery();
  const { data: history = [], isLoading, isError } = useGetBacktestsQuery(undefined, {
    pollingInterval: backtestPollingInterval,
    skipPollingIfUnfocused: true,
  });
  const activeDatasets = useMemo(
    () => datasets.filter((dataset) => !dataset.archived),
    [datasets]
  );
  const resolvedForm = useMemo(
    () => resolveFormState(form, activeDatasets, algorithms),
    [activeDatasets, algorithms, form]
  );

  const [uploadDataset, { isLoading: isUploading }] = useUploadBacktestDatasetMutation();
  const [archiveDataset, { isLoading: isArchivingDataset }] = useArchiveBacktestDatasetMutation();
  const [restoreDataset, { isLoading: isRestoringDataset }] = useRestoreBacktestDatasetMutation();
  const [runBacktest, { isLoading: isRunning }] = useRunBacktestMutation();
  const [replayBacktest, { isLoading: isReplaying }] = useReplayBacktestMutation();
  const [deleteBacktest, { isLoading: isDeletingBacktest }] = useDeleteBacktestMutation();
  const [loadComparison, { data: comparison, isFetching: isComparing, error: comparisonError }] =
    useLazyCompareBacktestsQuery();

  const selectedAlgorithm = useMemo(
    () => algorithms.find((algorithm) => algorithm.id === resolvedForm.algorithmType) ?? null,
    [algorithms, resolvedForm.algorithmType]
  );
  const selectedAlgorithmProfile = useMemo(
    () => getStrategyProfile(resolvedForm.algorithmType),
    [resolvedForm.algorithmType]
  );
  const requiresDatasetUniverse = selectedAlgorithm?.selectionMode === 'DATASET_UNIVERSE';
  const fallbackTrackedRun = useMemo(
    () => history.find((item) => isExecutionActive(item)) ?? history[0] ?? null,
    [history]
  );
  const effectiveSelectedId = selectedId ?? fallbackTrackedRun?.id ?? null;
  const trackedRun = useMemo(
    () => history.find((item) => item.id === effectiveSelectedId) ?? null,
    [effectiveSelectedId, history]
  );
  const selectedRunIsActive = trackedRun ? isExecutionActive(trackedRun) : false;

  const { data: details, refetch: refetchDetails } = useGetBacktestDetailsQuery(
    effectiveSelectedId ?? 0,
    {
      skip: effectiveSelectedId === null,
      pollingInterval: selectedRunIsActive ? backtestPollingInterval : 0,
      skipPollingIfUnfocused: true,
    }
  );

  useEffect(() => {
    if (effectiveSelectedId !== null && !selectedRunIsActive) {
      void refetchDetails();
    }
  }, [effectiveSelectedId, refetchDetails, selectedRunIsActive]);

  const comparisonIsStale =
    activeComparisonIds.length > 0 && activeComparisonIds.join(',') !== comparisonIds.join(',');
  const comparisonErrorMessage = comparisonError ? getErrorMessage(comparisonError) : null;
  const datasetLifecycleBusy = isArchivingDataset || isRestoringDataset;
  const summaryItems = useMemo<PageMetricItem[]>(
    () => [
      {
        label: 'Active Datasets',
        value: activeDatasets.length.toString(),
        detail: `${datasets.length} total datasets in the catalog.`,
        tone: activeDatasets.length > 0 ? 'success' : 'warning',
      },
      {
        label: 'Algorithm Catalog',
        value: algorithms.length.toString(),
        detail: 'Canonical strategy IDs stay aligned with the backtest registry.',
        tone: 'info',
      },
      {
        label: 'Transport',
        value: backtestLiveTransportConnected ? 'Live stream' : 'Polling fallback',
        detail: backtestLiveTransportConnected
          ? 'Progress arrives through the authenticated WebSocket channel.'
          : 'Fallback polling keeps run progress visible when the live stream is unavailable.',
        tone: backtestLiveTransportConnected ? 'success' : 'warning',
      },
      {
        label: 'Tracked Run',
        value: trackedRun ? `#${trackedRun.id}` : 'None selected',
        detail: trackedRun
          ? `${trackedRun.executionStatus} on ${trackedRun.datasetName ?? 'dataset'}`
          : 'Select a run from history to inspect detailed metrics and charts.',
        tone: trackedRun ? 'info' : 'default',
      },
    ],
    [
      activeDatasets.length,
      algorithms.length,
      backtestLiveTransportConnected,
      datasets.length,
      trackedRun,
    ]
  );

  const onUploadDataset = async () => {
    if (!datasetFile) {
      setFeedback({ severity: 'error', message: 'Choose a CSV file first.' });
      return;
    }

    try {
      const uploaded = await uploadDataset({
        file: datasetFile,
        name: datasetName.trim() || undefined,
      }).unwrap();

      const uploadedSymbols = parseSymbols(uploaded.symbolsCsv);
      setForm((prev) => ({
        ...prev,
        datasetId: String(uploaded.id),
        symbol: uploadedSymbols[0] ?? prev.symbol,
      }));
      setFeedback({
        severity: 'success',
        message: `Dataset '${uploaded.name}' uploaded (${uploaded.rowCount} rows) and added to the active run catalog.`,
      });
      setDatasetFile(null);
      setDatasetName('');
    } catch (error) {
      setFeedback({ severity: 'error', message: getErrorMessage(error) });
    }
  };

  const onArchiveDataset = async (dataset: BacktestDataset) => {
    try {
      await archiveDataset({
        datasetId: dataset.id,
        reason: dataset.usedByBacktests
          ? 'Hidden from new-run selection while retained for replay reproducibility.'
          : 'Archived from active inventory after lifecycle review.',
      }).unwrap();
      setFeedback({
        severity: 'success',
        message: `Archived dataset '${dataset.name}'. It remains available for download and replay-backed research.`,
      });
    } catch (error) {
      setFeedback({ severity: 'error', message: getErrorMessage(error) });
    }
  };

  const onRestoreDataset = async (datasetId: number) => {
    try {
      const restored = await restoreDataset(datasetId).unwrap();
      setFeedback({
        severity: 'success',
        message: `Restored dataset '${restored.name}' to the active run catalog.`,
      });
    } catch (error) {
      setFeedback({ severity: 'error', message: getErrorMessage(error) });
    }
  };

  const onRunBacktest = async (payload: RunBacktestPayload) => {
    try {
      const response = await runBacktest(payload).unwrap();
      setSelectedId(response.id);
      setFeedback({
        severity: 'success',
        message: `Backtest ${response.id} submitted (${response.status}).`,
      });
      setConfigModalOpen(false);
    } catch (error) {
      setFeedback({ severity: 'error', message: getErrorMessage(error) });
    }
  };

  const toggleComparison = (backtestId: number) => {
    setComparisonIds((prev) =>
      prev.includes(backtestId) ? prev.filter((id) => id !== backtestId) : [...prev, backtestId]
    );
  };

  const onReplayBacktest = async (backtestId: number) => {
    try {
      const replayed = await replayBacktest(backtestId).unwrap();
      setSelectedId(replayed.id);
      setFeedback({
        severity: 'success',
        message: `Replay started from run ${backtestId}. New run: ${replayed.id} (${replayed.status}).`,
      });
    } catch (error) {
      setFeedback({ severity: 'error', message: getErrorMessage(error) });
    }
  };

  const onViewDetails = (backtestId: number) => {
    setSelectedId(backtestId);
    setFeedback({
      severity: 'success',
      message: `Showing detailed results for run ${backtestId}.`,
    });
  };

  const onDeleteResult = async (item: BacktestHistoryItem) => {
    if (isExecutionActive(item)) {
      setFeedback({
        severity: 'error',
        message: `Run ${item.id} is still active and cannot be deleted yet.`,
      });
      return;
    }

    if (
      !window.confirm(
        `Delete backtest result #${item.id}? This also removes its stored equity curve and trade series.`
      )
    ) {
      return;
    }

    try {
      await deleteBacktest(item.id).unwrap();
      setComparisonIds((prev) => prev.filter((id) => id !== item.id));
      setActiveComparisonIds((prev) => prev.filter((id) => id !== item.id));
      if (selectedId === item.id) {
        setSelectedId(null);
      }
      setFeedback({
        severity: 'success',
        message: `Deleted backtest result ${item.id}.`,
      });
    } catch (error) {
      setFeedback({ severity: 'error', message: getErrorMessage(error) });
    }
  };

  const onCompareSelected = async () => {
    if (comparisonIds.length < 2) {
      setFeedback({ severity: 'error', message: 'Select at least two backtests to compare.' });
      return;
    }

    try {
      await loadComparison(comparisonIds).unwrap();
      setActiveComparisonIds(comparisonIds);
      setFeedback({
        severity: 'success',
        message: `Comparison loaded for runs ${comparisonIds.map((id) => `#${id}`).join(', ')}.`,
      });
    } catch (error) {
      setFeedback({ severity: 'error', message: getErrorMessage(error) });
    }
  };

  const onDownloadDataset = async (datasetId: number) => {
    try {
      const response = await axiosClient.get<Blob>(`/api/backtests/datasets/${datasetId}/download`, {
        responseType: 'blob',
      });
      const dispositionHeader = response.headers['content-disposition'];
      const disposition = typeof dispositionHeader === 'string' ? dispositionHeader : '';
      const match = /filename="?([^"]+)"?/i.exec(disposition);
      const filename = match?.[1] ?? `dataset-${datasetId}.csv`;
      const objectUrl = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);

      const checksum = response.headers['x-dataset-checksum-sha256'];
      const schemaVersion = response.headers['x-dataset-schema-version'];
      setFeedback({
        severity: 'success',
        message: `Downloaded ${filename}${checksum ? ` (${schemaVersion}, checksum ${checksum.slice(0, 12)}...)` : ''}.`,
      });
    } catch (error) {
      setFeedback({ severity: 'error', message: getErrorMessage(error) });
    }
  };

  const focusHistory = () => {
    historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AppLayout>
      <PageContent maxWidth="research">
        <PageIntro
          eyebrow="Research-only workflow"
          description="Upload or restore datasets, launch runs with realistic costs, then compare and inspect results without blurring the line between research and live execution."
          actions={
            <>
              <Button
                variant="contained"
                onClick={() => setConfigModalOpen(true)}
                disabled={!activeDatasets.length}
              >
                Run new backtest
              </Button>
              <Button variant="outlined" onClick={focusHistory}>
                Open history
              </Button>
            </>
          }
          chips={
            <>
              <Chip label="Backtests stay research-only" variant="outlined" />
              <Chip label="Dataset provenance stays visible" variant="outlined" />
              <Chip label="Costs and slippage remain explicit" variant="outlined" />
            </>
          }
        />

        <PageMetricStrip items={summaryItems} />

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        {environmentMode === 'live' ? (
          <Alert severity="warning">
            The UI is currently set to `live`, but backtests and dataset operations remain
            research-only workflows. Nothing on this page routes live orders to an exchange.
          </Alert>
        ) : null}

        <BacktestTransportStatusAlert
          transportConnected={backtestLiveTransportConnected}
          lastLiveEventAt={lastBacktestEventAt}
          websocketError={websocketError}
        />

        {details ? (
          <BacktestResults
            details={details}
            transportLabel={backtestLiveTransportConnected ? 'Live WebSocket stream' : 'Fallback polling'}
            lastLiveEventAt={lastBacktestEventAt}
            transportError={websocketError}
            onReplay={() => void onReplayBacktest(details.id)}
            onFocusHistory={focusHistory}
            onDelete={() => void onDeleteResult(details)}
            deleteDisabled={isExecutionActive(details) || isDeletingBacktest}
          />
        ) : trackedRun ? (
          <BacktestTrackedRunCard
            trackedRun={trackedRun}
            transportConnected={backtestLiveTransportConnected}
            lastLiveEventAt={lastBacktestEventAt}
          />
        ) : (
          <Alert severity="info">
            Select a run from history or launch a new one to open the research workspace.
          </Alert>
        )}

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, xl: 6 }}>
            <BacktestRunLauncherPanel
              selectedAlgorithm={selectedAlgorithm}
              selectedAlgorithmProfile={selectedAlgorithmProfile}
              requiresDatasetUniverse={requiresDatasetUniverse}
              hasActiveDatasets={activeDatasets.length > 0}
              onOpenConfigModal={() => setConfigModalOpen(true)}
            />
          </Grid>

          <Grid size={{ xs: 12, xl: 6 }}>
            <BacktestDatasetPanel
              datasetName={datasetName}
              datasetFile={datasetFile}
              retentionReport={retentionReport}
              datasets={datasets}
              hasActiveDatasets={activeDatasets.length > 0}
              isUploading={isUploading}
              datasetLifecycleBusy={datasetLifecycleBusy}
              onDatasetNameChange={(value) => setDatasetName(sanitizeText(value))}
              onDatasetFileChange={(file) => setDatasetFile(file)}
              onUploadDataset={() => void onUploadDataset()}
              onDownloadDataset={onDownloadDataset}
              onArchiveDataset={onArchiveDataset}
              onRestoreDataset={onRestoreDataset}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <BacktestExperimentSummariesPanel experimentSummaries={experimentSummaries} />
          </Grid>

          <Grid size={{ xs: 12 }} ref={historySectionRef}>
            <BacktestHistoryPanel
              history={history}
              comparison={comparison}
              comparisonIds={comparisonIds}
               selectedId={effectiveSelectedId}
              comparisonIsStale={comparisonIsStale}
              comparisonErrorMessage={comparisonErrorMessage}
              lastLiveEventAt={lastBacktestEventAt}
              isLoading={isLoading}
              isError={isError}
              isComparing={isComparing}
              isReplaying={isReplaying}
              isDeletingBacktest={isDeletingBacktest}
              onCompareSelected={onCompareSelected}
              onClearComparison={() => {
                setComparisonIds([]);
                setActiveComparisonIds([]);
              }}
              onToggleComparison={toggleComparison}
              onSelectRun={setSelectedId}
              onViewDetails={onViewDetails}
              onReplayBacktest={onReplayBacktest}
              onDeleteResult={onDeleteResult}
            />
          </Grid>
        </Grid>
      </PageContent>

      <BacktestConfigModal
        open={configModalOpen}
        form={resolvedForm}
        algorithms={algorithms}
        datasets={activeDatasets}
        busy={isRunning}
        onClose={() => setConfigModalOpen(false)}
        onChange={(next) => setForm(next)}
        onRun={onRunBacktest}
      />
    </AppLayout>
  );
}
