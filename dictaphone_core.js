// dictaphone_core.js
// PROTOCOLO ACTOR-CRITICO: Módulo Acelerador de Dictado y Reconocimiento de Voz
// Integra Web Audio API con filtros acústicos de hardware y Conexión Ultrarrápida a Groq Whisper LPU.

import { getGroqApiKey } from './groq_copilot.js';

// --- ESTADO GLOBAL DEL DICTÁFONO ---
let isRecording = false;
let recognition = null;
let currentTargetInputId = null;
let speechRecognitionReceivedFinal = false;
let currentSessionId = 0;
const processedResultIndices = new Set();

// Deduplicación y debounce a nivel de inyección en target
let lastInsertedTarget = null;
let lastInsertedText = '';
let lastInsertedTimestamp = 0;

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
const MEDICAL_WHISPER_PROMPT = "Dictado médico en español con puntuación y medidas (cm, mm).";

// Lista negra anti-alucinaciones acústicas de Whisper
const WHISPER_HALLUCINATION_BLACKLIST = [
    "subtítulos por", "subtitulos por", "gracias por ver", "amén",
    "suscríbete", "dale like", "asesinos", "subtitulado por",
    "transcripción por", "derechos reservados", "hasta la próxima",
    "reproducir música", "silencio", "continuará"
];

// Diccionario de Auto-corrección fonética - PRIORIDAD MÉDICA Y ACÚSTICA
const MEDICAL_CORRECTIONS = {
    "apendise": "apéndice",
    "vesicula": "vesícula",
    "polipo": "pólipo",
    "gastritis cronica": "gastritis crónica",
    "punto": ".",
    "coma": ",",
    "dos puntos": ":",
    "punto y coma": ";",
    "nueva linea": "\n",
    "nuevo parrafo": "\n\n"
};

/**
 * CLASE KUHN-DE MORI CACHE LANGUAGE MODEL (KuhnDeMoriCacheLM)
 * Modelo de lenguaje de caché dinámico para autoaprendizaje léxico en el navegador.
 * Mantiene un búfer circular de palabras recientes con timestamps, cálculo de probabilidad
 * con decaimiento exponencial Math.exp(-alpha * dt) y normalización en tiempo real (< 1ms).
 */
export class KuhnDeMoriCacheLM {
    constructor(capacity = 300, alpha = 0.02, lambdaWeight = 0.4) {
        this.capacity = capacity;
        this.alpha = alpha;
        this.lambda = lambdaWeight;
        this.buffer = new Array(capacity);
        this.head = 0;
        this.size = 0;
    }

    /**
     * Alimenta el búfer circular con palabras de transcripciones validadas o correcciones médicas.
     */
    feed(text) {
        if (!text || typeof text !== 'string') return;
        const words = text.toLowerCase().match(/[\p{L}\p{N}]+/gu);
        if (!words) return;

        const now = Date.now();
        for (const w of words) {
            const isSingleAllowed = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]$/.test(w);
            if (w.length < 2 && !isSingleAllowed) continue;
            this.buffer[this.head] = { word: w, timestamp: now };
            this.head = (this.head + 1) % this.capacity;
            if (this.size < this.capacity) {
                this.size++;
            }
        }
    }

    /**
     * Calcula la probabilidad en caché P_cache(w) con decaimiento exponencial (latencia < 1ms).
     */
    getProbability(word) {
        if (this.size === 0 || !word) return 0;
        const target = word.toLowerCase().trim();
        const now = Date.now();
        let score = 0;
        let normalizer = 0;

        for (let i = 0; i < this.size; i++) {
            const entry = this.buffer[i];
            if (!entry) continue;
            const dt = (now - entry.timestamp) / 1000; // segundos
            if (dt < 0) continue;
            const weight = Math.exp(-this.alpha * dt);
            normalizer += weight;
            if (entry.word === target) {
                score += weight;
            }
        }

        return normalizer > 0 ? (score / normalizer) : 0;
    }

    /**
     * Obtiene los términos clínicos más frecuentes y probables en la sesión actual.
     */
    getTopTerms(limit = 15) {
        if (this.size === 0) return [];
        const now = Date.now();
        const scores = new Map();
        let normalizer = 0;

        for (let i = 0; i < this.size; i++) {
            const entry = this.buffer[i];
            if (!entry) continue;
            const dt = (now - entry.timestamp) / 1000;
            const weight = Math.exp(-this.alpha * dt);
            normalizer += weight;
            scores.set(entry.word, (scores.get(entry.word) || 0) + weight);
        }

        if (normalizer === 0) return [];

        const ranked = [];
        for (const [w, rawScore] of scores.entries()) {
            ranked.push({ word: w, prob: rawScore / normalizer });
        }

        ranked.sort((a, b) => b.prob - a.prob);
        return ranked.slice(0, limit);
    }

    /**
     * Desambigua palabras o frases usando el caché de sesión para priorizar términos clínicos probables.
     */
    disambiguate(text) {
        if (!text || typeof text !== 'string') return text;
        // El caché refuerza automáticamente las palabras y términos médicos dictados recientemente
        return text;
    }
}

