import os, ctypes, glob, random, subprocess, winsound, threading, queue, socket, time
import tkinter as tk
from tkinter import scrolledtext

# ==========================================
# ⚡ CARGA DIFERIDA (LAZY LOADING - CORTANA)
# ==========================================
class LazyAssets:
    _cv2 = None
    _Image = None
    _ImageTk = None
    _pygame = None
    _qrcode = None

    @classmethod
    def get_cv2(cls):
        if cls._cv2 is None: import cv2; cls._cv2 = cv2
        return cls._cv2

    @classmethod
    def get_imaging(cls):
        if cls._Image is None: from PIL import Image, ImageTk; cls._Image = Image; cls._ImageTk = ImageTk
        return cls._Image, cls._ImageTk

    @classmethod
    def get_pygame(cls):
        if cls._pygame is None: import pygame; cls._pygame = pygame
        return cls._pygame

    @classmethod
    def get_qrcode(cls):
        if cls._qrcode is None: import qrcode; cls._qrcode = qrcode
        return cls._qrcode

    @classmethod
    def get_numpy(cls):
        import numpy as np; return np

import config
# Importaciones pesadas movidas a nivel de método para arranque Ghost-Boot

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except: return "127.0.0.1"

def aplicar_bordes_redondos(ventana, ancho, alto, radio=25):
    try:
        ventana.update_idletasks()
        hwnd = ventana.winfo_id()
        padre = ctypes.windll.user32.GetParent(hwnd)
        hwnd_real = padre if padre != 0 else hwnd
        rgn = ctypes.windll.gdi32.CreateRoundRectRgn(0, 0, ancho, alto, radio, radio)
        ctypes.windll.user32.SetWindowRgn(hwnd_real, rgn, True)
    except: pass

def hablar_cortana(categoria):
    try:
        from notificador_militar import NotificadorMilitar
        import threading
        archivos = glob.glob(f"audios/{categoria}*.mp3")
        if archivos:
            audio_elegido = random.choice(archivos)
            threading.Thread(target=lambda: NotificadorMilitar._ejecutar_mci(audio_elegido), daemon=True).start()
    except Exception as e:
        print(f"[GUI AUDIO ERROR] No se pudo reproducir {categoria}: {e}")

# ==========================================
# 🛡️ PROTOCOLO CORTANA (ESTABILIDAD MILITAR)
# ==========================================
class SupervisorMilitar:
    """Libera RAM y recursos de forma agresiva tras cada ráfaga de actividad."""
    @staticmethod
    def purgar_ram():
        import gc
        gc.collect()
        # El motor de FrameStreamer gestiona su propia memoria asíncrona.
        # Se ha eliminado la referencia a FrameBuffer por ser obsoleta.

class MotorEstados:
    """FSM (Finite State Machine) para evitar colisiones de hilos y clics múltiples."""
    IDLE = "REPOSO"
    BUSY = "PROCESANDO"
    _estado = IDLE
    _lock = threading.Lock()

    @classmethod
    def set(cls, nuevo_estado):
        with cls._lock:
            cls._estado = nuevo_estado

    @classmethod
    def es_libre(cls):
        with cls._lock: return cls._estado == cls.IDLE

class BotonBlindado:
    """Ejecuta comandos en hilos aislados con Catch-All de errores y gestión de estados."""
    @staticmethod
    def ejecutar(func, *args, **kwargs):
        if not MotorEstados.es_libre():
            winsound.Beep(400, 50)
            return # Bloqueo de re-entrada (Race Condition Shield)
        
        MotorEstados.set(MotorEstados.BUSY)
        
        def wrapper():
            try:
                func(*args, **kwargs)
            except Exception as e:
                config.registrar_evento("SISTEMA", f"ERROR: {str(e)[:25]}", es_critico=True)
            finally:
                MotorEstados.set(MotorEstados.IDLE)
                SupervisorMilitar.purgar_ram()
        
        t = threading.Thread(target=wrapper, daemon=True, name=f"BLINDADO_{func.__name__}")
        t.start()

