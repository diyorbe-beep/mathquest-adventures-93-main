$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pub = Join-Path $root "public"
New-Item -ItemType Directory -Force -Path $pub | Out-Null
Add-Type -AssemblyName System.Drawing
foreach ($s in @(192, 512)) {
  $bmp = New-Object System.Drawing.Bitmap $s, $s
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(255, 34, 197, 94))
  $g.Dispose()
  $path = Join-Path $pub "pwa-$s.png"
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "Wrote $path"
}
