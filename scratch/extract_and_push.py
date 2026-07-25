import os
import re
import fitz
import base64
import json
import time
import urllib.request
from urllib.error import HTTPError

def clean_spelling_clinical(text):
    if not text:
        return ""
    # Capitalizar nombres propios
    text = re.sub(r'\bbethesda\b', 'Bethesda', text, flags=re.IGNORECASE)
    text = re.sub(r'\bpapanicolaou\b', 'Papanicolaou', text, flags=re.IGNORECASE)
    text = re.sub(r'\blester\b', 'Lester', text, flags=re.IGNORECASE)
    text = re.sub(r'\bsusan\b', 'Susan', text, flags=re.IGNORECASE)
    
    # Corrección de acentos en términos comunes
    replacements = {
        r'\bmacroscopia\b': 'macroscopía',
        r'\bmicroscopia\b': 'microscopía',
        r'\bdiagnostico\b': 'diagnóstico',
        r'\bpatologia\b': 'patología',
        r'\bopterigión\b': 'pterigión',
        r'\bpterigion\b': 'pterigión',
        r'\bcolecistitis\b': 'colecistitis',
        r'\bcrónica\b': 'crónica',
        r'\bcronica\b': 'crónica',
        r'\baguda\b': 'aguda',
        r'\bquirúrgico\b': 'quirúrgico',
        r'\bquirurgico\b': 'quirúrgico',
        r'\bquirúrgica\b': 'quirúrgica',
        r'\bquirurgica\b': 'quirúrgica',
        r'\bvesícula\b': 'vesícula',
        r'\bvesicula\b': 'vesícula',
        r'\bhiperplasia\b': 'hiperplasia',
        r'\bneoplasia\b': 'neoplasia',
        r'\bcarcinoma\b': 'carcinoma',
    }
    for k, v in replacements.items():
        text = re.sub(k, v, text, flags=re.IGNORECASE)
    return text

def validate_date(date_str):
    if not date_str:
        return None
    # Verificar formato estricto YYYY-MM-DD
    if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
        return date_str
    return None

def parse_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = "\n".join([page.get_text() for page in doc])
    
    # 1. Code
    filename = os.path.basename(pdf_path)
    code_match = re.search(r'(\d{2}Q-\d+)', filename)
    if not code_match:
        code_match = re.search(r'(\d{2}Q-\d+)', full_text)
    code = code_match.group(1).upper() if code_match else "UNKNOWN"
    
    # 2. Patient Name
    name_match = re.search(r'APELLIDOS\s+Y\s+NOMBRES\s*:\s*(.*)', full_text, re.IGNORECASE)
    paciente = name_match.group(1).strip() if name_match else ""
    paciente = re.split(r'\b\d{2}Q-\d+\b', paciente)[0].strip()
    
    nombres = ""
    apellidos = ""
    if paciente:
        if "," in paciente:
            parts = paciente.split(",")
            apellidos = parts[0].strip()
            nombres = parts[1].strip()
        else:
            words = paciente.split()
            if len(words) >= 3:
                nombres = words[0]
                apellidos = " ".join(words[1:])
            elif len(words) == 2:
                nombres = words[0]
                apellidos = words[1]
            else:
                nombres = paciente
                apellidos = ""
                
    # 3. Age
    age_match = re.search(r'EDAD\s*:\s*(\d+)', full_text, re.IGNORECASE)
    edad = int(age_match.group(1)) if age_match else 0
    
    # 4. Sex
    sex_match = re.search(r'SEXO\s*:\s*(\w+)', full_text, re.IGNORECASE)
    sexo = sex_match.group(1).strip().upper() if sex_match else "MASCULINO"
    if "FEM" in sexo or "FÉM" in sexo:
        sexo = "FEMENINO"
    else:
        sexo = "MASCULINO"
        
    # 5. Dates
    date_rec = None
    date_rec_match = re.search(r'FECHA\s+DE\s+RECEPCI[ÓO]N?\s*:\s*([\d/\-]+)', full_text, re.IGNORECASE)
    if date_rec_match:
        raw_date = date_rec_match.group(1).strip()
        parts = re.split(r'[/]', raw_date)
        if len(parts) == 3:
            date_rec = f"{parts[2]}-{parts[1]}-{parts[0]}"
    date_rec = validate_date(date_rec)
            
    date_inf = None
    date_inf_match = re.search(r'FECHA\s+DE\s+INFORME\s*:\s*([\d/\-]+)', full_text, re.IGNORECASE)
    if date_inf_match:
        raw_date = date_inf_match.group(1).strip()
        parts = re.split(r'[/]', raw_date)
        if len(parts) == 3:
            date_inf = f"{parts[2]}-{parts[1]}-{parts[0]}"
    date_inf = validate_date(date_inf)
            
    # 6. Requesting Doctor (med_solicitante)
    doc_match = re.search(r'INDICACI[ÓO]N?\s*:\s*(.*)', full_text, re.IGNORECASE)
    med_solicitante = doc_match.group(1).strip() if doc_match else ""
    med_solicitante = re.split(r'\b\d{2}Q-\d+\b', med_solicitante)[0].strip()
    
    # 7. Macro
    macro = ""
    macro_match = re.search(r'DATOS\s+MACROSCOPIC[AO]\s*\n+(.*?)\n+DATOS\s+MICROSCOPIA', full_text, re.DOTALL | re.IGNORECASE)
    if macro_match:
        macro = macro_match.group(1).strip()
        
    # 8. Micro
    micro = ""
    micro_match = re.search(r'DATOS\s+MICROSCOPIA\s*\n+(.*?)\n+DIAGN[ÓO]STICO', full_text, re.DOTALL | re.IGNORECASE)
    if micro_match:
        micro = micro_match.group(1).strip()
        
    # 9. Diagnostico
    diagnostico = ""
    diag_match = re.search(r'DIAGN[ÓO]STICO\s+HISTOLOGICO\s*:\s*\n*(.*)', full_text, re.DOTALL | re.IGNORECASE)
    if diag_match:
        diagnostico = diag_match.group(1).strip()
        
    # Limpieza de firmas y números de página
    diag_lines = []
    for line in diagnostico.split("\n"):
        line_clean = line.strip()
        if not line_clean:
            continue
        if re.search(r'p\u00e1gina \d+ de \d+', line_clean, re.IGNORECASE) or re.search(r'pagina \d+ de \d+', line_clean, re.IGNORECASE):
            continue
        if re.search(r'APELLIDOS\s+Y\s+NOMBRES', line_clean, re.IGNORECASE):
            continue
        if re.search(r'EDAD\s*:', line_clean, re.IGNORECASE):
            continue
        if re.search(r'SEXO\s*:', line_clean, re.IGNORECASE):
            continue
        if re.search(r'FECHA\s+DE\s+', line_clean, re.IGNORECASE):
            continue
        if re.search(r'INDICACI\u00d3N\s*:', line_clean, re.IGNORECASE) or re.search(r'INDICACI\u00d3\s*:', line_clean, re.IGNORECASE):
            continue
        if code in line_clean:
            continue
        if paciente and paciente.lower() in line_clean.lower():
            continue
        diag_lines.append(line_clean)
    diagnostico = "\n".join(diag_lines)
    
    macro = clean_spelling_clinical(macro)
    micro = clean_spelling_clinical(micro)
    diagnostico = clean_spelling_clinical(diagnostico)
    
    # Especimen
    especimen = ""
    if diagnostico:
        first_line = diagnostico.split("\n")[0].strip()
        if ":" in first_line or "(" in first_line or "PIEZA" in first_line:
            especimen = first_line.replace(":", "").strip()
            
    # Extract clinical photos
    images = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)
        for img in image_list:
            xref = img[0]
            base_image = doc.extract_image(xref)
            width = base_image["width"]
            height = base_image["height"]
            aspect_ratio = width / height if height > 0 else 0
            if width >= 300 and height >= 300 and 0.6 <= aspect_ratio <= 1.6:
                image_bytes = base_image["image"]
                ext = base_image["ext"]
                b64 = "data:image/" + ext + ";base64," + base64.b64encode(image_bytes).decode('utf-8')
                images.append(b64)
                
    img01 = images[0] if len(images) > 0 else ""
    img02 = images[1] if len(images) > 1 else ""
    
    return {
        "service": "Q",
        "cod_atencion": code,
        "nombres": nombres,
        "apellidos": apellidos,
        "paciente": paciente,
        "edad": edad,
        "sexo": sexo,
        "fec_registro": date_rec,
        "fec_entrega": date_inf,
        "med_solicitante": med_solicitante,
        "especimen": especimen,
        "macro_desc": macro,
        "micro_desc": micro,
        "diagnostico": diagnostico,
        "img01": img01,
        "img02": img02
    }

