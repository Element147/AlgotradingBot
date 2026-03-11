import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
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
import { useSelector } from 'react-redux';

import { useGetTradeHistoryQuery, type TradeHistoryQuery } from './tradesApi';

import { AppLayout } from '@/components/layout/AppLayout';
import { selectCurrency, selectTimezone } from '@/features/settings/settingsSlice';

interface TradeFilterDraft {
  accountId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  limit: string;
}

const defaultDraft: TradeFilterDraft = {
  accountId: '',
  symbol: '',
  startDate: '',
  endDate: '',
  limit: '200',
};

const toDateTimeParam = (value: string): string | undefined => {
  if (!value.trim()) {
    return undefined;
  }

  return value.length === 16 ? `${value}:00` : value;
};

const csvValue = (value: string | number | null): string => {
  const escaped = String(value ?? '').replaceAll('"', '""');
  return `"${escaped}"`;
};

export default function TradesPage() {
  const timezone = useSelector(selectTimezone);
  const currency = useSelector(selectCurrency);

  const [draft, setDraft] = useState<TradeFilterDraft>(defaultDraft);
  const [query, setQuery] = useState<TradeHistoryQuery>({ limit: 200 });
  const [selectedTradeId, setSelectedTradeId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const {
    data: trades = [],
    isFetching,
    isError,
    refetch,
  } = useGetTradeHistoryQuery(query, {
    pollingInterval: 10000,
  });

  const validationError = useMemo(() => {
    const limit = Number(draft.limit);

    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
      return 'Limit must be an integer between 1 and 1000.';
    }

    if (draft.accountId.trim()) {
      const accountId = Number(draft.accountId);
      if (!Number.isInteger(accountId) || accountId <= 0) {
        return 'Account ID must be a positive integer.';
      }
    }

    if (draft.startDate && draft.endDate && new Date(draft.startDate) > new Date(draft.endDate)) {
      return 'Start date must be earlier than end date.';
    }

    return null;
  }, [draft]);

  const selectedTrade = useMemo(
    () => trades.find((trade) => trade.id === selectedTradeId) ?? null,
    [selectedTradeId, trades]
  );

  const symbols = useMemo(() => {
    const unique = new Set(trades.map((trade) => trade.pair));
    return Array.from(unique).sort((left, right) => left.localeCompare(right));
  }, [trades]);

  const totals = useMemo(() => {
    const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalFees = trades.reduce((sum, trade) => sum + trade.feesActual, 0);
    const totalSlippage = trades.reduce((sum, trade) => sum + trade.slippageActual, 0);
    const wins = trades.filter((trade) => trade.pnl > 0).length;

    return {
      totalPnl,
      totalFees,
      totalSlippage,
      winRate: trades.length === 0 ? 0 : (wins / trades.length) * 100,
    };
  }, [trades]);

  const formatDate = (value: string | null): string => {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('cs-CZ', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(parsed);
  };

  const formatAmount = (amount: number): string => {
    if (currency === 'BTC') {
      return `${amount.toFixed(8)} BTC`;
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const applyFilters = () => {
    if (validationError) {
      setFeedback({ severity: 'error', message: validationError });
      return;
    }

    const nextQuery: TradeHistoryQuery = {
      limit: Number(draft.limit),
    };

    if (draft.accountId.trim()) {
      nextQuery.accountId = Number(draft.accountId.trim());
    }
    if (draft.symbol.trim()) {
      nextQuery.symbol = draft.symbol.trim();
    }
    if (draft.startDate.trim()) {
      nextQuery.startDate = toDateTimeParam(draft.startDate.trim());
    }
    if (draft.endDate.trim()) {
      nextQuery.endDate = toDateTimeParam(draft.endDate.trim());
    }

    setQuery(nextQuery);
    setFeedback({ severity: 'success', message: 'Filters applied.' });
  };

  const resetFilters = () => {
    setDraft(defaultDraft);
    setQuery({ limit: 200 });
    setFeedback({ severity: 'success', message: 'Filters reset.' });
  };

  const exportCsv = () => {
    if (trades.length === 0) {
      setFeedback({ severity: 'error', message: 'There are no rows to export.' });
      return;
    }

    const headers = [
      'id',
      'pair',
      'signal',
      'entryTime',
      'exitTime',
      'entryPrice',
      'exitPrice',
      'positionSize',
      'riskAmount',
      'pnl',
      'feesActual',
      'slippageActual',
      'stopLoss',
      'takeProfit',
    ];

    const rows = trades.map((trade) => [
      trade.id,
      trade.pair,
      trade.signal,
      trade.entryTime,
      trade.exitTime,
      trade.entryPrice,
      trade.exitPrice,
      trade.positionSize,
      trade.riskAmount,
      trade.pnl,
      trade.feesActual,
      trade.slippageActual,
      trade.stopLoss,
      trade.takeProfit,
    ]);

    const csv = [headers.map((header) => csvValue(header)).join(','), ...rows.map((row) => row.map(csvValue).join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trade-history-${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setFeedback({ severity: 'success', message: 'CSV export downloaded.' });
  };

  return (
    <AppLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Trade History
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Analyze completed trades, validate strategy behavior, and export research data for deeper review.
        </Typography>

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
            {feedback.message}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Account ID"
                    value={draft.accountId}
                    onChange={(event) => setDraft((prev) => ({ ...prev, accountId: event.target.value }))}
                    placeholder="e.g. 1"
                    helperText="Optional: load only trades from one account."
                  />

                  <TextField
                    select
                    label="Symbol"
                    value={draft.symbol}
                    onChange={(event) => setDraft((prev) => ({ ...prev, symbol: event.target.value }))}
                    helperText="Optional: narrow history to one market pair."
                  >
                    <MenuItem value="">All symbols</MenuItem>
                    {symbols.map((symbol) => (
                      <MenuItem key={symbol} value={symbol}>
                        {symbol}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Start Date"
                    type="datetime-local"
                    value={draft.startDate}
                    onChange={(event) => setDraft((prev) => ({ ...prev, startDate: event.target.value }))}
                    helperText="Optional: include trades opened after this date/time."
                    slotProps={{ inputLabel: { shrink: true } }}
                  />

                  <TextField
                    label="End Date"
                    type="datetime-local"
                    value={draft.endDate}
                    onChange={(event) => setDraft((prev) => ({ ...prev, endDate: event.target.value }))}
                    helperText="Optional: include trades opened before this date/time."
                    slotProps={{ inputLabel: { shrink: true } }}
                  />

                  <TextField
                    label="Result Limit"
                    type="number"
                    value={draft.limit}
                    onChange={(event) => setDraft((prev) => ({ ...prev, limit: event.target.value }))}
                    helperText="Number of rows to request from backend (1-1000)."
                    inputProps={{ min: 1, max: 1000, step: 1 }}
                  />

                  {validationError ? <Alert severity="error">{validationError}</Alert> : null}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button variant="contained" onClick={applyFilters} disabled={isFetching || Boolean(validationError)}>
                      Apply
                    </Button>
                    <Button variant="outlined" onClick={resetFilters} disabled={isFetching}>
                      Reset
                    </Button>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => void refetch()} disabled={isFetching}>
                      Refresh
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6">Results</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rows: {trades.length} | Win rate: {totals.winRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PnL: {formatAmount(totals.totalPnl)} | Fees: {formatAmount(totals.totalFees)} | Slippage: {formatAmount(totals.totalSlippage)}
                    </Typography>
                  </Box>
                  <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportCsv}>
                    Export CSV
                  </Button>
                </Stack>

                {isError ? <Alert severity="error">Failed to load trade history from backend.</Alert> : null}
                {!isError && isFetching ? <Typography>Loading trade history...</Typography> : null}

                {!isFetching && !isError && trades.length === 0 ? (
                  <Alert severity="info">No trades found for selected filters.</Alert>
                ) : null}

                {trades.length > 0 ? (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Pair</TableCell>
                          <TableCell>Signal</TableCell>
                          <TableCell>Entry Time</TableCell>
                          <TableCell>Exit Time</TableCell>
                          <TableCell align="right">PnL</TableCell>
                          <TableCell align="right">Fees</TableCell>
                          <TableCell align="right">Slippage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trades.map((trade) => (
                          <TableRow
                            key={trade.id}
                            hover
                            selected={trade.id === selectedTradeId}
                            onClick={() => setSelectedTradeId(trade.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{trade.id}</TableCell>
                            <TableCell>{trade.pair}</TableCell>
                            <TableCell>{trade.signal}</TableCell>
                            <TableCell>{formatDate(trade.entryTime)}</TableCell>
                            <TableCell>{formatDate(trade.exitTime)}</TableCell>
                            <TableCell align="right" sx={{ color: trade.pnl >= 0 ? 'success.main' : 'error.main' }}>
                              {formatAmount(trade.pnl)}
                            </TableCell>
                            <TableCell align="right">{formatAmount(trade.feesActual)}</TableCell>
                            <TableCell align="right">{formatAmount(trade.slippageActual)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ) : null}
              </CardContent>
            </Card>

            {selectedTrade ? (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Trade Detail #{selectedTrade.id}</Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2">Pair: {selectedTrade.pair}</Typography></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2">Signal: {selectedTrade.signal}</Typography></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2">Entry Time: {formatDate(selectedTrade.entryTime)}</Typography></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2">Exit Time: {formatDate(selectedTrade.exitTime)}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 4 }}><Typography variant="body2">Entry Price: {selectedTrade.entryPrice.toFixed(4)}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 4 }}><Typography variant="body2">Exit Price: {selectedTrade.exitPrice?.toFixed(4) ?? '-'}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 4 }}><Typography variant="body2">Position Size: {selectedTrade.positionSize.toFixed(6)}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 4 }}><Typography variant="body2">Risk Amount: {formatAmount(selectedTrade.riskAmount)}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 4 }}><Typography variant="body2">PnL: {formatAmount(selectedTrade.pnl)}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 4 }}><Typography variant="body2">Stop Loss: {selectedTrade.stopLoss?.toFixed(4) ?? '-'}</Typography></Grid>
                    <Grid size={{ xs: 12, md: 4 }}><Typography variant="body2">Take Profit: {selectedTrade.takeProfit?.toFixed(4) ?? '-'}</Typography></Grid>
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
