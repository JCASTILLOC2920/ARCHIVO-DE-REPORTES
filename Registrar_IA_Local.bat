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
title REGISTRADOR PORTABLE DE IA - MACRORECORDER (ADMIN)
echo ===================================================
echo   REGISTRADOR PORTABLE DE IA - MACRORECORDER
echo ===================================================
echo.

if exist "%~dp0venv\Scripts\python.exe" (
    "%~dp0venv\Scripts\python.exe" registrar_ia.py
) else (
    python registrar_ia.py
)
