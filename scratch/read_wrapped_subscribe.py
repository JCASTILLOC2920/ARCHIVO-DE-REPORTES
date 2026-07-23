path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- SUBSCRIBEREALTIME WRAPPED IN DB_SERVICE.JS ---")
for idx in range(975, min(1110, len(lines))):
    line = lines[idx].strip()
    safe_line = line.encode('ascii', errors='replace').decode('ascii')
    print(f"{idx+1}: {safe_line}")
