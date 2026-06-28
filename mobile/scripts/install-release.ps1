# Build release APK (JS bundled inside) and install on connected phone via adb.
# Use this for real-device testing — debug builds need Metro running on PC.

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\setup-env.ps1"

$root = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $root 'android')

Write-Host 'Building release APK (bundled JS)...' -ForegroundColor Cyan
.\gradlew assembleRelease
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$apk = Get-ChildItem -Recurse -Filter 'app-release.apk' 'app\build\outputs\apk\release' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $apk) {
  $apk = Get-ChildItem -Recurse -Filter '*-release.apk' 'app\build\outputs\apk\release' -ErrorAction SilentlyContinue | Select-Object -First 1
}
if (-not $apk) {
  Write-Host 'Release APK not found under app/build/outputs/apk/release' -ForegroundColor Red
  exit 1
}

Write-Host "APK: $($apk.FullName)" -ForegroundColor Green
Write-Host 'Installing on device...' -ForegroundColor Cyan
adb install -r $apk.FullName
if ($LASTEXITCODE -ne 0) {
  Write-Host 'adb install failed. Connect phone via USB, enable USB debugging, then retry.' -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host 'Installed. Open MVPMMSHOP on your phone.' -ForegroundColor Green
