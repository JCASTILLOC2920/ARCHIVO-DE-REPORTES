import os
import re
import json
import requests
import time
import ctypes
from concurrent.futures import ThreadPoolExecutor
import config
import shutil

# 🎙️ MOTOR DE AUDIO SOBERANO (MCI v1.0)
# ==========================================
def mci_command(command):
    """Envía un comando a la interfaz MCI de Windows (winmm.dll)."""
    error_buffer = ctypes.create_unicode_buffer(256)
    return ctypes.windll.winmm.mciSendStringW(command, error_buffer, 256, 0)

def reproducir_mp3_mci(ruta):
    """Reproduce un archivo MP3 de forma asíncrona delegando en NotificadorMilitar para evitar duplicados."""
    try:
        from notificador_militar import NotificadorMilitar
        import threading
        threading.Thread(target=lambda: NotificadorMilitar._ejecutar_mci(ruta), daemon=True).start()
    except Exception as e:
        print(f"[RECURSOS AUDIO ERROR] No se pudo reproducir {ruta}: {e}")

# 🛡️ GESTOR DE CONCURRENCIA Y RED (CORTANA)
# ==========================================
executor = ThreadPoolExecutor(max_workers=min(32, (os.cpu_count() or 1) + 4))
session = requests.Session()
adapter = requests.adapters.HTTPAdapter(pool_connections=10, pool_maxsize=10)
session.mount('http://', adapter)

# 🧬 MOTOR DE DICCIONARIO ÚNICO UNIFICADO (CORTANA v34)
# ==========================================
DICCIONARIO_VELOCIDAD = {}
MULTI_WORD_PREFIXES = set()
MAX_WORDS = 1 

# ALIAS COMPATIBILIDAD
DICCIONARIO_MASIVO_EXACTO = DICCIONARIO_VELOCIDAD
DICCIONARIO_FRASES = DICCIONARIO_VELOCIDAD

CONTEXTO_MEDICO = ""
NOMBRES_PERUANOS = ""
VOCABULARIO_AMICAL = ""

PATRON_PUNTUACION = []

CORRECCIONES_PATOLOGIA = {
    "26q": "26Q-",
    "26q-": "26Q-",
    "26 q": "26Q-",
    "26 q-": "26Q-",
    "mascolcóficamente": "Macroscópicamente",
    "he decidido": "de tejido",
    "fissaje": "fijado en formol",
    "formón": "formol",
    "hormol": "formol",
    "se lo sigue": "Se recibe",
    "disacio": "grisáceo",
    "multidoblado": "multinodular",
    "cosete": "casete",
    "casé": "casete",
    "dictafono": "dictáfono",
    "dictafón": "dictáfono",
    "centímetros": "cm",
    "milímetros": "mm",
    "y de": "y",
    "consistencia": "consistencia",
    "parduzco": "parduzco",
    "blanquecino": "blanquecino",
    "aspecto": "aspecto",
    "re agudizada": "reagudizada",
    "re agudizado": "reagudizado",
    "re agudizadas": "reagudizadas",
    "re agudizados": "reagudizados",
    "re agudización": "reagudización",
    "re agudizaciones": "reagudizaciones",
    "crónica realizar": "crónica reagudizada",
    "crónico realizar": "crónico reagudizado",
    "crónica realizada": "crónica reagudizada",
    "crónico realizado": "crónico reagudizado",
    "crónicas realizar": "crónicas reagudizadas",
    "crónicos realizar": "crónicos reagudizados",
    "análogo": "diálogo",
    "parra": "para",
    "chrome": "prompt",
    "crome": "prompt",
    "promt": "prompt",
    "cm cúbicos": "cc",
    "cm cúbico": "cc",
    "centímetros cúbicos": "cc",
    "centímetro cúbico": "cc",
    "cm cuadrados": "cm2",
    "cm cuadrado": "cm2",
    "centímetros cuadrados": "cm2",
    "centímetro cuadrado": "cm2",
    "josehp christopher castillo cuenca": "Josehp Christopher Castillo Cuenca",
    "citologia cervical": "citología cervical",
    "citologia": "citología",
    "papanicolaou": "Papanicolaou",
    "a cenar": "acinar",
    "a cinar": "acinar",
    "a sinar": "acinar",
    "asinar": "acinar",
    "acenar": "acinar",
    "hacinar": "acinar",
    "ha cenar": "acinar",
    "al cenar": "acinar",
    "a signar": "acinar",
    "a cenares": "acinares",
    "a sinares": "acinares",
    "asinares": "acinares",
    "hacinares": "acinares",
    "adenocarcinoma asignar": "adenocarcinoma acinar",
    "proliferacion asignar": "proliferación acinar",
    "proliferación asignar": "proliferación acinar",
    "patron asignar": "patrón acinar",
    "patrón asignar": "patrón acinar",
    "unidades asignares": "unidades acinares",
    "unidad asignar": "unidad acinar",
    "celulas asignares": "células acinares",
    "células asignares": "células acinares",
    "arquitectura asignar": "arquitectura acinar",
    "predominio asignar": "predominio acinar",
    "componente asignar": "componente acinar",
    "tejido asignar": "tejido acinar",
    "foco asignar": "foco acinar",
    "focos asignares": "focos acinares",
    "peri acinar": "periacinar",
    "peri acinares": "periacinares",
    "intra acinar": "intraacinar",
    "intra acinares": "intraacinares"
}

# --- SHIELD v19.0 (Ghost-Efficiency) ---
from functools import lru_cache
import sqlite3

GHOST_INMUNIDAD_RAM = set()
GHOST_NOMBRES_RAM = set()

