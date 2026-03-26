# Structure

## Monorepo Layout

```text
C:\Git\algotradingbot\
  .github\workflows\     CI pipelines
  AlgotradingBot\        backend application
  contracts\             tracked OpenAPI artifact
  docs\                  roadmap, guides, operator references, research appendices
  frontend\              React/Vite SPA
  scripts\               shared automation and contract tooling
  .pids\                 script-managed process ids
  .runtime\              untracked runtime state and logs
```

## Backend Layout

`AlgotradingBot/src/main/java/com/algotrader/bot/`

- `controller`: request and response contracts plus REST entrypoints
- `service`: application orchestration and domain services, including the split backtest command/query/runtime services
- `service/marketdata`: provider definitions, credential flows, import-job commands, async execution, progress publishing, and response mapping
- `repository`: database access
- `entity`: runtime database models
- `backtest`: active simulation engine, metrics, validation, and reproducibility model
- `backtest/strategy`: active strategy registry and implementations used by the current controller/service runtime path
- `risk`: risk and cost calculations
- `security`: auth and token handling
- `config`: application configuration and runtime infrastructure
- `repair`: local runtime validation and repair helpers
- `validation`: explicit validation suites and runtime checks
- `websocket`: event transport support

## Active Backtest Seam

- Active runtime path: `BacktestManagementController -> BacktestManagementService -> BacktestExecutionService -> BacktestSimulationEngine -> backtest.strategy.*`.
- Backtest service ownership within `service/`:
  - `BacktestManagementService`: run, replay, delete, selection-mode validation, and algorithm catalog reads
  - `BacktestResultQueryService`: history, details, experiment summaries, and comparison responses
  - `BacktestExecutionService`: async runtime orchestration, dataset loading, and simulation progress callbacks
  - `BacktestExecutionLifecycleService`: transactional state transitions and result persistence
  - `BacktestProgressService`: WebSocket progress publication shared by queue, execution, completion, and failure paths
- Ownership rule: new backtest/runtime work should land in `backtest/*` and `backtest/strategy/*`; the retired `BacktestEngine` and `strategy/*` seam is no longer part of the repo layout.

## Dataset And Import Ownership

- `BacktestDatasetCatalogService` owns audited upload/import commands plus controller-facing dataset catalog responses.
- `BacktestDatasetStorageService` owns CSV parsing, persistence, downloads, and size validation.
- `BacktestDatasetLifecycleService` owns dataset inventory, retention reporting, archive/restore, and new-run availability checks.
- `BacktestManagementService` and `BacktestExecutionService` now depend directly on dataset storage/lifecycle ownership for runtime reads and validation.
- `MarketDataImportService` owns provider and job commands, while `MarketDataImportExecutionService` owns async fetch execution and `MarketDataImportProgressService` owns import telemetry publication.

## Frontend Layout

`frontend/src/`

- `features/*`: feature modules such as `auth`, `dashboard`, `paper`, `strategies`, `backtest`, `marketData`, `risk`, `trades`, `settings`, and `websocket`
- `features/paperApi.ts`: shared paper-trading API slice
- `app`: Redux store and typed hooks
- `components`: shared UI primitives, route guards, layout shell, and error handling
- `components/ui/Workbench.tsx`: shared workstation-surface primitives for route bars, metric cards, status pills, legends, and empty states
- `components/workspace/*`: sticky inspector and other review-workspace helpers used by selection-heavy routes
- `services`: API and WebSocket transport helpers
- `theme`: centralized MUI design tokens and global component overrides for the research-workstation shell
- `generated`: committed OpenAPI-derived TypeScript types
- Route containers in `features/backtest`, `features/marketData`, `features/settings`, and `features/trades` now delegate bulky sections into feature-local `*Panels.tsx` modules and page-only helper/state files so route components stay focused on query, mutation, and feedback orchestration.
- Shared shell ownership sits under `components/layout/*`, while fallback states live under `components/*Fallback.tsx`; page features should plug into that shell instead of recreating their own navigation or operator-status chrome.

## Documentation Layout

- Root docs: current-state product, architecture, status, plan, tech, and guardrails
- `docs/adr/`: architecture decision records for durable structural choices that should survive individual feature branches
- `docs/guides/`: task-oriented implementation and runtime guides
- `docs/USER_WORKFLOW_GUIDE.md`: operator-facing usage guide
- `docs/ROADMAP.md` and `docs/ACCEPTANCE_CRITERIA.md`: planning and quality gates
- Strategy research appendices stay in `docs/` but are not part of the default implementation context

## Structural Rules

1. Keep strategy logic separate from orchestration.
2. Keep frontend contract adaptation in API or transport layers.
3. Avoid leaking persistence models through HTTP.
4. Prefer updating one canonical doc over adding another overlapping explainer.
