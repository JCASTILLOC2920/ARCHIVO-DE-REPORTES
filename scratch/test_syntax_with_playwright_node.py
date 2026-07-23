import subprocess

node_path = r"C:\Users\DELL\AppData\Local\Programs\Python\Python313\Lib\site-packages\playwright\driver\node.exe"
files = [
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js",
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\main.js",
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"
]

print("=== CHECKING SYNTAX WITH PLAYWRIGHT NODE ===")
for f in files:
    try:
        res = subprocess.run([node_path, "--check", f], capture_output=True, text=True)
        if res.returncode == 0:
            print(f"File {f}: SYNTAX OK")
        else:
            print(f"File {f}: SYNTAX ERROR!")
            print("STDOUT:", res.stdout)
            print("STDERR:", res.stderr)
    except Exception as e:
        print(f"Error checking {f}: {e}")
