# Backend Implementation Guide

Use this guide when the task is primarily in `AlgotradingBot/`.

## Current Backend Scope

The backend owns:

- JWT auth and request authorization
- strategy configuration and lifecycle APIs
- backtest execution, history, comparison, replay, export, and on-demand telemetry support
- dataset inventory, provenance, retention, and downloads
- market-data import jobs and provider credential handling
- paper-trading state, risk controls, exchange profile management, and audit events
- runtime health, backup, validation, and WebSocket event publishing

## Package Boundaries

- `controller`: request and response contracts
- `service`: orchestration and business logic
- `service.marketdata`: provider and import-job logic
- `repository`: database access
- `entity`: runtime persistence models
- `backtest`: simulation engine and analytics model
- `backtest.strategy`: registered backtest strategy implementations
- `risk`: risk status and execution-cost calculations
- `security`: auth components
- `config`, `repair`, `validation`, `websocket`: runtime support

## Main HTTP Surfaces

Representative controller groups:

- Auth: `AuthController`
- Account and environment-aware reads: `AccountController`
- Strategies: `StrategyManagementController`, `TradingStrategyController`
- Backtests and datasets: `BacktestManagementController`
- Market data: `MarketDataController`
- Paper trading: `PaperTradingController`
- Risk: `RiskController`
- Exchange profiles: `ExchangeController`
- System and audit utilities: `SystemController`

Keep response adaptation in DTOs. Do not let entities escape these boundaries.

The verified auth/request boundary is:

- permit only `/api/auth/login` and `/api/auth/refresh` without authentication
- require authentication for `/api/auth/me`, `/api/auth/logout`, and the rest of `/api/**`
- validate JWT secret configuration at startup; do not reintroduce placeholder or undersized secrets
- persist token revocations in PostgreSQL rather than process-local memory
- keep HTTP CORS allowlists explicit through `algotrading.security.allowed-origin-patterns`

## Backend Design Rules

1. Keep controller, service, repository, and entity concerns separated.
2. Use `BigDecimal` for money, risk, fees, and price-sensitive calculations.
3. Prefer immutable DTO records where framework constraints allow.
4. Keep live or exchange-connected behavior behind explicit services and environment gates.
5. Keep critical operator actions auditable.
6. Preserve reproducibility for datasets, experiments, and exports.
7. Keep PostgreSQL runtime behavior and H2 test behavior intentionally separate.
8. When request rules depend on strategy mode or capability flags, express that honestly in the DTO schema and enforce the conditional rule in service validation rather than requiring placeholder values from clients.

## Long-Running Work

The backend currently supports long-running backtests and market-data imports with:

- persisted progress state
- WebSocket event publication
- polling fallback compatibility
- startup recovery for unfinished work
- virtual-thread-backed async execution

When changing these flows, update the corresponding UI progress contracts and runtime docs.

The verified WebSocket boundary for these flows is:

- permit `/ws` at the HTTP security layer, then authenticate the upgrade in `WebSocketAuthHandshakeInterceptor`
- accept only JWT access tokens, not refresh tokens, at the handshake boundary
- require an explicit `env` query parameter and restrict subscriptions to channels for that environment
- emit `ack` control messages for accepted subscriptions and `error` control messages for rejected or malformed requests
- keep browser-origin allowlists explicit through `algotrading.websocket.allowed-origin-patterns`

For the active backtest path, keep ownership split along these seams:

- `BacktestManagementService`: command-side request validation, queueing, replay, and deletion
- `BacktestResultQueryService`: history, details, comparison, and experiment-summary reads
- `BacktestTelemetryService`: reconstructs detail-view telemetry from persisted datasets plus trade or equity evidence only after a run completes; keep this read-side and avoid persisting heavyweight per-bar series unless a later requirement proves it necessary
- `BacktestExecutionService`: async orchestration, after-commit dispatch, dataset loading, symbol scoping, requested-timeframe resampling, and simulation callbacks
- `BacktestExecutionLifecycleService`: transactional status transitions, result persistence, and failure handling
- `BacktestProgressService`: shared progress publication to WebSocket consumers and polling-compatible clients

Keep execution-model assumptions explicit in this path. If a request asks for `4h` or `1d`, resample before simulation rather than tagging the raw dataset bars with a different timeframe label, and preserve the current next-bar-open fill model unless a more complex execution model is intentionally introduced and documented.

Do not move DTO mapping, transactional state persistence, and async orchestration back into one large service unless there is a verified reason to collapse the boundary.

For the dataset and market-data path, keep ownership split along these seams:

- `MarketDataImportService`: provider metadata, credential operations, job creation, retry, cancel, and scheduler dispatch
- `MarketDataImportExecutionService`: async provider fetch execution, staged CSV accumulation, retry handling, and completion
- `MarketDataImportProgressService`: shared import-job progress publication
- `BacktestDatasetStorageService`: dataset parsing, persistence, downloads, and upload-size validation
- `BacktestDatasetLifecycleService`: dataset inventory, retention reporting, archive/restore, and availability checks

Keep import execution and dataset lifecycle concerns out of controllers and avoid re-merging provider command flows with long-running runtime execution.

## Persistence And Runtime Notes

- Runtime DB: PostgreSQL with Liquibase-first bootstrap and `ddl-auto=validate`
- Test DB: H2 under the `test` profile
- Backup path: database-native export flow, not placeholder metadata
- Secret storage: encrypted in PostgreSQL when saved through the UI, with environment fallback where supported
- Local runtime scripts provision a repo-local `JWT_SECRET` automatically; direct `docker compose` usage must provide `JWT_SECRET` explicitly

## Verification

Start with the narrowest relevant test or package-level check, then expand:

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

Add this when you touch JDK-sensitive, toolchain-sensitive, or migration-sensitive code:

```powershell
.\gradlew.bat javaMigrationAudit --no-daemon
```

## Companion Docs

- `ARCHITECTURE.md`
- `TRADING_GUARDRAILS.md`
- `GRADLE_AUTOMATION.md`
- `docs/guides/TESTING_AND_CONTRACTS.md`
- `docs/guides/MARKET_DATA_RESEARCH.md`
