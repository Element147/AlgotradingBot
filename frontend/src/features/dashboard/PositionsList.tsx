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

import { useGetOpenPositionsQuery } from '@/features/account/accountApi';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

/**
 * PositionsList Component
 * 
 * Displays all currently open positions with real-time updates.
 * 
 * Features:
 * - Shows entry price, current price, and unrealized P&L
 * - Color-coded P&L (green for profit, red for loss)
 * - Real-time updates via WebSocket events
 * - Environment-aware (test/live mode)
 * - Loading and error states
 * 
 * Requirements: 2.12
 */
export const PositionsList: React.FC = () => {
  const { data: positions, isLoading, error } = useGetOpenPositionsQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Open Positions
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
            Open Positions
          </Typography>
          <Alert severity="error">
            Failed to load positions. Please try again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Open Positions
          </Typography>
          <Chip 
            label={`${positions?.length || 0} Position${positions?.length !== 1 ? 's' : ''}`}
            size="small"
            color="primary"
          />
        </Box>

        {!positions || positions.length === 0 ? (
          <Box py={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              No open positions
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Side</TableCell>
                  <TableCell align="right">Entry Price</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unrealized P&L</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {positions.map((position) => {
                  const pnlValue = parseFloat(position.unrealizedPnL);
                  const pnlColor = pnlValue >= 0 ? 'success.main' : 'error.main';
                  const pnlSign = pnlValue >= 0 ? '+' : '';

                  return (
                    <TableRow key={position.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {position.symbol}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {position.strategyName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={position.side}
                          size="small"
                          color={position.side === 'BUY' ? 'success' : 'error'}
                          sx={{ minWidth: 60 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(position.entryPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(position.currentPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {position.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color={pnlColor} fontWeight="medium">
                          {pnlSign}{formatCurrency(position.unrealizedPnL)}
                        </Typography>
                        <Typography variant="caption" color={pnlColor}>
                          ({pnlSign}{formatPercentage(position.unrealizedPnLPercentage)})
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
