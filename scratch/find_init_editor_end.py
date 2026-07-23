path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's search for the function signature of initReportEditorLogic
# It starts at: export function initReportEditorLogic() {
# We want to find the corresponding closing brace of this function!
lines = content.splitlines()
braces = 0
inside = False
for idx, line in enumerate(lines, 1):
    if "export function initReportEditorLogic()" in line:
        inside = True
        braces = 0
    if inside:
        clean = line.split("//")[0]
        braces += clean.count('{') - clean.count('}')
        if braces == 0:
            print(f"initReportEditorLogic ends at line {idx}: {line.strip()}")
            # Print next 5 lines
            for i in range(idx, min(len(lines), idx+5)):
                print(f"  {i+1}: {lines[i].strip()}")
            break
