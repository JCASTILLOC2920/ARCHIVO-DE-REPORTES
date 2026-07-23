import sys

libs = ['pypdf', 'PyPDF2', 'pdfplumber', 'fitz', 'pdfminer', 'openpyxl', 'PIL', 'matplotlib']
available = {}

for lib in libs:
    try:
        __import__(lib)
        available[lib] = True
    except ImportError:
        available[lib] = False

print("Available libraries:", available)
