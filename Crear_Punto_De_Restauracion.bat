@echo off
title JC PATH LAB - Creador de Punto de Restauracion Seguro
color 0A
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ===================================================================
echo   JC PATH LAB - CREADOR DE PUNTO DE RESTAURACION EN 1 CLIC
echo ===================================================================
echo.
echo Creando copia de seguridad congelada de todos los archivos web...
echo.

python _scripts_respaldo\crear_backup.py

echo.
echo ===================================================================
echo  Punto de restauracion generado con exito.
echo ===================================================================
echo.
pause
