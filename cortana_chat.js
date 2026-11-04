/**
 * ============================================================================
 * CORTANA - COORDINACIÓN DE INFORMES Y ATENCIÓN MÉDICA
 * JC PATH LAB • Laboratorio de Anatomía Patológica y Citología Diagnóstica
 * Dirección: Dr. José Castillo Cuenca • Lima, Perú
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
    if (!user || !user.usuario) return true;
    const p = String(user.perfil || user.rol || '').toLowerCase();
    const u = String(user.usuario || '').toLowerCase();
    const n = String(user.nombres || user.nombre || '').toUpperCase();
    return p.includes('admin') || u === 'admin' || u === '41457466' || n.includes('CASTILLO') || n.includes('JOSEHP');
  }

  function obtenerTratamientoUsuario(user) {
    if (checkIsAdmin(user)) return 'Dr. Castillo';
    const nom = String(user.nombres || user.nombre || '').trim();
    if (nom) {
      if (nom.toUpperCase().includes('DR') || nom.toUpperCase().includes('MED')) return nom;
      return `estimado/a ${nom}`;
    }
    return 'doctor/a';
  }

  // 2. Inyección del Widget de Chat y Botón Flotante
  function initCortanaWidget() {
    if (document.getElementById('cortanaChatOverlay')) return;

    // A. Botón Flotante
    const fab = document.createElement('div');
    fab.id = 'cortanaFabBtn';
    fab.className = 'cortana-fab-btn';
    fab.setAttribute('role', 'button');
    fab.setAttribute('title', 'Conversar con Cortana (Atención de Informes JC PATH LAB)');
    fab.innerHTML = `
      <div class="cortana-fab-avatar">
        <i class="fa-solid fa-headset" style="font-size:0.95rem;"></i>
      </div>
      <div class="cortana-fab-text">
        <span class="cortana-fab-label">Cortana</span>
        <span class="cortana-fab-sub">Atención de Informes</span>
      </div>
    `;
    document.body.appendChild(fab);

    // B. Overlay Modal del Chat
    const user = getSessionUser();
    const saludoNombre = obtenerTratamientoUsuario(user);

    const overlay = document.createElement('div');
    overlay.id = 'cortanaChatOverlay';
    overlay.className = 'cortana-chat-overlay';
    overlay.innerHTML = `
      <div class="cortana-chat-container">
        <!-- Header -->
        <div class="cortana-header">
          <div class="cortana-profile">
            <div class="cortana-avatar-large">
              <i class="fa-solid fa-headset cortana-avatar-icon"></i>
              <span class="cortana-online-dot" title="En línea"></span>
            </div>
            <div class="cortana-title-wrap">
              <h4>Cortana <span class="cortana-status-pill"><i class="fa-solid fa-circle" style="font-size:0.45rem;"></i> En línea</span></h4>
              <p>Coordinación de Informes • JC PATH LAB</p>
            </div>
          </div>
          <button type="button" class="cortana-header-close-btn" id="cortanaCloseBtn" title="Cerrar conversación">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Barra de Sugerencias Frecuentes -->
        <div class="cortana-chips-bar" id="cortanaChipsBar">
          <button type="button" class="cortana-chip" data-msg="¿Cómo está el informe de Elizabeth Peñaloza (26Q-360)?">📋 Caso 26Q-360 (Peñaloza)</button>
          <button type="button" class="cortana-chip" data-msg="¿Se encuentra listo el caso 26Q-281 de Carlos Avalos?">🔬 Caso 26Q-281 (Avalos)</button>
          <button type="button" class="cortana-chip" data-msg="¿Cuántos informes están listos para recojo hoy?">📊 Informes listos hoy</button>
          <button type="button" class="cortana-chip" data-msg="¿Cuáles son las indicaciones para envío de biopsias en formol?">🧪 Envío de muestras en formol</button>
        </div>

        <!-- Cuerpo de Mensajes -->
        <div class="cortana-messages-body" id="cortanaMessagesBody">
          <div class="cortana-msg-row bot">
            <div class="cortana-bot-icon"><i class="fa-solid fa-headset"></i></div>
            <div class="cortana-bubble">
              <p>Buenas tardes, <strong>${escapeHtml(saludoNombre)}</strong>. Le saluda <strong>Cortana</strong>, de la coordinación de recepción y entrega de informes de <strong>JC PATH LAB</strong>.</p>
              <p>Estoy para asistirle en la consulta de cualquier biopsia o citología. Indíqueme por favor el <strong>código de muestra</strong> (ej. <em>360</em>), el <strong>nombre del paciente</strong> o su <strong>DNI</strong> y de inmediato le facilito el estado y su documento en PDF.</p>
              <div class="cortana-msg-meta">
                <span>Atención médica en línea</span>
                <span>•</span>
                <span>${obtenerHoraActual()}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Barra de Entrada de Chat -->
        <div class="cortana-input-bar">
          <input type="text" class="cortana-input-field" id="cortanaInputField" placeholder="Escriba su consulta aquí (ej. '¿Ya está listo el caso 360?')..." autocomplete="off">
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

        const legacyAi = document.getElementById('aiSmartSearchInput');
        if (legacyAi && legacyAi !== searchInp) {
          legacyAi.value = val;
        }

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
    }, 280);

    if (initialQuery && typeof initialQuery === 'string' && initialQuery.trim()) {
      setTimeout(() => {
        agregarMensajeUsuario(initialQuery);
        procesarConsultaHumana(initialQuery);
      }, 320);
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
    procesarConsultaHumana(msg);
  }

  function agregarMensajeUsuario(texto) {
    const body = document.getElementById('cortanaMessagesBody');
    if (!body) return;

    const row = document.createElement('div');
    row.className = 'cortana-msg-row user';
    row.innerHTML = `
      <div class="cortana-bubble">
        <p>${escapeHtml(texto)}</p>
        <div class="cortana-msg-meta" style="justify-content: flex-end; color: rgba(255,255,255,0.75);">
          <span>${obtenerHoraActual()}</span>
        </div>
      </div>
    `;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function mostrarIndicadorEscribiendo() {
    const body = document.getElementById('cortanaMessagesBody');
    if (!body) return null;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'cortanaTypingIndicator';
    typingDiv.className = 'cortana-msg-row bot';
    typingDiv.innerHTML = `
      <div class="cortana-bot-icon"><i class="fa-solid fa-headset"></i></div>
      <div class="cortana-typing">
        <span style="font-size: 0.75rem; color: #94a3b8; margin-right: 6px;">Cortana está escribiendo...</span>
        <div class="cortana-dot"></div>
        <div class="cortana-dot"></div>
        <div class="cortana-dot"></div>
      </div>
    `;
    body.appendChild(typingDiv);
    body.scrollTop = body.scrollHeight;
    return typingDiv;
  }

  function removerIndicadorEscribiendo() {
    const el = document.getElementById('cortanaTypingIndicator');
    if (el) el.remove();
  }

  // 5. Motor de Respuesta Humana Realista (Con Pausa y Redacción Médica Cálida)
  async function procesarConsultaHumana(mensaje) {
    mostrarIndicadorEscribiendo();

    // Pausa humana realista (1200 a 1900 ms) para simular que la secretaria busca el registro en el archivo
    const delayHumano = Math.floor(Math.random() * 600) + 1200;

    let respuestaFinal = null;

    // Verificar si n8n local responde con personalización
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

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
        const data = await resp.json();
        if (data && data.respuesta) {
          respuestaFinal = {
            html: formatearMarkdownHumano(data.respuesta),
            paciente: data.pacienteDetectado || null
          };
        }
      }
    } catch (e) {
      respuestaFinal = null;
    }

    if (!respuestaFinal) {
      respuestaFinal = redactarRespuestaHumanaLocal(mensaje);
    }

    setTimeout(() => {
      removerIndicadorEscribiendo();
      renderizarRespuestaCortana(respuestaFinal.html, respuestaFinal.paciente);
    }, delayHumano);
  }

  // Redactor Humano Local (Indistinguible de una Secretaria Médica del Laboratorio)
  function redactarRespuestaHumanaLocal(query) {
    const qRaw = (query || '').trim();
    const q = qRaw.toLowerCase();
    const user = getSessionUser();
    const isAdmin = checkIsAdmin(user);
    const userClinic = String(user.clinica || user.sede || user.nombres || '').trim().toLowerCase();
    const nombreInterlocutor = obtenerTratamientoUsuario(user);

    // Saludos directos
    if (/^(hola|buenos d[ií]as|buenas tardes|buenas noches|saludos|que tal|c[oó]mo est[aá]s?)/i.test(q) && q.split(/\s+/).length <= 4) {
      return {
        html: `
          <p>Muy buenas tardes, ${escapeHtml(nombreInterlocutor)}. Un gusto saludarle. Le habla Cortana, de la coordinación de informes de JC PATH LAB.</p>
          <p>¿En qué puedo colaborarle el día de hoy? Si tiene alguna consulta sobre una biopsia o el estado de algún paciente, por favor facilíteme los datos y con gusto reviso el sistema.</p>
        `,
        paciente: null
      };
    }

    // Base de datos de pacientes en memoria
    const db = (Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0) ? window.patientDatabase :
               (Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0) ? window.REAL_SUPABASE_PATIENTS :
               (Array.isArray(window.realSupabaseBackup) && window.realSupabaseBackup.length > 0) ? window.realSupabaseBackup : [];

    // Búsqueda por código de atención (ej. 360, 26Q-360, Q-360, 281)
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
      const tokens = q.split(/\s+/).filter(t => t.length >= 3 && !['buscar', 'caso', 'biopsia', 'donde', 'esta', 'paciente', 'doctor', 'muestra', 'informe', 'favor', 'puede', 'decir', 'como'].includes(t));
      if (tokens.length > 0) {
        foundPatient = db.find(p => {
          const nom = String(p.paciente || ((p.apellidos || '') + ' ' + (p.nombres || ''))).toLowerCase();
          const med = String(p.medico || p.medSolicitante || '').toLowerCase();
          const esp = String(p.especimen || p.tipoMuestra || '').toLowerCase();
          return tokens.some(t => nom.includes(t) || med.includes(t) || esp.includes(t));
        });
      }
    }

    // SI SE ENCONTRÓ UN EXPEDIENTE:
    if (foundPatient) {
      const patClinic = String(foundPatient.clinica || foundPatient.clinicaProcedencia || '').toLowerCase();

      // Validación estricta de RBAC explicada humanamente
      if (!isAdmin && userClinic && !patClinic.includes(userClinic) && !userClinic.includes(patClinic)) {
        return {
          html: `
            <p>Estimado/a doctor/a, acabo de ubicar la muestra en el archivo, pero observo que corresponde a otra institución médica asociada.</p>
            <p>Por estrictas políticas de confidencialidad médica y la normativa del laboratorio, solo tengo autorización para compartir los informes correspondientes a su sede asignada. Si requiere coordinar este caso en particular, con todo gusto puede comunicarse directamente con la dirección del laboratorio.</p>
          `,
          paciente: null
        };
      }

      const cod = foundPatient.codAtencion || foundPatient.cod_atencion || foundPatient.codigo || 'S/C';
      const nom = foundPatient.paciente || ((foundPatient.apellidos || '') + ', ' + (foundPatient.nombres || ''));
      const dni = foundPatient.dni || foundPatient.numDni || 'Sin registrar';
      const esp = foundPatient.especimen || foundPatient.tipoMuestra || foundPatient.tipo_estudio || 'Biopsia diagnóstica';
      const med = foundPatient.medico || foundPatient.medSolicitante || foundPatient.medico_solicitante || 'Médico tratante';
      const cli = foundPatient.clinica || foundPatient.clinicaProcedencia || 'JC PATH LAB';
      const diag = foundPatient.diagnostico || foundPatient.diagFinal || foundPatient.diagnostico_patologico || 'En proceso de estudio histopatológico.';
      const rec = foundPatient.fecRecepcion || foundPatient.fecRegistro || foundPatient.fechaIngreso || '-';
      const ent = foundPatient.fecEntrega || foundPatient.fecha_entrega || '-';
      const esListo = String(foundPatient.estado || '').toLowerCase().includes('list') || !!foundPatient.informeListo;

      let mensajeHumano = '';
      if (esListo) {
        mensajeHumano = `
          <p>Doctor, ya verifiqué en el sistema patológico. La muestra de <strong>${escapeHtml(nom)}</strong> (Código <strong>${escapeHtml(cod)}</strong>) ya concluyó su lectura con el <strong>Dr. José Castillo</strong> y el informe oficial está <strong>listo y firmado</strong>.</p>
          <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 12px; margin: 8px 0; font-size: 0.83rem; line-height: 1.55;">
            <div>👤 <strong>Paciente:</strong> ${escapeHtml(nom)} (DNI: ${escapeHtml(dni)})</div>
            <div>🧪 <strong>Muestra:</strong> <span style="color: #f43f5e; font-weight: 700;">${escapeHtml(esp)}</span></div>
            <div>🏥 <strong>Sede / Médico:</strong> ${escapeHtml(cli)} • ${escapeHtml(med)}</div>
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.12);">
              📋 <strong>Diagnóstico emitido:</strong> <span style="color: #34d399; font-weight: 600;">${escapeHtml(diag)}</span>
            </div>
            <div style="margin-top: 4px; font-size: 0.76rem; color: #94a3b8;">
              📅 Ingreso: ${escapeHtml(rec)} | Entrega programada: ${escapeHtml(ent)}
            </div>
          </div>
          <p>Le dejo aquí abajo los accesos para que pueda abrir el informe en PDF o descargarlo directamente. Si necesita alguna precisión adicional sobre la lámina, me avisa.</p>
        `;
      } else {
        mensajeHumano = `
          <p>Doctor, revisé el estado de la muestra de <strong>${escapeHtml(nom)}</strong> (Código <strong>${escapeHtml(cod)}</strong>). En este momento se encuentra <strong>en proceso técnico</strong> en el área de corte e inclusión histológica.</p>
          <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 10px; padding: 12px; margin: 8px 0; font-size: 0.83rem; line-height: 1.55;">
            <div>👤 <strong>Paciente:</strong> ${escapeHtml(nom)} (DNI: ${escapeHtml(dni)})</div>
            <div>🧪 <strong>Muestra:</strong> ${escapeHtml(esp)}</div>
            <div>🏥 <strong>Sede / Médico:</strong> ${escapeHtml(cli)} • ${escapeHtml(med)}</div>
            <div style="margin-top: 4px; font-size: 0.76rem; color: #fbbf24;">
              ⏳ <strong>Estado:</strong> En proceso de láminas H&E | Fecha de entrega estimada: <strong>${escapeHtml(ent)}</strong>
            </div>
          </div>
          <p>Apenas el Dr. Castillo complete la lectura y valide el documento, le aparecerá habilitado para descarga de inmediato.</p>
        `;
      }

      return {
        html: mensajeHumano,
        paciente: { codigo: cod, paciente: nom }
      };
    }

    // Consultas de cantidad o estado del día
    if (q.includes('listo') || q.includes('listos') || q.includes('hoy') || q.includes('entregar')) {
      const listos = db.filter(p => String(p.estado || '').toLowerCase().includes('list') || p.informeListo);
      return {
        html: `
          <p>Al momento tenemos <strong>${listos.length} informes validados y listos</strong> en bandeja para entrega y firma.</p>
          <p>Si gusta revisarlos todos juntos, puede usar el botón <em>"Listos"</em> en las opciones superiores de la tabla o indicarme el nombre de un paciente en particular.</p>
        `,
        paciente: null
      };
    }

    if (q.includes('proceso') || q.includes('pendientes') || q.includes('cuantos')) {
      const proceso = db.filter(p => !String(p.estado || '').toLowerCase().includes('list') && !p.informeListo);
      return {
        html: `
          <p>Tenemos <strong>${proceso.length} casos en fase técnica de laboratorio y lectura microscópica</strong>. El equipo está avanzando con los lotes según el orden cronológico de ingreso.</p>
        `,
        paciente: null
      };
    }

    // Orientación sobre manejo y fijación de muestras
    if (q.includes('formol') || q.includes('fijacion') || q.includes('fijador') || q.includes('muestra') || q.includes('recipiente')) {
      return {
        html: `
          <p>Con mucho gusto le recuerdo las pautas que nos pide el Dr. Castillo para la óptima preservación de las muestras:</p>
          <ul style="margin: 6px 0 8px 18px; padding: 0; font-size: 0.82rem; line-height: 1.55;">
            <li><strong>Fijador de rigor:</strong> Formaldehído neutro al 10% tamponado (buffer fosfato). Por favor evitar agua corriente o alcohol en piezas tisulares.</li>
            <li><strong>Proporción del frasco:</strong> El volumen de formol debe ser al menos 10 veces el tamaño de la muestra (10 a 1) para evitar autolisis central.</li>
            <li><strong>Piezas quirúrgicas voluminosas:</strong> En piezas como úteros o resecciones grandes, se aconseja una apertura longitudinal cuidadosa para facilitar la entrada inmediata del formol.</li>
          </ul>
          <p>Cualquier duda con una muestra especial, no dude en consultarme antes de remitirla.</p>
        `,
        paciente: null
      };
    }

    // Tiempos de entrega
    if (q.includes('tiempo') || q.includes('demora') || q.includes('cuanto tarda') || q.includes('plazo')) {
      return {
        html: `
          <p>Nuestros plazos habituales de entrega son los siguientes:</p>
          <ul style="margin: 6px 0 8px 18px; padding: 0; font-size: 0.82rem; line-height: 1.55;">
            <li><strong>Biopsias endoscópicas y pequeñas (gástricas, piel, cérvix):</strong> 24 a 48 horas laborables.</li>
            <li><strong>Piezas quirúrgicas con muestreo amplio:</strong> 48 a 72 horas para asegurar la adecuada deshidratación tisular.</li>
            <li><strong>Estudios especiales o Inmunohistoquímica (IHQ):</strong> 5 a 7 días hábiles.</li>
          </ul>
          <p>Si tiene alguna muestra urgente de un paciente hospitalizado, indíquemelo para coordinar con el Dr. Castillo su priorización.</p>
        `,
        paciente: null
      };
    }

    // Fallback natural
    return {
      html: `
        <p>Disculpe, estuve buscando en el registro pero no logré ubicar una coincidencia exacta con lo que me indicó.</p>
        <p>¿Podría por favor confirmarme el <strong>número de biopsia</strong> (ej. <em>360</em>), el <strong>apellido del paciente</strong> o su <strong>DNI</strong>? Con cualquiera de esos datos localizo el informe de inmediato.</p>
      `,
      paciente: null
    };
  }

  // 6. Renderizado de Respuesta en el Chat
  function renderizarRespuestaCortana(contenidoHtml, pacienteObj) {
    const body = document.getElementById('cortanaMessagesBody');
    if (!body) return;

    let botonesAccion = '';
    if (pacienteObj && pacienteObj.codigo) {
      const safeCod = escapeHtml(pacienteObj.codigo);
      botonesAccion = `
        <div class="cortana-msg-actions">
          <button type="button" class="cortana-btn-action cortana-btn-pdf" onclick="window.handleAction ? window.handleAction('pdf', '${safeCod}') : (window.openPrintWindow ? window.openPrintWindow('${safeCod}') : null)">
            <i class="fa-solid fa-file-pdf"></i> Abrir Informe PDF
          </button>
          <button type="button" class="cortana-btn-action cortana-btn-download" onclick="window.handleAction ? window.handleAction('descargar_pdf', '${safeCod}') : (window.descargarPdfDirecto ? window.descargarPdfDirecto('${safeCod}') : null)">
            <i class="fa-solid fa-download"></i> Descargar Copia
          </button>
          <button type="button" class="cortana-btn-action cortana-btn-table" onclick="window.cortanaFiltrarEnTabla('${safeCod}')">
            <i class="fa-solid fa-table-list"></i> Ubicar en Tabla
          </button>
        </div>
      `;
    }

    const row = document.createElement('div');
    row.className = 'cortana-msg-row bot';
    row.innerHTML = `
      <div class="cortana-bot-icon"><i class="fa-solid fa-headset"></i></div>
      <div class="cortana-bubble">
        ${contenidoHtml}
        ${botonesAccion}
        <div class="cortana-msg-meta">
          <span>Cortana • Atención JC PATH LAB</span>
          <span>•</span>
          <span>${obtenerHoraActual()}</span>
        </div>
      </div>
    `;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function formatearMarkdownHumano(texto) {
    if (!texto) return '';
    let html = escapeHtml(texto);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    return `<p>${html}</p>`;
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
