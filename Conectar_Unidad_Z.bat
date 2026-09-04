@echo off
title Conectando a Unidad de Red Z: ...
cls
echo ==========================================================
echo        CONEXION A CARPETA COMPARTIDA (UNIDAD Z:)
echo ==========================================================
echo.
set /p SERVER_IP="Ingrese la IP de la otra PC (ejemplo 192.168.1.50): "

echo.
echo Intentando conectar a \\%SERVER_IP%\Buzon_Transferencia ...
net use Z: /delete /y >nul 2>&1
net use Z: \\%SERVER_IP%\Buzon_Transferencia /persistent:yes

if %errorlevel% equ 0 (
    echo.
    echo [EXITO] La unidad Z: se ha mapeado correctamente.
    explorer Z:\
) else (
    echo.
    echo [ERROR] No se pudo mapear la unidad automaticamente.
    echo Verifique que ambas PCs esten conectadas a la misma red y que el Firewall permita SMB.
)
echo.
pause
