path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\pdf_engine.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- PDF_ENGINE.JS ---")
for idx, line in enumerate(lines, 1):
    print(f"{idx}: {line.strip()}")
