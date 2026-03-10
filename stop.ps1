param()

$scriptPath = Join-Path $PSScriptRoot 'stop-all.ps1'
& $scriptPath @args
exit $LASTEXITCODE
