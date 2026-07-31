$filePath = "imprimir.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Locate the mapping block inside step 2 (Supabase fetch)
# We can search for the lines:
#                             diagnostico: data.diagnostico,
#                             img01: data.img01,
#                             img02: data.img02
#                         };

$target = "                            diagnostico: data.diagnostico,`r`n                            img01: data.img01,`r`n                            img02: data.img02`r`n                        };"

# Let's normalize target block to handle LF if needed (but the file uses CRLF)
# We can also do a simple search and replace.
# Let's write the replacement which includes "service: data.service"
$replacement = "                            diagnostico: data.diagnostico,`r`n                            img01: data.img01,`r`n                            img02: data.img02,`r`n                            service: data.service`r`n                        };"

if ($content.Contains($target)) {
    $newContent = $content.Replace($target, $replacement)
    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "Successfully mapped service column in Supabase fetch block in imprimir.html"
} else {
    # Try LF version
    $targetLF = "                            diagnostico: data.diagnostico,\n                            img01: data.img01,\n                            img02: data.img02\n                        };"
    $replacementLF = "                            diagnostico: data.diagnostico,\n                            img01: data.img01,\n                            img02: data.img02,\n                            service: data.service\n                        };"
    
    # Let's use regex replace to match regardless of line ending
    $pattern = 'diagnostico:\s*data\.diagnostico,\s*\n\s*img01:\s*data\.img01,\s*\n\s*img02:\s*data\.img02\s*\n\s*\};'
    $match = [regex]::Match($content, $pattern)
    
    if ($match.Success) {
        $foundText = $match.Value
        # Indentation
        $indent = [regex]::Match($foundText, "^\s*").Value
        $newText = "diagnostico: data.diagnostico,`r`n${indent}img01: data.img01,`r`n${indent}img02: data.img02,`r`n${indent}service: data.service`r`n${indent}};"
        $newContent = $content.Replace($foundText, $newText)
        [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Successfully mapped service column using regex in imprimir.html"
    } else {
        Write-Error "Could not find mapping block in step 2!"
        exit 1
    }
}
