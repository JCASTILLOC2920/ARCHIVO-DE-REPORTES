path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- REBTNGUARDAR SEARCH ---")
for idx, line in enumerate(lines, 1):
    if "rebtnguardar" in line.lower() or "btn_guardar" in line.lower():
        print(f"Line {idx}: {line.strip()}")
