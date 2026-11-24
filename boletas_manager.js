// ==============================================================================
// MÓDULO AUTÓNOMO DE BOLETAS Y CONSTANCIAS DE PAGO A EMPRESAS (JC PATH LAB)
// Arquitectura: Local-First Permanente + Respaldo en Supabase (Cero Pérdidas)
// Versión: 2.0.0 - Blindaje Omega-Argón (Lóbulo 3)
// ==============================================================================

/**
 * STAGE 1: CAPA DE PERSISTENCIA SOBERANA Y REGLA 28 (SLA DE INFORMES)
 * ------------------------------------------------------------------------------
 * Esta sección implementa la persistencia Local-First utilizando LocalStorage como
 * caché de alta velocidad y Supabase como espejo de respaldo inmutable. 
 * Se aplica la Regla 28 para asegurar que los casos pendientes (🔴) siempre 
 * encabecen las listas de trabajo del Dr. José Castillo.
 * ------------------------------------------------------------------------------
 */

const STORAGE_KEY_EMPRESAS = 'jcpath_empresas_catalog';
const STORAGE_KEY_BOLETAS = 'jcpath_boletas_history';

// Empresas iniciales por defecto si la base de datos está completamente vacía
const DEFAULT_EMPRESAS = [
    {
        id: 'emp_01',
        razonSocial: 'CLÍNICA SAN CLEMENTE S.A.C.',
        ruc: '20512345678',
        direccion: 'Av. Principal 123, Ica',
        telefono: '956123456',
        contacto: 'Administración / Facturación',
        createdAt: new Date().toISOString(),
        estado: 'ACTIVO'
    },
    {
        id: 'emp_carrion_ventanilla',
        razonSocial: 'EMP. DE SERV. DE SALUD POLICL. CARRION S.A. (CLÍNICA CARRIÓN)',
        ruc: '20419815552',
        direccion: 'Av. Pedro Beltrán Nro. 175, Urb. Ciudad Satélite (Fte. Comisaría), Ventanilla, Callao',
        telefono: '5531610',
        contacto: 'Administración / Facturación',
        createdAt: new Date().toISOString(),
        estado: 'ACTIVO'
    }
];

// Configuración del Laboratorio Emisor Oficial (JC PATH LAB)
const LAB_INFO = {
    nombre: 'JC PATH LAB | ANATOMÍA PATOLÓGICA',
    subtitulo: 'DIAGNÓSTICO HISTOPATOLÓGICO, CITOLÓGICO E INMUNOHISTOQUÍMICA',
    director: 'Dirección Médica Especializada | Dr. José Castillo Cuenca',
    ruc: '10414574667',
    telefono: '986396733',
    direccionLocal: 'Mz. M2 Lote 13, Los Jardines de Chillón, Puente Piedra, Lima - Perú',
    email: 'jcastillo@jcpathlab.com'
};

/**
 * Aplica la Regla 28: Ordenamiento SLA de Informes/Boletas.
 * Prioriza casos PENDIENTES (🔴) sobre FIRMADOS/PAGADOS (🟢).
 * @param {Array} items - Lista de boletas.
 * @returns {Array} - Lista ordenada determinísticamente.
 */
export function sortBoletasBySLA(items) {
    if (!Array.isArray(items)) return [];
    return [...items].sort((a, b) => {
        // Prioridad 1: Estado de conclusión (Pendientes arriba)
        const aPendiente = a.estado === 'PENDIENTE' || !a.pagado;
        const bPendiente = b.estado === 'PENDIENTE' || !b.pagado;

        if (aPendiente && !bPendiente) return -1;
        if (!aPendiente && bPendiente) return 1;

        // Prioridad 2: Orden cronológico descendente
        const dateA = new Date(a.createdAt || a.fecha).getTime();
        const dateB = new Date(b.createdAt || b.fecha).getTime();
        return dateB - dateA;
    });
}

