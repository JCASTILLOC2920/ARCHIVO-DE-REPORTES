path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's inspect the exact lines of subscribePatientsRealtime
start_idx = content.find("export function subscribePatientsRealtime()")
end_idx = content.find("export function queueSyncWrite", start_idx)

sub_func = content[start_idx:end_idx]
print("--- SUBSCRIBE PATIENTS REALTIME FUNCTION BODY ---")
print(sub_func)
