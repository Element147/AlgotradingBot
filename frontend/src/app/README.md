# App Store

This directory contains the shared Redux store and typed hooks.

## Current Files

### `store.ts`

Owns the app-wide Redux configuration.

Current store contents:

- Redux slices: `auth`, `environment`, `settings`, `websocket`
- RTK Query slices: `authApi`, `accountApi`, `backtestApi`, `marketDataApi`, `riskApi`, `exchangeApi`, `paperApi`, `strategiesApi`, `tradesApi`
- WebSocket middleware for live cache updates

The store enables Redux DevTools in development and sets up refetch-on-focus and refetch-on-reconnect behavior.

### `hooks.ts`

Provides typed hooks:

- `useAppDispatch`
- `useAppSelector`

Use these instead of the untyped React Redux hooks.

## Working Rules

- Add new backend contract adaptation in RTK Query slices first.
- Add new app-wide UI state only when it truly belongs outside a feature module.
- Keep environment-aware behavior explicit.
- Update `docs/guides/FRONTEND_IMPLEMENTATION.md` if the store structure changes materially.
