path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- PRINT TRIGGER IN IMPRIMIR.HTML ---")
for idx, line in enumerate(lines, 1):
    if "print" in line.lower() or "download" in line.lower():
        if "window" in line or "print()" in line or "timeout" in line or "load" in line:
            safe = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"Line {idx}: {safe}")
