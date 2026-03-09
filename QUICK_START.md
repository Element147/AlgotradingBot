# AlgoTrading Bot - Quick Start Guide

## Prerequisites

Before running the application, ensure you have:

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
   - Make sure Docker Desktop is running before executing commands
   
2. **Node.js** (v18+) - [Download here](https://nodejs.org/)
   - Verify: `node -v` should show v18 or higher
   - Verify: `npm -v` should show v8 or higher

3. **Java 25** - Already installed (verified)

## Simple Commands (For Beginners)

### 🚀 First Time Setup

```powershell
# 1. Build everything (backend + frontend)
.\build-all.ps1
```

This will:
- Build the Spring Boot backend
- Build the React frontend
- Take 2-5 minutes on first run

### ▶️ Start Everything

```powershell
# 2. Start all services
.\run-all.ps1
```

This will:
- Start PostgreSQL database (Docker)
- Start Kafka message broker (Docker)
- Start Spring Boot backend (Docker)
- Start React frontend dev server (separate window)

**Wait 30-60 seconds** for all services to start.

### 🌐 Access the Application

Once started, open your browser:

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **Health Check**: http://localhost:8080/actuator/health

### ⏹️ Stop Everything

```powershell
# 3. Stop all services
.\stop-all.ps1
```

This will:
- Stop all Docker containers
- Stop the frontend dev server
- Clean up resources

## Individual Commands (Advanced)

### Backend Only

```powershell
# Build backend
cd AlgotradingBot
.\gradlew clean build

# Run backend with Docker
docker-compose up -d

# Stop backend
docker-compose down
cd ..
```

### Frontend Only

```powershell
# Build frontend
cd frontend
npm run build

# Run frontend dev server
npm run dev

# Stop frontend (Ctrl+C in the terminal)
cd ..
```

### Docker Only

```powershell
# Start Docker services (from AlgotradingBot directory)
cd AlgotradingBot
docker-compose up -d

# View logs
docker-compose logs -f

# Stop Docker services
docker-compose down

# Remove all data (clean slate)
docker-compose down -v
cd ..
```

## Troubleshooting

### Docker not running
```
Error: Cannot connect to Docker daemon
```
**Solution**: Start Docker Desktop and wait for it to fully start.

### Port already in use
```
Error: Port 8080 is already in use
```
**Solution**: Stop other applications using port 8080, or stop existing containers:
```powershell
docker-compose -f AlgotradingBot/compose.yaml down
```

### Backend not starting
```
Backend failed to start within timeout
```
**Solution**: Check logs:
```powershell
docker-compose -f AlgotradingBot/compose.yaml logs algotrading-app
```

### Frontend not building
```
npm ERR! code ELIFECYCLE
```
**Solution**: Delete node_modules and reinstall:
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
cd ..
```

## Project Structure

```
repository-root/
├── AlgotradingBot/          # Spring Boot backend
│   ├── src/                 # Java source code
│   ├── build.gradle.kts     # Build configuration
│   ├── compose.yaml         # Docker services
│   └── Dockerfile           # Backend container
├── frontend/                # React frontend
│   ├── src/                 # React source code
│   ├── package.json         # Dependencies
│   └── vite.config.ts       # Build configuration
├── build-all.ps1           # Build everything
├── run-all.ps1             # Start everything
├── stop-all.ps1            # Stop everything
└── QUICK_START.md          # This file
```

## Development Workflow

### Daily Development

1. **Start services** (once per day):
   ```powershell
   .\run-all.ps1
   ```

2. **Make changes** to code (frontend or backend)
   - Frontend: Changes auto-reload in browser
   - Backend: Rebuild and restart required

3. **Stop services** (end of day):
   ```powershell
   .\stop-all.ps1
   ```

### After Code Changes

**Frontend changes** (auto-reload):
- Just save the file
- Browser refreshes automatically

**Backend changes** (rebuild required):
```powershell
# Stop services
.\stop-all.ps1

# Rebuild backend
cd AlgotradingBot
.\gradlew clean build
cd ..

# Restart services
.\run-all.ps1
```

## Verification Checklist

After running `.\run-all.ps1`, verify:

- [ ] Docker Desktop is running
- [ ] Frontend opens at http://localhost:5173
- [ ] Backend health check returns OK: http://localhost:8080/actuator/health
- [ ] No error messages in PowerShell window
- [ ] Frontend dev server window is open

## URLs Reference Card

Save these URLs for quick access:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main dashboard UI |
| Backend API | http://localhost:8080 | REST API endpoints |
| API Docs | http://localhost:8080/swagger-ui.html | API documentation |
| Health Check | http://localhost:8080/actuator/health | Backend status |
| Metrics | http://localhost:8080/actuator/metrics | Performance metrics |

## Next Steps

1. ✅ Run `.\build-all.ps1` to build everything
2. ✅ Run `.\run-all.ps1` to start everything
3. ✅ Open http://localhost:5173 in your browser
4. ✅ Verify the frontend loads successfully
5. ✅ Check http://localhost:8080/actuator/health shows "UP"

## Getting Help

If you encounter issues:

1. Check the **Troubleshooting** section above
2. View Docker logs: `docker-compose -f AlgotradingBot/compose.yaml logs`
3. Check if ports are available: `netstat -ano | findstr "8080 5173"`
4. Restart Docker Desktop
5. Run `.\stop-all.ps1` and then `.\run-all.ps1` again

## Summary of Commands

```powershell
# Complete workflow
.\build-all.ps1    # Build everything (first time only)
.\run-all.ps1      # Start everything
# ... do your work ...
.\stop-all.ps1     # Stop everything

# Quick restart
.\stop-all.ps1 ; .\run-all.ps1
```

That's it! You're ready to develop. 🚀
