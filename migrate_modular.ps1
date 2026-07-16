$ErrorActionPreference = 'Stop'
$root = 'c:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES'
$src = "$root\v2_modular"

# 1. Move JS files
Move-Item -Path "$src\*.js" -Destination $root -Force

# 2. Update HTML
$html = Get-Content "$src\reportes_v2.html" -Raw -Encoding UTF8
$html = $html -replace '\.\.\/', ''
Set-Content -Path "$root\reportes.html" -Value $html -Encoding UTF8

# 3. Update db_service.js
$db = Get-Content "$root\db_service.js" -Raw -Encoding UTF8
$db = $db -replace '\.\.\/', ''
Set-Content -Path "$root\db_service.js" -Value $db -Encoding UTF8

# 4. Update pdf_engine.js
$pdf = Get-Content "$root\pdf_engine.js" -Raw -Encoding UTF8
$pdf = $pdf -replace '\.\.\/', ''
Set-Content -Path "$root\pdf_engine.js" -Value $pdf -Encoding UTF8

Write-Host "Migration complete"
