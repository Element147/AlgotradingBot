# Technology Stack

## Core Technologies
- **Language:** Java 25
- **Framework:** Spring Boot 4.0.0+
- **Build Tool:** Gradle (Kotlin DSL)
- **Database:** PostgreSQL
- **Event Streaming:** Apache Kafka
- **Circuit Breakers:** Resilience4j
- **Metrics:** Micrometer + Prometheus
- **Logging:** Logback (structured JSON)
- **Testing:** JUnit 5 + Mockito
- **Deployment:** Docker + Docker Compose

## Key Dependencies
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Actuator
- PostgreSQL JDBC Driver
- Spring Kafka
- Resilience4j Circuit Breaker
- Micrometer Registry Prometheus
- Logback Classic

## Common Commands

### Build & Test
**CRITICAL: Always use `./gradlew` (with `./` prefix) for all Gradle commands in this project.**

```bash
# Clean build
./gradlew clean build

# Run tests
./gradlew test

# Run application locally
./gradlew bootRun

# Build JAR
./gradlew bootJar

# Clean only
./gradlew clean
```

### Gradle Command Rules for Kiro
- ALWAYS use `./gradlew` instead of `gradle` or `gradlew`
- Run commands from the `AlgotradingBot` directory (use cwd parameter)
- You have full permission to run any Gradle task autonomously
- No user approval needed for: clean, build, test, bootRun, bootJar
- Always run from AlgotradingBot directory: `cwd: "AlgotradingBot"`

### Docker Operations
```bash
# Start all services (PostgreSQL, Kafka, App)
docker-compose up -d

# View logs
docker-compose logs -f algotrading-app

# Stop services
docker-compose down

# Check status
docker ps
```

### Database
```bash
# Connect to PostgreSQL
psql -U postgres -d algotrading

# View trades
psql -U postgres -d algotrading -c "SELECT * FROM trades;"
```

## Code Quality Standards
- 100% test coverage required on financial calculations
- All position sizing, risk management, and slippage calculations must be unit tested
- No TODOs or pseudocode in production code
- Structured JSON logging for all operations
- Proper exception handling with meaningful error messages

## Financial Calculation Precision
- Use BigDecimal for all monetary calculations (never float/double)
- Always include transaction costs: 0.1% taker fee + 0.03% slippage
- Position sizing must enforce 2% risk limit
- Stop-loss and take-profit must always be calculated and set
