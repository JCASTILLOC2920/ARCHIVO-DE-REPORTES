/**
 * ============================================================================
 * CORTANA - CONCIERGE & SECRETARIA MÉDICA DIGITAL NO-BLOQUEANTE (JC PATH LAB)
 * Entidad Oficial de La Colmena • 100% Offline • Cero Créditos
 * Arquitectura Fase 2:
 *   - Posicionada en el flanco inferior izquierdo (340px) lejos de las columnas
 *     de Paciente, Entrega y Acciones (Editar / PDF / Imprimir).
 *   - Auto-Minimizado Inteligente: Al pulsar "Ubicar en Tabla", "Filtrar" o
 *     al hacer clic sobre cualquier fila de la tabla de pacientes, Cortana se
 *     minimiza automáticamente e ilumina con pulso cian la fila buscada.
 * ============================================================================
 */

(function() {
  const AVATAR_URL = 'assets/cortana/cortana_avatar_face.jpg';

  const FRASES_SECRETARIA = [
    'Hola, estoy lista para ubicar cualquier biopsia o citología sin tapar tu pantalla.',
    'Buenas, dime el código (ej. 377, 384) o apellido y te llevo directo a la fila.',
    '¿Qué informe de Clínica La Luz, Carrión, La Mujer o San Clemente buscamos hoy?',
    'Escribe o dicta el nombre del paciente; al seleccionarlo me minimizaré sola.'
  ];

  let fraseIndex = 0;
  function obtenerFraseProactiva() {
    const f = FRASES_SECRETARIA[fraseIndex % FRASES_SECRETARIA.length];
    fraseIndex++;
    return f;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCortanaSystem);
  } else {
    initCortanaSystem();
  }

  function initCortanaSystem() {
    inyectarUIFlotanteCortana();
    conectarEventosCortana();
    actualizarContadorOmnibox();
  }

  function actualizarContadorOmnibox() {
    setTimeout(() => {
      const db = obtenerPoolPacientes();
      const badge = document.querySelector('.cortana-dialog-badge');
      if (badge && db.length > 0) {
        badge.innerHTML = `<i class="fa-solid fa-bolt"></i> ${db.length.toLocaleString()} EXPEDIENTES VERIFICADOS (< 1ms)`;
      }
    }, 600);
  }

  function obtenerPoolPacientes() {
    if (Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0) return window.patientDatabase;
    if (Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0) return window.REAL_SUPABASE_PATIENTS;
    if (Array.isArray(window.realSupabaseBackup) && window.realSupabaseBackup.length > 0) return window.realSupabaseBackup;
    return [];
  }

  function inyectarUIFlotanteCortana() {
    if (document.getElementById('cortanaFloatingBadge')) return;

    // A. Píldora Concierge Compacta en Esquina Inferior Izquierda (No tapa botones de acción ni tabla)
    const badge = document.createElement('div');
    badge.id = 'cortanaFloatingBadge';
    badge.className = 'cortana-floating-badge';
    badge.title = 'Cortana · Secretaria Médica Digital (No tapa la tabla)';
    badge.innerHTML = `
      <div class="cortana-avatar-ring">
        <img src="${AVATAR_URL}" alt="Cortana" class="cortana-avatar-img" onerror="this.onerror=null; this.src='icon-192.png';">
        <span class="cortana-status-pulse"></span>
      </div>
      <div class="cortana-badge-text">
        <span class="cortana-badge-name">Cortana <i class="fa-solid fa-wand-magic-sparkles" style="color:#38bdf8; font-size:0.72rem;"></i></span>
        <span class="cortana-badge-role">Concierge Clínico</span>
      </div>
      <span class="cortana-badge-chip">Buscar</span>
    `;
    document.body.appendChild(badge);

    // B. Drawer Concierge Esbelto Lateral Izquierdo (340px, se auto-minimiza al interactuar con la tabla)
    const panel = document.createElement('div');
    panel.id = 'cortanaAssistantPanel';
    panel.className = 'cortana-assistant-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
      <div class="cortana-panel-header">
        <div class="cortana-header-profile">
          <div class="cortana-avatar-wrapper">
            <img src="${AVATAR_URL}" alt="Cortana" class="cortana-header-avatar" onerror="this.onerror=null; this.src='icon-192.png';">
            <span class="cortana-online-dot"></span>
          </div>
          <div class="cortana-header-info">
            <div class="cortana-header-name">Cortana <span class="cortana-role-badge">CONCIERGE</span></div>
            <div class="cortana-header-sub">Auto-minimizado activo · No bloquea pacientes</div>
          </div>
        </div>
        <div class="cortana-header-actions">
          <button type="button" class="cortana-header-btn" id="btnCortanaDockSide" title="Cambiar lado (Izquierda / Derecha)"><i class="fa-solid fa-left-right"></i></button>
          <button type="button" class="cortana-header-btn" id="btnCortanaClearChat" title="Limpiar conversación"><i class="fa-solid fa-rotate-left"></i></button>
          <button type="button" class="cortana-header-btn" id="btnCortanaClosePanel" title="Minimizar (Esc)"><i class="fa-solid fa-minus"></i></button>
        </div>
      </div>
      <div class="cortana-quick-chips">
        <button type="button" class="cortana-chip" data-query="informes listos">✅ Listos</button>
        <button type="button" class="cortana-chip" data-query="Clinica La Luz">🏥 La Luz</button>
        <button type="button" class="cortana-chip" data-query="Clinica Carrion">🏥 Carrión</button>
        <button type="button" class="cortana-chip" data-query="San Clemente">🏥 San Clemente</button>
        <button type="button" class="cortana-chip" data-query="Clinica La Mujer">🏥 La Mujer</button>
      </div>
      <div id="cortanaMessagesContainer" class="cortana-messages-container"></div>
      <div class="cortana-panel-input-box">
        <input type="text" id="cortanaPanelInput" class="cortana-panel-input" placeholder="Código (ej. 377), DNI o apellido..." autocomplete="off">
        <button type="button" id="btnCortanaVoiceInPanel" class="cortana-input-btn voice" title="Dictar por voz"><i class="fa-solid fa-microphone"></i></button>
        <button type="button" id="btnCortanaSendInPanel" class="cortana-input-btn send" title="Buscar"><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    `;
    document.body.appendChild(panel);
  }

  function conectarEventosCortana() {
    const badge = document.getElementById('cortanaFloatingBadge');
    const panel = document.getElementById('cortanaAssistantPanel');
    const closeBtn = document.getElementById('btnCortanaClosePanel');
    const clearBtn = document.getElementById('btnCortanaClearChat');
    const dockBtn = document.getElementById('btnCortanaDockSide');
    const input = document.getElementById('cortanaPanelInput');
    const sendBtn = document.getElementById('btnCortanaSendInPanel');
    const voiceBtn = document.getElementById('btnCortanaVoiceInPanel');

    if (badge) badge.addEventListener('click', (e) => { e.stopPropagation(); toggleCortanaPanel(); });
    if (closeBtn) closeBtn.addEventListener('click', () => closeCortanaPanel());
    if (clearBtn) clearBtn.addEventListener('click', () => limpiarMensajesCortana());

    if (dockBtn && panel && badge) {
      dockBtn.addEventListener('click', () => {
        panel.classList.toggle('dock-right');
        badge.classList.toggle('dock-right');
      });
    }

    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => enviarMensajeUsuario());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          enviarMensajeUsuario();
        } else if (e.key === 'Escape') {
          closeCortanaPanel();
        }
      });
    }

    // Auto-minimizar Cortana cuando el usuario hace clic en la tabla de pacientes para no estorbar jamás
    document.addEventListener('click', (e) => {
      if (!panel || panel.style.display === 'none') return;
      const insideCortana = panel.contains(e.target) || (badge && badge.contains(e.target));
      const clickedOpenBtn = e.target.closest('#cortanaOpenChatBtn') || e.target.closest('[onclick*="cortanaAbrirChat"]');
      if (!insideCortana && !clickedOpenBtn) {
        if (e.target.closest('#reportTable') || e.target.closest('.table-container') || e.target.closest('.modal-overlay')) {
          closeCortanaPanel();
        }
      }
    });

    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.cortana-chip');
      if (chip && chip.dataset.query) {
        openCortanaPanel(chip.dataset.query);
      }
    });

    // Conectar barra de búsqueda inline #cortanaSearchInput con filtrado en vivo no bloqueante
    const inlineInput = document.getElementById('cortanaSearchInput');
    const inlineOpenBtn = document.getElementById('cortanaOpenChatBtn');
    if (inlineOpenBtn) {
      inlineOpenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const val = inlineInput ? inlineInput.value.trim() : '';
        openCortanaPanel(val || null);
      });
    }

    if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-PE';
      recognition.continuous = false;
      recognition.interimResults = false;

      let isListening = false;
      voiceBtn.addEventListener('click', () => {
        if (!isListening) {
          try { recognition.start(); isListening = true; voiceBtn.classList.add('recording'); } catch(err) {}
        } else {
          recognition.stop(); isListening = false; voiceBtn.classList.remove('recording');
        }
      });
      recognition.onresult = (ev) => {
        const transcript = ev.results[0][0].transcript;
        if (input) input.value = transcript;
        enviarMensajeUsuario();
        isListening = false;
        voiceBtn.classList.remove('recording');
      };
      recognition.onerror = () => { isListening = false; voiceBtn.classList.remove('recording'); };
      recognition.onend = () => { isListening = false; voiceBtn.classList.remove('recording'); };
    }
  }

  function toggleCortanaPanel() {
    const panel = document.getElementById('cortanaAssistantPanel');
    if (!panel) return;
    if (panel.style.display === 'none' || !panel.style.display) {
      openCortanaPanel();
    } else {
      closeCortanaPanel();
    }
  }

  function openCortanaPanel(initialQuery = null) {
    const panel = document.getElementById('cortanaAssistantPanel');
    const input = document.getElementById('cortanaPanelInput');
    const container = document.getElementById('cortanaMessagesContainer');
    if (!panel) return;
    panel.style.display = 'flex';

    if (container && (!container.hasChildNodes() || container.children.length === 0)) {
      saludoInicialCortana();
    }
    if (initialQuery && initialQuery.trim()) {
      if (input) input.value = initialQuery;
      enviarMensajeUsuario();
    } else if (input) {
      setTimeout(() => input.focus(), 80);
    }
  }

  function closeCortanaPanel() {
    const panel = document.getElementById('cortanaAssistantPanel');
    if (panel) panel.style.display = 'none';
  }

  function saludoInicialCortana() {
    const user = getSessionUser();
    const nombre = obtenerTratamientoUsuario(user);
    const db = obtenerPoolPacientes();
    agregarMensajeBot(`
      <p>Hola <strong>${escapeHtml(nombre)}</strong>. Custodio <strong>${db.length.toLocaleString()} informes reales</strong>.</p>
      <p style="font-size:0.74rem; color:#94a3b8; margin-top:4px;">
        Escribe un código (ej. <em>26Q-377</em>, <em>26C-302</em>), DNI o apellido. Al elegir <strong>"Ir a la Fila"</strong> me minimizaré sola para no tapar la lista.
      </p>
    `);
  }

  function limpiarMensajesCortana() {
    const container = document.getElementById('cortanaMessagesContainer');
    if (container) {
      container.innerHTML = '';
      saludoInicialCortana();
    }
  }

  function enviarMensajeUsuario() {
    const input = document.getElementById('cortanaPanelInput');
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) return;
    agregarMensajeUsuario(texto);
    input.value = '';
    const resHtml = resolverConsulta(texto);
    agregarMensajeBot(resHtml);
  }

  function agregarMensajeUsuario(texto) {
    const container = document.getElementById('cortanaMessagesContainer');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'cortana-msg-row user';
    row.innerHTML = `<div class="cortana-bubble user"><p>${escapeHtml(texto)}</p><span class="cortana-time-tag">${obtenerHoraActual()}</span></div>`;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  function agregarMensajeBot(htmlContent) {
    const container = document.getElementById('cortanaMessagesContainer');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'cortana-msg-row bot';
    row.innerHTML = `
      <img src="${AVATAR_URL}" alt="Cortana" class="cortana-bubble-avatar" onerror="this.onerror=null; this.src='icon-192.png';">
      <div class="cortana-bubble bot">${htmlContent}<span class="cortana-time-tag">Cortana • ${obtenerHoraActual()}</span></div>
    `;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  function resolverConsulta(rawQuery) {
    const q = (rawQuery || '').trim().toLowerCase();
    const db = obtenerPoolPacientes();

    const exactCodeMatch = q.match(/\b(\d{2}[qci])-?(\d{1,4})\b/i);
    const numOnlyMatch = q.match(/\b(\d{2,4})\b/);
    const dniMatch = q.match(/\b\d{8}\b/);

    let pacienteEncontrado = null;

    if (exactCodeMatch) {
      const target = `${exactCodeMatch[1].toUpperCase()}-${exactCodeMatch[2].padStart(2, '0')}`;
      const targetRaw = `${exactCodeMatch[1].toUpperCase()}-${exactCodeMatch[2]}`;
      pacienteEncontrado = db.find(p => {
        const c = String(p.codAtencion || p.cod_atencion || p.codigo || '').toUpperCase();
        return c === target || c === targetRaw;
      });
    }

    if (!pacienteEncontrado && dniMatch) {
      const dniTarget = dniMatch[0];
      pacienteEncontrado = db.find(p => String(p.dni || '').replace(/\D/g, '') === dniTarget);
    }

    if (!pacienteEncontrado && numOnlyMatch) {
      const numTarget = numOnlyMatch[1];
      pacienteEncontrado = db.find(p => {
        const c = String(p.codAtencion || p.cod_atencion || p.codigo || '').toLowerCase();
        return c.endsWith('-' + numTarget) || c.endsWith('-0' + numTarget);
      });
    }

    if (!pacienteEncontrado) {
      const tokens = q.split(/\s+/).filter(t => t.length >= 3 && !['buscar', 'caso', 'biopsia', 'donde', 'esta', 'paciente', 'doctor', 'muestra', 'informe', 'clinica'].includes(t));
      if (tokens.length > 0) {
        pacienteEncontrado = db.find(p => {
          const nom = String(p.paciente || ((p.apellidos || '') + ' ' + (p.nombres || ''))).toLowerCase();
          const med = String(p.medSolicitante || p.med_solicitante || p.doctor || '').toLowerCase();
          return tokens.every(t => nom.includes(t) || med.includes(t));
        });
      }
    }

    if (pacienteEncontrado) {
      const cod = pacienteEncontrado.codAtencion || pacienteEncontrado.cod_atencion || pacienteEncontrado.codigo || 'S/C';
      const nom = pacienteEncontrado.paciente || ((pacienteEncontrado.apellidos || '') + ', ' + (pacienteEncontrado.nombres || ''));
      const dni = pacienteEncontrado.dni || '---';
      const esp = pacienteEncontrado.especimen || 'Biopsia quirúrgica';
      const cli = pacienteEncontrado.clinica || 'JC PATH LAB';
      const esListo = String(pacienteEncontrado.estado || '').toLowerCase().includes('complet') || String(pacienteEncontrado.estado || '').toLowerCase().includes('list') || !!pacienteEncontrado.firmado;
      const safeCod = escapeHtml(cod);

      return `
        <div class="cortana-patient-card ${esListo ? 'ready' : 'processing'}">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="cortana-card-code">${safeCod}</span>
            <span style="font-size:0.68rem; font-weight:700; color:${esListo ? '#10b981' : '#f59e0b'};">${esListo ? '● FIRMADO / LISTO' : '● EN PROCESO'}</span>
          </div>
          <div class="cortana-card-title">${escapeHtml(nom)}</div>
          <div class="cortana-card-detail">🪪 DNI: <strong>${escapeHtml(dni)}</strong> • 🏥 ${escapeHtml(cli)}</div>
          <div class="cortana-card-detail">🧪 ${escapeHtml(esp)}</div>
          <div class="cortana-card-actions">
            <button type="button" class="cortana-act-btn filter" onclick="window.cortanaFiltrarEnTabla('${safeCod}')">
              <i class="fa-solid fa-crosshairs"></i> Ir a la Fila (Auto-Cerrar)
            </button>
            <button type="button" class="cortana-act-btn view" onclick="window.closeCortanaPanel(); window.handleAction ? window.handleAction('editar', '${safeCod}') : null">
              <i class="fa-solid fa-file-pen"></i> Abrir
            </button>
            <button type="button" class="cortana-act-btn pdf" onclick="window.closeCortanaPanel(); window.handleAction ? window.handleAction('descargar_pdf', '${safeCod}') : window.open('imprimir.html?autoDownload=true&codAtencion=${safeCod}')">
              <i class="fa-solid fa-file-pdf"></i> PDF
            </button>
          </div>
        </div>
      `;
    }

    const clinicasConocidas = ['luz', 'carrion', 'clemente', 'mujer', 'alfa', 'chungui', 'junco', 'uroserv'];
    const clinicaDetectada = clinicasConocidas.find(c => q.includes(c));
    if (clinicaDetectada) {
      const matchClinica = db.filter(p => String(p.clinica || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(clinicaDetectada));
      if (matchClinica.length > 0) {
        return `
          <p>Localicé <strong>${matchClinica.length} informes</strong> de esta sede.</p>
          <div class="cortana-card-actions" style="margin-top:6px;">
            <button type="button" class="cortana-act-btn filter" onclick="window.cortanaFiltrarEnTabla('${clinicaDetectada}')">
              <i class="fa-solid fa-filter"></i> Mostrar los ${matchClinica.length} en la tabla (Auto-Cerrar)
            </button>
          </div>
        `;
      }
    }

    if (q.includes('listo') || q.includes('completado')) {
      const listos = db.filter(p => p.firmado || String(p.estado || '').toLowerCase().includes('complet'));
      return `
        <p>Hay <strong>${listos.length} informes firmados y listos</strong>.</p>
        <div class="cortana-card-actions" style="margin-top:6px;">
          <button type="button" class="cortana-act-btn filter" onclick="window.closeCortanaPanel(); if(typeof window.cortanaFiltrar==='function') window.cortanaFiltrar('listos');">
            <i class="fa-solid fa-circle-check"></i> Ver listos en la tabla
          </button>
        </div>
      `;
    }

    return `<p>Indícame el <strong>código</strong> (ej. <em>26Q-377</em>), <strong>DNI</strong> o <strong>apellido</strong> para llevarte directo a la fila.</p>`;
  }

  function getSessionUser() {
    try { return JSON.parse(localStorage.getItem('currentUser') || '{}') || {}; } catch(e) { return {}; }
  }
  function checkIsAdmin(user) {
    if (!user || !user.usuario) return true;
    const p = String(user.perfil || user.rol || '').toLowerCase();
    const u = String(user.usuario || '').toLowerCase();
    return p.includes('admin') || u === 'admin' || u === '41457466';
  }
  function obtenerTratamientoUsuario(user) {
    if (checkIsAdmin(user)) return 'Dr. José Castillo';
    return String(user.nombres || user.nombre || 'Secretaria').trim();
  }
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function obtenerHoraActual() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  window.toggleCortanaPanel = toggleCortanaPanel;
  window.openCortanaPanel = openCortanaPanel;
  window.closeCortanaPanel = closeCortanaPanel;
  window.cortanaAbrirChat = openCortanaPanel;
  window.abrirChatInlineCortana = openCortanaPanel;
  window.limpiarChatCortana = limpiarMensajesCortana;
  window.cortanaFiltrarEnTabla = function(target) {
    // 1. Auto-cerrar inmediatamente el panel de Cortana para dejar 100% visible la lista de pacientes
    closeCortanaPanel();
    const inp = document.getElementById('aiSmartSearchInput') || document.getElementById('cortanaSearchInput') || document.getElementById('mobileQuickSearchInput');
    if (inp) {
      inp.value = target;
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (typeof window.applyFilters === 'function') window.applyFilters(true);

    // 2. Hacer scroll suave e iluminar la fila localizada en la tabla
    setTimeout(() => {
      const table = document.getElementById('reportTable');
      if (table) {
        table.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(r => {
          if (r.innerText.toUpperCase().includes(String(target).toUpperCase())) {
            r.classList.add('cortana-row-highlight');
            setTimeout(() => r.classList.remove('cortana-row-highlight'), 4000);
          }
        });
      }
    }, 180);
  };
})();
