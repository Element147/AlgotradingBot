# ============================================
# RUN ALL - Backend + Frontend + Docker
# ============================================
# This script starts all services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting AlgoTrading Bot - Full Stack" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory (repository root)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Refresh PATH environment variable (fixes Node.js not found in PowerShell)
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Docker is running" -ForegroundColor Green

# Start Backend with Docker Compose (includes PostgreSQL and Kafka)
Write-Host ""
Write-Host "[1/2] Starting Backend + Database + Kafka..." -ForegroundColor Yellow
Set-Location AlgotradingBot
docker-compose up -d
$dockerResult = $LASTEXITCODE
Set-Location ..

if ($dockerResult -ne 0) {
    Write-Host "[X] Failed to start backend services!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Backend services started!" -ForegroundColor Green

# Wait for backend to be healthy
Write-Host ""
Write-Host "Waiting for backend to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "[OK] Backend is ready!" -ForegroundColor Green
        }
    } catch {
        $attempt++
        Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "[X] Backend failed to start within timeout" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose -f AlgotradingBot/compose.yaml logs" -ForegroundColor Yellow
}

# Start Frontend Dev Server
Write-Host ""
Write-Host "[2/2] Starting Frontend Dev Server..." -ForegroundColor Yellow
Set-Location frontend
# Use cmd to bypass PowerShell execution policy
Start-Process cmd -ArgumentList "/k", "npm run dev" -WindowStyle Normal
Set-Location ..
Write-Host "[OK] Frontend dev server starting..." -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] All services started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:   http://localhost:8080" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services, run: .\stop-all.ps1" -ForegroundColor Yellow
