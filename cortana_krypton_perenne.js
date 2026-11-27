/* ────────────────────────────────────────────────────────────────
   Cortana Mini‑Consola Flotante
   Tamaño: 245 × 195 px
   Botón flotante: esquina inferior‑derecha
   Funcionalidades:
     • Arrastrable (manejador de encabezado)
     • Entrada de texto + botón “Enviar”
     • Botón micrófono (Web Speech Recognition, es‑PE)
     • Botón TTS toggle (SpeechSynthesis)
     • Comunicación fetch POST → http://127.0.0.1:8799/api/conversar
       → muestra respuesta JSON {respuesta: "..."} en el chat
   No genera variables huérfanas ni dependencias externas.
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

    // ---------- State ----------
    let ttsEnabled = false;
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

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

    const appendMessage = (author, text) => {
        const msg = createEl('div', {
            style: {
                margin: '4px 0',
                color: author === 'user' ? '#0066cc' : '#333',
                wordBreak: 'break-word'
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
    const container = createEl('div', {
        id: 'cortanaFloatWindow',
        style: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: `${WIDTH}px`,
            height: `${HEIGHT}px`,
            background: '#fafafa',
            border: '1px solid #bbb',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Arial,Helvetica,sans-serif',
            fontSize: '13px',
            zIndex: Z_INDEX,
            userSelect: 'none'
        }
    });

    const header = createEl('div', {
        id: 'cortanaHeader',
        style: {
            background: '#333',
            color: '#fff',
            padding: '4px 6px',
            cursor: 'move',
            fontWeight: 'bold'
        },
        onmousedown: e => {
            isDragging = true;
            const rect = container.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            e.preventDefault();
        }
    }, [document.createTextNode('Cortana')]);

    const chatBox = createEl('div', {
        id: 'cortanaChat',
        style: {
            flex: '1',
            padding: '4px',
            overflowY: 'auto',
            background: '#fff'
        }
    });

    const inputField = createEl('input', {
        id: 'cortanaInput',
        type: 'text',
        placeholder: 'Escribe aquí...',
        style: {
            flex: '1',
            border: '1px solid #ccc',
            borderRadius: '2px',
            padding: '2px 4px',
            marginRight: '2px',
            fontSize: '13px'
        }
    });

    const sendBtn = createEl('button', {
        id: 'cortanaSendBtn',
        type: 'button',
        style: {
            border: 'none',
            background: '#0066cc',
            color: '#fff',
            borderRadius: '2px',
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: '13px'
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
                .catch(() => appendMessage('bot', '[error de comunicación]'));
        }
    }, [document.createTextNode('Enviar')]);

    const micBtn = createEl('button', {
        id: 'cortanaMicBtn',
        type: 'button',
        style: {
            border: 'none',
            background: '#28a745',
            color: '#fff',
            borderRadius: '2px',
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: '13px',
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
            background: '#ffc107',
            color: '#000',
            borderRadius: '2px',
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: '13px',
            marginLeft: '2px'
        },
        title: 'Toggle TTS',
        onclick: () => {
            ttsEnabled = !ttsEnabled;
            ttsBtn.textContent = ttsEnabled ? '🔊' : '🔈';
        }
    }, [document.createTextNode('🔈')]);

    const inputWrapper = createEl('div', {
        style: {
            display: 'flex',
            padding: '4px',
            borderTop: '1px solid #ddd',
            background: '#f9f9f9'
        }
    }, [inputField, sendBtn, micBtn, ttsBtn]);

    // Assemble
    container.appendChild(header);
    container.appendChild(chatBox);
    container.appendChild(inputWrapper);
    document.body.appendChild(container);

    // ---------- Drag Logic ----------
    const onMouseMove = e => {
        if (!isDragging) return;
        const left = e.clientX - dragOffsetX;
        const top = e.clientY - dragOffsetY;
        container.style.left = `${left}px`;
        container.style.top = `${top}px`;
        container.style.right = 'auto';
        container.style.bottom = 'auto';
    };
    const onMouseUp = () => { isDragging = false; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
})();
