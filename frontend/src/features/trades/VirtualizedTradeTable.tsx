import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { TradeHistoryItem } from './tradesApi';
import type { TradeSortField } from './tradeUtils';

import { ColumnVisibilityMenu } from '@/components/ui/ColumnVisibilityMenu';
import {
  loadVirtualizedTablePreferences,
  persistInteractiveTablePreferences,
} from '@/components/ui/tablePreferences';
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
  width: number;
  canHide: boolean;
}> = [
  { key: 'id', label: 'ID', width: 80, canHide: false },
  { key: 'pair', label: 'Pair', width: 120, canHide: true },
  { key: 'positionSide', label: 'Side', width: 90, canHide: true },
  { key: 'signal', label: 'Signal', width: 90, canHide: true },
  { key: 'entryTime', label: 'Entry Time', width: 170, canHide: true },
  { key: 'exitTime', label: 'Exit Time', width: 170, canHide: true },
  { key: 'entryPrice', label: 'Entry', width: 110, canHide: true },
  { key: 'exitPrice', label: 'Exit', width: 110, canHide: true },
  { key: 'positionSize', label: 'Size', width: 110, canHide: true },
  { key: 'pnl', label: 'PnL', width: 120, canHide: true },
  { key: 'feesActual', label: 'Fees', width: 120, canHide: true },
  { key: 'slippageActual', label: 'Slippage', width: 120, canHide: true },
];

const minColumnWidth = 72;
const tableId = 'trade-history-virtual';
const legacyWidthsStorageKey = 'interactive-table:trade-history-virtual-widths';

export function VirtualizedTradeTable({
  rows,
  selectedTradeId,
  sortField,
  sortDirection,
  onSortChange,
  onRowSelect,
}: VirtualizedTradeTableProps) {
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

  // TanStack Virtual requires calling the hook directly in the component that owns the scroll element.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 46,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();
  const focusTradeRow = (tradeId: number) => {
    requestAnimationFrame(() => {
      document.getElementById(`trade-row-${tradeId}`)?.focus();
    });
  };

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
      <Box sx={{ minWidth: minTableWidth }}>
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
          {visibleColumns.map((column) => (
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

        <Box
          ref={scrollElementRef}
          aria-label="Trade review table"
          sx={{
            maxHeight: 560,
            overflow: 'auto',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ height: totalHeight, position: 'relative', minWidth: minTableWidth }}>
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) {
                return null;
              }

              return (
                <Box
                  id={`trade-row-${row.id}`}
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onRowSelect(row)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onRowSelect(row);
                    }

                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      const nextIndex = Math.min(virtualRow.index + 1, rows.length - 1);
                      const nextRow = rows[nextIndex];
                      if (nextRow) {
                        onRowSelect(nextRow);
                        rowVirtualizer.scrollToIndex(nextIndex, { align: 'auto' });
                        focusTradeRow(nextRow.id);
                      }
                    }

                    if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      const previousIndex = Math.max(virtualRow.index - 1, 0);
                      const previousRow = rows[previousIndex];
                      if (previousRow) {
                        onRowSelect(previousRow);
                        rowVirtualizer.scrollToIndex(previousIndex, { align: 'auto' });
                        focusTradeRow(previousRow.id);
                      }
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
                    px: 0.75,
                    cursor: 'pointer',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    borderLeft: '3px solid',
                    borderLeftColor:
                      row.id === selectedTradeId ? 'primary.main' : 'transparent',
                    backgroundColor:
                      row.id === selectedTradeId
                        ? (theme) => alpha(theme.palette.primary.main, 0.1)
                        : 'background.paper',
                    boxShadow:
                      row.id === selectedTradeId
                        ? (theme) =>
                            `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`
                        : 'none',
                    '&:hover': {
                      backgroundColor:
                        row.id === selectedTradeId
                          ? (theme) => alpha(theme.palette.primary.main, 0.14)
                          : 'action.hover',
                    },
                    '&:focus-visible': {
                      outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: '-2px',
                    },
                  }}
                >
                  {visibleColumns.map((column) => (
                    <Typography
                      key={`${row.id}-${column.key}`}
                      variant="body2"
                      sx={{
                        color:
                          column.key === 'pnl'
                            ? row.pnl >= 0
                              ? 'success.main'
                              : 'error.main'
                            : undefined,
                      }}
                    >
                      {column.key === 'id' ? row.id : null}
                      {column.key === 'pair' ? row.pair : null}
                      {column.key === 'positionSide' ? row.positionSide : null}
                      {column.key === 'signal' ? row.signal : null}
                      {column.key === 'entryTime' ? row.entryTime : null}
                      {column.key === 'exitTime' ? row.exitTime ?? '-' : null}
                      {column.key === 'entryPrice' ? formatters.entryPrice(row) : null}
                      {column.key === 'exitPrice' ? formatters.exitPrice(row) : null}
                      {column.key === 'positionSize' ? formatters.positionSize(row) : null}
                      {column.key === 'pnl' ? formatters.pnl(row) : null}
                      {column.key === 'feesActual' ? formatters.feesActual(row) : null}
                      {column.key === 'slippageActual' ? formatters.slippageActual(row) : null}
                    </Typography>
                  ))}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
