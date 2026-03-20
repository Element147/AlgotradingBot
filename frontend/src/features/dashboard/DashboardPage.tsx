import { Box, Card, CardContent, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { BalanceCard } from './BalanceCard';
import { OperatorAuditCard } from './OperatorAuditCard';
import { PaperTradingCard } from './PaperTradingCard';
import { PerformanceCard } from './PerformanceCard';
import { PositionsList } from './PositionsList';
import { RecentTradesList } from './RecentTradesList';
import { SystemHealthIndicator } from './SystemHealthIndicator';

import { useAppSelector } from '@/app/hooks';
import { AppLayout } from '@/components/layout/AppLayout';

const DashboardPage: React.FC = () => {
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'admin');
  const environmentMode = useAppSelector((state) => state.environment.mode);
  const username = useAppSelector((state) => state.auth.user?.username);
  const operatorPosture =
    environmentMode === 'live' ? 'Live UI gated by controls' : 'Test and paper by default';
  const commandTiles = [
    {
      label: 'Operating Mode',
      value: environmentMode.toUpperCase(),
      detail: operatorPosture,
    },
    {
      label: 'Research Scope',
      value: 'Backtest + Paper',
      detail: 'Simulation and operator review remain separated from real-money execution.',
    },
    {
      label: 'Operator',
      value: username || 'Workstation User',
      detail: 'Override paths and state changes remain audit-visible throughout the shell.',
    },
  ];

  return (
    <AppLayout>
      <Container maxWidth={false} disableGutters>
        <Box p={{ xs: 2, sm: 3, lg: 4 }}>
          <Card
            sx={{
              mb: 3,
              background:
                'linear-gradient(135deg, rgba(18,107,103,0.95) 0%, rgba(17,24,39,0.97) 50%, rgba(192,109,24,0.9) 100%)',
              color: '#f8fafc',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                justifyContent="space-between"
                spacing={2}
                alignItems={{ xs: 'flex-start', lg: 'center' }}
              >
                <Box>
                  <Typography variant="overline" sx={{ color: 'rgba(248,250,252,0.72)' }}>
                    Operator Overview
                  </Typography>
                  <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#f8fafc' }}>
                    Dashboard
                  </Typography>
                  <Typography variant="body1" sx={{ maxWidth: 780, color: 'rgba(248,250,252,0.82)' }}>
                    Track paper posture, review system health, and spot research or risk drift before
                    it turns into an operator surprise.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label="Default-safe: test" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#f8fafc' }} />
                  <Chip label="Paper execution only" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#f8fafc' }} />
                  <Chip label="Live still gated" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#f8fafc' }} />
                </Stack>
              </Stack>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                {commandTiles.map((tile) => (
                  <Grid key={tile.label} size={{ xs: 12, md: 4 }}>
                    <Box
                      sx={{
                        borderRadius: 4,
                        p: 2,
                        minHeight: '100%',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
                      }}
                    >
                      <Typography variant="overline" sx={{ color: 'rgba(248,250,252,0.68)' }}>
                        {tile.label}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#f8fafc', mb: 0.5 }}>
                        {tile.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(248,250,252,0.78)' }}>
                        {tile.detail}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  backgroundColor: alpha('#ffffff', 0.04),
                }}
              >
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    Workstation Goal
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Evidence Before Action
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Keep performance summaries, paper execution, and risk posture in one research
                    shell so operator choices stay legible under pressure.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  backgroundColor: alpha('#ffffff', 0.04),
                }}
              >
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    State Hierarchy
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Safety Signals Stay First
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mode, breaker posture, and paper-only boundaries remain visible before deeper
                    charts or trade review details.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  backgroundColor: alpha('#ffffff', 0.04),
                }}
              >
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    Workflow
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Backtest, Then Paper
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Strategy work stays honest by moving from data intake to research replay to
                    simulated execution before any live-facing change is considered.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <BalanceCard />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <PerformanceCard />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <SystemHealthIndicator />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <PaperTradingCard />
            </Grid>

            {isAdmin ? (
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <OperatorAuditCard />
              </Grid>
            ) : null}

            <Grid size={{ xs: 12 }}>
              <PositionsList />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <RecentTradesList />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default DashboardPage;
