@echo off
color 0C
title BOMBA NUCLEAR FIREWALL - JC PATH

:: Forzar permisos de Comandante (Administrador)
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo [!] SOLICITANDO AUTORIZACION DE COMANDANTE...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B
)

echo ===================================================
echo      DESTROZANDO BLOQUEOS DE RED - JC PATH
echo ===================================================
echo.
echo [1] DERRIBANDO MURO DEL PUERTO WEB (5000)...
netsh advfirewall firewall add rule name="JC_PATH_WEB" dir=in action=allow protocol=TCP localport=5000 >nul

echo [2] DERRIBANDO MURO DEL TUNEL DE VOZ (8765)...
netsh advfirewall firewall add rule name="JC_PATH_VOZ" dir=in action=allow protocol=TCP localport=8765 >nul

echo [3] DANDO PASE LIBRE A PYTHON...
netsh advfirewall firewall add rule name="JC_PATH_PYTHON" dir=in action=allow program="%~dp0python_base\python.exe" enable=yes >nul

echo.
echo ===================================================
echo [OK] PERIMETRO ASEGURADO. LA BASE ESTA ABIERTA.
echo ===================================================
pause
