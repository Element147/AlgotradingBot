# Backend Implementation Guide

Read this guide when the task is primarily in `AlgotradingBot/`.

## Architectural Rules

- Keep controller, service, repository, and persistence concerns separated.
- Use DTOs at HTTP boundaries; do not expose JPA entities directly.
- Keep money, prices, fees, PnL, and risk calculations on `BigDecimal`.
- Prefer immutable DTO records where framework constraints allow.
- Keep live exchange integration isolated behind dedicated services and safety gates.

## Primary Packages

- `controller`: HTTP contracts and request handling
- `service`: orchestration and business logic
- `service/marketdata`: provider integrations, retry-aware import orchestration, resampling, and CSV normalization
- `repository`: Spring Data access
- `entity`: persistence models
- `backtest` and `backtest/strategy`: simulation engine and strategy modules
- `risk`: execution-cost and guardrail logic
- `security`, `config`, `validation`, `repair`, `websocket`: platform support

## Implementation Defaults

- New trading or execution behavior must stay mode-gated and fail closed outside supported environments.
- Critical operator actions should remain auditable.
- Reproducibility paths should preserve dataset identity, experiment labeling, and export guardrails.
- Runtime PostgreSQL behavior and test-profile H2 behavior must stay clearly separated.

## Verification

- Start with the narrowest relevant test class.
- Then run:

```powershell
cd AlgotradingBot
.\gradlew.bat test
.\gradlew.bat build
```

- Use `GRADLE_AUTOMATION.md` only when the task needs wrapper-specific execution guidance.

## Useful Companion Docs

- `ARCHITECTURE.md`
- `TRADING_GUARDRAILS.md`
- `docs/guides/TESTING_AND_CONTRACTS.md`
- `docs/guides/MARKET_DATA_RESEARCH.md`
