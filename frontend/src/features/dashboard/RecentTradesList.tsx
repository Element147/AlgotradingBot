import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import React from 'react';

import { useGetRecentTradesQuery } from '@/features/account/accountApi';
import { getApiErrorMessage } from '@/services/api';
import { formatCurrency, formatPercentage, formatDateTime } from '@/utils/formatters';

/**
 * RecentTradesList Component
 * 
 * Displays the last 10 completed trades with real-time updates.
 * 
 * Features:
 * - Shows symbol, entry/exit prices, P&L, and timestamp
 * - Color-coded P&L (green for profit, red for loss)
 * - Real-time updates via WebSocket events
 * - Environment-aware (test/live mode)
 * - Loading and error states
 * 
 * Requirements: 2.13
 */
export const RecentTradesList: React.FC = () => {
  const { data: trades, isLoading, error } = useGetRecentTradesQuery(10);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Trades
          </Typography>
          <Box display="flex" justifyContent="center" py={3}>
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
          <Typography variant="h6" gutterBottom>
            Recent Trades
          </Typography>
          <Alert severity="error">{getApiErrorMessage(error, 'Failed to load trades. Please try again.')}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Recent Trades
          </Typography>
          <Chip 
            label={`Last ${trades?.length || 0}`}
            size="small"
            color="primary"
          />
        </Box>

        {!trades || trades.length === 0 ? (
          <Box py={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              No recent trades
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Side</TableCell>
                  <TableCell align="right">Entry</TableCell>
                  <TableCell align="right">Exit</TableCell>
                  <TableCell align="right">P&L</TableCell>
                  <TableCell align="right">Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trades.map((trade) => {
                  const pnlValue = parseFloat(trade.profitLoss);
                  const pnlColor = pnlValue >= 0 ? 'success.main' : 'error.main';
                  const pnlSign = pnlValue >= 0 ? '+' : '';

                  return (
                    <TableRow key={trade.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {trade.symbol}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {trade.strategyName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={trade.side}
                          size="small"
                          color={trade.side === 'LONG' ? 'success' : 'warning'}
                          sx={{ minWidth: 60 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(trade.entryPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(trade.exitPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color={pnlColor} fontWeight="medium">
                          {pnlSign}{formatCurrency(trade.profitLoss)}
                        </Typography>
                        <Typography variant="caption" color={pnlColor}>
                          ({pnlSign}{formatPercentage(trade.profitLossPercentage)})
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(trade.exitTime)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};
