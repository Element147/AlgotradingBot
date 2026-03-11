import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import settingsReducer, { setCurrency, setTextScale, setTheme, setTimezone, type SettingsState } from './settingsSlice';

const createState = (): SettingsState => ({
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
});

describe('settings persistence properties', () => {
  it('persists arbitrary preference changes to localStorage', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<'light' | 'dark'>('light', 'dark'),
        fc.constantFrom<'USD' | 'BTC'>('USD', 'BTC'),
        fc.constantFrom('UTC', 'Europe/Prague', 'America/New_York', 'Asia/Tokyo'),
        fc.double({ min: 1, max: 2, noNaN: true }),
        (theme, currency, timezone, textScale) => {
          let state = settingsReducer(createState(), setTheme(theme));
          state = settingsReducer(state, setCurrency(currency));
          state = settingsReducer(state, setTimezone(timezone));
          state = settingsReducer(state, setTextScale(Number(textScale.toFixed(1))));

          expect(localStorage.getItem('theme')).toBe(theme);
          expect(localStorage.getItem('currency')).toBe(currency);
          expect(localStorage.getItem('timezone')).toBe(timezone);
          expect(localStorage.getItem('textScale')).toBe(String(state.textScale));
        }
      ),
      { numRuns: 150 }
    );
  });

  it('restores persisted values round-trip from localStorage', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<'light' | 'dark'>('light', 'dark'),
        fc.constantFrom<'USD' | 'BTC'>('USD', 'BTC'),
        fc.constantFrom('UTC', 'Europe/Prague', 'America/New_York', 'Asia/Tokyo'),
        (theme, currency, timezone) => {
          localStorage.setItem('theme', theme);
          localStorage.setItem('currency', currency);
          localStorage.setItem('timezone', timezone);
          localStorage.setItem('textScale', '1.3');

          const restored = settingsReducer(undefined, { type: 'noop' });
          expect(restored.theme).toBe(theme);
          expect(restored.currency).toBe(currency);
          expect(restored.timezone).toBe(timezone);
          expect(restored.textScale).toBe(1.3);
        }
      ),
      { numRuns: 120 }
    );
  });
});
