with open(r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_tables.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(85, min(135, len(lines))):
    print(f"{i+1}: {lines[i].strip()}")
