# Architecture

## System Overview

The repository has two main applications:

- `AlgotradingBot/`: Spring Boot backend on Java 25
- `frontend/`: React 19, TypeScript, and Vite SPA

The system is designed for local-first research, reproducible backtests, paper-trading workflows, and operator visibility. It is not designed as a low-latency execution stack.

## Backend Boundaries

Primary backend areas in `com.algotrader.bot` are now organized as bounded contexts:

- `account`
- `backtest`
- `exchange`
- `marketdata`
- `paper`
- `risk`
- `security`
- `strategy`
- `system`
- `shared` for minimal cross-context value types, shared API models, and observability helpers
- `config`, `migration`, `repair`, `validation`, `websocket` for technical cross-cutting runtime support

Each business context follows the same hybrid DDD shape:

- `api`: controllers and HTTP boundary DTOs
- `application`: use-case orchestration and service-level workflows
- `domain`: domain models, value objects, policies, and strategy logic
- `infrastructure`: JPA entities, repositories, adapters, and external integrations

The architecture default is bounded-context first. New backend code should enter the owning domain context instead of reviving flat top-level dump folders such as `controller`, `service`, `repository`, or `entity`.

Important ownership splits:

- `BacktestManagementService`: queue, replay, delete, and command validation
- `BacktestResultQueryService`: history, summary, compare, and detail reads
- `BacktestExecutionService`: async execution, dataset loading, scoping, and timeframe handling
- `BacktestExecutionLifecycleService`: transactional state changes and result persistence
- `BacktestProgressService`: progress publication
- `MarketDataImportService`: provider metadata, credentials, and job commands
- `MarketDataImportExecutionService`: async import work
- `MarketDataDatasetIngestionService`: normalized candle persistence and dataset finalization
- `MarketDataImportProgressService`: import telemetry publication
- `BacktestDatasetStorageService`: provider-backed dataset staging and lifecycle handoff
- `BacktestDatasetLifecycleService`: inventory, retention, archive, and restore

## Frontend Boundaries

The frontend is a BrowserRouter SPA with feature-based structure under `frontend/src/features/`.

Shared layers:

- `src/app`: Redux store and typed hooks
- `src/services`: API helpers, OpenAPI transport helpers, WebSocket manager
- `src/components`: layout shell, route guards, shared UI, loading, and error states
- `src/theme`: design tokens and MUI overrides

Large features should prefer a consistent internal structure:

- `api`: RTK Query slices and transport adapters
- `components`: feature-local panels and reusable view pieces
- `models`: feature-owned UI/domain types when transport types need adaptation
- `state`: feature-local persistence and selection state
- `utils`: pure helpers specific to the feature

Cross-feature imports should go through the owning feature boundary export when practical, rather than reaching into unrelated internals.

Main routes:

- `/dashboard`
- `/backtest`
- `/forward-testing`
- `/paper`
- `/live`
- `/strategies`
- `/market-data`
- `/trades`
- `/risk`
- `/settings`

The shell owns the main route context. Feature routes are expected to plug into that shell instead of rebuilding their own page chrome.

## Major Data Flows

### Authentication And Transport

- JWT auth protects `/api/**`, with only login and refresh public
- Token revocation is durable in PostgreSQL
- WebSocket upgrades use authenticated `/ws?token=...&env=...` handshakes
- Frontend uses WebSockets for progress and falls back to polling when needed

### Backtests

1. The frontend submits a backtest request.
2. The backend validates and queues the run.
3. Async execution loads the dataset, scopes symbols, and resamples to the requested timeframe when needed.
4. Results, equity series, trade series, and status are persisted.
5. The UI follows progress through WebSocket or polling, then loads detail panes on demand.

### Market Data

1. Operators create provider import jobs.
2. Import jobs run asynchronously with retry-aware state.
3. Completed jobs persist normalized candles and finalize a reusable dataset record.
4. Backtests and telemetry reads use the normalized store directly.

## Runtime And Data Model

- Runtime database: PostgreSQL
- Test/build database: H2 `test` profile
- Schema management: Liquibase with `ddl-auto=validate`
- Tracked contracts: `contracts/openapi.json` and `frontend/src/generated/openapi.d.ts`
- Local runtime state: `.runtime/`
- Script-managed PIDs: `.pids/`

Normalized market-data runtime tables:

- `market_data_series`
- `market_data_candle_segments`
- `market_data_candles`

These tables support exact-timeframe reads, controlled rollups, provenance tracking, and gap reporting.

## Repo Structure

```text
C:\Git\algotradingbot\
  AlgotradingBot\   backend application
  frontend\         React/Vite SPA
  contracts\        tracked OpenAPI artifact
  docs\             product docs, guides, research, ADRs
  scripts\          automation and contract tooling
  .runtime\         local runtime state and logs
  .pids\            script-managed process ids
```

## Architecture Rules

1. Default to hybrid DDD: bounded context first, then `api`, `application`, `domain`, and `infrastructure` inside that context.
2. Use DTOs at HTTP boundaries; do not leak JPA entities directly.
3. Keep money, fees, PnL, and risk calculations on `BigDecimal`.
4. Keep exchange-connected and live-connected behavior behind explicit services and environment gates.
5. Keep guardrails backend-owned; do not hide safety logic inside the UI.
6. Keep frontend feature boundaries aligned with product domains and avoid root-level feature outliers.
7. Prefer current-state documentation over implementation-history narratives.
