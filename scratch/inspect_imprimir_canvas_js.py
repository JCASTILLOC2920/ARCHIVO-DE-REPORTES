path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- ISAUTODOWNLOAD LOGIC IN IMPRIMIR.HTML ---")
for idx, line in enumerate(lines, 1):
    if "isAutoDownload" in line:
        print(f"Line {idx}: {line.strip()}")
        # print next 5 lines
        for i in range(idx, min(len(lines), idx+8)):
            print(f"  {i+1}: {lines[i].strip()}")
