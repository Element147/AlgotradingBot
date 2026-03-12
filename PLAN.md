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

## Current Work (Now)

1. Documentation discipline
   - keep only root canonical docs current
   - remove stale one-off logs
2. Research quality improvements
   - dataset lifecycle tooling beyond upload/download
   - richer comparison/reporting slices on top of persisted backtest series
3. Operational hardening
   - paper-trading restart recovery checks and alerting
   - extend repair playbooks for additional runtime failure signatures

## Near Future

1. Data reproducibility
   - dataset lifecycle tooling (version inventory + retention)
   - reproducibility checks in strategy reports
2. Paper-trading hardening
   - operational logs and restart recovery checks
   - audit-event UX and alerting
3. Strategy lifecycle improvements
   - typed per-strategy parameters
   - versioned defaults and parameter history
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
