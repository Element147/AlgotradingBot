# Design Document: Frontend Dashboard

## Overview

The Frontend Dashboard is a production-grade React TypeScript single-page application (SPA) that provides real-time monitoring, strategy management, trade analytics, and risk management for the algorithmic trading bot system. The dashboard connects to a Spring Boot backend via REST APIs and WebSocket for live updates.

**Repository Structure:**

The frontend will be created in a separate `frontend/` directory within the same Git repository as the backend:

```
repository-root/
├── AlgotradingBot/          # Spring Boot backend
│   ├── src/
│   ├── build.gradle.kts
│   ├── Dockerfile
│   └── ...
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── ...
├── AlgotradingBot/compose.yaml       # Orchestrates both frontend and backend
├── .gitignore               # Includes frontend/node_modules, frontend/dist
└── README.md
```

This monorepo structure allows for:
- Coordinated development of frontend and backend
- Shared version control and branching
- Unified CI/CD pipeline
- Easier integration testing
- Single deployment configuration

### Key Features

- Dual environment support (Test/Backtest and Live Trading modes)
- Real-time data updates via WebSocket
- Multi-exchange integration (Binance, Coinbase, Kraken)
- Comprehensive strategy management and configuration
- Advanced trade analytics and backtest visualization
- Risk monitoring and circuit breaker management
- Responsive design for mobile, tablet, and desktop
- Comprehensive integration testing framework

### Technology Stack

- **Framework**: React 18+ with TypeScript (strict mode)
- **Build Tool**: Vite
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v7
- **UI Library**: Material UI (MUI) v7
- **Charting**: Recharts or Lightweight Charts
- **WebSocket**: Native WebSocket API with reconnection logic
- **Testing**: Vitest, React Testing Library, Playwright
- **Code Quality**: ESLint (Airbnb config), Prettier, TypeScript strict mode


## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages/     │  │  Components  │  │   Hooks      │      │
│  │   Routes     │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│  ┌─────────────────────────┴──────────────────────────┐     │
│  │           Redux Store (State Management)           │     │
│  │  ┌──────────────┐  ┌──────────────┐               │     │
│  │  │  RTK Query   │  │    Slices    │               │     │
│  │  │  (API Cache) │  │  (UI State)  │               │     │
│  │  └──────┬───────┘  └──────────────┘               │     │
│  └─────────┼──────────────────────────────────────────┘     │
│            │                                                 │
└────────────┼─────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌─────▼──────┐
│  REST  │      │  WebSocket │
│  API   │      │  Service   │
└───┬────┘      └─────┬──────┘
    │                 │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  Spring Boot    │
    │  Backend API    │
    └─────────────────┘
```

### Component Architecture

The application follows a feature-based directory structure with clear separation of concerns:

```
src/
├── app/                    # Application setup
│   ├── store.ts           # Redux store configuration
│   └── App.tsx            # Root component with routing
├── features/              # Feature modules
│   ├── auth/             # Authentication
│   │   ├── authSlice.ts
│   │   ├── authApi.ts
│   │   ├── LoginPage.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/        # Main dashboard
│   │   ├── DashboardPage.tsx
│   │   ├── BalanceCard.tsx
│   │   ├── PerformanceCard.tsx
│   │   └── EnvironmentSwitch.tsx
│   ├── strategies/       # Strategy management
│   │   ├── strategiesApi.ts
│   │   ├── StrategiesPage.tsx
│   │   ├── StrategyCard.tsx
│   │   └── StrategyConfigModal.tsx
│   ├── trades/           # Trade history
│   │   ├── tradesApi.ts
│   │   ├── TradesPage.tsx
│   │   ├── TradeTable.tsx
│   │   └── TradeDetailsModal.tsx
│   ├── backtest/         # Backtesting
│   │   ├── backtestApi.ts
│   │   ├── BacktestPage.tsx
│   │   ├── BacktestResults.tsx
│   │   └── BacktestConfigModal.tsx
│   ├── risk/             # Risk management
│   │   ├── riskApi.ts
│   │   ├── RiskPage.tsx
│   │   ├── RiskMetrics.tsx
│   │   └── CircuitBreakerPanel.tsx
│   ├── settings/         # System settings
│   │   ├── settingsSlice.ts
│   │   ├── SettingsPage.tsx
│   │   └── ExchangeConfig.tsx
│   └── websocket/        # WebSocket integration
│       ├── websocketSlice.ts
│       ├── websocketMiddleware.ts
│       └── useWebSocket.ts
├── components/           # Shared components
│   ├── charts/
│   │   ├── EquityCurve.tsx
│   │   ├── DrawdownChart.tsx
│   │   └── ChartContainer.tsx
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   └── ErrorBoundary.tsx
├── hooks/                # Custom hooks
│   ├── useAuth.ts
│   ├── useEnvironment.ts
│   ├── useNotification.ts
│   └── useDebounce.ts
├── services/             # External services
│   ├── api.ts           # Axios instance
│   ├── websocket.ts     # WebSocket client
│   └── export.ts        # CSV/PDF export
├── utils/                # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   ├── calculations.ts
│   └── constants.ts
├── types/                # TypeScript types
│   ├── api.types.ts
│   ├── domain.types.ts
│   └── state.types.ts
└── tests/                # Test utilities
    ├── setup.ts
    ├── mocks/
    └── fixtures/
```


### Environment Switching Architecture

The dashboard supports two distinct operating modes:

1. **Test/Backtest Environment**: Displays simulated trading data for strategy validation
2. **Live Trading Environment**: Displays real trading data from connected exchanges

#### State Management

```typescript
// Environment state in Redux
interface EnvironmentState {
  mode: 'test' | 'live';
  connectedExchange: string | null; // 'binance' | 'coinbase' | 'kraken'
  lastSyncTime: string | null;
}

// Environment slice
const environmentSlice = createSlice({
  name: 'environment',
  initialState: {
    mode: 'test', // Default to safe mode
    connectedExchange: null,
    lastSyncTime: null,
  },
  reducers: {
    setEnvironmentMode: (state, action: PayloadAction<'test' | 'live'>) => {
      state.mode = action.payload;
      // Persist to localStorage
      localStorage.setItem('environment_mode', action.payload);
    },
    setConnectedExchange: (state, action: PayloadAction<string>) => {
      state.connectedExchange = action.payload;
    },
    updateSyncTime: (state) => {
      state.lastSyncTime = new Date().toISOString();
    },
  },
});
```

#### API Routing Strategy

All API calls include the environment mode as a query parameter or header:

```typescript
// RTK Query base query with environment injection
const baseQueryWithEnvironment = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    const environment = state.environment.mode;
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('X-Environment', environment);
    return headers;
  },
});

// Example API endpoint with environment-specific routing
export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: baseQueryWithEnvironment,
  endpoints: (builder) => ({
    getBalance: builder.query<BalanceResponse, void>({
      query: () => {
        // Backend routes to appropriate service based on X-Environment header
        return '/api/account/balance';
      },
    }),
  }),
});
```

#### WebSocket Channel Management

WebSocket connections are environment-aware:

```typescript
class WebSocketService {
  private connections: Map<string, WebSocket> = new Map();
  
  connect(environment: 'test' | 'live', token: string) {
    const wsUrl = `${import.meta.env.VITE_WS_URL}?env=${environment}&token=${token}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      // Subscribe to environment-specific channels
      ws.send(JSON.stringify({
        type: 'subscribe',
        channels: [
          `${environment}.balance`,
          `${environment}.trades`,
          `${environment}.positions`,
          `${environment}.strategies`,
        ],
      }));
    };
    
    this.connections.set(environment, ws);
    return ws;
  }
  
  switchEnvironment(newEnvironment: 'test' | 'live', token: string) {
    // Close existing connections
    this.connections.forEach((ws) => ws.close());
    this.connections.clear();
    
    // Establish new connection for the new environment
    return this.connect(newEnvironment, token);
  }
}
```

#### Local Storage Persistence

```typescript
// On app initialization
const initializeEnvironment = (): EnvironmentState => {
  const savedMode = localStorage.getItem('environment_mode') as 'test' | 'live' | null;
  return {
    mode: savedMode || 'test', // Default to test for safety
    connectedExchange: null,
    lastSyncTime: null,
  };
};

// Environment switch component
const EnvironmentSwitch: React.FC = () => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state: RootState) => state.environment.mode);
  
  const handleSwitch = (newMode: 'test' | 'live') => {
    // Show confirmation dialog
    if (window.confirm(`Switch to ${newMode} environment? This will reload all data.`)) {
      dispatch(setEnvironmentMode(newMode));
      // Trigger data refetch
      dispatch(accountApi.util.invalidateTags(['Balance', 'Positions', 'Trades']));
    }
  };
  
  return (
    <ToggleButtonGroup value={currentMode} exclusive onChange={(_, value) => handleSwitch(value)}>
      <ToggleButton value="test">
        <TestIcon /> Test/Backtest
      </ToggleButton>
      <ToggleButton value="live">
        <LiveIcon /> Live Trading
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
```


## Components and Interfaces

### Core Components

#### 1. Authentication Components

**LoginPage Component**
```typescript
interface LoginPageProps {}

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

// Handles user authentication, token storage, and session management
// Validates credentials, displays errors, and redirects on success
```

**ProtectedRoute Component**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'trader';
}

// Guards routes requiring authentication
// Redirects to login if no valid token
// Checks role-based access control
```

#### 2. Dashboard Components

**DashboardPage Component**
```typescript
interface DashboardPageProps {}

// Main landing page displaying:
// - Environment switch toggle
// - Account balance card
// - Performance metrics
// - Open positions list
// - Recent trades list
// - System health indicator
```

**EnvironmentSwitch Component**
```typescript
interface EnvironmentSwitchProps {
  onSwitch?: (mode: 'test' | 'live') => void;
}

// Toggle between test and live environments
// Shows confirmation dialog on switch
// Displays current environment badge
// Persists selection to localStorage
```

**BalanceCard Component**
```typescript
interface BalanceCardProps {
  environment: 'test' | 'live';
}

interface BalanceData {
  total: string;
  available: string;
  locked: string;
  assets: Array<{
    symbol: string;
    amount: string;
    valueUSD: string;
  }>;
  lastSync: string;
}

// Displays account balance based on environment
// Shows breakdown by asset
// Provides manual refresh button
// Auto-refreshes every 60 seconds in live mode
```

**PerformanceCard Component**
```typescript
interface PerformanceCardProps {
  timeframe: 'today' | 'week' | 'month' | 'all';
}

interface PerformanceMetrics {
  totalProfitLoss: string;
  profitLossPercentage: string;
  winRate: string;
  tradeCount: number;
  cashRatio: string;
}

// Displays profit/loss metrics
// Color-codes positive (green) and negative (red)
// Shows cash to invested capital ratio
```

#### 3. Strategy Management Components

**StrategiesPage Component**
```typescript
interface StrategiesPageProps {}

// Lists all available strategies
// Displays status badges (RUNNING, STOPPED, ERROR)
// Provides start/stop controls
// Shows real-time metrics for running strategies
```

**StrategyCard Component**
```typescript
interface StrategyCardProps {
  strategy: Strategy;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onConfigure: (id: string) => void;
}

interface Strategy {
  id: string;
  name: string;
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  profitLoss: string;
  tradeCount: number;
  currentDrawdown: string;
  configuration: StrategyConfig;
}

// Individual strategy display card
// Shows status, metrics, and controls
// Handles start/stop with confirmation
```

**StrategyConfigModal Component**
```typescript
interface StrategyConfigModalProps {
  strategy: Strategy;
  open: boolean;
  onClose: () => void;
  onSave: (config: StrategyConfig) => void;
}

interface StrategyConfig {
  symbol: string;
  timeframe: string;
  riskPerTrade: number; // 1-5%
  minPositionSize: number;
  maxPositionSize: number;
}

// Configuration modal with form validation
// Validates risk percentage (1-5%)
// Validates position sizes (positive numbers)
// Stops strategy before applying changes if running
```

#### 4. Trade History Components

**TradesPage Component**
```typescript
interface TradesPageProps {}

// Paginated trade history table
// Filter controls (date, symbol, status, strategy)
// Search by trade ID
// Export to CSV functionality
// Aggregate statistics display
```

**TradeTable Component**
```typescript
interface TradeTableProps {
  trades: Trade[];
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onRowClick: (tradeId: string) => void;
}

interface Trade {
  id: string;
  timestamp: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  profitLoss: string;
  profitLossPercentage: string;
  duration: string;
  strategyName: string;
}

// Sortable table with 50 trades per page
// Click row to view details
// Color-coded profit/loss
```

**TradeDetailsModal Component**
```typescript
interface TradeDetailsModalProps {
  tradeId: string;
  open: boolean;
  onClose: () => void;
}

interface TradeDetails extends Trade {
  entryReason: string;
  exitReason: string;
  slippage: string;
  fees: string;
  riskMetrics: {
    rMultiple: number;
    riskAmount: string;
    rewardAmount: string;
  };
  priceChart: ChartData;
}

// Detailed trade information modal
// Shows entry/exit reasons
// Displays slippage and fees breakdown
// Calculates R-multiple
// Shows price action chart during trade
```

#### 5. Backtest Components

**BacktestPage Component**
```typescript
interface BacktestPageProps {}

// Lists backtest results with validation status
// "Run New Backtest" button
// Color-coded validation (green=PASSED, red=FAILED, yellow=PENDING)
```

**BacktestResults Component**
```typescript
interface BacktestResultsProps {
  backtestId: string;
}

interface BacktestResult {
  id: string;
  date: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  validationStatus: 'PASSED' | 'FAILED' | 'PENDING';
  metrics: BacktestMetrics;
  equityCurve: ChartData;
  drawdownCurve: ChartData;
  monthlyReturns: HeatmapData;
  tradeDistribution: HistogramData;
  monteCarloResults?: MonteCarloData;
  walkForwardResults?: WalkForwardData;
}

interface BacktestMetrics {
  sharpeRatio: number;
  profitFactor: number;
  winRate: number;
  maxDrawdown: number;
  totalTrades: number;
  averageWin: string;
  averageLoss: string;
}

// Comprehensive backtest visualization
// Performance metrics table
// Multiple chart types
// Export to PDF functionality
```

**BacktestConfigModal Component**
```typescript
interface BacktestConfigModalProps {
  open: boolean;
  onClose: () => void;
  onRun: (config: BacktestConfig) => void;
}

interface BacktestConfig {
  strategyId: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialBalance: number; // > 100
}

// Backtest configuration form
// Validates start date < end date
// Validates initial balance > 100
// Polls for results after submission
```

#### 6. Risk Management Components

**RiskPage Component**
```typescript
interface RiskPageProps {}

// Risk metrics dashboard
// Circuit breaker management
// Position sizing calculator
// Risk configuration form
// Risk alerts log
```

**RiskMetrics Component**
```typescript
interface RiskMetricsProps {}

interface RiskMetrics {
  currentDrawdown: number;
  maxDrawdownLimit: number;
  dailyLoss: number;
  dailyLossLimit: number;
  openRiskExposure: number;
  positionCorrelation: number;
}

// Visual risk metric displays with progress bars
// Color-coded: green (safe), yellow (warning), red (danger)
// Auto-updates via WebSocket
// Refreshes every 30 seconds
```

**CircuitBreakerPanel Component**
```typescript
interface CircuitBreakerPanelProps {}

interface CircuitBreaker {
  id: string;
  triggerCondition: string;
  activationTime: string;
  resetTime: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// Lists active circuit breakers
// Manual override with password confirmation
// Displays risk alerts log
```

**PositionSizingCalculator Component**
```typescript
interface PositionSizingCalculatorProps {}

interface PositionSizeInputs {
  accountBalance: string;
  riskPercentage: number; // 0.1-5%
  stopLossDistance: string;
}

interface PositionSizeResult {
  positionSize: string; // units
  positionValue: string; // USD
}

// Interactive calculator widget
// Real-time calculation on input change
// Validates risk percentage (0.1-5%)
// Uses BigDecimal precision
```


#### 7. Chart Components

**EquityCurve Component**
```typescript
interface EquityCurveProps {
  data: ChartData;
  timeframe: '1d' | '1w' | '1m' | '3m' | '1y' | 'all';
  onTimeframeChange: (timeframe: string) => void;
}

interface ChartData {
  timestamps: string[];
  values: number[];
}

// Line chart showing account balance over time
// Timeframe selection buttons
// Hover tooltips with exact values
// Theme-aware color scheme
// Zoom and pan for large datasets
```

**DrawdownChart Component**
```typescript
interface DrawdownChartProps {
  data: ChartData;
  maxDrawdownLimit: number;
}

// Area chart showing drawdown percentage
// Horizontal line for max limit
// Color-coded danger zones
```

**ChartContainer Component**
```typescript
interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  onExport?: () => void;
}

// Wrapper for all charts
// Handles loading states
// Displays errors
// Provides export functionality
```

#### 8. Layout Components

**AppLayout Component**
```typescript
interface AppLayoutProps {
  children: React.ReactNode;
}

// Main application layout
// Responsive sidebar navigation
// Header with user menu
// Footer with system info
// Hamburger menu for mobile
```

**Sidebar Component**
```typescript
interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

// Navigation menu
// Collapses on mobile
// Active route highlighting
// Environment indicator
```

**Header Component**
```typescript
interface HeaderProps {
  onMenuClick: () => void;
}

// Top navigation bar
// User profile menu
// Notifications bell
// Theme toggle
// Logout button
```

#### 9. Shared UI Components

**Button Component**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// Reusable button with consistent styling
// Loading state with spinner
// Disabled state
// Accessible (keyboard, ARIA)
```

**Modal Component**
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

// Reusable modal dialog
// Backdrop click to close
// ESC key to close
// Focus trap
// ARIA labels
```

**Notification Component**
```typescript
interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // milliseconds
  onClose: () => void;
}

