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
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { TradeDetailsModal } from './TradeDetailsModal';
import { useGetTradeHistoryQuery, type TradeHistoryQuery } from './tradesApi';
import {
  buildTradesCsv,
  calculateTradeStats,
  sortTrades,
  type TradeSortField,
} from './tradeUtils';
import { VirtualizedTradeTable } from './VirtualizedTradeTable';

import { AppLayout } from '@/components/layout/AppLayout';
import { FieldTooltip } from '@/components/ui/FieldTooltip';
import { selectCurrency, selectTimezone } from '@/features/settings/settingsSlice';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const STORAGE_KEY = 'trades_page_filters_v2';

interface TradeFilterDraft {
  accountId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  limit: string;
  searchId: string;
}

const defaultDraft: TradeFilterDraft = {
  accountId: '',
  symbol: '',
  startDate: '',
  endDate: '',
  limit: '200',
  searchId: '',
};

const toDateTimeParam = (value: string): string | undefined => {
  if (!value.trim()) {
    return undefined;
  }

  return value.length === 16 ? `${value}:00` : value;
};

const readStoredDraft = (): TradeFilterDraft => {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultDraft;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<TradeFilterDraft>;
    return {
      accountId: parsed.accountId ?? '',
      symbol: parsed.symbol ?? '',
      startDate: parsed.startDate ?? '',
      endDate: parsed.endDate ?? '',
      limit: parsed.limit ?? '200',
      searchId: parsed.searchId ?? '',
    };
  } catch {
    return defaultDraft;
  }
};

