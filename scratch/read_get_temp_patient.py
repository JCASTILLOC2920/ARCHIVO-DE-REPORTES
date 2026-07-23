path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- GETTEMPPATIENTFROMEDITOR IN UI_REPORT_EDITOR.JS ---")
for idx, line in enumerate(lines, 1):
    if "gettemppatientfromeditor" in line.lower() and "function" in line.lower():
        print(f"Line {idx}: {line.strip()}")
        # print next 45 lines
        for i in range(idx, min(len(lines), idx+50)):
            print(f"  {i+1}: {lines[i].strip()}")
        break
