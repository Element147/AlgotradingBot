# Frontend Dashboard - Algorithmic Trading Bot

Production-grade React TypeScript frontend dashboard for the algorithmic trading bot system. Provides real-time monitoring, strategy management, trade analytics, backtest visualization, and risk management.

## Technology Stack

- **Framework**: React 18+ with TypeScript (strict mode)
- **Build Tool**: Vite
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v6
- **UI Library**: Material-UI (MUI) v5 (to be installed)
- **Charting**: Recharts or Lightweight Charts (to be installed)
- **Testing**: Vitest, React Testing Library, Playwright (to be installed)

## Project Structure

```
src/
├── app/                    # Application setup (Redux store, App.tsx)
├── features/              # Feature modules
│   ├── auth/             # Authentication
│   ├── dashboard/        # Main dashboard
│   ├── strategies/       # Strategy management
│   ├── trades/           # Trade history
│   ├── backtest/         # Backtesting
│   ├── risk/             # Risk management
│   ├── settings/         # System settings
│   └── websocket/        # WebSocket integration
├── components/           # Shared components
│   ├── charts/          # Chart components
│   ├── layout/          # Layout components
│   └── ui/              # UI components
├── hooks/                # Custom hooks
├── services/             # External services (API, WebSocket)
├── utils/                # Utility functions
├── types/                # TypeScript types
└── tests/                # Test utilities
    ├── mocks/
    └── fixtures/
```

## Path Aliases

The project uses path aliases for cleaner imports:

- `@/*` - src directory
- `@/app/*` - Application setup
- `@/features/*` - Feature modules
- `@/components/*` - Shared components
- `@/hooks/*` - Custom hooks
- `@/services/*` - External services
- `@/utils/*` - Utility functions
- `@/types/*` - TypeScript types

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open browser at `http://localhost:5173`

## Key Features

- Dual environment support (Test/Backtest and Live Trading modes)
- Real-time data updates via WebSocket
- Multi-exchange integration (Binance, Coinbase, Kraken)
- Comprehensive strategy management and configuration
- Advanced trade analytics and backtest visualization
- Risk monitoring and circuit breaker management
- Responsive design for mobile, tablet, and desktop

## TypeScript Configuration

The project uses TypeScript strict mode with the following enabled:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

## Next Steps

See `.kiro/specs/frontend-dashboard/tasks.md` for the complete implementation plan.
