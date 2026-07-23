import os

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\macrorecorder\nucleo_voz.py"

print("--- AUDIO RECORDING LOOP IN NUCLEO_VOZ.PY ---")
if os.path.exists(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
    for idx, line in enumerate(lines, 1):
        if "read(" in line or "threshold" in line or "rms" in line or "listen(" in line or "pyaudio" in line.lower():
            safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"Line {idx}: {safe_line}")
else:
    print("nucleo_voz.py does not exist.")
