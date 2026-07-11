import pandas as pd
import json
import math

file_path = r"C:\Users\HP\Desktop\Servicio.xls"
output_path = r"C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES\pacientes_migrados.js"

print("Leyendo tabla HTML desde Excel...")
try:
    dfs = pd.read_html(file_path)
    df = dfs[0]
    
    # Limpiar columnas
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[1] if col[1] else col[0] for col in df.columns]
        
    df_cerrados = df[df['ESTADO ATENCION'] == 'CERRADO']
    
    pacientes = []
    
    def clean_nan(val, default=""):
        if pd.isna(val) or val == 'nan':
            return default
        return str(val).strip()
        
    def clean_num(val, default=0):
        if pd.isna(val) or val == 'nan':
            return default
        try:
            return float(val)
        except:
            return default

    for idx, row in df_cerrados.iterrows():
        raw_paciente = clean_nan(row.get('PACIENTE', ''))
        nombres = ""
        apellidos = ""
        if "," in raw_paciente:
            parts = raw_paciente.split(",", 1)
            nombres = parts[0].strip()
            apellidos = parts[1].strip()
        else:
            nombres = raw_paciente
            
        costo = clean_num(row.get('COSTO TOTAL', 0))
        adelanto = clean_num(row.get('ADELANTO', 0))
        resta = costo - adelanto
        
        casetes = clean_num(row.get('# OBJETO', 1))
        
        p = {
            "service": clean_nan(row.get('TIPO SERVICIO', '')),
            "cod_atencion": clean_nan(row.get('COD-ATENCION', '')),
            "dni": clean_nan(row.get('DNI', '0')) or '0',
            "med_solicitante": clean_nan(row.get('DOCTOR PACIENTE', '')),
            "nombres": nombres,
            "apellidos": apellidos,
            "paciente": f"{nombres} {apellidos}".strip(),
            "costo": costo,
            "adelanto": adelanto,
            "resta": resta,
            "fec_registro": clean_nan(row.get('FEC. RECEPCION', '')),
            "fec_entrega": clean_nan(row.get('FEC. ENTREGA', '')),
            "pagado": True if resta <= 0 else False,
            "atrasado": False,
            "especimen": clean_nan(row.get('INDICACION', '')),
            "macro_desc": clean_nan(row.get('MACROSCOPICA', '')),
            "micro_desc": clean_nan(row.get('MICROSCOPICA', '')),
            "diagnostico": clean_nan(row.get('COMENTARIO', '')), # A veces se guarda en comentario
            "img01": "",
            "img02": "",
            "edad": 0,
            "sexo": "FEMENINO" if "GINECO" in str(row.get('TIPO SERVICIO', '')) or "PAPA" in str(row.get('TIPO SERVICIO', '')) else "MASCULINO",
            "casetes": int(casetes),
            "f_contacto": "0",
            "tel_contacto": "0",
            "doctor": clean_nan(row.get('DOCTOR FIRMA', '')),
            "motivo_estudio": "",
            "cat_macro": clean_nan(row.get('PLANTILLA MACROSCOPICA', '')),
            "plan_macro": clean_nan(row.get('PLANTILLA MACROSCOPICA', '')),
            "cat_micro": clean_nan(row.get('PLANTILLA MICROSCOPICA', '')),
            "plan_micro": clean_nan(row.get('PLANTILLA MICROSCOPICA', ''))
        }
        pacientes.append(p)
        
    js_content = f"window.pacientesMigrados = {json.dumps(pacientes, indent=4, ensure_ascii=False)};"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Éxito: Se generó el archivo de pacientes con {len(pacientes)} registros extraídos.")
    
except Exception as e:
    print("Error:", e)