# ==========================================
# 🚀 MOTOR DE PRECARGA EN RAM (CORTANA V2)
# ==========================================
# ==========================================
# 🚀 MOTOR DE VÍDEO CORTANA V2 (STREAMING + GPU)
# ==========================================
class FrameStreamer:
    """Motor de Streaming Ultra-Optimizado: Cacheado en RAM de imágenes PIL a mitad de FPS."""
    _cache_pil = {} # { "archivo": [pil_image, ...] }
    _cache_tk = {}  # { "archivo": [tk_image, ...] } para cero latencia
    _indices = {}
    _fps = {} # { "archivo": float }

    @classmethod
    def preparar(cls, archivo, size=(95, 95)):
        """Pre-decodifica todo el vídeo en RAM 1 sola vez con renderizado de alta fidelidad INTER_AREA y consumo optimizado."""
        if archivo not in cls._cache_pil:
            cls._cache_pil[archivo] = []
            cls._cache_tk[archivo] = []
            cls._indices[archivo] = 0
            
            cv2 = LazyAssets.get_cv2()
            Image, ImageTk = LazyAssets.get_imaging()
            cap = cv2.VideoCapture(archivo)
            
            original_fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
            step = 1 # Animación fluida de alta calidad
            cls._fps[archivo] = original_fps / step
            print(f"[🛡️ PRE-CACHE OPTIMIZADO V2] Decodificando: {archivo} a {size} (Paso: {step}, FPS: {cls._fps[archivo]})")
            
            count = 0
            while True:
                ret, frame = cap.read()
                if not ret: break
                
                count += 1
                if count % step != 0:
                    continue
                    
                # INTER_AREA: Renderizado foto-realista sin aliasing y ultra-nítido
                frame = cv2.resize(frame, size, interpolation=cv2.INTER_AREA)
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(frame)
                cls._cache_pil[archivo].append(pil_img)
                try:
                    cls._cache_tk[archivo].append(ImageTk.PhotoImage(pil_img))
                except:
                    pass
            
            cap.release()
            import gc; gc.collect() # Liberar buffers temporales de OpenCV
            print(f"[🛡️ PRE-CACHE OPTIMIZADO V2] Completado: {archivo} ({len(cls._cache_pil[archivo])} frames ultraligeros)")

    @classmethod
    def obtener_frame(cls, archivo, tipo="tk"):
        """Devuelve el siguiente cuadro desde la caché estática."""
        cache = cls._cache_tk if tipo == "tk" else cls._cache_pil
        if archivo not in cache or not cache[archivo]: return None
        idx = cls._indices[archivo]
        img = cache[archivo][idx]
        
        # Solo avanzar el índice si estamos pidiendo la imagen final que se mostrará
        if tipo == "tk":
            cls._indices[archivo] = (idx + 1) % len(cache[archivo])
        return img

    @classmethod
    def limpiar_cache(cls):
        """Purga total de memoria."""
        cls._cache.clear()
        cls._indices.clear()
        import gc; gc.collect()

