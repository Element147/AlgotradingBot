# 🚀 ALGOTRADING BOT - Production-Grade Cryptocurrency Trading System

**Project Status:** IN DEVELOPMENT  
**Start Date:** December 5, 2025  
**Target Completion:** Phase 6 (Production Ready)  
**Initial Capital:** $100 USD  
**Scaling Target:** $100 → $10,000 (12-18 months)  

---

## 📋 PROJECT OVERVIEW

### Vision
Build a **production-grade, statistically validated, risk-aware algorithmic trading bot** that:
- ✅ Scales profitably from $100 → $10,000
- ✅ Withstands real-world slippage, fees, market gaps
- ✅ Never risks more than 2% per trade (preserve capital above all)
- ✅ Is continuously monitored, backtested, validated
- ✅ Fails safely with circuit breakers, emergency stops, alerts
- ✅ Can be deployed in Docker immediately and run 24/7

### Core Technology Stack
- **Language:** Java 25
- **Framework:** Spring Boot 4.0.0+
- **Build Tool:** Gradle
- **Database:** PostgreSQL
- **Event Streaming:** Apache Kafka
- **Circuit Breakers:** Resilience4j
- **Metrics:** Micrometer + Prometheus
- **Logging:** Logback (structured JSON)
- **Testing:** JUnit 5 + Mockito
- **Deployment:** Docker + Docker Compose
- **AI Assistant:** Local Qwen3:8B (Ollama)

### Trading Strategy
- **Strategy Name:** Bollinger Bands Mean Reversion
- **Asset Classes:** BTC/USDT, ETH/USDT (initially), expand to 5-8 pairs
- **Timeframe:** 1-hour candles
- **Entry Signal:** Price bounces off lower Bollinger Band
- **Exit Signal:** Price reaches middle band or stop-loss triggered
- **Risk Management:** 2% fixed fractional risk per trade
- **Position Sizing:** position_size = (account * 0.02) / (entry_price * stop_loss_pips)

---

## 📊 PERFORMANCE REQUIREMENTS

Strategy MUST PASS all these criteria before going live:

| Metric | Requirement | Status |
|--------|-------------|--------|
| Sharpe Ratio | > 1.0 | ⏳ Pending |
| Profit Factor | > 1.5:1 | ⏳ Pending |
| Win Rate | 45-55% | ⏳ Pending |
| Max Drawdown | < 25% | ⏳ Pending |
| Calmar Ratio | > 1.0 | ⏳ Pending |
| Statistical Significance (p-value) | < 0.05 | ⏳ Pending |
| Out-of-Sample Performance | ≥ 80% of training | ⏳ Pending |
| Monte Carlo Confidence | ≥ 95% iterations profitable | ⏳ Pending |
| Annual Return (Phase 1) | 5-10% monthly | ⏳ Pending |
| Backtest Period | 2+ years minimum | ⏳ Pending |

---

## 💰 SCALING ROADMAP

### Phase 1: Proof of Concept ($100-$500, months 1-3)
- **Strategy:** Low-volatility mean reversion on BTC/USDT, ETH/USDT
- **Expected Return:** 5-10% monthly (conservative, proven)
- **Position Size:** $50-$100 per trade
- **Max Pairs:** 2 (BTC/USDT, ETH/USDT only)
- **Risk Per Trade:** 2% fixed ($2 on $100 account)
- **Backtesting:** 2 years minimum, Sharpe > 1.0
- **Goal:** Build confidence, prove repeatability, accumulate capital

### Phase 2: Diversification & Momentum ($500-$2,000, months 4-8)
- **Add:** EMA/SMA momentum strategy on 4-hour candles
- **Expand Pairs:** BTC, ETH, BNB, SOL (3-4 pairs, 25% each)
- **Expected Return:** 5-15% monthly
- **Position Size:** $200-$400 per trade
- **Risk Per Trade:** Still 2% of account
- **Backtesting:** Out-of-sample validation mandatory
- **Goal:** Multi-pair operation, prove diversification works

