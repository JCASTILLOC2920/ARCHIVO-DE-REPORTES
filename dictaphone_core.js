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
            // Normalizar y limpiar espacios dobles y caracteres de no-ruptura (\u00a0)
            let cleanText = finalTranscript.replace(/[\u00a0\s]+/g, ' ').trim();
            
            // Diccionario de correcciones de jerga médica y patología
            const MEDICAL_CORRECTIONS = {
                "morse la da": "morcelado",
                "morse lado": "morcelado",
                "morse helado": "morcelado",
                "amor celado": "morcelado",
                "por marcela": "por morcelado",
                "marcelados": "morcelados",
                "marcelado": "morcelado",
                "modular prostática": "nodular prostática",
                "hiperplasia modular": "hiperplasia nodular",
                "casetes": "cassettes",
                "casete": "cassette",
                "casetas": "cassettes",
                "papanicolau": "Papanicolaou",
                "papanicolaou": "Papanicolaou",
                "h y e": "HE",
                "h y es": "HE"
            };

            for (const [wrong, right] of Object.entries(MEDICAL_CORRECTIONS)) {
                const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
                cleanText = cleanText.replace(regex, right);
            }

            const isContentEditable = targetInput.getAttribute('contenteditable') === 'true' || targetInput.tagName === 'DIV';
            if (isContentEditable) {
                targetInput.focus();
                const selection = window.getSelection();
                
                // Forzar y restaurar la selección al final si se perdió el foco
                if (!selection.rangeCount || !targetInput.contains(selection.anchorNode)) {
                    const newRange = document.createRange();
                    newRange.selectNodeContents(targetInput);
                    newRange.collapse(false); // colapsar al final
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
                
                const range = selection.getRangeAt(0);
                range.deleteContents();
                
                // Decidir inteligentemente si requiere un espacio inicial
                let prefixSpace = '';
                if (range.startOffset > 0 && range.startContainer.textContent) {
                    const prevChar = range.startContainer.textContent[range.startOffset - 1];
                    if (prevChar && prevChar !== ' ') {
                        prefixSpace = ' ';
                    }
                } else if (targetInput.innerText && !targetInput.innerText.endsWith(' ') && targetInput.innerText.length > 0) {
                    prefixSpace = ' ';
                }
                
                const textNode = document.createTextNode(prefixSpace + cleanText);
                range.insertNode(textNode);
                
                // Colocar el cursor al final de la palabra insertada
                const newRange = document.createRange();
                newRange.setStartAfter(textNode);
                newRange.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } else {
                const cursorPos = targetInput.selectionStart || 0;
                const textBefore = targetInput.value.substring(0, cursorPos);
                const textAfter  = targetInput.value.substring(targetInput.selectionEnd || 0, targetInput.value.length);
                
                let prefixSpace = '';
                if (cursorPos > 0 && textBefore[cursorPos - 1] !== ' ') {
                    prefixSpace = ' ';
                }
                
                targetInput.value = textBefore + prefixSpace + cleanText + ' ' + textAfter;
                targetInput.selectionStart = targetInput.selectionEnd = cursorPos + prefixSpace.length + cleanText.length + 1;
            }
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
