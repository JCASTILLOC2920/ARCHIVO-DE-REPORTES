/**
 * MÓDULO ANTIGRAVITY - JCLAB
 * Versión: 12.3-Omega-Argon (Edición Académica Dr. Castillo)
 * Autor: LÓBULO 3 (Cirujano Principal)
 * Descripción: Cliente de sincronización O(1) con integración de extracción de notas académicas (Excel) y blindaje jurídico SLA (Regla #28).
 * Dependencias: Vanilla JS ES6+, SheetJS (Lazy Loading)
 */

(function () {
  "use strict";

  // -------------------------------------------------------------------------
  // Configuración de Endpoints y Estado
  // -------------------------------------------------------------------------
  const BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:8010' : window.location.origin;
  const ENDPOINT_HEALTH = `${BASE_URL}/cortana/health`;
  const ENDPOINT_ASK = `${BASE_URL}/cortana/ask`;
  const ENDPOINT_REPORTS = `${BASE_URL}/api/reports`;

  const MAX_CONSECUTIVE_FAILURES = 3;
  const REFRESH_INTERVAL_MS = 60000;
  const MIN_ACADEMIC_CHARS = 2000;

  let isOnline = false;
  let isProcessing = false;
  let consecutiveFailures = 0;
  let refreshIntervalId = null;
  
  const reportsIndex = new Map(); // Búsqueda O(1) por código clínico
  const ACADEMIC_INDEX = new Map(); // Búsqueda O(1) por nombre de alumno (Excel)

  // -------------------------------------------------------------------------
  // Validación Determinista de Integridad Académica (Blindaje Dr. Castillo)
  // -------------------------------------------------------------------------

  /**
   * Valida la densidad y calidad del contenido generado o procesado.
   * @param {string} content - Texto a validar.
   * @throws {Error} RuntimeError si no cumple los estándares de excelencia.
   */
  function _validateAcademicIntegrity(content) {
    if (!content) return;
    
    // 1. Validación de Densidad (Mínimo 2000 caracteres)
    if (content.length < MIN_ACADEMIC_CHARS) {
      const errorMsg = `CRITICAL_FAILURE: Densidad académica insuficiente (${content.length}/${MIN_ACADEMIC_CHARS} chars). El informe no cumple el estándar JCLAB.`;
      console.error(`[Antigravity] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // 2. Detección de Frases de Rechazo o Evasión de IA
    const forbiddenPhrases = [
      /copie y pegue/i, 
      /proporcione el borrador/i, 
      /como modelo de lenguaje/i, 
      /no puedo realizar/i, 
      /lo siento, pero/i,
      /no tengo acceso/i,
      /instrucciones de sistema/i
    ];

    for (const regex of forbiddenPhrases) {
      if (regex.test(content)) {
        const errorMsg = `CRITICAL_FAILURE: Detectada frase de rechazo o evasión de IA en el contenido. Procedimiento abortado.`;
        console.error(`[Antigravity] ${errorMsg}`);
        throw new Error(errorMsg);
      }
    }

    return true;
  }

  // -------------------------------------------------------------------------
  // Infraestructura de Carga Dinámica (SheetJS)
  // -------------------------------------------------------------------------
  
  function _loadXLSXEngine() {
    return new Promise((resolve, reject) => {
      if (typeof XLSX !== 'undefined') return resolve();
      const script = document.createElement('script');
      script.src = "https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js";
      script.onload = () => {
        console.log("[Antigravity] XLSX Engine Ready");
        resolve();
      };
      script.onerror = () => reject(new Error("Fallo al cargar motor Excel"));
      document.head.appendChild(script);
    });
  }

  // -------------------------------------------------------------------------
  // Procesador Quirúrgico de Excel (Notas Dr. Castillo)
  // -------------------------------------------------------------------------

  async function _processAcademicExcel(fileBuffer) {
    try {
      await _loadXLSXEngine();
      const wb = XLSX.read(fileBuffer, { type: 'array' });
      const targetSheets = [
        "Rotacion_1_Grupo_8", 
        "Rotacion_2_Grupo_7", 
        "Rotacion_3_Grupo_12", 
        "Rotacion_4_Grupo_11"
      ];

      ACADEMIC_INDEX.clear();
      let totalProcessed = 0;

      for (const sheetName of targetSheets) {
        const sheet = wb.Sheets[sheetName];
        if (!sheet) continue;

        const data = XLSX.utils.sheet_to_json(sheet, { header: "A", range: 3 });
        const numGrades = (sheetName === "Rotacion_4_Grupo_11") ? 3 : 4;

        data.forEach((row) => {
          const nombre = row.B ? row.B.toString().trim() : null;
          if (!nombre) return;

          const n1 = parseFloat(row.C) || 0;
          const n2 = parseFloat(row.D) || 0;
          const n3 = parseFloat(row.E) || 0;
          const n4 = (numGrades === 4) ? (parseFloat(row.F) || 0) : 0;

          const promedio = (n1 + n2 + n3 + n4) / numGrades;

          if (Math.abs(promedio - 17.00) < 0.01) {
            ACADEMIC_INDEX.set(nombre.toUpperCase(), {
              id: row.A,
              nombre: nombre,
              promedio: promedio.toFixed(2),
              rotacion: sheetName,
              status: "EXCELENCIA_CONFIRMADA"
            });
            totalProcessed++;
          }
        });
      }
      return { success: true, count: totalProcessed };
    } catch (e) {
      console.error("[Antigravity] Error en cirugía de Excel:", e);
      return { success: false, error: e.message };
    }
  }

  // -------------------------------------------------------------------------
  // Utilidades de DOM (Garantía de Auto-Montaje Defensivo)
  // -------------------------------------------------------------------------

  function _ensureElement(id, tag, styles, textContent, parentId) {
    let el = document.getElementById(id);
    if (!el) {
      try {
        el = document.createElement(tag);
        el.id = id;
        if (styles) Object.assign(el.style, styles);
        if (textContent) el.textContent = textContent;
        const parent = parentId ? document.getElementById(parentId) : document.body;
        if (parent) parent.appendChild(el);
        else document.body.appendChild(el);
      } catch (e) {
        return null;
      }
    }
    return el;
  }

  function _getEl(id) {
    return document.getElementById(id);
  }

  // -------------------------------------------------------------------------
  // Inicialización del DOM (Interfaz Cortana)
  // -------------------------------------------------------------------------

  function _initDOM() {
    const containerEl = _ensureElement("cortanaContainer", "div", {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "350px",
      height: "450px",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      zIndex: "10000",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflow: "hidden"
    });

    if (!containerEl) return;

    const headerEl = _ensureElement("cortanaHeader", "div", {
      padding: "12px",
      background: "#1a237e",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }, null, "cortanaContainer");

    if (headerEl && !headerEl.querySelector(".cortana-title")) {
      headerEl.innerHTML = `
        <span class="cortana-title" style="font-weight: 700; font-size: 14px;">
          <i class="fas fa-robot"></i> CORTANA JCLAB
        </span>
        <span id="cortanaStatus" style="font-size: 11px; font-weight: 600;">● Verificando...</span>
      `;
    }

    _ensureElement("cortanaOutput", "div", {
      flex: "1",
      overflowY: "auto",
      padding: "15px",
      fontSize: "13px",
      lineHeight: "1.5"
    }, null, "cortanaContainer");

    _ensureElement("slaErrorBanner", "div", {
      padding: "6px",
      background: "#d32f2f",
      color: "white",
      textAlign: "center",
      fontSize: "11px",
      display: "none"
    }, "⚠️ SINCRONIZACIÓN INTERRUMPIDA", "cortanaContainer");

    const footerEl = _ensureElement("cortanaFooter", "div", {
      padding: "10px",
      borderTop: "1px solid #eee",
      display: "flex",
      gap: "8px"
    }, null, "cortanaContainer");

    const inputEl = _ensureElement("cortanaInput", "input", {
      flex: "1",
      padding: "8px 12px",
      border: "1px solid #ddd",
      borderRadius: "20px",
      outline: "none",
      fontSize: "13px"
    }, null, "cortanaFooter");
    
    if (inputEl) {
      inputEl.placeholder = "Buscar código o alumno...";
      inputEl.onkeypress = (e) => { if (e.key === "Enter") _handleSend(); };
    }

    const sendBtnEl = _ensureElement("cortanaSendBtn", "button", {
      background: "#1a237e",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "35px",
      height: "35px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }, "➤", "cortanaFooter");

    if (sendBtnEl) sendBtnEl.onclick = _handleSend;
  }

  // -------------------------------------------------------------------------
  // Lógica de Negocio e Indexación O(1) con Regla Inviolable #28 (SLA)
  // -------------------------------------------------------------------------

  function _sortReportsSLA(reportsArray) {
    return reportsArray.sort((a, b) => {
      const aFirmado = (a.estado || "").toUpperCase().includes("FIRMADO") || a.firmado === true;
      const bFirmado = (b.estado || "").toUpperCase().includes("FIRMADO") || b.firmado === true;

      // Regla #28: 🔴 Inconclusos Arriba (false), 🟢 Firmados Abajo (true)
      if (aFirmado !== bFirmado) {
        return aFirmado ? 1 : -1;
      }

      const dateA = new Date(a.fecha || a.fecha_atencion || 0).getTime();
      const dateB = new Date(b.fecha || b.fecha_atencion || 0).getTime();
      
      if (dateA !== dateB) return dateB - dateA;
      return (b.codigo || "").localeCompare(a.codigo || "");
    });
  }

  function _buildReportsIndex(reports) {
    if (!Array.isArray(reports)) return;
    reportsIndex.clear();
    const sortedReports = _sortReportsSLA(reports);
    sortedReports.forEach(r => {
      if (r.codigo) reportsIndex.set(r.codigo.toUpperCase().trim(), r);
    });
    _updateCortanaReportsUI(sortedReports);
  }

  function _updateCortanaReportsUI(reports) {
    const output = _getEl("cortanaOutput");
    if (!output || output.dataset.initializedList) return;
    
    const fragment = document.createDocumentFragment();
    const headerInfo = document.createElement("div");
    headerInfo.style.cssText = "font-size:11px; color:#555; margin-bottom:8px; font-weight:600; border-bottom:1px solid #ddd; padding-bottom:4px;";
    headerInfo.innerHTML = `📋 Casos Sincronizados (${reports.length}) — SLA Regla #28 Activo`;
    fragment.appendChild(headerInfo);

    reports.slice(0, 10).forEach(r => {
      const isFirmado = (r.estado || "").toUpperCase().includes("FIRMADO") || r.firmado === true;
      const div = document.createElement("div");
      div.style.cssText = "padding:6px 8px; margin-bottom:4px; background:#fff; border-radius:6px; border:1px solid #eee; font-size:11px; display:flex; align-items:center; cursor:pointer;";
      div.innerHTML = `<span style="margin-right:8px;">${isFirmado ? "🟢" : "🔴"}</span> <strong>${r.codigo}</strong> - ${r.paciente || "..."}`;
      div.onclick = () => _appendMessage(_formatReportResponse(r), "bot");
      fragment.appendChild(div);
    });

    output.innerHTML = "";
    output.appendChild(fragment);
    output.dataset.initializedList = "true";
  }

  function _findReportByCode(code) {
    if (!code) return null;
    const cleanCode = code.toUpperCase().trim();
    const report = reportsIndex.get(cleanCode);
    if (report) return _formatReportResponse(report);
    const academic = ACADEMIC_INDEX.get(cleanCode);
    if (academic) return _formatAcademicResponse(academic);
    return null;
  }

  function _formatReportResponse(report) {
    const isFirmado = (report.estado || "").toUpperCase().includes("FIRMADO") || report.firmado === true;
    let html = `<strong>${isFirmado ? "🟢" : "🔴"} CASO: ${report.codigo}</strong><br>`;
    html += `👤 Paciente: ${report.paciente || "No registrado"}<br>`;
    html += `📊 Estado: ${report.estado || (isFirmado ? "FIRMADO" : "INCONCLUSO")}`;
    if (report.diagnostico) {
      html += `<hr style="border:0; border-top:1px solid #ddd; margin:5px 0;">`;
      html += `📝 <em>${report.diagnostico}</em>`;
    }
    return html;
  }

  function _formatAcademicResponse(data) {
    return `🎓 <strong>EXCELENCIA ACADÉMICA</strong><br>
            👤 Alumno: ${data.nombre}<br>
            🏆 Promedio: 17.00<br>
            📍 Rotación: ${data.rotacion}`;
  }

  // -------------------------------------------------------------------------
  // Gestión de UI y Mensajería
  // -------------------------------------------------------------------------

  function _appendMessage(text, type) {
    const output = _getEl("cortanaOutput");
    if (!output) return;

    // Validación de Integridad antes de renderizar (si es del bot)
    if (type === 'bot' && text.includes('📝')) {
      try {
        // Extraemos el texto del diagnóstico para validar densidad
        const diagText = text.split('📝 <em>')[1]?.split('</em>')[0] || "";
        if (diagText.length > 0) _validateAcademicIntegrity(diagText);
      } catch (e) {
        text = `<span style="color:red;">⚠️ ERROR DE INTEGRIDAD: ${e.message}</span>`;
      }
    }

    const msgDiv = document.createElement("div");
    msgDiv.style.cssText = `margin-bottom:12px; padding:10px; border-radius:8px; max-width:85%; word-wrap:break-word; font-size:12px;`;
    
    if (type === 'user') {
      msgDiv.style.background = "#e8eaf6";
      msgDiv.style.marginLeft = "auto";
    } else {
      msgDiv.style.background = "#f5f5f5";
      msgDiv.style.borderLeft = "4px solid #1a237e";
    }

    msgDiv.innerHTML = text.replace(/\n/g, "<br>");
    output.appendChild(msgDiv);
    output.scrollTop = output.scrollHeight;
  }

  async function _handleSend() {
    if (isProcessing) return;
    const input = _getEl("cortanaInput");
    const query = input.value.trim();
    if (!query) return;

    input.value = "";
    _appendMessage(query, "user");
    isProcessing = true;

    try {
      const localResult = _findReportByCode(query);
      if (localResult) {
        _appendMessage(localResult, "bot");
      } else if (isOnline) {
        const resp = await fetch(ENDPOINT_ASK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query })
        });
        const data = await resp.json();
        
        // Validación de Densidad en respuesta de IA
        _validateAcademicIntegrity(data.response || "");
        
        _appendMessage(data.response || "Sin resultados.", "bot");
      } else {
        _appendMessage("⚠️ Sistema offline. Búsqueda limitada a memoria local.", "bot");
      }
    } catch (e) {
      _appendMessage(`❌ Error: ${e.message}`, "error");
    } finally {
      isProcessing = false;
    }
  }

  // -------------------------------------------------------------------------
  // Ciclo de Vida
  // -------------------------------------------------------------------------

  async function _init() {
    _initDOM();
    try {
      const resp = await fetch(ENDPOINT_HEALTH);
      isOnline = resp.ok;
      const statusEl = _getEl("cortanaStatus");
      if (statusEl) {
        statusEl.textContent = isOnline ? "● EN LÍNEA" : "● OFFLINE";
        statusEl.style.color = isOnline ? "#4caf50" : "#ff5252";
      }
      
      if (isOnline) {
        const rResp = await fetch(ENDPOINT_REPORTS);
        const reports = await rResp.json();
        _buildReportsIndex(reports);
      }
    } catch (e) {
      isOnline = false;
    }
  }

  _init();

  window.Antigravity = {
    processAcademicExcel: _processAcademicExcel,
    validate: _validateAcademicIntegrity,
    sync: _init,
    version: "12.3-Omega-Argon"
  };

})();
