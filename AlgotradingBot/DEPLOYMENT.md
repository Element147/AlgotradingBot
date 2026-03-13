# Deployment Guide

## Local Container Runbook

Use the repository compose file with the explicit project name:

```powershell
docker compose --project-name algotradingbot -f .\compose.yaml up -d
docker compose --project-name algotradingbot -f .\compose.yaml ps
docker compose --project-name algotradingbot -f .\compose.yaml logs -f
docker compose --project-name algotradingbot -f .\compose.yaml down
```

## Expected Runtime Resources

- Containers:
  - `algotrading-postgres`
  - `algotrading-kafka`
  - `algotrading-app`
- Named volumes:
  - `algotradingbot_postgres_data`
  - `algotradingbot_kafka_data`
  - `algotradingbot_kafka_secrets`

## Notes

- Fast dev mode (`.\run.ps1`) starts PostgreSQL in Docker and runs backend/frontend locally.
- Full-stack mode (`.\run-all.ps1`) starts the app, PostgreSQL, and Kafka in Docker plus the frontend dev server locally.
- For MCP, cleanup, and local troubleshooting details, use `docs/guides/LOCAL_DEV_DOCKER_MCP.md`.
