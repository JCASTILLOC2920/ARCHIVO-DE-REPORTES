# -*- coding: utf-8 -*-
"""
diagnostico_clinica_mujer.py
Diagnóstico exhaustivo de las atenciones 26Q-295 y 26Q-296
y comparación del campo 'procedencia' / 'clinica' con otros casos
de 'Clinica la Mujer'.
"""

import os
import sys
import json
import csv
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter

# Forzar salida en UTF-8 en consola de Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

WORKSPACE = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES"
TARGET_CODES = ["26Q-295", "26Q-296"]

print("=" * 85)
print("AUDITORÍA FORENSE DE RESPALDOS: CASOS 26Q-295 Y 26Q-296 (CLÍNICA LA MUJER)")
print("=" * 85)

# Helper para extraer celdas de XLSX
def parse_xlsx(xlsx_path):
    rows_data = []
    try:
        with zipfile.ZipFile(xlsx_path, 'r') as z:
            shared_strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                ss_tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
                for si in ss_tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                    t_nodes = si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                    shared_strings.append("".join(t.text or "" for t in t_nodes))
            
            sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
            sheet_data = sheet_tree.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData')
            
            for row in sheet_data.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                r_num = int(row.attrib.get('r', 0))
                cols = {}
                for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    r_ref = c.attrib.get('r', '')
                    col_letter = "".join(filter(str.isalpha, r_ref))
                    t_attr = c.attrib.get('t', '')
                    v_elem = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    val = v_elem.text if v_elem is not None else ""
                    if t_attr == 's' and val.isdigit():
                        idx = int(val)
                        val = shared_strings[idx] if idx < len(shared_strings) else val
                    cols[col_letter] = val
                
                if cols:
                    def col_to_num(col_str):
                        num = 0
                        for char in col_str:
                            num = num * 26 + (ord(char.upper()) - ord('A')) + 1
                        return num
                    max_col = max(col_to_num(c) for c in cols.keys())
                    row_list = [""] * max_col
                    for c_letter, c_val in cols.items():
                        row_list[col_to_num(c_letter) - 1] = c_val
                    rows_data.append((r_num, row_list))
    except Exception as e:
        print(f"[!] Error leyendo XLSX: {e}")
    return rows_data

# =========================================================================
# 1. BÚSQUEDA EN RESPALDO_MAESTRO_PACIENTES.csv
# =========================================================================
csv_path = os.path.join(WORKSPACE, "_RESPALDOS_DE_SEGURIDAD", "RESPALDO_MAESTRO_PACIENTES.csv")
print(f"\n1. INSPECCIÓN EN CSV ({os.path.basename(csv_path)}):")
csv_targets = {}
csv_all_mujer = []

if os.path.exists(csv_path):
    with open(csv_path, mode='r', encoding='utf-8-sig', errors='replace') as f:
        reader = csv.reader(f)
        headers = next(reader)
        col_map = {h.strip(): idx for idx, h in enumerate(headers)}
        
        idx_cod = col_map.get("Código de Atención")
        idx_pac = col_map.get("Paciente (Nombre Completo)")
        idx_cli = col_map.get("Clínica / Sede")
        idx_med = col_map.get("Médico Solicitante")
        idx_fec = col_map.get("Fecha Registro")
        idx_est = col_map.get("Estado del Informe")
        idx_fir = col_map.get("Firmado")
        idx_esp = col_map.get("Espécimen / Muestra")

        for r_num, row in enumerate(reader, start=2):
            if not row:
                continue
            cod = row[idx_cod].strip() if idx_cod is not None and idx_cod < len(row) else ""
            cli = row[idx_cli].strip() if idx_cli is not None and idx_cli < len(row) else ""
            med = row[idx_med].strip() if idx_med is not None and idx_med < len(row) else ""
            
            if "MUJER" in cli.upper() or "MARREROS" in med.upper() or "LLOCLLA" in med.upper():
                csv_all_mujer.append({
                    "fila": r_num, "codigo": cod, "clinica": cli, "medico": med,
                    "estado": row[idx_est] if idx_est is not None and idx_est < len(row) else "",
                    "firmado": row[idx_fir] if idx_fir is not None and idx_fir < len(row) else ""
                })
            
            for t in TARGET_CODES:
                if t == cod or t in cod:
                    csv_targets[t] = {
                        "fila": r_num,
                        "codigo": cod,
                        "paciente": row[idx_pac] if idx_pac is not None and idx_pac < len(row) else "",
                        "clinica": cli,
                        "medico": med,
                        "fec_registro": row[idx_fec] if idx_fec is not None and idx_fec < len(row) else "",
                        "estado": row[idx_est] if idx_est is not None and idx_est < len(row) else "",
                        "firmado": row[idx_fir] if idx_fir is not None and idx_fir < len(row) else "",
                        "especimen": row[idx_esp] if idx_esp is not None and idx_esp < len(row) else ""
                    }

    for t in TARGET_CODES:
        if t in csv_targets:
            c = csv_targets[t]
            print(f"  [ENCONTRADO] Código: {c['codigo']} (Fila CSV: {c['fila']})")
            print(f"    - Paciente:       {c['paciente']}")
            print(f"    - Clínica / Sede: {repr(c['clinica'])}")
            print(f"    - Médico:         {repr(c['medico'])}")
            print(f"    - Fecha Reg.:     {c['fec_registro']}")
            print(f"    - Estado Informe: {c['estado']} | Firmado: {c['firmado']}")
            print(f"    - Espécimen:      {c['especimen']}")
        else:
            print(f"  [NO ENCONTRADO] {t} en CSV")
    print(f"  -> Total de registros con procedencia 'MUJER' o Dr. Marreros en CSV: {len(csv_all_mujer)}")
