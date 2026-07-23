path = r"C:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\scratch\trace_log.txt"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx in range(1379, 1400):
    print(lines[idx].strip())
