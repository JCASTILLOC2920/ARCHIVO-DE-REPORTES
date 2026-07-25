import os
import sys

def get_folder_info(path):
    info = {"exists": False, "accessible": False, "files": 0, "size_mb": 0, "items": []}
    if not os.path.exists(path):
        return info
    info["exists"] = True
    try:
        info["items"] = os.listdir(path)
        info["accessible"] = True
        
        total_size = 0
        total_files = 0
        target_subs = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'Escritorio', 'Documentos', 'Descargas', 'Imágenes']
        for sub in target_subs:
            sub_path = os.path.join(path, sub)
            if os.path.exists(sub_path):
                for root, dirs, files in os.walk(sub_path):
                    for file in files:
                        fp = os.path.join(root, file)
                        try:
                            total_size += os.path.getsize(fp)
                            total_files += 1
                        except Exception:
                            pass
        info["size_mb"] = round(total_size / (1024 * 1024), 2)
        info["files"] = total_files
    except Exception as e:
        info["error"] = str(e)
    return info

def run_check():
    report = {}
    report["Administrador"] = get_folder_info(r"C:\Users\Administrador")
    report["WsiAccount"] = get_folder_info(r"C:\Users\WsiAccount")
    report["Public"] = get_folder_info(r"C:\Users\Public")
    
    with open(r"C:\Users\Public\other_profiles_report.json", 'w', encoding='utf-8') as f:
        import json
        json.dump(report, f, indent=4)

if __name__ == "__main__":
    run_check()