else:
    print("  [!] Archivo CSV no encontrado.")

# =========================================================================
# 2. BÚSQUEDA EN RESPALDO_MAESTRO_PACIENTES.xlsx
# =========================================================================
xlsx_path = os.path.join(WORKSPACE, "_RESPALDOS_DE_SEGURIDAD", "RESPALDO_MAESTRO_PACIENTES.xlsx")
print(f"\n2. INSPECCIÓN EN EXCEL ({os.path.basename(xlsx_path)}):")
xlsx_targets = {}
xlsx_all_mujer = []

if os.path.exists(xlsx_path):
    xlsx_rows = parse_xlsx(xlsx_path)
    header_row = None
    data_rows = []
    
    # Fila 4 contiene las cabeceras reales de la tabla
    for r_num, r_cells in xlsx_rows:
        if any("Código de Atención" in str(c) for c in r_cells):
            header_row = (r_num, r_cells)
            continue
        if header_row and r_num > header_row[0]:
            data_rows.append((r_num, r_cells))
            
    if header_row:
        x_headers = [str(c).strip() for c in header_row[1]]
        x_map = {h: idx for idx, h in enumerate(x_headers)}
        xcod = x_map.get("Código de Atención")
        xpac = x_map.get("Paciente (Nombre Completo)")
        xcli = x_map.get("Clínica / Sede")
        xmed = x_map.get("Médico Solicitante")
        xfec = x_map.get("Fecha Registro")
        xest = x_map.get("Estado del Informe")
        xfir = x_map.get("Firmado")
        xesp = x_map.get("Espécimen / Muestra")

        for r_num, row in data_rows:
            cod = row[xcod].strip() if xcod is not None and xcod < len(row) else ""
            cli = row[xcli].strip() if xcli is not None and xcli < len(row) else ""
            med = row[xmed].strip() if xmed is not None and xmed < len(row) else ""
            
            if "MUJER" in cli.upper() or "MARREROS" in med.upper() or "LLOCLLA" in med.upper():
                xlsx_all_mujer.append({
                    "fila": r_num, "codigo": cod, "clinica": cli, "medico": med
                })
            
            for t in TARGET_CODES:
                if t == cod or t in cod:
                    xlsx_targets[t] = {
                        "fila": r_num,
                        "codigo": cod,
                        "paciente": row[xpac] if xpac is not None and xpac < len(row) else "",
                        "clinica": cli,
                        "medico": med,
                        "fec_registro": row[xfec] if xfec is not None and xfec < len(row) else "",
                        "estado": row[xest] if xest is not None and xest < len(row) else "",
                        "firmado": row[xfir] if xfir is not None and xfir < len(row) else "",
                        "especimen": row[xesp] if xesp is not None and xesp < len(row) else ""
                    }

        for t in TARGET_CODES:
            if t in xlsx_targets:
                c = xlsx_targets[t]
                print(f"  [ENCONTRADO] Código: {c['codigo']} (Fila Excel: {c['fila']})")
                print(f"    - Paciente:       {c['paciente']}")
                print(f"    - Clínica / Sede: {repr(c['clinica'])}")
                print(f"    - Médico:         {repr(c['medico'])}")
                print(f"    - Fecha Reg.:     {c['fec_registro']}")
                print(f"    - Estado Informe: {c['estado']} | Firmado: {c['firmado']}")
            else:
                print(f"  [NO ENCONTRADO] {t} en Excel")
        print(f"  -> Total de registros con procedencia 'MUJER' o Dr. Marreros en Excel: {len(xlsx_all_mujer)}")
    else:
        print("  [!] No se pudo localizar la cabecera en el Excel.")
