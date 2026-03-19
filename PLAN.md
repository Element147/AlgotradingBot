# Plan

## Purpose

This file tracks the current implementation focus. It is intentionally forward-looking and should not be used as a changelog.

## Now

1. Documentation discipline
   - keep the slim canonical docs current
   - keep task guides current only when the underlying workflow changes
   - keep one authoritative document per concern instead of repeating the same state across multiple files
2. Research workflow hardening
   - keep backtest provenance, experiment grouping, and export safeguards stable
   - deepen review workflows around experiments and paper-trading incidents
3. Market-data coverage
   - keep the existing provider-backed import pipeline reliable
   - add new providers only when they close a concrete historical-data gap
4. Operational clarity
   - improve alert delivery and operator review ergonomics without weakening defaults
   - keep local runtime and repair paths aligned with the repository scripts

## Next

1. Multi-channel alert delivery for important operator and paper-trading incidents
2. Deeper experiment governance and review workflows on top of the current reproducibility model
3. Additional contract hardening where new backend surfaces need generated frontend coverage
4. Incremental runtime validation and smoke automation around the existing local and Docker entrypoints

## Later

1. Production-readiness automation for container health, startup ordering, and longer-running stability checks
2. Optional live-readiness evaluation only after paper evidence, auditability, and rollback paths are all strong enough
3. Explicit benchmarking of preview-only Java features behind opt-in profiles, never as the default runtime path

## Gates

1. Guardrails never weaken.
2. `test` and paper-first behavior stays the default.
3. Strategy claims remain reproducible and honestly labeled.
4. Live-readiness work stays opt-in, auditable, and heavily gated.
5. Durable docs describe the current system, not the history of how it was built.
