path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if ".pv-sheet" in line:
        print(f"Line {idx}: {line.strip()}")
        for j in range(idx-1, min(len(lines), idx+15)):
            print(f"  {j+1}: {lines[j].strip()}")
