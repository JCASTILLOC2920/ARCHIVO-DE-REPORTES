import json

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json"

with open(path, "r", encoding="utf-8") as f:
    pdf_data = json.load(f)

sex_counts = {}
for p in pdf_data:
    sex = p.get("sexo", "MISSING")
    sex_counts[sex] = sex_counts.get(sex, 0) + 1

print("Sex distribution in extracted 2026 PDF data:")
for k, v in sex_counts.items():
    print(f"  '{k}': {v}")
