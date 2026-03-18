function Refresh-UserPath {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

function Get-RepoPaths {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptPath
    )

    $composeFile = Join-Path $ScriptPath "AlgotradingBot/compose.yaml"
    $composeDebugFile = Join-Path $ScriptPath "AlgotradingBot/compose.debug.yaml"
    $pidDir = Join-Path $ScriptPath ".pids"
    $runtimeDir = Join-Path $ScriptPath ".runtime"
    $runtimeLogDir = Join-Path $runtimeDir "logs"
    $hoverflyDataDir = Join-Path $runtimeDir "hoverfly"

    return @{
        ScriptPath = $ScriptPath
        ComposeFile = $composeFile
        ComposeDebugFile = $composeDebugFile
        PidDir = $pidDir
        RuntimeDir = $runtimeDir
        RuntimeLogDir = $runtimeLogDir
        HoverflyDataDir = $hoverflyDataDir
    }
}

function Get-ComposeArgs {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$RepoPaths,
        [switch]$IncludeDebug
    )

    $composeArgs = @("--project-name", "algotradingbot", "-f", $RepoPaths.ComposeFile)
    if ($IncludeDebug -and (Test-Path $RepoPaths.ComposeDebugFile)) {
        $composeArgs += @("-f", $RepoPaths.ComposeDebugFile)
    }

    return $composeArgs
}

function Ensure-Directory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Initialize-RepoRuntime {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$RepoPaths
    )

    Ensure-Directory $RepoPaths.PidDir
    Ensure-Directory $RepoPaths.RuntimeDir
    Ensure-Directory $RepoPaths.RuntimeLogDir
    Ensure-Directory $RepoPaths.HoverflyDataDir
}

function Get-PidFilePath {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$RepoPaths,
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    return (Join-Path $RepoPaths.PidDir "$Name.pid")
}

function Test-DockerRunning {
    docker info > $null 2>&1
    return ($LASTEXITCODE -eq 0)
}

function Test-NodeInstalled {
    return ($null -ne (Get-Command node -ErrorAction SilentlyContinue))
}

function Get-JavaVersionSummary {
    $javaCommand = Get-Command java -ErrorAction SilentlyContinue
    if ($null -eq $javaCommand) {
        return $null
    }

    $versionLine = (& java -version 2>&1 | Select-Object -First 1)
    if (-not $versionLine) {
        return "java detected but version could not be resolved"
    }

    return $versionLine.ToString().Trim()
}

function Write-JavaVersionSummary {
    $summary = Get-JavaVersionSummary
    if ($null -eq $summary) {
        Write-Host "[WARN] Java is not on PATH. Gradle toolchain resolution may still work if JAVA_HOME is set." -ForegroundColor DarkYellow
        return
    }

    Write-Host "[OK] Java detected: $summary" -ForegroundColor Green
}

function Assert-PortAvailable {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port,
        [Parameter(Mandatory = $true)]
        [string]$Label
    )

    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($connection) {
            Write-Host "[X] $Label port $Port is already in use by PID $($connection.OwningProcess)." -ForegroundColor Red
            return $false
        }
    } catch {}

    return $true
}

function ConvertTo-SingleQuotedPowerShellString {
    param(
        [AllowNull()]
        [string]$Value
    )

    if ($null -eq $Value) {
        return "''"
    }

    return "'" + $Value.Replace("'", "''") + "'"
}

function Get-BackendLogEnvironment {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$RepoPaths
    )

    $logPath = $RepoPaths.RuntimeLogDir
    return @{
        APP_LOG_PATH = $logPath
        APP_LOG_FILE = (Join-Path $logPath "algotrading-bot.log")
    }
}

function Get-LowMemoryBackendEnvironment {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$RepoPaths
    )

    $environment = Get-BackendLogEnvironment $RepoPaths
    $environment["JAVA_TOOL_OPTIONS"] = "-Xms512m -Xmx2g -XX:+UseZGC -XX:+ZGenerational -XX:MaxMetaspaceSize=512m"

    return $environment
}

function Wait-ContainerHealthy {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ContainerName,
        [int]$MaxAttempts = 30,
        [int]$DelaySeconds = 2
    )

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            $health = docker inspect --format='{{.State.Health.Status}}' $ContainerName 2>$null
            if ($health -eq "healthy") {
                return $true
            }
        } catch {}

        Write-Host "  Attempt $attempt/$MaxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds $DelaySeconds
    }

    return $false
}

function Wait-HttpOk {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Uri,
        [int]$MaxAttempts = 30,
        [int]$DelaySeconds = 2
    )

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                return $true
            }
        } catch {}

        Write-Host "  Attempt $attempt/$MaxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds $DelaySeconds
    }

    return $false
}

function Build-EnvironmentPrefix {
    param(
        [hashtable]$Environment
    )

    if (-not $Environment -or $Environment.Count -eq 0) {
        return ""
    }

    $assignments = foreach ($key in $Environment.Keys) {
        "`$env:$key=" + (ConvertTo-SingleQuotedPowerShellString $Environment[$key])
    }

    return ($assignments -join "; ")
}

function Start-DetachedPowerShellProcess {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WorkingDirectory,
        [Parameter(Mandatory = $true)]
        [string]$Command,
        [string]$PidFile,
        [hashtable]$Environment
    )

    $fullCommandParts = @(
        "Set-Location " + (ConvertTo-SingleQuotedPowerShellString $WorkingDirectory)
    )

    $environmentPrefix = Build-EnvironmentPrefix $Environment
    if ($environmentPrefix) {
        $fullCommandParts += $environmentPrefix
    }

    $fullCommandParts += $Command
    $fullCommand = $fullCommandParts -join "; "

    $process = Start-Process powershell -ArgumentList @(
        "-NoProfile",
        "-NoExit",
        "-Command",
        $fullCommand
    ) -PassThru

    if ($PidFile) {
        Set-Content -Path $PidFile -Value $process.Id
    }

    return $process
}

function Stop-FromPidFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PidFile,
        [Parameter(Mandatory = $true)]
        [string]$Label
    )

    if (-not (Test-Path $PidFile)) {
        Write-Host "[SKIP] $Label PID file not found" -ForegroundColor DarkYellow
        return
    }

    $pidValue = Get-Content $PidFile -ErrorAction SilentlyContinue
    if (-not $pidValue) {
        Write-Host "[SKIP] $Label PID file is empty" -ForegroundColor DarkYellow
        return
    }

    try {
        $process = Get-Process -Id ([int]$pidValue) -ErrorAction Stop
        Stop-Process -Id $process.Id -Force
        Write-Host "[OK] Stopped $Label process (PID $($process.Id))" -ForegroundColor Green
    } catch {
        Write-Host "[SKIP] $Label process already stopped" -ForegroundColor DarkYellow
    }
}

function Remove-PidFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PidFile
    )

    if (Test-Path $PidFile) {
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    }
}

function Stop-ListeningProcess {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port,
        [string]$Label = "process"
    )

    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($connection) {
            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "[OK] Stopped leftover $Label process on port $Port" -ForegroundColor Green
        }
    } catch {}
}
