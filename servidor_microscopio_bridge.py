"""
==============================================================================
SERVIDOR PUENTE DE STREAMING Y CAPTURA PARA MICROSCOPIO MOTICAM 3.0
Dr. Castillo - Sistema de Patología Digital y Reportes Anatomopatológicos
==============================================================================
"""

import sys
import os
import time
import json
import asyncio
import threading
import ctypes
from ctypes import wintypes
from pathlib import Path
import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

# Configuración de Windows Desktop para captura GDI interactiva
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

class MicroscopeStreamEngine:
    def __init__(self):
        self.lock = threading.Lock()
        self.latest_frame = None
        self.latest_jpeg_bytes = None
        self.latest_jpeg_small_bytes = None
        self.main_hwnd = None
        self.child_hwnd = None
        self.last_win_search = 0.0
        self.running = True
        self.clients = set()
        
        # Iniciar hilo de captura continua
        self.thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.thread.start()

    def attach_desktop(self):
        try:
            hdesk = user32.OpenInputDesktop(0, False, 0x01FF)
            if hdesk:
                user32.SetThreadDesktop(hdesk)
        except Exception:
            pass

    def find_motic_windows(self):
        self.last_win_search = time.time()
        self.attach_desktop()
        WNDENUMPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
        candidates = []
        
        def enum_win(hwnd, lparam):
            if user32.IsWindowVisible(hwnd) or user32.IsIconic(hwnd):
                buff = ctypes.create_unicode_buffer(256)
                user32.GetWindowTextW(hwnd, buff, 256)
                txt = buff.value.lower()
                if "motic" in txt or "live imaging" in txt:
                    candidates.append(hwnd)
            return True
        
        user32.EnumWindows(WNDENUMPROC(enum_win), 0)
        
        if candidates:
            self.main_hwnd = candidates[0]
            if user32.IsIconic(self.main_hwnd):
                user32.ShowWindow(self.main_hwnd, 4) # SW_SHOWNOACTIVATE
            
            children = []
            def enum_child(chwnd, lparam):
                cclass = ctypes.create_unicode_buffer(256)
                user32.GetClassNameW(chwnd, cclass, 256)
                rc = RECT()
                user32.GetClientRect(chwnd, ctypes.byref(rc))
                w = rc.right - rc.left
                h = rc.bottom - rc.top
                children.append((chwnd, cclass.value, w, h))
                return True
            
            user32.EnumChildWindows(self.main_hwnd, WNDENUMPROC(enum_child), 0)
            
            # Buscar el viewport hijo #32770
            for chwnd, cclass, w, h in children:
                if cclass == "#32770" and w > 400 and h > 300:
                    self.child_hwnd = chwnd
                    return
            if children:
                children.sort(key=lambda x: x[2]*x[3], reverse=True)
                self.child_hwnd = children[0][0]

    def _grab_from_hwnd(self) -> np.ndarray:
        if not self.child_hwnd or not user32.IsWindow(self.child_hwnd):
            if time.time() - self.last_win_search > 2.0:
                self.find_motic_windows()
        if not self.child_hwnd or not user32.IsWindow(self.child_hwnd):
            return None

        rc = RECT()
        user32.GetClientRect(self.child_hwnd, ctypes.byref(rc))
        w = rc.right - rc.left
        h = rc.bottom - rc.top
        if w <= 50 or h <= 50:
            return None

        hdc_screen = user32.GetDC(0)
        hdc_mem = gdi32.CreateCompatibleDC(hdc_screen)
        hbm = gdi32.CreateCompatibleBitmap(hdc_screen, w, h)
        hold = gdi32.SelectObject(hdc_mem, hbm)

        user32.PrintWindow(self.child_hwnd, hdc_mem, 2)

        bmi = BITMAPINFO()
        bmi.bmiHeader.biSize = ctypes.sizeof(BITMAPINFOHEADER)
        bmi.bmiHeader.biWidth = w
        bmi.bmiHeader.biHeight = -h
        bmi.bmiHeader.biPlanes = 1
        bmi.bmiHeader.biBitCount = 32
        bmi.bmiHeader.biCompression = 0

        buf = ctypes.create_string_buffer(w * h * 4)
        gdi32.GetDIBits(hdc_mem, hbm, 0, h, buf, ctypes.byref(bmi), 0)

        gdi32.SelectObject(hdc_mem, hold)
        gdi32.DeleteObject(hbm)
        gdi32.DeleteDC(hdc_mem)
        user32.ReleaseDC(0, hdc_screen)

        arr = np.frombuffer(buf, dtype=np.uint8).reshape((h, w, 4))
        bgr = arr[:, :, :3]
        if bgr.mean() > 10:
            return bgr
        return None

    def _grab_fallback_screen(self) -> np.ndarray:
        # Si la ventana no está visible o no tiene foco, capturar área de pantalla central
        w = user32.GetSystemMetrics(0)
        h = user32.GetSystemMetrics(1)
        if w <= 0 or h <= 0:
            w, h = 1280, 800
        
        # Centrar región típica del microscopio Motic Live (ej: 80% pantalla)
        rw = int(w * 0.8)
        rh = int(h * 0.8)
        rx = (w - rw) // 2
        ry = (h - rh) // 2

        hdc_screen = user32.GetDC(0)
        hdc_mem = gdi32.CreateCompatibleDC(hdc_screen)
        hbm = gdi32.CreateCompatibleBitmap(hdc_screen, rw, rh)
        hold = gdi32.SelectObject(hdc_mem, hbm)

        SRCCOPY = 0x00CC0020
        gdi32.BitBlt(hdc_mem, 0, 0, rw, rh, hdc_screen, rx, ry, SRCCOPY)

        bmi = BITMAPINFO()
        bmi.bmiHeader.biSize = ctypes.sizeof(BITMAPINFOHEADER)
        bmi.bmiHeader.biWidth = rw
        bmi.bmiHeader.biHeight = -rh
        bmi.bmiHeader.biPlanes = 1
        bmi.bmiHeader.biBitCount = 32
        bmi.bmiHeader.biCompression = 0

        buf = ctypes.create_string_buffer(rw * rh * 4)
        gdi32.GetDIBits(hdc_mem, hbm, 0, rh, buf, ctypes.byref(bmi), 0)

        gdi32.SelectObject(hdc_mem, hold)
        gdi32.DeleteObject(hbm)
        gdi32.DeleteDC(hdc_mem)
        user32.ReleaseDC(0, hdc_screen)

        arr = np.frombuffer(buf, dtype=np.uint8).reshape((rh, rw, 4))
        return arr[:, :, :3]

    def _capture_loop(self):
        while self.running:
            try:
                frame = self._grab_from_hwnd()
                if frame is None:
                    frame = self._grab_fallback_screen()

                if frame is not None and frame.size > 0:
                    h, w = frame.shape[:2]
                    # Stream JPEG ligero para 30 FPS en tiempo real
                    target_w = 960
                    target_h = int(target_w * (h / w))
                    small = cv2.resize(frame, (target_w, target_h))
                    
                    _, jpeg_full = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
                    _, jpeg_small = cv2.imencode('.jpg', small, [int(cv2.IMWRITE_JPEG_QUALITY), 75])

                    with self.lock:
                        self.latest_frame = frame
                        self.latest_jpeg_bytes = jpeg_full.tobytes()
                        self.latest_jpeg_small_bytes = jpeg_small.tobytes()
                
                time.sleep(0.025) # ~40 FPS
            except Exception as e:
                time.sleep(0.05)

