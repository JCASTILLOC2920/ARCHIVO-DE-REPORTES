path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- LINES 120-150 ---")
for i in range(119, min(150, len(lines))):
    print(f"{i+1}: {lines[i].strip()}")

print("\n--- LINES 255-295 ---")
for i in range(254, min(295, len(lines))):
    print(f"{i+1}: {lines[i].strip()}")
