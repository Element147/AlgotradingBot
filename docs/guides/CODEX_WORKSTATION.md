# Codex Workstation

Use this guide for the repo-specific Codex development setup, local home bootstrap, repo-owned skills, project-local agents, and MCP routing for `C:\Git\algotradingbot`.

## Workstation Shape

This workstation has two layers:

- Repo-tracked layer: `C:\Git\algotradingbot`
  - `.codex/agents/`: project-local agent pack
  - `.codex/skills/`: repo-owned skills for this repository
  - `.\setup-codex.ps1`: local-home bootstrap and repo-skill sync
  - `.\test-codex.ps1`: workstation verification
- Local-home layer: `C:\Users\Klaub\.codex`
  - `config.toml`: Codex client settings and MCP gateway config
  - `skills\`: installed system, curated, and repo-owned skills
  - `vendor_imports\skills\skills\.curated\`: cached curated skills used by setup

Default local-home assumptions for this repo:

- `HOME = C:\Users\Klaub`
- `CODEX_HOME = C:\Users\Klaub\.codex`
- `features.js_repl = true`

## Bootstrap

Run this once from the repo root:

```powershell
.\setup-codex.ps1
```

What it does:

- sets user-level `HOME` and `CODEX_HOME` to the repo baseline, correcting stale or wrong values instead of leaving them pointed at old locations
- ensures `C:\Users\Klaub\.codex` exists
- merges `js_repl = true` into `C:\Users\Klaub\.codex\config.toml` without replacing the existing model, MCP, or sandbox configuration
- installs a local Playwright launcher under `$CODEX_HOME\scripts\` and points the `playwright` MCP entry at it so browser automation does not depend on the desktop app inheriting the right `HOME` or current working directory
- syncs repo-owned skills from `.codex/skills/` into `$CODEX_HOME/skills/`
- installs the lean local-only curated skills used by this repo:
  - `playwright`
  - `playwright-interactive`
  - `screenshot`

After the script completes, restart the Codex desktop app so the client picks up:

- persisted `HOME` and `CODEX_HOME`
- `js_repl`
- new skills under `$CODEX_HOME/skills`

## Verification

Run this from the repo root after bootstrap:

```powershell
.\test-codex.ps1
```

The check requires:

- user-level `HOME` and `CODEX_HOME` to match the repo baseline
- both user-level paths to exist and not point into `C:\Windows\...`, because the local Playwright connector needs a user-writable home
- `C:\Users\Klaub\.codex\config.toml` to still contain the existing Docker MCP config, point `playwright` at the repo-managed launcher, and include `features.js_repl = true`
- `C:\Users\Klaub\.codex\scripts\start-playwright-mcp.ps1` to exist and pin `HOME`, `CODEX_HOME`, and `PLAYWRIGHT_MCP_OUTPUT_DIR` before starting `@playwright/mcp@latest`
- Docker MCP availability for:
  - `context7`
  - `database-server`
  - `hoverfly-mcp-server`
  - `openapi-schema`
  - `playwright`
  - `semgrep`
- Docker MCP config paths to still point at:
  - `/C/Git/algotradingbot/contracts/openapi.json`
  - `postgresql+asyncpg://postgres:postgres@host.docker.internal:5432/algotrading`
  - `/C/Git/algotradingbot/.runtime/hoverfly`
- repo-owned skills to exist under `$CODEX_HOME/skills`

If `HOME` or `CODEX_HOME` are correct at the user level but stale in the current process, the script warns instead of failing. The launcher removes that problem for the local Playwright MCP itself, and it also forces a user-writable MCP output directory because the Codex desktop client can still hand the local connector `C:\Windows\System32` as its cwd. You should still restart the Codex desktop app after setup so the rest of the client picks up the same environment and config.

## Browser Addressing Rule

Use the browser URL that matches where Playwright is running:

- local or desktop Playwright connector: `http://localhost:5173`
- Docker or other container-hosted browser: `http://host.docker.internal:5173`

Apply the same rule to backend URLs such as `8080`. A container browser cannot reach host-only `localhost` bindings.

## Repo-Owned Skills

These skills live in `.codex/skills/` in the repo and are synced into `$CODEX_HOME/skills/` by `.\setup-codex.ps1`.

### `algotrading-cockpit`

Use for general repo work when you need:

- the mandatory doc read order
- guide selection by task type
- MCP choice by task
- safe verification order
- repo guardrails and stop-before-start rules

### `algotrading-ui-qa`

Use for frontend and browser verification when you need:

- a Playwright-first loop for the SPA
- route-level QA on `Market Data`, `Backtest`, `Risk`, or the shared shell
- console and network inspection guidance
- screenshot fallback only when browser-native capture is not enough

## Curated Skills In Baseline

The lean default workstation adds only three curated skills:

- `playwright`: browser automation from the terminal
- `playwright-interactive`: persistent Playwright + `js_repl` debugging
- `screenshot`: desktop-level fallback capture

These are baseline because they materially improve local frontend and runtime debugging without introducing external auth dependencies.

## Agents And MCP Routing

Project-local agents live in `.codex/agents/` and override global agents with the same names.

Recommended task routing:

| Task | Agent | Preferred MCP |
| --- | --- | --- |
| Strategy, backtest, paper-trading, market-data realism | `quant-trader` | `database-server`, `hoverfly-mcp-server`, `context7` |
| Frontend route behavior, React state, MUI interaction flow | `react-specialist` | `playwright`, `openapi-schema` |
| Backend controller/service/repository or profile work | `spring-boot-engineer` | `openapi-schema`, `database-server` |
| Runtime scripts, Windows orchestration, process control | `powershell-5.1-expert` | `semgrep` when security-sensitive |
| PR-style review, regressions, missing tests | `reviewer` | task-specific MCP, usually `openapi-schema`, `playwright`, or `database-server` |
| Auth, secrets, request-boundary, infrastructure exposure | `security-auditor` | `semgrep`, plus task-specific MCP |
| Version-specific framework or library verification | `docs-researcher` | `context7`, then primary docs |

General MCP rules:

- `context7`: framework and library questions with version sensitivity
- `openapi-schema`: contract inspection before frontend transport changes
- `database-server`: persisted workflow or runtime-state inspection
- `playwright`: browser verification for the actual SPA
- `hoverfly-mcp-server`: provider or exchange mock flows
- `semgrep`: auth, secrets, Docker, PowerShell, and request-boundary changes

## Optional Extras

These are intentionally not part of the default bootstrap:

- GitHub app/plugin flows
- Figma design-to-code tooling
- Jam bug-report tooling
- Sentry issue and event tooling

Treat them as explicit opt-in extras when the repo actually needs them. The default workstation remains local-first and auth-light.
