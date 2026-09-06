"""
==============================================================================
SERVIDOR UNIFICADO DEFINITIVO PARA MICROSCOPIO MOTICAM 3.0 / DR. CASTILLO
Dr. Castillo - Sistema de Patología Digital y Reportes Anatomopatológicos
==============================================================================
1. DUAL-MODE INTELIGENTE:
   - Modo A: Motic Live Imaging Module abierto -> Hook Viewport en RAM (<2ms).
   - Modo B: Motic software cerrado -> Sensor directo por MoticBridge Daemon.
2. CERO WEBCAM: 100% aislado de la cámara web de la laptop.
3. SERVIDOR WEB COMPLETO: Sirve reportes.html, login.html, imprimir.html y estáticos sin errores 404.
4. INYECCIÓN 1-CLIC: Captura instantánea a setupMiniCropper.
==============================================================================
"""

import sys
import os
import time
import json
import asyncio
import threading
import subprocess
import ctypes
from ctypes import wintypes
from pathlib import Path
import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, Response
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

# Directorios de trabajo
WORKSPACE_DIR = Path(__file__).parent.resolve()
REPO_DIR = WORKSPACE_DIR
COMBO_DIR = Path(r"C:\Combo_Multimodal vision y logica_Colab")
BRIDGE_EXE = COMBO_DIR / "MoticBridge.exe" if (COMBO_DIR / "MoticBridge.exe").exists() else WORKSPACE_DIR / "MoticBridge.exe"
TEMP_FRAME = Path(os.environ.get("TEMP", r"C:\Windows\Temp")) / f"motic_live_frame_{os.getpid()}.bmp"

# Configuración GDI de Windows
user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32

try:
    hwinsta = user32.OpenWindowStationW('winsta0', False, 0x037F)
    if hwinsta:
        user32.SetProcessWindowStation(hwinsta)
    hdesk = user32.OpenDesktopW('default', 0, False, 0x01FF)
    if hdesk:
        user32.SetThreadDesktop(hdesk)
except Exception:
    pass

class RECT(ctypes.Structure):
    _fields_ = [('left', ctypes.c_long), ('top', ctypes.c_long), ('right', ctypes.c_long), ('bottom', ctypes.c_long)]

class BITMAPINFOHEADER(ctypes.Structure):
    _fields_ = [
        ('biSize', wintypes.DWORD),
        ('biWidth', wintypes.LONG),
        ('biHeight', wintypes.LONG),
        ('biPlanes', wintypes.WORD),
        ('biBitCount', wintypes.WORD),
        ('biCompression', wintypes.DWORD),
        ('biSizeImage', wintypes.DWORD),
        ('biXPelsPerMeter', wintypes.LONG),
        ('biYPelsPerMeter', wintypes.LONG),
        ('biClrUsed', wintypes.DWORD),
        ('biClrImportant', wintypes.DWORD)
    ]

class BITMAPINFO(ctypes.Structure):
    _fields_ = [
        ('bmiHeader', BITMAPINFOHEADER),
        ('bmiColors', wintypes.DWORD * 3)
    ]

WNDENUMPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)


