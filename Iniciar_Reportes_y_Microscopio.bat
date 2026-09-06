@echo off
TITLE SERVIDOR DE REPORTES Y MICROSCOPIO MOTIC - DR. CASTILLO

cd /d "%~dp0"

:: Si se hace doble clic, delegar al script VBS silencioso
if exist "Iniciar_Microscopio_Silencioso.vbs" (
    start "" wscript.exe "Iniciar_Microscopio_Silencioso.vbs"
    exit /b 0
)

:: En caso alternativo de no existir VBS:
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8085" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
start http://localhost:8085/reportes.html
start /min "" python servidor_microscopio_bridge.py
exit /b 0
