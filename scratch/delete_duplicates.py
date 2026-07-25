import os
import json

def delete_duplicates():
    report_path = r"C:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\scratch\duplicates_report.json"
    if not os.path.exists(report_path):
        print("Error: No se encontró el informe de duplicados. Ejecuta find_duplicates.py primero.")
        return
        
    with open(report_path, 'r', encoding='utf-8') as f:
        report = json.load(f)
        
    duplicates = report.get("duplicates", {})
    
    total_deleted = 0
    total_space_saved = 0
    errors = 0
    
    print("Iniciando eliminación de archivos duplicados de forma segura...")
    
    for file_hash, instances in duplicates.items():
        if len(instances) <= 1:
            continue
            
        # Ordenamos las instancias para priorizar conservar la versión original (sin " (1)" o " (2)")
        # Ejemplo: "archivo.exe" se conserva antes que "archivo (1).exe"
        def sort_key(inst):
            path = inst["path"]
            # Si contiene paréntesis con números al final del nombre base, penalizar
            filename = inst["filename"]
            if re.search(r'\(\d+\)\.[a-zA-Z0-9]+$', filename):
                return 1
            return 0
            
        import re
        sorted_instances = sorted(instances, key=sort_key)
        
        # Conservar el primero (sorted_instances[0])
        kept_file = sorted_instances[0]["path"]
        print(f"\nConservando: {kept_file}")
        
        # Eliminar los demás
        for duplicate in sorted_instances[1:]:
            dup_path = duplicate["path"]
            size = duplicate["size"]
            try:
                if os.path.exists(dup_path):
                    os.remove(dup_path)
                    total_deleted += 1
                    total_space_saved += size
                    print(f"  - Eliminado: {dup_path} ({size / (1024*1024):.2f} MB)")
                else:
                    print(f"  - Ya no existe: {dup_path}")
            except Exception as e:
                errors += 1
                print(f"  - Error eliminando {dup_path}: {e}")
                
    print("\n=== RESUMEN DE ELIMINACIÓN DE DUPLICADOS ===")
    print(f"Archivos duplicados eliminados: {total_deleted}")
    print(f"Espacio total liberado:         {total_space_saved / (1024*1024):.2f} MB")
    print(f"Errores encontrados:            {errors}")
    print("===========================================")

if __name__ == "__main__":
    delete_duplicates()
