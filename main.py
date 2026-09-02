import sys
import codecs
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
import time
import winsound
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.environ["HF_HUB_CACHE"] = os.path.abspath("cerebro_ia")
import ctypes
import sys, os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# 🚀 PARCHE DE PORTABILIDAD GRÁFICA (Tcl/Tk local-only)
os.environ["TCL_LIBRARY"] = os.path.join(BASE_DIR, "python_base", "tcl", "tcl8.6")
os.environ["TK_LIBRARY"] = os.path.join(BASE_DIR, "python_base", "tcl", "tk8.6")
import config
import subprocess
import threading
import gc
import logging

# --- SEMÁFORO TÁCTICO GLOBAL ---
ESTADO_SISTEMA_F3_ACTIVO = False 
# Aplicacion se importa bajo demanda en __main__ para arranque Ghost-Boot

def rastro_forense(mensaje):
    """Escribe un rastro de bajo nivel en el disco para depuración de fallos críticos de arranque."""
    try:
        ruta_trace = config.ruta_absoluta("BOOT_TRACE.txt")
        with open(ruta_trace, "a", encoding="utf-8") as f:
            f.write(f"[{time.strftime('%H:%M:%S')}] {mensaje}\n")
    except: pass

#  CAJA NEGRA Y REDIRECCIÓN TOTAL (V55)
# ==========================================
class LoggerForense:
    def __init__(self, filename):
        self.terminal = sys.stdout
        try:
            self.log = open(filename, "a", encoding="utf-8")
        except PermissionError:
            print(f"[ ALERTA] Log '{filename}' bloqueado por otra instancia. Limpiando...")
            self.log = None
    def write(self, message):
        self.terminal.write(message)
        if self.log:
            try:
                self.log.write(message)
                self.log.flush()
            except: pass
    def flush(self):
        self.terminal.flush()
        if self.log:
            try: self.log.flush()
            except: pass

def inicializar_sistema_forense():
    """Inicializa carpetas y logs de forma segura después de la limpieza."""
    try:
        # 1. Rutas
        os.makedirs(config.ruta_absoluta('capturas_fotos'), exist_ok=True)
        upload_root = config.ruta_absoluta("macros_receibidas")
        os.makedirs(os.path.join(upload_root, "bruto"), exist_ok=True)
        os.makedirs(os.path.join(upload_root, "optimizado"), exist_ok=True)
        
        # 2. Redirección de Logs con rotación automática (máx 1MB)
        ruta_log = config.ruta_absoluta("salida_sistema_cortana.log")
        if os.path.exists(ruta_log) and os.path.getsize(ruta_log) > 1024 * 1024:
            try:
                with open(ruta_log, "w", encoding="utf-8") as f:
                    f.write(f"--- LOG ROTADO POR PURGA DE OPTIMIZACIÓN [{time.ctime()}] ---\n")
            except: pass
        sys.stdout = LoggerForense(ruta_log)
        sys.stderr = sys.stdout
        
        ruta_diag = config.ruta_absoluta('error_log_diagnostico.txt')
        logging.basicConfig(
            filename=ruta_diag, 
            level=logging.ERROR, 
            format='%(asctime)s - [%(levelname)s] - %(message)s'
        )
        
        def manejador_errores_global(etype, value, tb):
            logging.critical("CRASH DETECTADO", exc_info=(etype, value, tb))
        sys.excepthook = manejador_errores_global
    except:
        print("[] Error crítico inicializando sistema forense. Continuando en modo terminal.")

def beep_seguro(f, d): threading.Thread(target=lambda: winsound.Beep(f, d), daemon=True).start()

