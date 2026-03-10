---
inclusion: always
---

# Project Structure & Architecture

## Monorepo Structure

This is a monorepo containing both backend and frontend in the same Git repository:

```
repository-root/
├── AlgotradingBot/          # Spring Boot backend
│   ├── src/main/java/       # Java source code
│   ├── src/main/resources/  # Configuration files
│   ├── src/test/java/       # Test files
│   ├── build.gradle.kts     # Gradle build config
│   ├── Dockerfile           # Backend container
│   └── logs/                # Application logs
├── frontend/                 # React TypeScript frontend
│   ├── src/                 # TypeScript source code
│   ├── public/              # Static assets
│   ├── package.json         # NPM dependencies
│   ├── vite.config.ts       # Vite build config
│   ├── tsconfig.json        # TypeScript config
│   └── Dockerfile           # Frontend container
├── AlgotradingBot/compose.yaml       # Orchestrates both services
├── .gitignore              # Includes both projects
└── README.md
```

## Backend Architecture (AlgotradingBot/)

### Working Directory
All backend operations MUST be performed from the `AlgotradingBot` directory. Use `cwd: "AlgotradingBot"` for all Gradle commands.

### Core Architecture Layers

#### 1. Entity Layer (`entity/`)
JPA entities representing database tables. When creating or modifying entities:
- Use `BigDecimal` for ALL monetary values (price, balance, profit/loss)
- Include `@Entity`, `@Table`, `@Id`, `@GeneratedValue` annotations
- Add validation annotations: `@NotNull`, `@Positive`, `@DecimalMin`
- Include `createdAt` and `updatedAt` timestamp fields
- Example: `Trade.java`, `BacktestResult.java`, `Portfolio.java`, `Account.java`

#### 2. Risk Management Layer (`risk/`)
CRITICAL financial safety layer. When working with risk components:
- Position sizing MUST enforce 2% maximum account risk
- ALL calculations MUST use `BigDecimal` with explicit scale and rounding
- ALWAYS include transaction costs: 0.1% taker fee + 0.03% slippage
- Circuit breakers MUST trigger on: Sharpe < 0.8, drawdown > 25%
- Components: `PositionSizer.java`, `RiskManager.java`, `SlippageCalculator.java`

#### 3. Strategy Layer (`strategy/`)
Trading strategy implementations. When adding strategies:
- Implement indicator calculations in separate classes (e.g., `BollingerBandIndicator.java`)
- Use DTOs for indicator values (e.g., `BollingerBands.java`)
- Strategy classes generate `TradeSignal` objects (BUY/SELL/HOLD)
- Current: Bollinger Bands Mean Reversion
- Future: EMA/SMA momentum strategies

#### 4. Backtesting Layer (`backtest/`)
Validation engine for strategy quality gates. When working with backtesting:
- `BacktestEngine.java`: Core simulation logic with realistic slippage/fees
- `BacktestMetrics.java`: Calculate Sharpe ratio, profit factor, max drawdown
- `MonteCarloSimulator.java`: Robustness testing with randomized trade sequences
- `BacktestValidator.java`: Enforce quality gates (Sharpe > 1.0, PF > 1.5, etc.)
- All strategies MUST pass validation before live deployment

#### 5. Controller Layer (`controller/`)
REST API endpoints. When creating endpoints:
- Use `@RestController` and `@RequestMapping` annotations
- Create separate request/response DTOs (e.g., `StartStrategyRequest.java`)
- Include OpenAPI/Swagger annotations for documentation
- Global exception handling in `GlobalExceptionHandler.java`
- Return meaningful error messages with proper HTTP status codes

#### 6. Repository Layer (`repository/`)
Spring Data JPA repositories. When creating repositories:
- Extend `JpaRepository<Entity, ID>`
- Use method naming conventions for queries (e.g., `findBySymbolOrderByTimestampDesc`)
- Add custom queries with `@Query` annotation when needed
- Example: `TradeRepository.java`, `BacktestResultRepository.java`

### Backend File Placement Rules

#### New Java Classes
Place in appropriate package based on responsibility:
- Database entities → `entity/`
- Risk calculations → `risk/`
- Trading logic → `strategy/`
- Backtesting → `backtest/`
- API endpoints → `controller/`
- Data access → `repository/`
- Configuration → `config/`
- Utilities → `util/`

#### Test Files
Mirror main source structure in `src/test/java/com/algotrader/bot/`:
- Test class name: `{ClassName}Test.java`
- Place in same package as class under test
- 100% coverage REQUIRED for financial calculations

#### Configuration Files
- Spring Boot config → `src/main/resources/application.yml`
- Logging config → `src/main/resources/logback-spring.xml`
- Sample data → `src/main/resources/*.csv`
- Docker → Root level `Dockerfile` and `compose.yaml`

