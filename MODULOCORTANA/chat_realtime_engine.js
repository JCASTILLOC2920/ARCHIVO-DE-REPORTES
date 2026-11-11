/**
 * chat_realtime_engine.js
 * MOTOR DE TIEMPO REAL BIDIRECCIONAL (BROADCASTCHANNEL + DOCKER N8N LOCAL)
 * - Comunicación multi-pestaña instantánea vía BroadcastChannel('jcpathlab_clinical_chat')
 * - Persistencia soberana en LocalStorage
 * - Despacho atómico opcional a Docker n8n local (http://127.0.0.1:5678/webhook/guardar-mensaje-chat)
 * - Efecto de audio sutil ('pop') al recibir nuevos mensajes
 * - Actualización en tiempo real de burbujas, contadores y drawer de chat clínico
 */

class ChatRealtimeEngine {
    constructor() {
        this.broadcastChannelName = 'jcpathlab_clinical_chat';
        this.n8nWebhookUrl = 'http://127.0.0.1:5678/webhook/guardar-mensaje-chat';
        this.broadcast = null;
        this.currentUser = null;
        this.activeChannel = 'GENERAL';
        this.audioEnabled = true;
        this.initialized = false;

        this.init();
    }

    init() {
        if (this.initialized) return;
        
        // 1. Cargar usuario actual
        this.loadCurrentUser();

        // 2. Inicializar BroadcastChannel para resiliencia multi-pestaña local
        if (typeof BroadcastChannel !== 'undefined') {
            this.broadcast = new BroadcastChannel(this.broadcastChannelName);
            this.broadcast.onmessage = (event) => {
                this.handleBroadcastMessage(event.data);
            };
            console.log(`[ChatEngine] BroadcastChannel '${this.broadcastChannelName}' conectado con éxito.`);
        }

        // 3. Hookear eventos de UI en el drawer si ya existen
        this.attachUIListeners();

        this.initialized = true;
        console.log('[ChatEngine] Motor de Tiempo Real Bidireccional inicializado.');
    }

    loadCurrentUser() {
        try {
            const raw = localStorage.getItem('currentUser');
            if (raw) {
                this.currentUser = JSON.parse(raw);
            } else {
                this.currentUser = { nombres: 'Dr. Patólogo Central', perfil: 'Administrador', clinica: 'CENTRAL' };
            }
        } catch (e) {
            this.currentUser = { nombres: 'Dr. Patólogo Central', perfil: 'Administrador', clinica: 'CENTRAL' };
        }
    }

    sendChatMessage(channel, text, caseTag = null) {
        this.loadCurrentUser();
        const msg = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            channel: channel || 'GENERAL',
            author: this.currentUser.nombres || 'Dr. Patólogo',
            role: (this.currentUser.perfil === 'Administrador' || this.currentUser.role === 'doctor') ? 'doctor' : 'clinic',
            text: text,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            caseTag: caseTag
        };

        // 1. Guardar en LocalStorage para persistencia inmediata
        this.saveToLocal(msg);

        // 2. Propagar a través de BroadcastChannel a todas las pestañas de la misma PC
        if (this.broadcast) {
            this.broadcast.postMessage({ type: 'NEW_CHAT_MESSAGE', payload: msg });
        }

        // 3. Despacho atómico a Docker n8n local
        this.sendToN8n(msg);

        // 4. Actualizar UI local inmediatamente
        this.renderMessageInUI(msg);

