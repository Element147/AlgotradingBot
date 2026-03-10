param()

$scriptPath = Join-Path $PSScriptRoot 'build-all.ps1'
& $scriptPath @args
exit $LASTEXITCODE
