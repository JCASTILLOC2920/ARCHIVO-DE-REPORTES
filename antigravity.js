/**
 * antigravity.js
 * Módulo de Integración Global JCLAB - Omega-Argón
 * Versión: 12.0 (Edición Antigravity - Blindada)
 * 
 * Este archivo actúa como el puente (bridge) entre la interfaz móvil y el motor
 * de reportes. Implementa búsqueda O(1), gestión de estado resiliente y 
 * cumplimiento estricto de la Regla SLA (🔴/🟢).
 */

(function () {
  "use strict";

  // -------------------------------------------------------------------------
  // Configuración de Endpoints (Omega-Argón Backend)
  // -------------------------------------------------------------------------
  const ENDPOINT_HEALTH = "/health";
  const ENDPOINT_ASK = "/ask";
  const ENDPOINT_REPORTS = "/reports";

  // -------------------------------------------------------------------------
  // Constantes de Configuración
  // -------------------------------------------------------------------------
  const MAX_CONSECUTIVE_FAILURES = 3;
  const REFRESH_INTERVAL_MS = 60000; // 60 segundos para refresco de índice

  // -------------------------------------------------------------------------
  // Estado Global del Módulo
  // -------------------------------------------------------------------------
  let isOnline = false;
  let isProcessing = false;
  let consecutiveFailures = 0;
  let refreshIntervalId = null;
  const reportsIndex = new Map(); // Búsqueda O(1) por código

  // -------------------------------------------------------------------------
  // Utilidades de DOM (Garantía de Auto-Montaje)
  // -------------------------------------------------------------------------

  /**
   * Asegura la existencia de un elemento en el DOM.
   * @param {string} id - ID del elemento.
   * @param {string} tag - Nombre de la etiqueta HTML.
   * @param {Object} styles - Estilos inline.
   * @param {string} textContent - Texto inicial.
   * @param {string} parentId - ID del contenedor padre.
   */
  function _ensureElement(id, tag, styles, textContent, parentId) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement(tag);
      el.id = id;
      if (styles) Object.assign(el.style, styles);
      if (textContent) el.textContent = textContent;
      const parent = parentId ? document.getElementById(parentId) : document.body;
      if (parent) parent.appendChild(el);
      else document.body.appendChild(el);
    }
    return el;
  }

  // -------------------------------------------------------------------------
  // Inicialización del DOM (Interfaz Cortana)
  // -------------------------------------------------------------------------

  function _initDOM() {
    // Contenedor principal (Glassmorphism ligero)
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
      overflow: "hidden",
      transition: "transform 0.3s ease"
    });

    // Cabecera
    const headerEl = _ensureElement("cortanaHeader", "div", {
      padding: "12px",
      background: "#1a237e",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }, null, "cortanaContainer");

    if (!headerEl.querySelector(".cortana-title")) {
      headerEl.innerHTML = `
        <span class="cortana-title" style="font-weight: 700; font-size: 14px;">
          <i class="fas fa-robot"></i> CORTANA JCLAB
        </span>
        <span id="cortanaStatus" style="font-size: 11px; font-weight: 600;">● Verificando...</span>
      `;
    }

    // Área de salida
    _ensureElement("cortanaOutput", "div", {
      flex: "1",
      overflowY: "auto",
      padding: "15px",
      background: "transparent",
      fontSize: "13px",
      lineHeight: "1.5"
    }, null, "cortanaContainer");

    // Banner de Error SLA
    const bannerEl = _ensureElement("slaErrorBanner", "div", {
      padding: "6px",
      background: "#d32f2f",
      color: "white",
      textAlign: "center",
      fontSize: "11px",
      display: "none"
    }, "⚠️ SINCRONIZACIÓN INTERRUMPIDA", "cortanaContainer");

    // Área de Input
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
    inputEl.placeholder = "Buscar código o consultar...";

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

    // Eventos
    sendBtnEl.onclick = _handleSend;
    inputEl.onkeypress = (e) => { if (e.key === "Enter") _handleSend(); };
  }

  // -------------------------------------------------------------------------
  // Lógica de Negocio e Indexación O(1)
  // -------------------------------------------------------------------------

  async function _checkHealth() {
    try {
      const resp = await fetch(ENDPOINT_HEALTH, { method: "GET" });
      const data = await resp.json();
      return resp.ok && (data.status === "ok" || data.status === "healthy");
    } catch (e) {
      return false;
    }
  }

  /**
   * Indexa reportes para búsqueda instantánea.
   * Implementa la Regla SLA: Inconclusos arriba, Firmados abajo.
   */
  function _buildReportsIndex(reports) {
    if (!Array.isArray(reports)) return;
    reportsIndex.clear();
    
    // Ordenamiento SLA antes de indexar
    reports.sort((a, b) => {
      const aFirmado = (a.estado || "").toUpperCase().includes("FIRMADO");
      const bFirmado = (b.estado || "").toUpperCase().includes("FIRMADO");
      if (!aFirmado && bFirmado) return -1;
      if (aFirmado && !bFirmado) return 1;
      // Orden cronológico descendente dentro del grupo
      return (b.codigo || "").localeCompare(a.codigo || "");
    });

    reports.forEach(r => {
      if (r.codigo) reportsIndex.set(r.codigo.toUpperCase().trim(), r);
    });
    
    console.log(`[Antigravity] Índice reconstruido: ${reportsIndex.size} casos.`);
  }

  function _findReportByCode(code) {
    if (!code) return null;
    return reportsIndex.get(code.toUpperCase().trim()) || null;
  }

  // -------------------------------------------------------------------------
  // Gestión de UI y Mensajería
  // -------------------------------------------------------------------------

  function _updateStatus(online) {
    const statusEl = document.getElementById("cortanaStatus");
    if (!statusEl) return;
    statusEl.textContent = online ? "● EN LÍNEA" : "● OFFLINE";
    statusEl.style.color = online ? "#4caf50" : "#ff5252";
    isOnline = online;
  }

  function _appendMessage(text, type) {
    const output = document.getElementById("cortanaOutput");
    if (!output) return;

    const msgDiv = document.createElement("div");
    msgDiv.style.marginBottom = "12px";
    msgDiv.style.padding = "10px";
    msgDiv.style.borderRadius = "8px";
    msgDiv.style.maxWidth = "85%";
    msgDiv.style.wordWrap = "break-word";

    if (type === 'user') {
      msgDiv.style.background = "#e8eaf6";
      msgDiv.style.marginLeft = "auto";
      msgDiv.style.color = "#1a237e";
    } else if (type === 'bot') {
      msgDiv.style.background = "#f5f5f5";
      msgDiv.style.borderLeft = "4px solid #1a237e";
    } else {
      msgDiv.style.background = "#ffebee";
      msgDiv.style.color = "#c62828";
    }

    msgDiv.innerHTML = text.replace(/\n/g, "<br>");
    output.appendChild(msgDiv);
    output.scrollTop = output.scrollHeight;
  }

  function _formatReportResponse(report) {
    const isFirmado = (report.estado || "").toUpperCase().includes("FIRMADO");
    const icon = isFirmado ? "🟢" : "🔴";
    
    let html = `<strong>${icon} CASO: ${report.codigo}</strong><br>`;
    html += `👤 Paciente: ${report.paciente || "No registrado"}<br>`;
    html += `📅 Fecha: ${report.fecha || "N/A"}<br>`;
    html += `📊 Estado: <span style="font-weight:bold; color:${isFirmado ? '#2e7d32' : '#d32f2f'}">${report.estado}</span><br>`;
    
    if (report.diagnostico) {
      html += `<hr style="border:0; border-top:1px solid #ddd; margin:5px 0;">`;
      html += `📝 <em>${report.diagnostico}</em>`;
    }
    
    return html;
  }

  // -------------------------------------------------------------------------
  // Orquestación de Consultas
  // -------------------------------------------------------------------------

  async function _processQuery(query) {
    const q = query.trim();
    if (!q) return "Por favor, escribe algo.";

    // 1. Búsqueda Local O(1) mediante Regex de códigos JCLAB (ej: B-24-1234)
    const codeMatch = q.match(/[A-Z]{1,3}-\d{2,}-\d{2,}/i) || q.match(/\d{4,}/);
    if (codeMatch) {
      const report = _findReportByCode(codeMatch[0]);
      if (report) return _formatReportResponse(report);
    }

    // 2. Búsqueda en Backend (FastAPI)
    if (!isOnline) return "⚠️ El sistema está offline. Solo puedo buscar en la memoria local actual.";

    try {
      const resp = await fetch(ENDPOINT_ASK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });
      
      if (!resp.ok) throw new Error("Server Error");
      
      const data = await resp.json();
      _handleCircuitBreaker(true);
      return data.response || "No encontré información relevante.";
    } catch (e) {
      _handleCircuitBreaker(false);
      return "Error de comunicación con el servidor central.";
    }
  }

  async function _handleSend() {
    if (isProcessing) return;
    const input = document.getElementById("cortanaInput");
    const query = input.value.trim();
    if (!query) return;

    input.value = "";
    _appendMessage(query, "user");
    isProcessing = true;

    const response = await _processQuery(query);
    _appendMessage(response, "bot");
    isProcessing = false;
  }

  function _handleCircuitBreaker(success) {
    if (success) {
      consecutiveFailures = 0;
      if (!isOnline) _updateStatus(true);
      _hideErrorBanner();
    } else {
      consecutiveFailures++;
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        _updateStatus(false);
        _showErrorBanner();
      }
    }
  }

  function _showErrorBanner() {
    const b = document.getElementById("slaErrorBanner");
    if (b) b.style.display = "block";
  }

  function _hideErrorBanner() {
    const b = document.getElementById("slaErrorBanner");
    if (b) b.style.display = "none";
  }

  async function _refreshReportsIndex() {
    try {
      const resp = await fetch(ENDPOINT_REPORTS);
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      _buildReportsIndex(data);
      _handleCircuitBreaker(true);
    } catch (e) {
      _handleCircuitBreaker(false);
    }
  }

  // -------------------------------------------------------------------------
  // Ciclo de Vida y Exposición
  // -------------------------------------------------------------------------

  async function _init() {
    _initDOM();
    const healthy = await _checkHealth();
    _updateStatus(healthy);
    
    if (healthy) {
      await _refreshReportsIndex();
      _appendMessage("Sincronización Antigravity activa. ¿Qué caso deseas consultar?", "bot");
    } else {
      _showErrorBanner();
      _appendMessage("Modo Offline activado. Búsqueda limitada a caché local.", "bot");
    }

    // Loop de mantenimiento
    if (refreshIntervalId) clearInterval(refreshIntervalId);
    refreshIntervalId = setInterval(async () => {
      if (document.hidden) return;
      const healthy = await _checkHealth();
      _updateStatus(healthy);
      if (healthy) await _refreshReportsIndex();
    }, REFRESH_INTERVAL_MS);
  }

  // Ejecución
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _init);
  } else {
    _init();
  }

  // Puente Global (Antigravity Bridge)
  window.Antigravity = {
    search: (code) => _findReportByCode(code),
    sync: () => _refreshReportsIndex(),
    isOnline: () => isOnline,
    version: "12.0-Omega-Argon"
  };

})();