def limpiar_residuos_cortana():
    """Detecta y elimina procesos de Python que ejecutan main.py en este directorio."""
    import re
    rastro_forense("PASO 2-A: Iniciando WMIC...")
    try:
        mi_pid = os.getpid()
        #  PROTOCOLO WMIC: Evitar shell=True y capturar pythonw.exe también
        cmd = ["wmic", "process", "where", "name='python.exe' or name='pythonw.exe'", "get", "ProcessID,CommandLine"]
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        rastro_forense("PASO 2-B: Comunicando con WMIC...")
        salida_raw, _ = proc.communicate()
        
        # Decodificación segura
        salida = salida_raw.decode('cp850', errors='ignore')
        rastro_forense(f"PASO 2-C: WMIC capturado ({len(salida)} bytes)")
        
        script_path = os.path.abspath(__file__)
        dir_actual = os.path.dirname(script_path).lower()
        
        lineas = salida.strip().split('\n')[1:]
        purgados = 0
        
        for linea in lineas:
            if not linea.strip(): continue
            #  Regex para extraer PID (último número en la línea de wmic)
            match_pid = re.search(r'(\d+)\s*$', linea)
            if not match_pid: continue
            
            pid_val = int(match_pid.group(1))
            cmd_line = linea[:match_pid.start()].lower()
            
            if pid_val != mi_pid:
                #  PROTECCIÓN DE PADRE: No matar al proceso que nos acaba de lanzar
                try: 
                    if pid_val == os.getppid(): continue 
                except: pass
 
                #  PROTOCOLO DE PURGA RADICAL (v2.0)
                # Si el proceso es main.py o gui_cortana.py y pertenece al ecosistema MacroRecorder
                if ("main.py" in cmd_line or "gui_cortana.py" in cmd_line) and "macrorecorder" in cmd_line:
                    rastro_forense(f"PASO 2-D: Purgando instancia ajena PID {pid_val}...")
                    subprocess.run(["taskkill", "/F", "/PID", str(pid_val)], capture_output=True)
                    purgados += 1
        
        if purgados > 0:
            print(f"\n[ LIMPIEZA] Se han purgado {purgados} procesos residuales.\n")
            time.sleep(0.5)
    except Exception as e:
        rastro_forense(f"PASO 2 ERROR: {e}")
        print(f"[ LIMPIEZA] Error menor omitido: {e}")

#  MONITOR DE LATIDO (HEARTBEAT OPTIMIZADO)
def monitor_latido():
    while True:
        try:
            ruta_heartbeat = config.ruta_absoluta("heartbeat.txt")
            with open(ruta_heartbeat, "w") as f:
                f.write(f"VIVO: {time.ctime()}")
            time.sleep(60) # Intervalo optimizado a 60s para reducir I/O de disco
        except: pass
threading.Thread(target=monitor_latido, daemon=True).start()

#  ESCUDO DE HOTKEYS (v15.0 - AISLAMIENTO)
def hotkey_blindado(tecla, func, modulo="DICTADO", *args, **kwargs):
    """Filtra la ejecución para que solo el módulo activo pueda disparar comandos."""
    def wrapper():
        # Los comandos de "SISTEMA" o "F9" ignoran el filtro de modo si se desea
        if config.MODO_ACTUAL == modulo or modulo == "SISTEMA":
            with config.bloqueos["TECLADO"]:
                func(*args, **kwargs)
        else:
            config.registrar_evento("SISTEMA", f" Hotkey {tecla} bloqueado (Modo: {config.MODO_ACTUAL})")
    return wrapper

# ==========================================
#  LÓGICA DE CONTROL (F9)
# ==========================================
def apagar_todo_excluyente():
    """Apaga micrófonos y resetea modos de la GUI para transición limpia."""
    config.escuchando_google.clear()
    config.escuchando_groq.clear()
    config.escuchando_offline.clear()
    config.escuchando.clear()
    if config.gui:
        config.gui.root.after(0, lambda: config.gui.actualizar_estado_mic_google(False))
        config.gui.root.after(0, lambda: config.gui.actualizar_estado_mic_groq(False))
        config.gui.root.after(0, lambda: config.gui.actualizar_estado_mic_offline(False))
    with config.cola_audio.mutex:
        config.cola_audio.queue.clear()
    with config.cola_streaming.mutex:
        config.cola_streaming.queue.clear()

def accion_f1_unificada():
    """Shift+F1: Modo DICTADO + Micrófono GOOGLE (Excluyente)"""
    if config.escuchando_google.is_set():
        apagar_todo_excluyente()
        beep_seguro(800, 100)
        if config.gui: config.gui.actualizar_video_seguro(config.VIDEO_IDLE)
    else:
        apagar_todo_excluyente()
        config.escuchando_google.set()
        config.escuchando.set()
        config.MODO_ACTUAL = "DICTADO"
        if config.gui:
            config.gui.root.after(0, lambda: config.gui.cambiar_modo("DICTADO"))
            config.gui.root.after(0, lambda: config.gui.actualizar_estado_mic_google(True))
            config.gui.actualizar_video_seguro(config.VIDEO_HABLANDO)
        beep_seguro(1200, 100)

