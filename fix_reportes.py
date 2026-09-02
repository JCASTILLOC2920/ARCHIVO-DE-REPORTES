import os

file_path = "temp_reportes.js"

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

# Find the start of the injected block
cut_idx = len(lines)
for i in range(len(lines)):
    if "PROTOCOLO ACTOR-CRITICO" in lines[i]:
        cut_idx = i - 1 # One line above
        break

lines = lines[:cut_idx]

# Append the new block
new_block = """
/* ==========================================================================
   PROTOCOLO ACTOR-CRITICO: CASCADA MODULAR DE DICTADO O(1)
   ========================================================================== */
window.iniciarDictadoCascada = async function(targetElementId) {
    const el = document.getElementById(targetElementId);
    if (!el) {
        console.error("Dictáfono: Elemento objetivo no encontrado.");
        if (typeof showToast === 'function') showToast("Error de interfaz: Campo no disponible.", "error");
        return;
    }

    const originColor = el.style.backgroundColor;
    el.style.backgroundColor = '#fca5a5';
    if (typeof showToast === 'function') showToast("Escuchando... Hable ahora.", "info");

    try {
        let transcripcion = null;
        
        if (!navigator.onLine) {
            console.warn("Sin internet. Alerta enviada.");
            if (typeof showToast === 'function') showToast("No hay internet. Por favor pase manualmente al modo offline (Whisper Local).", "error");
            return;
        }

        // Intento primario: Módulo aislado de Groq
        if (typeof window.ejecutarMotorGroq === 'function') {
            try {
                transcripcion = await window.ejecutarMotorGroq();
            } catch (err) {
                console.warn("Groq falló: " + err.message);
                transcripcion = null;
            }
        } else {
            console.warn("Módulo motor_groq no encontrado o desactivado.");
        }
        
        // Fallback a Google
        if (!transcripcion) {
            console.warn("Cambiando automáticamente al modo Google...");
            if (typeof showToast === 'function') showToast("Fallo en llave Groq o timeout. Cambiando automáticamente al modo Google...", "warning");
            transcripcion = await intentarGoogleAPI();
        }

        if (transcripcion) {
            // Bypass O(1)
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const text = el.value;
            
            el.value = text.substring(0, start) + transcripcion + " " + text.substring(end);
            el.selectionStart = el.selectionEnd = start + transcripcion.length + 1;
            
            if (typeof showToast === 'function') showToast("Dictado insertado con éxito.", "success");
        } else {
            throw new Error("Ambos motores fallaron o usuario no dio permisos.");
        }

    } catch (e) {
        console.error("Dictáfono Error:", e);
        if (typeof showToast === 'function') showToast("Fallo en el dictáfono. Ver consola.", "error");
    } finally {
        el.style.backgroundColor = originColor || '';
    }
};

async function intentarGoogleAPI() {
    return new Promise((resolve, reject) => {
        if (!('webkitSpeechRecognition' in window)) {
            resolve(null);
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'es-PE';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            resolve(event.results[0][0].transcript);
        };
        recognition.onerror = () => resolve(null);
        recognition.start();
    });
}
"""

lines.append(new_block)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Modular logic injected.")
