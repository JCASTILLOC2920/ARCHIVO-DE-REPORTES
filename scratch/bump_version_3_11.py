path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\reportes.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

count = content.count("?v=3.10")
if count > 0:
    content = content.replace("?v=3.10", "?v=3.11")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully bumped version cache-busting parameter to v=3.11 in {count} locations!")
else:
    print("No ?v=3.10 found in reportes.html!")
