# ROADMAP

Status updated: March 12, 2026

## Planning Principles

- Local-first delivery over infrastructure-heavy complexity
- Safety-first defaults (`test`/`paper`)
- Reproducible verification before claiming progress
- Small, reversible increments

## Now (0-4 weeks)

1. Frontend adoption of newly shipped backend hardening features
   - completed: operator audit-event visibility
   - completed: backtest replay and comparison workflow wiring
2. Complete remaining contract modernization
   - completed: maintain DTO record style
   - completed: reduce frontend/backend drift with shared contracts
3. Risk-elimination migration phase 2
   - completed: strict-default auth posture shipped
   - completed: explicit local-dev override guidance and rollout/rollback playbook
4. Keep docs lean: only canonical root docs remain current.

## Next (1-2 months)

1. Research reproducibility infrastructure
   - completed: dataset lifecycle tooling beyond upload/download (inventory, retention)
   - completed: repeatable experiment structure
2. Backtest analytics depth
   - completed: persist equity/trade series
   - completed: strategy comparison views/exports with provenance guards in frontend
   - completed: experiment-level multi-run summaries and experiment-aware report packaging
3. Strategy parameter lifecycle
   - completed: versioned defaults and changelog
   - completed: typed parameter editing ergonomics

## Later (2+ months)

1. Paper-trading hardening
   - completed: stronger operator alert delivery in dashboard/API
   - completed: deeper restart/recovery playbooks for port/orphan/network signatures
   - completed: audit-event UX refinement with shared dashboard/settings review surfaces
   - next: multi-channel notification routing
2. Contract stability
   - completed: generated/shared frontend-backend API contracts
3. Optional live-readiness evaluation
   - only after paper stability, audit controls, and guardrail verification
4. Optional production-readiness automation
   - container health/startup-order validation
   - resource and stability checks for long-running local operation

## Strategy R&D Focus Order

1. Validate existing trend-first catalog under strict costs.
2. Improve regime handling and cross-strategy comparison.
3. Add short-proxy behavior only behind explicit safety gates.
4. Keep leverage and direct margin shorting out of default path.

## Exit Criteria Per Roadmap Stage

A stage is complete when:

- relevant tests pass
- docs match verified behavior
- guardrails are unchanged or strengthened
- open risks are explicitly documented
