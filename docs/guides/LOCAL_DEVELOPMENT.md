# Local Development

Use this guide for local setup, runtime scripts, Docker, Compose, Gradle wrapper usage, and MCP tooling.

## Recommended Flow

From the repo root:

```powershell
.\build.ps1
.\run.ps1
.\stop.ps1
```

Use `.\run-all.ps1` and `.\stop-all.ps1` when you want the Docker-backed full stack instead of a locally started backend.

## Runtime Modes

### Fast Dev Mode

`.\run.ps1`:

- stops tracked frontend and backend processes first
- starts PostgreSQL in Docker
- runs the backend locally
- runs the frontend locally
- auto-matches backend relaxed auth to frontend `VITE_DEV_AUTH_BYPASS` for local-only debugging
- waits for both services to be ready
- rolls back partial startup if a later stage fails

### Full-Stack Mode

`.\run-all.ps1`:

- stops tracked local processes first
- starts the backend and PostgreSQL in Docker
- runs the frontend locally
- auto-matches backend relaxed auth to frontend `VITE_DEV_AUTH_BYPASS` for local-only debugging
- waits for both services to be ready
- rolls back partial startup if startup fails

Important rule: never start a frontend or backend dev server until existing instances have been checked and stopped first.

## Common Commands

```powershell
.\build.ps1
.\run.ps1
.\stop.ps1
.\build-all.ps1
.\run-all.ps1
.\stop-all.ps1
.\security-scan.ps1
```

Useful variants:

```powershell
.\run.ps1 -DebugBackend
.\run.ps1 -DebugBackend -SuspendBackend
.\run-all.ps1 -DebugBackend
```

## Gradle Wrapper Notes

Run backend Gradle commands from `AlgotradingBot/` with `.\gradlew.bat`:

```powershell
cd AlgotradingBot
.\gradlew.bat javaMigrationAudit --no-daemon
.\gradlew.bat test
.\gradlew.bat build
.\gradlew.bat bootRun
```

Rules:

- use the wrapper, not a system `gradle`
- prefer the narrowest useful task first
- run `test` and `build` sequentially, not in parallel
- use `javaMigrationAudit` for JDK-sensitive or toolchain-sensitive backend work

## Ports And Paths

- Frontend: `5173`
- Backend: `8080`
- PostgreSQL: `5432`
- Logs and runtime state: `.runtime`
- PID tracking: `.pids`

The local JWT secret is stored in `.runtime/local-jwt-secret.txt` and reused across local restarts.
When `frontend/.env` enables `VITE_DEV_AUTH_BYPASS=true`, the PowerShell run scripts also set `ALGOTRADING_RELAXED_AUTH=true` so the local backend accepts the same debug posture. If you start the backend manually with `.\gradlew.bat bootRun`, set that env var yourself or turn frontend bypass off.

## Docker And Compose

- Compose project name: `algotradingbot`
- Named PostgreSQL volume: `algotradingbot_postgres_data`
- Compose file: `AlgotradingBot/compose.yaml`

Direct Compose example:

```powershell
$env:JWT_SECRET = (Get-Content .\.runtime\local-jwt-secret.txt -Raw).Trim()
docker compose --project-name algotradingbot -f .\AlgotradingBot\compose.yaml build algotrading-app
```

## MCP Tooling

Preferred Docker MCP set for this repo:

- `playwright`
- `context7`
- `database-server`
- `openapi-schema`
- `semgrep`
- `hoverfly-mcp-server`

Useful checks:

```powershell
docker mcp server ls
docker mcp config dump
docker mcp tools ls --format list
```

Conventions:

- Docker-visible workspace paths use `/C/Git/algotradingbot/...`
- Host callbacks use `host.docker.internal`
- Hoverfly state belongs under `/C/Git/algotradingbot/.runtime/hoverfly`

## Codex Runbook

Use the MCP that removes the most guesswork for the specific task:

- `context7`: current framework and library documentation
- `openapi-schema`: inspect or verify the backend contract before changing frontend types
- `database-server`: inspect PostgreSQL runtime state, job rows, and dataset coverage
- `hoverfly-mcp-server`: mock provider or exchange HTTP flows without patching production code paths
- `semgrep`: optional request-boundary, auth, or secrets-focused verification
- `playwright`: browser verification for the actual SPA, especially `Market Data` and `Backtest`

Preferred Codex verification order:

1. narrow local tests first
2. contract generation/check when API surfaces move
3. runtime DB inspection only when behavior depends on persisted state
4. browser automation after the page exposes stable selectors or labels

Frontend automation-friendly selectors now exist on the main provider-import and backtest workflow surfaces. Prefer `browser_snapshot` before `browser_click` so Codex targets the current accessible node refs instead of stale coordinates.

## Playwright Fix

On Windows, `playwright` can fail if `HOME` or `CODEX_HOME` is unset and the runtime falls back to `C:\Windows\System32`. Configure a user-writable home once:

```powershell
[Environment]::SetEnvironmentVariable('HOME', $env:USERPROFILE, 'User')
[Environment]::SetEnvironmentVariable('CODEX_HOME', (Join-Path $env:USERPROFILE '.codex'), 'User')
New-Item -ItemType Directory -Force -Path (Join-Path $env:USERPROFILE '.codex') | Out-Null
```

Then restart the Codex desktop app before retrying browser automation.

Minimal Playwright smoke expectation after restart:

1. navigate to the local frontend
2. capture `browser_snapshot`
3. click one labeled control on `Market Data` or `Backtest`
4. confirm follow-up interaction with another snapshot

If Playwright still opens the page but cannot click, re-check the user environment variables and confirm the desktop app was restarted after the change.
