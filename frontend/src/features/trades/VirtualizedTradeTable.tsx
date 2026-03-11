import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef } from 'react';

import type { TradeHistoryItem } from './tradesApi';
import type { TradeSortField } from './tradeUtils';

import { formatCurrency } from '@/utils/formatters';

interface VirtualizedTradeTableProps {
  rows: TradeHistoryItem[];
  selectedTradeId: number | null;
  sortField: TradeSortField;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: TradeSortField) => void;
  onRowSelect: (row: TradeHistoryItem) => void;
}

const columns: Array<{
  key: TradeSortField;
  label: string;
  width: string;
}> = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'pair', label: 'Pair', width: '120px' },
  { key: 'entryTime', label: 'Entry Time', width: '170px' },
  { key: 'exitTime', label: 'Exit Time', width: '170px' },
  { key: 'entryPrice', label: 'Entry', width: '110px' },
  { key: 'exitPrice', label: 'Exit', width: '110px' },
  { key: 'positionSize', label: 'Size', width: '110px' },
  { key: 'pnl', label: 'PnL', width: '120px' },
  { key: 'feesActual', label: 'Fees', width: '120px' },
  { key: 'slippageActual', label: 'Slippage', width: '120px' },
];

const columnTemplate = columns.map((col) => col.width).join(' ');

export function VirtualizedTradeTable({
  rows,
  selectedTradeId,
  sortField,
  sortDirection,
  onSortChange,
  onRowSelect,
}: VirtualizedTradeTableProps) {
  const scrollElementRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  const formatters = useMemo(
    () => ({
      entryPrice: (row: TradeHistoryItem) => row.entryPrice.toFixed(4),
      exitPrice: (row: TradeHistoryItem) => row.exitPrice?.toFixed(4) ?? '-',
      positionSize: (row: TradeHistoryItem) => row.positionSize.toFixed(6),
      pnl: (row: TradeHistoryItem) => formatCurrency(row.pnl),
      feesActual: (row: TradeHistoryItem) => formatCurrency(row.feesActual),
      slippageActual: (row: TradeHistoryItem) => formatCurrency(row.slippageActual),
    }),
    []
  );

  return (
    <Box>
      <Box
        role="row"
        sx={{
          display: 'grid',
          gridTemplateColumns: columnTemplate,
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontWeight: 600,
        }}
      >
        {columns.map((column) => (
          <Stack key={column.key} direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {column.label}
            </Typography>
            <IconButton
              size="small"
              onClick={() => onSortChange(column.key)}
              aria-label={`Sort by ${column.label}`}
            >
              {sortField === column.key && sortDirection === 'asc' ? (
                <ArrowUpward fontSize="inherit" />
              ) : (
                <ArrowDownward fontSize="inherit" />
              )}
            </IconButton>
          </Stack>
        ))}
      </Box>

      <Box
        ref={scrollElementRef}
        sx={{
          maxHeight: 560,
          overflow: 'auto',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ height: totalHeight, position: 'relative' }}>
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) {
              return null;
            }

            return (
              <Box
                key={row.id}
                role="button"
                tabIndex={0}
                onClick={() => onRowSelect(row)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRowSelect(row);
                  }
                }}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'grid',
                  gridTemplateColumns: columnTemplate,
                  alignItems: 'center',
                  gap: 1,
                  px: 1,
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor:
                    row.id === selectedTradeId ? 'action.selected' : 'background.paper',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Typography variant="body2">{row.id}</Typography>
                <Typography variant="body2">{row.pair}</Typography>
                <Typography variant="body2">{row.entryTime}</Typography>
                <Typography variant="body2">{row.exitTime ?? '-'}</Typography>
                <Typography variant="body2">{formatters.entryPrice(row)}</Typography>
                <Typography variant="body2">{formatters.exitPrice(row)}</Typography>
                <Typography variant="body2">{formatters.positionSize(row)}</Typography>
                <Typography
                  variant="body2"
                  sx={{ color: row.pnl >= 0 ? 'success.main' : 'error.main' }}
                >
                  {formatters.pnl(row)}
                </Typography>
                <Typography variant="body2">{formatters.feesActual(row)}</Typography>
                <Typography variant="body2">{formatters.slippageActual(row)}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