### Backend Naming Conventions
- Classes: `PascalCase` (e.g., `PositionSizer`, `BacktestEngine`)
- Methods: `camelCase` (e.g., `calculatePositionSize`, `validateStrategy`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RISK_PER_TRADE`, `TAKER_FEE`)
- Packages: `lowercase` (e.g., `com.algotrader.bot.risk`)
- Test classes: `{ClassName}Test` (e.g., `PositionSizerTest`)

## Frontend Architecture (frontend/)

### Working Directory
All frontend operations MUST be performed from the `frontend` directory. Use `cwd: "frontend"` for all npm commands.

### Feature-Based Directory Structure

```
frontend/src/
├── app/                      # Application setup
│   ├── store.ts             # Redux store configuration
│   └── App.tsx              # Root component with routing
├── features/                # Feature modules (Redux slices + components)
│   ├── auth/               # Authentication
│   │   ├── authSlice.ts    # Redux slice
│   │   ├── authApi.ts      # RTK Query API
│   │   ├── LoginPage.tsx   # Page component
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/          # Main dashboard
│   │   ├── DashboardPage.tsx
│   │   ├── BalanceCard.tsx
│   │   ├── PerformanceCard.tsx
│   │   └── EnvironmentSwitch.tsx
│   ├── strategies/         # Strategy management
│   │   ├── strategiesApi.ts
│   │   ├── StrategiesPage.tsx
│   │   ├── StrategyCard.tsx
│   │   └── StrategyConfigModal.tsx
│   ├── trades/             # Trade history
│   │   ├── tradesApi.ts
│   │   ├── TradesPage.tsx
│   │   ├── TradeTable.tsx
│   │   └── TradeDetailsModal.tsx
│   ├── backtest/           # Backtesting
│   │   ├── backtestApi.ts
│   │   ├── BacktestPage.tsx
│   │   ├── BacktestResults.tsx
│   │   └── BacktestConfigModal.tsx
│   ├── risk/               # Risk management
│   │   ├── riskApi.ts
│   │   ├── RiskPage.tsx
│   │   ├── RiskMetrics.tsx
│   │   └── CircuitBreakerPanel.tsx
│   ├── settings/           # System settings
│   │   ├── settingsSlice.ts
│   │   ├── SettingsPage.tsx
│   │   └── ExchangeConfig.tsx
│   └── websocket/          # WebSocket integration
│       ├── websocketSlice.ts
│       ├── websocketMiddleware.ts
│       └── useWebSocket.ts
├── components/             # Shared components
│   ├── charts/            # Chart components
│   │   ├── EquityCurve.tsx
│   │   ├── DrawdownChart.tsx
│   │   └── ChartContainer.tsx
│   ├── layout/            # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   └── ErrorBoundary.tsx  # Error boundary
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useEnvironment.ts
│   ├── useNotification.ts
│   └── useDebounce.ts
├── services/               # External services
│   ├── api.ts             # Axios instance
│   ├── websocket.ts       # WebSocket client
│   └── export.ts          # CSV/PDF export
├── utils/                  # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   ├── calculations.ts
│   └── constants.ts
├── types/                  # TypeScript types
│   ├── api.types.ts
│   ├── domain.types.ts
│   └── state.types.ts
└── tests/                  # Test utilities
    ├── setup.ts
    ├── mocks/
    └── fixtures/
```

### Frontend Architecture Layers

#### 1. Features Layer (`features/`)
Feature modules containing Redux slices, RTK Query APIs, and feature-specific components:
- Each feature has its own directory
- Redux slice for local state management
- RTK Query API for backend communication
- Page components and feature-specific UI components
- Example: `auth/`, `dashboard/`, `strategies/`, `trades/`

#### 2. Components Layer (`components/`)
Shared, reusable components used across features:
- `charts/`: Chart components (EquityCurve, DrawdownChart)
- `layout/`: Layout components (AppLayout, Sidebar, Header)
- `ui/`: Basic UI components (Button, Card, Modal)
- `ErrorBoundary.tsx`: Global error boundary

#### 3. Hooks Layer (`hooks/`)
Custom React hooks for reusable logic:
- `useAuth`: Authentication state and actions
- `useEnvironment`: Environment mode (test/live)
- `useNotification`: Toast notifications
- `useDebounce`: Debounced values

#### 4. Services Layer (`services/`)
External service integrations:
- `api.ts`: Axios instance with interceptors
- `websocket.ts`: WebSocket client with reconnection
- `export.ts`: CSV/PDF export functionality

#### 5. Utils Layer (`utils/`)
Pure utility functions:
- `formatters.ts`: Format numbers, dates, currencies
- `validators.ts`: Form validation functions
- `calculations.ts`: Client-side calculations
- `constants.ts`: Application constants

#### 6. Types Layer (`types/`)
TypeScript type definitions:
- `api.types.ts`: API request/response types
- `domain.types.ts`: Domain model types (Trade, Strategy, etc.)
- `state.types.ts`: Redux state types

### Frontend File Placement Rules

#### New Components
- Feature-specific components → `features/{feature-name}/`
- Shared components → `components/{category}/`
- Page components → `features/{feature-name}/{PageName}Page.tsx`

#### Redux State Management
- Redux slices → `features/{feature-name}/{feature}Slice.ts`
- RTK Query APIs → `features/{feature-name}/{feature}Api.ts`
- Store configuration → `app/store.ts`

#### Test Files
- Co-locate with source: `{ComponentName}.test.tsx`
- Test utilities → `tests/`
- Mocks → `tests/mocks/`
- Fixtures → `tests/fixtures/`

#### Configuration Files
- Vite config → `vite.config.ts`
- TypeScript config → `tsconfig.json`
- ESLint config → `eslint.config.js`
- Environment variables → `.env`, `.env.example`

### Frontend Naming Conventions
- Components: `PascalCase` (e.g., `LoginPage`, `BalanceCard`)
- Files: Match component name (e.g., `LoginPage.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useAuth`, `useDebounce`)
- Redux slices: `camelCase` with `Slice` suffix (e.g., `authSlice`, `settingsSlice`)
- RTK Query APIs: `camelCase` with `Api` suffix (e.g., `tradesApi`, `strategiesApi`)
- Types/Interfaces: `PascalCase` (e.g., `Trade`, `Strategy`, `UserPreferences`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `MAX_RETRIES`)
- Utility functions: `camelCase` (e.g., `formatCurrency`, `validateEmail`)

### Frontend Component Structure
```tsx
// ComponentName.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography } from '@mui/material';

interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  prop1, 
  prop2 = 0 
}) => {
  // Hooks
  const dispatch = useDispatch();
  const data = useSelector(selectData);

  // Event handlers
  const handleClick = () => {
    // logic
  };

  // Render
  return (
    <Box>
      <Typography>{prop1}</Typography>
    </Box>
  );
};
```

## Dependency Injection Patterns

### Backend (Spring Boot)
Use constructor injection (NOT field injection):
```java
@Service
public class MyService {
    private final MyRepository repository;
    
