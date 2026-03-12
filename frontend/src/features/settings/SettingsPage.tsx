import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import { useEffect, useMemo, useState } from 'react';

import {
  useGetExchangeBalanceQuery,
  useGetExchangeConnectionStatusQuery,
  useGetExchangeOrdersQuery,
  useGetSavedExchangeConnectionsQuery,
  useGetSystemInfoQuery,
  useActivateSavedExchangeConnectionMutation,
  useCreateSavedExchangeConnectionMutation,
  useDeleteSavedExchangeConnectionMutation,
  useTestExchangeConnectionMutation,
  useTriggerBackupMutation,
  useUpdateSavedExchangeConnectionMutation,
  type ExchangeConnectionProfile,
  type ExchangeConnectionProfileRequest,
} from './exchangeApi';
import { OperatorAuditPanel } from './OperatorAuditPanel';
import {
  selectCurrency,
  selectNotificationSettings,
  selectTextScale,
  selectTheme,
  selectTimezone,
  setCurrency,
  setNotificationSettings,
  setTextScale,
  setTheme,
  setTimezone,
  type NotificationSettings,
} from './settingsSlice';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { FieldTooltip } from '@/components/ui/FieldTooltip';
import {
  selectEnvironmentMode,
  setConnectedExchange,
  setEnvironmentMode,
  type EnvironmentMode,
} from '@/features/environment/environmentSlice';
import { getApiErrorMessage } from '@/services/api';
import { getErrorMessage } from '@/services/axiosClient';

type SettingsTab = 'api' | 'notifications' | 'display' | 'database' | 'exchange' | 'audit';

type DisplayDraft = {
  theme: 'light' | 'dark';
  currency: 'USD' | 'BTC';
  timezone: string;
  textScale: number;
  environmentMode: EnvironmentMode;
};

const EXCHANGE_OPTIONS = [
  { value: 'binance', label: 'Binance' },
  { value: 'coinbase', label: 'Coinbase' },
  { value: 'kraken', label: 'Kraken' },
  { value: 'bybit', label: 'Bybit' },
  { value: 'okx', label: 'OKX' },
  { value: 'kucoin', label: 'KuCoin' },
] as const;

const NEW_CONNECTION_VALUE = '__new_connection__';
const EMPTY_EXCHANGE_CONNECTIONS: ExchangeConnectionProfile[] = [];

const createEmptyConnectionDraft = (preferredExchange = 'binance'): ExchangeConnectionProfile => ({
  id: '',
  name: '',
  exchange: preferredExchange,
  apiKey: '',
  apiSecret: '',
  testnet: true,
  active: false,
});

const parseNumberInput = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getExchangeLabel = (exchange: string) =>
  EXCHANGE_OPTIONS.find((option) => option.value === exchange)?.label ??
  exchange.charAt(0).toUpperCase() + exchange.slice(1);

const areNotificationsEqual = (left: NotificationSettings, right: NotificationSettings) =>
  left.emailAlerts === right.emailAlerts &&
  left.telegramAlerts === right.telegramAlerts &&
  left.profitLossThreshold === right.profitLossThreshold &&
  left.drawdownThreshold === right.drawdownThreshold &&
  left.riskThreshold === right.riskThreshold;

const areConnectionsEqual = (left: ExchangeConnectionProfile, right: ExchangeConnectionProfile) =>
  left.name === right.name &&
  left.exchange === right.exchange &&
  left.apiKey === right.apiKey &&
  left.apiSecret === right.apiSecret &&
  left.testnet === right.testnet;