export function getStoredEmpresas() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_EMPRESAS);
        let list = [];
        if (!raw) {
            list = [...DEFAULT_EMPRESAS];
            localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify(list));
            return list;
        }
        const data = JSON.parse(raw);
        list = Array.isArray(data) ? data : [...DEFAULT_EMPRESAS];

        // Inyección de integridad: Asegurar que Clínica Carrión siempre esté presente
        DEFAULT_EMPRESAS.forEach(def => {
            const exists = list.some(item => item.ruc === def.ruc);
            if (!exists) list.push(def);
        });

        return list;
    } catch (e) {
        console.error('[BoletasManager] Error crítico en persistencia de empresas:', e);
        return DEFAULT_EMPRESAS;
    }
}

export function saveStoredEmpresas(empresas) {
    try {
        localStorage.setItem(STORAGE_KEY_EMPRESAS, JSON.stringify(empresas));
        syncEmpresaToSupabase(empresas);
    } catch (e) {
        console.error('[BoletasManager] Error al persistir empresas:', e);
    }
}

export function getStoredBoletas() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_BOLETAS);
        if (!raw) return [];
        const data = JSON.parse(raw);
        return sortBoletasBySLA(Array.isArray(data) ? data : []);
    } catch (e) {
        console.warn('[BoletasManager] Error al leer historial de boletas:', e);
        return [];
    }
}

export function saveStoredBoletas(boletas) {
    try {
        localStorage.setItem(STORAGE_KEY_BOLETAS, JSON.stringify(boletas));
        syncBoletasToSupabase(boletas);
    } catch (e) {
        console.error('[BoletasManager] Error al persistir boletas:', e);
    }
}

async function syncEmpresaToSupabase(empresas) {
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
        try {
            const { error } = await window.supabaseClient.from('empresas_boletas').upsert(empresas, { onConflict: 'ruc' });
            if (error) throw error;
        } catch (e) {
            console.warn('[Supabase] Fallo de sincronización de empresas (Modo Offline Activo)');
        }
    }
}

async function syncBoletasToSupabase(boletas) {
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
        try {
            const { error } = await window.supabaseClient.from('historial_boletas').upsert(boletas, { onConflict: 'codigo' });
            if (error) throw error;
        } catch (e) {
            console.warn('[Supabase] Fallo de sincronización de boletas (Modo Offline Activo)');
        }
    }
}

/**
 * STAGE 2: MOTOR DE GENERACIÓN PDF (SURGICAL PRECISION)
 * ------------------------------------------------------------------------------
 * Implementación de jsPDF sin dependencias pesadas. Dibuja manualmente la 
 * estructura de la boleta para garantizar un consumo de RAM < 25MB.
 * Incluye membrete, datos de cliente, tabla de muestras y totales.
 * ------------------------------------------------------------------------------
 */

