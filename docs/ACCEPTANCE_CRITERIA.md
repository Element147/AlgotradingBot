# ACCEPTANCE_CRITERIA

## Definition Of Done Template

Every feature should meet all of these unless a task explicitly says otherwise:

- The relevant spec or requirement is identified.
- The implementation matches the current architecture or documents an intentional deviation.
- Safety defaults remain conservative.
- Tests or verification steps are run and recorded.
- User-facing and developer-facing docs are updated if behavior changed.
- Known gaps, assumptions, and follow-up work are listed.

## Backend Endpoint

- Endpoint has request/response DTOs.
- Service logic is separated from controller wiring.
- Validation and error handling are explicit.
- Auth and environment rules are enforced where relevant.
- Tests cover success, validation failure, and auth/error behavior.
- API contract is reflected in frontend usage or documented for future consumers.

## Frontend Page Or Component

- Uses typed props and typed API data.
- Handles loading, empty, error, and success states.
- Uses the established feature-based structure.
- Reflects active environment clearly when relevant.
- Tests cover core rendering and critical interactions.
- Docs or status files are updated if the page materially changes project completion.

## WebSocket Or Event Flow

- Event name and payload shape are documented.
- Backend publisher and frontend consumer agree on payload fields.
- Reconnection and stale-connection behavior are defined.
- UI behavior under delayed or missing events is acceptable.
- Tests cover at least one happy path and one failure or reconnect path.

## Strategy Module

- Inputs, parameters, and assumptions are documented.
- Entry, exit, stop-loss, and sizing behavior are explicit.
- Fees and slippage assumptions are included in evaluation.
- Risk checks are applied before simulated or paper/live execution.
- Unit tests cover edge cases and numeric correctness.
- Any performance statement is labeled as simulated unless proven otherwise.

## Backtesting Module

- Input dataset and date range are explicit.
- Fees and slippage are modeled.
- Results are reproducible from the same inputs and parameters.
- Metrics include at least trade count, drawdown, Sharpe, profit factor, and win rate.
- Out-of-sample or walk-forward handling is documented when used.
- Tests cover calculation correctness and representative scenarios.

## Paper Trading Workflow

- Paper environment is clearly distinct from test and live.
- No real-money credentials or order placement are used.
- Order lifecycle, fills, balances, and logs are visible.
- Operator can stop strategies and inspect recent activity.
- At least one end-to-end verification path is documented and repeatable.

## Risk Control Feature

- Guardrail threshold is documented.
- Trigger condition, resulting action, and reset behavior are explicit.
- UI and backend agree on current state representation.
- Manual override behavior is audited and access-controlled.
- Tests cover trigger and non-trigger behavior.

## Required Testing Expectations

- Financial calculations: strong unit coverage
- API endpoints: controller/service tests where practical
- Frontend critical flows: component or integration coverage
- Cross-stack contract changes: verified on both sides or clearly documented as pending

## Required Documentation Expectations

- Update `PROJECT_STATUS.md` when completion or risk posture changes.
- Update `ARCHITECTURE.md` when boundaries or module responsibilities change.
- Update `TRADING_GUARDRAILS.md` when risk or environment rules change.
- Update roadmap or spec references when priorities materially shift.
