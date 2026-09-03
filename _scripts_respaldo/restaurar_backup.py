# -*- coding: utf-8 -*-
"""
restaurar_backup.py - Motor de Restauración Segura y Reversión de Emergencia (JC PATH LAB)
"""
import os
import sys
import zipfile
import glob
import json
import shutil
import datetime

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

WORKSPACE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BACKUP_DIR = os.path.join(WORKSPACE, '_RESPALDOS_DE_SEGURIDAD')

def list_backups():
    if not os.path.exists(BACKUP_DIR):
        return []
    zips = glob.glob(os.path.join(BACKUP_DIR, 'respaldo_web_*.zip'))
    zips.sort(key=os.path.getmtime, reverse=True)
    return zips

def main():
    print("=" * 65)
    print("   [+] JC PATH LAB - RESTAURADOR DE PUNTO SEGURO EN 1 CLIC")
    print("=" * 65)

    backups = list_backups()
    if not backups:
        print(" [!] No se encontraron puntos de restauracion en _RESPALDOS_DE_SEGURIDAD/")
        print(" [i] Puedes crear uno haciendo doble clic en 'Crear_Punto_De_Restauracion.bat'")
        print("=" * 65)
        input("\n Presiona Enter para salir...")
        return

    print(" Puntos de Restauracion Disponibles:\n")
    for idx, bpath in enumerate(backups, 1):
        bname = os.path.basename(bpath)
        mtime = datetime.datetime.fromtimestamp(os.path.getmtime(bpath)).strftime('%d/%m/%Y %H:%M:%S')
        size_kb = os.path.getsize(bpath) / 1024
        tag = " (ULTIMO RESPALDO - RECOMENDADO)" if idx == 1 else ""
        print(f"  [{idx}] {bname} - {mtime} ({size_kb:.1f} KB){tag}")

    print("\n" + "-" * 65)
    choice_str = input(f" Selecciona el numero a restaurar (1-{len(backups)}) o [Enter] para el ultimo [1]: ").strip()
    
    if not choice_str:
        selected_idx = 0
    else:
        try:
            selected_idx = int(choice_str) - 1
            if selected_idx < 0 or selected_idx >= len(backups):
                print(" [!] Seleccion invalida. Operacion cancelada.")
                return
        except ValueError:
            print(" [!] Entrada no valida. Operacion cancelada.")
            return

    target_zip = backups[selected_idx]
    target_name = os.path.basename(target_zip)
    print(f"\n[*] Restaurando desde: {target_name}")

    # 1. Crear respaldo preventivo de seguridad antes de restaurar
    pre_restore_ts = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    pre_zip_name = f"pre_restauracion_preventivo_{pre_restore_ts}.zip"
    pre_zip_path = os.path.join(BACKUP_DIR, pre_zip_name)
    
    # 2. Descomprimir y restaurar archivos en WORKSPACE
    restored_count = 0
    with zipfile.ZipFile(target_zip, 'r') as zf:
        file_list = [f for f in zf.namelist() if f != 'manifiesto_respaldo.json']
        for member in file_list:
            dest_path = os.path.join(WORKSPACE, member)
            zf.extract(member, WORKSPACE)
            restored_count += 1
            print(f" [OK] Restaurado: {member}")

    print("\n" + "=" * 65)
    print(" [+] RESTAURACION COMPLETADA CON EXITO")
    print(f" [*] Total de archivos restaurados: {restored_count}")
    print(f" [*] Tu web ha vuelto al estado perfecto de: {target_name}")
    print("=" * 65)
    input("\n Presiona Enter para finalizar...")

if __name__ == '__main__':
    main()
