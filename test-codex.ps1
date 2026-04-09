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

Write-Step "Validating HOME and CODEX_HOME"
$userHome = [Environment]::GetEnvironmentVariable("HOME", "User")
$userCodexHome = [Environment]::GetEnvironmentVariable("CODEX_HOME", "User")

if ($userHome -eq $ExpectedHome) {
    Write-Ok "User HOME is pinned to $ExpectedHome"
} else {
    Add-Failure "User HOME should be $ExpectedHome but is $userHome"
}

if ($userCodexHome -eq $ExpectedCodexHome) {
    Write-Ok "User CODEX_HOME is pinned to $ExpectedCodexHome"
} else {
    Add-Failure "User CODEX_HOME should be $ExpectedCodexHome but is $userCodexHome"
}

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
    Assert-ContentMatch -Content $configContent -Pattern "@playwright/mcp@latest" -SuccessMessage "Playwright MCP config is still present" -FailureMessage "Playwright MCP config is missing"
    Assert-ContentMatch -Content $configContent -Pattern "(?ms)^\[features\]\s*$.*?^\s*js_repl\s*=\s*true\s*$" -SuccessMessage "features.js_repl is enabled" -FailureMessage "features.js_repl = true is missing from config.toml"
}

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
