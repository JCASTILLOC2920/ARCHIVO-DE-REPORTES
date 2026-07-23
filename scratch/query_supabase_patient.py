import urllib.request
import json

url = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes?cod_atencion=eq.26Q-225"
headers = {
    "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = response.read().decode("utf-8")
        parsed = json.loads(data)
        print("SUPABASE PATIENT RECORD:")
        if parsed:
            for p in parsed:
                print(f"ID: {p.get('id')}")
                print(f"Code: {p.get('cod_atencion')}")
                print(f"Name: {p.get('paciente')}")
                img01 = p.get('img01')
                img02 = p.get('img02')
                print(f"img01 length: {len(img01) if img01 else 0}")
                print(f"img01 snippet: {img01[:50] if img01 else 'None'}")
                print(f"img02 length: {len(img02) if img02 else 0}")
                print(f"img02 snippet: {img02[:50] if img02 else 'None'}")
        else:
            print("No records found in Supabase.")
except Exception as e:
    print("Error querying Supabase:", e)
