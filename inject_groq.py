import os
import re

file_path = "nucleo_voz.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# The function we want to inject
groq_function = """
def transcribir_groq(audio_bytes, rate):
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
    
    for key in keys:
        try:
            files = {
                'file': ('audio.wav', wav_io.getvalue(), 'audio/wav')
            }
            data = {
                'model': 'whisper-large-v3',
                'language': 'es',
                'temperature': '0.0'
            }
            headers = {
                'Authorization': f'Bearer {key}'
            }
            
            response = requests.post(url, headers=headers, files=files, data=data, timeout=5)
            
            if response.status_code == 200:
                result = response.json()
                print(f"[GROQ] Transcripción exitosa.")
                return result.get('text', '')
            elif response.status_code in [401, 429]:
                print(f"[GROQ] Llave {key[:8]}... falló ({response.status_code}). Rotando...")
                continue
            else:
                print(f"[GROQ] Error inesperado: {response.status_code}")
                continue
        except Exception as e:
            print(f"[GROQ] Error de conexión: {e}")
            return None # Falla de red, salir para fallback
            
    return None

def chequear_conexion_internet():
    import socket
    try:
        # Check against Google DNS
        socket.create_connection(("8.8.8.8", 53), timeout=1.5)
        return True
    except OSError:
        return False
"""

# The new logic for procesar_logica_ia
new_procesar_logica_ia = """def procesar_logica_ia():
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

            if config.MODO_ACTUAL == "DICTADO" or config.MODO_ACTUAL == "DICCIONARIO":
                if modo == "online":
                    # PROTOCOLO CASCADA: GROQ -> GOOGLE -> OFFLINE
                    if not chequear_conexion_internet():
                        print("[NÚCLEO] SIN INTERNET. Abortando modo Online.")
                        if config.gui:
                            config.cola_gui.put("Fallo de red: Por favor cambie al modo OFFLINE con F1")
                    else:
                        crudo = transcribir_groq(audio_bytes_final, rate_final)
                        if crudo:
                            # Groq fue exitoso, inyectar!
                            from modulos.dictado_modular.procesador_clinico import procesador
                            texto_final = procesador.purificar_texto(crudo)
                            if texto_final:
                                procesador.inyectar_pantalla(texto_final)
                        else:
                            # Groq Falló, Fallback a Google
                            print("[GROQ FALLÓ] -> [GOOGLE] Iniciando respaldo...")
                            audio_data_google = sr.AudioData(audio_bytes_final, rate_final, 2) # 2 = sample width (16-bit)
                            dictado.procesar_dictado(audio_data_google)
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
"""

# Locate where to inject
# We will replace def procesar_logica_ia(): ... up to def motor_audio():
# Regex to match the function body
pattern = re.compile(r'def procesar_logica_ia\(\):.*?(?=def motor_audio\(\):)', re.DOTALL)
if pattern.search(content):
    content = pattern.sub(groq_function + "\n" + new_procesar_logica_ia + "\n", content)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Injection successful.")
else:
    print("Could not find procesar_logica_ia().")
