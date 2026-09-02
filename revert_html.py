import os

path = r"c:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES\reportes.html"

with open(path, "r", encoding="utf-8") as f:
    html = f.read()
    
html = html.replace('<script src="motor_groq.js" defer></script>\n', '')

with open(path, "w", encoding="utf-8") as f:
    f.write(html)
