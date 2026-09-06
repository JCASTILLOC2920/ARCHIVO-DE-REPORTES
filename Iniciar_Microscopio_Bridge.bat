@echo off
TITLE SERVIDOR PUENTE DE MICROSCOPIO MOTIC - JC PATH
COLOR 0B

echo ====================================================================
echo      INICIANDO SERVIDOR PUENTE DE MICROSCOPIA (JC PATH LAB)
echo ====================================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no fue encontrado en el sistema.
    pause
    exit /b 1
)

echo [OK] Iniciando transmision del microscopio en http://localhost:8085 ...
echo [INFO] Mantenga esta ventana abierta mientras capture fotos en el reporte.
echo.

python servidor_microscopio_bridge.py

pause