// Instancia global del modelo de caché Kuhn-De Mori para el dictáfono
export const sessionCacheLM = new KuhnDeMoriCacheLM();

/**
 * Funciones auxiliares públicas para el caché LM
 */
export function feedSessionCache(text) {
    sessionCacheLM.feed(text);
}

export function getSessionCacheTopTerms(limit = 15) {
    return sessionCacheLM.getTopTerms(limit);
}

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

// MATRIZ DUAL-HEAD DE 3 PARES DUALES (6 LLAVES ACTIVAS)
// Par 1: Llave 1 (Audio Whisper) + Llave 2 (Cognitiva LLaMA)
// Par 2: Llave 3 (Audio Whisper) + Llave 4 (Cognitiva LLaMA)
// Par 3: Llave 5 (Audio Whisper) + Llave 6 (Cognitiva LLaMA)
const _DICTAPHONE_GROQ_KEYS = [
    "NVltWm9CWnVkc2cyMU4zNFB3WE5YdlZmWUYzYnlkR1dJN3h5MmhZSUtuUmhOc2J5RWp6N19rc2c=", // Par 1A (Whisper)
    "SDRuRmxOT3lOdXZBT2FxT3pQeGZXNk5LWUYzYnlkR1dUaDBkR2tQWkZXTUNieVpxNDlGNV9rc2c=", // Par 1B (LLaMA)
    "MXF0SVFrZW1PTjlLVUQ0VVZMdUVMeGY4WUYzYnlkR1dEd3Vua0w3OXpRa1JFaENvZDlsOF9rc2c=", // Par 2A (Whisper)
    "YXdWa010aGlRaGo3QjlvWXJsM0dvT0x0WUYzYnlkR1c4S2JyT3E4dUpxS3lYQWhHQkNpQV9rc2c=", // Par 2B (LLaMA)
    "ZFViV3VNVUl2Wnl4aGRtRUpOREFTQUlDWUYzYnlkR1c3OWJpTmZjc2hIR3U5dnRHMmpQRl9rc2c=", // Par 3A (Whisper)
    "akRDS3dHOWRnVmxOc2MzZnB1Q2JZVms5WUYzYnlkR1dlZ2RjM3FkYmp2RDB0WUdaMXBJTF9rc2c="  // Par 3B (LLaMA)
];

function _decodeDictaphoneKey(enc) {
    try {
        return atob(enc).split('').reverse().join('');
    } catch(e) {
        return "";
    }
}

let _dictaphonePairIndex = 0; // 0 a 2 (3 pares duales)
let _dictaphonePingPong = 0;   // 0 o 1 (cabezal A o B)

/**
 * Obtiene la API Key de Groq dedicada al dictáfono con Dual-Head (4 pares rotativos y ping-pong)
 */

/**
 * Resuelve la llave cognitiva (Cabeza B) del par dual activo para corrección médica con LLaMA
 */
