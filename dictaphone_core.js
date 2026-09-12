// dictaphone_core.js
// PROTOCOLO ACTOR-CRITICO: Módulo Acelerador de Dictado y Reconocimiento de Voz
// Integra Web Audio API con filtros acústicos de hardware y Conexión Ultrarrápida a Groq Whisper LPU.

import { getGroqApiKey } from './groq_copilot.js';

// --- ESTADO GLOBAL DEL DICTÁFONO ---
let isRecording = false;
let recognition = null;
let currentTargetInputId = null;
let speechRecognitionReceivedFinal = false;

// Web Audio API Pipeline State
let audioContext = null;
let rawMediaStream = null;
let filteredMediaStream = null;
let mediaRecorder = null;
let recordedAudioChunks = [];
let audioSourceNode = null;
let highpassNode = null;
let bandpassNode = null;
let lowpassNode = null;
let compressorNode = null;
let gainNode = null;
let destinationNode = null;
let analyserNode = null;
let noiseGateTimer = null;
let webAudioNoiseFloor = 0.01;
let webAudioLastRMS = 0.0;
let webAudioIsSpeech = false;

const showToast = window.showToast || function(m) { console.log(m); };

// Vocabulario especializado para guiar al modelo Groq Whisper LPU sin latencia
const MEDICAL_WHISPER_PROMPT = "Informe anatomopatológico: biopsia, adenocarcinoma acinar, proliferación acinar, células acinares, patrón acinar, atipia citológica, neoplasia, carcinoma in situ, márgenes libres de neoplasia, Helicobacter pylori, ganglios linfáticos, inmunohistoquímica Ki-67, CK7, CK20, necrosis tumoral, Gleason.";

// Lista negra anti-alucinaciones acústicas de Whisper
const WHISPER_HALLUCINATION_BLACKLIST = [
    "subtítulos por", "subtitulos por", "gracias por ver", "amén",
    "suscríbete", "dale like", "asesinos", "subtitulado por",
    "transcripción por", "derechos reservados", "hasta la próxima",
    "reproducir música", "silencio", "continuará"
];

// Diccionario de Auto-corrección fonética - PRIORIDAD MÉDICA Y ACÚSTICA
const MEDICAL_CORRECTIONS = {
    // Prioridad Absoluta: ACINAR / ACINARES y variantes fonéticas / contextuales
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
    "a cenares": "acinares",
    "a sinares": "acinares",
    "asinares": "acinares",
    "hacinares": "acinares",
    "a cenar": "acinar",
    "a cinar": "acinar",
    "a sinar": "acinar",
    "ha cenar": "acinar",
    "al cenar": "acinar",
    "a signar": "acinar",
    "asinar": "acinar",
    "acenar": "acinar",
    "hacinar": "acinar",
    "peri acinar": "periacinar",
    "peri acinares": "periacinares",
    "intra acinar": "intraacinar",
    "intra acinares": "intraacinares",
    // Otras correcciones médicas frecuentes
    "apendise": "apéndice",
    "vesicula": "vesícula",
    "polipo": "pólipo",
    "gastritis cronica": "gastritis crónica",
    "adenocarcinoma": "adenocarcinoma",
    "helicobacter": "Helicobacter pylori",
    "hp": "Helicobacter pylori",
    "sin atipia": "sin atipia citológica",
    "carcinoma in situ": "carcinoma in situ",
    "bordes libres": "márgenes quirúrgicos libres de neoplasia",
    "borde libre": "margen quirúrgico libre de neoplasia",
    "punto": ".",
    "coma": ",",
    "dos puntos": ":",
    "punto y coma": ";",
    "nueva linea": "\n",
    "nuevo parrafo": "\n\n"
};