def push_to_supabase(patient_data):
    # Añadido ?on_conflict=cod_atencion para resolver conflictos de duplicación (upsert)
    url = "https://yyylfrnynlgwaxxocixa.supabase.co/rest/v1/pacientes?on_conflict=cod_atencion"
    headers = {
        "apikey": "sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
        "Authorization": "Bearer sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    req = urllib.request.Request(url, data=json.dumps([patient_data]).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req) as resp:
        return resp.status

def run_extraction_and_push():
    folders = [
        r"C:\Users\DELL\Downloads\QUIRURGICOS 2024",
        r"C:\Users\DELL\Downloads\QUIRURGICOS 2025"
    ]
    
    all_pdfs = []
    for folder in folders:
        if os.path.exists(folder):
            for file in os.listdir(folder):
                if file.endswith(".pdf"):
                    all_pdfs.append(os.path.join(folder, file))
                    
    total_files = len(all_pdfs)
    print(f"Se encontraron {total_files} archivos PDF a procesar con estrategia UPSERT.")
    
    success_count = 0
    error_count = 0
    
    for idx, pdf_path in enumerate(all_pdfs):
        filename = os.path.basename(pdf_path)
        try:
            # Parse
            pat = parse_pdf(pdf_path)
            if pat["cod_atencion"] == "UNKNOWN":
                print(f"[{idx+1}/{total_files}] Omitido (Código no encontrado en {filename})")
                continue
                
            # Push (upsert)
            status = push_to_supabase(pat)
            if status in [200, 201, 204]:
                success_count += 1
                has_photos = "Con fotos" if (pat["img01"] or pat["img02"]) else "Sin fotos"
                print(f"[{idx+1}/{total_files}] Éxito (Upsert): {pat['cod_atencion']} - {pat['paciente']} ({has_photos})")
            else:
                error_count += 1
                print(f"[{idx+1}/{total_files}] Error HTTP {status} al guardar {pat['cod_atencion']}")
                
        except Exception as e:
            error_count += 1
            print(f"[{idx+1}/{total_files}] ERROR procesando {filename}: {e}")
            
        # Pequeño retraso para no saturar el servidor
        time.sleep(0.05)
        
    print("\n=== RESUMEN DE MIGRACIÓN (CON UPSERT) ===")
    print(f"Procesados con éxito: {success_count}")
    print(f"Errores encontrados:   {error_count}")
    print("============================")

if __name__ == "__main__":
    run_extraction_and_push()
