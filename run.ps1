param()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting AlgoTrading Bot - Fast Dev Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$pidDir = Join-Path $scriptPath ".pids"
if (-not (Test-Path $pidDir)) {
    New-Item -ItemType Directory -Path $pidDir | Out-Null
}

Write-Host "Checking Docker..." -ForegroundColor Yellow
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Docker is running" -ForegroundColor Green

Write-Host ""
Write-Host "[1/3] Starting PostgreSQL container..." -ForegroundColor Yellow
docker compose -f (Join-Path $scriptPath "AlgotradingBot/compose.yaml") up -d postgres
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Failed to start PostgreSQL container!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] PostgreSQL container started" -ForegroundColor Green

Write-Host ""
Write-Host "Waiting for PostgreSQL to be healthy..." -ForegroundColor Yellow
$postgresReady = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
    try {
        $health = docker inspect --format='{{.State.Health.Status}}' algotrading-postgres 2>$null
        if ($health -eq "healthy") {
            $postgresReady = $true
            break
        }
    } catch {}
    Write-Host "  Attempt $attempt/30..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if (-not $postgresReady) {
    Write-Host "[X] PostgreSQL did not become healthy in time" -ForegroundColor Red
    Write-Host "Check logs with: docker compose -f AlgotradingBot/compose.yaml logs postgres" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] PostgreSQL is healthy" -ForegroundColor Green

Write-Host ""
Write-Host "[2/3] Starting Backend (local bootRun)..." -ForegroundColor Yellow
Set-Location AlgotradingBot
$backendProc = Start-Process powershell -ArgumentList @(
    "-NoProfile",
    "-NoExit",
    "-Command",
    ".\gradlew.bat bootRun"
) -PassThru
Set-Location ..
Set-Content -Path (Join-Path $pidDir "backend.pid") -Value $backendProc.Id
Write-Host "[OK] Backend process started (PID $($backendProc.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "Waiting for backend to be ready..." -ForegroundColor Yellow
$backendReady = $false
for ($attempt = 1; $attempt -le 45; $attempt++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {}
    Write-Host "  Attempt $attempt/45..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if (-not $backendReady) {
    Write-Host "[X] Backend did not become healthy in time" -ForegroundColor Red
    Write-Host "Inspect the backend PowerShell window for startup errors." -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Backend is ready" -ForegroundColor Green

Write-Host ""
Write-Host "[3/3] Starting Frontend dev server..." -ForegroundColor Yellow
Set-Location frontend
$frontendProc = Start-Process powershell -ArgumentList @(
    "-NoProfile",
    "-NoExit",
    "-Command",
    "npm run dev"
) -PassThru
Set-Location ..
Set-Content -Path (Join-Path $pidDir "frontend.pid") -Value $frontendProc.Id
Write-Host "[OK] Frontend process started (PID $($frontendProc.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] Fast dev stack started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:   http://localhost:8080" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services, run: .\stop.ps1" -ForegroundColor Yellow
