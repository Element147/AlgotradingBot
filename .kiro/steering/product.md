# Product Overview

Local-first cryptocurrency algorithmic trading research platform focused on safe iteration, reproducible validation, and gradual progression from backtesting to paper trading.

## Core Strategy
Bollinger Bands Mean Reversion on BTC/USDT and ETH/USDT pairs using 1-hour candles. Entry on lower band bounce, exit at middle band or stop-loss.

## Risk Philosophy
- Maximum 2% risk per trade (capital preservation first)
- No leverage initially (1:1 only)
- 20-30% cash buffer maintained
- Circuit breakers and emergency stops required
- Max drawdown limit: 25%

## Validation Requirements
Any future live-trading consideration must be backed by reproducible evidence. A strategy should pass all of these criteria before it is even considered for live evaluation:
- Sharpe Ratio > 1.0
- Profit Factor > 1.5:1
- Win Rate 45-55%
- Max Drawdown < 25%
- Statistical significance (p-value < 0.05)
- 2+ years backtest validation
- Monte Carlo confidence â‰Ą 95%

## Delivery Phases
1. Phase 1: Solid local platform, auth, dashboard, and research foundations
2. Phase 2: Strategy management, trade history, and backtesting workflows
3. Phase 3: Paper trading, operator controls, and observability
4. Phase 4: Optional future live-readiness evaluation after sufficient evidence

## Critical Constraints
- Minimum position: $5-10
- Maximum position: $50-100 per trade
- Transaction costs: 0.1% taker fee + 3 bips slippage (always included)
- Honest expectations: no returns should be implied without reproducible evidence
- NO curve-fitting, over-optimization, or over-leveraging

