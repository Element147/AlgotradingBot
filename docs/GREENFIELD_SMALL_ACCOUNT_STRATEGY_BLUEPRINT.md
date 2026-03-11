# Greenfield Small-Account Strategy Blueprint

Updated: March 11, 2026

## Purpose

This document assumes a greenfield starting point:

- no strategy code exists yet
- the goal is a local-first research and paper-trading platform
- starting capital is small, for example `EUR 150`
- the system should support conservative `long`, `sell-to-cash`, and limited `short-proxy` actions without assuming leverage by default

This is not a profitability claim. Every strategy below is a research hypothesis. The question answered here is narrower:

- which strategies have the best chance of producing positive expectancy after costs for a small account
- which ones fit a local environment better than latency-sensitive or capital-heavy approaches
- how we should combine them into a realistic research roadmap

## Bottom Line

If we were starting from zero, my ranking would be:

1. `Dual Momentum Rotation` with absolute momentum cash filter and volatility targeting
2. `Volatility-Managed Donchian Breakout Trend Following`
3. `Trend Pullback Continuation` with higher-timeframe trend filter
4. `Regime-Filtered Mean Reversion / Liquidity Provision`
5. `Trend-First Adaptive Ensemble` that switches or weights the above based on regime

### Best Standalone Strategy

`Dual Momentum Rotation` has the best fit for your constraints.

Why:

- very small capital works because one position at a time is enough
- low turnover reduces fee drag
- it works with stocks and crypto
- it can be run as `long/cash`
- it does not need high-frequency execution or complex market microstructure modeling

### Best Overall Architecture

`Trend-First Adaptive Ensemble` has the most long-term potential.

Why:

- it lets us use trend strategies in trending markets
- it lets us reduce or disable mean reversion when the market is one-directional
- it gives us a clean place to map `long`, `flat`, and `short-proxy` actions by asset class

The tradeoff is complexity. I would not build the ensemble first. I would build the standalone strategies first, then combine them.

## Greenfield Assumptions

These assumptions drive the recommendations:

- Small account means costs matter a lot.
- Frequent stock day trading is a bad fit. Investor.gov states that pattern day traders in margin accounts need at least `$25,000`.
- Fractional shares make stock and ETF strategies practical on small accounts. Interactive Brokers explicitly supports fractional trading on many eligible U.S., Canadian, and European stocks and some ETFs.
- Crypto spot is naturally `long/flat`; direct shorting involves margin workflows, borrowing, and more operational risk.
- Binance-style exchange filters such as `LOT_SIZE` and `MIN_NOTIONAL` must be modeled so the backtester does not invent trades that cannot exist.
- Low-turnover systems on `4h`, `1d`, and slower bars are a much better match for a local environment than scalping or HFT.

## Evaluation Criteria

A greenfield strategy should score well on these dimensions:

1. Positive expectancy mechanism that is economically plausible
2. Works on liquid instruments with small capital
3. Survives realistic fees, slippage, and minimum-order rules
4. Can be implemented honestly with local OHLCV data plus a few derived features
5. Has a clean `long`, `flat`, and optional `short-proxy` interpretation
6. Can be validated with out-of-sample and walk-forward testing

## Action Model For A Small Account

Before discussing signals, the action model should be explicit.

For stocks and ETFs:

- `LONG`: buy the target instrument
- `SELL`: exit to cash
- `SHORT_PROXY`: buy a `-1x` inverse ETF only if explicitly enabled

For crypto:

- `LONG`: buy spot
- `SELL`: exit to cash or stablecoin
- `SHORT_PROXY`: disabled by default

This matters because the strategy logic should not assume that a bearish signal automatically means "open a true short."

## Strategy 1: Dual Momentum Rotation

Status: `best standalone candidate`

Core idea:

- choose the strongest asset among a small universe using relative momentum
- require that the chosen asset also has positive absolute momentum
- if absolute momentum is negative, go to cash or stablecoin instead of forcing exposure

Research basis:

- NBER documents persistent stock momentum effects.
- Gary Antonacci's dual momentum framework combines relative and absolute momentum.
- AQR's trend-following research and the time-series momentum literature support the broader idea of staying aligned with persistent trends.

