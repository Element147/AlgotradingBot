# Small-Account Execution Constraints

Planning reference: `FEATURE_DEVELOPMENT_PLAN.md` task `3B.1`.

This document turns the current small-account research direction into explicit rules for later strategy design, backtesting, and paper-monitoring decisions.

It is not a profitability claim. These constraints exist to keep the later strategy roadmap honest for accounts that start closer to `EUR 150` than to institutional scale.

This document is aligned with:

- `TRADING_GUARDRAILS.md`
- `PRODUCT.md`
- `docs/SMALL_ACCOUNT_STRATEGY_RESEARCH.md`
- `docs/GREENFIELD_SMALL_ACCOUNT_STRATEGY_BLUEPRINT.md`
- `docs/STRATEGY_AUDIT_PROTOCOL.md`

## Why These Constraints Exist

Small accounts fail for predictable reasons:

- minimum order sizes force oversized positions
- fee drag eats too much of the gross edge
- intraday stock rules and borrow requirements block the intended trade
- weak liquidity turns a clean backtest into a bad live fill
- bearish logic quietly assumes a direct short that the product does not support safely

The goal here is to stop those mistakes before code or parameter tuning starts.

## Portfolio-Level Rules

Use these as the default rules for all small-account research unless a later approved experiment says otherwise.

- Default account profile: `EUR 150` to `EUR 1,000`
- Default environment posture: `test` for research and `paper` for any forward follow-up
- Default leverage posture: `none`
- Default action model: `long` or `sell to cash`
- Default position count: `one open position at a time`
- Default max risk per trade: `1%` target, `2%` hard cap
- Default cash buffer: `20%` to `30%`
- Default max deployed capital: `70%` to `80%` of equity
- Default assumption for unsupported bearish states: `stay in cash`

If a signal needs more concentration, more turnover, or more leverage than those defaults allow, it is outside the small-account baseline.

## Asset-Class Constraints

| Asset class | Allowed baseline | Minimum order handling | Liquidity rule | Session rule | Default bearish behavior |
| --- | --- | --- | --- | --- | --- |
| Crypto spot | `BTC/USDT`, `ETH/USDT`, later another major only if filters remain practical | Must read venue `LOT_SIZE`, `MIN_NOTIONAL`, and tick-size metadata from exchange constraints; skip trades that fail them | Use only large, liquid spot pairs; no illiquid altcoins or thin venue-specific pairs | `24/7`, but baseline research still uses slower bars and no latency-sensitive assumptions | `sell to cash` or stablecoin |
| U.S. stocks / ETFs | Broad, liquid ETFs and large-cap names only | Fractional-share support is required when account size would otherwise force oversized lots | Avoid penny stocks, microcaps, and thin names; prefer broad ETFs first | Use regular-session logic first; no premarket or after-hours assumptions in the baseline | `sell to cash`; inverse ETF proxy only when explicitly enabled |
| Inverse ETF proxy | Research-only extension for bearish equity exposure | Must still satisfy the same liquidity and fractionality checks as long-side ETFs | Use only liquid `-1x` products with explicit operator awareness of daily reset behavior | Regular session only | This is the bearish action itself; do not combine with direct shorting |

## Trade Construction Rules

These rules decide whether a trade is valid for the small-account baseline.

- Skip the trade if minimum notional or lot-size rules would force deployment above `80%` of equity.
- Skip the trade if the smallest valid order would risk more than `2%` of equity at the intended stop.
- Skip the trade if the position cannot be expressed without leverage in the approved action model.
- Skip the trade if the symbol needs direct borrow, margin, or futures access to express the baseline signal.
- Skip the trade if price data, venue filters, or session metadata are incomplete.

The backtester and paper workflow should fail closed on those checks instead of silently assuming a smaller tradable slice than the venue actually allows.

## Liquidity And Universe Rules

The candidate universe must stay intentionally narrow.

