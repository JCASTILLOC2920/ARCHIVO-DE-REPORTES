import json

with open(r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json", "r", encoding="utf-8") as f:
    data = json.load(f)

text = data[0]["macro"]
# find the character after "cut"
idx = text.find("cut")
if idx != -1:
    char = text[idx+3]
    print(f"Character: {repr(char)}")
    print(f"Unicode codepoint: {ord(char)}")
