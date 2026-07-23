import os
import re
import json
import base64
import requests

json_path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json"
img_dir = r"C:\Users\DELL\Desktop\QUIRURGICOS 2026\imagenes_extraidas"
url = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes"
headers = {
    "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Content-Type": "application/json"
}

def clean_date(date_str):
    if not date_str or "--" in date_str:
        return None
    m = re.search(r"(\d{2})/(\d{2})/(\d{4})", date_str)
    if m:
        return f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    return None

def clean_age(age_str):
    if not age_str or "--" in age_str:
        return 0
    m = re.search(r"(\d+)", age_str)
    if m:
        return int(m.group(1))
    return 0

def split_names(full_name):
    parts = full_name.strip().split()
    if len(parts) >= 3:
        apellidos = " ".join(parts[-2:])
        nombres = " ".join(parts[:-2])
    elif len(parts) == 2:
        nombres = parts[0]
        apellidos = parts[1]
    else:
        nombres = full_name
        apellidos = ""
    return nombres, apellidos

def format_doctor_name(name):
    if not name:
        return ""
    clean = name.upper().strip()
    clean = re.sub(r"\bDR\s*,", "DR.", clean, flags=re.IGNORECASE)
    clean = re.sub(r"\bDRA\s*,", "DRA.", clean, flags=re.IGNORECASE)
    clean = re.sub(r"\bDR\s+(?!\.)", "DR. ", clean, flags=re.IGNORECASE)
    clean = re.sub(r"\bDRA\s+(?!\.)", "DRA. ", clean, flags=re.IGNORECASE)
    clean = re.sub(r"\bDR\s*\.\s*\.", "DR.", clean, flags=re.IGNORECASE)
    clean = re.sub(r"\bDRA\s*\.\s*\.", "DRA.", clean, flags=re.IGNORECASE)
    clean = re.sub(r"\s+", " ", clean)
    return clean.strip()

def to_base64_data_url(filepath):
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, "rb") as f:
            data = f.read()
            encoded = base64.b64encode(data).decode("utf-8")
            return f"data:image/jpeg;base64,{encoded}"
    except Exception as e:
        return None

def main():
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        extracted_data = json.load(f)

    print(f"Loaded {len(extracted_data)} extracted patient records from JSON.")
    print("FORCING PDF OVERWRITE ON SUPABASE DATABASE...")

    overwritten_count = 0
    inserted_count = 0

    for idx, patient in enumerate(extracted_data, 1):
        codigo = patient["codigo"]
        if not codigo or codigo == "UNKNOWN":
            continue

        pdf_nombres, pdf_apellidos = split_names(patient["nombre"])
        pdf_edad = clean_age(patient["edad"])
        pdf_sexo = patient.get("sexo", "")
        pdf_doc = format_doctor_name(patient.get("indicacion", ""))
        
        # Images
        images = patient.get("imagenes", [])
        pdf_img01 = ""
        pdf_img02 = ""
        if len(images) > 0:
            path01 = os.path.join(img_dir, images[0])
            url01 = to_base64_data_url(path01)
            if url01: pdf_img01 = url01

        if len(images) > 1:
            path02 = os.path.join(img_dir, images[1])
            url02 = to_base64_data_url(path02)
            if url02: pdf_img02 = url02

        # 1. Fetch existing record from Supabase
        response = requests.get(f"{url}?cod_atencion=eq.{codigo}&select=id", headers=headers)
        if response.status_code != 200:
            print(f"[{idx}] Error fetching {codigo}: {response.text}")
            continue

        existing_rows = response.json()

        payload = {
            "paciente": patient["nombre"],
            "nombres": pdf_nombres,
            "apellidos": pdf_apellidos,
            "edad": pdf_edad,
            "macro_desc": patient.get("macro", ""),
            "micro_desc": patient.get("micro", ""),
            "diagnostico": patient.get("diagnostico", "")
        }
        
        if pdf_sexo:
            payload["sexo"] = pdf_sexo
        if pdf_doc:
            payload["med_solicitante"] = pdf_doc
        
        fec_reg = clean_date(patient.get("fecha_recepcion"))
        if fec_reg:
            payload["fec_registro"] = fec_reg
        fec_ent = clean_date(patient.get("fecha_informe"))
        if fec_ent:
            payload["fec_entrega"] = fec_ent
            
        if pdf_img01:
            payload["img01"] = pdf_img01
        if pdf_img02:
            payload["img02"] = pdf_img02

        if existing_rows:
            # Overwrite existing row
            row_id = existing_rows[0]["id"]
            update_resp = requests.patch(f"{url}?id=eq.{row_id}", headers=headers, json=payload)
            if update_resp.status_code in [200, 204]:
                print(f"[{idx}/{len(extracted_data)}] Overwrote {codigo} (Sex: {payload.get('sexo', 'N/A')}, Age: {pdf_edad})")
                overwritten_count += 1
            else:
                print(f"[{idx}] Failed to overwrite {codigo}: {update_resp.text}")
        else:
            # Insert new row
            payload["service"] = "Q"
            payload["cod_atencion"] = codigo
            payload["dni"] = "0"
            payload["costo"] = 0
            payload["adelanto"] = 0
            payload["resta"] = 0
            payload["pagado"] = False
            payload["atrasado"] = False
            payload["especimen"] = ""
            payload["doctor"] = "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA"
            payload["casetes"] = 1
            
            insert_resp = requests.post(url, headers=headers, json=payload)
            if insert_resp.status_code in [200, 201]:
                print(f"[{idx}/{len(extracted_data)}] Inserted {codigo} (Sex: {payload.get('sexo', 'N/A')}, Age: {pdf_edad})")
                inserted_count += 1
            else:
                print(f"[{idx}] Failed to insert {codigo}: {insert_resp.text}")

    print("\n" + "="*50)
    print(f"OVERWRITE COMPLETED SUCCESSFULLY!")
    print(f"Total Overwritten: {overwritten_count}")
    print(f"Total Inserted: {inserted_count}")
    print("="*50)

if __name__ == "__main__":
    main()
