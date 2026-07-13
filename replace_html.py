import re
import os

with open('reportes.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open(r'C:\Users\HP\.gemini\antigravity\brain\e6169078-fdde-4ddb-aad8-ff3a8f162d25\scratch\new_templates.html', 'r', encoding='utf-8') as f:
    new_html = f.read()

pattern2 = re.compile(r'<!-- PLANTILLAS VIEW -->.*?<!-- Ventana Modal de Registro', re.DOTALL)
html = pattern2.sub(new_html + '\n\n    <!-- Ventana Modal de Registro', html)

with open('reportes.html', 'w', encoding='utf-8') as f:
    f.write(html)
