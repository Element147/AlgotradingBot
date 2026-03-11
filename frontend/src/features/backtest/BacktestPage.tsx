import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  useRunBacktestMutation,
  useUploadBacktestDatasetMutation,
  type RunBacktestPayload,
} from './backtestApi';
import { BacktestConfigModal, type BacktestConfigFormState } from './BacktestConfigModal';
import { BacktestResults } from './BacktestResults';

import { AppLayout } from '@/components/layout/AppLayout';
import { FieldTooltip } from '@/components/ui/FieldTooltip';
import { getStrategyProfile } from '@/features/strategies/strategyProfiles';
import { sanitizeText } from '@/utils/security';

const initialForm: BacktestConfigFormState = {
  algorithmType: 'BOLLINGER_BANDS',
  datasetId: '',
  symbol: 'BTC/USDT',
  timeframe: '1h',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  initialBalance: '1000',
  feesBps: '10',
  slippageBps: '3',
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

  const { data: algorithms = [] } = useGetBacktestAlgorithmsQuery();
  const { data: datasets = [] } = useGetBacktestDatasetsQuery();
  const { data: history = [], isLoading, isError } = useGetBacktestsQuery(undefined, {
    pollingInterval: 5000,
    skipPollingIfUnfocused: true,
  });

  const [uploadDataset, { isLoading: isUploading }] = useUploadBacktestDatasetMutation();
  const [runBacktest, { isLoading: isRunning }] = useRunBacktestMutation();
  const selectedAlgorithm = useMemo(
    () => algorithms.find((algorithm) => algorithm.id === form.algorithmType) ?? null,
    [algorithms, form.algorithmType]
  );
  const selectedAlgorithmProfile = useMemo(
    () => getStrategyProfile(form.algorithmType),
    [form.algorithmType]
  );

  const { data: details } = useGetBacktestDetailsQuery(selectedId ?? 0, {
    skip: selectedId === null,
    pollingInterval: 5000,
    skipPollingIfUnfocused: true,
  });

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

      setForm((prev) => ({ ...prev, datasetId: String(uploaded.id) }));
      setFeedback({
        severity: 'success',
        message: `Dataset '${uploaded.name}' uploaded (${uploaded.rowCount} rows).`,
      });
      setDatasetFile(null);
      setDatasetName('');
    } catch {
      setFeedback({ severity: 'error', message: 'Dataset upload failed.' });
    }
  };

  const onRunBacktest = async (payload: RunBacktestPayload) => {
    try {
      const response = await runBacktest(payload).unwrap();
      setSelectedId(response.id);
      setFeedback({ severity: 'success', message: `Backtest ${response.id} submitted (${response.status}).` });
      setConfigModalOpen(false);
    } catch {
      setFeedback({ severity: 'error', message: 'Backtest run failed.' });
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
                {isLoading ? <Typography>Loading history...</Typography> : null}
                {isError ? <Alert severity="error">Unable to load backtest history.</Alert> : null}

                {!isLoading && history.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>{details ? <BacktestResults details={details} /> : null}</Grid>
        </Grid>
      </Box>

      <BacktestConfigModal
        open={configModalOpen}
        form={form}
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
