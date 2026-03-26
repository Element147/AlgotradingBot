/**
 * SystemHealthIndicator Component
 *
 * Displays system health status including:
 * - Backend API/system info availability
 * - Database status from the system endpoint
 * - WebSocket connection status with reconnection attempts
 * - Last data update timestamp
 * - Circuit breaker state from the risk status endpoint
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
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

import {
  selectConnectionError,
  selectIsConnected,
  selectIsConnecting,
  selectLastEventTime,
  selectReconnectAttempts,
} from '../websocket/websocketSlice';

import { useGetRiskStatusQuery } from '@/features/risk/riskApi';
import { useGetSystemInfoQuery } from '@/features/settings/exchangeApi';
import { getApiErrorMessage } from '@/services/api';
import { formatDistanceToNow } from '@/utils/formatters';

type CircuitBreakerStatus = 'ACTIVE' | 'INACTIVE' | 'UNKNOWN' | 'CHECKING';

const renderDependencyChip = (status: string) => {
  const normalized = status.trim().toUpperCase();

  if (normalized === 'UP') {
    return <Chip icon={<CheckCircleIcon />} label={status} color="success" size="small" />;
  }

  if (normalized.startsWith('DOWN')) {
    return <Chip icon={<ErrorIcon />} label={status} color="error" size="small" />;
  }

  return <Chip icon={<WarningIcon />} label={status} color="default" size="small" />;
};

export const SystemHealthIndicator: React.FC = () => {
  const wsConnected = useSelector(selectIsConnected);
  const wsConnecting = useSelector(selectIsConnecting);
  const wsError = useSelector(selectConnectionError);
  const reconnectAttempts = useSelector(selectReconnectAttempts);
  const lastEventTime = useSelector(selectLastEventTime);

  const {
    data: systemInfo,
    isError: systemInfoError,
    isLoading: systemInfoLoading,
    error: systemInfoQueryError,
  } = useGetSystemInfoQuery(undefined, {
    pollingInterval: 60000,
    skipPollingIfUnfocused: true,
  });
  const {
    data: riskStatus,
    isError: riskStatusError,
    isLoading: riskStatusLoading,
    error: riskStatusQueryError,
  } = useGetRiskStatusQuery(undefined, {
    pollingInterval: 30000,
    skipPollingIfUnfocused: true,
  });

  const apiStatus = systemInfoLoading ? 'connecting' : systemInfoError ? 'disconnected' : 'connected';
  const wsStatus = wsConnected
    ? 'connected'
    : wsConnecting
      ? 'connecting'
      : wsError
        ? 'error'
        : 'disconnected';

  const lastUpdateText = lastEventTime ? formatDistanceToNow(new Date(lastEventTime)) : 'Never';

  const circuitBreakerStatus: CircuitBreakerStatus = riskStatusLoading
    ? 'CHECKING'
    : riskStatusError
      ? 'UNKNOWN'
      : riskStatus?.circuitBreakerActive
        ? 'ACTIVE'
        : 'INACTIVE';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          System Health
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                Backend API:
              </Typography>
              {apiStatus === 'connected' ? (
                <Tooltip title="System info endpoint is responding">
                  <Chip icon={<CheckCircleIcon />} label="Connected" color="success" size="small" />
                </Tooltip>
              ) : null}
              {apiStatus === 'connecting' ? (
                <Tooltip title="Connecting to backend API">
                  <Chip
                    icon={<CircularProgress size={16} />}
                    label="Connecting"
                    color="default"
                    size="small"
                  />
                </Tooltip>
              ) : null}
              {apiStatus === 'disconnected' ? (
                <Tooltip title={getApiErrorMessage(systemInfoQueryError, 'Backend API is disconnected')}>
                  <Chip icon={<ErrorIcon />} label="Disconnected" color="error" size="small" />
                </Tooltip>
              ) : null}
            </Stack>
          </Box>

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                Database:
              </Typography>
              {systemInfoLoading ? (
                <Chip icon={<CircularProgress size={16} />} label="Checking" color="default" size="small" />
              ) : systemInfo ? (
                <Tooltip title={`Database status: ${systemInfo.databaseStatus}`}>
                  {renderDependencyChip(systemInfo.databaseStatus)}
                </Tooltip>
              ) : (
                <Tooltip title={getApiErrorMessage(systemInfoQueryError, 'Database status is unavailable')}>
                  <Chip icon={<WarningIcon />} label="Unknown" color="default" size="small" />
                </Tooltip>
              )}
            </Stack>
          </Box>

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                WebSocket:
              </Typography>
              {wsStatus === 'connected' ? (
                <Tooltip title="WebSocket is connected">
                  <Chip icon={<WifiIcon />} label="Connected" color="success" size="small" />
                </Tooltip>
              ) : null}
              {wsStatus === 'connecting' ? (
                <Tooltip title="Connecting to WebSocket">
                  <Chip
                    icon={<CircularProgress size={16} />}
                    label="Connecting"
                    color="default"
                    size="small"
                  />
                </Tooltip>
              ) : null}
              {wsStatus === 'disconnected' ? (
                <Tooltip title="WebSocket is disconnected">
                  <Chip icon={<WifiOffIcon />} label="Disconnected" color="default" size="small" />
                </Tooltip>
              ) : null}
              {wsStatus === 'error' ? (
                <Tooltip title={`WebSocket error: ${wsError || 'Unknown error'}`}>
                  <Chip icon={<ErrorIcon />} label="Error" color="error" size="small" />
                </Tooltip>
              ) : null}
            </Stack>

            {reconnectAttempts > 0 ? (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 15, display: 'block' }}>
                Reconnection attempts: {reconnectAttempts}
              </Typography>
            ) : null}
          </Box>

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                Last Update:
              </Typography>
              <Tooltip title={lastEventTime ? new Date(lastEventTime).toLocaleString() : 'No updates received'}>
                <Chip icon={<UpdateIcon />} label={lastUpdateText} size="small" variant="outlined" />
              </Tooltip>
            </Stack>
          </Box>

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                Circuit Breaker:
              </Typography>
              {circuitBreakerStatus === 'ACTIVE' ? (
                <Tooltip title={riskStatus?.circuitBreakerReason || 'Circuit breaker is active - trading is paused'}>
                  <Chip icon={<WarningIcon />} label="Active" color="error" size="small" />
                </Tooltip>
              ) : null}
              {circuitBreakerStatus === 'INACTIVE' ? (
                <Tooltip title={riskStatus?.circuitBreakerReason || 'Circuit breaker is inactive - trading is normal'}>
                  <Chip icon={<ShieldIcon />} label="Inactive" color="success" size="small" />
                </Tooltip>
              ) : null}
              {circuitBreakerStatus === 'CHECKING' ? (
                <Tooltip title="Checking circuit breaker status">
                  <Chip
                    icon={<CircularProgress size={16} />}
                    label="Checking"
                    color="default"
                    size="small"
                  />
                </Tooltip>
              ) : null}
              {circuitBreakerStatus === 'UNKNOWN' ? (
                <Tooltip title={getApiErrorMessage(riskStatusQueryError, 'Circuit breaker status is unknown')}>
                  <Chip icon={<WarningIcon />} label="Unknown" color="default" size="small" />
                </Tooltip>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
