# Frontend Design Document
## Algorithmic Trading Bot Dashboard

## 1. Overview

This document outlines the frontend design for the Algorithmic Trading Bot dashboard. The frontend provides real-time monitoring, strategy control, and performance analytics for the trading system.

### 1.1 Technology Stack
- **Framework:** React 18+ with TypeScript
- **State Management:** Redux Toolkit + RTK Query
- **UI Library:** Material-UI (MUI) v5
- **Charts:** Recharts or TradingView Lightweight Charts
- **Real-time:** WebSocket (Socket.io or native WebSocket)
- **Build Tool:** Vite
- **Testing:** Vitest + React Testing Library

### 1.2 Design Principles
- Real-time data updates without page refresh
- Mobile-responsive design (desktop-first, mobile-friendly)
- Dark mode optimized for extended monitoring
- Minimal latency for critical trading decisions
- Clear visual hierarchy for risk indicators

## 2. Page Structure

### 2.1 Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo | Account Balance | Status Indicator       │
├─────────────────────────────────────────────────────────┤
│ Sidebar Navigation                                       │
│ - Dashboard                                              │
│ - Active Strategies                                      │
│ - Trade History                                          │
│ - Backtest Results                                       │
│ - Risk Management                                        │
│ - Settings                                               │
├─────────────────────────────────────────────────────────┤
│                    Main Content Area                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 3. Core Pages

### 3.1 Dashboard (Home)

**Purpose:** High-level overview of trading performance and system status

**Components:**
1. **Account Summary Card**
   - Current balance (large, prominent)
   - Total P&L (today, week, month, all-time)
   - Available cash vs. invested
   - Color-coded: green (profit), red (loss)

2. **Active Positions Widget**
   - List of open positions
   - Entry price, current price, P&L per position
   - Quick close button with confirmation

3. **Performance Chart**
   - Equity curve (account balance over time)
   - Drawdown visualization
   - Toggleable timeframes: 1D, 1W, 1M, 3M, 1Y, ALL

4. **Recent Trades Table**
   - Last 10 trades
   - Symbol, entry/exit, P&L, timestamp
   - Click to view full trade details

5. **System Health Indicators**
   - API connection status (green/red dot)
   - Last data update timestamp
   - Circuit breaker status
   - Error count (last 24h)

**Layout:**
```
┌──────────────────────┬──────────────────────┐
│  Account Summary     │  System Health       │
├──────────────────────┴──────────────────────┤
│         Performance Chart (Equity Curve)     │
├──────────────────────┬──────────────────────┤
│  Active Positions    │  Recent Trades       │
└──────────────────────┴──────────────────────┘
```

### 3.2 Active Strategies Page

**Purpose:** Start, stop, and monitor trading strategies

**Components:**
1. **Strategy Cards**
   - Strategy name (e.g., "Bollinger Bands Mean Reversion")
   - Status badge: RUNNING (green), STOPPED (gray), ERROR (red)
   - Key metrics: Win rate, Sharpe ratio, total trades
   - Start/Stop toggle button
   - Configure button (opens modal)

2. **Strategy Configuration Modal**
   - Symbol selection (BTC/USDT, ETH/USDT)
   - Timeframe (1h, 4h, 1d)
   - Risk per trade (default 2%, max 5%)
   - Position size limits
   - Enable/disable features (stop-loss, take-profit)

3. **Strategy Performance Section**
   - Real-time P&L for active strategy
   - Trade count (today, total)
   - Current drawdown
   - Time since last trade

**Actions:**
- Start strategy (requires confirmation)
- Stop strategy (immediate or after current trade)
- Edit strategy parameters (stops strategy first)
- View detailed backtest results

### 3.3 Trade History Page

**Purpose:** Comprehensive view of all executed trades

**Components:**
1. **Filters & Search**
   - Date range picker
   - Symbol filter (ALL, BTC/USDT, ETH/USDT)
   - Status filter (ALL, WIN, LOSS, BREAKEVEN)
   - Strategy filter
   - Search by trade ID

