import pypdf

pdf_path = r"C:\Users\DELL\Desktop\QUIRURGICOS 2026\26Q-002 YANETT ESTRADA JARAMILLO (1).pdf"
reader = pypdf.PdfReader(pdf_path)

print(f"Total pages: {len(reader.pages)}")
for i, page in enumerate(reader.pages):
    print(f"--- PAGE {i+1} ---")
    print(page.extract_text())