class GhostShield:
    @staticmethod
    def es_inmune(palabra):
        """Búsqueda O(1) en RAM."""
        if not palabra: return False
        return palabra.lower() in GHOST_INMUNIDAD_RAM

    @staticmethod
    def es_nombre(nombre):
        """Búsqueda O(1) en RAM."""
        if not nombre: return False
        return nombre.lower() in GHOST_NOMBRES_RAM

# Las constantes se mantienen vacías para no romper lógica legacy, pero el motor usará GhostShield
PALABRAS_INMUNIDAD = set() 
RAICES_ANATOMICAS = {
    "epi", "peri", "endo", "sub", "infra", "supra", "retro", "para", "intra",
    "gast", "hepat", "card", "nefr", "cist", "oste", "neur", "aden", "derm",
    "hist", "cit", "mio", "condr", "leuc", "erit", "tromb", "vas", "arteri",
    "esofago", "duodeno", "yeyuno", "ileon", "colon", "recto", "an", "pancr",
    "esplen", "colecist", "apendic", "uter", "ovari", "salping", "cervic",
    "mesangio", "glomerulo", "carcin", "fibro", "angio", "mielo", "linfa", "linfangio",
    "hepato", "espleno", "nefro", "cisto", "utero", "ovario", "salpingo", "cervico",
    "intra", "extra", "arteri", "venoso", "ductal", "lobulillar"
}

SUFIJOS_PATOLOGIA = {
    "itis", "oma", "osis", "patia", "scopia", "tomia", "ectomia", "plastia",
    "malacia", "megalia", "penia", "filia", "blast", "clast", "plasia", "trofia",
    "poyetica", "grafia", "centesis", "sarcoma"
}

TERMINOS_ADMINISTRATIVOS = {
    "carta", "cartas", "oficio", "oficios", "memorando", "memorándum", "resolucion", "resolución",
    "informe", "informes", "expediente", "expedientes", "adjunto", "remito", "solicito", "proveido",
    "proveído", "requerimiento", "nulidad", "recurso", "reconsideracion", "reconsideración", "apelacion",
    "apelación", "director", "jefatura", "departamento", "servicio", "asunto", "referencia", "atentamente",
    "cordialmente", "documento", "documentos", "notificacion", "notificación", "laboral", "administrativo",
    "dictamen", "certificado", "constancia", "historia", "clinica", "clínica"
}

CORRECCIONES_FONETICAS_GHOST = {
    "el chaca": "grisáceo",
    "el checa": "grisáceo",
    "el chacha": "grisáceo",
    "del chaca": "grisáceo",
    "blanco el chaca": "blanco grisáceo",
    "blanco grisáceo": "blanco grisáceo",
    "multilobulado a la fuerza": "multilobulado al corte",
    "porno colgando": "como colgando",
    "ahorita porno": "ahorita como",
    "ahorita como": "ahorita como",
    "grisáceo arremolina": "grisáceo arremolinado",
    "fragmento de tejido que mide": "fragmentos de tejido miden",
    "fragmentos de tejidos": "fragmentos de tejido",
    "se lo sigue": "se recibe",
    "se escribe": "se recibe",
    "la fuerza sería 2": "al corte se observa",
    "punto seguido": ". ",
    "punto aparte": ".\n\n",
    "comita": ",",
    "la mayor mide": "la mayor de las cuales mide",
    "la menor mide": "la menor de las cuales mide",
    "consistencia cauchos": "consistencia cauchosa",
    "consistencia de hule": "consistencia cauchosa",
    "se incluye todo en un": "se incluye la totalidad en un",
    "casé": "casete",
    "cosete": "casete",
    "adección": "sección",
    "asección": "sección",
    "la adección": "la sección",
    "de repente tejido": "fragmento de tejido",
    "de repente": "recipiente",
    "muselado": "morcelado",
    "muselados": "morcelados",
    "muselado de próstata": "morcelados de próstata",
    "cassette": "casete",
    "casset": "casete",
    "un cassette": "1 casete",
    "un cassete": "1 casete",
    "un casete": "1 casete",
    "kispe": "quispe",
    "uaman": "huamán",
    "waman": "huamán",
    "choque": "choque",
    "quispe": "quispe",
    "re agudizada": "reagudizada",
    "re agudizado": "reagudizado",
    "re agudizadas": "reagudizadas",
    "re agudizados": "reagudizados",
    "re agudización": "reagudización",
    "re agudizaciones": "reagudizaciones",
    "crónica realizar": "crónica reagudizada",
    "crónico realizar": "crónico reagudizado",
    "crónica realizada": "crónica reagudizada",
    "crónico realizado": "crónico reagudizado",
    "crónicas realizar": "crónicas reagudizadas",
    "crónicos realizar": "crónicos reagudizados",
    "aguda realizar": "aguda reagudizada",
    "agudo realizar": "agudo reagudizado",
    "agudas realizar": "agudas reagudizadas",
    "agudos realizar": "agudos reagudizados",
    "jimin": "gemini",
    "yemini": "gemini",
    "dicrafono": "dictáfono",
    "dicráfono": "dictáfono",
    "precsion": "precisión",
    "arrgla": "arregla",
    "diagnostics": "diagnósticos",
    "diagnostic": "diagnóstico",
    "gastric": "gástrica",
    "microscopic": "microscópico",
    "biopsia gastric": "biopsia gástrica",
    "mucosa gastric": "mucosa gástrica",
    "mono cervical": "moco superficial",
    "citología intestinal": "metaplasia intestinal",
    "signi": "signos",
    "ofelia": "offline",
    "on line": "online",
    "pereda": "perpetua",
    "perada": "perpetua",
    "reactiva": "desactivar",
    "los íleon": "los videos",
    "íleons": "videos",
    
    # --- FALLBACK ANTIALUCINACIONES (GRAMÁTICA PLANA) ---
    "especial rotulado": "espécimen rotulado",
    "debe biliar": "vesícula biliar",
    "microscopio mensaje observan": "macroscópicamente se observan",
    "tejido lado": "tejido morcelado",
    "blanco elisa": "blanco grisáceo",
    "jacobo rosa": "cauchosa",
    "consiste jacobo rosa": "consistencia cauchosa",
    "set bruno": "casete uno",
    "ely pisco ricardo": "colelitiasis",
    
    # --- ALUCINACIONES PATOLÓGICAS GRAVES (SHADOW MAPPING) ---
    "para jugar juegos famosos": "macrófagos espumosos",
    "juegos famosos": "macrófagos espumosos",
    "signos de rosquitas y astro": "senos de Rokitansky-Aschoff",
    "rosquitas y astro": "Rokitansky-Aschoff",
    "estómago conectivo": "estroma fibroconectivo",
    "estómago colectivo": "estroma fibroconectivo",
    "más este sofisticas": "masas exofíticas",
    "rafael vesicular": "pared vesicular",
    "parrilla circular": "pared vesicular",
    "a tito citológica": "atipia citológica",
    "marina invasiva": "maligna invasiva",
    "polvos colesterol": "pólipos colesterósicos",
    "pólipos colesterol": "pólipos colesterósicos",
    "uniformes amarillentas": "puntiformes amarillentas",
    
    # --- MAPEOS ACÚSTICOS DETERMINISTAS (HÍBRIDO v1.0) ---
    "macrofólicamente": "macroscópicamente",
    "microfólicamente": "microscópicamente",
    "vesiculebiliar": "vesícula biliar",
    "0 usará es de aspecto de ilustrado": "serosa es de aspecto deslustrado",
    "cuenta x más": "cuentapoma",
    "vio el ciclo alicia": "vesícula biliar",
    "labio soto concepcion": "biopsia por congelación",
    "labio soto concepción": "biopsia por congelación",
    "labio soto": "biopsia",
    "labios soto": "biopsia",
    "concepcion": "congelación",
    "concepción": "congelación",
    "con horacio": "congelación",
    "mamani": "mamario",
    "de cuatro muchos": "de cuatro por tres centímetros",
    "de cuatro mucho": "de cuatro por tres centímetros",
    "cuatro muchos": "cuatro por tres centímetros",
    "muchos": "centímetros",
    "cisneros": "centímetros",
    "fibras neoplasia": "células neoplásicas",
    "invade trauma": "invaden el estroma",
    "fueron aponte cells": "que invaden el estroma",
    "corto diagnostico": "se diagnostica",
    "carcinoma dante": "carcinoma ductal infiltrante",
    "edgardo": "de grado",
    "antony": "presencia de",
    "necrosis junto": "necrosis",
    "compr necrosis": "con presencia de necrosis"
}