else:
    print("  [!] Archivo Excel no encontrado.")

# =========================================================================
# 3. BÚSQUEDA EN real_supabase_backup.js
# =========================================================================
js_path = os.path.join(WORKSPACE, "real_supabase_backup.js")
print(f"\n3. INSPECCIÓN EN JAVASCRIPT ({os.path.basename(js_path)}):")
js_targets = {}
js_all_mujer = []

if os.path.exists(js_path):
    with open(js_path, mode='r', encoding='utf-8', errors='replace') as f:
        content = f.read()
        b_start = content.find('[')
        b_end = content.rfind(']')
        if b_start != -1 and b_end != -1:
            patients = json.loads(content[b_start:b_end + 1])
            print(f"  Total expedientes en backup JS: {len(patients)}")
            for p in patients:
                cod = str(p.get("codAtencion") or "").strip()
                cli = str(p.get("clinica") or "").strip()
                med = str(p.get("medSolicitante") or "").strip()
                
                if "MUJER" in cli.upper() or "MARREROS" in med.upper() or "LLOCLLA" in med.upper():
                    js_all_mujer.append(p)
                
                for t in TARGET_CODES:
                    if t == cod:
                        js_targets[t] = p

    for t in TARGET_CODES:
        if t in js_targets:
            p = js_targets[t]
            print(f"  [ENCONTRADO] Código: {p.get('codAtencion')} (Supabase ID: {p.get('id')})")
            print(f"    - Paciente:       {p.get('paciente')}")
            print(f"    - DNI:            {p.get('dni')}")
            print(f"    - Clínica:        {repr(p.get('clinica'))}")
            print(f"    - Médico:         {repr(p.get('medSolicitante'))}")
            print(f"    - Fecha Reg.:     {p.get('fecRegistro')} | Entrega: {p.get('fecEntrega')}")
            print(f"    - Estado:         {repr(p.get('estado'))}")
            print(f"    - Firmado:        {p.get('firmado')} | Modificado: {p.get('modificado')}")
            print(f"    - Espécimen:      {repr(p.get('especimen'))}")
            print(f"    - Diagnóstico:    {repr(p.get('diagnostico'))}")
        else:
            print(f"  [NO ENCONTRADO] {t} en real_supabase_backup.js")
    print(f"  -> Total de registros con procedencia 'MUJER' o Dr. Marreros en JS: {len(js_all_mujer)}")
else:
    print("  [!] Archivo real_supabase_backup.js no encontrado.")

# =========================================================================
# 4. COMPARACIÓN Y ANÁLISIS DE DISCREPANCIAS TIPOGRÁFICAS
# =========================================================================
print("\n" + "=" * 85)
print("4. COMPARACIÓN TIPOGRÁFICA Y FORENSE DE PROCEDENCIA ('clinica')")
print("=" * 85)

# Analizar todas las variantes exactas de 'clinica' en js_all_mujer
clinica_counter = Counter()
medico_counter = Counter()
other_cases = [p for p in js_all_mujer if str(p.get("codAtencion")) not in TARGET_CODES]

for p in other_cases:
    clinica_counter[str(p.get("clinica"))] += 1
    medico_counter[str(p.get("medSolicitante"))] += 1

