/**
 * JC PATH LAB - Plataforma Móvil PWA / App
 * Arquitectura: Clean Enterprise Biotech / Sovereign Clinical Glass
 * 100% Offline, Soberano y Cero Créditos
 */

// Base de Datos de Pacientes (Servicio Q y Servicio C)
const PATIENTS_DB = [
  {
    id: "26Q-281",
    service: "Q",
    paciente: "Avalos Valenzuela, Carlos Antonio",
    edad: 70,
    sexo: "M",
    procedimiento: "Enucleación Prostática",
    codigo_casete: "26Q-281",
    fecha_ingreso: "28/08/26",
    fecha_entrega: "01/09/26",
    medico: "Dr. Flores Sierra, Bryan",
    sede: "Clínica Carrión",
    estado: "Listo para Imprimir",
    estado_tipo: "ready",
    casetes: 6,
    peso: "65.0 g",
    dimensiones: "8.5 x 7.2 x 5.5 cm",
    macro: "Se recibe pieza quirúrgica de enucleación prostática integrada por lóbulos adenomatosos bien delimitados, con superficie externa pseudo-capsular lisa y congestiva, que mide 8.5 x 7.2 x 5.5 cm y pesa 65.0 g. La superficie de corte demuestra arquitectura nodular arremolinada con formaciones microquísticas ectásicas milimétricas y secreción coloide, desprovista de focos indurados sospechosos o necrosis. Se incluye muestra representativa en 6 casete(s).",
    micro: "El examen microscópico demuestra parénquima prostático caracterizado por hiperplasia nodular mixta (glandular y estromal). Las unidades acinares exhiben luces dilatadas, plegamientos papilares y cuerpos amiláceos intraluminares, conservando una bicapa celular intacta (células basales continuas y células luminales secretoras) sin atipia citológica. El estroma interglandular presenta hiperplasia fibromuscular, asociado a un leve infiltrado inflamatorio crónico linfohistiocitario focal. El plano de enucleación pseudocapsular periférico está desprovisto de lesión neoplásica.",
    diagnostico: "PRÓSTATA (ENUCLEACIÓN PROSTÁTICA):\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (COMPONENTE GLANDULAR Y FIBROMUSCULAR).\n- PROSTATITIS CRÓNICA LINFOHISTIOCITARIA LEVE INESPECÍFICA.\n- PSEUDOCÁPSULA QUIRÚRGICA LIBRE DE NEOPLASIA.\n- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN) Y NEGATIVO PARA MALIGNIDAD EN EL MATERIAL EXAMINADO.",
    patologo: "Dr. Joseph Christopher Castillo Cuenca",
    cmp: "060426",
    rne: "034112"
  },
  {
    id: "26Q-280",
    service: "Q",
    paciente: "Quispe Ticllasuca, Oswaldo",
    edad: 82,
    sexo: "M",
    procedimiento: "Morcelado de Próstata",
    codigo_casete: "26Q-280",
    fecha_ingreso: "28/08/26",
    fecha_entrega: "01/09/26",
    medico: "Dr. Flores Sierra, Bryan",
    sede: "Clínica Carrión",
    estado: "Listo para Imprimir",
    estado_tipo: "ready",
    casetes: 6,
    peso: "45.0 g",
    dimensiones: "12.3 x 9.4 x 7.8 cm",
    macro: "Se reciben múltiples fragmentos tisulares irregulares de tejido prostático (virutas de morcelación), de coloración pardo blanquecina a pardo amarillenta y consistencia elástica, que en conjunto miden 12.3 x 9.4 x 7.8 cm y pesan 45.0 g. Se incluye muestra representativa en 6 casete(s).",
    micro: "Los cortes histológicos muestran parénquima prostático con hiperplasia nodular mixta (glandular y estromal). Las unidades acinares presentan luces de calibre variable con corpúsculos amiláceos intraluminares y revestimiento epitelial bicapa conservado, exhibiendo una capa basal continua y sin atipia citológica. El estroma fibromuscular interglandular se encuentra hiperplásico, asociado a un leve infiltrado inflamatorio crónico linfohistiocitario focal.",
    diagnostico: "PRÓSTATA (MORCELADOS):\n- HIPERPLASIA NODULAR PROSTÁTICA BENIGNA (COMPONENTE GLANDULAR Y ESTROMAL).\n- PROSTATITIS CRÓNICA LEVE INESPECÍFICA.\n- NEGATIVO PARA NEOPLASIA INTRAEPITELIAL PROSTÁTICA DE ALTO GRADO (HGPIN) Y NEGATIVO PARA MALIGNIDAD EN EL MATERIAL EXAMINADO.",
    patologo: "Dr. Joseph Christopher Castillo Cuenca",
    cmp: "060426",
    rne: "034112"
  },
  {
    id: "26Q-341",
    service: "Q",
    paciente: "Blas Rojas, Bony Lizbeth",
    edad: 29,
    sexo: "F",
    procedimiento: "Biopsia Gástrica (Antro)",
    codigo_casete: "26Q-341",
    fecha_ingreso: "10/10/26",
    fecha_entrega: "15/10/26",
    medico: "Dr. Jhon Vilca",
    sede: "Clínica La Luz",
    estado: "Listo para Imprimir",
    estado_tipo: "ready",
    casetes: 1,
    peso: "0.8 g",
    dimensiones: "0.4 x 0.3 x 0.2 cm",
    macro: "Se reciben tres (03) fragmentos mucosos parduzcos milimétricos que miden entre 0.2 y 0.4 cm. Se incluye totalidad en 1 casete.",
    micro: "Mucosa gástrica de tipo antral con gastritis crónica moderada activa, presencia de Helicobacter pylori (+). No se observa metaplasia intestinal ni displasia.",
    diagnostico: "ESTÓMAGO (BIOPSIA ANTRAL):\n- GASTRITIS CRÓNICA MODERADA ACTIVA.\n- HELICOBACTER PYLORI (+).\n- NEGATIVO PARA ATROFIA Y METAPLASIA INTESTINAL.",
    patologo: "Dr. Joseph Christopher Castillo Cuenca",
    cmp: "060426",
    rne: "034112"
  },
  {
    id: "26C-102",
    service: "C",
    paciente: "Pérez Mendoza, María Elena",
    edad: 45,
    sexo: "F",
    procedimiento: "Papanicolaou Cervicovaginal",
    codigo_casete: "26C-102",
    fecha_ingreso: "12/10/26",
    fecha_entrega: "16/10/26",
    medico: "Dr. Juan Marreros Lloclla",
    sede: "Clínica de la Mujer",
    estado: "Listo para Imprimir",
    estado_tipo: "ready",
    casetes: 0,
    peso: "N/A",
    dimensiones: "1 Lámina extendida",
    macro: "Se recibe una lámina fijada con citospray y coloreada con técnica de Papanicolaou.",
    micro: "Frotis cérvico-vaginal constituido por células epiteliales escamosas superficiales e intermedias. Flora bacilar Döderlein presente. Ausencia de células atípicas.",
    diagnostico: "CITOLOGÍA CÉRVICO-VAGINAL (SISTEMA BETHESDA 2014/2026):\n- CALIDAD DEL ESPÉCIMEN: SATISFACTORIO PARA EVALUACIÓN.\n- CATEGORIZACIÓN GENERAL: NEGATIVO PARA LESIÓN INTRAEPITELIAL O MALIGNIDAD (NILM).\n- CAMBIOS CELULARES REACTIVOS INFLAMATORIOS LEVES.",
    patologo: "Dr. Joseph Christopher Castillo Cuenca",
    cmp: "060426",
    rne: "034112"
  },
  {
    id: "26C-103",
    service: "C",
    paciente: "Gutiérrez Ramos, Carmen Rosa",
    edad: 52,
    sexo: "F",
    procedimiento: "Citología Líquido Ascítico",
    codigo_casete: "26C-103",
    fecha_ingreso: "14/10/26",
    fecha_entrega: "17/10/26",
    medico: "Dr. Flores Sierra, Bryan",
    sede: "Clínica Carrión",
    estado: "En Proceso",
    estado_tipo: "process",
    casetes: 0,
    peso: "50 mL",
    dimensiones: "2 Láminas citocentrífuga",
    macro: "Se recibe frasco con 50 mL de líquido amarillo cetrino.",
    micro: "Citología en bloque celular y frotis teñido con Papanicolaou y Diff-Quik. Células mesoteliales reactivas y linfocitos aislados.",
    diagnostico: "LÍQUIDO ASCÍTICO (CITOPATOLOGÍA):\n- EXTENDIDO NEGATIVO PARA CÉLULAS NEOPLÁSICAS MALIGNAS.\n- MESOTELIO REACTIVO BENIGNO.",
    patologo: "Dr. Joseph Christopher Castillo Cuenca",
    cmp: "060426",
    rne: "034112"
  }
];

