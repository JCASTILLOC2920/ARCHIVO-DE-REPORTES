// --- Configuración y Estado Global ---
const SUPABASE_BUCKET = 'caja-negra-snapshots';
let _indexedDBInstance = null;
let _isOfflineMode = false;

// --- Inicialización Segura del Entorno ---
function _initializeEnvironment() {
    // Verificar configuración de Supabase
    if (typeof window.__ENV__ === 'undefined' || !window.__ENV__.SUPABASE_URL || !window.__ENV__.SUPABASE_KEY) {
        _isOfflineMode = true;
        console.warn('[CajaNegra] Configuración de Supabase incompleta o ausente. Iniciando en modo OFFLINE/DEGRADADO. Solo se usarán fuentes locales (localStorage/IndexedDB).');
    } else {
        _isOfflineMode = false;
        // Inicializar cliente Supabase si no existe
        if (typeof window.supabase === 'undefined' || !window.supabase) {
            try {
                // Asumiendo que supabase-js está disponible globalmente o se inyecta
                if (typeof window.supabaseClient !== 'undefined') {
                    window.supabase = window.supabaseClient;
                } else {
                    // Intento de inicialización básica si la librería está cargada
                    if (typeof window.createClient === 'function') {
                        window.supabase = window.createClient(window.__ENV__.SUPABASE_URL, window.__ENV__.SUPABASE_KEY);
                    } else {
                        console.warn('[CajaNegra] Cliente Supabase no encontrado. Modo OFFLINE forzado.');
                        _isOfflineMode = true;
                    }
                }
            } catch (e) {
                console.error('[CajaNegra] Error al inicializar cliente Supabase:', e);
                _isOfflineMode = true;
            }
        }
    }
}

// --- Utilidades IndexedDB ---
function _initIndexedDB() {
    return new Promise((resolve, reject) => {
        if (_indexedDBInstance) {
            resolve(_indexedDBInstance);
            return;
        }
        const request = indexedDB.open('CajaNegraDB', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            _indexedDBInstance = request.result;
            resolve(_indexedDBInstance);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('snapshots')) {
                const store = db.createObjectStore('snapshots', { keyPath: 'id_snapshot' });
                store.createIndex('pacienteId', 'pacienteId', { unique: false });
            }
        };
    });
}

async function _saveSnapshotToIndexedDB(snapshot) {
    try {
        const db = await _initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(['snapshots'], 'readwrite');
            const store = tx.objectStore('snapshots');
            const request = store.put(snapshot);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error('[CajaNegra] Error guardando en IndexedDB:', e);
        return false;
    }
}

async function _getSnapshotsFromIndexedDB(pacienteId) {
    try {
        const db = await _initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(['snapshots'], 'readonly');
            const store = tx.objectStore('snapshots');
            const index = store.index('pacienteId');
            const request = index.getAll(pacienteId);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error('[CajaNegra] Error obteniendo de IndexedDB:', e);
        return [];
    }
}

// --- Utilidades Supabase ---
async function _uploadSnapshotToSupabase(pacienteId, snapshot) {
    if (_isOfflineMode) {
        console.debug('[CajaNegra] Modo offline activo, omitiendo subida a Supabase.');
        return false;
    }
    
    if (typeof window.supabase !== 'undefined' && window.supabase.storage) {
        try {
            const path = `${pacienteId}/${snapshot.id_snapshot}.json`;
            const file = new File([JSON.stringify(snapshot)], `${snapshot.id_snapshot}.json`, { type: 'application/json' });
            await window.supabase.storage.from(SUPABASE_BUCKET).upload(path, file, { upsert: true });
            return true;
        } catch (e) {
            console.error('[CajaNegra] Error subiendo a Supabase:', e);
            return false;
        }
    } else {
        console.warn('[CajaNegra] Supabase no inicializado, omitiendo subida remota.');
        return false;
    }
}

/**
 * Obtiene snapshots de un paciente desde Supabase Storage.
 * @param {string} pacienteId - El ID del paciente.
 * @returns {Promise<Array<Object>>}
 */
