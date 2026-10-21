// sincronizar_26q338.js
// Script auxiliar para inyección forzada y sincronización atómica del caso 26Q-338 (CALDERÓN ZAVALETA, ROSA YULIANA)
// en LocalStorage e IndexedDB (ClinicaReportesDB) y respaldo maestro.

(function() {
    const caso26Q338 = {
        "id": 18923,
        "service": "Q",
        "cod_atencion": "26Q-338",
        "codAtencion": "26Q-338",
        "dni": "961423980",
        "med_solicitante": "DR. JUAN JESÚS MARREROS LLOCLLA",
        "medSolicitante": "DR. JUAN JESÚS MARREROS LLOCLLA",
        "nombres": "ROSA YULIANA",
        "apellidos": "CALDERÓN ZAVALETA",
        "paciente": "CALDERÓN ZAVALETA, ROSA YULIANA",
        "costo": 0.0,
        "adelanto": 0.0,
        "resta": 0.0,
        "fec_registro": "2026-10-03",
        "fecRegistro": "2026-10-03",
        "fec_entrega": "2026-10-10",
        "fecEntrega": "2026-10-10",
        "pagado": true,
        "atrasado": false,
        "modificado": true,
        "especimen": "BIOPSIA DE ENDOMETRIO",
        "macro_desc": "Fragmentos de endometrio de 1.2 cm. 1 casete.",
        "macroDesc": "Fragmentos de endometrio de 1.2 cm. 1 casete.",
        "micro_desc": "Endometrio secretor.",
        "microDesc": "Endometrio secretor.",
        "diagnostico": "ENDOMETRIO SECRETOR, SIN ATIPIA.",
        "edad": null,
        "sexo": "FEMENINO",
        "casetes": 1,
        "tel_contacto": "961423980",
        "doctor": "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA",
        "clinica": "CLINICA CARRION",
        "procedencia": "CLINICA CARRION",
        "firmado": true,
        "estado": "Completado",
        "created_at": "2026-10-09T16:20:00.000000+00:00",
        "fec_informe": "2026-10-10",
        "validado": true
    };

    window.sincronizarCaso26Q338 = function() {
        console.log("[Sync 26Q-338] Iniciando inyección atómica...");
        
        // 1. Sincronización en RAM (patientDatabase y patientMap)
        if (typeof window.patientDatabase !== 'undefined' && Array.isArray(window.patientDatabase)) {
            const idx = window.patientDatabase.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-338'));
            if (idx !== -1) {
                window.patientDatabase[idx] = Object.assign({}, window.patientDatabase[idx], caso26Q338);
            } else {
                window.patientDatabase.unshift(caso26Q338);
            }
            if (typeof window.patientMap !== 'undefined' && window.patientMap.set) {
                window.patientMap.set('26q-338', caso26Q338);
                window.patientMap.set('26q338', caso26Q338);
            }
        }

        // 2. Sincronización en LocalStorage
        try {
            localStorage.setItem('caso_26q338_respaldo', JSON.stringify(caso26Q338));
            console.log("[Sync 26Q-338] Guardado en LocalStorage.");
        } catch (e) {
            console.warn("[Sync 26Q-338] Error guardando en LocalStorage:", e);
        }

        // 3. Sincronización en IndexedDB
        if (window.indexedDB) {
            const request = indexedDB.open('ClinicaReportesDB');
            request.onsuccess = function(e) {
                const db = e.target.result;
                if (db.objectStoreNames.contains('pacientes_completos')) {
                    const tx = db.transaction('pacientes_completos', 'readwrite');
                    const store = tx.objectStore('pacientes_completos');
                    store.put(caso26Q338);
                    console.log("[Sync 26Q-338] Inyectado en IndexedDB (pacientes_completos).");
                }
            };
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.sincronizarCaso26Q338);
    } else {
        window.sincronizarCaso26Q338();
    }
})();
