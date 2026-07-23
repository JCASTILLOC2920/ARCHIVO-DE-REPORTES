path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\reportes.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- SCRIPT TAGS IN REPORTES.HTML ---")
for idx, line in enumerate(lines, 1):
    if "<script" in line.lower() or "type=\"module\"" in line.lower() or "type='module'" in line.lower():
        print(f"Line {idx}: {line.strip()}")
        # print next 3 lines
        for i in range(idx, min(len(lines), idx+3)):
            print(f"  {i+1}: {lines[i].strip()}")