PUNTUACION_MAP = {
    r"\bpunto y coma\b": ";", 
    r"\bdos puntos\b": ":", r"\bdospuntos\b": ":",
    r"\bsigno de interrogación\b": "?", r"\bsignos de interrogación\b": "?",
    r"\bpunto\b": ".", 
    r"\bcomas\b": ",", r"\bcoma\b": ",",
    r"\bguion\b": "-", r"\bguión\b": "-",

    r"\babrir paréntesis\b": "(", r"\babre paréntesis\b": "(",
    r"\bcerrar paréntesis\b": ")", r"\bcierra paréntesis\b": ")", r"\bcierro paréntesis\b": ")",
    r"\babrir comillas\b": '"', r"\babre comillas\b": '"',
    r"\bcerrar comillas\b": '"', r"\bcierra comillas\b": '"',
    r"\bcon viñeta\b": "\n- ", r"\bviñeta\b": "\n- ",
    r"\*": "x"
}

def limpiar_fonetica_ghost(texto):
    if not texto: return ""
    txt = texto
    import re
    for error, correccion in CORRECCIONES_FONETICAS_GHOST.items():
        # Usamos límites de palabra (\b) y re.escape para evitar fallas por signos de puntuación
        pattern = re.compile(rf'\b{re.escape(error)}\b', re.IGNORECASE)
        txt = pattern.sub(correccion, txt)
    return txt

def registrar_prefijos_multi():
    global MULTI_WORD_PREFIXES
    MULTI_WORD_PREFIXES.clear()
    for k in DICCIONARIO_VELOCIDAD.keys():
        parts = k.split()
        if len(parts) > 1:
            MULTI_WORD_PREFIXES.add(parts[0])

def inyectar_diccionario_manual(dicc_obj):
    global MAX_WORDS
    for k, v in dicc_obj.items():
        k_limpia = k.strip().lower()
        DICCIONARIO_VELOCIDAD[k_limpia] = v.strip()
        n_words = len(k_limpia.split())
        # CAP DE SEGURIDAD (v10): Evitar que MAX_WORDS se infle por basura
        if n_words > MAX_WORDS and n_words <= 10: 
            MAX_WORDS = n_words
    registrar_prefijos_multi()

def guardar_json_atomico(ruta_final, datos):
    """VIA 3: Escribe en un archivo temporal y luego renombra (Atómico)."""
    ruta_tmp = ruta_final + ".tmp"
    try:
        with open(ruta_tmp, "w", encoding="utf-8") as f:
            json.dump(datos, f, indent=4, ensure_ascii=False)
        if os.path.exists(ruta_final):
            os.remove(ruta_final)
        os.rename(ruta_tmp, ruta_final)
        return True
    except Exception as e:
        print(f"[RECURSOS] Error Atómico: {e}")
        return False