def accion_f2_unificada():
    """Shift+F2: Modo DICTADO + Micrófono GROQ (Excluyente)"""
    if config.escuchando_groq.is_set():
        apagar_todo_excluyente()
        beep_seguro(800, 100)
        if config.gui: config.gui.actualizar_video_seguro(config.VIDEO_IDLE)
    else:
        apagar_todo_excluyente()
        config.escuchando_groq.set()
        config.escuchando.set()
        config.MODO_ACTUAL = "DICTADO"
        if config.gui:
            config.gui.root.after(0, lambda: config.gui.cambiar_modo("DICTADO"))
            config.gui.root.after(0, lambda: config.gui.actualizar_estado_mic_groq(True))
            config.gui.actualizar_video_seguro(config.VIDEO_HABLANDO)
        beep_seguro(1200, 100)

def accion_f3_unificada():
    """Shift+F3: Modo PLANTILLA (Excluyente)"""
    if config.MODO_ACTUAL == "PLANTILLA" and config.escuchando.is_set():
        apagar_todo_excluyente()
        beep_seguro(800, 100)
        if config.gui: config.gui.actualizar_video_seguro(config.VIDEO_IDLE)
    else:
        apagar_todo_excluyente()
        config.escuchando_offline.set()  # Plantillas usa Vosk
        config.escuchando.set()
        config.MODO_ACTUAL = "PLANTILLA"
        if config.gui:
            config.gui.root.after(0, lambda: config.gui.cambiar_modo("PLANTILLA"))
            config.gui.actualizar_video_seguro(config.VIDEO_HABLANDO)
        beep_seguro(1200, 100)

def accion_f4_unificada():
    """Shift+F4: Modo COMANDO (Excluyente)"""
    if config.MODO_ACTUAL == "COMANDO" and config.escuchando.is_set():
        apagar_todo_excluyente()
        beep_seguro(800, 100)
        if config.gui: config.gui.actualizar_video_seguro(config.VIDEO_IDLE)
    else:
        apagar_todo_excluyente()
        config.escuchando_google.set()  # Comando usa Google STT
        config.escuchando.set()
        config.MODO_ACTUAL = "COMANDO"
        if config.gui:
            config.gui.root.after(0, lambda: config.gui.cambiar_modo("COMANDO"))
            config.gui.actualizar_video_seguro(config.VIDEO_HABLANDO)
        beep_seguro(1200, 100)

def accion_f5_unificada():
    """Shift+F5: Modo DICTADO + Micrófono OFFLINE (Excluyente)"""
    if config.escuchando_offline.is_set():
        apagar_todo_excluyente()
        beep_seguro(800, 100)
        if config.gui: config.gui.actualizar_video_seguro(config.VIDEO_IDLE)
    else:
        apagar_todo_excluyente()
        config.escuchando_offline.set()
        config.escuchando.set()
        config.MODO_ACTUAL = "DICTADO"
        if config.gui:
            config.gui.root.after(0, lambda: config.gui.cambiar_modo("DICTADO"))
            config.gui.root.after(0, lambda: config.gui.actualizar_estado_mic_offline(True))
            config.gui.actualizar_video_seguro(config.VIDEO_HABLANDO)
        beep_seguro(1200, 100)

# Registro de callbacks para comunicación directa GUI -> Lógica sin delay de teclado
config.callback_toggle_google = accion_f1_unificada
config.callback_toggle_groq = accion_f2_unificada
config.callback_toggle_offline = accion_f5_unificada
config.callback_toggle_plantilla = accion_f3_unificada
config.callback_toggle_comando = accion_f4_unificada

def toggle_mic():
    accion_f1_unificada()
    
#  MOTOR DE EVENTOS TÁCTICOS (v15.5)
f2_presionado_time = 0

def f2_evento_presion(e):
    global f2_presionado_time
    if f2_presionado_time == 0:
        f2_presionado_time = time.time()

def f2_evento_liberacion(e):
    global f2_presionado_time
    duracion = time.time() - f2_presionado_time
    f2_presionado_time = 0
    
    if duracion > 0.5:
        from modulos.plantilla import disparar_comando_local
        disparar_comando_local()
    else:
        if config.gui: 
            config.gui.root.after(0, lambda: config.gui.actualizar_modo_seguro("PLANTILLA"))
            print("\n[SISTEMA]  MODO EXCLUSIVO: PLANTILLA (F2) ACTIVADO\n")
    
    if config.escuchando.is_set(): 
        import inyector_bloque as ib
        ib.borrado_militar_portapapeles()
        beep_seguro(1500, 150)
        if config.gui: config.gui.actualizar_video_seguro(config.VIDEO_HABLANDO)
    else: 
        beep_seguro(1000, 150)
        if config.gui: config.gui.actualizar_video_seguro(config.VIDEO_IDLE)

