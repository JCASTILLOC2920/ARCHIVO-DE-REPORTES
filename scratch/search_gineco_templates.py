path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\plantillas_data.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

import re
matches = re.findall(r"categoryId:\s*(18|4|15|22|23|2)", content)
print("Found category IDs matches count:", len(matches))

# Let's search for categoryId: 18
print("Occurrences of categoryId: 18 (Gineco Micro):", content.count("categoryId: 18"))
print("Occurrences of categoryId: 4 (Gineco Macro):", content.count("categoryId: 4"))
