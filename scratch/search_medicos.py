import os

workspace_dir = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES"
matches = []

for root, dirs, files in os.walk(workspace_dir):
    if ".git" in root:
        continue
    for file in files:
        if file.endswith((".js", ".html", ".css")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    for line_num, line in enumerate(f, 1):
                        if "med_solicitante" in line.lower() or "doctor" in line.lower() or "solicitante" in line.lower():
                            matches.append({
                                "file": file,
                                "line": line_num,
                                "content": line.strip()
                            })
            except Exception as e:
                pass

for match in matches[:60]:
    print(f"{match['file']}:{match['line']}: {match['content']}")