### Phase 3: Portfolio Theory & Optimization ($2,000-$10,000, months 9-18)
- **Implement:** Markowitz optimal portfolio
- **Expand Pairs:** 5-8 crypto pairs
- **Micro-Leverage:** 1.2-1.5x (only after 12+ months proven success)
- **Expected Return:** 8-15% monthly
- **Position Sizing:** Volatility-adjusted
- **Risk:** 2% spread across multiple pairs
- **Backtesting:** Full out-of-sample + Monte Carlo with leverage
- **Goal:** Approach professional trader performance

### Phase 4: Advanced Strategies ($10,000+, months 18+)
- **Portfolio Margin:** Conditional leverage only after proven risk management
- **Options:** Call spreads, put spreads (if exchange supports)
- **Alternative Pairs:** Altcoins (high volatility acceptable)
- **Machine Learning:** Optional (only after manual strategies validated)
- **Expected Return:** 12-20% monthly
- **Goal:** Sustainable, profitable, scalable operation

---

## ⚠️ CRITICAL CONSTRAINTS

### Position Sizing Rules
- Minimum position: $5-$10 (above exchange minimums)
- Maximum position: $50-$100 per trade
- Maximum leverage: 1:1 ONLY (no margin, futures, options initially)
- Transaction costs: taker fee 0.1% + slippage 3 bips always included
- Cash buffer: 20-30% in stablecoins (never deploy full capital)

### Risk Management Rules
- **2% Rule:** Max loss per trade = 2% of account ($2 on $100)
- **Circuit Breaker:** Sharpe ratio < 0.8 for 5 days → disable strategy
- **Drawdown Limit:** Max 25% account drawdown → stop trading
- **Stop-Loss:** ALWAYS set, never trade without defined exit
- **Take-Profit:** 1:2 or 1:3 risk/reward minimum

### Realistic Expectations
- Monthly returns: 5-15% (NOT 50-100% hype)
- Win rate: 45-55% (realistic for mean reversion)
- Max drawdown: 15-25% during equity curve dips
- Time to scale $100 → $1,000: 6-12 months realistic
- NO over-leverage, NO overtrading, NO revenge trading

### AVOID AT ALL COSTS ❌

❌ **Curve-fitting:** Strategy works ONLY on backtest data, fails on new data
❌ **Over-optimization:** >5 parameters = overfitting guaranteed
❌ **Ignoring tail risks:** Crypto has fat tails, gaps, flash crashes
❌ **Trading illiquid pairs:** Slippage destroys edge on low-volume coins
❌ **Trading without backtesting:** GAMBLING, not trading
❌ **Over-leveraging:** Blows up account instantly

---

## 🏗️ PROJECT STRUCTURE

```
algotrading-bot/
├── build.gradle.kts                          # Gradle configuration
├── settings.gradle                       # Gradle settings
├── ALGOTRADING_PROJECT.md               # This file (project documentation)
├── src/main/java/com/algotrader.bot/
│   ├── BotApplication.java   # Spring Boot entry point
│   ├── entity/                          # JPA Database entities
│   │   ├── Trade.java
│   │   ├── BacktestResult.java
│   │   ├── Portfolio.java
│   │   └── Account.java
│   ├── risk/                            # Risk management layer
│   │   ├── PositionSizer.java
│   │   ├── RiskManager.java
│   │   └── SlippageCalculator.java
│   ├── strategy/                        # Trading strategy
│   │   ├── BollingerBandIndicator.java
│   │   ├── BollingerBands.java
│   │   ├── BollingerBandStrategy.java
│   │   └── TradeSignal.java
│   ├── backtest/                        # Backtesting engine
│   │   ├── BacktestEngine.java
│   │   ├── BacktestMetrics.java
│   │   ├── MonteCarloSimulator.java
│   │   ├── BacktestValidator.java
│   │   ├── BacktestConfig.java
│   │   └── ValidationReport.java
│   └── controller/                      # REST API
│       ├── TradingStrategyController.java
│       ├── StartStrategyRequest.java
│       └── StrategyStatusResponse.java
├── src/main/resources/
│   ├── application.yml
│   ├── logback-spring.xml
│   └── sample-btc-eth-data.csv          # Sample backtest data (1 month)
├── src/test/java/com/algotrading/
│   ├── risk/
│   │   ├── PositionSizerTest.java
│   │   ├── RiskManagerTest.java
│   │   └── SlippageCalculatorTest.java
│   ├── strategy/
│   │   └── BollingerBandStrategyTest.java
│   └── backtest/
│       └── BacktestEngineTest.java
├── Dockerfile
├── docker-compose.yml
└── .dockerignore
```

