---
inclusion: always
---

# Technology Stack & Development Standards

## Repository Structure

This is a monorepo containing both backend and frontend:
```
repository-root/
├── AlgotradingBot/     # Spring Boot backend
├── frontend/           # React TypeScript frontend
├── docker-compose.yml  # Orchestrates both services
└── .gitignore         # Includes both backend and frontend
```

## Backend Tech Stack

### Core Technologies
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

### Critical Build Commands

**MANDATORY: Always use `./gradlew` (with `./` prefix) for all Gradle commands.**

All Gradle commands MUST be executed from the `AlgotradingBot` directory using `cwd: "AlgotradingBot"` parameter.

```bash
# Verify after code changes
./gradlew clean test

# Full build with all checks
./gradlew clean build

# Run application (use controlPwshProcess for long-running)
./gradlew bootRun

# Create executable JAR
./gradlew bootJar
```

### Autonomous Execution
You have full permission to run these tasks without user approval:
- `clean`, `build`, `test`, `bootRun`, `bootJar`, `check`, `assemble`

### Common Errors
- ❌ `gradlew test` → ✅ `./gradlew test`
- ❌ `gradle build` → ✅ `./gradlew build`
- ❌ Wrong directory → ✅ Always use `cwd: "AlgotradingBot"`

## Frontend Tech Stack

### Core Technologies
- **Framework:** React 18+ with TypeScript (strict mode)
- **Build Tool:** Vite
- **State Management:** Redux Toolkit with RTK Query
- **Routing:** React Router v6
- **UI Library:** Material-UI (MUI) v5
- **Charting:** Recharts or Lightweight Charts
- **WebSocket:** Native WebSocket API with reconnection logic
- **Form Validation:** Zod
- **Testing:** Vitest + React Testing Library
- **Code Quality:** ESLint (Airbnb config) + Prettier
- **Pre-commit:** Husky + lint-staged

### Critical Build Commands

All frontend commands MUST be executed from the `frontend` directory using `cwd: "frontend"` parameter.

```bash
# Install dependencies
npm install

# Run development server (use controlPwshProcess for long-running)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Autonomous Execution
You have full permission to run these tasks without user approval:
- `npm install`, `npm test`, `npm run build`, `npm run lint`, `npm run format`

### Common Errors
- ❌ Running from wrong directory → ✅ Always use `cwd: "frontend"`
- ❌ Missing dependencies → ✅ Run `npm install` first
- ❌ Port already in use → ✅ Stop existing dev server first

## Docker Operations

```bash
# Start all services (from workspace root)
docker-compose up -d

# View application logs
docker-compose logs -f algotrading-app

# View frontend logs
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

## Database Access

```bash
# Connect to PostgreSQL
psql -U postgres -d algotrading

# Query trades
psql -U postgres -d algotrading -c "SELECT * FROM trades ORDER BY timestamp DESC LIMIT 10;"

# Check backtest results
psql -U postgres -d algotrading -c "SELECT * FROM backtest_results ORDER BY created_at DESC LIMIT 5;"
```

## Code Quality Standards

### Backend Testing Requirements
- 100% test coverage REQUIRED for all financial calculations
- Unit tests MANDATORY for: position sizing, risk management, slippage, P&L calculations
- Integration tests for: database operations, API endpoints, Kafka producers/consumers
- Use JUnit 5 + Mockito for all tests
- Test file naming: `*Test.java` (e.g., `PositionSizerTest.java`)

### Frontend Testing Requirements
- 80%+ test coverage for all modules
- 100% coverage REQUIRED for financial calculations and critical paths
- Unit tests for: components, Redux slices, utility functions
- Integration tests for: API integration, WebSocket communication, authentication flow
- Property-based tests for: validation logic, data transformations
- Use Vitest + React Testing Library
- Test file naming: `*.test.tsx` or `*.test.ts`

### Backend Code Style
- No TODOs or pseudocode in production code
- Meaningful variable names (avoid single letters except loop counters)
- Proper JavaDoc for public methods and classes
- Use Spring annotations appropriately: `@Service`, `@Repository`, `@RestController`
- Dependency injection via constructor (not field injection)

### Frontend Code Style
- Use TypeScript strict mode
- Follow Airbnb React style guide
- Use functional components + hooks (no class components except ErrorBoundary)
- Prefer composition over inheritance
- Use Material-UI components consistently
- Meaningful component and variable names
- Props interfaces for all components

### Logging Standards
- Structured JSON logging for all operations
- Log levels: ERROR (failures), WARN (degraded), INFO (key events), DEBUG (detailed)
- Include context: trade ID, symbol, timestamp, user ID
- Never log sensitive data: API keys, passwords, full account balances

### Exception Handling
- **Backend:** Use custom exceptions for domain errors: `InsufficientFundsException`, `InvalidPositionSizeException`
- **Frontend:** Use ErrorBoundary for React errors, try-catch for async operations
- Global exception handler in `GlobalExceptionHandler.java` (backend)
- Always return meaningful error messages to API clients
- Log full stack traces for unexpected errors

