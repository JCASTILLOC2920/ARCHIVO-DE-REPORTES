import os

filepath = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\macrorecorder\nucleo_voz.py"

with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- LOCATING SYMSPELL & FANTASMAS ACUSTICOS IN NUCLEO_VOZ.PY ---")
for idx, line in enumerate(lines):
    if "symspell" in line.lower() or "fantasma" in line.lower() or "procesar_logica_ia" in line or "post_procesar" in line.lower():
        print(f"Line {idx+1}: {line.strip().encode('ascii', 'ignore').decode('ascii')}")
