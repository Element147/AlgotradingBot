# Project Codex Agents

This repository ships a project-local Codex agent pack in `.codex/agents/` and repo-owned Codex skills in `.codex/skills/`.

These agents are selected from the [VoltAgent awesome-codex-subagents repository](https://github.com/VoltAgent/awesome-codex-subagents) and adapted for this repo where needed. The custom `quant-trader` agent is project-specific and encodes this repository's trading guardrails.

Installed agents:

- `api-designer`
- `architect-reviewer`
- `docker-expert`
- `docs-researcher`
- `fintech-engineer`
- `java-architect`
- `postgres-pro`
- `powershell-5.1-expert`
- `quant-analyst`
- `quant-trader`
- `react-specialist`
- `reviewer`
- `risk-manager`
- `security-auditor`
- `spring-boot-engineer`
- `typescript-pro`
- `websocket-engineer`

Usage notes:

- Project-local agents take precedence over global agents with the same name.
- `AGENTS.md` contains the routing rules that tell Codex when to use these agents without the user naming them explicitly.
- `docs/guides/CODEX_WORKSTATION.md` is the durable runbook for the Codex workstation, repo-owned skills, and MCP routing.
- Restart or refresh Codex after agent or skill changes so new sessions load the updated pack.

Recommended routing:

| Task | Agent | Preferred MCP |
| --- | --- | --- |
| Strategy, backtest, market-data realism, paper-trading behavior | `quant-trader` | `database-server`, `hoverfly-mcp-server`, `context7` |
| React route bugs, async UI state, MUI interactions | `react-specialist` | `playwright`, `openapi-schema` |
| Spring Boot services, DTOs, profiles, controller flows | `spring-boot-engineer` | `openapi-schema`, `database-server` |
| Windows orchestration, run/stop scripts, process control | `powershell-5.1-expert` | `semgrep` when the change is security-sensitive |
| PR-style review and regression hunting | `reviewer` | task-specific MCP, usually `openapi-schema`, `playwright`, or `database-server` |
| Auth, secrets, request-boundary, infrastructure exposure | `security-auditor` | `semgrep`, then task-specific MCP |
| Version-specific framework or library questions | `docs-researcher` | `context7`, then primary docs |
