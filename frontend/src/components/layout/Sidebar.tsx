import {
  Assessment as BacktestIcon,
  CloudDownloadOutlined as MarketDataIcon,
  Dashboard as DashboardIcon,
  Insights as ForwardTestingIcon,
  History as TradesIcon,
  ReceiptLong as PaperIcon,
  Security as RiskIcon,
  Settings as SettingsIcon,
  ShowChart as StrategyIcon,
} from '@mui/icons-material';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { StatusPill } from '../ui/Workbench';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = 296;

const navigationSections = [
  {
    heading: 'Command',
    items: [
      {
        text: 'Dashboard',
        detail: 'Overview and system signals',
        icon: <DashboardIcon />,
        path: '/dashboard',
      },
      {
        text: 'Forward Testing',
        detail: 'Signal observation desk',
        icon: <ForwardTestingIcon />,
        path: '/forward-testing',
      },
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
      <Box sx={{ px: 2.5, pt: 3, pb: 2.5 }}>
        <Stack spacing={2.25}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              AlgoTrading Bot
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.25 }}>
              Research Workstation
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, overflowWrap: 'anywhere' }}
            >
              Calm, test-first access to research, paper workflows, risk controls, and operator settings.
            </Typography>
          </Box>

          <Box
            sx={{
              px: 1.5,
              py: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderRadius: 0,
            }}
          >
            <Stack spacing={1.25}>
              <Typography variant="subtitle2">Safety defaults</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <StatusPill label="Default: test" tone="success" variant="filled" />
                <StatusPill label="Paper stays simulated" tone="info" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Follow the workstation path: Backtest first, Paper second, and only explicit live context when the app says it is supported.
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ px: 0.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Workstation flow
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              1. Review Dashboard
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              2. Validate in Backtest
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              3. Simulate in Paper
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.25, py: 1.5 }}>
        {navigationSections.map((section) => (
          <Box key={section.heading} sx={{ mb: 2.5 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ px: 1.25, display: 'block', mb: 0.75 }}
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
                        py: 1.35,
                        alignItems: 'center',
                        borderRadius: 0,
                        border: `1px solid ${
                          isActive ? alpha(theme.palette.primary.main, 0.2) : 'transparent'
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
                          sx: {
                            mt: 0.25,
                            lineHeight: 1.45,
                            overflowWrap: 'anywhere',
                          },
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
            p: 1.75,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.secondary.main, 0.08),
            borderRadius: 0,
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
