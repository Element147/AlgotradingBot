# Architecture

## System Overview

The monorepo has two primary applications:

- `AlgotradingBot/`: Spring Boot backend on Java 25
- `frontend/`: React 19, TypeScript, and Vite SPA

The architecture is optimized for local research, reproducible backtests, paper trading, and operator visibility. It is not designed as a low-latency execution stack.

## Backend Architecture

Primary packages in `com.algotrader.bot`:

- `controller`: HTTP endpoints and DTO contracts
- `service`: orchestration, domain logic, and external integrations
- `service.marketdata`: provider adapters, import orchestration, CSV normalization, resampling, and retry behavior
- `repository`: Spring Data access
- `entity`: persistence models for runtime state, datasets, credentials, audit events, and long-running jobs
- `backtest`: execution engine, metrics, validation, and reproducibility plumbing
- `backtest.strategy`: strategy interfaces, implementations, registry, and strategy-specific helpers
- `risk`: risk calculations, guardrail state, and execution-cost logic
- `security`: JWT auth and security support
- `config`: application, async, metrics, and runtime configuration
- `repair`: local runtime validation and repair helpers aligned with repo scripts
- `validation`: production-readiness and system validation helpers
- `websocket`: event publishing for dashboard and long-running task updates

### Key Backend Flows

- Auth flow: JWT-backed authentication protects `/api/**`; only `/api/auth/login` and `/api/auth/refresh` stay public, `/api/auth/me` and `/api/auth/logout` require authentication, and revoked access tokens are denied before controller code relies on them.
- Backtest flow: `BacktestManagementController` feeds `BacktestManagementService`, which validates run and replay commands, persists queued executions, and dispatches async execution only after the queueing transaction commits. Read-side history, detail, experiment-summary, and comparison mapping now live in `BacktestResultQueryService`, on-demand price or signal or regime telemetry is reconstructed by `BacktestTelemetryService` only for completed runs, transactional execution-state transitions and result persistence live in `BacktestExecutionLifecycleService`, and shared progress publication flows through `BacktestProgressService` before `BacktestExecutionService` scopes or resamples candles to the requested timeframe and the active runtime executes `BacktestSimulationEngine` plus registry-selected beans in `backtest.strategy.*`.
- Market-data flow: `MarketDataController` feeds `MarketDataImportService` for provider metadata, credential workflows, and import-job commands; scheduled and async download execution now lives in `MarketDataImportExecutionService`, progress publication lives in `MarketDataImportProgressService`, and completed imports land in the same dataset catalog used by uploads through `BacktestDatasetCatalogService`, backed by `BacktestDatasetStorageService` and `BacktestDatasetLifecycleService`.
- Paper-trading and risk flow: risk status, paper-trading state, and operator alerts are surfaced through service and DTO boundaries rather than embedded in UI-only logic.
- Audit flow: critical operator actions persist durable audit events that can be queried by dashboard and settings surfaces.
- Runtime recovery flow: unfinished backtests and market-data imports are detected on startup and resumed or restarted from persisted state.

### Active Backtest Seam

- Active runtime seam: `BacktestManagementController -> BacktestManagementService -> BacktestExecutionService -> BacktestSimulationEngine -> backtest.strategy.*`.
- Active ownership split inside that seam:
  - `BacktestManagementService`: command-side validation, queueing, replay, delete, and algorithm catalog access
  - `BacktestResultQueryService`: history, details, experiment summaries, and comparison DTO mapping
  - `BacktestTelemetryService`: read-side reconstruction of per-bar action, exposure, regime, and indicator telemetry from persisted datasets plus trade or equity evidence, but only once the run is completed
  - `BacktestExecutionService`: async runtime orchestration, after-commit dispatch, dataset loading, symbol scoping, timeframe resampling, and simulation callbacks
  - `BacktestExecutionLifecycleService`: transactional status changes, result persistence, and failure handling
  - `BacktestProgressService`: shared WebSocket progress publication for queued, running, completed, and failed states
- Current disposition: the retired `BacktestEngine` plus `strategy/*` seam has been removed. New backtest/runtime behavior belongs in `backtest/*` and `backtest/strategy/*`.

### Dataset And Market-Data Service Ownership

- `MarketDataImportService`: provider catalog reads, credential workflows, job creation, retry, cancel, and scheduler dispatch
- `MarketDataImportExecutionService`: async import execution, provider fetch loops, staged CSV accumulation, retry handling, and completion
- `MarketDataImportProgressService`: shared WebSocket publication for import-job telemetry
- `BacktestDatasetCatalogService`: audited upload/import commands plus controller-facing dataset catalog responses
- `BacktestDatasetStorageService`: CSV parsing, dataset persistence, downloads, and upload-size enforcement
- `BacktestDatasetLifecycleService`: dataset inventory, retention reporting, archive/restore state, and availability checks for new backtests
- Internal runtime consumers such as `BacktestManagementService` and `BacktestExecutionService` now read storage/lifecycle ownership directly instead of routing through a generic dataset wrapper.

### Query And Index Posture

- Backtest history already uses bounded page reads instead of loading the full table.
- Experiment summaries now aggregate in the repository layer with database-side grouping and latest-run selection instead of loading every `BacktestResult` entity into memory.
- Liquibase owns the supporting query indexes for dataset listing, backtest experiment and status scans, and market-data ready-job scheduling.

### Authentication And Request Boundary