def cargar_recursos():
    # Declaración explícita e individual para evitar errores de Scope en Python
    global CONTEXTO_MEDICO
    global NOMBRES_PERUANOS
    global VOCABULARIO_AMICAL
    global PATRON_PUNTUACION
    global MAX_WORDS
    global GHOST_INMUNIDAD_RAM
    global GHOST_NOMBRES_RAM

    try:
        # 🛡️ CARGA O(1) SQLite -> RAM
        try:
            conn = sqlite3.connect(config.ruta_absoluta('mapeo_cerebro.db'), timeout=5)
            conn.execute("CREATE TABLE IF NOT EXISTS inmunidad (palabra TEXT UNIQUE)")
            conn.execute("CREATE TABLE IF NOT EXISTS nombres (nombre TEXT UNIQUE)")
            conn.commit()
            for row in conn.execute("SELECT palabra FROM inmunidad"):
                GHOST_INMUNIDAD_RAM.add(row[0].lower())
            for row in conn.execute("SELECT nombre FROM nombres"):
                GHOST_NOMBRES_RAM.add(row[0].lower())
            conn.close()
            print(f"[RECURSOS] Base SQLite cargada en RAM O(1): {len(GHOST_INMUNIDAD_RAM)} inmunidades, {len(GHOST_NOMBRES_RAM)} nombres.")
        except Exception as db_e:
            print(f"[RECURSOS] Error cargando SQLite a RAM: {db_e}")
        # 🛡️ CARGA UNIFICADA DESDE JSON MAESTRO (VÍA 5)
        ruta_maestro = config.ruta_absoluta("mapeo_maestro.json")
        if os.path.exists(ruta_maestro):
            with open(ruta_maestro, "r", encoding="utf-8") as f:
                cerebro = json.load(f)
                
                # Sincronizar sets programáticos desde el JSON maestro
                if "escudo" in cerebro:
                    for termino in cerebro["escudo"]:
                        GHOST_INMUNIDAD_RAM.add(str(termino).lower().strip())
                if "nombres" in cerebro:
                    for termino in cerebro["nombres"]:
                        GHOST_NOMBRES_RAM.add(str(termino).lower().strip())

                # Nodos Unificados: escudo, tecnico, formato, nombres
                for cat in ["escudo", "tecnico", "formato", "nombres"]:
                    if cat in cerebro:
                        for termino in cerebro[cat]:
                            termino_str = str(termino)
                            DICCIONARIO_VELOCIDAD[termino_str.lower()] = termino_str
                            n_words = len(termino_str.split())
                            # CAP DE SEGURIDAD (v10): Máximo 10 palabras por frase
                            if n_words > MAX_WORDS and n_words <= 10: 
                                MAX_WORDS = n_words

        # Cargar Fantasmas Acústicos
        ruta_fantasmas = config.ruta_absoluta("fantasmas_acusticos.json")
        if os.path.exists(ruta_fantasmas):
            with open(ruta_fantasmas, "r", encoding="utf-8") as f:
                fantasmas_json = json.load(f)
                CORRECCIONES_FONETICAS_GHOST.update(fantasmas_json)

        # Priorizar correcciones locales
        inyectar_diccionario_manual(CORRECCIONES_PATOLOGIA)

        ruta_contexto = config.ruta_absoluta("contexto_medico_optimizado.txt")
        if os.path.exists(ruta_contexto):
            with open(ruta_contexto, "r", encoding="utf-8") as f:
                CONTEXTO_MEDICO = f.read().strip()

        for k, v in PUNTUACION_MAP.items():
            PATRON_PUNTUACION.append((re.compile(k, re.IGNORECASE), v))

        print(f"[RECURSOS] Motor O(1) Unificado: {len(DICCIONARIO_VELOCIDAD)} términos. Ventana: {MAX_WORDS}")
        registrar_prefijos_multi()
    except Exception as e:
        print(f"[RECURSOS ERROR]: {e}")

def aplicar_puntuacion(texto):
    if not texto: return ""
    for patron, reemplazo in PATRON_PUNTUACION:
        texto = patron.sub(reemplazo, texto)
    texto = re.sub(r'\s+([.,;:?])', r'\1', texto)
    if texto:
        texto = texto[0].upper() + texto[1:]
    return texto

