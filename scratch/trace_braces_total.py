path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

braces = 0
for idx in range(1318, len(lines)):
    line = lines[idx]
    clean = line.split("//")[0]
    open_b = clean.count('{')
    close_b = clean.count('}')
    braces += open_b - close_b
    print(f"Line {idx+1}: balance={braces} (diff={open_b - close_b}) -> {line.strip()[:60]}")
    if braces < 0:
        print("went below 0!")
        break