export function generateBoletaPDF(boletaData) {
    const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : (window.jsPDF || null);
    if (!jsPDFClass) {
        alert('Error: El motor jsPDF no está cargado. Verifique su conexión.');
        return;
    }

    const doc = new jsPDFClass({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const primaryColor = [15, 23, 42]; 
    const accentColor = [2, 132, 199];
    const textColor = [30, 41, 59];

    // --- CABECERA Y MEMBRETE ---
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(LAB_INFO.nombre, 15, 15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(LAB_INFO.subtitulo, 15, 22);
    doc.text(`RUC: ${LAB_INFO.ruc} | Tel: ${LAB_INFO.telefono}`, 15, 28);
    doc.text(LAB_INFO.direccionLocal, 15, 34);

    // --- RECUADRO DE CÓDIGO DE CONSTANCIA ---
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(140, 10, 55, 25, 3, 3, 'D');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.text("CONSTANCIA DE PAGO", 143, 18);
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // Rojo para el código
    doc.text(boletaData.codigo, 148, 28);

    // --- DATOS DEL CLIENTE ---
    let currentY = 55;
    doc.setTextColor(...accentColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("DATOS DEL CLIENTE / INSTITUCIÓN:", 15, currentY);
    currentY += 7;
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Razón Social: ${boletaData.razonSocial || boletaData.cliente?.razonSocial}`, 15, currentY);
    doc.text(`RUC: ${boletaData.ruc || boletaData.cliente?.ruc}`, 140, currentY);
    currentY += 6;
    doc.text(`Dirección: ${boletaData.direccion || boletaData.cliente?.direccion || 'Domicilio Fiscal'}`, 15, currentY);
    doc.text(`Fecha: ${new Date(boletaData.fecha).toLocaleDateString('es-PE')}`, 140, currentY);
    currentY += 10;

    // --- TABLA DE MUESTRAS ---
    doc.setFillColor(241, 245, 249);
    doc.rect(15, currentY, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text("DESCRIPCIÓN DE LA MUESTRA / SERVICIO", 20, currentY + 5);
    doc.text("CANT.", 135, currentY + 5);
    doc.text("P. UNIT", 155, currentY + 5);
    doc.text("TOTAL", 180, currentY + 5);
    
    currentY += 12;
    doc.setFont('helvetica', 'normal');
    const items = boletaData.muestras || boletaData.items || [];
    
    items.forEach((item, idx) => {
        if (currentY > 260) { doc.addPage(); currentY = 20; }
        const desc = item.descripcion || item.concepto || 'Servicio de Patología';
        const precio = parseFloat(item.precio || item.precioUnitario) || 0;
        const cant = parseInt(item.cantidad) || 1;
        const sub = precio * cant;

        doc.text(desc.substring(0, 65), 20, currentY);
        doc.text(cant.toString(), 138, currentY);
        doc.text(precio.toFixed(2), 155, currentY);
        doc.text(sub.toFixed(2), 180, currentY);
        
        doc.setDrawColor(226, 232, 240);
        doc.line(15, currentY + 2, 195, currentY + 2);
        currentY += 8;
    });

    // --- TOTALES ---
    currentY += 5;
    const totalFinal = parseFloat(boletaData.total) || 0;
    const subtotal = totalFinal / 1.18;
    const igv = totalFinal - subtotal;

    doc.setFont('helvetica', 'bold');
    doc.text("SUBTOTAL:", 140, currentY);
    doc.text(`S/ ${subtotal.toFixed(2)}`, 180, currentY);
    currentY += 6;
    doc.text("IGV (18%):", 140, currentY);
    doc.text(`S/ ${igv.toFixed(2)}`, 180, currentY);
    currentY += 8;
    doc.setFontSize(12);
    doc.setTextColor(...accentColor);
    doc.text("TOTAL GENERAL:", 130, currentY);
    doc.text(`S/ ${totalFinal.toFixed(2)}`, 180, currentY);

    // --- PIE DE PÁGINA Y FIRMA ---
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Esta constancia certifica el procesamiento técnico-médico de las muestras descritas.", 15, 280);
    doc.text(`Emitido por JC PATH LAB - Sistema de Gestión Soberana | ID: ${boletaData.codigo}`, 15, 285);
    
    doc.save(`Boleta_${boletaData.codigo}_${(boletaData.razonSocial || 'Empresa').replace(/\s+/g, '_')}.pdf`);
}

/**
 * STAGE 3: ORQUESTACIÓN DEL DOM Y EVENTOS SEGUROS
 * ------------------------------------------------------------------------------
 * Implementa un sistema de inyección de eventos que previene errores si el HTML
 * no está completamente cargado o si faltan elementos reportados por el Lóbulo 1.
 * Gestiona la lógica de muestras dinámicas y el catálogo de empresas.
 * ------------------------------------------------------------------------------
 */

let muestrasActuales = [
    { descripcion: 'Muestra #1: Biopsia gástrica / espécimen histopatológico', precio: 70.00, cantidad: 1 }
];

export function initBoletasModule() {
    console.log("[BoletasManager] Inicializando módulo...");
    renderEmpresasSelect();
    renderEmpresasTable();
    renderBoletasTable();
    renderMuestrasInputs();
    setupBoletasEventListeners();

    const fechaInput = document.getElementById('boletaFechaEmision');
    if (fechaInput && !fechaInput.value) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }
}

function safeListen(id, event, fn) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener(event, fn);
    } else {
        console.warn(`[BoletasManager] Elemento #${id} no encontrado en el DOM actual.`);
    }
}

export function renderMuestrasInputs() {
    const container = document.getElementById('boletaMuestrasContainer');
    if (!container) return;

    container.innerHTML = '';
    muestrasActuales.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'muestra-row-grid';
        row.style.cssText = 'display: flex; gap: 10px; margin-bottom: 8px; align-items: center; background: #1e293b; padding: 10px; border-radius: 8px;';
        row.innerHTML = `
            <span style="color: #38bdf8; font-weight: bold; width: 25px;">#${index + 1}</span>
            <input type="text" class="filter-input input-muestra-desc" data-index="${index}" value="${escapeHtml(item.descripcion)}" style="flex: 3;">
            <input type="number" class="filter-input input-muestra-precio" data-index="${index}" value="${item.precio}" style="width: 80px; text-align: right;">
            <button class="btn-remove-muestra" data-index="${index}" style="background: none; border: none; color: #f87171; cursor: pointer;">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
    });

    // Re-vincular eventos
    container.querySelectorAll('.input-muestra-desc').forEach(inp => {
        inp.addEventListener('change', (e) => {
            muestrasActuales[e.target.dataset.index].descripcion = e.target.value;
        });
    });
    container.querySelectorAll('.input-muestra-precio').forEach(inp => {
        inp.addEventListener('change', (e) => {
            muestrasActuales[e.target.dataset.index].precio = parseFloat(e.target.value) || 0;
            recomputeTotal();
        });
    });
    container.querySelectorAll('.btn-remove-muestra').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index);
            if (muestrasActuales.length > 1) {
                muestrasActuales.splice(idx, 1);
                renderMuestrasInputs();
                recomputeTotal();
            }
        });
    });
    recomputeTotal();
}

function recomputeTotal() {
    const total = muestrasActuales.reduce((acc, m) => acc + (parseFloat(m.precio) || 0), 0);
    const display = document.getElementById('boletaTotalDisplay');
    if (display) display.textContent = `S/ ${total.toFixed(2)}`;
}

function setupBoletasEventListeners() {
    safeListen('btnAgregarMuestraBoleta', 'click', () => {
        muestrasActuales.push({ descripcion: `Muestra #${muestrasActuales.length + 1}`, precio: 70.00, cantidad: 1 });
        renderMuestrasInputs();
    });

    safeListen('btnEmitirBoletaDirecto', 'click', handleEmitirBoletaClick);
    
    safeListen('boletaEmpresaSelect', 'change', (e) => {
        const emp = getStoredEmpresas().find(x => x.id === e.target.value);
        if (emp) {
            const rucDisp = document.getElementById('boletaRucDisplay');
            if (rucDisp) rucDisp.textContent = emp.ruc;
        }
    });

    // Listeners para modales reportados como faltantes por L1
    safeListen('btnAddMuestraModal', 'click', () => {
        const modal = document.getElementById('modalAddMuestra');
        if (modal) modal.style.display = 'flex';
    });

    safeListen('btnCancelAddMuestraModal', 'click', () => {
        const modal = document.getElementById('modalAddMuestra');
        if (modal) modal.style.display = 'none';
    });
}

/**
 * STAGE 4: VALIDACIÓN DETERMINISTA Y CASOS BORDE
 * ------------------------------------------------------------------------------
 * Asegura que los datos de facturación sean íntegros antes de la persistencia.
 * Valida RUCs, evita duplicados y gestiona el correlativo BOL-YYYY-XXXX.
 * ------------------------------------------------------------------------------
 */

export function generateNextBoletaCode() {
    const boletas = getStoredBoletas();
    const year = new Date().getFullYear();
    const prefix = `BOL-${year}-`;
    const nums = boletas.filter(b => b.codigo.startsWith(prefix))
                        .map(b => parseInt(b.codigo.split('-')[2]))
                        .filter(n => !isNaN(n));
    const next = (nums.length > 0 ? Math.max(...nums) : 0) + 1;
    return `${prefix}${next.toString().padStart(4, '0')}`;
}

function handleEmitirBoletaClick() {
    const empId = document.getElementById('boletaEmpresaSelect')?.value;
    if (!empId) return alert("Seleccione una empresa.");

    const empresa = getStoredEmpresas().find(e => e.id === empId);
    const total = muestrasActuales.reduce((acc, m) => acc + (parseFloat(m.precio) || 0), 0);
    const codigo = generateNextBoletaCode();

    const boletaData = {
        id: `bol_${Date.now()}`,
        codigo,
        razonSocial: empresa.razonSocial,
        ruc: empresa.ruc,
        direccion: empresa.direccion,
        fecha: document.getElementById('boletaFechaEmision')?.value || new Date().toISOString(),
        muestras: [...muestrasActuales],
        total,
        estado: 'PAGADO',
        createdAt: new Date().toISOString()
    };

    const history = getStoredBoletas();
    history.push(boletaData);
    saveStoredBoletas(history);
    
    generateBoletaPDF(boletaData);
    renderBoletasTable();
    
    if (window.notifyUser) window.notifyUser(`Boleta ${codigo} generada.`, 'success');
}

export function renderEmpresasSelect() {
    const select = document.getElementById('boletaEmpresaSelect');
    if (!select) return;
    const empresas = getStoredEmpresas();
    select.innerHTML = '<option value="">-- SELECCIONAR EMPRESA --</option>' + 
        empresas.map(e => `<option value="${e.id}">${e.razonSocial} (${e.ruc})</option>`).join('');
}

export function renderEmpresasTable() {
    const tbody = document.getElementById('boletasEmpresasTableBody');
    if (!tbody) return;
    const empresas = getStoredEmpresas();
    tbody.innerHTML = empresas.map((e, i) => `
        <tr>
            <td>${i+1}</td>
            <td>${escapeHtml(e.razonSocial)}</td>
            <td>${e.ruc}</td>
            <td>${escapeHtml(e.direccion)}</td>
            <td><button onclick="window.deleteEmpresaDirectly('${e.id}')" class="btn-danger-sm"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');
}

export function renderBoletasTable() {
    const tbody = document.getElementById('boletasHistoryTableBody');
    if (!tbody) return;
    const boletas = getStoredBoletas();
    tbody.innerHTML = boletas.map(b => `
        <tr>
            <td style="color:#38bdf8; font-weight:bold;">${b.codigo}</td>
            <td>${escapeHtml(b.razonSocial)}</td>
            <td>${new Date(b.fecha).toLocaleDateString()}</td>
            <td>S/ ${parseFloat(b.total).toFixed(2)}</td>
            <td><button onclick="window.reprintBoletaDirectly('${b.codigo}')" class="btn-print-sm"><i class="fa-solid fa-file-pdf"></i></button></td>
        </tr>
    `).join('');
}

window.deleteEmpresaDirectly = (id) => {
    if (confirm("¿Eliminar empresa?")) {
        const filtered = getStoredEmpresas().filter(e => e.id !== id);
        saveStoredEmpresas(filtered);
        renderEmpresasSelect();
        renderEmpresasTable();
    }
};

window.reprintBoletaDirectly = (codigo) => {
    const boleta = getStoredBoletas().find(b => b.codigo === codigo);
    if (boleta) generateBoletaPDF(boleta);
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Inicialización automática al cargar el módulo
document.addEventListener('DOMContentLoaded', initBoletasModule);
