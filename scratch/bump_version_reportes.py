path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\reportes.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Replace all occurrences of ?v=3.8 with ?v=3.9
count = content.count("?v=3.8")
if count > 0:
    content = content.replace("?v=3.8", "?v=3.9")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully bumped version cache-busting parameter in reportes.html in {count} locations!")
else:
    print("No ?v=3.8 found in reportes.html!")
