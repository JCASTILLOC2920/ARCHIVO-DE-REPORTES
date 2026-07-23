import os

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "function setupImage" in line or "const setupImage" in line:
        print(f"Line {idx+1}:")
        for i in range(max(0, idx-5), min(len(lines), idx+30)):
            print(f"  {i+1}: {lines[i].strip()}")
        break
