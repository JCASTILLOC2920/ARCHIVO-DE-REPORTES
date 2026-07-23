import re
import subprocess
import os

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"
node_path = r"C:\Users\DELL\AppData\Local\Programs\Python\Python313\Lib\site-packages\playwright\driver\node.exe"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Find all script blocks in HTML
scripts = re.findall(r"<script[^>]*>(.*?)</script>", content, re.DOTALL)
print(f"Found {len(scripts)} script blocks.")

temp_js = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\scratch\temp_imprimir_script.js"

for idx, s in enumerate(scripts, 1):
    with open(temp_js, "w", encoding="utf-8") as f:
        f.write(s)
    
    res = subprocess.run([node_path, "--check", temp_js], capture_output=True, text=True)
    if res.returncode == 0:
        print(f"Script block {idx}: SYNTAX OK")
    else:
        print(f"Script block {idx}: SYNTAX ERROR!")
        print(res.stderr)

if os.path.exists(temp_js):
    os.remove(temp_js)
