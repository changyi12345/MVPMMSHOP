# Sets JAVA_HOME and ANDROID_HOME for local Android builds (current session only).
$ErrorActionPreference = 'Stop'

function Resolve-JavaHome {
  if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME 'bin\java.exe'))) {
    return $env:JAVA_HOME
  }

  $candidates = @(
    'C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot',
    'C:\Program Files\Android\Android Studio\jbr'
  )

  foreach ($path in $candidates) {
    if (Test-Path (Join-Path $path 'bin\java.exe')) { return $path }
  }

  $msJdk = Get-ChildItem 'C:\Program Files\Microsoft' -Filter 'jdk-*' -Directory -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    Select-Object -First 1
  if ($msJdk -and (Test-Path (Join-Path $msJdk.FullName 'bin\java.exe'))) {
    return $msJdk.FullName
  }

  return $null
}

$javaHome = Resolve-JavaHome
if (-not $javaHome) {
  Write-Error "JDK 17 not found. Install Microsoft OpenJDK 17 or Android Studio, then retry."
}

$androidHome = $env:ANDROID_HOME
if (-not $androidHome) { $androidHome = $env:ANDROID_SDK_ROOT }
if (-not $androidHome) { $androidHome = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }

if (-not (Test-Path $androidHome)) {
  Write-Error "Android SDK not found at $androidHome. Install Android Studio and the SDK first."
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidHome
$env:ANDROID_SDK_ROOT = $androidHome
$env:Path = "$javaHome\bin;$androidHome\platform-tools;$androidHome\emulator;$env:Path"

Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
