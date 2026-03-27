# Strategy Spec Template

Planning reference: `FEATURE_DEVELOPMENT_PLAN.md` task `3B.2`.

Use this template before any new strategy implementation starts.

The goal is to force every proposed strategy to explain:

- why the edge might exist
- which markets and regimes it is allowed to trade
- how bullish and bearish states map to the current product model
- which risk rules constrain it
- what evidence it must produce before promotion

This template is mandatory for all later Phase `3C` strategy work.

## How To Use This Template

- Fill the entire template before writing code.
- Keep the first version concrete and small; if the strategy needs five optional branches to make sense, it is not ready.
- Name exact datasets, timeframes, and action mappings instead of relying on generic language.
- If bearish behavior falls outside the approved small-account baseline, state that the strategy is outside that lane.
- If the strategy cannot survive realistic fees, slippage, or minimum-order rules, reject it before implementation.

## Required Template

### 1. Strategy Identity

- Strategy name:
- Version:
- Owner:
- Planning phase:
- Status:
  Allowed values: `proposed`, `research-only`, `implementation-ready`, `rejected`

### 2. Hypothesis

- What persistent market behavior is the strategy trying to exploit?
- Why might that behavior survive realistic fees and slippage?
- What would falsify the hypothesis?

### 3. Market Regime

- Which regimes is the strategy allowed to trade?
  Examples: `trend up`, `trend down`, `range`, `high-volatility breakout`, `session open only`
- Which regimes explicitly disable the strategy?
- What regime classifier or rule decides that boundary?

### 4. Universe

- Approved asset class:
- Approved symbols or universe definition:
- Liquidity rules:
- Session rules:
- Minimum-order and fractionality assumptions:

This section must align with `docs/SMALL_ACCOUNT_EXECUTION_CONSTRAINTS.md` when the strategy is intended for the small-account roadmap.

### 5. Timeframe

- Primary signal timeframe:
- Higher-timeframe context:
- Lower-timeframe confirmation, if any:
- Minimum candle history before valid signals:

### 6. Signal Stack

List every signal component explicitly.

- Setup condition:
- Entry trigger:
- Confirmation filters:
- Stand-aside filters:
- Exit trigger:

If the strategy uses multiple indicators, state which one is mandatory and which ones are optional.

### 7. Long Behavior

- When does the strategy enter long?
- When does it add, reduce, or fully exit?
- Does it pyramid, scale out, or stay single-entry only?

### 8. Bearish Behavior

- What does a bearish state do in this strategy?
  Allowed examples in the small-account baseline: `sell to cash`, `stablecoin`, `SHORT_PROXY`
- Is direct shorting required?
- If yes, which environment and controls would be required before implementation?

This field may never silently assume "open a short" unless that support already exists and is approved.

### 9. Risk Model

- Max risk per trade:
- Position-sizing method:
- Max concurrent positions:
- Stop model:
- Time stop, if any:
- Kill-switch or cooldown behavior:

State the exact rule for skipping trades that violate minimum order size or risk caps.

### 10. Exit Model

- Planned profit-taking behavior:
- Planned loss-cutting behavior:
- Regime-break exit behavior:
- End-of-session or end-of-day flattening behavior:

### 11. Telemetry And Explainability

- Which indicator values must be visible in backtest and execution telemetry?
- Which reason labels must the strategy emit for `enter`, `exit`, and `stand aside`?
- What operator-facing notes are required in the strategy profile?

### 12. Validation Plan

- Datasets to use:
- Fee and slippage assumptions:
- In-sample / holdout rule:
- Walk-forward expectation:
- Benchmark comparisons:
- Sensitivity tests:
- Failure conditions that automatically reject the strategy:

This section must reference the frozen audit method in `docs/STRATEGY_AUDIT_PROTOCOL.md` unless an explicitly approved alternative is documented.

### 13. Overfitting Risk Review

- Which parameters are likely to overfit?
- Which implementation choices could leak future information?
- What simplifications keep the first version honest?
- Which parameters are fixed before optimization starts?

### 14. Minimum Evidence Threshold

Before a strategy can move beyond `research-only`, specify:

- minimum trade count:
- minimum acceptable out-of-sample behavior:
- maximum acceptable fee drag:
- minimum benchmark comparison bar:
- required paper-monitoring evidence, if any:

If the strategy cannot define those thresholds up front, it is not ready for implementation.

## Short Review Checklist

Use this checklist before approving a spec.

- Is the hypothesis falsifiable?
- Is the regime boundary explicit?
- Is the universe small, liquid, and realistic?
- Is bearish behavior consistent with the actual product?
- Is the risk model concrete?
- Is the validation plan tied to reproducible datasets and cost assumptions?
- Are overfitting and look-ahead risks named directly?
- Does the spec define what failure looks like?

## Minimal Example Skeleton

```md
# Strategy Spec: Opening Range VWAP Breakout v1

## 1. Strategy Identity
- Strategy name: Opening Range VWAP Breakout
- Version: v1
- Owner: Quant research
- Planning phase: 3C.1
- Status: proposed

## 2. Hypothesis
- The opening range can anchor early directional discovery in liquid instruments when price, VWAP, and volume all align.
- The edge should fail if breakout continuation does not survive realistic opening volatility and fee drag.
- Falsifier: out-of-sample continuation disappears after costs or the setup overtrades noisy opens.

## 3. Market Regime
- Allowed: liquid session open with aligned higher-timeframe trend or broad market strength.
- Disabled: low-liquidity opens, event shock days, or conflicting higher-timeframe trend.

## 4. Universe
- Approved asset class: liquid ETFs
- Approved symbols: SPY, QQQ
- Liquidity rules: regular session only, fractionality supported, no thin names
- Minimum-order assumptions: skip if position would exceed the small-account risk cap
```