// COMANDOS DE VOZ INTELIGENTES PARA PROTOCOLOS ONCOLÓGICOS CAP
const CAP_VOICE_MAP = [
    { trigger: /(?:abrir|mostrar|ver)?\s*protocolos?\s*(?:cap|oncol[oó]gicos?)/i, action: () => { if (typeof window.openCapQuickModal === 'function') window.openCapQuickModal(); } },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*colon/i, id: 301 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*est[oó]mago/i, id: 302 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*gist/i, id: 303 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*pr[oó]stata/i, id: 304 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*ri[nñ][oó]n/i, id: 305 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*vejiga/i, id: 306 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*mama/i, id: 307 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*c[eé]rvix/i, id: 309 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*endometrio/i, id: 310 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*ovario/i, id: 311 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*tiroides/i, id: 312 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*pulm[oó]n/i, id: 313 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*melanoma/i, id: 314 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*piel/i, id: 315 },
    { trigger: /(?:cargar|insertar)?\s*protocolo\s*(?:cap)?\s*(?:de)?\s*(?:laringe|cavidad oral|cuello)/i, id: 316 }
];

/**
 * Obtiene la API Key de Groq desde el copiloto o almacenamiento local
 */
function resolveGroqApiKey() {
    try {
        if (typeof getGroqApiKey === 'function') {
            const key = getGroqApiKey();
            if (key) return key;
        }
    } catch (e) {}
    return localStorage.getItem('groqApiKey') || '';
}

/**
 * Aplica el diccionario de correcciones médicas a un texto
 */
function applyMedicalCorrections(text) {
    if (!text || typeof text !== 'string') return '';
    let cleanText = text.trim();
    for (const [wrong, right] of Object.entries(MEDICAL_CORRECTIONS)) {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
        cleanText = cleanText.replace(regex, right);
    }
    return cleanText;
}

/**
 * Evalúa y ejecuta comandos de voz de protocolos CAP
 * Retorna true si se ejecutó un comando de voz
 */
function executeVoiceCommandIfMatches(text) {
    const lowerTranscript = text.toLowerCase();
    for (const item of CAP_VOICE_MAP) {
        if (item.trigger.test(lowerTranscript)) {
            if (item.action) {
                item.action();
                return true;
            } else if (item.id && typeof window.cargarProtocoloCapCompleto === 'function') {
                window.cargarProtocoloCapCompleto(item.id);
                return true;
            }
        }
    }
    return false;
}

/**
 * Inserta texto en el input o elemento contenteditable activo
 */
function insertTextIntoTarget(targetInput, textToInsert) {
    if (!targetInput || !textToInsert) return;

    const isContentEditable = targetInput.getAttribute('contenteditable') === 'true' || targetInput.tagName === 'DIV';
    if (isContentEditable) {
        targetInput.focus();
        
        let prefixSpace = '';
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.startOffset > 0 && range.startContainer.textContent) {
                const prevChar = range.startContainer.textContent[range.startOffset - 1];
                if (prevChar && prevChar !== ' ' && prevChar !== '\xA0') {
                    prefixSpace = ' ';
                }
            }
        } else if (targetInput.innerText && !targetInput.innerText.endsWith(' ') && targetInput.innerText.length > 0) {
            prefixSpace = ' ';
        }

        try {
            document.execCommand("insertText", false, prefixSpace + textToInsert);
        } catch (eCmd) {
            const textNode = document.createTextNode(prefixSpace + textToInsert);
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
            }
        }
    } else {
        const cursorPos = targetInput.selectionStart || 0;
        const textBefore = targetInput.value.substring(0, cursorPos);
        const textAfter  = targetInput.value.substring(targetInput.selectionEnd || 0, targetInput.value.length);
        
        let prefixSpace = '';
        if (cursorPos > 0 && textBefore[cursorPos - 1] !== ' ') {
            prefixSpace = ' ';
        }
        
        targetInput.value = textBefore + prefixSpace + textToInsert + " " + textAfter;
        const newPos = cursorPos + prefixSpace.length + textToInsert.length + 1;
        targetInput.setSelectionRange(newPos, newPos);
    }
    
    try {
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (eEvt) {}
}

