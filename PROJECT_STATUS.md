# PROJECT_STATUS.md

Status updated: March 11, 2026

## Current State

The repository is in an operational local-first MVP state:

- Backend and frontend are integrated for core research workflows.
- Default operating posture remains `test`/`paper`.
- Local runtime uses Docker PostgreSQL; backend tests/build run on H2 `test` profile.
- No default real-money execution path is enabled.

Implemented product slices:

1. Strategy management
2. Backtest execution plus history/details
3. Risk controls plus circuit-breaker override safeguards
4. Paper-trading account/order state

## Active Design Decisions (Source of Truth)

1. Strategy architecture is SOLID-oriented:
   - each backtest strategy is its own class
   - orchestration is in `BacktestSimulationEngine`
   - strategy discovery is bean-driven via `BacktestStrategyRegistry`
2. Backtest engine supports both `SINGLE_SYMBOL` and `DATASET_UNIVERSE` modes.
3. Financial values remain `BigDecimal` in money/risk paths.
4. Immutable HTTP DTOs should prefer Java `record` where contract and framework constraints allow.
5. Runtime/live integration points stay isolated behind services and safety gates.

## Documentation Cleanup Status

Completed in this update:

- Removed legacy completion/progress/verification docs that duplicated finished work.
- Merged key long-term findings into canonical docs (`README`, `PROJECT_STATUS`, `ARCHITECTURE`, `TRADING_GUARDRAILS`, roadmap/acceptance).
- Kept only current and future-facing guidance plus essential guardrails.
- Migrated steering/planning guidance to root docs (`PLAN.md`, `PRODUCT.md`, `TECH.md`, `STRUCTURE.md`, `GRADLE_AUTOMATION.md`) and retired `.kiro` usage.

## Remaining Work (Current Priorities)

1. CI pipeline for backend and frontend verification gates.
2. Continued DTO modernization (remaining mutable controller DTOs to records where safe).
3. Stronger operator auditability for overrides, environment changes, and critical actions.
4. Market-data ingestion/replay workflow for reproducible research datasets.
5. Strategy comparison/reporting depth (equity/trade-series persistence and side-by-side analysis).

## Known Risks and Constraints

- Strategy outcomes are simulation artifacts and must not be presented as guaranteed returns.
- Current strategy action model is primarily `long/flat/rotate`; direct short/margin/leverage paths are intentionally constrained.
- Some legacy code style remains in non-critical areas; modernization is incremental to avoid regressions.

## Verification Baseline

Last verified baseline (local):

- Frontend: `lint`, `test`, and `build` pass
- Backend: `test` and `build` pass
- Local app startup path (`run.ps1`) is functional with health endpoint availability

Use `README.md` commands as the standard verification/runbook.
