$ErrorActionPreference = 'Stop'

$javaHome = 'C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot'
$androidHome = Join-Path $env:LOCALAPPDATA 'Android\Sdk'

if (-not (Test-Path $javaHome)) {
  $found = Get-ChildItem 'C:\Program Files\Microsoft' -Filter 'jdk-*' -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($found) { $javaHome = $found.FullName }
}

if (Test-Path $javaHome) {
  $env:JAVA_HOME = $javaHome
  $env:Path = "$javaHome\bin;$env:Path"
}

if (Test-Path $androidHome) {
  $env:ANDROID_HOME = $androidHome
  $env:ANDROID_SDK_ROOT = $androidHome
  $env:Path = "$androidHome\platform-tools;$androidHome\emulator;$env:Path"
}

Set-Location $PSScriptRoot\..

npx react-native start @args
