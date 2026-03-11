# Small-Account Strategy Research

Updated: March 11, 2026

## Purpose

This document is a realistic shortlist of strategy types that fit this repository's current state and a small starting account such as EUR 150.

It is not a profitability claim. Every strategy below remains a research hypothesis that must be validated with fees, slippage, out-of-sample testing, and paper trading before it deserves more trust.

This document is aligned with:

- `TRADING_GUARDRAILS.md`
- `.kiro/steering/product.md`
- the current built-in backtest algorithms in `BacktestAlgorithmType`: `BOLLINGER_BANDS`, `SMA_CROSSOVER`, and `BUY_AND_HOLD`

## Executive View

If you start with around EUR 150 and stay conservative, the realistic path is:

1. Use slow, low-turnover strategies on liquid instruments only.
2. Treat `long/cash` as the default mode.
3. Treat "short without leverage" as a stock-broker proxy problem, not a direct spot-trading feature.
4. Avoid intraday stock day trading, scalping, grid bots, martingale, options, and anything that depends on low latency.

The best candidates for this repo right now are:

1. `SMA_CROSSOVER` / slow trend following
2. `BOLLINGER_BANDS` mean reversion, but only as a secondary, range-market strategy
3. `BUY_AND_HOLD` as the benchmark
4. `DONCHIAN_BREAKOUT` as the next strategy worth adding
5. small-basket relative-strength rotation as a later addition

## What EUR 150 Means In Practice

Using the repository guardrails:

- Max risk per trade: `2%`
- Cash buffer target: `20%` to `30%`
- No leverage by default

For a EUR 150 account:

- `2%` risk per trade is about `EUR 3`
- a `25%` cash buffer leaves about `EUR 112.50` deployable
- with a `2.5%` stop, max notional is roughly `EUR 120` before fees and slippage

Practical consequence:

- one position at a time is the realistic default
- turnover must stay low because costs will dominate quickly
- liquid large-cap stocks, broad ETFs, BTC, and ETH are much better fits than small caps or illiquid altcoins

## Market-Structure Reality Check

### Stocks

- Small accounts are workable if your broker supports fractional shares. Interactive Brokers explicitly supports fractional trading for eligible U.S., Canadian, and European stocks and some ETFs, which makes stock and ETF research practical on a small account.
- Direct stock short selling is not "free" shorting. Investor.gov states that short sales involve borrowed stock and are subject to margin rules and stock-loan costs.
- Frequent intraday stock trading is a poor fit for a small account. Investor.gov's pattern day trader guidance says margin accounts used for pattern day trading require at least `$25,000`.

### Crypto

- Small spot orders are workable, but only on liquid pairs that satisfy each symbol's `LOT_SIZE` and `MIN_NOTIONAL` filters. The bot should always read those filters from exchange metadata instead of hard-coding assumptions.
- Spot crypto is naturally long-only. On Binance, bearish exposure goes through the margin workflow: transfer funds, borrow, place the margin order, then repay. That is not the same as "short without leverage" in a simple spot account.

### What "Short Without Leverage" Really Means

For your current setup, this should be interpreted conservatively:

- `best default`: go to cash or stablecoin when the signal turns bearish
- `stock account proxy`: use a `-1x` inverse ETF for tactical bearish exposure
- `not recommended now`: direct stock shorting or crypto margin/futures shorts on a EUR 150 account

Examples of stock-account short proxies:

