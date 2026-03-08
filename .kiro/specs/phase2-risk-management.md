---
title: "Phase 2: Risk Management Layer"
status: not_started
priority: critical
dependencies: ["phase1-project-setup"]
---

# Phase 2: Risk Management Layer

## Overview
Implement the critical risk management components that enforce the 2% rule, calculate realistic transaction costs, and provide circuit breaker protection. This is the most important layer - it protects capital.

## Success Criteria
- Position sizing never exceeds 2% account risk
- All transaction costs (fees + slippage) are calculated accurately
- Circuit breakers trigger on poor performance
- 100% test coverage on all financial calculations
- All calculations use BigDecimal (never float/double)

## Tasks

### Task 2.1: Position Sizer Implementation
**Status:** not_started
**Estimated Time:** 45 minutes

Create `PositionSizer.java` with:
- Method: `calculatePositionSize(BigDecimal accountBalance, BigDecimal entryPrice, BigDecimal stopLossPrice, BigDecimal riskPercentage)`
- Formula: position_size = (account * risk%) / (entry_price * stop_loss_distance)
- Validation: position size must be >= exchange minimum ($5-10)
- Validation: position size must be <= maximum per trade ($50-100)
- Return DTO with: position size, risk amount, notional value

**Key Requirements:**
- Use BigDecimal.ROUND_DOWN for all divisions
- Enforce minimum position size (exchange limits)
- Enforce maximum position size (risk limits)
- Calculate actual dollar risk amount
- Handle edge cases (stop loss = 0, negative values)

**Acceptance Criteria:**
- Calculates correct position size for $100, $500, $1000 accounts
- Never exceeds 2% risk
- Handles edge cases gracefully
- All calculations use BigDecimal

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/risk/PositionSizer.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/risk/PositionSizeResult.java` (DTO)

---

### Task 2.2: Position Sizer Unit Tests
**Status:** not_started
**Estimated Time:** 30 minutes

Create `PositionSizerTest.java` with test cases:
- Test 1: $100 account, 2% risk, $45,000 BTC entry, $44,500 stop → ~$4 position
- Test 2: $500 account, 2% risk, $3,000 ETH entry, $2,950 stop → ~$20 position
- Test 3: Edge case - stop loss equals entry price → should throw exception
- Test 4: Edge case - negative stop loss → should throw exception
- Test 5: Position size below minimum → should return minimum or skip trade
- Test 6: Position size above maximum → should cap at maximum
- Test 7: Verify BigDecimal precision (no rounding errors)

**Acceptance Criteria:**
- 100% code coverage on PositionSizer
- All edge cases handled
- Tests pass consistently

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/risk/PositionSizerTest.java`

---

### Task 2.3: Slippage Calculator Implementation
**Status:** not_started
**Estimated Time:** 30 minutes

Create `SlippageCalculator.java` with:
- Method: `calculateRealCost(BigDecimal price, BigDecimal quantity, boolean isBuy)`
- Taker fee: 0.1% (0.001)
- Slippage: 0.03% (0.0003) - 3 basis points
- Total cost multiplier: 1.0013 for buys, 0.9987 for sells
- Return DTO with: effective price, total fees, total slippage, net cost

**Key Requirements:**
- Apply fees and slippage to BOTH entry and exit
- Use BigDecimal for all calculations
- Calculate effective fill price
- Track fees separately from slippage for reporting

**Acceptance Criteria:**
- Entry at $100 → effective cost $100.13
- Exit at $105 → effective revenue $104.86
- Fees and slippage tracked separately
- All calculations use BigDecimal

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/risk/SlippageCalculator.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/risk/TransactionCost.java` (DTO)

---

### Task 2.4: Slippage Calculator Unit Tests
**Status:** not_started
**Estimated Time:** 25 minutes

Create `SlippageCalculatorTest.java` with test cases:
- Test 1: Buy $100 worth → verify effective cost $100.13
- Test 2: Sell $105 worth → verify effective revenue $104.86
- Test 3: Round-trip trade → verify total cost impact
- Test 4: Large position → verify slippage scales correctly
- Test 5: Verify BigDecimal precision

**Acceptance Criteria:**
- 100% code coverage on SlippageCalculator
- All calculations verified against manual calculations
- Tests pass consistently

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/risk/SlippageCalculatorTest.java`

