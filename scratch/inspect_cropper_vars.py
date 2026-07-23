path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- CROPPER VAR DECLARATIONS IN UI_REPORT_EDITOR.JS ---")
for idx, line in enumerate(lines, 1):
    if "cropper01" in line or "cropper02" in line:
        print(f"Line {idx}: {line.strip()}")
