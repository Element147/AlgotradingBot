# Optional Guides

These guides are intentionally task-specific. Open only the ones relevant to the task so Codex and human readers do not load unnecessary context.

## Guide Index

- `FRONTEND_IMPLEMENTATION.md`
  Tags: `frontend`, `react`, `vite`, `rtk-query`, `mui`
  Open for: component work, feature modules, API-slice adaptation, dashboard/settings UX
  Example: "Add a new backtest chart control without changing the backend"
- `BACKEND_IMPLEMENTATION.md`
  Tags: `backend`, `spring`, `service`, `repository`, `dto`, `precision`
  Open for: controller/service/repository work, DTO boundaries, persistence behavior, risk logic
  Example: "Add a new dataset summary field to a backend response"
- `LOCAL_DEV_DOCKER_MCP.md`
  Tags: `runtime`, `docker`, `wsl`, `powershell`, `mcp`, `memory`
  Open for: local start/stop issues, Docker volume behavior, WSL reclaim, MCP setup, script changes
  Example: "Why is Docker holding memory after the stack is idle?"
- `TESTING_AND_CONTRACTS.md`
  Tags: `verification`, `ci`, `openapi`, `contract`, `security-scan`
  Open for: backend/frontend verification, contract drift, local CI parity, optional Semgrep scans
  Example: "The frontend type contract changed after a controller update"
- `MARKET_DATA_RESEARCH.md`
  Tags: `market-data`, `providers`, `imports`, `research`, `mocking`
  Open for: provider credentials, download/import jobs, dataset research workflow, mock-provider planning
  Example: "Add a new free data provider or simulate an exchange dependency"

## Task Shortcuts

- Frontend-only UI change: `FRONTEND_IMPLEMENTATION.md`
- Backend API change: `BACKEND_IMPLEMENTATION.md` and `TESTING_AND_CONTRACTS.md`
- Runtime or Docker issue: `LOCAL_DEV_DOCKER_MCP.md`
- Contract drift or generated types: `TESTING_AND_CONTRACTS.md`
- Provider/import/mocking work: `MARKET_DATA_RESEARCH.md` and `LOCAL_DEV_DOCKER_MCP.md`
