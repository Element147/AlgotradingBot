import { Box, Typography } from '@mui/material';

/**
 * StrategiesPage - Strategy management interface
 * 
 * This is a placeholder component that will be fully implemented in Phase 3
 * with strategy list, start/stop controls, and configuration modals.
 */
export default function StrategiesPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Strategies
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage your trading strategies here. Start, stop, and configure automated trading algorithms.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Implementation coming in Phase 3
      </Typography>
    </Box>
  );
}
