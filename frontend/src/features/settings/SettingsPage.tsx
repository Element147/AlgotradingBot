import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import {
  useGetExchangeBalanceQuery,
  useGetExchangeConnectionStatusQuery,
  useGetExchangeOrdersQuery,
  useGetSystemInfoQuery,
  useTestExchangeConnectionMutation,
  useTriggerBackupMutation,
} from './exchangeApi';
import { OperatorAuditPanel } from './OperatorAuditPanel';
import {
  resetSettings,
  selectCurrency,
  selectNotificationSettings,
  selectTextScale,
  selectTheme,
  selectTimezone,
  setCurrency,
  setTextScale,
  setTheme,
  setTimezone,
  updateNotificationSetting,
} from './settingsSlice';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { FieldTooltip } from '@/components/ui/FieldTooltip';
import { selectEnvironmentMode, setEnvironmentMode } from '@/features/environment/environmentSlice';
import { getApiErrorMessage } from '@/services/api';
import { getErrorMessage } from '@/services/axiosClient';

const defaultCommandList = [
  'cd /d C:\\Git\\algotradingbot\\AlgotradingBot && docker compose -f compose.yaml up -d postgres',
  'cd /d C:\\Git\\algotradingbot\\AlgotradingBot && gradlew.bat clean build',
  'cd /d C:\\Git\\algotradingbot\\AlgotradingBot && gradlew.bat bootRun',
  'cd /d C:\\Git\\algotradingbot\\frontend && npm run build',
  'cd /d C:\\Git\\algotradingbot\\frontend && npm run dev',
];

type SettingsTab = 'api' | 'notifications' | 'display' | 'database' | 'exchange' | 'audit';

