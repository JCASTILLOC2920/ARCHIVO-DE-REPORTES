import subprocess

node_path = r"C:\Users\DELL\AppData\Local\Programs\Python\Python313\Lib\site-packages\playwright\driver\node.exe"
path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\plantillas_data.js"

try:
    res = subprocess.run([node_path, "--check", path], capture_output=True, text=True)
    if res.returncode == 0:
        print("plantillas_data.js SYNTAX OK")
    else:
        print("plantillas_data.js SYNTAX ERROR:")
        print(res.stderr)
except Exception as e:
    print("Error checking syntax:", e)
