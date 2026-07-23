import os

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's find occurrences of cropper or canvas to see how images are saved
idx = content.find("toDataURL")
if idx != -1:
    print("Found toDataURL at:", idx)
    print(content[idx-200:idx+400])
else:
    print("toDataURL not found")
