import os
import ctypes
import sys
import threading
import time
import winsound
import gc
import sqlite3
import numpy as np
import speech_recognition as sr  

# Inicialización del reconocedor Google para nucleo_voz
reconocedor_google = sr.Recognizer()
reconocedor_google.dynamic_energy_threshold = False
reconocedor_google.energy_threshold = 300
reconocedor_google.pause_threshold = 1.8
reconocedor_google.non_speaking_duration = 0.8
reconocedor_google.operation_timeout = 10

try:
    import webrtcvad                 
    VAD_DISPONIBLE = True
except Exception:
    webrtcvad = None
    VAD_DISPONIBLE = False
    print("[ALERTA] 'webrtcvad' no instalado o no disponible. Usando detector de energia (RMS) de respaldo.")
import pyaudio
import wave
import json
import audioop

# --- Arquitectura Blindada (Cortana Core) ---
import config
import database_manager
import recursos
import micro_symspell as sym
import inyector_bloque as ib

# [IMPORTACIÓN DE MÓDULOS INDEPENDIENTES F1, F2, F3]
from modulos import dictado, plantilla, comando

# Telemetría Global
conteo_palabras_sesion = 0
tiempo_inicio_dictado = time.time()
dictando = False

# [MOTOR LOCAL VOSK] - Inicialización de Estado y Rutas
vosk_model = None
MODELO_VOSK_PATH = config.ruta_absoluta("vosk-model-small-es-0.42")

# ==========================================
# 🛡️ CAPA DE APRENDIZAJE (SHADOW LOGGER v2)
# ==========================================
RELOAD_SIGNAL = ".reload_trigger"

_shadow_log_conn = None
_shadow_log_lock = threading.Lock()

def _get_shadow_conn():
    global _shadow_log_conn
    if _shadow_log_conn is None:
        db_path = config.ruta_absoluta("cerebro_logs.db")
        # 🛡️ FIX CONCURRENCIA Y RENDIMIENTO: Conexión permanente cross-thread
        _shadow_log_conn = sqlite3.connect(db_path, check_same_thread=False, timeout=10)
        _shadow_log_conn.execute('PRAGMA journal_mode=WAL;')
        _shadow_log_conn.execute('PRAGMA synchronous=NORMAL;')
        cursor = _shadow_log_conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS shadow_logs (
                id INTEGER PRIMARY KEY, 
                raw TEXT, 
                corrected TEXT, 
                tipo TEXT, 
                confirmado INTEGER DEFAULT 0, 
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        _shadow_log_conn.commit()
    return _shadow_log_conn

def log_shadow_data(raw_stt, final_text, tipo="propuesta"):
    """Guarda el par (Error Google, Corrección) para análisis dominical (Aegis Logic). Sesión Blindada."""
    try:
        with _shadow_log_lock:
            conn = _get_shadow_conn()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO shadow_logs (raw, corrected, tipo) VALUES (?, ?, ?)", (raw_stt, final_text, tipo))
            last_id = cursor.lastrowid
            conn.commit()
            return last_id
    except Exception as e:
        print(f"[SHADOW LOG ERROR]: {e}")
        return None

def abrir_microscopia():
    """Abre la aplicación de microscopía Motic."""
    desktop = os.path.join(os.path.expanduser("~"), "Desktop")
    ruta = os.path.join(desktop, "CARPETA COMPARTIDA RED", "Motic", "MoticImageDevices.exe")
    try:
        os.startfile(ruta)
        print("[MICROSCOPIA] Aplicación lanzada.")
    except Exception as e:
        print(f"[ERROR MICROSCOPIA] {e}")
        return None




def vigilante_hot_reload():
    """Detecta la señal del Promotor y refresca el motor de corrección en caliente."""
    TRIGGER = config.ruta_absoluta(".reload_trigger")
    while True:
        if os.path.exists(TRIGGER):
            try:
                print("[SISTEMA] 🚀 Señal de aprendizaje detectada. Recargando SymSpell...")
                from micro_symspell import hot_reload_motor
                hot_reload_motor() 
                os.remove(TRIGGER)
                print("[SISTEMA] ✅ Aprendizaje aplicado con éxito.")
            except Exception as e:
                print(f"[!] Error en Hot-Reload: {e}")
        time.sleep(2) # Escaneo cada 2 segundos para ahorrar CPU

# [CÓDIGO DE OLLAMA ELIMINADO POR PURGA DE SISTEMA]

conteo_backspace = 0

def setup_keyboard_hooks():
    """Registra atajos mediante la librería keyboard de forma reactiva, eliminando hilos de sondeo."""
    import keyboard
    
    def on_keyboard_event(event):
        global conteo_backspace
        
        # 🛡️ Sincronización global de Caps Lock (Bloq Mayús) desde el hilo del hook
        import ctypes
        config.caps_lock_on = bool(ctypes.windll.user32.GetKeyState(0x14) & 0x0001)
        
        if event.event_type != 'down':
            return
            

        # [ATAJO DE OLLAMA ELIMINADO]
            
        # 2. Ctrl+Alt+Z -> Deshacer última inyección
        elif event.name == 'z' and keyboard.is_pressed('ctrl') and keyboard.is_pressed('alt'):
            if config.historial_escritos:
                ultimo = config.historial_escritos.pop()
                print(f"[UNDO] Eliminando: {ultimo}")
                for _ in range(len(ultimo)):
                    ctypes.windll.user32.keybd_event(0x08, 0, 0, 0) # Back
                    ctypes.windll.user32.keybd_event(0x08, 0, 2, 0)
                if config.gui: config.cola_gui.put(f"SISTEMA: Deshecho '{ultimo.strip()}'")
                
        # 3. Ctrl+F3 -> Enrolamiento de comando local
        elif event.name == 'f3' and keyboard.is_pressed('ctrl'):
            disparar_registro_f3()
            
        # 4. Tecla Backspace -> Monitor de Rechazo
        elif event.name == 'backspace':
            ahora = time.time()
            if config.confirmado_pendiente and (ahora - config.timestamp_ultima_inyeccion < 15):
                conteo_backspace += 1
                if conteo_backspace >= 3:
                    print(f"[SHADOW] ❌ RECHAZO DETECTADO (ID: {config.ultimo_log_id}) - Marcando como ERROR")
                    marcar_log_confirmatorio(config.ultimo_log_id, -1)
                    if config.gui: config.cola_gui.put("SISTEMA: APRENDIZAJE DESCARTADO (ERROR)")
                    config.confirmado_pendiente = False
                    conteo_backspace = 0
            else:
                conteo_backspace = 0
                
        # 5. Ctrl+Z -> Monitor de Rechazo por Deshacer
        elif event.name == 'z' and keyboard.is_pressed('ctrl') and not keyboard.is_pressed('alt'):
            if config.confirmado_pendiente:
                print(f"[SHADOW] ❌ RECHAZO POR CTRL+Z DETECTADO (ID: {config.ultimo_log_id}) - Marcando como ERROR")
                marcar_log_confirmatorio(config.ultimo_log_id, -1)
                config.confirmado_pendiente = False
                
    keyboard.hook(on_keyboard_event)

def vigilante_confirmacion_silenciosa():
    """🛡️ MONITOR DE VERDAD (v13.5): Confirma por silencio tras 15 segundos."""
    print("[NÚCLEO] Guardián de Confirmación (Verdad) Activo.")
    while True:
        try:
            if config.confirmado_pendiente:
                ahora = time.time()
                if ahora - config.timestamp_ultima_inyeccion > 15: # 15 seg de silencio = ÉXITO
                    print(f"[SHADOW] ✅ VERDAD CONFIRMADA POR SILENCIO (ID: {config.ultimo_log_id})")
                    marcar_log_confirmatorio(config.ultimo_log_id, 1) # 1 = VERDAD
                    if config.gui: config.cola_gui.put("SISTEMA: APRENDIZAJE CONFIRMADO (VERDAD)")
                    config.confirmado_pendiente = False
                    
                    # 🛡️ GHOST PURGE (v14.0): Limpieza profunda de RAM y Compresión Kernel LZ4
                    print("[🛡️ PURGA] Ejecutando limpieza de RAM profunda y compresión Kernel...")
                    gc.collect(2)
                    config.optimizar_compresion_memoria_ram()
            time.sleep(5)
        except: time.sleep(10)

def marcar_log_confirmatorio(id_log, estado):
    """Actualiza el estado de un log en la base de datos."""
    if not id_log: return
    try:
        db_path = config.ruta_absoluta("cerebro_logs.db")
        
        # 🛡️ FIX CONCURRENCIA: Blindaje replicado
        conn = sqlite3.connect(db_path, timeout=10)
        conn.execute('PRAGMA journal_mode=WAL;')
        conn.execute('PRAGMA synchronous=NORMAL;')
        
        conn.execute("UPDATE shadow_logs SET confirmado = ? WHERE id = ?", (estado, id_log))
        conn.commit()
        conn.close()
    except: pass



def disparar_registro_f3():
    """Captura 2.5s de audio y envía la señal a la GUI para completar el registro."""
    def _tarea_enrolamiento():
        print("[F3] Iniciando proceso de Registro de Voz (Voice Enrollment)...")
        winsound.Beep(2000, 150)
        if config.gui: config.cola_gui.put("ESTADO: REGISTRANDO VOZ...")
        
        # 1. Grabación relámpago (2.5 segundos)
        p = pyaudio.PyAudio()
        stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=1024)
        frames = []
        for _ in range(0, int(16000 / 1024 * 2.5)):
            frames.append(stream.read(1024))
        stream.stop_stream(); stream.close(); p.terminate()
        
        audio_bytes = b''.join(frames)
        print("[F3] Audio capturado. Enviando a GUI para asignación...")
        winsound.Beep(1800, 100)
        
        # 2. SEÑAL TÁCTICA A LA GUI (Hilo Seguro)
        # Enviamos una tupla para diferenciarlo de mensajes de texto planos
        if config.gui:
            config.cola_gui.put(("F3_ENROLAMIENTO", audio_bytes))
        
    threading.Thread(target=_tarea_enrolamiento, daemon=True).start()

