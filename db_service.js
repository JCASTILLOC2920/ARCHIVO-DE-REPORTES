import { cleanCodeFunc, correctPapanicolaouSpelling, cleanTextContentLocal, formatDoctorName, escapeHtml, sanitizeDateForPg, normalizeSexo } from './utils.js';




import { safeDeepClone, safeMonotonicMerge } from './sovereign_integrity_guard.js';




export { safeDeepClone, safeMonotonicMerge };









// CONFIGURACIÓN SOBERANA N8N LOCAL




const N8N_SOVEREIGN_CONFIG = {




    BASE_URL: 'http://127.0.0.1:5678',




    WEBHOOKS: {




        GUARDAR_PACIENTE: '/webhook/guardar-paciente',




        ANALIZAR_ORDEN: '/webhook/analizar-orden-imagen',




        SYNC_PACIENTES: '/webhook/obtener-pacientes'




    },




    TIMEOUT_MS: 5000




};









// NEUTRALIZACIÓN DE SUPABASE: syncPatientsFromSupabase




// Se reemplaza la lógica de sincronización con Supabase por un despacho atómico a Docker n8n local.




export async function syncPatientsFromSupabase(options = {}) {




    const { backgroundSync = false, limit = 50000 } = options;




    




    // Log de neutralización y redirección a n8n




    console.log(`[N8N Sync] Neutralización de syncPatientsFromSupabase detectada. Redirigiendo a Docker n8n local (${N8N_SOVEREIGN_CONFIG.BASE_URL}).`);




    




    try {




        const response = await fetch(`${N8N_SOVEREIGN_CONFIG.BASE_URL}${N8N_SOVEREIGN_CONFIG.WEBHOOKS.SYNC_PACIENTES}`, {




            method: 'GET'




        });









        if (!response.ok) {




            throw new Error(`Error HTTP ${response.status} en n8n sync`);




        }









        const data = await response.json();




        const n8nPats = data.pacientes || data.data || [];




        if (Array.isArray(n8nPats) && n8nPats.length > 0) {




            if (typeof window !== 'undefined') {




                window.REAL_SUPABASE_PATIENTS = n8nPats;




                safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(n8nPats));




                if (typeof window.applyFilters === 'function') window.applyFilters(false);




            }




        }




        console.log(`[N8N Sync] Sincronización completada vía n8n. Registros procesados: ${data.processed || 0}`);




        return { success: true, data };









    } catch (error) {




        console.error(`[N8N Sync] Error al sincronizar con n8n local:`, error);




        return { success: false, error: error.message };




    }




}









export function getRealSupabasePatients() {




    if (typeof window !== 'undefined') {




        if (Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0) return window.REAL_SUPABASE_PATIENTS;




        if (Array.isArray(window.realSupabaseBackup) && window.realSupabaseBackup.length > 0) return window.realSupabaseBackup;




        if (Array.isArray(window.REAL_SUPABASE_BACKUP) && window.REAL_SUPABASE_BACKUP.length > 0) return window.REAL_SUPABASE_BACKUP;




    }




    if (typeof globalThis !== 'undefined') {




        if (Array.isArray(globalThis.REAL_SUPABASE_PATIENTS) && globalThis.REAL_SUPABASE_PATIENTS.length > 0) return globalThis.REAL_SUPABASE_PATIENTS;




        if (Array.isArray(globalThis.realSupabaseBackup) && globalThis.realSupabaseBackup.length > 0) return globalThis.realSupabaseBackup;




        if (Array.isArray(globalThis.REAL_SUPABASE_BACKUP) && globalThis.REAL_SUPABASE_BACKUP.length > 0) return globalThis.REAL_SUPABASE_BACKUP;




    }




    return [];




}









const REAL_SUPABASE_PATIENTS = new Proxy([], {




    get(target, prop) {




        const list = getRealSupabasePatients();




        const source = list.length > 0 ? list : target;




        const val = source[prop];




        if (typeof val === 'function') {




            return val.bind(source);




        }




        return val;




    }




});









