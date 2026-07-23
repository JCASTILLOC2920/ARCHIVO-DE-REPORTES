import os
import base64
import requests
import json

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
        print(f"Error encoding {filepath}: {e}")
        return None

def main():
    if not os.path.exists(json_path):
        print("JSON file not found.")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        patients = json.load(f)

    print(f"Processing image synchronization for {len(patients)} patients...")

    updated_count = 0

    for idx, p in enumerate(patients, 1):
        codigo = p["codigo"]
        images = p.get("imagenes", [])
        if not images:
            continue

        print(f"[{idx}/{len(patients)}] Processing images for {codigo}...")

        # Convert images to base64 data URLs
        img01_url = ""
        img02_url = ""

        if len(images) > 0:
            path01 = os.path.join(img_dir, images[0])
            url01 = to_base64_data_url(path01)
            if url01:
                img01_url = url01

        if len(images) > 1:
            path02 = os.path.join(img_dir, images[1])
            url02 = to_base64_data_url(path02)
            if url02:
                img02_url = url02

        if img01_url or img02_url:
            payload = {}
            if img01_url:
                payload["img01"] = img01_url
            if img02_url:
                payload["img02"] = img02_url

            # Fetch the DB row ID first to do patch
            response = requests.get(f"{url}?cod_atencion=eq.{codigo}", headers=headers)
            if response.status_code == 200:
                rows = response.json()
                if rows:
                    row_id = rows[0]["id"]
                    # Update database with base64 data URLs
                    update_response = requests.patch(f"{url}?id=eq.{row_id}", headers=headers, json=payload)
                    if update_response.status_code in [200, 204]:
                        print(f"  Successfully uploaded base64 images for {codigo}")
                        updated_count += 1
                    else:
                        print(f"  Failed to update database for {codigo}: {update_response.text}")
                else:
                    print(f"  Patient {codigo} not found in database.")
            else:
                print(f"  Error querying database for {codigo}: {response.text}")

    print("\n" + "="*50)
    print(f"Image sync completed! Updated {updated_count} patients with base64 data URLs.")
    print("="*50)

if __name__ == "__main__":
    main()
