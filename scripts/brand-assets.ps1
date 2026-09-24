# Génère tous les fichiers du logo TAS à partir des deux originaux de brand/source/ :
#   tas-logo-source.png : le logo « TAS » sur fond blanc
#   tas-icon-source.png : l'icône carrée bleue (favicon)
#
# Sorties :
#   public/brand/tas-logo.png        logo couleur, fond transparent (fonds clairs)
#   public/brand/tas-logo-white.png  logo tout blanc, fond transparent (fonds sombres)
#   public/brand/tas-icon-{64,128,256,512}.png  icône coins arrondis, fond transparent
#   app/icon.png (512), app/apple-icon.png (180, plein cadre), app/favicon.ico (16, 32, 48)
#
#   powershell -ExecutionPolicy Bypass -File scripts/brand-assets.ps1

$root = Split-Path -Parent $PSScriptRoot

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class Brand {
  static int[] Read(Bitmap b) {
    var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    var px = new int[b.Width * b.Height];
    Marshal.Copy(d.Scan0, px, 0, px.Length);
    b.UnlockBits(d);
    return px;
  }

  static Bitmap Write(int[] px, int w, int h) {
    var b = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    var d = b.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    Marshal.Copy(px, 0, d.Scan0, px.Length);
    b.UnlockBits(d);
    return b;
  }

  static int A(int p) { return (p >> 24) & 255; }
  static int R(int p) { return (p >> 16) & 255; }
  static int G(int p) { return (p >> 8) & 255; }
  static int B(int p) { return p & 255; }
  static int Argb(int a, int r, int g, int b) { return (a << 24) | (r << 16) | (g << 8) | b; }
  static int Clamp(double v) { return v < 0 ? 0 : v > 255 ? 255 : (int)Math.Round(v); }

  public static Bitmap Resize(Bitmap src, int w, int h) {
    var dst = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(dst)) {
      g.CompositingMode = CompositingMode.SourceCopy;
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      g.SmoothingMode = SmoothingMode.HighQuality;
      using (var wrap = new ImageAttributes()) {
        wrap.SetWrapMode(WrapMode.TileFlipXY);
        g.DrawImage(src, new Rectangle(0, 0, w, h), 0, 0, src.Width, src.Height, GraphicsUnit.Pixel, wrap);
      }
    }
    return dst;
  }

  // Logo sur fond blanc -> fond transparent, en « démélangeant » le blanc des bords
  // pour garder un contour lisse. Puis recadrage serré avec une petite marge.
  public static Bitmap LogoTransparent(string path, bool white) {
    using (var src = new Bitmap(path)) {
      int w = src.Width, h = src.Height;
      var px = Read(src);
      int minX = w, minY = h, maxX = -1, maxY = -1;
      for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
        int p = px[y * w + x];
        int mn = Math.Min(R(p), Math.Min(G(p), B(p)));
        double a = (255.0 - mn) / 255.0;
        a = (a - 0.06) / 0.94;               // bruit JPEG du fond blanc -> 0
        if (a <= 0) { px[y * w + x] = 0; continue; }
        if (a > 1) a = 1;
        int r, g, b;
        if (white) { r = g = b = 255; }
        else {
          r = Clamp((R(p) - 255 * (1 - a)) / a);
          g = Clamp((G(p) - 255 * (1 - a)) / a);
          b = Clamp((B(p) - 255 * (1 - a)) / a);
        }
        px[y * w + x] = Argb(Clamp(a * 255), r, g, b);
        if (a > 0.2) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      }
      int pad = (int)(Math.Max(maxX - minX, maxY - minY) * 0.02);
      minX = Math.Max(0, minX - pad); minY = Math.Max(0, minY - pad);
      maxX = Math.Min(w - 1, maxX + pad); maxY = Math.Min(h - 1, maxY + pad);
      int cw = maxX - minX + 1, ch = maxY - minY + 1;
      var outPx = new int[cw * ch];
      for (int y = 0; y < ch; y++) Array.Copy(px, (y + minY) * w + minX, outPx, y * cw, cw);
      return Write(outPx, cw, ch);
    }
  }

  static bool Solid(int p) { return A(p) > 230 && B(p) > 120 && B(p) > R(p) + 60; }

  // Icône : on retrouve le carré bleu (en ignorant les traces autour), on mesure l'arrondi,
  // puis on redessine un masque propre. extend=true remplit les coins avec la couleur du bord
  // (icône Apple, qui applique son propre arrondi).
  public static Bitmap Icon(string path, bool extend) {
    using (var src = new Bitmap(path)) {
      int w = src.Width, h = src.Height;
      var px = Read(src);
      // Bords : lignes/colonnes où plus de la moitié des pixels sont du bleu opaque.
      int top = -1, bottom = -1, left = -1, right = -1;
      for (int y = 0; y < h; y++) { int n = 0; for (int x = 0; x < w; x++) if (Solid(px[y * w + x])) n++; if (n > w / 2) { if (top < 0) top = y; bottom = y; } }
      for (int x = 0; x < w; x++) { int n = 0; for (int y = 0; y < h; y++) if (Solid(px[y * w + x])) n++; if (n > h / 2) { if (left < 0) left = x; right = x; } }
      // Les lignes « à moitié pleines » commencent déjà dans l'arrondi : on élargit d'autant.
      int side = Math.Max(right - left, bottom - top) + 1;
      // Rayon : le long de la diagonale depuis le coin haut-gauche.
      int t = 0;
      while (t < side / 2 && !Solid(px[(top + t) * w + (left + t)])) t++;
      double r = t / (1 - 1 / Math.Sqrt(2));
      if (r < side * 0.08) r = side * 0.08;
      if (r > side * 0.3) r = side * 0.3;
      Console.WriteLine("icon box " + left + "," + top + " -> " + right + "," + bottom + "  radius " + Math.Round(r));

      int s = side;
      var outPx = new int[s * s];
      for (int y = 0; y < s; y++) for (int x = 0; x < s; x++) {
        double cx = Math.Min(Math.Max(x + 0.5, r), s - r), cy = Math.Min(Math.Max(y + 0.5, r), s - r);
        double dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        double dist = Math.Sqrt(dx * dx + dy * dy);
        double cover = Math.Min(1, Math.Max(0, r - dist + 0.5));   // anticrénelage sur 1 px
        int sx = left + x, sy = top + y;
        if (extend && cover < 1) {
          // Couleur du point le plus proche à l'intérieur de l'arrondi (2 px vers le centre).
          double k = dist > 0 ? (r - 3) / dist : 0;
          sx = left + (int)(cx + dx * k); sy = top + (int)(cy + dy * k);
          cover = 1;
        }
        sx = Math.Min(Math.Max(sx, 0), w - 1); sy = Math.Min(Math.Max(sy, 0), h - 1);
        int p = px[sy * w + sx];
        outPx[y * s + x] = Argb(Clamp(cover * 255), R(p), G(p), B(p));
      }
      return Write(outPx, s, s);
    }
  }

  public static void SavePng(Bitmap b, string path) { b.Save(path, ImageFormat.Png); }

  // .ico avec plusieurs tailles, chaque image stockée en PNG (format accepté par tous les navigateurs).
  public static void SaveIco(Bitmap master, int[] sizes, string path) {
    var pngs = new byte[sizes.Length][];
    for (int i = 0; i < sizes.Length; i++) using (var b = Resize(master, sizes[i], sizes[i])) using (var ms = new MemoryStream()) { b.Save(ms, ImageFormat.Png); pngs[i] = ms.ToArray(); }
    using (var fs = new FileStream(path, FileMode.Create)) using (var bw = new BinaryWriter(fs)) {
      bw.Write((short)0); bw.Write((short)1); bw.Write((short)sizes.Length);
      int offset = 6 + 16 * sizes.Length;
      for (int i = 0; i < sizes.Length; i++) {
        bw.Write((byte)(sizes[i] >= 256 ? 0 : sizes[i])); bw.Write((byte)(sizes[i] >= 256 ? 0 : sizes[i]));
        bw.Write((byte)0); bw.Write((byte)0); bw.Write((short)1); bw.Write((short)32);
        bw.Write(pngs[i].Length); bw.Write(offset); offset += pngs[i].Length;
      }
      foreach (var p in pngs) bw.Write(p);
    }
  }
}
"@

