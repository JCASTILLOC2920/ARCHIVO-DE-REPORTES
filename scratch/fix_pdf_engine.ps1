$filePath = "pdf_engine.js"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Split by newlines
$lines = $content -split "`r?`n"

$found = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -like "*const patient = patientDatabase.find*") {
        if ($lines[$i+1] -like "*if (patient) {*") {
            $indent = [regex]::Match($lines[$i+1], "^\s*").Value
            
            # Explicitly cast to string array
            [string[]]$newLines = @(
                $indent + 'if (patient && (patient.macroDesc || patient.microDesc || patient.diagnostico)) {',
                $indent + '    try {',
                $indent + '        localStorage.setItem(''printPatientData'', JSON.stringify(patient));',
                $indent + '    } catch (e) {',
                $indent + '        console.warn(''[PDF Engine] No se pudo guardar en localStorage'', e);',
                $indent + '    }',
                $indent + '} else {',
                $indent + '    localStorage.removeItem(''printPatientData'');',
                $indent + '}'
            )
            
            $linesList = [System.Collections.Generic.List[string]]::new($lines)
            $linesList.RemoveRange($i+1, 7)
            $linesList.InsertRange($i+1, $newLines)
            
            $lines = $linesList.ToArray()
            $found = $true
            break
        }
    }
}

if ($found) {
    $newContent = $lines -join "`r`n"
    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "Successfully patched pdf_engine.js"
} else {
    Write-Error "Target block not found in pdf_engine.js!"
    exit 1
}
