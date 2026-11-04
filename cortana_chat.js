/**
 * ============================================================================
 * CORTANA - ASISTENTE INTEGRADA EN LA BARRA DE BÚSQUEDA (INLINE CHAT)
 * JC PATH LAB • Coordinación de Informes y Atención Médica
 * 100% Integrada en el mismo lugar • NO TAPA LA VENTANA • Cero Créditos
 * ============================================================================
 */

(function() {
  const N8N_CORTANA_WEBHOOK = 'http://localhost:5678/webhook/chat-cortana';

  // Pool de frases humanas y amables que rotan dinámicamente
  const FRASES_PROACTIVAS = [
    'Hola, ¿te puedo ayudar a buscar algún resultado o paciente?',
    'Buenas tardes, ¿buscas algún código de biopsia o informe en particular?',
    'Hola, ¿deseas que localice alguna muestra o fecha de entrega?',
    '¿En qué resultado te colaboro el día de hoy?',
    'Buenas tardes, ¿necesitas que ubique a algún paciente o doctor en el archivo?',
    'Hola doctor/a, ¿te puedo ayudar a buscar algún resultado de hoy o una muestra pendiente?',
    '¿Deseas que revise el estado de alguna citología o biopsia quirúrgica?'
  ];

  let currentFraseIndex = 0;
  function obtenerFraseProactiva() {
    const frase = FRASES_PROACTIVAS[currentFraseIndex % FRASES_PROACTIVAS.length];
    currentFraseIndex++;
    return frase;
  }

  // 1. Inicialización reactiva al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCortana);
  } else {
    initCortana();
  }

  function initCortana() {
    initCortanaTableSearchBar();
  }

  // Helper RBAC
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
      return nom;
    }
    return 'doctor/a';
  }

  // 2. Conexión de la Barra de Búsqueda y Bahía de Chat en el Mismo Lugar
  function initCortanaTableSearchBar() {
    const searchInp = document.getElementById('cortanaSearchInput');
    const clearBtn = document.getElementById('cortanaClearBtn');
    const chatBtn = document.getElementById('cortanaOpenChatBtn');
    const inlinePanel = document.getElementById('cortanaInlinePanel');
    const closeBtn = document.getElementById('cortanaInlineCloseBtn');

    if (!searchInp) return;

    // A. Al escribir en la barra: filtra la tabla en 0 ms
    searchInp.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';

      // Sincronizar con el input legado aiSmartSearchInput si existe
      const legacyAi = document.getElementById('aiSmartSearchInput');
      if (legacyAi && legacyAi !== searchInp) {
        legacyAi.value = val;
      }

      // Filtrado instantáneo en la tabla
      if (typeof window.applyFilters === 'function') {
        window.applyFilters(true);
      }
    });

    // B. Al presionar Enter: consulta a Cortana en el mismo lugar
    searchInp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = searchInp.value.trim();
        abrirChatInlineCortana(val || null);
      } else if (e.key === 'Escape') {
        cerrarChatInlineCortana();
      }
    });

    // C. Botón "Consultar a Cortana": abre/cierra la bahía inline
    if (chatBtn) {
      chatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = inlinePanel && inlinePanel.style.display !== 'none';
        if (isOpen) {
          cerrarChatInlineCortana();
        } else {
          const val = searchInp.value.trim();
          abrirChatInlineCortana(val || null);
        }
      });
    }

    // D. Botón Limpiar
    if (clearBtn) {
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

    // E. Botón Minimizar de la bahía inline
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cerrarChatInlineCortana();
      });
    }

    // F. Clic fuera para colapsar suavemente
    document.addEventListener('click', (e) => {
      const barWrapper = document.getElementById('cortanaTableSearchBar');
      if (barWrapper && !barWrapper.contains(e.target)) {
        cerrarChatInlineCortana();
      }
    });
  }

  // 3. Control de la Bahía de Chat Inline (En el Mismo Lugar)
  function abrirChatInlineCortana(query = null) {
    const inlinePanel = document.getElementById('cortanaInlinePanel');
    const messagesBody = document.getElementById('cortanaInlineMessages');
    const searchInp = document.getElementById('cortanaSearchInput');

    if (!inlinePanel || !messagesBody) return;

    inlinePanel.style.display = 'flex';

    // Si está vacío, agregar el saludo inicial proactivo
    if (!messagesBody.hasChildNodes() || messagesBody.children.length === 0) {
      const user = getSessionUser();
      const nombre = obtenerTratamientoUsuario(user);
      const fraseProactiva = obtenerFraseProactiva();

      agregarMensajeBotInline(`
        <p>Hola <strong>${escapeHtml(nombre)}</strong>. ${fraseProactiva}</p>
        <p style="font-size:0.77rem; color:#94a3b8; margin-top:4px;">
          Puedes escribir un código de atención (ej. <em>360</em>), apellido del paciente (ej. <em>Peñaloza</em>), o consultarme por fijación de muestras.
        </p>
      `);
    }

    if (query && query.trim()) {
      agregarMensajeUsuarioInline(query);
      procesarConsultaInline(query);
    }

    if (searchInp) searchInp.focus();
  }

  function cerrarChatInlineCortana() {
    const inlinePanel = document.getElementById('cortanaInlinePanel');
    if (inlinePanel) {
      inlinePanel.style.display = 'none';
    }
  }

  function agregarMensajeUsuarioInline(texto) {
    const body = document.getElementById('cortanaInlineMessages');
    if (!body) return;

    const row = document.createElement('div');
    row.className = 'cortana-inline-msg user';
    row.innerHTML = `
      <div class="cortana-inline-bubble user">
        <p>${escapeHtml(texto)}</p>
        <span class="cortana-inline-time">${obtenerHoraActual()}</span>
      </div>
    `;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function agregarMensajeBotInline(contenidoHtml, botonesHtml = '') {
    const body = document.getElementById('cortanaInlineMessages');
    if (!body) return;

    const row = document.createElement('div');
    row.className = 'cortana-inline-msg bot';
    row.innerHTML = `
      <div class="cortana-inline-bot-icon"><i class="fa-solid fa-headset"></i></div>
      <div class="cortana-inline-bubble bot">
        ${contenidoHtml}
        ${botonesHtml}
        <span class="cortana-inline-time">Cortana • ${obtenerHoraActual()}</span>
      </div>
    `;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function mostrarIndicadorEscribiendoInline() {
    const body = document.getElementById('cortanaInlineMessages');
    if (!body) return null;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'cortanaInlineTyping';
    typingDiv.className = 'cortana-inline-msg bot';
    typingDiv.innerHTML = `
      <div class="cortana-inline-bot-icon"><i class="fa-solid fa-headset"></i></div>
      <div class="cortana-inline-typing">
        <span style="font-size:0.74rem; color:#94a3b8; margin-right:4px;">Cortana está revisando...</span>
        <div class="cortana-inline-dot"></div>
        <div class="cortana-inline-dot"></div>
        <div class="cortana-inline-dot"></div>
      </div>
    `;
    body.appendChild(typingDiv);
    body.scrollTop = body.scrollHeight;
    return typingDiv;
  }

  function removerIndicadorEscribiendoInline() {
    const el = document.getElementById('cortanaInlineTyping');
    if (el) el.remove();
  }

  // 4. Procesamiento de la Consulta (Indistinguible de un Humano + Variación de Frases)
  async function procesarConsultaInline(mensaje) {
    mostrarIndicadorEscribiendoInline();

    // Pausa humana breve de 700 a 1100 ms (ágil pero natural)
    const delayHumano = Math.floor(Math.random() * 400) + 700;

    let res = null;

    // Probar n8n local si responde rápido
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 900);

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
          res = {
            html: formatearMarkdownHumano(data.respuesta),
            paciente: data.pacienteDetectado || null
          };
        }
      }
    } catch (e) {
      res = null;
    }

    if (!res) {
      res = generarRespuestaHumana(mensaje);
    }

    setTimeout(() => {
      removerIndicadorEscribiendoInline();

      let botones = '';
      if (res.paciente && res.paciente.codigo) {
        const safeCod = escapeHtml(res.paciente.codigo);
        botones = `
          <div class="cortana-inline-actions">
            <button type="button" class="cortana-inline-btn pdf" onclick="window.handleAction ? window.handleAction('pdf', '${safeCod}') : (window.openPrintWindow ? window.openPrintWindow('${safeCod}') : null)">
              <i class="fa-solid fa-file-pdf"></i> Ver Informe PDF
            </button>
            <button type="button" class="cortana-inline-btn download" onclick="window.handleAction ? window.handleAction('descargar_pdf', '${safeCod}') : (window.descargarPdfDirecto ? window.descargarPdfDirecto('${safeCod}') : null)">
              <i class="fa-solid fa-download"></i> Descargar Copia
            </button>
            <button type="button" class="cortana-inline-btn table" onclick="window.cortanaFiltrarEnTabla('${safeCod}')">
              <i class="fa-solid fa-table-list"></i> Ubicar en Tabla
            </button>
          </div>
        `;
      }

      agregarMensajeBotInline(res.html, botones);
    }, delayHumano);
  }

  // Generador de Respuestas Humanas con Frases Variadas
  function generarRespuestaHumana(query) {
    const qRaw = (query || '').trim();
    const q = qRaw.toLowerCase();
    const user = getSessionUser();
    const isAdmin = checkIsAdmin(user);
    const userClinic = String(user.clinica || user.sede || user.nombres || '').trim().toLowerCase();
    const nombre = obtenerTratamientoUsuario(user);

    // A. Saludos
    if (/^(hola|buenos d[ií]as|buenas tardes|buenas noches|saludos|que tal|c[oó]mo est[aá]s?)/i.test(q) && q.split(/\s+/).length <= 4) {
      const fraseVariada = obtenerFraseProactiva();
      return {
        html: `
          <p>¡Hola, <strong>${escapeHtml(nombre)}</strong>! Un gusto saludarte.</p>
          <p>${fraseVariada}</p>
        `,
        paciente: null
      };
    }

    // B. Base de datos en memoria
    const db = (Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0) ? window.patientDatabase :
               (Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0) ? window.REAL_SUPABASE_PATIENTS :
               (Array.isArray(window.realSupabaseBackup) && window.realSupabaseBackup.length > 0) ? window.realSupabaseBackup : [];

    // C. Búsqueda de Paciente o Biopsia
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

      // Validación RBAC explicada con naturalidad
      if (!isAdmin && userClinic && !patClinic.includes(userClinic) && !userClinic.includes(patClinic)) {
        return {
          html: `
            <p>Doctor/a, ubiqué la muestra pero corresponde a otra sede médica asociada.</p>
            <p>Por normativas de confidencialidad del laboratorio, desde esta sesión solo tengo autorización para mostrar informes de su institución asignada. ¿Te puedo ayudar a buscar algún otro resultado de su sede?</p>
          `,
          paciente: null
        };
      }

      const cod = foundPatient.codAtencion || foundPatient.cod_atencion || foundPatient.codigo || 'S/C';
      const nom = foundPatient.paciente || ((foundPatient.apellidos || '') + ', ' + (foundPatient.nombres || ''));
      const dni = foundPatient.dni || foundPatient.numDni || 'Sin registrar';
      const esp = foundPatient.especimen || foundPatient.tipoMuestra || foundPatient.tipo_estudio || 'Biopsia quirúrgica';
      const med = foundPatient.medico || foundPatient.medSolicitante || foundPatient.medico_solicitante || 'Médico solicitante';
      const cli = foundPatient.clinica || foundPatient.clinicaProcedencia || 'JC PATH LAB';
      const diag = foundPatient.diagnostico || foundPatient.diagFinal || foundPatient.diagnostico_patologico || 'En proceso de lectura microscópica.';
      const rec = foundPatient.fecRecepcion || foundPatient.fecRegistro || foundPatient.fechaIngreso || '-';
      const ent = foundPatient.fecEntrega || foundPatient.fecha_entrega || '-';
      const esListo = String(foundPatient.estado || '').toLowerCase().includes('list') || !!foundPatient.informeListo;

      let msgHtml = '';
      if (esListo) {
        msgHtml = `
          <p>¡Sí, ya lo tengo! La muestra de <strong>${escapeHtml(nom)}</strong> (Código <strong>${escapeHtml(cod)}</strong>) ya concluyó su lectura con el <strong>Dr. José Castillo</strong> y está <strong>lista para recojo y descarga</strong>.</p>
          <div class="cortana-inline-card">
            <div>👤 <strong>Paciente:</strong> ${escapeHtml(nom)} (DNI: ${escapeHtml(dni)})</div>
            <div>🧪 <strong>Muestra:</strong> <span style="color:#f43f5e; font-weight:700;">${escapeHtml(esp)}</span></div>
            <div>🏥 <strong>Sede / Médico:</strong> ${escapeHtml(cli)} • ${escapeHtml(med)}</div>
            <div style="margin-top:4px; padding-top:4px; border-top:1px dashed rgba(255,255,255,0.12);">
              📋 <strong>Diagnóstico:</strong> <span style="color:#34d399; font-weight:600;">${escapeHtml(diag)}</span>
            </div>
            <div style="font-size:0.75rem; color:#94a3b8; margin-top:3px;">
              📅 Ingreso: ${escapeHtml(rec)} | Entrega programada: ${escapeHtml(ent)}
            </div>
          </div>
          <p>¿Deseas abrir el informe en PDF o ubicarlo en la tabla?</p>
        `;
      } else {
        msgHtml = `
          <p>Revisé la muestra de <strong>${escapeHtml(nom)}</strong> (Código <strong>${escapeHtml(cod)}</strong>). En este momento se encuentra <strong>en proceso técnico</strong> de laboratorio (inclusión y corte de láminas).</p>
          <div class="cortana-inline-card warning">
            <div>👤 <strong>Paciente:</strong> ${escapeHtml(nom)} (DNI: ${escapeHtml(dni)})</div>
            <div>🧪 <strong>Muestra:</strong> ${escapeHtml(esp)}</div>
            <div style="font-size:0.75rem; color:#fbbf24; margin-top:3px;">
              ⏳ <strong>Estado:</strong> En proceso | Entrega estimada: <strong>${escapeHtml(ent)}</strong>
            </div>
          </div>
          <p>Apenas el Dr. Castillo emita el diagnóstico final, quedará habilitado aquí mismo. ¿Te puedo ayudar con alguna otra muestra?</p>
        `;
      }

      return {
        html: msgHtml,
        paciente: { codigo: cod, paciente: nom }
      };
    }

    // D. Consultas de Estado General / Conteo
    if (q.includes('listo') || q.includes('listos') || q.includes('hoy') || q.includes('cuantos')) {
      const listos = db.filter(p => String(p.estado || '').toLowerCase().includes('list') || p.informeListo);
      const fraseVariada = obtenerFraseProactiva();
      return {
        html: `
          <p>Actualmente tenemos <strong>${listos.length} informes validados y listos</strong> para entrega en el archivo patológico.</p>
          <p>${fraseVariada}</p>
        `,
        paciente: null
      };
    }

    // E. Consultas de Protocolo de Muestras
    if (q.includes('formol') || q.includes('fijacion') || q.includes('fijador') || q.includes('muestra')) {
      return {
        html: `
          <p>Con mucho gusto te recuerdo el protocolo que nos solicita el Dr. Castillo:</p>
          <ul style="margin:4px 0 6px 16px; padding:0; font-size:0.80rem; line-height:1.5;">
            <li><strong>Fijador de rigor:</strong> Formaldehído neutro al 10% tamponado (buffer fosfato). Evitar alcohol o suero en biopsias tisulares.</li>
            <li><strong>Proporción:</strong> Mínimo 10 volúmenes de formol por cada volumen de tejido (10:1).</li>
            <li><strong>Piezas grandes:</strong> Hacer una incisión longitudinal previa para facilitar la penetración adecuada.</li>
          </ul>
          <p>¿Te puedo ayudar a buscar algún resultado o coordinar el ingreso de una muestra?</p>
        `,
        paciente: null
      };
    }

    // F. Fallback amable con pregunta proactiva
    const preguntaFinal = obtenerFraseProactiva();
    return {
      html: `
        <p>No logré encontrar una coincidencia exacta en el archivo con esos datos.</p>
        <p>Por favor facilítame el <strong>código de biopsia</strong> (ej. <em>360</em>), el <strong>DNI</strong> o el <strong>apellido del paciente</strong>.</p>
        <p style="color:#38bdf8; font-weight:500;">${preguntaFinal}</p>
      `,
      paciente: null
    };
  }

  function formatearMarkdownHumano(texto) {
    if (!texto) return '';
    let html = escapeHtml(texto);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    return `<p>${html}</p>`;
  }

  // Filtrar en tabla y sincronizar
  window.cortanaFiltrarEnTabla = function(codigo) {
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

  // Funciones globales
  window.abrirChatInlineCortana = abrirChatInlineCortana;
  window.cerrarChatInlineCortana = cerrarChatInlineCortana;
  window.abrirCortanaChat = abrirChatInlineCortana;
})();
