# Script para cerrar Cortana de forma agresiva y liberar memoria RAM
Write-Host "Iniciando limpieza de memoria RAM y cierre de procesos de Cortana..." -ForegroundColor Yellow

# 1. Terminar procesos por Path de ejecutable (venv de MACRORECORDER)
Get-Process -Name "python", "pythonw" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        if ($_.Path -like "*MACRORECORDER*") {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  Proceso por Path ($($_.Path)) finalizado." -ForegroundColor Gray
        }
    } catch {}
}

# 2. Terminar procesos usando la linea de comandos (WMI fallback)
try {
    Get-WmiObject Win32_Process -Filter "Name='python.exe' OR Name='pythonw.exe'" -ErrorAction SilentlyContinue | ForEach-Object {
        $cmd = $_.CommandLine
        if ($cmd -like "*MACRORECORDER*" -or $cmd -like "*triaje*" -or $cmd -like "*promt*" -or $cmd -like "*optimizador*" -or $cmd -like "*editor_fotografico*" -or $cmd -like "*organizador*" -or $cmd -like "*Plantillas*" -or $cmd -like "*main.py*") {
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
            Write-Host "  Proceso por CommandLine ($cmd) finalizado." -ForegroundColor Gray
        }
    }
} catch {}

# 3. Cerrar ventanas abiertas de las herramientas secundarias por su titulo de ventana
taskkill /F /FI "WINDOWTITLE eq *TRIAGE*" /T > $null 2>&1
taskkill /F /FI "WINDOWTITLE eq *PROMPT MANAGER*" /T > $null 2>&1
taskkill /F /FI "WINDOWTITLE eq *Pathology Optimizer*" /T > $null 2>&1
taskkill /F /FI "WINDOWTITLE eq *Retoque de Fotos*" /T > $null 2>&1
taskkill /F /FI "WINDOWTITLE eq *Gestor de Plantillas*" /T > $null 2>&1

# 4. Terminar procesos de Cortana si existen
Get-Process -Name "Cortana" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "*Cortana*" -ErrorAction SilentlyContinue | Stop-Process -Force

# 5. Terminar procesos de Ollama para liberar VRAM/RAM (3.5 GB aprox)
$ollamaProc = Get-Process -Name "ollama", "ollama_llama_server" -ErrorAction SilentlyContinue
if ($ollamaProc) {
    Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "ollama_llama_server" -Force -ErrorAction SilentlyContinue
    Write-Host "  Motor Ollama y modelos finalizados. ~3.5 GB de RAM/VRAM liberados." -ForegroundColor Green
}

Write-Host "Limpieza completada con exito. Memoria RAM liberada." -ForegroundColor Green