/**
 * INYECCIÓN DE FILTROS WEB AUDIO API NATIVOS
 * Configura restricciones de hardware: echoCancellation, noiseSuppression, autoGainControl.
 * Conecta en cascada: Highpass (85Hz) -> BiquadFilterNode Pasabanda (1750Hz, Q=0.68) -> Lowpass (7500Hz) -> DynamicsCompressorNode -> GainNode
 */
export async function setupWebAudioFilters() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            console.warn("[WebAudio] AudioContext no soportado en este navegador.");
            return null;
        }

        if (!audioContext || audioContext.state === 'closed') {
            audioContext = new AudioContextClass();
        }

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // Restricciones de captura nativas de micrófono de alta fidelidad
        const audioConstraints = {
            audio: {
                channelCount: 1,
                sampleRate: { ideal: 16000 },
                echoCancellation: { ideal: true },
                noiseSuppression: { ideal: true },
                autoGainControl: { ideal: true }
            }
        };

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn("[WebAudio] getUserMedia no soportado.");
            return null;
        }

        rawMediaStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        audioSourceNode = audioContext.createMediaStreamSource(rawMediaStream);

        // 1. High-Pass Filter: corta el zumbido de línea de 50/60Hz, vibraciones mecánicas y DC offset
        highpassNode = audioContext.createBiquadFilter();
        highpassNode.type = 'highpass';
        highpassNode.frequency.setValueAtTime(85, audioContext.currentTime);
        highpassNode.Q.setValueAtTime(0.7, audioContext.currentTime);

        // 2. BiquadFilterNode Pasabanda: centra la energía en el rango de formantes de la voz humana (300Hz - 3400Hz)
        bandpassNode = audioContext.createBiquadFilter();
        bandpassNode.type = 'bandpass';
        bandpassNode.frequency.setValueAtTime(1750, audioContext.currentTime);
        bandpassNode.Q.setValueAtTime(0.68, audioContext.currentTime);

        // 3. Low-Pass Filter: elimina ruido blanco, interferencia de alta frecuencia y siseo
        lowpassNode = audioContext.createBiquadFilter();
        lowpassNode.type = 'lowpass';
        lowpassNode.frequency.setValueAtTime(7500, audioContext.currentTime);
        lowpassNode.Q.setValueAtTime(0.7, audioContext.currentTime);

        // 4. Dynamics Compressor: estabiliza picos y valles de volumen para un dictado uniforme
        compressorNode = audioContext.createDynamicsCompressor();
        compressorNode.threshold.setValueAtTime(-24, audioContext.currentTime);
        compressorNode.knee.setValueAtTime(30, audioContext.currentTime);
        compressorNode.ratio.setValueAtTime(12, audioContext.currentTime);
        compressorNode.attack.setValueAtTime(0.003, audioContext.currentTime);
        compressorNode.release.setValueAtTime(0.25, audioContext.currentTime);

        // 5. Gain Node: normalización de volumen limpio
        gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(1.15, audioContext.currentTime);

        // 6. Analyser Node: Monitoreo acústico de RMS y detector de actividad vocal (VAD)
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.2;

        // 7. MediaStreamAudioDestinationNode: salida filtrada hacia MediaRecorder
        destinationNode = audioContext.createMediaStreamDestination();

        // Enlace de la cadena de procesamiento de audio en tiempo real
        audioSourceNode.connect(highpassNode);
        highpassNode.connect(bandpassNode);
        bandpassNode.connect(lowpassNode);
        lowpassNode.connect(compressorNode);
        compressorNode.connect(gainNode);
        gainNode.connect(analyserNode);
        gainNode.connect(destinationNode);

        // Bucle de Noise Gate Adaptativo en JavaScript (<0.1% CPU)
        const pcmBuffer = new Uint8Array(analyserNode.frequencyBinCount);
        if (noiseGateTimer) { clearInterval(noiseGateTimer); }
        noiseGateTimer = setInterval(() => {
            if (!analyserNode || !gainNode || !audioContext) return;
            analyserNode.getByteTimeDomainData(pcmBuffer);
            let sumSquares = 0;
            for (let i = 0; i < pcmBuffer.length; i++) {
                const norm = (pcmBuffer[i] - 128) / 128;
                sumSquares += norm * norm;
            }
            const rms = Math.sqrt(sumSquares / pcmBuffer.length);
            webAudioLastRMS = rms;

            // Seguimiento asimétrico del piso de ruido ambiental
            if (rms < webAudioNoiseFloor) {
                webAudioNoiseFloor = 0.90 * webAudioNoiseFloor + 0.10 * rms;
            } else {
                webAudioNoiseFloor = 0.998 * webAudioNoiseFloor + 0.002 * rms;
            }

            webAudioIsSpeech = (rms > webAudioNoiseFloor * 2.3) && (rms > 0.012);
            const targetGain = webAudioIsSpeech ? 1.25 : 0.05; // -28 dB atenuación en silencios

            const now = audioContext.currentTime;
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setTargetAtTime(targetGain, now, webAudioIsSpeech ? 0.015 : 0.08);
        }, 35);

        filteredMediaStream = destinationNode.stream;
        console.log("[WebAudio] Filtros Web Audio API activos: Bandpass + NoiseSuppression + EchoCancellation + AutoGainControl + Adaptive Noise Gate/VAD.");
        return filteredMediaStream;
    } catch (err) {
        console.error("[WebAudio] Error al configurar filtros Web Audio API:", err);
        return null;
    }
}

