# Backend Implementation Guide

Use this guide when the task is primarily in `AlgotradingBot/`.

## Current Backend Scope

The backend owns:

- JWT auth and request authorization
- strategy configuration and lifecycle APIs
- backtest execution, history, comparison, replay, and export support
- dataset inventory, provenance, retention, and downloads
- market-data import jobs and provider credential handling
- paper-trading state, risk controls, exchange profile management, and audit events
- runtime health, backup, validation, and WebSocket event publishing

## Package Boundaries

- `controller`: request and response contracts
- `service`: orchestration and business logic
- `service.marketdata`: provider and import-job logic
- `repository`: database access
- `entity`: runtime persistence models
- `backtest`: simulation engine and analytics model
- `backtest.strategy`: registered backtest strategy implementations
- `risk`: risk status and execution-cost calculations
- `security`: auth components
- `config`, `repair`, `validation`, `websocket`: runtime support

## Main HTTP Surfaces

Representative controller groups:

- Auth: `AuthController`
- Account and environment-aware reads: `AccountController`
- Strategies: `StrategyManagementController`, `TradingStrategyController`
- Backtests and datasets: `BacktestManagementController`
- Market data: `MarketDataController`
- Paper trading: `PaperTradingController`
- Risk: `RiskController`
- Exchange profiles: `ExchangeController`
- System and audit utilities: `SystemController`

Keep response adaptation in DTOs. Do not let entities escape these boundaries.

## Backend Design Rules

1. Keep controller, service, repository, and entity concerns separated.
2. Use `BigDecimal` for money, risk, fees, and price-sensitive calculations.
3. Prefer immutable DTO records where framework constraints allow.
4. Keep live or exchange-connected behavior behind explicit services and environment gates.
5. Keep critical operator actions auditable.
6. Preserve reproducibility for datasets, experiments, and exports.
7. Keep PostgreSQL runtime behavior and H2 test behavior intentionally separate.

## Long-Running Work

The backend currently supports long-running backtests and market-data imports with:

- persisted progress state
- WebSocket event publication
- polling fallback compatibility
- startup recovery for unfinished work
- virtual-thread-backed async execution

When changing these flows, update the corresponding UI progress contracts and runtime docs.

## Persistence And Runtime Notes

- Runtime DB: PostgreSQL with Liquibase-first bootstrap and `ddl-auto=validate`
- Test DB: H2 under the `test` profile
- Backup path: database-native export flow, not placeholder metadata
- Secret storage: encrypted in PostgreSQL when saved through the UI, with environment fallback where supported

## Verification

Start with the narrowest relevant test or package-level check, then expand:

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

Add this when you touch JDK-sensitive, toolchain-sensitive, or migration-sensitive code:

```powershell
.\gradlew.bat javaMigrationAudit --no-daemon
```

## Companion Docs

- `ARCHITECTURE.md`
- `TRADING_GUARDRAILS.md`
- `GRADLE_AUTOMATION.md`
- `docs/guides/TESTING_AND_CONTRACTS.md`
- `docs/guides/MARKET_DATA_RESEARCH.md`