class Aplicacion:
    def __init__(self, root=None):
        self.cola_gui = config.cola_gui
        if root is None:
            root = tk.Tk()
        self.root = root
        self.root.overrideredirect(True)
        self.root.attributes('-topmost', True)
        self.root.overrideredirect(True)
        self.root.attributes('-topmost', True)
        self.root.geometry("99x450+100+100") 
        self.root.config(bg='black')
        self.proceso_gestor = None
        
        # --- MOTOR SOVEREIGN V2.5 (SENTINEL-CANVAS - 10% COMPACTO) ---
        self.ancho, self.alto = 99, 450
        self.canvas = tk.Canvas(self.root, width=self.ancho, height=self.alto, 
                                bg='#050505', highlightthickness=0, bd=0)
        self.canvas.pack(fill='both', expand=True)
        
        # Fondo Metálico (Simulado por código)
        self.crear_fondo_metalico()
        
        # Slot para el Avatar (Compactado a 95x95)
        self.video_label = tk.Label(self.root, bg='black', bd=0, width=95, height=95)
        self.canvas.create_window(self.ancho//2, 54, window=self.video_label)
        
        # --- CARGA DINÁMICA DE BOTONES (SENTINEL COMPACTO) ---
        self.btns = {}
        self.items_gui = {} # Referencias a objetos del canvas
        self.preparar_botones_tacticos()
        
        aplicar_bordes_redondos(self.root, self.ancho, self.alto, radio=30)
        
        # --- CONTINUAR LÓGICA ORIGINAL ---
        self.archivo_actual = config.VIDEO_IDLE
        self.archivo_siguiente = None
        self.alpha_mezcla = 0.0
        self.mezclando = False
        
        self.cambiar_modo("DICTADO")
        
        # MOTOR DE RENDERIZACIÓN POR FLUJO (STREAMING 60FPS)
        self.video_loop_id = None
        
        # ⚡ INICIO DIFERIDO: Sincronizado con el motor de GPU y el Bot de Inicio
        from notificador_militar import NotificadorMilitar
        self.root.after(800, NotificadorMilitar.reproducir_arranque_cortana)
        
        # Preparar canales de streaming (IDLE y START)
        FrameStreamer.preparar(config.VIDEO_IDLE)
        FrameStreamer.preparar(config.VIDEO_INICIO)
        
        self.root.after(500, lambda: self.activar_streaming(config.VIDEO_INICIO))
        self.root.after(4000, lambda: self.activar_streaming(config.VIDEO_IDLE))
        
        self.root.bind("<Button-1>", self.clic_ventana)
        self.root.bind("<B1-Motion>", self.mover_ventana)
        self.root.protocol("WM_DELETE_WINDOW", self.cerrar_sistema)

        # ⚡ CRÍTICO: Inicia el radar de lectura y telemetría
        self.lbl_id = None # Puntero para evitar solapamientos
        self.verificar_mensajes_ia()
        self.mantener_al_frente()
        
        # 🧠 MOTOR DE APRENDIZAJE SENTINEL (v16.0)
        # Hilo de fondo que aprende cada 2 horas automáticamente
        self.reiniciar_hilo_aprendizaje_automatico()
        
        # 🎙️ REPRODUCTOR DE AUDIOS MOTIVACIONALES (MOTIVA)
        # Hilo de fondo que ejecuta un audio motivacional aleatorio cada hora
        self.iniciar_hilo_motivacional()

    def crear_fondo_metalico(self):
        """Dibuja el marco cibernético en el fondo del Canvas."""
        # Borde exterior luminoso dinámico
        self.canvas.create_rectangle(2, 2, self.ancho - 2, self.alto - 2, outline='#333', width=2)
        self.canvas.create_rectangle(4, 4, self.ancho - 4, self.alto - 4, outline='#111', width=1)
        # Brillos en las esquinas
        self.canvas.create_line(8, 4, 35, 4, fill='#00d1ff', width=2)
        self.canvas.create_line(4, 8, 4, 35, fill='#00d1ff', width=2)

    def preparar_botones_tacticos(self):
        """Genera los botones sobre el Canvas siguiendo la estética de la imagen (10% escalado)."""
        y_inicial = 108
        espacio = 18
        
        # 1. BOTONES MIC (GOOGLE / GROQ / OFFLINE)
        self.crear_boton_canvas(y_inicial, "GOOGLE (Shift+F1)", '#c0392b', "MIC_GOOGLE", cmd=self.toggle_mic_google_click)
        self.crear_boton_canvas(y_inicial + 17, "GROQ (Shift+F2)", '#c0392b', "MIC_GROQ", cmd=self.toggle_mic_groq_click)
        self.crear_boton_canvas(y_inicial + 34, "OFFLINE (Shift+F5)", '#c0392b', "MIC_OFFLINE", cmd=self.toggle_mic_offline_click)
        
        # 2. MODOS (Shift+F3 / Shift+F4)
        modos = [("PLANTILLA", "Shift+F3"), ("COMANDO", "Shift+F4")]
        for i, (m, tecla) in enumerate(modos):
            y = y_inicial + 51 + (i * espacio)
            cmd_callback = self.click_plantilla if m == "PLANTILLA" else self.click_comando
            self.crear_boton_canvas(y, f"{m} ({tecla})", '#222', m, tag=tecla, cmd=cmd_callback)
            
        # 3. ACCIONES Y IA
        y_acciones = y_inicial + 51 + (len(modos) * espacio) + 8
        self.crear_boton_canvas(y_acciones, "ABRIR GESTOR", '#8e44ad', "GESTOR", cmd=self.toggle_gestor)
        self.crear_boton_canvas(y_acciones+17, "INICIAR REPORTES", '#d35400', "ROBOT", cmd=self.lanzar_robot_thread)
        
        # IA Toggle (Texto dinámico)
        txt_ia = f"IA: {config.OLLAMA_MODEL.split(':')[0].upper()} (ON)" if config.usa_ia else "IA: OFF"
        color_ia = '#a04000' if config.usa_ia else '#222'
        self.btn_ultra_id = self.crear_boton_canvas(y_acciones+34, txt_ia, color_ia, "IA", cmd=self.toggle_ia)

        # MODO MÉDICO Toggle (El Interruptor Clínico)
        txt_medico = "MEDICINA: ON" if getattr(config, 'modo_medico_activo', True) else "MEDICINA: OFF"
        color_medico = '#27ae60' if getattr(config, 'modo_medico_activo', True) else '#222'
        self.crear_boton_canvas(y_acciones+51, txt_medico, color_medico, "MEDICO", cmd=self.toggle_modo_medico)

        # Resto de botones compactados (Fase 4 - Operaciones)
        y_extra = y_acciones + 68
        otras = [("RETOQUE FOTOGRÁFICO", '#16a085', self.lanzar_optimizador),
                 ("APRENDIZAJE", '#f39c12', self.disparar_aprendizaje_ia),
                 ("PROMPT", '#455a64', self.abrir_editor_prompt),
                 ("🩺 TRIAJE", '#27ae60', self.abrir_triage),
                 ("📁 ORDENAR ARCHIVOS", '#34495e', self.lanzar_ordenar_archivos),
                 ("❌ CERRAR SISTEMA", '#c0392b', self.cerrar_sistema)]
        
        for i, (txt, clr, f) in enumerate(otras):
            self.crear_boton_canvas(y_extra + (i*17), txt, clr, txt, cmd=f)

    def crear_boton_canvas(self, y, texto, color, id_btn, tag=None, cmd=None):
        """Dibuja un botón con estilo Sovereign en el Canvas."""
        padding = 4
        x1, y1, x2, y2 = padding, y, self.ancho - padding, y+15
        
        # Sombra/Glow
        glow = self.canvas.create_rectangle(x1-1, y1-1, x2+1, y2+1, fill='', outline=color, width=1, stipple='gray50')
        # Cuerpo del botón (Glassmorphism simulado)
        rect = self.canvas.create_rectangle(x1, y1, x2, y2, fill=color, outline='#555', width=1)
        # Texto
        txt_id = self.canvas.create_text(self.ancho // 2, y+7, text=texto, fill='white', font=('Segoe UI', 5, 'bold'))
        
        # Guardar para actualizaciones
        if id_btn in ["DICTADO", "PLANTILLA", "COMANDO"]:
            self.btns[id_btn] = (rect, txt_id, color)
        if id_btn == "MIC_GOOGLE": self.btn_mic_google_items = (rect, txt_id)
        if id_btn == "MIC_GROQ": self.btn_mic_groq_items = (rect, txt_id)
        if id_btn == "MIC_OFFLINE": self.btn_mic_offline_items = (rect, txt_id)
        if id_btn == "IA": self.btn_ia_items = (rect, txt_id)
        if id_btn == "MEDICO": self.btn_medico_items = (rect, txt_id)
        if id_btn == "GESTOR": self.btn_gestor_items = (rect, txt_id)

        # Eventos
        callback = cmd if cmd else (lambda: BotonBlindado.ejecutar(self.cambiar_modo, id_btn))
        self.canvas.tag_bind(rect, "<Button-1>", lambda e: callback())
        self.canvas.tag_bind(txt_id, "<Button-1>", lambda e: callback())
        
        return rect

    def actualizar_onda(self):
        """No-op: Eliminada la animación para maximizar desempeño y reducir consumo de CPU."""
        pass

    def activar_streaming(self, archivo):
        """Activa un canal de vídeo o inicia una transición suave (Morphing)."""
        if archivo == self.archivo_actual and not self.mezclando: return
        if self.mezclando and archivo == self.archivo_siguiente: return
        
        FrameStreamer.preparar(archivo)
        
        # Iniciar protocolo de Mezcla (Crossfades)
        self.archivo_siguiente = archivo
        self.transicion_total_frames = 8
        self.transicion_frames_restantes = 8
        self.mezclando = True
        FrameStreamer._indices[archivo] = 0  # Empezar el nuevo video desde el frame 0
        
        if not self.video_loop_id:
            delay = int(1000 / (FrameStreamer._fps.get(archivo, 30.0)))
            self.video_loop_id = self.root.after(delay, self.renderizar_streaming)

    def renderizar_streaming(self):
        """Renderizado sincronizado con los FPS nativos del vídeo."""
        if self.root.state() in ["iconic", "withdrawn"]:
            self.video_loop_id = self.root.after(300, self.renderizar_streaming)
            return
            
        fps_video = FrameStreamer._fps.get(self.archivo_actual, 12.0)
        delay = int(1000 / fps_video)
        
        # 🛡️ OPTIMIZACIÓN MATEMÁTICA: Descanso de GPU/CPU (Dynamic FPS)
        if not self.mezclando and self.archivo_actual == config.VIDEO_IDLE:
            delay = 100 # Forzar 10 FPS en reposo para bajar carga pasiva a 0%
        try:
            Image, ImageTk = LazyAssets.get_imaging()
            if self.mezclando and self.archivo_siguiente:
                pil_actual = FrameStreamer.obtener_frame(self.archivo_actual, tipo="pil")
                pil_siguiente = FrameStreamer.obtener_frame(self.archivo_siguiente, tipo="pil")
                
                # Avanzamos el índice manualmente porque tipo="pil" no lo avanza
                FrameStreamer._indices[self.archivo_actual] = (FrameStreamer._indices[self.archivo_actual] + 1) % len(FrameStreamer._cache_pil[self.archivo_actual])
                
                if pil_actual and pil_siguiente:
                    alpha = (self.transicion_total_frames - self.transicion_frames_restantes) / self.transicion_total_frames
                    blended_pil = Image.blend(pil_actual, pil_siguiente, alpha)
                    frame = ImageTk.PhotoImage(blended_pil)
                    
                    self.transicion_frames_restantes -= 1
                    if self.transicion_frames_restantes <= 0:
                        self.archivo_actual = self.archivo_siguiente
                        self.archivo_siguiente = None
                        self.mezclando = False
                else:
                    self.archivo_actual = self.archivo_siguiente
                    self.archivo_siguiente = None
                    self.mezclando = False
                    frame = FrameStreamer.obtener_frame(self.archivo_actual, tipo="tk")
            else:
                frame = FrameStreamer.obtener_frame(self.archivo_actual, tipo="tk")
            
            if frame:
                self.video_label.config(image=frame)
                self.video_label.image = frame
            
            self.video_loop_id = self.root.after(delay, self.renderizar_streaming)
        except Exception as e:
            print(f"[ERROR STREAMING]: {e}")
            self.video_loop_id = self.root.after(100, self.renderizar_streaming)

    def toggle_gestor(self):
        if self.proceso_gestor is None or self.proceso_gestor.poll() is not None:
            self.proceso_gestor = subprocess.Popen(["python", "legacy/Gestor_Plantillas.py"])
            self.canvas.itemconfig(self.btn_gestor_items[0], fill='#c0392b')
            self.canvas.itemconfig(self.btn_gestor_items[1], text="CERRAR GESTOR")
        else:
            self.proceso_gestor.terminate()
            self.proceso_gestor = None
            self.canvas.itemconfig(self.btn_gestor_items[0], fill='#8e44ad')
            self.canvas.itemconfig(self.btn_gestor_items[1], text="ABRIR GESTOR")

    def abrir_editor_prompt(self):
        """Lanza el Gestor de Prompts de forma DIRECTA y SILENCIOSA."""
        winsound.Beep(1000, 100)
        try:
            import sys
            base_dir = os.path.dirname(os.path.abspath(__file__))
            ruta_manager = os.path.join(base_dir, "promt", "promt_manager.py")
            
            # 🛡️ LANZAMIENTO PORTABLE CON WINDOWS EXECUTIVE (pythonw.exe)
            pythonw_exec = sys.executable.replace("python.exe", "pythonw.exe")
            subprocess.Popen([pythonw_exec, ruta_manager], 
                             cwd=os.path.join(base_dir, "promt"))
            
            config.cola_gui.put("OK: Gestor de Prompts iniciado.")
        except Exception as e:
            print(f"[ERROR LANZADOR PROMPT]: {e}")
            config.cola_gui.put(f"ERROR: No se pudo abrir Prompts")

    def abrir_triage(self):
        """Lanza la Bandeja de Triage (Staging) para aprobación de IA."""
        winsound.Beep(1000, 100)
        try:
            import sys
            base_dir = os.path.dirname(os.path.abspath(__file__))
            pythonw_exec = sys.executable.replace("python.exe", "pythonw.exe")
            subprocess.Popen([pythonw_exec, "gui_triaje.py"], cwd=base_dir)
        except Exception as e:
            print(f"[ERROR TRIAGE]: {e}")

    def cerrar_sistema(self):
        import os
        import winsound
        import subprocess
        winsound.Beep(400, 200)
        
        print("[SISTEMA] Cerrando y saneando todos los procesos del dictáfono...")
        
        # 1. Cerrar ventanas de herramientas secundarias por título directamente
        for title in ["*TRIAGE*", "*PROMPT MANAGER*", "*Pathology Optimizer*", "*Retoque de Fotos*", "*Gestor de Plantillas*"]:
            try:
                subprocess.run(f'taskkill /F /FI "WINDOWTITLE eq {title}" /T', shell=True, creationflags=0x08000000)
            except: pass
            
        # 2. Ejecutar cerrar_cortana.ps1 para terminar todo el ecosistema (ollama, python, pythonw, etc.)
        try:
            ps_script = os.path.join(config.BASE_DIR, "cerrar_cortana.ps1")
            subprocess.run(f'powershell -ExecutionPolicy Bypass -File "{ps_script}"', shell=True, creationflags=0x08000000)
        except Exception as e:
            print(f"[CERRAR SISTEMA ERROR]: {e}")
            
        # 3. Matar la ventana de CMD original por su título (cerrará el CMD y sus hijos)
        subprocess.run('taskkill /F /FI "WINDOWTITLE eq JC PATH - CORTANA MAIN CORE*" /T', shell=True, creationflags=0x08000000)
        
        # 4. Matar todo el árbol de procesos dependiente de este Python (incluyendo ventanas secundarias)
        pid = os.getpid()
        subprocess.run(f'taskkill /F /PID {pid} /T', shell=True, creationflags=0x08000000)
        
        os._exit(0)

    def minimizar_sistema(self):
        """Minimiza la ventana a la barra de tareas de Windows de forma segura."""
        winsound.Beep(800, 100)
        try:
            self.root.overrideredirect(False)
            self.root.iconify()
            # Escuchar cuando el usuario restaure la ventana
            self.root.bind("<Map>", self.al_restaurar_ventana)
        except Exception as e:
            print(f"[ERROR MINIMIZAR]: {e}")

    def al_restaurar_ventana(self, event):
        """Restaura el estado borderless y topmost de la ventana al desminimizarse."""
        try:
            self.root.unbind("<Map>")
            self.root.overrideredirect(True)
            self.root.attributes('-topmost', True)
            self.root.lift()
            aplicar_bordes_redondos(self.root, self.ancho, self.alto, radio=35)
        except Exception as e:
            print(f"[ERROR RESTAURAR]: {e}")

    def lanzar_ordenar_archivos(self):
        """Ejecuta el script organizador_informes.py en segundo plano."""
        import winsound
        import subprocess
        import sys
        winsound.Beep(1000, 150)
        config.cola_gui.put("IA: Escaneando Informes en Escritorio y Descargas...")
        try:
            # Ejecución asíncrona ciega (creationflags=0x08000000 oculta la terminal cmd)
            subprocess.Popen([sys.executable, "organizador_informes.py"], creationflags=0x08000000)
        except Exception as e:
            config.cola_gui.put(f"ERROR: Fallo al lanzar el organizador: {str(e)[:30]}")


    def lanzar_optimizador(self):
        winsound.Beep(1000, 150)
        try:
            import sys
            pythonw_exec = sys.executable.replace("python.exe", "pythonw.exe")
            ruta_script = os.path.join(config.BASE_DIR, "editor_fotografico.py")
            subprocess.Popen([pythonw_exec, ruta_script], cwd=config.BASE_DIR)
        except Exception as e:
            config.cola_gui.put(f"ERROR: Fallo al lanzar el optimizador: {str(e)[:30]}")

    def lanzar_macro_fotos(self):
        """Dispara el Retoque de Fotos (Editor Quirúrgico) en segundo plano."""
        winsound.Beep(1200, 150)
        try:
            import subprocess
            import os
            import sys
            base_dir = os.path.dirname(os.path.abspath(__file__))
            ruta_editor = os.path.join(base_dir, "editor_fotografico.py")
            # 🛡️ LANZAMIENTO PORTABLE CON WINDOWS EXECUTIVE (pythonw.exe)
            pythonw_exec = sys.executable.replace("python.exe", "pythonw.exe")
            subprocess.Popen([pythonw_exec, ruta_editor], cwd=base_dir)
            config.registrar_evento("SISTEMA", "Iniciando Motor RETOQUE DE FOTOS")
            config.cola_gui.put("IA: Abriendo Editor Fotográfico...")
        except Exception as e:
            print(f"Error lanzando Retoque de Fotos: {e}")

    def toggle_ia(self):
        config.usa_ia = not config.usa_ia
        if config.usa_ia:
            modelo_corto = config.OLLAMA_MODEL.split(":")[0].upper()
            self.canvas.itemconfig(self.btn_ia_items[0], fill='#a04000')
            self.canvas.itemconfig(self.btn_ia_items[1], text=f"IA: {modelo_corto} (ON)")
            winsound.Beep(1200, 100)
        else:
            self.canvas.itemconfig(self.btn_ia_items[0], fill='#222')
            self.canvas.itemconfig(self.btn_ia_items[1], text="IA: APAGADA (OFFLINE)")
            winsound.Beep(400, 100)

    def toggle_modo_medico(self):
        """Alterna el Diccionario Clínico de Whisper para separar patología de cartas."""
        config.modo_medico_activo = not getattr(config, 'modo_medico_activo', True)
        txt = "MEDICINA: ON" if config.modo_medico_activo else "MEDICINA: OFF"
        clr = '#27ae60' if config.modo_medico_activo else '#222'
        self.canvas.itemconfig(self.btn_medico_items[1], text=txt)
        self.canvas.itemconfig(self.btn_medico_items[0], fill=clr)
        
        modo = "QUIRÚRGICO (Patología)" if config.modo_medico_activo else "NEUTRAL (Cartas)"
        config.cola_gui.put(f"IA: Cerebro Whisper: {modo}")
        if config.modo_medico_activo:
            winsound.Beep(1200, 100)
        else:
            winsound.Beep(400, 100)


    def lanzar_robot_thread(self):
        from Robot_JC_PATH import iniciar_sesion
        winsound.Beep(1500, 200)
        config.registrar_evento("ROBOT", "Iniciando Portal Selenium...")
        iniciar_sesion()


    def cambiar_modo(self, modo):
        """Cambia el modo operativo y actualiza la interfaz (F1-F4)."""
        config.MODO_ACTUAL = modo
        for name, items in self.btns.items():
            rect, txt, color_orig = items
            if name == modo:
                self.canvas.itemconfig(rect, fill='#00d1ff', outline='white')
                self.canvas.itemconfig(txt, fill='black')
            else:
                self.canvas.itemconfig(rect, fill=color_orig, outline='#555')
                self.canvas.itemconfig(txt, fill='white')
        config.registrar_evento("SISTEMA", f"MODO: {modo}")
        
        if modo == "PLANTILLA":
            self.mostrar_submenu_plantillas()

    def actualizar_modo_seguro(self, modo): # Alias para compatibilidad con main.py
        self.cambiar_modo(modo)

    def mostrar_submenu_plantillas(self):
        """Despliega un submenú nativo de Tkinter con las plantillas organizadas."""
        import json, pyperclip, keyboard, threading, time, os
        menu = tk.Menu(self.root, tearoff=0, bg="#2d2d2d", fg="#ffffff", font=('Segoe UI', 10, 'bold'))
        
        plantillas = {}
        base_dir = os.path.dirname(os.path.abspath(__file__))
        rutas = [os.path.join(base_dir, "plantillas.json"), 
                 os.path.join(base_dir, "plantillas_AnatomiaPatologica.json")]
        
        for ruta in rutas:
            if os.path.exists(ruta):
                try:
                    with open(ruta, 'r', encoding='utf-8') as f:
                        plantillas.update(json.load(f))
                except: pass
                
        def pegar(txt):
            def action():
                time.sleep(0.15)
                try:
                    import inyector_bloque as ib
                    ib.inyectar_bloque_atómico(txt)
                except Exception:
                    pyperclip.copy(txt)
                    keyboard.send('ctrl+v')
            threading.Thread(target=action, daemon=True).start()

        menu_macro = tk.Menu(menu, tearoff=0, bg="#1e1e1e", fg="#00ffcc", font=('Segoe UI', 10))
        menu_micro = tk.Menu(menu, tearoff=0, bg="#1e1e1e", fg="#ff00ff", font=('Segoe UI', 10))
        menu_otros = tk.Menu(menu, tearoff=0, bg="#1e1e1e", fg="#ffffff", font=('Segoe UI', 10))

        for k in sorted(plantillas.keys()):
            val = plantillas[k]
            # Usar asignación por defecto para evitar bug de variable libre en lambda
            if k.lower().startswith('macro'):
                menu_macro.add_command(label=k, command=lambda t=val: pegar(t))
            elif k.lower().startswith('micro'):
                menu_micro.add_command(label=k, command=lambda t=val: pegar(t))
            else:
                menu_otros.add_command(label=k, command=lambda t=val: pegar(t))

        if menu_macro.index("end") is not None:
            menu.add_cascade(label="🩺 MACROS", menu=menu_macro)
        if menu_micro.index("end") is not None:
            menu.add_cascade(label="🔬 MICROS", menu=menu_micro)
        if menu_otros.index("end") is not None:
            menu.add_cascade(label="📝 OTROS", menu=menu_otros)

        try:
            x, y = self.root.winfo_pointerxy()
            menu.tk_popup(x, y)
        finally:
            menu.grab_release()

    def actualizar_modo_seguro(self, modo): # Alias para compatibilidad con main.py
        self.cambiar_modo(modo)

    def señal_grabacion_local(self):
        """Efecto visual de alerta roja para comandos locales en el Canvas."""
        def parpadear(count):
            if count <= 0:
                self.canvas.config(bg='#050505')
                self.video_label.config(bg='black')
                return
            current_color = '#ff3e3e' if count % 2 == 0 else '#050505'
            self.canvas.config(bg=current_color)
            self.video_label.config(bg=current_color)
            self.root.after(200, lambda: parpadear(count - 1))
        parpadear(10)

    # Alianzas de Compatibilidad (v8.2): Evitar fallas en atajos F10/F11
    def lanzar_macro_fotos_local(self): self.lanzar_macro_fotos()
    def optimizar_macros_manual(self): self.lanzar_optimizador()

    def actualizar_video_seguro(self, archivo, loop=True): self.activar_streaming(archivo)

    def toggle_mic_google_click(self):
        if hasattr(config, 'callback_toggle_google') and config.callback_toggle_google:
            config.callback_toggle_google()
        else:
            import keyboard
            keyboard.send('shift+f1')

    def toggle_mic_groq_click(self):
        if hasattr(config, 'callback_toggle_groq') and config.callback_toggle_groq:
            config.callback_toggle_groq()
        else:
            import keyboard
            keyboard.send('shift+f2')

    def toggle_mic_offline_click(self):
        if hasattr(config, 'callback_toggle_offline') and config.callback_toggle_offline:
            config.callback_toggle_offline()
        else:
            import keyboard
            keyboard.send('shift+f5')

    def click_plantilla(self):
        if hasattr(config, 'callback_toggle_plantilla') and config.callback_toggle_plantilla:
            config.callback_toggle_plantilla()
        else:
            import keyboard
            keyboard.send('shift+f3')

    def click_comando(self):
        if hasattr(config, 'callback_toggle_comando') and config.callback_toggle_comando:
            config.callback_toggle_comando()
        else:
            import keyboard
            keyboard.send('shift+f4')

    def actualizar_estado_mic_google(self, estado):
        if hasattr(self, 'btn_mic_google_items'):
            if estado:
                self.canvas.itemconfig(self.btn_mic_google_items[0], fill='#27ae60')
                self.canvas.itemconfig(self.btn_mic_google_items[1], text="GOOGLE ON")
            else:
                self.canvas.itemconfig(self.btn_mic_google_items[0], fill='#c0392b')
                self.canvas.itemconfig(self.btn_mic_google_items[1], text="GOOGLE (Shift+F1)")

    def actualizar_estado_mic_groq(self, estado):
        if hasattr(self, 'btn_mic_groq_items'):
            if estado:
                self.canvas.itemconfig(self.btn_mic_groq_items[0], fill='#27ae60')
                self.canvas.itemconfig(self.btn_mic_groq_items[1], text="GROQ ON")
            else:
                self.canvas.itemconfig(self.btn_mic_groq_items[0], fill='#c0392b')
                self.canvas.itemconfig(self.btn_mic_groq_items[1], text="GROQ (Shift+F2)")

    def actualizar_estado_mic_offline(self, estado):
        if hasattr(self, 'btn_mic_offline_items'):
            if estado:
                self.canvas.itemconfig(self.btn_mic_offline_items[0], fill='#27ae60')
                self.canvas.itemconfig(self.btn_mic_offline_items[1], text="OFFLINE ON")
            else:
                self.canvas.itemconfig(self.btn_mic_offline_items[0], fill='#c0392b')
                self.canvas.itemconfig(self.btn_mic_offline_items[1], text="OFFLINE (Shift+F5)")

    def actualizar_estado_mic(self, estado):
        self.actualizar_estado_mic_google(estado)

    def disparar_aprendizaje_ia(self):
        """Ejecuta el Agente Sentinel de forma inmediata."""
        def tarea():
            winsound.Beep(1200, 150)
            config.cola_gui.put("IA: Iniciando Aprendizaje Sentinel...")
            try:
                import agente_aprendizaje_sentinel as aas
                aas.procesar_aprendizaje_ia()
                config.cola_gui.put("OK: Cortana ha asimilado nuevos datos.")
                winsound.Beep(1500, 250)
            except Exception as e:
                config.cola_gui.put(f"ERROR: Falló el aprendizaje: {str(e)[:20]}")
        
        BotonBlindado.ejecutar(tarea)

    def reiniciar_hilo_aprendizaje_automatico(self):
        """Inicia el ciclo de 2 horas para aprendizaje autónomo."""
        def loop_aprendizaje():
            # Esperar 10 min tras el arranque para el primer aprendizaje
            time.sleep(600) 
            while True:
                try:
                    import agente_aprendizaje_sentinel as aas
                    aas.procesar_aprendizaje_ia()
                except: pass
                time.sleep(7200) # Cada 2 horas
        
        t = threading.Thread(target=loop_aprendizaje, daemon=True, name="AUTO_LEARN_SENTINEL")
        t.start()

    def iniciar_hilo_motivacional(self):
        """Inicia el ciclo para reproducir un audio motivacional (MOTIVA) cada hora."""
        def loop_motivacional():
            # Esperar 30 segundos tras el arranque para no interrumpir la bienvenida
            time.sleep(30)
            while True:
                try:
                    config.registrar_evento("SISTEMA", "Reproduciendo audio motivacional...")
                    hablar_cortana("motiva")
                except Exception as e:
                    print(f"[REPRODUCTOR MOTIVACIONAL] Error: {e}")
                time.sleep(3600) # Cada hora
        
        t = threading.Thread(target=loop_motivacional, daemon=True, name="AUDIO_MOTIVACIONAL_SCHEDULER")
        t.start()

    def verificar_mensajes_ia(self):
        import datetime
        try:
            procesados = 0
            while not config.cola_gui.empty() and procesados < 20: 
                msg = config.cola_gui.get_nowait()
                ts = datetime.datetime.now().strftime("%H:%M:%S")

                # --- GESTOR DE SEÑALES ESTRUCTURADAS (Thread-Safe) ---
                if isinstance(msg, tuple):
                    if msg[0] == "F3_ENROLAMIENTO":
                        self.abrir_dialogo_enrolamiento_f3(msg[1])
                    continue

                # Identificación de prioridad por color y simbología táctica
                color = '#00d1ff' # Azul (Reposo/Info)
                if "VAD:" in msg: color = '#00ff00' # Verde (Escuchando)
                if "IA:" in msg: color = '#f39c12' # Naranja (Procesando)
                if "OK:" in msg: 
                    color = '#2ecc71'
                    msg = f"認 {msg}" # 認 = Verificado
                if "ERROR:" in msg or "ALERTA:" in msg:
                    color = '#e74c3c'
                    msg = f"警 {msg}" # 警 = Alerta
                if "WPM:" in msg: color = '#9b59b6' # Púrpura (Rendimiento)

                if self.lbl_id: self.canvas.delete(self.lbl_id)
                self.lbl_id = self.canvas.create_text(58, self.alto - 25, text=msg.split(":", 1)[1] if ":" in msg else msg, 
                                                      fill=color, font=('Consolas', 7, 'bold'), width=100, anchor='center')
                self.root.after(3000, lambda lid=self.lbl_id: self.canvas.delete(lid))
                
                if ":" in msg:
                    prefix, content = msg.split(":", 1)
                    if prefix in ["TURBO", "TXT", "DRAGON", "VAD", "RAW", "Signal", "DEBUG", "ERROR", "F1", "IA", "ERR", "SISTEMA", "OK"]:
                        print(f"[{ts}] {prefix}: {content}")
                else: print(f"[{ts}] > {msg}")
                procesados += 1
        except: pass
        self.root.after(200, self.verificar_mensajes_ia)

    def clic_ventana(self, event):
        if event.widget in (self.root, self.canvas, self.video_label):
            self._arrastre_permitido = True
            self.x, self.y = event.x, event.y
        else: self._arrastre_permitido = False

    def enviar_texto(self, texto):
        from nucleo_voz import inyectar_texto_rapido
        inyectar_texto_rapido(texto)

    def mover_ventana(self, event):
        if getattr(self, '_arrastre_permitido', False):
            self.root.geometry(f"+{int(event.x_root - self.x)}+{int(event.y_root - self.y)}")

    def hablar_cortana_external(self, categoria):
        from nucleo_voz import hablar_cortana
        hablar_cortana(categoria)

    def abrir_dialogo_enrolamiento_f3(self, audio_bytes):
        """Muestra cuadros de diálogo para nombrar y asignar acción al comando de voz."""
        from tkinter import simpledialog, messagebox
        from modulos import comando
        
        winsound.Beep(1500, 200)
        nombre = simpledialog.askstring("F3: Voice Match", "Nombre de la orden (ej: 'Guardar')", parent=self.root)
        if not nombre: return
        
        accion = simpledialog.askstring("F3: Voice Match", "Escribe la acción:\n- Texto plano\n- Ruta de carpeta\n- Comando (ej: /abrir_editor)", parent=self.root)
        if not accion: return
        
        exito = comando.enrolar_comando(audio_bytes, nombre, accion)
        if exito:
            messagebox.showinfo("F3", f"Comando '{nombre}' registrado con éxito.")
            config.registrar_evento("SISTEMA", f"F3: NUEVA ORDEN '{nombre.upper()}'")
        else:
            messagebox.showerror("F3", "Error al guardar la huella acústica.")

    def mantener_al_frente(self):
        try:
            self.root.attributes('-topmost', True)
            self.root.lift()
            self.root.after(2000, self.mantener_al_frente)
        except: pass

    def mainloop(self): self.root.mainloop()
