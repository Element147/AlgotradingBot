# Product Overview

Production-grade cryptocurrency algorithmic trading bot designed to scale profitably from $100 to $10,000 over 12-18 months.

## Core Strategy
Bollinger Bands Mean Reversion on BTC/USDT and ETH/USDT pairs using 1-hour candles. Entry on lower band bounce, exit at middle band or stop-loss.

## Risk Philosophy
- Maximum 2% risk per trade (capital preservation first)
- No leverage initially (1:1 only)
- 20-30% cash buffer maintained
- Circuit breakers and emergency stops required
- Max drawdown limit: 25%

## Performance Requirements
Strategy must pass ALL criteria before live deployment:
- Sharpe Ratio > 1.0
- Profit Factor > 1.5:1
- Win Rate 45-55%
- Max Drawdown < 25%
- Statistical significance (p-value < 0.05)
- 2+ years backtest validation
- Monte Carlo confidence ≥ 95%

## Scaling Phases
1. Phase 1 ($100-$500): Proof of concept, 2 pairs, 5-10% monthly
2. Phase 2 ($500-$2K): Add momentum strategy, 3-4 pairs
3. Phase 3 ($2K-$10K): Portfolio optimization, 5-8 pairs, micro-leverage
4. Phase 4 ($10K+): Advanced strategies, options, ML (optional)

## Critical Constraints
- Minimum position: $5-10
- Maximum position: $50-100 per trade
- Transaction costs: 0.1% taker fee + 3 bips slippage (always included)
- Realistic expectations: 5-15% monthly returns (not hype)
- NO curve-fitting, over-optimization, or over-leveraging
