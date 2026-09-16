# auto_master_backup.py
# PROTOCOLO ACTOR-CRITICO: Generador Automático del Archivo Maestro de Contingencia
# y Auto-Busting de Caché para Service Worker / PWA
import urllib.request, urllib.parse, json, os, time, datetime, re

SUPABASE_URL = 'https://yyylfrnynlgwaxxocixa.supabase.co'
SUPABASE_KEY = 'sb_publishable_Xlrt1FyJMNxL-XIap15MOA_YOkDe4dK'

def fetch_all_supabase_patients():
    all_patients = []
    batch_size = 1000
    from_row = 0
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    print('[AutoMaster] Conectando a Supabase para extraer pacientes...')
    last_id = 0
    light_cols = 'id,service,cod_atencion,dni,med_solicitante,nombres,apellidos,paciente,costo,adelanto,resta,fec_registro,fec_entrega,pagado,atrasado,especimen,macro_desc,micro_desc,diagnostico,edad,sexo,casetes,f_contacto,tel_contacto,doctor,motivo_estudio,cat_macro,plan_macro,cat_micro,plan_micro,created_at'
    encoded_cols = urllib.parse.quote(light_cols)
    
    while True:
        url = f'{SUPABASE_URL}/rest/v1/pacientes?select={encoded_cols}&order=id.asc&id=gt.{last_id}&limit={batch_size}'
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if not data:
                    break
                all_patients.extend(data)
                last_id = data[-1]['id']
                print(f'[AutoMaster] Lote descargado: {len(data)} registros (Total: {len(all_patients)})')
                if len(data) < batch_size:
                    break
        except Exception as e:
            print('[AutoMaster] Error consultando Supabase:', e)
            break
            
    return all_patients

def infer_clinica(p_obj):
    raw_c = (p_obj.get('clinica') or '').strip()
    if raw_c and raw_c.lower() != 'sin clinica':
        return raw_c
    med = (p_obj.get('med_solicitante') or '').lower()
    esp = (p_obj.get('especimen') or '').lower()
    mot = (p_obj.get('motivo_estudio') or '').lower()
    if any(k in med or k in esp or k in mot for k in ['marreros', 'lloclla', 'mujer']):
        return 'CLINICA LA MUJER'
    if any(k in med or k in esp or k in mot for k in ['escalante', 'clemente']):
        return 'CLÍNICA SAN CLEMENTE'
    if any(k in med or k in esp or k in mot for k in ['saire', 'bocangel', 'alfa', 'prevenir']):
        return 'CLÍNICA ALFA PREVENIR'
    if any(k in med for k in ['sanchez', 'becerra', 'ulfe', 'carrion', 'vilca', 'munante', 'arzapalo', 'flores', 'sierra', 'chungui']):
        return 'CLÍNICA CARRIÓN'
    return ''

def format_camel_case(p):
    return {
        'id': p.get('id'),
        'service': p.get('service') or 'Q',
        'codAtencion': p.get('cod_atencion'),
        'dni': p.get('dni') or '',
        'medSolicitante': p.get('med_solicitante') or '',
        'nombres': p.get('nombres') or '',
        'apellidos': p.get('apellidos') or '',
        'paciente': p.get('paciente') or '',
        'costo': float(p.get('costo') or 0),
        'adelanto': float(p.get('adelanto') or 0),
        'resta': float(p.get('resta') or 0),
        'fecRegistro': p.get('fec_registro') or '',
        'fecEntrega': p.get('fec_entrega') or '',
        'pagado': bool(p.get('pagado')),
        'atrasado': bool(p.get('atrasado')),
        'especimen': p.get('especimen') or '',
        'macroDesc': p.get('macro_desc') or '',
        'microDesc': p.get('micro_desc') or '',
        'diagnostico': p.get('diagnostico') or '',
        'img01': p.get('img01') or None,
        'img02': p.get('img02') or None,
        'edad': p.get('edad'),
        'sexo': p.get('sexo') or '',
        'casetes': p.get('casetes') or 1,
        'fContacto': p.get('f_contacto') or '',
        'telContacto': p.get('tel_contacto') or '',
        'doctor': p.get('doctor') or 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
        'motivoEstudio': p.get('motivo_estudio') or '',
        'catMacro': p.get('cat_macro') or '',
        'planMacro': p.get('plan_macro') or '',
        'catMicro': p.get('cat_micro') or '',
        'planMicro': p.get('plan_micro') or '',
        'clinica': infer_clinica(p),
        'firmado': bool(p.get('diagnostico')),
        'modificado': bool(p.get('macro_desc') or p.get('micro_desc')),
        'estado': 'Completado' if p.get('diagnostico') else ('En Proceso' if (p.get('macro_desc') or p.get('micro_desc')) else 'Pendiente')
    }

