import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useMemo } from 'react';

import type { BacktestAlgorithm, BacktestDataset, RunBacktestPayload } from './backtestApi';

import { FieldTooltip } from '@/components/ui/FieldTooltip';
import { sanitizeText } from '@/utils/security';

export interface BacktestConfigFormState {
  algorithmType: string;
  datasetId: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialBalance: string;
  feesBps: string;
  slippageBps: string;
}

interface BacktestConfigModalProps {
  open: boolean;
  form: BacktestConfigFormState;
  algorithms: BacktestAlgorithm[];
  datasets: BacktestDataset[];
  busy: boolean;
  onChange: (next: BacktestConfigFormState) => void;
  onClose: () => void;
  onRun: (payload: RunBacktestPayload) => Promise<void> | void;
}

const normalizePayload = (form: BacktestConfigFormState): RunBacktestPayload => ({
  algorithmType: form.algorithmType,
  datasetId: Number(form.datasetId),
  symbol: form.symbol,
  timeframe: form.timeframe,
  startDate: form.startDate,
  endDate: form.endDate,
  initialBalance: Number(form.initialBalance),
  feesBps: Number(form.feesBps),
  slippageBps: Number(form.slippageBps),
});

const parseSymbols = (symbolsCsv: string): string[] =>
  symbolsCsv
    .split(',')
    .map((symbol) => symbol.trim())
    .filter((symbol) => symbol.length > 0);

export function BacktestConfigModal({
  open,
  form,
  algorithms,
  datasets,
  busy,
  onChange,
  onClose,
  onRun,
}: BacktestConfigModalProps) {
  const selectedAlgorithm = useMemo(
    () => algorithms.find((algorithm) => algorithm.id === form.algorithmType) ?? null,
    [algorithms, form.algorithmType]
  );
  const selectedDataset = useMemo(
    () => datasets.find((dataset) => String(dataset.id) === form.datasetId) ?? null,
    [datasets, form.datasetId]
  );
  const availableSymbols = useMemo(
    () => (selectedDataset ? parseSymbols(selectedDataset.symbolsCsv) : []),
    [selectedDataset]
  );
  const requiresDatasetUniverse = selectedAlgorithm?.selectionMode === 'DATASET_UNIVERSE';

  useEffect(() => {
    if (requiresDatasetUniverse || availableSymbols.length === 0 || availableSymbols.includes(form.symbol)) {
      return;
    }

    onChange({ ...form, symbol: availableSymbols[0] });
  }, [availableSymbols, form, onChange, requiresDatasetUniverse]);

  const validationError = useMemo(() => {
    if (!form.algorithmType.trim()) {
      return 'Algorithm type is required';
    }

    if (!form.datasetId) {
      return 'Please upload/select a dataset first';
    }

    if (!requiresDatasetUniverse && !form.symbol.trim()) {
      return 'Please select a symbol from the dataset';
    }

    const initialBalance = Number(form.initialBalance);
    if (Number.isNaN(initialBalance) || initialBalance <= 100) {
      return 'Initial balance must be greater than 100';
    }

    const fees = Number(form.feesBps);
    const slippage = Number(form.slippageBps);
    if (
      Number.isNaN(fees) ||
      fees < 0 ||
      fees > 200 ||
      Number.isNaN(slippage) ||
      slippage < 0 ||
      slippage > 200
    ) {
      return 'Fees and slippage must be between 0 and 200 bps';
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      return 'Start date must be earlier than end date';
    }

    return null;
  }, [form, requiresDatasetUniverse]);

  const run = async () => {
    if (validationError) {
      return;
    }
    await onRun(normalizePayload(form));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Run New Backtest</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FieldTooltip title="Select the strategy model to evaluate. Different models can produce very different risk and drawdown behavior.">
            <TextField
              select
              label="Algorithm"
              value={form.algorithmType}
              onChange={(event) => onChange({ ...form, algorithmType: event.target.value })}
              helperText="Determines signal logic used in simulation."
            >
              {algorithms.map((algorithm) => (
                <MenuItem key={algorithm.id} value={algorithm.id}>
                  {algorithm.label}
                </MenuItem>
              ))}
            </TextField>
          </FieldTooltip>

          <FieldTooltip title="Dataset controls what market history is replayed. Wrong dataset means misleading conclusions.">
            <TextField
              select
              label="Dataset"
              value={form.datasetId}
              onChange={(event) => onChange({ ...form, datasetId: event.target.value })}
              helperText="Uploaded historical CSV dataset for this run."
            >
              {datasets.map((dataset) => (
                <MenuItem key={dataset.id} value={String(dataset.id)}>
                  {dataset.name} ({dataset.rowCount} rows)
                </MenuItem>
              ))}
            </TextField>
          </FieldTooltip>

          {requiresDatasetUniverse ? (
            <Alert severity="info">
              This strategy uses every symbol in the selected dataset.
              {selectedDataset ? ` Universe: ${selectedDataset.symbolsCsv}` : ''}
            </Alert>
          ) : (
            <FieldTooltip title="Trading pair to simulate. Must match dataset coverage for meaningful results.">
              <TextField
                select
                label="Symbol"
                value={form.symbol}
                onChange={(event) => onChange({ ...form, symbol: event.target.value })}
                helperText="Primary market pair used by the strategy."
              >
                {availableSymbols.map((symbol) => (
                  <MenuItem key={symbol} value={symbol}>
                    {symbol}
                  </MenuItem>
                ))}
              </TextField>
            </FieldTooltip>
          )}

          <FieldTooltip title="Candle interval for strategy logic. A mismatch with dataset granularity can distort metrics.">
            <TextField
              label="Timeframe"
              value={form.timeframe}
              onChange={(event) => onChange({ ...form, timeframe: sanitizeText(event.target.value) })}
              helperText="Examples: 15m, 1h, 4h, 1d."
            />
          </FieldTooltip>
          <FieldTooltip title="Backtest start boundary. Earlier start includes more market regimes.">
            <TextField
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(event) => onChange({ ...form, startDate: event.target.value })}
              helperText="Must be earlier than end date."
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </FieldTooltip>
          <FieldTooltip title="Backtest end boundary. Very short windows can overfit conclusions.">
            <TextField
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(event) => onChange({ ...form, endDate: event.target.value })}
              helperText="Choose a window that includes normal and stressed periods."
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </FieldTooltip>
          <FieldTooltip title="Starting capital for simulation. Small values can exaggerate position-size constraints.">
            <TextField
              label="Initial Balance"
              type="number"
              value={form.initialBalance}
              onChange={(event) => onChange({ ...form, initialBalance: event.target.value })}
              helperText="Must be greater than 100."
            />
          </FieldTooltip>
          <FieldTooltip title="Transaction fee in basis points. Understating fees inflates performance.">
            <TextField
              label="Fees (bps)"
              type="number"
              value={form.feesBps}
              onChange={(event) => onChange({ ...form, feesBps: event.target.value })}
              helperText="1 bps = 0.01%. Keep realistic exchange costs."
            />
          </FieldTooltip>
          <FieldTooltip title="Execution slippage in basis points. Lower values can overstate real-world fills.">
            <TextField
              label="Slippage (bps)"
              type="number"
              value={form.slippageBps}
              onChange={(event) => onChange({ ...form, slippageBps: event.target.value })}
              helperText="Models adverse fill movement during execution."
            />
          </FieldTooltip>

          {validationError ? <Alert severity="error">{validationError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={busy || Boolean(validationError)} onClick={() => void run()}>
          Run Backtest
        </Button>
      </DialogActions>
    </Dialog>
  );
}
