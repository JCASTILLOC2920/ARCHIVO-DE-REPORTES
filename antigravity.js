/**
 * antigravity.js
 * Módulo de Integración Global JCLAB - Omega-Argón
 * Versión: 11.0
 * 
 * Este archivo contiene la lógica de conexión global, sincronización de eventos
 * y el módulo de chat Cortana para el sistema de reportes de Anatomía Patológica.
 * 
 * Dependencias:
 * - Backend Python (Omega-Argón) con endpoints /health, /ask, /reports
 * - DOM IDs específicos: cortanaStatus, cortanaOutput, cortanaInput, cortanaSendBtn, slaErrorBanner
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
  const REFRESH_INTERVAL_MS = 60000; // 60 segundos

  // -------------------------------------------------------------------------
  // Estado Global del Módulo
  // -------------------------------------------------------------------------
  let isOnline = false;
  let isProcessing = false;
  let consecutiveFailures = 0;
  let refreshIntervalId = null;
  const reportsIndex = new Map();

  // -------------------------------------------------------------------------
  // Utilidades de DOM
  // -------------------------------------------------------------------------

  /**
   * Asegura la existencia de un elemento en el DOM.
   * Si no existe, lo crea y lo inserta en el contenedor padre especificado.
   * @param {string} id - ID del elemento.
   * @param {string} tag - Nombre de la etiqueta HTML.
   * @param {Object} styles - Estilos inline.
   * @param {string} textContent - Texto inicial (opcional).
   * @param {string} parentId - ID del contenedor padre (opcional, default: document.body).
   * @returns {HTMLElement}
   */
  function _ensureElement(id, tag, styles, textContent, parentId) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement(tag);
      el.id = id;
      if (styles) {
        Object.assign(el.style, styles);
      }
      if (textContent) {
        el.textContent = textContent;
      }
      const parent = parentId ? document.getElementById(parentId) : document.body;
      if (parent) {
        parent.appendChild(el);
      } else {
        document.body.appendChild(el);
      }
    }
    return el;
  }

  // -------------------------------------------------------------------------
  // Inicialización del DOM
  // -------------------------------------------------------------------------

  /**
   * Inicializa o verifica la existencia de los elementos DOM requeridos por Cortana.
   */
  function _initDOM() {
    // 1. Contenedor principal del chat
    const containerEl = _ensureElement("cortanaContainer", "div", {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "350px",
      height: "450px",
      background: "#ffffff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      display: "flex",
      flexDirection: "column",
      zIndex: "9999",
      fontFamily: "Arial, sans-serif"
    });

    // 2. Cabecera con estado
    const headerEl = _ensureElement("cortanaHeader", "div", {
      padding: "10px",
      background: "#1976D2",
      color: "white",
      borderRadius: "8px 8px 0 0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    });
    if (!headerEl.querySelector(".cortana-title")) {
      const titleSpan = document.createElement("span");
      titleSpan.className = "cortana-title";
      titleSpan.textContent = "Cortana JCLAB";
      titleSpan.style.fontWeight = "bold";
      headerEl.appendChild(titleSpan);
    }
    const statusEl = _ensureElement("cortanaStatus", "span", {
      fontSize: "12px",
      fontWeight: "bold"
    }, "● Verificando...");
    if (!headerEl.contains(statusEl)) {
      headerEl.appendChild(statusEl);
    }

    // 3. Área de salida del chat
    const outputEl = _ensureElement("cortanaOutput", "div", {
      flex: "1",
      overflowY: "auto",
      padding: "10px",
      background: "#fafafa",
      borderLeft: "1px solid #eee",
      borderRight: "1px solid #eee"
    });

    // 4. Input de texto
    const inputEl = _ensureElement("cortanaInput", "input", {
      padding: "10px",
      margin: "5px",
      width: "calc(100% - 60px)",
      boxSizing: "border-box",
      border: "1px solid #ccc",
      borderRadius: "4px"
    });
    inputEl.type = "text";
    inputEl.placeholder = "Escribe tu consulta...";

    // 5. Botón de envío (cortanaSendBtn)
    const sendBtnEl = _ensureElement("cortanaSendBtn", "button", {
      padding: "10px 15px",
      margin: "5px",
      background: "#2196F3",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer"
    }, "Enviar");

    // 6. Banner de error SLA (slaErrorBanner)
    const bannerEl = _ensureElement("slaErrorBanner", "div", {
      padding: "8px",
      background: "#f44336",
      color: "white",
      textAlign: "center",
      fontSize: "12px",
      display: "none" // Oculto por defecto
    }, "⚠️ Error de conexión con el servidor de reportes");
    // Ajustar clase hidden para compatibilidad con lógica existente
    bannerEl.classList.add("hidden");

    // Agregar eventos
    sendBtnEl.addEventListener("click", _handleSend);
    inputEl.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        _handleSend();
      }
    });
  }

  // -------------------------------------------------------------------------
  // Utilidades
  // -------------------------------------------------------------------------

  /**
   * Verifica la salud del servicio de reportes.
   * @returns {Promise<boolean>}
   */
  async function _checkHealth() {
    try {
      const resp = await fetch(ENDPOINT_HEALTH, {
        method: "GET",
        credentials: "same-origin"
      });
      if (!resp.ok) return false;
      const data = await resp.json();
      return data.status === "ok" || data.status === "healthy";
    } catch (e) {
      console.error("❌ Error en _checkHealth:", e);
      return false;
    }
  }

  /**
   * Construye el índice de reportes a partir de un array de reportes.
   * @param {Array} reports
   */
  function _buildReportsIndex(reports) {
    reportsIndex.clear();
    reports.forEach(report => {
      if (report && report.codigo) {
        reportsIndex.set(report.codigo.toUpperCase(), report);
      }
    });
  }

  /**
   * Busca un reporte en el índice local por código.
   * @param {string} code
   * @returns {Object|null}
   */
  function _findReportByCode(code) {
    if (!code) return null;
    const normalizedCode = code.toUpperCase().trim();
    return reportsIndex.get(normalizedCode) || null;
  }

  /**
   * Actualiza el indicador de estado en el DOM.
   * @param {boolean} online
   */
  function _updateStatus(online) {
    const statusEl = document.getElementById("cortanaStatus");
    if (statusEl) {
      if (online) {
        statusEl.textContent = "● En línea";
        statusEl.style.color = "#4caf50";
        statusEl.classList.remove("offline");
        statusEl.classList.add("online");
      } else {
        statusEl.textContent = "● Offline";
        statusEl.style.color = "#f44336";
        statusEl.classList.remove("online");
        statusEl.classList.add("offline");
      }
    }
  }

  /**
   * Añade un mensaje al área de salida del chat.
   * @param {string} text
   * @param {string} type - 'user', 'bot', 'error'
   */
  function _appendMessage(text, type) {
    const output = document.getElementById("cortanaOutput");
    if (!output) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `cortana-message cortana-message-${type}`;
    
    // Estilos básicos para los mensajes si no hay CSS externo
    const baseStyle = "margin-bottom: 8px; padding: 6px; border-radius: 4px; word-wrap: break-word;";
    if (type === 'user') {
      msgDiv.style.cssText = baseStyle + "background: #e3f2fd; text-align: right;";
    } else if (type === 'bot') {
      msgDiv.style.cssText = baseStyle + "background: #f1f8e9;";
    } else if (type === 'error') {
      msgDiv.style.cssText = baseStyle + "background: #ffebee; color: #c62828;";
    }

    // Sanitizar texto básico para evitar inyección de HTML no deseado
    // Pero permitir saltos de línea
    const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    msgDiv.innerHTML = safeText;

    output.appendChild(msgDiv);
    output.scrollTop = output.scrollHeight;
  }

  // -------------------------------------------------------------------------
  // Lógica principal de consulta
  // -------------------------------------------------------------------------

  /**
   * Procesa una consulta del usuario.
   * @param {string} query
   * @returns {Promise<string>}
   */
  async function _processQuery(query) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return "Por favor, ingresa una consulta válida.";

    // 1. Intentar coincidencia local por código de reporte
    const codeMatch = trimmedQuery.match(/[A-Z0-9]{3,}/i);
    if (codeMatch) {
      const code = codeMatch[0];
      const report = _findReportByCode(code);
      if (report) {
        return _formatReportResponse(report);
      }
    }

    // 2. Si no hay coincidencia local, delegar al backend
    if (!isOnline) {
      return "Sistema de reportes offline. No puedo procesar tu consulta ahora mismo.";
    }

    try {
      const resp = await fetch(ENDPOINT_ASK, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: trimmedQuery })
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = await resp.json();
      if (data.response) {
        _handleCircuitBreaker(true);
        return data.response;
      } else if (data.error) {
        _handleCircuitBreaker(true); // El servidor respondió, aunque con error lógico
        return `Error: ${data.error}`;
      } else {
        _handleCircuitBreaker(true);
        return "No pude procesar tu consulta. Intenta con un código de reporte específico.";
      }
    } catch (e) {
      console.error("❌ Error al procesar consulta:", e);
      _handleCircuitBreaker(false);
      return "Error de conexión al procesar tu consulta. Inténtalo más tarde.";
    }
  }

  /**
   * Formatea la respuesta de un reporte encontrado localmente.
   * @param {Object} report
   * @returns {string}
   */
  function _formatReportResponse(report) {
    const lines = [];
    lines.push(`📋 Reporte: ${report.codigo || "N/A"}`);
    lines.push(`📅 Fecha: ${report.fecha || "N/A"}`);
    lines.push(`👤 Paciente: ${report.paciente || "N/A"}`);
    lines.push(`📊 Estado: ${report.estado || "N/A"}`);

    if (report.detalle && typeof report.detalle === "object") {
      const keys = Object.keys(report.detalle);
      if (keys.length > 0) {
        lines.push("📝 Detalle:");
        keys.forEach(key => {
          const value = report.detalle[key];
          if (value !== null && value !== undefined) {
            lines.push(`   • ${key}: ${value}`);
          }
        });
      }
    }

    return lines.join("\n");
  }

  /**
   * Maneja el envío de una consulta.
   */
  async function _handleSend() {
    if (isProcessing) return;

    const input = document.getElementById("cortanaInput");
    if (!input) return;

    const query = input.value.trim();
    if (!query) return;

    // Limpiar input
    input.value = "";

    // Mostrar mensaje del usuario
    _appendMessage(query, "user");

    // Deshabilitar controles
    isProcessing = true;
    const sendBtn = document.getElementById("cortanaSendBtn");
    if (sendBtn) sendBtn.disabled = true;

    // Procesar consulta
    try {
      const response = await _processQuery(query);
      _appendMessage(response, "bot");
    } catch (e) {
      console.error("❌ Error en _handleSend:", e);
      _appendMessage("Ocurrió un error inesperado. Inténtalo de nuevo.", "error");
    } finally {
      isProcessing = false;
      if (sendBtn) sendBtn.disabled = false;
      input.focus();
    }
  }

  /**
   * Circuit Breaker: maneja fallos consecutivos.
   * @param {boolean} success
   */
  function _handleCircuitBreaker(success) {
    if (success) {
      consecutiveFailures = 0;
      if (!isOnline) {
        isOnline = true;
        _updateStatus(true);
        _hideErrorBanner();
        // Notificar a antigravity.js que la conexión se recuperó
        document.dispatchEvent(new CustomEvent("omega:connection:restored", {
          detail: { timestamp: Date.now() }
        }));
      }
    } else {
      consecutiveFailures++;
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES && isOnline) {
        isOnline = false;
        _updateStatus(false);
        _showErrorBanner();
        // Notificar a antigravity.js que la conexión se perdió
        document.dispatchEvent(new CustomEvent("omega:connection:lost", {
          detail: {
            timestamp: Date.now(),
            reason: "circuit_breaker_triggered"
          }
        }));
        _appendMessage("Sistema de reportes offline. Reintentando automáticamente...", "error");
      }
    }
  }

  /**
   * Muestra el banner de error SLA.
   */
  function _showErrorBanner() {
    const banner = document.getElementById("slaErrorBanner");
    if (banner) {
      banner.classList.remove("hidden");
      banner.style.display = "block";
    }
  }

  /**
   * Oculta el banner de error SLA.
   */
  function _hideErrorBanner() {
    const banner = document.getElementById("slaErrorBanner");
    if (banner) {
      banner.classList.add("hidden");
      banner.style.display = "none";
    }
  }

  /**
   * Actualiza el índice de reportes desde el endpoint /reports.
   * @returns {Promise<boolean>}
   */
  async function _refreshReportsIndex() {
    try {
      const resp = await fetch(ENDPOINT_REPORTS, {
        method: "GET",
        credentials: "same-origin"
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (Array.isArray(data)) {
        _buildReportsIndex(data);
        _handleCircuitBreaker(true);
        return true;
      } else {
        throw new Error("Respuesta no es un array");
      }
    } catch (e) {
      console.error("❌ Error al actualizar índice de reportes:", e);
      _handleCircuitBreaker(false);
      return false;
    }
  }

  /**
   * Inicia el ciclo de vida del módulo Cortana.
   */
  async function _init() {
    // Esperar a que el DOM esté listo
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", _init);
      return;
    }

    // Inicializar DOM (crea elementos si faltan)
    _initDOM();

    // Verificar salud inicial
    const healthy = await _checkHealth();
    isOnline = healthy;
    _updateStatus(healthy);

    if (healthy) {
      _appendMessage("Hola, soy Cortana de JCLAB. ¿En qué puedo ayudarte? Puedes buscar por código de reporte o hacer preguntas sobre tus casos.", "bot");
      // Cargar índice inicial
      await _refreshReportsIndex();
    } else {
      _appendMessage("Sistema de reportes offline. Reintentando automáticamente...", "error");
      _showErrorBanner();
    }

    // Refresco periódico del índice (cada 60s)
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
    }
    
    refreshIntervalId = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (isOnline) {
        await _refreshReportsIndex();
      } else {
        // Intentar recuperar conexión
        const healthy = await _checkHealth();
        if (healthy) {
          isOnline = true;
          consecutiveFailures = 0;
          _updateStatus(true);
          _hideErrorBanner();
          _appendMessage("Conexión restablecida. Sistema de reportes disponible.", "bot");
          document.dispatchEvent(new CustomEvent("omega:connection:restored", {
            detail: { timestamp: Date.now() }
          }));
          await _refreshReportsIndex();
        }
      }
    }, REFRESH_INTERVAL_MS);

    // Escuchar eventos de antigravity.js
    document.addEventListener("omega:connection:lost", (e) => {
      console.log("📡 Cortana: Conexión perdida detectada por antigravity.js");
      isOnline = false;
      _updateStatus(false);
      _showErrorBanner();
      _appendMessage("Sistema de reportes offline. No puedo procesar consultas hasta que se restablezca la conexión.", "error");
    });

    document.addEventListener("omega:connection:restored", (e) => {
      console.log("📡 Cortana: Conexión restablecida detectada por antigravity.js");
      isOnline = true;
      consecutiveFailures = 0;
      _updateStatus(true);
      _hideErrorBanner();
      _appendMessage("Conexión restablecida. Sistema de reportes disponible.", "bot");
      _refreshReportsIndex();
    });
  }

  // -------------------------------------------------------------------------
  // Inicialización
  // -------------------------------------------------------------------------
  _init();

  // Exponer API pública para integración con otros módulos
  window.CortanaChat = {
    sendQuery: async (text) => {
      return await _processQuery(text);
    },
    getStatus: () => {
      return {
        online: isOnline,
        consecutiveFailures: consecutiveFailures,
        reportsIndexed: reportsIndex.size
      };
    },
    refreshIndex: async () => {
      return await _refreshReportsIndex();
    }
  };
})();
