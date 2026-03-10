# TRADING_GUARDRAILS.md

## Purpose

These are repository-level safety rules for research, backtesting, paper trading, and any future live-trading work. They are stricter than feature convenience and should not be relaxed casually.

## Non-Negotiable Rules

- No real-money trading by default.
- No profitability claims without reproducible evidence.
- No deployment of new strategy logic straight to live trading.
- No mixing of test, paper, and live credentials or data stores.
- No changes to risk limits without documenting why, how they were tested, and who approved them.

## Environment Separation

Treat these as distinct operating modes:

- `test`: local development, fixtures, mocks, synthetic data, and experiments
- `paper`: real market data or exchange simulation without real order placement
- `live`: real exchange credentials and real-money execution

Required expectations:

- Separate configuration for each environment
- Separate credentials and secrets
- Clear UI and API indication of the active environment
- Safe default to `test`
- Explicit user confirmation before entering `live`

## Paper Trading Before Live Trading

Paper trading is mandatory before any live-trading consideration.

Minimum expectations before live consideration:

- Reproducible backtest results with realistic costs
- Out-of-sample or walk-forward validation
- Paper-trading soak test with stable behavior
- Verified operator controls, alerts, and kill switch
- Documented rollback path

## Baseline Risk Limits

These are the repository's default guardrail targets until explicitly changed and verified:

- Max risk per trade: 2% of account equity
- Max aggregate open risk: 6% of account equity
- Max drawdown stop: 25%
- Cash buffer target: 20% to 30%
- No leverage by default

If automation does not yet enforce one of these limits, treat it as a manual operating rule and document the gap.

## Daily Loss And Drawdown Stops

Minimum expected controls:

- Daily realized loss stop before more trades are opened
- Drawdown stop that halts strategy execution or paper/live order creation
- Circuit breaker that prevents repeated execution after degraded performance
- Manual reset or override path with audit logging

Repository policy target:

- Daily realized loss stop should be defined and enforced before paper-trading automation is considered complete

## Circuit Breaker And Kill Switch Expectations

The system should support:

- Strategy-level stop
- Account-level stop
- Environment-level kill switch
- Manual operator override with traceable audit record
- Clear UI status for triggered guardrails

No live trading should be considered until a kill switch can be exercised and verified locally.

## Validation Requirements Before Any Live Consideration

All of the following should exist and be reproducible:

- Versioned strategy parameters
- Historical backtest with fees and slippage
- Out-of-sample evaluation
- Walk-forward or regime-sensitivity analysis
- Trade count high enough to support statistical interpretation
- Paper-trading results with operational logs
- Failure-mode testing for restarts, disconnects, and stale market data

## Honest Strategy Evaluation Standards

Every strategy report should state:

- Data period and instruments used
- Fees and slippage assumptions
- In-sample vs out-of-sample split
- Trade count
- Max drawdown
- Profit factor, Sharpe, and win rate
- Known failure regimes and limitations

Never present:

- Hypothetical returns as guaranteed outcomes
- Backtests as proof of future profitability
- Paper-trading results as live results
- Optimized parameters without disclosing validation method

## Prohibited Claims

Do not write or imply:

- "This strategy is profitable"
- "This bot will scale capital to a target amount"
- "Expected monthly returns are X" unless backed by reproducible evidence and clearly labeled as historical or simulated

Allowed wording:

- "Current backtest shows X under these assumptions"
- "Paper-trading results over Y days were Z"
- "This remains a research hypothesis pending further validation"
