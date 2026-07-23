path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- IMAGES IN IMPRIMIR.HTML ---")
for idx, line in enumerate(lines, 1):
    if "img" in line.lower() or "image" in line.lower() or "container" in line.lower():
        if "img01" in line or "img02" in line or "imagesContainer" in line or "src" in line:
            print(f"Line {idx}: {line.strip()}")