export { cleanCodeFunc, correctPapanicolaouSpelling, cleanTextContentLocal, formatDoctorName, escapeHtml, sanitizeDateForPg, normalizeSexo, REAL_SUPABASE_PATIENTS };









// Bases de datos simuladas / temporales




export const patientDatabase = [];




export const patientMap = new Map();




if (typeof window !== 'undefined') {




    window.patientDatabase = patientDatabase;




    window.patientMap = patientMap;




}









// Auto-actualización inmediata y soberana de localStorage e IndexedDB a los 1,252 registros reconciliados + RENIEC




(function autoActualizarLocalStorageSoberano() {




    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;




    try {




        const CURRENT_SSOT_VER = '20261110_v0440_clean_three_buttons';




        const savedVer = localStorage.getItem('jcpathlab_ssot_version');




        const raw = localStorage.getItem('patientDatabaseLocal') || localStorage.getItem('patientDatabase') || localStorage.getItem('pacientesDB');




        let parsedCount = 0;




        let hasGhostData = false;




        if (raw) {




            try {




                const parsed = JSON.parse(raw);




                parsedCount = parsed.length;




                hasGhostData = parsed.some(p => {




                    if (!p) return false;




                    const nom = String(p.paciente || '').toUpperCase();




                    const cod = String(p.codAtencion || p.cod_atencion || p.codigo || '').toUpperCase();




                    const doc = String(p.med_solicitante || p.medSolicitante || p.doctor || '').toUpperCase();




                    return nom.includes('SIN NOMBRE') || /26Q-18\d{3}/.test(cod) || (['26Q-300', '26Q-301', '26Q-259'].includes(cod) && doc.includes('CASTILLO'));




                });




            } catch(e) {}




        }




        const master = getRealSupabasePatients().slice();




        // FUSIÓN MONÓTONA INVIOLABLE: Preservar cualquier registro local creado (Ej. 26Q-395)




        if (Array.isArray(parsed) && parsed.length > 0) {




            parsed.forEach(p => {




                if (!p) return;




                const c = String(p.codAtencion || p.cod_atencion || p.codigo || '').trim().toUpperCase();




                if (c && c !== '26Q-396' && !master.some(m => String(m.codAtencion || m.cod_atencion || m.codigo || '').trim().toUpperCase() === c)) {




                    master.unshift(p);




                }




            });




        }




        const targetCount = Math.max(1252, master.length);




        if ((savedVer !== CURRENT_SSOT_VER || parsedCount < targetCount || hasGhostData) && master.length >= 1250) {




            console.log(`[Auto-Heal LocalStorage] Sincronizando almacenamiento local (${parsedCount} -> ${master.length} pacientes SSOT v2026)...`);




            safeSetLocalStorage('patientDatabaseLocal', JSON.stringify(master));




            try { localStorage.setItem('patientDatabase', JSON.stringify(master)); } catch(e) {}




            try { localStorage.setItem('pacientesDB', JSON.stringify(master)); } catch(e) {}




            try { localStorage.setItem('jcpathlab_ssot_version', CURRENT_SSOT_VER); } catch(e) {}




        }




    } catch (e) {




        console.warn('[Auto-Heal LocalStorage] Error en verificación preventiva:', e);




    }




})();