def lanzar_modulo(nombre, funcion):
    try:
        hilo = threading.Thread(target=funcion, name=nombre)
        hilo.daemon = True
        hilo.start()
        print(f"[OK] Módulo {nombre} blindado y activo.")
        return hilo
    except Exception as e:
        logging.error(f"Error {nombre}: {e}")
        return None

# ==========================================
# MOTOR WEB, VOZ Y FOTOS (LAZY LOADING v8.6)
# ==========================================
app_flask = None
sock = None
servidor_hilo = None

def _asegurar_flask():
    global app_flask, sock
    if app_flask is not None: return

    from flask import Flask, send_from_directory, request, jsonify
    from flask_sock import Sock
    from werkzeug.utils import secure_filename

    app_flask = Flask(__name__, template_folder='templates')
    app_flask.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 
    sock = Sock(app_flask)

    @app_flask.route('/')
    def index():
        """Punto de entrada de la interfaz táctica."""
        return send_from_directory('templates', 'index.html')

    @app_flask.route('/get_audio/<filename>')
    def servir_audio_confirmacion(filename):
        """Servidor de Activos de Voz (Militar)."""
        return send_from_directory('.', filename)

    @app_flask.route('/subir_foto', methods=['POST'])
    @app_flask.route('/upload', methods=['POST'])
    def subir_foto():
        """Soporta tanto la interfaz móvil original como la nueva con Verificación Militar."""
        campo = 'foto' if 'foto' in request.files else 'file'
        if campo not in request.files: return jsonify({"error": "No hay archivo"}), 400
        
        file = request.files[campo]
        if file.filename == '': return jsonify({"error": "No hay nombre"}), 400
        
        #  GESTIÓN DE CÓDIGO (CÓDIGO DE LA MUERTE)
        codigo = request.form.get('codigo', '').strip().upper()
        if codigo:
            timestamp = int(time.time())
            filename = secure_filename(f"{codigo}_{timestamp}.jpg")
        else:
            filename = secure_filename(file.filename)
            
        raw_path = os.path.join(UPLOAD_FOLDER, "bruto", filename)
        
        try:
            os.makedirs(os.path.dirname(raw_path), exist_ok=True)
            file.save(raw_path)
            
            #  PROTOCOLO ANTIGRAVITY: VERIFICACIÓN DE INTEGRIDAD MILITAR
            from asistente_seguridad import BunkerVerificador
            from notificador_militar import NotificadorMilitar
            import random
            
            es_valida, info = BunkerVerificador.es_foto_valida(raw_path)
            
            # Selección de audio para el celular en caso de éxito
            audio_confirmacion = None
            if es_valida:
                audio_confirmacion = random.choice(NotificadorMilitar.AUDIOS_CONFIRMACION)
            
            # Alerta dual (PC y Celular) + Sonidos Tácticos (PC)
            NotificadorMilitar.alerta_foto_recibida(filename, info, es_valida)
            
            if not es_valida:
                path_corruptas = os.path.join(UPLOAD_FOLDER, "corruptas")
                os.makedirs(path_corruptas, exist_ok=True)
                os.replace(raw_path, os.path.join(path_corruptas, filename))
                return jsonify({"error": f"Fallo de Integridad: {info}"}), 422
            
            f_size = os.path.getsize(raw_path) / 1024
            print(f"[ SERVIDOR] Foto Verificada: {filename} ({f_size:.1f} KB)")
            
            return jsonify({
                "message": "Recibida y Verificada", 
                "archivo": filename, 
                "size": f_size,
                "audio_confirmacion": audio_confirmacion
            }), 200
            
        except Exception as e:
            print(f"[ ERROR FOTO]: {e}")
            return jsonify({"error": "Fallo crítico al procesar imagen"}), 500

    @sock.route('/ws')
    def tunel_voz_unificado(ws):
        procesar_ws_audio(ws)

def iniciar_servidor_web():
    _asegurar_flask()
    print("[SERVIDOR] Lanzando Búnker Unificado en puerto 5000...")
    import logging as flask_logging
    flask_logging.getLogger('werkzeug').disabled = True 
    app_flask.run(host='0.0.0.0', port=5000, threaded=True, use_reloader=False)

def toggle_servidor_remoto():
    global servidor_hilo
    if servidor_hilo is None or not servidor_hilo.is_alive():
        servidor_hilo = lanzar_modulo("TÚNEL_WIFI", iniciar_servidor_web)
        return True
    return False

