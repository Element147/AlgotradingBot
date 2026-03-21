# Frontend Implementation Guide

Use this guide when the task is primarily in `frontend/`.

## Current Frontend Scope

The SPA currently provides:

- login and protected routes
- dashboard health, paper-trading, and alert views
- paper order placement, fill/cancel controls, and order history
- strategy management and configuration UX
- backtest execution, history, details, compare, replay, and export views
- telemetry-rich backtest review with price-action, exposure, regime, indicator, equity, drawdown, and comparison visuals
- market-data import job management
- trade review surfaces
- risk configuration, circuit-breaker inventory, and override visibility
- settings for exchange profiles, provider credentials, audit review, and display preferences

## App Shell

`frontend/src/App.tsx` mounts:

- theme selection
- top-level `ErrorBoundary`
- `BrowserRouter`
- protected routes
- shared `WebSocketRuntime`

Shared shell ownership:

- `frontend/src/theme/theme.ts` defines the research-workstation design tokens, MUI component overrides, and global dense-data styling.
- `frontend/src/components/layout/AppLayout.tsx` owns the shell framing, skip-link, responsive sidebar behavior, and content-stage backdrop.
- `frontend/src/components/layout/Header.tsx` owns route-aware operator context, environment and connection badges, and session actions.
- `frontend/src/components/layout/Sidebar.tsx` owns grouped navigation, shell safety cues, and workstation branding.
- `frontend/src/components/layout/PageContent.tsx` owns the reusable page intro, metric-strip, and section-header primitives that standardize max-width, spacing, and primary-action placement across routes.
- `frontend/src/components/ui/Workbench.tsx` owns reusable workstation primitives such as `SurfacePanel`, `RouteActionBar`, `StatusPill`, `MetricCard`, `LegendList`, and unified empty states.
- `frontend/src/components/workspace/StickyInspectorPanel.tsx` owns the sticky detail rail and the mobile bottom-sheet inspector used by linked chart and table review flows.
- `frontend/src/components/LoadingFallback.tsx` and `frontend/src/components/ErrorFallback.tsx` should mirror the shell hierarchy instead of falling back to generic placeholder layouts.

Current route surfaces:

- `/login`
- `/dashboard`
- `/paper`
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

Current contract pattern:

- `frontend/src/generated/openapi.d.ts` is the transport contract source.
- `frontend/src/services/openapi.ts` provides path-indexed helper types so slices can bind request and response shapes directly to generated paths without copying transport interfaces by hand.
- Feature APIs own the transport boundary. `backtestContract.ts`, `authContract.ts`, and `accountContract.ts` normalize generated transport shapes into feature models before components consume them.
- Explicit environment overrides should go through `withEnvironmentMode(...)` in `frontend/src/services/api.ts` instead of hand-writing `X-Environment` headers inside slices.
- Simpler slices can stay thin when the feature type genuinely matches the transport shape, but any response normalization should move into a feature contract module instead of staying inline in page components or ad hoc endpoint code.
- Backtest form helpers should omit transport fields that are invalid for the selected strategy mode instead of fabricating placeholder values.
- Treat backtest telemetry as a backend-owned read model. Components may reshape it for chart rows, but they should not recompute indicators, exposure, or action timelines client-side.
- Paper-order, backtest, and other research-only surfaces must show explicit capability messaging when the environment switch is on `live`.

## Frontend Boundaries

- `src/features/*`: route-level and feature-level UI
- `src/app`: store and typed hooks
- `src/services`: API base query, WebSocket manager, and shared transport logic
- `src/components`: shared layout, guards, loading, and error handling primitives
- Route files should stay orchestration-first. Large UI sections belong in feature-local panel modules such as `BacktestPanels.tsx`, `MarketDataPanels.tsx`, and `SettingsPanels.tsx`, while page-only derivation and normalization helpers belong in small state/helper modules such as `backtestPageState.ts`, `marketDataPageState.ts`, and `tradesPageState.ts`.
- Treat the shell header as the primary route-title surface. Pages may add an intro card when they need workflow guidance or a clear primary action, but they should not recreate a competing page hero when the header already supplies route context.
- `features/backtest/BacktestWorkspaceChart.tsx` is the main price-action chart surface and uses `lightweight-charts`; keep marker interaction, overlay toggles, and focus-sync behavior there instead of scattering chart glue across route files.
- Review routes that benefit from shareable context should keep primary filters and selected entities in search params instead of local-only state. Backtest and Trades are the reference implementations for this pattern.

## Implementation Rules

1. Preserve the feature-first structure.
2. Keep environment mode visible and default-safe.
3. Fix payload mismatches in API layers first.
4. Handle loading, empty, error, and success states in user-facing flows.
5. Keep execution-sensitive settings explicit in the UI.
6. Avoid browser-only persistence for shared operational state or secrets.
7. Keep selection-mode or environment-mode quirks inside feature form helpers or API adapters, not route components.
8. Prefer feature container plus panel/helper splits once a route starts accumulating multiple cards, tables, or modal workflows.
9. Keep the visual system centralized in theme or shell components before adding one-off page styling; safety and environment cues should stay visually consistent across routes.
10. Standardize route spacing, card density, and responsive stacking with shared page primitives before reaching for page-specific layout overrides.

## Real-Time Behavior

The frontend currently uses WebSockets for live updates to:

- backtest progress
- market-data import progress

The verified runtime contract is:

- connect to `/ws?token=...&env=test|live` with an authenticated browser session token
- wait for backend `ack` control messages before treating a channel as subscribed
- surface backend `error` control messages without pretending the socket is fully subscribed
- keep polling fallback states visible whenever the socket is disconnected or a channel is not acknowledged

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
