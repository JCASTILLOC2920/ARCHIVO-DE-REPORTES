/* ────────────────────────────────────────────────────────────────
   Cortana Mini‑Consola Flotante (Versión Perenne Zero-Loss - Rediseño v12.0 Óptimo)
   Autoridad: Dr. José Castillo | JC Path Lab
   Tamaño expandido: 480 × 420 px
   Botón flotante: esquina inferior‑derecha (con persistencia en localStorage)
   Funcionalidades:
     • Arrastrable (manejador de encabezado con límites de viewport)
     • Avatar holográfico animado circular en la cabecera con pulso de ondas de voz y estado activo de locución
     • Entrada de texto + botón “Enviar” (con soporte Enter)
     • Botón micrófono (Web Speech Recognition, es‑PE) con manejo robusto de errores y referencias seguras
     • Botón TTS toggle (SpeechSynthesis) con animación integrada en el avatar holográfico
     • Comunicación fetch POST → http://127.0.0.1:8799/api/conversar
     • Persistencia completa de posición, estado (abierto/minimizado) e historial de chat vía localStorage
     • Corrección integral del Red-Team: referencias de variables ordenadas, prevención de memory leaks, manejo de clases nativas y estilos optimizados.
   ──────────────────────────────────────────────────────────────── */
(() => {
    // Abort if already injected
    if (document.getElementById('cortanaFloatWindow')) return;

    // ---------- Config ----------
    const API_URL = 'http://127.0.0.1:8799/api/conversar';
    const WIDTH = 480;
    const HEIGHT = 420;
    const Z_INDEX = 9999;
    const LANG = 'es-PE';
    const STORAGE_KEY = 'cortana_krypton_perenne_state_v12';

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
        { author: 'bot', text: 'Hola Dr. Castillo. Cortana en línea, lista para asistir en el portal.' }
    ];

    // ---------- Inject Holographic Styles ----------
    const styleTag = document.createElement('style');
    styleTag.id = 'cortanaHologramStyles';
    styleTag.textContent = `
        @keyframes cortanaPulse {
            0% { box-shadow: 0 0 0 0 rgba(2, 132, 199, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(2, 132, 199, 0); }
            100% { box-shadow: 0 0 0 0 rgba(2, 132, 199, 0); }
        }
        @keyframes cortanaSpeakPulse {
            0% { transform: scale(1); border-color: #38bdf8; }
            50% { transform: scale(1.08); border-color: #10b981; box-shadow: 0 0 12px #10b981; }
            100% { transform: scale(1); border-color: #38bdf8; }
        }
        .cortana-avatar-glow {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0284c7, #0f172a);
            border: 2px solid #38bdf8;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #f8fafc;
            font-size: 14px;
            font-weight: bold;
            animation: cortanaPulse 2s infinite;
            flex-shrink: 0;
        }
        .cortana-avatar-speaking {
            animation: cortanaSpeakPulse 1s infinite ease-in-out !important;
        }
        #cortanaChat::-webkit-scrollbar {
            width: 5px;
        }
        #cortanaChat::-webkit-scrollbar-track {
            background: #0f172a;
        }
        #cortanaChat::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 4px;
        }
        #cortanaChat::-webkit-scrollbar-thumb:hover {
            background: #0284c7;
        }
    `;
    document.head.appendChild(styleTag);

    // ---------- Helper ----------
    const createEl = (tag, props = {}, children = []) => {
        const el = document.createElement(tag);
        Object.entries(props).forEach(([k, v]) => {
            if (k === 'style') Object.assign(el.style, v);
            else if (k === 'class' || k === 'className') el.className = v;
            else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
            else el.setAttribute(k, v);
        });
        children.forEach(ch => el.appendChild(ch));
        return el;
    };

    // Forward declaration of container for state saving
    let container;

    const saveStateToStorage = () => {
        try {
            const stateToSave = {
                left: container ? container.style.left : `${window.innerWidth - WIDTH - 20}px`,
                top: container ? container.style.top : `${window.innerHeight - HEIGHT - 20}px`,
                isMinimized,
                ttsEnabled,
                chatHistory: chatHistory.slice(-50)
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (e) {
            // Fallback silencioso si localStorage está bloqueado
        }
    };

    const avatarIconRef = document.createElement('div');
    avatarIconRef.className = 'cortana-avatar-glow';
    avatarIconRef.innerHTML = '💎';

    const setAvatarSpeaking = (speaking) => {
        if (!avatarIconRef) return;
        if (speaking) {
            avatarIconRef.classList.add('cortana-avatar-speaking');
        } else {
            avatarIconRef.classList.remove('cortana-avatar-speaking');
        }
    };

    // References for DOM elements used across scopes
    let chatBox, inputField, sendBtn, micBtn, ttsBtn, minimizeBtn, bodyWrapper;

    const appendMessage = (author, text, save = true) => {
        if (save) {
            chatHistory.push({ author, text });
            saveStateToStorage();
        }

        const isUser = author === 'user';
        const bubble = createEl('div', {
            style: {
                maxWidth: '82%',
                padding: '10px 14px',
                borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: isUser ? '#0284c7' : '#1e293b',
                color: '#f8fafc',
                fontSize: '13px',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }
        }, [document.createTextNode(text)]);

        const row = createEl('div', {
            style: {
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                margin: '8px 0',
                width: '100%'
            }
        }, [bubble]);

        if (chatBox) {
            chatBox.appendChild(row);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    };

    const speak = txt => {
        if (!ttsEnabled) return;
        if (!('speechSynthesis' in window)) return;
        
        try {
            speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(txt);
            utter.lang = LANG;
            
            utter.onstart = () => setAvatarSpeaking(true);
            utter.onend = () => setAvatarSpeaking(false);
            utter.onerror = () => setAvatarSpeaking(false);
            
            speechSynthesis.speak(utter);
        } catch (e) {
            setAvatarSpeaking(false);
        }
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
            if (inputField) {
                inputField.value = transcript;
                inputField.focus();
            }
        };
        recognizer.onerror = () => { setAvatarSpeaking(false); };
    }

    // ---------- UI Construction ----------
    container = createEl('div', {
        id: 'cortanaFloatWindow',
        style: {
            position: 'fixed',
            left: savedState.left || `${window.innerWidth - WIDTH - 20}px`,
            top: savedState.top || `${window.innerHeight - HEIGHT - 20}px`,
            width: `${WIDTH}px`,
            height: isMinimized ? '44px' : `${HEIGHT}px`,
            background: '#0b1120',
            border: '1px solid #0284c7',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(2, 132, 199, 0.25), 0 4px 12px rgba(15,23,42,0.4)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, Arial, Helvetica, sans-serif',
            fontSize: '13px',
            zIndex: Z_INDEX,
            overflow: 'hidden',
            userSelect: 'none',
            transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }
    });

    chatBox = createEl('div', {
        id: 'cortanaChat',
        style: {
            flex: '1',
            padding: '14px',
            overflowY: 'auto',
            background: '#090d16',
            display: 'flex',
            flexDirection: 'column'
        }
    });

    inputField = createEl('input', {
        id: 'cortanaInput',
        type: 'text',
        placeholder: 'Escribe consulta clínica o comando...',
        style: {
            flex: '1',
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '8px 12px',
            marginRight: '8px',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.2s'
        },
        onfocus: () => { inputField.style.borderColor = '#0284c7'; },
        onblur: () => { inputField.style.borderColor = '#334155'; },
        onkeydown: e => {
            if (e.key === 'Enter') {
                if (sendBtn) sendBtn.click();
            }
        }
    });

    sendBtn = createEl('button', {
        id: 'cortanaSendBtn',
        type: 'button',
        style: {
            border: 'none',
            background: '#0284c7',
            color: '#fff',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'background 0.2s'
        },
        onmouseover: () => { sendBtn.style.background = '#0369a1'; },
        onmouseout: () => { sendBtn.style.background = '#0284c7'; },
        onclick: () => {
            const txt = inputField.value.trim();
            if (!txt) return;
            appendMessage('user', txt);
            inputField.value = '';
            setAvatarSpeaking(true);
            
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensaje: txt })
            })
                .then(r => r.json())
                .then(d => {
                    setAvatarSpeaking(false);
                    const resp = d.respuesta ?? '[sin respuesta del núcleo]';
                    appendMessage('bot', resp);
                    speak(resp);
                })
                .catch(() => {
                    setAvatarSpeaking(false);
                    const errTxt = '[error de comunicación con núcleo FastAPI - Puerto 8799]';
                    appendMessage('bot', errTxt);
                });
        }
    }, [document.createTextNode('Enviar')]);

    micBtn = createEl('button', {
        id: 'cortanaMicBtn',
        type: 'button',
        style: {
            border: 'none',
            background: '#10b981',
            color: '#fff',
            borderRadius: '6px',
            padding: '8px 10px',
            cursor: 'pointer',
            fontSize: '13px',
            marginLeft: '4px',
            transition: 'background 0.2s'
        },
        title: 'Dictado por voz (es-PE)',
        onmouseover: () => { micBtn.style.background = '#059669'; },
        onmouseout: () => { micBtn.style.background = '#10b981'; },
        onclick: () => {
            if (!recognizer) {
                alert('El reconocimiento de voz no está soportado en este navegador.');
                return;
            }
            try {
                setAvatarSpeaking(true);
                recognizer.start();
            } catch (err) {
                setAvatarSpeaking(false);
            }
        }
    }, [document.createTextNode('🎤')]);

    ttsBtn = createEl('button', {
        id: 'cortanaTtsBtn',
        type: 'button',
        style: {
            border: 'none',
            background: '#f59e0b',
            color: '#0f172a',
            borderRadius: '6px',
            padding: '8px 10px',
            cursor: 'pointer',
            fontSize: '13px',
            marginLeft: '4px',
            fontWeight: 'bold',
            transition: 'background 0.2s'
        },
        title: 'Alternar síntesis de voz (TTS)',
        onmouseover: () => { ttsBtn.style.background = '#d97706'; },
        onmouseout: () => { ttsBtn.style.background = '#f59e0b'; },
        onclick: () => {
            ttsEnabled = !ttsEnabled;
            if (ttsBtn) ttsBtn.textContent = ttsEnabled ? '🔊' : '🔈';
            saveStateToStorage();
        }
    }, [document.createTextNode(ttsEnabled ? '🔊' : '🔈')]);

    const inputWrapper = createEl('div', {
        style: {
            display: 'flex',
            padding: '12px',
            borderTop: '1px solid #1e293b',
            background: '#0b1120',
            alignItems: 'center'
        }
    }, [inputField, sendBtn, micBtn, ttsBtn]);

    bodyWrapper = createEl('div', {
        style: {
            display: isMinimized ? 'none' : 'flex',
            flexDirection: 'column',
            flex: '1',
            overflow: 'hidden'
        }
    }, [chatBox, inputWrapper]);

    minimizeBtn = createEl('span', {
        style: { color: '#38bdf8', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold', padding: '0 6px' }
    }, [document.createTextNode(isMinimized ? '🗖' : '🗕')]);

    const headerTitleContainer = createEl('div', {
        style: { display: 'flex', alignItems: 'center', gap: '10px' }
    }, [
        avatarIconRef,
        createEl('div', { style: { display: 'flex', flexDirection: 'column' } }, [
            createEl('span', { style: { fontWeight: 'bold', color: '#f8fafc', fontSize: '13px' } }, [document.createTextNode('Cortana Concierge')]),
            createEl('span', { style: { fontSize: '10px', color: '#38bdf8' } }, [document.createTextNode('JC Path Lab • v12.0')])
        ])
    ]);

    const header = createEl('div', {
        id: 'cortanaHeader',
        style: {
            background: '#0f172a',
            color: '#f8fafc',
            padding: '10px 14px',
            cursor: 'move',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #1e293b'
        },
        onmousedown: e => {
            isDragging = true;
            const rect = container.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            e.preventDefault();
        }
    }, [
        headerTitleContainer,
        createEl('div', {
            onclick: e => {
                e.stopPropagation();
                isMinimized = !isMinimized;
                container.style.height = isMinimized ? '44px' : `${HEIGHT}px`;
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

    // ---------- Drag Logic & Cleanup ----------
    const onMouseMove = e => {
        if (!isDragging) return;
        const left = e.clientX - dragOffsetX;
        const top = e.clientY - dragOffsetY;
        
        const maxLeft = window.innerWidth - WIDTH;
        const maxTop = window.innerHeight - 50;
        
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

    window.addEventListener('beforeunload', () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    });
})();
