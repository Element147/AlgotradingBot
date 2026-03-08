---
title: "Phase 5: REST API Controller"
status: completed
priority: high
dependencies: ["phase1-project-setup", "phase2-risk-management", "phase3-trading-strategy", "phase4-backtesting-engine"]
---

# Phase 5: REST API Controller

## Overview
Build a comprehensive REST API that allows external systems to start/stop trading strategies, monitor performance, view trade history, and access backtest results.

## Success Criteria
- All 5 core endpoints implemented and tested
- Proper request/response DTOs
- Error handling with meaningful messages
- Integration with all backend services
- API documentation (OpenAPI/Swagger)
- Comprehensive integration tests

## Tasks

### Task 5.1: Request/Response DTOs
**Status:** not_started
**Estimated Time:** 30 minutes

Create request/response DTOs:

**StartStrategyRequest.java:**
- initialBalance (BigDecimal)
- pairs (List<String>)
- riskPerTrade (BigDecimal - default 0.02)
- maxDrawdown (BigDecimal - default 0.25)
- Validation annotations (@NotNull, @Positive, @Size)

**StrategyStatusResponse.java:**
- accountValue (BigDecimal)
- pnl (BigDecimal)
- pnlPercent (BigDecimal)
- sharpeRatio (BigDecimal)
- maxDrawdown (BigDecimal)
- maxDrawdownPercent (BigDecimal)
- openPositions (int)
- totalTrades (int)
- winRate (BigDecimal)
- profitFactor (BigDecimal)
- status (String - ACTIVE, STOPPED, CIRCUIT_BREAKER_TRIGGERED)

**TradeHistoryResponse.java:**
- id (Long)
- pair (String)
- entryTime (LocalDateTime)
- entryPrice (BigDecimal)
- exitTime (LocalDateTime)
- exitPrice (BigDecimal)
- signal (String)
- positionSize (BigDecimal)
- riskAmount (BigDecimal)
- pnl (BigDecimal)
- feesActual (BigDecimal)
- slippageActual (BigDecimal)
- stopLoss (BigDecimal)
- takeProfit (BigDecimal)

**BacktestResultResponse.java:**
- strategyId (String)
- symbol (String)
- dateRange (String)
- initialBalance (BigDecimal)
- finalBalance (BigDecimal)
- totalReturn (BigDecimal)
- annualReturn (BigDecimal)
- sharpeRatio (BigDecimal)
- calmarRatio (BigDecimal)
- maxDrawdown (BigDecimal)
- winRate (BigDecimal)
- profitFactor (BigDecimal)
- totalTrades (int)
- winningSessions (int)
- losingSessions (int)
- validationStatus (String)

**Acceptance Criteria:**
- All DTOs created with proper validation
- Jackson annotations for JSON serialization
- Validation annotations present
- Proper naming conventions

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/StartStrategyRequest.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/StrategyStatusResponse.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/TradeHistoryResponse.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/BacktestResultResponse.java`

---

### Task 5.2: Trading Strategy Controller - Start Endpoint
**Status:** not_started
**Estimated Time:** 45 minutes

Create `TradingStrategyController.java` with:

**POST /api/strategy/start**
- Accept StartStrategyRequest
- Validate request parameters
- Create new Account entity
- Initialize Portfolio
- Start strategy execution (async)
- Return response with accountId and status

**Implementation:**
```java
@PostMapping("/start")
public ResponseEntity<Map<String, Object>> startStrategy(
    @Valid @RequestBody StartStrategyRequest request) {
    // Validate request
    // Create account
    // Initialize portfolio
    // Start strategy (async)
    // Return response
}
```

**Acceptance Criteria:**
- Endpoint accepts valid requests
- Validation errors return 400 Bad Request
- Account created in database
- Strategy starts successfully
- Returns 200 OK with accountId

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/TradingStrategyController.java`

---

### Task 5.3: Trading Strategy Controller - Status Endpoint
**Status:** not_started
**Estimated Time:** 40 minutes

Add to `TradingStrategyController.java`:

**GET /api/strategy/status**
- Optional query param: accountId (default: latest active account)
- Fetch account from database
- Calculate current metrics:
  - Current account value
  - Total PnL
  - PnL percentage
  - Sharpe ratio (rolling 30 days)
  - Max drawdown
  - Open positions count
  - Total trades
  - Win rate
  - Profit factor
- Return StrategyStatusResponse

**Implementation:**
```java
@GetMapping("/status")
public ResponseEntity<StrategyStatusResponse> getStatus(
    @RequestParam(required = false) Long accountId) {
    // Fetch account
    // Calculate metrics
    // Return response
}
```

**Acceptance Criteria:**
- Endpoint returns current status
- All metrics calculated correctly
- Returns 404 if account not found
- Returns 200 OK with status

