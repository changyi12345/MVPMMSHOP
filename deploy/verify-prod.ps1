# Quick prod smoke test after deploy
$urls = @(
  @{ Name = 'API health'; Url = 'https://api.rankage.shop/health' },
  @{ Name = 'API root'; Url = 'https://api.rankage.shop/' },
  @{ Name = 'Web home'; Url = 'https://rankage.shop/' },
  @{ Name = 'FCM status'; Url = 'https://api.rankage.shop/push/fcm/status' },
  @{ Name = 'VAPID key'; Url = 'https://api.rankage.shop/push/vapid-public-key' }
)

Write-Host 'MVPMMSHOP production check' -ForegroundColor Cyan
Write-Host ''

foreach ($item in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $item.Url -UseBasicParsing -TimeoutSec 20
    $preview = $r.Content
    if ($preview.Length -gt 120) { $preview = $preview.Substring(0, 120) + '...' }
    Write-Host "[OK $($r.StatusCode)] $($item.Name)" -ForegroundColor Green
    Write-Host "       $preview"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "[FAIL $code] $($item.Name) - $($item.Url)" -ForegroundColor Red
  }
}
