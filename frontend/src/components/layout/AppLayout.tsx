import { Box, useMediaQuery, useTheme } from '@mui/material';
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
        bgcolor: 'background.default',
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
            pb: { xs: 3, sm: 4, lg: 5 },
            pt: { xs: 2, sm: 2.5, lg: 3 },
            position: 'relative',
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 1480,
              mx: 'auto',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing(3),
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
