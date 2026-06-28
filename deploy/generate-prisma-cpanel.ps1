# Generate Prisma client (driverAdapters + library mode) for cPanel upload.
# Run: powershell -ExecutionPolicy Bypass -File deploy/generate-prisma-cpanel.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'deploy\output'
$null = New-Item -ItemType Directory -Force -Path $outDir

$work = Join-Path $env:TEMP "mvpmms-prisma-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Force -Path $work | Out-Null

Write-Host "Work dir: $work" -ForegroundColor Cyan

Copy-Item (Join-Path $root 'backend\prisma') (Join-Path $work 'prisma') -Recurse -Force
# Linux engines for cPanel (Windows zip alone breaks on server — no .dll on Linux)
$schemaPath = Join-Path $work 'prisma\schema.prisma'
$schema = Get-Content $schemaPath -Raw
$schema = $schema -replace 'binaryTargets\s*=\s*\[[^\]]*\]', 'binaryTargets = ["rhel-openssl-3.0.x", "debian-openssl-3.0.x", "debian-openssl-1.1.x"]'
Set-Content -Path $schemaPath -Value $schema -NoNewline
$pkgJson = Join-Path $work 'package.json'
[System.IO.File]::WriteAllText($pkgJson, '{"name":"prisma-gen","private":true,"dependencies":{"@prisma/client":"5.22.0","prisma":"5.22.0"}}')

Push-Location $work
try {
  Write-Host 'Installing prisma + @prisma/client...' -ForegroundColor Cyan
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  cmd /c "npm install --ignore-scripts 2>&1"
  if ($LASTEXITCODE -ne 0) { throw "npm install failed (exit $LASTEXITCODE)" }
  $ErrorActionPreference = $prevEap

  Write-Host 'Running prisma generate (driverAdapters + library)...' -ForegroundColor Cyan
  cmd /c "npx prisma generate 2>&1"
  if ($LASTEXITCODE -ne 0) { throw "prisma generate failed (exit $LASTEXITCODE)" }

  $prismaDir = Join-Path $work 'node_modules\.prisma'
  $clientDir = Join-Path $work 'node_modules\@prisma\client'
  if (-not (Test-Path $prismaDir)) { throw 'Missing node_modules\.prisma after generate' }
  if (-not (Test-Path $clientDir)) { throw 'Missing node_modules\@prisma\client after generate' }

  $bundle = Join-Path $work 'bundle'
  New-Item -ItemType Directory -Force -Path (Join-Path $bundle '@prisma') | Out-Null
  Copy-Item $prismaDir (Join-Path $bundle '.prisma') -Recurse -Force
  Copy-Item $clientDir (Join-Path $bundle '@prisma\client') -Recurse -Force

  $prismaZip = Join-Path $outDir 'prisma-cpanel.zip'
  if (Test-Path $prismaZip) { Remove-Item $prismaZip -Force }
  Compress-Archive -Path @(
    (Join-Path $bundle '.prisma'),
    (Join-Path $bundle '@prisma')
  ) -DestinationPath $prismaZip -Force

  Write-Host ''
  Write-Host 'Done.' -ForegroundColor Green
  Write-Host "  Zip: $prismaZip"
  Write-Host '  Server (after npm install in api.rankage.shop):'
  Write-Host '    cd ~/api.rankage.shop/node_modules'
  Write-Host '    unzip -o ~/api.rankage.shop/prisma-cpanel.zip'
  Write-Host '  Or skip zip if: npx prisma generate works on server (preferred).'
} finally {
  Pop-Location
  Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
}
