param([ValidateSet('start', 'stop', 'status')][string]$Action = 'start')
$ErrorActionPreference = 'Stop'
$workspaceDirectory = Split-Path -Parent $PSScriptRoot
$clusterDirectory = Join-Path $workspaceDirectory '.local\pgdata'
if (-not (Test-Path -LiteralPath (Join-Path $clusterDirectory 'PG_VERSION'))) {
  throw 'No prepared local cluster found. Use the Docker or existing PostgreSQL setup in README.md.'
}
$postgresVersion = (Get-Content -LiteralPath (Join-Path $clusterDirectory 'PG_VERSION')).Trim()
$pgControlPath = Join-Path $env:ProgramFiles "PostgreSQL\$postgresVersion\bin\pg_ctl.exe"
if (-not (Test-Path -LiteralPath $pgControlPath)) { throw "PostgreSQL $postgresVersion tools were not found." }
if ($Action -eq 'status') {
  & $pgControlPath -D $clusterDirectory status
  exit $LASTEXITCODE
}
if ($Action -eq 'start') {
  & $pgControlPath -D $clusterDirectory status *> $null
  if ($LASTEXITCODE -eq 0) { Write-Output 'Local PostgreSQL is already running on port 55432.'; exit 0 }
  $arguments = @('-D', ('"' + $clusterDirectory + '"'), '-l', ('"' + (Join-Path $workspaceDirectory '.local\postgres.log') + '"'), '-o', '"-p 55432 -h 127.0.0.1"', '-w', 'start')
} else {
  $arguments = @('-D', ('"' + $clusterDirectory + '"'), '-m', 'fast', '-w', 'stop')
}
$pgProcess = Start-Process -FilePath $pgControlPath -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $workspaceDirectory '.local\pg-control.log') -RedirectStandardError (Join-Path $workspaceDirectory '.local\pg-control-error.log')
# Wait only for pg_ctl. Start-Process -Wait would also wait for the database server.
if (-not $pgProcess.WaitForExit(30000)) { throw 'PostgreSQL control timed out; inspect .local/pg-control-error.log.' }
Get-Content -LiteralPath (Join-Path $workspaceDirectory '.local\pg-control.log')
if ($pgProcess.ExitCode -ne 0) {
  Get-Content -LiteralPath (Join-Path $workspaceDirectory '.local\pg-control-error.log')
  exit 1
}
