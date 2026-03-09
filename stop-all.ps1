# ============================================
# STOP ALL - Backend + Frontend
# ============================================
# This script stops all running services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stopping AlgoTrading Bot Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory (repository root)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Refresh PATH environment variable (fixes Node.js not found in PowerShell)
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Stop Backend Docker Containers
Write-Host "Stopping Backend services..." -ForegroundColor Yellow
Set-Location AlgotradingBot
docker-compose down
Set-Location ..
Write-Host "[OK] Backend services stopped" -ForegroundColor Green

# Stop Frontend (kill npm processes)
Write-Host ""
Write-Host "Stopping Frontend dev server..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*frontend*"} | Stop-Process -Force
Write-Host "[OK] Frontend dev server stopped" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] All services stopped!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
