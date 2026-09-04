# -*- coding: utf-8 -*-
"""
====================================================================
SERVIDOR WEB LOCAL ULTRARRÁPIDO CON SUBIDA Y DESCARGA (WEB DROP)
JC PATH / ARCHIVO DE REPORTES - MÓDULO DE TRANSFERENCIA LOCAL LAN
====================================================================
- Cero dependencias externas (Python Standard Library).
- Drag and Drop de archivos y carpetas.
- Descarga individual y masiva (ZIP) con 1 clic.
- Detección de IP LAN + Generador de QR para smartphones.
====================================================================
"""

import os
import sys
import json
import socket
import shutil
import zipfile
import mimetypes
import urllib.parse
from datetime import datetime
from pathlib import Path
from http import HTTPStatus
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

# ==========================================
# CONFIGURACIÓN DEL SERVIDOR
# ==========================================
DEFAULT_PORT = 8080
SHARED_DIR_NAME = "ARCHIVOS_COMPARTIDOS"
BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / SHARED_DIR_NAME

# Asegurar existencia del directorio de almacenamiento
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def get_local_ip():
    """Detecta la dirección IP local activa en la red LAN/WiFi."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"


def format_size(size_bytes):
    """Formatea bytes a formato legible (B, KB, MB, GB)."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 ** 2:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 ** 3:
        return f"{size_bytes / (1024 ** 2):.1f} MB"
    else:
        return f"{size_bytes / (1024 ** 3):.2f} GB"


