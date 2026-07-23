path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# 1. Replace CSS rules for report-images and report-img
old_css_target = """.report-images {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 10px;
    margin-bottom: 10px;
    page-break-inside: avoid;
}
.report-img {
    max-height: 180px;
    border: 1.5px solid #000;
    border-radius: 4px;
    object-fit: contain;
}"""

new_css_replacement = """.report-images {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 10px;
    page-break-inside: avoid;
    width: 100%;
}
.report-images.two-images {
    justify-content: space-between !important;
}
.report-images.two-images .report-img {
    width: 48% !important;
    max-height: 155px !important;
    aspect-ratio: 4 / 3 !important;
    object-fit: cover !important;
    border: 1px solid #000 !important;
    border-radius: 4px !important;
}
.report-images.one-image {
    justify-content: center !important;
}
.report-images.one-image .report-img {
    width: 58% !important;
    max-height: 185px !important;
    aspect-ratio: 4 / 3 !important;
    object-fit: cover !important;
    border: 1px solid #000 !important;
    border-radius: 4px !important;
}
.report-img {
    border: 1px solid #000;
    border-radius: 4px;
    object-fit: cover;
}"""

# Clean carriage returns if any
content_normalized = content.replace('\r\n', '\n')
old_css_target_normalized = old_css_target.replace('\r\n', '\n')
new_css_replacement_normalized = new_css_replacement.replace('\r\n', '\n')

if old_css_target_normalized in content_normalized:
    content_normalized = content_normalized.replace(old_css_target_normalized, new_css_replacement_normalized)
    print("SUCCESSFULLY REPLACED CSS styles in imprimir.html!")
else:
    # Let's try flexible whitespace search or replacing the lines directly
    print("CSS target block not found exactly. Trying line replace...")
    content_normalized = content_normalized.replace(
        "max-height: 180px;\n    border: 1.5px solid #000;\n    border-radius: 4px;\n    object-fit: contain;",
        "max-height: 155px;\n    border: 1.5px solid #000;\n    border-radius: 4px;\n    object-fit: cover;\n    aspect-ratio: 4/3;"
    )

# 2. Update JavaScript image rendering block in imprimir.html to add classes
old_js_target = """        // Adjuntar im?genes si existen
        const imgContainer = document.getElementById('imagesContainer');
        if (imgContainer) {
            imgContainer.innerHTML = '';
            if ((patient.img01 && String(patient.img01).trim() !== '') || (patient.img02 && String(patient.img02).trim() !== '')) {
                imgContainer.style.display = 'flex';"""

# Let's inspect what is in the file using regex or find.
# In read_imprimir_render.py output, we had:
# 1042: // Adjuntar im?genes si existen
# 1043: const imgContainer = document.getElementById('imagesContainer');
# 1044: if (imgContainer) {
# 1045: imgContainer.innerHTML = '';
# 1046: if ((patient.img01 && String(patient.img01).trim() !== '') || (patient.img02 && String(patient.img02).trim() !== '')) {
# 1047: imgContainer.style.display = 'flex';

old_js_block = """        // Adjuntar im?genes si existen
        const imgContainer = document.getElementById('imagesContainer');
        if (imgContainer) {
            imgContainer.innerHTML = '';
            if ((patient.img01 && String(patient.img01).trim() !== '') || (patient.img02 && String(patient.img02).trim() !== '')) {
                imgContainer.style.display = 'flex';"""

new_js_replacement = """        // Adjuntar imágenes si existen (con alineación estética simétrica)
        const imgContainer = document.getElementById('imagesContainer');
        if (imgContainer) {
            imgContainer.innerHTML = '';
            const hasImg01 = patient.img01 && String(patient.img01).trim() !== '';
            const hasImg02 = patient.img02 && String(patient.img02).trim() !== '';
            
            if (hasImg01 || hasImg02) {
                imgContainer.style.display = 'flex';
                if (hasImg01 && hasImg02) {
                    imgContainer.className = 'report-images two-images';
                } else {
                    imgContainer.className = 'report-images one-image';
                }"""

old_js_block_norm = old_js_block.replace('\r\n', '\n')
new_js_replacement_norm = new_js_replacement.replace('\r\n', '\n')

# Let's do a flexible replace using string search
if "const imgContainer = document.getElementById('imagesContainer');" in content_normalized:
    # Let's replace the exact lines from line 1042 of imprimir.html
    # Let's look up the index of the string
    target_idx = content_normalized.find("const imgContainer = document.getElementById('imagesContainer');")
    if target_idx != -1:
        # Find next occurrence of "imgContainer.style.display = 'flex';"
        flex_idx = content_normalized.find("imgContainer.style.display = 'flex';", target_idx)
        if flex_idx != -1:
            # We replace everything from target_idx to flex_idx + len(...)
            original_chunk = content_normalized[target_idx:flex_idx + len("imgContainer.style.display = 'flex';")]
            # The replacement will be:
            replacement_chunk = """const imgContainer = document.getElementById('imagesContainer');
        if (imgContainer) {
            imgContainer.innerHTML = '';
            const hasImg01 = patient.img01 && String(patient.img01).trim() !== '';
            const hasImg02 = patient.img02 && String(patient.img02).trim() !== '';
            
            if (hasImg01 || hasImg02) {
                imgContainer.style.display = 'flex';
                if (hasImg01 && hasImg02) {
                    imgContainer.className = 'report-images two-images';
                } else {
                    imgContainer.className = 'report-images one-image';
                }"""
            content_normalized = content_normalized.replace(original_chunk, replacement_chunk)
            print("SUCCESSFULLY PATCHED JS image rendering block in imprimir.html!")

with open(path, "w", encoding="utf-8") as f:
    f.write(content_normalized)
