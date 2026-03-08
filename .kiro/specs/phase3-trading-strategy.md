---
title: "Phase 3: Trading Strategy Implementation"
status: not_started
priority: high
dependencies: ["phase1-project-setup", "phase2-risk-management"]
---

# Phase 3: Trading Strategy Implementation

## Overview
Implement the Bollinger Bands Mean Reversion strategy with proper signal generation, entry/exit logic, and integration with the risk management layer.

## Success Criteria
- Bollinger Bands calculated correctly (20-period SMA, 2 standard deviations)
- Trade signals generated accurately (lower band bounce, middle band exit)
- Stop-loss and take-profit levels calculated
- Strategy integrates with risk management layer
- All calculations use BigDecimal
- Comprehensive unit tests with 100% coverage

## Tasks

### Task 3.1: Bollinger Bands DTO
**Status:** not_started
**Estimated Time:** 15 minutes

Create `BollingerBands.java` value object with:
- Upper band (BigDecimal)
- Middle band (SMA) (BigDecimal)
- Lower band (BigDecimal)
- Standard deviation (BigDecimal)
- Timestamp
- Immutable class (final fields, no setters)

**Acceptance Criteria:**
- Immutable DTO
- All fields use BigDecimal
- Proper toString() for logging

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/strategy/BollingerBands.java`

---

### Task 3.2: Trade Signal DTO
**Status:** not_started
**Estimated Time:** 20 minutes

Create `TradeSignal.java` with:
- Signal type (enum: BUY, SELL, HOLD)
- Symbol (String)
- Entry price (BigDecimal)
- Stop-loss price (BigDecimal)
- Take-profit price (BigDecimal)
- Signal strength (0.0-1.0)
- Timestamp
- Reason (String) - for logging/debugging

**Key Requirements:**
- Enum for signal types
- All prices use BigDecimal
- Signal strength for filtering weak signals
- Reason field for transparency

**Acceptance Criteria:**
- Proper enum for signal types
- All monetary fields use BigDecimal
- Immutable or builder pattern

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/strategy/TradeSignal.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/strategy/SignalType.java` (enum)

---

### Task 3.3: Bollinger Band Indicator Implementation
**Status:** not_started
**Estimated Time:** 60 minutes

Create `BollingerBandIndicator.java` with:
- Method: `calculate(List<BigDecimal> closePrices, int period, double stdDevMultiplier)`
- Calculate SMA (Simple Moving Average) for middle band
- Calculate standard deviation
- Upper band = SMA + (stdDev × multiplier)
- Lower band = SMA - (stdDev × multiplier)
- Default: 20-period, 2.0 standard deviations
- Return BollingerBands object

**Key Requirements:**
- Use BigDecimal for all calculations
- Handle edge cases (insufficient data, null values)
- Validate period >= 2
- Validate stdDevMultiplier > 0
- Use MathContext for precision control

**Mathematical Formulas:**
```
SMA = sum(prices) / period
variance = sum((price - SMA)²) / period
stdDev = sqrt(variance)
upperBand = SMA + (stdDev × 2)
lowerBand = SMA - (stdDev × 2)
```

**Acceptance Criteria:**
- Calculates correct SMA
- Calculates correct standard deviation
- Upper/lower bands calculated correctly
- Handles edge cases gracefully
- All calculations use BigDecimal

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/strategy/BollingerBandIndicator.java`

---

### Task 3.4: Bollinger Band Indicator Unit Tests
**Status:** not_started
**Estimated Time:** 45 minutes

Create `BollingerBandIndicatorTest.java` with test cases:
- Test 1: Known dataset → verify SMA calculation
- Test 2: Known dataset → verify standard deviation
- Test 3: Known dataset → verify upper/lower bands
- Test 4: Edge case - insufficient data (< 20 periods) → should throw exception
- Test 5: Edge case - null prices → should throw exception
- Test 6: Edge case - negative prices → should handle or throw exception
- Test 7: Verify BigDecimal precision (no rounding errors)
- Test 8: Different periods (10, 20, 50) → verify calculations

**Test Data Example:**
```
Prices: [100, 102, 101, 103, 102, 104, 103, 105, 104, 106, ...]
Expected SMA (20-period): ~103.5
Expected StdDev: ~2.5
Expected Upper Band: ~108.5
Expected Lower Band: ~98.5
```

**Acceptance Criteria:**
- 100% code coverage on BollingerBandIndicator
- All calculations verified against manual calculations
- Edge cases handled
- Tests pass consistently

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/strategy/BollingerBandIndicatorTest.java`

---

### Task 3.5: Bollinger Band Strategy Implementation
**Status:** not_started
**Estimated Time:** 90 minutes

