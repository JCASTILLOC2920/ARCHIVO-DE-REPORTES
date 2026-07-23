path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- DB_SERVICE.JS SUPABASE CONFIG & REALTIME ---")
for idx, line in enumerate(lines, 1):
    if "usingsupabase" in line.lower() or "subscribepatientsrealtime" in line.lower():
        print(f"Line {idx}: {line.strip()}")
        # print next 2 lines
        for i in range(idx, min(len(lines), idx+2)):
            print(f"  {i+1}: {lines[i].strip()}")
