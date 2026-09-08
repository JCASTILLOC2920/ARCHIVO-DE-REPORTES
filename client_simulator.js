// client_simulator.js
// PROTOCOLO ACTOR-CRITICO: Simulador de Vista de Clientes (Doctores y Clínicas)
// Permite al Administrador (en PC y Celular) previsualizar el aplicativo tal como lo ve cada cliente.

import { usersDatabase } from './users_db.js';
import { patientDatabase } from './db_service.js';

// Metadatos enriquecidos de especialidades y sedes para cada cliente
const CLIENT_METADATA = {
    'drvictorcastaneda': {
        type: 'doctor',
        specialty: 'Urología',
        clinic: 'Clínica Carrión',
        shortTitle: 'Urólogo Especialista'
    },
    'bryanflores': {
        type: 'doctor',
        specialty: 'Cirugía / Ginecología',
        clinic: 'Clínica San Clemente',
        shortTitle: 'Cirujano Especialista'
    },
    'drdiegochungui': {
        type: 'doctor',
        specialty: 'Cirugía Oncológica',
        clinic: 'Clínica Carrión',
        shortTitle: 'Oncólogo Quirúrgico'
    },
    'drjhonvilca': {
        type: 'doctor',
        specialty: 'Cirugía General',
        clinic: 'Sede Principal',
        shortTitle: 'Cirujano General'
    },
    'drjorgemunante': {
        type: 'doctor',
        specialty: 'Gastroenterología / Cirugía',
        clinic: 'Sede Principal',
        shortTitle: 'Gastroenterólogo'
    },
    'drjaimebecerra': {
        type: 'doctor',
        specialty: 'Cirugía General',
        clinic: 'Sede Principal',
        shortTitle: 'Cirujano Especialista'
    },
    'drmanuelsanchez': {
        type: 'doctor',
        specialty: 'Cirugía General / Especialidades',
        clinic: 'Sede Principal',
        shortTitle: 'Médico Cirujano'
    },
    'dralejandroescalante': {
        type: 'doctor',
        specialty: 'Cirugía / San Clemente',
        clinic: 'Clínica San Clemente',
        shortTitle: 'Cirujano Especialista'
    },
    'clinicacarrion': {
        type: 'clinic',
        specialty: 'Hospitalización y Cirugía',
        clinic: 'Callao',
        shortTitle: 'Sede Hospitalaria'
    },
    'carrionventanilla': {
        type: 'clinic',
        specialty: 'Centro Médico Quirúrgico',
        clinic: 'Ventanilla, Callao',
        shortTitle: 'Sede Ambulatoria'
    },
    'Mujersegura': {
        type: 'clinic',
        specialty: 'Ginecología y Prevención',
        clinic: 'Lima',
        shortTitle: 'Salud Femenina'
    },
    'sanclemente': {
        type: 'clinic',
        specialty: 'Policlínico y Cirugía',
        clinic: 'Pisco / Ica',
        shortTitle: 'Sede Regional'
    },
    'alfaprevenir': {
        type: 'clinic',
        specialty: 'Prevención y Diagnóstico',
        clinic: 'Lima',
        shortTitle: 'Sede Ambulatoria'
    },
    'JUNCO2026': {
        type: 'particular',
        specialty: 'Atención Médica Particular',
        clinic: 'Privado',
        shortTitle: 'Cliente Particular'
    }
};

/**
 * Cuenta cuántos pacientes tiene asignados un cliente en patientDatabase
 */
