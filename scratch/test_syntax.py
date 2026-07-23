import ast

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

try:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        code = f.read()
    
    # We can compile it using python's compile (which checks basic js syntax if we had a js parser, but for python we can check if it parses, wait, python parser won't parse JS syntax!)
    # Ah! Python ast parser works for python, not for Javascript!
    # To parse JavaScript, we can write a simple node.js command to parse the file or load it!
    # Let's run a node command to check for syntax errors in ui_report_editor.js!
    print("JS Check script written.")
except Exception as e:
    print("Error:", e)
