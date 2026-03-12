import { Alert, Card, CardContent, Stack, Typography } from '@mui/material';

import { useGetPaperTradingStateQuery } from '@/features/paperApi';

export const PaperTradingCard: React.FC = () => {
  const { data, isLoading, isError } = useGetPaperTradingStateQuery();
  const recoverySeverity =
    data?.recoveryStatus === 'ATTENTION'
      ? 'warning'
      : data?.recoveryStatus === 'HEALTHY'
        ? 'success'
        : 'info';

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Paper Trading
        </Typography>

        {isLoading ? <Typography variant="body2">Loading paper state...</Typography> : null}
        {isError ? <Alert severity="error">Unable to load paper-trading state.</Alert> : null}

        {data ? (
          <Stack spacing={0.5}>
            <Alert severity={data.paperMode ? 'success' : 'warning'}>
              {data.paperMode ? 'Paper mode active' : 'Paper mode inactive'}
            </Alert>
            <Alert severity={recoverySeverity}>{data.recoveryMessage}</Alert>
            <Typography variant="body2">{data.incidentSummary}</Typography>
            <Typography variant="body2">Cash Balance: {data.cashBalance.toFixed(2)}</Typography>
            <Typography variant="body2">Open Positions: {data.positionCount}</Typography>
            <Typography variant="body2">Orders: {data.totalOrders} total / {data.openOrders} open / {data.filledOrders} filled</Typography>
            <Typography variant="body2">
              Recovery status: {data.recoveryStatus} | Stale open orders: {data.staleOpenOrderCount} | Stale positions:{' '}
              {data.stalePositionCount}
            </Typography>
            {data.alerts.map((alert) => (
              <Alert
                key={alert.code}
                severity={alert.severity === 'WARNING' ? 'warning' : 'info'}
                sx={{ mt: 0.5 }}
              >
                {alert.summary} {alert.recommendedAction}
              </Alert>
            ))}
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
};