def sanitize_filename(filename):
    """Sanitiza el nombre del archivo para prevenir path traversal."""
    cleaned = os.path.basename(filename.replace("\\", "/"))
    for ch in ['<', '>', ':', '"', '/', '\\', '|', '?', '*']:
        cleaned = cleaned.replace(ch, '_')
    return cleaned.strip() or "archivo_sin_nombre"


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JC Web Drop - Transferencia Ultrarrápida LAN</title>
    <style>
        :root {
            --bg-color: #0b1120;
            --card-bg: rgba(17, 24, 39, 0.85);
            --card-border: rgba(59, 130, 246, 0.25);
            --primary: #2563eb;
            --primary-hover: #1d4ed8;
            --accent: #06b6d4;
            --accent-glow: rgba(6, 182, 212, 0.35);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --success: #10b981;
            --danger: #ef4444;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
        body {
            background: radial-gradient(circle at 50% 0%, #1e293b 0%, var(--bg-color) 75%);
            color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column;
            align-items: center; padding: 1.5rem 1rem;
        }
        .container { width: 100%; max-width: 1100px; display: flex; flex-direction: column; gap: 1.5rem; }
        .header {
            display: flex; justify-content: space-between; align-items: center; background: var(--card-bg);
            border: 1px solid var(--card-border); border-radius: 16px; padding: 1.25rem 1.75rem;
            backdrop-filter: blur(12px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); flex-wrap: wrap; gap: 1rem;
        }
        .logo-box { display: flex; align-items: center; gap: 1rem; }
        .logo-icon {
            width: 44px; height: 44px; background: linear-gradient(135deg, var(--accent), var(--primary));
            border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
        }
        .logo-text h1 {
            font-size: 1.35rem; font-weight: 700;
            background: linear-gradient(90deg, #38bdf8, #818cf8);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .logo-text p { font-size: 0.8rem; color: var(--text-muted); }
        .lan-badge {
            background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 10px; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.75rem;
        }
        .lan-badge .dot { width: 10px; height: 10px; background-color: var(--success); border-radius: 50%; }
        .lan-url { font-family: monospace; font-size: 0.95rem; color: #38bdf8; font-weight: 600; }
        .btn-copy {
            background: rgba(255, 255, 255, 0.08); border: none; color: var(--text-main);
            padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;
        }
        .btn-copy:hover { background: var(--primary); }
        .main-grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: 1.5rem; }
        @media (max-width: 860px) { .main-grid { grid-template-columns: 1fr; } }
        .card {
            background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px;
            padding: 1.5rem; backdrop-filter: blur(12px); box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            display: flex; flex-direction: column; gap: 1.25rem;
        }
        .drop-zone {
            border: 2px dashed rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 2.5rem 1.5rem;
            text-align: center; cursor: pointer; transition: all 0.25s ease-in-out; background: rgba(15, 23, 42, 0.5);
            display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
        }
        .drop-zone.dragover {
            border-color: var(--accent); background: rgba(6, 182, 212, 0.15); box-shadow: 0 0 25px var(--accent-glow);
        }
        .drop-zone-icon { font-size: 3rem; color: #38bdf8; }
        .button-group { display: flex; gap: 0.75rem; width: 100%; }
        .btn {
            flex: 1; padding: 0.75rem 1rem; border-radius: 10px; border: none; font-weight: 600;
            font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .btn-primary { background: linear-gradient(135deg, var(--primary), #3b82f6); color: white; }
        .btn-secondary { background: rgba(255, 255, 255, 0.07); color: var(--text-main); border: 1px solid rgba(255,255,255,0.12); }
        .btn-accent { background: linear-gradient(135deg, #0284c7, #06b6d4); color: white; }
        .progress-container {
            display: none; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px; padding: 1rem; flex-direction: column; gap: 0.5rem;
        }
        .progress-header { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); }
        .progress-bar-bg { width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; }
        .progress-bar-fill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), var(--success)); border-radius: 6px; }
        .file-list { list-style: none; overflow-y: auto; max-height: 480px; display: flex; flex-direction: column; gap: 0.6rem; }
        .file-item {
            background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
        }
        .file-info { display: flex; align-items: center; gap: 0.85rem; min-width: 0; flex: 1; }
        .file-icon { font-size: 1.4rem; flex-shrink: 0; }
        .file-meta { min-width: 0; flex: 1; }
        .file-name { font-size: 0.88rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-details { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem; }
        .file-actions { display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; }
        .btn-icon {
            background: rgba(255, 255, 255, 0.08); border: none; color: var(--text-main);
            width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center;
            justify-content: center; cursor: pointer; text-decoration: none;
        }
        .btn-icon.download:hover { background: var(--success); color: white; }
        .btn-icon.delete:hover { background: var(--danger); color: white; }
        #toast {
            position: fixed; bottom: 2rem; right: 2rem; background: #1e293b; color: white;
            padding: 0.85rem 1.25rem; border-radius: 10px; border: 1px solid var(--accent);
            display: none; z-index: 1000; font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo-box">
                <div class="logo-icon">⚡</div>
                <div class="logo-text">
                    <h1>JC WEB DROP</h1>
                    <p>Servidor de Transferencia Local LAN Ultrarrápido</p>
                </div>
            </div>
            <div class="lan-badge">
                <div class="dot"></div>
                <span class="lan-url" id="lanUrlText">http://{LOCAL_IP}:{PORT}</span>
                <button class="btn-copy" onclick="copyUrl()">Copiar URL</button>
            </div>
        </header>

        <div class="main-grid">
            <div class="card">
                <div class="drop-zone" id="dropZone">
                    <div class="drop-zone-icon">📥</div>
                    <strong>Arrastra tus archivos o carpetas aquí</strong>
                    <p>Compatible con cualquier formato sin límite de tamaño</p>
                </div>

                <div class="button-group">
                    <input type="file" id="fileInput" multiple style="display: none;">
                    <input type="file" id="folderInput" webkitdirectory directory multiple style="display: none;">
                    
                    <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()">
                        📄 Subir Archivos
                    </button>
                    <button class="btn btn-secondary" onclick="document.getElementById('folderInput').click()">
                        📁 Subir Carpeta
                    </button>
                </div>

                <div class="progress-container" id="progressBox">
                    <div class="progress-header">
                        <span id="progressFileName">Subiendo archivo...</span>
                        <span id="progressPercent">0%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" id="progressBar"></div>
                    </div>
                    <div class="progress-header" style="font-size: 0.7rem;">
                        <span id="progressSpeed">0 MB/s</span>
                        <span id="progressStatus">Procesando...</span>
                    </div>
                </div>
            </div>

            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
                    <h3>📦 Archivos Compartidos (<span id="fileCountBadge">0</span>)</h3>
                    <button class="btn btn-accent" style="flex: none; padding: 0.5rem 0.85rem; font-size: 0.78rem;" onclick="downloadAllZip()">
                        📦 Descargar Todo (.ZIP)
                    </button>
                </div>
                <ul class="file-list" id="fileList"></ul>
            </div>
        </div>
    </div>

    <div id="toast"></div>

    <script>
        const SERVER_URL = window.location.origin;
        document.getElementById('lanUrlText').innerText = SERVER_URL;

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.innerText = msg;
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 3000);
        }

        function copyUrl() {
            navigator.clipboard.writeText(SERVER_URL);
            showToast("✅ URL copiada al portapapeles: " + SERVER_URL);
        }

        const dropZone = document.getElementById('dropZone');
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
            dropZone.addEventListener(name, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
        });
        ['dragenter', 'dragover'].forEach(name => {
            dropZone.addEventListener(name, () => dropZone.classList.add('dragover'), false);
        });
        ['dragleave', 'drop'].forEach(name => {
            dropZone.addEventListener(name, () => dropZone.classList.remove('dragover'), false);
        });
        dropZone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
        });
        dropZone.addEventListener('click', () => document.getElementById('fileInput').click());

        document.getElementById('fileInput').addEventListener('change', (e) => {
            if (e.target.files.length > 0) uploadFiles(e.target.files);
        });
        document.getElementById('folderInput').addEventListener('change', (e) => {
            if (e.target.files.length > 0) uploadFiles(e.target.files);
        });

        async function uploadFiles(files) {
            const progressBox = document.getElementById('progressBox');
            const progressBar = document.getElementById('progressBar');
            const progressFileName = document.getElementById('progressFileName');
            const progressPercent = document.getElementById('progressPercent');
            const progressSpeed = document.getElementById('progressSpeed');
            const progressStatus = document.getElementById('progressStatus');

            progressBox.style.display = 'flex';

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                progressFileName.innerText = `Subiendo (${i + 1}/${files.length}): ${file.name}`;
                
                await new Promise((resolve) => {
                    const xhr = new XMLHttpRequest();
                    const startTime = Date.now();

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            progressBar.style.width = percent + '%';
                            progressPercent.innerText = percent + '%';
                            const elapsed = (Date.now() - startTime) / 1000;
                            if (elapsed > 0) {
                                const speedMB = ((event.loaded / (1024 * 1024)) / elapsed).toFixed(2);
                                progressSpeed.innerText = `${speedMB} MB/s`;
                            }
                            progressStatus.innerText = `${(event.loaded / (1024 * 1024)).toFixed(1)} MB de ${(event.total / (1024 * 1024)).toFixed(1)} MB`;
                        }
                    };

                    xhr.onload = () => resolve();
                    xhr.onerror = () => { showToast("❌ Error al subir: " + file.name); resolve(); };

                    const uploadUrl = '/api/upload?filename=' + encodeURIComponent(file.webkitRelativePath || file.name);
                    xhr.open('PUT', uploadUrl, true);
                    xhr.send(file);
                });
            }

            progressBox.style.display = 'none';
            showToast("🎉 ¡Transferencia completada!");
            fetchFiles();
        }

        function getFileIcon(filename) {
            const ext = filename.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️';
            if (['pdf'].includes(ext)) return '📕';
            if (['doc', 'docx'].includes(ext)) return '📘';
            if (['zip', 'rar', '7z'].includes(ext)) return '🗜️';
            return '📄';
        }

        async function fetchFiles() {
            try {
                const res = await fetch('/api/files');
                const files = await res.json();
                renderFileList(files);
            } catch (err) {}
        }

        function renderFileList(files) {
            const list = document.getElementById('fileList');
            document.getElementById('fileCountBadge').innerText = files.length;
            if (files.length === 0) {
                list.innerHTML = '<li style="text-align:center; padding:2rem; color:var(--text-muted);">📭 No hay archivos compartidos.</li>';
                return;
            }
            list.innerHTML = files.map(f => `
                <li class="file-item">
                    <div class="file-info">
                        <div class="file-icon">${getFileIcon(f.name)}</div>
                        <div class="file-meta">
                            <span class="file-name">${f.name}</span>
                            <div class="file-details">${f.size_formatted} • ${f.mtime}</div>
                        </div>
                    </div>
                    <div class="file-actions">
                        <a href="/download/${encodeURIComponent(f.name)}" class="btn-icon download" title="Descargar" download>⬇️</a>
                        <button onclick="deleteFile('${encodeURIComponent(f.name)}')" class="btn-icon delete" title="Eliminar">🗑️</button>
                    </div>
                </li>
            `).join('');
        }

        async function deleteFile(filename) {
            if (!confirm(`¿Eliminar "${decodeURIComponent(filename)}"?`)) return;
            try {
                const res = await fetch(`/api/delete?filename=${filename}`, { method: 'DELETE' });
                if (res.ok) { showToast("🗑️ Archivo eliminado"); fetchFiles(); }
            } catch (e) {}
        }

        function downloadAllZip() { window.location.href = '/api/download-all-zip'; }

        fetchFiles();
        setInterval(fetchFiles, 5000);
    </script>
