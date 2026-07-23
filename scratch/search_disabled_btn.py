import os

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES"

for root, dirs, files in os.walk(path):
    for f in files:
        if f.endswith((".js", ".css")):
            p = os.path.join(root, f)
            with open(p, "r", encoding="utf-8", errors="ignore") as file:
                for idx, line in enumerate(file, 1):
                    if "disabled" in line.lower() or "pointer-events" in line.lower():
                        if "edit" in line.lower() or "action" in line.lower():
                            print(f"{f}:{idx}: {line.strip()}")