How positive expectancy could arise:

- markets often underreact and then continue trending as information is incorporated gradually
- relative strength helps keep capital in the assets already attracting flows
- the absolute momentum filter reduces exposure during the worst broad downtrends
- low turnover preserves more of gross edge after fees

Why it fits a small account:

- only one active position is required
- fractional shares make ETF rotation practical
- crypto majors like `BTC` and `ETH` are accessible with small spot positions
- rebalancing can be weekly or monthly, which reduces cost drag

Suggested universes:

- stocks/ETFs: `SPY`, `QQQ`, `VTI`, `VT`, `IEF`, `SHY`, optionally one inverse ETF for research only
- crypto: `BTC/USDT`, `ETH/USDT`, optionally one more liquid large-cap coin if exchange minimums remain practical

Suggested timeframes:

- signal formation on `1d`
- rebalance weekly or monthly

Example greenfield rules:

1. Calculate `63-day` and `126-day` total return for each asset.
2. Build a weighted relative-strength score:
   - `0.6 * 63-day return + 0.4 * 126-day return`
3. Rank assets by score.
4. Check absolute momentum of the top asset:
   - `close > 200-day SMA`
   - or `126-day return > 0`
5. If absolute momentum is positive:
   - hold the top-ranked asset
6. If absolute momentum is negative:
   - go to cash, a short-duration ETF, or stablecoin
7. Optionally volatility-target the position so notional size shrinks when realized volatility rises.

Long/short behavior:

- base mode: `long strongest` or `flat`
- stock short-proxy mode: if broad equity regime is negative and short-proxy is enabled, switch to a `-1x` inverse ETF instead of cash
- crypto: stay `flat/stablecoin` when absolute momentum is negative

Setup requirements:

- daily OHLCV data with adjusted closes for stocks and ETFs
- exchange and broker symbol metadata
- calendar alignment between equities and crypto
- weekly or monthly scheduler
- low-frequency order simulator

Most important risk controls:

- maximum one active position per universe
- volatility cap
- `2%` risk per trade or per rebalance decision
- stop or exit if data quality is missing

Failure modes:

- momentum crashes during fast bear-to-bull reversals
- repeated whipsaws in range-bound markets
- over-concentration if the universe is too small

How to make it more robust:

- add a volatility-management overlay
- add a panic-state reduction rule when realized volatility spikes
- add a minimum liquidity rule

My judgment:

- If you forced me to pick one strategy to start from zero for a `EUR 150` account, this would be it.

## Strategy 2: Volatility-Managed Donchian Breakout Trend Following

Status: `best pure trend strategy`

Core idea:

- buy strength when price breaks above a lookback high
- exit when the breakout fails or a trailing stop is hit
- scale position size down when volatility is high

Research basis:

- AQR shows long-run evidence for trend-following across asset classes.
- Time-series momentum literature supports the idea of riding persistent directional moves.
- Moreira and Muir show that volatility-managed portfolios can improve Sharpe ratios by reducing risk when volatility is high.

How positive expectancy could arise:

- a small number of large winners can dominate many small losses
- breakouts capture regime shifts, continuation, and flow persistence
- volatility scaling helps avoid the worst periods of oversized risk

Why it fits a small account:

- it can trade one instrument at a time
- it can work with `4h` or `1d` bars
- it does not need precise intrabar microstructure modeling to be useful

Suggested universes:

- crypto: `BTC/USDT`, `ETH/USDT`
- stocks/ETFs: `SPY`, `QQQ`, `GLD`, `TLT`, `VTI`

Suggested timeframes:

- crypto: `4h` and `1d`
- stocks: `1d`

Example greenfield rules:

1. Define trend filter:
   - `close > 200-day EMA` for long bias
2. Define entry breakout:
   - buy when `close > highest high of last 55 bars`
3. Define initial stop:
   - `entry - 2 * ATR(20)`
4. Define trailing exit:
   - sell when `close < lowest low of last 20 bars`
   - or when trailing stop is hit