2. **Trades Table**
   - Columns: ID, Timestamp, Symbol, Side (BUY/SELL), Entry Price, Exit Price, Quantity, P&L, P&L %, Duration, Strategy
   - Sortable columns
   - Pagination (50 trades per page)
   - Export to CSV button

3. **Trade Details Modal**
   - Full trade lifecycle
   - Entry/exit reasons (signal details)
   - Slippage and fees breakdown
   - Chart showing price action during trade
   - Risk metrics (R-multiple, risk amount)

**Metrics Summary:**
- Total trades
- Win rate
- Average win vs. average loss
- Profit factor
- Best/worst trade

### 3.4 Backtest Results Page

**Purpose:** View historical backtest performance and validation

**Components:**
1. **Backtest List**
   - Date run, strategy, symbol, timeframe
   - Key metrics: Sharpe, profit factor, max drawdown
   - Status: PASSED (green), FAILED (red), PENDING (yellow)
   - View details button

2. **Backtest Details View**
   - Configuration used
   - Performance metrics table
   - Equity curve chart
   - Drawdown chart
   - Monthly returns heatmap
   - Trade distribution histogram

3. **Monte Carlo Results**
   - Confidence intervals (95%, 99%)
   - Worst-case scenario projection
   - Probability of profit chart

4. **Walk-Forward Analysis**
   - In-sample vs. out-of-sample performance
   - Consistency score
   - Overfitting detection

**Actions:**
- Run new backtest (opens configuration modal)
- Compare multiple backtests
- Export results to PDF
- Deploy strategy (if validation passed)

### 3.5 Risk Management Page

**Purpose:** Monitor and configure risk parameters

**Components:**
1. **Risk Metrics Dashboard**
   - Current drawdown (with max limit bar)
   - Daily loss limit (with progress bar)
   - Open risk exposure (% of account)
   - Correlation between positions

2. **Circuit Breaker Status**
   - Active breakers list
   - Trigger conditions
   - Time until reset
   - Manual override (requires password)

3. **Position Sizing Calculator**
   - Interactive tool to calculate position size
   - Inputs: account balance, risk %, stop-loss distance
   - Output: position size in units and $

4. **Risk Configuration**
   - Max risk per trade (slider: 1-5%)
   - Max daily loss limit
   - Max drawdown limit
   - Max open positions
   - Correlation limits

5. **Risk Alerts Log**
   - Recent risk events
   - Timestamp, type, severity, action taken

### 3.6 Settings Page

**Purpose:** System configuration and preferences

**Sections:**
1. **API Configuration**
   - Exchange API keys (masked)
   - Test connection button
   - API rate limits display

2. **Notification Settings**
   - Email alerts (trade executed, error, circuit breaker)
   - Telegram bot integration
   - Alert thresholds

3. **Display Preferences**
   - Theme (light/dark)
   - Currency display (USD, BTC)
   - Timezone
   - Number formatting

4. **Database Management**
   - Backup database button
   - Clear old trades (with confirmation)
   - Export all data

5. **System Information**
   - Application version
   - Last deployment date
   - Database status
   - Kafka status

## 4. Component Design Specifications

### 4.1 Color Palette

**Dark Mode (Primary):**
- Background: `#0a0e27` (dark blue-black)
- Surface: `#1a1f3a` (lighter blue-black)
- Primary: `#00d4ff` (cyan)
- Success: `#00ff88` (bright green)
- Error: `#ff4757` (red)
- Warning: `#ffa502` (orange)
- Text Primary: `#ffffff`
- Text Secondary: `#8b93b0`

**Light Mode:**
- Background: `#f5f7fa`
- Surface: `#ffffff`
- Primary: `#0066cc`
- Success: `#00c853`
- Error: `#d32f2f`
- Warning: `#ff9800`
- Text Primary: `#1a1a1a`
- Text Secondary: `#666666`