function getClientPatientCount(client) {
    if (!patientDatabase || patientDatabase.length === 0) return 0;
    const account = (client.usuario || '').toLowerCase();
    const clinicName = (client.nombres || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return patientDatabase.filter(item => {
        if (!item) return false;
        const itemMed = (item.medSolicitante || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const itemClinica = (item.clinica || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (account === 'drvictorcastaneda' || account.includes('castaneda')) {
            return itemMed.includes('castaneda') || itemMed.includes('robles');
        }
        if (account === 'bryanflores' || clinicName.includes('bryan')) {
            return itemMed.includes('bryan') || (itemMed.includes('flores') && itemMed.includes('sierra'));
        }
        if (account === 'drdiegochungui' || clinicName.includes('chungui')) {
            return itemMed.includes('chungui') || itemMed.includes('diego');
        }
        if (account === 'drjhonvilca' || account.includes('jhonvilca')) {
            return itemMed.includes('vilca') || itemMed.includes('jhon');
        }
        if (account === 'drjorgemunante' || account.includes('munante')) {
            return itemMed.includes('munante') || itemMed.includes('arzapalo');
        }
        if (account === 'drjaimebecerra' || account.includes('becerra')) {
            return itemMed.includes('becerra') || itemMed.includes('ulfe');
        }
        if (account === 'drmanuelsanchez' || account.includes('sanchez')) {
            return itemMed.includes('sanchez') || itemMed.includes('orellana');
        }
        if (account === 'dralejandroescalante' || account.includes('escalante')) {
            return itemMed.includes('escalante') || itemMed.includes('alvaro');
        }

        // Clínicas
        if (clinicName.includes('mujer')) return itemClinica.includes('mujer');
        if (clinicName.includes('ventanilla')) return itemClinica.includes('ventanilla');
        if (clinicName.includes('carrion')) return itemClinica.includes('carrion');
        if (clinicName.includes('clemente')) return itemClinica.includes('clemente') || itemMed.includes('escalante');
        if (clinicName.includes('alfa')) return itemClinica.includes('alfa') || itemClinica.includes('prevenir');
        if (clinicName.includes('junco')) return itemClinica.includes('junco') || itemMed.includes('junco');

        return false;
    }).length;
}

/**
 * Inyecta el DOM del Modal Selector de Clientes
 */
function ensureModalDOM() {
    if (document.getElementById('clientSimulatorModal')) return;

    const modal = document.createElement('div');
    modal.id = 'clientSimulatorModal';
    modal.className = 'csm-overlay';
    modal.innerHTML = `
        <div class="csm-container" role="dialog" aria-modal="true" aria-labelledby="csmTitle">
            <!-- Header -->
            <header class="csm-header">
                <div class="csm-header-left">
                    <div class="csm-header-icon">
                        <i class="fa-solid fa-users-viewfinder"></i>
                    </div>
                    <div>
                        <h2 class="csm-title" id="csmTitle">MODO CLIENTE: Ver Aplicativo como Médico / Clínica</h2>
                        <p class="csm-subtitle">Verifica en vivo cómo cada cliente visualiza sus informes y láminas en celular o PC.</p>
                    </div>
                </div>
                <button type="button" class="csm-close-btn" id="csmCloseBtn" aria-label="Cerrar modal" onclick="window.closeClientSimulatorModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </header>

            <!-- Toolbar con búsqueda y filtros -->
            <div class="csm-toolbar">
                <div class="csm-search-box">
                    <i class="fa-solid fa-magnifying-glass csm-search-icon"></i>
                    <input type="text" id="csmSearchInput" class="csm-search-input" placeholder="Buscar por nombre, especialidad o usuario..." autocomplete="off">
                </div>
                <div class="csm-pills">
                    <button type="button" class="csm-pill-btn active" data-filter="all">Todos</button>
                    <button type="button" class="csm-pill-btn" data-filter="doctor">Médicos</button>
                    <button type="button" class="csm-pill-btn" data-filter="clinic">Clínicas</button>
                </div>
            </div>

            <!-- Listado de Tarjetas -->
            <div class="csm-body" id="csmGrid">
                <!-- Se inyecta dinámicamente -->
            </div>

            <!-- Footer con tips -->
            <footer class="csm-footer">
                <span><i class="fa-solid fa-shield-halved" style="color: #10b981;"></i> Aislamiento estricto RBAC activado. Al simular, solo verás los casos del cliente seleccionado.</span>
                <span><i class="fa-solid fa-keyboard"></i> ESC para cerrar</span>
            </footer>
        </div>
    `;

    document.body.appendChild(modal);

    // Eventos del modal
    document.getElementById('csmCloseBtn')?.addEventListener('click', window.closeClientSimulatorModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) window.closeClientSimulatorModal();
    });

    // Filtros por píldoras
    modal.querySelectorAll('.csm-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.csm-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterAndRenderCards();
        });
    });

    // Búsqueda en vivo
    const searchInput = document.getElementById('csmSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRenderCards();
        });
    }
}

