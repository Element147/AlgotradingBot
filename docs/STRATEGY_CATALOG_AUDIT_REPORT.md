# Strategy Catalog Audit Report

Generated from the repo-native `strategyCatalogAudit` runner against dataset `#12` (`Binance BTC/USDT +2 15m 2024-03-12 to 2026-03-12`) on March 27, 2026.

Frozen audit inputs:

- Dataset checksum: `b93c95da97c05f4edf4d706b80d33fcfab752f4f4d6f11f003fa3aca2fe2d326`
- Fees: `10` bps
- Slippage: `3` bps
- Fill model: next-bar-open
- Holdout split: `2024-03-12` to `2025-07-01` in-sample, `2025-07-01` to `2026-03-12` out-of-sample

## Full Sample Scorecards

| Strategy | Timeframe | Scope | Return % | Sharpe | Profit Factor | Win % | Max DD % | Trades | Exposure % | Fee Drag | Validator |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| BUY_AND_HOLD | 1d | BTC/USDT | 1.02 | 999.99 | 999.99 | 100.00 | 49.53 | 1 | 97.12 | 2.61 | FAILED |
| DUAL_MOMENTUM_ROTATION | 1d | DATASET_UNIVERSE | 28.30 | 3.40 | 1.73 | 42.86 | 27.99 | 21 | 47.67 | 45.49 | FAILED |
| VOLATILITY_MANAGED_DONCHIAN_BREAKOUT | 1d | BTC/USDT | 28.56 | 9.52 | 3.72 | 50.00 | 16.09 | 4 | 26.16 | 13.29 | FAILED |
| TREND_PULLBACK_CONTINUATION | 4h | BTC/USDT | -21.26 | -2.57 | 0.60 | 24.44 | 28.09 | 90 | 7.02 | 207.66 | FAILED |
| REGIME_FILTERED_MEAN_REVERSION | 4h | BTC/USDT | -1.64 | -8.12 | 0.28 | 42.86 | 2.89 | 7 | 0.64 | 10.83 | FAILED |
| TREND_FIRST_ADAPTIVE_ENSEMBLE | 1d | DATASET_UNIVERSE | 7.91 | 1.05 | 1.10 | 45.65 | 25.39 | 46 | 35.21 | 87.57 | FAILED |
| SMA_CROSSOVER | 4h | BTC/USDT | 1.85 | 0.51 | 1.01 | 34.83 | 40.07 | 89 | 50.67 | 293.13 | FAILED |
| BOLLINGER_BANDS | 4h | BTC/USDT | -17.90 | -7.83 | 0.35 | 33.33 | 17.90 | 30 | 2.85 | 52.62 | FAILED |
| ICHIMOKU_TREND | 1d | BTC/USDT | 7.64 | 1.77 | 1.23 | 21.43 | 21.62 | 14 | 21.64 | 36.75 | FAILED |

## Holdout And Walk-Forward Summary

| Strategy | In-Sample Return % | Out-of-Sample Return % | OOS Trades | OOS Validator | Walk-Forward Ratio % | Walk-Forward Pass | Vs Buy/Hold OOS % |
| --- | ---: | ---: | ---: | --- | ---: | --- | ---: |
| BUY_AND_HOLD | 53.44 | -40.06 | 1 | FAILED | 0.00 | FAIL | 0.00 |
| DUAL_MOMENTUM_ROTATION | 13.47 | 0.00 | 0 | FAILED | 0.00 | FAIL | 40.06 |
| VOLATILITY_MANAGED_DONCHIAN_BREAKOUT | 39.05 | 0.00 | 0 | FAILED | 0.00 | FAIL | 40.06 |
| TREND_PULLBACK_CONTINUATION | -12.71 | -7.07 | 16 | FAILED | 0.00 | FAIL | 32.99 |
| REGIME_FILTERED_MEAN_REVERSION | -1.52 | -0.13 | 1 | FAILED | 0.00 | FAIL | 39.93 |
| TREND_FIRST_ADAPTIVE_ENSEMBLE | -10.23 | 0.00 | 0 | FAILED | 0.00 | FAIL | 40.06 |
| SMA_CROSSOVER | 38.24 | 7.08 | 32 | FAILED | 51.39 | FAIL | 47.14 |
| BOLLINGER_BANDS | -16.92 | -2.24 | 3 | FAILED | 0.00 | FAIL | 37.82 |
| ICHIMOKU_TREND | 5.71 | -1.49 | 1 | FAILED | 0.00 | FAIL | 38.57 |

## Evidence Notes

- `BUY_AND_HOLD`: trade count stays below the protocol comfort threshold; keep interpretation conservative.
- `DUAL_MOMENTUM_ROTATION`: no out-of-sample trades; evidence is sparse despite the strong full-sample result.
- `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT`: no out-of-sample trades; the full-sample validator pass still does not support promotion by itself.
- `TREND_PULLBACK_CONTINUATION`: both full-sample and out-of-sample windows stayed negative after costs.
- `REGIME_FILTERED_MEAN_REVERSION`: mechanically valid but weak across both windows and too sparse for a stronger claim.
- `TREND_FIRST_ADAPTIVE_ENSEMBLE`: positive full sample, but the chosen holdout window produced no out-of-sample trades.
- `SMA_CROSSOVER`: remained the clearest encouraging path because out-of-sample return stayed positive at `7.08%`, even though the validator still failed and the walk-forward ratio stayed below the current `80%` threshold.
- `BOLLINGER_BANDS`: the hardened implementation reduced damage, but both full-sample and holdout results remained negative.
- `ICHIMOKU_TREND`: honest long or cash implementation, but out-of-sample evidence stayed sparse and slightly negative.

## Comparison Notes

- `BUY_AND_HOLD` remains the passive benchmark for the single-symbol BTC review.
- Dataset-universe strategies are still compared against that benchmark only as a conservative reference, not as a like-for-like portfolio benchmark.
- `Walk-Forward Ratio %` uses the repo's current `WalkForwardResult` seam, but the report fails closed when in-sample or out-of-sample Sharpe is non-positive or when the out-of-sample window has no trades.
- Fee drag is an executed-notional estimate under the frozen `10` bps fee plus `3` bps slippage baseline.
- The reproducible generated artifact lives at `AlgotradingBot/build/reports/strategy-catalog-audit/report.md` after each `.\gradlew.bat strategyCatalogAudit --no-daemon` run.
