path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

print("Occurrences of 'let cropper01':", content.count("let cropper01"))
print("Occurrences of 'let cropper02':", content.count("let cropper02"))
