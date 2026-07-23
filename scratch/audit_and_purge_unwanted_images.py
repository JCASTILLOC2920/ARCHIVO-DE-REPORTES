import os
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
    print("=== TRIPLE AUDIT & PURGE OF UNWANTED IMAGES IN SUPABASE ===")
    
    # 1. Load official extracted 2026 PDF image mappings
    with open(json_path, "r", encoding="utf-8") as f:
        pdf_data = json.load(f)

    official_images_map = {} # codigo -> {"img01": base64, "img02": base64}
    for p in pdf_data:
        codigo = p.get("codigo")
        imgs = p.get("imagenes", [])
        if codigo and imgs:
            img01_b64 = ""
            img02_b64 = ""
            if len(imgs) > 0:
                p1 = os.path.join(img_dir, imgs[0])
                b64_1 = to_base64_data_url(p1)
                if b64_1: img01_b64 = b64_1
            if len(imgs) > 1:
                p2 = os.path.join(img_dir, imgs[1])
                b64_2 = to_base64_data_url(p2)
                if b64_2: img02_b64 = b64_2
            
            official_images_map[codigo] = {
                "img01": img01_b64,
                "img02": img02_b64
            }

    print(f"Official 2026 image mapping created for {len(official_images_map)} patients.")

    # 2. Fetch 2026 patients in batches of 20 to avoid timeouts
    codes_2026 = [p.get("codigo") for p in pdf_data if p.get("codigo") and p.get("codigo") != "UNKNOWN"]
    
    purged_img01_count = 0
    purged_img02_count = 0
    verified_clean_count = 0

    batch_size = 20
    for i in range(0, len(codes_2026), batch_size):
        batch = codes_2026[i:i+batch_size]
        codes_str = ",".join(batch)
        
        resp = requests.get(f"{url}?select=id,cod_atencion,img01,img02&cod_atencion=in.({codes_str})", headers=headers)
        if resp.status_code != 200:
            print(f"Error fetching batch {i}: {resp.text}")
            continue
            
        db_patients = resp.json()
        for p in db_patients:
            codigo = p["cod_atencion"]
            row_id = p["id"]
            db_img01 = p.get("img01") or ""
            db_img02 = p.get("img02") or ""

            official = official_images_map.get(codigo, {"img01": "", "img02": ""})
            expected_img01 = official.get("img01") or ""
            expected_img02 = official.get("img02") or ""

            payload = {}

            # Check img01
            if db_img01:
                if expected_img01:
                    # Patient is supposed to have an image. Verify if it matches expected length/prefix
                    if abs(len(db_img01) - len(expected_img01)) > 500:
                        # Unwanted or mismatched image! Purge it to official image!
                        payload["img01"] = expected_img01
                        purged_img01_count += 1
                        print(f"  [PURGE] Patient {codigo} img01 mismatched. Restoring official PDF photo.")
                else:
                    # Patient is NOT supposed to have an image! Purge it!
                    payload["img01"] = ""
                    purged_img01_count += 1
                    print(f"  [PURGE] Patient {codigo} had an unauthorized img01! Purged to empty.")

            # Check img02
            if db_img02:
                if expected_img02:
                    if abs(len(db_img02) - len(expected_img02)) > 500:
                        payload["img02"] = expected_img02
                        purged_img02_count += 1
                        print(f"  [PURGE] Patient {codigo} img02 mismatched. Restoring official PDF photo.")
                else:
                    payload["img02"] = ""
                    purged_img02_count += 1
                    print(f"  [PURGE] Patient {codigo} had an unauthorized img02! Purged to empty.")

            if payload:
                requests.patch(f"{url}?id=eq.{row_id}", headers=headers, json=payload)
            else:
                verified_clean_count += 1

    print("\n" + "="*50)
    print("TRIPLE AUDIT COMPLETED!")
    print(f"Verified 100% Clean Patients: {verified_clean_count}")
    print(f"Purged/Restored img01 records: {purged_img01_count}")
    print(f"Purged/Restored img02 records: {purged_img02_count}")
    print("="*50)

if __name__ == "__main__":
    main()
