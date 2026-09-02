import math
import os

class BunkerVerificador:
    """
    🛡️ Sistema de Verificación de Integridad de Fotos (Antigravity v8.5)
    Utiliza análisis de firma estructural y entropía de Shannon de grado militar.
    """

    @staticmethod
    def calcular_entropia(filepath):
        """Calcula la entropía de Shannon para detectar ruido vs información real."""
        if not os.path.exists(filepath): return 0
        counts = [0] * 256
        filesize = os.path.getsize(filepath)
        if filesize == 0: return 0
        
        # Lectura por bloques para optimizar RAM (Grado Militar)
        with open(filepath, 'rb') as f:
            while True:
                chunk = f.read(64 * 1024)
                if not chunk: break
                for byte in chunk:
                    counts[byte] += 1
        
        entropy = 0
        for count in counts:
            if count == 0: continue
            p = count / filesize
            entropy -= p * math.log2(p)
        return entropy

    @staticmethod
    def verificar_estructura(filepath):
        """Verifica marcadores de inicio (header) y fin (footer) según el formato."""
        if not os.path.exists(filepath): return False, "No existe"
        size = os.path.getsize(filepath)
        if size < 2000: return False, "Trucado o vacío"

        with open(filepath, 'rb') as f:
            header = f.read(8)
            # JPEG: FF D8 ... FF D9
            if header[:2] == b'\xff\xd8':
                f.seek(-2, 2)
                footer = f.read(2)
                if footer == b'\xff\xd9':
                    return True, "JPEG Completo"
                else:
                    return False, "JPEG Incompleto (Truncado)"
            
            # PNG: 89 50 4E 47 0D 0A 1A 0A
            if header[:8] == b'\x89\x50\x4e\x47\x0d\x0a\x1a\x0a':
                f.seek(-12, 2)
                footer = f.read(12)
                if b'IEND' in footer:
                    return True, "PNG Completo"
                else:
                    return False, "PNG Incompleto (Truncado)"
            
            return False, "Formato Desconocido"

    @staticmethod
    def es_foto_valida(filepath):
        """Evaluación combinada de integridad absoluta."""
        # 1. Validación Estructural (Firma Hexadecimal)
        valida_id, msg_id = BunkerVerificador.verificar_estructura(filepath)
        if not valida_id:
            return False, msg_id

        # 2. Validación de Contenido (Entropía de Shannon)
        # Una imagen médica útil siempre tiene entropía > 3.0 (aprox)
        # Una imagen negra o corrupta con ceros tiene entropía < 1.0
        ent = BunkerVerificador.calcular_entropia(filepath)
        if ent < 1.2:
            return False, f"Contenido Inválido (Entropía: {ent:.2f})"
            
        return True, f"Válida (E:{ent:.2f})"

if __name__ == "__main__":
    # Test rápido de auto-diagnóstico
    test_path = "test_img.tmp"
    with open(test_path, "wb") as f: f.write(b"\xff\xd8\x00\x00\xff\xd9")
    res, msg = BunkerVerificador.es_foto_valida(test_path)
    print(f"Test Estructural: {msg}")
    os.remove(test_path)
