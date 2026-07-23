import os
import re
import fitz # PyMuPDF
import pypdf

# Test files
test_files = [
    r"C:\Users\DELL\Desktop\QUIRURGICOS 2026\26Q-001 FRANKLIN PILLPE CANGANA (1).pdf",
    r"C:\Users\DELL\Desktop\QUIRURGICOS 2026\26Q-002 YANETT ESTRADA JARAMILLO (1).pdf"
]

output_img_dir = r"C:\Users\DELL\Desktop\QUIRURGICOS 2026\imagenes_test"
os.makedirs(output_img_dir, exist_ok=True)

def parse_pdf(pdf_path):
    # Extract text using pypdf
    reader = pypdf.PdfReader(pdf_path)
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() + "\n"
        
    # Clean text line endings
    full_text = full_text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Parse fields
    # 1. Apellidos y Nombres
    m_name = re.search(r"APELLIDOS\s+Y\s+NOMBRES\s*:\s*(.*)", full_text)
    nombre = m_name.group(1).strip() if m_name else ""
    
    # 2. Edad & Sexo & Codigo
    # Example: EDAD : 39 AÑOS SEXO : FEMENINO 26Q-002
    # Example: EDAD : -- SEXO : MASCULINO 26Q-001
    m_age_sex_code = re.search(r"EDAD\s*:\s*(.*?)\s+SEXO\s*:\s*(\w+)\s+(26Q-\d+)", full_text)
    if m_age_sex_code:
        edad = m_age_sex_code.group(1).strip()
        sexo = m_age_sex_code.group(2).strip()
        codigo = m_age_sex_code.group(3).strip()
    else:
        edad, sexo, codigo = "", "", ""
        
    # 3. Fechas
    m_dates = re.search(r"FECHA\s+DE\s+RECEPCI[ÓO]N\s*:\s*(.*?)\s+FECHA\s+DE\s+INFORME\s*:\s*(.*)", full_text)
    fecha_recepcion = m_dates.group(1).strip() if m_dates else ""
    fecha_informe = m_dates.group(2).strip() if m_dates else ""
    
    # 4. Indicación / Médico
    m_indic = re.search(r"INDICACI[ÓO]N:\s*(.*)", full_text)
    indicacion = m_indic.group(1).strip() if m_indic else ""
    
    # Extract sections
    # Macroscopía
    macro = ""
    m_macro = re.search(r"DATOS\s+MACROSCOPICA\s*\n(.*?)(?=DATOS\s+MICROSCOPIA|DIAGN[ÓO]STICO\s+HISTOLOGICO:|$)", full_text, re.DOTALL)
    if m_macro:
        macro = m_macro.group(1).strip()
        
    # Microscopía
    micro = ""
    m_micro = re.search(r"DATOS\s+MICROSCOPIA\s*\n(.*?)(?=DIAGN[ÓO]STICO\s+HISTOLOGICO:|$)", full_text, re.DOTALL)
    if m_micro:
        micro = m_micro.group(1).strip()
        
    # Diagnóstico
    diag = ""
    m_diag = re.search(r"DIAGN[ÓO]STICO\s+HISTOLOGICO:\s*\n(.*?)(?=Comentario:|pgina|$)", full_text, re.DOTALL)
    if m_diag:
        diag = m_diag.group(1).strip()
        
    # Clean clinical guides and page headers
    # Header pattern: 26Q-002 YANETT ESTRADA JARAMILLO página 2 de 2 or similar
    header_pattern = rf"{codigo}.*?p.{{1,3}}gina\s+\d+\s+de\s+\d+"
    macro = re.sub(header_pattern, "", macro, flags=re.IGNORECASE).strip()
    micro = re.sub(header_pattern, "", micro, flags=re.IGNORECASE).strip()
    diag = re.sub(header_pattern, "", diag, flags=re.IGNORECASE).strip()
    
    # Clean clinical guides like "Basado Susan C. Lester..."
    macro = re.sub(r"Basado\s+Susan\s+C\.\s+Lester\..*", "", macro, flags=re.IGNORECASE).strip()

    return {
        "codigo": codigo,
        "nombre": nombre,
        "edad": edad,
        "sexo": sexo,
        "fecha_recepcion": fecha_recepcion,
        "fecha_informe": fecha_informe,
        "indicacion": indicacion,
        "macro": macro,
        "micro": micro,
        "diagnostico": diag
    }

def extract_images(pdf_path, codigo):
    doc = fitz.open(pdf_path)
    img_count = 0
    extracted_imgs = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)
        
        for img in image_list:
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Exclude standard headers, icons, and signatures
            # We target the patient medical images which are JPEGs
            if image_ext.lower() in ["jpg", "jpeg"] and len(image_bytes) > 20000:
                img_count += 1
                out_name = f"{codigo}_img0{img_count}.{image_ext}"
                out_path = os.path.join(output_img_dir, out_name)
                with open(out_path, "wb") as f:
                    f.write(image_bytes)
                extracted_imgs.append(out_name)
                
    return extracted_imgs

# Run test
for file_path in test_files:
    print(f"\n=================== PARSING {os.path.basename(file_path)} ===================")
    data = parse_pdf(file_path)
    print("Parsed Data:")
    for k, v in data.items():
        print(f"  {k}: {repr(v)}")
        
    imgs = extract_images(file_path, data["codigo"])
    print(f"Extracted Images: {imgs}")
