# Strategy Audit Protocol

Research appendix for frozen strategy-evaluation methodology. This document defines how the repository audits strategy evidence before any strategy is described as a watchlist item or a paper-monitor candidate. It does not override the current product posture in `README.md`, `PROJECT_STATUS.md`, `PRODUCT.md`, `ARCHITECTURE.md`, or `TRADING_GUARDRAILS.md`.

## Purpose

Freeze one repeatable audit methodology before rerunning or reclassifying the built-in strategy catalog.

This protocol exists so later audit outcomes are judged by the same rules instead of changing thresholds after seeing results.

## Core Rules

1. Treat every strategy as a research hypothesis, not as a profitability claim.
2. Use explicit fees, slippage, timeframe handling, and signal-timing assumptions in every run.
3. Prefer long or cash behavior by default; direct short exposure remains opt-in for research and paper only.
4. Fail closed on unrealistic assumptions, sparse evidence, or insufficient out-of-sample coverage.
5. Record enough metadata that another operator can reproduce the audit exactly.

## Required Audit Record

Every audited run set must record:

- strategy ID and parameter version
- dataset ID or name
- dataset checksum and schema identity
- symbol scope and requested timeframe
- selection mode: `SINGLE_SYMBOL` or `DATASET_UNIVERSE`
- date range
- fee assumption in basis points
- slippage assumption in basis points
- execution model notes, including next-bar-open fills
- environment posture: research or paper-safe only
- benchmark used for comparison

If any of that metadata is missing, the audit is incomplete and the strategy cannot be promoted.

## Realism Assumptions

The minimum realism bundle for all audits is:

- fees included
- slippage included
- requested timeframe honored through explicit resampling or exact-timeframe data
- next-bar-open or another explicitly documented fill model
- no look-ahead use of future candles or indicators
- minimum-order, lot-size, and notional constraints noted when they matter to the instrument

Current default cost baseline for cross-strategy comparison:

- fees: `10` bps
- slippage: `3` bps

If a later venue-specific audit uses different costs, the report must say why and must keep the assumptions consistent across all compared strategies for that venue.

## Dataset Policy

The dataset pack itself is defined in task `3A.2`, but the protocol freezes these requirements now:

- at least one liquid crypto-major dataset
- at least one small-account-friendly equity or ETF dataset
- reproducible provenance for every dataset
- no strategy-specific cherry-picked windows
- the same dataset pack must be used for all strategies in one audit round

Current reference lesson from the March 20, 2026 crypto audit:

- dataset `#12` is a valid crypto reference dataset
- the first holdout split at `2025-09-12` was rejected because the out-of-sample window was too short for slow strategies with long warm-up requirements
- later reruns must reject similarly underpowered holdout windows instead of forcing a result

## Evaluation Bundle

Each strategy audit must include four views:

1. Full-sample run
2. Frozen holdout split
3. Anchored walk-forward review
4. Benchmark comparison

### Full-Sample Run

Purpose:

- inspect raw behavior over the full available sample
- capture trade count, drawdown, turnover, and fee drag under one consistent cost model

The full-sample run is useful but never sufficient on its own for promotion.

### Frozen Holdout Split

Purpose:

- test whether the strategy remains directionally useful after the in-sample period

Rules:

- choose the split before reviewing results
- keep the split contiguous
- do not move the split per strategy
- reject the split if the out-of-sample segment cannot support the strategy's warm-up and evaluation window

For the current crypto reference work, the valid split is:

- in-sample: `2024-03-12` to `2025-07-01`
- out-of-sample: `2025-07-01` to `2026-03-13`

### Anchored Walk-Forward Review

Purpose:

- check whether performance deteriorates sharply as the strategy is rolled forward through later periods

Rules:

- use anchored expanding windows
- keep testing windows contiguous and later in time than training windows
- record the training and testing Sharpe ratio relationship where available
- treat large performance collapse as evidence of instability, not as a reason to tune more parameters

Current implementation note:

- the backend already contains `WalkForwardResult`, which currently treats a testing Sharpe ratio below `80%` of training Sharpe as failed
- that ratio is one signal, not the whole audit outcome

### Benchmark Comparison

Every active strategy must be compared against:

- `BUY_AND_HOLD`
- the strongest current catalog path on the same dataset and timeframe family when that comparison is meaningful

The goal is to ask whether the added complexity improved outcomes after costs and drawdown, not merely whether the strategy made money in isolation.

## Minimum Sample Rules

The audit must explicitly reject underpowered evidence.

Minimum rules:

