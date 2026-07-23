import fitz # PyMuPDF

pdf_paths = [
    r"C:\Users\DELL\Desktop\QUIRURGICOS 2026\26Q-001 FRANKLIN PILLPE CANGANA (1).pdf",
    r"C:\Users\DELL\Desktop\QUIRURGICOS 2026\26Q-002 YANETT ESTRADA JARAMILLO (1).pdf"
]

for path in pdf_paths:
    doc = fitz.open(path)
    print(f"--- File: {path} ---")
    print(f"Pages: {len(doc)}")
    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)
        print(f"  Page {page_num+1} has {len(image_list)} images.")
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            print(f"    Image {img_index+1}: xref {xref}, size {len(image_bytes)} bytes, extension {image_ext}")
