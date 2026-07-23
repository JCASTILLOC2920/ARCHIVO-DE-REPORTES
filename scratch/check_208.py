import json
import requests

path_json = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json"
url = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes"
headers = {
    "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Content-Type": "application/json"
}

with open(path_json, "r", encoding="utf-8") as f:
    pdf_data = json.load(f)

p_208_pdf = next((item for item in pdf_data if item["codigo"] == "26Q-208"), None)
print("PDF Data for 26Q-208:", json.dumps(p_208_pdf, indent=2, ensure_ascii=False))

res = requests.get(f"{url}?cod_atencion=eq.26Q-208", headers=headers)
if res.status_code == 200:
    print("\nSupabase Data for 26Q-208:", json.dumps(res.json(), indent=2, ensure_ascii=False))
else:
    print("Error fetching 26Q-208:", res.text)
