import requests

url = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes"
headers = {
    "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Content-Type": "application/json"
}

def main():
    print("Fetching 2026 26Q patients with img01...")
    # Fetch in smaller range
    res1 = requests.get(f"{url}?select=id,cod_atencion,img01&cod_atencion=like.26Q*&img01=not.is.null", headers=headers)
    if res1.status_code != 200:
        print("Error fetching 26Q img01:", res1.text)
        return

    patients_img01 = res1.json()
    print(f"Found {len(patients_img01)} 26Q patients with non-null img01")

    img_map = {}
    for p in patients_img01:
        img_str = p.get("img01")
        if img_str and len(img_str) > 100:
            if img_str not in img_map:
                img_map[img_str] = []
            img_map[img_str].append(p)

    cleaned_img01_count = 0
    for img_str, plist in img_map.items():
        if len(plist) > 1:
            print(f"\nDUPLICATE img01 DETECTED! Shared by {len(plist)} patients:")
            for p in plist:
                print(f"  - {p['cod_atencion']} (ID {p['id']})")
            
            # Determine original owner (e.g. 26Q-214 if present)
            owner = next((p for p in plist if p['cod_atencion'] == '26Q-214'), plist[0])
            print(f"  Keep image ONLY on owner: {owner['cod_atencion']}")
            
            for p in plist:
                if p["id"] != owner["id"]:
                    print(f"  Clearing img01 for patient {p['cod_atencion']} (ID {p['id']})...")
                    up_res = requests.patch(f"{url}?id=eq.{p['id']}", headers=headers, json={"img01": ""})
                    if up_res.status_code in [200, 204]:
                        cleaned_img01_count += 1
                        print(f"    Cleared successfully!")
                    else:
                        print(f"    Failed to clear: {up_res.text}")

    if cleaned_img01_count == 0:
        print("\nNO DUPLICATE IMAGES FOUND in 2026 database!")
    else:
        print(f"\nCleaned {cleaned_img01_count} duplicate image records in Supabase!")

if __name__ == "__main__":
    main()
