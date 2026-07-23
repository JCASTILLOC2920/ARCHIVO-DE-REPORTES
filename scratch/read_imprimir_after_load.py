path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- IMPRIMIR.HTML AFTER LOAD STEP ---")
for idx in range(770, min(835, len(lines))):
    line = lines[idx].strip()
    safe_line = line.encode('ascii', errors='replace').decode('ascii')
    print(f"{idx+1}: {safe_line}")
