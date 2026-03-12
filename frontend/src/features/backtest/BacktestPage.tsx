import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import {
  useGetBacktestAlgorithmsQuery,
  useGetBacktestDatasetsQuery,
  useGetBacktestDetailsQuery,
  useGetBacktestsQuery,
  useLazyCompareBacktestsQuery,
  useReplayBacktestMutation,
  useRunBacktestMutation,
  useUploadBacktestDatasetMutation,
  type RunBacktestPayload,
} from './backtestApi';
import { BacktestComparisonPanel } from './BacktestComparisonPanel';
import { BacktestConfigModal, type BacktestConfigFormState } from './BacktestConfigModal';
import { BacktestResults } from './BacktestResults';

import { AppLayout } from '@/components/layout/AppLayout';
import { FieldTooltip } from '@/components/ui/FieldTooltip';
import { getStrategyProfile } from '@/features/strategies/strategyProfiles';
import axiosClient, { getErrorMessage } from '@/services/axiosClient';
import { sanitizeText } from '@/utils/security';

const initialForm: BacktestConfigFormState = {
  algorithmType: 'BUY_AND_HOLD',
  datasetId: '',
  symbol: '',
  timeframe: '1h',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  initialBalance: '1000',
  feesBps: '10',
  slippageBps: '3',
};

const parseSymbols = (symbolsCsv: string): string[] =>
  symbolsCsv
    .split(',')
    .map((symbol) => symbol.trim())
    .filter((symbol) => symbol.length > 0);

const resolveFormState = (
  form: BacktestConfigFormState,
  datasets: Array<{ id: number; symbolsCsv: string }>,
  algorithms: Array<{ id: string; selectionMode: 'SINGLE_SYMBOL' | 'DATASET_UNIVERSE' }>
): BacktestConfigFormState => {
  const selectedDatasetId = form.datasetId || (datasets[0] ? String(datasets[0].id) : '');
  const selectedDataset = datasets.find((dataset) => String(dataset.id) === selectedDatasetId) ?? null;
  const selectedAlgorithm = algorithms.find((algorithm) => algorithm.id === form.algorithmType) ?? null;
  const requiresDatasetUniverse = selectedAlgorithm?.selectionMode === 'DATASET_UNIVERSE';
  const datasetSymbols = selectedDataset ? parseSymbols(selectedDataset.symbolsCsv) : [];
  const resolvedSymbol =
    requiresDatasetUniverse || datasetSymbols.length === 0 || datasetSymbols.includes(form.symbol)
      ? form.symbol
      : datasetSymbols[0];

  return {
    ...form,
    datasetId: selectedDatasetId,
    symbol: resolvedSymbol,
  };
};

