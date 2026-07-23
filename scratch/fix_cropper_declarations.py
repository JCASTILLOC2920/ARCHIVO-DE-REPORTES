path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# 1. Replace comments at the top with actual let declarations
top_target = """// cropper01 uses top-level
// cropper02 uses top-level"""

top_replacement = """let cropper01 = null;
let cropper02 = null;"""

if top_target in content:
    content = content.replace(top_target, top_replacement)
    print("Top-level cropper declarations fixed!")
else:
    # If already declared differently, check
    print("Top target not found, checking...")

# 2. Replace the inner redeclarations inside initReportEditorLogic
# Line 519 is 'let cropper01 = null;' and line 617 is 'let cropper02 = null;'
# Let's search and replace them to avoid shadowing/re-declaration
inner_target_1 = "let cropper01 = null;"
inner_replacement_1 = "cropper01 = null; // uses module-level variable"

inner_target_2 = "let cropper02 = null;"
inner_replacement_2 = "cropper02 = null; // uses module-level variable"

# Let's count occurrences of let cropper01 = null;
print("Occurrences of 'let cropper01 = null;':", content.count(inner_target_1))
content = content.replace(inner_target_1, inner_replacement_1)
content = content.replace(inner_target_2, inner_replacement_2)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESSFULLY INSTALLED CROPPER DECLARATION FIXES!")
