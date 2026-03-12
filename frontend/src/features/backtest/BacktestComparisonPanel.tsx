import { Alert, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

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
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Backtest Comparison
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Baseline run: #{comparison.baselineBacktestId}. Delta columns show change versus that baseline.
        </Alert>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Run</TableCell>
              <TableCell>Strategy</TableCell>
              <TableCell>Dataset</TableCell>
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