engine = MicroscopeStreamEngine()

app = FastAPI(title="Microscopio Motic Bridge & Web Live Stream")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir carpeta de la aplicación web localmente
REPO_DIR = Path(__file__).parent.resolve()
if REPO_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(REPO_DIR)), name="static")

@app.get("/")
@app.get("/reportes.html")
async def get_reportes_page():
    report_file = REPO_DIR / "reportes.html"
    if report_file.exists():
        return FileResponse(str(report_file))
    return HTMLResponse("<h2>Microscopio Bridge Activo (:8085). Inicie su aplicación web.</h2>")

@app.get("/stream")
@app.get("/video_feed")
async def video_stream(request: Request):
    """Stream MJPEG continuo para navegadores."""
    async def gen():
        while True:
            if await request.is_disconnected():
                break
            with engine.lock:
                jpg_bytes = engine.latest_jpeg_small_bytes
            if jpg_bytes:
                content_len = len(jpg_bytes)
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n'
                       b'Content-Length: ' + str(content_len).encode('ascii') + b'\r\n\r\n' + jpg_bytes + b'\r\n')
            await asyncio.sleep(0.033)
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
        dim = f"{engine.latest_frame.shape[1]}x{engine.latest_frame.shape[0]}" if has_frame else "0x0"
    return JSONResponse({
        "status": "online" if has_frame else "searching",
        "device": "Moticam 3.0 Live Stream",
        "resolution": dim,
        "motic_window_detected": bool(engine.child_hwnd)
    })

@app.get("/api/camera/capture")
@app.get("/api/capture_manual")
def camera_capture():
    """Captura instantánea de alta resolución en Base64."""
    import base64
    with engine.lock:
        jpg_bytes = engine.latest_jpeg_bytes
    if not jpg_bytes:
        return JSONResponse({"status": "error", "message": "No frame available"}, status_code=400)
    
    b64_str = base64.b64encode(jpg_bytes).decode('utf-8')
    return JSONResponse({
        "status": "success",
        "image": f"data:image/jpeg;base64,{b64_str}",
        "timestamp": time.time()
    })

@app.websocket("/ws/live")
@app.websocket("/ws/telemetry")
async def websocket_live_stream(websocket: WebSocket):
    """Canal WebSocket para transmisión binaria JPEG a páginas HTTPS (GitHub Pages)."""
    await websocket.accept()
    print("🔬 Conexión WebSocket establecida con la Web de Patología.")
    
    stop_event = asyncio.Event()

    async def sender():
        try:
            while not stop_event.is_set():
                with engine.lock:
                    jpg_bytes = engine.latest_jpeg_small_bytes
                if jpg_bytes:
                    await websocket.send_bytes(jpg_bytes)
                await asyncio.sleep(0.033) # 30 FPS
        except (WebSocketDisconnect, asyncio.CancelledError):
            stop_event.set()
        except Exception:
            stop_event.set()

    send_task = asyncio.create_task(sender())
    try:
        await stop_event.wait()
    finally:
        send_task.cancel()
        print("ℹ️ Conexión WebSocket cerrada.")

if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    print("==================================================================")
    print(" 🔬 SERVIDOR PUENTE DE MICROSCOPIO MOTICAM 3.0 ACTIVO")
    print(" 🌐 Web Local:       http://localhost:8085/reportes.html")
    print(" 📹 Stream MJPEG:    http://localhost:8085/stream")
    print(" ⚡ WebSocket Live:  ws://localhost:8085/ws/live")
    print("==================================================================")
    uvicorn.run(app, host="0.0.0.0", port=8085, log_level="warning")
