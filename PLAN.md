# PLAN

Status updated: March 12, 2026

## Purpose

Single slim implementation plan replacing legacy multi-file phase specs.

## Current State (Done)

1. Core platform and auth foundations are implemented.
2. Strategy management, backtest, risk, and paper-trading workflows are implemented end-to-end.
3. Frontend dashboard flows are implemented with real data integration.
4. Backtest strategy architecture is modular (`BacktestStrategy` + registry + simulation engine).
5. Local run/build workflow is stable (`build.ps1`, `run.ps1`, `stop.ps1`).
6. CI verification gates are implemented in GitHub Actions.
7. Operator audit trail and reproducibility APIs (dataset checksum/download, backtest replay/compare) are implemented.
8. Controller DTO modernization to records has progressed to the core mutable response set.
9. Frontend now surfaces operator audit events plus replay/compare and dataset reproducibility workflows.
10. Backtest details now persist and return real equity/trade series used by chart and CSV/PNG exports.
11. Generated OpenAPI contract export/check workflow is implemented and enforced in CI.
12. Account endpoints now fail closed for unavailable live reads and surface explicit capability errors to dashboard/settings flows.
13. System backup endpoint now creates real database backup artifacts instead of placeholder metadata files.
14. Dashboard system-health status now consumes `systemInfo` and `riskStatus` instead of placeholder probes.
15. Trade details now use a dedicated backend endpoint rather than client-side filtering of large history payloads.
16. Environment routing now supports explicit `X-Environment` request overrides end to end for account/risk flows.
17. Repair/orchestration automation now uses repo-aware workspace resolution and the same `run.ps1`/`stop.ps1`/Compose entrypoints as the operator workflow.
18. Dataset lifecycle tooling now includes retention inventory, archive/restore controls, and archived-dataset run blocking.
19. Strategy management now persists configuration history and exposes version metadata in the UI/API.
20. Paper-trading dashboard state now includes restart-recovery telemetry for stale orders/positions.
21. Backtest reports/comparisons now carry dataset provenance and block exports when provenance is incomplete.
22. Backend compilation now runs with `-Xlint:deprecation`, and the audited deprecated API set has been removed.
23. Backtests now persist repeatable experiment names/keys and expose grouped experiment summaries in the API/UI.
24. Paper-trading state now includes incident summaries plus in-app operator alerts derived from recovery telemetry.
25. Strategy configuration modal now surfaces typed strategy presets and recommended timeframe/risk ergonomics.
26. Repair selection now recognizes port-conflict and orphan/network failure signatures and routes to dedicated playbooks.
27. Historical market-data downloader/import workflows are implemented for free stock/crypto providers and feed completed datasets into backtest storage.
28. Admin-managed encrypted provider credential storage with note support is implemented for keyed market-data providers.

## Current Work (Now)

1. Documentation discipline
   - keep only root canonical docs current
   - remove stale one-off logs
2. Research data acquisition
   - completed: provider-backed historical market-data downloader with retry-aware import jobs and direct backtest dataset ingestion
   - completed: encrypted PostgreSQL storage for keyed-provider credentials with frontend note capture and env-var fallback
   - next: expand provider coverage only when a concrete data gap remains after the current free-source set
3. Operational hardening
   - completed: operator alert delivery on top of paper-trading recovery signals
   - completed: extend repair playbooks for additional runtime failure signatures

## Near Future

1. Data reproducibility
   - completed: repeatable experiment structure and naming conventions
   - completed: stronger research report packaging on top of current provenance checks
2. Paper-trading hardening
   - completed: operator alert routing and incident summaries
   - completed: audit-event UX refinements with filterable summaries and dashboard/settings review surfaces
3. Strategy lifecycle improvements
   - completed: typed per-strategy parameter editing ergonomics
   - completed: higher-level experiment/change review flows
4. Security hardening migration
   - strict-by-default auth posture and explicit local override runbook are implemented
   - keep rollout/rollback guidance current as auth workflows evolve

## Optional Future (Only After Hardening)

1. Production-readiness track
   - container validation automation
   - resource/stability checks
   - failure recovery and repair playbooks
2. Live-readiness evaluation
   - only after reproducible paper evidence and guardrail verification
   - no default live execution enablement

## Non-Negotiable Gates

1. Guardrails are never weakened.
2. Profitability is never claimed without reproducible evidence.
3. Test/paper defaults remain the system default.
4. Any live-readiness work stays explicitly opt-in and heavily audited.
5. Critical operator actions remain auditable and reproducible.