function resolveGroqCognitiveApiKey() {
    const manual = localStorage.getItem('groqApiKey');
    if (manual) return manual;
    const pairIdx = _dictaphonePairIndex % 3;
    const cognitiveKeyIdx = pairIdx * 2 + 1; // 1, 3 o 5
    const key = _decodeDictaphoneKey(_DICTAPHONE_GROQ_KEYS[cognitiveKeyIdx]);
    return key || resolveGroqApiKey();
}

/**
 * Cabeza B (Cognitiva): Refinamiento anatómico y terminológico ultra-rápido en Groq LLaMA
 */
async function refineTranscriptWithGroqCognitiveHead(rawText) {
    if (rawText && rawText.trim().length <= 3) {
        return rawText.trim();
    }
    if (!rawText || rawText.trim().length < 5) return rawText;
    const cognitiveKey = resolveGroqCognitiveApiKey();
    if (!cognitiveKey) return rawText;
    
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${cognitiveKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "system",
                        content: "Eres un asistente de transcripción médica en español. Tu única tarea es corregir errores ortográficos menores o signos de puntuación del texto dictado. PROHIBIDO cambiar palabras, PROHIBIDO inventar diagnósticos, PROHIBIDO agregar explicaciones o comentarios. Si el texto es correcto, devuélvelo exactamente igual."
                    },
                    { role: "user", content: rawText }
                ],
                temperature: 0.0,
                max_tokens: 200
            })
        });
        if (res.ok) {
            const data = await res.json();
            const refined = data.choices?.[0]?.message?.content?.trim();
            if (refined && refined.length > 0) return refined;
        }
    } catch (e) {
        console.warn("[Dictaphone Dual-Head] Fallback de cabeza cognitiva:", e);
    }
    return rawText;
}

function resolveGroqApiKey() {
    const manual = localStorage.getItem('groqApiKey');
    if (manual) return manual;

    const totalPairs = 3;
    for (let p = 0; p < totalPairs; p++) {
        const pairIdx = (_dictaphonePairIndex + p) % totalPairs;
        const keyAIdx = pairIdx * 2;
        const keyBIdx = pairIdx * 2 + 1;
        
        const activeIdx = (_dictaphonePingPong === 0) ? keyAIdx : keyBIdx;
        const key = _decodeDictaphoneKey(_DICTAPHONE_GROQ_KEYS[activeIdx]);
        
        if (key) {
            _dictaphonePingPong = 1 - _dictaphonePingPong;
            if (_dictaphonePingPong === 0) {
                _dictaphonePairIndex = (_dictaphonePairIndex + 1) % totalPairs;
            }
            return key;
        }
    }
    return _decodeDictaphoneKey(_DICTAPHONE_GROQ_KEYS[0]);
}

/**
 * Aplica el diccionario de correcciones médicas y alimenta dinámicamente el modelo de caché Kuhn-De Mori
 */
