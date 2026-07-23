import os

search_paths = [
    r"C:\Program Files",
    r"C:\Program Files (x86)",
    r"C:\Users\DELL\AppData\Roaming\npm",
    r"C:\Users\DELL\AppData\Local\Programs"
]

found = []
for p in search_paths:
    if os.path.exists(p):
        for root, dirs, files in os.walk(p):
            if "node.exe" in files:
                found.append(os.path.join(root, "node.exe"))
                break

print("Found node.exe:", found)
