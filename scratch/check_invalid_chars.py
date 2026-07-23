import json

with open(r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json", "r", encoding="utf-8") as f:
    data = json.load(f)

has_ufffd = False
for i, row in enumerate(data):
    for k, v in row.items():
        if isinstance(v, str) and "\ufffd" in v:
            print(f"Row {i}, field {k} has \\ufffd!")
            has_ufffd = True

if not has_ufffd:
    print("NO \\ufffd found in the JSON file! All characters are valid Unicode.")