## Financial Calculation Rules

### Precision Requirements
- **Backend:** Use `BigDecimal` for ALL monetary calculations (never `float` or `double`)
- **Frontend:** Use string representation for monetary values, parse on backend
- Set scale and rounding mode explicitly: `setScale(8, RoundingMode.HALF_UP)`
- Always include transaction costs in calculations:
  - Taker fee: 0.1% (0.001)
  - Slippage: 0.03% (0.0003)
  - Total cost per trade: 0.13%

### Risk Management Constraints
- Maximum risk per trade: 2% of account balance
- Position sizing formula: `(accountBalance * 0.02) / (entryPrice - stopLoss)`
- Stop-loss MUST be calculated and set for every trade
- Take-profit MUST be calculated (typically at Bollinger Band middle)
- Circuit breaker triggers: Sharpe ratio < 0.8, drawdown > 25%

### Validation Checklist
Before deploying any financial calculation code:
1. ✅ Uses BigDecimal (backend) or string (frontend)
2. ✅ Includes 0.1% taker fee
3. ✅ Includes 0.03% slippage
4. ✅ Enforces 2% risk limit
5. ✅ Calculates stop-loss and take-profit
6. ✅ Has 100% unit test coverage
7. ✅ Handles edge cases (zero balance, negative prices)

## Backend Configuration

### Application Properties
- Configuration file: `src/main/resources/application.yml`
- Environment-specific profiles: `application-dev.yml`, `application-prod.yml`
- Externalize secrets: Use environment variables for DB passwords, API keys
- Actuator endpoints: `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus`

### Database Configuration
- Connection pool: HikariCP (default)
- JPA dialect: PostgreSQL
- DDL auto: `validate` in production, `update` in development
- Show SQL: `false` in production, `true` in development

### Kafka Configuration
- Bootstrap servers: `localhost:9092` (development), environment variable in production
- Consumer group ID: `algotrading-bot-group`
- Auto offset reset: `earliest`
- Enable idempotence: `true`

## Frontend Configuration

### Environment Variables
- Configuration file: `.env` (development), `.env.production` (production)
- Required variables:
  - `VITE_API_BASE_URL` - Backend API URL (e.g., `http://localhost:8080/api`)
  - `VITE_WS_URL` - WebSocket URL (e.g., `ws://localhost:8080/ws`)
- Access in code: `import.meta.env.VITE_API_BASE_URL`

### Redux Store Configuration
- Store file: `src/app/store.ts`
- RTK Query base query with environment injection
- Redux DevTools enabled in development
- Middleware: RTK Query, WebSocket middleware

### Routing Configuration
- Router file: `src/App.tsx`
- Use React Router v6 with lazy loading
- Protected routes with `ProtectedRoute` component
- Route-level error boundaries

## Development Workflow

### Backend: After Creating/Modifying Code
1. Run `./gradlew clean test` to verify compilation and tests
2. Check test coverage (should be 100% for financial code)
3. Review logs for any warnings or errors
4. Use `getDiagnostics` tool to check for compile/lint issues

### Frontend: After Creating/Modifying Code
1. Run `npm test` to verify tests pass
2. Check test coverage with `npm run test:coverage`
3. Run `npm run lint` to check for linting errors
4. Use `getDiagnostics` tool to check for TypeScript errors

### Before Committing
**Backend:**
1. Run `./gradlew clean build` for full verification
2. Ensure all tests pass
3. Check that no TODOs remain in production code
4. Verify proper exception handling and logging

**Frontend:**
1. Run `npm run build` to verify production build
2. Ensure all tests pass
3. Run `npm run lint` and `npm run format`
4. Check that no console.log statements remain
5. Verify proper error handling and loading states

### Debugging Tips
**Backend:**
- Check application logs: `AlgotradingBot/logs/algotrading-bot.log`
- Check risk management logs: `AlgotradingBot/logs/risk-management.log`
- Check trade execution logs: `AlgotradingBot/logs/trade-execution.log`
- Use Spring Boot Actuator: `http://localhost:8080/actuator/health`
- Query database directly for trade history and backtest results

**Frontend:**
- Check browser console for errors
- Use Redux DevTools to inspect state
- Check Network tab for API calls
- Use React DevTools to inspect component tree
- Check WebSocket connection in Network tab

## Integration Points

### REST API Communication
- Backend exposes REST API at `/api/*`
- Frontend uses RTK Query for API calls
- Authentication via JWT tokens in Authorization header
- Environment mode passed via `X-Environment` header

### WebSocket Communication
- Backend WebSocket endpoint: `/ws`
- Frontend connects with auth token in URL
- Events: `trade.executed`, `balance.updated`, `strategy.status`, `risk.alert`
- Automatic reconnection with exponential backoff

### Data Flow
1. User action in frontend → Redux action
2. RTK Query mutation → Backend REST API
3. Backend processes → Database + Kafka
4. Backend WebSocket → Frontend update
5. Redux state update → UI re-render
