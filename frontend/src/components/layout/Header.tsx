import {
  Logout as LogoutIcon,
  Menu as MenuIcon,
  NotificationsOutlined as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  logout,
  selectIsAuthenticated,
  selectUser,
} from '../../features/auth/authSlice';
import { selectEnvironmentMode } from '../../features/environment/environmentSlice';
import { useGetRiskStatusQuery } from '../../features/risk/riskApi';
import { useGetSavedExchangeConnectionsQuery } from '../../features/settings/exchangeApi';
import {
  selectIsConnected,
  selectSubscribedChannels,
} from '../../features/websocket/websocketSlice';
import ThemeToggle from '../ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
}

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Start here for mode, health, paper activity, and current operator signals.',
  },
  '/paper': {
    title: 'Paper Trading',
    subtitle: 'Place and review simulated orders without implying live routing.',
  },
  '/strategies': {
    title: 'Strategies',
    subtitle: 'Review templates, readiness, and paper-safe configuration changes.',
  },
  '/trades': {
    title: 'Trades',
    subtitle: 'Audit fills, outcomes, and exports without losing operational context.',
  },
  '/backtest': {
    title: 'Backtest',
    subtitle: 'Launch research runs, review progress, and inspect results with provenance.',
  },
  '/market-data': {
    title: 'Market Data',
    subtitle: 'Create import jobs, watch retries, and move datasets into research workflows.',
  },
  '/risk': {
    title: 'Risk',
    subtitle: 'Keep breaker posture, limits, alerts, and override context easy to scan.',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Manage connections, credentials, preferences, and audit-facing controls.',
  },
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const environmentMode = useAppSelector(selectEnvironmentMode);
  const websocketConnected = useAppSelector(selectIsConnected);
  const subscribedChannels = useAppSelector(selectSubscribedChannels);
  const { data: riskStatus } = useGetRiskStatusQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 30000,
    skipPollingIfUnfocused: true,
  });
  const { data: savedConnections } = useGetSavedExchangeConnectionsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const activeExchangeConnection =
    savedConnections?.connections.find(
      (connection) => connection.id === savedConnections.activeConnectionId
    ) ?? null;
  const telemetryConnected =
    websocketConnected &&
    subscribedChannels.some((channel) => channel.startsWith(`${environmentMode}.`));
  const currentRoute = routeMeta[location.pathname] ?? routeMeta['/dashboard'];
  const userRoleLabel = user?.role ? user.role.toUpperCase() : 'USER';
  const exchangeLabel = activeExchangeConnection
    ? `${activeExchangeConnection.exchange.toUpperCase()} ${
        activeExchangeConnection.testnet ? 'TESTNET' : 'LIVE'
      }`
    : 'No exchange profile';
  const riskLabel = riskStatus
    ? riskStatus.circuitBreakerActive
      ? 'Risk breaker active'
      : 'Risk posture guarded'
    : 'Risk status loading';
  const riskColor = riskStatus
    ? riskStatus.circuitBreakerActive
      ? 'error'
      : 'success'
    : 'default';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleUserMenuClose();
    void navigate('/login');
  };

  const handleSettings = () => {
    handleUserMenuClose();
    void navigate('/settings');
  };

  return (
    <AppBar position="sticky" elevation={0} color="inherit">
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, py: 1.5, alignItems: 'stretch' }}>
        <Stack spacing={1.5} sx={{ width: '100%' }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Toggle navigation menu"
              onClick={onMenuClick}
              sx={{ flexShrink: 0, mt: 0.25 }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="overline" color="text.secondary">
                Research Workstation
              </Typography>
              <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ lineHeight: 1.15 }}>
                {currentRoute.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, maxWidth: 860 }}
              >
                {currentRoute.subtitle}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              <ThemeToggle />

              <IconButton
                color="inherit"
                aria-label="Open notifications"
                onClick={handleNotificationMenuOpen}
              >
                <Badge badgeContent={0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <IconButton
                edge="end"
                color="inherit"
                aria-label="Open account menu"
                onClick={handleUserMenuOpen}
                sx={{
                  borderColor: alpha(theme.palette.text.primary, 0.12),
                  backgroundColor: alpha(theme.palette.background.paper, 0.85),
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: alpha(theme.palette.primary.main, 0.14),
                    color: theme.palette.primary.main,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`Mode ${environmentMode.toUpperCase()}`}
              color={environmentMode === 'live' ? 'error' : 'success'}
              variant={environmentMode === 'live' ? 'filled' : 'outlined'}
            />
            <Chip label={exchangeLabel} variant="outlined" />
            <Chip
              label={telemetryConnected ? 'Telemetry connected' : 'Telemetry fallback'}
              color={telemetryConnected ? 'success' : 'warning'}
              variant={telemetryConnected ? 'filled' : 'outlined'}
            />
            <Chip label={riskLabel} color={riskColor} variant="outlined" />
            <Chip label={`Role ${userRoleLabel}`} variant="outlined" />
          </Stack>
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: { minWidth: 240, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'user@example.com'}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5 }}
            >
              Mode, risk posture, and saved connections stay visible in the shell while you work.
            </Typography>
          </Box>

          <Divider />

          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: { minWidth: 320, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ px: 2, py: 3, textAlign: 'left' }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Runtime alerts and operator prompts appear here when they are available.
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
