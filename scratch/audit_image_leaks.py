import os
import re

workspace_dir = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES"

print("=== DEEP AUDIT FOR IMAGE LEAKS IN JS / HTML FILES ===")

files_to_check = ["ui_report_editor.js", "db_service.js", "imprimir.html", "main.js", "ui_tables.js", "ui_editor.js"]

for filename in files_to_check:
    filepath = os.path.join(workspace_dir, filename)
    if not os.path.exists(filepath):
        continue
    
    print(f"\n--- Checking {filename} ---")
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
        
    for idx, line in enumerate(lines, 1):
        if "img01" in line or "img02" in line or "imagescontainer" in line.lower() or "attachment-preview" in line.lower():
            print(f"  Line {idx}: {line.strip()}")
