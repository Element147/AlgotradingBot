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

## Current Work (Now)

1. CI and quality gates
   - automate backend `test/build`
   - automate frontend `lint/test/build`
2. Documentation discipline
   - keep only root canonical docs current
   - remove stale one-off logs
3. Contract and model hardening
   - continue DTO record migration where safe
   - reduce frontend/backend contract drift
4. Research quality improvements
   - persist richer backtest series (equity/trade logs)
   - improve strategy comparison reporting

## Near Future

1. Data reproducibility
   - ingestion/replay workflow
   - consistent dataset/version metadata
2. Paper-trading hardening
   - operational logs and restart recovery checks
   - stronger operator action audit trails
3. Strategy lifecycle improvements
   - typed per-strategy parameters
   - versioned defaults and parameter history

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
