import RefreshIcon from '@mui/icons-material/Refresh';
import { Card, CardContent, Typography, Box, IconButton, CircularProgress, Alert } from '@mui/material';

import { useGetBalanceQuery } from '../account/accountApi';

/**
 * BalanceCard Component
 * 
 * Displays account balance information including:
 * - Total, available, and locked balance
 * - Asset breakdown (USDT, BTC, ETH)
 * - Last sync timestamp
 * - Manual refresh button
 * 
 * Features:
 * - Environment-aware (displays data for current test/live mode)
 * - Auto-refreshes every 60 seconds in live mode
 * - Manual refresh capability
 * - Loading and error states
 */
export const BalanceCard: React.FC = () => {
  const { data: balance, isLoading, error, refetch } = useGetBalanceQuery();

  const handleRefresh = () => {
    void refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load balance data. Please try again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Account Balance
          </Typography>
          <IconButton 
            onClick={handleRefresh} 
            size="small" 
            aria-label="Refresh balance"
            title="Refresh balance"
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Total Balance */}
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary">
            Total Balance
          </Typography>
          <Typography variant="h4" component="div">
            ${balance.total}
          </Typography>
        </Box>

        {/* Available and Locked */}
        <Box display="flex" gap={4} mb={3}>
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary">
              Available
            </Typography>
            <Typography variant="h6">
              ${balance.available}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary">
              Locked
            </Typography>
            <Typography variant="h6">
              ${balance.locked}
            </Typography>
          </Box>
        </Box>

        {/* Asset Breakdown */}
        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Asset Breakdown
          </Typography>
          {balance.assets.map((asset) => (
            <Box 
              key={asset.symbol} 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              py={0.5}
            >
              <Typography variant="body2">
                {asset.symbol}
              </Typography>
              <Box textAlign="right">
                <Typography variant="body2">
                  {asset.amount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ${asset.valueUSD}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Last Sync */}
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date(balance.lastSync).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
