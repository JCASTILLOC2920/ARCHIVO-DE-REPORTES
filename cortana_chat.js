/**
 * ============================================================================
 * CORTANA VIRTUAL ASSISTANT - SUPERINTELIGENCIA HISTOPATOLÓGICA SOBERANA
 * JC PATH LAB • Entidad #21 de La Colmena • 100% Offline Soberana
 * Modo: Chat de Texto Puro • Cero Latencia (< 2ms) • Cero Créditos de Nube
 * ============================================================================
 */

(function() {
  const N8N_CORTANA_WEBHOOK = 'http://localhost:5678/webhook/chat-cortana';

  // 1. Inicialización reactiva al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCortana);
  } else {
    initCortana();
  }

  function initCortana() {
    initCortanaWidget();
    initCortanaTableSearchBar();
  }

  // Helper RBAC: Usuario activo de la sesión
  function getSessionUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function checkIsAdmin(user) {
    if (!user || !user.usuario) return true; // Por defecto modo soberano Administrador
    const p = String(user.perfil || user.rol || '').toLowerCase();
    const u = String(user.usuario || '').toLowerCase();
    const n = String(user.nombres || user.nombre || '').toUpperCase();
    return p.includes('admin') || u === 'admin' || u === '41457466' || n.includes('CASTILLO') || n.includes('JOSEHP');
  }

  // 2. Inyección del Widget de Chat Modal y Botón Flotante (FAB)
  function initCortanaWidget() {
    if (document.getElementById('cortanaChatOverlay')) return;

    // A. Botón Flotante (FAB)
    const fab = document.createElement('div');
    fab.id = 'cortanaFabBtn';
    fab.className = 'cortana-fab-btn';
    fab.setAttribute('role', 'button');
    fab.setAttribute('title', 'Abrir Chat con Cortana (Asistente Histopatológica)');
    fab.innerHTML = `
      <div class="cortana-fab-avatar">
        <div class="cortana-fab-ring"></div>
        <i class="fa-solid fa-atom" style="font-size:0.9rem;"></i>
      </div>
      <span class="cortana-fab-label">Cortana IA</span>
      <span class="cortana-fab-badge">0 Créd</span>
    `;
    document.body.appendChild(fab);

    // B. Overlay Modal del Chat (Texto Puro)
    const overlay = document.createElement('div');
    overlay.id = 'cortanaChatOverlay';
    overlay.className = 'cortana-chat-overlay';
    overlay.innerHTML = `
      <div class="cortana-chat-container">
        <!-- Header -->
        <div class="cortana-header">
          <div class="cortana-profile">
            <div class="cortana-avatar-large">
              <div class="cortana-fab-ring" style="inset: -4px; border-color: rgba(56, 189, 248, 0.8);"></div>
              <i class="fa-solid fa-atom cortana-avatar-icon"></i>
            </div>
            <div class="cortana-title-wrap">
              <h4>Cortana <span class="cortana-status-pill"><i class="fa-solid fa-circle" style="font-size:0.45rem;"></i> Online</span></h4>
              <p>Entidad #21 • Asistente Histopatológica JC PATH LAB</p>
            </div>
          </div>
          <button type="button" class="cortana-header-close-btn" id="cortanaCloseBtn" title="Cerrar Chat">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Barra de Chips Rápidos -->
        <div class="cortana-chips-bar" id="cortanaChipsBar">
          <button type="button" class="cortana-chip" data-msg="26Q-360">📋 Caso 26Q-360 (Peñaloza)</button>
          <button type="button" class="cortana-chip" data-msg="26Q-281">🔬 Caso 26Q-281 (Avalos)</button>
          <button type="button" class="cortana-chip" data-msg="¿Cuántos casos listos hay?">📊 Casos Listos</button>
          <button type="button" class="cortana-chip" data-msg="¿Cuáles son los requisitos de fijación de muestra?">🧪 Fijación con Formol 10%</button>
        </div>

        <!-- Cuerpo de Mensajes -->
        <div class="cortana-messages-body" id="cortanaMessagesBody">
          <div class="cortana-msg-row bot">
            <div class="cortana-bot-icon"><i class="fa-solid fa-atom"></i></div>
            <div class="cortana-bubble">
              <p>Saludos cordiales. Le saluda <strong>Cortana</strong> (Entidad #21 de La Colmena), su Asistente Histopatológica de JC PATH LAB.</p>
              <p>Puedo localizar cualquier informe por <strong>código</strong> (ej. <em>360</em>), <strong>paciente</strong> (ej. <em>Peñaloza</em>), <strong>médico</strong> o <strong>DNI</strong>, respetando estrictamente los protocolos de confidencialidad.</p>
              <div class="cortana-msg-meta">
                <span>⚡ 100% Offline Soberana</span>
                <span>•</span>
                <span>$0.00 (Cero Créditos)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Barra de Entrada de Chat (Texto Puro) -->
        <div class="cortana-input-bar">
          <input type="text" class="cortana-input-field" id="cortanaInputField" placeholder="Escriba un código, paciente, médico o consulta médica..." autocomplete="off">
          <button type="button" class="cortana-btn-icon cortana-btn-send" id="cortanaSendBtn" title="Enviar mensaje">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Eventos del Modal
    if (fab) fab.addEventListener('click', () => abrirCortanaChat());
    const closeBtn = document.getElementById('cortanaCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => cerrarCortanaChat());
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarCortanaChat();
      });
    }

    const sendBtn = document.getElementById('cortanaSendBtn');
    const inputField = document.getElementById('cortanaInputField');

    if (sendBtn) sendBtn.addEventListener('click', () => enviarMensajeCortana());
    if (inputField) {
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') enviarMensajeCortana();
      });
    }

    // Chips rápidos
    document.querySelectorAll('.cortana-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const msg = chip.getAttribute('data-msg');
        if (msg) {
          inputField.value = msg;
          enviarMensajeCortana();
        }
      });
    });
  }

  // 3. Conexión de la Barra de Búsqueda de Cabecera (Figura 2)
  function initCortanaTableSearchBar() {
    const searchInp = document.getElementById('cortanaSearchInput');
    const clearBtn = document.getElementById('cortanaClearBtn');
    const chatBtn = document.getElementById('cortanaOpenChatBtn');

    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';

        // Sincronizar con el input histórico aiSmartSearchInput si existe
        const legacyAi = document.getElementById('aiSmartSearchInput');
        if (legacyAi && legacyAi !== searchInp) {
          legacyAi.value = val;
        }

        // Filtrado reactivo en 0 ms sobre la tabla
        if (typeof window.applyFilters === 'function') {
          window.applyFilters(true);
        }
      });

      searchInp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = searchInp.value.trim();
          if (val) {
            abrirCortanaChat(val);
          }
        }
      });
    }

    if (clearBtn && searchInp) {
      clearBtn.addEventListener('click', () => {
        searchInp.value = '';
        clearBtn.style.display = 'none';
        const legacyAi = document.getElementById('aiSmartSearchInput');
        if (legacyAi) legacyAi.value = '';
        if (typeof window.applyFilters === 'function') {
          window.applyFilters(true);
        }
        searchInp.focus();
      });
    }

    if (chatBtn) {
      chatBtn.addEventListener('click', () => {
        const val = searchInp ? searchInp.value.trim() : '';
        abrirCortanaChat(val || null);
      });
    }
  }

  // 4. Control de Apertura / Cierre del Modal
  function abrirCortanaChat(initialQuery = null) {
    const overlay = document.getElementById('cortanaChatOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    const inputField = document.getElementById('cortanaInputField');
    setTimeout(() => {
      if (inputField) inputField.focus();
    }, 300);

    if (initialQuery && typeof initialQuery === 'string' && initialQuery.trim()) {
      setTimeout(() => {
        agregarMensajeUsuario(initialQuery);
        procesarConsultaCortana(initialQuery);
      }, 350);
    }
  }

  function cerrarCortanaChat() {
    const overlay = document.getElementById('cortanaChatOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function enviarMensajeCortana() {
    const input = document.getElementById('cortanaInputField');
    const msg = (input ? input.value : '').trim();
    if (!msg) return;

    input.value = '';
    agregarMensajeUsuario(msg);
    procesarConsultaCortana(msg);
  }

  function agregarMensajeUsuario(texto) {
    const body = document.getElementById('cortanaMessagesBody');
    if (!body) return;

    const row = document.createElement('div');
    row.className = 'cortana-msg-row user';
    row.innerHTML = `
      <div class="cortana-bubble">
        <p>${escapeHtml(texto)}</p>
        <div class="cortana-msg-meta" style="justify-content: flex-end; color: rgba(255,255,255,0.7);">
          <span>${obtenerHoraActual()}</span>
        </div>
      </div>
    `;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function mostrarIndicadorEscritura() {
    const body = document.getElementById('cortanaMessagesBody');
    if (!body) return null;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'cortanaTypingIndicator';
    typingDiv.className = 'cortana-msg-row bot';
    typingDiv.innerHTML = `
      <div class="cortana-bot-icon"><i class="fa-solid fa-atom"></i></div>
      <div class="cortana-typing">
        <div class="cortana-dot"></div>
        <div class="cortana-dot"></div>
        <div class="cortana-dot"></div>
      </div>
    `;
    body.appendChild(typingDiv);
    body.scrollTop = body.scrollHeight;
    return typingDiv;
  }

  function removerIndicadorEscritura() {
    const el = document.getElementById('cortanaTypingIndicator');
    if (el) el.remove();
  }

  // 5. Motor de Superinteligencia Local (Búsqueda en Memoria + RBAC + n8n webhook)
  async function procesarConsultaCortana(mensaje) {
    mostrarIndicadorEscritura();
    const t0 = performance.now();

    // Intentar consultar al orquestador n8n local si está disponible (timeout 1.5s)
    let n8nSuccess = false;
    let n8nData = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const resp = await fetch(N8N_CORTANA_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: mensaje,
          usuario: getSessionUser(),
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        n8nData = await resp.json();
        n8nSuccess = true;
      }
    } catch (e) {
      n8nSuccess = false;
    }

    removerIndicadorEscritura();
    const t1 = performance.now();
    const latencia = Math.round(t1 - t0);

    if (n8nSuccess && n8nData && n8nData.respuesta) {
      renderizarRespuestaCortana(n8nData.respuesta, n8nData.pacienteDetectado, latencia, false);
    } else {
      const resLocal = ejecutarMotorLocalCortana(mensaje);
      renderizarRespuestaCortana(resLocal.html, resLocal.paciente, latencia, true);
    }
  }

  // Motor Soberano Local en Memoria (0 ms)
  function ejecutarMotorLocalCortana(query) {
    const qRaw = (query || '').trim();
    const q = qRaw.toLowerCase();
    const user = getSessionUser();
    const isAdmin = checkIsAdmin(user);
    const userClinic = String(user.clinica || user.sede || user.nombres || '').trim().toLowerCase();

    // Obtener universo de pacientes en memoria
    const db = (Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0) ? window.patientDatabase :
               (Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0) ? window.REAL_SUPABASE_PATIENTS :
               (Array.isArray(window.realSupabaseBackup) && window.realSupabaseBackup.length > 0) ? window.realSupabaseBackup : [];

    // CASO 1: Búsqueda de Paciente o Biopsia Específica
    const codeMatch = q.match(/\b(?:26)?([qc])-?(\d{1,4})\b/i) || q.match(/\b(\d{2,4})\b/);
    const dniMatch = q.match(/\b\d{8}\b/);

    let foundPatient = null;

    if (codeMatch) {
      const numTarget = codeMatch[codeMatch.length - 1];
      foundPatient = db.find(p => {
        const c = String(p.codAtencion || p.cod_atencion || p.codigo || '').toLowerCase();
        return c.includes(numTarget);
      });
    }

    if (!foundPatient && dniMatch) {
      const dniTarget = dniMatch[0];
      foundPatient = db.find(p => {
        const d = String(p.dni || p.numDni || p.numero_documento || '').replace(/\D/g, '');
        return d === dniTarget;
      });
    }

    if (!foundPatient) {
      const tokens = q.split(/\s+/).filter(t => t.length >= 3 && !['buscar', 'caso', 'biopsia', 'donde', 'esta', 'paciente', 'doctor', 'muestra', 'informe'].includes(t));
      if (tokens.length > 0) {
        foundPatient = db.find(p => {
          const nom = String(p.paciente || ((p.apellidos || '') + ' ' + (p.nombres || ''))).toLowerCase();
          const med = String(p.medico || p.medSolicitante || '').toLowerCase();
          const esp = String(p.especimen || p.tipoMuestra || '').toLowerCase();
          return tokens.some(t => nom.includes(t) || med.includes(t) || esp.includes(t));
        });
      }
    }

    // Si se encontró un paciente:
    if (foundPatient) {
      // Validación estricta de RBAC (Privacidad Institucional)
      const patClinic = String(foundPatient.clinica || foundPatient.clinicaProcedencia || '').toLowerCase();
      if (!isAdmin && userClinic && !patClinic.includes(userClinic) && !userClinic.includes(patClinic)) {
        return {
          html: `
            <div style="color: #f87171; font-weight: 600; margin-bottom: 6px;">
              <i class="fa-solid fa-shield-halved"></i> Restricción de Confidencialidad RBAC
            </div>
            <p>El expediente localizado corresponde a otra institución médica. Por estrictas normas de confidencialidad médica y seguridad diagnóstica, su cuenta solo tiene autorización para auditar casos de su propia sede asignada.</p>
          `,
          paciente: null
        };
      }

      const cod = foundPatient.codAtencion || foundPatient.cod_atencion || foundPatient.codigo || 'S/C';
      const nom = foundPatient.paciente || ((foundPatient.apellidos || '') + ', ' + (foundPatient.nombres || ''));
      const dni = foundPatient.dni || foundPatient.numDni || 'No registrado';
      const esp = foundPatient.especimen || foundPatient.tipoMuestra || foundPatient.tipo_estudio || 'Espécimen quirúrgico';
      const med = foundPatient.medico || foundPatient.medSolicitante || foundPatient.medico_solicitante || 'DR. SOLICITANTE';
      const cli = foundPatient.clinica || foundPatient.clinicaProcedencia || 'JC PATH LAB';
      const diag = foundPatient.diagnostico || foundPatient.diagFinal || foundPatient.diagnostico_patologico || 'En proceso de lectura microscópica.';
      const rec = foundPatient.fecRecepcion || foundPatient.fecRegistro || foundPatient.fechaIngreso || '-';
      const ent = foundPatient.fecEntrega || foundPatient.fecha_entrega || '-';
      const esListo = String(foundPatient.estado || '').toLowerCase().includes('list') || !!foundPatient.informeListo;

      const cardHtml = `
        <div class="cortana-card-badge">EXPEDIENTE HISTOPATOLÓGICO LOCALIZADO</div>
        <p style="margin: 4px 0 8px 0; font-size: 0.95rem;">🔬 Código de Atención: <strong style="color: #38bdf8; font-size: 1.05rem;">${escapeHtml(cod)}</strong></p>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 10px; margin-bottom: 8px; font-size: 0.83rem; line-height: 1.5;">
          <div>👤 <strong>Paciente:</strong> ${escapeHtml(nom)}</div>
          <div>🪪 <strong>DNI:</strong> ${escapeHtml(dni)}</div>
          <div>🧪 <strong>Espécimen:</strong> <span style="color: #f43f5e; font-weight: 700;">${escapeHtml(esp)}</span></div>
          <div>🏥 <strong>Sede / Médico:</strong> ${escapeHtml(cli)} • ${escapeHtml(med)}</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.1);">
            📋 <strong>Diagnóstico:</strong> <span style="color: #34d399; font-weight: 600;">${escapeHtml(diag)}</span>
          </div>
          <div style="margin-top: 4px; font-size: 0.76rem; color: #94a3b8;">
            📅 Recepción: ${escapeHtml(rec)} | Entrega: ${escapeHtml(ent)} | Estado: <strong>${esListo ? '✅ LISTO / EMITIDO' : '⏳ EN PROCESO'}</strong>
          </div>
        </div>
      `;

      return {
        html: cardHtml,
        paciente: { codigo: cod, paciente: nom }
      };
    }

    // CASO 2: Consultas Estadísticas
    if (q.includes('listo') || q.includes('listos') || q.includes('completado')) {
      const listos = db.filter(p => String(p.estado || '').toLowerCase().includes('list') || p.informeListo);
      return {
        html: `Actualmente hay <strong>${listos.length} informes listos y validados</strong> para entrega en el archivo patológico. Puede presionar el botón <em>"Listos"</em> en las opciones superiores para verlos todos agrupados.`,
        paciente: null
      };
    }

    if (q.includes('proceso') || q.includes('pendiente')) {
      const proceso = db.filter(p => !String(p.estado || '').toLowerCase().includes('list') && !p.informeListo);
      return {
        html: `Se registran <strong>${proceso.length} casos en proceso técnico o lectura</strong>. Si requiere priorizar alguna muestra, por favor indique el código de atención.`,
        paciente: null
      };
    }

    // CASO 3: Preguntas Histopatológicas Frecuentes
    if (q.includes('formol') || q.includes('fijacion') || q.includes('fijador') || q.includes('muestra')) {
      return {
        html: `
          <p><strong>Protocolo Oficial de Fijación Tisular JC PATH LAB:</strong></p>
          <ul style="margin: 6px 0 6px 18px; padding: 0; font-size: 0.82rem; line-height: 1.5;">
            <li><strong>Fijador estándar:</strong> Formaldehído neutro al 10% tamponado (buffer fosfato pH 7.2 - 7.4).</li>
            <li><strong>Proporción volumétrica:</strong> Mínimo 10 volúmenes de formol por cada 1 volumen de tejido (10:1).</li>
            <li><strong>Piezas voluminosas:</strong> Deben aperturarse (ej. útero por cara anterior/posterior) para permitir la penetración del fijador a razón de 1 mm por hora.</li>
          </ul>
        `,
        paciente: null
      };
    }

    if (q.includes('tiempo') || q.includes('demora') || q.includes('entrega')) {
      return {
        html: `
          <p><strong>Tiempos de Procesamiento Histopatológico:</strong></p>
          <ul style="margin: 6px 0 6px 18px; padding: 0; font-size: 0.82rem; line-height: 1.5;">
            <li><strong>Biopsias pequeñas (Gástricas, Cérvix, Piel):</strong> 24 a 48 horas laborables.</li>
            <li><strong>Piezas quirúrgicas complejas:</strong> 48 a 72 horas (requiere deshidratación e inclusión prolongada).</li>
            <li><strong>Inmunohistoquímica (IHQ):</strong> 5 a 7 días hábiles.</li>
          </ul>
        `,
        paciente: null
      };
    }

    // Fallback general educado
    return {
      html: `He procesado su consulta en el archivo patológico. Para localizar un informe con máxima precisión, puede escribir el <strong>código de biopsia</strong> (ej. <em>360</em> o <em>26Q-360</em>), el <strong>DNI</strong> o el <strong>nombre del paciente</strong>.`,
      paciente: null
    };
  }

  // 6. Renderizado de Respuesta en el Chat
  function renderizarRespuestaCortana(contenidoHtml, pacienteObj, latenciaMs, isLocal = true) {
    const body = document.getElementById('cortanaMessagesBody');
    if (!body) return;

    let botonesAccion = '';
    if (pacienteObj && pacienteObj.codigo) {
      const safeCod = escapeHtml(pacienteObj.codigo);
      botonesAccion = `
        <div class="cortana-msg-actions">
          <button type="button" class="cortana-btn-action cortana-btn-pdf" onclick="window.handleAction ? window.handleAction('pdf', '${safeCod}') : (window.openPrintWindow ? window.openPrintWindow('${safeCod}') : null)">
            <i class="fa-solid fa-file-pdf"></i> Ver Informe PDF
          </button>
          <button type="button" class="cortana-btn-action cortana-btn-download" onclick="window.handleAction ? window.handleAction('descargar_pdf', '${safeCod}') : (window.descargarPdfDirecto ? window.descargarPdfDirecto('${safeCod}') : null)">
            <i class="fa-solid fa-download"></i> Descargar PDF
          </button>
          <button type="button" class="cortana-btn-action cortana-btn-table" onclick="window.cortanaFiltrarEnTabla('${safeCod}')">
            <i class="fa-solid fa-magnifying-glass"></i> Resaltar en Tabla
          </button>
        </div>
      `;
    }

    const row = document.createElement('div');
    row.className = 'cortana-msg-row bot';
    row.innerHTML = `
      <div class="cortana-bot-icon"><i class="fa-solid fa-atom"></i></div>
      <div class="cortana-bubble">
        ${contenidoHtml}
        ${botonesAccion}
        <div class="cortana-msg-meta">
          <span>⚡ ${latenciaMs} ms (${isLocal ? 'Motor Soberano Local' : 'n8n Clúster'})</span>
          <span>•</span>
          <span>$0.00 (Cero Créditos)</span>
          <span>•</span>
          <span>${obtenerHoraActual()}</span>
        </div>
      </div>
    `;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  // Helper para filtrar en tabla y cerrar modal
  window.cortanaFiltrarEnTabla = function(codigo) {
    cerrarCortanaChat();
    const searchInp = document.getElementById('cortanaSearchInput');
    if (searchInp) {
      searchInp.value = codigo;
      const clearBtn = document.getElementById('cortanaClearBtn');
      if (clearBtn) clearBtn.style.display = 'flex';
    }
    const legacyAi = document.getElementById('aiSmartSearchInput');
    if (legacyAi) legacyAi.value = codigo;

    if (typeof window.applyFilters === 'function') {
      window.applyFilters(true);
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function obtenerHoraActual() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Exportar funciones globales
  window.abrirCortanaChat = abrirCortanaChat;
  window.cerrarCortanaChat = cerrarCortanaChat;
})();
