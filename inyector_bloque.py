import ctypes
from ctypes import wintypes
import time
import sys
import os

# ==========================================
# 🛡️ INYECTOR DE BLOQUE + ESCUDO DE RESPALDO (NÚCLEO UNIFICADO 64-BITS)
# ==========================================
# Protocolo Antigravity v8.5 (Cero Pérdida de Datos, Cero Librerías Externas Rota).

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

CF_UNICODETEXT = 13
GMEM_MOVEABLE = 0x0002
INPUT_KEYBOARD = 1
KEYEVENTF_UNICODE = 0x0004
KEYEVENTF_KEYUP = 0x0002

# --- BLINDAJE DE PUNTEROS (64-BITS WINDOWS API) ---
user32.OpenClipboard.argtypes = [wintypes.HWND]
user32.OpenClipboard.restype = wintypes.BOOL

user32.CloseClipboard.argtypes = []
user32.CloseClipboard.restype = wintypes.BOOL

user32.EmptyClipboard.argtypes = []
user32.EmptyClipboard.restype = wintypes.BOOL

user32.GetClipboardData.argtypes = [wintypes.UINT]
user32.GetClipboardData.restype = wintypes.HANDLE

user32.SetClipboardData.argtypes = [wintypes.UINT, wintypes.HANDLE]
user32.SetClipboardData.restype = wintypes.HANDLE

user32.EnumClipboardFormats.argtypes = [wintypes.UINT]
user32.EnumClipboardFormats.restype = wintypes.UINT

kernel32.GlobalAlloc.argtypes = [wintypes.UINT, ctypes.c_size_t]
kernel32.GlobalAlloc.restype = wintypes.HANDLE

kernel32.GlobalLock.argtypes = [wintypes.HANDLE]
kernel32.GlobalLock.restype = wintypes.LPVOID

kernel32.GlobalUnlock.argtypes = [wintypes.HANDLE]
kernel32.GlobalUnlock.restype = wintypes.BOOL

kernel32.GlobalSize.argtypes = [wintypes.HANDLE]
kernel32.GlobalSize.restype = ctypes.c_size_t

kernel32.GlobalFree.argtypes = [wintypes.HANDLE]
kernel32.GlobalFree.restype = wintypes.HANDLE

# Estructuras para SendInput CTypes NATIVAS
class KEYBDINPUT(ctypes.Structure):
    _fields_ = [
        ("wVk", wintypes.WORD),
        ("wScan", wintypes.WORD),
        ("dwFlags", wintypes.DWORD),
        ("time", wintypes.DWORD),
        ("dwExtraInfo", ctypes.POINTER(ctypes.c_ulong))
    ]

class INPUT(ctypes.Structure):
    class _INPUT_UNION(ctypes.Union):
        _fields_ = [("ki", KEYBDINPUT)]
    _anonymous_ = ("_union",)
    _fields_ = [
        ("type", wintypes.DWORD),
        ("_union", _INPUT_UNION)
    ]

user32.SendInput.argtypes = [wintypes.UINT, ctypes.POINTER(INPUT), ctypes.c_int]
user32.SendInput.restype = wintypes.UINT

def teclear_texto_native(text):
    """Tecleo simulado a nivel hardware usando keybd_event Unicode de compatibilidad universal 100% Windows."""
    if not text: return
    liberar_teclas_modificadoras()
    KEYEVENTF_UNICODE = 0x0004
    KEYEVENTF_KEYUP = 0x0002
    for char in text:
        scan = ord(char)
        # Key down (VK=0, ScanCode=ord(char), Flags=KEYEVENTF_UNICODE)
        user32.keybd_event(0, scan, KEYEVENTF_UNICODE, 0)
        # Key up
        user32.keybd_event(0, scan, KEYEVENTF_UNICODE | KEYEVENTF_KEYUP, 0)
        time.sleep(0.003)

def backup_clipboard():
    """Respalda absolutamente todos los formatos del portapapeles (incluyendo imágenes/capturas)."""
    backup = {}
    if not user32.OpenClipboard(None):
        return None
    try:
        fmt = user32.EnumClipboardFormats(0)
        while fmt:
            h_mem = user32.GetClipboardData(fmt)
            if h_mem:
                size = kernel32.GlobalSize(h_mem)
                if size > 0:
                    ptr = kernel32.GlobalLock(h_mem)
                    if ptr:
                        try:
                            data = ctypes.string_at(ptr, size)
                            backup[fmt] = data
                        finally:
                            kernel32.GlobalUnlock(h_mem)
            fmt = user32.EnumClipboardFormats(fmt)
    except Exception as e:
        print(f"[PORTAPAPELES BACKUP ERROR]: {e}")
    finally:
        user32.CloseClipboard()
    return backup

