# Backend Guide

Use this guide when the task is mainly in `AlgotradingBot/`.

## Backend Scope

The backend owns:

- JWT auth and request boundaries
- strategy configuration and lifecycle APIs
- backtest execution, history, compare, replay, export, and telemetry reads
- dataset inventory, provenance, downloads, and retention
- market-data imports and provider credential handling
- paper-trading state, risk controls, exchange profiles, and audit events
- WebSocket event publishing and runtime health surfaces

## Package Boundaries

Backend development now defaults to a hybrid DDD package layout.

Business contexts:

- `account`
- `backtest`
- `exchange`
- `marketdata`
- `paper`
- `risk`
- `security`
- `strategy`
- `system`

Technical cross-cutting areas:

- `config`
- `migration`
- `repair`
- `shared`
- `validation`
- `websocket`

Inside a business context, prefer this layout:

- `api`: controllers, request DTOs, query DTOs, response DTOs
- `application`: orchestration services, commands, queries, results, mappers, ports
- `domain`: business models, policies, value objects, strategy logic
- `infrastructure`: persistence entities, Spring Data repositories, provider/exchange adapters, crypto helpers

Do not introduce new top-level catch-all folders like `controller`, `service`, `repository`, or `entity` for business code.

## Service Ownership

Backtest path:

- `BacktestManagementService`: command validation, queueing, replay, delete
- `BacktestResultQueryService`: history, summary, detail, compare
- `BacktestTelemetryService`: read-side telemetry reconstruction for completed runs
- `BacktestExecutionService`: async execution and dataset handling
- `BacktestExecutionLifecycleService`: transactional state and result persistence
- `BacktestProgressService`: progress publication

Market-data path:

- `MarketDataImportService`: provider metadata, credentials, job commands
- `MarketDataImportExecutionService`: async import execution
- `MarketDataImportProgressService`: import progress publication
- `BacktestDatasetStorageService`: parsing, storage, downloads
- `BacktestDatasetLifecycleService`: inventory, retention, archive, restore

## Backend Rules

1. Start from the owning bounded context, then place code in `api`, `application`, `domain`, or `infrastructure`.
2. Use `BigDecimal` for money, fees, price-sensitive paths, and risk.
3. Keep DTOs at the HTTP boundary; do not leak JPA entities.
4. Keep controllers mapping HTTP DTOs to application-layer requests instead of leaking API DTOs deeper into the context.
5. Keep exchange-connected and live-connected behavior behind explicit services and environment gates.
6. Keep critical operator actions auditable.
7. Keep PostgreSQL runtime behavior and H2 test behavior intentionally separate.
8. When a rule depends on strategy mode or capability flags, validate it in services instead of inventing placeholder values on the client.

## Auth And WebSocket Boundaries

- Only `/api/auth/login` and `/api/auth/refresh` are public
- `/api/auth/me`, `/api/auth/logout`, and the rest of `/api/**` require authentication
- JWT secret configuration must be valid at startup
- Token revocation must remain durable in PostgreSQL
- WebSocket upgrades must stay authenticated and environment-scoped
- CORS and WebSocket origins must stay explicitly allowlisted

## Data And Runtime Notes

- Runtime DB: PostgreSQL
- Test/build DB: H2 `test` profile
- Schema ownership: Liquibase with `ddl-auto=validate`
- New uploads and completed imports hydrate the normalized market-data store during ingestion
- Legacy CSV blobs are compatibility data, not the preferred runtime path

## Verification

Start with the narrowest relevant backend check:

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

Add:

```powershell
.\gradlew.bat javaMigrationAudit --no-daemon
```

when the change is JDK-sensitive, migration-sensitive, or toolchain-sensitive.