def update_real_supabase_backup_file(patients):
    if not patients:
        print('[AutoMaster] No hay pacientes para escribir.')
        return False
    formatted = [format_camel_case(p) for p in patients]
    content = 'window.REAL_SUPABASE_PATIENTS = ' + json.dumps(formatted, indent=2, ensure_ascii=False) + ';\n'
    
    backup_path = 'real_supabase_backup.js'
    temp_path = 'real_supabase_backup.tmp.js'
    
    with open(temp_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    if os.path.exists(backup_path):
        os.replace(temp_path, backup_path)
    else:
        os.rename(temp_path, backup_path)
        
    print(f'[AutoMaster] Archivo {backup_path} actualizado con éxito ({len(formatted)} registros).')
    return True

def bump_pwa_cache_version():
    timestamp = datetime.datetime.now().strftime("%m%d_%H%M")
    new_ver = f"v601.{timestamp}"
    print(f"[AutoMaster] Aplicando auto-busting de caché PWA a versión {new_ver}...")
    
    # 1. Update sw.js
    if os.path.exists("sw.js"):
        with open("sw.js", "r", encoding="utf-8") as f:
            sw_code = f.read()
        sw_code = re.sub(r"const CACHE_NAME = 'jc-pathlab-medical-[^']+';", f"const CACHE_NAME = 'jc-pathlab-medical-{new_ver}';", sw_code)
        with open("sw.js", "w", encoding="utf-8") as f:
            f.write(sw_code)
            
    # 2. Update pwa_init.js
    if os.path.exists("pwa_init.js"):
        with open("pwa_init.js", "r", encoding="utf-8") as f:
            pwa_code = f.read()
        pwa_code = re.sub(r"register\('sw\.js\?v=[^']+'", f"register('sw.js?v={new_ver}'", pwa_code)
        with open("pwa_init.js", "w", encoding="utf-8") as f:
            f.write(pwa_code)
            
    # 3. Update reportes.html
    if os.path.exists("reportes.html"):
        with open("reportes.html", "r", encoding="utf-8") as f:
            html_code = f.read()
        html_code = re.sub(r'real_supabase_backup\.js\?v=[^"]+', f'real_supabase_backup.js?v={new_ver}', html_code)
        html_code = re.sub(r'main\.js\?v=[^"]+', f'main.js?v={new_ver}', html_code)
        with open("reportes.html", "w", encoding="utf-8") as f:
            f.write(html_code)
            
    print(f"[AutoMaster] Versión {new_ver} propagada a sw.js, pwa_init.js y reportes.html.")

def execute_auto_sync():
    pts = fetch_all_supabase_patients()
    if pts:
        if update_real_supabase_backup_file(pts):
            bump_pwa_cache_version()

if __name__ == '__main__':
    import sys
    if '--loop' in sys.argv or '--daemon' in sys.argv:
        interval = 3600  # cada 1 hora
        print(f"[AutoMaster] Iniciando modo centinela en segundo plano (cada {interval // 60} min)...")
        while True:
            try:
                execute_auto_sync()
            except Exception as e:
                print("[AutoMaster Centinela] Error en ciclo:", e)
            time.sleep(interval)
    else:
        execute_auto_sync()
