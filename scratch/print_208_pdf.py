import json

path_json = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json"
with open(path_json, "r", encoding="utf-8") as f:
    pdf_data = json.load(f)

p_208_pdf = next((item for item in pdf_data if item["codigo"] == "26Q-208"), None)
print("PDF Data for 26Q-208:")
print("  Nombre:", p_208_pdf.get("nombre"))
print("  Sexo:", p_208_pdf.get("sexo"))
print("  Edad:", p_208_pdf.get("edad"))
