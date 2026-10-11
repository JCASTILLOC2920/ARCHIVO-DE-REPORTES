// sincronizar_26q342.js
// Script auxiliar para inyección forzada y sincronización atómica del caso 26Q-342 (BUSTAMANTE, JUDITH ALEJANDRA)
// en LocalStorage e IndexedDB (ClinicaReportesDB) y respaldo maestro.

(function() {
    const caso26Q342 = {
        "id": 18927,
        "service": "Q",
        "cod_atencion": "26Q-342",
        "codAtencion": "26Q-342",
        "dni": "45156737",
        "med_solicitante": "DR. MARREROS",
        "medSolicitante": "DR. MARREROS",
        "nombres": "JUDITH ALEJANDRA",
        "apellidos": "BUSTAMANTE",
        "paciente": "BUSTAMANTE, JUDITH ALEJANDRA",
        "costo": 0.0,
        "adelanto": 0.0,
        "resta": 0.0,
        "fec_registro": "2026-10-10",
        "fecRegistro": "2026-10-10",
        "fec_entrega": "2026-10-17",
        "fecEntrega": "2026-10-17",
        "pagado": true,
        "atrasado": false,
        "modificado": false,
        "especimen": "BIOPSIA DE CÉRVIX",
        "macro_desc": "Se reciben tres (03) fragmentos tisulares parduzcos que miden entre 0.3 cm y 0.5 cm de diámetro mayor. Se incluye la totalidad de la muestra en una cápsula (1 casete).",
        "macroDesc": "Se reciben tres (03) fragmentos tisulares parduzcos que miden entre 0.3 cm y 0.5 cm de diámetro mayor. Se incluye la totalidad de la muestra en una cápsula (1 casete).",
        "micro_desc": "Los cortes histológicos de cérvix muestran epitelio escamoso estratificado con marcada pérdida de la polaridad celular y atipia nuclear que compromete prácticamente la totalidad del espesor epitelial (más de dos tercios a espesor completo). Se identifican núcleos hipercromáticos, pleomórficos, con cromatina densa y figuras mitóticas típicas y atípicas en estratos medio y superficial. El estroma fibrovascular subyacente es escaso, lo que limita una evaluación concluyente de invasión estromal en el presente material. No se observan nidos invasores francos en el plano visualizado.",
        "microDesc": "Los cortes histológicos de cérvix muestran epitelio escamoso estratificado con marcada pérdida de la polaridad celular y atipia nuclear que compromete prácticamente la totalidad del espesor epitelial (más de dos tercios a espesor completo). Se identifican núcleos hipercromáticos, pleomórficos, con cromatina densa y figuras mitóticas típicas y atípicas en estratos medio y superficial. El estroma fibrovascular subyacente es escaso, lo que limita una evaluación concluyente de invasión estromal en el presente material. No se observan nidos invasores francos en el plano visualizado.",
        "diagnostico": "CÉRVIX (BIOPSIA):\n- LESIÓN ESCAMOSA INTRAEPITELIAL DE ALTO GRADO (LEIAG / NIC 3).\n\nNOTA CLÍNICA Y RECOMENDACIÓN:\nEl volumen de estroma cervical evaluable en las biopsias es escaso, lo que limita descartar con certeza microinvasión estromal en el plano no muestreado. Dada la naturaleza focal de las biopsias punch, no se excluye lesión de mayor grado en la proximidad tisular adyacente. Conforme a las directrices de manejo del Consenso ASCCP (American Society for Colposcopy and Cervical Pathology) y la clasificación de la OMS, ante el diagnóstico histológico de LEIAG / NIC 3 se recomienda escisión diagnóstica-terapéutica (cono LEEP o conización con bisturí frío) y correlación colposcópica multidisciplinaria inmediata.\n\nREFERENCIAS (FORMATO APA):\n- Perkins, R. B., Guido, R. S., Castle, P. E., Chelmow, D., Einstein, M. H., Garcia, F., ... & Massad, L. S. (2020). 2019 ASCCP risk-based management consensus guidelines for abnormal cervical cancer screening tests and cancer precursors. Journal of Lower Genital Tract Disease, 24(2), 102-131. https://doi.org/10.1097/LGT.0000000000000525\n- World Health Organization. (2020). Female genital tumours: WHO classification of tumours (5th ed., Vol. 4). International Agency for Research on Cancer.",
        "edad": 38,
        "sexo": "FEMENINO",
        "casetes": 1,
        "tel_contacto": "45156737",
        "doctor": "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA",
        "clinica": "CLINICA CARRION",
        "procedencia": "CLINICA CARRION",
        "firmado": true,
        "estado": "Completado",
        "created_at": "2026-10-10T18:00:00.000000+00:00",
        "fec_informe": "2026-10-10",
        "fecInforme": "2026-10-10",
        "validado": true
    };

    window.sincronizarCaso26Q342 = function() {
        console.log("[Sync 26Q-342] Iniciando inyección atómica...");
        
        // 1. Sincronización en RAM (patientDatabase y patientMap)
        if (typeof window.patientDatabase !== 'undefined' && Array.isArray(window.patientDatabase)) {
            const idx = window.patientDatabase.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-342'));
            if (idx !== -1) {
                window.patientDatabase[idx] = Object.assign({}, window.patientDatabase[idx], caso26Q342);
            } else {
                window.patientDatabase.unshift(caso26Q342);
            }
            if (typeof window.patientMap !== 'undefined' && window.patientMap.set) {
                window.patientMap.set('26q-342', caso26Q342);
                window.patientMap.set('26q342', caso26Q342);
            }
        }

        // 2. Sincronización en LocalStorage
        try {
            const rawStored = localStorage.getItem('patients') || localStorage.getItem('patients_backup');
            let storedList = rawStored ? JSON.parse(rawStored) : [];
            if (Array.isArray(storedList)) {
                const sIdx = storedList.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-342'));
                if (sIdx !== -1) {
                    storedList[sIdx] = Object.assign({}, storedList[sIdx], caso26Q342);
                } else {
                    storedList.unshift(caso26Q342);
                }
                localStorage.setItem('patients', JSON.stringify(storedList));
                localStorage.setItem('patients_backup', JSON.stringify(storedList));
            }
            console.log("[Sync 26Q-342] Guardado en LocalStorage.");
        } catch (e) {
            console.warn("[Sync 26Q-342] Error guardando en LocalStorage:", e);
        }

        // 3. Sincronización en IndexedDB (ClinicaReportesDB)
        if (window.indexedDB) {
            const req = indexedDB.open('ClinicaReportesDB');
            req.onsuccess = function(e) {
                const db = e.target.result;
                if (db.objectStoreNames.contains('pacientes_completos')) {
                    const tx = db.transaction(['pacientes_completos'], 'readwrite');
                    const store = tx.objectStore('pacientes_completos');
                    store.put(caso26Q342);
                    console.log("[Sync 26Q-342] Inyectado en IndexedDB (pacientes_completos).");
                }
                if (db.objectStoreNames.contains('pacientes')) {
                    const tx2 = db.transaction(['pacientes'], 'readwrite');
                    const store2 = tx2.objectStore('pacientes');
                    store2.put(caso26Q342);
                    console.log("[Sync 26Q-342] Inyectado en IndexedDB (pacientes).");
                }
            };
        }

        // 4. Refrescar interfaz si está cargada
        if (typeof window.refreshPatientTable === 'function') {
            window.refreshPatientTable();
        } else if (typeof window.applyFilters === 'function') {
            window.applyFilters(false);
        }

        console.log("[Sync 26Q-342] Inyección atómica completada.");
    };

    // Auto-ejecución si el entorno ya está inicializado
    if (typeof window !== 'undefined' && document.readyState === 'complete') {
        window.sincronizarCaso26Q342();
    } else if (typeof window !== 'undefined') {
        window.addEventListener('load', window.sincronizarCaso26Q342);
    }
})();
