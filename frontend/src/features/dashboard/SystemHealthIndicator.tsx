/**
 * SystemHealthIndicator Component
 * 
 * Displays system health status including:
 * - Backend API connection status
 * - WebSocket connection status with reconnection attempts
 * - Last data update timestamp
 * - Circuit breaker status
 * 
 * Requirements: 2.14, 2.15, 2.16
 */

import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Shield as ShieldIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

import { useGetBalanceQuery } from '../account/accountApi';
import {
  selectIsConnected,
  selectIsConnecting,
  selectConnectionError,
  selectReconnectAttempts,
  selectLastEventTime,
} from '../websocket/websocketSlice';

import { formatDistanceToNow } from '@/utils/formatters';

/**
 * Circuit breaker status type
 * TODO: This will be fetched from backend API in future implementation
 */
type CircuitBreakerStatus = 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';

export const SystemHealthIndicator: React.FC = () => {
  // WebSocket connection state
  const wsConnected = useSelector(selectIsConnected);
  const wsConnecting = useSelector(selectIsConnecting);
  const wsError = useSelector(selectConnectionError);
  const reconnectAttempts = useSelector(selectReconnectAttempts);
  const lastEventTime = useSelector(selectLastEventTime);

  // Backend API connection state (using balance query as health check)
  const { isError: apiError, isLoading: apiLoading } = useGetBalanceQuery(undefined, {
    pollingInterval: 60000, // Poll every 60 seconds
  });

  // Circuit breaker status (placeholder - will be implemented with backend endpoint)
  const circuitBreakerStatus: CircuitBreakerStatus = 'INACTIVE' as CircuitBreakerStatus;

  // Determine API connection status
  const apiConnected = !apiError && !apiLoading;
  const apiStatus = apiConnected ? 'connected' : apiError ? 'disconnected' : 'connecting';

  // Determine WebSocket connection status
  const wsStatus = wsConnected
    ? 'connected'
    : wsConnecting
    ? 'connecting'
    : wsError
    ? 'error'
    : 'disconnected';

  // Format last update time
  const lastUpdateText = lastEventTime
    ? formatDistanceToNow(new Date(lastEventTime))
    : 'Never';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          System Health
        </Typography>

        <Stack spacing={2}>
          {/* Backend API Connection Status */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                Backend API:
              </Typography>
              {apiStatus === 'connected' && (
                <Tooltip title="Backend API is connected">
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Connected"
                    color="success"
                    size="small"
                  />
                </Tooltip>
              )}
              {apiStatus === 'connecting' && (
                <Tooltip title="Connecting to backend API">
                  <Chip
                    icon={<CircularProgress size={16} />}
                    label="Connecting"
                    color="default"
                    size="small"
                  />
                </Tooltip>
              )}
              {apiStatus === 'disconnected' && (
                <Tooltip title="Backend API is disconnected">
                  <Chip
                    icon={<ErrorIcon />}
                    label="Disconnected"
                    color="error"
                    size="small"
                  />
                </Tooltip>
              )}
            </Stack>
          </Box>

          {/* WebSocket Connection Status */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                WebSocket:
              </Typography>
              {wsStatus === 'connected' && (
                <Tooltip title="WebSocket is connected">
                  <Chip
                    icon={<WifiIcon />}
                    label="Connected"
                    color="success"
                    size="small"
                  />
                </Tooltip>
              )}
              {wsStatus === 'connecting' && (
                <Tooltip title="Connecting to WebSocket">
                  <Chip
                    icon={<CircularProgress size={16} />}
                    label="Connecting"
                    color="default"
                    size="small"
                  />
                </Tooltip>
              )}
              {wsStatus === 'disconnected' && (
                <Tooltip title="WebSocket is disconnected">
                  <Chip
                    icon={<WifiOffIcon />}
                    label="Disconnected"
                    color="default"
                    size="small"
                  />
                </Tooltip>
              )}
              {wsStatus === 'error' && (
                <Tooltip title={`WebSocket error: ${wsError || 'Unknown error'}`}>
                  <Chip
                    icon={<ErrorIcon />}
                    label="Error"
                    color="error"
                    size="small"
                  />
                </Tooltip>
              )}
            </Stack>

            {/* Show reconnection attempts if any */}
            {reconnectAttempts > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 15, display: 'block' }}>
                Reconnection attempts: {reconnectAttempts}
              </Typography>
            )}
          </Box>

          {/* Last Data Update */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                Last Update:
              </Typography>
              <Tooltip title={lastEventTime ? new Date(lastEventTime).toLocaleString() : 'No updates received'}>
                <Chip
                  icon={<UpdateIcon />}
                  label={lastUpdateText}
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
            </Stack>
          </Box>

          {/* Circuit Breaker Status */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                Circuit Breaker:
              </Typography>
              {circuitBreakerStatus === 'ACTIVE' && (
                <Tooltip title="Circuit breaker is active - trading is paused">
                  <Chip
                    icon={<WarningIcon />}
                    label="Active"
                    color="error"
                    size="small"
                  />
                </Tooltip>
              )}
              {circuitBreakerStatus === 'INACTIVE' && (
                <Tooltip title="Circuit breaker is inactive - trading is normal">
                  <Chip
                    icon={<ShieldIcon />}
                    label="Inactive"
                    color="success"
                    size="small"
                  />
                </Tooltip>
              )}
              {circuitBreakerStatus === 'UNKNOWN' && (
                <Tooltip title="Circuit breaker status is unknown">
                  <Chip
                    icon={<WarningIcon />}
                    label="Unknown"
                    color="default"
                    size="small"
                  />
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
