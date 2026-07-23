path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- DB_SERVICE.JS MERGER CODE ---")
for i in range(905, min(945, len(lines))):
    print(f"{i+1}: {lines[i].strip()}")
