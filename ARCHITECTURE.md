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
- `strategy`: shared or legacy signal helpers outside the newer backtest registry seam

### Key Backend Flows

- Auth flow: JWT-backed authentication protects `/api/**`, with an explicit local relaxed-auth override for debugging only.
- Backtest flow: controller DTOs feed service orchestration, the `BacktestSimulationEngine` executes a registry-selected `BacktestStrategy`, and results persist metrics, series data, provenance, and progress telemetry.
- Market-data flow: provider-specific services normalize downloads into persistent import jobs, then ingest completed data into the same dataset catalog used by manual uploads.
- Paper-trading and risk flow: risk status, paper-trading state, and operator alerts are surfaced through service and DTO boundaries rather than embedded in UI-only logic.
- Audit flow: critical operator actions persist durable audit events that can be queried by dashboard and settings surfaces.
- Runtime recovery flow: unfinished backtests and market-data imports are detected on startup and resumed or restarted from persisted state.

### Backtest Model

- Strategies are isolated Spring beans implementing `BacktestStrategy`.
- `BacktestStrategyRegistry` resolves available strategies and metadata.
- Execution supports `SINGLE_SYMBOL` and `DATASET_UNIVERSE`.
- Runs can carry experiment names and keys so related work can be grouped without losing per-run traceability.
- The action model records explicit `BUY`, `SELL`, `SHORT`, and `COVER` transitions plus `LONG` and `SHORT` exposure state.
- Direct short exposure is limited to research and paper flows when enabled per strategy. Live shorting, leverage, and margin remain outside the default path.

## Frontend Architecture

The app is a BrowserRouter-based SPA. `frontend/src/App.tsx` mounts the global theme, error boundaries, route protection, and the shared WebSocket runtime.

Current route surfaces:

- `/login`
- `/dashboard`
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
- `src/services`: transport helpers, environment-aware API plumbing, WebSocket manager
- `src/components`: shared layout primitives, route guards, loading states, and error handling

### Frontend Data Flow

- RTK Query slices own backend contract adaptation.
- Redux slices handle auth, environment mode, settings, and WebSocket connection state.
- `WebSocketRuntime` subscribes the app to environment-aware channels and updates RTK Query caches for long-running task progress.
- Sensitive operational state stays backend-owned; local browser storage is limited to display preferences and similar user-local settings.

## Runtime And Data Boundaries

- Runtime database is PostgreSQL in Docker.
- Backend runtime schema creation is Liquibase-first with `ddl-auto=validate`.
- Backend tests and builds use the H2 `test` profile.
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
