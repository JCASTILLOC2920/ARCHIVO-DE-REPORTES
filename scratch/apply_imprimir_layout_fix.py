path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

target = """            // Si es modo firma / autoDownload directo, ocultar toolbar del visor
            if (isAutoDownload) {
                const tb = document.getElementById('pvToolbar');
                const sb = document.getElementById('pvSidebar');
                if (tb) tb.style.display = 'none';
                if (sb) sb.style.display = 'none';
                const canvas = document.querySelector('.pv-canvas');
                if (canvas) canvas.style.marginLeft = '0';
            }"""

replacement = """            // Si es modo firma / autoDownload directo, ocultar toolbar del visor y ajustar el diseño
            if (isAutoDownload) {
                document.body.classList.add('auto-download-active');
                document.documentElement.style.overflow = 'hidden';
                document.body.style.overflow = 'hidden';
                
                const tb = document.getElementById('pvToolbar');
                const sb = document.getElementById('pvSidebar');
                if (tb) tb.style.display = 'none';
                if (sb) sb.style.display = 'none';
                
                const mainLayout = document.querySelector('.pv-main-layout');
                if (mainLayout) {
                    mainLayout.style.marginTop = '0';
                    mainLayout.style.minHeight = 'auto';
                }
                
                const canvas = document.querySelector('.pv-canvas');
                if (canvas) {
                    canvas.style.marginLeft = '0';
                    canvas.style.padding = '0';
                    canvas.style.minHeight = 'auto';
                }
                
                const sheet = document.getElementById('pvSheet');
                if (sheet) {
                    sheet.style.boxShadow = 'none';
                    sheet.style.margin = '0 auto';
                }
            }"""

# Clean carriage returns if any
content_normalized = content.replace('\r\n', '\n')
target_normalized = target.replace('\r\n', '\n')
replacement_normalized = replacement.replace('\r\n', '\n')

if target_normalized in content_normalized:
    content_normalized = content_normalized.replace(target_normalized, replacement_normalized)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content_normalized)
    print("SUCCESSFULLY PATCHED imprimir.html layout alignment!")
else:
    print("Could not find target block!")
