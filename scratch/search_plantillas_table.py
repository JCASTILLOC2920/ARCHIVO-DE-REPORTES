path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if "plantilla" in line.lower() or "template" in line.lower():
        if "from" in line.lower() or "insert" in line.lower() or "select" in line.lower():
            print(f"Line {idx}: {line.strip()}")
