import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Chip,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  useTheme,
  useMediaQuery,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import { selectEnvironmentMode } from '../../features/environment/environmentSlice';
import { useGetSavedExchangeConnectionsQuery } from '../../features/settings/exchangeApi';
import ThemeToggle from '../ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
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

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="Toggle navigation menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {!isMobile && (
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Theme Toggle */}
        <ThemeToggle />

        <IconButton
          color="inherit"
          aria-label="Open settings"
          onClick={handleSettings}
          sx={{ mr: 1 }}
        >
          <SettingsIcon />
        </IconButton>

        <Chip
          label={isMobile ? botModeLabel : botStatusLabel}
          color={botModeLabel === 'Live' ? 'error' : 'success'}
          size="small"
          variant="outlined"
          sx={{
            mr: 1,
            maxWidth: { xs: 120, sm: 240 },
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
        />

        {/* Notifications */}
        <IconButton
          color="inherit"
          aria-label="Open notifications"
          onClick={handleNotificationMenuOpen}
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* User Menu */}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="Open account menu"
          onClick={handleUserMenuOpen}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.primary.main,
              fontSize: '0.875rem',
            }}
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        </IconButton>

        {/* User Menu Dropdown */}
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
            sx: { minWidth: 200, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'user@example.com'}
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

        {/* Notifications Menu Dropdown */}
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
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
