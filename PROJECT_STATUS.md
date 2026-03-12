# PROJECT_STATUS.md

Status updated: March 11, 2026

## Current State

The repository is in an operational local-first MVP state:

- Backend and frontend are integrated for core research workflows.
- Default operating posture remains `test`/`paper`.
- Local runtime uses Docker PostgreSQL; backend tests/build run on H2 `test` profile.
- No default real-money execution path is enabled.
- Cross-stack CI verification gates now exist in `.github/workflows/ci.yml`.

Implemented product slices:

1. Strategy management
2. Backtest execution plus history/details plus replay/compare APIs
3. Risk controls plus circuit-breaker override safeguards
4. Paper-trading account/order state
5. Operator audit-event trail for critical actions (`/api/system/audit-events`)
6. Dataset reproducibility metadata (`checksumSha256`, schema version) and dataset download API

## Active Design Decisions (Source of Truth)

1. Strategy architecture is SOLID-oriented:
   - each backtest strategy is its own class
   - orchestration is in `BacktestSimulationEngine`
   - strategy discovery is bean-driven via `BacktestStrategyRegistry`
2. Backtest engine supports both `SINGLE_SYMBOL` and `DATASET_UNIVERSE` modes.
3. Financial values remain `BigDecimal` in money/risk paths.
4. Immutable HTTP DTOs should prefer Java `record` where contract and framework constraints allow.
5. Runtime/live integration points stay isolated behind services and safety gates.

## Completed In This Iteration

1. Implemented CI workflow with backend `test/build` and frontend `lint/test/build`.
2. Added durable operator audit-event persistence and API for critical operator actions.
3. Added reproducibility features for backtest datasets (checksum + schema version + download).
4. Added backtest replay endpoint and side-by-side comparison endpoint.
5. Completed a controller-DTO modernization wave (mutable DTO classes converted to records where safe).

## Remaining Work (Current Priorities)

1. Frontend surfacing for new backend capabilities (audit-event views, replay/compare workflows).
2. Strategy analytics persistence depth (equity/trade-series storage and exports).
3. Contract drift hardening (shared/generated API contracts).
4. Security UX hardening (operator-friendly auth runbooks and explicit dev override playbook).

## Risk Elimination Migration Strategy

Phase 1 (implemented now):

1. Add CI gates so regressions are blocked by default.
2. Add audit trails for critical operator actions.
3. Add reproducibility metadata and replay primitives for backtests.

Phase 2 (implemented now):

1. Strict-default auth posture is enabled (`relaxed-auth=false` unless explicitly overridden).
2. Next migration item: dev-only override guidance and onboarding docs.

Phase 3 (after hardening):

1. Surface audit/reproducibility signals in the frontend so operators can verify actions quickly.
2. Persist richer analytics (equity/trade series) for reproducible comparisons.
3. Add contract generation/checks to reduce frontend/backend drift risk.

## Known Risks and Constraints

- Strategy outcomes are simulation artifacts and must not be presented as guaranteed returns.
- Current strategy action model is primarily `long/flat/rotate`; direct short/margin/leverage paths are intentionally constrained.
- Strict auth is the default; local override remains explicit via `ALGOTRADING_RELAXED_AUTH=true`.
- Some legacy code style remains in non-critical areas; modernization is incremental to avoid regressions.

## Verification Baseline

Last verified baseline (local):

- Frontend: `lint`, `test`, and `build` pass
- Backend: `test` and `build` pass
- Local app startup path (`run.ps1`) is functional with health endpoint availability

Use `README.md` commands as the standard verification/runbook.