### 4.2 Typography
- **Headings:** Inter, sans-serif (bold)
- **Body:** Inter, sans-serif (regular)
- **Monospace:** JetBrains Mono (for prices, IDs)

**Sizes:**
- H1: 32px (page titles)
- H2: 24px (section headers)
- H3: 18px (card titles)
- Body: 14px
- Small: 12px (labels, timestamps)

### 4.3 Key UI Components

#### Account Balance Display
```tsx
<Card>
  <Typography variant="h3">Account Balance</Typography>
  <Typography variant="h1" color="primary">
    $1,234.56
  </Typography>
  <Typography variant="body2" color="success">
    +$45.23 (+3.8%) Today
  </Typography>
</Card>
```

#### Strategy Status Badge
```tsx
<Chip 
  label="RUNNING" 
  color="success" 
  icon={<PlayArrowIcon />}
/>
```

#### Trade P&L Cell
```tsx
<TableCell>
  <Typography 
    color={pnl >= 0 ? 'success' : 'error'}
    fontWeight="bold"
  >
    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} 
    ({pnlPercent.toFixed(2)}%)
  </Typography>
</TableCell>
```

#### Risk Meter
```tsx
<LinearProgress 
  variant="determinate" 
  value={currentRisk / maxRisk * 100}
  color={currentRisk > maxRisk * 0.8 ? 'error' : 'primary'}
/>
<Typography variant="caption">
  {currentRisk.toFixed(1)}% / {maxRisk}% Max Risk
</Typography>
```

## 5. Real-Time Data Flow

### 5.1 WebSocket Events

**Server → Client:**
- `trade.executed` - New trade completed
- `position.updated` - Position P&L changed
- `balance.updated` - Account balance changed
- `strategy.status` - Strategy started/stopped
- `risk.alert` - Risk threshold breached
- `system.error` - System error occurred

**Client → Server:**
- `strategy.start` - Start trading strategy
- `strategy.stop` - Stop trading strategy
- `position.close` - Manually close position
- `subscribe.trades` - Subscribe to trade updates
- `unsubscribe.trades` - Unsubscribe from updates

### 5.2 REST API Endpoints

**Strategy Management:**
- `POST /api/strategies/start` - Start strategy
- `POST /api/strategies/stop` - Stop strategy
- `GET /api/strategies/status` - Get strategy status
- `GET /api/strategies/list` - List all strategies

**Trade Data:**
- `GET /api/trades/history` - Get trade history (paginated)
- `GET /api/trades/{id}` - Get trade details
- `GET /api/trades/stats` - Get trade statistics

**Backtest:**
- `POST /api/backtest/run` - Run new backtest
- `GET /api/backtest/results` - List backtest results
- `GET /api/backtest/{id}` - Get backtest details

**Account:**
- `GET /api/account/balance` - Get current balance
- `GET /api/account/portfolio` - Get portfolio breakdown
- `GET /api/account/performance` - Get performance metrics

**Risk:**
- `GET /api/risk/status` - Get risk metrics
- `PUT /api/risk/config` - Update risk configuration
- `GET /api/risk/alerts` - Get risk alerts

## 6. State Management

### 6.1 Redux Store Structure
```typescript
{
  auth: {
    isAuthenticated: boolean,
    user: User | null
  },
  account: {
    balance: number,
    portfolio: Position[],
    performance: PerformanceMetrics
  },
  strategies: {
    active: Strategy[],
    status: Record<string, StrategyStatus>
  },
  trades: {
    history: Trade[],
    pagination: PaginationState,
    filters: TradeFilters
  },
  backtest: {
    results: BacktestResult[],
    current: BacktestResult | null
  },
  risk: {
    metrics: RiskMetrics,
    config: RiskConfig,
    alerts: RiskAlert[]
  },
  ui: {
    theme: 'light' | 'dark',
    sidebarOpen: boolean,
    notifications: Notification[]
  },
  websocket: {
    connected: boolean,
    lastUpdate: timestamp
  }
}
```

