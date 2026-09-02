@echo off
:: ==========================================
:: 🛡️ ELEVACIÓN AUTOMÁTICA A ADMINISTRADOR (UAC)
:: ==========================================
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [SISTEMA] Solicitando permisos de Administrador para MacroRecorder...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"
setlocal
chcp 1252 > nul
color 0B
title JC PATH - CORTANA MAIN CORE (ADMIN)
cls

echo =======================================================
echo          SISTEMA CORTANA - NUCLEO REFORZADO
echo =======================================================
echo.
echo [SISTEMA] Iniciando Secuencia de Arranque Inmediato...

:: Obtener la ruta del directorio del script sin barra diagonal final
set "BASE_DIR=%~dp0"
if "%BASE_DIR:~-1%"=="\" set "BASE_DIR=%BASE_DIR:~0,-1%"

:: Generar pyvenv.cfg dinámicamente con la ruta actual
(
echo home = %BASE_DIR%\python_base
echo include-system-site-packages = false
echo version = 3.11.9
echo executable = %BASE_DIR%\python_base\python.exe
) > "%BASE_DIR%\venv\pyvenv.cfg"

set "PY_EXEC=%BASE_DIR%\venv\Scripts\python.exe"

echo [=========================================]
echo [   CORTANA EN LINEA - MODO VIGILANCIA    ]
echo [   PRECISION MEDICA: 100%%               ]
echo [=========================================]

"%PY_EXEC%" main.py

if %errorlevel% neq 0 (
    echo.
    echo [CRITICO] El sistema colapso (Error: %errorlevel%)
    echo [INFO] Revise salida_sistema_cortana.log
    pause
)

exit