---

## 🔑 KEY FORMULAS & CALCULATIONS

### Position Sizing (2% Fixed Fractional Rule)
```
position_size = (account_balance * 0.02) / (entry_price * stop_loss_pips)

Example:
- Account: $100
- Entry Price: $45,000 (BTC)
- Stop Loss: 500 pips
- Max Risk: $100 × 0.02 = $2
- Position Size: $2 / ($45,000 × 500) = 0.0000889 BTC ≈ $4 notional

For $100 account with 2% risk:
- BTC position: ~$2-5 notional
- ETH position: ~$2-5 notional
- Cash buffer: ~$90
```

### Slippage & Fee Calculation
```
Entry Cost = entry_price × (1 + 0.001 + 0.0003)  # taker fee 0.1% + slippage 3 bips
Exit Cost = exit_price × (1 + 0.001 + 0.0003)

Example:
- Entry @ $100: $100 × 1.001003 = $100.10 (effective cost)
- Exit @ $105: $105 × 1.001003 = $105.11 (effective revenue)
- Theoretical profit: $5
- Real costs: ~$0.21
- Net profit: $4.79
```

### Sharpe Ratio (Risk-Adjusted Return)
```
Sharpe = (average_daily_return - risk_free_rate) / std_dev_daily_returns

Interpretation:
- Sharpe > 1.0 = Excess return justified by risk (GOOD)
- Sharpe > 2.0 = Excellent (rare for crypto)
- Sharpe < 0.8 = Circuit breaker triggers (disable strategy)
```

### Profit Factor (Win/Loss Ratio)
```
Profit Factor = sum_of_winning_trades / abs(sum_of_losing_trades)

Example:
- Winning trades: +$100 (5 trades × $20 avg)
- Losing trades: -$60 (3 trades × $20 avg)
- Profit Factor: $100 / $60 = 1.67 (GOOD, must be > 1.5)
```

### Max Drawdown (Peak-to-Trough Decline)
```
Max Drawdown = (Lowest Equity - Peak Equity Before Low) / Peak Equity × 100%

Example:
- Peak equity: $105
- Lowest equity: $85
- Max drawdown: ($85 - $105) / $105 = 19% (acceptable, < 25%)
```

---

## 🧪 BACKTESTING REQUIREMENTS

### Data Requirements
- **Minimum:** 2 years historical data
- **Preferred:** 3-5 years
- **Timeframe:** 1-hour OHLCV candles
- **Pairs:** BTC/USDT, ETH/USDT (initial)
- **No survivorship bias:** Use pairs that existed entire period

### Validation Methods
1. **Walk-Forward Validation:**
   - Train on year 1 (80%), test on last 6 months (20%)
   - Compare: training metrics vs testing metrics
   - Requirement: Testing ≥ 80% of training performance

2. **Monte Carlo Simulation:**
   - Shuffle 1,000 random variations of trades
   - Test robustness: Does strategy still profit in worst-case order?
   - Requirement: ≥ 95% of iterations profitable