/**
 * Retorna las métricas acústicas en tiempo real del DSP de Web Audio
 */
export function getWebAudioDSPMetrics() {
    return {
        rms: Number(webAudioLastRMS.toFixed(4)),
        noiseFloor: Number(webAudioNoiseFloor.toFixed(4)),
        isSpeech: webAudioIsSpeech,
        snrDb: Number((20 * Math.log10(Math.max(1e-4, webAudioLastRMS / (webAudioNoiseFloor + 1e-6)))).toFixed(1))
    };
}

/**
 * Libera y desmantela los recursos de Web Audio API de forma asíncrona
 */
export function teardownWebAudio() {
    if (noiseGateTimer) {
        clearInterval(noiseGateTimer);
        noiseGateTimer = null;
    }

    try {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            try { mediaRecorder.stop(); } catch (e) {}
        }
    } catch (e) {}

    try {
        if (rawMediaStream) {
            rawMediaStream.getTracks().forEach(track => {
                try { track.stop(); } catch (e) {}
            });
            rawMediaStream = null;
        }
    } catch (e) {}

    try {
        if (filteredMediaStream) {
            filteredMediaStream.getTracks().forEach(track => {
                try { track.stop(); } catch (e) {}
            });
            filteredMediaStream = null;
        }
    } catch (e) {}

    try {
        if (audioSourceNode) { audioSourceNode.disconnect(); audioSourceNode = null; }
        if (highpassNode) { highpassNode.disconnect(); highpassNode = null; }
        if (bandpassNode) { bandpassNode.disconnect(); bandpassNode = null; }
        if (lowpassNode) { lowpassNode.disconnect(); lowpassNode = null; }
        if (compressorNode) { compressorNode.disconnect(); compressorNode = null; }
        if (gainNode) { gainNode.disconnect(); gainNode = null; }
        if (analyserNode) { analyserNode.disconnect(); analyserNode = null; }
        if (destinationNode) { destinationNode.disconnect(); destinationNode = null; }
    } catch (e) {}

    if (audioContext && audioContext.state !== 'closed') {
        try {
            audioContext.close().catch(() => {});
        } catch (e) {}
        audioContext = null;
    }
}

