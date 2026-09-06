@echo off
TITLE SERVIDOR PUENTE DE MICROSCOPIO MOTIC - JC PATH
COLOR 0B

cd /d "%~dp0"

echo ====================================================================
echo      INICIANDO SERVIDOR PUENTE DE MICROSCOPIA MOTIC (JC PATH)
echo ====================================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no fue encontrado en el sistema.
    pause
    exit /b 1
)

echo [1/3] Liberando puertos de conexion previa...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8085" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo [2/3] Abriendo aplicacion de reportes en el navegador...
start http://localhost:8085/reportes.html

echo [3/3] Iniciando puente de streaming de alta resolucion para microscopio...
echo [INFO] Mantenga esta ventana abierta durante su sesion de trabajo.
echo.

python servidor_microscopio_bridge.py

pause