def normalizar_numeros(txt: str) -> str:
    """
    🛡️ NORMALIZADOR NUMÉRICO O(1): Convierte palabras matemáticas a dígitos.
    Resuelve el problema de "cero seis ocho" -> "0 6 8" conservando mayúsculas y signos.
    """
    if not txt:
        return txt
    mapping = {
        "cero": "0", "uno": "1", "dos": "2", "tres": "3", "cuatro": "4",
        "cinco": "5", "seis": "6", "siete": "7", "ocho": "8", "nueve": "9",
        "diez": "10", "once": "11", "doce": "12", "trece": "13", "catorce": "14",
        "quince": "15", "dieciséis": "16", "diecisiete": "17", "dieciocho": "18",
        "diecinueve": "19", "veinte": "20", "veintiuno": "21", "veintidós": "22",
        "veintidos": "22", "veintitrés": "23", "veintitres": "23", "veinticuatro": "24",
        "veinticinco": "25", "veintiséis": "26", "veintiseis": "26", "veintisiete": "27",
        "veintiocho": "28", "veintinueve": "29", "treinta": "30", "cuarenta": "40",
        "cincuenta": "50", "sesenta": "60", "setenta": "70", "ochenta": "80",
        "noventa": "90", "cien": "100"
    }
    words = txt.split()
    result = []
    for w in words:
        low = w.lower().strip('.,;:')
        if low in mapping:
            num = mapping[low]
            # Extraemos la puntuación si existe
            start_punct = w[:len(w)-len(w.lstrip('.,;:'))]
            end_punct = w[len(w.rstrip('.,;:')):]
            result.append(f"{start_punct}{num}{end_punct}")
        else:
            result.append(w)
    texto_procesado = " ".join(result)
    
    # 🛡️ UNIÓN DE NÚMEROS COMPUESTOS (ej. "40 y 5" -> "45")
    import re
    texto_procesado = re.sub(r'\b([2-9])0\s+y\s+(\d)\b', r'\1\2', texto_procesado)
    
    # 🛡️ MIGRACIÓN DE CENTENAS (ej. "ciento 56" -> "156", "ciento cinco" -> "105")
    hundreds_map = {
        "ciento": "1", "doscientos": "2", "trescientos": "3", "cuatrocientos": "4",
        "quinientos": "5", "seiscientos": "6", "setecientos": "7", "ochocientos": "8",
        "novecientos": "9"
    }
    for word, prefix in hundreds_map.items():
        texto_procesado = re.sub(rf'\b{word}\s+(\d{{2}})\b', rf'{prefix}\1', texto_procesado, flags=re.IGNORECASE)
        texto_procesado = re.sub(rf'\b{word}\s+(\d{{1}})\b', rf'{prefix}0\1', texto_procesado, flags=re.IGNORECASE)
        texto_procesado = re.sub(rf'\b{word}\b', rf'{prefix}00', texto_procesado, flags=re.IGNORECASE)
    
    return texto_procesado

def unir_numeros_bloque(texto):
    """
    🛡️ OPTIMIZADOR NUMÉRICO (v15.0): Busca secuencias de dígitos separados por espacios y los une.
    Ejemplo: 'Mide 1 5 cm' -> 'Mide 15 cm'
    """
    if not texto: return ""
    
    # Expresión regular que busca dígitos separados por espacios sencillos
    # Pero que NO se peguen a palabras (a menos que sean cm, mm, etc)
    # 1. Pegar dígitos entre sí
    # Usamos un bucle para manejar secuencias largas como "1 2 3 4"
    import re
    nuevo_texto = texto
    for _ in range(5): # Máximo 5 pasadas para secuencias largas
        nuevo_texto = re.sub(r'(\d)\s+(\d)', r'\1\2', nuevo_texto)
    
    return nuevo_texto

def resolver_matematica_dictada(texto):
    """
    🛡️ ARITHME-CORE v3 (v19.0): Motor simbólico de alta fidelidad.
    Resuelve aritmética pero PROTEGE las medidas de patología tridimensionales (1x2x3).
    """
    if not texto: return ""
    import re
    
    # 1. 🛡️ PROTECCIÓN DE MEDIDAS (Patología)
    # Detecta "1.5 x 2.0", "10*5*2", o "5 * 4 * 3 * 2", y protege la 'x' o el '*' para que no se evalúe matemáticamente
    medidas_detectadas = re.findall(r'(\d+[\.,]?\d*(?:\s*[xX\*]\s*\d+[\.,]?\d*)+)', texto)
    placeholder_map = {}
    temp_texto = texto
    for i, medida in enumerate(medidas_detectadas):
        ph = f"__MEDIDA_{i}__"
        placeholder_map[ph] = medida
        temp_texto = temp_texto.replace(medida, ph)

    # 2. Mapeo de términos a operadores y números
    mapa_ops = {
        r'\bmas\b': '+', r'\bmás\b': '+',
        r'\bmenos\b': '-',
        # 'por' solo si no es medida patológica (ya protegida rriba)
        r'\bpor\b': '*', 
        r'\bentre\b': '/', r'\bdividido[\s]+[por|entre]+\b': '/'
    }
    
    mapa_nums = {
        'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
        'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9', 'diez': '10',
        'veinte': '20', 'treinta': '30', 'cuarenta': '40', 'cincuenta': '50', 'cien': '100'
    }
    
    t_mod = temp_texto.lower()
    for p, n in mapa_nums.items(): t_mod = re.sub(rf'\b{p}\b', n, t_mod)
    for p, op in mapa_ops.items(): t_mod = re.sub(p, op, t_mod)
            
    # 3. Evaluación Aritmética
    patron_math = re.compile(r'(\d+[\s]*[\+\-\*\/][\s]*\d+([\s]*[\+\-\*\/][\s]*\d+)*)')
    
    for match in patron_math.finditer(t_mod):
        expr = match.group(0)
        try:
            res = eval(expr, {"__builtins__": {}}, {})
            if isinstance(res, (int, float)):
                res_str = str(int(res)) if res == int(res) else f"{res:.2f}"
                temp_texto = temp_texto.replace(expr, res_str)
        except: continue
    
    # 4. Restaurar Medidas Protegidas y normalizar * a x
    for ph, medida in placeholder_map.items():
        medida_corregida = medida.replace('*', 'x')
        temp_texto = temp_texto.replace(ph, medida_corregida)
            
    return temp_texto

