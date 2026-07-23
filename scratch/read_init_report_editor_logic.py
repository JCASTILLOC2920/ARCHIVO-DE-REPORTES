path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("--- INITREPORTEDITORLOGIC (PART 2) ---")
# Lines 410 to 520
for idx in range(409, min(520, len(lines))):
    line = lines[idx].strip()
    # Replace non-ascii chars to avoid print encode crashes
    safe_line = line.encode('ascii', errors='replace').decode('ascii')
    print(f"{idx+1}: {safe_line}")