---

### Task 2.5: Risk Manager Implementation
**Status:** not_started
**Estimated Time:** 60 minutes

Create `RiskManager.java` with:
- Method: `checkCircuitBreaker(Account account, List<Trade> recentTrades)`
- Calculate rolling Sharpe ratio (last 30 days)
- Trigger if Sharpe < 0.8 for 5 consecutive days
- Method: `checkDrawdown(Account account)`
- Calculate current drawdown from peak equity
- Trigger if drawdown > 25%
- Method: `canTrade(Account account)` → returns boolean + reason
- Check account status, circuit breaker, drawdown limit
- Method: `updateAccountStatus(Account account, String reason)`

**Key Requirements:**
- Circuit breaker: Sharpe < 0.8 for 5 days → STOP
- Drawdown limit: > 25% → STOP
- Account status: ACTIVE, STOPPED, CIRCUIT_BREAKER_TRIGGERED
- Log all risk events with structured JSON
- Persist status changes to database

**Acceptance Criteria:**
- Circuit breaker triggers correctly
- Drawdown limit enforced
- Account status updated in database
- All risk events logged

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/risk/RiskManager.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/risk/RiskCheckResult.java` (DTO)

---

### Task 2.6: Risk Manager Unit Tests
**Status:** not_started
**Estimated Time:** 45 minutes

Create `RiskManagerTest.java` with test cases:
- Test 1: Sharpe ratio 1.5 → trading allowed
- Test 2: Sharpe ratio 0.7 for 5 days → circuit breaker triggers
- Test 3: Drawdown 15% → trading allowed
- Test 4: Drawdown 26% → trading stopped
- Test 5: Account status STOPPED → canTrade returns false
- Test 6: Account status ACTIVE + good metrics → canTrade returns true
- Test 7: Verify account status persisted to database

**Acceptance Criteria:**
- 100% code coverage on RiskManager
- All circuit breaker scenarios tested
- Database persistence verified
- Tests pass consistently

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/risk/RiskManagerTest.java`

---

### Task 2.7: Phase 2 Integration Test
**Status:** not_started
**Estimated Time:** 30 minutes

Create integration test that validates:
- Position sizing → slippage calculation → risk check workflow
- Simulate trade: $100 account, 2% risk, BTC trade
- Verify position size calculated correctly
- Verify transaction costs applied
- Verify risk manager approves trade
- Verify all components work together

**Acceptance Criteria:**
- End-to-end risk workflow validated
- All components integrate correctly
- Test passes consistently

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/risk/RiskManagementIntegrationTest.java`

---

### Task 2.8: Phase 2 Validation
**Status:** not_started
**Estimated Time:** 20 minutes

Validate Phase 2 completion:
- Run `gradle test` - all tests must pass
- Verify 100% coverage on PositionSizer, SlippageCalculator, RiskManager
- Run `gradle clean build` - must succeed
- Manual verification: Calculate position size for $100 account
- Manual verification: Verify transaction costs for sample trade

**Acceptance Criteria:**
- All tests pass (100% success rate)
- Code coverage ≥ 100% on financial calculations
- Build succeeds without warnings
- Manual calculations match code output

---

## Phase 2 Completion Checklist
- [x] PositionSizer.java implemented
- [x] PositionSizer tests pass (100% coverage)
- [x] SlippageCalculator.java implemented
- [x] SlippageCalculator tests pass (100% coverage)
- [x] RiskManager.java implemented
- [x] RiskManager tests pass (100% coverage)
- [x] Integration test passes
- [x] gradle clean build succeeds
- [x] All risk calculations verified manually

## Critical Success Factors
- **NEVER use float or double** - only BigDecimal
- **ALWAYS include transaction costs** - 0.1% fee + 0.03% slippage
- **ENFORCE 2% rule** - position sizing must never exceed this
- **TEST EVERYTHING** - 100% coverage on financial code is mandatory

## Next Phase
After Phase 2 completion, proceed to Phase 3: Trading Strategy Implementation
