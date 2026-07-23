path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's search for body contents in imprimir.html
start_body = content.find("<body")
end_body = content.find("</body>")

if start_body != -1 and end_body != -1:
    body_content = content[start_body:end_body]
    print("--- BODY STRUCT ---")
    for line in body_content.splitlines():
        if any(x in line for x in ["<div", "<section", "<main", "<header", "<footer", "id="]):
            if "class=" in line or "id=" in line:
                safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
                print(safe_line)
