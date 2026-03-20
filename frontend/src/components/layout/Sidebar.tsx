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

const DRAWER_WIDTH = 272;

const navigationSections = [
  {
    heading: 'Command',
    caption: 'Keep the operator view anchored in safe execution defaults.',
    items: [
      { text: 'Dashboard', detail: 'Overview and signals', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Paper', detail: 'Simulated order desk', icon: <PaperIcon />, path: '/paper' },
    ],
  },
  {
    heading: 'Research',
    caption: 'Inspect strategies, trade outcomes, and backtest evidence.',
    items: [
      { text: 'Strategies', detail: 'Profiles and readiness', icon: <StrategyIcon />, path: '/strategies' },
      { text: 'Trades', detail: 'Execution review', icon: <TradesIcon />, path: '/trades' },
      { text: 'Backtest', detail: 'Simulation lab', icon: <BacktestIcon />, path: '/backtest' },
      { text: 'Market Data', detail: 'Dataset intake', icon: <MarketDataIcon />, path: '/market-data' },
    ],
  },
  {
    heading: 'Operations',
    caption: 'Protect controls, overrides, and workstation behavior.',
    items: [
      { text: 'Risk', detail: 'Breakers and limits', icon: <RiskIcon />, path: '/risk' },
      { text: 'Settings', detail: 'Connections and preferences', icon: <SettingsIcon />, path: '/settings' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 960px
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    void navigate(path);
    onClose();
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ alignItems: 'flex-start', pt: 2, pb: 1 }}>
        <Box
          sx={{
            width: '100%',
            p: 2.25,
            borderRadius: 4,
            background: `linear-gradient(155deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow:
              theme.palette.mode === 'light'
                ? '0 18px 36px rgba(18, 35, 42, 0.08)'
                : '0 18px 36px rgba(0, 8, 10, 0.22)',
          }}
        >
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Local-First
          </Typography>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
            AlgoTrading
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Research Workstation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Research workstation for backtests, paper flow, and operator controls.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Chip label="Default-safe: test" size="small" />
            <Chip label="Paper-first" size="small" />
          </Stack>
        </Box>
      </Toolbar>

      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pt: 2, px: 1.25, pb: 2 }}>
        {navigationSections.map((section) => (
          <Box key={section.heading} sx={{ mb: 2.5 }}>
            <Box sx={{ px: 1.25, mb: 1 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                {section.heading}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {section.caption}
              </Typography>
            </Box>

            <List disablePadding>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      selected={isActive}
                      sx={{
                        borderRadius: 3,
                        px: 1.5,
                        py: 1.15,
                        alignItems: 'flex-start',
                        '&.Mui-selected': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          color: theme.palette.primary.contrastText,
                          boxShadow: `0 18px 32px ${alpha(theme.palette.primary.main, 0.26)}`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                          },
                          '& .MuiListItemIcon-root': {
                            color: theme.palette.primary.contrastText,
                          },
                          '& .MuiTypography-body2': {
                            color: alpha(theme.palette.primary.contrastText, 0.82),
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 42,
                          mt: 0.15,
                          color: isActive ? 'inherit' : theme.palette.text.secondary,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        secondary={item.detail}
                        primaryTypographyProps={{
                          fontWeight: 700,
                        }}
                        secondaryTypographyProps={{
                          variant: 'body2',
                          color: isActive ? 'inherit' : 'text.secondary',
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

      <Box sx={{ p: 1.5, pt: 0 }}>
        <Box
          sx={{
            borderRadius: 4,
            p: 1.75,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(
              theme.palette.background.paper,
              theme.palette.mode === 'light' ? 0.62 : 0.32
            ),
          }}
        >
          <Typography variant="subtitle2">Safety Posture</Typography>
          <Typography variant="body2" color="text.secondary">
            Test and paper behavior stay visible throughout the workstation shell.
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
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
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
