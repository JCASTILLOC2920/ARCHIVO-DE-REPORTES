/**
 * floating_chat_widget.js
 * Componente flotante tipo WhatsApp Web Interno para interconsultas clínicas en vivo.
 * Esquina inferior derecha: `#btn-floating-chat` con logo institucional y badge verde de no leídos.
 * Ventana modal: `#chat-window` con Header, selector de clínica, Body con burbujas y Footer con input y enviar.
 * Atajos: Apertura/cierre con clic o `Ctrl + K`. Envío con `Enter`.
 */

(function () {
    if (window._floatingChatWidgetInitialized) return;
    window._floatingChatWidgetInitialized = true;

    // Crear estilos CSS autocontenidos
    const styleEl = document.createElement('style');
    styleEl.id = 'floating-chat-widget-styles';
    styleEl.textContent = `
        /* Contenedor principal flotante */
        #floating-chat-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 2100000;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Botón flotante / Burbuja en esquina inferior derecha */
        #btn-floating-chat {
            width: 58px;
            height: 58px;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            border: none;
            border-radius: 50%;
            box-shadow: 0 4px 20px rgba(2, 132, 199, 0.40);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
            outline: none;
        }
        #btn-floating-chat:hover {
            transform: scale(1.08);
            box-shadow: 0 6px 25px rgba(2, 132, 199, 0.60);
        }
        #btn-floating-chat i {
            color: #ffffff;
            font-size: 1.5rem;
        }

        /* Badge verde de no leídos */
        #chat-badge-unread {
            position: absolute;
            top: 2px;
            right: 2px;
            background: #22c55e;
            color: #ffffff;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 10px;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(34, 197, 94, 0.4);
            display: none;
        }

        /* Ventana Modal tipo WhatsApp Web */
        #chat-window {
            position: absolute;
            bottom: 74px;
            right: 0;
            width: 380px;
            height: 540px;
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transform: scale(0.9) translateY(20px);
            opacity: 0;
            pointer-events: none;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid #e2e8f0;
        }
        #chat-window.open {
            transform: scale(1) translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        /* Header tipo WhatsApp Web */
        .chat-win-header {
            background: #0f172a;
            color: #ffffff;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #1e293b;
        }
        .chat-win-title-area {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .chat-win-avatar {
            width: 38px;
            height: 38px;
            background: #0284c7;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            color: #fff;
            font-weight: 700;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .chat-win-info h3 {
            font-size: 0.9rem;
            font-weight: 700;
            margin: 0;
            letter-spacing: 0.2px;
        }
        .chat-win-status {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.7rem;
            color: #94a3b8;
            margin-top: 2px;
        }
        .chat-pulse-dot {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 8px #22c55e;
            animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .chat-win-close {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #cbd5e1;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
        }
        .chat-win-close:hover {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }

        /* Selector de Clínica / Canal */
        .chat-clinic-bar {
            padding: 8px 12px;
            background: #f1f5f9;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .chat-clinic-bar select {
            flex: 1;
            padding: 5px 8px;
            font-size: 0.78rem;
            font-weight: 600;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background: #ffffff;
            color: #0f172a;
            outline: none;
            cursor: pointer;
        }

        /* Body con Historial de Mensajes */
        .chat-win-body {
            flex: 1;
            background: #efeae2; /* Fondo clásico WhatsApp Web light */
            background-image: radial-gradient(#cbd5e1 0.75px, transparent 0.75px);
            background-size: 16px 16px;
            padding: 14px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            scroll-behavior: smooth;
        }

        /* Burbujas de chat estilo WhatsApp */
        .wa-bubble {
            max-width: 82%;
            padding: 8px 12px;
            border-radius: 8px;
            position: relative;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            font-size: 0.8rem;
            line-height: 1.35;
            word-break: break-word;
        }
        .wa-bubble.received {
            background: #ffffff;
            color: #111827;
            align-self: flex-start;
            border-top-left-radius: 0;
            border: 1px solid #e5e7eb;
        }
        .wa-bubble.sent {
            background: #dcf8c6; /* Verde clásico enviado WhatsApp */
            color: #111827;
            align-self: flex-end;
            border-top-right-radius: 0;
            border: 1px solid #c8e6c9;
        }
        .wa-bubble-header {
            font-size: 0.65rem;
            font-weight: 700;
            color: #0284c7;
            margin-bottom: 2px;
        }
        .wa-bubble.sent .wa-bubble-header {
            color: #166534;
        }
        .wa-meta {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 4px;
            font-size: 0.6rem;
            color: #6b7280;
            margin-top: 4px;
            float: right;
            margin-left: 8px;
        }
        .wa-checks {
            color: #34b7f1; /* Azul doble check WhatsApp */
            font-weight: bold;
            font-size: 0.65rem;
        }

        /* Footer con Input y Controles */
        .chat-win-footer {
            padding: 10px 12px;
            background: #f0f2f5;
            border-top: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .chat-input-row {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .chat-action-btn {
            background: none;
            border: none;
            color: #64748b;
            font-size: 1.1rem;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s, color 0.2s;
        }
        .chat-action-btn:hover {
            background: rgba(0,0,0,0.06);
            color: #0f172a;
        }
        .chat-textarea {
            flex: 1;
            padding: 8px 12px;
            font-size: 0.8rem;
            border: 1px solid #cbd5e1;
            border-radius: 20px;
            outline: none;
            background: #ffffff;
            color: #0f172a;
            resize: none;
            max-height: 80px;
            line-height: 1.2;
        }
        .chat-send-btn {
            background: #00a884; /* Verde WhatsApp */
            color: #ffffff;
            border: none;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s, background 0.2s;
            box-shadow: 0 2px 5px rgba(0,168,132,0.3);
        }
        .chat-send-btn:hover {
            background: #008f72;
            transform: scale(1.05);
        }
        .chat-send-btn i {
            font-size: 0.85rem;
        }
    `;
    document.head.appendChild(styleEl);

    // Crear el contenedor HTML e inyectarlo al final del body
    const container = document.createElement('div');
    container.id = 'floating-chat-container';
    container.innerHTML = `
        <!-- Burbuja flotante -->
        <button id="btn-floating-chat" title="Abrir Chat Clínico Central (Ctrl + K)">
            <i class="fa-solid fa-comments"></i>
            <span id="chat-badge-unread">0</span>
        </button>

        <!-- Ventana Modal WhatsApp Web -->
        <div id="chat-window">
            <div class="chat-win-header">
                <div class="chat-win-title-area">
                    <div class="chat-win-avatar"><i class="fa-solid fa-hospital-user"></i></div>
                    <div class="chat-win-info">
                        <h3>Chat Clínico Central</h3>
                        <div class="chat-win-status">
                            <span class="chat-pulse-dot"></span>
                            <span>En línea (Interconsulta Activa)</span>
                        </div>
                    </div>
                </div>
                <button class="chat-win-close" id="chat-win-close-btn" title="Cerrar chat">&times;</button>
            </div>

            <!-- Selector de Clínica -->
            <div class="chat-clinic-bar">
                <span style="font-size: 0.72rem; font-weight: 700; color: #475569;"><i class="fa-solid fa-clinic-medical"></i> Clínica:</span>
                <select id="floatingChatClinicSelect">
                    <option value="GENERAL">🌐 Canal General (Todas)</option>
                    <option value="CARRION">🏥 Clínica Carrión</option>
                    <option value="MUJER">🩺 Clínica La Mujer</option>
                    <option value="ALFA">🔬 Clínica Alfa Prevenir</option>
                    <option value="SANCLEMENTE">⭐ Clínica San Clemente</option>
                </select>
            </div>

            <!-- Body con Historial -->
            <div class="chat-win-body" id="floatingChatMessagesList">
                <!-- Mensajes dinámicos -->
            </div>

            <!-- Footer con Input -->
            <div class="chat-win-footer">
                <div class="chat-input-row">
                    <button class="chat-action-btn" title="Adjuntar Caso Clínico o Plantilla" id="floatingChatAttachBtn"><i class="fa-solid fa-paperclip"></i></button>
                    <textarea class="chat-textarea" id="floatingChatInput" rows="1" placeholder="Escribe un mensaje clínico..."></textarea>
                    <button class="chat-send-btn" id="floatingChatSendBtn" title="Enviar mensaje"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // Lógica de funcionamiento del widget
    const btnFloating = document.getElementById('btn-floating-chat');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('chat-win-close-btn');
    const clinicSelect = document.getElementById('floatingChatClinicSelect');
    const messageInput = document.getElementById('floatingChatInput');
    const sendBtn = document.getElementById('floatingChatSendBtn');
    const messagesList = document.getElementById('floatingChatMessagesList');
    const unreadBadge = document.getElementById('chat-badge-unread');

    function toggleChatWindow() {
        const isOpen = chatWindow.classList.toggle('open');
        if (isOpen) {
            unreadBadge.style.display = 'none';
            unreadBadge.textContent = '0';
            messageInput.focus();
            scrollToBottom();
        }
    }

    btnFloating.addEventListener('click', toggleChatWindow);
    closeBtn.addEventListener('click', toggleChatWindow);

    // Atajo Ctrl + K
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            toggleChatWindow();
        }
    });

    
    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function getFormattedTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return hours + ':' + minutes + ' ' + ampm;
    }

    function loadMessages(channel) {
        const key = 'floating_whatsapp_chat_' + channel;
        let messages = [];
        try {
            messages = JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            messages = [];
        }

        if (messages.length === 0) {
            // Mensaje inicial de bienvenida institucional
            messages = [
                {
                    id: 'init_1',
                    author: 'Sistema Central',
                    role: 'received',
                    text: 'Bienvenido al Chat Clínico Central. Interconsulta segura con laboratorios y clínicas enlazadas.',
                    time: getFormattedTime()
                }
            ];
            localStorage.setItem(key, JSON.stringify(messages));
        }

        messagesList.innerHTML = messages.map(m => {
            const isSent = m.role === 'sent';
            const bubbleClass = isSent ? 'wa-bubble sent' : 'wa-bubble received';
            return `
                <div class="${bubbleClass}">
                    <div class="wa-bubble-header">${escapeHTML(m.author)}</div>
                    <div>${escapeHTML(m.text)}</div>
                    <div class="wa-meta">
                        <span>${escapeHTML(m.time)}</span>
                        ${isSent ? '<span class="wa-checks" title="Entregado y leído">✓✓</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesList.scrollTop = messagesList.scrollHeight;
    }

    clinicSelect.addEventListener('change', () => {
        loadMessages(clinicSelect.value);
    });

    
    function handleUISendAction() {
        handleSend();
    }

    function handleSend() {
        const text = messageInput.value.trim();
        if (!text) return;
        const channel = clinicSelect.value;
        const key = 'floating_whatsapp_chat_' + channel;

        let currentUser = { nombres: 'Dr. Patólogo Central' };
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"nombres":"Dr. Patólogo Central"}');
        } catch (e) {}

        let messages = [];
        try {
            messages = JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            messages = [];
        }

        const newMessage = {
            id: 'msg_' + Date.now(),
            author: currentUser.nombres || 'Dr. Patólogo',
            role: 'sent',
            text: text,
            time: getFormattedTime()
        };

        messages.push(newMessage);
        localStorage.setItem(key, JSON.stringify(messages));
        messageInput.value = '';
        loadMessages(channel);

        // Simular respuesta automática de la clínica seleccionada tras 2 segundos (si no es GENERAL)
        if (channel !== 'GENERAL') {
            setTimeout(() => {
                const autoReplies = [
                    "Estimado doctor, muestra recibida conforme en laboratorio.",
                    "Entendido, procedemos con la validación histológica solicitada.",
                    "Revisado el caso con el equipo quirúrgico. Todo conforme.",
                    "Gracias por la actualización, doctor."
                ];
                const replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];
                let clinicMessages = JSON.parse(localStorage.getItem(key) || '[]');
                clinicMessages.push({
                    id: 'msg_' + Date.now(),
                    author: 'Clínica ' + channel.charAt(0) + channel.slice(1).toLowerCase(),
                    role: 'received',
                    text: replyText,
                    time: getFormattedTime()
                });
                localStorage.setItem(key, JSON.stringify(clinicMessages));
                
                // Si la ventana está cerrada, incrementar badge no leído
                if (!chatWindow.classList.contains('open')) {
                    unreadBadge.style.display = 'block';
                    const currentCount = parseInt(unreadBadge.textContent || '0') + 1;
                    unreadBadge.textContent = currentCount;
                } else {
                    loadMessages(channel);
                }
            }, 2000);
        }
    }

    sendBtn.addEventListener('click', handleSend);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Cargar inicial
    loadMessages('GENERAL');
    console.log('[Floating Chat Widget] Inicializado correctamente en esquina inferior derecha.');
})();
