# Phase Dependencies and Execution Order

## Active chain (local-first)

1. Phase 1 (Authentication)
2. Phase 2 (Layout and Dashboard)
3. Phase 3 (Strategy Management)
4. Phase 4 (Trade History)
5. Phase 5 (Backtest Visualization)
6. Phase 6 (Risk Management)
7. Phase 7 (Settings and Exchange Integration)
8. Phase 8 (Charts and Visualization)
9. Phase 9 (Performance Optimization)
10. Phase 10 (Security Hardening)
11. Phase 11 (Accessibility Compliance)
12. Phase 12 (Local Deployment and Testing)
13. Phase 13 (Testing and Documentation)

## Optional future phase

14. Phase 14 (Production Deployment and Monitoring)

Phase 14 is intentionally not required for the current local-first research milestone.

## Completion criteria per phase

A phase is complete when all are true:

- tasks for that phase are implemented
- relevant tests pass
- build checks pass
- docs reflect real behavior
- no safety guardrails are weakened

## Verification rules

- Execute phases sequentially for active chain (1 -> 13).
- Do not start phase N before phase N-1 is stable.
- If a phase introduces FE/BE contract changes, verify both sides before moving forward.
- Keep runtime DB and test DB responsibilities separate:
  - runtime: PostgreSQL
  - tests/build: H2

## Last updated

March 11, 2026
