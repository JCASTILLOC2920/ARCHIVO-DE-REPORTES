with open(r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "function correctPapanicolaouSpelling" in line:
        print(f"Line {idx+1}:")
        for i in range(max(0, idx-2), min(len(lines), idx+15)):
            print(f"  {i+1}: {lines[i].strip()}")
        break
