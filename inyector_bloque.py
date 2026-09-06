"""
inyector_bloque.py - Inyector Atómico de Texto para MacroRecorder / Cortana
Inyección de alta velocidad (0 ms de latencia) mediante Win32 API Clipboard y SendInput.
"""

import ctypes
import time
import threading

# Win32 Constantes
GMEM_MOVEABLE = 0x0002
CF_UNICODETEXT = 13
KEYEVENTF_KEYUP = 0x0002
KEYEVENTF_UNICODE = 0x0004
VK_CONTROL = 0x11
VK_V = 0x56

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

# Tipos Win32 para SendInput
class KEYBDINPUT(ctypes.Structure):
    _fields_ = [
        ("wVk", ctypes.c_ushort),
        ("wScan", ctypes.c_ushort),
        ("dwFlags", ctypes.c_ulong),
        ("time", ctypes.c_ulong),
        ("dwExtraInfo", ctypes.POINTER(ctypes.c_ulong))
    ]

class HARDWAREINPUT(ctypes.Structure):
    _fields_ = [
        ("uMsg", ctypes.c_ulong),
        ("wParamL", ctypes.c_ushort),
        ("wParamH", ctypes.c_ushort)
    ]

class MOUSEINPUT(ctypes.Structure):
    _fields_ = [
        ("dx", ctypes.c_long),
        ("dy", ctypes.c_long),
        ("mouseData", ctypes.c_ulong),
        ("dwFlags", ctypes.c_ulong),
        ("time", ctypes.c_ulong),
        ("dwExtraInfo", ctypes.POINTER(ctypes.c_ulong))
    ]

class _INPUTunion(ctypes.Union):
    _fields_ = [
        ("mi", MOUSEINPUT),
        ("ki", KEYBDINPUT),
        ("hi", HARDWAREINPUT)
    ]

class INPUT(ctypes.Structure):
    _fields_ = [
        ("type", ctypes.c_ulong),
        ("union", _INPUTunion)
    ]

_lock_inyeccion = threading.Lock()

def _leer_clipboard_win32():
    """Lee el texto actual del portapapeles de Windows de forma segura."""
    if not user32.OpenClipboard(None):
        return None
    try:
        handle = user32.GetClipboardData(CF_UNICODETEXT)
        if not handle:
            return None
        ptr = kernel32.GlobalLock(handle)
        if not ptr:
            return None
        try:
            texto = ctypes.c_wchar_p(ptr).value
            return texto
        finally:
            kernel32.GlobalUnlock(handle)
    finally:
        user32.CloseClipboard()

def _escribir_clipboard_win32(texto):
    """Escribe texto en el portapapeles de Windows de forma directa y atómica."""
    for _ in range(5):
        if user32.OpenClipboard(None):
            break
        time.sleep(0.01)
    else:
        return False

    try:
        user32.EmptyClipboard()
        if texto is None:
            return True

        texto_unicode = str(texto)
        tamano_bytes = (len(texto_unicode) + 1) * 2  # UTF-16 wchar_t = 2 bytes

        h_global = kernel32.GlobalAlloc(GMEM_MOVEABLE, tamano_bytes)
        if not h_global:
            return False

        ptr = kernel32.GlobalLock(h_global)
        if not ptr:
            kernel32.GlobalFree(h_global)
            return False

        try:
            ctypes.memmove(ptr, ctypes.c_wchar_p(texto_unicode), tamano_bytes)
        finally:
            kernel32.GlobalUnlock(h_global)

        if not user32.SetClipboardData(CF_UNICODETEXT, h_global):
            kernel32.GlobalFree(h_global)
            return False

        return True
    finally:
        user32.CloseClipboard()

def _simular_ctrl_v():
    """Emite pulsación Ctrl + V a nivel de hardware/kernel."""
    # Ctrl down
    user32.keybd_event(VK_CONTROL, 0, 0, 0)
    # V down
    user32.keybd_event(VK_V, 0, 0, 0)
    time.sleep(0.015)
    # V up
    user32.keybd_event(VK_V, 0, KEYEVENTF_KEYUP, 0)
    # Ctrl up
    user32.keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0)

def _inyectar_por_teclado_unicode(texto):
    """Inyección directa mediante eventos SendInput KEYEVENTF_UNICODE."""
    if not texto:
        return

    entradas = []
    for char in texto:
        code_point = ord(char)
        if char == '\n':
            # VK_RETURN
            inp_down = INPUT(type=1)
            inp_down.union.ki = KEYBDINPUT(wVk=0x0D, wScan=0, dwFlags=0, time=0, dwExtraInfo=None)
            inp_up = INPUT(type=1)
            inp_up.union.ki = KEYBDINPUT(wVk=0x0D, wScan=0, dwFlags=KEYEVENTF_KEYUP, time=0, dwExtraInfo=None)
            entradas.extend([inp_down, inp_up])
        else:
            inp_down = INPUT(type=1)
            inp_down.union.ki = KEYBDINPUT(wVk=0, wScan=code_point, dwFlags=KEYEVENTF_UNICODE, time=0, dwExtraInfo=None)
            inp_up = INPUT(type=1)
            inp_up.union.ki = KEYBDINPUT(wVk=0, wScan=code_point, dwFlags=KEYEVENTF_UNICODE | KEYEVENTF_KEYUP, time=0, dwExtraInfo=None)
            entradas.extend([inp_down, inp_up])

    if entradas:
        array_entradas = (INPUT * len(entradas))(*entradas)
        user32.SendInput(len(entradas), array_entradas, ctypes.sizeof(INPUT))

def inyectar_bloque_atómico(texto, forzar_teclado=False):
    """
    Inyecta texto en la ventana activa con latencia cero.
    Si forzar_teclado=True (ej. Samsung Flow, consolas o RDP), usa SendInput Unicode.
    De lo contrario, usa portapapeles Win32 atómico + Ctrl+V con restauración de portapapeles.
    """
    if not texto:
        return

    with _lock_inyeccion:
        if forzar_teclado:
            _inyectar_por_teclado_unicode(texto)
            return

        # 1. Respaldar portapapeles anterior
        texto_anterior = _leer_clipboard_win32()

        # 2. Inyectar nuevo texto al portapapeles
        exito = _escribir_clipboard_win32(texto)
        if not exito:
            # Fallback a teclado directo si falló el portapapeles
            _inyectar_por_teclado_unicode(texto)
            return

        # 3. Pegar en ventana destino
        time.sleep(0.01)
        _simular_ctrl_v()
        time.sleep(0.035)

        # 4. Restaurar portapapeles anterior en hilo diferido
        def _restaurar():
            time.sleep(0.2)
            try:
                if texto_anterior is not None:
                    _escribir_clipboard_win32(texto_anterior)
            except Exception:
                pass

        threading.Thread(target=_restaurar, daemon=True).start()

def inyectar_bloque_atomico(texto, forzar_teclado=False):
    """Alias sin tilde para compatibilidad."""
    return inyectar_bloque_atómico(texto, forzar_teclado)
