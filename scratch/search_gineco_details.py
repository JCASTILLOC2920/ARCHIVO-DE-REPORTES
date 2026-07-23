path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\plantillas_data.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

import re
# Find blocks around categoryId: 4
matches = re.finditer(r"\{\s*id:\s*\d+,\s*categoryId:\s*4,.*?\}(?=\s*,\s*\{|\s*\])", content, re.DOTALL)
for match in matches:
    print("--- MATCH ---")
    print(match.group(0)[:500])
