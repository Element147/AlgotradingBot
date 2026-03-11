# ROADMAP

Status updated: March 11, 2026

## Planning Principles

- Local-first delivery over infrastructure-heavy complexity
- Safety-first defaults (`test`/`paper`)
- Reproducible verification before claiming progress
- Small, reversible increments

## Now (0-4 weeks)

1. Stabilize CI verification gates
   - backend `test/build`
   - frontend `lint/test/build`
2. Complete remaining DTO modernization to records where safe.
3. Improve auditability for overrides, environment changes, and system operations.
4. Keep docs lean: only canonical docs and active specs remain current.

## Next (1-2 months)

1. Research reproducibility infrastructure
   - dataset ingestion/replay workflow
   - repeatable experiment structure
2. Backtest analytics depth
   - persist equity/trade series
   - strategy comparison views and exports
3. Strategy parameter lifecycle
   - typed parameter sets
   - versioned defaults and changelog

## Later (2+ months)

1. Paper-trading hardening
   - stronger operational logs
   - restart/recovery behavior checks
2. Contract stability
   - generated/shared frontend-backend API contracts
3. Optional live-readiness evaluation
   - only after paper stability, audit controls, and guardrail verification

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