const validationColor = (value: string): 'success.main' | 'error.main' | 'warning.main' => {
  if (value === 'PASSED' || value === 'PRODUCTION_READY') {
    return 'success.main';
  }
  if (value === 'FAILED') {
    return 'error.main';
  }
  return 'warning.main';
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

export default function BacktestPage() {
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(
    null
  );
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [comparisonIds, setComparisonIds] = useState<number[]>([]);
  const [activeComparisonIds, setActiveComparisonIds] = useState<number[]>([]);

  const { data: algorithms = [] } = useGetBacktestAlgorithmsQuery();
  const { data: datasets = [] } = useGetBacktestDatasetsQuery();
  const { data: history = [], isLoading, isError } = useGetBacktestsQuery(undefined, {
    pollingInterval: 5000,
    skipPollingIfUnfocused: true,
  });
  const resolvedForm = useMemo(() => resolveFormState(form, datasets, algorithms), [algorithms, datasets, form]);

  const [uploadDataset, { isLoading: isUploading }] = useUploadBacktestDatasetMutation();
  const [runBacktest, { isLoading: isRunning }] = useRunBacktestMutation();
  const [replayBacktest, { isLoading: isReplaying }] = useReplayBacktestMutation();
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

  const { data: details } = useGetBacktestDetailsQuery(selectedId ?? 0, {
    skip: selectedId === null,
    pollingInterval: 5000,
    skipPollingIfUnfocused: true,
  });
  const comparisonIsStale =
    activeComparisonIds.length > 0 && activeComparisonIds.join(',') !== comparisonIds.join(',');

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
        message: `Dataset '${uploaded.name}' uploaded (${uploaded.rowCount} rows).`,
      });
      setDatasetFile(null);
      setDatasetName('');
    } catch (error) {
      setFeedback({ severity: 'error', message: getErrorMessage(error) });
    }
  };

  const onRunBacktest = async (payload: RunBacktestPayload) => {
    try {
      const response = await runBacktest(payload).unwrap();
      setSelectedId(response.id);
      setFeedback({ severity: 'success', message: `Backtest ${response.id} submitted (${response.status}).` });
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

  return (
    <AppLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Backtest
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload local CSV history data, choose an algorithm, and run research backtests without broker connectivity.
        </Typography>

        {feedback ? (
          <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Dataset Upload
                </Typography>
                <Stack spacing={2}>
                  <FieldTooltip title="Human-readable dataset label. Clear naming prevents running backtests on the wrong file.">
                    <TextField
                      label="Dataset Name (optional)"
                      value={datasetName}
                      onChange={(event) => setDatasetName(sanitizeText(event.target.value))}
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
                        onChange={(event) => setDatasetFile(event.target.files?.[0] ?? null)}
                      />
                    </Button>
                  </FieldTooltip>
                  <Button
                    variant="contained"
                    onClick={() => void onUploadDataset()}
                    disabled={!datasetFile || isUploading}
                  >
                    Upload Dataset
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    CSV format: timestamp,symbol,open,high,low,close,volume
                  </Typography>
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
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {dataset.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {dataset.originalFilename} | {dataset.rowCount} rows | {dataset.symbolsCsv}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Schema: {dataset.schemaVersion} | Checksum: {dataset.checksumSha256}
                                </Typography>
                              </Box>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => void onDownloadDataset(dataset.id)}
                              >
                                Download
                              </Button>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Run Backtest
                </Typography>
                {selectedAlgorithm ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>{selectedAlgorithm.label}:</strong> {selectedAlgorithm.description}
                    {selectedAlgorithmProfile ? ` Best use: ${selectedAlgorithmProfile.bestFor}` : ''}
                    {requiresDatasetUniverse ? ' Uses all symbols in the selected dataset.' : ''}
                  </Alert>
                ) : null}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={() => setConfigModalOpen(true)}
                >
                  Run New Backtest
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
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
                    onClick={() => {
                      setComparisonIds([]);
                      setActiveComparisonIds([]);
                    }}
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
                {comparisonError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {getErrorMessage(comparisonError)}
                  </Alert>
                ) : null}
                {isLoading ? <Typography>Loading history...</Typography> : null}
                {isError ? <Alert severity="error">Unable to load backtest history.</Alert> : null}

                {!isLoading && history.length > 0 ? (
                  <Table size="small">
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
                            label="Market"
                            description="Symbol and timeframe tested in the simulation."
                          />
                        </TableCell>
                        <TableCell>
                          <HeaderCellWithTooltip
                            label="Status"
                            description="Execution lifecycle status of the run (pending, running, completed, failed)."
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
                            description="Replay a prior configuration to re-run the exact research setup."
                          />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((item) => (
                        <TableRow
                          key={item.id}
                          hover
                          onClick={() => setSelectedId(item.id)}
                          sx={{ cursor: 'pointer' }}
                          selected={item.id === selectedId}
                        >
                          <TableCell onClick={(event) => event.stopPropagation()}>
                            <Checkbox
                              checked={comparisonIds.includes(item.id)}
                              onChange={() => toggleComparison(item.id)}
                              inputProps={{ 'aria-label': `Select backtest ${item.id} for comparison` }}
                            />
                          </TableCell>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.strategyId}</TableCell>
                          <TableCell>{item.datasetName ?? '-'}</TableCell>
                          <TableCell>
                            {item.symbol} ({item.timeframe})
                          </TableCell>
                          <TableCell>{item.executionStatus}</TableCell>
                          <TableCell sx={{ color: validationColor(item.validationStatus) }}>
                            {item.validationStatus}
                          </TableCell>
                          <TableCell>
                            {item.feesBps} bps / {item.slippageBps} bps
                          </TableCell>
                          <TableCell onClick={(event) => event.stopPropagation()}>
                            <Button
                              size="small"
                              startIcon={<ReplayIcon />}
                              onClick={() => void onReplayBacktest(item.id)}
                              disabled={isReplaying}
                            >
                              Replay
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {comparison ? <BacktestComparisonPanel comparison={comparison} /> : null}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>{details ? <BacktestResults details={details} /> : null}</Grid>
        </Grid>
      </Box>

      <BacktestConfigModal
        open={configModalOpen}
        form={resolvedForm}
        algorithms={algorithms}
        datasets={datasets}
        busy={isRunning}
        onClose={() => setConfigModalOpen(false)}
        onChange={setForm}
        onRun={onRunBacktest}
      />
    </AppLayout>
  );
}
