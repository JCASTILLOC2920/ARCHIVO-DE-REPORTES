import json
import csv
import re

json_path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json"
csv_path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.csv"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Common clinical typos and spacing fixes
replacements = {
    r"\besrugosa\b": "es rugosa",
    r"\bmacroscopica\b": "macroscópica",
    r"\bmicroscopica\b": "microscópica",
    r"\bdiagnostico\b": "diagnóstico",
    r"\bquirurgica\b": "quirúrgica",
    r"\bvescula\b": "vesícula",
    r"\bcolecistitis\s+crnica\b": "colecistitis crónica",
    r"\bcrnica\b": "crónica",
    r"\bcrnicas\b": "crónicas",
    r"\bcrnico\b": "crónico",
    r"\bcrnicos\b": "crónicos",
    r"\bhistolgico\b": "histológico",
    r"\bhistolgicos\b": "histológicos",
    r"\bhistolgica\b": "histológica",
    r"\bhistolgicas\b": "histológicas",
    r"\bpatlogo\b": "patólogo",
    r"\bpatlogos\b": "patólogos",
    r"\bparaqueratosis\s+alternante\.\s+Estrato\b": "paraqueratosis alternante. Estrato",
    # Remove double spaces
    r"\s+": " "
}

def clean_text(text):
    if not isinstance(text, str):
        return text
    
    # Preserve single newlines but remove multiple spaces
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = text.split("\n")
    cleaned_lines = []
    
    for line in lines:
        cleaned_line = line.strip()
        for pattern, replacement in replacements.items():
            cleaned_line = re.sub(pattern, replacement, cleaned_line, flags=re.IGNORECASE)
        # Clean double spaces in the line
        cleaned_line = re.sub(r" {2,}", " ", cleaned_line)
        cleaned_lines.append(cleaned_line)
        
    return "\n".join(cleaned_lines).strip()

cleaned_count = 0
for row in data:
    for field in ["macro", "micro", "diagnostico", "indicacion"]:
        original = row.get(field, "")
        cleaned = clean_text(original)
        if original != cleaned:
            row[field] = cleaned
            cleaned_count += 1

if cleaned_count > 0:
    # Save cleaned JSON
    with open(json_path, "w", encoding="utf-8") as jsonfile:
        json.dump(data, jsonfile, indent=2, ensure_ascii=False)
        
    # Save cleaned CSV
    fieldnames = ["codigo", "nombre", "edad", "sexo", "fecha_recepcion", "fecha_informe", "indicacion", "macro", "micro", "diagnostico", "imagenes"]
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            row_copy = row.copy()
            row_copy["imagenes"] = ", ".join(row_copy["imagenes"])
            writer.writerow(row_copy)

print(f"Spelling and formatting cleanup completed. Total fields updated: {cleaned_count}")