# ==========================================
#  TÚNEL DE VOZ ULTRA-RÁPIDO (CORTANA)
# ==========================================
def procesar_ws_audio(ws):
    import webrtcvad
    import json
    vad = webrtcvad.Vad(2)
    buffer_voz = bytearray()
    vad_bytes_buffer = bytearray()
    cont_silencio = 0
    hablando = False
    ultimo_sn = -1
    paquetes_perdidos = 0
    
    #  ENLACE GLOBAL: Guardar WS para notificaciones de IA (V4.2)
    config.websocket_activo = ws
    
    print("\n[ TÚNEL UNIFICADO] Sistema Aegis-SN Enlazado.")
    if config.gui: config.gui.actualizar_video_seguro(config.VIDEO_HABLANDO)
    
    while True:
        try:
            mensaje = ws.receive()
            if mensaje is None: break
            
            if isinstance(mensaje, str):
                if mensaje == "STOP" and buffer_voz:
                    config.cola_audio.put([bytes(buffer_voz)])
                    buffer_voz = bytearray()
                    ultimo_sn = -1
                    if config.gui: config.gui.actualizar_video_seguro(config.VIDEO_IDLE)
                continue
            
            # --- PROTOCOLO AEGIS-SN (Grado Militar) ---
            # El primer byte es el número de secuencia (0-255)
            sn = mensaje[0]
            audio_raw = mensaje[1:]
            
            if ultimo_sn != -1:
                esperado = (ultimo_sn + 1) % 256
                if sn != esperado:
                    paquetes_perdidos += 1
                    msg_error = f" ALERTA: Pérdida de Paquetes ({sn} vs {esperado})"
                    msg_error = f"Audio Recortado"
                    print(f"\n[ AEGIS] {msg_error}")
                    config.registrar_evento("SISTEMA", msg_error, es_critico=True)
                    # Notificar al celular del fallo de integridad
                    try: ws.send(json.dumps({"event": "INTEGRITY_FAIL", "sn": sn}))
                    except: pass
            
            ultimo_sn = sn
            
            if config.escuchando.is_set():
                config.escuchando.clear()
                if config.gui: config.gui.root.after(0, lambda: config.gui.actualizar_estado_mic(False))
                print("[ TÚNEL] Micro local desactivado por actividad remota.")

            buffer_voz.extend(audio_raw)
            vad_bytes_buffer.extend(audio_raw)
            
            # Análisis de VAD en bloques de 30ms (960 bytes a 16kHz)
            while len(vad_bytes_buffer) >= 960:
                chunk_30ms = bytes(vad_bytes_buffer[:960])
                vad_bytes_buffer = vad_bytes_buffer[960:]
                try:
                    es_voz = vad.is_speech(chunk_30ms, config.RATE)
                    if es_voz:
                        hablando = True
                        cont_silencio = 0
                    else:
                        if hablando:
                            cont_silencio += 1
                    
                    # Si detectamos una pausa natural de silencio (SILENCE_THRESHOLD_ONLINE es 40, es decir 1.2s)
                    limite_silencio = getattr(config, 'SILENCE_THRESHOLD_ONLINE', 25)
                    if hablando and cont_silencio > limite_silencio:
                        if len(buffer_voz) > 8000:  # Al menos 250ms de audio para evitar disparos vacíos
                            config.cola_audio.put([bytes(buffer_voz)])
                            if config.gui: config.cola_gui.put("Oído: Frase detectada")
                            buffer_voz = bytearray()
                        hablando = False
                        cont_silencio = 0
                except Exception as e_vad:
                    pass

            if len(buffer_voz) > 144000:
                config.cola_audio.put([bytes(buffer_voz)])
                buffer_voz = bytearray()
                vad_bytes_buffer.clear()
                cont_silencio = 0
                hablando = False
                
        except Exception as e:
            print(f"[ TÚNEL] Conexión cerrada: {e}")
            break
    config.websocket_activo = None

def trabajador_red_isolee():
    """ ISOLATED SINK (v14.0): Desplaza el tráfico de red fuera del hilo de la GUI."""
    print("[NÚCLEO] Trabajador de Red (Isolated Sink) Activo.")
    while True:
        try:
            msg = config.cola_red.get()
            if msg is None: break
            if config.websocket_activo:
                try:
                    config.websocket_activo.send(msg)
                except: pass
            config.cola_red.task_done()
        except: time.sleep(1)

STOP_EVENT = threading.Event()