def restore_clipboard(backup):
    """Restaura todos los formatos respaldados al portapapeles."""
    if not backup:
        return
    if not user32.OpenClipboard(None):
        return
    try:
        user32.EmptyClipboard()
        for fmt, data in backup.items():
            h_mem = kernel32.GlobalAlloc(GMEM_MOVEABLE, len(data))
            if h_mem:
                ptr = kernel32.GlobalLock(h_mem)
                if ptr:
                    try:
                        ctypes.memmove(ptr, data, len(data))
                    finally:
                        kernel32.GlobalUnlock(h_mem)
                    
                    if not user32.SetClipboardData(fmt, h_mem):
                        kernel32.GlobalFree(h_mem)
    except Exception as e:
        print(f"[PORTAPAPELES RESTORE ERROR]: {e}")
    finally:
        user32.CloseClipboard()

def get_clipboard_text():
    """Lee el contenido actual con bucle de reintento para evitar colisiones."""
    abierto = False
    for i in range(5):
        if user32.OpenClipboard(None):
            abierto = True
            break
        time.sleep(0.01 * (i + 1))
    
    if not abierto: return None
    
    try:
        h_mem = user32.GetClipboardData(CF_UNICODETEXT)
        if not h_mem: return None
        ptr = kernel32.GlobalLock(h_mem)
        if not ptr: return None 
        
        text = ctypes.wstring_at(ptr)
        kernel32.GlobalUnlock(h_mem)
        return text
    except:
        return None
    finally:
        user32.CloseClipboard()

def set_clipboard_text(text):
    """Carga texto con blindaje de colisión y reintentos."""
    if not isinstance(text, str): return False
    
    abierto = False
    for i in range(5):
        if user32.OpenClipboard(None):
            abierto = True
            break
        time.sleep(0.01 * (i + 1))
        
    if not abierto: return False
    
    try:
        user32.EmptyClipboard()
        text_utf16 = text.encode('utf-16le') + b'\x00\x00'
        
        h_mem = kernel32.GlobalAlloc(GMEM_MOVEABLE, len(text_utf16))
        if not h_mem: return False 
        
        ptr = kernel32.GlobalLock(h_mem)
        if not ptr: 
            kernel32.GlobalFree(h_mem)
            return False 
            
        ctypes.memmove(ptr, text_utf16, len(text_utf16))
        kernel32.GlobalUnlock(h_mem)
        
        if not user32.SetClipboardData(CF_UNICODETEXT, h_mem):
            kernel32.GlobalFree(h_mem)
            return False
    except:
        return False
    finally:
        user32.CloseClipboard()
    return True

def borrado_militar_portapapeles():
    """Vaciado Atómico del Portapapeles."""
    if user32.OpenClipboard(None):
        user32.EmptyClipboard()
        user32.CloseClipboard()
        return True
    return False

def liberar_teclas_modificadoras():
    """Libera forzosamente cualquier tecla modificadora física (Alt, Shift, Ctrl) sostenida por el usuario para evitar combos indeseados como Ctrl+Alt+V."""
    user32.keybd_event(0x12, 0, 2, 0) # Alt Up
    user32.keybd_event(0x10, 0, 2, 0) # Shift Up
    user32.keybd_event(0x11, 0, 2, 0) # Ctrl Up

def mandar_pegar():
    """Ejecuta Ctrl + V a nivel de hardware simulado tras liberar teclas modificadoras del usuario."""
    liberar_teclas_modificadoras()
    time.sleep(0.01)
    user32.keybd_event(0x11, 0, 0, 0) # Ctrl Down
    user32.keybd_event(0x56, 0, 0, 0) # V Down
    user32.keybd_event(0x56, 0, 2, 0) # V Up
    user32.keybd_event(0x11, 0, 2, 0) # Ctrl Up

def inyectar_bloque_atómico(texto, forzar_teclado=False):
    """Inyector Híbrido Dinámico (40x Aceleración): Conmutación entre Portapapeles OLE (0.025s) y Tecleo Hardware (1ms/char)."""
    if not texto: return
    
    liberar_teclas_modificadoras()
    
    # Para textos cortos (<= 5 caracteres), tecleo directo ultra-rápido por hardware
    if len(texto) <= 5 and not forzar_teclado:
        teclear_texto_native(texto)
        return

    # Para frases, párrafos y plantillas, inyección atómica hiper-optimizada vía Portapapeles OLE (0.03s)
    if not forzar_teclado and set_clipboard_text(texto):
        time.sleep(0.025)
        mandar_pegar()
        time.sleep(0.01)
    else:
        teclear_texto_native(texto)

# Alias de compatibilidad fonética/ortográfica
inyectar_bloque_atímico = inyectar_bloque_atómico
