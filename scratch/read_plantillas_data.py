path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\plantillas_data.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's find Ginecologia templates
# In plantillas_data.js, templates might be organized by specialty (Q, G, C, etc.)
print("--- PLANTILLAS_DATA.JS STRUCTURE ---")
lines = content.splitlines()
for idx, line in enumerate(lines[:50], 1):
    print(f"{idx}: {line}")
