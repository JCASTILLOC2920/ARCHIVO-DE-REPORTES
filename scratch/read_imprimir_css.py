path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's inspect CSS styles in imprimir.html (usually inside <style> tags)
start_style = content.find("<style>")
end_style = content.find("</style>")

if start_style != -1 and end_style != -1:
    style_content = content[start_style:end_style]
    # search for canvas, page, media print, and height rules
    print("--- INTERESTING CSS RULES IN IMPRIMIR.HTML ---")
    lines = style_content.splitlines()
    for idx, line in enumerate(lines, 1):
        if any(x in line for x in ["canvas", "@media", "@page", "height", "padding", "margin", "print", "size"]):
            # print line with index
            safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"L{idx}: {safe_line}")
