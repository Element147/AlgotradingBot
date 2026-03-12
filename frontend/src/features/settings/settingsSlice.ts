import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface NotificationSettings {
  emailAlerts: boolean;
  telegramAlerts: boolean;
  profitLossThreshold: number;
  drawdownThreshold: number;
  riskThreshold: number;
}

export interface ExchangeConnectionProfile {
  id: string;
  name: string;
  exchange: string;
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
}

/**
 * Settings state interface
 * Manages user preferences and saved exchange connections.
 */
export interface SettingsState {
  theme: 'light' | 'dark';
  currency: 'USD' | 'BTC';
  timezone: string;
  textScale: number;
  notifications: NotificationSettings;
  exchangeConnections?: ExchangeConnectionProfile[];
  activeExchangeConnectionId?: string | null;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailAlerts: true,
  telegramAlerts: false,
  profitLossThreshold: 5,
  drawdownThreshold: 15,
  riskThreshold: 75,
};

const EXCHANGE_CONNECTIONS_STORAGE_KEY = 'exchangeConnections';
const ACTIVE_EXCHANGE_CONNECTION_ID_STORAGE_KEY = 'activeExchangeConnectionId';

const DEFAULT_EXCHANGE_CONNECTIONS: ExchangeConnectionProfile[] = [
  {
    id: 'binance-paper',
    name: 'Binance Paper',
    exchange: 'binance',
    apiKey: '',
    apiSecret: '',
    testnet: true,
  },
];