- use the built-in validator output as a recorded quality gate
- treat fewer than `30` trades as insufficient for strong statistical claims unless the strategy is intentionally low-turnover
- for intentionally low-turnover strategies, sparse out-of-sample behavior must still be called out plainly and cannot be promoted as strong evidence
- if a strategy generates zero out-of-sample trades, that is not a pass; it is sparse evidence

Practical interpretation:

- high-turnover systems should clear the `30`-trade baseline
- low-turnover trend systems may still remain interesting below that threshold, but they stay in `research-only` or at most `watchlist` unless other evidence is unusually strong and the limitations are explicit

## Metrics That Must Be Reported

Every audited strategy scorecard must include:

- net return
- max drawdown
- Sharpe ratio
- profit factor
- win rate
- trade count
- exposure time
- fee drag when derivable from the run
- validation status from the current backend validator

Optional but recommended:

- Calmar ratio
- Monte Carlo confidence
- p-value or other significance note
- average hold time
- turnover

## Disposition Labels

These labels are stricter than "made money once" and broader than the backend `PRODUCTION_READY` or `FAILED` validation flag.

### Reject

Use `reject` when any of the following is true:

- assumptions are unrealistic or not reproducible
- the strategy depends on invalid timeframe handling, look-ahead bias, or unsupported execution behavior
- full-sample and out-of-sample results are both poor after costs
- drawdown or failure behavior is unacceptable for the repository risk posture
- the strategy is clearly inferior to the benchmark and offers no compensating robustness or interpretability

### Research-Only

Use `research-only` when:

- the implementation is mechanically valid
- the strategy is interesting enough to keep in the catalog
- but out-of-sample evidence is mixed, flat, sparse, or otherwise too weak for promotion

This is the default label unless stronger evidence exists.

### Watchlist

Use `watchlist` when:

- the strategy is reproducible and mechanically honest
- full-sample and holdout behavior are directionally encouraging
- drawdown stays within the current conservative posture
- but evidence is still not strong enough to justify paper monitoring, usually because sample size, robustness, or cross-dataset coverage is still too thin

### Paper-Monitor Candidate

Use `paper-monitor candidate` only when all of the following are true:

- the strategy is reproducible and audit-complete
- costs, timeframe handling, and signal timing were explicit
- out-of-sample behavior is positive or at least clearly stronger than the benchmark on a risk-adjusted basis
- drawdown and failure behavior fit the repository guardrails
- the strategy logic is explainable enough to monitor in Forward Testing or Paper
- any validator failure is understood and documented rather than ignored

Important:

- a paper-monitor candidate is still not production-ready
- a full-sample validator pass alone is not enough
- a paper-monitor candidate must still go through paper-safe follow-up before any stronger claim is made

## How To Use The Built-In Validator

The backend `BacktestValidator` remains part of the audit record, with current gate thresholds including:

- Sharpe ratio `> 1.0`
- profit factor `> 1.5`
- win rate `45%` to `55%`
- max drawdown `< 25%`
- Calmar ratio `> 1.0`
- Monte Carlo confidence `>= 95%`
- p-value `< 0.05`
- minimum trades `>= 30`

Interpretation rule:

- `PRODUCTION_READY` from the validator means the run passed the current quality gates
- it does not automatically mean the strategy is live-ready or even paper-ready
- `FAILED` does not automatically mean the strategy is worthless; it may still remain `research-only` or `watchlist` if the failure is driven by sparse evidence or heuristic gate mismatch rather than obvious economic weakness

## Honest Reporting Language

Audit summaries must say:

- what dataset was used
- what costs were used
- what split was used
- whether the strategy was long or cash only, or used any short-proxy behavior
- what failed, if anything
- why the final disposition was chosen

Avoid these claims:

- "profitable"
- "production-ready"
- "live-ready"
- "safe to deploy"

unless the evidence and the documented repository guardrails truly support them.

## Current March 20, 2026 Interpretation Example

This protocol is intentionally consistent with the current repo posture:

- `VOLATILITY_MANAGED_DONCHIAN_BREAKOUT` passed the current full-sample validator on dataset `#12`, but sparse holdout trading still keeps it out of any live-readiness framing
- `SMA_CROSSOVER` remained the clearest immediate paper-follow-up candidate because it stayed positive on the valid holdout split, even though the broader evidence is still too limited for stronger claims
- other catalog strategies with mixed, flat, or sparse out-of-sample behavior remain `research-only`

## What Changes In Later Tasks

- Task `3A.2` defines the representative dataset pack
- Task `3A.3` reruns the catalog under this protocol
- Task `3A.4` publishes the resulting dispositions

This document should change only when the methodology itself changes, not every time a new run is added.
