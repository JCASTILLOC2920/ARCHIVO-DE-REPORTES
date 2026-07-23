import fitz

pdf_path = r"C:\Users\DELL\Desktop\QUIRURGICOS 2026\26Q-001 FRANKLIN PILLPE CANGANA (1).pdf"
doc = fitz.open(pdf_path)
for i, page in enumerate(doc):
    print(f"--- PyMuPDF PAGE {i+1} ---")
    print(page.get_text())