// Toast notification
// Auto-dismiss for success/info (5s)
// Manual dismiss for error/warning
// Stacks vertically (max 5)
// Sound for high-priority
```

### API Interfaces

#### REST API Endpoints

```typescript
// Authentication
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me

// Account
GET    /api/account/balance
GET    /api/account/performance

// Strategies
GET    /api/strategies
POST   /api/strategies/start
POST   /api/strategies/stop
PUT    /api/strategies/config
GET    /api/strategies/{id}

// Trades
GET    /api/trades/history
GET    /api/trades/{id}
GET    /api/trades/statistics

// Backtest
GET    /api/backtest/results
GET    /api/backtest/{id}
POST   /api/backtest/run

// Risk
GET    /api/risk/status
GET    /api/risk/config
PUT    /api/risk/config
POST   /api/risk/circuit-breaker/override

// Exchange
GET    /api/exchange/balance
GET    /api/exchange/orders
POST   /api/exchange/test-connection

// System
GET    /api/system/health
GET    /api/system/info
POST   /api/system/backup
POST   /api/system/test-connection
```

#### WebSocket Events

```typescript
// Event types
interface WebSocketEvent {
  type: string;
  environment: 'test' | 'live';
  timestamp: string;
  data: unknown;
}

// Balance update
interface BalanceUpdateEvent extends WebSocketEvent {
  type: 'balance.updated';
  data: {
    total: string;
    available: string;
    locked: string;
  };
}

// Trade executed
interface TradeExecutedEvent extends WebSocketEvent {
  type: 'trade.executed';
  data: Trade;
}

// Position updated
interface PositionUpdatedEvent extends WebSocketEvent {
  type: 'position.updated';
  data: {
    positionId: string;
    currentPrice: string;
    unrealizedPnL: string;
  };
}

// Strategy status
interface StrategyStatusEvent extends WebSocketEvent {
  type: 'strategy.status';
  data: {
    strategyId: string;
    status: 'RUNNING' | 'STOPPED' | 'ERROR';
    message?: string;
  };
}

// Risk alert
interface RiskAlertEvent extends WebSocketEvent {
  type: 'risk.alert';
  data: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    metric: string;
    value: number;
    threshold: number;
  };
}

// System error
interface SystemErrorEvent extends WebSocketEvent {
  type: 'system.error';
  data: {
    code: string;
    message: string;
    details?: string;
  };
}
```

### Exchange Integration Interfaces

```typescript
// Exchange configuration
interface ExchangeConfig {
  name: 'binance' | 'coinbase' | 'kraken';
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
  rateLimits: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
}

// Exchange balance response
interface ExchangeBalanceResponse {
  exchange: string;
  timestamp: string;
  balances: Array<{
    asset: string;
    free: string;
    locked: string;
    total: string;
  }>;
  totalValueUSD: string;
}

// Exchange connection status
interface ExchangeConnectionStatus {
  connected: boolean;
  exchange: string;
  lastSync: string;
  rateLimitUsage: {
    used: number;
    limit: number;
    resetTime: string;
  };
  error?: string;
}
```


## Data Models

### Redux Store Structure

```typescript
interface RootState {
  auth: AuthState;
  environment: EnvironmentState;
  settings: SettingsState;
  websocket: WebSocketState;
  notifications: NotificationState;
  // RTK Query API slices
  [accountApi.reducerPath]: ReturnType<typeof accountApi.reducer>;
  [strategiesApi.reducerPath]: ReturnType<typeof strategiesApi.reducer>;
  [tradesApi.reducerPath]: ReturnType<typeof tradesApi.reducer>;
  [backtestApi.reducerPath]: ReturnType<typeof backtestApi.reducer>;
  [riskApi.reducerPath]: ReturnType<typeof riskApi.reducer>;
  [exchangeApi.reducerPath]: ReturnType<typeof exchangeApi.reducer>;
}
```

### State Slices

#### Auth State
```typescript
interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  sessionExpiry: string | null;
  lastActivity: string | null;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'trader';
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  currency: 'USD' | 'BTC';
  timezone: string;
  notifications: {
    email: boolean;
    telegram: boolean;
    thresholds: {
      profitLoss: number;
      drawdown: number;
    };
  };
}
```

#### Environment State
```typescript
interface EnvironmentState {
  mode: 'test' | 'live';
  connectedExchange: string | null;
  lastSyncTime: string | null;
  switchInProgress: boolean;
}
```

#### Settings State
```typescript
interface SettingsState {
  theme: 'light' | 'dark';
  currency: 'USD' | 'BTC';
  timezone: string;
  language: string;
  notifications: NotificationSettings;
}

interface NotificationSettings {
  emailAlerts: boolean;
  telegramNotifications: boolean;
  soundEnabled: boolean;
  thresholds: {
    profitLoss: number;
    drawdown: number;
    riskAlert: number;
  };
}
```

#### WebSocket State
```typescript
interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastReconnectAttempt: string | null;
  reconnectAttempts: number;
  subscribedChannels: string[];
  lastEventTime: string | null;
}
```

#### Notification State
```typescript
interface NotificationState {
  notifications: Notification[];
  history: Notification[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  dismissed: boolean;
  priority: 'low' | 'medium' | 'high';
}
```

### Domain Models

#### Strategy Models
```typescript
interface Strategy {
  id: string;
  name: string;
  type: 'BOLLINGER_BANDS' | 'EMA_CROSSOVER' | 'CUSTOM';
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  configuration: StrategyConfiguration;
  metrics: StrategyMetrics;
  createdAt: string;
  updatedAt: string;
}

interface StrategyConfiguration {
  symbol: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  riskPerTrade: number; // 1-5%
  minPositionSize: number;
  maxPositionSize: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  // Strategy-specific parameters
  parameters: Record<string, unknown>;
}

interface StrategyMetrics {
  totalTrades: number;
  profitLoss: string;
  profitLossPercentage: string;
  winRate: number;
  currentDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  averageWin: string;
  averageLoss: string;
  largestWin: string;
  largestLoss: string;
}
```

#### Trade Models
```typescript
interface Trade {
  id: string;
  strategyId: string;
  strategyName: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  entryTime: string;
  exitTime: string;
  duration: string;
  profitLoss: string;
  profitLossPercentage: string;
  fees: string;
  slippage: string;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  entryReason: string;
  exitReason: string;
  riskMetrics: TradeRiskMetrics;
}

interface TradeRiskMetrics {
  riskAmount: string;
  rewardAmount: string;
  rMultiple: number;
  stopLossPrice: string;
  takeProfitPrice: string;
  positionSizePercentage: number;
}

interface Position extends Omit<Trade, 'exitPrice' | 'exitTime' | 'profitLoss'> {
  currentPrice: string;
  unrealizedPnL: string;
  unrealizedPnLPercentage: string;
}
```

#### Backtest Models
```typescript
interface BacktestResult {
  id: string;
  strategyId: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialBalance: string;
  finalBalance: string;
  validationStatus: 'PASSED' | 'FAILED' | 'PENDING';
  metrics: BacktestMetrics;
  trades: Trade[];
  equityCurve: TimeSeriesData;
  drawdownCurve: TimeSeriesData;
  monthlyReturns: MonthlyReturnsData;
  tradeDistribution: DistributionData;
  monteCarloResults?: MonteCarloResults;
  walkForwardResults?: WalkForwardResults;
  createdAt: string;
}

interface BacktestMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownDuration: string;
  averageWin: string;
  averageLoss: string;
  largestWin: string;
  largestLoss: string;
  averageTradeDuration: string;
  expectancy: string;
  totalProfitLoss: string;
  totalProfitLossPercentage: string;
}

