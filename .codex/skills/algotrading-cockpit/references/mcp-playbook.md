# MCP Playbook

Prefer these servers for this repository:

- `context7`: version-specific library and framework documentation.
- `openapi-schema`: inspect the current tracked backend contract before changing frontend transport or DTO expectations.
- `database-server`: inspect PostgreSQL runtime state, dataset coverage, import jobs, and persisted workflow state.
- `playwright`: verify actual SPA flows, especially `Market Data`, `Backtest`, and `Risk`.
- `hoverfly-mcp-server`: mock provider or exchange HTTP dependencies without patching production code paths.
- `semgrep`: verify auth, secrets, request-boundary, Docker, or PowerShell changes.

Task mapping:

- React route or MUI state bug: `playwright`, then `openapi-schema` if transport is involved.
- Spring Boot API or DTO change: `openapi-schema`, then `database-server` if persisted state matters.
- Market-data import or provider behavior: `database-server` plus `hoverfly-mcp-server`.
- Docker, Compose, or local runtime issue: `semgrep` for safety-sensitive edits, plus the repo run/stop scripts.
- Version-specific framework question: `context7` first, then primary docs.

Playwright rule for this repo:

1. snapshot first
2. interact using current refs
3. resnapshot after UI changes
4. inspect console and network when the UI path is flaky
5. fall back to the installed `screenshot` skill only when browser-native capture is insufficient
