import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef, type CSSProperties } from 'react';

import type {
  TradeReviewRow,
  TradeSortDirection,
  TradeSortField,
} from './BacktestTradeReviewPanel';

import { NumericText, StatusPill } from '@/components/ui/Workbench';
import { formatCurrency, formatDateTime, formatNumber, formatPercentage } from '@/utils/formatters';

interface BacktestVirtualizedTradeTableProps {
  rows: TradeReviewRow[];
  selectedTradeId: string | null;
  sortField: TradeSortField;
  sortDirection: TradeSortDirection;
  onSortChange: (field: TradeSortField) => void;
  onRowSelect: (row: TradeReviewRow) => void;
}

const columns: Array<{
  key: TradeSortField;
  label: string;
  width: string;
  align: 'left' | 'right';
}> = [
  { key: 'symbol', label: 'Symbol', width: '140px', align: 'left' },
  { key: 'side', label: 'Side', width: '120px', align: 'left' },
  { key: 'entryTime', label: 'Entry', width: '188px', align: 'left' },
  { key: 'exitTime', label: 'Exit', width: '188px', align: 'left' },
  { key: 'quantity', label: 'Quantity', width: '120px', align: 'right' },
  { key: 'entryPrice', label: 'Entry price', width: '132px', align: 'right' },
  { key: 'exitPrice', label: 'Exit price', width: '132px', align: 'right' },
  { key: 'pnlValue', label: 'PnL', width: '132px', align: 'right' },
  { key: 'returnPct', label: 'Return', width: '120px', align: 'right' },
];

const columnTemplate = columns.map((column) => column.width).join(' ');
const minTableWidth = 1272;

export function BacktestVirtualizedTradeTable({
  rows,
  selectedTradeId,
  sortField,
  sortDirection,
  onSortChange,
  onRowSelect,
}: BacktestVirtualizedTradeTableProps) {
  const scrollElementRef = useRef<HTMLDivElement | null>(null);
  const isJsdomEnvironment =
    typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);
  const shouldVirtualize =
    !isJsdomEnvironment && typeof ResizeObserver !== 'undefined' && rows.length > 80;
  // TanStack Virtual must read the scroll element from the component that owns it.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? rows.length : 0,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 54,
    initialRect: { width: minTableWidth, height: 608 },
    overscan: 12,
  });

  const virtualRows = shouldVirtualize ? rowVirtualizer.getVirtualItems() : [];
  const totalHeight = shouldVirtualize ? rowVirtualizer.getTotalSize() : rows.length * 54;
  const rowIdOrder = useMemo(() => rows.map((row) => row.id), [rows]);

  const focusTradeRow = (tradeId: string) => {
    requestAnimationFrame(() => {
      document.getElementById(`backtest-trade-row-${tradeId}`)?.focus();
    });
  };

  const moveSelection = (currentIndex: number, offset: number) => {
    const nextIndex = Math.min(Math.max(currentIndex + offset, 0), rowIdOrder.length - 1);
    const nextRow = rows[nextIndex];
    if (!nextRow) {
      return;
    }

    onRowSelect(nextRow);
    rowVirtualizer.scrollToIndex(nextIndex, { align: 'auto' });
    focusTradeRow(nextRow.id);
  };

  const renderRow = (row: TradeReviewRow, rowIndex: number, style?: CSSProperties) => {
    const isSelected = row.id === selectedTradeId;

    return (
      <Box
        id={`backtest-trade-row-${row.id}`}
        key={row.id}
        role="row"
        aria-rowindex={rowIndex + 2}
        aria-selected={isSelected}
        className={isSelected ? 'Mui-selected' : undefined}
        tabIndex={0}
        onClick={() => onRowSelect(row)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onRowSelect(row);
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            moveSelection(rowIndex, 1);
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            moveSelection(rowIndex, -1);
          }
        }}
        sx={{
          display: 'grid',
          gridTemplateColumns: columnTemplate,
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          minHeight: 54,
          cursor: 'pointer',
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderLeft: '3px solid',
          borderLeftColor: isSelected ? 'primary.main' : 'transparent',
          backgroundColor: isSelected
            ? (theme) => alpha(theme.palette.primary.main, 0.1)
            : 'background.paper',
          boxShadow: isSelected
            ? (theme) => `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`
            : 'none',
          '&:hover': {
            backgroundColor: isSelected
              ? (theme) => alpha(theme.palette.primary.main, 0.14)
              : 'action.hover',
          },
          '&:focus-visible': {
            outline: (theme) => `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '-2px',
          },
        }}
        style={style}
      >
        <Box role="cell">
          <Typography variant="body2">{row.symbol}</Typography>
        </Box>
        <Box role="cell">
          <StatusPill
            label={row.side}
            tone={row.side === 'LONG' ? 'success' : 'error'}
            variant="filled"
          />
        </Box>
        <Box role="cell">
          <Typography variant="body2">{formatDateTime(row.entryTime)}</Typography>
        </Box>
        <Box role="cell">
          <Typography variant="body2">{formatDateTime(row.exitTime)}</Typography>
        </Box>
        <Box role="cell" sx={{ textAlign: 'right' }}>
          <NumericText variant="body2">{formatNumber(row.quantity, 6)}</NumericText>
        </Box>
        <Box role="cell" sx={{ textAlign: 'right' }}>
          <NumericText variant="body2">{formatCurrency(row.entryPrice, 4)}</NumericText>
        </Box>
        <Box role="cell" sx={{ textAlign: 'right' }}>
          <NumericText variant="body2">{formatCurrency(row.exitPrice, 4)}</NumericText>
        </Box>
        <Box role="cell" sx={{ textAlign: 'right' }}>
          <NumericText variant="body2" tone={row.pnlValue >= 0 ? 'success' : 'error'}>
            {formatCurrency(row.pnlValue, 2)}
          </NumericText>
        </Box>
        <Box role="cell" sx={{ textAlign: 'right' }}>
          <NumericText variant="body2" tone={row.returnPct >= 0 ? 'success' : 'error'}>
            {formatPercentage(row.returnPct, 2)}
          </NumericText>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        role="table"
        aria-label="Trade review table"
        sx={{
          minWidth: minTableWidth,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
        }}
      >
        <Box role="rowgroup">
          <Box
            role="row"
            sx={{
              display: 'grid',
              gridTemplateColumns: columnTemplate,
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.default',
            }}
          >
            {columns.map((column) => (
              <Stack
                key={column.key}
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent={column.align === 'right' ? 'flex-end' : 'flex-start'}
              >
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
        </Box>

        <Box
          ref={scrollElementRef}
          sx={{
            maxHeight: 'min(65vh, 38rem)',
            overflow: 'auto',
          }}
        >
          <Box
            role="rowgroup"
            sx={{
              minWidth: minTableWidth,
              height: shouldVirtualize ? totalHeight : 'auto',
              position: shouldVirtualize ? 'relative' : 'static',
            }}
          >
            {shouldVirtualize
              ? virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  if (!row) {
                    return null;
                  }

                  return renderRow(row, virtualRow.index, {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  });
                })
              : rows.map((row, index) => renderRow(row, index))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
