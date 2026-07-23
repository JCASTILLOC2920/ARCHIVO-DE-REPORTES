import json

with open(r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Print first item keys and values
for k, v in data[0].items():
    if isinstance(v, str):
        # Print string and its repr to check unicode characters
        print(f"{k}: {repr(v)}")
