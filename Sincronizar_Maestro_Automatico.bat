@echo off
title CENTINELA DE SINCRONIZACION MAESTRA - JC PATH LAB
color 0B
echo =========================================================================
echo    CENTINELA AUTOMATICO DE COPIA MAESTRA Y AUTO-BUSTING PWA
echo =========================================================================
echo.
python auto_master_backup.py
echo.
echo =========================================================================
echo    SINCRONIZACION Y ACTUALIZACION DE CACHE COMPLETADA CON EXITO!
echo =========================================================================
timeout /t 5
