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
        [Environment]::SetEnvironmentVariable($Name, $Value, "User")
        Write-Warn "User environment variable $Name pointed to $existingUserValue. Updated it to $Value."
        Set-EnvironmentForSession -Name $Name -Value $Value
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

function Write-Utf8TextFile {
    param(
        [string]$Path,
        [string]$Content
    )

    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Test-LineArrayEqual {
    param(
        [string[]]$Left,
        [string[]]$Right
    )

    if ($Left.Count -ne $Right.Count) {
        return $false
    }

    for ($i = 0; $i -lt $Left.Count; $i++) {
        if ($Left[$i] -ne $Right[$i]) {
            return $false
        }
    }

    return $true
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

function Ensure-TomlSectionBlock {
    param(
        [string]$Path,
        [string]$Section,
        [string[]]$SectionLines
    )

    $desiredBlock = New-Object System.Collections.Generic.List[string]
    $null = $desiredBlock.Add("[$Section]")
    foreach ($line in $SectionLines) {
        $null = $desiredBlock.Add($line)
    }

    $lines = New-Object System.Collections.Generic.List[string]
    if (Test-Path -LiteralPath $Path) {
        foreach ($line in Get-Content -LiteralPath $Path) {
            $null = $lines.Add($line)
        }
    }

    $sectionPattern = "^\[$([regex]::Escape($Section))\]\s*$"
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

        $existingBlock = $lines.GetRange($sectionIndex, $nextSectionIndex - $sectionIndex)
        if (-not (Test-LineArrayEqual -Left $existingBlock -Right $desiredBlock)) {
            for ($i = $nextSectionIndex - 1; $i -ge $sectionIndex; $i--) {
                $lines.RemoveAt($i)
            }
            for ($i = 0; $i -lt $desiredBlock.Count; $i++) {
                $lines.Insert($sectionIndex + $i, $desiredBlock[$i])
            }
            $changed = $true
        }
    } else {
        if ($lines.Count -gt 0 -and $lines[$lines.Count - 1].Trim().Length -gt 0) {
            $null = $lines.Add("")
        }
        foreach ($line in $desiredBlock) {
            $null = $lines.Add($line)
        }
        $changed = $true
    }

    if ($changed) {
        $backupPath = Backup-File -Path $Path
        Ensure-Directory -Path (Split-Path -Parent $Path)
        Write-Utf8File -Path $Path -Lines $lines
        if ($backupPath) {
            Write-Ok "Updated [$Section] in $Path and saved a backup to $backupPath"
        } else {
            Write-Ok "Created [$Section] in $Path"
        }
    } else {
        Write-Ok "$Path already contains the expected [$Section] block"
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

function Ensure-PlaywrightLauncherScript {
    param(
        [string]$Path,
        [string]$DesiredHome,
        [string]$DesiredCodexHome,
        [string]$DesiredPlaywrightOutputDir
    )

    $lines = @(
        "[CmdletBinding()]",
        "param()",
        "",
        "Set-StrictMode -Version Latest",
        '$ErrorActionPreference = "Stop"',
        "",
        ('$desiredHome = ''{0}''' -f $DesiredHome.Replace("'", "''")),
        ('$desiredCodexHome = ''{0}''' -f $DesiredCodexHome.Replace("'", "''")),
        ('$desiredPlaywrightOutputDir = ''{0}''' -f $DesiredPlaywrightOutputDir.Replace("'", "''")),
        '$homeDrive = [System.IO.Path]::GetPathRoot($desiredHome).TrimEnd(''\'')',
        '$homePath = $desiredHome.Substring($homeDrive.Length)',
        "",
        'if (-not (Test-Path -LiteralPath $desiredCodexHome)) {',
        '    New-Item -ItemType Directory -Path $desiredCodexHome -Force | Out-Null',
        '}',
        'if (-not (Test-Path -LiteralPath $desiredPlaywrightOutputDir)) {',
        '    New-Item -ItemType Directory -Path $desiredPlaywrightOutputDir -Force | Out-Null',
        '}',
        "",
        '$env:HOME = $desiredHome',
        '$env:USERPROFILE = $desiredHome',
        '$env:HOMEDRIVE = $homeDrive',
        '$env:HOMEPATH = $homePath',
        '$env:CODEX_HOME = $desiredCodexHome',
        '$env:PLAYWRIGHT_MCP_OUTPUT_DIR = $desiredPlaywrightOutputDir',
        'Set-Location -LiteralPath $desiredCodexHome',
        "",
        "& npx @playwright/mcp@latest",
        'exit $LASTEXITCODE'
    )
    $desiredContent = [string]::Join([Environment]::NewLine, $lines) + [Environment]::NewLine

    $writeFile = $true
    if (Test-Path -LiteralPath $Path) {
        $existingContent = Get-Content -LiteralPath $Path -Raw
        if ($existingContent -eq $desiredContent) {
            $writeFile = $false
        }
    }

    if ($writeFile) {
        Ensure-Directory -Path (Split-Path -Parent $Path)
        Write-Utf8TextFile -Path $Path -Content $desiredContent
        Write-Ok "Ensured the local Playwright MCP launcher at $Path"
    } else {
        Write-Ok "The local Playwright MCP launcher already matches the expected content"
    }
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

Write-Step "Pinning the local Playwright MCP launcher to a user-writable home"
$playwrightLauncherPath = Join-Path $DesiredCodexHome "scripts\start-playwright-mcp.ps1"
$playwrightOutputDir = Join-Path $DesiredCodexHome "playwright-mcp"
Ensure-Directory -Path $playwrightOutputDir
Ensure-PlaywrightLauncherScript -Path $playwrightLauncherPath -DesiredHome $DesiredHome -DesiredCodexHome $DesiredCodexHome -DesiredPlaywrightOutputDir $playwrightOutputDir
$escapedLauncherPath = $playwrightLauncherPath.Replace("'", "''")
Ensure-TomlSectionBlock -Path $configPath -Section "mcp_servers.playwright" -SectionLines @(
    "command = 'powershell.exe'",
    "args = ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', '$escapedLauncherPath']"
)

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
