import { describe, expect, it, beforeEach, vi } from 'vitest';

import settingsReducer, {
  selectActiveExchangeConnection,
  resetSettings,
  selectCurrency,
  selectExchangeConnections,
  selectNotificationSettings,
  selectTextScale,
  selectTheme,
  selectTimezone,
  setActiveExchangeConnection,
  setCurrency,
  setTextScale,
  setTheme,
  setTimezone,
  upsertExchangeConnection,
  updateNotificationSetting,
  type SettingsState,
} from './settingsSlice';

const createBaseState = (): SettingsState => ({
  theme: 'light',
  currency: 'USD',
  timezone: 'UTC',
  textScale: 1,
  notifications: {
    emailAlerts: true,
    telegramAlerts: false,
    profitLossThreshold: 5,
    drawdownThreshold: 15,
    riskThreshold: 75,
  },
  exchangeConnections: [
    {
      id: 'binance-paper',
      name: 'Binance Paper',
      exchange: 'binance',
      apiKey: '',
      apiSecret: '',
      testnet: true,
    },
  ],
  activeExchangeConnectionId: 'binance-paper',
});

describe('settingsSlice', () => {
  beforeEach(() => {
    localStorage.clear();
    const dateTimeFormatMock = (() => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' }),
    })) as unknown as typeof Intl.DateTimeFormat;
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(dateTimeFormatMock);
  });

  it('updates and persists theme/currency/timezone', () => {
    let state = settingsReducer(createBaseState(), setTheme('dark'));
    state = settingsReducer(state, setCurrency('BTC'));
    state = settingsReducer(state, setTimezone('Europe/Prague'));

    expect(state.theme).toBe('dark');
    expect(state.currency).toBe('BTC');
    expect(state.timezone).toBe('Europe/Prague');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(localStorage.getItem('currency')).toBe('BTC');
    expect(localStorage.getItem('timezone')).toBe('Europe/Prague');
  });

  it('updates and persists text scale', () => {
    const state = settingsReducer(createBaseState(), setTextScale(1.7));
    expect(state.textScale).toBe(1.7);
    expect(localStorage.getItem('textScale')).toBe('1.7');
  });

  it('updates notification settings and persists JSON', () => {
    const state = settingsReducer(
      createBaseState(),
      updateNotificationSetting({ key: 'telegramAlerts', value: true })
    );
    expect(state.notifications.telegramAlerts).toBe(true);
    expect(localStorage.getItem('notificationSettings')).toContain('"telegramAlerts":true');
  });

  it('resets settings and clears storage keys', () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('currency', 'BTC');
    localStorage.setItem('timezone', 'UTC');
    localStorage.setItem('textScale', '1.5');
    localStorage.setItem('notificationSettings', '{"emailAlerts":false}');

    const state = settingsReducer(createBaseState(), resetSettings());
    expect(state.theme).toBe('light');
    expect(state.currency).toBe('USD');
    expect(state.timezone).toBe('America/New_York');
    expect(state.textScale).toBe(1);
    expect(localStorage.getItem('theme')).toBeNull();
    expect(localStorage.getItem('notificationSettings')).toBeNull();
  });

  it('saves exchange connections and active selection', () => {
    let state = settingsReducer(
      createBaseState(),
      upsertExchangeConnection({
        id: 'kraken-live',
        name: 'Kraken Live',
        exchange: 'kraken',
        apiKey: 'key',
        apiSecret: 'secret',
        testnet: false,
      })
    );
    state = settingsReducer(state, setActiveExchangeConnection('kraken-live'));

    expect(localStorage.getItem('exchangeConnections')).toContain('"kraken-live"');
    expect(localStorage.getItem('activeExchangeConnectionId')).toBe('kraken-live');
    expect(state.activeExchangeConnectionId).toBe('kraken-live');
  });

  it('selectors expose expected fields', () => {
    const settings = createBaseState();
    const root = { settings };
    expect(selectTheme(root)).toBe('light');
    expect(selectCurrency(root)).toBe('USD');
    expect(selectTimezone(root)).toBe('UTC');
    expect(selectTextScale(root)).toBe(1);
    expect(selectNotificationSettings(root).riskThreshold).toBe(75);
    expect(selectExchangeConnections(root)).toHaveLength(1);
    expect(selectActiveExchangeConnection(root)?.name).toBe('Binance Paper');
  });
});