    public MyService(MyRepository repository) {
        this.repository = repository;
    }
}
```

### Frontend (React)
Use props and hooks for dependency injection:
```tsx
// Pass dependencies via props
<Component apiClient={apiClient} />

// Use hooks for global dependencies
const dispatch = useDispatch();
const navigate = useNavigate();
```

## Configuration Management

### Backend
- Main config: `application.yml`
- Environment-specific: `application-{profile}.yml`
- Externalize secrets via environment variables
- Use `@Value` or `@ConfigurationProperties` for injection

### Frontend
- Environment variables: `.env`, `.env.production`
- Access via `import.meta.env.VITE_*`
- Redux store for runtime configuration
- Local storage for user preferences

## Logging Structure

### Backend
- Application logs: `logs/algotrading-bot.log`
- Risk management: `logs/risk-management.log`
- Trade execution: `logs/trade-execution.log`
- Use structured JSON format in production

### Frontend
- Console logging in development only
- Error tracking via Sentry (placeholder)
- Redux DevTools for state debugging
- Network tab for API debugging

## Development Phases

### Backend Phases
Project follows 6-phase approach (see `ALGOTRADING_PROJECT.md`):
1. Project setup & configuration
2. Risk management layer
3. Trading strategy
4. Backtesting engine
5. REST API controller
6. Docker deployment

### Frontend Phases
Project follows 13-phase approach (see `.kiro/specs/frontend-dashboard/`):
1. Project setup & authentication
2. Core layout & dashboard
3. Strategy management
4. Trade history & details
5. Backtest visualization
6. Risk management
7. Settings & exchange config
8. Charts & visualization
9. Performance optimization
10. Security hardening
11. Accessibility compliance
12. Testing & documentation
13. Deployment & monitoring

Each phase has completion criteria and validation requirements.

## Integration Architecture

### REST API Communication
- Backend: Spring Boot REST controllers at `/api/*`
- Frontend: RTK Query for API calls
- Authentication: JWT tokens in Authorization header
- Environment mode: `X-Environment` header (test/live)

### WebSocket Communication
- Backend: WebSocket endpoint at `/ws`
- Frontend: Native WebSocket with reconnection logic
- Events: `trade.executed`, `balance.updated`, `strategy.status`, `risk.alert`
- Automatic reconnection with exponential backoff

### Data Flow
1. User action in frontend → Redux action
2. RTK Query mutation → Backend REST API
3. Backend processes → Database + Kafka
4. Backend WebSocket → Frontend update
5. Redux state update → UI re-render

## Update Instructions

**IMPORTANT:** These steering documents should be updated after completing each phase:

### After Backend Phase Completion
Update `structure.md` if:
- New packages or layers are added
- New architectural patterns are introduced
- File organization changes

### After Frontend Phase Completion
Update both `tech.md` and `structure.md` if:
- New libraries or dependencies are added
- New features or modules are implemented
- Directory structure changes
- New architectural patterns are introduced

### When to Update
- After Phase 1 (Authentication): Update with actual auth implementation details
- After Phase 2 (Dashboard): Update with dashboard structure
- After Phase 3-7: Update as new features are added
- After Phase 8-13: Update with optimization, security, and deployment details


