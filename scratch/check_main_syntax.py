path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\main.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's inspect imports and see if we have duplicate variables or names
print("main.js character count:", len(content))
