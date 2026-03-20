import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from './app/hooks';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import ProtectedRoute from './components/ProtectedRoute';
import { accountApi } from './features/account/accountApi';
import { backtestApi } from './features/backtest/backtestApi';
import { marketDataApi } from './features/marketData/marketDataApi';
import { paperApi } from './features/paperApi';
import { riskApi } from './features/risk/riskApi';
import { selectTextScale, selectTheme } from './features/settings/settingsSlice';
import { strategiesApi } from './features/strategies/strategiesApi';
import { tradesApi } from './features/trades/tradesApi';
import { WebSocketRuntime } from './features/websocket/WebSocketRuntime';
import { lightTheme, darkTheme } from './theme/theme';
import './App.css';

// Lazy load page components for code splitting and performance
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const PaperTradingPage = lazy(() => import('./features/paper/PaperTradingPage'));
const StrategiesPage = lazy(() => import('./features/strategies/StrategiesPage'));
const TradesPage = lazy(() => import('./features/trades/TradesPage'));
const BacktestPage = lazy(() => import('./features/backtest/BacktestPage'));
const MarketDataPage = lazy(() => import('./features/marketData/MarketDataPage'));
const RiskPage = lazy(() => import('./features/risk/RiskPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

function App() {
  // Get current theme from Redux state
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectTheme);
  const textScale = useAppSelector(selectTextScale);

  // Memoize theme to avoid unnecessary recalculations
  const theme = useMemo(
    () => (themeMode === 'light' ? lightTheme : darkTheme),
    [themeMode]
  );
  const enableWebSocketRuntime = import.meta.env.MODE !== 'test';

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      return;
    }
    dispatch(accountApi.util.prefetch('getBalance', undefined, { force: false }));
    dispatch(accountApi.util.prefetch('getPerformance', 'today', { force: false }));
    dispatch(accountApi.util.prefetch('getOpenPositions', undefined, { force: false }));
    dispatch(accountApi.util.prefetch('getRecentTrades', 10, { force: false }));
    dispatch(paperApi.util.prefetch('getPaperTradingState', undefined, { force: false }));
    dispatch(paperApi.util.prefetch('getPaperOrders', undefined, { force: false }));
    dispatch(strategiesApi.util.prefetch('getStrategies', undefined, { force: false }));
    dispatch(tradesApi.util.prefetch('getTradeHistory', { limit: 200 }, { force: false }));
    dispatch(backtestApi.util.prefetch('getBacktests', undefined, { force: false }));
    dispatch(marketDataApi.util.prefetch('getMarketDataProviders', undefined, { force: false }));
    dispatch(marketDataApi.util.prefetch('getMarketDataJobs', undefined, { force: false }));
    dispatch(riskApi.util.prefetch('getRiskStatus', undefined, { force: false }));
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* App-level error boundary catches all errors */}
      <ErrorBoundary>
        <BrowserRouter>
          <Box sx={{ fontSize: `${textScale}rem`, minHeight: '100vh' }}>
            {enableWebSocketRuntime ? <WebSocketRuntime /> : null}
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
              {/* Public route - Login */}
              <Route
                path="/login"
                element={
                  <ErrorBoundary>
                    <LoginPage />
                  </ErrorBoundary>
                }
              />

              {/* Protected routes - All require authentication */}
              <Route
                path="/dashboard"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/paper"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <PaperTradingPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/strategies"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <StrategiesPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/trades"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <TradesPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/backtest"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <BacktestPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/market-data"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <MarketDataPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/risk"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <RiskPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/settings"
                element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />

              {/* Default and catch-all routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </Box>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
