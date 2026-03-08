---
title: "Phase 4: Backtesting Engine"
status: completed
priority: critical
dependencies: ["phase1-project-setup", "phase2-risk-management", "phase3-trading-strategy"]
---

# Phase 4: Backtesting Engine

## Overview
Build a comprehensive backtesting engine that validates the trading strategy against historical data, calculates performance metrics, performs Monte Carlo simulations, and enforces quality gates before production deployment.

## Success Criteria
- Backtest engine processes historical OHLCV data correctly
- All performance metrics calculated accurately (Sharpe, Profit Factor, Win Rate, Drawdown, Calmar)
- Walk-forward validation implemented
- Monte Carlo simulation with 1,000+ iterations
- Quality gate validation enforces production requirements
- Sample historical data (1+ month) included
- Strategy must pass ALL quality gates to be marked PRODUCTION_READY

## Tasks

### Task 4.1: Backtest Configuration DTO
**Status:** not_started
**Estimated Time:** 20 minutes

Create `BacktestConfig.java` with:
- Symbol (String)
- Start date (LocalDateTime)
- End date (LocalDateTime)
- Initial balance (BigDecimal)
- Risk per trade (BigDecimal - default 0.02)
- Max drawdown limit (BigDecimal - default 0.25)
- Commission rate (BigDecimal - default 0.001)
- Slippage rate (BigDecimal - default 0.0003)
- Strategy parameters (Map<String, Object>)
- Validation method to ensure dates are valid

**Acceptance Criteria:**
- All configuration parameters present
- Validation logic implemented
- Immutable or builder pattern

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/BacktestConfig.java`

---

### Task 4.2: Backtest Metrics Calculator
**Status:** not_started
**Estimated Time:** 90 minutes

Create `BacktestMetrics.java` with methods to calculate:

**1. Sharpe Ratio:**
```
sharpeRatio = (avgDailyReturn - riskFreeRate) / stdDevDailyReturns
```
- Use risk-free rate = 0 (conservative)
- Annualize: multiply by sqrt(365)
- Requirement: > 1.0

**2. Profit Factor:**
```
profitFactor = sumWinningTrades / abs(sumLosingTrades)
```
- Requirement: > 1.5

**3. Win Rate:**
```
winRate = winningTrades / totalTrades
```
- Requirement: 45-55%

**4. Max Drawdown:**
```
maxDrawdown = (lowestEquity - peakEquity) / peakEquity
```
- Track peak equity continuously
- Requirement: < 25%

**5. Calmar Ratio:**
```
calmarRatio = annualReturn / abs(maxDrawdown)
```
- Requirement: > 1.0

**6. Total Return:**
```
totalReturn = (finalBalance - initialBalance) / initialBalance
```

**7. Annual Return:**
```
annualReturn = totalReturn / (days / 365)
```

**Key Requirements:**
- All calculations use BigDecimal
- Handle edge cases (zero trades, all losses, etc.)
- Return metrics object with all values
- Include statistical significance (p-value) calculation

**Acceptance Criteria:**
- All 7+ metrics calculated correctly
- BigDecimal precision maintained
- Edge cases handled
- Verified against manual calculations

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/BacktestMetrics.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/MetricsResult.java` (DTO)

---

### Task 4.3: Backtest Metrics Unit Tests
**Status:** not_started
**Estimated Time:** 60 minutes

Create `BacktestMetricsTest.java` with test cases:
- Test 1: Known trade sequence → verify Sharpe ratio
- Test 2: Known trade sequence → verify Profit Factor
- Test 3: Known trade sequence → verify Win Rate
- Test 4: Known trade sequence → verify Max Drawdown
- Test 5: Known trade sequence → verify Calmar Ratio
- Test 6: Edge case - all winning trades → verify metrics
- Test 7: Edge case - all losing trades → verify metrics
- Test 8: Edge case - zero trades → handle gracefully
- Test 9: Verify BigDecimal precision

**Test Data Example:**
```
Trades: [+$10, -$5, +$8, -$3, +$12, -$4, +$6, -$2]
Expected Win Rate: 62.5% (5/8)
Expected Profit Factor: $36 / $14 = 2.57
Expected Total Return: +$22
```

**Acceptance Criteria:**
- 100% code coverage on BacktestMetrics
- All calculations verified
- Edge cases handled
- Tests pass consistently

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/BacktestMetricsTest.java`

---

### Task 4.4: Backtest Engine Core Implementation
**Status:** not_started
**Estimated Time:** 120 minutes

Create `BacktestEngine.java` with:
- Method: `runBacktest(BacktestConfig config, List<OHLCVData> historicalData)`
- Load historical OHLCV data
- Initialize account with initial balance
- For each candle:
  - Generate signal using BollingerBandStrategy
  - If BUY signal and no position:
    - Calculate position size using PositionSizer
    - Check risk using RiskManager
    - Execute entry with SlippageCalculator
    - Record trade entry
  - If SELL signal or stop-loss/take-profit triggered:
    - Execute exit with SlippageCalculator
    - Calculate PnL
    - Record trade exit
    - Update account balance
  - Track equity curve
  - Check circuit breaker conditions
- Calculate final metrics using BacktestMetrics
- Return BacktestResult

**Key Requirements:**
- Simulate realistic order execution (use OHLC data)
- Apply transaction costs on EVERY trade
- Track equity curve for drawdown calculation
- Handle circuit breaker triggers (stop trading if triggered)
- Log all trades with structured JSON
- Persist results to database

**Acceptance Criteria:**
- Processes historical data correctly
- Executes trades with realistic costs
- Tracks equity curve accurately
- Circuit breaker logic works
- Results persisted to database

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/BacktestEngine.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/OHLCVData.java` (DTO)