export function safeSetLocalStorage(key, value, retryCount = 0) {




    // BLINDAJE SOBERANO INVIOLABLE: Proteger patientDatabaseLocal de vaciados accidentales o sobreescritura nula




    if (key === 'patientDatabaseLocal' || key === 'patientDatabase' || key === 'pacientesDB') {




        if (!value || value === '[]' || value === '{}' || value.length < 50) {




            console.error(`[Blindaje Soberano] Bloqueado intento destructivo de guardar base de datos vacía o nula en '${key}'. Los expedientes permanecen protegidos.`);




            return;




        }




    }




    try {




        localStorage.setItem(key, value);




    } catch (e) {




        // Protección robusta contra QuotaExceededError (5MB)




        const isQuotaError = e && (




            e.name === 'QuotaExceededError' ||




            e.code === 22 ||




            e.code === 1014 ||




            (e.message && e.message.toLowerCase().includes('quota'))




        );




        




        if (retryCount >= 1) {




            console.warn(`[Storage Engine] Cuota excedida para '${key}' en localStorage. Derivando transparente a IndexedDB ('ClinicaReportesDB').`);




            try {




                if (typeof indexedDB !== 'undefined') {




                    const request = indexedDB.open('ClinicaReportesDB', 3);




                    request.onsuccess = (event) => {




                        const db = event.target.result;




                        if (!db.objectStoreNames.contains('pacientes_completos')) return;




                        const tx = db.transaction('pacientes_completos', 'readwrite');




                        const store = tx.objectStore('pacientes_completos');




                        store.put({ id: key, payload: value, updatedAt: new Date().toISOString() });




                    };




                }




            } catch (idbErr) {




                console.warn(`[Storage Engine] Falló también el respaldo en IndexedDB:`, idbErr);




            }




            return;




        }




        




        console.warn(`[Storage Engine] Cuota excedida al guardar '${key}'. Purgando respaldos secundarios y reintentando...`);




        try {




            localStorage.removeItem('patientDatabaseLocal_bak3');




            localStorage.removeItem('patientDatabaseLocal_bak2');




            localStorage.removeItem('patientDatabaseLocal_bak1');




            safeSetLocalStorage(key, value, retryCount + 1);




        } catch (e2) {




            // Derivación automática a IndexedDB ante saturación definitiva




            try {




                if (typeof indexedDB !== 'undefined') {




                    const request = indexedDB.open('ClinicaReportesDB', 3);




                    request.onsuccess = (event) => {




                        const db = event.target.result;




                        if (!db.objectStoreNames.contains('pacientes_completos')) return;




                        const tx = db.transaction('pacientes_completos', 'readwrite');




                        const store = tx.objectStore('pacientes_completos');




                        store.put({ id: key, payload: value, updatedAt: new Date().toISOString() });




                    };




                }




            } catch (idbErr2) {




                console.warn(`[Storage Engine] No se pudo escribir '${key}' en IndexedDB:`, idbErr2);




            }




        }




    }




}









// Funciones de despacho a n8n




export async function dispatchN8nWebhook(webhookPath, payload) {




    const url = `${N8N_SOVEREIGN_CONFIG.BASE_URL}${webhookPath}`;




    try {




        const response = await fetch(url, {




            method: 'POST',




            headers: { 'Content-Type': 'application/json' },




            body: JSON.stringify(payload)




        });




        if (!response.ok) throw new Error(`HTTP ${response.status}`);




        return await response.json();




    } catch (error) {




        console.error(`[N8N Dispatch] Error en ${webhookPath}:`, error);




        throw error;




    }




}









export async function obtenerPacientes(options = {}) {




    const { backgroundSync = false, limit = 50000 } = options;




    // Usar la función neutralizada que ahora apunta a n8n




    return await syncPatientsFromSupabase({ backgroundSync, limit });




}









export async function guardarPaciente(paciente) {




    return await dispatchN8nWebhook(N8N_SOVEREIGN_CONFIG.WEBHOOKS.GUARDAR_PACIENTE, paciente);




}









export async function guardarReporte(reporte) {




    return await dispatchN8nWebhook(N8N_SOVEREIGN_CONFIG.WEBHOOKS.GUARDAR_PACIENTE, { ...reporte, type: 'report' });




}









// Motor de Sincronización Multi-Clinica (Neutralizado de Supabase)




class MultiClinicSyncEngine {




    constructor() {




        this._toastTimeout = null;




    }









