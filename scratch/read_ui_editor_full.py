path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if "openmodal" in line.lower() or "closemodal" in line.lower() or "export const" in line.lower():
        print(f"Line {idx}: {line.strip()}")
        # print next 3 lines
        for i in range(idx, min(len(lines), idx+3)):
            print(f"  {i+1}: {lines[i].strip()}")
