@echo off
chcp 65001 >nul
title SINCRONIZADOR MAESTRO HIBRIDO - JC PATH LAB
color 0B

echo ==============================================================================
echo       JC PATH LAB - SINCRONIZADOR MAESTRO HIBRIDO EN DISCO
echo ==============================================================================
echo   Iniciando proceso de sincronizacion en tiempo real:
echo   1. Descarga y sincronizacion de pacientes (Supabase).
echo   2. Actualizacion del Excel Maestro y CSV espejo en _RESPALDOS_DE_SEGURIDAD.
echo   3. Extraccion y normalizacion de fotografias en _BAUL_ARCHIVOS_SISTEMA.
echo   4. Registro y catalogo O(1) en indice_fotos.json y memoria unificada.
echo ==============================================================================
echo.

set PYTHONIOENCODING=utf-8
python "%~dp0_scripts_respaldo\sincronizador_maestro_hibrido.py" %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    color 0C
    echo [ERROR] Se produjo una excepcion durante la sincronizacion.
    echo Revise la conexion a internet o la configuracion del sistema.
) else (
    echo.
    echo [EXITO] Sincronizacion finalizada correctamente.
)

echo.
echo Presione cualquier tecla para cerrar esta ventana...
pause >nul
