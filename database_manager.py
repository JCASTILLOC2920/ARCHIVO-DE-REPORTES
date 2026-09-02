import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "memoria_cortana.db")

def conectar_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.execute('PRAGMA journal_mode = WAL;')
    conn.execute('PRAGMA synchronous = NORMAL;')
    conn.execute('PRAGMA cache_size = -2000;') # Limitar caché a máx 2MB en RAM
    conn.execute('PRAGMA temp_store = MEMORY;')
    conn.execute('''CREATE TABLE IF NOT EXISTS plantillas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    comando TEXT UNIQUE NOT NULL,
                    especialidad TEXT NOT NULL,
                    contenido TEXT NOT NULL)''')
    conn.execute('''CREATE TABLE IF NOT EXISTS comandos_f3 (
                    nombre TEXT UNIQUE, 
                    accion TEXT, 
                    ruta_huella TEXT)''')
    return conn

def buscar_plantilla_por_comando(comando):
    """Busca y retorna el contenido de una plantilla basándose en su comando."""
    comando_limpio = comando.lower().strip().replace(".", "")
    try:
        conn = conectar_db()
        res = conn.execute("SELECT contenido FROM plantillas WHERE comando = ?", (comando_limpio,)).fetchone()
        conn.close()
        return res[0] if res else None
    except:
        return None

def obtener_todas_especialidades():
    """Retorna una lista de especialidades únicas."""
    try:
        conn = conectar_db()
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT especialidad FROM plantillas ORDER BY especialidad ASC")
        resultados = [row[0] for row in cursor.fetchall()]
        conn.close()
        return resultados
    except:
        return []

def obtener_comandos_por_especialidad(especialidad):
    """Retorna los comandos asociados a una especialidad."""
    try:
        conn = conectar_db()
        cursor = conn.cursor()
        cursor.execute("SELECT comando FROM plantillas WHERE especialidad = ? ORDER BY comando ASC", (especialidad,))
        resultados = [row[0] for row in cursor.fetchall()]
        conn.close()
        return resultados
    except:
        return []

def obtener_plantillas(filtro=""):
    """Retorna las plantillas filtradas (id, especialidad, comando, contenido)."""
    try:
        conn = conectar_db()
        cursor = conn.cursor()
        if filtro:
            cursor.execute("SELECT id, especialidad, comando, contenido FROM plantillas WHERE comando LIKE ? OR especialidad LIKE ? ORDER BY especialidad ASC, comando ASC", ('%'+filtro+'%', '%'+filtro+'%'))
        else:
            cursor.execute("SELECT id, especialidad, comando, contenido FROM plantillas ORDER BY especialidad ASC, comando ASC")
        resultados = cursor.fetchall()
        conn.close()
        return resultados
    except:
        return []

def guardar_plantilla(comando, especialidad, contenido, plantilla_id=None):
    """Guarda o actualiza una plantilla."""
    comando_limpio = comando.strip().lower()
    especialidad_limpia = especialidad.strip()
    
    conn = conectar_db()
    cursor = conn.cursor()
    try:
        if plantilla_id:
            cursor.execute("UPDATE plantillas SET comando = ?, especialidad = ?, contenido = ? WHERE id = ?", 
                           (comando_limpio, especialidad_limpia, contenido, plantilla_id))
        else:
            cursor.execute("INSERT INTO plantillas (comando, especialidad, contenido) VALUES (?, ?, ?)", 
                           (comando_limpio, especialidad_limpia, contenido))
    except sqlite3.IntegrityError:
        cursor.execute("UPDATE plantillas SET especialidad = ?, contenido = ? WHERE comando = ?", 
                       (especialidad_limpia, contenido, comando_limpio))
    conn.commit()
    conn.close()

def eliminar_plantilla_por_comando(comando):
    comando_limpio = comando.strip().lower()
    if not comando_limpio: return False
    try:
        conn = conectar_db()
        conn.execute("DELETE FROM plantillas WHERE comando = ?", (comando_limpio,))
        conn.commit()
        conn.close()
        return True
    except:
        return False

def exportar_a_json_web():
    """Exporta todas las plantillas a un archivo JSON para consumo de la página web."""
    import json
    try:
        ruta_web = os.path.join(os.environ['USERPROFILE'], "Desktop", "repositorio", "ARCHIVO DE REPORTES", "plantillas_cortana.json")
        plantillas = obtener_plantillas()
        
        datos = []
        for p_id, especialidad, comando, contenido in plantillas:
            datos.append({
                "comando": comando,
                "especialidad": especialidad,
                "contenido": contenido
            })
            
        with open(ruta_web, "w", encoding="utf-8") as f:
            json.dump({"plantillas": datos}, f, ensure_ascii=False, indent=2)
            
        print(f"[DB SYNC] Plantillas exportadas exitosamente a la web: {ruta_web}")
    except Exception as e:
        print(f"[DB ERROR SYNC] No se pudo exportar JSON web: {e}")

def enrolar_comando_f3(nombre_comando, accion, ruta_archivo):
    """Guarda o actualiza un comando F3 en la base de datos."""
    try:
        conn = conectar_db()
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO comandos_f3 (nombre, accion, ruta_huella) VALUES (?, ?, ?)", 
                      (nombre_comando, accion, ruta_archivo))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"[DB ERROR] enrolar_comando_f3: {e}")
        return False

def buscar_plantilla_fuzzy(comando_voz):
    """
    Busca y retorna el contenido de una plantilla basándose en coincidencia exacta o difusa (Jaccard).
    """
    if not comando_voz:
        return None
        
    comando_limpio = comando_voz.lower().strip().replace(".", "")
    
    # 1. Intento de coincidencia exacta directa
    res_exacto = buscar_plantilla_por_comando(comando_limpio)
    if res_exacto:
        return res_exacto
        
    # 2. Búsqueda difusa si no hay coincidencia exacta
    try:
        import unicodedata
        def normalizar(s):
            s = s.lower().strip()
            # Remover marcas de acento/diacríticos
            s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
            return s
            
        texto_norm = normalizar(comando_limpio)
        plantillas = obtener_plantillas()
        
        mejor_match = None
        mejor_similitud = 0.0
        
        for _, _, cmd, contenido in plantillas:
            cmd_norm = normalizar(cmd)
            
            # Coincidencia directa por subcadena
            if cmd_norm in texto_norm or texto_norm in cmd_norm:
                # Prioridad alta para subcadenas completas
                return contenido
                
            # Coincidencia por conjunto de palabras (Jaccard)
            words_cmd = set(cmd_norm.split())
            words_text = set(texto_norm.split())
            if not words_cmd or not words_text:
                continue
                
            intersection = words_cmd.intersection(words_text)
            union = words_cmd.union(words_text)
            jaccard = len(intersection) / len(union)
            
            if jaccard > mejor_similitud and jaccard >= 0.5:
                mejor_similitud = jaccard
                mejor_match = contenido
                
        if mejor_match:
            print(f"[DB FUZZY] Match difuso exitoso para '{comando_voz}' (similitud: {mejor_similitud:.2f})")
        return mejor_match
    except Exception as e:
        print(f"[DB ERROR FUZZY] Error en buscar_plantilla_fuzzy: {e}")
        return None


