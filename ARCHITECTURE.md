# ARCHITECTURE.md

## Overview

This monorepo has:

- Backend: `AlgotradingBot/` (Spring Boot, Java 21)
- Frontend: `frontend/` (React + TypeScript + Vite)

The architecture is optimized for local research and paper-trading workflows, not high-frequency execution.

## Backend Architecture

Primary packages in `com.algotrader.bot`:

- `controller`: HTTP endpoints and DTO boundaries
- `service`: orchestration and business logic
- `service/marketdata`: provider adapters, retry-aware import orchestration, CSV normalization, resampling, and session filtering
- `repository`: Spring Data JPA access
- `entity`: persistence models
- `entity` + `repository` include `operator_audit_events` for critical action auditability
- `backtest`: simulation engine, metrics, validators
- `backtest/strategy`: strategy interface, implementations, registry, indicator helpers
- `risk`: risk and execution-cost calculations
- `security`: auth/token/security components
- `config`, `websocket`, `validation`, `repair`: platform and operational support, including script-aligned local recovery actions

### Backtest Design

- Strategy seam: each strategy is a separate Spring bean implementing `BacktestStrategy`.
- Registry seam: `BacktestStrategyRegistry` resolves strategy metadata and execution routing.
- Simulation seam: `BacktestSimulationEngine` runs execution loops and position transitions.
- Metrics seam: `BacktestSimulationMetricsCalculator` computes performance statistics.
- Reproducibility seam: dataset metadata includes checksum/schema version, retention state, archive/restore controls, and supports download + replay flows.
- Experiment seam: backtest runs carry repeatable experiment labels/keys so related runs can be summarized without losing per-run provenance.
- Analytics persistence seam: backtest details include persisted equity-curve and trade-series records for reproducible UI charts/exports.
- Comparison seam: dedicated compare API provides side-by-side metric deltas plus dataset provenance for selected backtests.
- Reporting seam: frontend exports fail closed when dataset provenance is incomplete, and experiment labels flow into report packaging for clearer multi-run review.

This avoids single-class "all-logic" backtesting and supports extension without rewriting orchestration.

### Execution Modes

- `SINGLE_SYMBOL`: strategy evaluates one selected symbol.
- `DATASET_UNIVERSE`: strategy can rank/rotate across symbols from the uploaded dataset.

Current model supports one active position at a time with conservative action transitions.

## Frontend Architecture

Feature modules under `frontend/src/features/`:

- `auth`
- `environment`
- `dashboard`
- `account`
- `strategies`
- `backtest`
- `marketData`
- `risk`
- `trades`
- `settings`
- `websocket`

Shared infrastructure:

- `src/app`: Redux store and hooks
- `src/services`: API clients and transport helpers
- `src/components`: shared UI/layout/error boundaries

Key frontend design rules:

- Keep API contract adaptation inside API/service layers where possible.
- Keep environment mode visible and default-safe (`test`).
- Keep feature boundaries explicit to support independent strategy workflows.
- Use strategy-profile metadata to keep parameter editing guidance typed and centralized instead of scattering heuristics across components.
- Keep exchange-connection profile persistence in backend APIs/DB, while non-sensitive display preferences may remain browser-local.

## Runtime and Data Boundaries

- Runtime app: PostgreSQL (Docker) with Liquibase migrations.
- Local Docker Compose uses the explicit project name `algotradingbot` so container and volume naming remain stable across scripts and manual runs.
- Script-driven local runtime writes backend file logs into repo-local untracked `.runtime/logs` storage instead of tracked source paths.
- Backend test/build: H2 in-memory via Spring `test` profile.
- Backup path uses real database-native exports: H2 `SCRIPT` in tests and PostgreSQL `pg_dump` with Docker-container fallback in runtime.
- Historical download path uses provider-specific fetch adapters but normalizes everything into the same backtest dataset catalog used by upload/import workflows.
- Keyed historical-data providers can resolve API keys from either backend environment variables or encrypted PostgreSQL credentials managed through the admin UI; stored secrets depend on a backend master key and keep operator notes alongside the provider setting.
- Repair/orchestration automation resolves repo-local paths and uses `run.ps1`, `stop.ps1`, shared PowerShell helpers, `.pids`, `.runtime`, and `compose.yaml` rather than ad-hoc global Docker commands.
- Kafka runtime mounts use a reusable named secrets volume so repeated runs do not create anonymous volume churn.
- Keep runtime and test data concerns strictly separated.

## Current Architecture Decisions

1. Use DTO boundaries for HTTP; do not expose JPA entities directly.
2. Keep financial precision paths on `BigDecimal`.
3. Prefer immutable DTOs as Java records where possible.
4. Isolate exchange/live connectivity behind dedicated service boundaries.
5. Keep risk/guardrail logic independent from UI concerns.
6. Persist critical operator actions with durable audit events for post-incident review.
7. Account endpoints resolve environment from either `env` query params or `X-Environment` header and fail closed when live account reads are not implemented.
8. Repair automation must align with the repo's real operator entrypoints and fail closed when managed cleanup cannot restore a healthy local runtime.
9. Backend compilation surfaces deprecated API usage with `-Xlint:deprecation` so modernization regressions are caught during normal builds.
10. Paper-trading operator alerts are derived from recovery telemetry and surfaced through DTO/service boundaries rather than embedded in dashboard-only logic.
11. Operator audit-event review uses a filterable summary+timeline API contract so dashboard and settings surfaces can share the same audit model.
12. Saved exchange API connection profiles are stored per authenticated user in PostgreSQL and exposed through dedicated `/api/exchange/connections` endpoints rather than browser-only state.
13. Historical market-data acquisition runs as persistent import jobs with explicit `QUEUED/RUNNING/WAITING_RETRY/COMPLETED/FAILED/CANCELLED` states so provider waits and retries stay observable and resumable.
14. Provider credential storage for the downloader stays backend-owned: the frontend submits secrets only to authenticated admin endpoints, PostgreSQL stores only encrypted ciphertext, and runtime resolution can fall back to environment variables when needed.

## Near-Term Architecture Work

1. Extend operator alert delivery beyond in-app/dashboard surfacing into broader notification channels when justified.
2. Extend experiment-review workflows on top of the new experiment summary seam.
3. Continue expanding operational recovery coverage beyond the current port/network/script-aligned repair set.
