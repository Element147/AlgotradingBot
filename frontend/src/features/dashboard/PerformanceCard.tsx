import { Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton, CircularProgress, Alert } from '@mui/material';
import { useState } from 'react';
import { useGetPerformanceQuery, type PerformanceTimeframe } from '../account/accountApi';

/**
 * PerformanceCard Component
 * 
 * Displays performance metrics including:
 * - Total profit/loss (color-coded: green for profit, red for loss)
 * - Profit/loss percentage
 * - Win rate
 * - Trade count
 * - Cash to invested capital ratio
 * 
 * Features:
 * - Timeframe selection (today, week, month, all-time)
 * - Environment-aware (displays data for current test/live mode)
 * - Color-coded profit/loss values
 * - Loading and error states
 */
export const PerformanceCard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<PerformanceTimeframe>('today');
  const { data: performance, isLoading, error } = useGetPerformanceQuery(timeframe);

  const handleTimeframeChange = (_: React.MouseEvent<HTMLElement>, newTimeframe: PerformanceTimeframe | null) => {
    if (newTimeframe !== null) {
      setTimeframe(newTimeframe);
    }
  };

  // Determine if profit or loss for color coding
  const isProfitable = performance && parseFloat(performance.totalProfitLoss) >= 0;
  const profitColor = isProfitable ? 'success.main' : 'error.main';

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
            Failed to load performance data. Please try again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!performance) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Performance
          </Typography>
        </Box>

        {/* Timeframe Selection */}
        <Box mb={3}>
          <ToggleButtonGroup
            value={timeframe}
            exclusive
            onChange={handleTimeframeChange}
            size="small"
            fullWidth
            aria-label="Performance timeframe"
          >
            <ToggleButton value="today" aria-label="Today">
              Today
            </ToggleButton>
            <ToggleButton value="week" aria-label="This week">
              Week
            </ToggleButton>
            <ToggleButton value="month" aria-label="This month">
              Month
            </ToggleButton>
            <ToggleButton value="all" aria-label="All time">
              All
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Total Profit/Loss */}
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary">
            Total Profit/Loss
          </Typography>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ color: profitColor }}
          >
            ${performance.totalProfitLoss}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ color: profitColor }}
          >
            {isProfitable ? '+' : ''}{performance.profitLossPercentage}%
          </Typography>
        </Box>

        {/* Metrics Grid */}
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Win Rate
            </Typography>
            <Typography variant="h6">
              {performance.winRate}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Trade Count
            </Typography>
            <Typography variant="h6">
              {performance.tradeCount}
            </Typography>
          </Box>
          <Box gridColumn="span 2">
            <Typography variant="body2" color="text.secondary">
              Cash to Invested Capital Ratio
            </Typography>
            <Typography variant="h6">
              {performance.cashRatio}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
