# Acceptance Criteria

## Definition Of Done

Every change is done only when all of the following are true:

- Scope aligns with the current architecture or clearly documents an intentional deviation.
- Safety defaults remain conservative.
- Relevant verification runs and the result is reported honestly.
- Backend and frontend contracts stay aligned.
- Canonical docs are updated when behavior, boundaries, or workflows change.
- Assumptions, known gaps, and residual risks are called out explicitly.

## Backend Change

- Controller, service, repository, and persistence boundaries remain separated.
- Money and risk calculations use `BigDecimal`.
- DTO boundaries are preserved.
- Critical operator actions remain auditable when the scope touches overrides, system operations, or execution controls.
- New execution behavior includes environment gating and fail-closed handling.
- Tests cover success paths and meaningful validation or failure paths.

## Frontend Change

- Feature boundaries remain explicit.
- Loading, empty, error, and success states are handled.
- Environment mode impact stays visible and correct.
- Contract adaptation remains centralized in API or transport layers.
- Backend-supported operator workflows are surfaced intentionally in the UI, or any remaining gap is documented explicitly.
- Tests cover the key user interactions or regressions affected by the change.

## Strategy And Backtest Change

- Inputs, assumptions, and parameters are explicit.
- Dataset identity remains reproducible.
- Fees and slippage are represented honestly.
- Action model and exposure state remain explicit and mode-safe.
- Metrics remain sufficient for review.
- Replay or verification paths continue to exist for research claims.

## Documentation Change

Update canonical docs for durable decisions:

- `README.md`
- `PLAN.md`
- `PRODUCT.md`
- `PROJECT_STATUS.md`
- `ARCHITECTURE.md`
- `TRADING_GUARDRAILS.md`
- `TECH.md`
- `STRUCTURE.md`
- `GRADLE_AUTOMATION.md`
- `docs/ROADMAP.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/guides/*.md` when a task guide's workflow changes

Avoid adding one-off progress logs once the important decision has been merged into the current-state docs.

## Verification Baseline

Frontend as needed:

- `npm run lint`
- `npm run test -- --watch=false`
- `npm run build`

Backend as needed:

- `.\gradlew.bat test`
- `.\gradlew.bat build`
