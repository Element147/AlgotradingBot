# Phase 3 Strategy Audit Report

Generated from the repo-native `phaseThreeStrategyAudit` runner against dataset `#12` (`Binance BTC/USDT +2 15m 2024-03-12 to 2026-03-12`) on March 27, 2026.

Frozen audit inputs:

- Dataset checksum: `b93c95da97c05f4edf4d706b80d33fcfab752f4f4d6f11f003fa3aca2fe2d326`
- Fees: `10` bps
- Slippage: `3` bps
- Fill model: next-bar-open
- Holdout split: `2024-03-12` to `2025-07-01` in-sample, `2025-07-01` to `2026-03-12` out-of-sample
- Frozen pack limitation: the checked-in ETF audit pack remains daily-only, so it cannot honestly clear `15m` or `1h` Phase 3 hypotheses. This round therefore records BTC-anchor evidence plus the explicit intraday-ETF coverage gap instead of overstating promotion readiness.

## Comparator Snapshot

| Strategy | Timeframe | Scope | Full-Sample Return % | OOS Return % | OOS Trades |
| --- | --- | --- | ---: | ---: | ---: |
| BUY_AND_HOLD | 1d | BTC/USDT | 1.02 | -40.06 | 1 |
| SMA_CROSSOVER | 4h | BTC/USDT | 1.85 | 7.08 | 32 |
| VOLATILITY_MANAGED_DONCHIAN_BREAKOUT | 1d | BTC/USDT | 28.56 | 0.00 | 0 |
| DUAL_MOMENTUM_ROTATION | 1d | DATASET_UNIVERSE | 28.30 | 0.00 | 0 |

## Phase 3 Full-Sample Scorecards

| Strategy | Timeframe | Scope | Return % | Max DD % | Trades | Avg Hold Hrs | Fee Drag |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| OPENING_RANGE_VWAP_BREAKOUT | 15m | BTC/USDT | -40.30 | 40.41 | 302 | 1.90 | 365.71 |
| VWAP_PULLBACK_CONTINUATION | 15m | BTC/USDT | -86.18 | 86.25 | 1393 | 1.16 | 861.34 |
| EXHAUSTION_REVERSAL_FADE | 15m | BTC/USDT | -32.70 | 32.70 | 423 | 0.73 | 316.38 |
| MULTI_TIMEFRAME_EMA_ADX_PULLBACK | 1h | BTC/USDT | -5.46 | 12.44 | 83 | 14.54 | 106.98 |
| SQUEEZE_BREAKOUT_REGIME_CONFIRMATION | 1h | BTC/USDT | -15.80 | 18.74 | 156 | 1.37 | 169.54 |
| RELATIVE_STRENGTH_ROTATION_INTRADAY_ENTRY_FILTER | 1h | DATASET_UNIVERSE | -69.08 | 71.63 | 506 | 10.34 | 800.38 |

## Holdout And Benchmark Comparison

| Strategy | Comparator | OOS Return % | OOS Trades | Vs Buy/Hold OOS % | Vs Comparator OOS % | Disposition |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| OPENING_RANGE_VWAP_BREAKOUT | SMA_CROSSOVER | -16.65 | 106 | 23.41 | -23.73 | research-only |
| VWAP_PULLBACK_CONTINUATION | SMA_CROSSOVER | -50.45 | 496 | -10.39 | -57.53 | reject |
| EXHAUSTION_REVERSAL_FADE | SMA_CROSSOVER | -12.37 | 132 | 27.69 | -19.45 | research-only |
| MULTI_TIMEFRAME_EMA_ADX_PULLBACK | SMA_CROSSOVER | -1.38 | 22 | 38.68 | -8.46 | research-only |
| SQUEEZE_BREAKOUT_REGIME_CONFIRMATION | VOLATILITY_MANAGED_DONCHIAN_BREAKOUT | -4.92 | 47 | 35.14 | -4.92 | research-only |
| RELATIVE_STRENGTH_ROTATION_INTRADAY_ENTRY_FILTER | DUAL_MOMENTUM_ROTATION | -11.55 | 147 | 28.51 | -11.55 | research-only |

## Evidence Sheets

### OPENING_RANGE_VWAP_BREAKOUT

- Comparator: `SMA_CROSSOVER`
- Evidence: high enough trade count to be informative, but both full-sample and holdout returns stayed negative after costs.
- Action: keep `research-only`; do not promote to shadow paper until an approved intraday ETF pack exists and the signal stack improves against the current paper-monitor candidate.

### VWAP_PULLBACK_CONTINUATION

- Comparator: `SMA_CROSSOVER`
- Evidence: the weakest Phase 3 result in this round, with severe fee drag, very high churn, and negative performance in both the full sample and holdout while trailing both `BUY_AND_HOLD` and the current paper-monitor candidate.
- Action: mark as `reject` for active consideration; keep only as a historical comparison point until materially redesigned.

### EXHAUSTION_REVERSAL_FADE

- Comparator: `SMA_CROSSOVER`
- Evidence: mechanically valid and better than passive buy-and-hold on the BTC holdout, but still negative after costs and materially weaker than the current paper-monitor candidate.
- Action: keep `research-only`; require a lower-turnover redesign plus an approved intraday ETF anchor before any stronger claim.

### MULTI_TIMEFRAME_EMA_ADX_PULLBACK

- Comparator: `SMA_CROSSOVER`
- Evidence: the cleanest Phase 3 drawdown profile in this round, but holdout return remained slightly negative and the out-of-sample trade count stayed below the protocol comfort threshold.
- Action: keep `research-only`; this is worth later follow-up, but not promotion.

### SQUEEZE_BREAKOUT_REGIME_CONFIRMATION

- Comparator: `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`
- Evidence: lower turnover than the `15m` same-day paths and better than passive buy-and-hold on the BTC holdout, but still negative after costs and weaker than the strongest current BTC breakout path.
- Action: keep `research-only`; require a materially better failed-breakout profile plus an approved intraday ETF pack before any shadow paper consideration.

### RELATIVE_STRENGTH_ROTATION_INTRADAY_ENTRY_FILTER

- Comparator: `DUAL_MOMENTUM_ROTATION`
- Evidence: the timing filter did not rescue the rotation concept on the BTC-anchor universe; turnover and fee drag remained too high, and holdout performance stayed negative.
- Action: keep `research-only`; revisit only after a lower-churn redesign and a broader approved pack that includes an intraday ETF anchor.

## Promotion Summary

- No new Phase 3 strategy is promoted to `watchlist` or `paper-monitor candidate` in this round.
- `VWAP_PULLBACK_CONTINUATION` is the only clear `reject` under the current evidence.
- `OPENING_RANGE_VWAP_BREAKOUT`, `EXHAUSTION_REVERSAL_FADE`, `MULTI_TIMEFRAME_EMA_ADX_PULLBACK`, `SQUEEZE_BREAKOUT_REGIME_CONFIRMATION`, and `RELATIVE_STRENGTH_ROTATION_INTRADAY_ENTRY_FILTER` stay `research-only`.
- The next gating dependency is an approved intraday ETF audit pack so the frozen methodology can evaluate these hypotheses without abusing daily-only equity data.

## Reproducible Artifact

The generated artifact lives at `AlgotradingBot/build/reports/phase-three-strategy-audit/report.md` after each `.\gradlew.bat phaseThreeStrategyAudit --no-daemon` run.
