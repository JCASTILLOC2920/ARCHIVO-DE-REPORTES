import os
import json
import pickle
import threading
import sys
from functools import lru_cache
import recursos
import config

# [CONFIGURACIÓN CORTANA] (RUTAS DINÁMICAS v45)
CACHE_INFORMES = config.ruta_absoluta("symspell_informes_cache.pkl")
CACHE_CARTAS = config.ruta_absoluta("symspell_cartas_cache.pkl")

# Rutas de los archivos limpios en VOCABULARIO
PATH_NOMBRES = os.path.join(config.BASE_DIR, "VOCABULARIO", "nombres_peruanos.txt")
PATH_APELLIDOS = os.path.join(config.BASE_DIR, "VOCABULARIO", "apellidos_peruanos.txt")
PATH_PATOLOGICOS = os.path.join(config.BASE_DIR, "VOCABULARIO", "terminos_analogos_patologicos.txt")
PATH_COMUNES = os.path.join(config.BASE_DIR, "VOCABULARIO", "palabras_comunes_mas_usadas.txt")

@lru_cache(maxsize=4096)
def _fast_levenshtein(s1, s2):
    if len(s1) < len(s2):
        s1, s2 = s2, s1
    if len(s2) == 0:
        return len(s1)
    
    previous_row = list(range(len(s2) + 1))
    for c1 in s1:
        current_row = [previous_row[0] + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

class MicroSymSpell:
    """
    Algoritmo SymSpell con Filtro de Seguridad Anatómica.
    """
    def __init__(self, max_edit_distance=2, prefix_length=7):
        self.max_edit_distance = max_edit_distance
        self.prefix_length = prefix_length 
        self.dictionary = {} 
        self.deletes = {} 
        self.popular = set()
        self.nombres = set() # 🛡️ ESCUDO DE INMUNIDAD (v15.0)
        self.phonetic_map = {} 
        self._lock = threading.Lock()

    def _es_anatomico_plausible(self, word):
        """Validador Contextual: Detecta morfología médica."""
        import unicodedata
        word = word.lower()
        word_clean = "".join(c for c in unicodedata.normalize('NFD', word) if unicodedata.category(c) != 'Mn')
        if any(word_clean.startswith(root) for root in recursos.RAICES_ANATOMICAS):
            return True
        if any(word_clean.endswith(suf) for suf in recursos.SUFIJOS_PATOLOGIA):
            return True
        return False

    def _son_variantes_gramaticales(self, w1, w2):
        """
        Determina si dos palabras son variaciones gramaticales (género/número/sufijo)
        del mismo término en español para evitar correcciones ortográficas destructivas.
        """
        import unicodedata
        w1_norm = "".join(c for c in unicodedata.normalize('NFD', w1.lower()) if unicodedata.category(c) != 'Mn')
        w2_norm = "".join(c for c in unicodedata.normalize('NFD', w2.lower()) if unicodedata.category(c) != 'Mn')
        
        # Si la única diferencia son los acentos, permitimos la corrección (no es variante destructiva)
        if w1_norm == w2_norm:
            return False
            
        def clean(w_norm):
            for suffix in ['as', 'os', 'es', 'a', 'o', 's']:
                if w_norm.endswith(suffix):
                    return w_norm[:-len(suffix)]
            return w_norm
        return clean(w1_norm) == clean(w2_norm)

    def _phonetic_key(self, word):
        """Metáfono Español Simplificado (v1.0 Military)"""
        w = word.lower().strip()
        if not w: return ""
        # 1. Simplificación fonética básica
        replacements = [
            ("v", "b"), ("z", "s"), ("ce", "se"), ("ci", "si"),
            ("k", "k"), ("qu", "k"), ("q", "k"), ("h", ""),
            ("ll", "y"), ("ch", "x"), ("gn", "n"), ("ph", "f")
        ]
        for old, new in replacements:
            w = w.replace(old, new)
        # 2. Eliminar letras duplicadas (ej: 'accion' -> 'acion')
        res = []
        if w: res.append(w[0])
        for i in range(1, len(w)):
            if w[i] != w[i-1]:
                res.append(w[i])
        return "".join(res)

    def _get_deletes(self, word, override_dist=None):
        """Genera variaciones incluyendo el prefijo original."""
        max_dist = override_dist if override_dist is not None else self.max_edit_distance
        deletes = set()
        prefijo = word[:self.prefix_length]
        deletes.add(prefijo) # 🛡️ FIX: Incluir el prefijo mismo en el set de búsqueda
        
        queue = [prefijo]
        for _ in range(max_dist):
            temp_queue = []
            for item in queue:
                if len(item) > 1:
                    for i in range(len(item)):
                        delete_item = item[:i] + item[i+1:]
                        if delete_item not in deletes:
                            deletes.add(delete_item)
                            temp_queue.append(delete_item)
            queue = temp_queue
        return deletes

    def create_dictionary_entry(self, word, count=1):
        """Carga términos en la RAM con mapeo fonético y prefijos."""
        with self._lock:
            word = word.lower().strip()
            if word not in self.dictionary:
                self.dictionary[word] = count
                
                # Mapeo fonético para Idea 10
                f_key = self._phonetic_key(word)
                if f_key not in self.phonetic_map:
                    self.phonetic_map[f_key] = word
                
                # Variaciones SymSpell
                items = self._get_deletes(word)
                for item in items:
                    if item not in self.deletes:
                        self.deletes[item] = []
                    if word not in self.deletes[item]:
                        self.deletes[item].append(word)
            else:
                self.dictionary[word] += count

    def lookup(self, phrase, modo="offline"):
        """Versión Híbrida: Pareto + Fonética + Turbo-Bypass (Parche Punto Ciego)."""
        asegurar_motor_inicializado()
        if not phrase: return ""
        
        # 🛡️ BYPASS TÁCTICO (0% CPU, 100% Precisión Nativa):
        # En Modo Cartas/Oficios, confiamos en la Inteligencia Artificial Nativa de Vosk.
        # Evita que SymSpell intente buscar "fibros" cuando dices "antes".
        if modo == "offline":
            return phrase

        words = phrase.lower().split()
        res = []
        
        for w in words:
            # 1. PARETO & ESCUDO: Si es ultra-popular o es un nombre protegido, bypass O(1)
            if w in self.popular or w in self.nombres or w in self.dictionary:
                res.append(w)
                continue
            
            # 2. FONÉTICA: Si suena a una palabra técnica, corregir por sonido
            f_key = self._phonetic_key(w)
            if f_key in self.phonetic_map:
                res.append(self.phonetic_map[f_key])
                continue

            # 3. SYMSPELL: Fix del Punto Ciego (Intersección de Deletes)
            if len(w) <= 3:
                res.append(w)
                continue
            
            candidatos_validos = set()
            
            # Generamos las variaciones (deletes) de la palabra MAL ESCRITA
            dist_tolerada = 3 if (modo == "online" and len(w) >= 6) else self.max_edit_distance
            variaciones_tipeadas = self._get_deletes(w, override_dist=dist_tolerada)
            
            # Buscamos si alguna de esas variaciones choca con nuestro índice maestro
            for variacion in variaciones_tipeadas:
                if variacion in self.deletes:
                    for sugerencia in self.deletes[variacion]:
                        candidatos_validos.add(sugerencia)
                        
            # Si encontramos coincidencias en el cruce de variaciones
            if candidatos_validos:
                # --- FILTRADO QUIRÚRGICO v16.0 ---
                validos_filtrados = []
                for c in candidatos_validos:
                    # A. Diferencia de longitud estricta
                    tolerancia_long = 2 if modo == "online" else 1
                    if abs(len(c) - len(w)) > tolerancia_long: continue
                    # B. Distancia Proporcional (Evita alucinaciones en palabras cortas)
                    dist = self._levenshtein(w, c)
                    
                    if modo == "online" and len(w) >= 6:
                        max_dist = 3
                    else:
                        max_dist = 1 if len(w) <= 5 else 2
                        
                    if dist <= max_dist:
                        validos_filtrados.append(c)
                
                if validos_filtrados:
                    # Priorizamos por (Confianza Anatómica Equilibrada + Frecuencia)
                    def scoring_preciso(x):
                        import unicodedata
                        score = self.dictionary.get(x, 0)
                        
                        modo_medico = getattr(config, 'modo_medico_activo', True)
                        if modo_medico:
                            if self._es_anatomico_plausible(x):
                                bono_medico = 450 if modo == "online" else 150 # Bono de Confianza
                                score += bono_medico 
                        else:
                            if x in recursos.TERMINOS_ADMINISTRATIVOS:
                                bono_admin = 500 if modo == "online" else 200 # Escudo Legal
                                score += bono_admin
                                
                        if x in self.nombres:
                            score += 1000 # 🛡️ Mega-Bono de Nombre (v17.0)
                            
                        # Bono por similitud acentual pura (misma palabra base, solo corrige acentos)
                        x_norm = "".join(c for c in unicodedata.normalize('NFD', x) if unicodedata.category(c) != 'Mn')
                        w_norm = "".join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')
                        if x_norm == w_norm:
                            score += 500
                        return score
                    
                    best = max(validos_filtrados, key=scoring_preciso)
                    
                    # 🛡️ FILTRO DE SEGURIDAD v18.0 (VARIACIONES GRAMATICALES Y ACENTOS)
                    # Si el término es una variación gramatical (género/número/sufijo de truncación) de la palabra original,
                    # o si el cambio no mejora significativamente el score, mantenemos la original.
                    if self._son_variantes_gramaticales(w, best):
                        res.append(w)
                    elif (w in self.popular or w in self.nombres) and scoring_preciso(best) < scoring_preciso(w) * 4.0:
                        res.append(w)
                    else:
                        res.append(best)
                else:
                    res.append(w)
            else:
                res.append(w)
                
        return " ".join(res)

    def _levenshtein(self, s1, s2):
        """Algoritmo de Distancia de Levenshtein (v1.0 Standard) optimizado con lru_cache."""
        return _fast_levenshtein(s1, s2)

    def save_cache(self, filepath):
        """Persistencia binaria del cerebro."""
        with self._lock:
            with open(filepath, 'wb') as f:
                pickle.dump((self.dictionary, self.deletes, self.popular, self.phonetic_map, self.nombres), f, protocol=4)

    def load_cache(self, filepath):
        """Carga instantánea Ghost-Load."""
        with self._lock:
            with open(filepath, 'rb') as f:
                self.dictionary, self.deletes, self.popular, self.phonetic_map, self.nombres = pickle.load(f)

corrector_informes = MicroSymSpell()
corrector_cartas = MicroSymSpell()

# Para compatibilidad de importaciones legadas directas
corrector = corrector_informes

_motor_cargado = False
_motor_lock = threading.Lock()

def asegurar_motor_inicializado():
    global _motor_cargado
    if not _motor_cargado:
        with _motor_lock:
            if not _motor_cargado:
                _motor_cargado = True
                inicializar_motor_elite()

def obtener_corrector():
    """Retorna el corrector activo según el modo médico configurado."""
    asegurar_motor_inicializado()
    if getattr(config, 'modo_medico_activo', True):
        return corrector_informes
    else:
        return corrector_cartas

def _cargar_o_crear_cache(corrector_inst, cache_file, incluir_medico=True):
    """Carga el caché binario de SymSpell o lo construye desde los TXT de origen si es necesario."""
    reconstruir = False
    
    # 1. Determinar archivos de origen requeridos
    archivos_origen = [PATH_NOMBRES, PATH_APELLIDOS, PATH_COMUNES]
    if incluir_medico:
        archivos_origen.append(PATH_PATOLOGICOS)
        
    # 2. Verificar existencia del caché y si alguno de los TXT es más reciente
    if not os.path.exists(cache_file):
        reconstruir = True
    else:
        mtime_cache = os.path.getmtime(cache_file)
        for path in archivos_origen:
            if os.path.exists(path) and os.path.getmtime(path) > mtime_cache:
                reconstruir = True
                break

    if reconstruir:
        modo_txt = "INFORMES (Completo)" if incluir_medico else "CARTAS (Común)"
        print(f"\n[CORTANA] Construyendo Caché para Modo {modo_txt}...")
        
        corrector_inst.dictionary.clear()
        corrector_inst.deletes.clear()
        corrector_inst.popular.clear()
        corrector_inst.nombres.clear()
        corrector_inst.phonetic_map.clear()
        
        # A. Cargar Palabras Comunes
        if os.path.exists(PATH_COMUNES):
            try:
                with open(PATH_COMUNES, "r", encoding="utf-8") as f:
                    for line in f:
                        w = line.strip().lower()
                        if w:
                            corrector_inst.popular.add(w)
                print(f"[CEREBRO] Escudo Común cargado con {len(corrector_inst.popular)} palabras.")
            except Exception as e:
                print(f"[CEREBRO ERROR] Error al cargar comunes: {e}")
                
        # B. Cargar Nombres Peruanos
        if os.path.exists(PATH_NOMBRES):
            try:
                with open(PATH_NOMBRES, "r", encoding="utf-8") as f:
                    for line in f:
                        w = line.strip().lower()
                        if w:
                            corrector_inst.nombres.add(w)
                print(f"[CEREBRO] Escudo Nombres cargado con {len(corrector_inst.nombres)} palabras.")
            except Exception as e:
                print(f"[CEREBRO ERROR] Error al cargar nombres: {e}")
                
        # C. Cargar Apellidos Peruanos
        if os.path.exists(PATH_APELLIDOS):
            try:
                with open(PATH_APELLIDOS, "r", encoding="utf-8") as f:
                    for line in f:
                        w = line.strip().lower()
                        if w:
                            corrector_inst.nombres.add(w) # Tratar como inmune
                print(f"[CEREBRO] Escudo Apellidos cargado.")
            except Exception as e:
                print(f"[CEREBRO ERROR] Error al cargar apellidos: {e}")
                
        # D. Cargar Términos Médicos (Solo en Modo Informes)
        if incluir_medico and os.path.exists(PATH_PATOLOGICOS):
            try:
                medicos = []
                with open(PATH_PATOLOGICOS, "r", encoding="utf-8") as f:
                    for line in f:
                        w = line.strip().lower()
                        if w:
                            medicos.append(w)
                            
                total = len(medicos)
                for i, w in enumerate(medicos):
                    corrector_inst.create_dictionary_entry(w)
                    if i % 1000 == 0 or i == total - 1:
                        prog = (i + 1) / total
                        barra = "#" * int(prog * 20) + "-" * (20 - int(prog * 20))
                        sys.stdout.write(f"\r[CEREBRO] Entrenando Médicos: |{barra}| {int(prog*100)}% ({i+1}/{total})")
                        sys.stdout.flush()
                print(f"\n[CEREBRO] Escudo Médico entrenado con {total} términos.")
            except Exception as e:
                print(f"\n[CEREBRO ERROR] Error al cargar términos médicos: {e}")
                
        # Guardar en cache
        corrector_inst.save_cache(cache_file)
        print(f"[OK] Ghost-Cache creado: {os.path.basename(cache_file)} ({os.path.getsize(cache_file)/1024:.2f} KB).")
        
    else:
        # Carga instantánea desde caché binario
        modo_txt = "INFORMES" if incluir_medico else "CARTAS"
        print(f"[CORTANA] Cargando motor {modo_txt} desde Caché Binario...")
        try:
            corrector_inst.load_cache(cache_file)
        except Exception as e:
            print(f"[ERROR] Caché corrupto {cache_file}. Regenerando... {e}")
            if os.path.exists(cache_file):
                os.remove(cache_file)
            _cargar_o_crear_cache(corrector_inst, cache_file, incluir_medico)

def inicializar_motor_elite():
    """Motor Cortana: Carga inteligente para Informes y Cartas por separado."""
    # 1. Cargar corrector de informes (Completo)
    _cargar_o_crear_cache(corrector_informes, CACHE_INFORMES, incluir_medico=True)
    # 2. Cargar corrector de cartas (Comunes + Nombres/Apellidos)
    _cargar_o_crear_cache(corrector_cartas, CACHE_CARTAS, incluir_medico=False)
    
    # Sincronizar el alias global por defecto
    global corrector
    corrector = obtener_corrector()
    print(f"[CORTANA] Motores Listos (Segmentación Cartas vs Informes).")

def hot_reload_motor():
    """Recarga los motores en caliente."""
    print("[HOT RELOAD] Refrescando motores SymSpell...")
    inicializar_motor_elite()
