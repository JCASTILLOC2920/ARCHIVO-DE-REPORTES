import json
import re
from collections import Counter

with open(r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json", "r", encoding="utf-8") as f:
    data = json.load(f)

corrupt_words = Counter()

# Find all words containing \ufffd
for row in data:
    for field in ["macro", "micro", "diagnostico", "indicacion"]:
        text = row.get(field, "")
        if text:
            # Tokenize words
            words = re.findall(r'\b\w*[\ufffd\uFFFD]\w*\b', text)
            for w in words:
                corrupt_words[w] += 1

print("Corrupt words found:", len(corrupt_words))
for w, count in corrupt_words.most_common(100):
    print(f"  {w}: {count}")
