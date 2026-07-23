path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if "export function savePatient" in line or "export async function savePatient" in line:
        print(f"Line {idx}: {line.strip()}")
        # print next 25 lines
        for i in range(idx, min(len(lines), idx+35)):
            print(f"  {i+1}: {lines[i].strip()}")
        break
