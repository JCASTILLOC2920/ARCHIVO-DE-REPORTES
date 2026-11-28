// ==============================================================================
// MÓDULO AUTÓNOMO DE BOLETAS Y CONSTANCIAS DE PAGO A EMPRESAS (JC PATH LAB)
// Arquitectura: Local-First Permanente + Respaldo en Supabase (Cero Pérdidas)
// Versión: 2.1.0 - Blindaje Omega-Argón (Lóbulo 3) - Corrección Red-Team & SLA
// ==============================================================================

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
 * Escapa caracteres HTML para prevenir inyecciones XSS.
 * @param {string} text - Texto a escapar.
 * @returns {string} Texto seguro.
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

/**
 * Aplica la Regla 28: Ordenamiento SLA de Informes/Boletas.
 * Prioriza casos PENDIENTES (🔴) sobre FIRMADOS/PAGADOS (🟢).
 * @param {Array} items - Lista de boletas.
 * @returns {Array} - Lista ordenada determinísticamente.
 */
export function sortBoletasBySLA(items) {
    if (!Array.isArray(items)) return [];
    return [...items].sort((a, b) => {
        const aPendiente = a.estado === 'PENDIENTE' || a.pagado === false || a.pagado === undefined && a.estado !== 'PAGADO';
        const bPendiente = b.estado === 'PENDIENTE' || b.pagado === false || b.pagado === undefined && b.estado !== 'PAGADO';

        if (aPendiente && !bPendiente) return -1;
        if (!aPendiente && bPendiente) return 1;

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
    doc.setTextColor(220, 38, 38);
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
    doc.text(`Razón Social: ${boletaData.razonSocial || boletaData.cliente?.razonSocial || ''}`, 15, currentY);
    doc.text(`RUC: ${boletaData.ruc || boletaData.cliente?.ruc || ''}`, 140, currentY);
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
    
    items.forEach((item) => {
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
            <input type="number" class="filter-input input-muestra-cantidad" data-index="${index}" value="${item.cantidad || 1}" min="1" style="width: 70px; text-align: right;">
            <input type="number" class="filter-input input-muestra-precio" data-index="${index}" value="${item.precio}" min="0" step="0.01" style="width: 80px; text-align: right;">
            <button class="btn-remove-muestra" data-index="${index}" style="background: none; border: none; color: #f87171; cursor: pointer;" title="Eliminar muestra">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
    });

    // Re-vincular eventos de descripción
    container.querySelectorAll('.input-muestra-desc').forEach(inp => {
        inp.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            if (muestrasActuales[idx]) {
                muestrasActuales[idx].descripcion = e.target.value;
            }
        });
    });

    // Re-vincular eventos de cantidad
    container.querySelectorAll('.input-muestra-cantidad').forEach(inp => {
        inp.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            const val = parseInt(e.target.value, 10);
            if (muestrasActuales[idx]) {
                muestrasActuales[idx].cantidad = isNaN(val) || val < 1 ? 1 : val;
                recomputeTotal();
            }
        });
    });

    // Re-vincular eventos de precio
    container.querySelectorAll('.input-muestra-precio').forEach(inp => {
        inp.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            const val = parseFloat(e.target.value);
            if (muestrasActuales[idx]) {
                muestrasActuales[idx].precio = isNaN(val) || val < 0 ? 0 : val;
                recomputeTotal();
            }
        });
    });

    // Re-vincular eventos de borrado de muestra
    container.querySelectorAll('.btn-remove-muestra').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index, 10);
            if (muestrasActuales.length > 1) {
                muestrasActuales.splice(idx, 1);
                renderMuestrasInputs();
                recomputeTotal();
            } else {
                alert("Debe mantener al menos una muestra en la constancia.");
            }
        });
    });

    recomputeTotal();
}