# ==========================================
# 🚀 MOTOR DE TRANSCRIPCIÓN HÍBRIDO (TURBO)
# ==========================================
vosk_grammar_json = None

def obtener_gramatica_vosk():
    global vosk_grammar_json
    if vosk_grammar_json is not None:
        return vosk_grammar_json
        
    import os
    import json
    import sqlite3
    import re
    
    vocab = set()
    
    # Heurística de validación para eliminar palabras en inglés y palabras mal escritas
    def es_palabra_valida(w):
        w = w.lower().strip()
        if len(w) < 2 and w not in ["a", "e", "y", "o", "u"]:
            return False
        if not re.match(r"^[a-záéíóúüñ]+$", w):
            return False
        english_stops = {
            "the", "and", "of", "to", "in", "is", "for", "on", "with", "as", "by", "at", "from", 
            "it", "an", "this", "that", "was", "were", "be", "have", "has", "are", "they", "he", 
            "she", "you", "we", "but", "not", "or", "about", "would", "their", "will", "there", 
            "aberrations", "acalculous", "adenoneuroendocrine", "amniotic", "allele", "allred", 
            "alterations", "antigen", "appdata", "aspx", "autosomal", "benign", "biomarker", 
            "biomarkers", "biopsy", "borderline", "bowel", "brafmutated", "calculi", "calculous", 
            "cannot", "cell", "cells", "stihl", "bancroft", "kitty"
        }
        if w in english_stops:
            return False
        if len(w) > 20:
            return False
        return True
        
    # 1. Palabras comunes de estructura y números
    common = [
        "a", "de", "con", "en", "por", "para", "un", "una", "unos", "unas", "el", "la", "los", "las", "lo",
        "y", "o", "no", "si", "sí", "del", "al", "como", "se", "me", "te", "le", "nos", "les", "que", "qué",
        "este", "esta", "esto", "estos", "estas", "ese", "esa", "eso", "esos", "esas", "aquel", "aquella",
        "mi", "tu", "su", "mis", "tus", "sus", "nuestro", "nuestra", "vuestro", "vuestra",
        "yo", "tú", "él", "ella", "nosotros", "ellos", "ellas",
        "es", "son", "fue", "fueron", "era", "eran", "ser", "estar", "tiene", "tienen", "tenía", "tenían",
        "hace", "hacen", "hizo", "hicieron", "hacer", "ver", "observar", "recibir", "encontrar", "buscar",
        "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
        "milímetros", "milímetro", "centímetros", "centímetro", "gramos", "gramo", "por", "x", "más", "menos"
    ]
    for w in common:
        vocab.add(w.lower())
        
    # 2. Cargar mapeo_maestro.json (Curado e Inmune)
    maestro_path = config.ruta_absoluta("mapeo_maestro.json")
    if os.path.exists(maestro_path):
        try:
            with open(maestro_path, "r", encoding="utf-8") as f:
                datos = json.load(f)
                for cat in ["escudo", "tecnico", "nombres"]:
                    for w in datos.get(cat, []):
                        w_clean = w.lower().strip()
                        if es_palabra_valida(w_clean):
                            vocab.add(w_clean)
        except Exception as e:
            print(f"[VOCABULARIO] Error cargando mapeo_maestro: {e}")

    # 3. Analizador de Informes de Cerebro Logs (Ley de Pareto: Frecuencia >= 2)
    db_path = config.ruta_absoluta("cerebro_logs.db")
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path, timeout=10)
            c = conn.cursor()
            c.execute("SELECT corrected FROM shadow_logs WHERE tipo = 'propuesta' OR confirmado = 1")
            rows = c.fetchall()
            conn.close()
            
            word_freqs = {}
            for row in rows:
                if row[0]:
                    words = re.findall(r"[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+", row[0].lower())
                    for w in words:
                        word_freqs[w] = word_freqs.get(w, 0) + 1
            
            for w, freq in word_freqs.items():
                if freq >= 2 and es_palabra_valida(w):
                    vocab.add(w)
        except Exception as e:
            print(f"[VOCABULARIO] Error analizando cerebro_logs: {e}")

    # 4. Cargar nombres y apellidos peruanos (peruanos_clean.txt)
    peruanos_path = config.ruta_absoluta("peruanos_clean.txt")
    if os.path.exists(peruanos_path):
        try:
            with open(peruanos_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("#") or not line.strip():
                        continue
                    w_clean = line.strip().lower()
                    if es_palabra_valida(w_clean):
                        vocab.add(w_clean)
        except Exception as e:
            print(f"[VOCABULARIO] Error cargando peruanos_clean: {e}")

    # 5. Cargar vocabulariodragon_limpio.txt y contexto_medico_optimizado.txt (Fallback Filtrado)
    for file_name in ["vocabulariodragon_limpio.txt", "contexto_medico_optimizado.txt"]:
        path = config.ruta_absoluta(file_name)
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    split_char = "," if "," in content and file_name == "contexto_medico_optimizado.txt" else None
                    parts = content.split(split_char) if split_char else content.split()
                    for p in parts:
                        for word in p.strip().split():
                            w_clean = word.strip().lower().replace(",", "").replace(".", "").replace(";", "")
                            if es_palabra_valida(w_clean) and len(w_clean) > 3:
                                vocab.add(w_clean)
            except Exception as e:
                print(f"[VOCABULARIO] Error cargando {file_name}: {e}")
                
    vocab.add("[unk]")
    
    vocab_list = sorted(list(vocab))
    vosk_grammar_json = json.dumps(vocab_list)
    print(f"[NÚCLEO] Gramática Médica de Precisión Cargada. Tamaño: {len(vocab_list)} palabras.")
    return vosk_grammar_json

PROMPT_PATOLOGICO = "Caso de anatomía patológica y citología. Macroscópicamente: espécimen rotulado, fragmento blanco grisáceo en casete. Bolsa de colecistectomía con superficie serosa lisa y mucosa aterciopelada con cálculos facetados. Apéndice cecal congestivo con restos de fibrina. Placenta de peso habitual con depósitos fibrinoides intervellosos, vellosidades coriónicas, membranas corioamnióticas y miometrio. Microscópicamente: antro gástrico con gastritis crónica activa, atrofia, Helicobacter pylori, metaplasia intestinal e hiperplasia foveolar. Duodeno con glándulas fúndicas ectópicas. Hernia del núcleo pulposo con condrocitos. Acrocordón papilomatoso con epitelio escamoso acantótico, papilomatosis y quistes córneos fibroepiteliales. Parénquima adenoideo con hiperplasia linfoide folicular reactiva. Células redondas con citoplasma abundante, nucléolos discretos y pleomorfismo. Inmunohistoquímica y microfolículos de glándula tiroides. Tumor parotídeo condromixoide (adenoma pleomórfico) con márgenes de sección libres. Pólipo de colon (adenoma serrado sésil) con epitelio aserrado. Negativo para malignidad."

def trabajador_whisper_streaming():
    """Refinador de dictado offline usando Faster-Whisper (Precisión Médica Absoluta)."""
    import numpy as np
    
    model = asegurar_modelo_whisper()
    if not model:
        return
        
    audio_buffer = bytearray()
    texto_actual = ""
    
    print("[NÚCLEO] Trabajador de Dictado Whisper Desplegado (Precisión 100%).")
    
    while True:
        try:
            item = config.cola_streaming.get()
            if item is None: break
            
            if item == "SILENCE":
                if len(audio_buffer) > 0:
                    # --- COMPUERTA DE ENERGÍA Y DURACIÓN (ETAPA A) ---
                    num_samples = len(audio_buffer) // 2
                    duracion = num_samples / 16000.0
                    
                    try:
                        rms_val = audioop.rms(audio_buffer, 2)
                    except Exception:
                        rms_val = 0
                        
                    # --- OPCIÓN 3: COMPUERTA DE AUDIO ANTI-RUIDO DE CLÍNICA (VAD DINÁMICO) ---
                    if duracion < 0.4:
                        print(f"[🛡️ ANTI-RUIDO CLÍNICO] Descartando audio muy corto ({duracion:.2f}s).")
                        audio_buffer.clear()
                        texto_actual = ""
                        if config.gui: config.cola_gui.put("ESTADO: EN ESPERA")
                        config.cola_streaming.task_done()
                        continue
                        
                    if rms_val < 140:
                        print(f"[🛡️ ANTI-RUIDO CLÍNICO] Murmullo/Ruido de ambiente bloqueado (RMS: {rms_val} < 140).")
                        audio_buffer.clear()
                        texto_actual = ""
                        if config.gui: config.cola_gui.put("ESTADO: EN ESPERA")
                        config.cola_streaming.task_done()
                        continue

                    audio_data = np.frombuffer(audio_buffer, np.int16).astype(np.float32) / 32768.0
                    try:
                        # PRECISIÓN MÉDICA OPTIMIZADA (beam_size=1) y CEREBRO MÉDICO (initial_prompt)
                        prompt_activo = PROMPT_PATOLOGICO if getattr(config, 'modo_medico_activo', True) else None
                        segments, _ = model.transcribe(
                            audio_data, 
                            beam_size=1, 
                            language="es", 
                            condition_on_previous_text=False, 
                            vad_filter=True,
                            vad_parameters=dict(min_silence_duration_ms=1200),
                            initial_prompt=prompt_activo
                        )
                        
                        # --- FILTRADO DE SEGMENTOS WHISPER (ETAPA B) ---
                        valid_segments = []
                        for segment in segments:
                            if segment.no_speech_prob > 0.45:
                                print(f"[WHISPER FILTER] Descartado segment por no-speech prob ({segment.no_speech_prob:.3f}): '{segment.text}'")
                                continue
                            if segment.avg_logprob < -1.0:
                                print(f"[WHISPER FILTER] Descartado segment por baja confianza ({segment.avg_logprob:.3f}): '{segment.text}'")
                                continue
                            if segment.compression_ratio > 2.4:
                                print(f"[WHISPER FILTER] Descartado segment por repetición ({segment.compression_ratio:.3f}): '{segment.text}'")
                                continue
                            valid_segments.append(segment.text)
                            
                        chunk = " ".join(valid_segments).strip()
                    except Exception as e:
                        print(f"[WHISPER ERROR]: {e}")
                        chunk = ""
                        
                    if chunk:
                        # --- FILTRADO DE ALUCINACIONES Y RUIDOS COMUNES ---
                        c_lower = chunk.lower()
                        frases_alucinacion = [
                            "subtítulos por", "subtítulos", "descripción", "gracias por ver",
                            "gracias por el video", "suscríbete", "amara.org", "gracias",
                            "amén", "adiós", "hola a todos", "reproducción", "reproducir",
                            "todos los derechos", "gracias por ver este", "suscribete", "subtitulado"
                        ]
                        palabras_chunk = c_lower.split()
                        ruidos_conocidos = {
                            "adulto", "leopardo", "puma", "moto", "un", "una", "el", "la", 
                            "gracias", "suscribete", "subtítulos", "youtube", "amén", "silencio", 
                            "adiós", "fin", "ok", "okay", "ah", "eh", "oh", "mmm", "sí", "no", 
                            "ya", "y", "o"
                        }
                        
                        es_alucinacion = False
                        if any(frase in c_lower for frase in frases_alucinacion):
                            es_alucinacion = True
                        elif len(palabras_chunk) <= 3 and all(p in ruidos_conocidos for p in palabras_chunk):
                            es_alucinacion = True
                        elif len(chunk) < 2:
                            es_alucinacion = True
                            
                        if es_alucinacion:
                            print(f"[WHISPER FILTER] Alucinación/Ruido bloqueado: '{chunk}'")
                            chunk = ""
                            
                    if chunk:
                        # Aplicar corrección clínica maestro (SymSpell + Reglas)
                        from modulos.dictado_modular.procesador_clinico import procesador
                        texto_corregido = procesador.purificar_texto(chunk)
                        
                        if texto_corregido:
                            texto_corregido = " " + texto_corregido.strip() + " "
                            config.cola_inyeccion.put(texto_corregido)
                    
                    audio_buffer.clear()
                    texto_actual = ""
                    gc.collect(1)
                    if config.gui:
                        config.cola_gui.put("ESTADO: EN ESPERA")
                        
            elif item == "RESET":
                audio_buffer.clear()
                texto_actual = ""
                
            else:
                # Acumular audio en memoria hasta que el VAD detecte silencio
                audio_buffer.extend(item)
                
            config.cola_streaming.task_done()
        except Exception as e:
            print(f"[ERROR TRABAJADOR WHISPER]: {e}")
            time.sleep(0.1)

def trabajador_inyeccion():
    """Consumidor de la cola de inyección: El brazo ejecutor asíncrono."""
    print("[NÚCLEO] Trabajador de Inyección Iniciado (Latencia Cero).")
    while True:
        try:
            texto = config.cola_inyeccion.get()
            if texto is None: break
            
            print(f"\n[TRABAJADOR INYECTOR] 📥 Texto extraído de la cola de Inyección: '{texto}'")
            
            # --- INTERCEPTOR DE COMANDOS INTELIGENTES (VOICE TO ACTION) ---
            texto_clean = texto.strip().lower()
            texto_clean_clean = texto_clean.strip('.,;!?*()[]{}<>¿¡-')
            
            es_comando = False
            cmd_interior = ""
            for disparador in ["cortana", "asistente", "sistema", "comando"]:
                if texto_clean_clean.startswith(disparador):
                    es_comando = True
                    cmd_interior = texto_clean_clean[len(disparador):].strip()
                    break
                    
            if es_comando:
                print(f"[VOICE TO ACTION] 🎯 COMANDO INTERCEPTADO: '{texto_clean_clean}' | Acción: '{cmd_interior}'")
                cmd_procesado = False
                
                # 1. Abrir Microscopio
                if "microscopio" in cmd_interior or "motic" in cmd_interior:
                    abrir_microscopia()
                    winsound.Beep(1200, 150)
                    cmd_procesado = True
                    
                # 2. Guardar / Salvar
                elif "guardar" in cmd_interior or "salvar" in cmd_interior:
                    ctypes.windll.user32.keybd_event(0x11, 0, 0, 0) # Ctrl down
                    ctypes.windll.user32.keybd_event(0x53, 0, 0, 0) # S down
                    ctypes.windll.user32.keybd_event(0x53, 0, 2, 0) # S up
                    ctypes.windll.user32.keybd_event(0x11, 0, 2, 0) # Ctrl up
                    winsound.Beep(1200, 250)
                    if config.gui: config.cola_gui.put("SISTEMA: Guardado exitoso")
                    cmd_procesado = True
                    
                # 3. Limpiar / Borrar Pantalla
                elif "limpiar" in cmd_interior or "borrar todo" in cmd_interior or "purgar" in cmd_interior:
                    if config.gui:
                        config.gui.root.after(0, config.gui.lanzar_purgador)
                    winsound.Beep(1000, 150)
                    cmd_procesado = True
                    
                # 4. Deshacer última inyección
                elif "deshacer" in cmd_interior:
                    if config.historial_escritos:
                        ultimo = config.historial_escritos.pop()
                        print(f"[UNDO] Eliminando por voz: '{ultimo}'")
                        for _ in range(len(ultimo)):
                            ctypes.windll.user32.keybd_event(0x08, 0, 0, 0) # Backspace down
                            ctypes.windll.user32.keybd_event(0x08, 0, 2, 0) # Backspace up
                        if config.gui: config.cola_gui.put(f"SISTEMA: Deshecho '{ultimo.strip()}'")
                    winsound.Beep(900, 200)
                    cmd_procesado = True
                    
                # 5. Abrir Fotos / Carpeta
                elif "fotos" in cmd_interior or "carpeta" in cmd_interior:
                    path_macros = os.path.join(os.path.dirname(__file__), "macros_recibidas")
                    if not os.path.exists(path_macros):
                        os.makedirs(path_macros)
                    os.startfile(path_macros)
                    winsound.Beep(1200, 150)
                    cmd_procesado = True
                    
                # 6. Apagar Micrófono / Silenciar
                elif "apagar" in cmd_interior or "silenciar" in cmd_interior or "desconectar" in cmd_interior:
                    config.escuchando.clear()
                    config.escuchando_google.clear()
                    config.escuchando_groq.clear()
                    config.escuchando_offline.clear()
                    if config.gui:
                        config.gui.root.after(0, lambda: config.gui.actualizar_estado_mic_google(False))
                        config.gui.root.after(0, lambda: config.gui.actualizar_estado_mic_groq(False))
                        config.gui.root.after(0, lambda: config.gui.actualizar_estado_mic_offline(False))
                        config.gui.root.after(0, lambda: config.gui.cambiar_modo("DICTADO"))
                        config.gui.actualizar_video_seguro(config.VIDEO_IDLE)
                    winsound.Beep(800, 300)
                    cmd_procesado = True
                    
                # 7. Abrir Word
                elif "word" in cmd_interior:
                    os.startfile("winword")
                    winsound.Beep(1200, 150)
                    cmd_procesado = True
                    
                # 8. Abrir Excel
                elif "excel" in cmd_interior:
                    os.startfile("excel")
                    winsound.Beep(1200, 150)
                    cmd_procesado = True
                    
                # 9. Escribir plantilla (Fuzzy Matcher Jaccard)
                elif "plantilla" in cmd_interior or "escribir" in cmd_interior or "cargar" in cmd_interior:
                    term_busqueda = cmd_interior.replace("plantilla", "").replace("escribir", "").replace("cargar", "").strip()
                    if term_busqueda:
                        contenido_plantilla = database_manager.buscar_plantilla_fuzzy(term_busqueda)
                        if contenido_plantilla:
                            config.cola_inyeccion.put(contenido_plantilla)
                            winsound.Beep(1400, 150)
                        else:
                            print(f"[VOICE TO ACTION] ⚠️ No se encontró plantilla para '{term_busqueda}'")
                            winsound.Beep(400, 200)
                    cmd_procesado = True
                    
                if cmd_procesado:
                    config.cola_inyeccion.task_done()
                    continue

            
            # Lógica de Caps e Inyección - Optimización Arquitecto Maestro
            caps_lock_on = getattr(config, 'caps_lock_on', False)
            # Si Bloq Mayus está activado, forzamos UPPER. Si está apagado, respetamos el Pipeline IA.
            txt_final = texto.upper() if caps_lock_on else texto
            txt_final = " " + txt_final.strip() + " "
            
            print(f"[TRABAJADOR INYECTOR] Caso final de escritura: '{txt_final}' (Bloq Mayus: {bool(caps_lock_on)})")
            
            hwnd = ctypes.windll.user32.GetForegroundWindow()
            length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
            buff = ctypes.create_unicode_buffer(length + 1)
            ctypes.windll.user32.GetWindowTextW(hwnd, buff, length + 1)
            ventana_destino = (buff.value or "DESCONOCIDA").upper()

            # Si la ventana activa actual es la GUI de Cortana o MacroRecorder, omitir el foco propio
            if any(p in ventana_destino for p in ["CORTANA", "MACRORECORDER", "PYTHON", "TK"]):
                if hasattr(config, 'ultima_ventana_valida_hwnd') and config.ultima_ventana_valida_hwnd:
                    ctypes.windll.user32.SetForegroundWindow(config.ultima_ventana_valida_hwnd)
                    time.sleep(0.05)
                    hwnd = config.ultima_ventana_valida_hwnd
                    length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
                    buff = ctypes.create_unicode_buffer(length + 1)
                    ctypes.windll.user32.GetWindowTextW(hwnd, buff, length + 1)
                    ventana_destino = (buff.value or "DESCONOCIDA").upper()
            else:
                config.ultima_ventana_valida_hwnd = hwnd
            
            print(f"[TRABAJADOR INYECTOR] 🖥️ Ventana Destino Activa: '{ventana_destino}'")

            # Sin bloqueos: Permitir inyección libre en cualquier ventana (incluso en la consola)

            # DETECCIÓN DE VENTANAS QUE BLOQUEAN EL PORTAPAPELES (SAMSUNG FLOW, TERMINALES, ETC)
            forzar_teclado = False
            # Lista de programas donde Ctrl+V falla o requiere tecleo físico
            ventanas_rebeldes = ["SAMSUNG FLOW", "FLOW", "RDP", "ANYDESK", "TEAMVIEWER", "CODE", "VISUAL STUDIO", "CMD", "POWERSHELL", "TERMINAL"]
            if any(n in ventana_destino for n in ventanas_rebeldes):
                forzar_teclado = True
                print(f"[TRABAJADOR INYECTOR] ⚠️ Detectada ventana rebelde {ventana_destino}. Activando Inyección Hardware.")

            if config.gui: 
                config.cola_gui.put(f"TXT: {txt_final.strip()[:30]}...")
            
            ib.inyectar_bloque_atómico(txt_final, forzar_teclado=forzar_teclado)
            config.historial_escritos.append(txt_final)
            
            config.cola_inyeccion.task_done()
        except Exception as e:
            print(f"[ERROR TRABAJADOR INYECCIÓN]: {e}")
            time.sleep(0.1)

def asegurar_modelo_whisper():
    global whisper_model
    if 'whisper_model' not in globals() or whisper_model is None:
        try:
            print("[NÚCLEO] Cargando Motor Local Faster-Whisper (Precisión Médica)...")
            from faster_whisper import WhisperModel
            import warnings
            warnings.filterwarnings("ignore", category=UserWarning)
            # small es el modelo base con excelente capacidad médica sin IA externa
            # Se activa el modo 8 hilos para exprimir el i7-6700 al máximo con el modelo small
            whisper_model = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=6, local_files_only=True)
            print("[OK] Faster-Whisper Desplegado con 8 hilos optimizados.")
        except Exception as e:
            print(f"[ERROR MOTOR WHISPER]: {e}")
            whisper_model = None
    return whisper_model

