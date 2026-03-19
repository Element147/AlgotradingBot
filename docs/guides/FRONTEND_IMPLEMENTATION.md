# Frontend Implementation Guide

Use this guide when the task is primarily in `frontend/`.

## Current Frontend Scope

The SPA currently provides:

- login and protected routes
- dashboard health, paper-trading, and alert views
- strategy management and configuration UX
- backtest execution, history, details, compare, replay, and export views
- market-data import job management
- trade review surfaces
- risk configuration and circuit-breaker visibility
- settings for exchange profiles, provider credentials, audit review, and display preferences

## App Shell

`frontend/src/App.tsx` mounts:

- theme selection
- top-level `ErrorBoundary`
- `BrowserRouter`
- protected routes
- shared `WebSocketRuntime`

Current route surfaces:

- `/login`
- `/dashboard`
- `/strategies`
- `/trades`
- `/backtest`
- `/market-data`
- `/risk`
- `/settings`

## State And Data Model

`frontend/src/app/store.ts` currently includes:

- Redux slices: `auth`, `environment`, `settings`, `websocket`
- RTK Query slices: `authApi`, `accountApi`, `backtestApi`, `marketDataApi`, `riskApi`, `exchangeApi`, `paperApi`, `strategiesApi`, `tradesApi`
- WebSocket middleware for live cache updates

Keep backend contract adaptation in these slices or transport helpers rather than in page components.

## Frontend Boundaries

- `src/features/*`: route-level and feature-level UI
- `src/app`: store and typed hooks
- `src/services`: API base query, WebSocket manager, and shared transport logic
- `src/components`: shared layout, guards, loading, and error handling primitives

## Implementation Rules

1. Preserve the feature-first structure.
2. Keep environment mode visible and default-safe.
3. Fix payload mismatches in API layers first.
4. Handle loading, empty, error, and success states in user-facing flows.
5. Keep execution-sensitive settings explicit in the UI.
6. Avoid browser-only persistence for shared operational state or secrets.

## Real-Time Behavior

The frontend currently uses WebSockets for live updates to:

- backtest progress
- market-data import progress

Pages must still present the operator with clear fallback behavior when the app is on polling rather than live push updates.

## Verification

Start with the narrowest relevant test or feature check, then expand:

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
```

If a backend contract changed, also run:

```powershell
npm run contract:check
```

## Companion Docs

- `ARCHITECTURE.md`
- `STRUCTURE.md`
- `frontend/README.md`
- `docs/guides/TESTING_AND_CONTRACTS.md`
