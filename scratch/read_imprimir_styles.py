path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- IMPRIMIR.HTML LAYOUT & STYLES ---")
for idx, line in enumerate(lines, 1):
    if "pvToolbar" in line or "pvSidebar" in line or "pv-canvas" in line or "@media print" in line:
        print(f"Line {idx}: {line.strip()}")
        # print next 3 lines
        for i in range(idx, min(len(lines), idx+3)):
            print(f"  {i+1}: {lines[i].strip()}")
