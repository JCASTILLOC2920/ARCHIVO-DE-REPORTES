path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\supabase_config.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- SUPABASE CONFIG ---")
for idx, line in enumerate(lines, 1):
    print(f"{idx}: {line.strip()}")