5. Apply volatility target:
   - reduce notional size as `realized volatility` rises

Long/short behavior:

- base mode: `long/flat`
- stock short-proxy mode:
   - if `close < 200-day EMA` and `close < lowest low of last 55 bars`, allow inverse ETF exposure
- crypto:
   - bearish state maps to `flat/stablecoin` unless a future margin-enabled environment is explicitly approved

Setup requirements:

- OHLCV data
- ATR calculation
- rolling highest-high and lowest-low windows
- volatility estimator
- position sizing engine that respects minimum orders

Most important risk controls:

- hard cap on portfolio volatility
- one breakout position per universe at first
- no averaging down
- strict kill-switch after repeated stop-outs or drawdown threshold breach

Failure modes:

- many small losses in sideways markets
- delayed entries after sharp gap moves
- false breakouts in news-driven environments

How to make it more robust:

- require breakout plus volume confirmation
- require breakout plus positive higher-timeframe regime filter
- reduce exposure when realized volatility spikes abnormally

My judgment:

- This is the best strategy if the goal is to maximize alignment with the strongest long-run evidence base.

## Strategy 3: Trend Pullback Continuation

Status: `best discretionary-style systematic strategy`

Core idea:

- only trade in an established higher-timeframe uptrend
- wait for a pullback to a moving average or volatility band
- enter when price resumes the trend

Why it exists:

- pure breakouts can miss favorable entries after the trend is already underway
- pullback entries can improve reward-to-risk compared with late breakout entries
- this style is easy to understand and often easier to paper trade than a pure rotation model

Why positive expectancy could arise:

- persistent trends often retrace before continuing
- buying controlled weakness in a strong trend can improve entry price and stop placement
- using a higher-timeframe filter avoids countertrend dip-buying in structural downtrends

Why it fits a small account:

- one position at a time is enough
- it works on the same liquid instruments as trend following
- `4h` and `1d` bars reduce noise and transaction costs

Suggested universes:

- crypto: `BTC/USDT`, `ETH/USDT`
- stocks/ETFs: `SPY`, `QQQ`, `VTI`, `GLD`

Suggested timeframes:

- trend filter on `1d`
- entries on `4h` for crypto, `1d` for stocks

Example greenfield rules:

1. Higher-timeframe regime must be bullish:
   - `close > 200-day EMA`
   - `50-day EMA > 200-day EMA`
2. Wait for pullback:
   - `RSI(3)` or `RSI(5)` drops below threshold
   - or price touches `20 EMA` or lower Keltner/Bollinger band
3. Entry confirmation:
   - close back above `5 EMA`
   - or bullish reversal bar with volume above recent average
4. Initial stop:
   - below recent swing low
   - or `1.5 to 2 ATR`
5. Exit:
   - partial exit at `2R`
   - remainder trails behind `20 EMA` or `ATR` stop

Long/short behavior:

- base mode: `long/flat`
- stock short-proxy mode:
   - mirror logic in downtrends with inverse ETF only after proving long-side robustness first
- crypto:
   - bearish regime means no long entries and usually `flat/stablecoin`

Setup requirements:

- OHLCV data
- EMA, RSI, ATR, and optional volume features
- swing-high and swing-low detection
- ability to test multi-timeframe logic

Most important risk controls:

- only allow entries in approved trend regime
- cap number of pullback attempts per trend leg
- require minimum reward-to-risk ratio before entry

Failure modes:

- repeated failed pullbacks near trend exhaustion
- overfitting entry filters
- too many parameters if not kept disciplined

How to make it more robust:

- keep the first version simple
- test only a few pullback definitions
- compare directly against the pure breakout baseline

My judgment:

- This is a very good second or third strategy, but I would not start here before building a cleaner trend baseline.

## Strategy 4: Regime-Filtered Mean Reversion / Liquidity Provision

Status: `useful, but conditional`

Core idea:

- buy short-term oversold moves only when the market is not in a strong downtrend
- take fast profits on the snapback
- use time stops because mean reversion edges decay quickly

Research basis:

