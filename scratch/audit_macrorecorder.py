import os
import sys
import json
import ctypes

base_dir = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\macrorecorder"

print("--- AUDIT OF DICTIONARIES & FILES ---")

# 1. Check json files
json_files = ["fantasmas_acusticos.json", "mapeo_maestro.json", "diccionario.json", "comandos_f3.json", "plantillas.json"]
for jf in json_files:
    p = os.path.join(base_dir, jf)
    if os.path.exists(p):
        size = os.path.getsize(p)
        print(f"File {jf}: {size} bytes")
        try:
            with open(p, "r", encoding="utf-8", errors="ignore") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    print(f"  Keys count: {len(data)}")
                elif isinstance(data, list):
                    print(f"  Items count: {len(data)}")
        except Exception as e:
            print(f"  Error reading {jf}: {e}")

# 2. Check pkl files
pkl_files = [f for f in os.listdir(base_dir) if f.endswith(".pkl")]
for pf in pkl_files:
    p = os.path.join(base_dir, pf)
    print(f"Pickle {pf}: {os.path.getsize(p)} bytes")

# 3. Memory stats via Windows API
class MEMORYSTATUSEX(ctypes.Structure):
    _fields_ = [
        ("dwLength", ctypes.c_ulong),
        ("dwMemoryLoad", ctypes.c_ulong),
        ("ullTotalPhys", ctypes.c_ulonglong),
        ("ullAvailPhys", ctypes.c_ulonglong),
        ("ullTotalPageFile", ctypes.c_ulonglong),
        ("ullAvailPageFile", ctypes.c_ulonglong),
        ("ullTotalVirtual", ctypes.c_ulonglong),
        ("ullAvailVirtual", ctypes.c_ulonglong),
        ("sAvailExtendedVirtual", ctypes.c_ulonglong),
    ]

mem = MEMORYSTATUSEX()
mem.dwLength = ctypes.sizeof(MEMORYSTATUSEX)
ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(mem))

print(f"\nSystem Total RAM: {mem.ullTotalPhys / (1024**3):.2f} GB")
print(f"System Available RAM: {mem.ullAvailPhys / (1024**3):.2f} GB")
print(f"CPU Count (Logical): {os.cpu_count()}")