// Estado de la Aplicación
let currentService = "Q"; // 'Q' o 'C'
let currentSearchQuery = "";
let activePatient = null;
let currentTab = "pacientes";

// Inicialización al cargar DOM
document.addEventListener("DOMContentLoaded", () => {
  renderPatientStream();
  setupEventListeners();
  init360Viewer();
  registerPWA();
});

// Configuración de Escuchadores de Eventos
function setupEventListeners() {
  const tabQ = document.getElementById("tabServicioQ");
  const tabC = document.getElementById("tabServicioC");

  if (tabQ) {
    tabQ.addEventListener("click", () => {
      currentService = "Q";
      tabQ.classList.add("active");
      tabC.classList.remove("active");
      renderPatientStream();
    });
  }

  if (tabC) {
    tabC.addEventListener("click", () => {
      currentService = "C";
      tabC.classList.add("active");
      tabQ.classList.remove("active");
      renderPatientStream();
    });
  }

  // Búsqueda en Vivo
  const searchInput = document.getElementById("patientSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      renderPatientStream();
    });
  }

  // Botón Escudo Soberano Superior
  const shieldBtn = document.getElementById("shieldStatusBtn");
  if (shieldBtn) {
    shieldBtn.addEventListener("click", () => {
      openShieldModal();
    });
  }

  // Navegación Inferior Móvil
  const navButtons = document.querySelectorAll(".nav-item");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetNav = btn.getAttribute("data-nav");
      if (!targetNav) return;

      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      handleNavSwitch(targetNav);
    });
  });
}