3. **Out-of-Sample Testing:**
   - Strategy trained on 2023 data
   - Tested on 2024 data (user hasn't seen yet)
   - Requirement: Maintains edge on new data

4. **Statistical Significance (p-value):**
   - t-test on daily returns
   - Requirement: p-value < 0.05 (not random luck)

---

## 📝 REST API ENDPOINTS

### Start Trading
```bash
POST /api/strategy/start
{
  "initialBalance": 100,
  "pairs": ["BTC/USDT", "ETH/USDT"],
  "riskPerTrade": 0.02,
  "maxDrawdown": 0.25
}
Response:
{
  "status": "STARTED",
  "accountId": 123,
  "timestamp": "2025-12-05T12:00:00Z"
}
```

### Strategy Status
```bash
GET /api/strategy/status
Response:
{
  "accountValue": 105.50,
  "pnl": 5.50,
  "pnlPercent": 5.5,
  "sharpeRatio": 1.23,
  "maxDrawdown": 8.5,
  "maxDrawdownPercent": 8.5,
  "openPositions": 0,
  "totalTrades": 15,
  "winRate": 0.53,
  "profitFactor": 1.67,
  "status": "ACTIVE"
}
```

### Trade History
```bash
GET /api/trades/history
Response:
[
  {
    "id": 1,
    "pair": "BTC/USDT",
    "entryTime": "2025-12-01T10:00:00Z",
    "entryPrice": 45000,
    "exitTime": "2025-12-01T14:30:00Z",
    "exitPrice": 45500,
    "signal": "BOLLINGER_BAND_BOUNCE",
    "positionSize": 0.002,
    "riskAmount": 2.0,
    "pnl": 4.79,
    "feesActual": 0.1,
    "slippageActual": 0.11,
    "stopLoss": 44500,
    "takeProfit": 46000
  }
]
```

### Backtest Results
```bash
GET /api/backtest/results
Response:
{
  "strategyId": "BB_MEAN_REVERSION",
  "symbol": "BTC/USDT",
  "dateRange": "2023-01-01 to 2025-01-01",
  "initialBalance": 100,
  "finalBalance": 524.30,
  "totalReturn": 424.3,
  "annualReturn": 0.72,
  "sharpeRatio": 1.45,
  "calmarRatio": 2.10,
  "maxDrawdown": 0.18,
  "winRate": 0.51,
  "profitFactor": 1.87,
  "totalTrades": 247,
  "winningSessions": 126,
  "losingSessions": 121,
  "validationStatus": "PRODUCTION_READY"
}
```

### Stop Trading (Emergency)
```bash
POST /api/strategy/stop
Response:
{
  "status": "STOPPED",
  "finalBalance": 105.50,
  "finalPnl": 5.50,
  "positionsClosed": 0,
  "timestamp": "2025-12-05T12:15:00Z"
}
```

---

## 🐳 DEPLOYMENT

### Docker Commands
```bash
# Build application
gradle clean build

# Start all services (PostgreSQL, Kafka, App)
docker-compose up -d

# View logs
docker-compose logs -f algotrading-app

# Stop services
docker-compose down

# Check status
docker ps
```

### Database Initialization
```bash
# Create database (automatic with Spring Boot)
# Create tables: gradle bootRun (JPA auto-creates on startup)

# View trades
psql -U postgres -d algotrading -c "SELECT * FROM trades;"
```

---

## 🎯 SUCCESS CRITERIA

Before going LIVE (Phase 1 complete):

✅ **Code Quality:**
- [ ] All code compiles: `gradle clean build`
- [ ] All tests pass: `gradle test`
- [ ] 100% coverage on financial calculations
- [ ] No TODOs or pseudocode

✅ **Backtest Validation:**
- [ ] 2+ years historical data loaded
- [ ] Walk-forward validation passed
- [ ] Out-of-sample testing passed
- [ ] Monte Carlo simulation passed (1,000 iterations)

✅ **Strategy Performance:**
- [ ] Sharpe ratio ≥ 1.0
- [ ] Profit factor ≥ 1.5
- [ ] Win rate 45-55%
- [ ] Max drawdown ≤ 25%
- [ ] Calmar ratio ≥ 1.0
- [ ] p-value < 0.05

✅ **Risk Management:**
- [ ] 2% position sizing enforced
- [ ] Circuit breaker triggers correctly
- [ ] Stop-loss always set
- [ ] Take-profit calculated
- [ ] Slippage & fees included

✅ **Deployment:**
- [ ] Docker builds successfully
- [ ] docker-compose up works
- [ ] All services start (PostgreSQL, Kafka, App)
- [ ] REST API responds correctly
- [ ] Monitoring enabled (Prometheus)

---

## 📚 DOCUMENTATION & LEARNING

### Key References
- **Spring Boot 3.2:** https://spring.io/projects/spring-boot
- **Bollinger Bands:** https://en.wikipedia.org/wiki/Bollinger_Bands
- **Mean Reversion:** Statistical mean reversion takes 2-5 candles typically
- **Sharpe Ratio:** Risk-adjusted return metric (higher = better)
- **Monte Carlo:** Test robustness via randomized trade order

### Formulas Used
1. **Position Sizing:** position_size = (account × 0.02) / (entry_price × stop_loss_pips)
2. **Sharpe Ratio:** (avg_daily_return - risk_free_rate) / std_dev_daily_returns
3. **Max Drawdown:** (lowest_equity - peak_equity) / peak_equity × 100%
4. **Profit Factor:** sum_winning_trades / abs(sum_losing_trades)
5. **Calmar Ratio:** annual_return / max_drawdown

---

## 🤖 AI ASSISTANT INSTRUCTIONS

**When referencing this file in Continue.dev:**

1. **At Start of Each Phase:** Include this entire file in your prompt
2. **Progress Tracking:** LLM will mark checkboxes as completed
3. **Context:** LLM knows project vision, constraints, and requirements
4. **Self-Correction:** LLM checks progress against checklist
5. **Quality Gate:** LLM validates each phase before proceeding

**Prompt Template:**
```
/algo

[Include full ALGOTRADING_PROJECT.md content]

Current Phase: [X]
Current Step: [Y]

Generate: [specific class/file needed]
```

---

## ✅ PROJECT COMPLETION CHECKLIST

### PHASE 1: PROJECT SETUP & CONFIGURATION

**Build Configuration:**
- [✅ ] Step 1.1: Gradle initialized (`gradle init`)
- [✅ ] Step 1.2: build.gradle.kts created (`gradle clean build` ✅)
- [ ] Step 1.3: application.yml created
- [ ] Step 1.4: logback-spring.xml created

**Database Entities:**
- [ ] Step 1.5: Trade.java entity created
- [ ] Step 1.6: BacktestResult.java entity created
- [ ] Step 1.7: Portfolio.java entity created
- [ ] Step 1.8: Account.java entity created
- [ ] Step 1.9: Gradle clean build (`gradle clean build` ✅)

**Application Startup:**
- [ ] Step 1.10: AlgotradingBotApplication.java created
- [ ] Step 1.11: Application starts (`gradle bootRun` ✅)
- [ ] Step 1.12: Port 8080 responds

**PHASE 1 STATUS:** ⏳ Not Started

---

### PHASE 2: RISK MANAGEMENT LAYER

**Position Sizing:**
- [ ] Step 2.1: PositionSizer.java created
- [ ] Step 2.2: Position sizing tests pass
- [ ] Step 2.3: Validated for $100/$500/$1000 accounts

**Risk Management:**
- [ ] Step 2.4: RiskManager.java created
- [ ] Step 2.5: Circuit breaker logic implemented
- [ ] Step 2.6: RiskManager tests pass

**Slippage & Fees:**
- [ ] Step 2.7: SlippageCalculator.java created
- [ ] Step 2.8: Real cost calculations verified
- [ ] Step 2.9: Gradle clean build (`gradle clean build` ✅)

**PHASE 2 STATUS:** ⏳ Not Started

---

### PHASE 3: TRADING STRATEGY

**Bollinger Bands Indicator:**
- [ ] Step 3.1: BollingerBandIndicator.java created
- [ ] Step 3.2: BollingerBands DTO created
- [ ] Step 3.3: BB calculations verified

**Strategy Logic:**
- [ ] Step 3.4: BollingerBandStrategy.java created
- [ ] Step 3.5: TradeSignal DTO created
- [ ] Step 3.6: Signal generation tested
- [ ] Step 3.7: Gradle clean build (`gradle clean build` ✅)

**PHASE 3 STATUS:** ⏳ Not Started

---

### PHASE 4: BACKTESTING ENGINE

**Core Backtesting:**
- [ ] Step 4.1: BacktestEngine.java created
- [ ] Step 4.2: BacktestConfig DTO created
- [ ] Step 4.3: Walk-forward validation implemented

**Performance Metrics:**
- [ ] Step 4.4: BacktestMetrics.java created
- [ ] Step 4.5: All metrics calculated (Sharpe, Profit Factor, Drawdown, etc.)
- [ ] Step 4.6: Metrics validation tests pass

**Robustness Testing:**
- [ ] Step 4.7: MonteCarloSimulator.java created
- [ ] Step 4.8: 1,000 iteration simulations pass
- [ ] Step 4.9: Confidence levels calculated

**Quality Gate:**
- [ ] Step 4.10: BacktestValidator.java created
- [ ] Step 4.11: Full validation performed
- [ ] Step 4.12: Strategy validated (PRODUCTION_READY status)

**Sample Data:**
- [ ] Step 4.13: sample-btc-eth-data.csv created
- [ ] Step 4.14: 1+ month historical data included
- [ ] Step 4.15: Gradle clean build (`gradle clean build` ✅)

**PHASE 4 STATUS:** ⏳ Not Started

---

### PHASE 5: REST API CONTROLLER

**API Endpoints:**
- [ ] Step 5.1: TradingStrategyController.java created
- [ ] Step 5.2: StartStrategyRequest DTO created
- [ ] Step 5.3: StrategyStatusResponse DTO created
- [ ] Step 5.4: All 5 endpoints implemented

**Error Handling:**
- [ ] Step 5.5: GlobalExceptionHandler created
- [ ] Step 5.6: Proper HTTP status codes
- [ ] Step 5.7: Error responses validated

**Testing:**
- [ ] Step 5.8: Gradle clean build (`gradle clean build` ✅)
- [ ] Step 5.9: Integration tests pass
- [ ] Step 5.10: curl tests successful

**PHASE 5 STATUS:** ⏳ Not Started

---

### PHASE 6: DOCKER DEPLOYMENT

**Containerization:**
- [ ] Step 6.1: Dockerfile created
- [ ] Step 6.2: docker-compose.yml created
- [ ] Step 6.3: .dockerignore created
- [ ] Step 6.4: Application JAR builds

**Services:**
- [ ] Step 6.5: PostgreSQL service configured
- [ ] Step 6.6: Kafka service configured
- [ ] Step 6.7: Application service configured
- [ ] Step 6.8: docker-compose up successful

**Validation:**
- [ ] Step 6.9: All services start correctly
- [ ] Step 6.10: Database creates tables
- [ ] Step 6.11: REST API responds
- [ ] Step 6.12: Logs stream correctly

**PHASE 6 STATUS:** ⏳ Not Started

---

### FINAL VALIDATION: PRODUCTION READINESS

**Code Quality:**
- [ ] All tests pass: `gradle test`
- [ ] Build successful: `gradle clean build`
- [ ] No warnings or errors
- [ ] 100% test coverage on financial code

**Backtest Results:**
- [ ] Sharpe ratio ≥ 1.0 ✅
- [ ] Profit factor ≥ 1.5 ✅
- [ ] Win rate 45-55% ✅
- [ ] Max drawdown ≤ 25% ✅
- [ ] Calmar ratio ≥ 1.0 ✅
- [ ] p-value < 0.05 ✅

**Risk Management:**
- [ ] 2% position sizing enforced ✅
- [ ] Circuit breaker works ✅
- [ ] Stop-loss always set ✅
- [ ] Slippage & fees included ✅
- [ ] Cash buffer maintained ✅

**Deployment:**
- [ ] Docker runs successfully ✅
- [ ] All services healthy ✅
- [ ] Monitoring enabled ✅
- [ ] REST API responds ✅
- [ ] Logs structured JSON ✅

**OVERALL PROJECT STATUS:** ⏳ Not Started

---

## 🚀 NEXT STEPS

**To begin Phase 1, copy this prompt to Continue.dev:**

```
/algo

[Copy full ALGOTRADING_PROJECT.md content here]

STATUS: PHASE 1, STEP 1.2 - BUILD.GRADLE CONFIGURATION

Generate the complete, production-ready build.gradle file.

See PHASE 1 section for requirements.

TAKE YOUR TIME. This is critical - we get dependencies wrong, entire project fails.
```

---

**Last Updated:** December 5, 2025, 2:43 PM CET  
**Project Lead:** Luboš Klauber  
**Local AI Model:** Qwen3:8B (Ollama + RTX 1000 Ada)  
**Target Deployment:** Docker + PostgreSQL + Kafka + Spring Boot 3.2+