# ==============================================================================
# MOTOR UNIFICADO DE ADQUISICIÓN MOTICAM 3.0
# ==============================================================================
class DefinitiveMicroscopeEngine:
    def __init__(self):
        self.lock = threading.Lock()
        self.latest_frame = None
        self.latest_jpeg_bytes = None
        self.latest_jpeg_small_bytes = None
        self.frame_seq = 0
        self.active_source = "standby"
        
        # Modo A: Hook Viewport Motic
        self.main_hwnd = None
        self.child_hwnd = None
        self.last_win_search = 0.0
        
        # Modo B: Daemon Hardware Directo MoticBridge
        self.bridge_proc = None
        self.bridge_ready = False
        self.last_bridge_try = 0.0
        
        # Control general
        self.running = True
        self.frame_count = 0
        self.fps_calc = 0.0
        self.last_fps_time = time.time()
        
        # Iniciar captura
        self.thread = threading.Thread(target=self._capture_loop, daemon=True, name="DefinitiveMicroscopeProducer")
        self.thread.start()

    def attach_desktop(self):
        try:
            hdesk = user32.OpenInputDesktop(0, False, 0x01FF)
            if hdesk:
                user32.SetThreadDesktop(hdesk)
        except Exception:
            pass

    # --------------------------------------------------------------------------
    # MODO A: DETECCIÓN Y CAPTURA DE VENTANA MOTIC (SI ESTÁ ABIERTO)
    # --------------------------------------------------------------------------
    def find_motic_windows(self):
        self.last_win_search = time.time()
        self.attach_desktop()
        candidates = []
        current_pid = os.getpid()

        def enum_win(hwnd, lparam):
            if not user32.IsWindow(hwnd):
                return True
            if not (user32.IsWindowVisible(hwnd) or user32.IsIconic(hwnd)):
                return True
            
            pid = wintypes.DWORD()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
            if pid.value == current_pid:
                return True

            cclass = ctypes.create_unicode_buffer(256)
            user32.GetClassNameW(hwnd, cclass, 256)
            cls_name = cclass.value.lower()
            if "consolewindowclass" in cls_name or "chrome" in cls_name or "code" in cls_name:
                return True

            length = user32.GetWindowTextLengthW(hwnd)
            if length == 0:
                return True
            buff = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buff, length + 1)
            txt = buff.value.lower()

            if any(exc in txt for exc in ["servidor", "reportes", "cmd", "powershell"]):
                return True

            if any(kw in txt for kw in ["motic live imaging", "motic images", "moticam", "live imaging module"]):
                rc = RECT()
                user32.GetClientRect(hwnd, ctypes.byref(rc))
                w = rc.right - rc.left
                h = rc.bottom - rc.top
                candidates.append((hwnd, txt, w * h))
            return True

        user32.EnumWindows(WNDENUMPROC(enum_win), 0)

        if candidates:
            candidates.sort(key=lambda x: x[2], reverse=True)
            self.main_hwnd = candidates[0][0]
            if user32.IsIconic(self.main_hwnd):
                user32.ShowWindow(self.main_hwnd, 4) # SW_SHOWNOACTIVATE
            
            children = []
            def enum_child(chwnd, lparam):
                if not user32.IsWindow(chwnd):
                    return True
                cclass = ctypes.create_unicode_buffer(256)
                user32.GetClassNameW(chwnd, cclass, 256)
                rc = RECT()
                user32.GetClientRect(chwnd, ctypes.byref(rc))
                w = rc.right - rc.left
                h = rc.bottom - rc.top
                if w >= 200 and h >= 150:
                    children.append((chwnd, cclass.value, w, h, w * h))
                return True

            user32.EnumChildWindows(self.main_hwnd, WNDENUMPROC(enum_child), 0)
            if children:
                pref = [c for c in children if c[1] in ("#32770", "Static") or "Afx" in c[1]]
                if pref:
                    pref.sort(key=lambda x: x[4], reverse=True)
                    self.child_hwnd = pref[0][0]
                else:
                    children.sort(key=lambda x: x[4], reverse=True)
                    self.child_hwnd = children[0][0]
            else:
                self.child_hwnd = self.main_hwnd
        else:
            self.main_hwnd = None
            self.child_hwnd = None

    def _grab_from_hwnd(self) -> np.ndarray:
        if not self.child_hwnd or not user32.IsWindow(self.child_hwnd):
            if time.time() - self.last_win_search > 1.2:
                self.find_motic_windows()
        if not self.child_hwnd or not user32.IsWindow(self.child_hwnd):
            return None

        rc = RECT()
        user32.GetClientRect(self.child_hwnd, ctypes.byref(rc))
        w = rc.right - rc.left
        h = rc.bottom - rc.top
        if w < 100 or h < 100:
            return None

        hdc_wnd = user32.GetDC(self.child_hwnd)
        if not hdc_wnd: return None
        hdc_mem = gdi32.CreateCompatibleDC(hdc_wnd)
        if not hdc_mem:
            user32.ReleaseDC(self.child_hwnd, hdc_wnd)
            return None
        hbm = gdi32.CreateCompatibleBitmap(hdc_wnd, w, h)
        hold = gdi32.SelectObject(hdc_mem, hbm)

        try:
            PW_RENDERFULLCONTENT = 2
            success = user32.PrintWindow(self.child_hwnd, hdc_mem, PW_RENDERFULLCONTENT)
            if not success:
                SRCCOPY = 0x00CC0020
                gdi32.BitBlt(hdc_mem, 0, 0, w, h, hdc_wnd, 0, 0, SRCCOPY)

            bmi = BITMAPINFO()
            bmi.bmiHeader.biSize = ctypes.sizeof(BITMAPINFOHEADER)
            bmi.bmiHeader.biWidth = w
            bmi.bmiHeader.biHeight = -h
            bmi.bmiHeader.biPlanes = 1
            bmi.bmiHeader.biBitCount = 32
            bmi.bmiHeader.biCompression = 0

            buf = ctypes.create_string_buffer(w * h * 4)
            gdi32.GetDIBits(hdc_mem, hbm, 0, h, buf, ctypes.byref(bmi), 0)

            arr = np.frombuffer(buf, dtype=np.uint8).reshape((h, w, 4))
            bgr = arr[:, :, :3]
            if bgr.mean() > 5:
                return bgr
            return None
        finally:
            gdi32.SelectObject(hdc_mem, hold)
            gdi32.DeleteObject(hbm)
            gdi32.DeleteDC(hdc_mem)
            user32.ReleaseDC(self.child_hwnd, hdc_wnd)

    # --------------------------------------------------------------------------
    # MODO B: CAPTURA DIRECTA DESDE SENSOR HARDWARE (MOTICBRIDGE DAEMON)
    # --------------------------------------------------------------------------
    def _init_daemon(self):
        if not BRIDGE_EXE.exists():
            return
        self.last_bridge_try = time.time()
        try:
            if self.bridge_proc and self.bridge_proc.poll() is None:
                try: self.bridge_proc.kill()
                except Exception: pass
            
            creationflags = subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
            self.bridge_proc = subprocess.Popen(
                [str(BRIDGE_EXE), "--daemon"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                creationflags=creationflags
            )
            
            ready_line = ""
            t0 = time.time()
            while time.time() - t0 < 3.0:
                if self.bridge_proc.poll() is not None:
                    break
                line = self.bridge_proc.stdout.readline()
                if line:
                    ready_line = line.strip()
                    break
                time.sleep(0.02)
                
            if ready_line.startswith("READY"):
                self.bridge_ready = True
                print(f"[ENGINE] Sensor Directo Moticam Conectado: {ready_line}")
            else:
                self.bridge_ready = False
        except Exception as e:
            self.bridge_ready = False
            self.bridge_proc = None

    def _grab_from_daemon(self) -> np.ndarray:
        if not self.bridge_ready or not self.bridge_proc or self.bridge_proc.poll() is not None:
            if time.time() - self.last_bridge_try > 3.0:
                self._init_daemon()
            if not self.bridge_ready or not self.bridge_proc:
                return None

        try:
            self.bridge_proc.stdin.write(f"CAPTURE {TEMP_FRAME}\n")
            self.bridge_proc.stdin.flush()
            
            t0 = time.time()
            resp = ""
            while time.time() - t0 < 0.35:
                if self.bridge_proc.poll() is not None:
                    break
                line = self.bridge_proc.stdout.readline()
                if line:
                    resp = line.strip()
                    break
                time.sleep(0.002)

            if resp.startswith("OK") and TEMP_FRAME.exists():
                raw = np.fromfile(str(TEMP_FRAME), dtype=np.uint8)
                if raw.size >= 9437238:
                    img_data = raw[54:54 + (2048 * 1536 * 3)]
                    frame = np.flipud(img_data.reshape((1536, 2048, 3)))
                    if frame.mean() > 5:
                        return frame
                else:
                    frame = cv2.imread(str(TEMP_FRAME))
                    if frame is not None and frame.mean() > 5:
                        return frame
        except Exception:
            self.bridge_ready = False
        return None

    def _generate_standby_frame(self) -> np.ndarray:
        w, h = 960, 540
        frame = np.full((h, w, 3), (35, 20, 15), dtype=np.uint8)
        grid_color = (55, 30, 22)
        for x in range(0, w, 40): cv2.line(frame, (x, 0), (x, h), grid_color, 1)
        for y in range(0, h, 40): cv2.line(frame, (0, y), (w, y), grid_color, 1)

        cx, cy = w // 2, h // 2 - 25
        cv2.circle(frame, (cx, cy), 90, (90, 60, 35), 2, cv2.LINE_AA)
        cv2.circle(frame, (cx, cy), 45, (120, 80, 45), 1, cv2.LINE_AA)
        cv2.line(frame, (cx - 100, cy), (cx + 100, cy), (90, 60, 35), 1, cv2.LINE_AA)
        cv2.line(frame, (cx, cy - 100), (cx, cy + 100), (90, 60, 35), 1, cv2.LINE_AA)

        pulse = int(abs(np.sin(time.time() * 2.5)) * 30)
        cv2.circle(frame, (cx, cy), 6 + pulse // 8, (0, 215, 255), -1, cv2.LINE_AA)

        cv2.putText(frame, "SISTEMA DE MICROSCOPIA DIGITAL - DR. CASTILLO", (w // 2 - 290, 55), cv2.FONT_HERSHEY_SIMPLEX, 0.72, (240, 240, 240), 2, cv2.LINE_AA)
        cv2.putText(frame, "Conectando al sensor del microscopio Moticam...", (w // 2 - 245, cy + 115), cv2.FONT_HERSHEY_SIMPLEX, 0.58, (0, 215, 255), 2, cv2.LINE_AA)
        cv2.putText(frame, "Asegurese de tener conectado el cable USB de la Moticam 3.0", (w // 2 - 260, cy + 150), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1, cv2.LINE_AA)

        ts = time.strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, f"ESTADO: BUSCANDO SENSOR MOTICAM | {ts}", (20, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (110, 110, 110), 1, cv2.LINE_AA)
        return frame

    def _capture_loop(self):
        encode_params_small = [int(cv2.IMWRITE_JPEG_QUALITY), 75]
        encode_params_full = [int(cv2.IMWRITE_JPEG_QUALITY), 92]

        while self.running:
            t_start = time.perf_counter()
            try:
                frame = None
                source = "standby"

                # 1. Prioridad: Hook de Ventana si Motic está abierto
                frame = self._grab_from_hwnd()
                if frame is not None:
                    source = "motic_window"

                # 2. Prioridad: Captura Directa de Hardware (si la ventana no está abierta)
                if frame is None:
                    frame = self._grab_from_daemon()
                    if frame is not None:
                        source = "motic_hardware"

                # 3. Standby si el hardware no está conectado
                if frame is None:
                    frame = self._generate_standby_frame()
                    source = "standby"

                h, w = frame.shape[:2]
                target_w = 960
                target_h = int(target_w * (h / w))
                small = cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
                
                _, jpeg_small = cv2.imencode('.jpg', small, encode_params_small)
                _, jpeg_full = cv2.imencode('.jpg', frame, encode_params_full)

                self.frame_count += 1
                now = time.time()
                if now - self.last_fps_time >= 1.0:
                    self.fps_calc = self.frame_count / (now - self.last_fps_time)
                    self.frame_count = 0
                    self.last_fps_time = now

                with self.lock:
                    self.latest_frame = frame
                    self.latest_jpeg_bytes = jpeg_full.tobytes()
                    self.latest_jpeg_small_bytes = jpeg_small.tobytes()
                    self.active_source = source
                    self.frame_seq += 1

            except Exception:
                pass

            elapsed = time.perf_counter() - t_start
            sleep_time = max(0.005, (1.0 / 30.0) - elapsed)
            time.sleep(sleep_time)

    def get_snapshot(self) -> np.ndarray:
        with self.lock:
            if self.latest_frame is not None and self.active_source != "standby":
                return self.latest_frame.copy()
        # Intentar captura única directa si está en standby
        snap = self._grab_from_daemon()
        if snap is not None:
            return snap
        with self.lock:
            return self.latest_frame.copy() if self.latest_frame is not None else None

engine = DefinitiveMicroscopeEngine()

# ==============================================================================
# FASTAPI APP Y ENRUTAMIENTO ESTÁTICO TOTAL
# ==============================================================================
app = FastAPI(title="Microscopio Motic Bridge & Web Live Stream (Zero-Lag)", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- RUTAS DE NAVEGACIÓN PRINCIPALES ---
@app.get("/")
async def root():
    f = REPO_DIR / "reportes.html"
    if not f.exists(): f = REPO_DIR / "index.html"
    if f.exists(): return FileResponse(str(f))
    return HTMLResponse("<h2>Microscopio Bridge Activo (:8085).</h2>")

@app.get("/reportes.html")
async def get_reportes_page():
    f = REPO_DIR / "reportes.html"
    if f.exists(): return FileResponse(str(f))
    return HTMLResponse("<h2>reportes.html no encontrado</h2>", status_code=404)

@app.get("/login.html")
async def get_login_page():
    f = REPO_DIR / "login.html"
    if f.exists(): return FileResponse(str(f))
    return HTMLResponse("<h2>login.html no encontrado</h2>", status_code=404)

@app.get("/imprimir.html")
async def get_imprimir_page():
    f = REPO_DIR / "imprimir.html"
    if f.exists(): return FileResponse(str(f))
    return HTMLResponse("<h2>imprimir.html no encontrado</h2>", status_code=404)

@app.get("/index.html")
async def get_index_page():
    f = REPO_DIR / "index.html"
    if f.exists(): return FileResponse(str(f))
    return HTMLResponse("<h2>index.html no encontrado</h2>", status_code=404)

# --- STREAMING Y APIS ---
@app.get("/stream")
@app.get("/video_feed")
async def video_stream(request: Request):
    """Stream MJPEG en tiempo real con descarte de cuadros (Zero-Lag)."""
    async def gen():
        last_seq = -1
        while True:
            if await request.is_disconnected():
                break
            with engine.lock:
                current_seq = engine.frame_seq
                jpg_bytes = engine.latest_jpeg_small_bytes
            
            if jpg_bytes and current_seq != last_seq:
                last_seq = current_seq
                content_len = len(jpg_bytes)
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n'
                       b'Content-Length: ' + str(content_len).encode('ascii') + b'\r\n\r\n' + jpg_bytes + b'\r\n')
            await asyncio.sleep(0.020)
    return StreamingResponse(
        gen(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
            "Connection": "close"
        }
    )

@app.get("/api/camera/status")
def camera_status():
    with engine.lock:
        has_frame = engine.latest_frame is not None
        source = engine.active_source
        fps = round(engine.fps_calc, 1)
        dim = f"{engine.latest_frame.shape[1]}x{engine.latest_frame.shape[0]}" if has_frame else "0x0"
        motic_detected = bool(engine.child_hwnd) or engine.bridge_ready
    
    return JSONResponse({
        "status": "online" if source != "standby" else "searching",
        "active_source": source,
        "device": "Moticam 3.0 Live Stream (Zero-Lag)",
        "resolution": dim,
        "fps": fps,
        "motic_detected": motic_detected,
        "timestamp": time.time()
    })

@app.get("/api/camera/capture")
@app.get("/api/capture_manual")
def camera_capture(request: Request, raw: bool = False, format: str = "json"):
    """Captura instantánea de alta resolución en Base64 o JPEG binario."""
    import base64
    high_frame = engine.get_snapshot()
    
    if high_frame is None or high_frame.size == 0:
        return JSONResponse({"status": "error", "message": "No hay fotograma disponible"}, status_code=400)
    
    _, jpg_bytes = cv2.imencode('.jpg', high_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    raw_bytes = jpg_bytes.tobytes()

    accept_hdr = request.headers.get("accept", "")
    if raw or format.lower() in ["raw", "binary", "jpg", "jpeg"] or "image/" in accept_hdr:
        return Response(content=raw_bytes, media_type="image/jpeg")

    b64_str = base64.b64encode(raw_bytes).decode('utf-8')
    h, w = high_frame.shape[:2]
    return JSONResponse({
        "status": "success",
        "image": f"data:image/jpeg;base64,{b64_str}",
        "width": w,
        "height": h,
        "source": engine.active_source,
        "timestamp": time.time()
    })

@app.websocket("/ws/live")
@app.websocket("/ws/telemetry")
async def websocket_live_stream(websocket: WebSocket):
    """Canal WebSocket binario JPEG a 30 FPS para compatibilidad con HTTPS en GitHub Pages."""
    await websocket.accept()
    stop_event = asyncio.Event()

    async def sender():
        last_sent_seq = -1
        try:
            while not stop_event.is_set():
                with engine.lock:
                    current_seq = engine.frame_seq
                    jpg_bytes = engine.latest_jpeg_small_bytes
                
                if jpg_bytes and current_seq != last_sent_seq:
                    last_sent_seq = current_seq
                    await websocket.send_bytes(jpg_bytes)
                
                await asyncio.sleep(0.020)
        except (WebSocketDisconnect, asyncio.CancelledError):
            stop_event.set()
        except Exception:
            stop_event.set()

    send_task = asyncio.create_task(sender())
    try:
        while not stop_event.is_set():
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except (WebSocketDisconnect, asyncio.CancelledError):
        stop_event.set()
    except Exception:
        stop_event.set()
    finally:
        send_task.cancel()

# --- MONTAJES ESTÁTICOS PARA TODA LA APP ---
if REPO_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(REPO_DIR)), name="static")
    app.mount("/", StaticFiles(directory=str(REPO_DIR), html=True), name="root_static")

if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    print("==================================================================")
    print(" 🔬 SERVIDOR PUENTE DE MICROSCOPIO MOTICAM 3.0 DEFINITIVO")
    print(" 🌐 Web Local:       http://localhost:8085/reportes.html")
    print(" 📹 Stream MJPEG:    http://localhost:8085/stream")
    print(" ⚡ WebSocket Live:  ws://localhost:8085/ws/live")
    print("==================================================================")
    uvicorn.run(app, host="0.0.0.0", port=8085, log_level="warning")
