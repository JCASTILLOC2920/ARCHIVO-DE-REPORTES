$filePath = "imprimir.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Split by newlines
$lines = $content -split "`r?`n"

$foundCount = 0
for ($i = 0; $i -lt $lines.Count; $i++) {
    # Match the lines containing "return joined.replace" and "char.toUpperCase()"
    if ($lines[$i] -like "*return joined.replace*char.toUpperCase()*") {
        $indent = [regex]::Match($lines[$i], "^\s*").Value
        
        # Write the encoding-safe, crash-proof line using Unicode escapes for Spanish characters
        $lines[$i] = $indent + 'return joined.replace(/(>|\.\s+|\n+|^)([a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1])/gi, (match, prefix, char) => (prefix || '''') + (char || '''').toUpperCase());'
        
        $foundCount++
    }
}

if ($foundCount -eq 2) {
    # Join with CRLF
    $newContent = $lines -join "`r`n"
    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "Successfully updated 2 occurrences to be encoding-safe and crash-proof."
} else {
    Write-Error "Expected exactly 2 occurrences, but found $foundCount"
    exit 1
}