---

### Task 4.5: Backtest Engine Unit Tests
**Status:** not_started
**Estimated Time:** 90 minutes

Create `BacktestEngineTest.java` with test cases:
- Test 1: Simple backtest (10 candles, 2 trades) → verify execution
- Test 2: Verify transaction costs applied on entry and exit
- Test 3: Verify position sizing respects 2% rule
- Test 4: Verify stop-loss triggers correctly
- Test 5: Verify take-profit triggers correctly
- Test 6: Verify circuit breaker stops trading
- Test 7: Verify equity curve tracking
- Test 8: Verify results persisted to database
- Test 9: Edge case - no signals generated → zero trades

**Acceptance Criteria:**
- 100% code coverage on BacktestEngine
- All trade execution scenarios tested
- Database persistence verified
- Tests pass consistently

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/BacktestEngineTest.java`

---

### Task 4.6: Monte Carlo Simulator Implementation
**Status:** not_started
**Estimated Time:** 75 minutes

Create `MonteCarloSimulator.java` with:
- Method: `simulate(List<Trade> trades, int iterations)`
- For each iteration (1,000+):
  - Shuffle trade order randomly
  - Recalculate equity curve
  - Calculate final balance
  - Calculate max drawdown
  - Calculate Sharpe ratio
- Aggregate results:
  - Percentage of profitable iterations
  - Average final balance
  - Worst-case drawdown
  - Confidence intervals (5th, 50th, 95th percentile)
- Return MonteCarloResult

**Key Requirements:**
- Minimum 1,000 iterations
- Random shuffle preserves trade characteristics
- Calculate statistics across all iterations
- Requirement: ≥ 95% iterations profitable

**Acceptance Criteria:**
- Runs 1,000+ iterations efficiently
- Proper randomization
- Statistics calculated correctly
- Results reproducible with seed

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/MonteCarloSimulator.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/MonteCarloResult.java` (DTO)

---

### Task 4.7: Monte Carlo Simulator Unit Tests
**Status:** not_started
**Estimated Time:** 45 minutes

Create `MonteCarloSimulatorTest.java` with test cases:
- Test 1: Known trade sequence → verify randomization
- Test 2: All winning trades → 100% profitable iterations
- Test 3: Mixed trades → verify confidence intervals
- Test 4: Verify statistics (mean, median, percentiles)
- Test 5: Verify reproducibility with seed
- Test 6: Performance test - 1,000 iterations < 10 seconds

**Acceptance Criteria:**
- 100% code coverage on MonteCarloSimulator
- Randomization verified
- Statistics verified
- Performance acceptable

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/MonteCarloSimulatorTest.java`

---

### Task 4.8: Backtest Validator (Quality Gate)
**Status:** not_started
**Estimated Time:** 60 minutes

Create `BacktestValidator.java` with:
- Method: `validate(BacktestResult result, MonteCarloResult mcResult)`
- Check ALL quality gates:
  - ✅ Sharpe Ratio > 1.0
  - ✅ Profit Factor > 1.5
  - ✅ Win Rate 45-55%
  - ✅ Max Drawdown < 25%
  - ✅ Calmar Ratio > 1.0
  - ✅ Monte Carlo confidence ≥ 95%
  - ✅ Statistical significance (p-value < 0.05)
  - ✅ Minimum trades (≥ 30 for statistical validity)
- Return ValidationReport with:
  - Overall status (PASSED, FAILED, PRODUCTION_READY)
  - Individual gate results
  - Failure reasons
  - Recommendations

**Key Requirements:**
- ALL gates must pass for PRODUCTION_READY status
- Clear failure messages
- Actionable recommendations
- Persist validation status to database

**Acceptance Criteria:**
- All quality gates implemented
- Validation logic correct
- Clear reporting
- Database persistence

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/BacktestValidator.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/ValidationReport.java` (DTO)

---

### Task 4.9: Backtest Validator Unit Tests
**Status:** not_started
**Estimated Time:** 45 minutes

Create `BacktestValidatorTest.java` with test cases:
- Test 1: All gates pass → PRODUCTION_READY
- Test 2: Sharpe < 1.0 → FAILED with reason
- Test 3: Profit Factor < 1.5 → FAILED with reason
- Test 4: Win Rate outside 45-55% → FAILED with reason
- Test 5: Max Drawdown > 25% → FAILED with reason
- Test 6: Monte Carlo < 95% → FAILED with reason
- Test 7: Multiple failures → all reasons reported
- Test 8: Verify database persistence

