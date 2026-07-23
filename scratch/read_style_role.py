path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\style.css"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

for i in range(570, min(600, len(lines))):
    print(f"{i+1}: {lines[i].strip()}")
