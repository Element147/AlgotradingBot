[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ExpectedHome = $env:USERPROFILE
$ExpectedCodexHome = Join-Path $ExpectedHome ".codex"
$ExpectedDockerServers = @(
    "context7",
    "database-server",
    "hoverfly-mcp-server",
    "openapi-schema",
    "playwright",
    "semgrep"
)
$ExpectedRepoSkills = @(
    "algotrading-cockpit",
    "algotrading-ui-qa"
)
$ExpectedPlaywrightLauncher = Join-Path $ExpectedCodexHome "scripts\start-playwright-mcp.ps1"
$ExpectedPlaywrightOutputDir = Join-Path $ExpectedCodexHome "playwright-mcp"

$Failures = New-Object System.Collections.Generic.List[string]
$Warnings = New-Object System.Collections.Generic.List[string]

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Add-Failure {
    param([string]$Message)
    $script:Failures.Add($Message) | Out-Null
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Add-Warning {
    param([string]$Message)
    $script:Warnings.Add($Message) | Out-Null
    Write-Host "[WARN] $Message" -ForegroundColor DarkYellow
}

function Assert-Exists {
    param(
        [string]$Path,
        [string]$Label
    )

    if (Test-Path -LiteralPath $Path) {
        Write-Ok "$Label exists at $Path"
        return $true
    }

    Add-Failure "$Label is missing at $Path"
    return $false
}

function Assert-ContentMatch {
    param(
        [string]$Content,
        [string]$Pattern,
        [string]$SuccessMessage,
        [string]$FailureMessage
    )

    if ($Content -match $Pattern) {
        Write-Ok $SuccessMessage
        return
    }

    Add-Failure $FailureMessage
}

function Assert-UserPathIsWritableHome {
    param(
        [string]$Path,
        [string]$Label
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        Add-Failure "$Label is blank"
        return
    }

    $normalizedPath = [System.IO.Path]::GetFullPath($Path)
    $windowsRoot = [System.IO.Path]::GetFullPath($env:WINDIR)

    if ($normalizedPath.StartsWith($windowsRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        Add-Failure "$Label should not point into $windowsRoot because Playwright cannot safely create its runtime state there"
        return
    }

    if (Test-Path -LiteralPath $normalizedPath) {
        Write-Ok "$Label exists at $normalizedPath"
    } else {
        Add-Failure "$Label does not exist at $normalizedPath"
    }
}

Write-Step "Validating HOME and CODEX_HOME"
$userHome = [Environment]::GetEnvironmentVariable("HOME", "User")
$userCodexHome = [Environment]::GetEnvironmentVariable("CODEX_HOME", "User")

if ($userHome -eq $ExpectedHome) {
    Write-Ok "User HOME is pinned to $ExpectedHome"
} else {
    Add-Failure "User HOME should be $ExpectedHome but is $userHome"
}
Assert-UserPathIsWritableHome -Path $userHome -Label "User HOME"

if ($userCodexHome -eq $ExpectedCodexHome) {
    Write-Ok "User CODEX_HOME is pinned to $ExpectedCodexHome"
} else {
    Add-Failure "User CODEX_HOME should be $ExpectedCodexHome but is $userCodexHome"
}
Assert-UserPathIsWritableHome -Path $userCodexHome -Label "User CODEX_HOME"

if ($env:HOME -ne $ExpectedHome) {
    Add-Warning "Current process HOME is $($env:HOME). Restart the shell or the Codex desktop app to pick up the persisted value."
} else {
    Write-Ok "Current process HOME is aligned"
}

if ($env:CODEX_HOME -ne $ExpectedCodexHome) {
    Add-Warning "Current process CODEX_HOME is $($env:CODEX_HOME). Restart the shell or the Codex desktop app to pick up the persisted value."
} else {
    Write-Ok "Current process CODEX_HOME is aligned"
}

Write-Step "Validating the local Codex config"
$configPath = Join-Path $ExpectedCodexHome "config.toml"
if (Assert-Exists -Path $configPath -Label "Codex config") {
    $configContent = Get-Content -LiteralPath $configPath -Raw
    Assert-ContentMatch -Content $configContent -Pattern "(?m)^\[mcp_servers\.MCP_DOCKER\]\s*$" -SuccessMessage "MCP_DOCKER config block is present" -FailureMessage "MCP_DOCKER config block is missing"
    Assert-ContentMatch -Content $configContent -Pattern "docker\.exe" -SuccessMessage "MCP_DOCKER still points to docker.exe" -FailureMessage "MCP_DOCKER no longer points to docker.exe"
    Assert-ContentMatch -Content $configContent -Pattern "(?m)^\[mcp_servers\.playwright\]\s*$" -SuccessMessage "Playwright MCP config block is present" -FailureMessage "Playwright MCP config block is missing"
    Assert-ContentMatch -Content $configContent -Pattern "powershell\.exe" -SuccessMessage "Playwright MCP is launched through PowerShell" -FailureMessage "Playwright MCP launcher command is missing"
    Assert-ContentMatch -Content $configContent -Pattern ([regex]::Escape($ExpectedPlaywrightLauncher)) -SuccessMessage "Playwright MCP points to the repo-managed launcher script" -FailureMessage "Playwright MCP no longer points to $ExpectedPlaywrightLauncher"
    Assert-ContentMatch -Content $configContent -Pattern "(?ms)^\[features\]\s*$.*?^\s*js_repl\s*=\s*true\s*$" -SuccessMessage "features.js_repl is enabled" -FailureMessage "features.js_repl = true is missing from config.toml"
}

Write-Step "Validating the local Playwright MCP launcher"
if (Assert-Exists -Path $ExpectedPlaywrightLauncher -Label "Playwright launcher script") {
    $launcherContent = Get-Content -LiteralPath $ExpectedPlaywrightLauncher -Raw
    Assert-ContentMatch -Content $launcherContent -Pattern "@playwright/mcp@latest" -SuccessMessage "Playwright launcher still starts @playwright/mcp@latest" -FailureMessage "Playwright launcher no longer starts @playwright/mcp@latest"
    Assert-ContentMatch -Content $launcherContent -Pattern "CODEX_HOME" -SuccessMessage "Playwright launcher pins CODEX_HOME before startup" -FailureMessage "Playwright launcher no longer pins CODEX_HOME"
    Assert-ContentMatch -Content $launcherContent -Pattern "USERPROFILE" -SuccessMessage "Playwright launcher pins USERPROFILE before startup" -FailureMessage "Playwright launcher no longer pins USERPROFILE"
    Assert-ContentMatch -Content $launcherContent -Pattern "PLAYWRIGHT_MCP_OUTPUT_DIR" -SuccessMessage "Playwright launcher pins PLAYWRIGHT_MCP_OUTPUT_DIR before startup" -FailureMessage "Playwright launcher no longer pins PLAYWRIGHT_MCP_OUTPUT_DIR"
    Assert-ContentMatch -Content $launcherContent -Pattern ([regex]::Escape($ExpectedPlaywrightOutputDir)) -SuccessMessage "Playwright launcher pins a user-writable MCP output directory" -FailureMessage "Playwright launcher no longer points at $ExpectedPlaywrightOutputDir"
    Assert-ContentMatch -Content $launcherContent -Pattern "Set-Location" -SuccessMessage "Playwright launcher pins its working directory before startup" -FailureMessage "Playwright launcher no longer pins its working directory"
}
Assert-UserPathIsWritableHome -Path $ExpectedPlaywrightOutputDir -Label "Playwright MCP output directory"

Write-Step "Validating the synced repo-owned skills"
foreach ($skillName in $ExpectedRepoSkills) {
    $skillRoot = Join-Path $ExpectedCodexHome "skills\$skillName"
    if (Assert-Exists -Path $skillRoot -Label "Skill $skillName") {
        Assert-Exists -Path (Join-Path $skillRoot "SKILL.md") -Label "$skillName SKILL.md" | Out-Null
        Assert-Exists -Path (Join-Path $skillRoot "agents\openai.yaml") -Label "$skillName agents/openai.yaml" | Out-Null
    }
}

Write-Step "Validating Docker MCP server availability"
try {
    $serverOutput = docker mcp server ls | Out-String
    foreach ($serverName in $ExpectedDockerServers) {
        if ($serverOutput -match [regex]::Escape($serverName)) {
            Write-Ok "Docker MCP server $serverName is enabled"
        } else {
            Add-Failure "Docker MCP server $serverName is not enabled"
        }
    }
} catch {
    Add-Failure "docker mcp server ls failed: $($_.Exception.Message)"
}

Write-Step "Validating Docker MCP config paths"
try {
    $configDumpRaw = docker mcp config dump | Out-String
    $configDumpText = $configDumpRaw
    try {
        $configDumpJson = $configDumpRaw | ConvertFrom-Json
        if ($configDumpJson.config) {
            $configDumpText = [string]$configDumpJson.config
        }
    } catch {
        Add-Warning "docker mcp config dump did not parse as JSON. Falling back to raw text checks."
    }

    $expectedOpenApiPath = "/C/Git/algotradingbot/contracts/openapi.json"
    $expectedDbUrl = "postgresql+asyncpg://postgres:postgres@host.docker.internal:5432/algotrading"
    $expectedHoverflyPath = "/C/Git/algotradingbot/.runtime/hoverfly"

    if ($configDumpText -like "*$expectedOpenApiPath*") {
        Write-Ok "OpenAPI MCP path still targets the repo contract artifact"
    } else {
        Add-Failure "OpenAPI MCP path no longer targets $expectedOpenApiPath"
    }

    if ($configDumpText -like "*$expectedDbUrl*") {
        Write-Ok "Database MCP config still targets the local PostgreSQL connection"
    } else {
        Add-Failure "Database MCP config no longer targets $expectedDbUrl"
    }

    if ($configDumpText -like "*$expectedHoverflyPath*") {
        Write-Ok "Hoverfly MCP config still targets the repo runtime state"
    } else {
        Add-Failure "Hoverfly MCP config no longer targets $expectedHoverflyPath"
    }
} catch {
    Add-Failure "docker mcp config dump failed: $($_.Exception.Message)"
}

if ($Warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Warnings:" -ForegroundColor DarkYellow
    foreach ($warning in $Warnings) {
        Write-Host " - $warning" -ForegroundColor DarkYellow
    }
}

if ($Failures.Count -gt 0) {
    Write-Host ""
    Write-Host "Remediation:" -ForegroundColor Red
    Write-Host " - Re-run .\setup-codex.ps1 from the repo root." -ForegroundColor Red
    Write-Host " - Restart the Codex desktop app if the process-level environment is stale." -ForegroundColor Red
    Write-Host " - Re-check docker mcp server ls and docker mcp config dump if the MCP checks failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[OK] Codex workstation validation passed." -ForegroundColor Green
