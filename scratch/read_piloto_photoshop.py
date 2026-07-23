import os

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\macrorecorder\piloto_photoshop.py"

print("--- PILOTO_PHOTOSHOP.PY TOP LINES ---")
if os.path.exists(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
    for idx in range(min(120, len(lines))):
        print(f"{idx+1}: {lines[idx].strip()}")
else:
    print("piloto_photoshop.py does not exist.")
