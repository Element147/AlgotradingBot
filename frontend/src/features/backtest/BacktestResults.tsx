import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useMemo, useRef } from 'react';

import type { BacktestDetails } from './backtestApi';
import {
  createDrawdownCurve,
  createEquityCurve,
  createMonthlyReturns,
  createTradeDistribution,
} from './backtestVisualization';
import { MonthlyReturnsHeatmap } from './MonthlyReturnsHeatmap';
import { TradeDistributionHistogram } from './TradeDistributionHistogram';

import { DrawdownChart } from '@/components/charts/DrawdownChart';
import { EquityCurve } from '@/components/charts/EquityCurve';
import { formatCurrency, formatDateTime, formatNumber, formatPercentage } from '@/utils/formatters';

interface BacktestResultsProps {
  details: BacktestDetails;
}

const validationColor = (status: BacktestDetails['validationStatus']) => {
  if (status === 'PASSED' || status === 'PRODUCTION_READY') {
    return 'success.main';
  }
  if (status === 'FAILED') {
    return 'error.main';
  }
  return 'warning.main';
};

const metricDefinitions: Array<{ key: string; label: string; description: string }> = [
  {
    key: 'sharpe',
    label: 'Sharpe Ratio',
    description: 'Risk-adjusted return. Higher means more return per unit of volatility.',
  },
  {
    key: 'profitFactor',
    label: 'Profit Factor',
    description: 'Gross profits divided by gross losses. Values above 1 suggest positive expectancy.',
  },
  {
    key: 'winRate',
    label: 'Win Rate',
    description: 'Percentage of trades closed as winners. Use with profit factor, not alone.',
  },
  {
    key: 'maxDrawdown',
    label: 'Max Drawdown',
    description: 'Largest peak-to-trough decline. Lower values imply smoother equity behavior.',
  },
  {
    key: 'totalTrades',
    label: 'Total Trades',
    description: 'Trade sample size. Larger samples generally improve confidence in conclusions.',
  },
  {
    key: 'initialBalance',
    label: 'Initial Balance',
    description: 'Starting capital used by the simulation assumptions.',
  },
  {
    key: 'finalBalance',
    label: 'Final Balance',
    description: 'Ending account value after all simulated trades and costs.',
  },
  {
    key: 'validation',
    label: 'Validation',
    description: 'Quality gate summary from platform checks. Treat as research signal, not guarantee.',
  },
];

export function BacktestResults({ details }: BacktestResultsProps) {
  const exportRef = useRef<HTMLDivElement | null>(null);
  const equityCurve = useMemo(() => createEquityCurve(details), [details]);
  const drawdownCurve = useMemo(() => createDrawdownCurve(equityCurve), [equityCurve]);
  const monthlyReturns = useMemo(() => createMonthlyReturns(equityCurve), [equityCurve]);
  const tradeDistribution = useMemo(() => createTradeDistribution(details), [details]);
  const metricValues = [
    details.sharpeRatio.toFixed(2),
    details.profitFactor.toFixed(2),
    `${details.winRate.toFixed(2)}%`,
    `${details.maxDrawdown.toFixed(2)}%`,
    details.totalTrades,
    details.initialBalance.toFixed(2),
    details.finalBalance.toFixed(2),
    details.validationStatus,
  ];

  const exportPdf = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(14);
    doc.text(`Backtest ${details.id}`, 10, 12);
    doc.setFontSize(11);
    doc.text(`Algorithm: ${details.strategyId}`, 10, 20);
    doc.text(`Validation: ${details.validationStatus}`, 10, 26);
    doc.text(`Sharpe: ${details.sharpeRatio.toFixed(2)}`, 10, 32);
    doc.text(`Profit Factor: ${details.profitFactor.toFixed(2)}`, 10, 38);
    doc.text(`Win Rate: ${details.winRate.toFixed(2)}%`, 10, 44);

    if (exportRef.current) {
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 1.3, cacheBust: true });
      doc.addImage(dataUrl, 'PNG', 10, 52, 190, 120);
    }

    doc.save(`backtest_${details.id}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Box>
      <Card sx={{ mt: 2, mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h6">Backtest Details #{details.id}</Typography>
              <Typography variant="body2" color="text.secondary">
                Algorithm: {details.strategyId} | Dataset: {details.datasetName ?? '-'} | Market: {details.symbol} (
                {details.timeframe})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Equity points: {details.equityCurve.length} | Recorded trades: {details.tradeSeries.length}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={`Validation: ${details.validationStatus}`}
                sx={{ color: validationColor(details.validationStatus) }}
              />
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => void exportPdf()}>
                Export PDF
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            {metricDefinitions.map((metric, index) => (
              <Grid key={metric.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {metric.label}
                      </Typography>
                      <Tooltip title={metric.description} arrow>
                        <InfoOutlinedIcon fontSize="inherit" color="action" sx={{ cursor: 'help' }} />
                      </Tooltip>
                    </Stack>
                    <Typography
                      variant="body1"
                      sx={metric.key === 'validation' ? { color: validationColor(details.validationStatus) } : undefined}
                    >
                      {metricValues[index]}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Box ref={exportRef}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <EquityCurve points={equityCurve} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DrawdownChart points={drawdownCurve} maxDrawdownLimitPct={25} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MonthlyReturnsHeatmap data={monthlyReturns} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TradeDistributionHistogram bins={tradeDistribution} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recorded Trade Series
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Entry</TableCell>
                      <TableCell>Exit</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Entry Price</TableCell>
                      <TableCell align="right">Exit Price</TableCell>
                      <TableCell align="right">Entry Value</TableCell>
                      <TableCell align="right">Exit Value</TableCell>
                      <TableCell align="right">Return</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.tradeSeries.map((trade, index) => (
                      <TableRow key={`${trade.symbol}-${trade.entryTime}-${index}`}>
                        <TableCell>{trade.symbol}</TableCell>
                        <TableCell>{formatDateTime(trade.entryTime)}</TableCell>
                        <TableCell>{formatDateTime(trade.exitTime)}</TableCell>
                        <TableCell align="right">{formatNumber(trade.quantity, 4)}</TableCell>
                        <TableCell align="right">{formatCurrency(trade.entryPrice, 2)}</TableCell>
                        <TableCell align="right">{formatCurrency(trade.exitPrice, 2)}</TableCell>
                        <TableCell align="right">{formatCurrency(trade.entryValue, 2)}</TableCell>
                        <TableCell align="right">{formatCurrency(trade.exitValue, 2)}</TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: trade.returnPct >= 0 ? 'success.main' : 'error.main' }}
                        >
                          {formatPercentage(trade.returnPct, 2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
