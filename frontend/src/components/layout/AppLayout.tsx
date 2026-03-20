import { Box, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useState } from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 960px
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarOpen = isMobile ? mobileSidebarOpen : desktopSidebarOpen;

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileSidebarOpen((current) => !current);
      return;
    }

    setDesktopSidebarOpen((current) => !current);
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        position: 'relative',
        isolation: 'isolate',
      }}
    >
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Box component="aside" aria-label="Primary navigation">
        <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
      </Box>

      <Box
        component="section"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box component="header">
          <Header onMenuClick={handleMenuClick} />
        </Box>
        
        <Box
          id="main-content"
          component="main"
          role="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2, sm: 3, lg: 4 },
            pb: { xs: 2, sm: 3, lg: 4 },
            pt: { xs: 2, sm: 2.5, lg: 3 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `
                radial-gradient(circle at 18% 0%, ${alpha(theme.palette.primary.main, 0.13)}, transparent 28%),
                radial-gradient(circle at 100% 12%, ${alpha(theme.palette.secondary.main, 0.12)}, transparent 22%),
                radial-gradient(circle at 50% 100%, ${alpha(theme.palette.info.main, 0.08)}, transparent 26%)
              `,
            }}
          />
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: { xs: 8, md: 16 },
              borderRadius: { xs: 4, md: 6 },
              border: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
              background: alpha(
                theme.palette.background.paper,
                theme.palette.mode === 'light' ? 0.18 : 0.12
              ),
              boxShadow:
                theme.palette.mode === 'light'
                  ? 'inset 0 1px 0 rgba(255,255,255,0.4)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          />
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: 1600,
              mx: 'auto',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                borderRadius: { xs: 4, lg: 6 },
                border: `1px solid ${alpha(
                  theme.palette.text.primary,
                  theme.palette.mode === 'light' ? 0.06 : 0.1
                )}`,
                background: alpha(
                  theme.palette.background.paper,
                  theme.palette.mode === 'light' ? 0.42 : 0.3
                ),
                backdropFilter: 'blur(10px)',
                boxShadow:
                  theme.palette.mode === 'light'
                    ? '0 24px 56px rgba(16, 26, 31, 0.06)'
                    : '0 24px 56px rgba(2, 8, 10, 0.24)',
                overflow: 'hidden',
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
