# Project Codex Agents

This repository ships a project-local Codex agent pack in `.codex/agents/`.

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
- Restart or refresh Codex after agent changes so new sessions load the updated agent pack.
