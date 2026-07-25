import json
from urllib.request import Request, urlopen

def test_supabase_upsert():
    url = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes"
    headers = {
        "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
        "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    test_data = [{
        "service": "Q",
        "cod_atencion": "25Q-999-TEST",
        "paciente": "PACIENTE PRUEBA ANTIGRAVITY",
        "nombres": "PACIENTE",
        "apellidos": "PRUEBA",
        "edad": 99,
        "sexo": "MASCULINO",
        "macro_desc": "Descripción macroscópica de prueba.",
        "micro_desc": "Descripción microscópica de prueba.",
        "diagnostico": "DIAGNÓSTICO DE PRUEBA.",
        "img01": "",
        "img02": ""
    }]

    try:
        req = Request(url, data=json.dumps(test_data).encode('utf-8'), headers=headers, method='POST')
        with urlopen(req) as response:
            status = response.status
            body = response.read().decode('utf-8')
            print(f"Status: {status}")
            print(f"Body: {body}")
            print("Upsert successful!")
    except Exception as e:
        print(f"Error upserting: {e}")

if __name__ == "__main__":
    test_supabase_upsert()