- NBER shows short-run reversals are linked to liquidity provision and microstructure effects.
- For crypto, the evidence is more nuanced: broad crypto cross-sections show daily reversals driven by illiquidity, while the largest and most tradeable coins show daily momentum instead.

How positive expectancy could arise:

- temporary order-flow imbalances and forced selling can overshoot fair short-term value
- the strategy earns by providing liquidity where others must exit quickly
- fast profit-taking reduces exposure to trend continuation against the position

Why it fits less well than trend strategies:

- turnover is higher
- fees and slippage matter more
- the wrong regime can turn a reversion setup into a trend-trap

Why it can still help:

- it can monetize sideways and choppy periods when trend systems whipsaw
- it can diversify a trend-first stack if used selectively

Suggested universes:

- stocks/ETFs: highly liquid ETFs or large-cap stocks only
- crypto: `BTC/USDT`, `ETH/USDT` only, and only after explicit validation

Suggested timeframes:

- stocks: `1d`
- crypto: `4h` or `1d`, not very short intraday at first

Example greenfield rules:

1. Regime filter must allow mean reversion:
   - `ADX(14) < 20`
   - or price inside a medium-term range
   - and no major breakdown below `200-day EMA`
2. Entry trigger:
   - price closes below lower Bollinger band
   - `RSI(2)` or `RSI(3)` is oversold
3. Entry confirmation:
   - next bar closes above prior close
4. Exit:
   - mean or middle-band target
   - or fixed `1R to 1.5R`
   - or time stop after `N` bars
5. Stop:
   - below recent swing low
   - or fixed `ATR` stop

Long/short behavior:

- long-only mean reversion is the safer first version
- short-side mean reversion should be considered later and only for stocks with short-proxy instruments

Setup requirements:

- OHLCV data
- Bollinger, RSI, ADX, ATR
- time-stop support in backtests
- strict fee and slippage modeling

Most important risk controls:

- disable strategy in strong-trend regimes
- limit holding time
- limit repeated entries after consecutive losses

Failure modes:

- averaging into a true downtrend
- profit wiped out by transaction costs
- indicator crowding and parameter overfitting

My judgment:

- This should be built only after trend strategies exist.
- It is valuable as a regime-specific complement, not as the foundation of a small-account system.

## Strategy Combination Framework

The best greenfield combination is not "run everything all the time."

The right approach is a `regime-aware stack`.

### Recommended Combination

1. `Regime Layer`
   - classify market as `trend up`, `trend down`, or `range`
2. `Primary Allocator`
   - use `Dual Momentum Rotation` to choose whether capital should be deployed at all and where
3. `Execution Layer`
   - in `trend up`, use `Donchian Breakout` and optionally `Trend Pullback Continuation`
   - in `range`, allow `Mean Reversion` with reduced size
4. `Risk Overlay`
   - volatility scaling
   - drawdown-based de-risking
   - kill-switch and cooldown

Important warning:

- Combining more signals does not automatically make a strategy better.
- NBER specifically warns that multi-signal backtests are highly vulnerable to overfitting bias.
- The combination layer should therefore be built only after each component strategy proves it can stand on its own.

### How Long / Sell / Short / Flat Should Work

For stocks:

- `trend up`: `LONG`
- `trend weak`: `SELL` to cash
- `trend down`:
   - default `FLAT`
   - optional `SHORT_PROXY` through inverse ETF if enabled

For crypto:

- `trend up`: `LONG`
- `trend weak`: `SELL` to stablecoin/cash
- `trend down`: `FLAT`

### Most Promising Combination

If we want the highest long-term potential, I would target this stack:

1. `Dual Momentum Rotation` to choose the best asset or cash
2. `Volatility-Managed Donchian Breakout` to capture strong directional moves
3. `Trend Pullback Continuation` to improve entries within existing trends
4. `Mean Reversion` only when the regime filter says the market is sideways

Why this combination has the most potential:

- it is trend-first, which aligns with the strongest evidence base
- it reduces the chance of trading mean reversion in a strong trend
- it respects small-account cost constraints
- it naturally maps to `long`, `flat`, and limited `short-proxy` behavior

