import { Box, Typography } from '@mui/material';

/**
 * BacktestPage - Backtest results and execution interface
 * 
 * This is a placeholder component that will be fully implemented in Phase 5
 * with backtest results list, detailed metrics, charts, and execution controls.
 */
export default function BacktestPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Backtest Results
      </Typography>
      <Typography variant="body1" color="text.secondary">
        View historical backtest results and run new backtests to validate trading strategies.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Implementation coming in Phase 5
      </Typography>
    </Box>
  );
}