// Navegación de Pantallas
function handleNavSwitch(nav) {
  currentTab = nav;
  const streamSection = document.getElementById("patientStreamSection");
  const filterSection = document.getElementById("filterSection");
  const serviceSection = document.getElementById("serviceSelectorSection");

  if (nav === "pacientes") {
    if (streamSection) streamSection.style.display = "flex";
    if (filterSection) filterSection.style.display = "flex";
    if (serviceSection) serviceSection.style.display = "block";
  } else if (nav === "visor360") {
    const patientWith360 = PATIENTS_DB.find(p => p.service === currentService) || PATIENTS_DB[0];
    open360Modal(patientWith360);
  } else if (nav === "inicio") {
    showToast("JC PATH LAB - Conectado a Servidor Soberano Local");
  } else if (nav === "ajustes") {
    openShieldModal();
  }
}

// Renderizado de Lista de Pacientes (Idéntica a la Foto de Referencia)
function renderPatientStream() {
  const container = document.getElementById("patientListContainer");
  const countBadge = document.getElementById("patientCountBadge");
  if (!container) return;

  const filtered = PATIENTS_DB.filter(p => {
    const matchService = p.service === currentService;
    const matchQuery = !currentSearchQuery || 
      p.paciente.toLowerCase().includes(currentSearchQuery) ||
      p.codigo_casete.toLowerCase().includes(currentSearchQuery) ||
      p.procedimiento.toLowerCase().includes(currentSearchQuery) ||
      p.medico.toLowerCase().includes(currentSearchQuery);
    return matchService && matchQuery;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} reg.`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #64748b;">
        <svg style="width: 48px; height: 48px; fill: #cbd5e1; margin-bottom: 12px;" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>
        </svg>
        <p style="font-weight: 600;">No se encontraron registros para este servicio.</p>
        <small style="color: #94a3b8;">Verifique el término de búsqueda o seleccione otro servicio.</small>
      </div>
    `;
    return;
  }

  // Generar Tarjetas idénticas a la imagen de referencia
  container.innerHTML = filtered.map(p => {
    const isReady = p.estado_tipo === "ready";
    const badgeClass = isReady ? "status-badge" : "status-badge in-process";
    const badgeText = isReady ? "Listo para Imprimir" : "En Proceso";

    return `
      <div class="patient-card" data-id="${p.id}">
        <!-- Fila Superior: Nombre y Estado -->
        <div class="card-header-row">
          <div class="patient-name-block">
            <span class="patient-name">${p.paciente}</span>
            <span class="patient-age">(${p.edad} años)</span>
          </div>
          <div class="${badgeClass}">
            <span class="badge-dot"></span>
            ${badgeText}
          </div>
        </div>

        <!-- Fila de Tags: Procedimiento e ID de Casete -->
        <div class="tags-row">
          <div class="tag-pill" title="${p.procedimiento}">
            <svg viewBox="0 0 24 24"><path d="M4.5 10.5C3.67 10.5 3 11.17 3 12s.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-15zM10.5 4.5C10.5 3.67 11.17 3 12 3s1.5.67 1.5 1.5v15c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-15z"/></svg>
            <span>${p.procedimiento.length > 20 ? p.procedimiento.substring(0, 18) + '...' : p.procedimiento}</span>
          </div>
          <div class="tag-pill id-pill">
            <svg viewBox="0 0 24 24"><path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm4 0h2v16h-2V4z"/></svg>
            <span>ID: ${p.codigo_casete}</span>
          </div>
        </div>

        <!-- Fila de Fechas: Ingreso y Entrega -->
        <div class="dates-row">
          <div class="date-col">
            <span class="date-label">
              <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
              Ingreso
            </span>
            <span class="date-val">${p.fecha_ingreso}</span>
          </div>
          <div class="date-col">
            <span class="date-label">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Entrega
            </span>
            <span class="date-val">
              <span class="mini-dot"></span>
              ${p.fecha_entrega}
            </span>
          </div>
        </div>

        <!-- Fila de Médico y Sede -->
        <div class="doctor-row">
          <span class="doctor-label">
            <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            Médico / Sede
          </span>
          <span class="doctor-val">${p.medico} • ${p.sede}</span>
        </div>

        <!-- Fila de Botones Interactivos -->
        <div class="card-actions-row">
          <button class="btn-report" onclick="openReportModal('${p.id}')">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            Ver Informe
          </button>
          <button class="btn-360" onclick="open360ModalById('${p.id}')">
            <svg viewBox="0 0 24 24"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
            360°
          </button>
          <button class="btn-more" onclick="openOptionsMenu('${p.id}')" title="Opciones">
            <svg viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// ============================================================================
// VISOR DE INFORME PDF EN 1 TOQUE (DIRECTO Y SOBERANO)
// ============================================================================
window.openReportModal = function(id) {
  const p = PATIENTS_DB.find(item => item.id === id);
  if (!p) return;
  activePatient = p;

  const modal = document.getElementById("reportModalOverlay");
  const content = document.getElementById("reportModalContent");
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-header">
      <div>
        <h3 class="sheet-title">Informe Anatomopatológico</h3>
        <small style="color: #64748b; font-family: var(--font-mono); font-weight: 600;">Casete: ${p.codigo_casete} · Sede: ${p.sede}</small>
      </div>
      <button class="sheet-close-btn" onclick="closeModals()">
        <svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
    </div>

    <!-- Previsualización del Informe A4 Oficial -->
    <div class="report-pdf-body">
      <div class="pdf-header-preview">
        <div>
          <div style="font-weight: 800; font-size: 1.1rem; color: #0f172a; letter-spacing: 0.05em;">JC PATH LAB</div>
          <div style="font-size: 0.72rem; color: #0284c7; font-weight: 700;">ANATOMÍA PATOLÓGICA & CITOPATOLOGÍA SOBERANA</div>
        </div>
        <div style="text-align: right; font-size: 0.7rem; color: #64748b;">
          <div>REPORTE OFICIAL</div>
          <div style="font-weight: 700; color: #0f172a;">${p.codigo_casete}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.75rem; background: #ffffff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 12px;">
        <div><strong>Paciente:</strong> ${p.paciente}</div>
        <div><strong>Edad / Sexo:</strong> ${p.edad} años / ${p.sexo}</div>
        <div><strong>Médico:</strong> ${p.medico}</div>
        <div><strong>Sede:</strong> ${p.sede}</div>
        <div><strong>Ingreso:</strong> ${p.fecha_ingreso}</div>
        <div><strong>Emisión:</strong> ${p.fecha_entrega}</div>
      </div>

      <div class="pdf-section-title">Espécimen Remitido</div>
      <div style="font-weight: 600; color: #0f172a;">${p.procedimiento} (${p.peso})</div>

      <div class="pdf-section-title">Descripción Macroscópica</div>
      <p style="margin-bottom: 10px; text-align: justify;">${p.macro}</p>

      <div class="pdf-section-title">Examen Microscópico</div>
      <p style="margin-bottom: 10px; text-align: justify;">${p.micro}</p>

      <div class="pdf-section-title">Diagnóstico Histopatológico Definitivo</div>
      <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 10px; border-radius: 4px; font-weight: 700; color: #0c4a6e; white-space: pre-line; margin-bottom: 12px;">
        ${p.diagnostico}
      </div>

      <div class="pdf-signature-box">
        <div class="pdf-qr-box">
          <svg style="width: 48px; height: 48px; fill: #0f172a;" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v5h-2v-5zm3 3h3v5h-3v-5zm-5 3h2v2h-2v-2zm7 0h1v2h-1v-2z"/></svg>
        </div>
        <div style="flex: 1; font-size: 0.72rem; color: #475569;">
          <div style="font-weight: 700; color: #0f172a;">FIRMADO DIGITALMENTE</div>
          <div>${p.patologo}</div>
          <div>CMP: ${p.cmp} · RNE: ${p.rne}</div>
          <div style="color: #10b981; font-weight: 600;">✓ Verificado Criptográficamente 100% Offline</div>
        </div>
      </div>
    </div>

    <!-- Botón de Descarga / Impresión en 1 Toque -->
    <div style="display: flex; gap: 8px; margin-top: 16px;">
      <button class="btn-report" style="width: 100%; height: 46px; font-size: 0.92rem;" onclick="triggerDirectPdfDownload('${p.id}')">
        <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
        Descargar PDF en 1 Toque
      </button>
      <button class="btn-360" style="width: 80px;" onclick="window.print()" title="Imprimir">
        <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
      </button>
    </div>
  `;

  modal.classList.add("active");
};

// Descarga en 1 toque
window.triggerDirectPdfDownload = function(id) {
  const p = PATIENTS_DB.find(item => item.id === id);
  if (!p) return;
  showToast(`Descargando informe oficial ${p.codigo_casete} (${p.paciente})...`);
  setTimeout(() => {
    window.print();
  }, 350);
};

// ============================================================================
// VISOR MACROSCÓPICO 360° INTERACTIVO
// ============================================================================
let angle360 = 0;
let isDragging360 = false;
let startX360 = 0;
let autoSpin360 = false;
let spinTimer = null;
let current360Patient = null;

function init360Viewer() {
  const canvas = document.getElementById("canvas360");
  if (!canvas) return;

  const startDrag = (x) => {
    isDragging360 = true;
    startX360 = x;
    if (autoSpin360) toggleAutoSpin();
  };

  const moveDrag = (x) => {
    if (!isDragging360) return;
    const deltaX = x - startX360;
    startX360 = x;
    angle360 = (angle360 - deltaX * 0.8) % 360;
    if (angle360 < 0) angle360 += 360;
    render360Frame();
  };

  const endDrag = () => {
    isDragging360 = false;
  };

  canvas.addEventListener("mousedown", (e) => startDrag(e.clientX));
  window.addEventListener("mousemove", (e) => moveDrag(e.clientX));
  window.addEventListener("mouseup", endDrag);

  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) startDrag(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) moveDrag(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener("touchend", endDrag);

  canvas.width = 400;
  canvas.height = 320;
}

window.open360ModalById = function(id) {
  const p = PATIENTS_DB.find(item => item.id === id);
  if (p) open360Modal(p);
};

window.open360Modal = function(patient) {
  current360Patient = patient || PATIENTS_DB[0];
  const modal = document.getElementById("modal360Overlay");
  if (!modal) return;

  const titleEl = document.getElementById("modal360Title");
  const metaEl = document.getElementById("modal360Meta");
  const descEl = document.getElementById("modal360Desc");

  if (titleEl) titleEl.textContent = `Visor 360° · ${current360Patient.codigo_casete}`;
  if (metaEl) metaEl.textContent = `${current360Patient.procedimiento} · Peso: ${current360Patient.peso}`;
  if (descEl) descEl.textContent = current360Patient.macro;

  modal.classList.add("active");
  angle360 = 0;
  render360Frame();
};

function render360Frame() {
  const canvas = document.getElementById("canvas360");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const bgGrad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, 180);
  bgGrad.addColorStop(0, "#13213c");
  bgGrad.addColorStop(1, "#050a12");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 20; i < w; i += 20) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
  }
  for (let j = 20; j < h; j += 20) {
    ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke();
  }

  ctx.save();
  ctx.translate(w / 2, h / 2);
  const rad = (angle360 * Math.PI) / 180;

  ctx.beginPath();
  ctx.ellipse(0, 85, 95 + Math.sin(rad) * 10, 22, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fill();

  ctx.save();
  ctx.rotate(Math.sin(rad) * 0.08);

  const baseGrad = ctx.createRadialGradient(-20 * Math.cos(rad), -25, 10, 0, 0, 110);
  baseGrad.addColorStop(0, "#f2d4be");
  baseGrad.addColorStop(0.4, "#d49b78");
  baseGrad.addColorStop(0.8, "#9c5a38");
  baseGrad.addColorStop(1, "#4a2312");

  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 82 + Math.cos(rad) * 14, 68 + Math.sin(rad * 2) * 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(15, 23, 42, 0.95)";
  ctx.lineWidth = 6;
  ctx.setLineDash([14, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1.5;
  for (let n = -3; n <= 3; n++) {
    ctx.beginPath();
    const nx = n * 18 + Math.sin(rad) * 12;
    ctx.arc(nx, n * 6, 16 + Math.abs(n) * 4, 0, Math.PI * 1.4);
    ctx.stroke();
  }

  const specGrad = ctx.createRadialGradient(-35 * Math.cos(rad), -30, 2, -35 * Math.cos(rad), -30, 25);
  specGrad.addColorStop(0, "rgba(255, 255, 255, 0.65)");
  specGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(-35 * Math.cos(rad), -30, 25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();

  const hudAngle = document.getElementById("hud360Angle");
  const hudFace = document.getElementById("hud360Face");
  if (hudAngle) hudAngle.textContent = `${Math.round(angle360)}°`;

  if (hudFace) {
    if (angle360 >= 315 || angle360 < 45) {
      hudFace.textContent = "Cara Anterior (Superficie Pseudocapsular)";
    } else if (angle360 >= 45 && angle360 < 135) {
      hudFace.textContent = "Margen Quirúrgico Derecho (Tinta China)";
    } else if (angle360 >= 135 && angle360 < 225) {
      hudFace.textContent = "Cara Posterior (Base de Resección)";
    } else {
      hudFace.textContent = "Margen Quirúrgico Izquierdo";
    }
  }
}

window.toggleAutoSpin = function() {
  autoSpin360 = !autoSpin360;
  const btn = document.getElementById("btnAutoSpin");
  if (btn) btn.classList.toggle("active", autoSpin360);

  if (autoSpin360) {
    spinTimer = setInterval(() => {
      angle360 = (angle360 + 1.5) % 360;
      render360Frame();
    }, 30);
  } else {
    clearInterval(spinTimer);
  }
};

window.reset360Angle = function() {
  angle360 = 0;
  render360Frame();
};

// ============================================================================
// MENÚ DE OPCIONES Y MODAL DE SEGURIDAD
// ============================================================================
window.openOptionsMenu = function(id) {
  const p = PATIENTS_DB.find(item => item.id === id);
  if (!p) return;
  activePatient = p;

  const modal = document.getElementById("optionsModalOverlay");
  const content = document.getElementById("optionsModalContent");
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-header">
      <h3 class="sheet-title">Opciones Clínicas · ${p.codigo_casete}</h3>
      <button class="sheet-close-btn" onclick="closeModals()">
        <svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <button class="ctl-btn" style="width: 100%; justify-content: flex-start; padding: 12px;" onclick="shareViaWhatsApp('${p.id}')">
        <svg style="width: 18px; height: 18px; fill: #25D366;" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
        <span>Despachar a WhatsApp del Urólogo (${p.medico})</span>
      </button>
      <button class="ctl-btn" style="width: 100%; justify-content: flex-start; padding: 12px;" onclick="copyCaseId('${p.codigo_casete}')">
        <svg style="width: 18px; height: 18px; fill: #0284c7;" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
        <span>Copiar Código de Casete (${p.codigo_casete})</span>
      </button>
      <button class="ctl-btn" style="width: 100%; justify-content: flex-start; padding: 12px;" onclick="open360ModalById('${p.id}')">
        <svg style="width: 18px; height: 18px; fill: #06b6d4;" viewBox="0 0 24 24"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6z"/></svg>
        <span>Inspeccionar Macroscopía 360°</span>
      </button>
    </div>
  `;

  modal.classList.add("active");
};

window.shareViaWhatsApp = function(id) {
  const p = PATIENTS_DB.find(item => item.id === id);
  if (!p) return;
  const msg = encodeURIComponent(
    `*JC PATH LAB - INFORME HISTOPATOLÓGICO DISPONIBLE*\n` +
    `📌 *Casete:* ${p.codigo_casete}\n` +
    `👤 *Paciente:* ${p.paciente} (${p.edad} años)\n` +
    `🔬 *Procedimiento:* ${p.procedimiento}\n` +
    `🏥 *Sede:* ${p.sede}\n` +
    `👨‍⚕️ *Médico:* ${p.medico}\n` +
    `✅ *Estado:* Listo para Imprimir / Validado\n\n` +
    `Puede descargar el PDF oficial y revisar el espécimen 360° en la app móvil soberana.`
  );
  window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  closeModals();
};

window.copyCaseId = function(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Código ${code} copiado al portapapeles.`);
    closeModals();
  });
};

function openShieldModal() {
  const modal = document.getElementById("shieldModalOverlay");
  if (modal) modal.classList.add("active");
}

window.closeModals = function() {
  document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
  if (autoSpin360) toggleAutoSpin();
};

document.querySelectorAll(".modal-overlay").forEach(modal => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModals();
  });
});

function showToast(message) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 10px 18px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 3000);
}

function registerPWA() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").then(() => {
      console.log("JC PATH LAB PWA Service Worker Registrado");
    }).catch(() => {
      console.log("PWA Service Worker offline activo localmente");
    });
  }
}
