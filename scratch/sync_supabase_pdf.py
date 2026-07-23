import os
import re
import json
import requests

json_path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json"
url = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes"
headers = {
    "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Content-Type": "application/json"
}

def clean_date(date_str):
    # Converts DD/MM/YYYY to YYYY-MM-DD
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
    # Splits full name into first name and last name
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

def main():
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        extracted_data = json.load(f)

    print(f"Loaded {len(extracted_data)} extracted patient records from JSON.")

    updates_count = 0
    inserts_count = 0
    skipped_count = 0

    for idx, patient in enumerate(extracted_data, 1):
        codigo = patient["codigo"]
        if not codigo or codigo == "UNKNOWN":
            continue

        print(f"[{idx}/{len(extracted_data)}] Verifying {codigo} in database...")

        # 1. Fetch existing record from Supabase
        response = requests.get(f"{url}?cod_atencion=eq.{codigo}", headers=headers)
        if response.status_code != 200:
            print(f"  Error fetching {codigo}: {response.text}")
            continue

        existing_rows = response.json()
        
        # Prepare data from PDF
        pdf_nombres, pdf_apellidos = split_names(patient["nombre"])
        pdf_edad = clean_age(patient["edad"])
        
        # Map images if any
        pdf_img01 = patient["imagenes"][0] if len(patient["imagenes"]) > 0 else ""
        pdf_img02 = patient["imagenes"][1] if len(patient["imagenes"]) > 1 else ""

        if existing_rows:
            # RECORD EXISTS: Merge fields cautiously
            db_row = existing_rows[0]
            row_id = db_row["id"]
            
            payload = {}
            
            # Helper function to check if database field is empty/null/default
            def is_empty(val):
                return val is None or val == "" or val == "0" or val == 0 or val == "--"

            # Check each field and update ONLY if empty in DB but exists in PDF
            if is_empty(db_row.get("edad")) and pdf_edad > 0:
                payload["edad"] = pdf_edad
            if is_empty(db_row.get("sexo")) and patient["sexo"]:
                payload["sexo"] = patient["sexo"]
            if is_empty(db_row.get("macro_desc")) and patient["macro"]:
                payload["macro_desc"] = patient["macro"]
            if is_empty(db_row.get("micro_desc")) and patient["micro"]:
                payload["micro_desc"] = patient["micro"]
            if is_empty(db_row.get("diagnostico")) and patient["diagnostico"]:
                payload["diagnostico"] = patient["diagnostico"]
            if is_empty(db_row.get("img01")) and pdf_img01:
                payload["img01"] = pdf_img01
            if is_empty(db_row.get("img02")) and pdf_img02:
                payload["img02"] = pdf_img02
            if is_empty(db_row.get("nombres")) and pdf_nombres:
                payload["nombres"] = pdf_nombres
            if is_empty(db_row.get("apellidos")) and pdf_apellidos:
                payload["apellidos"] = pdf_apellidos
            if is_empty(db_row.get("paciente")) and patient["nombre"]:
                payload["paciente"] = patient["nombre"]
            if is_empty(db_row.get("med_solicitante")) and patient["indicacion"]:
                payload["med_solicitante"] = patient["indicacion"]
            if is_empty(db_row.get("fec_registro")):
                fec_reg = clean_date(patient["fecha_recepcion"])
                if fec_reg:
                    payload["fec_registro"] = fec_reg
            if is_empty(db_row.get("fec_entrega")):
                fec_ent = clean_date(patient["fecha_informe"])
                if fec_ent:
                    payload["fec_entrega"] = fec_ent

            if payload:
                # Update existing row
                update_response = requests.patch(f"{url}?id=eq.{row_id}", headers=headers, json=payload)
                if update_response.status_code in [200, 204]:
                    print(f"  Successfully UPDATED fields for {codigo}: {list(payload.keys())}")
                    updates_count += 1
                else:
                    print(f"  Failed to update {codigo}: {update_response.text}")
            else:
                print(f"  No missing fields to update for {codigo}. Skipping.")
                skipped_count += 1
        else:
            # RECORD DOES NOT EXIST: Insert new row cleanly
            payload = {
                "service": "Q",
                "cod_atencion": codigo,
                "dni": "0",
                "med_solicitante": patient["indicacion"],
                "nombres": pdf_nombres,
                "apellidos": pdf_apellidos,
                "paciente": patient["nombre"],
                "costo": 0,
                "adelanto": 0,
                "resta": 0,
                "fec_registro": clean_date(patient["fecha_recepcion"]),
                "fec_entrega": clean_date(patient["fecha_informe"]),
                "pagado": False,
                "atrasado": False,
                "especimen": "",
                "macro_desc": patient["macro"],
                "micro_desc": patient["micro"],
                "diagnostico": patient["diagnostico"],
                "img01": pdf_img01,
                "img02": pdf_img02,
                "edad": pdf_edad,
                "sexo": patient["sexo"],
                "casetes": 1
            }
            
            insert_response = requests.post(url, headers=headers, json=payload)
            if insert_response.status_code in [200, 201]:
                print(f"  Successfully INSERTED new record for {codigo}")
                inserts_count += 1
            else:
                print(f"  Failed to insert {codigo}: {insert_response.text}")

    print("\n" + "="*50)
    print("Database sync completed successfully!")
    print(f"Total Updates: {updates_count}")
    print(f"Total Inserts: {inserts_count}")
    print(f"Total Skipped: {skipped_count}")
    print("="*50)

if __name__ == "__main__":
    main()
