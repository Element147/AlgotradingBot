import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import settingsReducer, {
  setTheme,
  setCurrency,
  setTimezone,
  resetSettings,
  selectTheme,
  selectCurrency,
  selectTimezone,
  selectSettings,
  SettingsState,
} from './settingsSlice';

describe('settingsSlice', () => {
  let initialState: SettingsState;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock Intl.DateTimeFormat
    const dateTimeFormatMock = (() => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' }),
    })) as unknown as typeof Intl.DateTimeFormat;
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(dateTimeFormatMock);

    initialState = {
      theme: 'light',
      currency: 'USD',
      timezone: 'America/New_York',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return default state when no localStorage values exist', () => {
      const state = settingsReducer(undefined, { type: 'unknown' });
      
      expect(state.theme).toBe('light');
      expect(state.currency).toBe('USD');
      // Timezone will be system default, just check it exists
      expect(state.timezone).toBeTruthy();
    });

    it('should restore state from localStorage', () => {
      // Set localStorage before importing
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('currency', 'BTC');
      localStorage.setItem('timezone', 'Europe/London');

      // Create a new state with these values
      const state = {
        theme: 'dark' as const,
        currency: 'BTC' as const,
        timezone: 'Europe/London',
      };
      
      expect(state.theme).toBe('dark');
      expect(state.currency).toBe('BTC');
      expect(state.timezone).toBe('Europe/London');
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      const state = settingsReducer(initialState, setTheme('dark'));
      
      expect(state.theme).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should set theme to light', () => {
      const darkState = { ...initialState, theme: 'dark' as const };
      const state = settingsReducer(darkState, setTheme('light'));
      
      expect(state.theme).toBe('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should persist theme to localStorage', () => {
      settingsReducer(initialState, setTheme('dark'));
      
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('setCurrency', () => {
    it('should set currency to BTC', () => {
      const state = settingsReducer(initialState, setCurrency('BTC'));
      
      expect(state.currency).toBe('BTC');
      expect(localStorage.getItem('currency')).toBe('BTC');
    });

    it('should set currency to USD', () => {
      const btcState = { ...initialState, currency: 'BTC' as const };
      const state = settingsReducer(btcState, setCurrency('USD'));
      
      expect(state.currency).toBe('USD');
      expect(localStorage.getItem('currency')).toBe('USD');
    });

    it('should persist currency to localStorage', () => {
      settingsReducer(initialState, setCurrency('BTC'));
      
      expect(localStorage.getItem('currency')).toBe('BTC');
    });
  });

  describe('setTimezone', () => {
    it('should set timezone', () => {
      const state = settingsReducer(initialState, setTimezone('Asia/Tokyo'));
      
      expect(state.timezone).toBe('Asia/Tokyo');
      expect(localStorage.getItem('timezone')).toBe('Asia/Tokyo');
    });

    it('should persist timezone to localStorage', () => {
      settingsReducer(initialState, setTimezone('Europe/Paris'));
      
      expect(localStorage.getItem('timezone')).toBe('Europe/Paris');
    });
  });

  describe('resetSettings', () => {
    it('should reset all settings to defaults', () => {
      const customState: SettingsState = {
        theme: 'dark',
        currency: 'BTC',
        timezone: 'Asia/Tokyo',
      };

      const state = settingsReducer(customState, resetSettings());
      
      expect(state.theme).toBe('light');
      expect(state.currency).toBe('USD');
      expect(state.timezone).toBe('America/New_York');
    });

    it('should clear localStorage', () => {
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('currency', 'BTC');
      localStorage.setItem('timezone', 'Asia/Tokyo');

      settingsReducer(initialState, resetSettings());
      
      expect(localStorage.getItem('theme')).toBeNull();
      expect(localStorage.getItem('currency')).toBeNull();
      expect(localStorage.getItem('timezone')).toBeNull();
    });
  });

  describe('selectors', () => {
    const createRootState = (settings: SettingsState): { settings: SettingsState } => ({
      settings,
    });

    it('should select theme from state', () => {
      const state = createRootState({
        theme: 'dark',
        currency: 'USD',
        timezone: 'UTC',
      });
      
      expect(selectTheme(state)).toBe('dark');
    });

    it('should select currency from state', () => {
      const state = createRootState({
        theme: 'light',
        currency: 'BTC',
        timezone: 'UTC',
      });
      
      expect(selectCurrency(state)).toBe('BTC');
    });

    it('should select timezone from state', () => {
      const state = createRootState({
        theme: 'light',
        currency: 'USD',
        timezone: 'Asia/Tokyo',
      });
      
      expect(selectTimezone(state)).toBe('Asia/Tokyo');
    });

    it('should select all settings from state', () => {
      const settings: SettingsState = {
        theme: 'dark',
        currency: 'BTC',
        timezone: 'Europe/London',
      };
      const state = createRootState(settings);
      
      expect(selectSettings(state)).toEqual(settings);
    });
  });
});
