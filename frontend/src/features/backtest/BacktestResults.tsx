import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
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
import { useMemo, useRef, useState } from 'react';

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
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const equityCurve = useMemo(() => createEquityCurve(details), [details]);
  const drawdownCurve = useMemo(() => createDrawdownCurve(equityCurve), [equityCurve]);
  const monthlyReturns = useMemo(() => createMonthlyReturns(equityCurve), [equityCurve]);
  const tradeDistribution = useMemo(() => createTradeDistribution(details), [details]);
  const hasCompleteProvenance = Boolean(
    details.datasetId &&
      details.datasetChecksumSha256 &&
      details.datasetSchemaVersion &&
      details.datasetUploadedAt
  );
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
    if (!hasCompleteProvenance) {
      setExportFeedback('Report export is blocked until dataset checksum, schema version, and upload timestamp are available.');
      return;
    }

    setExportFeedback(null);
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(14);
    doc.text(`Backtest ${details.id}`, 10, 12);
    doc.setFontSize(11);
    doc.text(`Experiment: ${details.experimentName}`, 10, 20);
    doc.text(`Algorithm: ${details.strategyId}`, 10, 26);
    doc.text(`Dataset: ${details.datasetName ?? '-'} (#${details.datasetId ?? 'n/a'})`, 10, 32);
    doc.text(`Schema: ${details.datasetSchemaVersion}`, 10, 38);
    doc.text(`Checksum: ${details.datasetChecksumSha256}`, 10, 44);
    doc.text(`Uploaded: ${formatDateTime(details.datasetUploadedAt ?? '')}`, 10, 50);
    doc.text(`Validation: ${details.validationStatus}`, 10, 56);
    doc.text(`Fees/Slippage: ${details.feesBps} bps / ${details.slippageBps} bps`, 10, 62);
    doc.text(`Sharpe: ${details.sharpeRatio.toFixed(2)} | Profit Factor: ${details.profitFactor.toFixed(2)}`, 10, 68);
    doc.text(`Win Rate: ${details.winRate.toFixed(2)}% | Max DD: ${details.maxDrawdown.toFixed(2)}%`, 10, 74);

    if (exportRef.current) {
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 1.3, cacheBust: true });
      doc.addImage(dataUrl, 'PNG', 10, 82, 190, 114);
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
                Experiment: {details.experimentName} | Algorithm: {details.strategyId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dataset: {details.datasetName ?? '-'} | Market: {details.symbol} ({details.timeframe})
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
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => void exportPdf()}
                disabled={!hasCompleteProvenance}
              >
                Export PDF
              </Button>
            </Stack>
          </Stack>

          {exportFeedback ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {exportFeedback}
            </Alert>
          ) : null}

          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" gutterBottom>
                Reproducibility Metadata
              </Typography>
              {hasCompleteProvenance ? (
                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Dataset #{details.datasetId} | {details.datasetName ?? '-'} | Schema {details.datasetSchemaVersion}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Experiment key: {details.experimentKey}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Checksum: {details.datasetChecksumSha256}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded: {formatDateTime(details.datasetUploadedAt ?? '')}
                    {details.datasetArchived ? ' | Archived from active catalog' : ' | Active in dataset catalog'}
                  </Typography>
                </Stack>
              ) : (
                <Alert severity="warning">
                  This run is missing full dataset provenance. Charts remain visible, but report export is intentionally blocked.
                </Alert>
              )}
            </CardContent>
          </Card>

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
