import re

for html_file in ['index.html', 'login.html', 'reportes.html', 'imprimir.html']:
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        matches = re.findall(r'(?:href|src)=["\']([^"\']+\?v=[^"\']+)["\']', content)
        print(f'{html_file}:')
        for m in matches:
            print(f'  {m}')
    except Exception as e:
        print(f'Error reading {html_file}: {e}')
