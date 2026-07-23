with open(r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(880, min(1030, len(lines))):
    print(f"{i+1}: {lines[i].strip()}")