/**
 * Filtra y renderiza las tarjetas de clientes en el modal
 */
function filterAndRenderCards() {
    const grid = document.getElementById('csmGrid');
    if (!grid) return;

    const activeFilter = document.querySelector('.csm-pill-btn.active')?.getAttribute('data-filter') || 'all';
    const searchQuery = (document.getElementById('csmSearchInput')?.value || '').toLowerCase().trim();

    const simulating = getCurrentSimulatedUser();
    const activeUsername = simulating ? (simulating.usuario || '').toLowerCase() : '';

    const clientUsers = usersDatabase.filter(u => u.perfil === 'Usuario');

    const filtered = clientUsers.filter(user => {
        const username = (user.usuario || '').toLowerCase();
        const meta = CLIENT_METADATA[user.usuario] || { type: 'doctor', specialty: 'Especialista', clinic: 'Sede' };

        // Filtro por tipo (doctor / clínica)
        if (activeFilter === 'doctor' && meta.type !== 'doctor') return false;
        if (activeFilter === 'clinic' && meta.type !== 'clinic' && meta.type !== 'particular') return false;

        // Filtro por búsqueda
        if (searchQuery) {
            const raw = `${user.nombres} ${user.usuario} ${meta.specialty} ${meta.clinic} ${meta.shortTitle}`.toLowerCase();
            return raw.includes(searchQuery);
        }

        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #94a3b8;">
                <i class="fa-solid fa-user-slash" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px; display: block;"></i>
                <div style="font-weight: 600; font-size: 1rem; color: #e2e8f0;">No se encontraron clientes</div>
                <div style="font-size: 0.82rem; margin-top: 4px;">Intenta con otro término de búsqueda o cambia de filtro.</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(user => {
        const username = user.usuario;
        const meta = CLIENT_METADATA[username] || { type: 'doctor', specialty: 'Especialista', clinic: 'Sede', shortTitle: 'Cliente' };
        const isClinic = meta.type === 'clinic' || meta.type === 'particular';
        const avatarIcon = isClinic ? 'fa-hospital' : 'fa-user-doctor';
        const avatarClass = isClinic ? 'csm-avatar-clinic' : 'csm-avatar-doctor';
        const patientCount = getClientPatientCount(user);
        const isActive = activeUsername === username.toLowerCase();

        return `
            <div class="csm-client-card ${isActive ? 'is-active-client' : ''}" data-username="${username}">
                <div class="csm-card-top">
                    <div class="csm-client-avatar ${avatarClass}">
                        <i class="fa-solid ${avatarIcon}"></i>
                    </div>
                    <div class="csm-client-meta">
                        <h3 class="csm-client-name">${escapeHtml(user.nombres)}</h3>
                        <p class="csm-client-sub">
                            <span class="csm-tag-specialty">${escapeHtml(meta.specialty)}</span>
                            <span>•</span>
                            <span>${escapeHtml(meta.clinic)}</span>
                            <span class="csm-tag-user">@${escapeHtml(username)}</span>
                        </p>
                    </div>
                </div>
                <div class="csm-card-bottom">
                    <span class="csm-patient-count">
                        <i class="fa-solid fa-folder-open"></i>
                        <strong>${patientCount}</strong> ${patientCount === 1 ? 'paciente' : 'pacientes'}
                    </span>
                    <button type="button" class="csm-btn-select ${isActive ? 'active' : ''}" onclick="window.switchToClient('${escapeHtml(username)}')">
                        <i class="fa-solid ${isActive ? 'fa-circle-check' : 'fa-eye'}"></i>
                        <span>${isActive ? 'Viendo Ahora' : 'Ver como Cliente'}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Obtiene el usuario simulado actualmente activo desde sessionStorage
 */
function getCurrentSimulatedUser() {
    try {
        const raw = sessionStorage.getItem('simulatingClient');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Inyecta o actualiza el Banner Sticky de Simulación en la parte superior
 */
function renderSimulationBanner(client) {
    let banner = document.getElementById('clientSimulationBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'clientSimulationBanner';
        banner.className = 'client-simulation-banner';
        document.body.prepend(banner);
    }

    const meta = CLIENT_METADATA[client.usuario] || { specialty: 'Cliente', clinic: 'Sede' };

    banner.innerHTML = `
        <div class="csb-info">
            <span class="csb-pulse" title="Simulación Activa"></span>
            <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                <span class="csb-tag"><i class="fa-solid fa-eye"></i> MODO CLIENTE:</span>
                <span class="csb-name" title="${escapeHtml(client.nombres)}">${escapeHtml(client.nombres)}</span>
                <span class="csb-badge">${escapeHtml(meta.specialty)}</span>
            </div>
        </div>
        <div class="csb-actions">
            <button type="button" class="csb-btn csb-btn-switch" onclick="window.openClientSimulatorModal()" title="Elegir otro doctor o clínica">
                <i class="fa-solid fa-repeat"></i>
                <span>Cambiar Cliente</span>
            </button>
            <button type="button" class="csb-btn csb-btn-exit" onclick="window.exitClientSimulation()" title="Volver al Modo Administrador">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
                <span>Volver a Admin</span>
            </button>
        </div>
    `;

    document.body.classList.add('simulating-client-mode');
}

/**
 * Elimina el banner de simulación
 */
function removeSimulationBanner() {
    const banner = document.getElementById('clientSimulationBanner');
    if (banner) banner.remove();
    document.body.classList.remove('simulating-client-mode');
}

/**
 * Abre el Modal Selector de Clientes
 */
export function openClientSimulatorModal() {
    ensureModalDOM();
    filterAndRenderCards();
    const modal = document.getElementById('clientSimulatorModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('csmSearchInput')?.focus();
    }
}

/**
 * Cierra el Modal Selector de Clientes
 */
export function closeClientSimulatorModal() {
    const modal = document.getElementById('clientSimulatorModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Cambia la sesión activa al cliente seleccionado y actualiza la UI
 */
export function switchToClient(username) {
    const client = usersDatabase.find(u => (u.usuario || '').toLowerCase() === String(username).toLowerCase());
    if (!client) {
        if (typeof window.showToast === 'function') {
            window.showToast("No se encontró el cliente seleccionado", "error");
        }
        return;
    }

    // 1. Guardar copia de seguridad de la sesión de Administrador original
    try {
        const currentSession = JSON.parse(localStorage.getItem('currentUser'));
        if (currentSession && (currentSession.perfil === 'Administrador' || currentSession.usuario === 'admin')) {
            sessionStorage.setItem('adminSessionBackup', JSON.stringify(currentSession));
        }
    } catch (e) {}

    // 2. Establecer la sesión simulada en sessionStorage y localStorage
    sessionStorage.setItem('simulatingClient', JSON.stringify(client));
    localStorage.setItem('currentUser', JSON.stringify(client));

    // 3. Aplicar clases de rol a body (para activar RBAC)
    document.body.classList.add('role-clinic');

    // 4. Mostrar banner persistente superior con botón para salir o cambiar
    renderSimulationBanner(client);

    // 5. Actualizar el texto de bienvenida en el encabezado
    const welcomeText = document.querySelector('.welcome-text strong');
    if (welcomeText) {
        welcomeText.textContent = client.nombres;
    }

    // 6. Cerrar modal y cerrar sidebar en móviles si estaba abierto
    closeClientSimulatorModal();
    const appContainer = document.getElementById('appContainer');
    if (appContainer) {
        appContainer.classList.remove('sidebar-active', 'mobile-sidebar-open');
    }

    // 7. Ejecutar filtrado estricto con el nuevo rol
    if (typeof window.applyFilters === 'function') {
        window.applyFilters(false);
    }

    // 8. Mensaje feedback
    if (typeof window.showToast === 'function') {
        window.showToast(`👁️ Simulando vista de: ${client.nombres}`, "success");
    } else {
        console.log(`[Client Simulator] Modo cliente activo: ${client.nombres}`);
    }
}

/**
 * Sale del modo de simulación y restaura la sesión de Administrador original
 */
export function exitClientSimulation() {
    // 1. Recuperar sesión admin guardada o fallback oficial
    let adminSession = null;
    try {
        const saved = sessionStorage.getItem('adminSessionBackup');
        adminSession = saved ? JSON.parse(saved) : null;
    } catch (e) {
        adminSession = null;
    }

    if (!adminSession) {
        adminSession = {
            id: 1,
            perfil: 'Administrador',
            dni: '41457466',
            nombres: 'JOSEHP CHRISTOPHER, CASTILLO CUENCA',
            usuario: 'admin'
        };
    }

    // 2. Restaurar localStorage y limpiar sessionStorage de simulación
    localStorage.setItem('currentUser', JSON.stringify(adminSession));
    sessionStorage.removeItem('simulatingClient');
    sessionStorage.removeItem('adminSessionBackup');

    // 3. Restaurar clases en body y retirar banner
    document.body.classList.remove('role-clinic');
    removeSimulationBanner();

    // 4. Restaurar texto de bienvenida oficial
    const welcomeText = document.querySelector('.welcome-text strong');
    if (welcomeText) {
        welcomeText.textContent = adminSession.nombres;
    }

    // 5. Re-ejecutar filtros para mostrar todos los pacientes del laboratorio
    if (typeof window.applyFilters === 'function') {
        window.applyFilters(false);
    }

    // 6. Mensaje feedback
    if (typeof window.showToast === 'function') {
        window.showToast("🔓 Sesión de Administrador restaurada con éxito", "info");
    } else {
        console.log("[Client Simulator] Sesión de Administrador restaurada.");
    }
}

/**
 * Inicializador principal del simulador de clientes
 */
export function initClientSimulator() {
    // Exponer globalmente
    window.openClientSimulatorModal = openClientSimulatorModal;
    window.closeClientSimulatorModal = closeClientSimulatorModal;
    window.switchToClient = switchToClient;
    window.exitClientSimulation = exitClientSimulation;

    // Conectar botón en sidebar si existe en el DOM
    const btnSidebar = document.getElementById('btnSidebarClientes');
    if (btnSidebar) {
        btnSidebar.addEventListener('click', (e) => {
            e.preventDefault();
            openClientSimulatorModal();
        });
    }

    // Soporte para tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('clientSimulatorModal');
            if (modal && modal.classList.contains('active')) {
                closeClientSimulatorModal();
            }
        }
    });

    // Si ya había una simulación activa en sessionStorage (ej. tras recargar página), restaurarla
    const simulating = getCurrentSimulatedUser();
    if (simulating) {
        document.body.classList.add('role-clinic');
        renderSimulationBanner(simulating);
        const welcomeText = document.querySelector('.welcome-text strong');
        if (welcomeText) {
            welcomeText.textContent = simulating.nombres;
        }
    }

    // Soporte para apertura directa desde enlace/botón de Registro (index.html)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('simulate_client') === 'open' || urlParams.get('clientes') === '1') {
        setTimeout(openClientSimulatorModal, 350);
    }
}
