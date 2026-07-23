path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

import re
print("Occurrences of 'template' in db_service.js:", len(re.findall(r"template", content, re.IGNORECASE)))
# print lines containing template
lines = content.splitlines()
for idx, line in enumerate(lines, 1):
    if "template" in line.lower() and "table" in line.lower():
        print(f"Line {idx}: {line}")