interface MonteCarloResults {
  simulations: number;
  confidence95: {
    minReturn: string;
    maxReturn: string;
    minDrawdown: number;
    maxDrawdown: number;
  };
  worstCaseScenario: {
    finalBalance: string;
    maxDrawdown: number;
  };
}

interface WalkForwardResults {
  inSampleMetrics: BacktestMetrics;
  outOfSampleMetrics: BacktestMetrics;
  degradationPercentage: number;
}
```

#### Risk Models
```typescript
interface RiskStatus {
  currentDrawdown: number;
  maxDrawdownLimit: number;
  dailyLoss: string;
  dailyLossPercentage: number;
  dailyLossLimit: number;
  openRiskExposure: string;
  openRiskPercentage: number;
  maxOpenRisk: number;
  openPositions: number;
  maxOpenPositions: number;
  positionCorrelation: number;
  circuitBreakers: CircuitBreaker[];
  lastUpdated: string;
}

interface CircuitBreaker {
  id: string;
  type: 'DRAWDOWN' | 'DAILY_LOSS' | 'SHARPE_RATIO' | 'MANUAL';
  status: 'ACTIVE' | 'INACTIVE';
  triggerCondition: string;
  triggerValue: number;
  threshold: number;
  activationTime: string | null;
  resetTime: string | null;
  canOverride: boolean;
}

interface RiskConfiguration {
  maxRiskPerTrade: number; // 1-5%
  maxDailyLossLimit: number; // 1-10%
  maxDrawdownLimit: number; // 10-50%
  maxOpenPositions: number; // 1-10
  maxCorrelation: number; // 0-1
  circuitBreakerThresholds: {
    drawdown: number;
    dailyLoss: number;
    sharpeRatio: number;
  };
}
```

### Chart Data Models

```typescript
interface TimeSeriesData {
  timestamps: string[];
  values: number[];
}

interface MonthlyReturnsData {
  months: string[]; // ['2024-01', '2024-02', ...]
  returns: number[]; // [5.2, -2.1, 8.5, ...]
}

interface DistributionData {
  bins: string[]; // ['-10 to -5', '-5 to 0', '0 to 5', ...]
  counts: number[]; // [2, 5, 15, ...]
}

interface HeatmapData {
  rows: string[]; // Years
  columns: string[]; // Months
  values: number[][]; // Returns matrix
}
```


### RTK Query API Slices

#### Account API
```typescript
export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['Balance', 'Performance'],
  endpoints: (builder) => ({
    getBalance: builder.query<BalanceResponse, void>({
      query: () => '/api/account/balance',
      providesTags: ['Balance'],
    }),
    getPerformance: builder.query<PerformanceResponse, PerformanceRequest>({
      query: ({ timeframe }) => `/api/account/performance?timeframe=${timeframe}`,
      providesTags: ['Performance'],
    }),
  }),
});
```

#### Strategies API
```typescript
export const strategiesApi = createApi({
  reducerPath: 'strategiesApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['Strategies', 'StrategyDetails'],
  endpoints: (builder) => ({
    getStrategies: builder.query<Strategy[], void>({
      query: () => '/api/strategies',
      providesTags: ['Strategies'],
    }),
    startStrategy: builder.mutation<void, string>({
      query: (id) => ({
        url: '/api/strategies/start',
        method: 'POST',
        body: { strategyId: id },
      }),
      invalidatesTags: ['Strategies'],
    }),
    stopStrategy: builder.mutation<void, string>({
      query: (id) => ({
        url: '/api/strategies/stop',
        method: 'POST',
        body: { strategyId: id },
      }),
      invalidatesTags: ['Strategies'],
    }),
    updateStrategyConfig: builder.mutation<void, { id: string; config: StrategyConfiguration }>({
      query: ({ id, config }) => ({
        url: '/api/strategies/config',
        method: 'PUT',
        body: { strategyId: id, configuration: config },
      }),
      invalidatesTags: ['Strategies', 'StrategyDetails'],
    }),
  }),
});
```

#### Trades API
```typescript
export const tradesApi = createApi({
  reducerPath: 'tradesApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['Trades', 'TradeDetails', 'TradeStatistics'],
  endpoints: (builder) => ({
    getTradeHistory: builder.query<TradeHistoryResponse, TradeHistoryRequest>({
      query: ({ page, pageSize, filters, sort }) => ({
        url: '/api/trades/history',
        params: { page, pageSize, ...filters, ...sort },
      }),
      providesTags: ['Trades'],
    }),
    getTradeDetails: builder.query<TradeDetails, string>({
      query: (id) => `/api/trades/${id}`,
      providesTags: (result, error, id) => [{ type: 'TradeDetails', id }],
    }),
    getTradeStatistics: builder.query<TradeStatistics, TradeStatisticsRequest>({
      query: (filters) => ({
        url: '/api/trades/statistics',
        params: filters,
      }),
      providesTags: ['TradeStatistics'],
    }),
  }),
});
```

#### Backtest API
```typescript
export const backtestApi = createApi({
  reducerPath: 'backtestApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['BacktestResults', 'BacktestDetails'],
  endpoints: (builder) => ({
    getBacktestResults: builder.query<BacktestResult[], void>({
      query: () => '/api/backtest/results',
      providesTags: ['BacktestResults'],
    }),
    getBacktestDetails: builder.query<BacktestResult, string>({
      query: (id) => `/api/backtest/${id}`,
      providesTags: (result, error, id) => [{ type: 'BacktestDetails', id }],
    }),
    runBacktest: builder.mutation<{ backtestId: string }, BacktestConfig>({
      query: (config) => ({
        url: '/api/backtest/run',
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['BacktestResults'],
    }),
  }),
});
```

#### Risk API
```typescript
export const riskApi = createApi({
  reducerPath: 'riskApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['RiskStatus', 'RiskConfig'],
  endpoints: (builder) => ({
    getRiskStatus: builder.query<RiskStatus, void>({
      query: () => '/api/risk/status',
      providesTags: ['RiskStatus'],
    }),
    getRiskConfig: builder.query<RiskConfiguration, void>({
      query: () => '/api/risk/config',
      providesTags: ['RiskConfig'],
    }),
    updateRiskConfig: builder.mutation<void, RiskConfiguration>({
      query: (config) => ({
        url: '/api/risk/config',
        method: 'PUT',
        body: config,
      }),
      invalidatesTags: ['RiskConfig'],
    }),
    overrideCircuitBreaker: builder.mutation<void, { id: string; password: string }>({
      query: ({ id, password }) => ({
        url: '/api/risk/circuit-breaker/override',
        method: 'POST',
        body: { circuitBreakerId: id, password },
      }),
      invalidatesTags: ['RiskStatus'],
    }),
  }),
});
```

#### Exchange API
```typescript
export const exchangeApi = createApi({
  reducerPath: 'exchangeApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['ExchangeBalance', 'ExchangeOrders', 'ExchangeConnection'],
  endpoints: (builder) => ({
    getExchangeBalance: builder.query<ExchangeBalanceResponse, void>({
      query: () => '/api/exchange/balance',
      providesTags: ['ExchangeBalance'],
    }),
    getExchangeOrders: builder.query<Order[], void>({
      query: () => '/api/exchange/orders',
      providesTags: ['ExchangeOrders'],
    }),
    testExchangeConnection: builder.mutation<ExchangeConnectionStatus, void>({
      query: () => ({
        url: '/api/exchange/test-connection',
        method: 'POST',
      }),
      invalidatesTags: ['ExchangeConnection'],
    }),
  }),
});
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties. I performed a reflection to eliminate redundancy:

**Redundancy Analysis:**
- Properties about "including authentication token in requests" (1.4 and 24.2) are identical - consolidated into Property 1
- Properties about "persisting preferences" (23.5) and "persisting environment mode" (2.6) follow the same pattern - kept separate as they test different data types
- Properties about "restoring preferences" (23.6) and "restoring environment mode" (2.7) follow the same pattern - kept separate as they test different data types
- Configuration round-trip property (29.4) is explicitly required and unique
- WebSocket event handling properties are kept separate as they test different event types

### Properties

#### Property 1: Authentication Token Inclusion

For any authenticated API request, the request SHALL include the authentication token in the Authorization header.

**Validates: Requirements 1.4, 24.2**

#### Property 2: Authentication Token Storage

For any authentication token received from the backend, the token SHALL be stored in both memory and session storage.

**Validates: Requirements 1.3**

#### Property 3: Environment Mode Persistence

For any environment mode selection ('test' or 'live'), the selected mode SHALL be persisted to local storage.

**Validates: Requirements 2.6**

#### Property 4: Environment Mode Restoration Round-Trip

For any environment mode persisted to local storage, restoring on application startup SHALL produce the same environment mode value.

**Validates: Requirements 2.7**

#### Property 5: Risk Percentage Validation

For any risk percentage input, values outside the range [1%, 5%] SHALL be rejected with a validation error.

**Validates: Requirements 5.4, 13.2**

#### Property 6: Position Size Validation

For any position size input, non-positive values SHALL be rejected with a validation error.

**Validates: Requirements 5.5**

#### Property 7: Table Sorting Correctness

For any sortable table column and any dataset, clicking the column header SHALL sort the table data correctly in ascending or descending order based on that column's values.

**Validates: Requirements 6.4**

#### Property 8: R-Multiple Calculation Correctness

For any trade with entry price, exit price, stop loss, and position size, the calculated R-multiple SHALL equal (exit price - entry price) / (entry price - stop loss).

**Validates: Requirements 7.5**

#### Property 9: Date Range Validation

For any backtest configuration, if start date is greater than or equal to end date, the configuration SHALL be rejected with a validation error.

**Validates: Requirements 9.4**

#### Property 10: Initial Balance Validation

For any backtest configuration, if initial balance is less than or equal to 100, the configuration SHALL be rejected with a validation error.

**Validates: Requirements 9.5**

#### Property 11: Position Sizing Calculator Risk Validation

For any position sizing calculator input, risk percentage values outside the range [0.1%, 5%] SHALL be rejected with a validation error.

**Validates: Requirements 12.5**

#### Property 12: BigDecimal Precision Preservation

For any monetary calculation in the position sizing calculator, the result SHALL use BigDecimal precision matching the backend (no floating-point errors).

**Validates: Requirements 12.8**

#### Property 13: Daily Loss Limit Validation

For any risk configuration, maximum daily loss limit values outside the range [1%, 10%] SHALL be rejected with a validation error.

**Validates: Requirements 13.3**

#### Property 14: Drawdown Limit Validation

For any risk configuration, maximum drawdown limit values outside the range [10%, 50%] SHALL be rejected with a validation error.

**Validates: Requirements 13.4**

#### Property 15: Open Positions Limit Validation

For any risk configuration, maximum open positions values outside the range [1, 10] SHALL be rejected with a validation error.

**Validates: Requirements 13.5**

#### Property 16: WebSocket Trade Event Handling

For any 'trade.executed' WebSocket event received, the dashboard SHALL update both the trade history display and the account balance display within 1 second.

**Validates: Requirements 15.3**

#### Property 17: CSV Export Column Headers

For any CSV export of trade data, the exported file SHALL include column headers as the first row.

**Validates: Requirements 20.3**

#### Property 18: CSV Monetary Value Formatting

For any monetary value in a CSV export, the value SHALL be formatted with exactly 2 decimal places.

**Validates: Requirements 20.4**

#### Property 19: CSV Timestamp Formatting

For any timestamp value in a CSV export, the value SHALL be formatted in ISO 8601 format.

**Validates: Requirements 20.5**

#### Property 20: Cache Invalidation on Mutation

For any mutation operation that modifies data, all cached data related to that mutation SHALL be invalidated.

**Validates: Requirements 23.4**

#### Property 21: User Preferences Persistence

For any user preference change (theme, timezone, or currency), the new preference value SHALL be persisted to local storage.

**Validates: Requirements 23.5**

#### Property 22: User Preferences Restoration Round-Trip

For any user preferences persisted to local storage, restoring on application startup SHALL produce the same preference values.

**Validates: Requirements 23.6**

#### Property 23: XSS Input Sanitization

For any user input rendered in the UI, the input SHALL be sanitized to prevent XSS attacks (HTML tags escaped or removed).

**Validates: Requirements 24.5**

#### Property 24: Configuration Serialization Round-Trip

For all valid configuration objects, parsing JSON then serializing to JSON then parsing again SHALL produce an equivalent configuration object.

**Validates: Requirements 29.4**

#### Property 25: API Data Serialization Round-Trip

For any API request or response payload, serializing to JSON then deserializing SHALL produce an equivalent data object.

**Validates: Requirements 30.9**


## Error Handling

### Error Handling Strategy

The dashboard implements a comprehensive error handling strategy across multiple layers:

#### 1. Network Error Handling

**Automatic Retry Logic**
```typescript
// RTK Query retry configuration
const baseQueryWithRetry = retry(
  async (args, api, extraOptions) => {
    const result = await baseQueryWithEnvironment(args, api, extraOptions);
    
    // Retry on network errors and 5xx server errors
    if (result.error && (
      result.error.status === 'FETCH_ERROR' ||
      (typeof result.error.status === 'number' && result.error.status >= 500)
    )) {
      throw result.error;
    }
    
    return result;
  },
  {
    maxRetries: 3,
    backoff: (attempt) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attempt), 10000);
    },
  }
);
```

**Error Display**
- Network failures: Toast notification with error message
- After 3 retries: Persistent error message with manual retry button
- 4xx errors: Display specific error message from API response
- 5xx errors: Display generic "Server error, please try again" message

#### 2. Form Validation Errors

**Client-Side Validation**
```typescript
// Validation schema using Zod
const strategyConfigSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']),
  riskPerTrade: z.number()
    .min(1, 'Risk must be at least 1%')
    .max(5, 'Risk cannot exceed 5%'),
  minPositionSize: z.number()
    .positive('Position size must be positive'),
  maxPositionSize: z.number()
    .positive('Position size must be positive'),
});

// Form component with validation
const StrategyConfigForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(strategyConfigSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('riskPerTrade')}
        error={!!errors.riskPerTrade}
        helperText={errors.riskPerTrade?.message}
      />
    </form>
  );
};
```

**Validation Error Display**
- Inline error messages below invalid input fields
- Red border on invalid inputs
- Disable submit button while validation errors exist
- Clear errors when user corrects input

#### 3. React Error Boundaries

**Error Boundary Implementation**
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    console.error('React Error Boundary caught:', error, errorInfo);
    // Send to monitoring service (e.g., Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    
    return this.props.children;
  }
}

