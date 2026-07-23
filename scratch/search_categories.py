path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\plantillas_data.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's search for categories list
print("--- CATEGORIES IN PLANTILLAS_DATA.JS ---")
lines = content.splitlines()
found = False
for idx, line in enumerate(lines, 1):
    if "categories" in line.lower() or "categoria" in line.lower():
        print(f"Line {idx}: {line.strip()}")
        found = True
        # print next 10 lines
        for i in range(idx, min(len(lines), idx+15)):
            print(f"  {i+1}: {lines[i].strip()}")
        break

if not found:
    # Let's search for categoryId occurrences
    cids = set()
    import re
    matches = re.findall(r"categoryId:\s*(\d+)", content)
    print("Found categoryIds:", set(matches))
