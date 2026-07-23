path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\plantillas_data.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

import re
matches = re.findall(r"id:\s*(\d+)", content)
ids = [int(x) for x in matches]
print("Existing template IDs:", sorted(ids))
print("Max template ID:", max(ids) if ids else 0)
