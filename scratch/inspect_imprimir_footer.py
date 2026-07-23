path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- IMPRIMIR.HTML FOOTER / PIE DE PAGINA LINES ---")
for idx, line in enumerate(lines, 1):
    if "footer" in line.lower() or "pie" in line.lower() or "page-footer" in line.lower() or "signature" in line.lower() or "sello" in line.lower():
        print(f"Line {idx}: {line.strip()}")
