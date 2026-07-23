path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- IMPRIMIR.HTML IMAGE HANDLING ---")
for idx, line in enumerate(lines, 1):
    if "img" in line.lower() or "imagescontainer" in line.lower() or "img01" in line.lower():
        print(f"Line {idx}: {line.strip()}")
