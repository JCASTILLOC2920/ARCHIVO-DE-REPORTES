$filePath = "imprimir.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Find the target line
$target = "str = str.replace(/&nbsp;/g, ' ');"

# We want to replace it with:
#                     // Strip all other HTML tags to prevent style leakage
#                     str = str.replace(/<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/gi, '');
#                     str = str.replace(/&nbsp;/g, ' ');

# In PowerShell string replace, we can do a simple literal replacement.
# Let's count occurrences first.
$count = ([regex]::Matches($content, [regex]::Escape($target))).Count
Write-Host "Found $count occurrences of target line."

if ($count -eq 2) {
    # Let's define the replacement string preserving the 20 spaces indentation
    $replacement = "// Strip all other HTML tags to prevent style leakage`r`n                    str = str.replace(/<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/gi, '');`r`n                    str = str.replace(/&nbsp;/g, ' ');"
    
    # We replace the target. Since we want to preserve indentation, let's match the indentation as well or do a literal replace of the indented string.
    $indentedTarget = "                    str = str.replace(/&nbsp;/g, ' ');"
    $indentedReplacement = "                    // Strip all other HTML tags to prevent style leakage`r`n                    str = str.replace(/<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/gi, '');`r`n                    str = str.replace(/&nbsp;/g, ' ');"
    
    $newContent = $content.Replace($indentedTarget, $indentedReplacement)
    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "Successfully replaced target in imprimir.html"
} else {
    Write-Error "Expected exactly 2 occurrences, found $count"
    exit 1
}
