# Sync branding JPGs + Android launcher icons (tab bar uses Ionicons vector icons in app)
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$src = Join-Path $root 'frontend\public\branding\logo.jpg'
$brand = Join-Path $root 'mobile\assets\branding'
$iconDir = Join-Path $root 'mobile\assets\icons'
$androidRes = Join-Path $root 'mobile\android\app\src\main\res'

$dirs = @(
  $iconDir,
  (Join-Path $androidRes 'drawable'),
  (Join-Path $androidRes 'mipmap-mdpi'),
  (Join-Path $androidRes 'mipmap-hdpi'),
  (Join-Path $androidRes 'mipmap-xhdpi'),
  (Join-Path $androidRes 'mipmap-xxhdpi'),
  (Join-Path $androidRes 'mipmap-xxxhdpi')
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Force -Path $d | Out-Null }

Copy-Item -Force (Join-Path $root 'frontend\public\branding\*') $brand\

Add-Type -AssemblyName System.Drawing

function Resize-Img([string]$inPath, [string]$outPath, [int]$size) {
  $img = [System.Drawing.Image]::FromFile($inPath)
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, $size, $size)
  $g.Dispose()
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  $img.Dispose()
}

function New-TabIcon([string]$label, [string]$outPath, [int]$size) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $bg = [System.Drawing.Color]::FromArgb(255, 49, 46, 129)
  $g.Clear([System.Drawing.Color]::Transparent)
  $brush = New-Object System.Drawing.SolidBrush $bg
  $pad = [int]($size * 0.06)
  $g.FillEllipse($brush, $pad, $pad, $size - $pad * 2, $size - $pad * 2)
  $fontSize = [int]($size * 0.38)
  $font = [System.Drawing.Font]::new('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $textSize = $g.MeasureString($label, $font)
  $x = ($size - $textSize.Width) / 2
  $y = ($size - $textSize.Height) / 2 - 1
  $g.DrawString($label, $font, [System.Drawing.Brushes]::White, $x, $y)
  $g.Dispose()
  $font.Dispose()
  $brush.Dispose()
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Resize-Img $src (Join-Path $iconDir 'app-icon.png') 192
Resize-Img $src (Join-Path $androidRes 'drawable\ic_launcher.png') 192

$sizes = @{
  'mipmap-mdpi'    = 48
  'mipmap-hdpi'    = 72
  'mipmap-xhdpi'   = 96
  'mipmap-xxhdpi'  = 144
  'mipmap-xxxhdpi' = 192
}
foreach ($entry in $sizes.GetEnumerator()) {
  $path = Join-Path $androidRes "$($entry.Key)\ic_launcher.png"
  Resize-Img $src $path $entry.Value
  Copy-Item -Force $path (Join-Path $androidRes "$($entry.Key)\ic_launcher_round.png")
}

Write-Host "Branding + icons synced."
