path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

braces = 0
for idx, line in enumerate(lines, 1):
    # Remove strings and comments for counting
    clean = line
    clean = clean.split("//")[0]
    
    # Count braces in this line
    open_b = clean.count('{')
    close_b = clean.count('}')
    
    braces += open_b - close_b
    if open_b != 0 or close_b != 0:
        print(f"Line {idx}: balance={braces} (diff={open_b - close_b}) -> {line.strip()[:60]}")
