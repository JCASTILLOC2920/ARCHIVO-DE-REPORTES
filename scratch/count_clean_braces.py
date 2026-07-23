import re

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

def clean_js(js):
    # Matches block comments, line comments, double quoted strings, single quoted strings, and template literals
    pattern = r'(/\*(?:[^*]|(?:\*+[^*/]))*\*+/)|(//.*)|("(?:\\.|[^"])*")|(\'(?:\\.|[^\'])*\')|(`(?:\\.|[^`])*`)'
    def replacer(match):
        s = match.group(0)
        if s.startswith('/*') or s.startswith('//'):
            return " "
        else:
            # Keep empty strings to preserve braces count in literal structures
            return '""'
    return re.compile(pattern).sub(replacer, js)

cleaned = clean_js(content)
opens = cleaned.count('{')
closes = cleaned.count('}')

print(f"Cleaned JS Brace Count:")
print(f"  Opens ({{): {opens}")
print(f"  Closes (}}): {closes}")
print(f"  Difference (Opens - Closes): {opens - closes}")
