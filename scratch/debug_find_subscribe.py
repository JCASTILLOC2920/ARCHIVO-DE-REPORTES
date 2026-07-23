path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

start_sig = "export function subscribePatientsRealtime()"
start_idx = content.find(start_sig)

if start_idx != -1:
    print("Found signature at:", start_idx)
    print("Context around signature:")
    print(content[start_idx:start_idx+300])
else:
    print("Signature not found!")