- [SH](https://www.proshares.com/our-etfs/leveraged-and-inverse/sh) for `-1x` daily S&P 500 exposure
- [PSQ](https://www.proshares.com/our-etfs/leveraged-and-inverse/psq) for `-1x` daily Nasdaq-100 exposure
- [BITI](https://www.proshares.com/our-etfs/leveraged-and-inverse/biti) and [SETH](https://www.proshares.com/our-etfs/leveraged-and-inverse/seth) for tactical inverse bitcoin and ether ETF exposure through a brokerage account

Those products can express a bearish view without borrowing stock yourself, but they are still daily-reset products with path dependence. They are tactical tools, not "hold forever" shorts.

## Recommended Strategy Shortlist

### 1. Slow Trend Following / Time-Series Momentum

Status for this repo: `best primary candidate`

Implementation fit:

- already close to the current `SMA_CROSSOVER` backtest path
- fits hourly, 4-hour, and daily bars
- works for both stocks and crypto
- works with small capital because it can be run as `long/cash`

Why it fits:

- Trend following has one of the strongest research bases across markets. AQR's "A Century of Evidence on Trend-Following Investing" argues that trend following remained robust across long historical windows. The original Moskowitz, Ooi, Pedersen time-series momentum paper also documented the effect across liquid futures markets, and later work found time-series momentum effects in long stock histories as well.
- It does not require many simultaneous positions if you keep the universe small.
- It naturally avoids constant trading in choppy noise if you keep the timeframe slow.
- It is realistic on a local setup because it does not depend on low-latency execution.

Best use here:

- crypto: `BTC/USDT`, `ETH/USDT` on `4h` or `1d`
- stocks: broad ETFs or a few very liquid names on `1d`
- regime action: `long` when trend is up, `cash` when trend is down

Recommended first research variant:

- keep the current `SMA_CROSSOVER`
- test `10/30`, `20/50`, and `50/200` style variants
- compare `long/cash` against `long/inverse-ETF` only after the long/cash baseline is stable

Main risks:

- whipsaws in sideways markets
- underperformance during violent reversals
- false confidence if you optimize windows too aggressively

### 2. Bollinger Mean Reversion

Status for this repo: `good secondary candidate`

Implementation fit:

- already present as `BOLLINGER_BANDS`
- especially suited to the current local backtest workflow
- better for single-asset research than broad portfolio trading

Why it fits:

- It can be researched with simple OHLCV data and realistic fees/slippage.
- It can work on one liquid instrument at a time, which matches the reality of a EUR 150 account.
- It is useful for crypto and liquid ETFs when markets are oscillating instead of trending.

Why it is not the primary candidate:

- It is much more regime-sensitive than slow trend following.
- It tends to suffer badly when price keeps trending after looking "overextended".
- On a small account, repeated mean-reversion losses can chew through the account faster than a slow trend system.

Best use here:

- crypto: BTC and ETH only, at first
- stocks: very liquid ETFs, not single-name small caps
- entry: lower-band touch or breach plus bounce confirmation
- exit: middle-band reversion or hard stop

Recommended upgrade before trusting it more:

- add a trend filter so the strategy does not keep buying a strong downtrend
- add cooldown rules after a stop-out
- cap holding time
- compare results to `SMA_CROSSOVER` and `BUY_AND_HOLD`, not just to itself

### 3. Buy And Hold Benchmark

Status for this repo: `mandatory benchmark`

Implementation fit:

- already present as `BUY_AND_HOLD`

Why it matters:

- It is the simplest answer to the question "did the strategy add value at all?"
- On a small account, many active systems fail to beat a passive baseline after fees and slippage.
- It gives you a realistic floor for whether the added complexity is worth it.

Best use here:

- always run it beside every active strategy
- use it for BTC, ETH, and the stock ETFs you care about

### 4. Donchian Breakout / Price Breakout Trend Following

Status for this repo: `best next strategy to add`

Implementation fit:

- not built in yet, but simpler than many alternatives
- compatible with the same local OHLCV pipeline and guardrails
- naturally supports `long/cash`

Why it fits:

- It is a cleaner trend-following expression than many multi-indicator systems.
- It is usually less parameter-heavy than Bollinger-style mean reversion.
- It works with a tiny, liquid market universe.
- It is easier to explain and audit than more complex models.

Best use here:

- crypto: daily or 4-hour breakouts on BTC and ETH
- stocks: daily breakouts on liquid ETFs
- risk model: one position max, hard stop, no averaging down

Main risks:

- frequent small losses in choppy ranges
- breakout failure after news spikes

### 5. Small-Basket Relative-Strength Rotation

Status for this repo: `later, but relevant`

Implementation fit:

- requires ranking a basket and rotating into the strongest asset or into cash
- needs more data and reporting support than the current single-instrument strategies

Why it fits:

- Small capital is enough because you only need one active allocation at a time.
- Fractional shares make ETF rotation practical on the stock side.
- It avoids direct shorting by rotating to cash or a defensive proxy when leadership weakens.

Reason to delay it:

- It needs a cleaner market-universe definition and experiment tracking.
- It is less immediately aligned with the current repo's built-in algorithms.

Good initial baskets:

- crypto: `BTC`, `ETH`, maybe one additional large, liquid asset only if exchange filters allow it comfortably
- stocks: `SPY`, `QQQ`, `VTI`, `VT`, or a similarly tight ETF set

## Strategies That Are Not A Good Fit Right Now

These are the wrong priority for a local-first, EUR 150 account:

- HFT or sub-minute scalping
- latency arbitrage
- options selling or multi-leg options structures
- grid bots
- martingale or "double down until it comes back" systems
- pairs trading and statistical arbitrage that need two legs, tighter borrow assumptions, and more capital
- high-turnover cross-sectional stock momentum over dozens of names
- direct short stock or crypto margin/futures trading as your first operating mode

Why they do not fit:

- costs matter too much at this account size
- many need better execution quality than a local laptop can provide
- some depend on borrow, margin interest, derivatives, or exchange-specific liquidation behavior
- many are harder to simulate honestly than they look

## Recommended Order Of Work In This Repo

1. Keep `BUY_AND_HOLD` as the benchmark on every dataset.
2. Treat `SMA_CROSSOVER` as the first serious research strategy for both stocks and crypto.
3. Keep `BOLLINGER_BANDS` as a conditional range-market strategy, not the main engine.
4. Add `DONCHIAN_BREAKOUT` next.
5. Add small-basket rotation after the market-data workflow is more mature.
6. Defer true short-selling support until the platform can model borrow, margin interest, liquidations, audit trails, and clearer environment separation.

## Practical Starting Universe

Use a very small and liquid universe first:

- crypto: `BTC/USDT`, `ETH/USDT`
- stocks/ETFs: `SPY`, `QQQ`, `VTI`, `VT`, or your broker's equivalent liquid broad-market ETFs

Avoid at this stage:

- penny stocks
- microcaps
- illiquid altcoins
- meme names with poor spreads
- any instrument where minimum order rules force oversized positions

## Final Recommendation

If the goal is to start with EUR 150 and grow only if the evidence supports it, the most realistic stack is:

1. `BUY_AND_HOLD` benchmark
2. `SMA_CROSSOVER` or similar slow trend-following system as the primary live research candidate
3. `BOLLINGER_BANDS` only as a secondary regime-specific strategy
4. `DONCHIAN_BREAKOUT` as the next strategy to implement

For bearish exposure, the conservative answer today is:

- stocks: `cash` first, `-1x` inverse ETF only if you explicitly want tactical short exposure
- crypto: `stablecoin/cash` first; do not treat margin or futures shorts as equivalent to "no leverage"

## Source Notes

Primary and official references used:

- [Investor.gov: Stock Purchases and Sales, Long and Short](https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/stock-purchases-and-sales-long-and)
- [Investor.gov: Investor Bulletin, An Introduction to Short Sales](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-51)
- [Investor.gov: Pattern Day Trader](https://www.investor.gov/introduction-investing/investing-basics/glossary/pattern-day-trader)
- [Interactive Brokers: Fractional Trading](https://www.interactivebrokers.com/fractions)
- [Interactive Brokers Campus: Fractional Shares](https://www.interactivebrokers.com/campus/trading-lessons/fractional-shares/)
- [Binance Spot API Docs: Filters](https://developers.binance.com/docs/binance-spot-api-docs/filters)
- [Binance Margin Trading Docs: Best Practice](https://developers.binance.com/docs/margin_trading/best-practice)
- [AQR: A Century of Evidence on Trend-Following Investing](https://www.aqr.com/insights/research/journal-article/a-century-of-evidence-on-trend-following-investing)
- [Moskowitz, Ooi, Pedersen: Time Series Momentum](https://research.cbs.dk/files/58851003/time_series_momentum_lasse_heje.pdf)
- [Time-Series Momentum in Nearly 100 Years of Stock Returns](https://www.sciencedirect.com/science/article/abs/pii/S0378426618302346)
- [ProShares: SH](https://www.proshares.com/our-etfs/leveraged-and-inverse/sh)
- [ProShares: PSQ](https://www.proshares.com/our-etfs/leveraged-and-inverse/psq)
- [ProShares: BITI](https://www.proshares.com/our-etfs/leveraged-and-inverse/biti)
- [ProShares: SETH](https://www.proshares.com/our-etfs/leveraged-and-inverse/seth)

Where this document makes an inference:

- The research papers support trend and momentum as real market effects, but not a guarantee that your exact implementation will work.
- The recommendation to prefer `long/cash` over direct shorting for this repo is an implementation judgment based on your account size, current architecture, and safety rules.
