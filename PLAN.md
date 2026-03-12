# PLAN

Status updated: March 11, 2026

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

## Current Work (Now)

1. Frontend enablement for newly added backend capabilities
   - audit-event views
   - replay/compare flows
2. Documentation discipline
   - keep only root canonical docs current
   - remove stale one-off logs
3. Contract and model hardening
   - reduce frontend/backend contract drift
4. Research quality improvements
   - persist richer backtest series (equity/trade logs)
   - expand strategy comparison reporting from API to UI exports

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
   - strict-by-default auth posture is implemented
   - finalize explicit dev-only override and onboarding guidance

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
