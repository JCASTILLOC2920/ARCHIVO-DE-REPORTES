import sys
import os
import time
import subprocess
import re

def run_layout_audit():
    log_path = r"C:\Users\Public\chrome_audit.log"
    if os.path.exists(log_path):
        try:
            os.remove(log_path)
        except Exception:
            pass
            
    # Launch Chrome headlessly with file access enabled
    html_path = r"file:///c:/Users/DELL/OneDrive - Universidad Nacional Mayor de San Marcos/Escritorio/repositorio/ARCHIVO-DE-REPORTES/scratch/audit_layout.html"
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    
    print("Iniciando Google Chrome en modo Headless para auditar maquetación...")
    
    # Run Chrome
    proc = subprocess.Popen([
        chrome_path,
        "--headless",
        "--disable-gpu",
        "--allow-file-access-from-files",
        "--enable-logging",
        f"--log-file={log_path}",
        html_path
    ])
    
    # Wait for the audit to complete (40 reports processed in iframe takes ~14 seconds)
    print("Procesando muestra estadística de 40 informes de forma autónoma...")
    time.sleep(18)
    
    # Terminate Chrome
    proc.terminate()
    try:
        proc.wait(timeout=2)
    except subprocess.TimeoutExpired:
        proc.kill()
        
    print("Auditoría completada. Analizando registros de maquetación...")
    
    # Read log and find results
    if os.path.exists(log_path):
        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            log_content = f.read()
            
        match = re.search(r'\[AUDIT_RESULT\] Total: (\d+), OnePage: (\d+), MultiPage: (\d+), Unbalanced/Errors: (\d+)', log_content)
        if match:
            total = int(match.group(1))
            one_page = int(match.group(2))
            multi_page = int(match.group(3))
            errors = int(match.group(4))
            
            print("\n=============================================")
            print("         REPORTE ESTADÍSTICO DE MAQUETACIÓN A4")
            print("=============================================")
            print(f"Total Informes Auditados (Muestra):  {total}")
            print(f"  - Informes de 1 sola página:       {one_page} ({one_page/total*100:.1f}%)")
            print(f"  - Informes de 2 páginas (Balanceados): {multi_page} ({multi_page/total*100:.1f}%)")
            print(f"  - Errores (Firmas huérfanas / Desbalance): {errors} ({errors/total*100:.1f}%)")
            print("=============================================")
            
            if errors == 0:
                print("¡ÉXITO MATEMÁTICO! Cero errores de paginación o firmas huérfanas detectados en la muestra.")
                sys.exit(0)
            else:
                print(f"Se detectaron {errors} casos desbalanceados. Se requiere revisión de márgenes.")
                sys.exit(1)
        else:
            print("Error: No se encontró la línea de resultados en los logs de Chrome.")
            # Print last few lines of log to help debug
            print("Últimas líneas del log:")
            print("\n".join(log_content.split("\n")[-10:]))
            sys.exit(1)
    else:
        print("Error: No se generó el archivo de logs de Chrome.")
        sys.exit(1)

if __name__ == "__main__":
    run_layout_audit()