def unir_numeros_tecnicos(texto):
    """
    🛡️ CONTEXT-AWARE NUMBERING (v19.1): Une números con sus unidades médicas.
    Ejemplo: '1 5 cm' -> '1.5cm', 'mide 2 0 x 3 0' -> 'mide 2.0x3.0', '42 G' -> '42g'
    """
    if not texto: return ""
    import re
    # 1. Pegar números decimales (1 . 5 -> 1.5)
    texto = re.sub(r'(\d+)\s*[\.,]\s*(\d+)', r'\1.\2', texto)
    
    # Normalizar centímetros cúbicos a cc
    texto = re.sub(r'\bcent[íi]metros c[úu]bicos\b', 'cc', texto, flags=re.IGNORECASE)
    texto = re.sub(r'\bcm c[úu]bicos\b', 'cc', texto, flags=re.IGNORECASE)
    texto = re.sub(r'\bcent[íi]metro c[úu]bico\b', 'cc', texto, flags=re.IGNORECASE)
    texto = re.sub(r'\bcm c[úu]bico\b', 'cc', texto, flags=re.IGNORECASE)
    
    # 2. Pegar unidades (15 cm -> 15cm, 42 G -> 42g)
    unidades = ["cm", "mm", "cc", "gr", "ml", "g", "mg", "kg"]
    for u in unidades:
        texto = re.sub(rf'(\d+)\s+({u})\b', lambda m: m.group(1) + m.group(2).lower(), texto, flags=re.IGNORECASE)
    
    # 3. Pegar dimensiones (2 x 3 x 4 -> 2x3x4)
    # Utilizamos lookarounds (?<=) y (?=) para evitar consumir los dígitos 
    # y permitir que se junten 3 o más medidas seguidas sin cortes.
    texto = re.sub(r'(?<=\d)\s*[xX]\s*(?=\d)', 'x', texto)
    
    return texto


def procesar_dni(texto):
    """
    🛡️ PROCESADOR DNI GRADO MILITAR: Localiza "DNI" (con palabras opcionales intermedias
    como "del paciente es", "número", etc.) y junta secuencias de 8 dígitos.
    """
    if not texto: return ""
    import re
    
    def reemplazar_dni(match):
        prefix = match.group(1)
        nums_part = match.group(2)
        digitos = re.sub(r'\D', '', nums_part)
        if len(digitos) == 8:
            # Si el prefijo contiene dos puntos, los normalizamos
            clean_prefix = prefix
            if ":" in clean_prefix:
                clean_prefix = re.sub(r'\s*:\s*', ' ', clean_prefix)
            # Aseguramos exactamente un espacio antes de los dígitos
            clean_prefix = clean_prefix.rstrip()
            return f"{clean_prefix} {digitos}"
        return match.group(0)
        
    # Permite hasta 50 caracteres (palabras intermedias como "del paciente es", "número", etc.)
    # El grupo de números debe terminar obligatoriamente en un dígito para no consumir espacios posteriores
    patron = re.compile(r'\b(DNI(?:\b.{0,50}?))([\d\s\-,yY]{6,23}\d)\b', re.IGNORECASE)
    texto = patron.sub(reemplazar_dni, texto)
    return texto


def unir_formatos_casete(texto):
    """
    🛡️ FORMATEADOR CASETES CLINICOS: Junta códigos de tipo "26Q-156", "26 q 156", etc.
    Asegura que la letra Q sea siempre mayúscula y el formato esté pegado con guion.
    """
    if not texto: return ""
    import re
    # Formato: 26Q-156, 26 Q 156, 26q-156, etc.
    patron = re.compile(r'\b(\d+)\s*(?:[-–—]|\bguión\b|\bguion\b)?\s*[qQ]\s*(?:[-–—]|\bguión\b|\bguion\b)?\s*(\d+)\b', re.IGNORECASE)
    texto = patron.sub(r'\1Q-\2', texto)
    return texto


def juntar_fragmentos_medicos(texto):
    if not texto: return ""
    palabras = texto.split()
    if len(palabras) < 2: return texto
    resultado = []
    i = 0
    # Preposiciones, artículos y palabras cortas comunes que NO deben fusionarse
    exclusiones_fusion = {"a", "de", "en", "con", "por", "para", "y", "o", "el", "la", "los", "las", "un", "una", "unos", "unas", "es", "se", "lo", "su", "al", "del"}
    while i < len(palabras):
        if i + 1 < len(palabras):
            p1_raw = palabras[i]
            p2_raw = palabras[i+1]
            p1 = p1_raw.lower().strip(".,;:()")
            p2 = p2_raw.lower().strip(".,;:()")
            unir = False
            
            # 🛡️ PROTECCIÓN DE INMUNIDAD (v19.0 Ghost)
            if GhostShield.es_inmune(p1) or GhostShield.es_inmune(p2):
                unir = False
            elif GhostShield.es_nombre(p1) or GhostShield.es_nombre(p2):
                unir = False
            elif p2 in exclusiones_fusion:
                unir = False
            elif p1 in RAICES_ANATOMICAS:
                unir = True
            elif p2 in SUFIJOS_PATOLOGIA or any(p2.startswith(s) for s in SUFIJOS_PATOLOGIA if len(s) > 3):
                unir = True
            
            if unir:
                resultado.append(p1_raw + p2_raw)
                i += 2
                continue
        resultado.append(palabras[i])
        i += 1
    return " ".join(resultado)

