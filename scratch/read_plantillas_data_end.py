path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\plantillas_data.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- END OF DEFAULTTEMPLATES ARRAY ---")
for idx in range(len(lines)-25, len(lines)):
    print(f"{idx+1}: {lines[idx].strip()}")
