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
- `backtest`: simulation engine, metrics, validators
- `backtest/strategy`: strategy interface, implementations, registry, indicator helpers
- `risk`: risk and execution-cost calculations
- `security`: auth/token/security components
- `config`, `websocket`, `validation`, `repair`: platform and operational support

### Backtest Design

- Strategy seam: each strategy is a separate Spring bean implementing `BacktestStrategy`.
- Registry seam: `BacktestStrategyRegistry` resolves strategy metadata and execution routing.
- Simulation seam: `BacktestSimulationEngine` runs execution loops and position transitions.
- Metrics seam: `BacktestSimulationMetricsCalculator` computes performance statistics.

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
- Keep runtime and test data concerns strictly separated.

## Current Architecture Decisions

1. Use DTO boundaries for HTTP; do not expose JPA entities directly.
2. Keep financial precision paths on `BigDecimal`.
3. Prefer immutable DTOs as Java records where possible.
4. Isolate exchange/live connectivity behind dedicated service boundaries.
5. Keep risk/guardrail logic independent from UI concerns.

## Near-Term Architecture Work

1. Finish remaining DTO record migration safely.
2. Add stronger audit/event trails for critical operator actions.
3. Improve strategy analytics persistence (equity curve, trade-level series).
4. Add contract-drift protection (generated/shared API contracts).
5. Add CI gates for cross-stack regression checks.
