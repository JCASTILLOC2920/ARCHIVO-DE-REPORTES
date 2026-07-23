import os

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_tables.js"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "medSolicitante" in line or "med_solicitante" in line or "doctor" in line:
        print(f"Line {idx+1}: {line.strip()}")
