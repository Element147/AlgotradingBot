import DownloadIcon from '@mui/icons-material/Download';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import type { BacktestComparisonItem, BacktestComparisonResponse } from './backtestApi';
import { BacktestComparisonCharts } from './BacktestComparisonCharts';

import { formatCurrency, formatDateTime, formatNumber, formatPercentage } from '@/utils/formatters';

interface BacktestComparisonPanelProps {
  comparison: BacktestComparisonResponse;
}

type SortDirection = 'asc' | 'desc';
type ComparisonSortField =
  | 'timestamp'
  | 'finalBalance'
  | 'finalBalanceDelta'
  | 'totalReturnPercent'
  | 'totalReturnDeltaPercent'
  | 'sharpeRatio'
  | 'profitFactor'
  | 'winRate'
  | 'maxDrawdown'
  | 'totalTrades';

const deltaColor = (value: number): 'success.main' | 'error.main' | 'text.primary' => {
  if (value > 0) {
    return 'success.main';
  }
  if (value < 0) {
    return 'error.main';
  }
  return 'text.primary';
};

const compareValues = (
  left: number | string,
  right: number | string,
  direction: SortDirection
) => {
  const multiplier = direction === 'asc' ? 1 : -1;

  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * multiplier;
  }

  return String(left).localeCompare(String(right), undefined, { sensitivity: 'base' }) * multiplier;
};

const sortableColumns: Array<{
  field: ComparisonSortField;
  label: string;
  align?: 'left' | 'right';
}> = [
  { field: 'timestamp', label: 'Finished' },
  { field: 'finalBalance', label: 'Final Balance', align: 'right' },
  { field: 'finalBalanceDelta', label: 'Balance Delta', align: 'right' },
  { field: 'totalReturnPercent', label: 'Return', align: 'right' },
  { field: 'totalReturnDeltaPercent', label: 'Return Delta', align: 'right' },
  { field: 'sharpeRatio', label: 'Sharpe', align: 'right' },
  { field: 'profitFactor', label: 'Profit Factor', align: 'right' },
  { field: 'winRate', label: 'Win Rate', align: 'right' },
  { field: 'maxDrawdown', label: 'Max DD', align: 'right' },
  { field: 'totalTrades', label: 'Trades', align: 'right' },
];

