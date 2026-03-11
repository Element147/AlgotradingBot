import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
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
} from './backtestApi';

import { AppLayout } from '@/components/layout/AppLayout';
import { getStrategyProfile } from '@/features/strategies/strategyProfiles';

const initialForm = {
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

export default function BacktestPage() {
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const { data: algorithms = [] } = useGetBacktestAlgorithmsQuery();
  const { data: datasets = [] } = useGetBacktestDatasetsQuery();
  const { data: history = [], isLoading, isError } = useGetBacktestsQuery(undefined, {
    pollingInterval: 5000,
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
  });

  const validationError = useMemo(() => {
    if (!form.algorithmType.trim()) {
      return 'Algorithm type is required';
    }

    if (!form.datasetId) {
      return 'Please upload/select a dataset first';
    }

    const initialBalance = Number(form.initialBalance);
    if (Number.isNaN(initialBalance) || initialBalance <= 100) {
      return 'Initial balance must be greater than 100';
    }

    const fees = Number(form.feesBps);
    const slippage = Number(form.slippageBps);
    if (Number.isNaN(fees) || fees < 0 || fees > 200 || Number.isNaN(slippage) || slippage < 0 || slippage > 200) {
      return 'Fees and slippage must be between 0 and 200 bps';
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      return 'Start date must be earlier than end date';
    }

    return null;
  }, [form]);

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
      setFeedback({ severity: 'success', message: `Dataset '${uploaded.name}' uploaded (${uploaded.rowCount} rows).` });
      setDatasetFile(null);
      setDatasetName('');
    } catch {
      setFeedback({ severity: 'error', message: 'Dataset upload failed.' });
    }
  };

  const onRunBacktest = async () => {
    if (validationError) {
      return;
    }

    try {
      const response = await runBacktest({
        algorithmType: form.algorithmType,
        datasetId: Number(form.datasetId),
        symbol: form.symbol,
        timeframe: form.timeframe,
        startDate: form.startDate,
        endDate: form.endDate,
        initialBalance: Number(form.initialBalance),
        feesBps: Number(form.feesBps),
        slippageBps: Number(form.slippageBps),
      }).unwrap();

      setSelectedId(response.id);
      setFeedback({ severity: 'success', message: `Backtest ${response.id} submitted (${response.status}).` });
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
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Dataset Upload</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Dataset Name (optional)"
                    value={datasetName}
                    onChange={(event) => setDatasetName(event.target.value)}
                    placeholder="BTC 1h 2025"
                    helperText="Optional label to identify symbol/timeframe/date range."
                  />
                  <Button variant="outlined" component="label">
                    {datasetFile ? `Selected: ${datasetFile.name}` : 'Choose CSV File'}
                    <input
                      hidden
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(event) => setDatasetFile(event.target.files?.[0] ?? null)}
                    />
                  </Button>
                  <Button variant="contained" onClick={() => void onUploadDataset()} disabled={!datasetFile || isUploading}>
                    Upload Dataset
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    CSV format: timestamp,symbol,open,high,low,close,volume
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Run Backtest</Typography>
                <Stack spacing={2}>
                  {selectedAlgorithm ? (
                    <Alert severity="info">
                      <strong>{selectedAlgorithm.label}:</strong>{' '}
                      {selectedAlgorithm.description}
                      {selectedAlgorithmProfile ? ` Best use: ${selectedAlgorithmProfile.bestFor}` : ''}
                    </Alert>
                  ) : null}

                  <TextField
                    select
                    label="Algorithm"
                    value={form.algorithmType}
                    onChange={(event) => setForm((prev) => ({ ...prev, algorithmType: event.target.value }))}
                    helperText="Trading logic used for simulation."
                  >
                    {algorithms.map((algorithm) => (
                      <MenuItem key={algorithm.id} value={algorithm.id}>
                        {algorithm.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Dataset"
                    value={form.datasetId}
                    onChange={(event) => setForm((prev) => ({ ...prev, datasetId: event.target.value }))}
                    helperText="Uploaded historical candles to replay in backtest."
                  >
                    {datasets.map((dataset) => (
                      <MenuItem key={dataset.id} value={String(dataset.id)}>
                        {dataset.name} ({dataset.rowCount} rows)
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Symbol"
                    value={form.symbol}
                    onChange={(event) => setForm((prev) => ({ ...prev, symbol: event.target.value }))}
                    helperText="Market pair to run over selected dataset."
                  >
                    <MenuItem value="BTC/USDT">BTC/USDT</MenuItem>
                    <MenuItem value="ETH/USDT">ETH/USDT</MenuItem>
                  </TextField>

                  <TextField
                    label="Timeframe"
                    value={form.timeframe}
                    onChange={(event) => setForm((prev) => ({ ...prev, timeframe: event.target.value }))}
                    helperText="Candle interval. Keep consistent with uploaded dataset granularity."
                  />
                  <TextField
                    label="Start Date"
                    type="date"
                    value={form.startDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                    helperText="Backtest start boundary (inclusive)."
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    value={form.endDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                    helperText="Backtest end boundary (inclusive)."
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    label="Initial Balance"
                    type="number"
                    value={form.initialBalance}
                    onChange={(event) => setForm((prev) => ({ ...prev, initialBalance: event.target.value }))}
                    helperText="Simulated starting capital. Must be greater than 100."
                  />
                  <TextField
                    label="Fees (bps)"
                    type="number"
                    value={form.feesBps}
                    onChange={(event) => setForm((prev) => ({ ...prev, feesBps: event.target.value }))}
                    helperText="Execution fee in basis points. Example: 10 bps = 0.10%."
                  />
                  <TextField
                    label="Slippage (bps)"
                    type="number"
                    value={form.slippageBps}
                    onChange={(event) => setForm((prev) => ({ ...prev, slippageBps: event.target.value }))}
                    helperText="Expected price impact in basis points."
                  />

                  {validationError ? <Alert severity="error">{validationError}</Alert> : null}
                  <Button
                    variant="contained"
                    disabled={Boolean(validationError) || isRunning}
                    onClick={() => void onRunBacktest()}
                  >
                    Run Backtest
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Backtest History</Typography>
                {isLoading ? <Typography>Loading history...</Typography> : null}
                {isError ? <Alert severity="error">Unable to load backtest history.</Alert> : null}

                {!isLoading && history.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Algorithm</TableCell>
                        <TableCell>Dataset</TableCell>
                        <TableCell>Market</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Validation</TableCell>
                        <TableCell>Fees/Slippage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((item) => (
                        <TableRow
                          key={item.id}
                          hover
                          onClick={() => setSelectedId(item.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.strategyId}</TableCell>
                          <TableCell>{item.datasetName ?? '-'}</TableCell>
                          <TableCell>{item.symbol} ({item.timeframe})</TableCell>
                          <TableCell>{item.executionStatus}</TableCell>
                          <TableCell>{item.validationStatus}</TableCell>
                          <TableCell>{item.feesBps} bps / {item.slippageBps} bps</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}
              </CardContent>
            </Card>

            {details ? (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Backtest Details #{details.id}</Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, md: 4 }}><Typography variant="body2">Algorithm: {details.strategyId}</Typography></Grid>
                    <Grid size={{ xs: 12, md: 4 }}><Typography variant="body2">Dataset: {details.datasetName ?? '-'}</Typography></Grid>
                    <Grid size={{ xs: 12, md: 4 }}><Typography variant="body2">Market: {details.symbol} ({details.timeframe})</Typography></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><Typography variant="body2">Sharpe: {details.sharpeRatio.toFixed(2)}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><Typography variant="body2">Profit Factor: {details.profitFactor.toFixed(2)}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><Typography variant="body2">Win Rate: {details.winRate.toFixed(2)}%</Typography></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><Typography variant="body2">Max DD: {details.maxDrawdown.toFixed(2)}%</Typography></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><Typography variant="body2">Trades: {details.totalTrades}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><Typography variant="body2">Start Balance: {details.initialBalance.toFixed(2)}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><Typography variant="body2">Final Balance: {details.finalBalance.toFixed(2)}</Typography></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><Typography variant="body2">Fees/Slippage: {details.feesBps} / {details.slippageBps} bps</Typography></Grid>
                  </Grid>
                </CardContent>
              </Card>
            ) : null}
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
