import os

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES"

for root, dirs, files in os.walk(path):
    for f in files:
        if f.endswith((".js", ".css", ".html")):
            p = os.path.join(root, f)
            with open(p, "r", encoding="utf-8", errors="ignore") as file:
                for idx, line in enumerate(file, 1):
                    if "admin-only" in line.lower() or "currentuser" in line.lower() or "edit-btn" in line.lower():
                        print(f"{f}:{idx}: {line.strip()}")
