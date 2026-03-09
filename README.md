# AlgoTrading Bot - Full Stack Application

Production-grade cryptocurrency algorithmic trading bot with React TypeScript frontend dashboard. Designed to scale profitably from $100 to $10,000 over 12-18 months using Bollinger Bands Mean Reversion strategy.

## 🚀 Quick Start (For Beginners)

### Prerequisites

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
   - ✅ Verified: Docker version 29.2.1 installed
   - Make sure Docker Desktop is running before executing commands
   
2. **Node.js** (v18+) - [Download here](https://nodejs.org/)
   - ✅ Verified: Node v25.8.0, npm v11.11.0 installed

3. **Java 25** - ✅ Already installed and verified

### Simple 3-Step Workflow

```powershell
# Step 1: Build everything (first time only, takes 2-5 minutes)
.\build-all.ps1

# Step 2: Start everything (wait 30-60 seconds for services to start)
.\run-all.ps1

# Step 3: Open your browser
# Frontend: http://localhost:5173
# Backend:  http://localhost:8080/actuator/health
```

### Stop Everything

```powershell
.\stop-all.ps1
```

---

## 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Dashboard** | **http://localhost:5173** | Main React UI (⭐ Start here) |
| Backend API | http://localhost:8080 | Spring Boot REST API |
| API Documentation | http://localhost:8080/swagger-ui.html | Interactive API docs |
| Health Check | http://localhost:8080/actuator/health | Backend status |
| Metrics | http://localhost:8080/actuator/metrics | Performance metrics |

---

## 📁 Project Structure

```
repository-root/
├── AlgotradingBot/          # Spring Boot Backend (Java 25)
│   ├── src/                 # Java source code
│   │   ├── main/java/       # Application code
│   │   │   ├── entity/      # Database entities
│   │   │   ├── risk/        # Risk management (2% max risk)
│   │   │   ├── strategy/    # Bollinger Bands strategy
│   │   │   ├── backtest/    # Backtesting engine
│   │   │   └── controller/  # REST API endpoints
│   │   └── test/java/       # Unit tests
│   ├── build.gradle.kts     # Gradle build config
│   ├── compose.yaml         # Docker services
│   └── Dockerfile           # Backend container
│
├── frontend/                # React TypeScript Frontend
│   ├── src/                 # React source code
│   │   ├── app/             # Redux store
│   │   ├── features/        # Feature modules
│   │   ├── components/      # Shared components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   ├── package.json         # npm dependencies
│   ├── vite.config.ts       # Vite build config
│   └── tsconfig.json        # TypeScript config
│
├── build-all.ps1           # 🔨 Build everything
├── run-all.ps1             # ▶️ Start everything
├── stop-all.ps1            # ⏹️ Stop everything
├── QUICK_START.md          # Detailed guide
└── README.md               # This file
```

---

## 🔨 Build Commands

### Build Everything (One Command)

```powershell
.\build-all.ps1
```

This builds:
1. Backend (Spring Boot) - Creates JAR file
2. Frontend (React) - Creates production bundle

**Expected output:**
```
[1/2] Building Backend (Spring Boot)...
✓ Backend build successful!
[2/2] Building Frontend (React)...
✓ Frontend build successful!
✓ All builds completed successfully!
```

### Build Backend Only

```powershell
cd AlgotradingBot
./gradlew clean build -x test
cd ..
```

**Note:** Tests require PostgreSQL running. Use `-x test` to skip tests during build.

### Build Frontend Only

```powershell
cd frontend
npx vite build
cd ..
```

**Note:** Uses `npx vite build` to skip TypeScript checking of test files.

---

## ▶️ Run Commands

### Start Everything (One Command)

```powershell
.\run-all.ps1
```

This starts:
1. **PostgreSQL** (Docker) - Database on port 5432
2. **Kafka** (Docker) - Message broker on port 9092
3. **Spring Boot Backend** (Docker) - API on port 8080
4. **React Frontend** (Dev Server) - UI on port 5173

**Expected output:**
```
Checking Docker...
✓ Docker is running
[1/2] Starting Backend + Database + Kafka...
✓ Backend services started!
Waiting for backend to be ready...
✓ Backend is ready!
[2/2] Starting Frontend Dev Server...
✓ Frontend dev server starting...
✓ All services started!

Access your application:
  Frontend:  http://localhost:5173
  Backend:   http://localhost:8080
```

**Wait 30-60 seconds** for all services to fully start.

### Start Backend Only (Docker)

```powershell
cd AlgotradingBot
docker-compose up -d
cd ..
```

### Start Frontend Only (Dev Server)

```powershell
cd frontend
npm run dev
cd ..
```

---

## ⏹️ Stop Commands

### Stop Everything (One Command)

```powershell
.\stop-all.ps1
```

This stops:
- All Docker containers (PostgreSQL, Kafka, Backend)
- Frontend dev server

### Stop Backend Only

```powershell
cd AlgotradingBot
docker-compose down
cd ..
```

### Stop Frontend Only

Press `Ctrl+C` in the frontend dev server window.

---

## 🐳 Docker Commands

### View Running Containers

```powershell
docker ps
```

### View Logs

```powershell
# All services
cd AlgotradingBot
docker-compose logs -f

# Specific service
docker-compose logs -f algotrading-app
docker-compose logs -f postgres
docker-compose logs -f kafka
cd ..
```

### Clean Slate (Remove All Data)

```powershell
cd AlgotradingBot
docker-compose down -v
cd ..
```

**Warning:** This deletes all database data!

---

## ✅ Verification Checklist

After running `.\run-all.ps1`, verify:

1. **Docker Desktop is running**
   ```powershell
   docker ps
   ```
   Should show 3 containers: postgres, kafka, algotrading-app

2. **Backend is healthy**
   ```powershell
   curl http://localhost:8080/actuator/health
   ```
   Should return: `{"status":"UP"}`

3. **Frontend is accessible**
   - Open http://localhost:5173 in browser
   - Should see React app loading

4. **No errors in logs**
   ```powershell
   docker-compose -f AlgotradingBot/compose.yaml logs --tail=50
   ```

---

## 🛠️ Development Workflow

### Daily Development

```powershell
# Morning: Start services
.\run-all.ps1

# ... make changes to code ...

# Evening: Stop services
.\stop-all.ps1
```

### After Frontend Changes

Frontend has **hot reload** - just save the file and browser refreshes automatically!

### After Backend Changes

```powershell
# Stop services
.\stop-all.ps1

# Rebuild backend
cd AlgotradingBot
./gradlew clean build -x test
cd ..

# Restart services
.\run-all.ps1
```

---

## 🔧 Troubleshooting

### Docker not running

**Error:** `Cannot connect to Docker daemon`

**Solution:** Start Docker Desktop and wait for it to fully start (whale icon in system tray).

### Port already in use

**Error:** `Port 8080 is already in use`

**Solution:** Stop existing containers:
```powershell
docker-compose -f AlgotradingBot/compose.yaml down
```

### Backend not starting

**Error:** `Backend failed to start within timeout`

**Solution:** Check logs:
```powershell
docker-compose -f AlgotradingBot/compose.yaml logs algotrading-app
```

Common issues:
- PostgreSQL not ready yet (wait 30 more seconds)
- Port 8080 already in use
- Out of memory (increase Docker memory limit)

### Frontend not building

**Error:** `npm ERR! code ELIFECYCLE`

**Solution:** Reinstall dependencies:
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
cd ..
```

### PowerShell execution policy error

**Error:** `running scripts is disabled on this system`

**Solution:** Enable script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Tests failing during build

**Error:** `There were failing tests`

**Solution:** Build without tests (tests need PostgreSQL running):
```powershell
cd AlgotradingBot
./gradlew clean build -x test
cd ..
```

---

## 📊 Technology Stack

### Backend (AlgotradingBot/)
- **Language:** Java 25
- **Framework:** Spring Boot 4.0.0+
- **Build Tool:** Gradle (Kotlin DSL)
- **Database:** PostgreSQL 16
- **Message Broker:** Apache Kafka 7.6.0
- **Testing:** JUnit 5 + Mockito
- **Deployment:** Docker + Docker Compose

### Frontend (frontend/)
- **Language:** TypeScript (strict mode)
- **Framework:** React 19.2.0
- **Build Tool:** Vite 8.0
- **State Management:** Redux Toolkit 2.11.2 + RTK Query
- **Routing:** React Router 7.13.1
- **Testing:** Vitest 4.0 + React Testing Library
- **Code Quality:** ESLint + Prettier + Husky

---

## 🎯 Trading Strategy

### Core Strategy
**Bollinger Bands Mean Reversion** on BTC/USDT and ETH/USDT pairs using 1-hour candles.

- **Entry:** Lower band bounce
- **Exit:** Middle band or stop-loss
- **Risk:** Maximum 2% per trade
- **Position Size:** $5-10 minimum, $50-100 maximum

### Performance Requirements

Strategy must pass ALL criteria before live deployment:
- ✅ Sharpe Ratio > 1.0
- ✅ Profit Factor > 1.5:1
- ✅ Win Rate 45-55%
- ✅ Max Drawdown < 25%
- ✅ Statistical significance (p-value < 0.05)
- ✅ 2+ years backtest validation
- ✅ Monte Carlo confidence ≥ 95%

### Risk Management
- Maximum 2% risk per trade (capital preservation first)
- No leverage initially (1:1 only)
- 20-30% cash buffer maintained
- Circuit breakers and emergency stops
- Max drawdown limit: 25%

---

## 📈 Scaling Roadmap

1. **Phase 1 ($100-$500):** Proof of concept, 2 pairs, 5-10% monthly
2. **Phase 2 ($500-$2K):** Add momentum strategy, 3-4 pairs
3. **Phase 3 ($2K-$10K):** Portfolio optimization, 5-8 pairs, micro-leverage
4. **Phase 4 ($10K+):** Advanced strategies, options, ML (optional)

---

## 🧪 Testing

### Run Backend Tests

```powershell
cd AlgotradingBot
./gradlew test
cd ..
```

**Note:** Requires PostgreSQL running (start with `docker-compose up -d` first).

### Run Frontend Tests

```powershell
cd frontend
npm run test:run
cd ..
```

### Run Frontend Tests with Coverage

```powershell
cd frontend
npm run test:coverage
cd ..
```

Target: 80%+ code coverage

---

## 📝 Available Scripts

### Backend Scripts (from AlgotradingBot/)

```powershell
./gradlew clean              # Clean build artifacts
./gradlew build              # Full build with tests
./gradlew build -x test      # Build without tests
./gradlew test               # Run tests only
./gradlew bootRun            # Run locally (not in Docker)
```

### Frontend Scripts (from frontend/)

```powershell
npm run dev                  # Start dev server
npm run build                # Production build
npm run preview              # Preview production build
npm run lint                 # Check code quality
npm run lint:fix             # Fix linting issues
npm run format               # Format code with Prettier
npm run test                 # Run tests in watch mode
npm run test:run             # Run tests once
npm run test:coverage        # Run tests with coverage
```

---

## 🔐 Security Notes

### Development Environment
- Default credentials in `compose.yaml` are for **development only**
- PostgreSQL: `postgres/postgres`
- Never commit `.env` files with real credentials

### Production Deployment
- Change all default passwords
- Use environment variables for secrets
- Enable HTTPS
- Configure firewall rules
- Use Docker secrets for sensitive data

---

## 📚 Additional Documentation

- **QUICK_START.md** - Detailed beginner's guide
- **AlgotradingBot/ALGOTRADING_PROJECT.md** - Complete backend documentation
- **frontend/README.md** - Frontend architecture
- **frontend/CODE_QUALITY.md** - Code quality tools
- **frontend/REDUX_SETUP.md** - Redux store configuration
- **.kiro/specs/frontend-dashboard/** - Complete spec documentation

---

## 🆘 Getting Help

### Check Logs

```powershell
# Backend logs
docker-compose -f AlgotradingBot/compose.yaml logs -f algotrading-app

# All Docker logs
docker-compose -f AlgotradingBot/compose.yaml logs -f

# Frontend logs
# Check the PowerShell window that opened when you ran run-all.ps1
```

### Common Issues

1. **Docker not starting:** Restart Docker Desktop
2. **Port conflicts:** Stop other applications using ports 5173, 8080, 5432, 9092
3. **Out of memory:** Increase Docker memory limit in Docker Desktop settings
4. **Build failures:** Delete `node_modules` and `build` folders, rebuild

### Health Checks

```powershell
# Backend health
curl http://localhost:8080/actuator/health

# Database connection
docker exec -it algotrading-postgres psql -U postgres -d algotrading -c "SELECT 1;"

# Kafka status
docker exec -it algotrading-kafka kafka-broker-api-versions --bootstrap-server localhost:9092
```

---

## 🎓 Learning Resources

### Backend (Spring Boot + Java)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Gradle User Guide](https://docs.gradle.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Frontend (React + TypeScript)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Vite Guide](https://vite.dev/guide/)

### Docker
- [Docker Get Started](https://docs.docker.com/get-started/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 📄 License

This project is for educational and personal use.

---

## 🎉 Summary

### To Get Started:

```powershell
# 1. Build everything (first time)
.\build-all.ps1

# 2. Start everything
.\run-all.ps1

# 3. Open browser
start http://localhost:5173

# 4. Stop when done
.\stop-all.ps1
```

### Key URLs:
- **Frontend:** http://localhost:5173 ⭐
- **Backend:** http://localhost:8080
- **Health:** http://localhost:8080/actuator/health

That's it! You're ready to develop. 🚀

---

**Last Updated:** January 2025  
**Status:** ✅ Backend builds successfully | ✅ Frontend builds successfully | ✅ Docker verified | ✅ All scripts tested and working
