import json
import re
import urllib.request
import urllib.error

config_path = r"c:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES\supabase_config.js"
json_path = r"c:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES\doctores.json"

# 1. Parse credentials from supabase_config.js
try:
    with open(config_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    url_match = re.search(r'url:\s*["\']([^"\']*)["\']', content)
    key_match = re.search(r'anonKey:\s*["\']([^"\']*)["\']', content)
    
    url = url_match.group(1).strip() if url_match else ""
    anon_key = key_match.group(1).strip() if key_match else ""
except Exception as e:
    print(f"Error al leer supabase_config.js: {e}")
    url, anon_key = "", ""

if not url or not anon_key:
    print("==========================================================================")
    print("AVISO: No se han configurado credenciales de Supabase en supabase_config.js.")
    print("El panel de reportes está funcionando en modo LOCAL cargando doctores.json.")
    print("Si desea subir la lista a la nube, rellene las credenciales e inicie este script.")
    print("==========================================================================")
    exit(0)

print(f"Conectando a Supabase: {url}...")

# 2. Load doctores.json
try:
    with open(json_path, "r", encoding="utf-8") as f:
        doctores = json.load(f)
except Exception as e:
    print(f"Error al leer doctores.json: {e}")
    exit(1)

# Format payload to match Supabase schema
# Columns: nombre, cmp, rne, tipo, provincia, telefono, correo, firma
payload = []
for doc in doctores:
    payload.append({
        "nombre": doc["doctor"],
        "cmp": doc["colegiado"],
        "rne": doc["especializacion"],
        "tipo": doc["tipo"],
        "provincia": doc["provincia"],
        "telefono": doc["telefono"],
        "correo": doc["correo"],
        "firma": doc.get("firma", "")
    })

# 3. Clean and Upload to Supabase
# Delete existing records first
delete_url = f"{url.rstrip('/')}/rest/v1/doctores?id=gt.0"
headers = {
    "apikey": anon_key,
    "Authorization": f"Bearer {anon_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

try:
    # Perform DELETE request
    req = urllib.request.Request(delete_url, headers=headers, method="DELETE")
    with urllib.request.urlopen(req) as resp:
        print("Registros antiguos eliminados de la tabla 'doctores' en Supabase.")
except urllib.error.HTTPError as e:
    print(f"Error al limpiar la tabla en Supabase: {e.code} - {e.read().decode('utf-8')}")
    exit(1)
except Exception as e:
    print(f"Error de conexión: {e}")
    exit(1)

# Insert new records
insert_url = f"{url.rstrip('/')}/rest/v1/doctores"
try:
    req = urllib.request.Request(
        insert_url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        print(f"¡Sincronización exitosa! Se subieron {len(payload)} doctores a la nube de Supabase.")
except urllib.error.HTTPError as e:
    print(f"Error al subir registros a Supabase: {e.code} - {e.read().decode('utf-8')}")
    exit(1)
except Exception as e:
    print(f"Error de conexión: {e}")
    exit(1)