// Fallback UI
const ErrorFallback: React.FC<{ error: Error | null; onReset: () => void }> = ({
  error,
  onReset,
}) => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <ErrorIcon color="error" sx={{ fontSize: 64 }} />
    <Typography variant="h5" sx={{ mt: 2 }}>
      Something went wrong
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      {error?.message || 'An unexpected error occurred'}
    </Typography>
    <Button variant="contained" onClick={onReset} sx={{ mt: 3 }}>
      Reload Page
    </Button>
  </Box>
);
```

**Error Boundary Placement**
- Root level: Catches all application errors
- Route level: Catches errors in specific pages
- Component level: Catches errors in complex components (charts, tables)

#### 4. WebSocket Error Handling

**Connection Management**
```typescript
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 5000;
  
  connect(url: string, token: string) {
    try {
      this.ws = new WebSocket(`${url}?token=${token}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        store.dispatch(websocketConnected());
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        store.dispatch(websocketError('Connection error'));
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket closed');
        store.dispatch(websocketDisconnected());
        this.handleReconnect(url, token);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      store.dispatch(websocketError('Failed to connect'));
    }
  }
  
  private handleReconnect(url: string, token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      
      setTimeout(() => {
        this.connect(url, token);
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
      store.dispatch(websocketError('Connection lost. Please refresh the page.'));
    }
  }
}
```

**WebSocket Error Display**
- Connection lost: Warning banner at top of page
- Reconnecting: Loading indicator with attempt count
- Reconnected: Success message (auto-dismiss after 3s)
- Max attempts reached: Error message with manual refresh button

#### 5. Authentication Errors

**Token Expiry Handling**
```typescript
// Axios interceptor for token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Token expired (401) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt token refresh
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { token } = response.data;
        
        // Update token
        store.dispatch(setToken(token));
        localStorage.setItem('auth_token', token);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

**Session Timeout**
```typescript
// Inactivity timeout (30 minutes)
let inactivityTimer: NodeJS.Timeout;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  
  inactivityTimer = setTimeout(() => {
    store.dispatch(logout());
    store.dispatch(showNotification({
      type: 'warning',
      message: 'Session expired due to inactivity',
    }));
    window.location.href = '/login';
  }, 30 * 60 * 1000); // 30 minutes
};

// Reset timer on user activity
window.addEventListener('mousemove', resetInactivityTimer);
window.addEventListener('keypress', resetInactivityTimer);
window.addEventListener('click', resetInactivityTimer);
```

#### 6. Data Loading States

**Loading State Management**
```typescript
// Component with loading states
const TradesPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useGetTradeHistoryQuery({
    page: 1,
    pageSize: 50,
  });
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (isError) {
    return (
      <ErrorDisplay
        message={error.message}
        onRetry={refetch}
      />
    );
  }
  
  return <TradeTable trades={data.trades} />;
};
```

**Fallback to Cached Data**
```typescript
// RTK Query with stale data fallback
export const accountApi = createApi({
  endpoints: (builder) => ({
    getBalance: builder.query<BalanceResponse, void>({
      query: () => '/api/account/balance',
      // Keep stale data for 5 minutes
      keepUnusedDataFor: 300,
      // Use cached data while refetching
      refetchOnMountOrArgChange: 60,
    }),
  }),
});
```

#### 7. Error Recovery Actions

**Clear Error States**
- Navigation to different page clears previous page errors
- Successful action clears related error states
- Manual retry button clears error and retries operation

**User Feedback**
- All errors display user-friendly messages (no technical jargon)
- Actionable errors include suggested next steps
- Critical errors include support contact information


## Testing Strategy

### Dual Testing Approach

The dashboard implements both unit testing and property-based testing for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property tests**: Verify universal properties across all inputs through randomization
- Both approaches are complementary and necessary for production-grade quality

### Testing Framework

**Core Testing Libraries**
- **Vitest**: Fast unit test runner with native ESM support
- **React Testing Library**: Component testing with user-centric queries
- **Playwright**: End-to-end testing for critical user flows
- **MSW (Mock Service Worker)**: API mocking for integration tests
- **fast-check**: Property-based testing library for JavaScript/TypeScript

### Unit Testing Strategy

#### Component Testing

**Example: EnvironmentSwitch Component**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { EnvironmentSwitch } from './EnvironmentSwitch';
import { store } from '../../app/store';

describe('EnvironmentSwitch', () => {
  it('should display current environment mode', () => {
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );
    
    expect(screen.getByText('Test/Backtest')).toBeInTheDocument();
  });
  
  it('should show confirmation dialog when switching environments', async () => {
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );
    
    fireEvent.click(screen.getByText('Live Trading'));
    
    await waitFor(() => {
      expect(screen.getByText(/Switch to live environment/i)).toBeInTheDocument();
    });
  });
  
  it('should persist environment selection to localStorage', async () => {
    const localStorageMock = {
      setItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    render(
      <Provider store={store}>
        <EnvironmentSwitch />
      </Provider>
    );
    
    fireEvent.click(screen.getByText('Live Trading'));
    fireEvent.click(screen.getByText('Confirm'));
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('environment_mode', 'live');
    });
  });
});
```

#### Redux Slice Testing

**Example: Auth Slice**
```typescript
import { authSlice, login, logout } from './authSlice';

describe('authSlice', () => {
  it('should handle login action', () => {
    const initialState = { token: null, isAuthenticated: false };
    const action = login({ token: 'test-token', user: { id: '1', username: 'trader' } });
    const state = authSlice.reducer(initialState, action);
    
    expect(state.token).toBe('test-token');
    expect(state.isAuthenticated).toBe(true);
  });
  
  it('should handle logout action', () => {
    const initialState = { token: 'test-token', isAuthenticated: true };
    const action = logout();
    const state = authSlice.reducer(initialState, action);
    
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
```

#### Utility Function Testing

**Example: Formatters**
```typescript
import { formatCurrency, formatPercentage, formatTimestamp } from './formatters';

describe('formatters', () => {
  it('should format currency with 2 decimal places', () => {
    expect(formatCurrency('1234.567')).toBe('$1,234.57');
    expect(formatCurrency('0.1')).toBe('$0.10');
  });
  
  it('should format percentage with 2 decimal places', () => {
    expect(formatPercentage(0.1234)).toBe('12.34%');
    expect(formatPercentage(-0.05)).toBe('-5.00%');
  });
  
  it('should format timestamp in ISO 8601', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatTimestamp(date)).toBe('2024-01-15T10:30:00.000Z');
  });
});
```

### Property-Based Testing Strategy

Property tests run a minimum of 100 iterations per test to ensure comprehensive input coverage. Each property test references its corresponding design document property.

#### Property Test Configuration

```typescript
import fc from 'fast-check';

// Configure fast-check for all tests
fc.configureGlobal({
  numRuns: 100, // Minimum 100 iterations
  verbose: true,
  seed: Date.now(), // Random seed for reproducibility
});
```

#### Example Property Tests

**Property 1: Authentication Token Inclusion**
```typescript
import fc from 'fast-check';
import { api } from '../../services/api';

describe('Property 1: Authentication Token Inclusion', () => {
  /**
   * Feature: frontend-dashboard
   * Property 1: For any authenticated API request, the request SHALL include
   * the authentication token in the Authorization header.
   */
  it('should include auth token in all API requests', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 20, maxLength: 200 }), // Random token
        fc.constantFrom('/api/account/balance', '/api/strategies', '/api/trades/history'), // Random endpoint
        async (token, endpoint) => {
          // Setup: Store token
          localStorage.setItem('auth_token', token);
          
          // Mock axios to capture request
          const requestSpy = vi.spyOn(api, 'get');
          
          try {
            await api.get(endpoint);
          } catch (error) {
            // Ignore network errors, we only care about headers
          }
          
          // Assert: Token is in Authorization header
          expect(requestSpy).toHaveBeenCalledWith(
            endpoint,
            expect.objectContaining({
              headers: expect.objectContaining({
                Authorization: `Bearer ${token}`,
              }),
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 5: Risk Percentage Validation**
```typescript
import fc from 'fast-check';
import { validateRiskPercentage } from '../../utils/validators';

describe('Property 5: Risk Percentage Validation', () => {
  /**
   * Feature: frontend-dashboard
   * Property 5: For any risk percentage input, values outside the range [1%, 5%]
   * SHALL be rejected with a validation error.
   */
  it('should reject risk percentages outside [1, 5] range', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double({ max: 0.99 }), // Below minimum
          fc.double({ min: 5.01, max: 100 }) // Above maximum
        ),
        (invalidRisk) => {
          const result = validateRiskPercentage(invalidRisk);
          
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toMatch(/must be between 1% and 5%/i);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should accept risk percentages within [1, 5] range', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 5 }),
        (validRisk) => {
          const result = validateRiskPercentage(validRisk);
          
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 8: R-Multiple Calculation**
```typescript
import fc from 'fast-check';
import { calculateRMultiple } from '../../utils/calculations';

describe('Property 8: R-Multiple Calculation Correctness', () => {
  /**
   * Feature: frontend-dashboard
   * Property 8: For any trade with entry price, exit price, stop loss, and position size,
   * the calculated R-multiple SHALL equal (exit price - entry price) / (entry price - stop loss).
   */
  it('should calculate R-multiple correctly for all trades', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 100000 }), // Entry price
        fc.double({ min: 0.1, max: 0.99 }), // Stop loss percentage (below entry)
        fc.double({ min: 1.01, max: 2 }), // Exit multiplier (above entry)
        (entryPrice, stopLossPercent, exitMultiplier) => {
          const stopLoss = entryPrice * (1 - stopLossPercent);
          const exitPrice = entryPrice * exitMultiplier;
          
          const rMultiple = calculateRMultiple({
            entryPrice,
            exitPrice,
            stopLoss,
          });
          
          const expectedRMultiple = (exitPrice - entryPrice) / (entryPrice - stopLoss);
          
          // Use approximate equality for floating point
          expect(Math.abs(rMultiple - expectedRMultiple)).toBeLessThan(0.0001);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 24: Configuration Serialization Round-Trip**
```typescript
import fc from 'fast-check';
import { parseConfig, serializeConfig } from '../../utils/config';

describe('Property 24: Configuration Serialization Round-Trip', () => {
  /**
   * Feature: frontend-dashboard
   * Property 24: For all valid configuration objects, parsing JSON then serializing
   * to JSON then parsing again SHALL produce an equivalent configuration object.
   */
  it('should preserve configuration through round-trip serialization', () => {
    // Arbitrary configuration generator
    const configArbitrary = fc.record({
      strategyId: fc.uuid(),
      symbol: fc.constantFrom('BTC/USDT', 'ETH/USDT', 'BNB/USDT'),
      timeframe: fc.constantFrom('1m', '5m', '15m', '1h', '4h', '1d'),
      riskPerTrade: fc.double({ min: 1, max: 5 }),
      minPositionSize: fc.double({ min: 10, max: 100 }),
      maxPositionSize: fc.double({ min: 100, max: 1000 }),
    });
    
    fc.assert(
      fc.property(configArbitrary, (originalConfig) => {
        // Serialize to JSON
        const json = serializeConfig(originalConfig);
        
        // Parse back to object
        const parsedConfig = parseConfig(json);
        
        // Serialize again
        const json2 = serializeConfig(parsedConfig);
        
        // Parse again
        const parsedConfig2 = parseConfig(json2);
        
        // Assert: All three objects are equivalent
        expect(parsedConfig).toEqual(originalConfig);
        expect(parsedConfig2).toEqual(originalConfig);
        expect(json2).toBe(json);
      }),
      { numRuns: 100 }
    );
  });
});
```


### Integration Testing Framework

Integration tests verify frontend-backend communication and API contracts. These tests run automatically after each development phase to detect breaking changes immediately.

#### Test Backend Setup

**Option 1: Mock Service Worker (MSW)**
```typescript
// src/tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Authentication
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { username, password } = req.body as { username: string; password: string };
    
    if (username === 'trader' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            username: 'trader',
            email: 'trader@example.com',
            role: 'trader',
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid credentials' })
    );
  }),
  
  // Account balance
  rest.get('/api/account/balance', (req, res, ctx) => {
    const environment = req.headers.get('X-Environment');
    
    return res(
      ctx.status(200),
      ctx.json({
        total: environment === 'live' ? '5432.10' : '10000.00',
        available: environment === 'live' ? '4321.50' : '9500.00',
        locked: environment === 'live' ? '1110.60' : '500.00',
        assets: [
          { symbol: 'USDT', amount: '3000.00', valueUSD: '3000.00' },
          { symbol: 'BTC', amount: '0.05', valueUSD: '2432.10' },
        ],
        lastSync: new Date().toISOString(),
      })
    );
  }),
  
  // Strategies
  rest.get('/api/strategies', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'strategy-1',
          name: 'Bollinger Bands BTC',
          type: 'BOLLINGER_BANDS',
          status: 'RUNNING',
          configuration: {
            symbol: 'BTC/USDT',
            timeframe: '1h',
            riskPerTrade: 2,
            minPositionSize: 10,
            maxPositionSize: 100,
          },
          metrics: {
            totalTrades: 45,
            profitLoss: '234.56',
            profitLossPercentage: '2.35',
            winRate: 0.52,
            currentDrawdown: 0.08,
          },
        },
      ])
    );
  }),
  
  // More handlers...
];

