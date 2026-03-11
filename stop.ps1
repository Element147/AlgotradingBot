param()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stopping AlgoTrading Bot - Fast Dev Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

$pidDir = Join-Path $scriptPath ".pids"
$backendPidFile = Join-Path $pidDir "backend.pid"
$frontendPidFile = Join-Path $pidDir "frontend.pid"

function Stop-FromPidFile($pidFile, $label) {
    if (-not (Test-Path $pidFile)) {
        Write-Host "[SKIP] $label PID file not found" -ForegroundColor DarkYellow
        return
    }

    $pidValue = Get-Content $pidFile -ErrorAction SilentlyContinue
    if (-not $pidValue) {
        Write-Host "[SKIP] $label PID file is empty" -ForegroundColor DarkYellow
        return
    }

    try {
        $proc = Get-Process -Id ([int]$pidValue) -ErrorAction Stop
        Stop-Process -Id $proc.Id -Force
        Write-Host "[OK] Stopped $label process (PID $($proc.Id))" -ForegroundColor Green
    } catch {
        Write-Host "[SKIP] $label process already stopped" -ForegroundColor DarkYellow
    }
}

Write-Host "Stopping frontend..." -ForegroundColor Yellow
Stop-FromPidFile $frontendPidFile "frontend"

Write-Host "Stopping backend..." -ForegroundColor Yellow
Stop-FromPidFile $backendPidFile "backend"

try {
    $frontendConn = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($frontendConn) {
        Stop-Process -Id $frontendConn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "[OK] Stopped leftover process on port 5173" -ForegroundColor Green
    }
} catch {}

try {
    $backendConn = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($backendConn) {
        Stop-Process -Id $backendConn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "[OK] Stopped leftover process on port 8080" -ForegroundColor Green
    }
} catch {}

Write-Host "Stopping PostgreSQL container..." -ForegroundColor Yellow
docker info > $null 2>&1
if ($LASTEXITCODE -eq 0) {
    docker compose -f (Join-Path $scriptPath "AlgotradingBot/compose.yaml") stop postgres > $null 2>&1
    Write-Host "[OK] PostgreSQL container stopped" -ForegroundColor Green
} else {
    Write-Host "[SKIP] Docker not running - could not stop PostgreSQL container" -ForegroundColor DarkYellow
}

if (Test-Path $backendPidFile) { Remove-Item $backendPidFile -Force }
if (Test-Path $frontendPidFile) { Remove-Item $frontendPidFile -Force }

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] Fast dev stack stopped" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
