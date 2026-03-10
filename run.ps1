param()

$scriptPath = Join-Path $PSScriptRoot 'run-all.ps1'
& $scriptPath @args
exit $LASTEXITCODE
