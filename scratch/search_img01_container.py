path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\reportes.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- IMG01 IN REPORTES.HTML ---")
for idx, line in enumerate(lines, 1):
    if "re_img01" in line:
        print(f"Line {idx}: {line.strip()}")
