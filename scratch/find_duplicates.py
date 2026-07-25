import os
import hashlib
import json

def get_file_hash(file_path):
    """Calculates the SHA-256 hash of a file to confirm identity."""
    sha256 = hashlib.sha256()
    try:
        with open(file_path, 'rb') as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256.update(byte_block)
        return sha256.hexdigest()
    except Exception:
        return None

def scan_user_folders():
    users_root = r"C:\Users"
    profiles = ["DELL", "Administrador", "WsiAccount", "Public", "josehp"]
    target_subfolders = ["Desktop", "Escritorio", "Documents", "Documentos", "Downloads", "Descargas", "Pictures", "Imágenes", "Music", "Música", "Videos", "Vídeos"]
    
    # Track files: hash -> list of full paths
    file_map = {}
    
    # Track unique files per profile to propose migration
    profile_files = {p: [] for p in profiles}
    
    print("Iniciando escaneo de perfiles de usuario...")
    
    for profile in profiles:
        profile_path = os.path.join(users_root, profile)
        if not os.path.exists(profile_path):
            continue
            
        for sub in target_subfolders:
            sub_path = os.path.join(profile_path, sub)
            if not os.path.exists(sub_path):
                continue
                
            print(f"Escaneando: {profile}\\{sub}")
            
            for root, dirs, files in os.walk(sub_path):
                # Excluir carpetas ocultas o de desarrollo
                dirs[:] = [d for d in dirs if not d.startswith('.') and d.lower() not in ['appdata', 'node_modules', 'vendor']]
                
                for file in files:
                    if file.startswith('.') or file.lower() in ['ntuser.dat', 'desktop.ini', 'thumbs.db']:
                        continue
                        
                    file_path = os.path.join(root, file)
                    try:
                        size = os.path.getsize(file_path)
                        if size == 0:
                            continue
                            
                        file_hash = get_file_hash(file_path)
                        if not file_hash:
                            continue
                            
                        # Catalog
                        if file_hash not in file_map:
                            file_map[file_hash] = []
                        file_map[file_hash].append({
                            "path": file_path,
                            "profile": profile,
                            "filename": file,
                            "size": size
                        })
                        
                    except Exception:
                        pass
                        
    # Analyze duplicates
    duplicates = {}
    duplicates_count = 0
    space_saved = 0
    
    # Unique files that are in other profiles but NOT in josehp
    migration_proposals = []
    
    for file_hash, instances in file_map.items():
        if len(instances) > 1:
            # We have duplicates!
            duplicates[file_hash] = instances
            duplicates_count += 1
            # Space saved = (num_instances - 1) * file_size
            size = instances[0]["size"]
            space_saved += (len(instances) - 1) * size
        else:
            # Single instance. If it's NOT in josehp, it is a migration candidate
            instance = instances[0]
            if instance["profile"] != "josehp" and instance["profile"] != "Public":
                migration_proposals.append(instance)
                
    # Save report
    report = {
        "summary": {
            "total_groups_scanned": len(file_map),
            "duplicate_groups_found": duplicates_count,
            "total_duplicate_files": sum(len(insts) for insts in duplicates.values()) if duplicates else 0,
            "space_saved_bytes": space_saved,
            "space_saved_mb": round(space_saved / (1024 * 1024), 2),
            "migration_candidates": len(migration_proposals)
        },
        "duplicates": duplicates,
        "migration_candidates": migration_proposals
    }
    
    report_path = r"C:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\scratch\duplicates_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=4, ensure_ascii=False)
        
    print(f"\n=== RESULTADOS DEL ESCANEO ===")
    print(f"Grupos duplicados: {duplicates_count}")
    print(f"Espacio recuperable: {report['summary']['space_saved_mb']} MB")
    print(f"Candidatos a migración: {len(migration_proposals)} archivos únicos.")
    print(f"Informe guardado en: scratch/duplicates_report.json")

if __name__ == "__main__":
    scan_user_folders()
