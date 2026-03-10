# Quick Start

## Prerequisites

- Docker Desktop running
- Node.js 18+ and npm
- Java 21

## Start Everything

```powershell
.\build-all.ps1
.\run-all.ps1
```

## URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

## Stop Everything

```powershell
.\stop-all.ps1
```

## If Something Fails

```powershell
docker-compose -f AlgotradingBot/compose.yaml logs --tail=200
```

Then verify:

```powershell
curl http://localhost:8080/actuator/health
```

## Notes

- Local development is the primary target.
- `test` or `paper` behavior should remain the default.
- Do not enable real-money live trading by default.
