path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Replace the top-level declaration with 'let cropper01 = null;' and 'let cropper02 = null;'
# We can do this by target-replacing only at the very top of the file.
target_top = """let editingCodAtencion = null;
cropper01 = null; // uses module-level variable
cropper02 = null; // uses module-level variable"""

replacement_top = """let editingCodAtencion = null;
let cropper01 = null;
let cropper02 = null;"""

if target_top in content:
    content = content.replace(target_top, replacement_top)
    print("Top-level let declarations successfully restored!")
else:
    print("Target top not found!")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
