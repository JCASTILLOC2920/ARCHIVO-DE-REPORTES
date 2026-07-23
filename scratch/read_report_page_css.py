path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- IMPRIMIR.HTML REPORT PAGE CSS ---")
for idx, line in enumerate(lines, 1):
    if ".report-page" in line or ".page-footer" in line or "lblFooterText" in line:
        print(f"Line {idx}: {line.strip()}")