// src/tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Option 2: Test Backend Instance**
```typescript
// Use Docker Compose to spin up test backend
// docker-compose.test.yml
version: '3.8'
services:
  test-backend:
    image: algotrading-backend:test
    environment:
      - SPRING_PROFILES_ACTIVE=test
      - DATABASE_URL=jdbc:postgresql://test-db:5432/algotrading_test
    ports:
      - "8081:8080"
  
  test-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=algotrading_test
      - POSTGRES_USER=test
      - POSTGRES_PASSWORD=test
```

#### Integration Test Suite

**Authentication Flow Tests**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../app/store';
import { LoginPage } from '../../features/auth/LoginPage';

describe('Integration: Authentication Flow', () => {
  /**
   * Requirement 30.3: Verify authentication flow by testing login,
   * token refresh, and logout endpoints
   */
  it('should complete full authentication flow', async () => {
    render(
      <Provider store={store}>
        <LoginPage />
      </Provider>
    );
    
    // Login
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'trader' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText('Login'));
    
    // Verify token stored
    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
      expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
    });
    
    // Verify redirect to dashboard
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
  
  it('should handle token refresh on 401 error', async () => {
    // Setup: Expired token
    localStorage.setItem('auth_token', 'expired-token');
    localStorage.setItem('refresh_token', 'valid-refresh-token');
    
    // Make API call that returns 401
    const { result } = renderHook(() => useGetBalanceQuery(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    
    // Verify token refresh was attempted
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(localStorage.getItem('auth_token')).not.toBe('expired-token');
    });
  });
  
  it('should logout and clear session on refresh failure', async () => {
    // Setup: Invalid refresh token
    localStorage.setItem('auth_token', 'expired-token');
    localStorage.setItem('refresh_token', 'invalid-refresh-token');
    
    // Make API call that returns 401
    const { result } = renderHook(() => useGetBalanceQuery(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    
    // Verify logout and redirect
    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(window.location.pathname).toBe('/login');
    });
  });
});
```

**Environment Switching Tests**
```typescript
describe('Integration: Environment Switching', () => {
  /**
   * Requirement 30.19: Verify environment switching by testing both
   * test and live environment endpoints
   */
  it('should fetch test environment data when in test mode', async () => {
    const { result } = renderHook(() => useGetBalanceQuery(), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          {children}
        </Provider>
      ),
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.total).toBe('10000.00'); // Test balance
    });
  });
  
  it('should fetch live environment data when in live mode', async () => {
    // Switch to live mode
    store.dispatch(setEnvironmentMode('live'));
    
    const { result } = renderHook(() => useGetBalanceQuery(), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          {children}
        </Provider>
      ),
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.total).toBe('5432.10'); // Live balance
    });
  });
  
  it('should include environment header in all requests', async () => {
    const requestSpy = vi.spyOn(api, 'get');
    
    store.dispatch(setEnvironmentMode('live'));
    
    const { result } = renderHook(() => useGetBalanceQuery(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    
    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalledWith(
        '/api/account/balance',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Environment': 'live',
          }),
        })
      );
    });
  });
});
```

**WebSocket Integration Tests**
```typescript
import { WebSocketManager } from '../../services/websocket';

describe('Integration: WebSocket Communication', () => {
  /**
   * Requirement 30.8: Verify WebSocket connection establishment and
   * event handling for all event types
   */
  it('should establish WebSocket connection with auth token', async () => {
    const wsManager = new WebSocketManager();
    const token = 'test-token';
    
    await wsManager.connect('ws://localhost:8080/ws', token);
    
    expect(wsManager.isConnected()).toBe(true);
  });
  
  it('should handle balance update events', async () => {
    const wsManager = new WebSocketManager();
    await wsManager.connect('ws://localhost:8080/ws', 'test-token');
    
    // Send mock event
    wsManager.simulateEvent({
      type: 'balance.updated',
      environment: 'test',
      timestamp: new Date().toISOString(),
      data: {
        total: '10500.00',
        available: '10000.00',
        locked: '500.00',
      },
    });
    
    // Verify Redux state updated
    await waitFor(() => {
      const state = store.getState();
      expect(state.accountApi.queries['getBalance(undefined)']?.data?.total).toBe('10500.00');
    });
  });
  
  it('should handle all event types', async () => {
    const eventTypes = [
      'balance.updated',
      'trade.executed',
      'position.updated',
      'strategy.status',
      'risk.alert',
      'system.error',
    ];
    
    const wsManager = new WebSocketManager();
    await wsManager.connect('ws://localhost:8080/ws', 'test-token');
    
    for (const eventType of eventTypes) {
      const handler = vi.fn();
      wsManager.on(eventType, handler);
      
      wsManager.simulateEvent({
        type: eventType,
        environment: 'test',
        timestamp: new Date().toISOString(),
        data: {},
      });
      
      await waitFor(() => {
        expect(handler).toHaveBeenCalled();
      });
    }
  });
});
```

**API Contract Tests**
```typescript
describe('Integration: API Contract Validation', () => {
  /**
   * Requirement 30.18: Use contract testing to ensure API compatibility
   * between frontend and backend versions
   */
  it('should validate strategy response schema', async () => {
    const { result } = renderHook(() => useGetStrategiesQuery(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    const strategies = result.current.data;
    
    // Validate schema
    expect(strategies).toBeInstanceOf(Array);
    strategies?.forEach((strategy) => {
      expect(strategy).toHaveProperty('id');
      expect(strategy).toHaveProperty('name');
      expect(strategy).toHaveProperty('type');
      expect(strategy).toHaveProperty('status');
      expect(strategy).toHaveProperty('configuration');
      expect(strategy).toHaveProperty('metrics');
      
      // Validate nested objects
      expect(strategy.configuration).toHaveProperty('symbol');
      expect(strategy.configuration).toHaveProperty('timeframe');
      expect(strategy.configuration).toHaveProperty('riskPerTrade');
      
      expect(strategy.metrics).toHaveProperty('totalTrades');
      expect(strategy.metrics).toHaveProperty('profitLoss');
      expect(strategy.metrics).toHaveProperty('winRate');
    });
  });
});
```

#### CI/CD Integration

**GitHub Actions Workflow**
```yaml
name: Frontend Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: algotrading_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start test backend
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 10
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Generate test report
        if: always()
        run: npm run test:report
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: integration-test-results
          path: test-results/
      
      - name: Fail on test failure
        if: failure()
        run: exit 1
```

**Test Execution After Each Phase**
```bash
# After completing authentication feature
npm run test:integration -- --grep "Authentication"

# After completing dashboard feature
npm run test:integration -- --grep "Dashboard|Environment"

# After completing strategy management
npm run test:integration -- --grep "Strategy"

# Full integration test suite
npm run test:integration
```


### End-to-End Testing

**Critical User Flows with Playwright**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test('should complete full trading workflow', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="username"]', 'trader');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verify dashboard loaded
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.locator('text=Account Balance')).toBeVisible();
    
    // Switch to live environment
    await page.click('text=Live Trading');
    await page.click('text=Confirm');
    await expect(page.locator('text=Live Trading').first()).toHaveClass(/active/);
    
    // Navigate to strategies
    await page.click('text=Strategies');
    await expect(page).toHaveURL('http://localhost:3000/strategies');
    
    // Start a strategy
    await page.click('button:has-text("Start")').first();
    await page.click('text=Confirm');
    await expect(page.locator('text=RUNNING')).toBeVisible();
    
    // View trade history
    await page.click('text=Trades');
    await expect(page).toHaveURL('http://localhost:3000/trades');
    await expect(page.locator('table')).toBeVisible();
    
    // Export trades
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/trades_\d{4}-\d{2}-\d{2}/);
  });
});
```

### Test Coverage Requirements

- **Unit Tests**: Minimum 80% code coverage
- **Integration Tests**: All API endpoints and WebSocket events
- **E2E Tests**: All critical user flows
- **Property Tests**: Minimum 100 iterations per property

### Test Execution

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:coverage

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Property tests
npm run test:properties

# All tests
npm run test:all
```


## Performance Optimization

### Code Splitting and Lazy Loading

**Route-Based Code Splitting**
```typescript
// src/app/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load page components
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const StrategiesPage = lazy(() => import('../features/strategies/StrategiesPage'));
const TradesPage = lazy(() => import('../features/trades/TradesPage'));
const BacktestPage = lazy(() => import('../features/backtest/BacktestPage'));
const RiskPage = lazy(() => import('../features/risk/RiskPage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/strategies" element={<StrategiesPage />} />
          <Route path="/trades" element={<TradesPage />} />
          <Route path="/backtest" element={<BacktestPage />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
```

**Component-Level Code Splitting**
```typescript
// Heavy chart library loaded only when needed
const HeavyChart = lazy(() => import('./HeavyChart'));

const ChartContainer: React.FC = () => {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setShowChart(true)}>Show Chart</Button>
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
};
```

### Virtualized Lists

**Trade History Table with Virtualization**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualizedTradeTable: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 10, // Render 10 extra rows
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const trade = trades[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TradeRow trade={trade} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### Debouncing and Throttling

**Search Input Debouncing**
```typescript
import { useDebouncedCallback } from 'use-debounce';

const TradeSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  
  // Debounce search by 300ms
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      dispatch(searchTrades(value));
    },
    300
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };
  
  return (
    <TextField
      value={searchTerm}
      onChange={handleChange}
      placeholder="Search trades..."
    />
  );
};
```

**WebSocket Event Throttling**
```typescript
import { throttle } from 'lodash';

class WebSocketManager {
  private eventHandlers: Map<string, Function> = new Map();
  
  constructor() {
    // Throttle balance updates to max 1 per second
    this.eventHandlers.set(
      'balance.updated',
      throttle(this.handleBalanceUpdate, 1000, { leading: true, trailing: true })
    );
    
    // Throttle position updates to max 1 per second
    this.eventHandlers.set(
      'position.updated',
      throttle(this.handlePositionUpdate, 1000, { leading: true, trailing: true })
    );
  }
  
  private handleBalanceUpdate(data: BalanceUpdateEvent) {
    store.dispatch(updateBalance(data.data));
  }
  
  private handlePositionUpdate(data: PositionUpdatedEvent) {
    store.dispatch(updatePosition(data.data));
  }
}
```

### Caching Strategy

**RTK Query Cache Configuration**
```typescript
export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['Balance', 'Performance'],
  endpoints: (builder) => ({
    getBalance: builder.query<BalanceResponse, void>({
      query: () => '/api/account/balance',
      providesTags: ['Balance'],
      // Keep cached data for 5 minutes
      keepUnusedDataFor: 300,
      // Refetch if data is older than 60 seconds
      refetchOnMountOrArgChange: 60,
    }),
    getPerformance: builder.query<PerformanceResponse, PerformanceRequest>({
      query: ({ timeframe }) => `/api/account/performance?timeframe=${timeframe}`,
      providesTags: ['Performance'],
      // Cache performance data for 10 minutes
      keepUnusedDataFor: 600,
    }),
  }),
});
```

**Optimistic Updates**
```typescript
export const strategiesApi = createApi({
  endpoints: (builder) => ({
    startStrategy: builder.mutation<void, string>({
      query: (id) => ({
        url: '/api/strategies/start',
        method: 'POST',
        body: { strategyId: id },
      }),
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // Immediately update UI
        const patchResult = dispatch(
          strategiesApi.util.updateQueryData('getStrategies', undefined, (draft) => {
            const strategy = draft.find((s) => s.id === id);
            if (strategy) {
              strategy.status = 'RUNNING';
            }
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResult.undo();
        }
      },
    }),
  }),
});
```

### Background Tab Optimization

**Pause Updates When Tab Inactive**
```typescript
import { usePageVisibility } from 'react-page-visibility';

const DashboardPage: React.FC = () => {
  const isVisible = usePageVisibility();
  
  // Pause polling when tab is inactive
  const { data } = useGetBalanceQuery(undefined, {
    pollingInterval: isVisible ? 60000 : 0, // Poll every 60s when visible, stop when hidden
  });
  
  useEffect(() => {
    if (!isVisible) {
      // Pause WebSocket event processing
      websocketManager.pause();
    } else {
      // Resume WebSocket event processing
      websocketManager.resume();
    }
  }, [isVisible]);
  
  return <div>...</div>;
};
```

### Bundle Size Optimization

**Vite Configuration**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'ui-vendor': ['@mui/material', '@mui/icons-material'],
          'chart-vendor': ['recharts'],
        },
      },
    },
    // Minify with terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },
  },
});
```

### Performance Monitoring

**Core Web Vitals Tracking**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (metric: Metric) => {
  // Send to analytics service
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
  
  console.log(metric);
};

// Measure Core Web Vitals
getCLS(reportWebVitals);
getFID(reportWebVitals);
getFCP(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);
```


## Security Implementation

### HTTPS and Secure Communication

**Environment-Based Configuration**
```typescript
// src/config/api.config.ts
export const API_CONFIG = {
  baseURL: import.meta.env.PROD
    ? 'https://api.algotrading.com' // Production: HTTPS only
    : 'http://localhost:8080', // Development: HTTP allowed
  wsURL: import.meta.env.PROD
    ? 'wss://api.algotrading.com/ws' // Production: WSS only
    : 'ws://localhost:8080/ws', // Development: WS allowed
};

// Enforce HTTPS in production
if (import.meta.env.PROD && window.location.protocol !== 'https:') {
  window.location.href = `https:${window.location.href.substring(window.location.protocol.length)}`;
}
```

### Token Management

**Secure Token Storage**
```typescript
// Never store tokens in localStorage in production (XSS vulnerable)
// Use memory + httpOnly cookies for production

class TokenManager {
  private token: string | null = null;
  private refreshToken: string | null = null;
  
  setTokens(token: string, refreshToken: string, rememberMe: boolean) {
    // Store in memory
    this.token = token;
    this.refreshToken = refreshToken;
    
    // Store in sessionStorage (cleared on tab close)
    sessionStorage.setItem('auth_token', token);
    
    // Only store refresh token if "remember me" is checked
    if (rememberMe) {
      // In production, this should be an httpOnly cookie set by the backend
      localStorage.setItem('refresh_token', refreshToken);
    }
  }
  
  getToken(): string | null {
    return this.token || sessionStorage.getItem('auth_token');
  }
  
  getRefreshToken(): string | null {
    return this.refreshToken || localStorage.getItem('refresh_token');
  }
  
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }
}

