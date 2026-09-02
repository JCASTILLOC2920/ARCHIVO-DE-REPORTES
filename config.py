import os
import queue
import sqlite3
import threading
from collections import deque

# 🛡️ RECONOCIMIENTO DE VOZ - PARCHE DE COMPATIBILIDAD GOOGLE STT
try:
    import speech_recognition as sr
    if not hasattr(sr.Recognizer, 'recognize_google'):
        def _recognize_google_patched(self, audio_data, key=None, language='es-PE', show_all=False, with_confidence=False):
            return sr.google.recognize_legacy(self, audio_data, key=key, language=language, show_all=show_all, with_confidence=with_confidence)
        sr.Recognizer.recognize_google = _recognize_google_patched
except Exception as _e_sr:
    print(f"[CONFIG] Parche SpeechRecognition: {_e_sr}")

# ==========================================
# 📍 SISTEMA DE NAVEGACIÓN DINÁMICA (PORTABILIDAD USB)
# ==========================================
# Esto detecta en qué carpeta exacta está el proyecto, sin importar la letra del disco (C:, D:, E:, USB...)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

def ruta_absoluta(nombre_archivo):
    """Devuelve la ruta exacta y segura de cualquier archivo dentro del proyecto MACRORECORDER."""
    return os.path.join(BASE_DIR, nombre_archivo)
# ==========================================

# ⚡ CONFIGURACIÓN CRÍTICA DE AUDIO (MOTOR LOCAL)
# ==========================================
CHUNK_SIZE = 480 # Sincronizado para WebRTC VAD (30ms @ 16kHz)
FORMAT = 1 # 16-bit
CHANNELS = 1
RATE = 16000
SILENCE_THRESHOLD_ONLINE = 22 # 22 * 30ms = 660ms para respuesta ultra-rápida (Groq / Google STT)
SILENCE_THRESHOLD_OFFLINE = 22 # 22 * 30ms = 660ms para respuesta instantánea

# Parámetros del modelo (LEGACY - No necesarios para Google)
# MODEL_SIZE = "small"
# DEVICE = "cuda" # Cambiar a "cpu" si no hay NVIDIA
# COMPUTE_TYPE = "float16" # "int8" para CPU
RUTA_MODELO = ruta_absoluta("cerebro_ia")

# ==========================================
# 📡 ESTADO GLOBAL (ESTRICTO)
# ==========================================
escuchando = threading.Event()
escuchando_google = threading.Event()
escuchando_groq = threading.Event()
escuchando_offline = threading.Event()
usa_ia = False # V28: Control global de IA (Offline Pure)
modo_medico_activo = True # V32: Control de diccionario patológico
import ctypes
caps_lock_on = bool(ctypes.windll.user32.GetKeyState(0x14) & 0x0001)
# 🛡️ BLINDAJE MAESTRO v14.0
cola_red = queue.Queue()
ultimo_f9_time = 0

# 🎙️ MONITOR DE INTELIGENCIA (INVISIBLE-CONFIRM)
ultimo_log_id = None
timestamp_ultima_inyeccion = 0

def optimizar_compresion_memoria_ram():
    """Compresión de Memoria RAM Nivel Kernel (Windows Memory Compression + LZ4). Hace rendir 8GB como 16GB."""
    try:
        handle = ctypes.windll.kernel32.GetCurrentProcess()
        ctypes.windll.kernel32.SetProcessWorkingSetSize(handle, ctypes.c_size_t(-1), ctypes.c_size_t(-1))
        print("[⚡ COMPRESIÓN RAM] Páginas de memoria comprimidas a nivel Kernel Windows (Efecto 16GB RAM).")
    except Exception as e:
        print(f"[COMPRESIÓN RAM AVISO]: {e}")
confirmado_pendiente = False

# 🗝️ LLAVES DE GROQ (Cascada de Respaldo)
GROQ_API_KEYS = [
    "gsk_tu_primera_llave_aqui",
    "gsk_tu_segunda_llave_aqui",
    "gsk_tu_tercera_llave_aqui"
]
MODO_ACTUAL = "DICTADO"
cola_audio = queue.Queue()
cola_streaming = queue.Queue() # Streaming en vivo (Lápiz Borrable)
cola_gui = queue.Queue() # Mantiene la conexión con el Monitor
# 📡 BUS DE MENSAJES (v15.0 - AISLAMIENTO)
log_maestro = deque(maxlen=200) # Historial completo de todos los módulos
cola_inyeccion = queue.Queue() # NUEVO: Cola de inyección asíncrona v3.0
cola_vosk = queue.Queue() # NUEVO: Cola exclusiva para el Wake-Word de Vosk
caracteres_escritos = 0 # V30: Contador para el borrado del streaming
historial_escritos = deque(maxlen=50) # V4.0: Buffer para Undo Atómico
tiempo_ultimo_f9 = 0
gui = None # Referencia para la interfaz
callback_servidor = None # V31: Callback para iniciar la red bajo demanda
websocket_activo = None # 📡 Referencia de Túnel de Voz (Grado Militar)
MIC_NAME = "NVIDIA Broadcast" # O "RTX Voice" (Dispositivo filtrado)

# 🔒 ESCUDO DE AISLAMIENTO (V15.0)
bloqueos = {
    "TECLADO": threading.Lock(),
    "MICROFONO": threading.Lock(),
    "ROBOT": threading.Lock()
}
bloqueo_inyeccion = threading.Lock()
ultimo_segmento_id = 0 

def registrar_evento(modulo, mensaje, es_critico=False):
    """Canaliza y etiqueta cada acción para evitar ejecución cruzada visual."""
    msg_formateado = f"[{modulo}] {mensaje}"
    # --- MODO DIAGNÓSTICO PROFUNDO: FORZADO DE CONSOLA ---
    try:
        print(msg_formateado)
    except:
        pass
    log_maestro.append(msg_formateado)
    if es_critico or MODO_ACTUAL == modulo or modulo == "SISTEMA":
        cola_gui.put(f"{modulo}:{mensaje}")

# ==========================================
# 📂 GESTOR DE PLANTILLAS
# ==========================================
import database_manager
def obtener_plantilla(comando_voz):
    return database_manager.buscar_plantilla_por_comando(comando_voz)

# ==========================================
# RUTAS DE INTERFAZ (AVATAR CORTANA RESTAURADO)
# ==========================================
VIDEO_IDLE = "audios/Asistente_E.mp4" 
VIDEO_INICIO = "audios/Bot_Iniciando.mp4" 
VIDEO_ESCUCHANDO = "audios/cortana_escuchando.mp4"
VIDEO_HABLANDO = "audios/Asistente_H.mp4"

# Señal de estado para sincronización con GUI
motores_listos = threading.Event()
