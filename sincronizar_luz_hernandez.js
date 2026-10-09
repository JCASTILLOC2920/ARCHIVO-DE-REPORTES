// sincronizar_luz_hernandez.js
// Script auxiliar para inyección atómica y sincronización del caso 26Q-315 (Luz Hernández de la Cruz)
// en LocalStorage, IndexedDB (ClinicaReportesDB) y REAL_SUPABASE_PATIENTS.

(function() {
    const casoLuzHernandez = {
        "id": 18902,
        "service": "Q",
        "cod_atencion": "26Q-315",
        "dni": "21528689",
        "med_solicitante": "DR. DE TURNO",
        "nombres": "LUZ",
        "apellidos": "HERNÁNDEZ DE LA CRUZ",
        "paciente": "HERNÁNDEZ DE LA CRUZ, LUZ",
        "costo": 0.0,
        "adelanto": 0.0,
        "resta": 0.0,
        "fec_registro": "2026-10-07",
        "fec_entrega": "2026-10-12",
        "pagado": true,
        "atrasado": false,
        "especimen": "ÚTERO SIN ANEXOS (HISTERECTOMÍA TOTAL)",
        "macro_desc": "Se recibe pieza quirúrgica correspondiente a útero sin anexos que mide 10.5 x 7.0 x 4.5 cm. Superficie externa lisa, pardo-rojiza. Al corte, miometrio engrosado con múltiples nódulos blanquecinos bien delimitados, arremolinados, de consistencia firme, el mayor de 2.0 cm de diámetro. Endometrio de 0.2 cm de espesor. Cuello uterino con cérvix de superficie regular y múltiples quistes de Naboth.",
        "micro_desc": "1. MIOMETRIO:\n- Presencia de múltiples leiomiomas bien delimitados formados por haces entrelazados de músculo liso sin atipia.\n- Focos de adenomiosis uterina caracterizados por glándulas endometriales ectópicas rodeadas de estroma citogénico en el espesor del miometrio.\n\n2. CÉRVIX UTERINO:\n- Epitelio escamoso con hiperqueratosis y cambios inflamatorios crónicos difusos en el estroma (cervicitis crónica).\n- Presencia de quistes de Naboth tapizados por epitelio cilíndrico.\n\n3. ENDOMETRIO:\n- Endometrio en fase proliferativa o secretora según ciclo, sin atipia citológica ni signos de malignidad.",
        "diagnostico": "ÚTERO SIN ANEXOS, HISTERECTOMÍA TOTAL:\n- LEIOMIOMATOSIS UTERINA.\n- ADENOMIOSIS UTERINA DIFUSA.\n- CERVICITIS CRÓNICA INESPECÍFICA CON QUISTES DE NABOTH.\n- NEGATIVO PARA NEOPLASIA MALIGNA EN LAS MUESTRAS EXAMINADAS.",
        "edad": 55,
        "sexo": "FEMENINO",
        "casetes": 3,
        "f_contacto": "",
        "tel_contacto": "",
        "doctor": "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA",
        "motivo_estudio": "HISTERECTOMÍA POR MIOMATOSIS",
        "cat_macro": "9",
        "plan_macro": "996",
        "cat_micro": "",
        "plan_micro": "",
        "clinica": "CLÍNICA CARRIÓN",
        "firmado": true,
        "modificado": true,
        "estado": "Completado",
        "codAtencion": "26Q-315",
        "macroDesc": "Se recibe pieza quirúrgica correspondiente a útero sin anexos que mide 10.5 x 7.0 x 4.5 cm. Superficie externa lisa, pardo-rojiza. Al corte, miometrio engrosado con múltiples nódulos blanquecinos bien delimitados, arremolinados, de consistencia firme, el mayor de 2.0 cm de diámetro. Endometrio de 0.2 cm de espesor. Cuello uterino con cérvix de superficie regular y múltiples quistes de Naboth.",
        "microDesc": "1. MIOMETRIO:\n- Presencia de múltiples leiomiomas bien delimitados formados por haces entrelazados de músculo liso sin atipia.\n- Focos de adenomiosis uterina caracterizados por glándulas endometriales ectópicas rodeadas de estroma citogénico en el espesor del miometrio.\n\n2. CÉRVIX UTERINO:\n- Epitelio escamoso con hiperqueratosis y cambios inflamatorios crónicos difusos en el estroma (cervicitis crónica).\n- Presencia de quistes de Naboth tapizados por epitelio cilíndrico.\n\n3. ENDOMETRIO:\n- Endometrio en fase proliferativa o secretora según ciclo, sin atipia citológica ni signos de malignidad.",
        "medSolicitante": "DR. DE TURNO",
        "fecRegistro": "2026-10-07",
        "fecEntrega": "2026-10-12",
        "motivoEstudio": "HISTERECTOMÍA POR MIOMATOSIS",
        "telContacto": "",
        "fContacto": "",
        "catMacro": "9",
        "planMacro": "996",
        "catMicro": "",
        "planMicro": ""
    };

    window.sincronizarLuzHernandez = function() {
        console.log("[Sync 26Q-315] Iniciando inyección atómica para LUZ HERNÁNDEZ DE LA CRUZ...");
        
        // 1. Sincronización en REAL_SUPABASE_PATIENTS
        if (typeof window.REAL_SUPABASE_PATIENTS !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
            const idx = window.REAL_SUPABASE_PATIENTS.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-315'));
            if (idx !== -1) {
                window.REAL_SUPABASE_PATIENTS[idx] = Object.assign({}, window.REAL_SUPABASE_PATIENTS[idx], casoLuzHernandez);
            } else {
                window.REAL_SUPABASE_PATIENTS.unshift(casoLuzHernandez);
            }
        }

        // 2. Sincronización en RAM (patientDatabase y patientMap)
        if (typeof window.patientDatabase !== 'undefined' && Array.isArray(window.patientDatabase)) {
            const idx = window.patientDatabase.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-315'));
            if (idx !== -1) {
                window.patientDatabase[idx] = Object.assign({}, window.patientDatabase[idx], casoLuzHernandez);
            } else {
                window.patientDatabase.unshift(casoLuzHernandez);
            }
            if (typeof window.patientMap !== 'undefined' && window.patientMap.set) {
                window.patientMap.set('26q-315', casoLuzHernandez);
                window.patientMap.set('26q315', casoLuzHernandez);
            }
        }

        // 3. Sincronización en localStorage
        try {
            const localRaw = localStorage.getItem('patientDatabaseLocal');
            let localArr = localRaw ? JSON.parse(localRaw) : [];
            const lIdx = localArr.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-315'));
            if (lIdx !== -1) {
                localArr[lIdx] = Object.assign({}, localArr[lIdx], casoLuzHernandez);
            } else {
                localArr.unshift(casoLuzHernandez);
            }
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(localArr));
            console.log("[Sync 26Q-315] LocalStorage actualizado con éxito.");
        } catch(e) {
            console.warn("[Sync 26Q-315] Advertencia en LocalStorage:", e);
        }

        // 4. Sincronización en IndexedDB (ClinicaReportesDB)
        if (typeof indexedDB !== 'undefined') {
            const req = indexedDB.open('ClinicaReportesDB', 2);
            req.onsuccess = function(ev) {
                const db = ev.target.result;
                if (db.objectStoreNames.contains('pacientes_completos')) {
                    const tx = db.transaction(['pacientes_completos'], 'readwrite');
                    const store = tx.objectStore('pacientes_completos');
                    store.put(casoLuzHernandez, '26q-315');
                    store.put(casoLuzHernandez, '26q315');
                    tx.oncomplete = function() {
                        console.log("[Sync 26Q-315] IndexedDB (pacientes_completos) actualizado con éxito.");
                    };
                }
            };
        }

        console.log("[Sync 26Q-315] CASO 26Q-315 INYECTADO: HERNÁNDEZ DE LA CRUZ, LUZ (Completado y Firmado).");
    };

    if (typeof window !== 'undefined') {
        window.sincronizarLuzHernandez();
    }
})();