def aplicar_diccionario_unificado(texto):
    asegurar_recursos_cargados()
    global MAX_WORDS
    if not texto: return ""
    tokens = texto.split()
    resultado = []
    i = 0
    num_tokens = len(tokens)
    while i < num_tokens:
        first_word = tokens[i].lower()
        encontrado = False
        
        # Si la primera palabra puede ser el inicio de una frase de varios términos, buscamos coincidencia
        if first_word in MULTI_WORD_PREFIXES:
            for n in range(min(MAX_WORDS, num_tokens - i), 1, -1):
                ventana = " ".join(tokens[i:i+n]).lower()
                if ventana in DICCIONARIO_VELOCIDAD:
                    resultado.append(DICCIONARIO_VELOCIDAD[ventana])
                    i += n
                    encontrado = True
                    break
                    
        if not encontrado:
            if first_word in DICCIONARIO_VELOCIDAD:
                resultado.append(DICCIONARIO_VELOCIDAD[first_word])
            else:
                resultado.append(tokens[i])
            i += 1
            
    return " ".join(resultado)

import threading

_recursos_cargados = False
_recursos_lock = threading.Lock()

def asegurar_recursos_cargados():
    global _recursos_cargados
    if not _recursos_cargados:
        with _recursos_lock:
            if not _recursos_cargados:
                cargar_recursos()
                _recursos_cargados = True

def enviar_combinacion_teclas(combo):
    """Envia combinaciones de teclas usando Win32 CTypes keybd_event nativo de forma directa."""
    import time
    user32 = ctypes.windll.user32
    if combo == "enter":
        user32.keybd_event(0x0D, 0, 0, 0)
        time.sleep(0.01)
        user32.keybd_event(0x0D, 0, 2, 0)
    elif combo.startswith("alt+shift+"):
        char = combo.split("+")[-1].upper()
        vk = ord(char)
        user32.keybd_event(0x12, 0, 0, 0) # Alt down
        time.sleep(0.01)
        user32.keybd_event(0x10, 0, 0, 0) # Shift down
        time.sleep(0.01)
        user32.keybd_event(vk, 0, 0, 0)   # Key down
        time.sleep(0.02)
        user32.keybd_event(vk, 0, 2, 0)   # Key up
        time.sleep(0.01)
        user32.keybd_event(0x10, 0, 2, 0) # Shift up
        time.sleep(0.01)
        user32.keybd_event(0x12, 0, 2, 0) # Alt up

