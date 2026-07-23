import os

# Search starting from Escritorio (Desktop) or the workspace parent directories
paths_to_check = [
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES",
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio",
    r"C:\Users\DELL\.gemini\antigravity"
]

found = []
for p in paths_to_check:
    if os.path.exists(p):
        for root, dirs, files in os.walk(p):
            for d in dirs:
                if "macro" in d.lower() or "record" in d.lower():
                    found.append(os.path.join(root, d))
            for f in files:
                if "macro" in f.lower() or "record" in f.lower():
                    found.append(os.path.join(root, f))

print("Found files/folders related to macrorecorder:")
for item in set(found):
    print("  ", item)