## Infrastructure Requirements

Regardless of strategy, the system needs the same core setup.

### Data

- OHLCV candles
- adjusted prices for stocks and ETFs
- symbol metadata:
  - lot size
  - minimum notional
  - tick size
- calendar handling:
  - equities trading days
  - crypto 24/7 trading

### Execution Model

- market order simulator with fee and slippage model
- stop and trailing-stop simulation
- no impossible fills on missing candles
- explicit support for `flat` transitions

### Risk Layer

- max `2%` risk per trade
- max aggregate open risk cap
- volatility targeting
- drawdown stop
- cooldown after repeated losses

### Research Validation

- in-sample vs out-of-sample split
- walk-forward validation
- sensitivity testing
- Monte Carlo or trade-sequence reshuffling
- benchmark comparison vs `BUY_AND_HOLD`

## What Could Actually Produce Positive Returns After Costs

This is the honest version of the "profitability" question.

Positive results are most plausible when all of the following are true:

1. We trade only liquid instruments.
2. We use low or moderate turnover.
3. We stay aligned with the dominant regime.
4. We size positions conservatively.
5. We allow long winners to run and cut losers early.
6. We avoid forcing trades in bad regimes.

What usually destroys the edge:

1. high turnover on a tiny account
2. too many instruments with poor liquidity
3. over-optimization on one market window
4. using true shorts or leverage too early
5. ignoring minimum order sizes and real fee drag

## Step-By-Step Implementation Plan

This is the build order I would follow when you ask me to implement everything.

### Phase 1: Research Foundation

1. Define the instrument model:
   - asset class
   - symbol
   - trading calendar
   - min notional
   - lot size
   - quote currency
2. Define the action model:
   - `LONG`
   - `SELL_TO_CASH`
   - `SHORT_PROXY`
   - `HOLD`
3. Define a common strategy interface:
   - input candles and context
   - output signal, confidence, stop, target, and regime
4. Define a common backtest result model:
   - total return
   - max drawdown
   - Sharpe
   - profit factor
   - turnover
   - fee drag
   - exposure time

### Phase 2: Data And Market Constraints

1. Build stock and crypto candle ingestion.
2. Add adjusted-price handling for equities and ETFs.
3. Add exchange and broker constraint loading.
4. Add validation that blocks impossible orders.
5. Add realistic fee and slippage assumptions per venue.

### Phase 3: Core Indicators And Risk Engine

1. Implement rolling-return and ranking features.
2. Implement EMA, SMA, ATR, RSI, Bollinger, ADX.
3. Implement realized-volatility estimator.
4. Implement position sizing with `2%` max risk.
5. Implement drawdown monitor, cooldown rules, and kill-switch.

### Phase 4: Strategy 1 - Dual Momentum Rotation

1. Build ranking engine for small universes.
2. Implement absolute momentum filter.
3. Implement rebalance scheduler.
4. Implement cash and stablecoin fallback.
5. Add stock `SHORT_PROXY` mode behind a feature flag.
6. Add tests:
   - ranking correctness
   - rebalance correctness
   - no-trade/cash behavior
   - turnover and fee accounting

### Phase 5: Strategy 2 - Donchian Breakout Trend

1. Implement breakout windows and ATR stops.
2. Implement trailing exits.
3. Implement volatility-targeted sizing.
4. Add optional volume confirmation.
5. Add tests:
   - breakout entry correctness
   - stop and trailing behavior
   - volatility scaling correctness

### Phase 6: Strategy 3 - Trend Pullback Continuation

1. Implement higher-timeframe trend regime filter.
2. Implement pullback detector:
   - RSI pullback
   - EMA touch
   - optional band touch
3. Implement continuation confirmation.
4. Add reward-to-risk filter.
5. Add tests:
   - no entry outside trend regime
   - entry after valid pullback only
   - stop placement correctness

### Phase 7: Strategy 4 - Regime-Filtered Mean Reversion

1. Implement range-regime filter.
2. Implement oversold and snapback logic.
3. Implement time-based exits.
4. Add repeated-loss cooldown.
5. Add tests:
   - no trades in strong-trend regime
   - correct time-stop behavior
   - realistic fee sensitivity

