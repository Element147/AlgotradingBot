# Phase 13: Testing and Documentation (Week 13)

[Previous: Phase 12 - Local Deployment and Testing](./phase-12-local-deployment-testing.md) | [Back to Overview](./00-overview.md)

## Goal

Lock in quality after feature implementation by formalizing tests, contracts, and docs for local-first operation.

This is the final active phase in the current roadmap.

## Scope

- Frontend and backend verification baseline remains green.
- Core user flows are documented for beginner operators.
- API/UI contracts are checked for drift.
- Known risks and limitations are recorded clearly.

## Tasks

- [x] 13.1 Frontend verification baseline
  - `npm run lint`
  - `npm run test -- --watch=false`
  - `npm run build`

- [x] 13.2 Backend verification baseline
  - `gradlew.bat test`
  - `gradlew.bat build`
  - Confirm H2 test profile isolation

- [x] 13.3 Contract verification between FE and BE
  - Strategy management payloads
  - Trade history filtering payloads
  - Backtest run/history/details payloads
  - Risk config/status/override payloads

- [x] 13.4 Beginner-facing documentation pass
  - Clarify local setup commands
  - Clarify runtime PostgreSQL vs test H2 behavior
  - Clarify strategy/backtest interpretation caveats

- [x] 13.5 Guardrail documentation pass
  - Keep `test`/`paper` as default operating mode
  - Reiterate that backtest results are research artifacts

## Out of scope in this phase

- Production deployment automation
- Cloud hosting strategy
- Live-money execution rollout

These items are tracked in optional future phase documentation.

## Exit criteria

- Local-first stack can be built/tested/run reproducibly.
- Documentation aligns with actual repository behavior.
- No placeholder core pages remain in the active dashboard flow.
- FE/BE contracts still operate after refactors.

---

[Previous: Phase 12 - Local Deployment and Testing](./phase-12-local-deployment-testing.md) | [Back to Overview](./00-overview.md)