def vigilar_salud():
    print("[SISTEMA] Monitor de Salud en espera del inflado del cerebro...")
    
    #  BLOQUEO DE SEGURIDAD: Esperar hasta que config.motores_listos sea True
    while not getattr(config, 'motores_listos', False):
        if STOP_EVENT.is_set(): return
        time.sleep(2) 
        
    print("[SISTEMA] ¡Motores detectados! Iniciando vigilancia activa.")
    modulos_criticos = ["AUDIO_CORE", "IA_CORE"]
    while not STOP_EVENT.is_set():
        try:
            hilos_vivos = {h.name for h in threading.enumerate()}
            for mod in modulos_criticos:
                if mod not in hilos_vivos:
                    msg = f"CRÍTICO: El módulo {mod} ha colapsado. Intentando rescate..."
                    print(f"\n[!!!] {msg}")
                    logging.error(msg)
                    if config.gui: config.cola_gui.put(f"ERROR:Sistema inestable ({mod} DOWN)")
            STOP_EVENT.wait(30.0) 
        except:
            STOP_EVENT.wait(10.0)


def verificar_y_reparar_enlaces_modelos():
    """Verifica la validez de los enlaces simbólicos de los modelos Whisper.
    Si están rotos, vacíos o ausentes, los elimina y los vuelve a crear de forma relativa.
    Esto permite copiar la carpeta MACRORECORDER a cualquier disco/PC de forma 100% portable."""
    rastro_forense("PASO 3.5: Iniciando verificación de enlaces simbólicos...")
    print("[SISTEMA] Verificando integridad de modelos de voz locales...")
    
    modelos = {
        "medium": {
            "snapshot_dir": os.path.join("cerebro_ia", "models--Systran--faster-whisper-medium", "snapshots", "08e178d48790749d25932bbc082711ddcfdfbc4f"),
            "blobs_dir": os.path.join("cerebro_ia", "models--Systran--faster-whisper-medium", "blobs"),
            "links": {
                "config.json": "242aa06a480a7b5509375c645097e87af5136774",
                "model.bin": "9b45e1009dcc4ab601eff815b61d80e60ce3fd8c74c1a14f4a282258286b51ae",
                "tokenizer.json": "7818adb6de9fa3064d3ff81226fdd675be1f6344",
                "vocabulary.txt": "c9074644d9d1205686f16d411564729461324b75"
            }
        },
        "small": {
            "snapshot_dir": os.path.join("cerebro_ia", "models--Systran--faster-whisper-small", "snapshots", "536b0662742c02347bc0e980a01041f333bce120"),
            "blobs_dir": os.path.join("cerebro_ia", "models--Systran--faster-whisper-small", "blobs"),
            "links": {
                "config.json": "e5047537059bd8f182d9ca64c470201585015187",
                "model.bin": "3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671",
                "tokenizer.json": "7818adb6de9fa3064d3ff81226fdd675be1f6344",
                "vocabulary.txt": "c9074644d9d1205686f16d411564729461324b75"
            }
        }
    }
    
    base_path = os.path.abspath(os.path.dirname(__file__))
    
    for nombre_modelo, info in modelos.items():
        snap_dir_abs = os.path.join(base_path, info["snapshot_dir"])
        blobs_dir_abs = os.path.join(base_path, info["blobs_dir"])
        
        if not os.path.exists(blobs_dir_abs):
            print(f"[ALERTA] La carpeta de blobs para {nombre_modelo} no existe ({info['blobs_dir']}). Omitiendo.")
            continue
            
        os.makedirs(snap_dir_abs, exist_ok=True)
        
        for link_name, blob_hash in info["links"].items():
            link_path_abs = os.path.join(snap_dir_abs, link_name)
            target_rel = os.path.join("..", "..", "blobs", blob_hash)
            target_abs = os.path.join(blobs_dir_abs, blob_hash)
            
            if not os.path.exists(target_abs):
                print(f"[ALERTA] El blob {blob_hash} no existe. No se puede crear el enlace para {link_name}.")
                continue
                
            necesita_reparacion = False
            
            if not os.path.exists(link_path_abs):
                necesita_reparacion = True
                razon = "No existe"
            else:
                try:
                    size = os.path.getsize(link_path_abs)
                    if size == 0:
                        necesita_reparacion = True
                        razon = "Tamaño 0 bytes"
                except Exception as e:
                    necesita_reparacion = True
                    razon = f"Error al verificar: {e}"
            
            if necesita_reparacion:
                print(f"[AUTO-CURACIÓN] Reparando enlace: {info['snapshot_dir']}\\{link_name} ({razon})...")
                rastro_forense(f"Reparando {link_name} de {nombre_modelo}: {razon}")
                
                if os.path.lexists(link_path_abs) or os.path.exists(link_path_abs):
                    try:
                        os.remove(link_path_abs)
                    except Exception as e:
                        try:
                            os.rmdir(link_path_abs)
                        except Exception as e2:
                            print(f"[ERROR] No se pudo eliminar previo {link_name}: {e2}")
                            continue
                
                try:
                    cwd_previo = os.getcwd()
                    os.chdir(snap_dir_abs)
                    os.symlink(target_rel, link_name)
                    os.chdir(cwd_previo)
                    print(f"   [OK] Enlace simbólico {link_name} -> {target_rel} recreado.")
                except Exception as e:
                    print(f"   [ERROR] No se pudo crear symlink para {link_name}: {e}")
                    rastro_forense(f"Error creando symlink {link_name}: {e}")
                    try:
                        import shutil
                        shutil.copy2(target_abs, link_path_abs)
                        print(f"   [FALLBACK OK] Copiado archivo físico para {link_name}.")
                    except Exception as e_copy:
                        print(f"   [FALLBACK ERROR] Falló la copia física: {e_copy}")
                        
    rastro_forense("PASO 3.5 OK: Verificación de enlaces finalizada.")


