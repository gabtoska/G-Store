$ErrorActionPreference = "Stop"

$projectDirectory = Split-Path -Parent $PSScriptRoot
$environmentPath = Join-Path $projectDirectory ".env"

if (-not (Test-Path -LiteralPath $environmentPath)) {
  throw "Missing .env file at $environmentPath"
}

$securePassword = Read-Host "Enter your Supabase database password" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  if ([string]::IsNullOrWhiteSpace($plainPassword)) {
    throw "The database password cannot be empty."
  }
  $encodedPassword = [Uri]::EscapeDataString($plainPassword)
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  $plainPassword = $null
  $securePassword = $null
}

$databaseUrl = "postgresql://postgres.kldlripqgzkuyyaybhmw:$encodedPassword@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
$directUrl = "postgresql://postgres.kldlripqgzkuyyaybhmw:$encodedPassword@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
$environmentText = [IO.File]::ReadAllText($environmentPath)

function Set-EnvironmentValue {
  param([string]$Name, [string]$Value)
  $escapedName = [regex]::Escape($Name)
  if ($script:environmentText -match "(?m)^$escapedName=") {
    $script:environmentText = [regex]::Replace($script:environmentText, "(?m)^$escapedName=.*$", "$Name=`"$Value`"")
  }
  else {
    $script:environmentText = $script:environmentText.TrimEnd() + [Environment]::NewLine + "$Name=`"$Value`"" + [Environment]::NewLine
  }
}

Set-EnvironmentValue -Name "DATABASE_URL" -Value $databaseUrl
Set-EnvironmentValue -Name "DIRECT_URL" -Value $directUrl
[IO.File]::WriteAllText($environmentPath, $environmentText, [Text.UTF8Encoding]::new($false))

$encodedPassword = $null
$databaseUrl = $null
$directUrl = $null

Push-Location $projectDirectory
try {
  & npm.cmd run db:generate
  if ($LASTEXITCODE -ne 0) { throw "Prisma client generation failed." }
  & npm.cmd run db:deploy
  if ($LASTEXITCODE -ne 0) { throw "Supabase migration failed." }
  & npm.cmd run db:seed
  if ($LASTEXITCODE -ne 0) { throw "Supabase seed failed." }
}
finally {
  Pop-Location
}

Write-Output "Supabase is configured, migrated, and seeded. Run: npm.cmd run dev"
