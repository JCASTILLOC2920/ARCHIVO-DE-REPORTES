path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

log = []
braces = 0
for idx, line in enumerate(lines, 1):
    # Remove single line comments
    clean = line.split("//")[0]
    # Remove block comments (rough approximation since we don't have multi-line here)
    # Count open and close
    open_b = clean.count('{')
    close_b = clean.count('}')
    braces += open_b - close_b
    log.append(f"Line {idx} (balance={braces}, diff={open_b - close_b}): {line.strip()[:80]}")

with open(r"C:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\scratch\trace_log.txt", "w", encoding="utf-8") as f_out:
    f_out.write("\n".join(log))

print("Trace log written to scratch/trace_log.txt successfully.")
