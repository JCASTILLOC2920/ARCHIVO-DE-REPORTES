# -*- coding: utf-8 -*-
import re

with open('reportes.js', 'r', encoding='utf-8') as f:
    content = f.read()

with open('new_templates_logic.js', 'r', encoding='utf-8') as f:
    new_logic = f.read()

pattern = r"// Toggle de Sub-pesta.as para Plantillas.*?(?=\n\s*// --- HACER LA MODAL ARRASTRABLE \(DRAGGABLE\) ---)"

match = re.search(pattern, content, flags=re.DOTALL | re.IGNORECASE)

if match:
    new_content = content[:match.start()] + new_logic + content[match.end():]
    with open('reportes.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Patched successfully")
else:
    print("Pattern not found")