- `JwtTokenProvider` validates its configuration at startup and rejects missing, legacy-placeholder, or too-short secrets so insecure JWT defaults do not survive into runtime.
- Revoked tokens are persisted in the `auth_token_revocations` table through `AuthTokenRevocationRepository`, which makes logout durable across process restarts and container rebuilds.
- `JwtAuthenticationFilter` and `AuthService` both treat revoked tokens as invalid so the filter chain and controller/service layer agree on request-boundary decisions.
- HTTP CORS allowlists are explicitly configured through `algotrading.security.allowed-origin-patterns`; the verified local defaults are the Vite dev and preview ports on `localhost` and `127.0.0.1`.
- The `relaxed-auth` flag remains an explicit local debugging override and is not part of the default posture.

### WebSocket And Telemetry Boundary

- `/ws` is exposed as an upgrade endpoint, but the handshake itself is authenticated by `WebSocketAuthHandshakeInterceptor` with a JWT access token query parameter plus an explicit `env` of `test` or `live`.
- `WebSocketHandler` only accepts environment-scoped channels such as `test.backtests` or `live.marketData`, emits `ack` control messages for accepted subscriptions, and emits `error` control messages for rejected or malformed requests.
- Allowed browser origins are explicitly configurable through `algotrading.websocket.allowed-origin-patterns`; the default local posture allows the Vite dev and preview ports on `localhost` and `127.0.0.1`.

### Backtest Model

- Strategies are isolated Spring beans implementing `BacktestStrategy`.
- `BacktestStrategyRegistry` resolves available strategies and metadata.
- Execution supports `SINGLE_SYMBOL` and `DATASET_UNIVERSE`.
- Runs can carry experiment names and keys so related work can be grouped without losing per-run traceability.
- The action model records explicit `BUY`, `SELL`, `SHORT`, and `COVER` transitions plus `LONG` and `SHORT` exposure state.
- Signal decisions are evaluated on one bar and filled on the next bar's open by default; the only same-run forced liquidation path is the final close when a position is still open at the end of the dataset.
- Requested simulation timeframes must be backed by explicit candle resampling before a strategy evaluates the dataset.
- Direct short exposure is limited to research and paper flows when enabled per strategy. Live shorting, leverage, and margin remain outside the default path.

## Frontend Architecture

The app is a BrowserRouter-based SPA. `frontend/src/App.tsx` mounts the global theme, error boundaries, route protection, and the shared WebSocket runtime.

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

Feature modules under `frontend/src/features/`:

- `auth`
- `environment`
- `dashboard`
- `account`
- `paper`
- `strategies`
- `backtest`
- `marketData`
- `risk`
- `settings`
- `trades`
- `websocket`
- shared `paperApi.ts` for paper-trading data access

Shared frontend infrastructure:

- `src/app`: Redux store, typed hooks, app-level state wiring
- `src/services`: transport helpers, environment-aware API plumbing, OpenAPI path helpers, WebSocket manager
- `src/components`: shared layout primitives, route guards, loading states, and error handling
- `src/components/layout/PageContent.tsx`: shared page intro, metric-strip, and section-header primitives used to keep route spacing, section rhythm, and primary-action placement consistent across the SPA

### Frontend Data Flow

- RTK Query slices own backend contract adaptation.
- Generated OpenAPI transport types are consumed through feature-owned contract modules where response normalization is needed, rather than leaking generated optional transport shapes into pages.
- Backtest details now carry telemetry-rich read models so the UI can render price-action markers, exposure or regime review, indicator overlays, and run comparison visuals without recomputing strategy logic in the browser.
- Redux slices handle auth, environment mode, settings, and WebSocket connection state.
- `WebSocketRuntime` subscribes the app to environment-aware channels and updates RTK Query caches for long-running task progress when the authenticated WebSocket handshake succeeds.
- The frontend now treats connection-open and channel subscription as separate states: pages only consider live telemetry active after the backend acknowledges the requested channels.
- Polling fallback remains available for progress views when the browser cannot establish or maintain the WebSocket connection.
- Sensitive operational state stays backend-owned; local browser storage is limited to display preferences and similar user-local settings.
- Route surfaces now treat the shell header as the primary page-context surface. Page components should keep safety-critical chips and workflow meaning intact, but avoid reintroducing duplicate hero banners or route-local chrome when shared shell context already covers that role.

## Runtime And Data Boundaries

- Runtime database is PostgreSQL in Docker.
- Backend runtime schema creation is Liquibase-first with `ddl-auto=validate`.
- Backend tests and builds use the H2 `test` profile.
- Runtime query hot paths rely on explicit indexes for `backtest_datasets.uploaded_at`, `backtest_results` experiment or dataset or execution-status scans, and the `market_data_import_jobs` ready-job scheduler scan.
- Full-stack Docker runtime includes Kafka for the backend's event-driven paths.
- Compose uses the explicit project name `algotradingbot` and named volumes for stable local reuse.
- Script-driven local logs live in `.runtime/logs`; managed PID files live under `.pids`.
- OpenAPI artifacts are generated from the backend and committed in `contracts/openapi.json` plus `frontend/src/generated/openapi.d.ts`.
- Provider and exchange secrets are stored encrypted in PostgreSQL when saved through the UI, with environment-variable fallback where supported.

## Architecture Rules

1. Keep controller, service, repository, and persistence concerns separated.
2. Use DTOs at HTTP boundaries; do not expose JPA entities directly.
3. Keep money and risk paths on `BigDecimal`.
4. Isolate exchange and live-connected behavior behind dedicated services and environment gates.
5. Keep guardrail logic independent from UI implementation details.
6. Prefer current-state documentation over implementation-history narratives.
