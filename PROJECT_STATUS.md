# PROJECT_STATUS.md

Status updated: March 12, 2026

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
6. Dataset lifecycle and reproducibility controls (`checksumSha256`, schema version, retention inventory, archive/restore, download)
7. Strategy configuration version history and versioned defaults
8. Paper-trading recovery status visibility for stale-order/stale-position detection
9. Provenance-guarded backtest reporting and comparison exports
10. Repeatable experiment grouping and multi-run research summaries
11. In-app paper-trading incident alerts and operator actions
12. Typed strategy-configuration preset guidance
13. Filterable operator audit summaries and review UX in dashboard/settings

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
6. Surfaced audit-event history plus replay/compare and dataset download workflows in the frontend.
7. Persisted real backtest equity/trade series and switched results charts/exports from synthetic data to stored execution analytics.
8. Added generated OpenAPI contract export/check flow and wired it into frontend CI verification.
9. Published strict-auth operator runbook plus explicit dev-only override guidance in canonical docs and login UX.
10. Replaced live-mode account fallback behavior with explicit capability gating; `/api/account/*` now honors query/header environment routing and returns a 409 error instead of paper data when live reads are unavailable.
11. Replaced the backup metadata placeholder with real database backup artifacts (`SCRIPT` on H2 tests, `pg_dump` with Docker fallback on PostgreSQL runtime).
12. Rewired the dashboard system-health card to real `systemInfo` and `riskStatus` APIs, including database/Kafka and circuit-breaker status.
13. Added a dedicated trade-details endpoint and switched the frontend modal off the 1000-row client-side lookup path.
14. Normalized frontend/backend environment routing onto `X-Environment` overrides, with shared resolver use on account/risk paths and explicit request-level header support in the frontend transport.
15. Replaced repair/orchestration placeholders with workspace-aware automation aligned to `run.ps1`, `stop.ps1`, repo-local Compose paths, and managed PID/port cleanup.
16. Added dataset lifecycle inventory, retention reporting, and archive/restore controls with backend enforcement that archived datasets cannot be used for new runs.
17. Added persisted strategy configuration history, surfaced version metadata in strategy management, and exposed a dedicated config-history API/UI.
18. Added paper-trading recovery telemetry (`staleOpenOrderCount`, `stalePositionCount`, recovery status/message) to the backend and dashboard.
19. Extended backtest detail/comparison responses with dataset provenance and blocked report/comparison exports when checksum/schema/timestamp provenance is incomplete.
20. Eliminated the audited deprecated/legacy API usage set and enabled backend `-Xlint:deprecation` compilation so regressions surface during normal verification.
21. Added repeatable backtest experiment names/keys, grouped experiment summaries, and experiment-aware report/details UI.
22. Added paper-trading incident summaries and in-app operator alerts on top of stale-order/stale-position telemetry.
23. Added typed strategy preset guidance in strategy configuration UX.
24. Extended repair action selection for port-conflict and orphan/network failure signatures.
25. Added filterable operator audit summaries plus dashboard/settings audit review surfaces.

## Remaining Work (Current Priorities)

1. No blocking items remain in the March 12, 2026 current-priority technical-debt set.
2. The March 12, 2026 research-quality, operator-alerting, audit-review, and migration-hardening set is complete end to end.
3. Next priorities move to multi-channel alert delivery plus deeper experiment governance/review automation on top of the now-hardened research workflow.

## Risk Elimination Migration Strategy

Phase 1 (implemented now):

1. Add CI gates so regressions are blocked by default.
2. Add audit trails for critical operator actions.
3. Add reproducibility metadata and replay primitives for backtests.

Phase 2 (implemented now):

1. Strict-default auth posture is enabled (`relaxed-auth=false` unless explicitly overridden).
2. Dev-only override guidance and onboarding docs are published.

Phase 3 (implemented now):

1. Surface audit/reproducibility signals in the frontend so operators can verify actions quickly.
2. Persist richer analytics (equity/trade series) for reproducible comparisons.
3. Add contract generation/checks to reduce frontend/backend drift risk.

Phase 4 (implemented now):

1. Align repair/orchestration automation with repo-local scripts and Compose topology instead of ad-hoc global Docker commands.
2. Replace stubbed port-conflict handling with managed stop/cleanup actions and fail-closed reporting when conflicts remain.

Phase 5 (implemented now):

1. Add dataset lifecycle inventory/retention controls and block archived datasets from new research runs.
2. Add versioned strategy configuration history and surface it in the operator UI.
3. Add paper-trading recovery telemetry and provenance-guarded research exports.
4. Remove remaining audited deprecated APIs and enable compiler-level deprecation visibility.

## Known Risks and Constraints

- Strategy outcomes are simulation artifacts and must not be presented as guaranteed returns.
- Current strategy action model is primarily `long/flat/rotate`; direct short/margin/leverage paths are intentionally constrained.
- Strict auth is the default; local override remains explicit via `ALGOTRADING_RELAXED_AUTH=true`.

## Verification Baseline

Last verified baseline (local):

- Frontend: targeted `test` pass, `build` pass, `lint` pass after fixing an existing duplicate-import issue in `BacktestResults.test.tsx`
- Backend: `test` and `build` pass
- Contract artifacts: `npm run contract:generate` refreshed `contracts/openapi.json` and `frontend/src/generated/openapi.d.ts`; `npm run contract:check` will remain non-zero until those generated diffs are committed
- Local app startup path (`run.ps1`) is functional with health endpoint availability

Use `README.md` commands as the standard verification/runbook.
