path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's locate the CSS block for .report-images
start_idx = content.find(".report-images {")
end_idx = content.find("}", start_idx) # end of .report-images
# Let's check where the next class (.report-img) starts and ends
img_start = content.find(".report-img {", end_idx)
img_end = content.find("}", img_start)

if start_idx != -1 and img_end != -1:
    # We replace everything from start_idx to img_end + 1
    original_chunk = content[start_idx:img_end + 1]
    
    replacement_chunk = """.report-images {
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

    new_content = content[:start_idx] + replacement_chunk + content[img_end + 1:]
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("SUCCESSFULLY APPLIED HARMONIOUS CSS STYLES VIA OFFSETS!")
else:
    print("Could not find the target CSS classes in imprimir.html!")