async function _getSnapshotsFromSupabase(pacienteId) {
    if (_isOfflineMode) {
        console.debug('[CajaNegra] Modo offline activo, omitiendo lectura de Supabase.');
        return [];
    }

    if (typeof window.supabase !== 'undefined' && window.supabase.storage) {
        try {
            const { data, error } = await window.supabase.storage.from(SUPABASE_BUCKET).list(pacienteId);
            if (error) throw error;
            
            const snapshots = [];
            for (const file of data) {
                const { data: fileData, error: fileError } = await window.supabase.storage.from(SUPABASE_BUCKET).download(`${pacienteId}/${file.name}`);
                if (fileError) continue;
                const text = await fileData.text();
                const snap = JSON.parse(text);
                snap.source = 'Supabase';
                snapshots.push(snap);
            }
            return snapshots;
        } catch (e) {
            console.error('[CajaNegra] Error obteniendo de Supabase:', e);
            return [];
        }
    }
    return [];
}

// --- Módulo Principal CajaNegraTemporal ---

window.CajaNegraTemporal = {
    /**
     * Toma un snapshot del estado actual del paciente y lo guarda en todas las fuentes.
     * @param {string} pacienteId - El ID del paciente.
     * @param {Object} datosPaciente - Los datos actuales del paciente.
     * @returns {boolean} true si se guardó correctamente, false en caso de error.
     */
    tomarSnapshot(pacienteId, datosPaciente) {
        try {
            if (!pacienteId || !datosPaciente) {
                console.error('[CajaNegra] Parámetros inválidos para tomarSnapshot.');
                return false;
            }

            const epoch = Date.now();
            const id_snapshot = `snap_${pacienteId}_${epoch}`;
            const timestampStr = new Date(epoch).toISOString();

            const snapshot = {
                id_snapshot: id_snapshot,
                pacienteId: pacienteId,
                epoch: epoch,
                timestamp: timestampStr,
                datos: datosPaciente,
                source: 'Local' // Fuente original
            };

            // 1. Guardar en localStorage
            const key = `caja_negra_${pacienteId}`;
            let historialLocal = [];
            try {
                historialLocal = JSON.parse(localStorage.getItem(key) || '[]');
            } catch (e) {
                historialLocal = [];
            }
            
            // Evitar duplicados si se llama muy rápido
            const exists = historialLocal.some(s => s.id_snapshot === id_snapshot);
            if (!exists) {
                historialLocal.push(snapshot);
                // Limitar a los últimos 50 snapshots en localStorage para evitar llenar el storage
                if (historialLocal.length > 50) {
                    historialLocal = historialLocal.slice(-50);
                }
                localStorage.setItem(key, JSON.stringify(historialLocal));
            }

            console.log(`[CajaNegra] Snapshot guardado en localStorage: ${timestampStr}`);

            // 2. Guardar en IndexedDB (asíncrono)
            _saveSnapshotToIndexedDB(snapshot).catch(e => console.error('[CajaNegra] Error asíncrono al guardar en IndexedDB:', e));

            // 3. Subir a Supabase (asíncrono)
            _uploadSnapshotToSupabase(pacienteId, snapshot).catch(e => console.error('[CajaNegra] Error asíncrono al subir a Supabase:', e));

            return true;
        } catch (e) {
            console.error('[CajaNegra] Error tomando snapshot:', e);
            return false;
        }
    },

    /**
     * Obtiene el historial completo de snapshots de un paciente desde todas las fuentes (localStorage, IndexedDB, Supabase).
     * Combina y ordena los resultados, eliminando duplicados.
     * @param {string} pacienteId - El ID del paciente.
     * @returns {Promise<Array<Object>>} Una promesa que resuelve con una lista combinada y ordenada de snapshots.
     */
    async obtenerHistorial(pacienteId) {
        try {
            if (!pacienteId) {
                console.error('[CajaNegra] pacienteId inválido en obtenerHistorial.');
                return [];
            }

            const key = `caja_negra_${pacienteId}`;
            
            // 1. LocalStorage
            let historialLocalStorage = [];
            try {
                historialLocalStorage = JSON.parse(localStorage.getItem(key) || '[]').map(s => ({ ...s, source: 'Local' }));
            } catch (e) {
                historialLocalStorage = [];
            }

            // 2. IndexedDB
            let historialIndexedDB = [];
            try {
                const data = await _getSnapshotsFromIndexedDB(pacienteId);
                historialIndexedDB = data.map(s => ({ ...s, source: 'IndexedDB' }));
            } catch (e) {
                console.warn('[CajaNegra] Error leyendo IndexedDB:', e);
            }

            // 3. Supabase
            let historialSupabase = [];
            try {
                historialSupabase = await _getSnapshotsFromSupabase(pacienteId);
            } catch (e) {
                console.warn('[CajaNegra] Error leyendo Supabase:', e);
            }

            // Combina todos los historiales
            let combinedHistorial = [...historialLocalStorage, ...historialIndexedDB, ...historialSupabase];

            // Elimina duplicados basándose en 'id_snapshot'.
            // Prioriza las fuentes locales (Local, IndexedDB) sobre Supabase si hay duplicados.
            const uniqueSnapshots = {};
            for (const snap of combinedHistorial) {
                if (!snap.id_snapshot) continue;
                
                const existing = uniqueSnapshots[snap.id_snapshot];
                if (!existing) {
                    uniqueSnapshots[snap.id_snapshot] = snap;
                } else {
                    // Si ya existe, priorizamos Local > IndexedDB > Supabase
                    const priority = { 'Local': 3, 'IndexedDB': 2, 'Supabase': 1 };
                    if ((priority[snap.source] || 0) > (priority[existing.source] || 0)) {
                        uniqueSnapshots[snap.id_snapshot] = snap;
                    }
                }
            }
            
            combinedHistorial = Object.values(uniqueSnapshots);

            // Ordena por 'epoch' en orden ascendente (el más antiguo primero)
            combinedHistorial.sort((a, b) => a.epoch - b.epoch);

            console.log(`[CajaNegra] Historial combinado para paciente ${pacienteId}: ${combinedHistorial.length} snapshots.`);
            return combinedHistorial;
        } catch (e) {
            console.error('[CajaNegra] Error obteniendo historial combinado:', e);
            return [];
        }
    },

    /**
     * Recupera los datos de un paciente de un snapshot específico o el más reciente si no se especifica.
     * @param {string} pacienteId - El ID del paciente.
     * @param {number} [epochTimestamp] - El timestamp epoch del snapshot deseado. Si no se proporciona, devuelve el más reciente.
     * @returns {Promise<Object|null>} Una promesa que resuelve con los datos del paciente del snapshot, o null si no se encuentra.
     */
    async viajarEnElTiempo(pacienteId, epochTimestamp) {
        try {
            const historial = await this.obtenerHistorial(pacienteId);
            if (historial.length === 0) return null;

            if (!epochTimestamp) {
                // Retorna el último (más reciente) snapshot si no se especifica timestamp
                return historial[historial.length - 1].datos;
            }

            // Busca el snapshot más cercano que no supere el timestamp objetivo
            let mejor = null;
            for (let snap of historial) {
                if (snap.epoch <= epochTimestamp) {
                    mejor = snap;
                } else {
                    // Si el snapshot actual es posterior al objetivo, el 'mejor' ya encontrado es el más cercano anterior.
                    break;
                }
            }
            
            return mejor ? mejor.datos : null;
        } catch (e) {
            console.error('[CajaNegra] Error en viajarEnElTiempo:', e);
            return null;
        }
    },

    /**
     * Renderiza un modal interactivo para visualizar y seleccionar snapshots del historial del paciente.
     * @param {string} pacienteId - El ID del paciente.
     * @param {string} pacienteNombre - El nombre del paciente para mostrar en el modal.
     * @returns {Promise<void>}
     */
    async renderizarModalViajeEnElTiempo(pacienteId, pacienteNombre) {
        try {
            const historial = await this.obtenerHistorial(pacienteId);
            
            // Crear modal interactivo si no existe (aborda el reporte de POCHI)
            let modal = document.getElementById('cajaNegraModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'cajaNegraModal';
                modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;';
                document.body.appendChild(modal);
            }

            // Ordena por 'epoch' en orden descendente para la visualización (el más reciente primero)
            const displayHistorial = [...historial].sort((a, b) => b.epoch - a.epoch);

            let listaHtml = '';
            if (displayHistorial.length === 0) {
                listaHtml = '<p style="color:#666;">No hay snapshots históricos registrados todavía para este paciente. Se registrará uno cada vez que guardes.</p>';
            } else {
                listaHtml = displayHistorial.map((s, idx) => {
                    const diagnosticoTexto = (s.datos.diagnostico || s.datos.re_diagnostico || 'Sin diagnóstico').substring(0, 40);
                    return `
                    <div style="background:#f8f9fa;border:1px solid #ddd;padding:10px;margin-bottom:8px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <strong>#${displayHistorial.length - idx} - ${new Date(s.epoch).toLocaleString()}</strong>
                            <span style="font-size:10px;color:#888;margin-left:10px;padding:2px 6px;border-radius:3px;background:#e0e0e0;">Fuente: ${s.source}</span>
                            <div style="font-size:12px;color:#555;">ID: ${s.id_snapshot} | Diagnóstico: ${diagnosticoTexto}...</div>
                        </div>
                        <div>
                            <button onclick="window.CajaNegraTemporal.restaurarSnapshot('${pacienteId}', ${s.epoch})" style="background:#2b6cb0;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-weight:600;">Viajar a este estado</button>
                        </div>
                    </div>
                `;
                }).join('');
            }

            modal.innerHTML = `
                <div style="background:white;width:650px;max-height:85vh;border-radius:10px;padding:25px;box-shadow:0 10px 25px rgba(0,0,0,0.3);display:flex;flex-direction:column;">
                    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding-bottom:12px;margin-bottom:15px;">
                        <h2 style="margin:0;color:#2c3e50;font-size:20px;">🕰️ Caja Negra Temporal - Historial de Paciente</h2>
                        <button onclick="document.getElementById('cajaNegraModal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#888;">&times;</button>
                    </div>
                    <p style="margin-top:0;color:#555;font-size:14px;">Paciente: <strong>${pacienteNombre || pacienteId}</strong></p>
                    <div style="overflow-y:auto;flex-grow:1;max-height:50vh;padding-right:5px;">
                        ${listaHtml}
                    </div>
                    <div style="border-top:1px solid #eee;padding-top:12px;margin-top:15px;text-align:right;">
                        <button onclick="document.getElementById('cajaNegraModal').remove()" style="background:#e2e8f0;color:#333;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600;">Cerrar</button>
                    </div>
                </div>
            `;
        } catch (e) {
            console.error('[CajaNegra] Error renderizando modal:', e);
        }
    },

    /**
     * Restaura los datos de un snapshot específico en el editor de la interfaz de usuario.
     * @param {string} pacienteId - El ID del paciente.
     * @param {number} epoch - El timestamp epoch del snapshot a restaurar.
     * @returns {Promise<void>}
     */
    async restaurarSnapshot(pacienteId, epoch) {
        try {
            const datos = await this.viajarEnElTiempo(pacienteId, epoch);
            if (datos) {
                if (typeof window.cargarDatosEnEditor === 'function') {
                    window.cargarDatosEnEditor(datos);
                    alert(`🚀 Viaje en el tiempo exitoso al estado del ${new Date(epoch).toLocaleString()}. Formulario restaurado.`);
                    const modal = document.getElementById('cajaNegraModal');
                    if (modal) {
                        modal.remove();
                    }
                } else {
                    alert('Estado recuperado en consola. Revisa los datos.');
                    console.log('Datos restaurados:', datos);
                }
            } else {
                alert('No se encontraron datos para ese snapshot.');
            }
        } catch (e) {
            console.error('[CajaNegra] Error restaurando snapshot:', e);
            alert('Error al restaurar el snapshot.');
        }
    }
};

// Inicializa el entorno y IndexedDB cuando el módulo se carga para asegurar que esté listo.
_initializeEnvironment();
_initIndexedDB().catch(e => console.error("Error al inicializar IndexedDB al cargar el módulo CajaNegraTemporal:", e));

console.log('[CajaNegra] Módulo cliente cargado correctamente. Modo:', _isOfflineMode ? 'OFFLINE' : 'ONLINE');
