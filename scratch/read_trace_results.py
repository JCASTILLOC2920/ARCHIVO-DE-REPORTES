path = r"C:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\scratch\trace_log.txt"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Search for any line where balance goes negative or print the last 30 lines
print("--- LAST 30 LINES OF TRACE LOG ---")
for line in lines[-30:]:
    print(line.strip())

# Search for negative balance
negatives = [line.strip() for line in lines if "balance=-" in line]
if negatives:
    print("\n--- FIRST NEGATIVE BALANCES ---")
    for neg in negatives[:10]:
        print(neg)
