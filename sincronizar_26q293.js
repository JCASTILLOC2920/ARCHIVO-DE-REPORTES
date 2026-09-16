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
        "apellidos": "CUZCANO  CHUMPITAZ",
        "paciente": "CUZCANO  CHUMPITAZ, PEDRO",
        "costo": 0.0,
        "adelanto": 0.0,
        "resta": 0.0,
        "fecRegistro": "2026-09-10",
        "fecEntrega": "2026-09-14",
        "pagado": true,
        "atrasado": false,
        "especimen": "PROSTATECTOMÍA RADICAL Y LINFADENECTOMÍA PÉLVICA BILATERAL",
        "macroDesc": "Frasco 1: Rotulado como «Linfadenectomía Ilíaca Derecha», recibido en formol. Consiste en tejido fibroadiposo pardo-amarillento de 4.5 x 3.2 x 1.8 cm. A los cortes seriados, se aíslan 10 formaciones nodulares linfoides, la mayor de 1.4 x 1.1 cm, firme y blanquecina. Se incluye la totalidad de la muestra en 4 casetes (1A al 1D).\n\nFrasco 2: Rotulado como «Linfadenectomía Ilíaca Izquierda», recibido en formol. Consiste en tejido fibroadiposo lobulado de 6.2 x 4.0 x 2.2 cm. A la disección minuciosa, se identifican y aíslan 18 nódulos linfáticos de consistencia elástica y firme, que miden entre 0.4 y 1.6 cm. Se incluye la totalidad de la muestra en 6 casetes (2A al 2F).\n\nFrasco 3: Rotulado como «Prostatectomía Radical con Vesículas Seminales», recibido en formol. Se recibe pieza quirúrgica correspondiente a glándula prostática íntegra de 38.8 g de peso, con medidas de 4.8 cm en su diámetro transversal, 4.2 cm en su diámetro craneocaudal y 3.5 cm en su diámetro anteroposterior. Anexa a la base, la vesícula seminal derecha mide 3.2 x 1.4 x 0.8 cm (deferente de 1.5 cm) y la vesícula seminal izquierda mide 3.0 x 1.3 x 0.7 cm (deferente de 1.4 cm).\n\nLa superficie externa capsular se encuentra íntegra, sin disrupciones mecánicas, orientada y marcada tridimensionalmente según protocolo pentacolor: tinta amarilla en la cara anterior, roja en caras lateral y posterior derechas, negra en cara posterior central, naranja en cara lateral izquierda y verde en los márgenes apical y de cuello vesical.\n\nA los cortes transversales seriados cada 3 mm a 4 mm, el parénquima prostático muestra una zona periférica firme, alternando con nodularidad hiperplásica de la zona de transición, sin tumor destructivo evidente macroscópicamente. Las vesículas seminales muestran engrosamiento indurado basal bilateral. Se incluye muestra representativa de ápex, cuello vesical, cuadrantes y vesículas seminales en 8 casetes (3A al 3H).",
        "microDesc": "Los cortes histológicos de la glándula prostática coloreados con hematoxilina-eosina muestran una proliferación epitelial maligna dispuesta en estructuras glandulares infiltrantes que comprometen bilateralmente ambos lóbulos prostáticos (zona periférica y de transición), ocupando aproximadamente entre el 30% y el 50% del volumen parenquimatoso.\n\nArquitectura tumoral: Predominio de patrón 4 de Gleason (60% del tumor), constituido por glándulas irregulares fusionadas y acinos cribiformes incipientes, intercalado con patrón 3 de Gleason (40%), formado por acinos pequeños bien definidos que infiltran el estroma fibromuscular. No se observa necrosis comedoniana ni componente de patrón 5 sólido. No se identifica carcinoma intraductal (IDC-P).\n\nInvasión y extensión local:\n- Se identifica franca invasión perineural (IPN) intraprostática.\n- Se identifica invasión linfovascular (ILV) con presencia de émbolos tumorales intravasculares en el estroma prostático.\n- La neoplasia se encuentra confinada periféricamente por la pseudocápsula prostática; no se identifica extensión tumoral a la grasa periprostática (EPE negativa).\n- El margen del cuello vesical se encuentra libre de neoplasia.\n- Ambas vesículas seminales muestran infiltración tumoral franca en su pared muscular propia (compromiso tumoral bilateral de vesículas seminales).\n\nMárgenes quirúrgicos:\n- Todos los márgenes de resección entintados (apical, cuello vesical, anteriores, laterales y posteriores) se encuentran libres de neoplasia invasora (Resección R0). Distancia mínima al margen entintado más próximo: 1.0 mm.\n\nLinfadenectomía regional:\n- Frasco 1 (Ilíacos derechos): Metástasis de adenocarcinoma acinar en 1 de 10 ganglios linfáticos aislados (1/10). Depósito metastásico mayor de 12 mm con extensión extranodal (ENE) presente en la grasa perinodal.\n- Frasco 2 (Ilíacos izquierdos): Metástasis de adenocarcinoma acinar en 5 de 18 ganglios linfáticos aislados (5/18). Depósito metastásico mayor de 14 mm con extensión extranodal (ENE) franca.",
        "diagnostico": "FRASCO 1: GANGLIOS LINFÁTICOS ILÍACOS DERECHOS, BIOPSIA POR LINFADENECTOMÍA:\n- METÁSTASIS DE ADENOCARCINOMA EN UNO DE DIEZ GANGLIOS LINFÁTICOS (1/10).\n- EXTENSIÓN EXTRANODAL (ENE): PRESENTE.\n- DEPÓSITO METASTÁSICO MAYOR: 12 mm.\n\nFRASCO 2: GANGLIOS LINFÁTICOS ILÍACOS IZQUIERDOS, BIOPSIA POR LINFADENECTOMÍA:\n- METÁSTASIS DE ADENOCARCINOMA EN CINCO DE DIECIOCHO GANGLIOS LINFÁTICOS (5/18).\n- EXTENSIÓN EXTRANODAL (ENE): PRESENTE.\n- DEPÓSITO METASTÁSICO MAYOR: 14 mm.\n\nFRASCO 3: PRÓSTATA Y VESÍCULAS SEMINALES, PROSTATECTOMÍA RADICAL:\n- ADENOCARCINOMA ACINAR PROSTÁTICO CONVENCIONAL.\n- SCORE DE GLEASON: 4 + 3 = 7.\n- GRUPO DE GRADO ISUP (OMS): GRUPO DE GRADO 3 (ISUP 3).\n- COMPROMISO TUMORAL: BILATERAL (30% A 50% DEL PARÉNQUIMA).\n- INVASIÓN DE VESÍCULAS SEMINALES: PRESENTE BILATERALMENTE (PARED MUSCULAR PROPIA).\n- EXTENSIÓN EXTRAPROSTÁTICA EN GRASA (EPE): NO IDENTIFICADA.\n- INVASIÓN PERINEURAL (IPN): PRESENTE.\n- INVASIÓN LINFOVASCULAR (ILV): PRESENTE.\n- MÁRGENES QUIRÚRGICOS DE RESECCIÓN: LIBRES DE NEOPLASIA (R0, DISTANCIA MÍNIMA: 1.0 mm).\n- HALLAZGOS ASOCIADOS: HIPERPLASIA NODULAR BENIGNA Y PROSTATITIS CRÓNICA INESPECÍFICA.\n\nESTADIFICACIÓN PATOLÓGICA AJCC 8.ª EDICIÓN / CAP:\npT3b  pN1 (6/28)  R0",
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

        console.log("✅ [Sync 26Q-293] CASO 26Q-293 INYECTADO: CUZCANO CHUMPITAZ, PEDRO (Completado y Firmado).");
    };

    // Auto-ejecución inmediata si el script se carga en el navegador
    if (typeof window !== 'undefined') {
        window.sincronizarCaso26Q293();
    }
})();
