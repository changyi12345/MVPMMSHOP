$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\setup-env.ps1"
Set-Location (Split-Path -Parent $PSScriptRoot)
npx react-native run-android @args
