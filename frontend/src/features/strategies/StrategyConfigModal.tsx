import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useMemo, useState } from 'react';

import type { Strategy } from './strategiesApi';
import {
  type StrategyConfigOutput,
  validateStrategyConfig,
} from './strategyValidation';

import { FieldTooltip } from '@/components/ui/FieldTooltip';
import { sanitizeText } from '@/utils/security';

interface ConfigDraft {
  symbol: string;
  timeframe: string;
  riskPerTrade: string;
  minPositionSize: string;
  maxPositionSize: string;
}

const createDraft = (strategy: Strategy): ConfigDraft => ({
  symbol: strategy.symbol,
  timeframe: strategy.timeframe,
  riskPerTrade: String(strategy.riskPerTrade),
  minPositionSize: String(strategy.minPositionSize),
  maxPositionSize: String(strategy.maxPositionSize),
});

export interface StrategyConfigModalProps {
  strategy: Strategy;
  busy: boolean;
  onClose: () => void;
  onSave: (strategy: Strategy, payload: StrategyConfigOutput) => Promise<void> | void;
}

export function StrategyConfigModal({
  strategy,
  busy,
  onClose,
  onSave,
}: StrategyConfigModalProps) {
  const [draft, setDraft] = useState<ConfigDraft>(() => createDraft(strategy));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validation = useMemo(
    () =>
      validateStrategyConfig({
        symbol: draft.symbol,
        timeframe: draft.timeframe,
        riskPerTrade: Number(draft.riskPerTrade),
        minPositionSize: Number(draft.minPositionSize),
        maxPositionSize: Number(draft.maxPositionSize),
      }),
    [draft]
  );

  const save = async () => {
    if (!validation.valid || !validation.data) {
      return;
    }

    try {
      await onSave(strategy, validation.data);
      onClose();
    } catch {
      setSubmitError('Failed to update strategy configuration.');
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Strategy Configuration</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FieldTooltip title="Trading pair for this strategy. Wrong symbol can invalidate assumptions and risk settings.">
            <TextField
              label="Symbol"
              value={draft.symbol}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, symbol: sanitizeText(event.target.value) }))
              }
              error={Boolean(validation.errors.symbol)}
              helperText={validation.errors.symbol ?? 'Market pair to trade (for example BTC/USDT).'}
              fullWidth
            />
          </FieldTooltip>
          <FieldTooltip title="Candle interval used by signal logic. Shorter intervals increase trade frequency and noise.">
            <TextField
              label="Timeframe"
              value={draft.timeframe}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, timeframe: sanitizeText(event.target.value) }))
              }
              error={Boolean(validation.errors.timeframe)}
              helperText={validation.errors.timeframe ?? 'Candle interval such as 15m, 1h, or 4h.'}
              fullWidth
            />
          </FieldTooltip>
          <FieldTooltip title="Fraction of capital risked per trade. Higher values increase drawdown and stop-out probability.">
            <TextField
              label="Risk Per Trade (0.01 - 0.05)"
              type="number"
              value={draft.riskPerTrade}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  riskPerTrade: event.target.value,
                }))
              }
              inputProps={{ step: '0.001' }}
              error={Boolean(validation.errors.riskPerTrade)}
              helperText={
                validation.errors.riskPerTrade ??
                'Fraction of account risked per position. 0.02 means 2%.'
              }
              fullWidth
            />
          </FieldTooltip>
          <FieldTooltip title="Minimum order size gate. Too high may skip valid signals; too low may create noisy micro-trades.">
            <TextField
              label="Min Position Size"
              type="number"
              value={draft.minPositionSize}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  minPositionSize: event.target.value,
                }))
              }
              error={Boolean(validation.errors.minPositionSize)}
              helperText={
                validation.errors.minPositionSize ?? 'Lower position bound used by execution sizing logic.'
              }
              fullWidth
            />
          </FieldTooltip>
          <FieldTooltip title="Maximum order size cap. Raising this increases tail risk per signal.">
            <TextField
              label="Max Position Size"
              type="number"
              value={draft.maxPositionSize}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  maxPositionSize: event.target.value,
                }))
              }
              error={Boolean(validation.errors.maxPositionSize)}
              helperText={
                validation.errors.maxPositionSize ?? 'Upper position bound to limit exposure per trade.'
              }
              fullWidth
            />
          </FieldTooltip>

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => void save()} disabled={busy || !validation.valid}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
