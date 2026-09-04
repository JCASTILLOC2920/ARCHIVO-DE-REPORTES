@echo off
cd /d "%~dp0"
setlocal
chcp 65001 > nul
color 0B
title JC PATH - SERVIDOR WEB DROP LOCAL (PUERTO 8080)
cls

echo =======================================================
echo     ⚡ JC PATH - SERVIDOR WEB DROP LOCAL (LAN/WIFI)
echo =======================================================
echo.
echo [SISTEMA] Verificando entorno de ejecucion Python...

set "PY_EXEC="
where python >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_EXEC=python"
) else (
    where py >nul 2>&1
    if %errorlevel% equ 0 (
        set "PY_EXEC=py"
    )
)

if "%PY_EXEC%"=="" (
    color 0C
    echo [ERROR CRITICO] No se encontro un interprete de Python valido.
    pause
    exit /b 1
)

echo [OK] Interprete seleccionado: %PY_EXEC%
echo.
echo [SISTEMA] Abriendo interfaz en el navegador predeterminado...
start http://localhost:8080

echo [SISTEMA] Iniciando servidor Web Drop...
echo.

"%PY_EXEC%" servidor_web_drop.py 8080

if %errorlevel% neq 0 (
    echo.
    echo [ALERTA] El servidor se detuvo o encontro un error (Codigo: %errorlevel%).
    pause
)
exit /b 0
