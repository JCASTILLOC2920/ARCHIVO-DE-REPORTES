// sincronizar_26q340.js
// Script auxiliar para inyección forzada y sincronización atómica del caso 26Q-340 (CORAL CRUZ, PRISILA)
// en LocalStorage e IndexedDB (ClinicaReportesDB).

(function() {
    const caso26Q340 = {
        "id": 18925,
        "service": "Q",
        "cod_atencion": "26Q-340",
        "codAtencion": "26Q-340",
        "dni": "961347542",
        "med_solicitante": "DR. MARREROS",
        "medSolicitante": "DR. MARREROS",
        "nombres": "PRISILA",
        "apellidos": "CORAL CRUZ",
        "paciente": "CORAL CRUZ, PRISILA",
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
        "macro_desc": "Se reciben dos (02) fragmentos tisulares parduzcos que miden 0.4 cm y 0.3 cm de diámetro mayor. Se incluye la totalidad de la muestra en una cápsula (1 casete).",
        "micro_desc": "Los cortes histológicos de cérvix muestran epitelio escamoso estratificado con marcada pérdida de la polaridad celular y atipia nuclear que compromete más de dos tercios a prácticamente la totalidad del espesor epitelial. Se identifican núcleos aumentados de tamaño, hipercromáticos, con figuras mitóticas típicas y atípicas en estratos medio y superficial. Membrana basal íntegra. El estroma subyacente exhibe leve infiltrado linfoplasmocitario, sin evidencia de nidos celulares invasores ni ruptura de la lámina basal. Negativo para neoplasia maligna invasora.",
        "diagnostico": "CÉRVIX (BIOPSIA):\n- LESIÓN ESCAMOSA INTRAEPITELIAL DE ALTO GRADO (LEIAG / NIC 3).\n- SIN EVIDENCIA DE INVASIÓN ESTROMAL EN EL PRESENTE MATERIAL.\n\nNOTA CLÍNICA Y RECOMENDACIÓN:\nConforme a las directrices de manejo del Consenso ASCCP (American Society for Colposcopy and Cervical Pathology) y la clasificación de la OMS, ante el diagnóstico histológico de LEIAG / NIC 3 se recomienda escisión diagnóstica-terapéutica (cono LEEP o conización con bisturí frío) y correlación colposcópica multidisciplinaria inmediata.\n\nREFERENCIAS (FORMATO APA):\n- Perkins, R. B., Guido, R. S., Castle, P. E., Chelmow, D., Einstein, M. H., Garcia, F., ... & Massad, L. S. (2020). 2019 ASCCP risk-based management consensus guidelines for abnormal cervical cancer screening tests and cancer precursors. Journal of Lower Genital Tract Disease, 24(2), 102-131. https://doi.org/10.1097/LGT.0000000000000525\n- World Health Organization. (2020). Female genital tumours: WHO classification of tumours (5th ed., Vol. 4). International Agency for Research on Cancer.",
        "edad": null,
        "sexo": "FEMENINO",
        "casetes": 1,
        "tel_contacto": "961347542",
        "doctor": "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA",
        "clinica": "CLINICA CARRION",
        "procedencia": "CLINICA CARRION",
        "firmado": true,
        "estado": "Completado",
        "created_at": "2026-10-09T16:20:00.000000+00:00",
        "fec_informe": "2026-10-10",
        "validado": true
    };

    window.sincronizarCaso26Q340 = function() {
        console.log("[Sync 26Q-340] Iniciando inyección atómica...");
        
        // 1. Sincronización en RAM (patientDatabase y patientMap)
        if (typeof window.patientDatabase !== 'undefined' && Array.isArray(window.patientDatabase)) {
            const idx = window.patientDatabase.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-340'));
            if (idx !== -1) {
                window.patientDatabase[idx] = Object.assign({}, window.patientDatabase[idx], caso26Q340);
            } else {
                window.patientDatabase.unshift(caso26Q340);
            }
            if (typeof window.patientMap !== 'undefined' && window.patientMap.set) {
                window.patientMap.set('26q-340', caso26Q340);
                window.patientMap.set('26q340', caso26Q340);
            }
        }

        // 2. Sincronización en localStorage
        try {
            const localRaw = localStorage.getItem('patientDatabaseLocal');
            let localArr = localRaw ? JSON.parse(localRaw) : [];
            const lIdx = localArr.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-340'));
            if (lIdx !== -1) {
                localArr[lIdx] = Object.assign({}, localArr[lIdx], caso26Q340);
            } else {
                localArr.unshift(caso26Q340);
            }
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(localArr));
            console.log("[Sync 26Q-340] LocalStorage actualizado con éxito.");
        } catch(e) {
            console.warn("[Sync 26Q-340] Advertencia en LocalStorage:", e);
        }

        // 3. Sincronización en IndexedDB (ClinicaReportesDB)
        if (typeof indexedDB !== 'undefined') {
            const req = indexedDB.open('ClinicaReportesDB', 2);
            req.onsuccess = function(ev) {
                const db = ev.target.result;
                if (db.objectStoreNames.contains('pacientes_completos')) {
                    const tx = db.transaction(['pacientes_completos'], 'readwrite');
                    const store = tx.objectStore('pacientes_completos');
                    store.put(caso26Q340, '26q-340');
                    store.put(caso26Q340, '26q340');
                    tx.oncomplete = function() {
                        console.log("[Sync 26Q-340] IndexedDB (pacientes_completos) actualizado con éxito.");
                    };
                }
            };
        }

        console.log("[Sync 26Q-340] CASO 26Q-340 INYECTADO: CORAL CRUZ, PRISILA (Completado y Firmado).");
    };

    if (typeof window !== 'undefined') {
        window.sincronizarCaso26Q340();
    }
})();
