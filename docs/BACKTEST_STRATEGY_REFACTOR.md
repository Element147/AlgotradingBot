# Backtest Strategy Refactor

Updated: March 11, 2026

## Goal

This refactor separates algorithm logic from backtest orchestration so the backend can follow SOLID principles and support future strategy composition without pushing more conditional logic into one service class.

## Why The Old Shape Was A Problem

Before this refactor, `BacktestExecutionService` handled all of these responsibilities:

- async orchestration
- dataset loading and filtering
- algorithm selection
- indicator math
- buy/sell signal generation
- simulation loop
- performance metric calculation
- pass/fail evaluation

That made the class hard to extend safely. Every new strategy required editing the same service, which violated the Open/Closed Principle and made combination work much harder.

## New Backend Design

### Strategy seam

Each backtest algorithm is now its own Spring-managed class implementing `BacktestStrategy`.

Current implementations:

- `BuyAndHoldBacktestStrategy`
- `DualMomentumRotationBacktestStrategy`
- `VolatilityManagedDonchianBreakoutBacktestStrategy`
- `TrendPullbackContinuationBacktestStrategy`
- `RegimeFilteredMeanReversionBacktestStrategy`
- `TrendFirstAdaptiveEnsembleBacktestStrategy`
- `SmaCrossoverBacktestStrategy`
- `BollingerBandsBacktestStrategy`

Shared contract:

- `definition()`
- `getSelectionMode()`
- `getMinimumCandles()`
- `evaluate(BacktestStrategyContext context)`

### Strategy registry

`BacktestStrategyRegistry` receives all `BacktestStrategy` beans from Spring and indexes them by `BacktestAlgorithmType`.

Benefits:

- controller and service layers no longer hard-code algorithm metadata
- duplicate strategy registration fails fast
- adding a new strategy no longer requires editing the simulation engine

### Indicator seam

`BacktestIndicatorCalculator` owns reusable indicator math needed by strategies:

- SMA
- Bollinger lower band
- square-root helper

This keeps indicator formulas out of orchestration code.

The calculator now supports a wider indicator set needed by the greenfield strategy catalog:

- SMA / EMA
- Bollinger bands
- highest high / lowest low
- ATR
- RSI
- ADX
- rolling return
- realized volatility

### Simulation seam

`BacktestSimulationEngine` owns the execution loop only:

- load strategy from registry
- validate warmup requirements
- simulate position entry/exit
- simulate symbol rotation for dataset-universe strategies
- track equity curve and returns

It does not know strategy-specific formulas.

### Metrics seam

`BacktestSimulationMetricsCalculator` owns result statistics:

- Sharpe ratio
- profit factor
- win rate
- max drawdown
- final simulation result packaging

This keeps `BacktestExecutionService` focused on persistence and async execution.

### Orchestration service

`BacktestExecutionService` is now much smaller:

- fetch pending result
- parse/filter candles
- delegate simulation
- persist result status and metrics

This is the main SRP improvement.

## SOLID Mapping

### Single Responsibility Principle

- strategy classes own only one algorithm each
- indicator math is in one helper
- simulation metrics are in one calculator
- async/persistence orchestration stays in `BacktestExecutionService`

### Open/Closed Principle

To add a new backtest strategy:

1. create a new `BacktestStrategy` implementation
2. register it as a Spring bean
3. add a `BacktestAlgorithmType` enum value
4. choose whether the strategy is `SINGLE_SYMBOL` or `DATASET_UNIVERSE`

The registry and controller catalog continue to work without adding more `switch` logic inside the orchestration layer.

### Liskov Substitution Principle

Every strategy implementation can be substituted through the same `BacktestStrategy` interface and evaluated by the same simulation engine.

### Interface Segregation Principle

The strategy contract is intentionally small and focused. Strategy classes do not implement persistence, metrics, or controller concerns.

### Dependency Inversion Principle

`BacktestSimulationEngine` depends on the `BacktestStrategy` abstraction through `BacktestStrategyRegistry`, not on concrete strategy classes.

## Spring Boot Usage

The refactor leans on the current Spring stack in a few useful ways:

- constructor injection everywhere
- strategy discovery through injected bean lists
- fail-fast registry validation during context startup
- small Java 21 records for internal value objects:
  - `BacktestStrategyContext`
  - `BacktestStrategyDefinition`
  - `BacktestSimulationResult`

## Test Cleanup Included

Two repository-polluting test artifacts were addressed during the refactor:

- system-backup tests now write to `build/test-backups` under the `test` profile
- `ValidationSuite` now writes reports to `build/reports/validation` instead of repo root

Also removed:

- `ManualSignalVerification.java`
- `ManualSignalVerificationTest.java`

Those files were only manual/demo scaffolding and were not part of the runtime backtest flow.

## How To Add A New Strategy Now

1. Add a new enum value in `BacktestAlgorithmType`.
2. Create a new `BacktestStrategy` bean under `backtest/strategy/`.
3. Use `BacktestIndicatorCalculator` if shared math is enough, or add a focused helper if the new strategy needs distinct calculations.
4. Add unit tests for:
   - strategy signal behavior
   - registry presence if needed
   - simulation path
5. The `/api/backtests/algorithms` endpoint will automatically expose the new algorithm metadata through the registry-backed catalog.

## Key Files

- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/strategy/BacktestStrategy.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/strategy/BacktestStrategyRegistry.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/BacktestSimulationEngine.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/BacktestSimulationMetricsCalculator.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/service/BacktestExecutionService.java`
