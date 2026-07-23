path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- LINES AROUND ISAUTODOWNLOAD ---")
for idx, line in enumerate(lines, 1):
    if "isAutoDownload = " in line or "isAutoDownload)" in line:
        for i in range(idx - 2, min(len(lines), idx + 10)):
            print(f"{i+1}: {repr(lines[i])}")
        break