function recomputeTotal() {
    const total = muestrasActuales.reduce((acc, m) => {
        const precio = parseFloat(m.precio) || 0;
        const cant = parseInt(m.cantidad, 10) || 1;
        return acc + (precio * cant);
    }, 0);

    const display = document.getElementById('boletaTotalDisplay');
    if (display) display.textContent = `S/ ${total.toFixed(2)}`;

    const totalSub = document.getElementById('boletaSubtotalCalculado');
    if (totalSub) totalSub.textContent = `S/ ${(total / 1.18).toFixed(2)}`;

    const totalGeneral = document.getElementById('boletaTotalDisplay');
    if (totalGeneral) totalGeneral.textContent = `S/ ${total.toFixed(2)}`;

    const totalCalc = document.getElementById('boletaSubtotalCalculado');
    if (totalCalc) totalCalc.textContent = `S/ ${(total / 1.18).toFixed(2)}`;
}

function setupBoletasEventListeners() {
    safeListen('btnAgregarMuestraBoleta', 'click', () => {
        muestrasActuales.push({ descripcion: `Muestra #${muestrasActuales.length + 1}`, precio: 70.00, cantidad: 1 });
        renderMuestrasInputs();
    });

    safeListen('btnEmitirBoletaDirecto', 'click', handleEmitirBoletaClick);
    safeListen('boletaEmitirBtn', 'click', handleEmitirBoletaClick);
    
    safeListen('boletaEmpresaSelect', 'change', (e) => {
        const emp = getStoredEmpresas().find(x => x.id === e.target.value);
        if (emp) {
            const rucDisp = document.getElementById('boletaRucDisplay');
            if (rucDisp) rucDisp.textContent = emp.ruc;

            const dirDisp = document.getElementById('boletaDirDisplay');
            if (dirDisp) dirDisp.textContent = emp.direccion;

            const telDisp = document.getElementById('boletaTelDisplay');
            if (telDisp) telDisp.textContent = emp.telefono;
        }
    });

    safeListen('btnAddMuestraModal', 'click', () => {
        const modal = document.getElementById('modalAddMuestra');
        if (!modal) { console.error('[Boletas] modalAddMuestra no encontrado en el DOM. Verifica que el HTML incluya este modal.'); return; }
        modal.style.display = 'flex';
    });

    safeListen('btnCancelAddMuestraModal', 'click', () => {
        const modal = document.getElementById('modalAddMuestra');
        if (!modal) return;
        modal.style.display = 'none';
    });

    safeListen('btnGuardarNuevaEmpresa', 'click', () => {
        const razon = document.getElementById('nuevaEmpresaRazon')?.value?.trim() ?? '';
        const ruc = document.getElementById('nuevaEmpresaRuc')?.value?.trim() ?? '';
        const direccion = document.getElementById('nuevaEmpresaDir')?.value?.trim() ?? '';
        const telefono = document.getElementById('nuevaEmpresaTel')?.value?.trim() ?? '';

        if (!razon && !ruc && !direccion && !telefono) {
            console.error('[Boletas] Formulario nueva empresa: campos DOM no encontrados. El modal modalAddMuestra debe existir en el HTML.');
            return;
        }

        if (!razon || !ruc) {
            alert('Ingrese al menos la Razón Social y el RUC de la empresa.');
            return;
        }

        const empresas = getStoredEmpresas();
        const nueva = {
            id: `emp_${Date.now()}`,
            razonSocial: razon,
            ruc,
            direccion: direccion || 'Sin dirección registrada',
            telefono: telefono || 'S/N',
            createdAt: new Date().toISOString(),
            estado: 'ACTIVO'
        };

        empresas.push(nueva);
        saveStoredEmpresas(empresas);
        renderEmpresasSelect();
        renderEmpresasTable();

        ['nuevaEmpresaRazon', 'nuevaEmpresaRuc', 'nuevaEmpresaDir', 'nuevaEmpresaTel'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        const modal = document.getElementById('modalNuevaEmpresa');
        if (modal) modal.style.display = 'none';

        if (window.notifyUser) window.notifyUser('Empresa registrada correctamente.', 'success');
    });
}

/**
 * STAGE 4: VALIDACIÓN DETERMINISTA Y CASOS BORDE
 */
export function generateNextBoletaCode() {
    const boletas = getStoredBoletas();
    const year = new Date().getFullYear();
    const prefix = `BOL-${year}-`;
    const nums = boletas.filter(b => b.codigo && b.codigo.startsWith(prefix))
                        .map(b => parseInt(b.codigo.split('-')[2], 10))
                        .filter(n => !isNaN(n));
    const next = (nums.length > 0 ? Math.max(...nums) : 0) + 1;
    return `${prefix}${next.toString().padStart(4, '0')}`;
}

function handleEmitirBoletaClick() {
    const empId = document.getElementById('boletaEmpresaSelect')?.value;
    if (!empId) {
        alert("Seleccione una empresa o institución para emitir la constancia.");
        return;
    }

    const empresa = getStoredEmpresas().find(e => e.id === empId);
    if (!empresa) {
        alert("La empresa seleccionada no es válida o fue eliminada.");
        return;
    }

    const total = muestrasActuales.reduce((acc, m) => {
        const precio = parseFloat(m.precio) || 0;
        const cant = parseInt(m.cantidad, 10) || 1;
        return acc + (precio * cant);
    }, 0);

    if (total <= 0) {
        alert("El monto total de la boleta debe ser mayor a cero.");
        return;
    }

    const codigo = generateNextBoletaCode();

    const boletaData = {
        id: `bol_${Date.now()}`,
        codigo,
        razonSocial: empresa.razonSocial,
        ruc: empresa.ruc,
        direccion: empresa.direccion,
        fecha: document.getElementById('boletaFechaEmision')?.value || new Date().toISOString(),
        muestras: muestrasActuales.map(m => ({ ...m })),
        total,
        estado: 'PAGADO',
        pagado: true,
        createdAt: new Date().toISOString()
    };

    const history = getStoredBoletas();
    history.push(boletaData);
    saveStoredBoletas(history);
    
    generateBoletaPDF(boletaData);
    renderBoletasTable();
    
    if (window.notifyUser) {
        window.notifyUser(`Boleta ${codigo} generada exitosamente.`, 'success');
    }
}

export function renderEmpresasSelect() {
    const select = document.getElementById('boletaEmpresaSelect');
    if (!select) return;
    const empresas = getStoredEmpresas();
    select.innerHTML = '<option value="">-- SELECCIONAR EMPRESA --</option>' + 
        empresas.map(e => `<option value="${e.id}">${escapeHtml(e.razonSocial)} (${e.ruc})</option>`).join('');
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
            <td><button onclick="window.deleteEmpresaDirectly('${e.id}')" class="btn-danger-sm" title="Eliminar empresa"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');
}

export function renderBoletasTable() {
    const tbody = document.getElementById('boletasHistoryTableBody');
    if (!tbody) return;
    const boletas = getStoredBoletas();
    tbody.innerHTML = boletas.map(b => `
        <tr>
            <td style="color:#38bdf8; font-weight:bold;">${escapeHtml(b.codigo)}</td>
            <td>${escapeHtml(b.razonSocial)}</td>
            <td>${new Date(b.fecha).toLocaleDateString()}</td>
            <td>S/ ${parseFloat(b.total).toFixed(2)}</td>
            <td>
                <button onclick="window.reprintBoletaDirectly('${b.codigo}')" class="btn-print-sm" title="Reimprimir PDF"><i class="fa-solid fa-file-pdf"></i></button>
            </td>
        </tr>
    `).join('');
}

window.deleteEmpresaDirectly = (id) => {
    if (confirm("¿Está seguro de eliminar esta empresa del catálogo?")) {
        const filtered = getStoredEmpresas().filter(e => e.id !== id);
        saveStoredEmpresas(filtered);
        renderEmpresasSelect();
        renderEmpresasTable();
        if (window.notifyUser) window.notifyUser("Empresa eliminada del catálogo.", "info");
    }
};

window.reprintBoletaDirectly = (codigo) => {
    const boleta = getStoredBoletas().find(b => b.codigo === codigo);
    if (boleta) {
        generateBoletaPDF(boleta);
    } else {
        alert("No se encontró la boleta solicitada en la memoria local.");
    }
};

// Inicialización automática robusta
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBoletasModule);
} else {
    initBoletasModule();
}