        return msg;
    }

    saveToLocal(msg) {
        try {
            const key = 'clinical_chat_' + msg.channel;
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            // Evitar duplicados por id
            if (!list.some(m => m.id === msg.id)) {
                list.push(msg);
                localStorage.setItem(key, JSON.stringify(list));
            }
        } catch (e) {
            console.error('[ChatEngine] Error guardando en LocalStorage:', e);
        }
    }

    sendToN8n(msg) {
        try {
            fetch(this.n8nWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(msg)
            }).catch(err => {
                console.warn('[ChatEngine] No se pudo despachar a n8n local (modo offline/fallback activo):', err.message);
            });
        } catch (e) {
            console.warn('[ChatEngine] Excepción al enviar a n8n local:', e);
        }
    }

    handleBroadcastMessage(data) {
        if (!data || data.type !== 'NEW_CHAT_MESSAGE') return;
        const msg = data.payload;
        if (!msg) return;

        // Guardar localmente sin retransmitir
        this.saveToLocalQuiet(msg);

        // Reproducir sonido pop y actualizar UI si corresponde al canal abierto
        this.playPopSound();
        this.renderMessageInUI(msg);
        this.updateUnreadBadges(msg.channel);
    }

    saveToLocalQuiet(msg) {
        try {
            const key = 'clinical_chat_' + (msg.channel || 'GENERAL');
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            if (!list.some(m => m.id === msg.id)) {
                list.push(msg);
                localStorage.setItem(key, JSON.stringify(list));
            }
        } catch (e) {}
    }

    playPopSound() {
        if (!this.audioEnabled) return;
        try {
            // Sintetizar un sutil 'pop' usando Web Audio API (cero dependencias de archivos externos)
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(580, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.09);
        } catch (e) {
            // Ignorar restricciones de autoplay de navegador
        }
    }

    renderMessageInUI(msg) {
        const list = document.getElementById('chatMessagesList');
        if (!list) return;

        // Verificar si el canal actual coincide
        const channelSelect = document.getElementById('chatChannelSelect');
        const activeChan = channelSelect ? channelSelect.value : 'GENERAL';
        if (msg.channel && msg.channel !== activeChan && msg.channel !== 'GENERAL') {
            return; // No renderizar si está en otro canal
        }

        // Evitar duplicar nodo si ya existe
        if (document.getElementById(msg.id)) return;

        const isDoctor = msg.role === 'doctor';
        const bubbleClass = isDoctor ? 'chat-bubble-doctor' : 'chat-bubble-clinic';

        const div = document.createElement('div');
        div.id = msg.id;
        div.className = bubbleClass;
        div.style.cssText = 'display: flex; flex-direction: column; margin-bottom: 8px; animation: fadeInMsg 0.2s ease-out;';

        div.innerHTML = `
            <div class="chat-bubble-header">
                <span class="chat-author"><i class="fa-solid ${isDoctor ? 'fa-user-doctor' : 'fa-hospital'}"></i> ${escapeHtml(msg.author)}</span>
                <span class="chat-time">${escapeHtml(msg.date)}</span>
            </div>
            <div class="chat-text">${escapeHtml(msg.text)}</div>
            ${msg.caseTag ? `<div class="chat-case-badge"><i class="fa-solid fa-file-medical"></i> Caso: ${escapeHtml(msg.caseTag)}</div>` : ''}
        `;

        list.appendChild(div);
        list.scrollTop = list.scrollHeight;
    }

    updateUnreadBadges(channel) {
        const drawer = document.getElementById('clinicalDrawer');
        const isOpen = drawer && drawer.classList.contains('open');
        
        // Si el drawer está abierto y en el mismo canal, no mostrar badge
        const channelSelect = document.getElementById('chatChannelSelect');
        const activeChan = channelSelect ? channelSelect.value : 'GENERAL';

        if (isOpen && activeChan === channel) return;

        // Actualizar badge en la barra superior
        const dot = document.getElementById('headerChatDot');
        if (dot) dot.style.display = 'block';

        const unreadCounter = document.getElementById('chatUnreadCounter');
        if (unreadCounter) {
            unreadCounter.style.display = 'inline-block';
            const currentCount = parseInt(unreadCounter.textContent || '0') + 1;
            unreadCounter.textContent = currentCount;
        }
    }

    attachUIListeners() {
        // Asegurar vinculación con el botón de envío y input del drawer existente
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'chatSendBtn') {
                this.handleUISendAction();
            }
        });
    }

    handleUISendAction() {
        const input = document.getElementById('chatMessageInput');
        const channelSelect = document.getElementById('chatChannelSelect');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        const channel = channelSelect ? channelSelect.value : 'GENERAL';
        
        const activeCaseEl = document.getElementById('drawerCodAtencion');
        let caseTag = null;
        if (activeCaseEl && activeCaseEl.textContent && !activeCaseEl.textContent.includes('GENERAL') && !activeCaseEl.textContent.includes('Ninguna')) {
            caseTag = activeCaseEl.textContent.replace(/\[Caso:\s*|\]/g, '').trim();
        }

        this.sendChatMessage(channel, text, caseTag);
        input.value = '';
    }
}

// Función auxiliar de escape HTML para seguridad XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Instanciar motor globalmente
if (typeof window !== 'undefined') {
    window.chatRealtimeEngine = new ChatRealtimeEngine();
}

export default ChatRealtimeEngine;
