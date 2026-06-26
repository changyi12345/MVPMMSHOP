# Run Gradle with JAVA_HOME auto-detected (debug builds, clean, etc.)
param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$GradleArgs
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\setup-env.ps1"
Set-Location (Join-Path (Split-Path -Parent $PSScriptRoot) 'android')
& .\gradlew @GradleArgs
