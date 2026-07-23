path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\main.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

# Search for DOMContentLoaded and find its closing brace
inside = False
braces = 0
for idx, line in enumerate(lines, 1):
    if "document.addEventListener('DOMContentLoaded'" in line:
        inside = True
        braces = 0
    if inside:
        clean = line.split("//")[0]
        braces += clean.count('{') - clean.count('}')
        if braces == 0:
            print(f"DOMContentLoaded ends at line {idx}: {line.strip()}")
            break
