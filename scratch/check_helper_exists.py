with open(r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js", "r", encoding="utf-8") as f:
    content = f.read()

if "function formatDoctorName" in content:
    print("Found!")
else:
    print("NOT FOUND!")
