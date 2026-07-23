import requests

url = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes?select=id,cod_atencion,img01,img02&cod_atencion=like.26Q*"
headers = {
    "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK"
}

res = requests.get(url, headers=headers)
if res.status_code == 200:
    patients = res.json()
    print(f"Total 26Q patients in DB: {len(patients)}")
    has_img1 = [p["cod_atencion"] for p in patients if p.get("img01")]
    print(f"Patients with img01 ({len(has_img1)}):", has_img1[:50])
    
    p_214 = next((p for p in patients if p.get("cod_atencion") == "26Q-214"), None)
    if p_214 and p_214.get("img01"):
        img_214 = p_214.get("img01")
        print(f"\n26Q-214 img01 length: {len(img_214)}")
        same_img_count = sum(1 for p in patients if p.get("img01") == img_214)
        print(f"Number of patients having EXACT same img01 as 26Q-214: {same_img_count}")
        if same_img_count > 1:
            matching = [p["cod_atencion"] for p in patients if p.get("img01") == img_214]
            print("Patients with exact same image:", matching)
else:
    print("Error:", res.text)