### Phase 8: Benchmarks And Validation

1. Add `BUY_AND_HOLD` baseline.
2. Add benchmark comparison reports per instrument.
3. Add walk-forward testing.
4. Add parameter-sensitivity sweeps.
5. Add Monte Carlo or shuffled-trade robustness checks.
6. Add "reject strategy" rules if:
   - too few trades
   - weak out-of-sample persistence
   - fee drag destroys the edge

### Phase 9: Ensemble Layer

1. Implement regime classifier:
   - trend up
   - trend down
   - range
2. Implement strategy router:
   - trend strategies in trend regimes
   - mean reversion only in range regimes
3. Implement capital allocator:
   - one strategy active per instrument at first
4. Add tests:
   - correct regime-to-strategy routing
   - no conflicting simultaneous positions

### Phase 10: Reporting And UI

1. Add strategy definitions and parameter versions.
2. Add per-strategy analytics:
   - turnover
   - fee drag
   - exposure
   - drawdown
3. Add comparison view across strategies.
4. Add explanation fields so every trade has a reason.

### Phase 11: Paper Trading Readiness

1. Connect signals to paper order simulation.
2. Add audit logs for entries, exits, and overrides.
3. Add environment separation:
   - `test`
   - `paper`
   - future `live-readiness` only if approved
4. Run soak tests before any real-money discussion.

## Recommended Build Order

If we want the highest chance of ending up with something robust, I would implement in this order:

1. `BUY_AND_HOLD`
2. `Dual Momentum Rotation`
3. `Volatility-Managed Donchian Breakout`
4. `Trend Pullback Continuation`
5. `Regime-Filtered Mean Reversion`
6. `Trend-First Adaptive Ensemble`

## Source Notes

Primary and official references used:

- [A Century of Evidence on Trend-Following Investing](https://www.aqr.com/insights/research/journal-article/a-century-of-evidence-on-trend-following-investing)
- [Momentum Strategies, NBER](https://www.nber.org/papers/w5375)
- [Risk Premia Harvesting Through Dual Momentum, SSRN](https://ssrn.com/abstract=2042750)
- [Volatility Managed Portfolios, NBER](https://www.nber.org/papers/w22208)
- [Momentum Crashes, NBER](https://www.nber.org/papers/w20439)
- [Backtesting Strategies Based on Multiple Signals, NBER](https://www.nber.org/papers/w21329)
- [A Decade of Evidence of Trend Following Investing in Cryptocurrencies, SSRN](https://ssrn.com/abstract=3697981)
- [Reversals and the Returns to Liquidity Provision, NBER](https://www.nber.org/papers/w30917)
- [Up or down? Short-term reversal, momentum, and liquidity effects in cryptocurrency markets](https://www.sciencedirect.com/science/article/pii/S1057521921002349)
- [Fractional Trading, Interactive Brokers](https://www.interactivebrokers.com/fractions)
- [Pattern Day Trader, Investor.gov](https://www.investor.gov/index.php/introduction-investing/investing-basics/glossary/pattern-day-trader)
- [Margin Rules for Day Trading, Investor.gov](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/margin)
- [Leveraged and Inverse ETF Risks, Investor.gov](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/sec)
- [Binance Spot API Filters](https://developers.binance.com/docs/binance-spot-api-docs/filters)
- [Binance Margin Best Practice](https://developers.binance.com/docs/margin_trading/best-practice)

Important inferences in this document:

- Ranking `Dual Momentum Rotation` first is an implementation judgment based on small-account practicality, not a guarantee that it will outperform the other candidates.
- `Trend Pullback Continuation` is more implementation-driven than directly literature-driven here; I include it because it is a practical trend expression that often improves entry quality, but it still needs stronger empirical validation in your own tests.
- The ensemble is presented as the highest-potential framework, but only after the component strategies prove themselves independently.
- Combining several signals or strategies can easily create false confidence through overfitting, so the ensemble must be validated more harshly than any single strategy.
