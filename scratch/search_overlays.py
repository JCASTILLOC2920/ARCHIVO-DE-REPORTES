path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\reportes.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- OVERLAYS IN REPORTES.HTML ---")
for idx, line in enumerate(lines, 1):
    if "overlay" in line.lower() or "modal" in line.lower():
        if "id=" in line:
            print(f"Line {idx}: {line.strip()}")
