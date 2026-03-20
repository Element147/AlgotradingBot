import {
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
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
import { logout, selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import { selectEnvironmentMode } from '../../features/environment/environmentSlice';
import { useGetSavedExchangeConnectionsQuery } from '../../features/settings/exchangeApi';
import ThemeToggle from '../ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
}

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Research Command',
    subtitle: 'Monitor paper state, system health, and operator signals at a glance.',
  },
  '/paper': {
    title: 'Paper Execution Desk',
    subtitle: 'Manage simulated order flow without implying live routing.',
  },
  '/strategies': {
    title: 'Strategy Library',
    subtitle: 'Review canonical profiles, configs, and paper-mode readiness.',
  },
  '/trades': {
    title: 'Trade Review',
    subtitle: 'Inspect fills, outcomes, and review slices without leaving the workstation.',
  },
  '/backtest': {
    title: 'Backtest Lab',
    subtitle: 'Run research-grade simulations with explicit provenance and replay context.',
  },
  '/market-data': {
    title: 'Data Intake',
    subtitle: 'Import provider data, watch retries, and stage datasets for research.',
  },
  '/risk': {
    title: 'Risk Console',
    subtitle: 'Keep breaker context, alerts, and overrides visible before acting.',
  },
  '/settings': {
    title: 'Operator Settings',
    subtitle: 'Adjust credentials, display preferences, and audit-facing controls.',
  },
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const environmentMode = useAppSelector(selectEnvironmentMode);
  const { data: savedConnections } = useGetSavedExchangeConnectionsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const activeExchangeConnection =
    savedConnections?.connections.find(
      (connection) => connection.id === savedConnections.activeConnectionId
    ) ?? null;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

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

  const botModeLabel = activeExchangeConnection
    ? activeExchangeConnection.testnet
      ? 'Paper'
      : 'Live'
    : environmentMode === 'live'
      ? 'Live'
      : 'Paper/Test';
  const botStatusLabel = activeExchangeConnection
    ? `${botModeLabel} - ${activeExchangeConnection.name}`
    : botModeLabel;
  const currentRoute = routeMeta[location.pathname] ?? routeMeta['/dashboard'];
  const isLiveMode = botModeLabel === 'Live';
  const connectionLabel = activeExchangeConnection
    ? activeExchangeConnection.exchange.toUpperCase()
    : 'OFFLINE';
  const userRoleLabel = user?.role ? user.role.toUpperCase() : 'USER';

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ gap: 1.5, px: { xs: 2, sm: 3 } }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Toggle navigation menu"
            onClick={onMenuClick}
            sx={{ flexShrink: 0 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 0.5, md: 2 }}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  Research Workstation
                </Typography>
                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  component="div"
                  sx={{ lineHeight: 1.15 }}
                >
                  {currentRoute.title}
                </Typography>
                {!isMobile ? (
                  <Typography variant="body2" color="text.secondary">
                    {currentRoute.subtitle}
                  </Typography>
                ) : null}
              </Box>

              {!isMobile ? (
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ justifyContent: 'flex-end' }}
                >
                  <Chip
                    label={botStatusLabel}
                    color={isLiveMode ? 'error' : 'success'}
                    size="small"
                    variant={isLiveMode ? 'filled' : 'outlined'}
                    sx={{
                      maxWidth: 260,
                      bgcolor: isLiveMode
                        ? 'error.main'
                        : alpha(theme.palette.primary.main, 0.08),
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    }}
                  />
                  <Chip
                    label={`Connection ${connectionLabel}`}
                    size="small"
                    variant="outlined"
                    sx={{ bgcolor: alpha(theme.palette.info.main, 0.08) }}
                  />
                  <Chip
                    label={`Role ${userRoleLabel}`}
                    size="small"
                    variant="outlined"
                    sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.08) }}
                  />
                </Stack>
              ) : (
                <Chip
                  label={botModeLabel}
                  color={isLiveMode ? 'error' : 'success'}
                  size="small"
                  variant={isLiveMode ? 'filled' : 'outlined'}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <ThemeToggle />

          <IconButton color="inherit" aria-label="Open settings" onClick={handleSettings}>
            <SettingsIcon />
          </IconButton>

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
              border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.4),
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha(theme.palette.primary.main, 0.16),
                color: theme.palette.primary.main,
                fontSize: '0.875rem',
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
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
            sx: { minWidth: 220, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'user@example.com'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Route actions remain audit-visible and environment-scoped.
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
            sx: { minWidth: 300, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Runtime alerts and operator prompts will appear here when they are available.
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
