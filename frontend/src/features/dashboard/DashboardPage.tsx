import { Box, Container, Grid, Typography } from '@mui/material';

import { BalanceCard } from './BalanceCard';
import { PerformanceCard } from './PerformanceCard';
import { PositionsList } from './PositionsList';
import { RecentTradesList } from './RecentTradesList';
import { SystemHealthIndicator } from './SystemHealthIndicator';

import { AppLayout } from '@/components/layout/AppLayout';

/**
 * DashboardPage Component
 * 
 * Main landing page of the application displaying:
 * - Account balance card with asset breakdown
 * - Performance metrics card with timeframe selection
 * - System health indicator with connection status
 * - Open positions list with real-time P&L
 * - Recent trades list with last 10 completed trades
 * 
 * Features:
 * - Responsive grid layout (stacks on mobile)
 * - Environment-aware data display
 * - Real-time updates via RTK Query polling and WebSocket
 * - Wrapped in AppLayout with sidebar and header
 */
const DashboardPage: React.FC = () => (
    <AppLayout>
      <Container maxWidth="xl">
        <Box py={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>

          <Grid container spacing={3}>
            {/* Balance Card */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <BalanceCard />
            </Grid>

            {/* Performance Card */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <PerformanceCard />
            </Grid>

            {/* System Health Indicator */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <SystemHealthIndicator />
            </Grid>

            {/* Open Positions */}
            <Grid size={{ xs: 12 }}>
              <PositionsList />
            </Grid>

            {/* Recent Trades */}
            <Grid size={{ xs: 12 }}>
              <RecentTradesList />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </AppLayout>
  );

export default DashboardPage;