def transcribir_whisper(audio_bytes):
    model = asegurar_modelo_whisper()
    if not model:
        return ""
    try:
        import numpy as np
        audio_data = np.frombuffer(audio_bytes, np.int16).astype(np.float32) / 32768.0
        # PRECISIÓN OPTIMIZADA (beam_size=1) para balance de CPU/Velocidad
        segments, _ = model.transcribe(audio_data, beam_size=1, language="es", condition_on_previous_text=False, vad_filter=True, vad_parameters=dict(min_silence_duration_ms=1200))
        texto_crudo = " ".join([segment.text for segment in segments]).strip()
        
        # Normalizar números escritos en palabras a dígitos
        from recursos import normalizar_numeros
        texto = normalizar_numeros(texto_crudo)
        
        print(f"[WHISPER]: {texto}")
        return texto
    except Exception as e:
        print(f"[ERROR WHISPER TRANSCRIBIR]: {e}")
        return ""


groq_key_index = 0

def transcribir_groq(audio_bytes, rate, prompt=None):
    global groq_key_index
    import requests
    import io
    import wave
    import json
    
    # 1. Convert raw PCM bytes to a proper WAV file in memory
    wav_io = io.BytesIO()
    with wave.open(wav_io, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(rate)
        wav_file.writeframes(audio_bytes)
    
    wav_io.seek(0)
    
    # 2. Load keys
    keys_path = config.ruta_absoluta("llaves_activas_groq.json")
    if not os.path.exists(keys_path):
        print("[GROQ] Archivo de llaves no encontrado.")
        return None
        
    try:
        with open(keys_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            keys = data.get("groq_valid_keys", [])
    except Exception as e:
        print(f"[GROQ] Error leyendo llaves: {e}")
        return None
        
    if not keys:
        print("[GROQ] No hay llaves disponibles.")
        return None
        
    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    
    num_keys = len(keys)
    ordered_indices = [(groq_key_index + i) % num_keys for i in range(num_keys)]
    
    for idx in ordered_indices:
        key = keys[idx]
        try:
            files = {
                'file': ('audio.wav', wav_io.getvalue(), 'audio/wav')
            }
            data = {
                'model': 'whisper-large-v3-turbo',
                'language': 'es',
                'temperature': '0.0'
            }
            if prompt:
                data['prompt'] = prompt

            headers = {
                'Authorization': f'Bearer {key}'
            }
            
            # 🛡️ Aumentar timeout a 12 segundos para conexiones lentas (4G / WiFi de baja señal)
            response = requests.post(url, headers=headers, files=files, data=data, timeout=12)
            
            if response.status_code == 200:
                result = response.json()
                texto_crudo = result.get('text', '').strip()
                
                # Guardar el índice exitoso en la variable persistente
                groq_key_index = idx
                
                # FILTRO ANTI-ALUCINACIONES DE WHISPER-LARGE-V3 (Lista Negra)
                alucinaciones = [
                    "subtítulos por", "subtitulos por", "gracias por ver", "amén",
                    "suscríbete", "dale like", "asesinos"
                ]
                txt_lower = texto_crudo.lower()
                for aluc in alucinaciones:
                    if aluc in txt_lower:
                        print(f"[GROQ FILTRO] Alucinación bloqueada: '{texto_crudo}'")
                        return ""
                        
                print(f"[GROQ] Transcripción exitosa (Llave índice {idx}).")
                return texto_crudo

            elif response.status_code in [401, 429]:
                print(f"[GROQ] Llave {key[:8]}... en índice {idx} falló ({response.status_code}). Rotando...")
                continue
            else:
                print(f"[GROQ] Error inesperado en índice {idx}: {response.status_code}")
                continue
        except Exception as e:
            print(f"[GROQ] Error de conexión en índice {idx}: {e}")
            return None # Falla de red, salir para fallback
            
    return None

_ultimo_chequeo_internet = 0.0
_ultimo_resultado_internet = True
_lock_internet = threading.Lock()

def chequear_conexion_internet():
    global _ultimo_chequeo_internet, _ultimo_resultado_internet
    ahora = time.time()
    with _lock_internet:
        if ahora - _ultimo_chequeo_internet < 15.0: # Cache por 15 segundos para evitar lag
            return _ultimo_resultado_internet
            
    import socket
    try:
        # Check standard HTTPS port to google.com (443) with a more resilient timeout of 1.2s
        socket.create_connection(("google.com", 443), timeout=1.2)
        res = True
    except OSError:
        try:
            # Secondary check to api.groq.com in case google.com is blocked
            socket.create_connection(("api.groq.com", 443), timeout=1.2)
            res = True
        except OSError:
            res = False
        
    with _lock_internet:
        _ultimo_chequeo_internet = ahora
        _ultimo_resultado_internet = res
    return res

def procesar_logica_ia():
    print("[NÚCLEO] Despachador de IA Activo (Mutuamente Excluyente)")
    while True:
        try:
            item = config.cola_audio.get()
            if item is None: break 
            
            if isinstance(item, tuple):
                audio_frames, modo = item
            else:
                audio_frames = item
                modo = "online"
                
            audio_bytes = b''.join(audio_frames)
            audio_bytes_final = audio_bytes
            rate_final = config.RATE

            # 🛡️ PUERTA MATEMÁTICA DE ENERGÍA (RMS GATE)
            import audioop
            if len(audio_bytes_final) > 0:
                rms = audioop.rms(audio_bytes_final, 2)
                if rms < 120: # Umbral de ruido blanco y respiración (alineado con VAD)
                    print(f"[NÚCLEO] Audio descartado (Energía baja: {rms}). Evitando latencia y alucinaciones.")
                    config.cola_audio.task_done()
                    continue

            if config.MODO_ACTUAL == "DICTADO" or config.MODO_ACTUAL == "DICCIONARIO":
                if modo in ["google", "groq", "online"]:
                    if not chequear_conexion_internet():
                        print("\n" + "="*80)
                        print("\033[91m\033[1m[¡ALERTA!] SIN CONEXIÓN A INTERNET DETECTADA.")
                        print("El dictador online no puede funcionar.")
                        print("POR FAVOR, PRESIONA [F5] EN EL DICTÁFONO PARA ACTIVAR EL MODO OFFLINE DE MANERA MANUAL.\033[0m")
                        print("="*80 + "\n")
                        if config.gui:
                            config.cola_gui.put("Fallo de red: Por favor cambie al modo OFFLINE con F5")
                    else:
                        prompt_activo = PROMPT_PATOLOGICO if getattr(config, 'modo_medico_activo', True) else None
                        crudo = None
                        
                        if modo == "groq":
                            crudo = transcribir_groq(audio_bytes_final, rate_final, prompt=prompt_activo)
                            if crudo is None:
                                # Fallback to local whisper if groq failed
                                print("[GROQ FALLÓ] -> Usando Whisper Local de respaldo...")
                                crudo = transcribir_whisper(audio_bytes_final)
                        
                        elif modo == "google":
                            audio_data_google = sr.AudioData(audio_bytes_final, rate_final, 2)
                            try:
                                print("[CASCADA] Usando GOOGLE STT...")
                                crudo = reconocedor_google.recognize_google(audio_data_google, language="es-PE").strip()
                            except sr.UnknownValueError:
                                print("[NÚCLEO] Google STT no detectó palabras (UnknownValueError).")
                                crudo = "" # No activamos fallback en caso de silencio
                            except Exception as e:
                                print(f"[GOOGLE STT FALLÓ] -> {e}. Usando Whisper Local de respaldo...")
                                crudo = transcribir_whisper(audio_bytes_final)
                                
                        elif modo == "online": # Legacy fallback
                            crudo = transcribir_groq(audio_bytes_final, rate_final, prompt=prompt_activo)
                            if crudo is None:
                                audio_data_google = sr.AudioData(audio_bytes_final, rate_final, 2)
                                try:
                                    print("[CASCADA ONLINE] Usando GOOGLE STT...")
                                    crudo = reconocedor_google.recognize_google(audio_data_google, language="es-PE").strip()
                                except sr.UnknownValueError:
                                    print("[NÚCLEO ONLINE] Google STT no detectó palabras (UnknownValueError).")
                                    crudo = "" # No activamos fallback
                                except Exception as e:
                                    print(f"[GOOGLE ONLINE FALLÓ]: {e}. Usando Whisper Local...")
                                    crudo = transcribir_whisper(audio_bytes_final)
                        if crudo:
                            from modulos.dictado_modular.procesador_clinico import procesador
                            texto_final = procesador.purificar_texto(crudo)
                            if texto_final:
                                procesador.inyectar_pantalla(texto_final)
                else:
                    crudo = transcribir_whisper(audio_bytes_final)
                    if crudo:
                        from modulos.dictado_modular.procesador_clinico import procesador
                        texto_final = procesador.purificar_texto(crudo)
                        if texto_final:
                            procesador.inyectar_pantalla(texto_final)
            
            elif config.MODO_ACTUAL == "PLANTILLA":
                plantilla.procesar_plantilla(audio_bytes_final)
            
            elif config.MODO_ACTUAL == "COMANDO":
                audio_data_google = sr.AudioData(audio_bytes_final, rate_final, 2)
                comando.procesar_comando(audio_data_google)

            config.cola_audio.task_done()
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"[RECEPTOR IA ERROR]: {e}\\n{error_trace}")
            if config.gui:
                config.cola_gui.put(f"ERROR: Fallo en IA ({str(e)[:20]})")
            import time
            time.sleep(0.5)

def motor_audio():
    print("[NÚCLEO] Monitor de Voz VAD Iniciado.")
    vad = webrtcvad.Vad(2) if VAD_DISPONIBLE else None
    frame_size = int(config.RATE * 30 / 1000)
    p = pyaudio.PyAudio()
    
    # 🔍 AUTO-DETECTOR DE MICRÓFONO DE ALTA CALIDAD (Prioriza USB y filtros virtuales sobre el integrado)
    target_index = None
    target_name = "Ninguno"
    try:
        devices = []
        for i in range(p.get_device_count()):
            try:
                info = p.get_device_info_by_index(i)
                if info.get('maxInputChannels', 0) > 0:
                    devices.append((i, info['name']))
            except: pass
            
        default_index = None
        try:
            def_info = p.get_default_input_device_info()
            default_index = def_info.get('index')
        except:
            pass

        def obtener_prioridad_dispositivo(idx, nombre):
            n_low = nombre.lower()
            if any(term in n_low for term in ["webcam", "camera", "cámara", "mezcla estéreo", "stereo mix"]):
                return 0.0
            if any(term in n_low for term in ["sonar", "steelseries", "rtx voice", "nvidia broadcast"]):
                return 4.0
            if "usb" in n_low:
                return 3.5
            if any(term in n_low for term in ["array", "conexant", "realtek", "built-in", "integrado"]):
                return 1.5
            if idx == default_index:
                return 2.0
            if any(term in n_low for term in ["mic", "microfono", "micrófono"]):
                return 2.5
            return 1.0
            
        devices_sorted = sorted(devices, key=lambda x: obtener_prioridad_dispositivo(x[0], x[1]), reverse=True)
        if devices_sorted:
            target_index = devices_sorted[0][0]
            target_name = devices_sorted[0][1].encode('ascii', 'replace').decode('ascii')
            print(f"[NÚCLEO] 🎤 Micrófono autodetectado: {target_name} (Índice: {target_index}, Prioridad: {obtener_prioridad_dispositivo(target_index, devices_sorted[0][1])})")
    except Exception as e_scan:
        print(f"[NÚCLEO ADVERTENCIA] Escaneo de micrófonos falló: {e_scan}")

    if target_index is None:
        try:
            def_info = p.get_default_input_device_info()
            target_index = def_info.get('index')
            target_name = def_info.get('name', 'Predeterminado').encode('ascii', 'replace').decode('ascii')
            print(f"[NÚCLEO] Fallback a predeterminado de Windows: {target_name}")
        except Exception as e_def:
            print(f"[NÚCLEO CRÍTICO] No se pudo obtener ningún dispositivo de audio: {e_def}")
    
    try:
        stream = p.open(format=pyaudio.paInt16, 
                        channels=config.CHANNELS, 
                        rate=config.RATE,
                        input=True, 
                        input_device_index=target_index,
                        frames_per_buffer=config.CHUNK_SIZE)
    except Exception as e:
        print(f"[CRÍTICO AUDIO]: No se pudo abrir el micro: {e}")
        return 

    buffer_voz = []
    cont_silencio = 0
    hablando = False

    # 🛡️ Diagnóstico de Volumen
    alertas_silencio_emitidas = 0

    ultimo_estado_escuchando = False
    ultimo_modo_online = None

    while True:
        try:
            if not config.escuchando.is_set():
                if ultimo_estado_escuchando:
                    buffer_voz.clear()
                    cont_silencio = 0
                    hablando = False
                    ultimo_estado_escuchando = False
                    
                config.escuchando.wait(timeout=0.25)
                continue

            if not ultimo_estado_escuchando:
                buffer_voz.clear()
                cont_silencio = 0
                hablando = False
                ultimo_estado_escuchando = True

            es_modo_online = config.escuchando_google.is_set() or config.escuchando_groq.is_set()
            if es_modo_online != ultimo_modo_online:
                buffer_voz.clear()
                cont_silencio = 0
                hablando = False
                ultimo_modo_online = es_modo_online

            # ==========================================
            # 🛑 ESCUDO MUTEX F3 (LIBERACIÓN DE HARDWARE)
            # ==========================================
            if getattr(config, 'ESTADO_SISTEMA_F3_ACTIVO', False):
                # 1. Si el micrófono está encendido, lo apagamos físicamente
                if stream.is_active():
                    stream.stop_stream() 
                    print("[F1 STANDBY] Micrófono liberado para Whisper.")
                time.sleep(0.1)
                continue 
            else:
                # 2. Si el micrófono estaba apagado (y ya soltaste F3), lo volvemos a prender
                if not stream.is_active():
                    stream.start_stream()
                    print("[F1 REANUDADO] Micrófono recuperado por Google STT.")
            # ==========================================

            frame = stream.read(frame_size, exception_on_overflow=False)
            
            # --- MEDICIÓN DE ENERGÍA (Para descubrir micrófonos muertos) ---
            rms = audioop.rms(frame, 2)
            if rms < 50 and alertas_silencio_emitidas < 3:
                print(f"[🛡️ ALERTA VAD] Micrófono devolviendo SILENCIO ABSOLUTO (Volumen: {rms}). Revisa tu NVIDIA RTX Voice o Windows.")
                alertas_silencio_emitidas += 1
            elif rms >= 50 and alertas_silencio_emitidas == 0:
                print(f"[VAD RMS DEBUG] Audio fluyendo correctamente (Volumen: {rms})")
                alertas_silencio_emitidas = 4 # Ya no molestar
            
            if VAD_DISPONIBLE:
                # 🛡️ GATING DE AUDIO: Si el volumen (RMS) es menor a 120, no es voz humana relevante.
                if rms < 120:
                    es_voz = False
                else:
                    es_voz = vad.is_speech(frame, config.RATE)
            else:
                # 🛡️ VAD ADAPTATIVO v18.0 (Idea 02): Basado en ruido de fondo dinámico
                # Mantenemos un promedio del ruido y disparamos si supera el umbral relativo
                ruido_fondo = (ruido_fondo * 0.95) + (rms * 0.05) if 'ruido_fondo' in locals() else rms
                es_voz = rms > (ruido_fondo + 80) # Umbral dinámico log-like
            
            if es_voz:
                if not hablando: 
                    hablando = True
                    print("[VAD] 🎤 Voz detectada (Grabando paquete de audio...)")
                    if config.gui: config.cola_gui.put("VAD: HABLANDO")
                    iniciar_dictado_balistico()
                if not es_modo_online:
                    config.cola_streaming.put(frame)
                else:
                    buffer_voz.append(frame)
                cont_silencio = 0
            else:
                if hablando:
                    if not es_modo_online:
                        config.cola_streaming.put(frame)
                    else:
                        buffer_voz.append(frame)
                    cont_silencio += 1
                    
                    silence_threshold = config.SILENCE_THRESHOLD_OFFLINE if not es_modo_online else config.SILENCE_THRESHOLD_ONLINE
                    if cont_silencio > silence_threshold: 
                        print("[VAD] 🛑 Silencio detectado. Enviando ráfaga...")
                        if config.gui: config.cola_gui.put("VAD: PROCESANDO...")
                        if es_modo_online:
                            engine_type = "google" if config.escuchando_google.is_set() else "groq"
                            config.cola_audio.put((list(buffer_voz), engine_type))
                            buffer_voz.clear()
                        else:
                            config.cola_streaming.put("SILENCE")
                        hablando = False
                        cont_silencio = 0
        except Exception as ex_vad: 
            import traceback
            error_trace = traceback.format_exc()
            print(f"[VAD ERROR] Error al procesar audio: {ex_vad}\n{error_trace}")
            if config.gui:
                config.cola_gui.put(f"ERROR: Fallo en Audio ({str(ex_vad)[:20]})")
            time.sleep(0.5)

def vigilar_fatiga_ram():
    while True:
        time.sleep(1800) # Cada 30 mins
        gc.collect()

def precalentar_ollama():
    """Carga el modelo en memoria/GPU al iniciar para evitar delays en el primer dictado."""
    if config.usa_ia:
        try:
            import requests
            print("[OLLAMA] Pre-calentando Llama 3.2 en GPU/RAM...")
            payload = {
                "model": config.OLLAMA_MODEL,
                "prompt": "hola",
                "stream": False,
                "options": {
                    "num_predict": 5
                }
            }
            requests.post(config.OLLAMA_API_URL, json=payload, timeout=20)
            print("[OLLAMA] ✅ Modelo cargado y listo en memoria.")
        except Exception as e:
            print(f"[OLLAMA] Error pre-calentando modelo: {e}")


def iniciar_nucleo():
    """Lanzamiento Multihilo Blindado con Priority Boost."""
    # ELEVAR PRIORIDAD DEL PROCESO A NIVEL MILITAR (HIGH_PRIORITY_CLASS)
    ctypes.windll.kernel32.SetPriorityClass(ctypes.windll.kernel32.GetCurrentProcess(), 0x00000080)
    
    # 🛡️ LAZY LOADING ACTIVADO: SymSpell se cargará únicamente en el primer dictado activo
    # sym.inicializar_motor_elite()
    
    # Ollama desactivado por orden directa para ahorrar RAM
    # threading.Thread(target=precalentar_ollama, name="OLLAMA_WARMER", daemon=True).start()
    
    # Inicializar gancho reactivo de teclado (reemplaza hilos de sondeo)
    setup_keyboard_hooks()
    
    hilos = [
        threading.Thread(target=motor_audio, name="AUDIO_CORE", daemon=True),
        threading.Thread(target=procesar_logica_ia, name="IA_CORE", daemon=True),
        threading.Thread(target=trabajador_inyeccion, name="INJECTION_WORKER", daemon=True),
        threading.Thread(target=trabajador_whisper_streaming, name="WHISPER_STREAMING", daemon=True),
        threading.Thread(target=vigilar_fatiga_ram, name="RAM_MONITOR", daemon=True),
        threading.Thread(target=vigilante_hot_reload, name="HOT_RELOAD", daemon=True),
        # 🛡️ NUEVOS HILOS DE INTELIGENCIA (INVISIBLE-CONFIRM)
        threading.Thread(target=vigilante_confirmacion_silenciosa, name="TRUTH_GUARDIAN", daemon=True)
    ]
    
    for h in hilos:
        h.start()
    
    config.motores_listos.set() 
    print("[OK] Motores de voz desplegados y enlazados con gancho reactivo.")

def iniciar_dictado_balistico():
    """Reinicia el cronómetro de WPM para una nueva ráfaga."""
    global dictando, tiempo_inicio_dictado, conteo_palabras_sesion
    if not dictando:
        dictando = True
        tiempo_inicio_dictado = time.time()
        conteo_palabras_sesion = 0
        if config.gui: config.cola_gui.put("ESTADO: DICTANDO")

def hablar_cortana(categoria):
    """Interfaz para que la GUI active sonidos de Cortana utilizando el notificador unificado."""
    try:
        from notificador_militar import NotificadorMilitar
        import glob
        import random
        import threading
        archivos = glob.glob(f"audios/{categoria}*.mp3")
        if archivos:
            audio_elegido = random.choice(archivos)
            # Reproducir de forma asíncrona usando el motor blindado del notificador
            threading.Thread(target=lambda: NotificadorMilitar._ejecutar_mci(audio_elegido), daemon=True).start()
    except Exception as e:
        print(f"[NÚCLEO AUDIO ERROR] No se pudo reproducir {categoria}: {e}")

def purgar_memoria_total(manual=False):
    """Limpieza profunda de RAM."""
    gc.collect()
    if manual:
        winsound.Beep(800, 100)
        if config.gui: config.cola_gui.put("SISTEMA: Memoria Purgada")
def disparar_comando_local():
    """Motor de Ejecución Balística v16.1 (100% OFFLINE): Graba 2s y procesa con Vosk."""
    model = asegurar_modelo_vosk()
    if not model:
        config.registrar_evento("SISTEMA", "ERROR: Motor Vosk no cargado", es_critico=True)
        return

    def _tarea():
        config.registrar_evento("SISTEMA", "REC... COMANDO LOCAL", es_critico=True)
        winsound.Beep(1500, 100) # Señal Auditiva (BIP)
        if config.gui: 
            config.gui.root.after(0, config.gui.señal_grabacion_local)
        
        # Grabación relámpago (2 segundos)
        p = pyaudio.PyAudio()
        stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=1024)
        frames = []
        for _ in range(0, int(16000 / 1024 * 2)):
            frames.append(stream.read(1024))
        stream.stop_stream(); stream.close(); p.terminate()
        
        audio_data = b''.join(frames)
        
        # RECONOCIMIENTO WHISPER (Comando Local)
        model = asegurar_modelo_whisper()
        if model:
            import numpy as np
            audio_np = np.frombuffer(audio_data, np.int16).astype(np.float32) / 32768.0
            try:
                segments, _ = model.transcribe(audio_np, beam_size=1, language="es", condition_on_previous_text=False, vad_filter=True)
                texto = " ".join([segment.text for segment in segments]).strip().lower()
            except:
                texto = ""
        else:
            texto = ""
        
        if texto and texto != "[unk]":
            config.registrar_evento("SISTEMA", f"COMANDO LOCAL: {texto.upper()}")
            
            if "cortana" in texto and "comando" in texto and "microscopio" in texto:
                abrir_microscopia()
            elif "cortana" in texto or "asistente" in texto:
                if config.gui: config.gui.root.after(0, config.gui.abrir_editor_prompt)
            elif "carpeta" in texto or "fotos" in texto:
                path_macros = os.path.join(os.path.dirname(__file__), "macros_recibidas")
                if not os.path.exists(path_macros): os.makedirs(path_macros)
                os.startfile(path_macros)
            elif "guardar" in texto or "salvar" in texto:
                # Simular Clic de Guardado (Control + S)
                ctypes.windll.user32.keybd_event(0x11, 0, 0, 0) # Ctrl
                ctypes.windll.user32.keybd_event(0x53, 0, 0, 0) # S
                ctypes.windll.user32.keybd_event(0x53, 0, 2, 0)
                ctypes.windll.user32.keybd_event(0x11, 0, 2, 0)
                winsound.Beep(1200, 200)
        else:
            config.registrar_evento("SISTEMA", "⚠️ COMANDO NO RECONOCIDO (OFFLINE)")

    threading.Thread(target=_tarea, daemon=True).start()
