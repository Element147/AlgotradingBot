import DownloadIcon from '@mui/icons-material/Download';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useMemo, useRef } from 'react';

import type { BacktestDetails } from './backtestApi';
import {
  createDrawdownCurve,
  createMonteCarloProjection,
  createMonthlyReturns,
  createSyntheticEquityCurve,
  createTradeDistribution,
  createWalkForwardProjection,
} from './backtestVisualization';
import { MonthlyReturnsHeatmap } from './MonthlyReturnsHeatmap';
import { TradeDistributionHistogram } from './TradeDistributionHistogram';

import { DrawdownChart } from '@/components/charts/DrawdownChart';
import { EquityCurve } from '@/components/charts/EquityCurve';

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

export function BacktestResults({ details }: BacktestResultsProps) {
  const exportRef = useRef<HTMLDivElement | null>(null);
  const equityCurve = useMemo(() => createSyntheticEquityCurve(details), [details]);
  const drawdownCurve = useMemo(() => createDrawdownCurve(equityCurve), [equityCurve]);
  const monthlyReturns = useMemo(() => createMonthlyReturns(equityCurve), [equityCurve]);
  const tradeDistribution = useMemo(() => createTradeDistribution(details), [details]);
  const monteCarlo = useMemo(() => createMonteCarloProjection(details), [details]);
  const walkForward = useMemo(() => createWalkForwardProjection(details), [details]);

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
            </Box>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => void exportPdf()}>
              Export PDF
            </Button>
          </Stack>

          <Grid container spacing={1} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2">Sharpe: {details.sharpeRatio.toFixed(2)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2">Profit Factor: {details.profitFactor.toFixed(2)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2">Win Rate: {details.winRate.toFixed(2)}%</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2">Max DD: {details.maxDrawdown.toFixed(2)}%</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2">Trades: {details.totalTrades}</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2">Start Balance: {details.initialBalance.toFixed(2)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2">Final Balance: {details.finalBalance.toFixed(2)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" sx={{ color: validationColor(details.validationStatus) }}>
                Validation: {details.validationStatus}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box ref={exportRef}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, xl: 6 }}>
            <EquityCurve points={equityCurve} />
          </Grid>
          <Grid size={{ xs: 12, xl: 6 }}>
            <DrawdownChart points={drawdownCurve} maxDrawdownLimitPct={25} />
          </Grid>
          <Grid size={{ xs: 12, xl: 6 }}>
            <MonthlyReturnsHeatmap data={monthlyReturns} />
          </Grid>
          <Grid size={{ xs: 12, xl: 6 }}>
            <TradeDistributionHistogram bins={tradeDistribution} />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Alert severity="info">
            Monte Carlo 95% interval: {monteCarlo.confidence95Floor.toFixed(2)} -{' '}
            {monteCarlo.confidence95Ceiling.toFixed(2)}. Worst-case projection:{' '}
            {monteCarlo.worstCase.toFixed(2)}.
          </Alert>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Alert severity="warning">
            Walk-forward: in-sample PF {walkForward.inSampleProfitFactor.toFixed(2)}, out-of-sample PF{' '}
            {walkForward.outOfSampleProfitFactor.toFixed(2)} ({walkForward.degradationPct.toFixed(1)}%
            degradation).
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}
