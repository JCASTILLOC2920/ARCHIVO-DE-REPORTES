path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

line_1389 = lines[1388] # 1389 is index 1388
print("Line 1389 raw:", repr(line_1389))
print("Line 1389 clean:", repr(line_1389.split("//")[0]))
print("Line 1389 opens:", line_1389.split("//")[0].count('{'))
print("Line 1389 closes:", line_1389.split("//")[0].count('}'))
