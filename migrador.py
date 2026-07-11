import pandas as pd
import json

file_path = r"C:\Users\HP\Desktop\Servicio.xls"
output_path = r"C:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES\datos_migrados.js"

print("Leyendo tabla HTML desde Excel...")
try:
    dfs = pd.read_html(file_path)
    df = dfs[0]
    
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[1] if col[1] else col[0] for col in df.columns]
        
    df_cerrados = df[df['ESTADO ATENCION'] == 'CERRADO']
    
    plantillas = []
    
    # Procesar MACRO (Category ID: 1)
    if 'PLANTILLA MACROSCOPICA' in df.columns and 'MACROSCOPICA' in df.columns:
        macro_df = df_cerrados[['PLANTILLA MACROSCOPICA', 'MACROSCOPICA']].dropna().drop_duplicates()
        for idx, row in macro_df.iterrows():
            titulo = str(row['PLANTILLA MACROSCOPICA']).strip()
            texto = str(row['MACROSCOPICA']).strip()
            if titulo and texto and titulo != 'nan' and texto != 'nan':
                plantillas.append({
                    "categoryId": 1,
                    "titulo": titulo,
                    "contenido": texto
                })
                
    # Procesar MICRO (Category ID: 11)
    if 'PLANTILLA MICROSCOPICA' in df.columns and 'MICROSCOPICA' in df.columns:
        micro_df = df_cerrados[['PLANTILLA MICROSCOPICA', 'MICROSCOPICA']].dropna().drop_duplicates()
        for idx, row in micro_df.iterrows():
            titulo = str(row['PLANTILLA MICROSCOPICA']).strip()
            texto = str(row['MICROSCOPICA']).strip()
            if titulo and texto and titulo != 'nan' and texto != 'nan':
                plantillas.append({
                    "categoryId": 11,
                    "titulo": titulo,
                    "contenido": texto
                })
                
    js_content = f"window.datosMigrados = {json.dumps(plantillas, indent=4, ensure_ascii=False)};"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Éxito: Se generó el archivo de puente con {len(plantillas)} plantillas únicas extraídas.")
    
except Exception as e:
    print("Error:", e)
