# ACCEPTANCE_CRITERIA

Status updated: March 11, 2026

## Definition Of Done (Global)

Every change is done only when all are true:

- Scope aligns with current architecture or documents an intentional deviation.
- Safety defaults remain conservative (`test`/`paper` first).
- Relevant verification commands are run and results are recorded.
- Backend/frontend contract changes are reflected on both sides.
- Canonical docs are updated when behavior or boundaries change.
- Assumptions, gaps, and residual risks are called out explicitly.

## Backend Change

- Controller/service/repository concerns remain separated.
- Money/risk calculations use `BigDecimal`.
- DTO boundaries are preserved (no JPA entity leakage to HTTP).
- New strategy or execution logic includes risk checks and mode gating.
- Tests cover success path plus meaningful failure/validation cases.

## Frontend Change

- Feature-module boundaries are preserved.
- Loading/empty/error/success states are handled.
- Environment mode impact is visible and correct.
- API contract adaptation is centralized (not scattered in components).
- Tests cover key user interactions and regressions.

## Strategy/Backtest Change

- Inputs, assumptions, and parameters are explicit.
- Fees/slippage are included.
- Action model (`long/flat/short-proxy`) is explicit and mode-safe.
- Metrics include at least return, drawdown, Sharpe, profit factor, win rate, trade count.
- Claims are clearly labeled as simulated/paper unless proven otherwise.

## Documentation Change

- Update only canonical docs for durable decisions:
  - `README.md`
  - `PLAN.md`
  - `PRODUCT.md`
  - `TECH.md`
  - `STRUCTURE.md`
  - `GRADLE_AUTOMATION.md`
  - `PROJECT_STATUS.md`
  - `ARCHITECTURE.md`
  - `TRADING_GUARDRAILS.md`
  - `docs/ROADMAP.md`
  - `docs/ACCEPTANCE_CRITERIA.md`
- One-off completion/progress logs should be removed after key findings are merged.

## Verification Baseline

Frontend (as needed):

- `npm run lint`
- `npm run test -- --watch=false`
- `npm run build`

Backend (as needed):

- `.\gradlew.bat test`
- `.\gradlew.bat build`
