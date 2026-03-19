# Optional Guides

Read the slim core docs first:

1. `README.md`
2. `PROJECT_STATUS.md`
3. `ARCHITECTURE.md`
4. `TRADING_GUARDRAILS.md`
5. `PLAN.md`
6. `PRODUCT.md`

Then open only the guide that matches the task.

## Guide Index

- `FRONTEND_IMPLEMENTATION.md`
  Use for: React routes, feature modules, RTK Query adaptation, UI state, dashboard or settings work
- `BACKEND_IMPLEMENTATION.md`
  Use for: controllers, services, repositories, DTOs, persistence, risk logic, and execution services
- `LOCAL_DEV_DOCKER_MCP.md`
  Use for: scripts, Docker, Compose, WSL, MCP setup, logs, ports, or debug flows
- `TESTING_AND_CONTRACTS.md`
  Use for: verification strategy, CI parity, OpenAPI generation, contract drift, and Semgrep usage
- `MARKET_DATA_RESEARCH.md`
  Use for: providers, import jobs, credentials, dataset ingestion, and mock-provider workflows

## Quick Routing

- Frontend-only UI change: `FRONTEND_IMPLEMENTATION.md`
- Backend API or service change: `BACKEND_IMPLEMENTATION.md`
- Contract boundary change: `BACKEND_IMPLEMENTATION.md` and `TESTING_AND_CONTRACTS.md`
- Runtime or Docker issue: `LOCAL_DEV_DOCKER_MCP.md`
- Market-data provider or import work: `MARKET_DATA_RESEARCH.md`

Research appendices such as `docs/GREENFIELD_SMALL_ACCOUNT_STRATEGY_BLUEPRINT.md` and `docs/SMALL_ACCOUNT_STRATEGY_RESEARCH.md` are intentionally separate from the default implementation context.
