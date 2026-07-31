$filePath = "imprimir.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Split by newlines (both CRLF and LF)
$lines = $content -split "`r?`n"

$found = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
    # Match the line we just added without escaping characters
    if ($lines[$i] -like "*line.replace*DIAGN*") {
        # Extract the indentation
        $indent = [regex]::Match($lines[$i], "^\s*").Value
        
        # Write the regex with wildcard . instead of accented Ó
        $lines[$i] = $indent + 'line = line.replace(/^(DIAGN.STICO\s+CITOL.GICO|DIAGNOSTICO\s+CITOLOGICO):?\s*/i, '''');'
        $found = $true
        break
    }
}

if ($found) {
    # Join with CRLF
    $newContent = $lines -join "`r`n"
    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "Successfully updated diagnosis regex to be encoding-independent"
} else {
    Write-Error "Target line not found!"
    exit 1
}