- Start with `BTC/USDT` and `ETH/USDT` for crypto.
- Start with broad liquid ETFs such as `SPY`, `QQQ`, `VTI`, and `VT` for equities.
- Add a new symbol only if its average traded liquidity and order-size constraints still work for a small account.
- Do not include penny stocks, microcaps, meme names with unstable spreads, or illiquid altcoins in the baseline candidate set.
- Do not include instruments that regularly force the account into one oversized all-in order.

This roadmap prefers fewer clean markets over a broad universe that looks diversified in research but is not realistically tradable.

## Turnover And Latency Rules

High-turnover and low-latency systems are excluded from the small-account roadmap.

- No strategy may require sub-`15m` bars in the baseline roadmap.
- No strategy may depend on level-two data, order-book imbalance, or millisecond execution.
- No scalping, market making, grid trading, or martingale recovery flows.
- Day-trading candidates must flatten by a defined session cutoff and should still aim for low trade counts.
- Intraday swing candidates should favor `15m`, `1h`, and `4h` bars over minute-level churn.
- Research should reject any configuration whose gross edge disappears once realistic fee drag is applied.

The intended fit is low-turnover trend, pullback, rotation, and tightly filtered mean-reversion research, not execution-heavy microstructure trading.

## Risk And Sizing Rules

- Use `BigDecimal`-safe money handling throughout later implementation.
- Size from stop distance and account equity, not from a fixed notional guess.
- Target one simultaneous risk unit by default; additional concurrent positions require an explicit later approval.
- Use hard stops, structural stops, or both; never rely on averaging down.
- Prefer lower turnover and wider but intentional stops over tight churn-heavy stop placement.
- Treat fee and slippage assumptions as first-class inputs, not reporting-only metadata.
- If the stop distance implies a trade smaller than the minimum tradable order, skip it.

These rules are meant to keep the system from inventing precise but impossible sizing.

## Bearish-Behavior Rules

Bearish behavior must match the actual product surface, not the desired one.

### Crypto

- Default bearish action: `sell to cash` or stablecoin
- Margin and futures shorts: excluded from the baseline roadmap
- Direct bearish crypto exposure requires a future explicitly approved environment with separate risk controls

### Stocks And ETFs

- Default bearish action: `sell to cash`
- Optional extension: `SHORT_PROXY` through a liquid `-1x` inverse ETF
- Direct short selling: excluded from the baseline roadmap until borrow, margin rules, financing cost, and operator controls are modeled explicitly

If a later strategy spec says "bearish," it must name one of those approved behaviors instead of implying an unsupported direct short.

## What The Roadmap Explicitly Excludes

- high-frequency or sub-minute strategies
- unrestricted same-day stock day trading
- strategies that rely on direct shorting as the default bearish path
- leverage-first crypto margin or futures systems
- broad multi-dozen-name rotation for a `EUR 150` account
- anything that requires multiple simultaneous legs or borrow assumptions to look viable

## Implications For The Phase 3 Strategy Set

These constraints narrow the approved design space for the remaining strategy work.

- Day-trading strategies must be session-bounded and low-frequency enough to survive fee drag.
- Intraday strategies should prefer `15m`, `1h`, and `4h` logic over minute-level churn.
- Rotation strategies must support `cash` fallback instead of assuming a direct short.
- Bearish equity variants may use a `SHORT_PROXY` only if the strategy spec says so explicitly.
- Strategy evaluations should reject parameter sets that look attractive only because they overtrade.

## Adoption Rule

Every later small-account strategy spec should answer these questions before implementation starts:

1. Can the trade be expressed without leverage?
2. Can the minimum tradable order fit inside the account and stop-based risk cap?
3. Does the candidate market clear the liquidity and session rules?
4. Does the bearish path resolve to `cash` or an approved proxy?
5. Does the expected turnover stay compatible with small-account fee drag?

If the answer to any question is no, the strategy is outside the small-account baseline and should be treated as a separate higher-risk research stream.
