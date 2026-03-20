import {
  Assessment as BacktestIcon,
  CloudDownloadOutlined as MarketDataIcon,
  Dashboard as DashboardIcon,
  History as TradesIcon,
  ReceiptLong as PaperIcon,
  Security as RiskIcon,
  Settings as SettingsIcon,
  ShowChart as StrategyIcon,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = 264;

const navigationSections = [
  {
    heading: 'Command',
    items: [
      { text: 'Dashboard', detail: 'Overview and system signals', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Paper', detail: 'Simulated order desk', icon: <PaperIcon />, path: '/paper' },
    ],
  },
  {
    heading: 'Research',
    items: [
      { text: 'Strategies', detail: 'Profiles and configs', icon: <StrategyIcon />, path: '/strategies' },
      { text: 'Trades', detail: 'History and exports', icon: <TradesIcon />, path: '/trades' },
      { text: 'Backtest', detail: 'Runs and results', icon: <BacktestIcon />, path: '/backtest' },
      { text: 'Market Data', detail: 'Provider imports', icon: <MarketDataIcon />, path: '/market-data' },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { text: 'Risk', detail: 'Breakers and limits', icon: <RiskIcon />, path: '/risk' },
      { text: 'Settings', detail: 'Connections and preferences', icon: <SettingsIcon />, path: '/settings' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    void navigate(path);
    onClose();
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ alignItems: 'stretch', px: 2.5, pt: 3, pb: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              AlgoTrading Bot
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.25 }}>
              Research Workstation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Simple, test-first access to backtests, paper orders, risk controls, and operator settings.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Mode starts in test" size="small" variant="outlined" />
            <Chip label="Paper actions stay simulated" size="small" variant="outlined" />
          </Stack>
        </Stack>
      </Toolbar>

      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.25, py: 1.5 }}>
        {navigationSections.map((section) => (
          <Box key={section.heading} sx={{ mb: 2.5 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ px: 1.25, display: 'block', mb: 1 }}
            >
              {section.heading}
            </Typography>

            <List disablePadding>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      selected={isActive}
                      sx={{
                        px: 1.5,
                        py: 1.2,
                        alignItems: 'flex-start',
                        border: `1px solid ${
                          isActive
                            ? alpha(theme.palette.primary.main, 0.2)
                            : 'transparent'
                        }`,
                        backgroundColor: isActive
                          ? alpha(theme.palette.primary.main, 0.11)
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: isActive
                            ? alpha(theme.palette.primary.main, 0.15)
                            : alpha(theme.palette.primary.main, 0.05),
                        },
                        '& .MuiListItemIcon-root': {
                          color: isActive
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 42, mt: 0.15 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        secondary={item.detail}
                        primaryTypographyProps={{ fontWeight: 700 }}
                        secondaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 2, pt: 0 }}>
        <Box
          sx={{
            borderRadius: 3,
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Typography variant="subtitle2">Safe next step</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Start with Backtest or Dashboard, then move into paper workflows only after the evidence is clear.
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="persistent"
          open={open}
          sx={{
            width: open ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};
