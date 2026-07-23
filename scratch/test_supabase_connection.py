import requests
import json

url = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes"
headers = {
    "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
    "Content-Type": "application/json"
}

# Try to fetch the first 2 rows
try:
    response = requests.get(f"{url}?limit=2", headers=headers)
    print("Status Code:", response.status_code)
    if response.status_code == 200:
        print("Connection successful! Sample data:")
        print(json.dumps(response.json(), indent=2))
    else:
        print("Failed to fetch data:", response.text)
except Exception as e:
    print("Error:", e)