export default function TradesPage() {
  const timezone = useSelector(selectTimezone);
  const currency = useSelector(selectCurrency);
  const [searchParams, setSearchParams] = useSearchParams();

  const [draft, setDraft] = useState<TradeFilterDraft>(() => {
    const fromStorage = readStoredDraft();
    if (Array.from(searchParams.keys()).length === 0) {
      return fromStorage;
    }
    return {
      accountId: searchParams.get('accountId') ?? fromStorage.accountId,
      symbol: searchParams.get('symbol') ?? fromStorage.symbol,
      startDate: searchParams.get('startDate') ?? fromStorage.startDate,
      endDate: searchParams.get('endDate') ?? fromStorage.endDate,
      limit: searchParams.get('limit') ?? fromStorage.limit,
      searchId: searchParams.get('searchId') ?? fromStorage.searchId,
    };
  });
  const [query, setQuery] = useState<TradeHistoryQuery>({ limit: 200 });
  const [selectedTradeId, setSelectedTradeId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<TradeSortField>('entryTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const debouncedSearchId = useDebouncedValue(draft.searchId, 300);

  const { data, isFetching, isError, refetch } = useGetTradeHistoryQuery(query, {
    pollingInterval: 10000,
    skipPollingIfUnfocused: true,
  });

  const trades = useMemo(() => data?.items ?? [], [data]);
  const limit = Number(draft.limit) || 200;
  const pageSize = 50;

  const validationError = useMemo(() => {
    const parsedLimit = Number(draft.limit);

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) {
      return 'Limit must be an integer between 1 and 1000.';
    }

    if (draft.accountId.trim()) {
      const accountId = Number(draft.accountId);
      if (!Number.isInteger(accountId) || accountId <= 0) {
        return 'Account ID must be a positive integer.';
      }
    }

    if (draft.searchId.trim()) {
      const tradeId = Number(draft.searchId);
      if (!Number.isInteger(tradeId) || tradeId <= 0) {
        return 'Trade ID search must be a positive integer.';
      }
    }

    if (draft.startDate && draft.endDate && new Date(draft.startDate) > new Date(draft.endDate)) {
      return 'Start date must be earlier than end date.';
    }

    return null;
  }, [draft]);

  const filteredTrades = useMemo(() => {
    const sorted = sortTrades(trades, sortField, sortDirection);

    if (!debouncedSearchId.trim()) {
      return sorted;
    }

    const searchId = Number(debouncedSearchId);
    if (!Number.isInteger(searchId)) {
      return sorted;
    }

    return sorted.filter((trade) => trade.id === searchId);
  }, [debouncedSearchId, sortDirection, sortField, trades]);

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / pageSize));
  const pagedTrades = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTrades.slice(start, start + pageSize);
  }, [filteredTrades, page]);

  const selectedTrade = useMemo(
    () => filteredTrades.find((trade) => trade.id === selectedTradeId) ?? null,
    [filteredTrades, selectedTradeId]
  );

  const symbols = useMemo(() => {
    const unique = new Set(trades.map((trade) => trade.pair));
    return Array.from(unique).sort((left, right) => left.localeCompare(right));
  }, [trades]);

  const stats = useMemo(() => calculateTradeStats(filteredTrades), [filteredTrades]);

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

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (draft.accountId) params.set('accountId', draft.accountId);
    if (draft.symbol) params.set('symbol', draft.symbol);
    if (draft.startDate) params.set('startDate', draft.startDate);
    if (draft.endDate) params.set('endDate', draft.endDate);
    if (draft.limit) params.set('limit', draft.limit);
    if (draft.searchId) params.set('searchId', draft.searchId);
    setSearchParams(params, { replace: true });
  }, [draft, setSearchParams]);

  const applyFilters = () => {
    if (validationError) {
      setFeedback({ severity: 'error', message: validationError });
      return;
    }

    const nextQuery: TradeHistoryQuery = {
      limit,
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
    setPage(1);
    setFeedback({ severity: 'success', message: 'Filters applied.' });
  };

  const resetFilters = () => {
    setDraft(defaultDraft);
    setQuery({ limit: 200 });
    setPage(1);
    setFeedback({ severity: 'success', message: 'Filters reset.' });
  };

  const exportCsv = () => {
    if (filteredTrades.length === 0) {
      setFeedback({ severity: 'error', message: 'There are no rows to export.' });
      return;
    }

    const csv = buildTradesCsv(filteredTrades);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trades_${new Date().toISOString().replaceAll(':', '').replaceAll('-', '').slice(0, 15)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setFeedback({ severity: 'success', message: 'CSV export downloaded.' });
  };

  const changeSort = (field: TradeSortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      setPage(1);
      return;
    }

    setSortField(field);
    setSortDirection('asc');
    setPage(1);
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
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Filters
                </Typography>
                <Stack spacing={2}>
                  <FieldTooltip title="Optional account scope. Leaving empty queries all visible accounts.">
                    <TextField
                      label="Account ID"
                      value={draft.accountId}
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, accountId: event.target.value }))
                      }
                      placeholder="e.g. 1"
                      helperText="Optional: load only trades from one account."
                    />
                  </FieldTooltip>
                  <FieldTooltip title="Optional symbol filter. Narrowing too much can hide correlated behavior in review.">
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
                  </FieldTooltip>
                  <FieldTooltip title="Lower date boundary for trade inclusion. Wrong timezone assumptions can shift results.">
                    <TextField
                      label="Start Date"
                      type="datetime-local"
                      value={draft.startDate}
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, startDate: event.target.value }))
                      }
                      helperText="Optional: include trades opened after this date/time."
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </FieldTooltip>
                  <FieldTooltip title="Upper date boundary for trade inclusion. End before start returns empty/invalid slices.">
                    <TextField
                      label="End Date"
                      type="datetime-local"
                      value={draft.endDate}
                      onChange={(event) => setDraft((prev) => ({ ...prev, endDate: event.target.value }))}
                      helperText="Optional: include trades opened before this date/time."
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </FieldTooltip>
                  <FieldTooltip title="Backend fetch size. Very high limits increase payload size and response time.">
                    <TextField
                      label="Result Limit"
                      type="number"
                      value={draft.limit}
                      onChange={(event) => setDraft((prev) => ({ ...prev, limit: event.target.value }))}
                      helperText="Number of rows to request from backend (1-1000)."
                      inputProps={{ min: 1, max: 1000, step: 1 }}
                    />
                  </FieldTooltip>
                  <FieldTooltip title="Client-side trade ID lookup. Non-numeric values are rejected by validation.">
                    <TextField
                      label="Search Trade ID"
                      value={draft.searchId}
                      onChange={(event) => {
                        setDraft((prev) => ({ ...prev, searchId: event.target.value }));
                        setPage(1);
                      }}
                      helperText="Debounced by 300ms."
                    />
                  </FieldTooltip>

                  {validationError ? <Alert severity="error">{validationError}</Alert> : null}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      variant="contained"
                      onClick={applyFilters}
                      disabled={isFetching || Boolean(validationError)}
                    >
                      Apply
                    </Button>
                    <Button variant="outlined" onClick={resetFilters} disabled={isFetching}>
                      Reset
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => void refetch()}
                      disabled={isFetching}
                    >
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
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="h6">Results</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trades: {stats.totalTrades} | Win rate: {stats.winRate.toFixed(1)}% | Profit
                      factor: {stats.profitFactor.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg win: {formatAmount(stats.averageWin)} | Avg loss: {formatAmount(stats.averageLoss)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PnL: {formatAmount(stats.totalPnl)} | Fees: {formatAmount(stats.totalFees)} |
                      Slippage: {formatAmount(stats.totalSlippage)}
                    </Typography>
                  </Box>
                  <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportCsv}>
                    Export CSV
                  </Button>
                </Stack>

                {isError ? <Alert severity="error">Failed to load trade history from backend.</Alert> : null}
                {!isError && isFetching ? <Typography>Loading trade history...</Typography> : null}

                {!isFetching && !isError && filteredTrades.length === 0 ? (
                  <Alert severity="info">No trades found for selected filters.</Alert>
                ) : null}

                {filteredTrades.length > 0 ? (
                  <>
                    <VirtualizedTradeTable
                      rows={pagedTrades}
                      selectedTradeId={selectedTradeId}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSortChange={changeSort}
                      onRowSelect={(trade) => setSelectedTradeId(trade.id)}
                    />

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Page {page} of {totalPages} | Timezone: {timezone}
                      </Typography>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, nextPage) => setPage(nextPage)}
                        color="primary"
                      />
                    </Stack>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <TradeDetailsModal
        trade={selectedTrade}
        open={Boolean(selectedTrade)}
        onClose={() => setSelectedTradeId(null)}
      />
    </AppLayout>
  );
}
