import os
import shutil

def move_onedrive_files_to_desktop():
    src_dir = r"C:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos"
    dst_dir = r"C:\Users\DELL\Desktop"
    
    if not os.path.exists(src_dir):
        print(f"Error: La ruta de origen no existe: {src_dir}")
        return
    if not os.path.exists(dst_dir):
        print(f"Error: La ruta de destino no existe: {dst_dir}")
        return
        
    print(f"Iniciando reubicación de archivos sueltos...")
    print(f"Origen: {src_dir}")
    print(f"Destino: {dst_dir}\n")
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    # List all items in the root of the source directory
    try:
        items = os.listdir(src_dir)
    except Exception as e:
        print(f"Error al listar el directorio de origen: {e}")
        return
        
    for item in items:
        src_path = os.path.join(src_dir, item)
        dst_path = os.path.join(dst_dir, item)
        
        # Omitir carpetas / directorios (conservar la estructura original en origen)
        if os.path.isdir(src_path):
            continue
            
        # Omitir archivos ocultos y del sistema
        if item.startswith('.') or item.lower() in ['desktop.ini', 'thumbs.db']:
            skipped_count += 1
            continue
            
        try:
            # Si el archivo ya existe en destino, sobrescribir
            if os.path.exists(dst_path):
                # Eliminar del destino antes de mover para evitar conflictos
                os.remove(dst_path)
                
            shutil.move(src_path, dst_path)
            success_count += 1
            print(f"Mover: {item} -> Éxito")
        except Exception as e:
            error_count += 1
            print(f"Error al mover {item}: {e}")
            
    print("\n=== RESUMEN DE REUBICACIÓN ===")
    print(f"Archivos movidos con éxito: {success_count}")
    print(f"Archivos omitidos (sistema):  {skipped_count}")
    print(f"Errores encontrados:        {error_count}")
    print("==============================")

if __name__ == "__main__":
    move_onedrive_files_to_desktop()
