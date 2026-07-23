import os

path1 = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\reportes.css"
path2 = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\style.css"

print("--- SEARCHING ACTION-BTN IN REPORTES.CSS ---")
with open(path1, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()
    for idx, line in enumerate(lines, 1):
        if "action-btn" in line.lower() or "edit-btn" in line.lower():
            print(f"reportes.css:{idx}: {line.strip()}")

print("\n--- SEARCHING ACTION-BTN IN STYLE.CSS ---")
with open(path2, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()
    for idx, line in enumerate(lines, 1):
        if "action-btn" in line.lower() or "edit-btn" in line.lower():
            print(f"style.css:{idx}: {line.strip()}")