const createConnectionName = (exchange: string, existingConnections: ExchangeConnectionProfile[]) => {
  const baseLabel = getExchangeLabel(exchange);
  const sameExchangeCount = existingConnections.filter((connection) => connection.exchange === exchange).length;
  return `${baseLabel} Connection ${sameExchangeCount + 1}`;
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
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [revealApiKey, setRevealApiKey] = useState(false);
  const [revealSecret, setRevealSecret] = useState(false);
  const [displayDraft, setDisplayDraft] = useState<DisplayDraft>({
    theme,
    currency,
    timezone,
    textScale,
    environmentMode,
  });
  const [notificationDraft, setNotificationDraft] = useState<NotificationSettings>(notifications);
  const [connectionDraft, setConnectionDraft] = useState<ExchangeConnectionProfile>(() =>
    createEmptyConnectionDraft()
  );

  const { data: systemInfo, isError: isSystemInfoError } = useGetSystemInfoQuery();
  const {
    data: exchangeBalance,
    refetch: refetchBalance,
    isError: isExchangeBalanceError,
    error: exchangeBalanceError,
  } = useGetExchangeBalanceQuery(undefined, {
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
  const {
    data: savedConnectionsData,
    isError: isSavedConnectionsError,
    error: savedConnectionsError,
    refetch: refetchSavedConnections,
  } = useGetSavedExchangeConnectionsQuery();
  const [createSavedConnection, { isLoading: isCreatingConnection }] =
    useCreateSavedExchangeConnectionMutation();
  const [updateSavedConnection, { isLoading: isUpdatingConnection }] =
    useUpdateSavedExchangeConnectionMutation();
  const [activateSavedConnection, { isLoading: isActivatingConnection }] =
    useActivateSavedExchangeConnectionMutation();
  const [deleteSavedConnection, { isLoading: isDeletingConnection }] =
    useDeleteSavedExchangeConnectionMutation();
  const [testConnection, { isLoading: isTestingConnection }] = useTestExchangeConnectionMutation();
  const [triggerBackup, { isLoading: isBackingUp }] = useTriggerBackupMutation();

  const exchangeConnections = savedConnectionsData?.connections ?? EMPTY_EXCHANGE_CONNECTIONS;
  const activeExchangeConnectionId = savedConnectionsData?.activeConnectionId ?? null;
  const activeExchangeConnection =
    exchangeConnections.find((connection) => connection.id === activeExchangeConnectionId) ?? null;

  const timezoneOptions = useMemo(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = ['UTC', detected, 'Europe/Prague', 'America/New_York', 'Asia/Tokyo'];
    return Array.from(new Set(options));
  }, []);

  const selectedSavedConnection =
    exchangeConnections.find((connection) => connection.id === selectedConnectionId) ?? null;

  const emptyConnectionDraft = useMemo(
    () => createEmptyConnectionDraft(activeExchangeConnection?.exchange ?? 'binance'),
    [activeExchangeConnection?.exchange]
  );
  const isSavingConnection = isCreatingConnection || isUpdatingConnection;

  useEffect(() => {
    setDisplayDraft({
      theme,
      currency,
      timezone,
      textScale,
      environmentMode,
    });
  }, [theme, currency, timezone, textScale, environmentMode]);

  useEffect(() => {
    setNotificationDraft(notifications);
  }, [notifications]);

  useEffect(() => {
    dispatch(setConnectedExchange(activeExchangeConnection?.exchange ?? null));
  }, [activeExchangeConnection?.exchange, dispatch]);

  useEffect(() => {
    const isCreatingNewConnection = selectedConnectionId === NEW_CONNECTION_VALUE;
    const nextSelectedConnectionId =
      isCreatingNewConnection ||
      (selectedConnectionId &&
        exchangeConnections.some((connection) => connection.id === selectedConnectionId))
        ? selectedConnectionId
        : activeExchangeConnectionId ?? exchangeConnections[0]?.id ?? '';

    if (nextSelectedConnectionId !== selectedConnectionId) {
      setSelectedConnectionId(nextSelectedConnectionId);
      return;
    }

    const nextConnectionDraft = isCreatingNewConnection
      ? emptyConnectionDraft
      : exchangeConnections.find((connection) => connection.id === nextSelectedConnectionId) ??
        emptyConnectionDraft;

    setConnectionDraft((current) => {
      const draftChanged =
        current.id !== nextConnectionDraft.id ||
        current.active !== nextConnectionDraft.active ||
        current.updatedAt !== nextConnectionDraft.updatedAt ||
        !areConnectionsEqual(current, nextConnectionDraft);

      return draftChanged ? { ...nextConnectionDraft } : current;
    });
    setRevealApiKey(false);
    setRevealSecret(false);
  }, [
    activeExchangeConnectionId,
    emptyConnectionDraft,
    exchangeConnections,
    selectedConnectionId,
  ]);

  const hasDisplayChanges =
    displayDraft.theme !== theme ||
    displayDraft.currency !== currency ||
    displayDraft.timezone !== timezone ||
    displayDraft.textScale !== textScale ||
    displayDraft.environmentMode !== environmentMode;

  const hasNotificationChanges = !areNotificationsEqual(notificationDraft, notifications);

  const hasConnectionChanges = selectedSavedConnection
    ? !areConnectionsEqual(selectedSavedConnection, connectionDraft)
    : !areConnectionsEqual(emptyConnectionDraft, connectionDraft);

  const canSaveConnection =
    selectedSavedConnection !== null ||
    connectionDraft.name.trim().length > 0 ||
    connectionDraft.apiKey.trim().length > 0 ||
    connectionDraft.apiSecret.trim().length > 0 ||
    connectionDraft.exchange !== emptyConnectionDraft.exchange ||
    connectionDraft.testnet !== emptyConnectionDraft.testnet;

  const canDeleteSelectedConnection = Boolean(selectedSavedConnection);

  const saveDisplaySettings = () => {
    dispatch(setTheme(displayDraft.theme));
    dispatch(setCurrency(displayDraft.currency));
    dispatch(setTimezone(displayDraft.timezone));
    dispatch(setTextScale(displayDraft.textScale));
    dispatch(setEnvironmentMode(displayDraft.environmentMode));
    setFeedback({ severity: 'success', message: 'Display settings saved and applied.' });
  };

  const saveNotificationSettings = () => {
    dispatch(setNotificationSettings(notificationDraft));
    setFeedback({ severity: 'success', message: 'Notification settings saved.' });
  };

  const saveConnectionProfile = async () => {
    const normalizedExchange = connectionDraft.exchange.trim().toLowerCase() || 'binance';
    const request: ExchangeConnectionProfileRequest = {
      name:
        connectionDraft.name.trim() ||
        selectedSavedConnection?.name ||
        createConnectionName(normalizedExchange, exchangeConnections),
      exchange: normalizedExchange,
      apiKey: connectionDraft.apiKey.trim(),
      apiSecret: connectionDraft.apiSecret.trim(),
      testnet: connectionDraft.testnet,
    };

    try {
      const savedProfile = selectedSavedConnection
        ? await updateSavedConnection({
            id: selectedSavedConnection.id,
            body: request,
          }).unwrap()
        : await createSavedConnection(request).unwrap();

      await refetchSavedConnections();
      setSelectedConnectionId(savedProfile.id);
      setConnectionDraft(savedProfile);
      setRevealApiKey(false);
      setRevealSecret(false);
      setFeedback({
        severity: 'success',
        message: `${savedProfile.name} saved to the database. Use "Set Active" to switch the bot to this connection profile.`,
      });
    } catch (error) {
      setFeedback({
        severity: 'error',
        message: getErrorMessage(error),
      });
    }
  };

  const activateSelectedConnection = async () => {
    if (!selectedSavedConnection) {
      setFeedback({
        severity: 'warning',
        message: 'Save this connection profile before making it active.',
      });
      return;
    }

    try {
      const activeProfile = await activateSavedConnection(selectedSavedConnection.id).unwrap();
      await refetchSavedConnections();
      setSelectedConnectionId(activeProfile.id);
      setFeedback({
        severity: 'success',
        message: `${activeProfile.name} is now the active bot connection.`,
      });
    } catch (error) {
      setFeedback({
        severity: 'error',
        message: getErrorMessage(error),
      });
    }
  };

  const deleteSelectedConnection = async () => {
    if (!selectedSavedConnection) {
      setConnectionDraft(emptyConnectionDraft);
      setRevealApiKey(false);
      setRevealSecret(false);
      return;
    }

    try {
      const deletedName = selectedSavedConnection.name;
      await deleteSavedConnection(selectedSavedConnection.id).unwrap();
      await refetchSavedConnections();
      setSelectedConnectionId(NEW_CONNECTION_VALUE);
      setConnectionDraft(emptyConnectionDraft);
      setRevealApiKey(false);
      setRevealSecret(false);
      setFeedback({
        severity: 'warning',
        message: `${deletedName} was removed from saved connections.`,
      });
    } catch (error) {
      setFeedback({
        severity: 'error',
        message: getErrorMessage(error),
      });
    }
  };

  const runConnectionTest = async (profile: ExchangeConnectionProfile) => {
    try {
      const result = await testConnection({
        exchange: profile.exchange,
        apiKey: profile.apiKey,
        apiSecret: profile.apiSecret,
        testnet: profile.testnet,
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
          Save-first configuration for paper trading, backtesting, and safe development workflow.
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
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        API Configuration
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Connection edits stay in draft until you save them. Saved profiles live in the database and the
                        bot uses the currently active saved connection.
                      </Typography>
                    </Box>

                    {isSavedConnectionsError ? (
                      <Alert severity="warning">
                        {getApiErrorMessage(
                          savedConnectionsError,
                          'Unable to load saved exchange connections from the database.'
                        )}
                      </Alert>
                    ) : null}

                    <FieldTooltip title="Choose a saved connection profile or start a new one, similar to selecting a saved database connection.">
                      <FormControl fullWidth>
                        <InputLabel id="saved-connection-label">Saved Connection</InputLabel>
                        <Select
                          labelId="saved-connection-label"
                          value={selectedConnectionId || NEW_CONNECTION_VALUE}
                          label="Saved Connection"
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setSelectedConnectionId(nextValue);
                          }}
                        >
                          {exchangeConnections.map((connection) => (
                            <MenuItem key={connection.id} value={connection.id}>
                              {connection.name}
                              {connection.id === activeExchangeConnectionId ? ' (Active)' : ''}
                            </MenuItem>
                          ))}
                          <MenuItem value={NEW_CONNECTION_VALUE}>New connection...</MenuItem>
                        </Select>
                      </FormControl>
                    </FieldTooltip>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => {
                          setSelectedConnectionId(NEW_CONNECTION_VALUE);
                          setConnectionDraft(emptyConnectionDraft);
                          setRevealApiKey(false);
                          setRevealSecret(false);
                        }}
                      >
                        New Connection
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => void deleteSelectedConnection()}
                        disabled={!canDeleteSelectedConnection || isDeletingConnection}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => void activateSelectedConnection()}
                        disabled={
                          !selectedSavedConnection ||
                          selectedConnectionId === activeExchangeConnectionId ||
                          isActivatingConnection
                        }
                      >
                        Set Active
                      </Button>
                    </Stack>

                    <FieldTooltip title="Friendly name shown in the connection dropdown and active-profile summary.">
                      <TextField
                        label="Connection Name"
                        value={connectionDraft.name}
                        onChange={(event) =>
                          setConnectionDraft((prev) => ({ ...prev, name: event.target.value }))
                        }
                        helperText="Saved in the database for your account, similar to a named SQL Developer connection."
                      />
                    </FieldTooltip>

                    <FieldTooltip title="Select which exchange this saved connection profile belongs to. Only Binance connectivity testing is wired in the backend right now.">
                      <FormControl fullWidth>
                        <InputLabel id="exchange-label">Exchange</InputLabel>
                        <Select
                          labelId="exchange-label"
                          value={connectionDraft.exchange}
                          label="Exchange"
                          onChange={(event) =>
                            setConnectionDraft((prev) => ({
                              ...prev,
                              exchange: event.target.value,
                            }))
                          }
                        >
                          {EXCHANGE_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </FieldTooltip>

                    <FieldTooltip title="Exchange credential identifier. Revealing keys on shared screens is a security risk.">
                      <TextField
                        label="Exchange API Key"
                        type={revealApiKey ? 'text' : 'password'}
                        value={connectionDraft.apiKey}
                        onChange={(event) =>
                          setConnectionDraft((prev) => ({ ...prev, apiKey: event.target.value }))
                        }
                        helperText="Stored in the database for this account until you edit or remove the connection."
                      />
                    </FieldTooltip>
                    <Button variant="outlined" onClick={() => setRevealApiKey((prev) => !prev)}>
                      {revealApiKey ? 'Hide API Key' : 'Reveal API Key'}
                    </Button>

                    <FieldTooltip title="Secret used for signed exchange requests. Exposure can compromise account safety.">
                      <TextField
                        label="Exchange API Secret"
                        type={revealSecret ? 'text' : 'password'}
                        value={connectionDraft.apiSecret}
                        onChange={(event) =>
                          setConnectionDraft((prev) => ({ ...prev, apiSecret: event.target.value }))
                        }
                        helperText="Stored in the database for this account. Save changes before activating the profile."
                      />
                    </FieldTooltip>
                    <Button variant="outlined" onClick={() => setRevealSecret((prev) => !prev)}>
                      {revealSecret ? 'Hide Secret' : 'Reveal Secret'}
                    </Button>

                    <FieldTooltip title="Use testnet for paper-safe credentials. Turn this off only when you intentionally want a live/mainnet connection profile.">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={connectionDraft.testnet}
                            onChange={(event) =>
                              setConnectionDraft((prev) => ({
                                ...prev,
                                testnet: event.target.checked,
                              }))
                            }
                          />
                        }
                        label={connectionDraft.testnet ? 'Use testnet / paper credentials' : 'Use mainnet / live credentials'}
                      />
                    </FieldTooltip>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<SaveOutlinedIcon />}
                        onClick={() => void saveConnectionProfile()}
                        disabled={!canSaveConnection || !hasConnectionChanges || isSavingConnection}
                      >
                        Save Connection
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => void runConnectionTest(connectionDraft)}
                        disabled={isTestingConnection}
                      >
                        Test This Connection
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Connection Library
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Active profile
                      </Typography>
                      <Typography variant="body1">
                        {activeExchangeConnection?.name ?? 'No active connection selected'}
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        activeExchangeConnection
                          ? activeExchangeConnection.testnet
                            ? 'Paper configuration'
                            : 'Live configuration'
                          : 'No active configuration'
                      }
                      color={
                        activeExchangeConnection
                          ? activeExchangeConnection.testnet
                            ? 'success'
                            : 'error'
                          : 'default'
                      }
                      variant="outlined"
                    />
                    <Typography variant="body2">
                      Exchange: {activeExchangeConnection ? getExchangeLabel(activeExchangeConnection.exchange) : '-'}
                    </Typography>
                    <Typography variant="body2">
                      Scope:{' '}
                      {activeExchangeConnection
                        ? activeExchangeConnection.testnet
                          ? 'Testnet / paper-safe'
                          : 'Mainnet / live'
                        : '-'}
                    </Typography>
                    <Typography variant="body2">Saved profiles: {exchangeConnections.length}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Saved profiles are loaded from the database on startup. The backend currently supports live
                      connectivity testing for Binance only. Other exchanges can still be saved now and wired later.
                    </Typography>
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
              <Alert severity="info" sx={{ mb: 2 }}>
                Notification edits stay in draft until you save them.
              </Alert>
              <Stack spacing={2}>
                <FieldTooltip title="Enable/disable email alerts. Disabling can delay awareness of critical risk events.">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationDraft.emailAlerts}
                        onChange={(event) =>
                          setNotificationDraft((prev) => ({
                            ...prev,
                            emailAlerts: event.target.checked,
                          }))
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
                        checked={notificationDraft.telegramAlerts}
                        onChange={(event) =>
                          setNotificationDraft((prev) => ({
                            ...prev,
                            telegramAlerts: event.target.checked,
                          }))
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
                    value={notificationDraft.profitLossThreshold}
                    onChange={(event) =>
                      setNotificationDraft((prev) => ({
                        ...prev,
                        profitLossThreshold: parseNumberInput(event.target.value, prev.profitLossThreshold),
                      }))
                    }
                    helperText="Threshold for PnL alert generation."
                  />
                </FieldTooltip>
                <FieldTooltip title="Drawdown alert trigger. Lower values warn earlier but may be more frequent.">
                  <TextField
                    label="Drawdown Threshold (%)"
                    type="number"
                    value={notificationDraft.drawdownThreshold}
                    onChange={(event) =>
                      setNotificationDraft((prev) => ({
                        ...prev,
                        drawdownThreshold: parseNumberInput(event.target.value, prev.drawdownThreshold),
                      }))
                    }
                    helperText="Percent drawdown level that emits warning notifications."
                  />
                </FieldTooltip>
                <FieldTooltip title="Risk alert trigger. Higher values can delay warning of concentrated exposure.">
                  <TextField
                    label="Risk Threshold (%)"
                    type="number"
                    value={notificationDraft.riskThreshold}
                    onChange={(event) =>
                      setNotificationDraft((prev) => ({
                        ...prev,
                        riskThreshold: parseNumberInput(event.target.value, prev.riskThreshold),
                      }))
                    }
                    helperText="Percent utilization threshold for risk alerts."
                  />
                </FieldTooltip>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={saveNotificationSettings}
                    disabled={!hasNotificationChanges}
                  >
                    Save Notifications
                  </Button>
                  <Button variant="outlined" onClick={() => setNotificationDraft(notifications)}>
                    Revert Draft
                  </Button>
                </Stack>
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
              <Alert severity="info" sx={{ mb: 2 }}>
                Display and environment changes apply only after you save them.
              </Alert>
              <Stack spacing={2}>
                <FieldTooltip title="Visual theme preference only. Does not change trading logic or risk behavior.">
                  <FormControl fullWidth>
                    <InputLabel id="theme-label">Theme</InputLabel>
                    <Select
                      labelId="theme-label"
                      value={displayDraft.theme}
                      label="Theme"
                      onChange={(event) =>
                        setDisplayDraft((prev) => ({
                          ...prev,
                          theme: event.target.value,
                        }))
                      }
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
                      value={displayDraft.currency}
                      label="Currency Display"
                      onChange={(event) =>
                        setDisplayDraft((prev) => ({
                          ...prev,
                          currency: event.target.value,
                        }))
                      }
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
                      value={displayDraft.timezone}
                      label="Timezone"
                      onChange={(event) =>
                        setDisplayDraft((prev) => ({
                          ...prev,
                          timezone: event.target.value,
                        }))
                      }
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
                    value={displayDraft.textScale}
                    inputProps={{ min: 1, max: 2, step: 0.1 }}
                    onChange={(event) =>
                      setDisplayDraft((prev) => ({
                        ...prev,
                        textScale: parseNumberInput(event.target.value, prev.textScale),
                      }))
                    }
                    helperText="Supports accessibility scaling up to 200%."
                  />
                </FieldTooltip>

                <FieldTooltip title="Critical operating mode selector. Save before it takes effect across API requests and dashboards.">
                  <FormControl fullWidth>
                    <InputLabel id="environment-label">Active Mode</InputLabel>
                    <Select
                      labelId="environment-label"
                      value={displayDraft.environmentMode}
                      label="Active Mode"
                      onChange={(event) =>
                        setDisplayDraft((prev) => ({
                          ...prev,
                          environmentMode: event.target.value as EnvironmentMode,
                        }))
                      }
                    >
                      <MenuItem value="test">Test / Paper (recommended)</MenuItem>
                      <MenuItem value="live">Live data view</MenuItem>
                    </Select>
                  </FormControl>
                </FieldTooltip>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={saveDisplaySettings}
                    disabled={!hasDisplayChanges}
                  >
                    Save Display Settings
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() =>
                      setDisplayDraft({
                        theme: 'light',
                        currency: 'USD',
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        textScale: 1,
                        environmentMode: 'test',
                      })
                    }
                  >
                    Reset Draft To Defaults
                  </Button>
                </Stack>
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
                        Active Profile: {activeExchangeConnection?.name ?? 'No active connection selected'}
                      </Typography>
                      <Typography variant="body2">
                        Exchange:{' '}
                        {exchangeBalance?.exchange ??
                          (activeExchangeConnection ? getExchangeLabel(activeExchangeConnection.exchange) : null) ??
                          connectionStatus?.exchange ??
                          'Live Exchange'}
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
                  {activeExchangeConnection ? (
                    <Stack spacing={1.5} sx={{ mb: 2 }}>
                      <Chip
                        label={activeExchangeConnection.testnet ? 'Paper configuration' : 'Live configuration'}
                        color={activeExchangeConnection.testnet ? 'success' : 'error'}
                        variant="outlined"
                      />
                      <Typography variant="body2">Profile: {activeExchangeConnection.name}</Typography>
                      <Typography variant="body2">
                        Exchange: {getExchangeLabel(activeExchangeConnection.exchange)}
                      </Typography>
                    </Stack>
                  ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No active connection is selected yet. Save and activate a connection in the API Config tab first.
                    </Alert>
                  )}
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
                        Last Check Connected: {connectionStatus?.connected ? 'Yes' : 'No'}
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
                    onClick={() => void (activeExchangeConnection ? runConnectionTest(activeExchangeConnection) : undefined)}
                    disabled={isTestingConnection || !activeExchangeConnection}
                  >
                    Test Active Connection
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
                          #{order.id} {order.symbol} {order.side} @ {order.entryPrice} ({order.quantity}) [{' '}
                          {order.status}]
                        </Typography>
                      ))
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {activeTab === 'audit' ? <OperatorAuditPanel /> : null}
      </Box>
    </AppLayout>
  );
}
