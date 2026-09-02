@echo off
setlocal enabledelayedexpansion
title Limpiador de IA del Dictáfono

:: Obtener la ruta del directorio actual (donde está este .bat)
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_NAME=legacy\limpiar_ia_dictafono.py"

:: Cabecera
echo ========================================
echo   LIMPIADOR DE IA DEL DICTÁFONO
echo ========================================
echo.

:: Verificar que el script Python exista
if not exist "%SCRIPT_DIR%%SCRIPT_NAME%" (
    echo ERROR: No se encuentra el script "%SCRIPT_NAME%"
    echo Asegúrate de que esté en la misma carpeta que este lanzador.
    pause
    exit /b 1
)

:: Buscar Python (prioridad: entorno virtual local -> sistema)
if exist "%SCRIPT_DIR%venv\Scripts\python.exe" (
    set "PYTHON=%SCRIPT_DIR%venv\Scripts\python.exe"
    echo Usando Python del entorno virtual (venv)...
) else (
    where python >nul 2>nul
    if !errorlevel! equ 0 (
        set "PYTHON=python"
        echo Usando Python del sistema (PATH)...
    ) else (
        echo ERROR: No se encontró Python.
        echo - No hay entorno virtual en "%SCRIPT_DIR%venv"
        echo - Python no está en el PATH del sistema.
        pause
        exit /b 1
    )
)

:: Ejecutar el script Python
echo.
%PYTHON% "%SCRIPT_DIR%%SCRIPT_NAME%"

:: Mostrar mensaje final y pausar
echo.
echo Proceso completado. Presiona cualquier tecla para salir...
pause >nul