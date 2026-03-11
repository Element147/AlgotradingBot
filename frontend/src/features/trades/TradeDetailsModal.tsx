import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';

import type { TradeHistoryItem } from './tradesApi';
import { calculateRMultiple } from './tradeUtils';

import { formatCurrency } from '@/utils/formatters';

interface TradeDetailsModalProps {
  trade: TradeHistoryItem | null;
  open: boolean;
  onClose: () => void;
}

export function TradeDetailsModal({ trade, open, onClose }: TradeDetailsModalProps) {
  if (!trade) {
    return null;
  }

  const rMultiple = calculateRMultiple(trade);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Trade Detail #{trade.id}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2">Pair: {trade.pair}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2">Signal: {trade.signal}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2">Entry Time: {trade.entryTime}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2">Exit Time: {trade.exitTime ?? '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="body2">Entry Price: {trade.entryPrice.toFixed(4)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="body2">Exit Price: {trade.exitPrice?.toFixed(4) ?? '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="body2">Position Size: {trade.positionSize.toFixed(6)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="body2">Risk Amount: {formatCurrency(trade.riskAmount)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="body2">PnL: {formatCurrency(trade.pnl)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="body2">Fees: {formatCurrency(trade.feesActual)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="body2">Slippage: {formatCurrency(trade.slippageActual)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="body2">Stop Loss: {trade.stopLoss?.toFixed(4) ?? '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2">Take Profit: {trade.takeProfit?.toFixed(4) ?? '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2">
              R-Multiple: {rMultiple === null ? '-' : rMultiple.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
