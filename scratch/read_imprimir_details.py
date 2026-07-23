path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("=== LINES 390 to 440 (CSS for page-footer) ===")
for i in range(389, 440):
    print(f"{i+1}: {lines[i].strip()}")

print("\n=== LINES 600 to 620 (HTML for page-footer) ===")
for i in range(599, 620):
    print(f"{i+1}: {lines[i].strip()}")

print("\n=== LINES 1035 to 1055 (JS setting footer) ===")
for i in range(1034, 1055):
    print(f"{i+1}: {lines[i].strip()}")
