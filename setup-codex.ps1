[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot = $PSScriptRoot
$DesiredHome = $env:USERPROFILE
$DesiredCodexHome = Join-Path $DesiredHome ".codex"
$RepoSkillsRoot = Join-Path $RepoRoot ".codex\skills"

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor DarkYellow
}

function Ensure-Directory {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Set-EnvironmentForSession {
    param(
        [string]$Name,
        [string]$Value
    )

    Set-Item -Path "Env:$Name" -Value $Value
}

function Ensure-UserEnvironmentVariable {
    param(
        [string]$Name,
        [string]$Value
    )

    $existingUserValue = [Environment]::GetEnvironmentVariable($Name, "User")
    if ([string]::IsNullOrWhiteSpace($existingUserValue)) {
        [Environment]::SetEnvironmentVariable($Name, $Value, "User")
        Write-Ok "Set user environment variable $Name to $Value"
        Set-EnvironmentForSession -Name $Name -Value $Value
        return
    }

    if ($existingUserValue -ne $Value) {
        Write-Warn "User environment variable $Name already points to $existingUserValue. Leaving it unchanged."
        Set-EnvironmentForSession -Name $Name -Value $existingUserValue
        return
    }

    Write-Ok "User environment variable $Name already points to $Value"
    Set-EnvironmentForSession -Name $Name -Value $Value
}

function Backup-File {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return $null
    }

    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = "$Path.pre-codex-setup-$timestamp.bak"
    Copy-Item -LiteralPath $Path -Destination $backupPath -Force
    return $backupPath
}

function Write-Utf8File {
    param(
        [string]$Path,
        [string[]]$Lines
    )

    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllLines($Path, $Lines, $encoding)
}

function Ensure-TomlBooleanSetting {
    param(
        [string]$Path,
        [string]$Section,
        [string]$Key,
        [bool]$Value
    )

    $desiredLiteral = if ($Value) { "true" } else { "false" }
    $lines = New-Object System.Collections.Generic.List[string]
    if (Test-Path -LiteralPath $Path) {
        foreach ($line in Get-Content -LiteralPath $Path) {
            $null = $lines.Add($line)
        }
    }

    $sectionPattern = "^\[$([regex]::Escape($Section))\]\s*$"
    $keyPattern = "^\s*$([regex]::Escape($Key))\s*="
    $nextSectionPattern = "^\[.+\]\s*$"

    $sectionIndex = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match $sectionPattern) {
            $sectionIndex = $i
            break
        }
    }

    $changed = $false
    if ($sectionIndex -ge 0) {
        $nextSectionIndex = $lines.Count
        for ($i = $sectionIndex + 1; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match $nextSectionPattern) {
                $nextSectionIndex = $i
                break
            }
        }

        $keyIndex = -1
        for ($i = $sectionIndex + 1; $i -lt $nextSectionIndex; $i++) {
            if ($lines[$i] -match $keyPattern) {
                $keyIndex = $i
                break
            }
        }

        if ($keyIndex -ge 0) {
            $desiredLine = "$Key = $desiredLiteral"
            if ($lines[$keyIndex] -ne $desiredLine) {
                $lines[$keyIndex] = $desiredLine
                $changed = $true
            }
        } else {
            $lines.Insert($nextSectionIndex, "$Key = $desiredLiteral")
            $changed = $true
        }
    } else {
        if ($lines.Count -gt 0 -and $lines[$lines.Count - 1].Trim().Length -gt 0) {
            $null = $lines.Add("")
        }
        $null = $lines.Add("[$Section]")
        $null = $lines.Add("$Key = $desiredLiteral")
        $changed = $true
    }

    if ($changed) {
        $backupPath = Backup-File -Path $Path
        Ensure-Directory -Path (Split-Path -Parent $Path)
        Write-Utf8File -Path $Path -Lines $lines
        if ($backupPath) {
            Write-Ok "Updated $Path and saved a backup to $backupPath"
        } else {
            Write-Ok "Created $Path with [$Section] $Key = $desiredLiteral"
        }
    } else {
        Write-Ok "$Path already contains [$Section] $Key = $desiredLiteral"
    }
}

