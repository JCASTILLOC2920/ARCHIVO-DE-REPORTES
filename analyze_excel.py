import pandas as pd

file_path = r"C:\Users\HP\Desktop\Servicio.xls"
print(f"Intentando leer: {file_path}")

try:
    # Intenta leer como Excel tradicional (xls/xlsx)
    df = pd.read_excel(file_path)
    print("\n--- ¡Excel leído correctamente! ---")
    print(f"Total de filas: {len(df)}")
    print("Columnas encontradas:")
    for col in df.columns:
        print(f" - {col}")
    
    print("\nPrimeras 2 filas de muestra:")
    print(df.head(2).to_string())
except Exception as e:
    print(f"\nError al leer como Excel: {e}")
    try:
        # A veces los sistemas de hospitales exportan un HTML y le cambian la extensión a .xls
        print("\nIntentando leer como tabla HTML...")
        dfs = pd.read_html(file_path)
        df = dfs[0]
        print("\n--- ¡Tabla HTML leída correctamente! ---")
        print(f"Total de filas: {len(df)}")
        print("Columnas encontradas:")
        for col in df.columns:
            print(f" - {col}")
        
        print("\nPrimeras 2 filas de muestra:")
        print(df.head(2).to_string())
    except Exception as e2:
        print(f"Error al leer como HTML: {e2}")
        print("Es posible que el archivo esté en formato CSV separado por comas o tabulaciones.")
