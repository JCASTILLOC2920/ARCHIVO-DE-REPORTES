import esprima
try:
    with open('ui_report_editor.js', 'r', encoding='utf-8') as f:
        code = f.read()
    print("JS read, testing esprima parse if available...")
except Exception as e:
    print("Error:", e)