/**
 * CONEXIÓN CON LA API DE TRANSCRIPCIÓN RÁPIDA SIN LATENCIA (Groq Whisper LPU)
 * Transcribe un blob de audio procesado usando el modelo whisper-large-v3-turbo en ~250ms
 */
export async function transcribeAudioWithGroq(audioBlob) {
    if (!audioBlob || audioBlob.size === 0) {
        return "";
    }

    const apiKey = resolveGroqApiKey();
    if (!apiKey) {
        console.warn("[Groq Dictation] Sin API Key de Groq configurada.");
        return "";
    }

    const formData = new FormData();
    const fileName = audioBlob.type.includes('ogg') ? 'audio.ogg' : 'audio.webm';
    formData.append('file', audioBlob, fileName);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'es');
    formData.append('temperature', '0.0');
    formData.append('prompt', MEDICAL_WHISPER_PROMPT);

    console.log(`[Groq Dictation] Enviando audio filtrado (${(audioBlob.size / 1024).toFixed(1)} KB) a Groq Whisper LPU...`);

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`
        },
        body: formData
    });

    if (!response.ok) {
        const errorDetails = await response.text().catch(() => '');
        throw new Error(`Groq Whisper API error (${response.status}): ${errorDetails}`);
    }

    const data = await response.json();
    let transcript = (data.text || '').trim();

    // Filtro anti-alucinaciones acústicas
    const lower = transcript.toLowerCase();
    for (const phrase of WHISPER_HALLUCINATION_BLACKLIST) {
        if (lower.includes(phrase)) {
            console.warn(`[Groq Dictation] Alucinación bloqueada: "${transcript}"`);
            return "";
        }
    }

    return transcript;
}

/**
 * Transcribe un blob de audio e inyecta el resultado con formato médico
 */
export async function transcribeAudioBlob(audioBlob, targetInputId = null) {
    const inputId = targetInputId || currentTargetInputId;
    try {
        const rawText = await transcribeAudioWithGroq(audioBlob);
        if (!rawText) return "";

        const cleanText = applyMedicalCorrections(rawText);
        const commandExecuted = executeVoiceCommandIfMatches(cleanText);
        if (commandExecuted) return cleanText;

        if (inputId) {
            const targetInput = document.getElementById(inputId);
            if (targetInput) {
                insertTextIntoTarget(targetInput, cleanText);
            }
        }
        return cleanText;
    } catch (err) {
        console.error("[Groq Dictation] Error en transcripción rápida:", err);
        return "";
    }
}

/**
 * Inicializa el subsistema de dictáfono (SpeechRecognition nativo y Web Audio API)
 */
export function initDictaphone() {
    if (!('webkitSpeechRecognition' in window)) {
        console.log("[Dictaphone] webkitSpeechRecognition no disponible. Se utilizará Web Audio API + Groq Whisper LPU directo.");
        return true;
    }
    
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-PE';
    
    recognition.onstart = () => {
        isRecording = true;
        speechRecognitionReceivedFinal = false;
        console.log("[Dictaphone] Escuchando activamente...");
        updateUiState(true);
        showToast("Micrófono optimizado activo. Hable ahora...", "success");
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
            speechRecognitionReceivedFinal = true;
            let cleanText = applyMedicalCorrections(finalTranscript);
            const voiceCommandExecuted = executeVoiceCommandIfMatches(cleanText);
            if (voiceCommandExecuted) return;

            insertTextIntoTarget(targetInput, cleanText);
        }
    };
    
    recognition.onerror = (event) => {
        console.error("[Dictaphone] Error de reconocimiento:", event.error);
        if (event.error === 'not-allowed') {
            showToast("Acceso al micrófono denegado. Permítalo en su navegador.", "error");
        } else {
            showToast(`Estado de dictado: ${event.error}`, "info");
        }
        stopDictation();
    };
    
    recognition.onend = () => {
        isRecording = false;
        console.log("[Dictaphone] Reconocimiento en tiempo real finalizado.");
        updateUiState(false);
    };
    
    return true;
}

/**
 * Actualiza la apariencia visual del botón de dictado activo
 */
function updateUiState(recording) {
    if (!currentTargetInputId) return;
    const btn = document.getElementById(`btn_dictado_${currentTargetInputId}`);
    if (btn) {
        const icon = btn.querySelector('i');
        if (recording) {
            btn.classList.add('recording');
            if (icon) {
                icon.className = 'fa-solid fa-microphone fa-beat';
                icon.style.color = '#ef4444';
            }
        } else {
            btn.classList.remove('recording');
            if (icon) {
                icon.className = 'fa-solid fa-microphone';
                icon.style.color = '';
            }
        }
    }
}

/**
 * Inicia la sesión de dictado acelerada con filtros Web Audio API y Groq Whisper LPU
 */
export async function startDictation(targetInputId) {
    if (isRecording) {
        stopDictation();
        if (currentTargetInputId === targetInputId) {
            return;
        }
        // Espera mínima para reinicio fluido
        setTimeout(() => {
            startDictation(targetInputId);
        }, 150);
        return;
    }
    
    currentTargetInputId = targetInputId;

    // 1. Inicializar SpeechRecognition si no existe
    if (!recognition) {
        initDictaphone();
    }

    // 2. Iniciar Web Audio API y MediaRecorder para captura filtrada
    recordedAudioChunks = [];
    try {
        const filteredStream = await setupWebAudioFilters();
        if (filteredStream && window.MediaRecorder) {
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
            
            const options = mimeType ? { mimeType } : undefined;
            mediaRecorder = new MediaRecorder(filteredStream, options);
            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    recordedAudioChunks.push(e.data);
                }
            };
            mediaRecorder.onstop = async () => {
                // Si SpeechRecognition no capturó texto final o no está soportado, Groq Whisper entra como acelerador
                if (!speechRecognitionReceivedFinal && recordedAudioChunks.length > 0) {
                    const audioBlob = new Blob(recordedAudioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
                    if (audioBlob.size > 1200) {
                        try {
                            showToast("Procesando con Groq LPU...", "info");
                            await transcribeAudioBlob(audioBlob, targetInputId);
                        } catch (e) {
                            console.warn("[Dictaphone] Fallback Groq error:", e);
                        }
                    }
                }
                teardownWebAudio();
            };
            mediaRecorder.start(250); // Genera fragmentos cada 250ms
        }
    } catch (err) {
        console.warn("[Dictaphone] Aviso al configurar MediaRecorder:", err);
    }

    // 3. Iniciar reconocimiento en vivo con zero latencia
    if (recognition) {
        try {
            recognition.start();
        } catch (err) {
            console.warn("[Dictaphone] Error al iniciar webkitSpeechRecognition:", err);
            isRecording = true;
            updateUiState(true);
        }
    } else {
        isRecording = true;
        updateUiState(true);
        showToast("Grabando con filtros Web Audio API...", "info");
    }
}

/**
 * Detiene la sesión de dictado y procesa el audio acumulado
 */
export function stopDictation() {
    isRecording = false;
    updateUiState(false);

    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {}
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
            mediaRecorder.stop();
        } catch (e) {}
    } else {
        teardownWebAudio();
    }

    showToast("Micrófono desactivado.", "info");
}

/**
 * Transcripción rápida de respaldo con Groq Whisper LPU
 */
export async function fallbackGroqDictation(audioBlob) {
    console.log("[Dictaphone] Enviando fragmento a Groq API Whisper LPU...");
    try {
        const text = await transcribeAudioWithGroq(audioBlob);
        return applyMedicalCorrections(text);
    } catch (err) {
        console.error("[Dictaphone] Error en fallback Groq:", err);
        return "";
    }
}

/**
 * Helpers para diagnóstico y consulta de estado
 */
export function isDictaphoneRecording() {
    return isRecording;
}

export function getAudioContext() {
    return audioContext;
}
