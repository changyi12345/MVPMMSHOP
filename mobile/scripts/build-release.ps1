# Build signed release APK/AAB for MVPMMSHOP mobile

param(
  [ValidateSet('apk', 'aab', 'both')]
  [string]$Target = 'apk'
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\setup-env.ps1"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$keystoreProps = Join-Path $root 'android\keystore.properties'
if (-not (Test-Path $keystoreProps)) {
  Write-Host 'Warning: android/keystore.properties not found.' -ForegroundColor Yellow
  Write-Host 'Copy android/keystore.properties.example and add your release keystore.' -ForegroundColor Yellow
  Write-Host 'Release build will use debug signing until configured.' -ForegroundColor Yellow
}

Set-Location android

if ($Target -eq 'apk' -or $Target -eq 'both') {
  Write-Host 'Building release APK...' -ForegroundColor Cyan
  .\gradlew assembleRelease
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Get-ChildItem -Recurse -Filter '*-release.apk' app/build/outputs/apk/release | ForEach-Object {
    Write-Host "APK: $($_.FullName)" -ForegroundColor Green
  }
}

if ($Target -eq 'aab' -or $Target -eq 'both') {
  Write-Host 'Building release AAB (Play Store)...' -ForegroundColor Cyan
  .\gradlew bundleRelease
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Get-ChildItem -Recurse -Filter '*-release.aab' app/build/outputs/bundle/release | ForEach-Object {
    Write-Host "AAB: $($_.FullName)" -ForegroundColor Green
  }
}

Write-Host ''
Write-Host 'Keystore setup:' -ForegroundColor Cyan
Write-Host '  1. keytool -genkeypair -v -storetype PKCS12 -keystore android/app/mvpmms-release.keystore -alias mvpmms -keyalg RSA -keysize 2048 -validity 10000'
Write-Host '  2. Copy android/keystore.properties.example to android/keystore.properties'
Write-Host '  3. Set storeFile=app/mvpmms-release.keystore and passwords'
