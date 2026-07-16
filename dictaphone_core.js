// dictaphone_core.js
// PROTOCOLO ACTOR-CRITICO: Módulo Aislado para Grabación de Audio y Reconocimiento de Voz

let isRecording = false;
let recognition = null;
let currentTargetInputId = null;

const showToast = window.showToast || function(m){console.log(m)};

export function initDictaphone() {
    if (!('webkitSpeechRecognition' in window)) {
        console.warn("[Dictaphone] webkitSpeechRecognition no soportado por este navegador.");
        return false;
    }
    
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-PE';
    
    recognition.onstart = () => {
        isRecording = true;
        console.log("[Dictaphone] Escuchando...");
        if (currentTargetInputId) {
            const btn = document.getElementById(`btn_dictado_${currentTargetInputId}`);
            if (btn) {
                btn.classList.add('recording');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-microphone fa-beat';
                    icon.style.color = '#ef4444';
                }
            }
        }
        showToast("Micrófono activado. Hable ahora...", "success");
    };
    
    recognition.onresult = (event) => {
        if (!currentTargetInputId) return;
        
        const targetInput = document.getElementById(currentTargetInputId);
        if (!targetInput) return;
        
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        if (finalTranscript !== '') {
            // Bypass O(1) inyección de texto
            const cursorPos = targetInput.selectionStart;
            const textBefore = targetInput.value.substring(0, cursorPos);
            const textAfter  = targetInput.value.substring(targetInput.selectionEnd, targetInput.value.length);
            
            targetInput.value = textBefore + ' ' + finalTranscript.trim() + ' ' + textAfter;
            
            // Move cursor
            targetInput.selectionStart = targetInput.selectionEnd = cursorPos + finalTranscript.trim().length + 2;
        }
    };
    
    recognition.onerror = (event) => {
        console.error("[Dictaphone] Error de reconocimiento:", event.error);
        if (event.error === 'not-allowed') {
            showToast("Acceso al micrófono denegado. Permítalo en su navegador.", "error");
        } else {
            showToast(`Error de dictado: ${event.error}`, "error");
        }
        stopDictation();
    };
    
    recognition.onend = () => {
        isRecording = false;
        console.log("[Dictaphone] Reconocimiento finalizado.");
        if (currentTargetInputId) {
            const btn = document.getElementById(`btn_dictado_${currentTargetInputId}`);
            if (btn) {
                btn.classList.remove('recording');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-microphone';
                    icon.style.color = '';
                }
            }
        }
        showToast("Micrófono desactivado.", "info");
    };
    
    return true;
}

export function startDictation(targetInputId) {
    if (!recognition) {
        const initialized = initDictaphone();
        if (!initialized) return;
    }
    
    if (isRecording) {
        stopDictation();
        return;
    }
    
    currentTargetInputId = targetInputId;
    recognition.start();
}

export function stopDictation() {
    if (recognition && isRecording) {
        recognition.stop();
        isRecording = false;
    }
}

// Futura integración de Memoria a Corto Plazo (Groq / RAG)
export async function fallbackGroqDictation(audioBlob) {
    console.log("[Dictaphone] Enviando fragmento a Groq API (Arquitectura de Corto Plazo)...");
    return "Texto procesado matemáticamente";
}
