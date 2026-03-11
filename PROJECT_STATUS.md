# PROJECT_STATUS.md

Status updated: March 11, 2026

## Summary

The local MVP is now functional end-to-end for core research operations with the upgraded stack:
- Spring Boot 4.0.3 backend in `AlgotradingBot/`
- React + TypeScript + Vite frontend in `frontend/`
- local PostgreSQL/Kafka via Docker Compose

The following MVP slices are implemented and wired through UI to backend APIs:
1. Strategy Management
2. Backtest Execution + History
3. Risk Controls + Circuit Breaker Override Safeguards
4. Paper Trading minimal lifecycle + dashboard state

The system remains paper/test-first by default, and no live-money behavior is enabled by default.

Local developer workflow is now optimized for faster iteration:
- `run.ps1` starts PostgreSQL in Docker and runs backend/frontend directly on host.
- Kafka is not required for the default local run path.
- Backend test/build flow is Docker-independent and runs against H2 in-memory via Spring `test` profile.

## Completed In This Update

### 8) Settings/Exchange Backend Endpoint Gap Fix

Backend:
- Implemented missing `ExchangeController` endpoint: `GET /api/exchange/connection-status`.
- Implemented missing `SystemController` endpoints: `GET /api/system/info`, `POST /api/system/test-connection`, and `POST /api/system/backup`.
- Added `ExchangeIntegrationService` with Binance signed read-only connectivity check (mainnet/testnet selection), credential fallback from env vars, and last-known connection status tracking.
- Added `SystemOperationsService` for runtime system info and local backup metadata file creation.
- Updated `GlobalExceptionHandler` to map `NoResourceFoundException` to `404 Not Found` instead of returning `500 Internal Server Error`.

Frontend:
- Updated settings exchange API mutation to send optional test payload (`exchange`, `apiKey`, `apiSecret`, `testnet`) to backend.
- Updated settings API config section to accept entered credentials and submit them in the connection test flow.

Verification:
- Backend targeted tests: exchange/system integration + global exception handler pass.
- Frontend targeted settings tests and production build pass.

### 1) Strategy Management MVP

Backend:
- Added strategy config entity/repository/service/controller flow with DTO boundaries and validation.
- Added endpoints to list/start/stop/update strategy config.

Frontend:
- Replaced strategies placeholder with a working page connected to backend APIs.
- Added strategy page tests.

### 2) Backtest MVP

Backend:
- Added async backtest management flow (run, status/history, details).
- Extended backtest result model to include execution status, timeframe, fees/slippage, and error state.

Frontend:
- Replaced backtest placeholder with run form + history/details UI.
- Displays fees/slippage assumptions in metadata.
- Added backtest page tests.

### 3) Risk Controls MVP

Backend:
- Added risk config, risk status, circuit-breaker override, and risk-alert endpoints.
- Added safeguards: no live override behavior and explicit confirmation token for override action.

Frontend:
- Replaced risk placeholder with working status/config/override/alerts page.
- Added risk page tests.

### 4) Paper Trading MVP

Backend:
- Added minimal paper order lifecycle (`NEW` -> `FILLED`/`CANCELLED`) and paper account/position updates.
- Added paper state endpoint for dashboard summary.

Frontend:
- Added dashboard paper-trading state card.
- Added tests for paper dashboard card and dashboard integration.

### 5) Backend Test Database Isolation Hardening

Backend:
- Enforced Spring `test` profile for Gradle test task so CLI `test`/`build` always use H2 in-memory.
- Added missing `@ActiveProfiles("test")` to Spring Boot integration tests for consistent behavior outside aggregate runs.
- Fixed `BacktestDataset` JPA mapping to be H2/PostgreSQL compatible so `backtest_datasets` table is generated in test schema.

### 6) Platform Upgrade + Liquibase + Auth/CORS Stabilization

Backend:
- Upgraded runtime/build stack to Spring Boot `4.0.3` and Gradle wrapper `9.4.0`.
- Updated explicit dependencies to current compatible versions (`springdoc 3.0.2`, `jjwt 0.13.0`, `logstash-logback-encoder 9.0`, JaCoCo `0.8.14`).
- Added Liquibase changelog bootstrap for users table + admin seed (`admin` / `dogbert`) on first PostgreSQL migration run.
- Added PostgreSQL-safe migration for `backtest_datasets.csv_data` legacy `oid` -> `bytea`.
- Removed legacy `DataInitializer` default users (`admin123`, `trader123`) to avoid config drift.
- Simplified and centralized auth error handling in `GlobalExceptionHandler` (DRY cleanup) and reduced local auth strictness with `algotrading.security.relaxed-auth=true` default.
- Expanded CORS handling via `allowedOriginPatterns` to reduce local preflight mismatch issues.

Frontend:
- Updated refresh-token mutation to always send request body (`{ refreshToken }`) for backend contract consistency.

### 7) Full-Repo Smell Audit Refactor (FE + BE)

Backend:
- Replaced several `findAll()` + in-memory `sorted/limit` code paths with DB-level ordered/limited repository queries (`Pageable`), reducing unnecessary memory use and query latency for history/result endpoints.
- Fixed `TradingStrategyService` metrics scope to be account-specific (`getStatus` now uses trades for requested account only).
- Fixed trade-history filtering so `accountId` is consistently respected in all filter combinations.
- Converted remaining field injection (`@Autowired` fields) to constructor injection in strategy controller/service.
- Hardened dataset upload metadata extraction to avoid multiple stream passes and enforce empty-CSV validation.
- Added regression integration tests for account-scoped status/trade-history behavior.

Frontend:
- Centralized auth storage operations into a single utility (`authStorage.ts`) to remove duplicated storage keys and clear/store logic.
- Unified refresh-token retrieval and login-redirect behavior across RTK Query base client and Axios client.
- Improved Axios refresh compatibility by accepting both `token` and `accessToken` payload variants.
- Reduced noisy/dev-only response logging payload size.

## Current Verification Snapshot (March 10, 2026)

Frontend:
- `npm run lint` -> PASS
- `npm run test -- --watch=false` -> PASS (`396/396`)
- `npm run build` -> PASS

Backend:
- `.\gradlew.bat test` -> PASS
- `.\gradlew.bat build` -> PASS
- Verified without requiring Docker PostgreSQL

Root scripts:
- `.\stop-all.ps1` -> PASS
- `.\build-all.ps1` -> PASS
- `.\run-all.ps1` -> PASS

Runtime checks:
- `http://localhost:5173` -> `200`
- `http://localhost:8080/actuator/health` -> `200`
- `http://localhost:8080/swagger-ui.html` -> `200`
- Runtime DB verification: Liquibase created `databasechangelog` tables and applied user/bootstrap migrations.
- Runtime auth verification: login with `admin` / `dogbert` returns valid access + refresh tokens.
- Runtime backtest verification: dataset upload + `/api/backtests/run` persisted records in PostgreSQL (`backtest_results`).

## What Remains (Post-MVP)

- CI pipeline (`.github/workflows`) for reproducible automated checks.
- Shared API contract generation (OpenAPI-driven frontend types).
- Stronger audit trails for operator actions and environment/risk overrides.
- Market-data ingestion/replay workflow for reproducible research datasets.
- Progressive hardening of environment separation and operator controls for any future live connectivity.

## Risks / Notes

- Test output still contains non-blocking warning/debug noise in several suites; results are passing but logs are noisy.
- Current paper trading is intentionally minimal and designed for local verification, not full exchange-grade execution simulation.
- Backtest outputs are research artifacts and not evidence of future profitability.
