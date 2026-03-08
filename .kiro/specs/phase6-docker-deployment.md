---
title: "Phase 6: Docker Deployment"
status: not_started
priority: high
dependencies: ["phase1-project-setup", "phase2-risk-management", "phase3-trading-strategy", "phase4-backtesting-engine", "phase5-rest-api"]
---

# Phase 6: Docker Deployment

## Overview
Containerize the application and orchestrate all services (PostgreSQL, Kafka, Application) using Docker Compose for production-ready deployment.

## Success Criteria
- Dockerfile builds successfully
- Docker Compose orchestrates all services
- Application connects to PostgreSQL and Kafka
- Health checks pass
- Logs stream correctly
- Can deploy and run 24/7

## Tasks

### Task 6.1: Dockerfile Creation
**Status:** not_started
**Estimated Time:** 30 minutes

Create `Dockerfile` with multi-stage build:

**Stage 1: Build**
- Use Gradle image to build JAR
- Copy source code
- Run `gradle bootJar`

**Stage 2: Runtime**
- Use lightweight JRE image (eclipse-temurin:21-jre-alpine)
- Copy JAR from build stage
- Expose port 8080
- Set JVM options for production
- Define ENTRYPOINT

**Example Structure:**
```dockerfile
# Build stage
FROM gradle:8.5-jdk21 AS build
WORKDIR /app
COPY . .
RUN gradle bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

**Acceptance Criteria:**
- Multi-stage build reduces image size
- JAR builds successfully
- Image runs without errors
- Port 8080 exposed

**Files to Create:**
- `AlgotradingBot/Dockerfile`

---

### Task 6.2: Docker Ignore File
**Status:** not_started
**Estimated Time:** 10 minutes

Create `.dockerignore` to exclude unnecessary files:
- .git/
- .gradle/
- build/
- .idea/
- *.md (except critical docs)
- .env files
- Local test data

**Acceptance Criteria:**
- Build context size reduced
- No sensitive files included
- Build performance improved

**Files to Create:**
- `AlgotradingBot/.dockerignore`

---

### Task 6.3: Docker Compose Configuration
**Status:** not_started
**Estimated Time:** 60 minutes

Create `compose.yaml` with three services:

**1. PostgreSQL Service:**
- Image: postgres:16-alpine
- Environment variables:
  - POSTGRES_DB=algotrading
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=postgres
- Port: 5432:5432
- Volume: postgres-data:/var/lib/postgresql/data
- Health check: pg_isready

**2. Kafka Service:**
- Image: confluentinc/cp-kafka:7.5.0
- Environment variables:
  - KAFKA_BROKER_ID=1
  - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
  - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
  - KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
- Port: 9092:9092
- Depends on: zookeeper
- Health check: kafka-broker-api-versions

**3. Zookeeper Service (required for Kafka):**
- Image: confluentinc/cp-zookeeper:7.5.0
- Environment variables:
  - ZOOKEEPER_CLIENT_PORT=2181
  - ZOOKEEPER_TICK_TIME=2000
- Port: 2181:2181

**4. Application Service:**
- Build: ./
- Ports: 8080:8080
- Environment variables:
  - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/algotrading
  - SPRING_DATASOURCE_USERNAME=postgres
  - SPRING_DATASOURCE_PASSWORD=postgres
  - SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092
- Depends on: postgres, kafka
- Health check: curl http://localhost:8080/actuator/health
- Restart policy: unless-stopped

**Example Structure:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: algotrading-postgres
    environment:
      POSTGRES_DB: algotrading
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: algotrading-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: algotrading-kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions", "--bootstrap-server", "localhost:9092"]
      interval: 10s
      timeout: 10s
      retries: 5

  algotrading-app:
    build: .
    container_name: algotrading-app
    depends_on:
      postgres:
        condition: service_healthy
      kafka:
        condition: service_healthy
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/algotrading
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:9092
      JAVA_OPTS: "-Xmx512m -Xms256m"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    restart: unless-stopped

volumes:
  postgres-data:
```

**Acceptance Criteria:**
- All services defined
- Health checks configured
- Dependencies managed correctly
- Volumes for data persistence
- Restart policies set

**Files to Create:**
- `AlgotradingBot/compose.yaml`

---

### Task 6.4: Application Configuration for Docker
**Status:** not_started
**Estimated Time:** 20 minutes

Update `application.yml` to support Docker environment:

Add profile-specific configuration:
- Default profile: local development (localhost)
- Docker profile: container networking

**Example:**
```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/algotrading}
    username: ${SPRING_DATASOURCE_USERNAME:postgres}
    password: ${SPRING_DATASOURCE_PASSWORD:postgres}
  kafka:
    bootstrap-servers: ${SPRING_KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
```

**Acceptance Criteria:**
- Environment variables override defaults
- Works in both local and Docker environments
- No hardcoded container hostnames

**Files to Update:**
- `AlgotradingBot/src/main/resources/application.yml`

---

### Task 6.5: Build and Test Docker Image
**Status:** not_started
**Estimated Time:** 30 minutes

Build and test the Docker image:

**Commands:**
```bash
# Build image
docker build -t algotrading-bot:latest .

# Check image size
docker images algotrading-bot

# Run container standalone
docker run -p 8080:8080 algotrading-bot:latest

# Check logs
docker logs <container-id>
```

**Acceptance Criteria:**
- Image builds without errors
- Image size < 300MB (optimized)
- Container starts successfully
- Application logs visible

---

