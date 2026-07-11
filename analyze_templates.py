import pandas as pd
import json

file_path = r"C:\Users\HP\Desktop\Servicio.xls"
print("Extrayendo datos...")
try:
    dfs = pd.read_html(file_path)
    df = dfs[0]
    
    # Limpiar nombres de columnas si son MultiIndex
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[1] if col[1] else col[0] for col in df.columns]
    
    # Filtrar solo cerrados
    df_cerrados = df[df['ESTADO ATENCION'] == 'CERRADO']
    print(f"Total pacientes cerrados: {len(df_cerrados)}")
    
    # Ver categorías/plantillas macroscópicas
    if 'PLANTILLA MACROSCOPICA' in df.columns:
        print("\nTOP 10 PLANTILLAS MACROSCOPICAS:")
        counts_macro = df_cerrados['PLANTILLA MACROSCOPICA'].value_counts().head(10)
        print(counts_macro)
        
    if 'PLANTILLA MICROSCOPICA' in df.columns:
        print("\nTOP 10 PLANTILLAS MICROSCOPICAS:")
        counts_micro = df_cerrados['PLANTILLA MICROSCOPICA'].value_counts().head(10)
        print(counts_micro)

except Exception as e:
    print("Error:", e)
