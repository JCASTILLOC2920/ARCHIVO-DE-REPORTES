@echo off
TITLE SERVIDOR DE REPORTES Y MICROSCOPIO MOTIC - DR. CASTILLO
COLOR 0B

cd /d "%~dp0"

echo ====================================================================
echo    SISTEMA INDEPENDIENTE DE REPORTES Y CAPTURA DE MICROSCOPIO
echo                         DR. CASTILLO
echo ====================================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no fue encontrado en el sistema.
    pause
    exit /b 1
)

echo [1/2] Liberando puertos de conexion...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8085" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo [2/2] Abriendo Sistema de Reportes en el navegador...
start http://localhost:8085/reportes.html

echo.
echo [OK] Servidor de microscopio activo en segundo plano (:8085).
echo [INFO] Mantenga esta ventana minimizada mientras redacte sus reportes.
echo.

python servidor_microscopio_bridge.py

pause
