import os

base_path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\macrorecorder"

files_to_read = [
    "nucleo_voz.py",
    "mapeo_maestro.json",
    "asistente_seguridad.py"
]

print("--- EXAMINING VOICE AND DICTATION CORE FILES ---")
for f_name in files_to_read:
    p = os.path.join(base_path, f_name)
    if os.path.exists(p):
        print(f"\n==================== {f_name} ====================")
        with open(p, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
        # Print first 60 lines or search for key functions
        for idx in range(min(60, len(lines))):
            safe_line = lines[idx].strip().encode('ascii', errors='replace').decode('ascii')
            print(f"{idx+1}: {safe_line}")
    else:
        print(f"\nFile {f_name} does not exist.")
