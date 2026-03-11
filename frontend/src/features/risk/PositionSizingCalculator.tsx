import { Alert, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { calculatePositionSizing } from './positionSizing';

export function PositionSizingCalculator() {
  const [accountBalance, setAccountBalance] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('2');
  const [stopLossDistancePercent, setStopLossDistancePercent] = useState('1.5');

  const result = useMemo(
    () =>
      calculatePositionSizing({
        accountBalance: Number(accountBalance),
        riskPercent: Number(riskPercent),
        stopLossDistancePercent: Number(stopLossDistancePercent),
      }),
    [accountBalance, riskPercent, stopLossDistancePercent]
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Position Sizing Calculator
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Account Balance"
            type="number"
            value={accountBalance}
            onChange={(event) => setAccountBalance(event.target.value)}
          />
          <TextField
            label="Risk % per Trade"
            type="number"
            value={riskPercent}
            onChange={(event) => setRiskPercent(event.target.value)}
            helperText="Must stay between 0.1% and 5%"
          />
          <TextField
            label="Stop-loss Distance %"
            type="number"
            value={stopLossDistancePercent}
            onChange={(event) => setStopLossDistancePercent(event.target.value)}
          />

          {result.valid ? (
            <Alert severity="success">
              Position size: {result.units.toFixed(8)} units (~${result.notional.toFixed(2)} notional)
            </Alert>
          ) : (
            <Alert severity="error">{result.error}</Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
