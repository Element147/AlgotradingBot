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
import { useMemo } from 'react';

import type { BacktestAlgorithm, BacktestDataset, RunBacktestPayload } from './backtestApi';

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
  }, [form]);

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
          <TextField
            select
            label="Algorithm"
            value={form.algorithmType}
            onChange={(event) => onChange({ ...form, algorithmType: event.target.value })}
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
            onChange={(event) => onChange({ ...form, datasetId: event.target.value })}
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
            onChange={(event) => onChange({ ...form, symbol: event.target.value })}
          >
            <MenuItem value="BTC/USDT">BTC/USDT</MenuItem>
            <MenuItem value="ETH/USDT">ETH/USDT</MenuItem>
          </TextField>

          <TextField
            label="Timeframe"
            value={form.timeframe}
            onChange={(event) => onChange({ ...form, timeframe: sanitizeText(event.target.value) })}
          />
          <TextField
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(event) => onChange({ ...form, startDate: event.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={(event) => onChange({ ...form, endDate: event.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Initial Balance"
            type="number"
            value={form.initialBalance}
            onChange={(event) => onChange({ ...form, initialBalance: event.target.value })}
          />
          <TextField
            label="Fees (bps)"
            type="number"
            value={form.feesBps}
            onChange={(event) => onChange({ ...form, feesBps: event.target.value })}
          />
          <TextField
            label="Slippage (bps)"
            type="number"
            value={form.slippageBps}
            onChange={(event) => onChange({ ...form, slippageBps: event.target.value })}
          />

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
