@echo off
title JC PATH LAB - Restaurador de Punto Seguro en 1 Clic
color 0B
chcp 65001 >nul
cd /d "%~dp0"

python _scripts_respaldo\restaurar_backup.py
