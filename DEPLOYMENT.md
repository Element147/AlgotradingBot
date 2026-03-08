# Deployment Guide

## Prerequisites

- Docker 24.0+ installed and running
- Docker Compose 2.23+ installed
- Minimum 2GB RAM available
- Minimum 5GB disk space available
- Ports 8080, 5432, 9092 available

## Quick Start

### 1. Start All Services

```bash
docker-compose up -d
```

This command starts PostgreSQL, Kafka, and the AlgotradingBot application in detached mode.

### 2. Check Service Status

```bash
docker-compose ps
```

Expected output:
```
NAME                    STATUS              PORTS
algotrading-app         Up (healthy)        0.0.0.0:8080->8080/tcp
postgres                Up (healthy)        0.0.0.0:5432->5432/tcp
kafka                   Up (healthy)        0.0.0.0:9092->9092/tcp
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f algotrading-app
docker-compose logs -f postgres
docker-compose logs -f kafka
```

### 4. Stop All Services

```bash
docker-compose down
```

## Health Check Verification

### Application Health

```bash
curl http://localhost:8080/actuator/health
```

Expected response:
```json
{"status":"UP"}
```

### Database Health

```bash
docker exec postgres pg_isready -U postgres
```

Expected output:
```
/var/run/postgresql:5432 - accepting connections
```

### Kafka Health

```bash
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092
```

Should return broker API versions without errors.

## Troubleshooting

### Port Conflicts

If services fail to start due to port conflicts:

```bash
# Check what's using the ports
netstat -ano | findstr :8080
netstat -ano | findstr :5432
netstat -ano | findstr :9092

# Stop conflicting processes or change ports in compose.yaml
```

### Container Won't Start

```bash
# Check container logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]

# Full restart
docker-compose down
docker-compose up -d
```

### Database Connection Issues

```bash
# Verify PostgreSQL is healthy
docker exec postgres pg_isready -U postgres

# Check application logs for connection errors
docker-compose logs algotrading-app | grep -i "database\|postgres"

# Restart application
docker-compose restart algotrading-app
```

### Kafka Connection Issues

```bash
# Check Kafka logs
docker-compose logs kafka

# Verify Kafka is accepting connections
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Restart Kafka
docker-compose restart kafka
```

### Out of Memory

```bash
# Check resource usage
docker stats

# If memory usage is high, adjust limits in compose.yaml
# Or increase Docker Desktop memory allocation
```

### Disk Space Issues

```bash
# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a --volumes
```

## Data Management

### Backup Database

```bash
docker exec postgres pg_dump -U postgres algotrading > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker exec -i postgres psql -U postgres -d algotrading
```

### View Trade Data

```bash
docker exec postgres psql -U postgres -d algotrading -c "SELECT * FROM trades ORDER BY timestamp DESC LIMIT 10;"
```

## Monitoring

### Resource Usage

```bash
# Real-time stats
docker stats

# Expected usage:
# - algotrading-app: < 512MB memory, < 50% CPU
# - postgres: < 256MB memory, < 30% CPU
# - kafka: < 512MB memory, < 40% CPU
```

### Application Metrics

Access Prometheus metrics:
```bash
curl http://localhost:8080/actuator/prometheus
```

### Log Monitoring

```bash
# Follow all logs
docker-compose logs -f

# Filter for errors
docker-compose logs | grep -i error

# Filter for specific service
docker-compose logs -f algotrading-app
```

## Production Readiness Validation

### Run Validation Suite

```bash
cd AlgotradingBot
./gradlew validateProduction
```

This runs the complete validation suite including:
- Build validation (JAR + Docker image)
- Service orchestration validation
- API functionality validation
- Resource usage validation
- Data persistence validation

### Expected Output

```
=== Production Readiness Validation Suite ===
[✓] Build Validation: PASSED
[✓] Orchestration Validation: PASSED
[✓] API Validation: PASSED
[✓] Resource Validation: PASSED
[✓] Data Persistence Validation: PASSED

Overall Status: PRODUCTION READY
```

## Scaling Considerations

### Horizontal Scaling

To run multiple application instances:

```yaml
# In compose.yaml
algotrading-app:
  deploy:
    replicas: 3
```

### Database Scaling

For production, consider:
- PostgreSQL replication for high availability
- Connection pooling configuration
- Read replicas for analytics queries

### Kafka Scaling

For higher throughput:
- Add more Kafka brokers
- Increase partition count
- Configure replication factor

## Security Notes

- Change default passwords in production
- Use secrets management (Docker secrets, Vault)
- Enable TLS for database connections
- Restrict network access using firewall rules
- Regularly update base images for security patches

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Passwords changed from defaults
- [ ] Validation suite passes
- [ ] 60-minute stability test passes
- [ ] Backup procedures tested
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented
- [ ] Team trained on operations

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Run validation: `./gradlew validateProduction`
- Review metrics: `curl http://localhost:8080/actuator/health`