export function BacktestComparisonPanel({ comparison }: BacktestComparisonPanelProps) {
  const [sortField, setSortField] = useState<ComparisonSortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const hasCompleteProvenance = comparison.items.every(
    (item) => item.datasetChecksumSha256 && item.datasetSchemaVersion && item.datasetUploadedAt
  );
  const uniqueChecksums = new Set(
    comparison.items
      .map((item) => item.datasetChecksumSha256)
      .filter((checksum): checksum is string => Boolean(checksum))
  );
  const uniqueSchemas = new Set(
    comparison.items
      .map((item) => item.datasetSchemaVersion)
      .filter((schema): schema is string => Boolean(schema))
  );
  const mixedDatasetInputs = uniqueChecksums.size > 1 || uniqueSchemas.size > 1;

  const sortedItems = useMemo(() => {
    const baseline = comparison.items.find((item) => item.id === comparison.baselineBacktestId) ?? null;
    const remainingItems = comparison.items.filter((item) => item.id !== comparison.baselineBacktestId);

    remainingItems.sort((left, right) => {
      if (sortField === 'timestamp') {
        return compareValues(
          new Date(left.timestamp).getTime(),
          new Date(right.timestamp).getTime(),
          sortDirection
        );
      }

      return compareValues(left[sortField], right[sortField], sortDirection);
    });

    return baseline ? [baseline, ...remainingItems] : remainingItems;
  }, [comparison.baselineBacktestId, comparison.items, sortDirection, sortField]);

  const toggleSort = (field: ComparisonSortField) => {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    setSortDirection(field === 'timestamp' ? 'desc' : 'asc');
  };

  const exportCsv = () => {
    if (!hasCompleteProvenance) {
      return;
    }

    const rows = [
      [
        'runId',
        'strategyId',
        'datasetName',
        'datasetSchemaVersion',
        'datasetChecksumSha256',
        'datasetUploadedAt',
        'datasetArchived',
        'finalBalance',
        'finalBalanceDelta',
        'totalReturnPercent',
        'totalReturnDeltaPercent',
        'sharpeRatio',
        'profitFactor',
        'winRate',
        'maxDrawdown',
        'totalTrades',
      ].join(','),
      ...comparison.items.map((item) =>
        [
          item.id,
          item.strategyId,
          item.datasetName ?? '',
          item.datasetSchemaVersion ?? '',
          item.datasetChecksumSha256 ?? '',
          item.datasetUploadedAt ?? '',
          item.datasetArchived ?? '',
          item.finalBalance,
          item.finalBalanceDelta,
          item.totalReturnPercent,
          item.totalReturnDeltaPercent,
          item.sharpeRatio,
          item.profitFactor,
          item.winRate,
          item.maxDrawdown,
          item.totalTrades,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `backtest-comparison-${comparison.baselineBacktestId}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Backtest Comparison</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={exportCsv}
            disabled={!hasCompleteProvenance}
          >
            Export CSV
          </Button>
        </Stack>
        <Alert severity="info" sx={{ mb: 2 }}>
          Baseline run: #{comparison.baselineBacktestId}. Delta columns show change versus that baseline.
        </Alert>
        {mixedDatasetInputs ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Comparison spans multiple dataset inputs or schema versions. Treat delta conclusions as
            cross-input research, not like-for-like replay evidence.
          </Alert>
        ) : null}
        {!hasCompleteProvenance ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Comparison export is blocked until every selected run includes dataset checksum, schema
            version, and upload timestamp metadata.
          </Alert>
        ) : null}
        <BacktestComparisonCharts comparison={comparison} />
        <TableContainer>
          <Table size="small" sx={{ minWidth: 1180 }}>
            <TableHead>
              <TableRow>
                <TableCell>Run</TableCell>
                <TableCell>Strategy</TableCell>
                <TableCell>Dataset</TableCell>
                <TableCell>Dataset Proof</TableCell>
                {sortableColumns.map((column) => (
                  <TableCell key={column.field} align={column.align ?? 'left'}>
                    <TableSortLabel
                      active={sortField === column.field}
                      direction={sortDirection}
                      onClick={() => toggleSort(column.field)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedItems.map((item) => (
                <TableRow key={item.id} selected={item.id === comparison.baselineBacktestId}>
                  <TableCell>#{item.id}</TableCell>
                  <TableCell>{item.strategyId}</TableCell>
                  <TableCell>{item.datasetName ?? '-'}</TableCell>
                  <TableCell>
                    {item.datasetSchemaVersion && item.datasetChecksumSha256 ? (
                      <>
                        {item.datasetSchemaVersion}
                        <br />
                        {item.datasetChecksumSha256.slice(0, 12)}...
                      </>
                    ) : (
                      'Missing'
                    )}
                  </TableCell>
                  <ComparisonMetricCells item={item} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function ComparisonMetricCells({ item }: { item: BacktestComparisonItem }) {
  return (
    <>
      <TableCell>{formatDateTime(item.timestamp)}</TableCell>
      <TableCell align="right">{formatCurrency(item.finalBalance)}</TableCell>
      <TableCell align="right" sx={{ color: deltaColor(item.finalBalanceDelta) }}>
        {formatCurrency(item.finalBalanceDelta)}
      </TableCell>
      <TableCell align="right">{formatPercentage(item.totalReturnPercent, 2)}</TableCell>
      <TableCell align="right" sx={{ color: deltaColor(item.totalReturnDeltaPercent) }}>
        {formatPercentage(item.totalReturnDeltaPercent, 2)}
      </TableCell>
      <TableCell align="right">{formatNumber(item.sharpeRatio, 2)}</TableCell>
      <TableCell align="right">{formatNumber(item.profitFactor, 2)}</TableCell>
      <TableCell align="right">{formatPercentage(item.winRate, 2)}</TableCell>
      <TableCell align="right">{formatPercentage(item.maxDrawdown, 2)}</TableCell>
      <TableCell align="right">{formatNumber(item.totalTrades)}</TableCell>
    </>
  );
}
