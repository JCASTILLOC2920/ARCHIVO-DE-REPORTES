/**
 * Caja Negra Temporal (Time-Machine Client Module)
 * Permite listar historiales de pacientes y viajar en el tiempo para restaurar o visualizar estados previos.
 */

// --- IndexedDB Setup ---
const DB_NAME = 'CajaNegraDB';
const DB_VERSION = 1;
const STORE_NAME = 'snapshots';

let db; // Variable global para la instancia de IndexedDB

/**
 * Inicializa la base de datos IndexedDB.
 * Crea o abre la base de datos y el Object Store para los snapshots.
 * @returns {Promise<IDBDatabase>} Una promesa que resuelve con la instancia de la base de datos.
 */
function _initIndexedDB() {
    return new Promise((resolve, reject) => {
        if (db) { // Si la base de datos ya está abierta, la devuelve.
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                const store = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id_snapshot' });
                store.createIndex('pacienteId', 'pacienteId', { unique: false });
                store.createIndex('epoch', 'epoch', { unique: false });
                console.log('[CajaNegra] IndexedDB: Object Store y índices creados/actualizados.');
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('[CajaNegra] IndexedDB inicializado con éxito.');
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('[CajaNegra] Error al inicializar IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Guarda un snapshot en IndexedDB.
 * @param {Object} snapshot - El objeto snapshot a guardar.
 * @returns {Promise<void>} Una promesa que resuelve cuando el snapshot ha sido guardado.
 */
async function _saveSnapshotToIndexedDB(snapshot) {
    const dbInstance = await _initIndexedDB();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(snapshot); // 'put' inserta o actualiza si la keyPath ya existe

        request.onsuccess = () => {
            console.log(`[CajaNegra] Snapshot ${snapshot.id_snapshot} guardado en IndexedDB.`);
            resolve();
        };

        request.onerror = (event) => {
            console.error('[CajaNegra] Error al guardar snapshot en IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Obtiene todos los snapshots de un paciente desde IndexedDB.
 * @param {string} pacienteId - El ID del paciente.
 * @returns {Promise<Array<Object>>} Una promesa que resuelve con una lista de snapshots.
 */
async function _getSnapshotsFromIndexedDB(pacienteId) {
    const dbInstance = await _initIndexedDB();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('pacienteId');
        const request = index.getAll(pacienteId);

        request.onsuccess = () => {
            console.log(`[CajaNegra] Recuperados ${request.result.length} snapshots de IndexedDB para paciente ${pacienteId}.`);
            resolve(request.result);
        };

        request.onerror = (event) => {
            console.error('[CajaNegra] Error al obtener snapshots de IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Elimina un snapshot específico de IndexedDB.
 * @param {string} id_snapshot - El ID del snapshot a eliminar.
 * @returns {Promise<void>} Una promesa que resuelve cuando el snapshot ha sido eliminado.
 */
async function _deleteSnapshotFromIndexedDB(id_snapshot) {
    const dbInstance = await _initIndexedDB();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id_snapshot);

        request.onsuccess = () => {
            console.log(`[CajaNegra] Snapshot ${id_snapshot} eliminado de IndexedDB.`);
            resolve();
        };

        request.onerror = (event) => {
            console.error('[CajaNegra] Error al eliminar snapshot de IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

// --- Supabase Setup ---
// Se asume que 'window.supabase' ya está inicializado en otro script (ej. main.js o db_service.js)
// Si no estuviera disponible, las operaciones de Supabase se omitirán con un warning.
const SUPABASE_BUCKET_NAME = 'patient-snapshots'; // Nombre del bucket dedicado en Supabase Storage

/**
 * Sube un snapshot a Supabase Storage.
 * @param {string} pacienteId - El ID del paciente.
 * @param {Object} snapshot - El objeto snapshot a subir.
 * @returns {Promise<boolean>} Una promesa que resuelve a true si la subida fue exitosa, false en caso contrario.
 */
async function _uploadSnapshotToSupabase(pacienteId, snapshot) {
    if (!window.supabase) {
        console.warn('[CajaNegra] Supabase client no está disponible (window.supabase es undefined). No se subirá el snapshot a la nube.');
        return false;
    }

    try {
        const filePath = `${pacienteId}/${snapshot.id_snapshot}.json`;
        const { data, error } = await window.supabase.storage
            .from(SUPABASE_BUCKET_NAME)
            .upload(filePath, JSON.stringify(snapshot), {
                contentType: 'application/json',
                upsert: true // Sobrescribe si el archivo ya existe
            });

        if (error) {
            console.error('[CajaNegra] Error al subir snapshot a Supabase Storage:', error.message);
            return false;
        }
        console.log(`[CajaNegra] Snapshot ${snapshot.id_snapshot} subido a Supabase Storage.`);
        return true;
    } catch (e) {
        console.error('[CajaNegra] Excepción al subir snapshot a Supabase Storage:', e);
        return false;
    }
}

/**
 * Obtiene todos los snapshots de un paciente desde Supabase Storage.
 * @param {string} pacienteId - El ID del paciente.
 * @returns {Promise<Array<Object>>} Una promesa que resuelve con una lista de snapshots.
 */
async function _getSnapshotsFromSupabase(pacienteId) {
    if (!window.supabase) {
        console.warn('[CajaNegra] Supabase client no está disponible. No se recuperarán snapshots de la nube.');
        return [];
    }

    try {
        // Lista todos los archivos en la carpeta del paciente
        const { data: files, error: listError } = await window.supabase.storage
            .from(SUPABASE_BUCKET_NAME)
            .list(pacienteId, {
                limit: 100, // Límite de archivos a listar, ajustar según necesidad
                offset: 0,
                sortBy: { column: 'name', order: 'desc' },
            });

        if (listError) {
            console.error('[CajaNegra] Error al listar snapshots de Supabase Storage:', listError.message);
            return [];
        }

        const snapshots = [];
        for (const file of files) {
            if (file.name.endsWith('.json')) {
                const filePath = `${pacienteId}/${file.name}`;
                const { data: blob, error: downloadError } = await window.supabase.storage
                    .from(SUPABASE_BUCKET_NAME)
                    .download(filePath);

                if (downloadError) {
                    console.error(`[CajaNegra] Error al descargar snapshot ${file.name} de Supabase:`, downloadError.message);
                    continue;
                }

                const text = await blob.text();
                try {
                    const snapshot = JSON.parse(text);
                    snapshots.push({ ...snapshot, source: 'Supabase' }); // Añade la fuente para la UI
                } catch (parseError) {
                    console.error(`[CajaNegra] Error al parsear snapshot ${file.name} de Supabase:`, parseError);
                }
            }
        }
        console.log(`[CajaNegra] Recuperados ${snapshots.length} snapshots de Supabase Storage para paciente ${pacienteId}.`);
        return snapshots;
    } catch (e) {
        console.error('[CajaNegra] Excepción al obtener snapshots de Supabase Storage:', e);
        return [];
    }
}

window.CajaNegraTemporal = {
    LOCAL_STORAGE_LIMIT: 15, // Máximo de snapshots a mantener en localStorage por paciente

    /**
     * Toma un snapshot del estado actual del paciente y lo guarda en un sistema de almacenamiento por niveles.
     * Prioriza localStorage para los más recientes, migra a IndexedDB y sube a Supabase Storage.
     * @param {string} pacienteId - El ID del paciente.
     * @param {Object} datosPaciente - Los datos del paciente a guardar.
     * @returns {Promise<boolean>} Una promesa que resuelve a true si el snapshot fue tomado con éxito, false en caso contrario.
     */
    async tomarSnapshot(pacienteId, datosPaciente) {
        try {
            console.log(`[CajaNegra] Tomando snapshot automático para paciente ${pacienteId}...`);
            const key = `caja_negra_${pacienteId}`;
            let historialLocalStorage = JSON.parse(localStorage.getItem(key) || '[]');

            const ahora = new Date();
            const timestampStr = ahora.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-') + `_${ahora.getMilliseconds()}`;

            const snapshot = {
                timestamp: ahora.toISOString(),
                epoch: ahora.getTime(),
                id_snapshot: timestampStr,
                pacienteId: pacienteId, // Añade pacienteId para indexación en IndexedDB
                datos: JSON.parse(JSON.stringify(datosPaciente))
            };

            historialLocalStorage.push(snapshot);

            // Aplica el límite de localStorage y migra el más antiguo a IndexedDB
            if (historialLocalStorage.length > this.LOCAL_STORAGE_LIMIT) {
                const oldestSnapshot = historialLocalStorage.shift(); // Elimina el más antiguo de localStorage
                console.log(`[CajaNegra] Migrando snapshot ${oldestSnapshot.id_snapshot} de localStorage a IndexedDB.`);
                await _saveSnapshotToIndexedDB(oldestSnapshot);
            }

            localStorage.setItem(key, JSON.stringify(historialLocalStorage));
            console.log(`[CajaNegra] Snapshot guardado en localStorage: ${timestampStr}`);

            // Sube asíncronamente a Supabase Storage sin bloquear el flujo principal
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
            const key = `caja_negra_${pacienteId}`;
            const historialLocalStorage = JSON.parse(localStorage.getItem(key) || '[]').map(s => ({ ...s, source: 'Local' }));
            const historialIndexedDB = await _getSnapshotsFromIndexedDB(pacienteId).then(data => data.map(s => ({ ...s, source: 'IndexedDB' })));
            const historialSupabase = await _getSnapshotsFromSupabase(pacienteId); // Ya añade 'source' internamente

            // Combina todos los historiales
            let combinedHistorial = [...historialLocalStorage, ...historialIndexedDB, ...historialSupabase];

            // Elimina duplicados basándose en 'id_snapshot'.
            // Prioriza las fuentes locales (Local, IndexedDB) sobre Supabase si hay duplicados.
            const uniqueSnapshots = {};
            for (const snap of combinedHistorial) {
                if (!uniqueSnapshots[snap.id_snapshot] || snap.source === 'Local' || snap.source === 'IndexedDB') {
                    uniqueSnapshots[snap.id_snapshot] = snap;
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
        const historial = await this.obtenerHistorial(pacienteId);
        if (historial.length === 0) return null;

        if (!epochTimestamp) {
            // Retorna el último (más reciente) snapshot si no se especifica timestamp
            return historial[historial.length - 1].datos;
        }

        // Busca el snapshot más cercano que no supere el timestamp objetivo
        let mejor = historial[0]; // Inicializa con el snapshot más antiguo
        for (let snap of historial) {
            if (snap.epoch <= epochTimestamp) {
                mejor = snap;
            } else {
                // Si el snapshot actual es posterior al objetivo, el 'mejor' ya encontrado es el más cercano anterior.
                break;
            }
        }
        return mejor.datos;
    },

    /**
     * Renderiza un modal interactivo para visualizar y seleccionar snapshots del historial del paciente.
     * @param {string} pacienteId - El ID del paciente.
     * @param {string} pacienteNombre - El nombre del paciente para mostrar en el modal.
     * @returns {Promise<void>}
     */
    async renderizarModalViajeEnElTiempo(pacienteId, pacienteNombre) {
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

        let listaHtml = displayHistorial.length === 0 ? '<p style="color:#666;">No hay snapshots históricos registrados todavía para este paciente. Se registrará uno cada vez que guardes.</p>' :
            displayHistorial.map((s, idx) => `
                <div style="background:#f8f9fa;border:1px solid #ddd;padding:10px;margin-bottom:8px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>#${displayHistorial.length - idx} - ${new Date(s.epoch).toLocaleString()}</strong>
                        <span style="font-size:10px;color:#888;margin-left:10px;padding:2px 6px;border-radius:3px;background:#e0e0e0;">Fuente: ${s.source}</span>
                        <div style="font-size:12px;color:#555;">ID: ${s.id_snapshot} | Diagnóstico: ${(s.datos.diagnostico || s.datos.re_diagnostico || 'Sin diagnóstico').substring(0, 40)}...</div>
                    </div>
                    <div>
                        <button onclick="window.CajaNegraTemporal.restaurarSnapshot('${pacienteId}', ${s.epoch})" style="background:#2b6cb0;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-weight:600;">Viajar a este estado</button>
                    </div>
                </div>
            `).join('');

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
    },

    /**
     * Restaura los datos de un snapshot específico en el editor de la interfaz de usuario.
     * @param {string} pacienteId - El ID del paciente.
     * @param {number} epoch - El timestamp epoch del snapshot a restaurar.
     * @returns {Promise<void>}
     */
    async restaurarSnapshot(pacienteId, epoch) {
        const datos = await this.viajarEnElTiempo(pacienteId, epoch);
        if (datos) {
            if (typeof window.cargarDatosEnEditor === 'function') {
                window.cargarDatosEnEditor(datos);
                alert(`🚀 Viaje en el tiempo exitoso al estado del ${new Date(epoch).toLocaleString()}. Formulario restaurado.`);
                document.getElementById('cajaNegraModal').remove();
            } else {
                alert('Estado recuperado en consola. Revisa los datos.');
                console.log('Datos restaurados:', datos);
            }
        }
    }
};

// Inicializa IndexedDB cuando el módulo se carga para asegurar que esté listo.
_initIndexedDB().catch(e => console.error("Error al inicializar IndexedDB al cargar el módulo CajaNegraTemporal:", e));

console.log('[CajaNegra] Módulo cliente cargado correctamente.');
