// sincronizar_26q341.js
// Script auxiliar para inyección forzada y sincronización atómica del caso 26Q-341 (BLAS ROJAS, BONY LIZBETH)
// en LocalStorage e IndexedDB (ClinicaReportesDB).

(function() {
    const caso26Q341 = {
        "id": 18926,
        "service": "Q",
        "cod_atencion": "26Q-341",
        "codAtencion": "26Q-341",
        "dni": "",
        "med_solicitante": "DR. MARREROS",
        "medSolicitante": "DR. MARREROS",
        "nombres": "BONY LIZBETH",
        "apellidos": "BLAS ROJAS",
        "paciente": "BLAS ROJAS, BONY LIZBETH",
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
        "especimen": "CÉRVIX (BIOPSIA)",
        "macro_desc": "Se reciben tres (03) fragmentos tisulares parduzcos que miden entre 0.3 cm y 0.5 cm de diámetro mayor. Se incluye la totalidad de la muestra en una cápsula (1 casete).",
        "micro_desc": "Típica de NIC 3 / LEIAG (pérdida de polaridad celular y atipia en más de dos tercios a espesor completo del epitelio escamoso, núcleos aumentados de tamaño, hipercromáticos con figuras mitóticas típicas y atípicas por encima del tercio basal). El estroma subyacente es escaso para evaluar/determinar invasión estromal.",
        "diagnostico": "CÉRVIX (BIOPSIA):\n- LESIÓN ESCAMOSA INTRAEPITELIAL DE ALTO GRADO (LEIAG / NIC 3).\n- NOTA: Estroma escaso que limita la evaluación de invasión estromal. No se puede descartar lesión de mayor grado en la proximidad tisular adyacente. Se sugiere correlación colposcópica y cono biópsico/escisión según criterio clínico.",
        "edad": null,
        "sexo": "FEMENINO",
        "casetes": 1,
        "tel_contacto": "",
        "doctor": "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA",
        "clinica": "CLINICA CARRION",
        "procedencia": "CLINICA CARRION",
        "firmado": true,
        "estado": "Completado",
        "created_at": "2026-10-09T16:20:00.000000+00:00",
        "validado": true,
        "fecha_informe": "2026-10-10",
        "fecha_firma": "2026-10-10"
    };

    window.sincronizarCaso26Q341 = function() {
        console.log("[Sync 26Q-341] Iniciando inyección atómica...");
        
        // 1. Sincronización en RAM (patientDatabase y patientMap)
        if (typeof window.patientDatabase !== 'undefined' && Array.isArray(window.patientDatabase)) {
            const idx = window.patientDatabase.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-341'));
            if (idx !== -1) {
                window.patientDatabase[idx] = Object.assign({}, window.patientDatabase[idx], caso26Q341);
            } else {
                window.patientDatabase.unshift(caso26Q341);
            }
            if (typeof window.patientMap !== 'undefined' && window.patientMap.set) {
                window.patientMap.set('26q-341', caso26Q341);
                window.patientMap.set('26q341', caso26Q341);
            }
        }

        // 2. Sincronización en localStorage
        try {
            const localRaw = localStorage.getItem('patientDatabaseLocal');
            let localArr = localRaw ? JSON.parse(localRaw) : [];
            const lIdx = localArr.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-341'));
            if (lIdx !== -1) {
                localArr[lIdx] = Object.assign({}, localArr[lIdx], caso26Q341);
            } else {
                localArr.unshift(caso26Q341);
            }
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(localArr));
            console.log("[Sync 26Q-341] LocalStorage actualizado con éxito.");
        } catch(e) {
            console.warn("[Sync 26Q-341] Advertencia en LocalStorage:", e);
        }

        // 3. Sincronización en IndexedDB (ClinicaReportesDB)
        if (typeof indexedDB !== 'undefined') {
            const req = indexedDB.open('ClinicaReportesDB', 2);
            req.onsuccess = function(ev) {
                const db = ev.target.result;
                if (db.objectStoreNames.contains('pacientes_completos')) {
                    const tx = db.transaction(['pacientes_completos'], 'readwrite');
                    const store = tx.objectStore('pacientes_completos');
                    store.put(caso26Q341, '26q-341');
                    store.put(caso26Q341, '26q341');
                    tx.oncomplete = function() {
                        console.log("[Sync 26Q-341] IndexedDB (pacientes_completos) actualizado con éxito.");
                    };
                }
            };
        }

        console.log("[Sync 26Q-341] CASO 26Q-341 INYECTADO: BLAS ROJAS, BONY LIZBETH (Completado y Firmado).");
    };

    if (typeof window !== 'undefined') {
        window.sincronizarCaso26Q341();
    }
})();
