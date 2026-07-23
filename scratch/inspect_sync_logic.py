import os

path_db = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"
path_main = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\main.js"

with open(path_db, "r", encoding="utf-8") as f:
    db_lines = f.readlines()

print("--- DB_SERVICE.JS REALTIME & SYNC FUNCTIONS ---")
for idx, line in enumerate(db_lines):
    if "syncPatientsFromSupabase" in line or "subscribePatientsRealtime" in line or "initLocalDatabases" in line or "supabase" in line.lower():
        print(f"Line {idx+1}: {line.strip()}")

with open(path_main, "r", encoding="utf-8") as f:
    main_lines = f.readlines()

print("\n--- MAIN.JS INITIALIZATION ---")
for idx, line in enumerate(main_lines):
    if "init" in line.lower() or "sync" in line.lower() or "subscribe" in line.lower():
        print(f"Line {idx+1}: {line.strip()}")