**Files to Update:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/TradingStrategyController.java`

---

### Task 5.4: Trading Strategy Controller - Stop Endpoint
**Status:** not_started
**Estimated Time:** 35 minutes

Add to `TradingStrategyController.java`:

**POST /api/strategy/stop**
- Optional query param: accountId (default: latest active account)
- Fetch account from database
- Close all open positions
- Calculate final PnL
- Update account status to STOPPED
- Return final balance and PnL

**Implementation:**
```java
@PostMapping("/stop")
public ResponseEntity<Map<String, Object>> stopStrategy(
    @RequestParam(required = false) Long accountId) {
    // Fetch account
    // Close positions
    // Calculate final PnL
    // Update status
    // Return response
}
```

**Acceptance Criteria:**
- Endpoint stops strategy
- All positions closed
- Final PnL calculated
- Account status updated
- Returns 200 OK with final stats

**Files to Update:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/TradingStrategyController.java`

---

### Task 5.5: Trade History Endpoint
**Status:** not_started
**Estimated Time:** 40 minutes

Add to `TradingStrategyController.java`:

**GET /api/trades/history**
- Optional query params:
  - accountId (default: latest active account)
  - symbol (filter by trading pair)
  - startDate (filter by date range)
  - endDate (filter by date range)
  - limit (default: 100, max: 1000)
- Fetch trades from database with filters
- Map to TradeHistoryResponse
- Return list of trades

**Implementation:**
```java
@GetMapping("/trades/history")
public ResponseEntity<List<TradeHistoryResponse>> getTradeHistory(
    @RequestParam(required = false) Long accountId,
    @RequestParam(required = false) String symbol,
    @RequestParam(required = false) LocalDateTime startDate,
    @RequestParam(required = false) LocalDateTime endDate,
    @RequestParam(defaultValue = "100") int limit) {
    // Fetch trades with filters
    // Map to response DTOs
    // Return list
}
```

**Acceptance Criteria:**
- Endpoint returns trade history
- Filters work correctly
- Pagination/limit enforced
- Returns 200 OK with trades

**Files to Update:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/TradingStrategyController.java`

---

### Task 5.6: Backtest Results Endpoint
**Status:** not_started
**Estimated Time:** 35 minutes

Add to `TradingStrategyController.java`:

**GET /api/backtest/results**
- Optional query params:
  - strategyId (filter by strategy)
  - symbol (filter by trading pair)
  - limit (default: 10)
- Fetch backtest results from database
- Map to BacktestResultResponse
- Return list of results

**Implementation:**
```java
@GetMapping("/backtest/results")
public ResponseEntity<List<BacktestResultResponse>> getBacktestResults(
    @RequestParam(required = false) String strategyId,
    @RequestParam(required = false) String symbol,
    @RequestParam(defaultValue = "10") int limit) {
    // Fetch backtest results
    // Map to response DTOs
    // Return list
}
```

**Acceptance Criteria:**
- Endpoint returns backtest results
- Filters work correctly
- Returns 200 OK with results

**Files to Update:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/TradingStrategyController.java`

---

### Task 5.7: Global Exception Handler
**Status:** not_started
**Estimated Time:** 30 minutes

Create `GlobalExceptionHandler.java` with:
- Handle validation errors (400 Bad Request)
- Handle not found errors (404 Not Found)
- Handle business logic errors (422 Unprocessable Entity)
- Handle internal errors (500 Internal Server Error)
- Return consistent error response format:
  ```json
  {
    "timestamp": "2025-12-05T12:00:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "Initial balance must be positive",
    "path": "/api/strategy/start"
  }
  ```

**Implementation:**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(...) { }
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(...) { }
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessErrors(...) { }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleInternalErrors(...) { }
}
```

**Acceptance Criteria:**
- All exception types handled
- Consistent error format
- Proper HTTP status codes
- Meaningful error messages

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/GlobalExceptionHandler.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/ErrorResponse.java`

---

### Task 5.8: Repository Interfaces
**Status:** not_started
**Estimated Time:** 25 minutes

Create Spring Data JPA repositories:

**TradeRepository.java:**
- findByAccountId(Long accountId)
- findBySymbol(String symbol)
- findByAccountIdAndSymbol(Long accountId, String symbol)
- findByEntryTimeBetween(LocalDateTime start, LocalDateTime end)

**AccountRepository.java:**
- findByStatus(String status)
- findTopByOrderByCreatedAtDesc() - get latest account

**BacktestResultRepository.java:**
- findByStrategyId(String strategyId)
- findBySymbol(String symbol)
- findByValidationStatus(String status)

