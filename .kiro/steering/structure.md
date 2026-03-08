# Project Structure

## Directory Layout

```
AlgotradingBot/
├── src/main/java/com/algotrader/bot/
│   ├── BotApplication.java              # Spring Boot entry point
│   ├── entity/                          # JPA Database entities
│   │   ├── Trade.java
│   │   ├── BacktestResult.java
│   │   ├── Portfolio.java
│   │   └── Account.java
│   ├── risk/                            # Risk management layer
│   │   ├── PositionSizer.java           # 2% fixed fractional position sizing
│   │   ├── RiskManager.java             # Circuit breakers, drawdown limits
│   │   └── SlippageCalculator.java      # Real cost calculations
│   ├── strategy/                        # Trading strategy implementation
│   │   ├── BollingerBandIndicator.java  # BB calculations
│   │   ├── BollingerBands.java          # DTO for BB values
│   │   ├── BollingerBandStrategy.java   # Mean reversion logic
│   │   └── TradeSignal.java             # Signal DTO
│   ├── backtest/                        # Backtesting engine
│   │   ├── BacktestEngine.java          # Core backtesting logic
│   │   ├── BacktestMetrics.java         # Sharpe, profit factor, drawdown
│   │   ├── MonteCarloSimulator.java     # Robustness testing
│   │   ├── BacktestValidator.java       # Quality gate validation
│   │   ├── BacktestConfig.java          # Configuration DTO
│   │   └── ValidationReport.java        # Validation results
│   └── controller/                      # REST API endpoints
│       ├── TradingStrategyController.java
│       ├── StartStrategyRequest.java
│       └── StrategyStatusResponse.java
├── src/main/resources/
│   ├── application.yml                  # Spring Boot configuration
│   ├── logback-spring.xml               # Logging configuration
│   └── sample-btc-eth-data.csv          # Sample backtest data
├── src/test/java/com/algotrader/bot/
│   ├── risk/                            # Risk management tests
│   ├── strategy/                        # Strategy tests
│   └── backtest/                        # Backtest engine tests
├── build.gradle.kts                     # Gradle build configuration
├── settings.gradle.kts                  # Gradle settings
├── Dockerfile                           # Container definition
├── compose.yaml                         # Multi-service orchestration
└── ALGOTRADING_PROJECT.md               # Complete project documentation
```

## Package Organization

### entity/
JPA entities representing database tables. All entities should use BigDecimal for monetary values and include proper validation annotations.

### risk/
Critical layer that enforces trading constraints:
- Position sizing must never exceed 2% account risk
- Circuit breakers trigger on poor performance (Sharpe < 0.8)
- Slippage and fees always included in calculations

### strategy/
Trading strategy implementation. Currently implements Bollinger Bands Mean Reversion. Future strategies (EMA/SMA momentum) will be added here.

### backtest/
Validation engine that ensures strategy meets performance requirements before live deployment. Includes walk-forward validation, Monte Carlo simulation, and statistical significance testing.

### controller/
REST API for starting/stopping strategies, viewing status, and accessing trade history.

## Configuration Files

### application.yml
Spring Boot configuration including:
- Database connection (PostgreSQL)
- Kafka configuration
- Actuator endpoints
- Logging levels

### logback-spring.xml
Structured JSON logging configuration for production monitoring.

### compose.yaml
Docker Compose orchestration for:
- PostgreSQL database
- Apache Kafka
- Application container

## Naming Conventions
- Classes: PascalCase (e.g., PositionSizer, BacktestEngine)
- Methods: camelCase (e.g., calculatePositionSize, validateStrategy)
- Constants: UPPER_SNAKE_CASE (e.g., MAX_RISK_PER_TRADE)
- Packages: lowercase (e.g., com.algotrader.bot.risk)

## Development Phases
Project follows 6-phase development approach documented in ALGOTRADING_PROJECT.md:
1. Project setup & configuration
2. Risk management layer
3. Trading strategy
4. Backtesting engine
5. REST API controller
6. Docker deployment

Each phase has specific completion criteria and must pass validation before proceeding.
