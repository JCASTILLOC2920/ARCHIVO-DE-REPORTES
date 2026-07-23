import requests

url = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes"
headers = {
    "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK"
}

res = requests.get(f"{url}?cod_atencion=eq.26Q-208", headers=headers)
if res.status_code == 200:
    p = res.json()[0]
    print(f"VERIFICATION FOR 26Q-208:")
    print(f"  Codigo: {p.get('cod_atencion')}")
    print(f"  Paciente: {p.get('paciente')}")
    print(f"  Sexo: {p.get('sexo')}")
    print(f"  Edad: {p.get('edad')}")
else:
    print("Error:", res.text)
