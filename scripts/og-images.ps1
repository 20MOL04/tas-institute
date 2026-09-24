# Génère les images d'aperçu de partage (Open Graph) dans public/images/og/.
# 1200 x 630, recadrées au centre, JPEG léger : WhatsApp n'affiche souvent pas
# l'aperçu quand l'image dépasse ~300 Ko.
#
# À relancer après avoir changé l'image d'un article ou d'une page :
#   powershell -ExecutionPolicy Bypass -File scripts/og-images.ps1

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root "public"
$outDir = Join-Path $public "images\og"
New-Item -ItemType Directory -Force $outDir | Out-Null

# Pages : nom du fichier OG -> image source (la même que le hero de la page).
$jobs = [ordered]@{
  "home"                = "/images/hero-home.jpg"
  "about"               = "/images/hero-about.jpg"
  "programs"            = "/images/hero-programs.jpg"
  "accommodation"       = "/images/hero-accommodation.jpg"
  "university-guidance" = "/images/hero-university.jpg"
  "teachers"            = "/images/hero-teachers.jpg"
  "student-stories"     = "/images/hero-stories.jpg"
  "gallery"             = "/images/hero-gallery.jpg"
  "resources"           = "/images/hero-resources.jpg"
  "apply"               = "/images/hero-apply.jpg"
  "contact"             = "/images/hero-contact.jpg"
}

# Articles : lus dans app/lib/articles.ts (couples slug / image dans l'ordre).
$articles = Get-Content (Join-Path $root "app\lib\articles.ts") -Raw -Encoding UTF8
$pattern = 'slug:\s*"([^"]+)",\s*\r?\n\s*image:\s*"([^"]+)"'
foreach ($m in [regex]::Matches($articles, $pattern)) {
  $jobs["article-" + $m.Groups[1].Value] = $m.Groups[2].Value
}

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 80L

$W = 1200; $H = 630
foreach ($name in $jobs.Keys) {
  $src = Join-Path $public ($jobs[$name].TrimStart("/").Replace("/", "\"))
  if (-not (Test-Path $src)) { Write-Warning "Introuvable : $src"; continue }

  $img = [System.Drawing.Image]::FromFile($src)
  try {
    $scale = [Math]::Max($W / $img.Width, $H / $img.Height)
    $cropW = $W / $scale; $cropH = $H / $scale
    $srcRect = New-Object System.Drawing.RectangleF (($img.Width - $cropW) / 2), (($img.Height - $cropH) / 2), $cropW, $cropH

    $bmp = New-Object System.Drawing.Bitmap $W, $H
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, (New-Object System.Drawing.RectangleF 0, 0, $W, $H), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    $dest = Join-Path $outDir "$name.jpg"
    $bmp.Save($dest, $codec, $params)
    $bmp.Dispose()
    "{0,-50} {1,5} Ko" -f "$name.jpg", [int]((Get-Item $dest).Length / 1KB)
  } finally {
    $img.Dispose()
  }
}
