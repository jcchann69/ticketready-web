$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$assets = Join-Path $root "assets"

function New-AppIcon {
  param(
    [int] $Size,
    [string] $Path
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $bounds = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $bounds,
    [System.Drawing.Color]::FromArgb(17, 24, 39),
    [System.Drawing.Color]::FromArgb(25, 49, 79),
    45
  )
  $graphics.FillRectangle($bgBrush, $bounds)

  $ticketX = [int]($Size * 0.2)
  $ticketY = [int]($Size * 0.22)
  $ticketW = [int]($Size * 0.6)
  $ticketH = [int]($Size * 0.48)
  $ticketRect = New-Object System.Drawing.Rectangle $ticketX, $ticketY, $ticketW, $ticketH
  $ticketBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $ticketRect,
    [System.Drawing.Color]::White,
    [System.Drawing.Color]::FromArgb(232, 242, 255),
    90
  )

  $ticketPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $corner = [float]($Size * 0.045)
  $ticketPath.AddArc($ticketX, $ticketY, $corner, $corner, 180, 90)
  $ticketPath.AddArc($ticketX + $ticketW - $corner, $ticketY, $corner, $corner, 270, 90)
  $ticketPath.AddArc($ticketX + $ticketW - $corner, $ticketY + $ticketH - $corner, $corner, $corner, 0, 90)
  $ticketPath.AddArc($ticketX, $ticketY + $ticketH - $corner, $corner, $corner, 90, 90)
  $ticketPath.CloseFigure()
  $graphics.FillPath($ticketBrush, $ticketPath)

  $bluePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(29, 78, 216)), ([float]($Size * 0.04))
  $bluePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $bluePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $lineX = [int]($Size * 0.31)
  $graphics.DrawLine($bluePen, $lineX, [int]($Size * 0.39), [int]($Size * 0.63), [int]($Size * 0.39))
  $graphics.DrawLine($bluePen, $lineX, [int]($Size * 0.50), [int]($Size * 0.70), [int]($Size * 0.50))
  $graphics.DrawLine($bluePen, $lineX, [int]($Size * 0.61), [int]($Size * 0.55), [int]($Size * 0.61))

  $checkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(34, 197, 94))
  $checkSize = [int]($Size * 0.16)
  $graphics.FillEllipse($checkBrush, [int]($Size * 0.64), [int]($Size * 0.55), $checkSize, $checkSize)

  $whitePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), ([float]($Size * 0.028))
  $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $graphics.DrawLines($whitePen, @(
    [System.Drawing.Point]::new([int]($Size * 0.675), [int]($Size * 0.635)),
    [System.Drawing.Point]::new([int]($Size * 0.705), [int]($Size * 0.665)),
    [System.Drawing.Point]::new([int]($Size * 0.765), [int]($Size * 0.585))
  ))

  $font = New-Object System.Drawing.Font "Segoe UI", ([float]($Size * 0.11)), ([System.Drawing.FontStyle]::Bold)
  $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(219, 234, 254))
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $graphics.DrawString("TR", $font, $textBrush, [float]($Size / 2), [float]($Size * 0.8), $format)

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

  $format.Dispose()
  $font.Dispose()
  $textBrush.Dispose()
  $whitePen.Dispose()
  $checkBrush.Dispose()
  $bluePen.Dispose()
  $ticketPath.Dispose()
  $ticketBrush.Dispose()
  $bgBrush.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-AppIcon -Size 32 -Path (Join-Path $assets "favicon-32.png")
New-AppIcon -Size 180 -Path (Join-Path $assets "app-icon-180.png")
New-AppIcon -Size 192 -Path (Join-Path $assets "app-icon-192.png")
New-AppIcon -Size 512 -Path (Join-Path $assets "app-icon-512.png")