### 6.2 RTK Query API Slices
- `strategyApi` - Strategy management endpoints
- `tradeApi` - Trade data endpoints
- `backtestApi` - Backtest endpoints
- `accountApi` - Account data endpoints
- `riskApi` - Risk management endpoints

## 7. Responsive Design

### 7.1 Breakpoints
- **Mobile:** < 600px
- **Tablet:** 600px - 960px
- **Desktop:** > 960px

### 7.2 Mobile Adaptations
- Sidebar collapses to hamburger menu
- Cards stack vertically
- Tables become scrollable or card-based
- Charts resize to fit screen
- Bottom navigation for key actions

### 7.3 Touch Interactions
- Swipe to refresh data
- Long-press for context menu
- Pull-to-refresh on mobile
- Touch-friendly button sizes (min 44x44px)

## 8. Performance Optimization

### 8.1 Code Splitting
- Lazy load pages with React.lazy()
- Separate bundle for charts library
- Separate bundle for backtest analysis

### 8.2 Data Optimization
- Virtualized lists for large trade history
- Debounced search inputs
- Cached API responses (5-minute TTL)
- Optimistic UI updates

### 8.3 Real-Time Updates
- Throttle WebSocket updates (max 1/second)
- Batch multiple updates
- Only update visible components
- Pause updates when tab inactive

## 9. Security Considerations

### 9.1 Authentication
- JWT-based authentication
- Refresh token rotation
- Session timeout (30 minutes)
- Remember me option (7 days)

### 9.2 Authorization
- Role-based access control (RBAC)
- Roles: ADMIN, TRADER, VIEWER
- Protected routes with route guards
- API key management (view-only for viewers)

### 9.3 Data Protection
- HTTPS only
- API keys never logged
- Sensitive data masked in UI
- XSS protection (sanitize inputs)
- CSRF tokens for mutations

## 10. Error Handling

### 10.1 Error Types
- **Network Errors:** Connection lost, timeout
- **API Errors:** 4xx, 5xx responses
- **Validation Errors:** Invalid input
- **Business Logic Errors:** Insufficient balance, risk limit exceeded

### 10.2 Error Display
- Toast notifications for transient errors
- Modal dialogs for critical errors
- Inline validation messages
- Error boundary for React crashes

### 10.3 Error Recovery
- Automatic retry for network errors (3 attempts)
- Reconnect WebSocket on disconnect
- Fallback to cached data
- Clear error state on user action

## 11. Accessibility (WCAG 2.1 AA)

### 11.1 Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Skip to main content link
- Keyboard shortcuts for common actions

### 11.2 Screen Reader Support
- Semantic HTML elements
- ARIA labels for icons
- Live regions for real-time updates
- Alt text for charts (data table fallback)

### 11.3 Visual Accessibility
- Minimum contrast ratio 4.5:1
- Color not sole indicator (use icons + text)
- Resizable text (up to 200%)
- Focus indicators visible

## 12. Testing Strategy

### 12.1 Unit Tests
- Component rendering
- User interactions (click, input)
- State management logic
- Utility functions

### 12.2 Integration Tests
- API integration with mock server
- WebSocket connection handling
- Redux store interactions
- Form submissions

### 12.3 E2E Tests (Playwright)
- Critical user flows:
  - Login → View dashboard
  - Start strategy → Monitor trades
  - View trade history → Export CSV
  - Run backtest → View results

### 12.4 Visual Regression Tests
- Screenshot comparison for key pages
- Detect unintended UI changes
- Test across browsers (Chrome, Firefox, Safari)

## 13. Deployment

### 13.1 Build Process
```bash
# Install dependencies
npm install

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

### 13.2 Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
VITE_ENV=production
```

### 13.3 Hosting Options
- **Static Hosting:** Vercel, Netlify, AWS S3 + CloudFront
- **Container:** Docker + Nginx
- **CDN:** CloudFlare for global distribution

### 13.4 CI/CD Pipeline
1. Run linter (ESLint)
2. Run tests (Vitest)
3. Build production bundle
4. Run E2E tests
5. Deploy to staging
6. Manual approval
7. Deploy to production