const parseNotifications = (raw: string | null): NotificationSettings => {
  if (!raw) {
    return DEFAULT_NOTIFICATIONS;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
    return {
      emailAlerts: parsed.emailAlerts ?? DEFAULT_NOTIFICATIONS.emailAlerts,
      telegramAlerts: parsed.telegramAlerts ?? DEFAULT_NOTIFICATIONS.telegramAlerts,
      profitLossThreshold:
        parsed.profitLossThreshold ?? DEFAULT_NOTIFICATIONS.profitLossThreshold,
      drawdownThreshold: parsed.drawdownThreshold ?? DEFAULT_NOTIFICATIONS.drawdownThreshold,
      riskThreshold: parsed.riskThreshold ?? DEFAULT_NOTIFICATIONS.riskThreshold,
    };
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
};

const parseExchangeConnections = (raw: string | null): ExchangeConnectionProfile[] => {
  if (!raw) {
    return DEFAULT_EXCHANGE_CONNECTIONS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ExchangeConnectionProfile>[];
    const normalized = parsed
      .filter((connection): connection is Partial<ExchangeConnectionProfile> => Boolean(connection))
      .map((connection, index) => ({
        id: connection.id?.trim() || `saved-connection-${index + 1}`,
        name: connection.name?.trim() || `Connection ${index + 1}`,
        exchange: connection.exchange?.trim().toLowerCase() || 'binance',
        apiKey: connection.apiKey ?? '',
        apiSecret: connection.apiSecret ?? '',
        testnet: connection.testnet ?? true,
      }));

    return normalized.length > 0 ? normalized : DEFAULT_EXCHANGE_CONNECTIONS;
  } catch {
    return DEFAULT_EXCHANGE_CONNECTIONS;
  }
};

const persistNotifications = (notifications: NotificationSettings) => {
  localStorage.setItem('notificationSettings', JSON.stringify(notifications));
};

const persistExchangeConnections = (connections: ExchangeConnectionProfile[]) => {
  localStorage.setItem(EXCHANGE_CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
};

const persistActiveExchangeConnectionId = (connectionId: string | null) => {
  if (connectionId) {
    localStorage.setItem(ACTIVE_EXCHANGE_CONNECTION_ID_STORAGE_KEY, connectionId);
    return;
  }

  localStorage.removeItem(ACTIVE_EXCHANGE_CONNECTION_ID_STORAGE_KEY);
};

const getSavedExchangeConnections = () =>
  parseExchangeConnections(localStorage.getItem(EXCHANGE_CONNECTIONS_STORAGE_KEY));

const resolveActiveExchangeConnectionId = (connections: ExchangeConnectionProfile[]) => {
  const savedActiveId = localStorage.getItem(ACTIVE_EXCHANGE_CONNECTION_ID_STORAGE_KEY);

  if (savedActiveId && connections.some((connection) => connection.id === savedActiveId)) {
    return savedActiveId;
  }

  return connections[0]?.id ?? null;
};

/**
 * Initialize settings from localStorage or use defaults.
 */
const initializeSettings = (): SettingsState => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  const savedCurrency = localStorage.getItem('currency') as 'USD' | 'BTC' | null;
  const savedTimezone = localStorage.getItem('timezone');
  const savedTextScale = Number(localStorage.getItem('textScale') ?? '1');
  const notifications = parseNotifications(localStorage.getItem('notificationSettings'));
  const exchangeConnections = getSavedExchangeConnections();

  return {
    theme: savedTheme || 'light',
    currency: savedCurrency || 'USD',
    timezone: savedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    textScale: Number.isFinite(savedTextScale) && savedTextScale >= 1 ? savedTextScale : 1,
    notifications,
    exchangeConnections,
    activeExchangeConnectionId: resolveActiveExchangeConnectionId(exchangeConnections),
  };
};

const initialState: SettingsState = initializeSettings();

/**
 * Settings slice
 * Manages user preferences with localStorage persistence.
 */
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setCurrency: (state, action: PayloadAction<'USD' | 'BTC'>) => {
      state.currency = action.payload;
      localStorage.setItem('currency', action.payload);
    },
    setTimezone: (state, action: PayloadAction<string>) => {
      state.timezone = action.payload;
      localStorage.setItem('timezone', action.payload);
    },
    setTextScale: (state, action: PayloadAction<number>) => {
      state.textScale = action.payload;
      localStorage.setItem('textScale', String(action.payload));
    },
    setNotificationSettings: (state, action: PayloadAction<NotificationSettings>) => {
      state.notifications = action.payload;
      persistNotifications(action.payload);
    },
    updateNotificationSetting: (
      state,
      action: PayloadAction<{
        key: keyof NotificationSettings;
        value: NotificationSettings[keyof NotificationSettings];
      }>
    ) => {
      const { key, value } = action.payload;
      state.notifications[key] = value as never;
      persistNotifications(state.notifications);
    },
    upsertExchangeConnection: (state, action: PayloadAction<ExchangeConnectionProfile>) => {
      const existingConnections = state.exchangeConnections ?? DEFAULT_EXCHANGE_CONNECTIONS;
      const nextConnections = [...existingConnections];
      const index = nextConnections.findIndex((connection) => connection.id === action.payload.id);

      if (index >= 0) {
        nextConnections[index] = action.payload;
      } else {
        nextConnections.push(action.payload);
      }

      state.exchangeConnections = nextConnections;
      if (!state.activeExchangeConnectionId) {
        state.activeExchangeConnectionId = action.payload.id;
      }

      persistExchangeConnections(nextConnections);
      persistActiveExchangeConnectionId(state.activeExchangeConnectionId ?? null);
    },
    deleteExchangeConnection: (state, action: PayloadAction<string>) => {
      const existingConnections = state.exchangeConnections ?? DEFAULT_EXCHANGE_CONNECTIONS;
      const nextConnections = existingConnections.filter((connection) => connection.id !== action.payload);

      state.exchangeConnections =
        nextConnections.length > 0 ? nextConnections : DEFAULT_EXCHANGE_CONNECTIONS;

      if (
        !state.activeExchangeConnectionId ||
        state.activeExchangeConnectionId === action.payload ||
        !state.exchangeConnections.some((connection) => connection.id === state.activeExchangeConnectionId)
      ) {
        state.activeExchangeConnectionId = state.exchangeConnections[0]?.id ?? null;
      }

      persistExchangeConnections(state.exchangeConnections);
      persistActiveExchangeConnectionId(state.activeExchangeConnectionId ?? null);
    },
    setActiveExchangeConnection: (state, action: PayloadAction<string | null>) => {
      const nextActiveId =
        action.payload && (state.exchangeConnections ?? DEFAULT_EXCHANGE_CONNECTIONS).some((connection) => connection.id === action.payload)
          ? action.payload
          : (state.exchangeConnections ?? DEFAULT_EXCHANGE_CONNECTIONS)[0]?.id ?? null;

      state.activeExchangeConnectionId = nextActiveId;
      persistActiveExchangeConnectionId(nextActiveId);
    },
    resetSettings: (state) => {
      state.theme = 'light';
      state.currency = 'USD';
      state.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      state.textScale = 1;
      state.notifications = DEFAULT_NOTIFICATIONS;
      localStorage.removeItem('theme');
      localStorage.removeItem('currency');
      localStorage.removeItem('timezone');
      localStorage.removeItem('textScale');
      localStorage.removeItem('notificationSettings');
    },
  },
});

export const {
  setTheme,
  setCurrency,
  setTimezone,
  setTextScale,
  setNotificationSettings,
  updateNotificationSetting,
  upsertExchangeConnection,
  deleteExchangeConnection,
  setActiveExchangeConnection,
  resetSettings,
} = settingsSlice.actions;

type SettingsRootState = { settings: SettingsState };

export const selectTheme = (state: SettingsRootState) => state.settings.theme;
export const selectCurrency = (state: SettingsRootState) => state.settings.currency;
export const selectTimezone = (state: SettingsRootState) => state.settings.timezone;
export const selectTextScale = (state: SettingsRootState) => state.settings.textScale;
export const selectNotificationSettings = (state: SettingsRootState) => state.settings.notifications;
export const selectExchangeConnections = (state: SettingsRootState) =>
  state.settings.exchangeConnections ?? DEFAULT_EXCHANGE_CONNECTIONS;
export const selectActiveExchangeConnectionId = (state: SettingsRootState) =>
  state.settings.activeExchangeConnectionId ?? selectExchangeConnections(state)[0]?.id ?? null;
export const selectActiveExchangeConnection = (state: SettingsRootState) =>
  selectExchangeConnections(state).find(
    (connection) => connection.id === selectActiveExchangeConnectionId(state)
  ) ?? selectExchangeConnections(state)[0] ?? null;
export const selectSettings = (state: SettingsRootState) => state.settings;

export default settingsSlice.reducer;
