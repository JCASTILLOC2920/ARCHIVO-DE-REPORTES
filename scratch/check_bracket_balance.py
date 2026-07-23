import re

files = [
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\main.js",
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js",
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"
]

def check_brackets(filepath):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    # Simple brackets/braces balance check
    braces = 0
    brackets = 0
    parens = 0
    
    # We should skip strings and comments to be accurate
    # Remove single line comments
    clean_content = re.sub(r"//.*", "", content)
    # Remove block comments
    clean_content = re.sub(r"/\*.*?\*/", "", clean_content, flags=re.DOTALL)
    # Remove string literals
    clean_content = re.sub(r"'(?:\\.|[^'])*'", "''", clean_content)
    clean_content = re.sub(r'"(?:\\.|[^"])*"', '""', clean_content)
    clean_content = re.sub(r'`(?:\\.|[^`])*`', '``', clean_content)
    
    for idx, char in enumerate(clean_content):
        if char == '{': braces += 1
        elif char == '}': braces -= 1
        elif char == '[': brackets += 1
        elif char == ']': brackets -= 1
        elif char == '(': parens += 1
        elif char == ')': parens -= 1
        
    print(f"File: {filepath}")
    print(f"  Braces balance ({{ }}): {braces}")
    print(f"  Brackets balance ([ ]): {brackets}")
    print(f"  Parentheses balance (( )): {parens}")
    if braces != 0 or brackets != 0 or parens != 0:
        print("  WARNING: UNBALANCED BRACKETS/BRACES!")

for f in files:
    check_brackets(f)
