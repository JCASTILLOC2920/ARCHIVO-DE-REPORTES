# -*- coding: utf-8 -*-
"""
crear_backup.py - Motor de Respaldo Ultrarrápido y Empaquetado Automático (JC PATH LAB)
"""
import os
import sys
import zipfile
import datetime
import json

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

WORKSPACE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BACKUP_DIR = os.path.join(WORKSPACE, '_RESPALDOS_DE_SEGURIDAD')

WEB_FILES = [
    'reportes.html', 'index.html', 'login.html', 'imprimir.html',
    'main.js', 'ui_tables.js', 'db_service.js', 'ui_editor.js', 'ui_report_editor.js',
    'ui_admin.js', 'utils.js', 'supabase_config.js', 'responsive_scaler.js',
    'help_guide.js', 'photo_editor.js', 'dictaphone_core.js', 'macro_viewer_360.js', 'real_supabase_backup.js',
    'plantillas_data.js', 'users_db.js', 'script.js', 'synoptic_schemas.js', 'pwa_init.js', 'sw.js', 'manifest.json', 'doctores.json',
    'reportes.css', 'style.css', 'photo_editor.css', 'cropper.min.css', 'cropper.min.js'
]

IMAGE_FILES = [
    'logo-jcpathlab.png', 'header_reporte.png', 'firma_sello.png', 'favicon.ico', 'favicon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable.png'
]

def main():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    now = datetime.datetime.now()
    timestamp_str = now.strftime('%Y-%m-%d_%H-%M-%S')
    zip_filename = f"respaldo_web_{timestamp_str}.zip"
    zip_path = os.path.join(BACKUP_DIR, zip_filename)

    print("=" * 65)
    print("   [+] JC PATH LAB - CREADOR DE PUNTO DE RESTAURACION SEGURO")
    print("=" * 65)
    print(f"[*] Fecha y Hora: {now.strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"[*] Destino: {zip_path}")
    print("-" * 65)

    backed_files = []
    total_bytes = 0

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for fname in WEB_FILES + IMAGE_FILES:
            full_path = os.path.join(WORKSPACE, fname)
            if os.path.exists(full_path):
                zf.write(full_path, arcname=fname)
                size = os.path.getsize(full_path)
                total_bytes += size
                backed_files.append((fname, size))
                print(f" [+] Incluido: {fname:<28} ({size/1024:.1f} KB)")

        manifest = {
            "timestamp": now.isoformat(),
            "display_date": now.strftime('%d/%m/%Y %H:%M:%S'),
            "zip_filename": zip_filename,
            "file_count": len(backed_files),
            "total_bytes": total_bytes,
            "version": "v525.00",
            "files": [f[0] for f in backed_files]
        }
        
        manifest_json = json.dumps(manifest, indent=2, ensure_ascii=False)
        zf.writestr('manifiesto_respaldo.json', manifest_json)

    latest_manifest_path = os.path.join(BACKUP_DIR, 'ultimo_respaldo.json')
    with open(latest_manifest_path, 'w', encoding='utf-8') as f:
        f.write(manifest_json)

    zip_size = os.path.getsize(zip_path)
    print("-" * 65)
    print(" [OK] Respaldo completado con exito.")
    print(f" [OK] Total de archivos empaquetados: {len(backed_files)}")
    print(f" [OK] Tamano comprimido: {zip_size/1024:.1f} KB")
    print(f" [OK] Archivo guardado en: _RESPALDOS_DE_SEGURIDAD/{zip_filename}")
    print("=" * 65)

if __name__ == '__main__':
    main()