print("\nA) Variaciones de la cadena 'clinica' en los 187 otros casos existentes:")
for val, count in clinica_counter.items():
    raw_bytes = list(val.encode('utf-8'))
    print(f"   * Cadena: {repr(val)}")
    print(f"     - Longitud de caracteres: {len(val)}")
    print(f"     - Bytes UTF-8: {raw_bytes}")
    print(f"     - Frecuencia: {count} registros")
    # Chequeos de normalización
    has_tilde_i = "Í" in val or "í" in val
    has_de = " DE " in val.upper()
    has_extra_spaces = "  " in val or val != val.strip()
    print(f"     - Contiene tilde ('Í'): {has_tilde_i}")
    print(f"     - Contiene preposición 'DE': {has_de}")
    print(f"     - Espacios extras o borde: {has_extra_spaces}")

print("\nB) Inspección exacta de 'clinica' en los casos 26Q-295 y 26Q-296:")
for t in TARGET_CODES:
    if t in js_targets:
        val = str(js_targets[t].get("clinica"))
        raw_bytes = list(val.encode('utf-8'))
        print(f"   * Caso {t}:")
        print(f"     - Cadena exacta: {repr(val)}")
        print(f"     - Longitud: {len(val)}")
        print(f"     - Bytes UTF-8: {raw_bytes}")
        print(f"     - ¿Es 100% idéntico a los otros 187 casos?: {val == 'CLINICA LA MUJER' and raw_bytes == [67, 76, 73, 78, 73, 67, 65, 32, 76, 65, 32, 77, 85, 74, 69, 82]}")

print("\nC) Inspección del médico solicitante:")
for t in TARGET_CODES:
    if t in js_targets:
        m = js_targets[t].get("medSolicitante")
        print(f"   * Caso {t}: medSolicitante = {repr(m)}")

print("\nD) Análisis de visibilidad en el Sistema (RBAC y Filtros UI):")
# Verificar cómo se comportan las funciones de filtrado en ui_tables.js
for t in TARGET_CODES:
    if t in js_targets:
        p = js_targets[t]
        c_norm = p.get("clinica", "").lower()
        m_norm = p.get("medSolicitante", "").lower()
        
        # Regla RBAC para 'mujersegura':
        # itemClinica.includes('mujer') || itemClinica.includes('mujersegura') || itemMed.includes('marreros') || itemMed.includes('lloclla')
        rbac_match_clinica = "mujer" in c_norm
        rbac_match_med = "marreros" in m_norm or "lloclla" in m_norm
        
        # Filtros de píldoras SLA
        is_firmado = p.get("firmado") is True
        is_completado = p.get("estado") in ["Completado", "Listo"]
        is_modificado = p.get("modificado") is True
        
        visible_in_all = True
        visible_in_listos = is_firmado or is_completado
        visible_in_proceso = is_modificado and not visible_in_listos
        visible_in_urgentes = not visible_in_listos and not is_modificado
        
        print(f"\n   Evaluación de visibilidad para {t}:")
        print(f"     - RBAC (Filtro por cuenta 'mujersegura'):")
        print(f"         * Coincide por clínica ('mujer' in clinica): {rbac_match_clinica}")
        print(f"         * Coincide por médico ('marreros' / 'lloclla'): {rbac_match_med}")
        print(f"         * Acceso concedido al portal institucional: {rbac_match_clinica or rbac_match_med}")
        print(f"     - Estado clínico:")
        print(f"         * estado = {repr(p.get('estado'))}")
        print(f"         * firmado = {p.get('firmado')}")
        print(f"         * modificado = {p.get('modificado')}")
        print(f"         * diagnostico = {repr(p.get('diagnostico'))}")
        print(f"     - Visibilidad por pestaña / píldora en reportes.html:")
        print(f"         * Píldora 'TODOS' (all):        {'SÍ' if visible_in_all else 'NO'}")
        print(f"         * Píldora 'LISTOS' (listos):    {'SÍ' if visible_in_listos else 'NO (Aparece como NO disponible / pendiente)'}")
        print(f"         * Píldora 'EN PROCESO':         {'SÍ' if visible_in_proceso else 'NO'}")
        print(f"         * Píldora 'URGENTES / PEND':    {'SÍ' if visible_in_urgentes else 'NO (Está clasificado en Pendientes)'}")

print("\n" + "=" * 85)
print("FIN DEL DIAGNÓSTICO")
print("=" * 85)
