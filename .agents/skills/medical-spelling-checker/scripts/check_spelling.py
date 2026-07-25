import sys
import re

def check_spelling(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
            
        errors = []
        
        # 1. Check for strange encoding characters
        weird_chars = re.findall(r'[\u00c2\u00e2\ufffd]', content)
        if weird_chars:
            errors.append(f"ERROR: Strange copy-paste characters found in file (found {len(weird_chars)} instances).")

        # 2. Check for incorrect capitalization of medical proper nouns (must be capitalized)
        proper_nouns = {
            r'\bbethesda\b': 'Bethesda',
            r'\bpapanicolaou\b': 'Papanicolaou',
            r'\blester\b': 'Lester',
            r'\bsusan\b': 'Susan',
        }
        for pattern, correct in proper_nouns.items():
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if match != correct and match != correct.upper():
                    errors.append(f"ERROR: Medical proper noun '{match}' must be capitalized as '{correct}'.")

        # 3. Check for accent errors on common clinical section words
        clinical_accents = {
            r'\bmacroscopia\b': 'macroscopía',
            r'\bmicroscopia\b': 'microscopía',
            r'\bdiagnostico\b': 'diagnóstico',
            r'\bpatologia\b': 'patología',
            r'\bopterigión\b': 'pterigión', # check pterigión
        }
        for pattern, correct in clinical_accents.items():
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                errors.append(f"ERROR: Word '{match}' is missing its accent mark. Should be '{correct}'.")

        if errors:
            for err in errors:
                print(err)
            sys.exit(1)
        else:
            print("Template spelling and capitalization validation passed.")
            sys.exit(0)
            
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python check_spelling.py <templates_file>")
        sys.exit(1)
        
    check_spelling(sys.argv[1])