</body>
</html>
"""


class WebDropHTTPHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        sys.stdout.write(f"[{datetime.now().strftime('%H:%M:%S')}] {self.address_string()} - {format % args}\n")

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == "/" or path == "/index.html":
            local_ip = get_local_ip()
            html_content = HTML_TEMPLATE.replace("{LOCAL_IP}", local_ip).replace("{PORT}", str(self.server.server_port))
            data = html_content.encode("utf-8")
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        if path == "/api/files":
            files = []
            for item in sorted(STORAGE_DIR.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
                if item.is_file():
                    stat = item.stat()
                    files.append({
                        "name": item.name,
                        "size": stat.st_size,
                        "size_formatted": format_size(stat.st_size),
                        "mtime": datetime.fromtimestamp(stat.st_mtime).strftime("%d/%m/%Y %H:%M")
                    })
            data = json.dumps(files).encode("utf-8")
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        if path.startswith("/download/"):
            filename = urllib.parse.unquote(path[len("/download/"):])
            safe_name = sanitize_filename(filename)
            target_path = STORAGE_DIR / safe_name

            if not target_path.is_file() or not target_path.resolve().is_relative_to(STORAGE_DIR.resolve()):
                self.send_error(HTTPStatus.NOT_FOUND, "Archivo no encontrado")
                return

            mime_type, _ = mimetypes.guess_type(str(target_path))
            mime_type = mime_type or "application/octet-stream"

            try:
                file_size = target_path.stat().st_size
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", mime_type)
                self.send_header("Content-Length", str(file_size))
                self.send_header("Content-Disposition", f'attachment; filename="{safe_name}"')
                self.end_headers()

                with open(target_path, "rb") as f:
                    shutil.copyfileobj(f, self.wfile, length=64 * 1024)
            except Exception as e:
                self.log_message(f"Error descarga: {e}")
            return

        if path == "/api/download-all-zip":
            zip_filename = f"ARCHIVOS_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
            temp_zip_path = BASE_DIR / f"temp_{zip_filename}"
            try:
                with zipfile.ZipFile(temp_zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
                    for item in STORAGE_DIR.iterdir():
                        if item.is_file():
                            zipf.write(item, arcname=item.name)
                zip_size = temp_zip_path.stat().st_size
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", "application/zip")
                self.send_header("Content-Length", str(zip_size))
                self.send_header("Content-Disposition", f'attachment; filename="{zip_filename}"')
                self.end_headers()
                with open(temp_zip_path, "rb") as f:
                    shutil.copyfileobj(f, self.wfile, length=64 * 1024)
            finally:
                if temp_zip_path.exists():
                    try: temp_zip_path.unlink()
                    except Exception: pass
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Ruta no encontrada")

    def do_PUT(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == "/api/upload":
            query_params = urllib.parse.parse_qs(parsed_url.query)
            filename = query_params.get("filename", ["archivo_recibido"])[0]
            safe_name = sanitize_filename(filename)
            target_path = STORAGE_DIR / safe_name
            content_length = int(self.headers.get("Content-Length", 0))
            try:
                remaining = content_length
                with open(target_path, "wb") as f:
                    while remaining > 0:
                        chunk_size = min(remaining, 64 * 1024)
                        chunk = self.rfile.read(chunk_size)
                        if not chunk: break
                        f.write(chunk)
                        remaining -= len(chunk)
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "filename": safe_name}).encode("utf-8"))
            except Exception as e:
                self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, str(e))
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Endpoint no válido")

    def do_DELETE(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == "/api/delete":
            query_params = urllib.parse.parse_qs(parsed_url.query)
            filename = query_params.get("filename", [""])[0]
            safe_name = sanitize_filename(filename)
            target_path = STORAGE_DIR / safe_name
            if target_path.is_file() and target_path.resolve().is_relative_to(STORAGE_DIR.resolve()):
                try:
                    target_path.unlink()
                    self.send_response(HTTPStatus.OK)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(b'{"success": true}')
                    return
                except Exception as e:
                    self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, str(e))
                    return
            self.send_error(HTTPStatus.NOT_FOUND, "Archivo no existe")
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Endpoint no válido")


def run_server(port=DEFAULT_PORT):
    local_ip = get_local_ip()
    server_address = ("0.0.0.0", port)
    httpd = ThreadingHTTPServer(server_address, WebDropHTTPHandler)
    print("=" * 65)
    print("       ⚡ JC PATH - SERVIDOR LOCAL WEB DROP (LAN/WIFI) ⚡")
    print("=" * 65)
    print(f" [OK] Directorio: {STORAGE_DIR}")
    print(f" [OK] IP Local  : {local_ip}")
    print(f" [OK] Puerto    : {port}")
    print(f" 👉 En esta PC  : http://localhost:{port}")
    print(f" 📲 En otra PC  : http://{local_ip}:{port}")
    print("=" * 65 + "\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()

if __name__ == "__main__":
    port = DEFAULT_PORT
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run_server(port)
