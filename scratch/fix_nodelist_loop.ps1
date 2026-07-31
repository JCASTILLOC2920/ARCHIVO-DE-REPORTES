$filePath = "imprimir.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Locate the target block
$target = "                        for (let child of tempDiv.childNodes) {`r`n                            if (child.outerHTML) {`r`n                                blocks.push({ type: 'content', html: child.outerHTML, section: 'micro' });`r`n                            } else if (child.textContent.trim()) {`r`n                                blocks.push({ type: 'content', html: child.textContent, section: 'micro' });`r`n                            }`r`n                        }"

# Let's define the replacement using a standard for loop
$replacement = "                        const children = tempDiv.childNodes;`r`n                        for (let childIdx = 0; childIdx < children.length; childIdx++) {`r`n                            const child = children[childIdx];`r`n                            if (child.outerHTML) {`r`n                                blocks.push({ type: 'content', html: child.outerHTML, section: 'micro' });`r`n                            } else if (child.textContent.trim()) {`r`n                                blocks.push({ type: 'content', html: child.textContent, section: 'micro' });`r`n                            }`r`n                        }"

if ($content.Contains($target)) {
    $newContent = $content.Replace($target, $replacement)
    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "Successfully replaced NodeList iterator loop with standard index loop"
} else {
    # Match using regex to handle LF line endings if necessary
    $pattern = 'for\s*\(\s*let\s+child\s+of\s+tempDiv\.childNodes\s*\)\s*\{\s*\n\s*if\s*\(child\.outerHTML\)\s*\{\s*\n\s*blocks\.push\(\{\s*type:\s*''content'',\s*html:\s*child\.outerHTML,\s*section:\s*''micro''\s*\}\);\s*\n\s*\}\s*else\s*if\s*\(child\.textContent\.trim\(\)\)\s*\{\s*\n\s*blocks\.push\(\{\s*type:\s*''content'',\s*html:\s*child\.textContent,\s*section:\s*''micro''\s*\}\);\s*\n\s*\}\s*\n\s*\}'
    
    $match = [regex]::Match($content, $pattern)
    if ($match.Success) {
        $foundText = $match.Value
        $newText = "const children = tempDiv.childNodes;`r`n                        for (let childIdx = 0; childIdx < children.length; childIdx++) {`r`n                            const child = children[childIdx];`r`n                            if (child.outerHTML) {`r`n                                blocks.push({ type: 'content', html: child.outerHTML, section: 'micro' });`r`n                            } else if (child.textContent.trim()) {`r`n                                blocks.push({ type: 'content', html: child.textContent, section: 'micro' });`r`n                            }`r`n                        }"
        $newContent = $content.Replace($foundText, $newText)
        [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Successfully replaced NodeList iterator loop using regex"
    } else {
        Write-Error "Could not locate target NodeList loop block!"
        exit 1
    }
}
