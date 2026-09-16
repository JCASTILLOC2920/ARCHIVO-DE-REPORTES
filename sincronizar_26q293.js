// sincronizar_26q293.js
// Script auxiliar para inyección forzada y sincronización atómica del caso 26Q-293
// en LocalStorage e IndexedDB (ClinicaReportesDB).

(function() {
    const caso26Q293 = {
        "id": 18878,
        "service": "Q",
        "codAtencion": "26Q-293",
        "dni": "0",
        "medSolicitante": "DR. FLORES SIERRA, BRYAN",
        "nombres": "PEDRO",
        "apellidos": "CUZCANO CHUMPITAZ",
        "paciente": "CUZCANO CHUMPITAZ, PEDRO",
        "costo": 0.0,
        "adelanto": 0.0,
        "resta": 0.0,
        "fecRegistro": "2026-09-10",
        "fecEntrega": "2026-09-14",
        "pagado": true,
        "atrasado": false,
        "especimen": "PROSTATECTOMÍA RADICAL Y LINFADENECTOMÍA PÉLVICA BILATERAL",
        "macroDesc": "1. FRASCO 1 (LINFADENECTOMÍA ILÍACA DERECHA):\nSe recibe en formol espécimen rotulado como Linfadenectomía Ilíaca Derecha. Consiste en tejido fibroadiposo pardo-amarillento de 4.5 x 3.2 x 1.8 cm. A los cortes seriados, se aíslan 10 nódulos linfoides, el mayor de 1.4 x 1.1 cm, de consistencia firme y superficie de corte blanquecina. Se incluye la totalidad de la muestra en 4 casetes (1A al 1D).\n\n2. FRASCO 2 (LINFADENECTOMÍA ILÍACA IZQUIERDA):\nSe recibe en formol espécimen rotulado como Linfadenectomía Ilíaca Izquierda. Consiste en tejido fibroadiposo lobulado de 6.2 x 4.0 x 2.2 cm. A la disección minuciosa, se aíslan 18 ganglios linfáticos de diámetros entre 0.4 y 1.6 cm, de consistencia elástica y firme. Se incluye la totalidad de la muestra en 6 casetes (2A al 2F).\n\n3. FRASCO 3 (PROSTATECTOMÍA RADICAL CON VESÍCULAS SEMINALES):\nSe recibe pieza quirúrgica correspondiente a glándula prostática íntegra de 38.8 g de peso, con medidas de 4.8 cm (diámetro transversal), 4.2 cm (diámetro craneocaudal) y 3.5 cm (diámetro anteroposterior). Anexas a la base, la vesícula seminal derecha mide 3.2 x 1.4 x 0.8 cm (conducto deferente de 1.5 cm) y la vesícula seminal izquierda mide 3.0 x 1.3 x 0.7 cm (conducto deferente de 1.4 cm).\nEntintado tridimensional de superficies quirúrgicas según protocolo pentacolor estandarizado: cara anterior en amarillo, caras lateral y posterior derechas en rojo, cara posterior central en negro, cara lateral izquierda en naranja, y márgenes apical y de cuello vesical en verde.\nA los cortes transversales seriados cada 3 mm a 4 mm, el parénquima prostático muestra consistencia firme en zona periférica, con nodularidad hiperplásica en zona de transición, sin masa destructiva macroscópica evidente. Ambas vesículas seminales exhiben engrosamiento indurado basal bilateral. Se incluye muestra representativa de ápex, cuello vesical, cuadrantes y vesículas seminales en 8 casetes (3A al 3H).",
        "microDesc": "1. HISTOMORFOLOGÍA TUMORAL:\n- Tipo histológico: Adenocarcinoma acinar prostático convencional.\n- Distribución y volumen: Infiltración neoplásica bilateral que compromete ambos lóbulos prostáticos (zona periférica y zona de transición), ocupando entre el 30% y el 50% del parénquima glandular total.\n- Arquitectura y gradación de Gleason: Predominio de patrón 4 de Gleason (60% de la neoplasia), constituido por glándulas irregulares fusionadas y acinos cribiformes incipientes, intercalado con patrón 3 de Gleason (40%), formado por glándulas pequeñas individuales bien diferenciadas que infiltran el estroma fibromuscular.\n- Atipia citológica: Marcado agrandamiento nuclear con nucléolos prominentes e hipercromatismo. Ausencia de necrosis de tipo comedoniano y ausencia de patrón 5 sólido. No se identifica carcinoma intraductal de próstata (IDC-P).\n\n2. INVASIÓN PERINEURAL, LINFOVASCULAR Y EXTENSIÓN LOCAL:\n- Invasión perineural (IPN): Presente (franca y múltiple infiltración neoplásica en espacios perineurales intraprostáticos).\n- Invasión linfovascular (ILV): Presente (identificación de émbolos neoplásicos en luces vasculares del estroma prostático).\n- Extensión extraprostática (EPE): No identificada; neoplasia confinada por la pseudocápsula prostática (EPE negativa).\n- Cuello vesical: Margen de cuello vesical libre de infiltración neoplásica.\n- Vesículas seminales: Infiltración tumoral directa transmural en la pared muscular propia de ambas vesículas seminales (compromiso tumoral bilateral, pT3b).\n\n3. MÁRGENES QUIRÚRGICOS DE RESECCIÓN:\n- Todos los márgenes de resección entintados (apical, cuello vesical, anterior, laterales y posteriores) se encuentran libres de neoplasia invasora (Resección quirúrgica completa R0).\n- Distancia mínima del carcinoma invasor al margen entintado más próximo: 1.0 mm.\n\n4. COMPROMISO GANGLIONAR REGIONAL (LINFADENECTOMÍA PÉLVICA BILATERAL):\n- Frasco 1 (Linfadenectomía ilíaca derecha): Metástasis de adenocarcinoma acinar en 1 de 10 ganglios linfáticos aislados (1/10). Depósito metastásico mayor de 12 mm con extensión extranodal (ENE) presente en grasa perinodal.\n- Frasco 2 (Linfadenectomía ilíaca izquierda): Metástasis de adenocarcinoma acinar en 5 de 18 ganglios linfáticos aislados (5/18). Depósito metastásico mayor de 14 mm con extensión extranodal (ENE) franca en tejido fibroadiposo perinodal.\n- Balance global ganglionar: Metástasis en 6 de 28 ganglios linfáticos regionales examinados (6/28).",
        "diagnostico": "I. FRASCO 1: GANGLIOS LINFÁTICOS ILÍACOS DERECHOS, LINFADENECTOMÍA:\n- METÁSTASIS DE ADENOCARCINOMA EN UNO DE DIEZ GANGLIOS LINFÁTICOS (1/10).\n- DEPÓSITO METASTÁSICO MAYOR: 12 mm.\n- EXTENSIÓN EXTRANODAL (ENE): PRESENTE.\n\nII. FRASCO 2: GANGLIOS LINFÁTICOS ILÍACOS IZQUIERDOS, LINFADENECTOMÍA:\n- METÁSTASIS DE ADENOCARCINOMA EN CINCO DE DIECIOCHO GANGLIOS LINFÁTICOS (5/18).\n- DEPÓSITO METASTÁSICO MAYOR: 14 mm.\n- EXTENSIÓN EXTRANODAL (ENE): PRESENTE.\n\nIII. FRASCO 3: PRÓSTATA Y VESÍCULAS SEMINALES, PROSTATECTOMÍA RADICAL:\n- ADENOCARCINOMA ACINAR PROSTÁTICO CONVENCIONAL.\n- SCORE DE GLEASON: 4 + 3 = 7 (PATRÓN 4: 60%, PATRÓN 3: 40%).\n- GRUPO DE GRADO HISTOLÓGICO OMS / ISUP: GRUPO 3 (ISUP 3).\n- COMPROMISO TUMORAL: BILATERAL (30% A 50% DEL PARÉNQUIMA GLANDULAR).\n- EXTENSIÓN EXTRAPROSTÁTICA EN GRASA (EPE): NO IDENTIFICADA (CONFINADO).\n- INVASIÓN DE VESÍCULAS SEMINALES: PRESENTE BILATERALMENTE (MUSCULAR PROPIA).\n- INVASIÓN PERINEURAL (IPN): PRESENTE.\n- INVASIÓN LINFOVASCULAR (ILV): PRESENTE.\n- MÁRGENES QUIRÚRGICOS DE RESECCIÓN: LIBRES DE NEOPLASIA (R0, DISTANCIA MÍNIMA: 1.0 mm).\n- HALLAZGOS BENIGNOS ASOCIADOS: HIPERPLASIA NODULAR BENIGNA Y PROSTATITIS CRÓNICA.\n\nIV. RESUMEN SINÓPTICO Y ESTADIFICACIÓN PATOLÓGICA (CAP / AJCC 8va EDICIÓN):\n- PROCEDIMIENTO: PROSTATECTOMÍA RADICAL Y LINFADENECTOMÍA PÉLVICA BILATERAL.\n- ESTADIFICACIÓN PATOLÓGICA pTNM (AJCC 8va EDICIÓN):\n  * TUMOR PRIMARIO (pT): pT3b (INVASIÓN TUMORAL BILATERAL DE VESÍCULAS SEMINALES).\n  * GANGLIOS LINFÁTICOS REGIONALES (pN): pN1 (6 DE 28 GANGLIOS METASTÁSICOS CON ENE+).\n  * ESTADO DE LOS MÁRGENES QUIRÚRGICOS: R0 (MÁRGENES NEGATIVOS, LIBRES DE NEOPLASIA).\n  * CLASIFICACIÓN FINAL DEFINITIVA: pT3b pN1 (6/28) R0.",
        "edad": 66,
        "sexo": "MASCULINO",
        "casetes": 18,
        "fContacto": "",
        "telContacto": "PROSTATECTOMÍA RADICAL",
        "doctor": "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA",
        "motivoEstudio": "SE RECIBEN 3 FRASCOS: ILIO-OBTURATRIZ DERECHO, ILIO-OBTURATRIZ IZQUIERDO Y PRÓSTATA CON VESÍCULAS SEMINALES",
        "catMacro": "9",
        "planMacro": "996",
        "catMicro": "",
        "planMicro": "",
        "clinica": "CLÍNICA SAN CLEMENTE",
        "firmado": true,
        "modificado": true,
        "estado": "Completado"
};

    window.sincronizarCaso26Q293 = function() {
        console.log("[Sync 26Q-293] Iniciando inyección atómica...");
        
        // 1. Sincronización en RAM (patientDatabase y patientMap)
        if (typeof window.patientDatabase !== 'undefined' && Array.isArray(window.patientDatabase)) {
            const idx = window.patientDatabase.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-293'));
            if (idx !== -1) {
                window.patientDatabase[idx] = Object.assign({}, window.patientDatabase[idx], caso26Q293);
            } else {
                window.patientDatabase.unshift(caso26Q293);
            }
            if (typeof window.patientMap !== 'undefined' && window.patientMap.set) {
                window.patientMap.set('26q-293', caso26Q293);
                window.patientMap.set('26q293', caso26Q293);
            }
        }

        // 2. Sincronización en localStorage
        try {
            const localRaw = localStorage.getItem('patientDatabaseLocal');
            let localArr = localRaw ? JSON.parse(localRaw) : [];
            const lIdx = localArr.findIndex(p => (p.codAtencion || p.cod_atencion || '').toLowerCase().includes('26q-293'));
            if (lIdx !== -1) {
                localArr[lIdx] = Object.assign({}, localArr[lIdx], caso26Q293);
            } else {
                localArr.unshift(caso26Q293);
            }
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(localArr));
            console.log("[Sync 26Q-293] LocalStorage actualizado con éxito.");
        } catch(e) {
            console.warn("[Sync 26Q-293] Advertencia en LocalStorage:", e);
        }

        // 3. Sincronización en IndexedDB (ClinicaReportesDB)
        if (typeof indexedDB !== 'undefined') {
            const req = indexedDB.open('ClinicaReportesDB', 2);
            req.onsuccess = function(ev) {
                const db = ev.target.result;
                if (db.objectStoreNames.contains('pacientes_completos')) {
                    const tx = db.transaction(['pacientes_completos'], 'readwrite');
                    const store = tx.objectStore('pacientes_completos');
                    store.put(caso26Q293, '26q-293');
                    store.put(caso26Q293, '26q293');
                    tx.oncomplete = function() {
                        console.log("[Sync 26Q-293] IndexedDB (pacientes_completos) actualizado con éxito.");
                    };
                }
            };
        }

        console.log("[Sync 26Q-293] CASO 26Q-293 INYECTADO: CUZCANO CHUMPITAZ, PEDRO (Completado y Firmado).");
    };

    // Auto-ejecución inmediata si el script se carga en el navegador
    if (typeof window !== 'undefined') {
        window.sincronizarCaso26Q293();
    }
})();