## 14. Future Enhancements

### Phase 1 (MVP)
- Dashboard with real-time updates
- Strategy start/stop controls
- Trade history view
- Basic backtest results

### Phase 2
- Advanced charting (TradingView integration)
- Multi-strategy comparison
- Custom alerts and notifications
- Mobile app (React Native)

### Phase 3
- Strategy builder (visual editor)
- Machine learning insights
- Social trading features
- Advanced analytics (cohort analysis)

### Phase 4
- Multi-exchange support
- Portfolio optimization tools
- Tax reporting
- API for third-party integrations

## 15. Development Guidelines

### 15.1 Code Style
- Use TypeScript strict mode
- Follow Airbnb React style guide
- Use functional components + hooks
- Prefer composition over inheritance

### 15.2 Component Structure
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

### 15.3 File Organization
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Buttons, inputs, cards
│   ├── charts/         # Chart components
│   └── layout/         # Header, sidebar, footer
├── pages/              # Page components
│   ├── Dashboard/
│   ├── Strategies/
│   └── Trades/
├── features/           # Redux slices
│   ├── account/
│   ├── strategies/
│   └── trades/
├── hooks/              # Custom React hooks
├── services/           # API clients
├── utils/              # Helper functions
├── types/              # TypeScript types
└── App.tsx             # Root component
```

## 16. Monitoring & Analytics

### 16.1 Application Monitoring
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)
- User session recording (LogRocket)
- Uptime monitoring (Pingdom)

### 16.2 User Analytics
- Page views and navigation flow
- Feature usage (which strategies most used)
- User engagement metrics
- Conversion funnel (signup → first trade)

### 16.3 Business Metrics
- Active users (DAU, MAU)
- Trading volume
- Strategy performance distribution
- User retention rate

---

## Appendix A: API Response Examples

### Trade Object
```json
{
  "id": "trade-123",
  "symbol": "BTC/USDT",
  "strategy": "bollinger-bands",
  "side": "BUY",
  "entryPrice": 45000.00,
  "exitPrice": 46500.00,
  "quantity": 0.1,
  "entryTime": "2024-03-08T10:30:00Z",
  "exitTime": "2024-03-08T14:45:00Z",
  "pnl": 150.00,
  "pnlPercent": 3.33,
  "fees": 9.15,
  "slippage": 2.75,
  "netPnl": 138.10,
  "riskAmount": 90.00,
  "rMultiple": 1.53,
  "stopLoss": 44100.00,
  "takeProfit": 46800.00,
  "exitReason": "TAKE_PROFIT"
}
```

### Strategy Status
```json
{
  "strategyId": "bollinger-bands-1",
  "name": "Bollinger Bands Mean Reversion",
  "status": "RUNNING",
  "symbol": "BTC/USDT",
  "timeframe": "1h",
  "startedAt": "2024-03-08T09:00:00Z",
  "tradesCount": 15,
  "winRate": 0.60,
  "totalPnl": 450.25,
  "currentDrawdown": 0.05,
  "lastTradeAt": "2024-03-08T14:45:00Z"
}
```

### Backtest Result
```json
{
  "id": "backtest-456",
  "strategy": "bollinger-bands",
  "symbol": "BTC/USDT",
  "timeframe": "1h",
  "startDate": "2022-01-01",
  "endDate": "2024-01-01",
  "initialBalance": 10000.00,
  "finalBalance": 15234.50,
  "totalReturn": 0.52,
  "sharpeRatio": 1.45,
  "profitFactor": 1.85,
  "winRate": 0.58,
  "maxDrawdown": 0.18,
  "totalTrades": 245,
  "avgWin": 125.50,
  "avgLoss": -68.20,
  "validationStatus": "PASSED",
  "createdAt": "2024-03-08T08:00:00Z"
}
```

---

**Document Version:** 1.0  
**Last Updated:** March 8, 2024  
**Author:** Algorithmic Trading Bot Team
