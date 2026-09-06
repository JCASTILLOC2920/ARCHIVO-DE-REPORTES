# -*- coding: utf-8 -*-
import sys, os, time, json, threading
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

MOTIC_DIR = Path(r'C:\Combo_Multimodal vision y logica_Colab')
if MOTIC_DIR.exists():
    sys.path.insert(0, str(MOTIC_DIR))

try:
    from motic_camera_driver import MoticNativeCamera
    HAS_MOTIC_DRIVER = True
except Exception:
    HAS_MOTIC_DRIVER = False

try:
    import cv2
    import numpy as np
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

PORT = 8085

class UnifiedMicroscopeCamera:
    def __init__(self):
        self.lock = threading.Lock()
        self.is_running = False
        self.last_frame = None
        self.camera_name = 'Detectando Microscopio...'
        self.source_mode = 'none'
        self.width = 2048
        self.height = 1536
        self.motic_cam = None
        self.cv_cap = None
        self.init_hardware()

    def init_hardware(self):
        if HAS_MOTIC_DRIVER:
            try:
                bridge_exe = MOTIC_DIR / 'MoticBridge.exe'
                if bridge_exe.exists():
                    self.motic_cam = MoticNativeCamera(bridge_path=bridge_exe)
                    test_f = self.motic_cam.capture_frame()
                    if test_f is not None and test_f.shape[0] > 0:
                        self.source_mode = 'motic_native'
                        self.camera_name = 'Moticam 3.0 (Sensor Nativo 3.1 MP)'
                        self.height, self.width = test_f.shape[:2]
                        self.last_frame = test_f
                        print(f'[OK] Microscopio Moticam 3.0 conectado por MoticBridge ({self.width}x{self.height})')
            except Exception as e:
                print(f'[Aviso] MoticBridge init: {e}')
                self.motic_cam = None

        if not self.motic_cam and HAS_CV2:
            for idx in [1, 0, 2, 3]:
                try:
                    cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)
                    if cap.isOpened():
                        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
                        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
                        ret, f = cap.read()
                        if ret and f is not None:
                            self.cv_cap = cap
                            self.source_mode = 'opencv_dshow'
                            self.camera_name = f'Camara Microscopio (Indice USB {idx})'
                            self.height, self.width = f.shape[:2]
                            self.last_frame = f
                            print(f'[OK] Camara DirectShow conectada en indice {idx} ({self.width}x{self.height})')
                            break
                        else:
                            cap.release()
                except Exception:
                    pass

        if not self.motic_cam and not self.cv_cap:
            self.source_mode = 'fallback'
            self.camera_name = 'Modo Espera (Conecte el Microscopio USB)'
            print('[Aviso] No se detecto sensor USB directo. Servidor en modo escucha...')

        self.is_running = True
        self.worker = threading.Thread(target=self._stream_loop, daemon=True)
        self.worker.start()

    def _stream_loop(self):
        while self.is_running:
            try:
                if self.source_mode == 'motic_native' and self.motic_cam:
                    f = self.motic_cam.capture_frame()
                    if f is not None and f.shape[0] > 0:
                        with self.lock:
                            self.last_frame = f
                    time.sleep(0.03)
                elif self.source_mode == 'opencv_dshow' and self.cv_cap:
                    ret, f = self.cv_cap.read()
                    if ret and f is not None:
                        with self.lock:
                            self.last_frame = f
                    time.sleep(0.02)
                else:
                    time.sleep(0.5)
            except Exception:
                time.sleep(0.1)

    def get_jpeg(self, quality=85):
        with self.lock:
            if self.last_frame is None:
                if HAS_CV2:
                    blank = np.zeros((768, 1024, 3), dtype=np.uint8)
                    cv2.putText(blank, 'MICROSCOPIO MOTIC CONECTANDO...', (180, 384), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 240, 255), 2)
                    ret, buf = cv2.imencode('.jpg', blank, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
                    return buf.tobytes() if ret else None
                return None
            if HAS_CV2:
                ret, buf = cv2.imencode('.jpg', self.last_frame, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
                if ret:
                    return buf.tobytes()
        return None

camera = UnifiedMicroscopeCamera()

class MicroscopeBridgeHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        clean_path = self.path.split('?')[0]
        if clean_path in ['/api/camera/status', '/status', '/api/status']:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            payload = {
                'status': 'online',
                'camera_name': camera.camera_name,
                'mode': camera.source_mode,
                'resolution': f'{camera.width}x{camera.height}',
                'fps': 30
            }
            self.wfile.write(json.dumps(payload).encode('utf-8'))
        elif clean_path in ['/api/camera/capture', '/capture', '/snapshot']:
            jpeg = camera.get_jpeg(quality=98)
            if jpeg:
                self.send_response(200)
                self.send_header('Content-Type', 'image/jpeg')
                self.send_header('Content-Length', str(len(jpeg)))
                self.end_headers()
                self.wfile.write(jpeg)
            else:
                self.send_error(503, 'Sensor de microscopio ocupado')
        elif clean_path in ['/stream', '/video_feed', '/api/camera/stream']:
            self.send_response(200)
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=frame')
            self.end_headers()
            try:
                while True:
                    jpeg = camera.get_jpeg(quality=80)
                    if jpeg:
                        self.wfile.write(b'--frame
')
                        self.wfile.write(b'Content-Type: image/jpeg
')
                        self.wfile.write(f'Content-Length: {len(jpeg)}

'.encode('utf-8'))
                        self.wfile.write(jpeg)
                        self.wfile.write(b'
')
                    time.sleep(0.033)
            except (ConnectionResetError, BrokenPipeError):
                pass
        else:
            self.send_error(404, 'Endpoint no encontrado')

def run():
    server = ThreadingHTTPServer(('127.0.0.1', PORT), MicroscopeBridgeHandler)
    print(f'Microscopio Bridge activo en puerto {PORT}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        camera.is_running = False
        if camera.cv_cap: camera.cv_cap.release()
        if camera.motic_cam: camera.motic_cam.close()
        server.server_close()

if __name__ == '__main__':
    run()
