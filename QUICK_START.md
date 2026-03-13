# Quick Start

## Fast Local Run (Recommended)

From repo root:

```powershell
.\build.ps1
.\run.ps1
```

Stop services:

```powershell
.\stop.ps1
```

## URLs

- Frontend: http://localhost:5173
- Backend health: http://localhost:8080/actuator/health
- Swagger UI: http://localhost:8080/swagger-ui.html

## More Detail

- Local runtime, Docker, MCP, and cleanup: `docs/guides/LOCAL_DEV_DOCKER_MCP.md`
- Verification and contract workflow: `docs/guides/TESTING_AND_CONTRACTS.md`
- Backend logs during local script-driven runs: `.runtime/logs/`
