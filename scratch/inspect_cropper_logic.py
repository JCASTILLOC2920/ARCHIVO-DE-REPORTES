path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- SEARCHING CROPPER & MODAL POPULATION IN UI_REPORT_EDITOR.JS ---")
for idx, line in enumerate(lines, 1):
    if "re_img01raw" in line.lower() or "cropper" in line.lower() or "populateeditormodal" in line.lower() or "setupimage" in line.lower():
        print(f"Line {idx}: {line.strip()}")
