@echo off
setlocal
chcp 65001 > nul
set PYTHONIOENCODING=utf-8
title JC PATH - AUTO CURADOR DE PLANTILLAS IA
color 0B

echo =======================================================
echo          SISTEMA CORTANA - LIMPIEZA NEURONAL
echo          [ PREPARANDO QUIROFANO... ]
echo =======================================================

if exist "venv\Scripts\activate" (
    call venv\Scripts\activate
)

python Auto_Curador_Plantillas.py
pause
