path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- ACTUAL TEMP IMAGES IN UI_REPORT_EDITOR.JS ---")
for idx in range(795, min(815, len(lines))):
    line = lines[idx]
    print(f"{idx+1}: {repr(line)}")
