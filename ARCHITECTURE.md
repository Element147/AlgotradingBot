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
- Analytics persistence seam: backtest details include persisted equity-curve and trade-series records for reproducible UI charts/exports.
- Comparison seam: dedicated compare API provides side-by-side metric deltas plus dataset provenance for selected backtests.
- Reporting seam: frontend exports fail closed when dataset provenance is incomplete, so reports cannot be produced from ambiguous inputs.

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

## Runtime and Data Boundaries

- Runtime app: PostgreSQL (Docker) with Liquibase migrations.
- Backend test/build: H2 in-memory via Spring `test` profile.
- Backup path uses real database-native exports: H2 `SCRIPT` in tests and PostgreSQL `pg_dump` with Docker-container fallback in runtime.
- Repair/orchestration automation resolves repo-local paths and uses `run.ps1`, `stop.ps1`, `.pids`, and `compose.yaml` rather than ad-hoc global Docker commands.
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

## Near-Term Architecture Work

1. Add repeatable experiment structure on top of dataset/config version history.
2. Extend operator alerting on top of current recovery telemetry and audit signals.
3. Extend operational recovery coverage beyond the current script/Compose-aligned repair set.