export const tokenManager = new TokenManager();
```

**Token Masking in UI**
```typescript
const APIKeyDisplay: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [revealed, setRevealed] = useState(false);
  
  const maskedKey = apiKey.replace(/./g, '*').slice(0, -4) + apiKey.slice(-4);
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        {revealed ? apiKey : maskedKey}
      </Typography>
      <IconButton
        size="small"
        onClick={() => setRevealed(!revealed)}
        aria-label={revealed ? 'Hide API key' : 'Reveal API key'}
      >
        {revealed ? <VisibilityOffIcon /> : <VisibilityIcon />}
      </IconButton>
    </Box>
  );
};
```

### XSS Prevention

**Input Sanitization**
```typescript
import DOMPurify from 'dompurify';

// Sanitize user input before rendering
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
};

// Use in components
const UserComment: React.FC<{ comment: string }> = ({ comment }) => {
  const sanitizedComment = sanitizeInput(comment);
  
  return <Typography>{sanitizedComment}</Typography>;
};

// For rich text (if needed)
const RichTextDisplay: React.FC<{ html: string }> = ({ html }) => {
  const sanitizedHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};
```

**Content Security Policy**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          '<head>',
          `<head>
            <meta http-equiv="Content-Security-Policy" content="
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self' data:;
              connect-src 'self' https://api.algotrading.com wss://api.algotrading.com;
              frame-ancestors 'none';
              base-uri 'self';
              form-action 'self';
            ">`
        );
      },
    },
  ],
});
```

### CSRF Protection

**CSRF Token Handling**
```typescript
// Get CSRF token from meta tag (set by backend)
const getCSRFToken = (): string | null => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : null;
};

// Include CSRF token in all mutation requests
const baseQueryWithCSRF = fetchBaseQuery({
  baseUrl: API_CONFIG.baseURL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    const csrfToken = getCSRFToken();
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
    
    return headers;
  },
});
```

### Route Guards

**Protected Route Component**
```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'trader';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    // Redirect to login, save attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Usage in routes
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### Secure Data Handling

**Sensitive Data Logging Prevention**
```typescript
// Custom logger that filters sensitive data
class SecureLogger {
  private sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
  
  private filterSensitiveData(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const filtered = { ...obj };
    
    for (const key in filtered) {
      if (this.sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
        filtered[key] = '***REDACTED***';
      } else if (typeof filtered[key] === 'object') {
        filtered[key] = this.filterSensitiveData(filtered[key]);
      }
    }
    
    return filtered;
  }
  
  log(message: string, data?: any) {
    if (import.meta.env.DEV) {
      console.log(message, data ? this.filterSensitiveData(data) : '');
    }
  }
  
  error(message: string, error?: any) {
    console.error(message, error ? this.filterSensitiveData(error) : '');
  }
}

export const logger = new SecureLogger();
```

### Rate Limiting

**Client-Side Rate Limiting**
```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limits = {
    '/api/strategies/start': { max: 5, window: 60000 }, // 5 requests per minute
    '/api/backtest/run': { max: 3, window: 300000 }, // 3 requests per 5 minutes
  };
  
  canMakeRequest(endpoint: string): boolean {
    const limit = this.limits[endpoint];
    if (!limit) return true;
    
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];
    
    // Remove old requests outside the window
    const recentRequests = requests.filter((time) => now - time < limit.window);
    
    if (recentRequests.length >= limit.max) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(endpoint, recentRequests);
    return true;
  }
  
  getTimeUntilNextRequest(endpoint: string): number {
    const limit = this.limits[endpoint];
    if (!limit) return 0;
    
    const requests = this.requests.get(endpoint) || [];
    if (requests.length < limit.max) return 0;
    
    const oldestRequest = Math.min(...requests);
    const timeUntilExpiry = limit.window - (Date.now() - oldestRequest);
    return Math.max(0, timeUntilExpiry);
  }
}

export const rateLimiter = new RateLimiter();

// Use in API calls
const startStrategy = async (id: string) => {
  if (!rateLimiter.canMakeRequest('/api/strategies/start')) {
    const waitTime = rateLimiter.getTimeUntilNextRequest('/api/strategies/start');
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }
  
  return api.post('/api/strategies/start', { strategyId: id });
};
```


## Deployment Strategy

### Build Configuration

**Environment Variables**
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
VITE_ENVIRONMENT=development

# .env.production
VITE_API_BASE_URL=https://api.algotrading.com
VITE_WS_URL=wss://api.algotrading.com/ws
VITE_ENVIRONMENT=production
```

**Build Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:staging": "tsc && vite build --mode staging",
    "build:production": "tsc && vite build --mode production",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:integration": "vitest --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:properties": "vitest --config vitest.properties.config.ts"
  }
}
```

### Docker Deployment

**Dockerfile**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY public ./public
COPY index.html ./

# Build application
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Configuration**
```nginx
# nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # API proxy (optional, if not using separate API domain)
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://backend:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

**Docker Compose**
```yaml
# AlgotradingBot/compose.yaml (at repository root)
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: ${API_BASE_URL}
        VITE_WS_URL: ${WS_URL}
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - algotrading-network

  backend:
    build:
      context: ./AlgotradingBot
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=production
    restart: unless-stopped
    networks:
      - algotrading-network

networks:
  algotrading-network:
    driver: bridge
```

### Static Hosting Deployment

**Vercel Configuration**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api-base-url",
    "VITE_WS_URL": "@ws-url"
  }
}
```

**Netlify Configuration**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### CI/CD Pipeline

**GitHub Actions Workflow**
```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi

  integration-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: algotrading_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start test backend
        run: docker-compose -f docker-compose.test.yml up -d
      
      - name: Wait for backend
        run: sleep 10
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Stop test backend
        if: always()
        run: docker-compose -f docker-compose.test.yml down

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  build:
    needs: [lint-and-type-check, test, integration-test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          VITE_WS_URL: ${{ secrets.WS_URL }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.algotrading.com
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to production
        run: |
          # Deploy to production environment
          echo "Deploying to production..."
```


## Monitoring and Analytics

### Error Tracking

**Sentry Integration**
```typescript
// src/config/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_ENVIRONMENT,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 0.1, // 10% of transactions
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      beforeSend(event, hint) {
        // Filter sensitive data
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers.Authorization;
          }
        }
        return event;
      },
      
      ignoreErrors: [
        // Ignore common browser errors
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
    });
  }
};

// Capture custom errors
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Capture custom messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};
```

**Error Boundary with Sentry**
```typescript
import * as Sentry from '@sentry/react';

const SentryErrorBoundary = Sentry.withErrorBoundary(App, {
  fallback: ({ error, resetError }) => (
    <ErrorFallback error={error} onReset={resetError} />
  ),
  showDialog: true,
});

export default SentryErrorBoundary;
```

### Performance Monitoring

**Custom Performance Tracking**
```typescript
// src/utils/performance.ts
import * as Sentry from '@sentry/react';

export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  
  startMeasure(name: string) {
    this.marks.set(name, performance.now());
  }
  
  endMeasure(name: string) {
    const startTime = this.marks.get(name);
    if (!startTime) return;
    
    const duration = performance.now() - startTime;
    this.marks.delete(name);
    
    // Send to Sentry
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${name} took ${duration.toFixed(2)}ms`,
      level: 'info',
      data: { duration },
    });
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    return fn().finally(() => this.endMeasure(name));
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Usage
performanceMonitor.startMeasure('fetch-trades');
const trades = await fetchTrades();
performanceMonitor.endMeasure('fetch-trades');

// Or with async wrapper
const trades = await performanceMonitor.measureAsync(
  'fetch-trades',
  () => fetchTrades()
);
```

**API Performance Tracking**
```typescript
// RTK Query middleware for performance tracking
const performanceMiddleware: Middleware = () => (next) => (action) => {
  if (action.type.endsWith('/fulfilled')) {
    const duration = action.meta?.baseQueryMeta?.response?.headers?.get('X-Response-Time');
    if (duration) {
      Sentry.addBreadcrumb({
        category: 'api',
        message: `API call completed in ${duration}ms`,
        level: 'info',
        data: {
          endpoint: action.meta.arg.endpointName,
          duration: parseFloat(duration),
        },
      });
    }
  }
  
  return next(action);
};
```

### Analytics Integration

**Google Analytics 4**
```typescript
// src/config/analytics.ts
import ReactGA from 'react-ga4';