function Copy-DirectoryFresh {
    param(
        [string]$Source,
        [string]$Destination
    )

    if (Test-Path -LiteralPath $Destination) {
        Remove-Item -LiteralPath $Destination -Recurse -Force
    }

    Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
}

function Sync-RepoOwnedSkills {
    param(
        [string]$SourceRoot,
        [string]$DestinationRoot
    )

    Ensure-Directory -Path $DestinationRoot

    $syncedSkills = @()
    foreach ($skillDirectory in Get-ChildItem -LiteralPath $SourceRoot -Directory | Sort-Object Name) {
        $destination = Join-Path $DestinationRoot $skillDirectory.Name
        Copy-DirectoryFresh -Source $skillDirectory.FullName -Destination $destination
        $syncedSkills += $skillDirectory.Name
    }

    return $syncedSkills
}

function Resolve-PythonCommand {
    $py = Get-Command py -ErrorAction SilentlyContinue
    if ($py) {
        return @("py", "-3")
    }

    $python = Get-Command python -ErrorAction SilentlyContinue
    if ($python) {
        return @("python")
    }

    return $null
}

function Install-CuratedSkill {
    param(
        [string]$SkillName,
        [string]$CodexHome
    )

    $destination = Join-Path $CodexHome "skills\$SkillName"
    if (Test-Path -LiteralPath $destination) {
        Write-Ok "Curated skill $SkillName is already installed"
        return
    }

    $cachedSkill = Join-Path $CodexHome "vendor_imports\skills\skills\.curated\$SkillName"
    if (Test-Path -LiteralPath $cachedSkill) {
        Copy-DirectoryFresh -Source $cachedSkill -Destination $destination
        Write-Ok "Installed curated skill $SkillName from the local cache"
        return
    }

    $installerScript = Join-Path $CodexHome "skills\.system\skill-installer\scripts\install-skill-from-github.py"
    $pythonCommand = Resolve-PythonCommand
    if (-not (Test-Path -LiteralPath $installerScript) -or $null -eq $pythonCommand) {
        throw "Could not install curated skill $SkillName because the local cache is missing and the skill-installer fallback is unavailable."
    }

    $pythonExecutable = $pythonCommand[0]
    $pythonArgs = @()
    if ($pythonCommand.Count -gt 1) {
        $pythonArgs += $pythonCommand[1..($pythonCommand.Count - 1)]
    }
    $pythonArgs += @(
        $installerScript,
        "--repo", "openai/skills",
        "--path", "skills/.curated/$SkillName",
        "--dest", (Join-Path $CodexHome "skills")
    )

    & $pythonExecutable @pythonArgs
    if ($LASTEXITCODE -ne 0) {
        throw "The skill-installer fallback failed while installing $SkillName."
    }

    Write-Ok "Installed curated skill $SkillName via the skill-installer fallback"
}

Write-Step "Ensuring the local Codex home path is configured"
Ensure-UserEnvironmentVariable -Name "HOME" -Value $DesiredHome
Ensure-UserEnvironmentVariable -Name "CODEX_HOME" -Value $DesiredCodexHome
Ensure-Directory -Path $DesiredCodexHome

Write-Step "Ensuring js_repl is enabled in the local Codex config"
$configPath = Join-Path $DesiredCodexHome "config.toml"
Ensure-TomlBooleanSetting -Path $configPath -Section "features" -Key "js_repl" -Value $true

Write-Step "Syncing repo-owned skills into the local Codex home"
if (-not (Test-Path -LiteralPath $RepoSkillsRoot)) {
    throw "The repo-owned skill directory $RepoSkillsRoot does not exist."
}
$syncedSkills = Sync-RepoOwnedSkills -SourceRoot $RepoSkillsRoot -DestinationRoot (Join-Path $DesiredCodexHome "skills")
Write-Ok ("Synced repo-owned skills: " + ($syncedSkills -join ", "))

Write-Step "Installing the lean local-only curated skills"
foreach ($skillName in @("playwright", "playwright-interactive", "screenshot")) {
    Install-CuratedSkill -SkillName $skillName -CodexHome $DesiredCodexHome
}

Write-Host ""
Write-Host "Restart the Codex desktop app before relying on the new skills or js_repl." -ForegroundColor Yellow
Write-Host "Then run .\test-codex.ps1 from $RepoRoot to verify the workstation." -ForegroundColor Yellow