$src = Join-Path $root "brand\source"
$pub = Join-Path $root "public\brand"
$app = Join-Path $root "app"
New-Item -ItemType Directory -Force $pub | Out-Null

function Save-Resized($bmp, $w, $path) {
  $h = [int][Math]::Round($bmp.Height * $w / $bmp.Width)
  $r = [Brand]::Resize($bmp, $w, $h)
  [Brand]::SavePng($r, $path); $r.Dispose()
  "{0,-40} {1}x{2}  {3} Ko" -f (Split-Path $path -Leaf), $w, $h, [int]((Get-Item $path).Length / 1KB)
}

$logo = [Brand]::LogoTransparent((Join-Path $src "tas-logo-source.png"), $false)
Save-Resized $logo 1200 (Join-Path $pub "tas-logo.png")
Save-Resized $logo 480 (Join-Path $pub "tas-logo-480.png")
$logo.Dispose()

$logoWhite = [Brand]::LogoTransparent((Join-Path $src "tas-logo-source.png"), $true)
Save-Resized $logoWhite 1200 (Join-Path $pub "tas-logo-white.png")
Save-Resized $logoWhite 480 (Join-Path $pub "tas-logo-white-480.png")
$logoWhite.Dispose()

$icon = [Brand]::Icon((Join-Path $src "tas-icon-source.png"), $false)
foreach ($s in 64, 128, 256, 512) { Save-Resized $icon $s (Join-Path $pub "tas-icon-$s.png") }
Save-Resized $icon 512 (Join-Path $app "icon.png")
[Brand]::SaveIco($icon, @(16, 32, 48), (Join-Path $app "favicon.ico"))
"favicon.ico                              16, 32, 48"
$icon.Dispose()

$full = [Brand]::Icon((Join-Path $src "tas-icon-source.png"), $true)
Save-Resized $full 180 (Join-Path $app "apple-icon.png")
$full.Dispose()
