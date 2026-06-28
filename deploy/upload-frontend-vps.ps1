# Upload full frontend SOURCE to VPS (fixes missing HomeSection, ShopIcon, branding, etc.)
# Run from repo root on Windows:
#   powershell -ExecutionPolicy Bypass -File deploy/upload-frontend-vps.ps1
#   powershell -ExecutionPolicy Bypass -File deploy/upload-frontend-vps.ps1 -VpsHost 64.204.130.6 -Rebuild

param(
  [string]$VpsHost = "64.204.130.6",
  [string]$VpsUser = "root",
  [string]$RemotePath = "/var/www/mvpmms",
  [switch]$Rebuild
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root 'frontend'
$archive = Join-Path $env:TEMP 'mvpmms-frontend-src.tar.gz'

if (-not (Test-Path $frontend)) {
  Write-Error "frontend folder not found: $frontend"
}

Write-Host "=== Pack frontend source (exclude node_modules, .next) ===" -ForegroundColor Cyan
if (Test-Path $archive) { Remove-Item $archive -Force }

Push-Location $frontend
try {
  tar -czf $archive `
    --exclude=node_modules `
    --exclude=.next `
    --exclude=.env.local `
    --exclude=.env.development.local `
    .
} finally {
  Pop-Location
}

$remoteArchive = "/tmp/mvpmms-frontend-src.tar.gz"
Write-Host "=== Upload to ${VpsUser}@${VpsHost} ===" -ForegroundColor Cyan
scp $archive "${VpsUser}@${VpsHost}:${remoteArchive}"

$remoteScript = @"
set -e
cd $RemotePath/frontend
echo '==> Extract frontend source'
tar -xzf $remoteArchive
rm -f $remoteArchive
echo '==> Required files check'
for f in components/HomeSection.tsx components/ShopIcon.tsx components/MobileTabBar.tsx components/BrandLogo.tsx lib/branding.ts; do
  if [ ! -f "\`$f" ]; then echo "MISSING: `\`$f"; exit 1; fi
done
echo 'OK — all required files present'
"@

if ($Rebuild) {
  $remoteScript += @"

echo '==> npm ci + build'
npm ci
npm run build
cd $RemotePath
pm2 restart rankage-web
pm2 save
sleep 2
curl -sfI http://127.0.0.1:3000/ | head -1 || { echo 'Frontend still down — pm2 logs rankage-web'; exit 1; }
echo 'Done — https://rankage.shop should work'
"@
} else {
  $remoteScript += @"

echo 'Next on VPS:'
echo '  cd $RemotePath/frontend && npm ci && npm run build'
echo '  cd $RemotePath && pm2 restart rankage-web'
"@
}

Write-Host "=== Extract on VPS ===" -ForegroundColor Cyan
ssh "${VpsUser}@${VpsHost}" $remoteScript

Write-Host ""
Write-Host "Upload complete." -ForegroundColor Green
if (-not $Rebuild) {
  Write-Host "Run with -Rebuild to build + restart PM2 on VPS." -ForegroundColor Yellow
}
