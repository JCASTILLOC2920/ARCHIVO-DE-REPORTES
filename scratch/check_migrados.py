import os

file_path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_migrados.js"
if os.path.exists(file_path):
    print("File size:", os.path.getsize(file_path))
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read(500)
        print("First 500 characters:")
        print(content)
else:
    print("datos_migrados.js does not exist")
