# Local Dev, Docker, and MCP Guide

Read this guide when the task touches local runtime scripts, Docker, PowerShell orchestration, or Codex tooling.

## Runtime Modes

Fast dev mode (`.\run.ps1`):

- Starts PostgreSQL in Docker
- Runs the backend locally with `.\gradlew.bat --no-daemon bootRun`
- Runs the frontend locally with `npm run dev`
- Supports opt-in local backend debug via `-DebugBackend`, `-DebugPort`, and `-SuspendBackend`
- Writes backend file logs to repo-local untracked storage under `.runtime/logs`

Full-stack mode (`.\run-all.ps1`):

- Starts `algotrading-app`, PostgreSQL, and Kafka in Docker
- Supports opt-in Docker backend debug via `.\run-all.ps1 -DebugBackend` and `compose.debug.yaml`
- Runs the frontend locally with `npm run dev`

## Compose Identity and Volumes

The compose stack uses the explicit project name `algotradingbot`. This keeps container and volume naming stable regardless of the caller or working directory.

Named volumes:

- `algotradingbot_postgres_data`
- `algotradingbot_kafka_data`
- `algotradingbot_kafka_secrets`

The Kafka secrets mount is intentionally named so repeated runs do not create new anonymous volumes.

## Common Commands

Fast mode:

```powershell
.\build.ps1
.\run.ps1
.\stop.ps1
```

Full stack:

```powershell
.\build-all.ps1
.\run-all.ps1
.\stop-all.ps1
.\security-scan.ps1
```

Debug examples:

```powershell
.\run.ps1 -DebugBackend
.\run.ps1 -DebugBackend -SuspendBackend
.\run-all.ps1 -DebugBackend
```

Direct Compose access:

```powershell
docker compose --project-name algotradingbot -f .\AlgotradingBot\compose.yaml ps
docker compose --project-name algotradingbot -f .\AlgotradingBot\compose.yaml logs
docker compose --project-name algotradingbot -f .\AlgotradingBot\compose.yaml down
docker compose --project-name algotradingbot -f .\AlgotradingBot\compose.yaml -f .\AlgotradingBot\compose.debug.yaml up -d
```

## Java 25 Runtime Notes

- `build.ps1`, `build-all.ps1`, `run.ps1`, and `run-all.ps1` print the locally detected Java version before starting work.
- Docker builds and runtime images now use Temurin Java 25 (`eclipse-temurin:25-jdk-jammy` and `eclipse-temurin:25-jre-jammy`).
- The default runtime database path is Liquibase-first plus `spring.jpa.hibernate.ddl-auto=validate`; use `SPRING_JPA_HIBERNATE_DDL_AUTO` only as an explicit override.
- `JAVA_DEBUG_OPTS` is empty by default and is only injected by `compose.debug.yaml`.

## Docker Cleanup Policy

- Cleanup is explicit, not automatic.
- One-time aggressive cleanup:

```powershell
docker system prune -a --volumes -f
```

- Use that only when you intentionally want to remove globally unused images, containers, volumes, and build cache.

## Memory And Reclaim Behavior

- Gradle keeps parallel execution enabled, but its reusable daemon heap is now reduced and its idle timeout is 15 minutes so memory is released sooner after builds stop.
- `run.ps1` uses `--no-daemon` for the long-running local backend path so it does not leave a reusable Gradle daemon behind after you stop the dev session.
- Local backend file logs are redirected to `.runtime/logs`, which keeps noisy runtime output out of tracked files.
- Docker/WSL memory is configured for reclaim rather than a low hard cap on this machine.

Recommended user-level WSL config on this workstation:

```ini
[wsl2]
swap=2GB
pageReporting=true

[experimental]
autoMemoryReclaim=gradual
```

Apply changes with:

```powershell
wsl --shutdown
```

## Persistent Free Docker MCP Set

Enabled free servers intended to help this repository:

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

## MCP Conventions for This Machine

- Docker-visible workspace paths use `/C/Git/algotradingbot/...`, not `C:\Git\algotradingbot\...`.
- Docker MCP tools that connect back to the host machine should use `host.docker.internal`, not `localhost`.
- Hoverfly simulation state is stored under `/C/Git/algotradingbot/.runtime/hoverfly`.
- The persistent database server points at:

```text
postgresql+asyncpg://postgres:postgres@host.docker.internal:5432/algotrading
```

- The persistent OpenAPI server points at:

```text
/C/Git/algotradingbot/contracts/openapi.json
```

## When To Use Which MCP Server

- `context7`: framework/library docs that may have changed since training time
- `database-server`: inspect runtime PostgreSQL tables and data quickly
- `openapi-schema`: contract inspection for backend/frontend API work
- `playwright`: UI verification when browser automation is the fastest path
- `semgrep`: optional static security scan when auth, secrets, HTTP boundaries, or dependency-sensitive code changes
- `hoverfly-mcp-server`: optional mock-provider/exchange simulation when third-party APIs are unstable or unavailable

## Semgrep Trigger Rules

Run `.\security-scan.ps1` for any task that changes:

- auth or session handling
- secret storage or credential loading
- process execution or shelling out
- Docker, PowerShell, or orchestration automation
- WebSocket or HTTP boundary parsing

Use `.\security-scan.ps1 -FailOnFindings` when you are closing a security-sensitive task and want a zero-findings gate.

## Hoverfly Operator Flow

Use Hoverfly only for local provider or exchange simulation. Do not treat it as a substitute for real integration verification.

Typical flow:

1. Start the server from the Docker MCP toolset.
2. Add mocks or import a captured simulation for the provider or exchange flow under test.
3. List mocks to confirm the expected simulation is loaded.
4. Point the local integration path at the Hoverfly endpoint and run the targeted verification.
5. Clear mocks when the task is done so the next session starts from a known state.
6. Stop Hoverfly when you no longer need API simulation.