### Task 6.6: Docker Compose Integration Test
**Status:** not_started
**Estimated Time:** 45 minutes

Test full Docker Compose stack:

**Test Steps:**
1. Start all services: `docker-compose up -d`
2. Check service status: `docker-compose ps`
3. Verify PostgreSQL: `docker-compose exec postgres psql -U postgres -d algotrading -c "\dt"`
4. Verify Kafka: `docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092`
5. Verify application health: `curl http://localhost:8080/actuator/health`
6. Test API endpoint: `curl http://localhost:8080/api/strategy/status`
7. Check logs: `docker-compose logs -f algotrading-app`
8. Stop services: `docker-compose down`

**Acceptance Criteria:**
- All services start successfully
- Health checks pass
- Database tables created
- API responds correctly
- Logs stream properly

---

### Task 6.7: Production Readiness Checklist
**Status:** not_started
**Estimated Time:** 30 minutes

Verify production readiness:

**Infrastructure:**
- [ ] Docker image builds successfully
- [ ] All services start in correct order
- [ ] Health checks pass for all services
- [ ] Data persists across restarts (volumes)
- [ ] Logs accessible via docker-compose logs

**Application:**
- [ ] Application connects to PostgreSQL
- [ ] Application connects to Kafka
- [ ] Database schema auto-created
- [ ] Actuator endpoints accessible
- [ ] API endpoints functional

**Performance:**
- [ ] Application starts within 60 seconds
- [ ] Memory usage < 512MB
- [ ] CPU usage reasonable
- [ ] No memory leaks over 24 hours

**Monitoring:**
- [ ] Structured JSON logs
- [ ] Prometheus metrics exposed
- [ ] Health endpoint responds
- [ ] Error logs captured

**Acceptance Criteria:**
- All checklist items verified
- System runs stable for 1+ hour
- No critical errors in logs

---

### Task 6.8: Deployment Documentation
**Status:** not_started
**Estimated Time:** 30 minutes

Create deployment guide in `DEPLOYMENT.md`:

**Contents:**
1. Prerequisites (Docker, Docker Compose)
2. Quick start commands
3. Configuration options
4. Troubleshooting guide
5. Monitoring and logs
6. Backup and restore procedures
7. Scaling considerations

**Acceptance Criteria:**
- Clear step-by-step instructions
- Common issues documented
- Commands tested and verified

**Files to Create:**
- `AlgotradingBot/DEPLOYMENT.md`

---

### Task 6.9: Environment Variables Documentation
**Status:** not_started
**Estimated Time:** 15 minutes

Create `.env.example` file with all configurable variables:

```env
# Database Configuration
POSTGRES_DB=algotrading
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=kafka:9092

# Application Configuration
SPRING_PROFILES_ACTIVE=docker
JAVA_OPTS=-Xmx512m -Xms256m

# Trading Configuration
INITIAL_BALANCE=100
RISK_PER_TRADE=0.02
MAX_DRAWDOWN=0.25
```

**Acceptance Criteria:**
- All variables documented
- Example values provided
- Security notes included

**Files to Create:**
- `AlgotradingBot/.env.example`

---

### Task 6.10: Phase 6 Validation
**Status:** not_started
**Estimated Time:** 45 minutes

Final validation of Phase 6:

**Build Validation:**
- Run `gradle clean build` - must succeed
- Run `docker build -t algotrading-bot:latest .` - must succeed
- Verify image size < 300MB

**Deployment Validation:**
- Run `docker-compose up -d` - all services start
- Wait 2 minutes for initialization
- Check `docker-compose ps` - all services healthy
- Test health endpoint: `curl http://localhost:8080/actuator/health`
- Test API: `curl http://localhost:8080/api/strategy/status`

**Persistence Validation:**
- Start strategy via API
- Stop containers: `docker-compose down`
- Restart: `docker-compose up -d`
- Verify data persisted (check database)

**Long-Running Test:**
- Keep system running for 1 hour
- Monitor logs for errors
- Check memory usage
- Verify no crashes

**Acceptance Criteria:**
- All validation steps pass
- System stable for 1+ hour
- No critical errors
- Data persists correctly

---

## Phase 6 Completion Checklist
- [x] Dockerfile created and builds successfully
- [ ] .dockerignore created
- [ ] compose.yaml created with all services
- [ ] application.yml updated for Docker
- [ ] Docker image builds (< 300MB)
- [ ] Docker Compose starts all services
- [ ] PostgreSQL service healthy
- [ ] Kafka service healthy
- [ ] Application service healthy
- [ ] Database tables auto-created
- [ ] API endpoints functional
- [ ] Logs accessible
- [ ] Data persists across restarts
- [ ] DEPLOYMENT.md created
- [ ] .env.example created
- [ ] System stable for 1+ hour

## Critical Success Factors
- **Service orchestration** - correct startup order with health checks
- **Data persistence** - volumes configured for PostgreSQL
- **Network connectivity** - services can communicate
- **Resource limits** - prevent memory/CPU overuse
- **Restart policies** - automatic recovery from failures

## Production Deployment Commands

### Start System
```bash
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
docker-compose logs -f algotrading-app
```

### Stop System
```bash
docker-compose down
```

### Full Reset (including data)
```bash
docker-compose down -v
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f algotrading-app
docker-compose logs -f postgres
docker-compose logs -f kafka
```

## Next Steps
After Phase 6 completion, the system is PRODUCTION READY for Phase 1 trading ($100-$500 account).
