import DownloadIcon from '@mui/icons-material/Download';
import { Alert, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import type { BacktestComparisonResponse } from './backtestApi';

import { formatCurrency, formatDateTime, formatNumber, formatPercentage } from '@/utils/formatters';

interface BacktestComparisonPanelProps {
  comparison: BacktestComparisonResponse;
}

const deltaColor = (value: number): 'success.main' | 'error.main' | 'text.primary' => {
  if (value > 0) {
    return 'success.main';
  }
  if (value < 0) {
    return 'error.main';
  }
  return 'text.primary';
};

export function BacktestComparisonPanel({ comparison }: BacktestComparisonPanelProps) {
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
            Comparison spans multiple dataset inputs or schema versions. Treat delta conclusions as cross-input research, not like-for-like replay evidence.
          </Alert>
        ) : null}
        {!hasCompleteProvenance ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Comparison export is blocked until every selected run includes dataset checksum, schema version, and upload timestamp metadata.
          </Alert>
        ) : null}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Run</TableCell>
              <TableCell>Strategy</TableCell>
              <TableCell>Dataset</TableCell>
              <TableCell>Dataset Proof</TableCell>
              <TableCell>Finished</TableCell>
              <TableCell align="right">Final Balance</TableCell>
              <TableCell align="right">Balance Delta</TableCell>
              <TableCell align="right">Return</TableCell>
              <TableCell align="right">Return Delta</TableCell>
              <TableCell align="right">Sharpe</TableCell>
              <TableCell align="right">Profit Factor</TableCell>
              <TableCell align="right">Win Rate</TableCell>
              <TableCell align="right">Max DD</TableCell>
              <TableCell align="right">Trades</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparison.items.map((item) => (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
