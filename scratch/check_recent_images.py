import requests

url = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes?select=id,cod_atencion,img01,img02&cod_atencion=in.(26Q-210,26Q-211,26Q-212,26Q-213,26Q-214,26Q-215,26Q-216,26Q-217)"
headers = {
    "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK"
}

res = requests.get(url, headers=headers)
if res.status_code == 200:
    patients = res.json()
    for p in patients:
        print(f"Code: {p['cod_atencion']}, img01 len: {len(p.get('img01') or '')}, img02 len: {len(p.get('img02') or '')}")
else:
    print("Error:", res.text)