export const initAnalytics = () => {
  if (import.meta.env.PROD) {
    ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID, {
      gaOptions: {
        anonymizeIp: true,
      },
    });
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (import.meta.env.PROD) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

// Track events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (import.meta.env.PROD) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

// Track user interactions
export const trackStrategyStart = (strategyId: string) => {
  trackEvent('Strategy', 'Start', strategyId);
};

export const trackStrategyStop = (strategyId: string) => {
  trackEvent('Strategy', 'Stop', strategyId);
};

export const trackBacktestRun = (strategyName: string) => {
  trackEvent('Backtest', 'Run', strategyName);
};

export const trackTradeExport = (format: 'csv' | 'pdf') => {
  trackEvent('Export', 'Trade', format);
};

export const trackEnvironmentSwitch = (mode: 'test' | 'live') => {
  trackEvent('Environment', 'Switch', mode);
};
```

**Route Tracking**
```typescript
// src/app/App.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../config/analytics';

const App: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  return <Routes>...</Routes>;
};
```

### Application Logging

**Structured Logging**
```typescript
// src/utils/logger.ts
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
  }
  
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      sessionId: this.sessionId,
      userId: store.getState().auth.user?.id,
    };
  }
  
  private log(entry: LogEntry) {
    // Console output in development
    if (import.meta.env.DEV) {
      const style = this.getLogStyle(entry.level);
      console.log(
        `%c[${entry.level.toUpperCase()}] ${entry.message}`,
        style,
        entry.context || ''
      );
    }
    
    // Send to logging service in production
    if (import.meta.env.PROD) {
      this.sendToLoggingService(entry);
    }
  }
  
  private getLogStyle(level: LogLevel): string {
    const styles = {
      [LogLevel.DEBUG]: 'color: gray',
      [LogLevel.INFO]: 'color: blue',
      [LogLevel.WARN]: 'color: orange',
      [LogLevel.ERROR]: 'color: red; font-weight: bold',
    };
    return styles[level];
  }
  
  private sendToLoggingService(entry: LogEntry) {
    // Send to backend logging endpoint
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {
      // Silently fail to avoid infinite loops
    });
  }
  
  debug(message: string, context?: Record<string, any>) {
    this.log(this.createLogEntry(LogLevel.DEBUG, message, context));
  }
  
  info(message: string, context?: Record<string, any>) {
    this.log(this.createLogEntry(LogLevel.INFO, message, context));
  }
  
  warn(message: string, context?: Record<string, any>) {
    this.log(this.createLogEntry(LogLevel.WARN, message, context));
  }
  
  error(message: string, context?: Record<string, any>) {
    this.log(this.createLogEntry(LogLevel.ERROR, message, context));
    
    // Also send to Sentry
    if (import.meta.env.PROD) {
      Sentry.captureMessage(message, {
        level: 'error',
        extra: context,
      });
    }
  }
}

export const logger = new Logger();
```

### Health Monitoring

**Application Health Check**
```typescript
// src/utils/health.ts
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    api: boolean;
    websocket: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
  };
  timestamp: string;
}

export const checkHealth = async (): Promise<HealthStatus> => {
  const checks = {
    api: await checkAPIHealth(),
    websocket: checkWebSocketHealth(),
    localStorage: checkLocalStorageHealth(),
    sessionStorage: checkSessionStorageHealth(),
  };
  
  const allHealthy = Object.values(checks).every((check) => check);
  const someHealthy = Object.values(checks).some((check) => check);
  
  return {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  };
};

const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/system/health', { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
};

const checkWebSocketHealth = (): boolean => {
  return websocketManager.isConnected();
};

const checkLocalStorageHealth = (): boolean => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

const checkSessionStorageHealth = (): boolean => {
  try {
    const test = '__test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Periodic health checks
setInterval(async () => {
  const health = await checkHealth();
  
  if (health.status === 'unhealthy') {
    logger.error('Application health check failed', { health });
  } else if (health.status === 'degraded') {
    logger.warn('Application health degraded', { health });
  }
}, 60000); // Check every minute
```


## Accessibility Implementation

### Keyboard Navigation

**Focus Management**
```typescript
// Custom hook for focus trap in modals
const useFocusTrap = (isOpen: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus first element
    firstElement?.focus();
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);
  
  return containerRef;
};

// Usage in modal
const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  const containerRef = useFocusTrap(open);
  
  return (
    <Dialog open={open} onClose={onClose}>
      <div ref={containerRef}>
        {children}
      </div>
    </Dialog>
  );
};
```

**Skip to Main Content**
```typescript
// src/components/layout/SkipLink.tsx
const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="skip-link"
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 999,
        padding: '1rem',
        backgroundColor: '#000',
        color: '#fff',
        textDecoration: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = '0';
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px';
      }}
    >
      Skip to main content
    </a>
  );
};

// In App.tsx
<SkipLink />
<Header />
<main id="main-content">
  <Routes>...</Routes>
</main>
```

### ARIA Labels and Roles

**Accessible Components**
```typescript
// Accessible button with icon
const IconButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
};

// Accessible table
const TradeTable: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  return (
    <table role="table" aria-label="Trade history">
      <thead>
        <tr role="row">
          <th role="columnheader" scope="col">Trade ID</th>
          <th role="columnheader" scope="col">Symbol</th>
          <th role="columnheader" scope="col">Profit/Loss</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((trade) => (
          <tr key={trade.id} role="row">
            <td role="cell">{trade.id}</td>
            <td role="cell">{trade.symbol}</td>
            <td role="cell" aria-label={`${trade.profitLoss} dollars`}>
              {trade.profitLoss}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Accessible form with validation
const StrategyConfigForm: React.FC = () => {
  const { register, formState: { errors } } = useForm();
  
  return (
    <form>
      <div>
        <label htmlFor="risk-input">Risk per trade (%)</label>
        <input
          id="risk-input"
          type="number"
          {...register('riskPerTrade')}
          aria-invalid={!!errors.riskPerTrade}
          aria-describedby={errors.riskPerTrade ? 'risk-error' : undefined}
        />
        {errors.riskPerTrade && (
          <span id="risk-error" role="alert" aria-live="polite">
            {errors.riskPerTrade.message}
          </span>
        )}
      </div>
    </form>
  );
};
```

### Live Regions for Dynamic Content

**Accessible Notifications**
```typescript
const NotificationContainer: React.FC = () => {
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  
  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          role="alert"
          aria-live={notification.priority === 'high' ? 'assertive' : 'polite'}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};
```

**Accessible Real-Time Updates**
```typescript
const BalanceDisplay: React.FC = () => {
  const balance = useSelector((state: RootState) => state.account.balance);
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    // Announce balance updates to screen readers
    setAnnouncement(`Balance updated to ${balance}`);
    
    // Clear announcement after screen reader reads it
    const timer = setTimeout(() => setAnnouncement(''), 1000);
    return () => clearTimeout(timer);
  }, [balance]);
  
  return (
    <>
      <div aria-label="Account balance">
        ${balance}
      </div>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {announcement}
      </div>
    </>
  );
};
```

### Color Contrast and Visual Design

**Theme with Accessible Colors**
```typescript
// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // WCAG AA compliant
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32', // Dark green for better contrast
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)', // 4.5:1 contrast ratio
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    success: {
      main: '#66bb6a', // Lighter green for dark mode
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ffa726',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
});
```

**Non-Color Indicators**
```typescript
// Profit/Loss display with icon and color
const ProfitLossDisplay: React.FC<{ value: string }> = ({ value }) => {
  const isProfit = parseFloat(value) >= 0;
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        color: isProfit ? 'success.main' : 'error.main',
      }}
    >
      {isProfit ? <TrendingUpIcon /> : <TrendingDownIcon />}
      <Typography>
        {isProfit ? '+' : ''}{value}
      </Typography>
    </Box>
  );
};

// Status badge with icon
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    RUNNING: { icon: <PlayIcon />, color: 'success', label: 'Running' },
    STOPPED: { icon: <StopIcon />, color: 'default', label: 'Stopped' },
    ERROR: { icon: <ErrorIcon />, color: 'error', label: 'Error' },
  };
  
  const { icon, color, label } = config[status];
  
  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      aria-label={`Status: ${label}`}
    />
  );
};
```

### Text Alternatives for Charts

**Accessible Chart Component**
```typescript
const AccessibleChart: React.FC<{
  data: ChartData;
  title: string;
}> = ({ data, title }) => {
  const [showTable, setShowTable] = useState(false);
  
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Button
          onClick={() => setShowTable(!showTable)}
          aria-label={showTable ? 'Show chart view' : 'Show table view'}
        >
          {showTable ? 'Chart View' : 'Table View'}
        </Button>
      </Box>
      
      {showTable ? (
        <table aria-label={`${title} data table`}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {data.timestamps.map((timestamp, index) => (
              <tr key={timestamp}>
                <td>{timestamp}</td>
                <td>{data.values[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div role="img" aria-label={`${title} chart`}>
          <LineChart data={data} />
        </div>
      )}
    </div>
  );
};
```

### Responsive Text Sizing

**Scalable Typography**
```typescript
// Support text resizing up to 200%
const theme = createTheme({
  typography: {
    htmlFontSize: 16, // Base font size
    fontSize: 14,
    h1: {
      fontSize: 'clamp(2rem, 5vw, 3rem)', // Responsive sizing
    },
    h2: {
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    },
    body1: {
      fontSize: '1rem', // Relative units
      lineHeight: 1.5, // Readable line height
    },
  },
});
```

### Focus Indicators

**Visible Focus Styles**
```css
/* Global focus styles */
*:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
  border-radius: 2px;
}

/* Custom focus for buttons */
button:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.2);
}

/* Custom focus for inputs */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 0;
  border-color: #1976d2;
}
```


## Internationalization (i18n)

### i18n Setup

**React-i18next Configuration**
```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import zhTranslations from './locales/zh.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
      zh: { translation: zhTranslations },
    },
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

**Translation Files**
```json
// src/i18n/locales/en.json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "username": "Username",
    "password": "Password",
    "rememberMe": "Remember me",
    "invalidCredentials": "Invalid username or password"
  },
  "dashboard": {
    "title": "Dashboard",
    "accountBalance": "Account Balance",
    "totalProfitLoss": "Total Profit/Loss",
    "openPositions": "Open Positions",
    "recentTrades": "Recent Trades",
    "environmentSwitch": "Environment",
    "testMode": "Test/Backtest",
    "liveMode": "Live Trading",
    "switchConfirm": "Switch to {{mode}} environment? This will reload all data."
  },
  "strategies": {
    "title": "Strategies",
    "start": "Start",
    "stop": "Stop",
    "configure": "Configure",
    "status": {
      "running": "Running",
      "stopped": "Stopped",
      "error": "Error"
    },
    "config": {
      "symbol": "Symbol",
      "timeframe": "Timeframe",
      "riskPerTrade": "Risk per Trade (%)",
      "minPositionSize": "Min Position Size",
      "maxPositionSize": "Max Position Size"
    },
    "validation": {
      "riskRange": "Risk must be between 1% and 5%",
      "positiveNumber": "Must be a positive number"
    }
  },
  "trades": {
    "title": "Trade History",
    "export": "Export",
    "search": "Search trades...",
    "filters": {
      "dateRange": "Date Range",
      "symbol": "Symbol",
      "status": "Status",
      "strategy": "Strategy"
    },
    "columns": {
      "id": "Trade ID",
      "timestamp": "Timestamp",
      "symbol": "Symbol",
      "side": "Side",
      "entryPrice": "Entry Price",
      "exitPrice": "Exit Price",
      "quantity": "Quantity",
      "profitLoss": "Profit/Loss",
      "duration": "Duration",
      "strategy": "Strategy"
    }
  },
  "backtest": {
    "title": "Backtest Results",
    "runNew": "Run New Backtest",
    "metrics": {
      "sharpeRatio": "Sharpe Ratio",
      "profitFactor": "Profit Factor",
      "winRate": "Win Rate",
      "maxDrawdown": "Max Drawdown",
      "totalTrades": "Total Trades"
    },
    "validation": {
      "passed": "Passed",
      "failed": "Failed",
      "pending": "Pending"
    }
  },
  "risk": {
    "title": "Risk Management",
    "currentDrawdown": "Current Drawdown",
    "dailyLoss": "Daily Loss",
    "openRisk": "Open Risk Exposure",
    "circuitBreakers": "Circuit Breakers",
    "override": "Override",
    "calculator": "Position Sizing Calculator"
  },
  "settings": {
    "title": "Settings",
    "theme": "Theme",
    "language": "Language",
    "currency": "Currency",
    "timezone": "Timezone",
    "notifications": "Notifications",
    "apiConfiguration": "API Configuration"
  }
}
```