Create `BollingerBandStrategy.java` with:
- Method: `generateSignal(List<BigDecimal> closePrices, BigDecimal currentPrice)`
- Calculate Bollinger Bands using BollingerBandIndicator
- **BUY Signal Logic:**
  - Price touches or crosses below lower band
  - Price starts bouncing back up (current price > previous price)
  - Signal strength based on distance from lower band
- **SELL Signal Logic:**
  - Price reaches middle band (take profit)
  - OR stop-loss triggered
- **Stop-Loss Calculation:**
  - Set at 2-3% below entry price
  - OR below recent swing low
- **Take-Profit Calculation:**
  - Primary: middle band
  - Secondary: 1:2 or 1:3 risk/reward ratio
- Return TradeSignal object

**Key Requirements:**
- Integrate with BollingerBandIndicator
- Calculate stop-loss and take-profit levels
- Filter weak signals (signal strength < 0.5)
- Use BigDecimal for all calculations
- Log signal generation with reason

**Signal Strength Calculation:**
```
distance = (lowerBand - currentPrice) / lowerBand
signalStrength = min(1.0, distance / 0.02)  // 2% distance = max strength
```

**Acceptance Criteria:**
- Generates BUY signals on lower band bounce
- Generates SELL signals at middle band
- Stop-loss and take-profit calculated correctly
- Weak signals filtered out
- All calculations use BigDecimal

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/strategy/BollingerBandStrategy.java`

---

### Task 3.6: Bollinger Band Strategy Unit Tests
**Status:** not_started
**Estimated Time:** 60 minutes

Create `BollingerBandStrategyTest.java` with test cases:
- Test 1: Price at lower band → BUY signal generated
- Test 2: Price above lower band → no signal
- Test 3: Price at middle band (in position) → SELL signal
- Test 4: Weak signal (small bounce) → filtered out
- Test 5: Strong signal (large bounce) → signal strength > 0.7
- Test 6: Stop-loss calculation → verify 2-3% below entry
- Test 7: Take-profit calculation → verify at middle band
- Test 8: Edge case - insufficient data → no signal
- Test 9: Integration with BollingerBandIndicator → verify workflow

**Acceptance Criteria:**
- 100% code coverage on BollingerBandStrategy
- All signal generation scenarios tested
- Stop-loss and take-profit verified
- Tests pass consistently

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/strategy/BollingerBandStrategyTest.java`

---

### Task 3.7: Strategy-Risk Integration Test
**Status:** not_started
**Estimated Time:** 45 minutes

Create integration test that validates:
- Signal generation → position sizing → risk check workflow
- Scenario 1: BUY signal generated → calculate position size → verify risk < 2%
- Scenario 2: SELL signal generated → close position → calculate PnL with fees
- Scenario 3: Stop-loss triggered → verify loss = expected risk amount
- Scenario 4: Take-profit reached → verify profit calculation

**Acceptance Criteria:**
- End-to-end strategy workflow validated
- Risk management integration verified
- All scenarios pass

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/strategy/StrategyRiskIntegrationTest.java`

---

### Task 3.8: Phase 3 Validation
**Status:** not_started
**Estimated Time:** 30 minutes

Validate Phase 3 completion:
- Run `gradle test` - all tests must pass
- Verify 100% coverage on strategy classes
- Run `gradle clean build` - must succeed
- Manual verification: Generate signals on sample data
- Manual verification: Verify stop-loss and take-profit calculations
- Code review: Ensure all calculations use BigDecimal

**Acceptance Criteria:**
- All tests pass (100% success rate)
- Code coverage ≥ 100% on strategy classes
- Build succeeds without warnings
- Manual signal generation verified

---

## Phase 3 Completion Checklist
- [x] BollingerBands.java DTO created
- [x] TradeSignal.java DTO created
- [x] BollingerBandIndicator.java implemented
- [x] BollingerBandIndicator tests pass (100% coverage)
- [x] BollingerBandStrategy.java implemented
- [x] BollingerBandStrategy tests pass (100% coverage)
- [x] Strategy-Risk integration test passes
- [x] gradle clean build succeeds
- [x] Signal generation verified manually
- [x] Stop-loss and take-profit calculations verified

## Critical Success Factors
- **Accurate Bollinger Bands calculation** - verify against known datasets
- **Proper signal filtering** - avoid false signals
- **Stop-loss ALWAYS set** - never enter trade without defined exit
- **BigDecimal precision** - no float/double calculations
- **Integration with risk layer** - position sizing must respect 2% rule

## Next Phase
After Phase 3 completion, proceed to Phase 4: Backtesting Engine
