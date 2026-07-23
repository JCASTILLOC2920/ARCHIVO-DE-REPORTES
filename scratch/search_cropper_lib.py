path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\reportes.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- CROPPER IN REPORTES.HTML ---")
for idx, line in enumerate(lines, 1):
    if "cropper" in line.lower():
        print(f"Line {idx}: {line.strip()}")