**Acceptance Criteria:**
- All repositories created
- Custom query methods defined
- Proper naming conventions

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/repository/TradeRepository.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/repository/AccountRepository.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/repository/BacktestResultRepository.java`
- `AlgotradingBot/src/main/java/com/algotrader/bot/repository/PortfolioRepository.java`

---

### Task 5.9: Service Layer
**Status:** not_started
**Estimated Time:** 60 minutes

Create `TradingStrategyService.java` with business logic:
- startStrategy(StartStrategyRequest) - create account, initialize portfolio
- stopStrategy(Long accountId) - close positions, update status
- getStatus(Long accountId) - calculate current metrics
- getTradeHistory(...) - fetch and filter trades
- getBacktestResults(...) - fetch and filter backtest results

**Key Requirements:**
- Transactional operations
- Business logic validation
- Integration with risk management layer
- Proper error handling
- Structured logging

**Acceptance Criteria:**
- All business logic implemented
- Transactions handled correctly
- Error handling in place
- Logging implemented

**Files to Create:**
- `AlgotradingBot/src/main/java/com/algotrader/bot/service/TradingStrategyService.java`

---

### Task 5.10: Controller Integration Tests
**Status:** completed
**Estimated Time:** 90 minutes

Create `TradingStrategyControllerTest.java` with:
- Test 1: POST /api/strategy/start - valid request → 200 OK
- Test 2: POST /api/strategy/start - invalid request → 400 Bad Request
- Test 3: GET /api/strategy/status - existing account → 200 OK
- Test 4: GET /api/strategy/status - non-existent account → 404 Not Found
- Test 5: POST /api/strategy/stop - existing account → 200 OK
- Test 6: GET /api/trades/history - with filters → 200 OK
- Test 7: GET /api/backtest/results - with filters → 200 OK
- Test 8: Error handling - verify error response format

**Use @SpringBootTest and MockMvc:**
```java
@SpringBootTest
@AutoConfigureMockMvc
class TradingStrategyControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testStartStrategy() throws Exception {
        mockMvc.perform(post("/api/strategy/start")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accountId").exists());
    }
}
```

**Acceptance Criteria:**
- All endpoints tested
- Success and error scenarios covered
- Integration with database verified
- Tests pass consistently

**Files to Create:**
- `AlgotradingBot/src/test/java/com/algotrader/bot/controller/TradingStrategyControllerTest.java`

---

### Task 5.11: API Documentation (Swagger/OpenAPI)
**Status:** completed
**Estimated Time:** 30 minutes

Add Swagger/OpenAPI documentation:
- Add springdoc-openapi dependency to build.gradle.kts
- Add @Operation annotations to controller methods
- Add @Schema annotations to DTOs
- Configure Swagger UI endpoint
- Test documentation at http://localhost:8080/swagger-ui.html

**Acceptance Criteria:**
- Swagger UI accessible
- All endpoints documented
- Request/response schemas visible
- Examples provided

**Files to Update:**
- `AlgotradingBot/build.gradle.kts` (add dependency)
- `AlgotradingBot/src/main/java/com/algotrader/bot/controller/TradingStrategyController.java` (add annotations)

---

### Task 5.12: Manual API Testing
**Status:** completed
**Estimated Time:** 45 minutes

Test all endpoints manually using curl or Postman:

**Test 1: Start Strategy**
```bash
curl -X POST http://localhost:8080/api/strategy/start \
  -H "Content-Type: application/json" \
  -d '{
    "initialBalance": 100,
    "pairs": ["BTC/USDT", "ETH/USDT"],
    "riskPerTrade": 0.02,
    "maxDrawdown": 0.25
  }'
```

**Test 2: Get Status**
```bash
curl http://localhost:8080/api/strategy/status
```

**Test 3: Get Trade History**
```bash
curl http://localhost:8080/api/trades/history?limit=10
```

**Test 4: Get Backtest Results**
```bash
curl http://localhost:8080/api/backtest/results
```

**Test 5: Stop Strategy**
```bash
curl -X POST http://localhost:8080/api/strategy/stop
```

**Acceptance Criteria:**
- All endpoints respond correctly
- Response format matches specification
- Error handling works
- Database updates verified

---

### Task 5.13: Phase 5 Validation
**Status:** not_started
**Estimated Time:** 30 minutes

Validate Phase 5 completion:
- Run `gradle test` - all tests must pass
- Run `gradle clean build` - must succeed
- Start application: `gradle bootRun`
- Test all endpoints manually
- Verify Swagger UI accessible
- Check database for persisted data
- Review logs for errors

**Acceptance Criteria:**
- All tests pass (100% success rate)
- Build succeeds without warnings
- All endpoints functional
- Swagger documentation complete
- Database persistence verified

---

## Phase 5 Completion Checklist
- [x] Request/Response DTOs created
- [x] TradingStrategyController.java implemented
- [x] Start strategy endpoint working
- [x] Status endpoint working
- [x] Stop strategy endpoint working
- [x] Trade history endpoint working
- [x] Backtest results endpoint working
- [x] GlobalExceptionHandler implemented
- [x] Repository interfaces created
- [x] TradingStrategyService implemented
- [x] Controller integration tests pass
- [x] Swagger/OpenAPI documentation added
- [x] Manual API testing completed
- [x] gradle clean build succeeds
- [x] All endpoints functional

## Critical Success Factors
- **Proper validation** - reject invalid requests early
- **Consistent error handling** - meaningful error messages
- **Transaction management** - ensure data consistency
- **API documentation** - Swagger UI for easy testing
- **Integration testing** - verify end-to-end workflows

## Next Phase
After Phase 5 completion, proceed to Phase 6: Docker Deployment
