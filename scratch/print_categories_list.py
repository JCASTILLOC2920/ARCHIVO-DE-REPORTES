path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's search for defaultCategories or categories list
import re
print("--- DEFAULT CATEGORIES IN DB_SERVICE.JS ---")
match = re.search(r"const defaultCategories = \[.*?\];", content, re.DOTALL)
if match:
    print(match.group(0))
else:
    # Just search for categoriesDatabase
    print("defaultCategories not found. Searching for categoriesDatabase...")
    lines = content.splitlines()
    for idx, line in enumerate(lines, 1):
        if "categoriesdatabase" in line.lower() or "defaultcategories" in line.lower():
            print(f"Line {idx}: {line}")