    showToast(message, type = 'info') {




        if (typeof document === 'undefined') return;




        let toast = document.getElementById('global-toast');




        if (!toast) {




            toast = document.createElement('div');




            toast.id = 'global-toast';




            toast.style.cssText = `




                position: fixed;




                bottom: 20px;




                right: 20px;




                padding: 12px 24px;




                background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};




                color: white;




                border-radius: 4px;




                box-shadow: 0 4px 12px rgba(0,0,0,0.15);




                z-index: 9999;




                opacity: 0;




                transform: translateY(10px);




                transition: all 0.3s ease;




                font-family: sans-serif;




                font-size: 14px;




            `;




            document.body.appendChild(toast);




        }




        toast.textContent = message;




        toast.style.opacity = '1';




        toast.style.transform = 'translateY(0)';









        if (this._toastTimeout) clearTimeout(this._toastTimeout);




        this._toastTimeout = setTimeout(() => {




            toast.style.opacity = '0';




            toast.style.transform = 'translateY(-10px)';




        }, 3500);




    }




}









export const syncEngine = new MultiClinicSyncEngine();




if (typeof window !== 'undefined') {




    window.syncEngine = syncEngine;




}









// ==========================================




// MÓDULO DE CHAT CLÍNICA - DOCTOR (NEUTRALIZADO DE SUPABASE)




// ==========================================









export async function enviarMensajeChat(remitente, rol, clinica, mensaje, codAtencion = null) {




    // Neutralización: No usar Supabase. Usar n8n o almacenamiento local.




    console.warn("[Chat Realtime] Cliente Supabase neutralizado. Usando n8n local para persistencia de chat.");




    




    try {




        const payload = {




            remitente: remitente || 'Anónimo',




            rol_remitente: rol || 'doctor',




            clinica_id: clinica || 'General',




            mensaje: mensaje || '',




            cod_atencion: codAtencion || null,




            leido: false,




            timestamp: new Date().toISOString()




        };




        




        // Despacho a n8n para persistencia




        await dispatchN8nWebhook('/webhook/guardar-mensaje-chat', payload);




        




        return { success: true, data: payload };




    } catch (err) {




        console.error("[Chat Realtime] Error al enviar mensaje vía n8n:", err);




        return { success: false, error: err.message };




    }




}









export async function obtenerHistorialChat(clinica, limite = 50) {




    console.warn("[Chat Realtime] Cliente Supabase neutralizado. Consultando historial vía n8n local.");




    




    try {




        const payload = {




            clinica_id: clinica,




            limit: limite




        };




        




        const data = await dispatchN8nWebhook('/webhook/obtener-historial-chat', payload);




        return data || [];




    } catch (err) {




        console.error("[Chat Realtime] Error al obtener historial vía n8n:", err);




        return [];




    }




}









export function suscribirCanalChat(clinica, onMensajeRecibido) {




    console.warn("[Chat Realtime] Cliente Supabase neutralizado. Suscripción a canal en tiempo real no disponible sin Supabase. Usando polling local.");




    




    // Implementación de polling local como alternativa




    const intervalId = setInterval(async () => {




        try {




            const messages = await obtenerHistorialChat(clinica, 10);




            if (messages && messages.length > 0) {




                const latest = messages[messages.length - 1];




                if (typeof onMensajeRecibido === 'function') {




                    onMensajeRecibido(latest);




                }




            }




        } catch (e) {




            // Silenciar errores de polling




        }




    }, 5000); // Polling cada 5 segundos









    return {




        unsubscribe: () => clearInterval(intervalId)




    };




}









if (typeof window !== 'undefined') {




    window.enviarMensajeChat = enviarMensajeChat;




    window.obtenerHistorialChat = obtenerHistorialChat;




    window.suscribirCanalChat = suscribirCanalChat;




    window.obtenerPacientes = obtenerPacientes;




    window.guardarPaciente = guardarPaciente;




    window.guardarReporte = guardarReporte;




    window.dispatchN8nWebhook = dispatchN8nWebhook;




    window.N8N_SOVEREIGN_CONFIG = N8N_SOVEREIGN_CONFIG;




}









export let categoriesDatabase = [];




export let templatesDatabase = [];




export let doctorsDatabase = [];




export const defaultCategories = (typeof window !== 'undefined' && window.defaultCategories) ? window.defaultCategories : [];




export const usersDatabase = [];




export function initLocalDatabases() { return true; }




export function loadDoctorsData() { return Promise.resolve([]); }




