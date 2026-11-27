/* ────────────────────────────────────────────────────────────────
   Cortana Mini‑Consola Flotante (Versión Perenne Zero-Loss)
   Tamaño: 245 × 195 px
   Botón flotante: esquina inferior‑derecha (con persistencia en localStorage)
   Funcionalidades:
     • Arrastrable (manejador de encabezado)
     • Entrada de texto + botón “Enviar”
     • Botón micrófono (Web Speech Recognition, es‑PE)
     • Botón TTS toggle (SpeechSynthesis)
     • Comunicación fetch POST → http://127.0.0.1:8799/api/conversar
     • Persistencia completa de posición, estado (abierto/minimizado) e historial de chat vía localStorage
   ──────────────────────────────────────────────────────────────── */
(() => {
    // Abort if already injected
    if (document.getElementById('cortanaFloatWindow')) return;

    // ---------- Config ----------
    const API_URL = 'http://127.0.0.1:8799/api/conversar';
    const WIDTH = 245;
    const HEIGHT = 195;
    const Z_INDEX = 9999;
    const LANG = 'es-PE';
    const STORAGE_KEY = 'cortana_krypton_perenne_state_v1';

    // ---------- Load Persisted State ----------
    let savedState = {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) savedState = JSON.parse(raw);
    } catch (e) {
        savedState = {};
    }

    // ---------- State ----------
    let ttsEnabled = savedState.ttsEnabled || false;
    let isMinimized = savedState.isMinimized || false;
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let chatHistory = Array.isArray(savedState.chatHistory) ? savedState.chatHistory : [
        { author: 'bot', text: 'Hola Dr. Castillo. Cortana en línea.' }
    ];

    // ---------- Helper ----------
    const createEl = (tag, props = {}, children = []) => {
        const el = document.createElement(tag);
        Object.entries(props).forEach(([k, v]) => {
            if (k === 'style') Object.assign(el.style, v);
            else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
            else el.setAttribute(k, v);
        });
        children.forEach(ch => el.appendChild(ch));
        return el;
    };

    const saveStateToStorage = () => {
        try {
            const stateToSave = {
                left: container.style.left || `${window.innerWidth - WIDTH - 20}px`,
                top: container.style.top || `${window.innerHeight - HEIGHT - 20}px`,
                isMinimized,
                ttsEnabled,
                chatHistory: chatHistory.slice(-50) // Mantener últimos 50 mensajes para evitar saturar localStorage
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (e) {
            // Fallback silencioso si localStorage está bloqueado
        }
    };

    const appendMessage = (author, text, save = true) => {
        if (save) {
            chatHistory.push({ author, text });
            saveStateToStorage();
        }
        const msg = createEl('div', {
            style: {
                margin: '4px 0',
                color: author === 'user' ? '#0284c7' : '#0f172a',
                wordBreak: 'break-word',
                fontSize: '12px'
            }
        }, [document.createTextNode(text)]);
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const speak = txt => {
        if (!ttsEnabled) return;
        const utter = new SpeechSynthesisUtterance(txt);
        utter.lang = LANG;
        speechSynthesis.speak(utter);
    };

    // ---------- Speech Recognition ----------
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = SpeechRec ? new SpeechRec() : null;
    if (recognizer) {
        recognizer.lang = LANG;
        recognizer.interimResults = false;
        recognizer.maxAlternatives = 1;
        recognizer.onresult = e => {
            const transcript = e.results[0][0].transcript.trim();
            inputField.value = transcript;
            inputField.focus();
        };
        recognizer.onerror = () => {/* silent fail */};
    }

    // ---------- UI Construction ----------
    let minimizeBtn;

    const container = createEl('div', {
        id: 'cortanaFloatWindow',
        style: {
            position: 'fixed',
            left: savedState.left || `${window.innerWidth - WIDTH - 20}px`,
            top: savedState.top || `${window.innerHeight - HEIGHT - 20}px`,
            width: `${WIDTH}px`,
            height: isMinimized ? '28px' : `${HEIGHT}px`,
            background: '#fafafa',
            border: '1px solid #0284c7',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, Arial, Helvetica, sans-serif',
            fontSize: '13px',
            zIndex: Z_INDEX,
            overflow: 'hidden',
            userSelect: 'none',
            transition: 'height 0.2s ease'
        }
    });

    const chatBox = createEl('div', {
        id: 'cortanaChat',
        style: {
            flex: '1',
            padding: '6px',
            overflowY: 'auto',
            background: '#ffffff'
        }
    });

    const inputField = createEl('input', {
        id: 'cortanaInput',
        type: 'text',
        placeholder: 'Escribe consulta clínica...',
        style: {
            flex: '1',
            border: '1px solid #cbd5e1',
            borderRadius: '3px',
            padding: '3px 6px',
            marginRight: '3px',
            fontSize: '12px',
            outline: 'none'
        },
        onkeydown: e => {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        }
    });

    const sendBtn = createEl('button', {
        id: 'cortanaSendBtn',
        type: 'button',
        style: {
            border: 'none',
            background: '#0284c7',
            color: '#fff',
            borderRadius: '3px',
            padding: '3px 8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
        },
        onclick: () => {
            const txt = inputField.value.trim();
            if (!txt) return;
            appendMessage('user', txt);
            inputField.value = '';
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensaje: txt })
            })
                .then(r => r.json())
                .then(d => {
                    const resp = d.respuesta ?? '[sin respuesta]';
                    appendMessage('bot', resp);
                    speak(resp);
                })
                .catch(() => appendMessage('bot', '[error de comunicación con núcleo FastAPI]'));
        }
    }, [document.createTextNode('Enviar')]);

    const micBtn = createEl('button', {
        id: 'cortanaMicBtn',
        type: 'button',
        style: {
            border: 'none',
            background: '#10b981',
            color: '#fff',
            borderRadius: '3px',
            padding: '3px 6px',
            cursor: 'pointer',
            fontSize: '12px',
            marginLeft: '2px'
        },
        title: 'Dictado por voz',
        onclick: () => {
            if (!recognizer) return;
            recognizer.start();
        }
    }, [document.createTextNode('🎤')]);

    const ttsBtn = createEl('button', {
        id: 'cortanaTtsBtn',
        type: 'button',
        style: {
            border: 'none',
            background: '#f59e0b',
            color: '#0f172a',
            borderRadius: '3px',
            padding: '3px 6px',
            cursor: 'pointer',
            fontSize: '12px',
            marginLeft: '2px',
            fontWeight: 'bold'
        },
        title: 'Toggle TTS',
        onclick: () => {
            ttsEnabled = !ttsEnabled;
            ttsBtn.textContent = ttsEnabled ? '🔊' : '🔈';
            saveStateToStorage();
        }
    }, [document.createTextNode(ttsEnabled ? '🔊' : '🔈')]);

    const inputWrapper = createEl('div', {
        style: {
            display: 'flex',
            padding: '6px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc'
        }
    }, [inputField, sendBtn, micBtn, ttsBtn]);

    const bodyWrapper = createEl('div', {
        style: {
            display: isMinimized ? 'none' : 'flex',
            flexDirection: 'column',
            flex: '1',
            overflow: 'hidden'
        }
    }, [chatBox, inputWrapper]);

    minimizeBtn = createEl('span', {}, [document.createTextNode(isMinimized ? '🗖' : '🗕')]);

    const header = createEl('div', {
        id: 'cortanaHeader',
        style: {
            background: '#0f172a',
            color: '#f8fafc',
            padding: '5px 8px',
            cursor: 'move',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px'
        },
        onmousedown: e => {
            isDragging = true;
            const rect = container.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            e.preventDefault();
        }
    }, [
        document.createTextNode('Cortana Concierge'),
        createEl('span', {
            style: { cursor: 'pointer', fontSize: '11px', padding: '0 4px' },
            onclick: e => {
                e.stopPropagation();
                isMinimized = !isMinimized;
                container.style.height = isMinimized ? '28px' : `${HEIGHT}px`;
                bodyWrapper.style.display = isMinimized ? 'none' : 'flex';
                minimizeBtn.textContent = isMinimized ? '🗖' : '🗕';
                saveStateToStorage();
            }
        }, [minimizeBtn])
    ]);

    // Assemble Container
    container.appendChild(header);
    container.appendChild(bodyWrapper);
    document.body.appendChild(container);

    // Render historical messages without re-saving
    chatHistory.forEach(item => {
        appendMessage(item.author, item.text, false);
    });

    // ---------- Drag Logic ----------
    const onMouseMove = e => {
        if (!isDragging) return;
        const left = e.clientX - dragOffsetX;
        const top = e.clientY - dragOffsetY;
        
        // Limitar dentro del viewport para evitar pérdida del widget
        const maxLeft = window.innerWidth - WIDTH;
        const maxTop = window.innerHeight - 40;
        
        const boundedLeft = Math.max(0, Math.min(left, maxLeft));
        const boundedTop = Math.max(0, Math.min(top, maxTop));

        container.style.left = `${boundedLeft}px`;
        container.style.top = `${boundedTop}px`;
        container.style.right = 'auto';
        container.style.bottom = 'auto';
    };

    const onMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            saveStateToStorage();
        }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
})();