if __name__ == "__main__":
    rastro_forense("--- INICIO DE SESIÓN CORTANA ---")
    try:
        rastro_forense("Paso 0: Imprimiendo bienvenida...")
        print("\n========================================")
        print("   SISTEMA CORTANA - NÚCLEO REFORZADO   ")
        print("========================================\n")

        #  PASO 1: VERIFICACIÓN DE PRIVILEGIOS
        rastro_forense("Paso 1: Verificando privilegios Admin...")
        try:
            is_admin = ctypes.windll.shell32.IsUserAnAdmin()
        except:
            is_admin = False

        if not is_admin:
            rastro_forense("ALERTA: Sin privilegios Admin. Solicitando elevación...")
            print("[ SISTEMA] Solicitando Elevación Militar (Admin)...")
            
            #  FIX v15.0: Entrecomillar argumentos para rutas con espacios (ej: 'ARCHIVOS JOSEHP')
            params = " ".join([f'"{arg}"' for arg in sys.argv])
            rastro_forense(f"EXE: {sys.executable} | ARGS: {params}")
            
            # REINICIO ATÓMICO: El proceso débil muere aquí
            ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, params, None, 1)
            rastro_forense("EXIT: Proceso débil terminado para reinicio Admin.")
            sys.exit(0)

        rastro_forense("PASO 1 OK: Privilegios Admin confirmados.")

        #  PASO 2: LIMPIEZA DE ENTORNO (SOLO SI ES ADMIN)
        rastro_forense("Paso 2: Iniciando Guardián de Procesos...")
        print("[ SISTEMA] Ejecutando Guardián de Procesos Huérfanos...")
        limpiar_residuos_cortana()
        rastro_forense("PASO 2 OK: Limpieza completada.")
        
        #  PASO 3: INICIALIZACIÓN DE CAJA NEGRA
        rastro_forense("Paso 3: Inicializando Sistema Forense y Logs...")
        print("[ SISTEMA] Inicializando Sistema Forense y Logs...")
        inicializar_sistema_forense()
        rastro_forense("PASO 3 OK: Logs y carpetas listos.")
        
        #  PASO 3.5: AUTO-CURACIÓN DE ENLACES SIMBÓLICOS (PORTABILIDAD)
        verificar_y_reparar_enlaces_modelos()
        
        #  ACTIVACIÓN DE VOZ (CORTANA ONLINE)
        # Gestionado ahora por gui_cortana.py para evitar colisiones.
        
        print("\n[OK] Núcleo ejecutándose con Privilegios de Administrador.")
        
        #  PASO 4: CARGA DE MÓDULOS PESADOS
        rastro_forense("Paso 4: Importado Aplicación (GUI)...")
        from gui_cortana import Aplicacion
        app = Aplicacion()
        config.gui = app
        
        #  CARGA DIFERIDA (Ghost-Boot v19.0): Registramos hotkeys solo tras inicializar
        import keyboard
        
        # Inyectar callback en config para que gui_cortana pueda encender el servidor
        config.callback_servidor = toggle_servidor_remoto
        
        #  CONSOLIDACIÓN TÁCTICA DE ACCIONES EXCLUYENTES POR TECLADO
        keyboard.add_hotkey('shift+f1', hotkey_blindado('shift+f1', accion_f1_unificada, "SISTEMA"))
        keyboard.add_hotkey('shift+f2', hotkey_blindado('shift+f2', accion_f2_unificada, "SISTEMA"))
        keyboard.add_hotkey('shift+f3', hotkey_blindado('shift+f3', accion_f3_unificada, "SISTEMA"))
        keyboard.add_hotkey('shift+f4', hotkey_blindado('shift+f4', accion_f4_unificada, "SISTEMA"))
        keyboard.add_hotkey('shift+f5', hotkey_blindado('shift+f5', accion_f5_unificada, "SISTEMA"))
        
        # 🛡️ RESTAURACIÓN DE HARDWARE FISICO: Enlazar teclas F directas para macro pads
        keyboard.add_hotkey('F1', hotkey_blindado('F1', accion_f1_unificada, "SISTEMA"))
        keyboard.add_hotkey('F2', hotkey_blindado('F2', accion_f2_unificada, "SISTEMA"))
        keyboard.add_hotkey('F3', hotkey_blindado('F3', accion_f3_unificada, "SISTEMA"))
        keyboard.add_hotkey('F4', hotkey_blindado('F4', accion_f4_unificada, "SISTEMA"))
        keyboard.add_hotkey('F5', hotkey_blindado('F5', accion_f5_unificada, "SISTEMA"))
        
        keyboard.add_hotkey('F10', hotkey_blindado('F10', lambda: app.root.after(0, app.lanzar_macro_fotos_local), "DICTADO"))
        keyboard.add_hotkey('F11', hotkey_blindado('F11', lambda: app.root.after(0, app.optimizar_macros_manual), "DICTADO"))

        #  INICIO ASÍNCRONO REAL (ANTI-CRASH v9.0)
        def cargar_cerebro_en_background():
            try:
                print("\n[NÚCLEO]  Iniciando carga de Motores de Dictado (Google/SymSpell) en Background...")
                print("[NÚCLEO]  Por favor espere... Inicializando recursos cognitivos.")
                if config.gui: config.cola_gui.put("SISTEMA: Inicializando Motores IA...")
                
                # 1. Importación pesada aislada en otro hilo
                from nucleo_voz import iniciar_nucleo, purgar_memoria_total
                
                # 2. Asignación de teclas una vez importado
                keyboard.add_hotkey('F8', lambda: purgar_memoria_total(manual=True))
                print("[NÚCLEO]  Motor Google STT y Corrector de Patología importados con éxito.")
                
                # 3. Encendido del motor
                iniciar_nucleo()
                if config.gui: config.cola_gui.put("SISTEMA: Motores IA 100% Activos.")
                
                # Encender el dictáfono automáticamente al terminar de cargar
                if config.gui: config.gui.root.after(500, accion_f1_unificada)
                
            except Exception as e:
                import traceback
                error_tr = traceback.format_exc()
                print(f"\n[FATAL ERROR] Fallo estrepitoso al cargar el cerebro en HILO ASINCRONO:\n{error_tr}\n")
                if config.gui: config.cola_gui.put(f"ERROR FATAL IA: {e}")

        # Lanzar el cargador en modo Demonio (Fondo)
        threading.Thread(target=cargar_cerebro_en_background, name="CARGADOR_IA", daemon=True).start()
        
        #  LANZAMIENTO BLINDAJE v14.0
        threading.Thread(target=trabajador_red_isolee, name="NETWORK_SINK", daemon=True).start()
        
        #  PROTOCOLO DE TREGUA MÁXIMA (6 MINUTOS REBAJADO A 10 SEGUNDOS)
        app.root.after(10000, lambda: lanzar_modulo("MONITOR_SALUD", vigilar_salud))

        print("[OK] Arquitectura Modular Blindada y Sincronizada.")
        rastro_forense("Paso 6: Entrando en mainloop().")
        app.mainloop()

    except BaseException as e:
        #  FILTRO DE AUTOTRAMPA: No capturar salidas ordenadas
        if isinstance(e, SystemExit):
            raise e

        import traceback
        error_msg = f"COLAPSO DE CORTANA (ERROR CRÍTICO):\n\n{str(e)}\n\n{traceback.format_exc()}"
        rastro_forense(f"FATAL: {error_msg}")
        print(f"[CRITICAL ERROR]: {error_msg}")
        try:
            ctypes.windll.user32.MessageBoxW(0, error_msg, "Antigravity OS - Error Fatal", 0x10)
        except:
            rastro_forense("ERROR: MessageBoxW falló al mostrar el aviso.")
        sys.exit(1)