const initialApiConfig = {
  exchange: 'binance',
  apiKey: '',
  secret: '',
  testnet: true,
};

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const currency = useAppSelector(selectCurrency);
  const timezone = useAppSelector(selectTimezone);
  const textScale = useAppSelector(selectTextScale);
  const notifications = useAppSelector(selectNotificationSettings);
  const environmentMode = useAppSelector(selectEnvironmentMode);
  const userRole = useAppSelector((state) => state.auth.user?.role ?? 'trader');
  const isAdmin = userRole === 'admin';

  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error' | 'warning'; message: string } | null>(
    null
  );
  const [tab, setTab] = useState<SettingsTab>(isAdmin ? 'api' : 'display');
  const [apiConfig, setApiConfig] = useState(initialApiConfig);
  const [revealApiKey, setRevealApiKey] = useState(false);
  const [revealSecret, setRevealSecret] = useState(false);

  const { data: systemInfo, isError: isSystemInfoError } = useGetSystemInfoQuery();
  const {
    data: exchangeBalance,
    refetch: refetchBalance,
    isError: isExchangeBalanceError,
    error: exchangeBalanceError,
  } =
    useGetExchangeBalanceQuery(undefined, {
      pollingInterval: environmentMode === 'live' ? 60000 : 0,
      skipPollingIfUnfocused: true,
    });
  const {
    data: exchangeOrders = [],
    isError: isExchangeOrdersError,
    error: exchangeOrdersError,
  } = useGetExchangeOrdersQuery(undefined, {
    pollingInterval: environmentMode === 'live' ? 60000 : 0,
    skipPollingIfUnfocused: true,
  });
  const {
    data: connectionStatus,
    isError: isConnectionError,
    error: connectionStatusError,
  } = useGetExchangeConnectionStatusQuery();
  const [testConnection, { isLoading: isTestingConnection }] = useTestExchangeConnectionMutation();
  const [triggerBackup, { isLoading: isBackingUp }] = useTriggerBackupMutation();

  const timezoneOptions = useMemo(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = ['UTC', detected, 'Europe/Prague', 'America/New_York', 'Asia/Tokyo'];
    return Array.from(new Set(options));
  }, []);

  const copyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setFeedback({ severity: 'success', message: 'Command copied to clipboard.' });
    } catch {
      setFeedback({ severity: 'error', message: 'Clipboard copy failed. You can still copy manually.' });
    }
  };

  const runConnectionTest = async () => {
    try {
      const result = await testConnection({
        exchange: apiConfig.exchange,
        apiKey: apiConfig.apiKey,
        apiSecret: apiConfig.secret,
        testnet: apiConfig.testnet,
      }).unwrap();
      setFeedback({
        severity: result.connected ? 'success' : 'warning',
        message: result.connected
          ? `Connection successful (${result.rateLimitUsage}).`
          : `Connection failed: ${result.error ?? result.rateLimitUsage}.`,
      });
    } catch (error) {
      setFeedback({
        severity: 'error',
        message: getErrorMessage(error),
      });
    }
  };

  const runBackup = async () => {
    try {
      const result = await triggerBackup().unwrap();
      setFeedback({ severity: 'success', message: `Backup triggered: ${result.path} (${result.size}).` });
    } catch (error) {
      setFeedback({
        severity: 'error',
        message: getErrorMessage(error),
      });
    }
  };

  const activeTab: SettingsTab =
    !isAdmin && (tab === 'api' || tab === 'database' || tab === 'audit') ? 'display' : tab;

  return (
    <AppLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Local-first configuration for paper trading, backtesting, and safe development workflow.
        </Typography>

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
            {feedback.message}
          </Alert>
        ) : null}

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Tabs
              value={activeTab}
              onChange={(_, value: SettingsTab) => setTab(value)}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              {isAdmin ? <Tab value="api" label="API Config" /> : null}
              <Tab value="notifications" label="Notifications" />
              <Tab value="display" label="Display" />
              {isAdmin ? <Tab value="database" label="Database" /> : null}
              {isAdmin ? <Tab value="audit" label="Audit Trail" /> : null}
              <Tab value="exchange" label="Exchange" />
            </Tabs>
          </CardContent>
        </Card>

        {activeTab === 'api' ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    API Configuration
                  </Typography>
                  <Stack spacing={2}>
                    <FieldTooltip title="Exchange name for connection test. Binance is currently supported by backend test endpoint.">
                      <TextField
                        label="Exchange"
                        value={apiConfig.exchange}
                        onChange={(event) =>
                          setApiConfig((prev) => ({ ...prev, exchange: event.target.value }))
                        }
                        helperText="Use binance for current backend support."
                      />
                    </FieldTooltip>
                    <FieldTooltip title="Exchange credential identifier. Revealing keys on shared screens is a security risk.">
                      <TextField
                        label="Exchange API Key"
                        type={revealApiKey ? 'text' : 'password'}
                        value={apiConfig.apiKey}
                        onChange={(event) =>
                          setApiConfig((prev) => ({ ...prev, apiKey: event.target.value }))
                        }
                        helperText="Used only for connection test request."
                      />
                    </FieldTooltip>
                    <Button variant="outlined" onClick={() => setRevealApiKey((prev) => !prev)}>
                      {revealApiKey ? 'Hide API Key' : 'Reveal API Key'}
                    </Button>
                    <FieldTooltip title="Secret used for signed exchange requests. Exposure can compromise account safety.">
                      <TextField
                        label="Exchange API Secret"
                        type={revealSecret ? 'text' : 'password'}
                        value={apiConfig.secret}
                        onChange={(event) =>
                          setApiConfig((prev) => ({ ...prev, secret: event.target.value }))
                        }
                        helperText="Used only for signed connectivity test. Not persisted by frontend."
                      />
                    </FieldTooltip>
                    <Button variant="outlined" onClick={() => setRevealSecret((prev) => !prev)}>
                      {revealSecret ? 'Hide Secret' : 'Reveal Secret'}
                    </Button>
                    <FieldTooltip title="Testnet avoids production account scope. Keep enabled unless intentionally validating mainnet keys.">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={apiConfig.testnet}
                            onChange={(event) =>
                              setApiConfig((prev) => ({ ...prev, testnet: event.target.checked }))
                            }
                          />
                        }
                        label="Use Binance Testnet"
                      />
                    </FieldTooltip>
                    <Button
                      variant="contained"
                      onClick={() => void runConnectionTest()}
                      disabled={isTestingConnection}
                    >
                      Test Connection
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Local Commands (CMD)
                  </Typography>
                  <Stack spacing={1.5}>
                    {defaultCommandList.map((command, index) => (
                      <Box
                        key={command}
                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Command {index + 1}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mb: 1 }}
                        >
                          {command}
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<ContentCopyIcon />}
                          onClick={() => void copyCommand(command)}
                        >
                          Copy
                        </Button>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {activeTab === 'notifications' ? (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Notification Settings
              </Typography>
              <Stack spacing={2}>
                <FieldTooltip title="Enable/disable email alerts. Disabling can delay awareness of critical risk events.">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailAlerts}
                        onChange={(event) =>
                          dispatch(updateNotificationSetting({ key: 'emailAlerts', value: event.target.checked }))
                        }
                      />
                    }
                    label="Email Alerts"
                  />
                </FieldTooltip>
                <FieldTooltip title="Enable Telegram notifications. Useful for rapid alerts when away from dashboard.">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.telegramAlerts}
                        onChange={(event) =>
                          dispatch(updateNotificationSetting({ key: 'telegramAlerts', value: event.target.checked }))
                        }
                      />
                    }
                    label="Telegram Alerts"
                  />
                </FieldTooltip>
                <FieldTooltip title="Profit/loss notification trigger. Too tight can create alert noise; too wide can hide drift.">
                  <TextField
                    label="Profit/Loss Threshold (%)"
                    type="number"
                    value={notifications.profitLossThreshold}
                    onChange={(event) =>
                      dispatch(
                        updateNotificationSetting({
                          key: 'profitLossThreshold',
                          value: Number(event.target.value),
                        })
                      )
                    }
                    helperText="Threshold for PnL alert generation."
                  />
                </FieldTooltip>
                <FieldTooltip title="Drawdown alert trigger. Lower values warn earlier but may be more frequent.">
                  <TextField
                    label="Drawdown Threshold (%)"
                    type="number"
                    value={notifications.drawdownThreshold}
                    onChange={(event) =>
                      dispatch(
                        updateNotificationSetting({
                          key: 'drawdownThreshold',
                          value: Number(event.target.value),
                        })
                      )
                    }
                    helperText="Percent drawdown level that emits warning notifications."
                  />
                </FieldTooltip>
                <FieldTooltip title="Risk alert trigger. Higher values can delay warning of concentrated exposure.">
                  <TextField
                    label="Risk Threshold (%)"
                    type="number"
                    value={notifications.riskThreshold}
                    onChange={(event) =>
                      dispatch(
                        updateNotificationSetting({
                          key: 'riskThreshold',
                          value: Number(event.target.value),
                        })
                      )
                    }
                    helperText="Percent utilization threshold for risk alerts."
                  />
                </FieldTooltip>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === 'display' ? (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Display Preferences
              </Typography>
              <Stack spacing={2}>
                <FieldTooltip title="Visual theme preference only. Does not change trading logic or risk behavior.">
                  <FormControl fullWidth>
                    <InputLabel id="theme-label">Theme</InputLabel>
                    <Select
                      labelId="theme-label"
                      value={theme}
                      label="Theme"
                      onChange={(event) => dispatch(setTheme(event.target.value))}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                    </Select>
                  </FormControl>
                </FieldTooltip>

                <FieldTooltip title="Formatting preference for displayed values. Does not convert account base currency.">
                  <FormControl fullWidth>
                    <InputLabel id="currency-label">Currency Display</InputLabel>
                    <Select
                      labelId="currency-label"
                      value={currency}
                      label="Currency Display"
                      onChange={(event) => dispatch(setCurrency(event.target.value))}
                    >
                      <MenuItem value="USD">USD (fiat view)</MenuItem>
                      <MenuItem value="BTC">BTC (crypto unit view)</MenuItem>
                    </Select>
                  </FormControl>
                </FieldTooltip>

                <FieldTooltip title="Timezone used for date/time rendering. Wrong timezone can cause analysis mistakes.">
                  <FormControl fullWidth>
                    <InputLabel id="timezone-label">Timezone</InputLabel>
                    <Select
                      labelId="timezone-label"
                      value={timezone}
                      label="Timezone"
                      onChange={(event) => dispatch(setTimezone(event.target.value))}
                    >
                      {timezoneOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldTooltip>

                <FieldTooltip title="UI text size multiplier. Larger scale improves accessibility but may reduce data density.">
                  <TextField
                    label="Text Scale"
                    type="number"
                    value={textScale}
                    inputProps={{ min: 1, max: 2, step: 0.1 }}
                    onChange={(event) => dispatch(setTextScale(Number(event.target.value)))}
                    helperText="Supports accessibility scaling up to 200%."
                  />
                </FieldTooltip>

                <FieldTooltip title="Critical operating mode selector. Switching to live changes data source context and risk posture.">
                  <FormControl fullWidth>
                    <InputLabel id="environment-label">Active Mode</InputLabel>
                    <Select
                      labelId="environment-label"
                      value={environmentMode}
                      label="Active Mode"
                      onChange={(event) =>
                        dispatch(setEnvironmentMode(event.target.value))
                      }
                    >
                      <MenuItem value="test">Test / Paper (recommended)</MenuItem>
                      <MenuItem value="live">Live data view</MenuItem>
                    </Select>
                  </FormControl>
                </FieldTooltip>

                <Button variant="outlined" color="warning" onClick={() => dispatch(resetSettings())}>
                  Reset Preferences
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === 'database' ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    System Information
                  </Typography>
                  {isSystemInfoError ? (
                    <Alert severity="warning">
                      Unable to load system information. Use the standard run scripts and health endpoint as a fallback.
                    </Alert>
                  ) : (
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        Version: {systemInfo?.applicationVersion ?? 'local-dev'}
                      </Typography>
                      <Typography variant="body2">
                        Last Deployment: {systemInfo?.lastDeploymentDate ?? 'n/a'}
                      </Typography>
                      <Typography variant="body2">
                        Database Status: {systemInfo?.databaseStatus ?? 'unknown'}
                      </Typography>
                      <Typography variant="body2">
                        Kafka Status: {systemInfo?.kafkaStatus ?? 'optional in local run path'}
                      </Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Database Management
                  </Typography>
                  <Button variant="contained" onClick={() => void runBackup()} disabled={isBackingUp}>
                    Trigger Backup
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {activeTab === 'exchange' ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6">Exchange Balance</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={() => void refetchBalance()}
                    >
                      Refresh
                    </Button>
                  </Stack>
                  {isExchangeBalanceError ? (
                    <Alert severity="warning">
                      {getApiErrorMessage(
                        exchangeBalanceError,
                        'Unable to load live exchange balance data for the current environment.'
                      )}
                    </Alert>
                  ) : (
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        Exchange: {exchangeBalance?.exchange ?? connectionStatus?.exchange ?? 'Live Exchange'}
                      </Typography>
                      <Typography variant="body2">Available: {exchangeBalance?.available ?? '-'}</Typography>
                      <Typography variant="body2">Locked: {exchangeBalance?.locked ?? '-'}</Typography>
                      <Typography variant="body2">Total: {exchangeBalance?.total ?? '-'}</Typography>
                      <Typography variant="body2">Last Sync: {exchangeBalance?.lastSync ?? '-'}</Typography>
                      {exchangeBalance?.assets?.slice(0, 6).map((asset) => (
                        <Typography key={asset.symbol} variant="caption">
                          {asset.symbol}: {asset.amount} ({asset.valueUSD} USD)
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Connection Status
                  </Typography>
                  {isConnectionError ? (
                    <Alert severity="warning">
                      {getApiErrorMessage(
                        connectionStatusError,
                        'Unable to load connection status. Use the test-connection action to verify credentials.'
                      )}
                    </Alert>
                  ) : (
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        Connected: {connectionStatus?.connected ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2">Rate Limit: {connectionStatus?.rateLimitUsage ?? '-'}</Typography>
                      <Typography variant="body2">Last Sync: {connectionStatus?.lastSync ?? '-'}</Typography>
                      {connectionStatus?.error ? (
                        <Alert severity="error">{connectionStatus.error}</Alert>
                      ) : null}
                    </Stack>
                  )}
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => void runConnectionTest()}
                    disabled={isTestingConnection}
                  >
                    Test Connection
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Open Orders
                  </Typography>
                  <Stack spacing={0.5}>
                    {isExchangeOrdersError ? (
                      <Alert severity="warning">
                        {getApiErrorMessage(
                          exchangeOrdersError,
                          'Unable to load open orders for the live environment.'
                        )}
                      </Alert>
                    ) : exchangeOrders.length === 0 ? (
                      <Typography variant="body2">No open orders reported.</Typography>
                    ) : (
                      exchangeOrders.slice(0, 10).map((order) => (
                        <Typography key={order.id} variant="caption">
                          #{order.id} {order.symbol} {order.side} @ {order.entryPrice} ({order.quantity}){' '}
                          [{order.status}]
                        </Typography>
                      ))
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {activeTab === 'audit' ? (
          <OperatorAuditPanel />
        ) : null}
      </Box>
    </AppLayout>
  );
}
