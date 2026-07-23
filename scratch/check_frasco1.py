import pypdf

pdf_path = r"C:\Users\DELL\Desktop\QUIRURGICOS 2026\26Q-001 FRANKLIN PILLPE CANGANA (1).pdf"
reader = pypdf.PdfReader(pdf_path)

# Let's inspect the extracted text line by line
for i, page in enumerate(reader.pages):
    print(f"Page {i+1}:")
    text = page.extract_text()
    for line in text.split("\n"):
        print(f"  {repr(line)}")
