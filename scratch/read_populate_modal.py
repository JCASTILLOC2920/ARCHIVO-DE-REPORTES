path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- POPULATE EDITOR MODAL IN UI_REPORT_EDITOR.JS ---")
for i in range(123, min(280, len(lines))):
    print(f"{i+1}: {lines[i].strip()}")
