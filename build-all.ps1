# ============================================
# BUILD ALL - Backend + Frontend
# ============================================
# This script builds both the backend and frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building AlgoTrading Bot - Full Stack" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory (repository root)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Refresh PATH environment variable (fixes Node.js not found in PowerShell)
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Build Backend
Write-Host "[1/2] Building Backend (Spring Boot)..." -ForegroundColor Yellow
Set-Location AlgotradingBot
./gradlew clean build -x test
$backendResult = $LASTEXITCODE
Set-Location ..

if ($backendResult -ne 0) {
    Write-Host "[X] Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Backend build successful!" -ForegroundColor Green

# Build Frontend
Write-Host ""
Write-Host "[2/2] Building Frontend (React)..." -ForegroundColor Yellow

# Check if Node.js is installed
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "[SKIP] Node.js not installed - skipping frontend build" -ForegroundColor Yellow
    Write-Host "       Install Node.js from https://nodejs.org/ to build frontend" -ForegroundColor Gray
} else {
    Set-Location frontend
    cmd /c "npm run build"
    $frontendResult = $LASTEXITCODE
    Set-Location ..

    if ($frontendResult -ne 0) {
        Write-Host "[X] Frontend build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Frontend build successful!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] All builds completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: .\run-all.ps1" -ForegroundColor White
Write-Host "  2. Access frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  3. Access backend API: http://localhost:8080" -ForegroundColor White