### Usage in Components

**Translated Components**
```typescript
import { useTranslation } from 'react-i18next';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <Typography variant="h4">{t('dashboard.title')}</Typography>
      <Card>
        <CardHeader title={t('dashboard.accountBalance')} />
        <CardContent>
          {/* Content */}
        </CardContent>
      </Card>
    </div>
  );
};

// With interpolation
const EnvironmentSwitch: React.FC = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'test' | 'live'>('test');
  
  const handleSwitch = (newMode: 'test' | 'live') => {
    const message = t('dashboard.switchConfirm', { mode: newMode });
    if (window.confirm(message)) {
      setMode(newMode);
    }
  };
  
  return (
    <ToggleButtonGroup value={mode} exclusive onChange={(_, value) => handleSwitch(value)}>
      <ToggleButton value="test">{t('dashboard.testMode')}</ToggleButton>
      <ToggleButton value="live">{t('dashboard.liveMode')}</ToggleButton>
    </ToggleButtonGroup>
  );
};
```

### Number and Date Formatting

**Locale-Aware Formatting**
```typescript
import { useTranslation } from 'react-i18next';

const useFormatters = () => {
  const { i18n } = useTranslation();
  
  const formatCurrency = (value: string | number, currency: string = 'USD') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };
  
  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };
  
  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(typeof date === 'string' ? new Date(date) : date);
  };
  
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  return {
    formatCurrency,
    formatNumber,
    formatDate,
    formatPercentage,
  };
};

// Usage
const BalanceCard: React.FC = () => {
  const { formatCurrency } = useFormatters();
  const balance = '12345.67';
  
  return <Typography>{formatCurrency(balance)}</Typography>;
};
```

### RTL Support

**RTL Layout Configuration**
```typescript
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = ['ar', 'he', 'fa'].includes(i18n.language);
  
  const theme = createTheme({
    direction: isRTL ? 'rtl' : 'ltr',
  });
  
  const cacheRtl = createCache({
    key: isRTL ? 'muirtl' : 'muiltr',
    stylisPlugins: isRTL ? [prefixer, rtlPlugin] : [prefixer],
  });
  
  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);
  
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <Routes>...</Routes>
      </ThemeProvider>
    </CacheProvider>
  );
};
```

### Language Selector

**Language Switcher Component**
```typescript
const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];
  
  const handleChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('language', languageCode);
  };
  
  return (
    <Select
      value={i18n.language}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Select language"
    >
      {languages.map((lang) => (
        <MenuItem key={lang.code} value={lang.code}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
};
```


## Implementation Roadmap

### Phase 1: Project Setup and Authentication (Week 1)

**Tasks:**
1. Initialize Vite + React + TypeScript project
2. Configure ESLint, Prettier, and TypeScript strict mode
3. Set up Redux Toolkit and RTK Query
4. Implement authentication flow (login, logout, token management)
5. Create protected route component
6. Set up error boundary
7. Configure environment variables
8. Write unit tests for auth slice and components
9. Write integration tests for authentication flow

**Deliverables:**
- Working login/logout functionality
- Token storage and refresh mechanism
- Protected routes
- 80%+ test coverage for auth module

**Integration Tests:**
- Login with valid credentials
- Login with invalid credentials
- Token refresh on 401
- Logout and session cleanup

### Phase 2: Core Layout and Dashboard (Week 2)

**Tasks:**
1. Create app layout with sidebar and header
2. Implement responsive navigation
3. Create dashboard page with balance card
4. Implement environment switch component
5. Set up WebSocket connection
6. Create performance metrics cards
7. Implement theme toggle (light/dark)
8. Write unit tests for layout components
9. Write integration tests for environment switching

**Deliverables:**
- Responsive app layout
- Dashboard with environment switching
- WebSocket connection established
- Theme support

**Integration Tests:**
- Environment switch updates API calls
- WebSocket connection with auth token
- Balance updates via WebSocket
- Theme persistence

### Phase 3: Strategy Management (Week 3)

**Tasks:**
1. Create strategies page with strategy list
2. Implement strategy card component
3. Create strategy configuration modal
4. Implement form validation for strategy config
5. Add start/stop strategy functionality
6. Implement real-time strategy status updates
7. Write unit tests for strategy components
8. Write property tests for validation
9. Write integration tests for strategy API

**Deliverables:**
- Strategy management UI
- Start/stop functionality
- Configuration with validation
- Real-time status updates

**Integration Tests:**
- Start strategy API call
- Stop strategy API call
- Update strategy configuration
- WebSocket strategy status events

### Phase 4: Trade History and Details (Week 4)

**Tasks:**
1. Create trades page with paginated table
2. Implement virtualized list for performance
3. Add sorting and filtering functionality
4. Implement search with debouncing
5. Create trade details modal
6. Add CSV export functionality
7. Display aggregate statistics
8. Write unit tests for trade components
9. Write integration tests for trade API

**Deliverables:**
- Trade history with pagination
- Sorting, filtering, and search
- Trade details view
- CSV export

**Integration Tests:**
- Fetch trade history with pagination
- Filter trades by criteria
- Sort trades by column
- Export trades to CSV

### Phase 5: Backtest Visualization (Week 5)

**Tasks:**
1. Create backtest results page
2. Implement backtest details view
3. Add equity curve chart
4. Add drawdown chart
5. Add monthly returns heatmap
6. Create backtest configuration modal
7. Implement backtest execution and polling
8. Add PDF export functionality
9. Write unit tests for backtest components
10. Write integration tests for backtest API

**Deliverables:**
- Backtest results list
- Detailed backtest visualization
- Multiple chart types
- Run new backtest functionality
- PDF export

**Integration Tests:**
- Fetch backtest results
- Run new backtest
- Poll for backtest completion
- Export backtest to PDF

### Phase 6: Risk Management (Week 6)

**Tasks:**
1. Create risk management page
2. Implement risk metrics display
3. Add circuit breaker panel
4. Create position sizing calculator
5. Implement risk configuration form
6. Add real-time risk updates via WebSocket
7. Write unit tests for risk components
8. Write property tests for calculator
9. Write integration tests for risk API

**Deliverables:**
- Risk metrics dashboard
- Circuit breaker management
- Position sizing calculator
- Risk configuration

**Integration Tests:**
- Fetch risk status
- Update risk configuration
- Override circuit breaker
- WebSocket risk alert events

### Phase 7: Settings and Exchange Integration (Week 7)

**Tasks:**
1. Create settings page
2. Implement API configuration section
3. Add exchange connection management
4. Implement notification settings
5. Add system information display
6. Create exchange balance display
7. Write unit tests for settings components
8. Write integration tests for exchange API

**Deliverables:**
- Settings management
- Exchange integration
- Live balance from exchange
- System information

**Integration Tests:**
- Test exchange connection
- Fetch exchange balance
- Update settings
- Persist preferences

### Phase 8: Charts and Visualization (Week 8)

**Tasks:**
1. Implement equity curve chart
2. Implement drawdown chart
3. Add chart zoom and pan functionality
4. Create accessible table alternatives
5. Optimize chart rendering performance
6. Add chart export functionality
7. Write unit tests for chart components

**Deliverables:**
- Performance charts
- Interactive chart features
- Accessible alternatives
- Optimized rendering

### Phase 9: Performance Optimization (Week 9)

**Tasks:**
1. Implement code splitting for all routes
2. Add virtualization for large lists
3. Optimize WebSocket event handling
4. Implement caching strategy
5. Add background tab optimization
6. Measure and optimize bundle size
7. Run Lighthouse audits
8. Achieve 90+ performance score

**Deliverables:**
- Optimized bundle size
- Fast initial load time
- Smooth scrolling and interactions
- Lighthouse score 90+

### Phase 10: Security Hardening (Week 10)

**Tasks:**
1. Implement CSRF protection
2. Add XSS input sanitization
3. Implement Content Security Policy
4. Add rate limiting
5. Secure token management
6. Implement security headers
7. Conduct security audit
8. Fix identified vulnerabilities

**Deliverables:**
- Secure authentication
- XSS protection
- CSRF protection
- Security audit report

### Phase 11: Accessibility Compliance (Week 11)

**Tasks:**
1. Implement keyboard navigation
2. Add ARIA labels and roles
3. Create skip links
4. Implement focus management
5. Add live regions for updates
6. Ensure color contrast compliance
7. Add text alternatives for charts
8. Conduct accessibility audit
9. Fix WCAG violations

**Deliverables:**
- Full keyboard accessibility
- Screen reader support
- WCAG 2.1 AA compliance
- Accessibility audit report

### Phase 12: Testing and Documentation (Week 12)

**Tasks:**
1. Complete unit test coverage (80%+)
2. Complete integration test suite
3. Write E2E tests for critical flows
4. Write property tests for all properties
5. Create user documentation
6. Create developer documentation
7. Create deployment guide
8. Conduct final QA testing

**Deliverables:**
- 80%+ test coverage
- Complete test suite
- User documentation
- Developer documentation
- Deployment guide

### Phase 13: Deployment and Monitoring (Week 13)

**Tasks:**
1. Set up CI/CD pipeline
2. Configure production environment
3. Deploy to staging
4. Conduct staging testing
5. Deploy to production
6. Set up error tracking (Sentry)
7. Set up analytics (Google Analytics)
8. Set up performance monitoring
9. Create monitoring dashboards

**Deliverables:**
- Production deployment
- CI/CD pipeline
- Error tracking
- Analytics
- Monitoring dashboards

### Success Criteria

**Functional Requirements:**
- All 32 requirements implemented and tested
- All acceptance criteria met
- Integration tests passing for all phases

**Performance Requirements:**
- Initial load < 3 seconds on 3G
- Lighthouse performance score ≥ 90
- Time to Interactive < 5 seconds
- First Contentful Paint < 1.5 seconds

**Quality Requirements:**
- Unit test coverage ≥ 80%
- All integration tests passing
- All property tests passing (100 iterations each)
- Zero critical security vulnerabilities
- WCAG 2.1 AA compliance

**Deployment Requirements:**
- Automated CI/CD pipeline
- Zero-downtime deployments
- Rollback capability
- Health monitoring
- Error tracking


## Conclusion

This design document provides a comprehensive technical blueprint for implementing a production-grade React TypeScript frontend dashboard for the algorithmic trading bot system. The design addresses all 32 requirements with specific technical implementations, component architectures, API contracts, and integration testing strategies.

### Key Design Decisions

1. **Environment Switching Architecture**: Dual-mode operation (test/live) with environment-aware API routing and WebSocket channel management ensures safe testing and live trading separation.

2. **Exchange Integration**: Multi-exchange support with balance synchronization, rate limit handling, and connection management enables flexible trading across platforms.

3. **Integration Testing Framework**: Comprehensive test suite with MSW or test backend ensures frontend-backend compatibility and catches breaking changes immediately after each development phase.

4. **State Management**: Redux Toolkit with RTK Query provides centralized state management, automatic caching, and optimistic updates for a responsive user experience.

5. **Real-Time Updates**: WebSocket integration with throttling, reconnection logic, and environment-aware channels delivers live data without overwhelming the UI.

6. **Security First**: HTTPS enforcement, secure token management, XSS prevention, CSRF protection, and route guards ensure production-grade security.

7. **Performance Optimization**: Code splitting, virtualized lists, debouncing, caching, and background tab optimization deliver fast load times and smooth interactions.

8. **Accessibility Compliance**: Keyboard navigation, ARIA labels, live regions, color contrast, and text alternatives ensure WCAG 2.1 AA compliance.

9. **Property-Based Testing**: 25 correctness properties with 100+ iterations each provide comprehensive validation of universal behaviors across all inputs.

10. **Monitoring and Analytics**: Error tracking, performance monitoring, structured logging, and health checks enable proactive issue detection and resolution.

### Next Steps

1. Review and approve this design document
2. Begin Phase 1 implementation (Project Setup and Authentication)
3. Run integration tests after each phase completion
4. Iterate based on feedback and testing results
5. Deploy to staging for user acceptance testing
6. Deploy to production with monitoring enabled

### Maintenance and Evolution

The dashboard is designed for maintainability and extensibility:

- **Feature-based architecture** enables independent development of new features
- **Comprehensive test coverage** ensures safe refactoring and updates
- **Integration tests** catch breaking changes between frontend and backend
- **Property tests** validate correctness across all inputs
- **Monitoring and logging** provide visibility into production issues
- **Documentation** supports onboarding and knowledge transfer

This design provides a solid foundation for a scalable, secure, and user-friendly trading dashboard that will grow with the algorithmic trading bot system.