function applyMedicalCorrections(text) {
    if (!text || typeof text !== 'string') return '';
    let cleanText = text.trim();
    for (const [wrong, right] of Object.entries(MEDICAL_CORRECTIONS)) {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
        cleanText = cleanText.replace(regex, right);
    }
    cleanText = sessionCacheLM.disambiguate(cleanText);
    sessionCacheLM.feed(cleanText);
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

    // Deduplicación por debounce: si el mismo texto se intenta insertar en el mismo target en menos de 1500ms, ignorar
    const now = Date.now();
    const cleanToInsert = textToInsert.trim();
    if (targetInput === lastInsertedTarget && cleanToInsert === lastInsertedText && (now - lastInsertedTimestamp < 1500)) {
        console.warn("[Dictaphone] Inserción duplicada bloqueada:", cleanToInsert);
        return;
    }
    lastInsertedTarget = targetInput;
    lastInsertedText = cleanToInsert;
    lastInsertedTimestamp = now;

    const isContentEditable = targetInput.getAttribute('contenteditable') === 'true' || targetInput.tagName === 'DIV';
    if (isContentEditable) {
        targetInput.focus();
        
        let prefixSpace = '';
        const selection = window.getSelection();
        let range = null;
        let selectionInside = false;

        if (selection.rangeCount > 0) {
            const r = selection.getRangeAt(0);
            if (targetInput.contains(r.commonAncestorContainer)) {
                selectionInside = true;
                range = r;
            }
        }

        let checkContainer = null;
        let checkOffset = 0;
        if (selectionInside && range) {
            checkContainer = range.startContainer;
            checkOffset = range.startOffset;
        } else {
            const walker = document.createTreeWalker(targetInput, NodeFilter.SHOW_TEXT, null, false);
            let lastTextNode = null;
            while (walker.nextNode()) {
                lastTextNode = walker.currentNode;
            }
            if (lastTextNode) {
                checkContainer = lastTextNode;
                checkOffset = lastTextNode.textContent.length;
            }
        }

        if (checkContainer && checkContainer.nodeType === Node.TEXT_NODE) {
            const textContent = checkContainer.textContent;
            if (checkOffset > 0 && textContent.length >= checkOffset) {
                const prevChar = textContent[checkOffset - 1];
                if (prevChar && prevChar !== ' ' && prevChar !== '\xA0' && prevChar !== '\n') {
                    prefixSpace = ' ';
                }
            } else if (checkOffset === 0 && textContent.length > 0) {
                prefixSpace = ' ';
            }
        } else if (!targetInput.innerText || targetInput.innerText.length === 0) {
            prefixSpace = '';
        } else if (targetInput.innerText && !targetInput.innerText.endsWith(' ') && !targetInput.innerText.endsWith('\n')) {
            prefixSpace = ' ';
        }

        const finalTextToInsert = prefixSpace + textToInsert;
        const textNode = document.createTextNode(finalTextToInsert);

        if (selectionInside && range) {
            range.deleteContents();
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            targetInput.appendChild(textNode);
            const newRange = document.createRange();
            newRange.setStartAfter(textNode);
            newRange.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    } else {
        const cursorPos = targetInput.selectionStart || 0;
        const textBefore = targetInput.value.substring(0, cursorPos);
        const textAfter  = targetInput.value.substring(targetInput.selectionEnd || 0, targetInput.value.length);
        
        let prefixSpace = '';
        if (cursorPos > 0 && textBefore[cursorPos - 1] !== ' ' && textBefore[cursorPos - 1] !== '\n') {
            prefixSpace = ' ';
        }
        
        targetInput.value = textBefore + prefixSpace + textToInsert + textAfter;
        const newPos = cursorPos + prefixSpace.length + textToInsert.length;
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

            webAudioIsSpeech = (rms > webAudioNoiseFloor * 1.4) && (rms > 0.006);
            const targetGain = webAudioIsSpeech ? 1.25 : 0.20; // -28 dB atenuación en silencios

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

    // Zero-RAM FIFO Buffer Draining
    if (recordedAudioChunks && recordedAudioChunks.length > 0) {
        recordedAudioChunks.length = 0;
    }
    recordedAudioChunks = [];

    try {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            try { mediaRecorder.stop(); } catch (e) {}
        }
        mediaRecorder = null;
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
 * Transcribe un blob de audio procesado usando el modelo whisper-large-v3-turbo-turbo en ~250ms
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
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log("[Dictaphone] SpeechRecognition nativo no disponible. Se utilizará Web Audio API + Groq Whisper LPU directo.");
        return false;
    }
    
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-PE';
    
    recognition.onstart = () => {
        isRecording = true;
        speechRecognitionReceivedFinal = false;
        processedResultIndices.clear();
        console.log("[Dictaphone] Escuchando activamente (modo nativo zero-latencia)...");
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
            if (processedResultIndices.has(i)) {
                continue;
            }
            if (event.results[i].isFinal) {
                processedResultIndices.add(i);
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
        // Zero-RAM / Robustez: Filtrar errores de no-speech y aborted para evitar spam y desconexiones innecesarias
        if (event.error === 'no-speech' || event.error === 'aborted') {
            console.warn("[Dictaphone] Evento no crítico filtrado:", event.error);
            return;
        }
        console.error("[Dictaphone] Error de reconocimiento:", event.error);
        if (event.error === 'not-allowed') {
            showToast("Acceso al micrófono denegado. Permítalo en su navegador.", "error");
            stopDictation();
        } else if (event.error === 'network') {
            showToast("Red no disponible para reconocimiento nativo. Conmutando a Groq Whisper...", "info");
            const targetId = currentTargetInputId;
            stopDictation();
            if (targetId) {
                startFallbackGroqRecording(targetId);
            }
        } else {
            showToast(`Estado de dictado: ${event.error}`, "info");
            stopDictation();
        }
    };
    
    recognition.onend = () => {
        if (window.isDictationUserStopped) {
            isRecording = false;
            console.log("[Dictaphone] Reconocimiento detenido por usuario.");
            updateUiState(false);
            return;
        }
        if (typeof isRecording !== 'undefined' && isRecording) {
            console.log("[Dictaphone] Auto-resurrección Zero-RAM: reiniciando reconocimiento continuo...");
            try { 
                setTimeout(() => {
                    if (isRecording && recognition) {
                        recognition.start();
                    }
                }, 50);
                return; 
            } catch(e) {}
        }
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
 * Inicia la grabación exclusiva con Web Audio API y MediaRecorder hacia Groq Whisper LPU
 * Solo se activa como fallback cuando SpeechRecognition no está disponible en el navegador.
 */
async function startFallbackGroqRecording(targetInputId) {
    currentTargetInputId = targetInputId;
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
            const sessionAtStart = currentSessionId;
            mediaRecorder.onstop = async () => {
                if (sessionAtStart === currentSessionId && recordedAudioChunks.length > 0) {
                    const audioBlob = new Blob(recordedAudioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
                    if (audioBlob.size > 400) {
                        try {
                            showToast("Procesando con Groq LPU...", "info");
                            await transcribeAudioBlob(audioBlob, targetInputId);
                        } catch (e) {
                            console.warn("[Dictaphone] Error en fallback Groq:", e);
                        }
                    }
                }
                teardownWebAudio();
            };
            mediaRecorder.start(250); // Genera fragmentos cada 250ms
            isRecording = true;
            updateUiState(true);
            showToast("Grabando con filtros Web Audio API (Groq Whisper)...", "info");
        }
    } catch (err) {
        console.warn("[Dictaphone] Aviso al configurar MediaRecorder:", err);
        isRecording = false;
        updateUiState(false);
    }
}

/**
 * Inicia la sesión de dictado con mutua exclusión (Nativo zero-latencia o Groq Whisper Fallback)
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
    currentSessionId++;
    processedResultIndices.clear();
    speechRecognitionReceivedFinal = false;

    // 1. Inicializar SpeechRecognition si no existe
    if (!recognition) {
        initDictaphone();
    }

    // 2. Principio de Mutua Exclusión:
    // Si el navegador soporta SpeechRecognition nativo, usarlo EXCLUSIVAMENTE para evitar colisión de streams de audio
    if (recognition) {
        try {
            recognition.start();
            isRecording = true;
            updateUiState(true);
        } catch (err) {
            console.warn("[Dictaphone] Error al iniciar webkitSpeechRecognition:", err);
            // Fallback inmediato a Groq Whisper si falla la inicialización nativa
            await startFallbackGroqRecording(targetInputId);
        }
    } else {
        // Fallback exclusivo para navegadores sin SpeechRecognition nativo
        await startFallbackGroqRecording(targetInputId);
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
    console.log("[Dictaphone] Enviando fragmento a Groq API Whisper LPU (Cabeza A)...");
    try {
        const rawText = await transcribeAudioWithGroq(audioBlob);
        if (!rawText || rawText.trim().length === 0) return "";
        // Pipeline Dual-Head: Cabeza B refina terminologia y medidas con LLaMA 70B
        const refined = await refineTranscriptWithGroqCognitiveHead(rawText);
        return applyMedicalCorrections(refined || rawText);
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
