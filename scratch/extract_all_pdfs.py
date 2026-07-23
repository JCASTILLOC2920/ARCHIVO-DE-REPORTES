import os
import re
import csv
import json
import fitz # PyMuPDF
import pypdf

pdf_dir = r"C:\Users\DELL\Desktop\QUIRURGICOS 2026"
output_csv = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.csv"
output_json = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json"
output_img_dir = r"C:\Users\DELL\Desktop\QUIRURGICOS 2026\imagenes_extraidas"

os.makedirs(output_img_dir, exist_ok=True)

def parse_pdf(pdf_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"
            
        full_text = full_text.replace('\r\n', '\n').replace('\r', '\n')
        
        # 1. Apellidos y Nombres
        m_name = re.search(r"APELLIDOS\s+Y\s+NOMBRES\s*:\s*(.*)", full_text)
        nombre = m_name.group(1).strip() if m_name else ""
        
        # 2. Edad, Sexo, Codigo
        m_age_sex_code = re.search(r"EDAD\s*:\s*(.*?)\s+SEXO\s*:\s*(\w+)\s+(26Q-\d+)", full_text)
        if m_age_sex_code:
            edad = m_age_sex_code.group(1).strip()
            sexo = m_age_sex_code.group(2).strip()
            codigo = m_age_sex_code.group(3).strip()
        else:
            edad, sexo, codigo = "", "", ""
            
        # Fallback for code from filename if not found in text
        if not codigo:
            m_fn_code = re.search(r"(26Q-\d+)", os.path.basename(pdf_path))
            if m_fn_code:
                codigo = m_fn_code.group(1).strip()
            else:
                codigo = "UNKNOWN"
                
        if not nombre:
            # Fallback for name from filename (e.g. "26Q-001 FRANKLIN PILLPE CANGANA (1).pdf")
            clean_name = os.path.basename(pdf_path).replace(codigo, "").replace(".pdf", "")
            clean_name = re.sub(r"\(\d+\)", "", clean_name).strip()
            nombre = clean_name
            
        # 3. Fechas
        m_dates = re.search(r"FECHA\s+DE\s+RECEPCI[ÓO]N\s*:\s*(.*?)\s+FECHA\s+DE\s+INFORME\s*:\s*(.*)", full_text)
        fecha_recepcion = m_dates.group(1).strip() if m_dates else ""
        fecha_informe = m_dates.group(2).strip() if m_dates else ""
        
        # 4. Indicación / Médico
        m_indic = re.search(r"INDICACI[ÓO]N:\s*(.*)", full_text)
        indicacion = m_indic.group(1).strip() if m_indic else ""
        
        # Extract sections
        macro = ""
        m_macro = re.search(r"DATOS\s+MACROSCOPICA\s*\n(.*?)(?=DATOS\s+MICROSCOPIA|DIAGN[ÓO]STICO\s+HISTOLOGICO:|$)", full_text, re.DOTALL)
        if m_macro:
            macro = m_macro.group(1).strip()
            
        micro = ""
        m_micro = re.search(r"DATOS\s+MICROSCOPIA\s*\n(.*?)(?=DIAGN[ÓO]STICO\s+HISTOLOGICO:|$)", full_text, re.DOTALL)
        if m_micro:
            micro = m_micro.group(1).strip()
            
        diag = ""
        m_diag = re.search(r"DIAGN[ÓO]STICO\s+HISTOLOGICO:\s*\n(.*?)(?=Comentario:|pgina|$)", full_text, re.DOTALL)
        if m_diag:
            diag = m_diag.group(1).strip()
            
        # Clean page headers
        header_pattern = rf"{codigo}.*?p.{{1,3}}gina\s+\d+\s+de\s+\d+"
        macro = re.sub(header_pattern, "", macro, flags=re.IGNORECASE).strip()
        micro = re.sub(header_pattern, "", micro, flags=re.IGNORECASE).strip()
        diag = re.sub(header_pattern, "", diag, flags=re.IGNORECASE).strip()
        
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
    except Exception as e:
        print(f"Error parsing text for {pdf_path}: {e}")
        return None

def extract_images(pdf_path, codigo):
    try:
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
                
                # Filter to extract patient medical photographs (JPEGs > 20KB)
                if image_ext.lower() in ["jpg", "jpeg"] and len(image_bytes) > 20000:
                    img_count += 1
                    out_name = f"{codigo}_img0{img_count}.{image_ext}"
                    out_path = os.path.join(output_img_dir, out_name)
                    with open(out_path, "wb") as f:
                        f.write(image_bytes)
                    extracted_imgs.append(out_name)
        return extracted_imgs
    except Exception as e:
        print(f"Error extracting images for {pdf_path}: {e}")
        return []

def main():
    pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]
    pdf_files.sort()
    
    results = []
    
    print(f"Total PDFs found: {len(pdf_files)}")
    
    for idx, filename in enumerate(pdf_files, 1):
        pdf_path = os.path.join(pdf_dir, filename)
        print(f"[{idx}/{len(pdf_files)}] Processing {filename}...")
        
        data = parse_pdf(pdf_path)
        if data:
            imgs = extract_images(pdf_path, data["codigo"])
            data["imagenes"] = imgs
            results.append(data)
            
    # Write to CSV
    if results:
        fieldnames = ["codigo", "nombre", "edad", "sexo", "fecha_recepcion", "fecha_informe", "indicacion", "macro", "micro", "diagnostico", "imagenes"]
        with open(output_csv, "w", newline="", encoding="utf-8-sig") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for row in results:
                # Convert list of images to string
                row_copy = row.copy()
                row_copy["imagenes"] = ", ".join(row_copy["imagenes"])
                writer.writerow(row_copy)
                
        # Write to JSON
        with open(output_json, "w", encoding="utf-8") as jsonfile:
            json.dump(results, jsonfile, indent=2, ensure_ascii=False)
            
        print("Batch processing completed successfully!")
        print(f"CSV written to: {output_csv}")
        print(f"JSON written to: {output_json}")
    else:
        print("No results processed.")

if __name__ == "__main__":
    main()
