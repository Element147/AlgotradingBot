import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import type {
  TradeReviewRow,
  TradeSortDirection,
  TradeSortField,
} from './BacktestTradeReviewPanel';

import { ColumnVisibilityMenu } from '@/components/ui/ColumnVisibilityMenu';
import {
  loadVirtualizedTablePreferences,
  persistInteractiveTablePreferences,
} from '@/components/ui/tablePreferences';
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
  width: number;
  align: 'left' | 'right';
  canHide: boolean;
}> = [
  { key: 'symbol', label: 'Symbol', width: 140, align: 'left', canHide: false },
  { key: 'side', label: 'Side', width: 120, align: 'left', canHide: true },
  { key: 'entryTime', label: 'Entry', width: 188, align: 'left', canHide: true },
  { key: 'exitTime', label: 'Exit', width: 188, align: 'left', canHide: true },
  { key: 'quantity', label: 'Quantity', width: 120, align: 'right', canHide: true },
  { key: 'entryPrice', label: 'Entry price', width: 132, align: 'right', canHide: true },
  { key: 'exitPrice', label: 'Exit price', width: 132, align: 'right', canHide: true },
  { key: 'pnlValue', label: 'PnL', width: 132, align: 'right', canHide: true },
  { key: 'returnPct', label: 'Return', width: 120, align: 'right', canHide: true },
];

const minColumnWidth = 78;
const tableId = 'backtest-trade-review';
const legacyWidthsStorageKey = 'interactive-table:backtest-trade-review-widths';

export function BacktestVirtualizedTradeTable({
  rows,
  selectedTradeId,
  sortField,
  sortDirection,
  onSortChange,
  onRowSelect,
}: BacktestVirtualizedTradeTableProps) {
  const scrollElementRef = useRef<HTMLDivElement | null>(null);
  const resizeStateRef = useRef<{
    key: TradeSortField;
    startX: number;
    startWidth: number;
  } | null>(null);
  const initialPreferencesRef = useRef(
    loadVirtualizedTablePreferences({
      tableId,
      columns,
      minColumnWidth,
      legacyWidthsStorageKey,
    })
  );
  const [columnWidths, setColumnWidths] = useState<Record<TradeSortField, number>>(
    initialPreferencesRef.current.columnWidths
  );
  const [columnVisibility, setColumnVisibility] = useState<Record<TradeSortField, boolean>>(
    initialPreferencesRef.current.columnVisibility
  );
  const visibleColumns = useMemo(
    () =>
      columns.filter(
        (column) => !column.canHide || columnVisibility[column.key] !== false
      ),
    [columnVisibility]
  );
  const columnTemplate = useMemo(
    () => visibleColumns.map((column) => `${columnWidths[column.key] ?? column.width}px`).join(' '),
    [columnWidths, visibleColumns]
  );
  const minTableWidth = useMemo(
    () =>
      visibleColumns.reduce(
        (total, column) => total + (columnWidths[column.key] ?? column.width),
        0
      ),
    [columnWidths, visibleColumns]
  );
  const isJsdomEnvironment =
    typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);
  const shouldVirtualize =
    !isJsdomEnvironment && typeof ResizeObserver !== 'undefined' && rows.length > 80;

  useEffect(() => {
    const hiddenFixedColumns = columns.filter(
      (column) => !column.canHide && columnVisibility[column.key] === false
    );

    if (hiddenFixedColumns.length === 0) {
      return;
    }

    setColumnVisibility((current) => {
      const nextVisibility = { ...current };
      hiddenFixedColumns.forEach((column) => {
        nextVisibility[column.key] = true;
      });
      return nextVisibility;
    });
  }, [columnVisibility]);

  useEffect(() => {
    persistInteractiveTablePreferences(tableId, {
      columnSizing: columnWidths,
      columnVisibility,
    });
  }, [columnVisibility, columnWidths]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const resizeState = resizeStateRef.current;
      if (!resizeState) {
        return;
      }

      setColumnWidths((current) => ({
        ...current,
        [resizeState.key]: Math.max(
          minColumnWidth,
          resizeState.startWidth + event.clientX - resizeState.startX
        ),
      }));
    };

    const onPointerUp = () => {
      resizeStateRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  // TanStack Virtual must read the scroll element from the component that owns it.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? rows.length : 0,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 46,
    initialRect: { width: minTableWidth, height: 608 },
    overscan: 12,
  });

  const virtualRows = shouldVirtualize ? rowVirtualizer.getVirtualItems() : [];
  const totalHeight = shouldVirtualize ? rowVirtualizer.getTotalSize() : rows.length * 46;
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
          px: 1,
          minHeight: 46,
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
        {visibleColumns.map((column) => (
          <Box
            key={`${row.id}-${column.key}`}
            role="cell"
            sx={{ textAlign: column.align === 'right' ? 'right' : 'left' }}
          >
            {column.key === 'symbol' ? <Typography variant="body2">{row.symbol}</Typography> : null}
            {column.key === 'side' ? (
              <StatusPill
                label={row.side}
                tone={row.side === 'LONG' ? 'success' : 'error'}
                variant="filled"
              />
            ) : null}
            {column.key === 'entryTime' ? (
              <Typography variant="body2">{formatDateTime(row.entryTime)}</Typography>
            ) : null}
            {column.key === 'exitTime' ? (
              <Typography variant="body2">{formatDateTime(row.exitTime)}</Typography>
            ) : null}
            {column.key === 'quantity' ? (
              <NumericText variant="body2">{formatNumber(row.quantity, 6)}</NumericText>
            ) : null}
            {column.key === 'entryPrice' ? (
              <NumericText variant="body2">{formatCurrency(row.entryPrice, 4)}</NumericText>
            ) : null}
            {column.key === 'exitPrice' ? (
              <NumericText variant="body2">{formatCurrency(row.exitPrice, 4)}</NumericText>
            ) : null}
            {column.key === 'pnlValue' ? (
              <NumericText variant="body2" tone={row.pnlValue >= 0 ? 'success' : 'error'}>
                {formatCurrency(row.pnlValue, 2)}
              </NumericText>
            ) : null}
            {column.key === 'returnPct' ? (
              <NumericText variant="body2" tone={row.returnPct >= 0 ? 'success' : 'error'}>
                {formatPercentage(row.returnPct, 2)}
              </NumericText>
            ) : null}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
        <ColumnVisibilityMenu
          columns={columns.map((column) => ({
            id: column.key,
            label: column.label,
            visible: !column.canHide || columnVisibility[column.key] !== false,
            canHide: column.canHide,
          }))}
          onToggle={(columnId) =>
            setColumnVisibility((current) => ({
              ...current,
              [columnId]: current[columnId as TradeSortField] === false,
            }))
          }
          onRestoreDefaults={() =>
            setColumnVisibility(
              columns.reduce(
                (accumulator, column) => {
                  accumulator[column.key] = true;
                  return accumulator;
                },
                {} as Record<TradeSortField, boolean>
              )
            )
          }
        />
      </Stack>
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
            {visibleColumns.map((column) => (
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
                <Box
                  onPointerDown={(event) => {
                    resizeStateRef.current = {
                      key: column.key,
                      startX: event.clientX,
                      startWidth: columnWidths[column.key] ?? column.width,
                    };
                  }}
                  sx={{
                    width: 10,
                    alignSelf: 'stretch',
                    cursor: 'col-resize',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 4,
                      bottom: 4,
                      left: '50%',
                      width: 2,
                      transform: 'translateX(-50%)',
                      borderRadius: 999,
                      backgroundColor: 'divider',
                    },
                  }}
                />
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