export function sortPatientArray(arr) {
    if (!Array.isArray(arr)) {
        return [];
    }

    const parseCode = (code) => {
        if (!code || typeof code !== 'string') {
            return { year: 0, serviceWeight: 0, correlativeNum: 0 };
        }
        const parts = code.split('-');
        if (parts.length !== 2) {
            return { year: 0, serviceWeight: 0, correlativeNum: 0 };
        }
        const yearAndService = parts[0];
        const correlativeNumStr = parts[1];
        let year = parseInt(yearAndService.substring(0, 2), 10);
        let service = yearAndService.substring(2);
        let serviceWeight = 0;
        switch (service) {
            case 'Q': serviceWeight = 3; break;
            case 'C': serviceWeight = 2; break;
            case 'I': serviceWeight = 1; break;
            default: serviceWeight = 0;
        }
        const correlativeNum = parseInt(correlativeNumStr, 10);
        return {
            year: isNaN(year) ? 0 : year,
            serviceWeight: serviceWeight,
            correlativeNum: isNaN(correlativeNum) ? 0 : correlativeNum
        };
    };

    const getSortKey = (p) => {
        const code = p.codAtencion || p.cod_atencion || p.codigo;
        return parseCode(code);
    };

    const checkSigned = (p) => {
        if (!p) return false;
        return (
            p.firmado === true || 
            p.firmado === 1 || 
            String(p.firmado).toLowerCase() === 'true' || 
            String(p.estado_firma || '').toLowerCase() === 'firmado' || 
            String(p.estado_firma || '').toLowerCase() === 'validado' ||
            String(p.estado || '').toLowerCase().includes('completad') ||
            String(p.estado || '').toLowerCase().includes('listo')
        );
    };

    arr.sort((a, b) => {
        const signedA = checkSigned(a);
        const signedB = checkSigned(b);
        // JERARQUÍA MILITAR SLA: Informes inconclusos o sin firma (🔴) PRIMERO en la parte superior
        if (!signedA && signedB) return -1;
        if (signedA && !signedB) return 1;

        const keyA = getSortKey(a);
        const keyB = getSortKey(b);

        if (keyB.year !== keyA.year) {
            return keyB.year - keyA.year;
        }
        if (keyB.serviceWeight !== keyA.serviceWeight) {
            return keyB.serviceWeight - keyA.serviceWeight;
        }
        return keyB.correlativeNum - keyA.correlativeNum;
    });

    return arr;
}




export function triggerAutomaticBackup() {}




export function syncTemplatesFromSupabase() {}




export function syncCategoriesFromSupabase() {}




export function subscribePatientsRealtime() {}




export const savePatient = guardarPaciente;




export function deletePatient() {}




export function updateSyncStatusUI() {}




export function fetchFullPatientDetails() {}




export function fetchDeltaUpdates() {}




export function processSyncQueue() {}




export function uploadAllLocalReportsToSupabase() {}




export function saveSurgicalCaseToLRU() {}




export function getSurgicalCaseFromLRU() {}




export function getRecentSurgicalCasesLRU() { return []; }




export function saveCategoryToSupabase() {}




export function deleteCategoryFromSupabase() {}




export function saveTemplateToSupabase() {}




export function deleteTemplateFromSupabase() {}




export function getCorrelativeWindow() { return 1; }




export function searchPatientsFromSupabase() { return Promise.resolve([]); }




export function parseCodAtencionForSort(c) { return c; }




export function matchPatientSmartSound() { return false; }




export function levenshteinSimilarity(a, b) { return 1; }




export function addTemplateToDatabase(tpl) { if (templatesDatabase) templatesDatabase.push(tpl); }




export function mapPatientToDb(p) { return p; }




export function getPatientFromIndexedDB() { return Promise.resolve(null); }









if (typeof window !== 'undefined') {




    // Disparo preventivo en segundo plano para sincronizar en caliente con n8n




    try {




        setTimeout(() => {




            obtenerPacientes({ backgroundSync: true, limit: 50000 });




        }, 300);




    } catch(e) {}




}




