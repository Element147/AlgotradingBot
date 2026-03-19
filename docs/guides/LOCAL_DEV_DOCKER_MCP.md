# Local Dev, Docker, And MCP Guide

Use this guide for local runtime scripts, Docker, Compose, PowerShell orchestration, or Codex tooling.

## Runtime Modes

### Fast Dev Mode

`.\run.ps1`:

- stops any tracked backend and frontend processes first
- checks ports `8080` and `5173`
- starts PostgreSQL in Docker
- runs the backend locally with `.\gradlew.bat --no-daemon bootRun`
- runs the frontend locally with `npm run dev`
- writes backend logs to `.runtime/logs`

`.\stop.ps1`:

- stops tracked backend and frontend processes
- frees ports `8080` and `5173`
- stops the PostgreSQL container

### Full-Stack Mode

`.\run-all.ps1`:

- starts `algotrading-app`, PostgreSQL, and Kafka in Docker
- runs the frontend locally
- can enable backend JDWP through `compose.debug.yaml`

`.\stop-all.ps1` tears the full stack down.

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

Debug variants:

```powershell
.\run.ps1 -DebugBackend
.\run.ps1 -DebugBackend -SuspendBackend
.\run-all.ps1 -DebugBackend
```

## Compose Identity

The Compose project name is fixed to `algotradingbot`.

Named volumes:

- `algotradingbot_postgres_data`
- `algotradingbot_kafka_data`
- `algotradingbot_kafka_secrets`

Direct Compose examples:

```powershell
docker compose --project-name algotradingbot -f .\AlgotradingBot\compose.yaml ps
docker compose --project-name algotradingbot -f .\AlgotradingBot\compose.yaml logs
docker compose --project-name algotradingbot -f .\AlgotradingBot\compose.yaml down
```

## Runtime Notes

- Java 25 is the backend runtime baseline.
- Docker images use Temurin Java 25.
- Runtime schema management is Liquibase-first with `ddl-auto=validate`.
- Local scripts keep backend logs and runtime state in repo-local untracked directories.
- Fast mode prefers reclaim-friendly memory behavior by using `--no-daemon` for the local backend path.

## Ports And Paths

- Frontend dev server: `5173`
- Backend HTTP: `8080`
- PostgreSQL: `5432`
- Kafka: `9092`
- Managed PID files: `.pids`
- Managed runtime logs and temp state: `.runtime`

## MCP Set

The documented free Docker MCP set for this repo is:

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

Machine conventions:

- Docker-visible workspace paths use `/C/Git/algotradingbot/...`
- Host callbacks should use `host.docker.internal`
- OpenAPI MCP points at `/C/Git/algotradingbot/contracts/openapi.json`
- Hoverfly state belongs under `/C/Git/algotradingbot/.runtime/hoverfly`

## Semgrep Trigger Rules

Run `.\security-scan.ps1` when changing:

- auth or session handling
- secret or credential storage
- process execution or shelling out
- Docker, PowerShell, or orchestration code
- WebSocket or HTTP request parsing

Use `.\security-scan.ps1 -FailOnFindings` when you want a zero-findings gate.

## Hoverfly Usage

Use Hoverfly only for local provider or exchange simulation.

Typical flow:

1. Start Hoverfly from the Docker MCP toolset.
2. Load or create the mock behavior you need.
3. Point the integration path at Hoverfly.
4. Run the targeted verification.
5. Clear mocks and stop Hoverfly when finished.
