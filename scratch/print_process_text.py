path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

# Print lines of processTextWithLanguageTool
start = 1386
end = 1426
for idx in range(start, end):
    print(f"Line {idx+1}: {lines[idx].strip()}")
