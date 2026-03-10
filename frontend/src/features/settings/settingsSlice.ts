import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

/**
 * Settings state interface
 * Manages user preferences for theme, currency, and timezone
 */
export interface SettingsState {
  theme: 'light' | 'dark';
  currency: 'USD' | 'BTC';
  timezone: string;
}

/**
 * Initialize settings from localStorage or use defaults
 */
const initializeSettings = (): SettingsState => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  const savedCurrency = localStorage.getItem('currency') as 'USD' | 'BTC' | null;
  const savedTimezone = localStorage.getItem('timezone');

  return {
    theme: savedTheme || 'light',
    currency: savedCurrency || 'USD',
    timezone: savedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

const initialState: SettingsState = initializeSettings();

/**
 * Settings slice
 * Manages user preferences with localStorage persistence
 * 
 * Features:
 * - Theme switching (light/dark)
 * - Currency preference (USD/BTC)
 * - Timezone selection
 * - Automatic localStorage persistence
 */
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    /**
     * Set theme preference
     * Persists to localStorage immediately
     */
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },

    /**
     * Set currency preference
     * Persists to localStorage immediately
     */
    setCurrency: (state, action: PayloadAction<'USD' | 'BTC'>) => {
      state.currency = action.payload;
      localStorage.setItem('currency', action.payload);
    },

    /**
     * Set timezone preference
     * Persists to localStorage immediately
     */
    setTimezone: (state, action: PayloadAction<string>) => {
      state.timezone = action.payload;
      localStorage.setItem('timezone', action.payload);
    },

    /**
     * Reset all settings to defaults
     * Clears localStorage
     */
    resetSettings: (state) => {
      state.theme = 'light';
      state.currency = 'USD';
      state.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      localStorage.removeItem('theme');
      localStorage.removeItem('currency');
      localStorage.removeItem('timezone');
    },
  },
});

// Export actions
export const { setTheme, setCurrency, setTimezone, resetSettings } = settingsSlice.actions;

// Export selectors
export const selectTheme = (state: RootState) => state.settings.theme;
export const selectCurrency = (state: RootState) => state.settings.currency;
export const selectTimezone = (state: RootState) => state.settings.timezone;
export const selectSettings = (state: RootState) => state.settings;

// Export reducer
export default settingsSlice.reducer;
