import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useMemo } from 'react';
import { useSelector } from 'react-redux';

import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingFallback from './components/LoadingFallback';
import { selectTheme } from './features/settings/settingsSlice';
import { lightTheme, darkTheme } from './theme/theme';
import './App.css';

// Lazy load page components for code splitting and performance
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const StrategiesPage = lazy(() => import('./features/strategies/StrategiesPage'));
const TradesPage = lazy(() => import('./features/trades/TradesPage'));
const BacktestPage = lazy(() => import('./features/backtest/BacktestPage'));
const RiskPage = lazy(() => import('./features/risk/RiskPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

function App() {
  // Get current theme from Redux state
  const themeMode = useSelector(selectTheme);

  // Memoize theme to avoid unnecessary recalculations
  const theme = useMemo(
    () => (themeMode === 'light' ? lightTheme : darkTheme),
    [themeMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* App-level error boundary catches all errors */}
      <ErrorBoundary>
        <BrowserRouter>
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
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
