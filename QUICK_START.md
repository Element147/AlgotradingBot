# Quick Start

## Prerequisites

- Java 25
- Node.js
- Docker Desktop

## Recommended Local Flow

From the repo root:

```powershell
.\build.ps1
.\run.ps1
```

Stop the local stack when finished:

```powershell
.\stop.ps1
```

Optional backend debug:

```powershell
.\run.ps1 -DebugBackend
.\run.ps1 -DebugBackend -SuspendBackend
```

## Local URLs

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8080/actuator/health`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## Where To Look Next

- Runtime, Docker, and MCP details: `docs/guides/LOCAL_DEV_DOCKER_MCP.md`
- Verification and contract workflow: `docs/guides/TESTING_AND_CONTRACTS.md`
- Stack and command reference: `TECH.md`
- Script-driven backend logs: `.runtime/logs/`
