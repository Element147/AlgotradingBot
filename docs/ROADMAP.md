# ROADMAP

## Planning Assumptions

- One developer, local laptop, incremental delivery
- Preserve Spring Boot plus React/Vite
- Research and paper trading before any live-trading work
- Stabilize verification before adding large feature surface

## Now

### Platform completion

- Create and maintain repo governance docs
- Stabilize local verification workflows for backend and frontend
- Add CI for lint, tests, and build checks
- Remove stale or overstated docs that claim functionality not yet verified

Deliverables:

- Reproducible developer runbook
- Passing baseline verification checks or documented exceptions
- CI workflow covering backend and frontend

### Backend/API completion

- Normalize auth and dashboard API contracts
- Add missing endpoints for risk status/config, circuit-breaker status, and backtest execution
- Add consistent DTO naming and environment handling

Deliverables:

- Stable auth contract
- Risk and backtest API surface aligned with frontend roadmap
- Contract documentation for frontend consumers

### Frontend/dashboard completion

- Preserve the passing Phase 2 baseline while expanding feature depth
- Replace placeholder pages for strategies, trades, backtest, risk, and settings with real feature shells backed by APIs
- Resolve current dashboard DTO mismatches

Deliverables:

- Verified dashboard route flow
- Real data-backed pages for the next highest-value features
- Stable test harness for component and integration tests

## Next

### Trading research infrastructure

- Define market-data ingestion, storage, fixtures, and replay workflows
- Version strategy parameters and experiment outputs
- Add reproducible research notebooks or scripts where useful

Deliverables:

- Repeatable data import workflow
- Documented experiment directory structure
- Strategy evaluation template

### Backtesting and analytics

- Add API-driven backtest execution
- Expose walk-forward and Monte Carlo results
- Add richer analytics and exportable reports

Deliverables:

- Backtest run endpoint plus persistence
- Frontend backtest result views
- Metrics report format used across strategies

### Paper trading

- Introduce a first-class paper-trading environment distinct from backtest and live
- Add simulated order lifecycle, fills, balances, and logs
- Add operator controls and clear environment indicators

Deliverables:

- Paper account model
- Paper execution service
- Paper-trading dashboard and history views

## Later

### Hardening and observability

- Add structured audit logging for strategy changes, order actions, and environment switches
- Add health dashboards, alerts, and local observability tooling
- Add chaos-style checks for restart and disconnect behavior

Deliverables:

- Audit trail for critical actions
- Operator troubleshooting dashboards
- Recovery playbooks

### Optional future evaluation

- Evaluate read-only live exchange connectivity after paper trading is stable
- Revisit deployment packaging only if local workflow is insufficient
- Evaluate more advanced research tooling only after core platform gaps are closed

Deliverables:

- Read-only live connectivity assessment
- Explicit go/no-go decision document before any live execution work

## Dependency Order

1. Verification stability
2. Contract stability
3. Core feature completion
4. Research reproducibility
5. Paper trading
6. Hardening and observability
7. Any live-trading evaluation
