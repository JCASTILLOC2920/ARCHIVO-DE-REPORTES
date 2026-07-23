path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- QUEUESYNCWRITE CALLS ---")
for idx, line in enumerate(lines, 1):
    if "queueSyncWrite" in line:
        print(f"Line {idx}: {line.strip()}")