**Acceptance Criteria:**
- 100% code coverage on BacktestValidator
- All validation scenarios tested
- Database persistence verified
- Tests pass consistently

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/BacktestValidatorTest.java`

---

### Task 4.10: Sample Historical Data
**Status:** not_started
**Estimated Time:** 30 minutes

Create `sample-btc-eth-data.csv` with:
- 1+ month of hourly OHLCV data
- Columns: timestamp, symbol, open, high, low, close, volume
- BTC/USDT data (720+ rows for 1 month)
- ETH/USDT data (720+ rows for 1 month)
- Realistic price movements
- CSV format for easy loading

**Data Source Options:**
- Download from Binance API (historical data)
- Use CryptoCompare API
- Generate synthetic data with realistic volatility

**Acceptance Criteria:**
- 1+ month of data per symbol
- Hourly candles
- Realistic price movements
- CSV format
- Loads correctly into backtest engine

**Files to Create:**
- `AlgotradingBot/src/main/resources/sample-btc-eth-data.csv`

---

### Task 4.11: Walk-Forward Validation Implementation
**Status:** not_started
**Estimated Time:** 60 minutes

Implement walk-forward validation in BacktestEngine:
- Split data: 80% training, 20% testing
- Run backtest on training data
- Run backtest on testing data (out-of-sample)
- Compare metrics:
  - Training Sharpe vs Testing Sharpe
  - Training Profit Factor vs Testing Profit Factor
  - Requirement: Testing ≥ 80% of Training performance
- Return WalkForwardResult with both sets of metrics

**Acceptance Criteria:**
- Data split correctly
- Both backtests run
- Metrics compared
- Validation logic correct

**Files to Create:**
- Update `BacktestEngine.java` with walk-forward method
- `AlgotradingBot/src/main/java/com/algotrader/bot/backtest/WalkForwardResult.java` (DTO)

---

### Task 4.12: Phase 4 Integration Test
**Status:** not_started
**Estimated Time:** 60 minutes

Create comprehensive integration test:
- Load sample historical data
- Run full backtest
- Calculate all metrics
- Run Monte Carlo simulation
- Validate quality gates
- Verify results persisted to database
- Generate validation report

**Acceptance Criteria:**
- End-to-end backtest workflow validated
- All components integrate correctly
- Database persistence verified
- Test passes consistently

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/backtest/BacktestIntegrationTest.java`

---

### Task 4.13: Phase 4 Validation
**Status:** not_started
**Estimated Time:** 45 minutes

Validate Phase 4 completion:
- Run `gradle test` - all tests must pass
- Verify 100% coverage on backtest classes
- Run `gradle clean build` - must succeed
- Run full backtest on sample data
- Verify all metrics calculated correctly
- Verify Monte Carlo simulation completes
- Verify validation report generated
- Check database for persisted results

**Acceptance Criteria:**
- All tests pass (100% success rate)
- Code coverage ≥ 100% on backtest classes
- Build succeeds without warnings
- Full backtest runs successfully
- Validation report shows PRODUCTION_READY (if strategy passes)

---

## Phase 4 Completion Checklist
- [x] BacktestConfig.java created
- [x] BacktestMetrics.java implemented
- [x] BacktestMetrics tests pass (100% coverage)
- [x] BacktestEngine.java implemented
- [x] BacktestEngine tests pass (100% coverage)
- [x] MonteCarloSimulator.java implemented
- [x] MonteCarloSimulator tests pass (100% coverage)
- [x] BacktestValidator.java implemented
- [x] BacktestValidator tests pass (100% coverage)
- [x] sample-btc-eth-data.csv created (1488 rows, 31 days of BTC/ETH data)
- [x] Walk-forward validation implemented
- [x] Integration test passes
- [x] All backtest tests pass (80/80 tests)
- [x] Full backtest runs successfully
- [x] Validation report generated

## Critical Success Factors
- **Accurate metrics calculation** - verify against manual calculations
- **Realistic simulation** - include ALL transaction costs
- **Proper validation** - ALL quality gates must pass
- **Statistical rigor** - Monte Carlo + walk-forward validation
- **No curve-fitting** - strategy must work on out-of-sample data

## Quality Gate Requirements (ALL must pass)
- ✅ Sharpe Ratio > 1.0
- ✅ Profit Factor > 1.5
- ✅ Win Rate 45-55%
- ✅ Max Drawdown < 25%
- ✅ Calmar Ratio > 1.0
- ✅ Monte Carlo confidence ≥ 95%
- ✅ Statistical significance (p-value < 0.05)
- ✅ Minimum 30 trades
- ✅ Out-of-sample performance ≥ 80% of training

## Next Phase
After Phase 4 completion, proceed to Phase 5: REST API Controller
