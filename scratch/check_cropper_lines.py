path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- LINES 515-535 ---")
for i in range(514, min(535, len(lines))):
    print(f"{i+1}: {lines[i].strip()}")

print("\n--- LINES 610-630 ---")
for i in range(609, min(630, len(lines))):
    print(f"{i+1}: {lines[i].strip()}")