def procesar_pipeline_maestro(texto_crudo, modo="offline"):
    """
    PIPELINE UNIFICADO (v40): Procesa el texto en una sola ráfaga de alta velocidad.
    Elimina la redundancia entre SymSpell y los diccionarios manuales.
    """
    asegurar_recursos_cargados()
    if not texto_crudo: return ""
    
    # 0. INTERCEPTOR WAKE-WORD (NLP ROBUSTO CONTRA ALUCINACIONES DE GOOGLE Y CONFUSIONES FONÉTICAS)
    # Atrapa variaciones de "cortana" y "comando" (ej. "cortada comado", "ventana comando", etc.) con o sin espacio intermedio
    import re
    # 🛡️ Limpiar puntuación para evitar fallos por comas o dos puntos (Ej: "Cortana, comando registro" -> "Cortana comando registro")
    texto_limpio = re.sub(r'[.,:;?¡!]', '', texto_crudo.lower())
    
    patron_wake_word = re.compile(
        r'\b(?:cortana|cortada|cortina|portana|por\s+tana|cor\s+tana|ventana|cordana|coltana|contana|coretana|coartada|botana|gotana|potana|votana|bortana|gordana|montana|jortana|botada|portada)\s*'
        r'(?:comando|comado|tomando|comanda|coman|comento|combando|toman|formando|llamando|quemando|mando|demand[oó]|comandos)\b',
        re.IGNORECASE
    )
    if patron_wake_word.search(texto_limpio):
        print(f"[WAKE-WORD] Comando interceptado en texto: '{texto_crudo}'")
        from modulos import comando
        txt_low = texto_limpio
        words_set = set(re.findall(r'\b\w+\b', txt_low))
        
        # 1. Programas
        if "word" in words_set:
            comando.ejecutar_accion_táctica("winword")
            import winsound; winsound.Beep(1500, 200)
        elif words_set.intersection({"excel", "exel", "éxcel"}):
            comando.ejecutar_accion_táctica("excel")
            import winsound; winsound.Beep(1500, 200)
        elif words_set.intersection({"photoshop", "fotosho", "fotoshop", "fotosop"}):
            comando.ejecutar_accion_táctica("photoshop")
            import winsound; winsound.Beep(1500, 200)
        elif words_set.intersection({"powerpoint", "pauerpoint", "powerpnt"}) or ("power" in words_set and "point" in words_set):
            comando.ejecutar_accion_táctica("powerpnt")
            import winsound; winsound.Beep(1500, 200)
        elif "youtube" in words_set or "yutub" in words_set or "llutub" in words_set:
            import os; os.startfile("https://music.youtube.com")
            import winsound; winsound.Beep(1500, 200)
            
        # 2. Acciones del Sistema / Teclado
        elif words_set.intersection({"limpiar", "limpia"}):
            comando.ejecutar_accion_táctica("/limpiar")
            import winsound; winsound.Beep(1500, 200)
        elif words_set.intersection({"enter", "ente"}) or ("nueva" in words_set and words_set.intersection({"línea", "linea"})):
            enviar_combinacion_teclas("enter")
            import winsound; winsound.Beep(1200, 100)
        elif "nuevo" in words_set and words_set.intersection({"párrafo", "parrafo"}):
            enviar_combinacion_teclas("enter")
            import time; time.sleep(0.05)
            enviar_combinacion_teclas("enter")
            import winsound; winsound.Beep(1300, 150)
        # 3. Comandos Web de Navegación Lateral (Cortana Comando)
        elif words_set.intersection({"usuarios", "usuario", "usurios"}):
            enviar_combinacion_teclas("alt+shift+u")
            import winsound; winsound.Beep(1600, 120)
        elif words_set.intersection({"plantillas", "plantilla"}):
            enviar_combinacion_teclas("alt+shift+t")
            import winsound; winsound.Beep(1600, 120)
        elif words_set.intersection({"doctores", "doctor", "doctora", "doctores"}):
            enviar_combinacion_teclas("alt+shift+d")
            import winsound; winsound.Beep(1600, 120)
        elif words_set.intersection({"registro", "registros", "registrar"}):
            enviar_combinacion_teclas("alt+shift+r")
            import winsound; winsound.Beep(1600, 120)
        elif words_set.intersection({"listado", "listados"}):
            enviar_combinacion_teclas("alt+shift+l")
            import winsound; winsound.Beep(1600, 120)
        elif words_set.intersection({"siguiente", "siguente", "sguiente", "sigiente"}):
            enviar_combinacion_teclas("alt+shift+k")
            import winsound; winsound.Beep(1600, 120)
        elif words_set.intersection({"guardar", "guardado", "guarda"}):
            enviar_combinacion_teclas("alt+shift+g")
            import winsound; winsound.Beep(1800, 200)
            
        print("[PIPELINE MAESTRO] Estrangulando inyección para no manchar el reporte clínico.")
        return ""
    
    # 🛡️ EXCEPCIÓN DIRECTA PARA TECNOLOGÍA (GitHub)
    texto_crudo = re.sub(r'\bgit\s*hub\b|\bjit\s*jup\b', 'GitHub', texto_crudo, flags=re.IGNORECASE)

    # Normalizar signo de multiplicación matemático a letra x
    texto_crudo = texto_crudo.replace("×", "x")
    
    # 🛡️ FILTRO GEOMÉTRICO CONTEXTUAL (Convierte "por" a "x" SOLO entre números)
    texto_crudo = re.sub(r'(?<=\d)\s*por\s*(?=\d)', 'x', texto_crudo, flags=re.IGNORECASE)
    
    # 🛡️ CORRECCIÓN DE CONFUSIONES FONÉTICAS COMUNES DE GOOGLE STT (Ej: "de" -> "The")
    texto_crudo = re.sub(r'\bthe\b', 'de', texto_crudo, flags=re.IGNORECASE)
    texto_crudo = re.sub(r'\bis\b', 'es', texto_crudo, flags=re.IGNORECASE)
    texto_crudo = re.sub(r'\band\b', 'y', texto_crudo, flags=re.IGNORECASE)
    texto_crudo = re.sub(r'\bfor\b', 'por', texto_crudo, flags=re.IGNORECASE)
    texto_crudo = re.sub(r'\bto\b', 'a', texto_crudo, flags=re.IGNORECASE)
    
    # 🛡️ MURO ANTI-INGLÉS Y ANTI-ALUCINACIONES WHISPER (Firewall Absoluto)
    txt_test = " " + texto_crudo.lower() + " "
    stop_words_ingles = [" of ", " it ", " this ", " that ", "suscríbete", "amara.org", "subtítulos", "próximo vídeo", "hasta la próxima"]
    if any(sw in txt_test for sw in stop_words_ingles):
        # El motor de voz alucinó (ruido de fondo o YouTube captions). Bloqueamos la salida 100%.
        return ""
        
    # 🛡️ ESCUDO FONÉTICO MÉDICO (Unión Inteligente de Prefijos)
    if getattr(config, 'modo_medico_activo', True):
        # Prefijos clínicos que el dictado suele separar erróneamente ("re agudizado" -> "reagudizado")
        prefijos_clinicos = ["re", "multi", "fibro", "angio", "adeno", "osteo", "neuro", "hemo", "leuco", "micro", "macro", "cisto"]
        for prefijo in prefijos_clinicos:
            # Une el prefijo con la siguiente palabra automáticamente
            texto_crudo = re.sub(rf'\b({prefijo})\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\b', r'\1\2', texto_crudo, flags=re.IGNORECASE)
    
    # 1. Limpieza Fonética Instantánea (Se ejecuta para ambos modos para corregir fantasmas acústicos)
    txt = limpiar_fonetica_ghost(texto_crudo)
    
    # 2. Corrección SymSpell (Cerebro O(1) conmutado) Universal para Online y Offline
    import micro_symspell as sym
    corrector_activo = sym.obtener_corrector()
    txt = corrector_activo.lookup(txt, modo=modo)
    
    # 3. Refuerzo Quirúrgico y Segmentación Anatómica (Solo si es Modo Médico)
    if getattr(config, 'modo_medico_activo', True):
        txt = aplicar_diccionario_unificado(txt)
        txt = juntar_fragmentos_medicos(txt)
    
    # 🛡️ 3.5 UNIÓN DE NÚMEROS (v15.0)
    txt = normalizar_numeros(txt)
    txt = unir_numeros_bloque(txt)
    
    # 🛡️ 3.6 PROCESADOR DNI Y CASETES GRADO MILITAR
    txt = procesar_dni(txt)
    txt = unir_formatos_casete(txt)
    
    # 🛡️ 4. CONTEXT-AWARE NUMBERING (v18.0)
    txt = unir_numeros_tecnicos(txt)
    
    # 🛡️ 5. MOTOR MATEMÁTICO v18.0 (Brainstorming Result)
    txt = resolver_matematica_dictada(txt)
    
    txt = aplicar_puntuacion(txt)
    
    # 4. Formateo de Bloque
    # Capitalizar la primera letra de la frase
    if txt:
        txt = txt[0].upper() + txt[1:]
        
    # La recolección de basura manual ha sido amputada para optimizar CPU
    # Python manejará la memoria de forma nativa en O(1)
    return txt.strip()
