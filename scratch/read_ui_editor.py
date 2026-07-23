path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

print("--- UI_EDITOR.JS CONTENT ---")
print(content[:800])
