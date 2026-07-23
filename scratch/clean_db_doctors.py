import requests
import json
import re

url_pacientes = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes"
url_doctores = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/doctores"
headers = {
    "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Content-Type": "application/json"
}

def format_doctor_name(name):
    if not name:
        return ""
    clean = name.upper().strip()
    
    # Replace DR, or DRA, with DR. or DRA.
    clean = re.sub(r"\bDR\s*,", "DR.", clean, flags=re.IGNORECASE)
    clean = re.sub(r"\bDRA\s*,", "DRA.", clean, flags=re.IGNORECASE)
    
    # Replace DR or DRA followed by space (no dot) with DR. / DRA.
    clean = re.sub(r"\bDR\s+(?!\.)", "DR. ", clean, flags=re.IGNORECASE)
    clean = re.sub(r"\bDRA\s+(?!\.)", "DRA. ", clean, flags=re.IGNORECASE)
    
    # Clean multiple dots
    clean = re.sub(r"\bDR\s*\.\s*\.", "DR.", clean, flags=re.IGNORECASE)
    clean = re.sub(r"\bDRA\s*\.\s*\.", "DRA.", clean, flags=re.IGNORECASE)
    
    # Clean multiple spaces
    clean = re.sub(r"\s+", " ", clean)
    return clean.strip()

def main():
    print("Fetching patient list (selective columns to avoid timeout)...")
    # Only fetch id, cod_atencion, med_solicitante, doctor to bypass large base64 image columns
    response = requests.get(f"{url_pacientes}?select=id,cod_atencion,med_solicitante,doctor", headers=headers)
    if response.status_code != 200:
        print("Failed to fetch patients:", response.text)
        return
        
    patients = response.json()
    print(f"Loaded {len(patients)} patients. Cleaning fields...")
    
    updated_patients = 0
    for idx, p in enumerate(patients):
        row_id = p["id"]
        med_solicitante = p.get("med_solicitante", "")
        doctor = p.get("doctor", "")
        
        cleaned_med = format_doctor_name(med_solicitante)
        cleaned_doc = format_doctor_name(doctor)
        
        payload = {}
        if med_solicitante != cleaned_med:
            payload["med_solicitante"] = cleaned_med
        if doctor != cleaned_doc:
            payload["doctor"] = cleaned_doc
            
        if payload:
            print(f"[{idx}] Updating patient {p.get('cod_atencion')}: {payload}")
            update_resp = requests.patch(f"{url_pacientes}?id=eq.{row_id}", headers=headers, json=payload)
            if update_resp.status_code in [200, 204]:
                updated_patients += 1
            else:
                print(f"  Failed to update patient {row_id}: {update_resp.text}")

    print(f"\nCompleted cleaning patients. Updated {updated_patients} records.")

    print("\nFetching doctors table to clean names...")
    response_doc = requests.get(f"{url_doctores}", headers=headers)
    if response_doc.status_code != 200:
        print("Failed to fetch doctors:", response_doc.text)
        return
        
    doctors = response_doc.json()
    print(f"Loaded {len(doctors)} doctors. Cleaning...")
    
    updated_doctors = 0
    for idx, d in enumerate(doctors):
        row_id = d["id"]
        nombre = d.get("nombre", "")
        cleaned_nombre = format_doctor_name(nombre)
        
        if nombre != cleaned_nombre:
            payload = {"nombre": cleaned_nombre}
            print(f"[{idx}] Updating doctor {nombre} -> {cleaned_nombre}")
            update_resp = requests.patch(f"{url_doctores}?id=eq.{row_id}", headers=headers, json=payload)
            if update_resp.status_code in [200, 204]:
                updated_doctors += 1
            else:
                print(f"  Failed to update doctor {row_id}: {update_resp.text}")
                
    print(f"\nCompleted cleaning doctors table. Updated {updated_doctors} records.")

if __name__ == "__main__":
    main()
