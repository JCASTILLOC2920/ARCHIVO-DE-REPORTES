import os

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\macrorecorder\gui_cortana.py"

print("--- GUI_CORTANA.PY TOP LINES ---")
if os.path.exists(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
    for idx in range(min(120, len(lines))):
        print(f"{idx+1}: {lines[idx].strip()}")
else:
    print("gui_cortana.py does not exist.")
