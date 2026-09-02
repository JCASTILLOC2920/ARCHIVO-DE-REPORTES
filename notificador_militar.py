import winsound
import threading
import config
import requests
import os
import random
import ctypes

class NotificadorMilitar:
    """
    📡 Sistema de Alerta Temprana (Antigravity v8.5)
    Notifica al PC y al dispositivo móvil sobre el estado de la fotografía y la voz.
    """
    
    # 🎵 AUDIOS DE CONFIRMACIÓN DE FOTO
    AUDIOS_CONFIRMACION = [
        "audios/fotografiaperfecta1.mp3",
        "audios/fotografiaperfecta2.mp3",
        "audios/fotografiaperfecta3.mp3",
        "audios/fotografiaperfecta4.mp3"
    ]

    # 🎙️ ACTIVOS DE VOZ (AEGIS)
    AUDIOS_VOZ_EXITO = [
        "audios/audioprefecto1.mp3",
        "audios/audioprefecto2.mp3",
        "audios/audioprefecto3.mp3"
    ]

    # 🚀 ACTIVOS DE ARRANQUE (BLAST-START)
    AUDIOS_INICIO = [
        "audios/iniciocortana01.mp3", "audios/iniciocortana02.mp3", "audios/iniciocortana03.mp3",
        "audios/iniciocortana04.mp3", "audios/iniciocortana05.mp3", "audios/iniciocortana06.mp3",
        "audios/iniciocortana07.mp3", "audios/iniciocortana08.mp3", "audios/iniciocortana09.mp3",
        "audios/iniciocortana10.mp3", "audios/iniciocortana11.mp3"
    ]

    # 🛡️ CONFIGURACIÓN TELEGRAM (Opcional)
    TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", None)
    TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", None)

    @staticmethod
    def _ejecutar_mci(archivo):
        """Método interno para ejecutar audio vía Pygame (o MCI como fallback) sin cortes."""
        try:
            path = config.ruta_absoluta(archivo)
            if not os.path.exists(path): 
                print(f"[!] Audio no encontrado: {path}")
                return
            
            # 🛡️ INTENTO PYGAME: Evita el bug de corte prematuro de MCI
            try:
                import pygame
                import time
                if not pygame.mixer.get_init():
                    pygame.mixer.init()
                
                # Cargamos y reproducimos la música de forma segura
                pygame.mixer.music.load(path)
                pygame.mixer.music.play()
                
                # Esperamos a que termine el audio de manera asíncrona en este hilo
                while pygame.mixer.music.get_busy():
                    time.sleep(0.1)
                return
            except Exception as py_err:
                print(f"[DEBUG PYGAME AUDIO] Falló reproductor moderno, usando MCI: {py_err}")
            
            # 🛡️ FALLBACK MCI: Si Pygame no está disponible
            alias = f"vox_{random.randint(1000, 9999)}"
            ctypes.windll.winmm.mciSendStringW(f'open "{path}" type mpegvideo alias {alias}', None, 0, None)
            ctypes.windll.winmm.mciSendStringW(f'set {alias} audio all on', None, 0, None)
            ctypes.windll.winmm.mciSendStringW(f'play {alias} wait', None, 0, None)
            ctypes.windll.winmm.mciSendStringW(f'close {alias}', None, 0, None)
        except Exception as e:
            print(f"[❌ ERROR AUDIO PC]: {e}")
            # Fallback a Beep Militar si falla el audio rico
            winsound.Beep(1200, 150)
            winsound.Beep(1800, 200)

    @classmethod
    def reproducir_audio_confirmacion_pc(cls):
        """Reproduce sonido de éxito de FOTO de forma aleatoria."""
        audio = random.choice(cls.AUDIOS_CONFIRMACION)
        threading.Thread(target=lambda: cls._ejecutar_mci(audio), daemon=True).start()

    @classmethod
    def reproducir_voz_exito_pc(cls):
        """Reproduce sonido de éxito de VOZ de forma aleatoria."""
        audio = random.choice(cls.AUDIOS_VOZ_EXITO)
        threading.Thread(target=lambda: cls._ejecutar_mci(audio), daemon=True).start()
        return audio

    @classmethod
    def reproducir_arranque_cortana(cls):
        """Reproduce sonido de bienvenida de forma aleatoria (Blast-Start)."""
        audio = random.choice(cls.AUDIOS_INICIO)
        threading.Thread(target=lambda: cls._ejecutar_mci(audio), daemon=True).start()

    @staticmethod
    def beep_error():
        """Sonido de alerta de fallo (Frecuencia Descendente)."""
        def _play():
            winsound.Beep(800, 200)
            winsound.Beep(400, 300)
        threading.Thread(target=_play, daemon=True).start()

    @staticmethod
    def notificar_pc(mensaje, es_error=False):
        """Envía el mensaje a la GUI de Cortana y terminal."""
        prefijo = "⚠️ ALERTA: " if es_error else "✅ OK: "
        clean_msg = f"{prefijo}{mensaje}"
        config.registrar_evento("SISTEMA", clean_msg, es_critico=es_error)
        print(f"[🛡️ NOTIFICADOR] {clean_msg}")

    @staticmethod
    def notificar_movil(mensaje):
        """Envía notificación push al celular vía Telegram Bot."""
        if not NotificadorMilitar.TELEGRAM_TOKEN or not NotificadorMilitar.TELEGRAM_CHAT_ID:
            return 

        def _send():
            try:
                url = f"https://api.telegram.org/bot{NotificadorMilitar.TELEGRAM_TOKEN}/sendMessage"
                payload = {
                    "chat_id": NotificadorMilitar.TELEGRAM_CHAT_ID,
                    "text": f"📸 JC PATH:\n{mensaje}",
                    "parse_mode": "HTML"
                }
                requests.post(url, json=payload, timeout=5)
            except: pass

        threading.Thread(target=_send, daemon=True).start()

    @classmethod
    def alerta_foto_recibida(cls, nombre, info_verificacion, es_valida=True):
        """Protocolo de notificación dual para fotografías."""
        if es_valida:
            cls.reproducir_audio_confirmacion_pc()
            msg = f"Foto '{nombre}' verificada con éxito. {info_verificacion}"
            cls.notificar_pc(msg)
            cls.notificar_movil(f"✅ <b>{nombre}</b>\n{info_verificacion}\nEstado: ÍNTEGRA")
        else:
            cls.beep_error()
            msg = f"Foto '{nombre}' RECHAZADA: {info_verificacion}"
            cls.notificar_pc(msg, es_error=True)
            cls.notificar_movil(f"❌ <b>ALERTA DE ERROR</b>\nArchivo: {nombre}\nMotivo: {info_verificacion}\nEstado: CORRUPTA")
