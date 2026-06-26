# Build backend + frontend and create cPanel upload ZIPs (no node_modules).
# Run from repo root:  powershell -ExecutionPolicy Bypass -File deploy/prepare-prod-zips.ps1
# Skip rebuild (OneDrive EPERM):  ... -ZipOnly

param([switch]$ZipOnly)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'deploy\output'
$null = New-Item -ItemType Directory -Force -Path $outDir

if (-not $ZipOnly) {
Write-Host '=== Backend build ===' -ForegroundColor Cyan
Push-Location (Join-Path $root 'backend')
try {
  npm ci --ignore-scripts
} catch {
  Write-Host 'WARN: npm ci failed (OneDrive lock?) — using existing node_modules' -ForegroundColor Yellow
}
Write-Host 'Prisma client (temp dir — OneDrive safe)...' -ForegroundColor Cyan
& (Join-Path $root 'deploy\generate-prisma-cpanel.ps1')
$prismaZip = Join-Path $outDir 'prisma-cpanel.zip'
if (Test-Path $prismaZip) {
  $prismaExtract = Join-Path $env:TEMP 'mvpmms-prisma-for-build'
  if (Test-Path $prismaExtract) { Remove-Item $prismaExtract -Recurse -Force -ErrorAction SilentlyContinue }
  Expand-Archive -Path $prismaZip -DestinationPath $prismaExtract -Force
  $dstPrisma = Join-Path (Get-Location) 'node_modules\.prisma'
  if (Test-Path $dstPrisma) { Remove-Item $dstPrisma -Recurse -Force -ErrorAction SilentlyContinue }
  New-Item -ItemType Directory -Force -Path (Join-Path (Get-Location) 'node_modules') | Out-Null
  Copy-Item (Join-Path $prismaExtract '.prisma') $dstPrisma -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item $prismaExtract -Recurse -Force -ErrorAction SilentlyContinue
}
try { npm run build; npm prune --omit=dev } catch {
  Write-Host 'WARN: build skipped — using existing dist/' -ForegroundColor Yellow
}
Pop-Location

Write-Host '=== Frontend build ===' -ForegroundColor Cyan
Push-Location (Join-Path $root 'frontend')
if (-not (Test-Path '.env.production')) {
  Copy-Item (Join-Path $root 'deploy\frontend.env.cpanel') '.env.production'
  Write-Host 'Created frontend/.env.production from deploy/frontend.env.cpanel' -ForegroundColor Yellow
}
try {
  npm ci
  npm run build
} catch {
  Write-Host 'WARN: frontend build skipped — using existing .next/' -ForegroundColor Yellow
}
Pop-Location
} else {
  Write-Host 'ZipOnly — skipping npm build' -ForegroundColor Yellow
  & (Join-Path $root 'deploy\generate-prisma-cpanel.ps1')
}

$apiZip = Join-Path $outDir 'deploy-api.zip'
$webZip = Join-Path $outDir 'deploy-web.zip'
if (Test-Path $apiZip) { Remove-Item $apiZip -Force }
if (Test-Path $webZip) { Remove-Item $webZip -Force }

Write-Host '=== Zipping backend (api.rankage.shop) ===' -ForegroundColor Cyan
$backendItems = @(
  'package.json', 'package-lock.json', 'server.js', 'dist', 'prisma', 'uploads'
)
$backendDir = Join-Path $root 'backend'
$npmrcSrc = Join-Path $root 'deploy\backend.npmrc'
$npmrcDst = Join-Path $backendDir '.npmrc'
$npmrcCopied = $false
if (Test-Path $npmrcSrc) {
  Copy-Item $npmrcSrc $npmrcDst -Force
  $backendItems += '.npmrc'
  $npmrcCopied = $true
}
Push-Location $backendDir
Compress-Archive -Path $backendItems -DestinationPath $apiZip -Force
Pop-Location
if ($npmrcCopied) { Remove-Item $npmrcDst -Force }

Write-Host '=== Zipping frontend (rankage.shop) ===' -ForegroundColor Cyan
$frontendRoot = Join-Path $root 'frontend'
Push-Location $frontendRoot
$webItems = @('.next', 'public', 'package.json', 'package-lock.json', 'next.config.js', 'next.config.mjs', 'server.js', '.env.production')
$existing = $webItems | Where-Object { Test-Path $_ }
if (-not (Test-Path 'server.js')) {
  @'
/** cPanel Node.js startup — rankage.shop */
process.chdir(__dirname);
require('next/dist/bin/next');
'@ | Set-Content -Encoding UTF8 'server.js'
  $existing += 'server.js'
}
Compress-Archive -Path $existing -DestinationPath $webZip -Force
Pop-Location

Write-Host ''
Write-Host 'Done.' -ForegroundColor Green
Write-Host "  API zip: $apiZip"
Write-Host "  Web zip: $webZip"
Write-Host "  Prisma:  $outDir\prisma-cpanel.zip  (extract into venv node_modules on server)"
Write-Host ''
Write-Host 'Next: upload to cPanel — see deploy/RUN-LAUNCH-6-MM.md Step 1' -ForegroundColor Cyan
