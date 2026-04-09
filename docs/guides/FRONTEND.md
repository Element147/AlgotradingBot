# Frontend Guide

Use this guide when the task is mainly in `frontend/`.

## Frontend Scope

The SPA provides:

- login and protected routes
- dashboard and alert views
- backtest execution and review
- market-data import management
- strategy management
- forward-testing, paper, and live-monitoring surfaces
- trade review, risk views, and settings

## Structure

- `src/features/*`: feature-level and route-level UI
- `src/app`: store and typed hooks
- `src/services`: API base query, OpenAPI helpers, WebSocket manager
- `src/components`: shared layout, guards, loading, error, and workspace primitives
- `src/theme`: design tokens and MUI overrides

Keep routes orchestration-first. Large sections should live in feature-local panels or helpers, not in oversized route files.

For larger features, prefer a consistent internal structure:

- `api`: RTK Query slices, transport normalization, and feature boundary exports
- `components`: feature-local UI panels and presentation building blocks
- `models`: feature-owned types that sit above transport types
- `state`: persisted UI state, view preferences, and selectors local to the feature
- `utils`: pure feature helpers

Avoid root-level feature outliers. If a file clearly belongs to one feature, keep it inside that feature and export it from the feature boundary when another feature needs it.

## App Shell

`frontend/src/App.tsx` mounts the theme, top-level error boundary, router, protected routes, and shared `WebSocketRuntime`.

Shared shell ownership:

- `components/layout/*`: app shell, header, sidebar, shared page framing
- `components/ui/Workbench.tsx`: shared workstation UI primitives
- `components/ui/InteractiveTable.tsx`: shared compact data-grid shell with persisted table state
- `components/workspace/*`: sticky inspectors and shared review surfaces

Pages should plug into this shell rather than recreate competing route chrome.

## State And Contract Rules

- Keep backend contract adaptation in RTK Query slices or transport helpers
- Use `frontend/src/generated/openapi.d.ts` as the transport source of truth
- Normalize transport shapes in feature-owned contract modules when needed
- Use shared environment helpers instead of hand-written `X-Environment` headers
- Treat backtest telemetry as a backend-owned read model
- Keep selection-mode and environment-mode quirks in API adapters or feature helpers, not route components

## Shared Table Pattern

Use the shared table shell for data-heavy route surfaces before introducing one-off table logic.

- `useInteractiveTableState()` owns persisted sorting, inline column filters, quick search, column sizing, column visibility, and page size per table surface.
- `InteractiveTable` is the default shell for compact MUI-backed tables. It provides sticky headers, drag-resize handles, inline filter row, quick search, reset, compact density defaults, and a shared `Columns` control with localStorage-backed visibility preferences.
- Backtest History is server-driven. The frontend should query `/api/backtests` with `page`, `pageSize`, `sortBy`, `sortDirection`, `search`, table filters, and range filters, and expect a paged envelope `{ items, total, page, pageSize }`.
- Dataset inventory, backtest comparison, and paper orders are currently client-side tables that still share the same shell and persistence model.
- Virtualized trade-review surfaces can keep TanStack Virtual, but their surrounding toolbar, density, status pills, filter language, and persisted column-layout preferences should stay aligned with the shared table shell instead of diverging visually.

## UI Rules

1. Preserve the feature-first structure.
2. Keep environment state visible and default-safe.
3. Keep cross-feature imports pointed at feature boundary exports when practical instead of reaching into another feature's internals.
4. Fix payload mismatches in API layers first.
5. Handle loading, empty, error, and success states intentionally.
6. Keep execution-sensitive settings explicit in the UI.
7. Avoid browser-only persistence for shared operational state or secrets.
8. Keep shared styling in the theme or shared shell before adding page-specific one-offs.

## Real-Time Behavior

WebSockets are used for:

- backtest progress
- market-data import progress

Runtime expectations:

- connect with `/ws?token=...&env=test|live`
- wait for backend `ack` messages before treating a subscription as active
- surface backend `error` messages clearly
- keep polling fallback visible when the socket is disconnected or not acknowledged

## Verification

```powershell
cd frontend
npm run lint
npm run test -- --watch=false
npm run build
```

Run `npm run contract:check` when the backend contract changes.
