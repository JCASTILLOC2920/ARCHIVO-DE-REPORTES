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
        "macroDesc": "FRASCO 1: LINFADENECTOMÍA ILIO-OBTURATRIZ DERECHA\nSe recibe en formol espécimen rotulado como «Linfadenectomía Ilíaca Derecha», consistente en tejido fibroadiposo pardo-amarillento que mide 4.5 x 3.2 x 1.8 cm. A la disección meticulosa y cortes seriados, se aíslan DIEZ (10) formaciones nodulares de aspecto linfoide, la mayor de 1.4 x 1.1 cm, blanquecina, firme y con pérdida de la arquitectura córtico-medular habitual. Se incluye la totalidad en 4 casetes (Casetes 1A al 1D).\n\nFRASCO 2: LINFADENECTOMÍA ILIO-OBTURATRIZ IZQUIERDA\nSe recibe en formol espécimen rotulado como «Linfadenectomía Ilíaca Izquierda», consistente en tejido fibroadiposo lobulado de 6.2 x 4.0 x 2.2 cm. A la disección minuciosa y cortes seriados, se identifican y aíslan DIECIOCHO (18) formaciones linfoides con dimensiones que oscilan entre 0.4 y 1.6 cm, varias de ellas con induración blanquecina pétrea. Se incluye la totalidad en 6 casetes (Casetes 2A al 2F).\n\nFRASCO 3: PROSTATECTOMÍA RADICAL CON VESÍCULAS SEMINALES Y CONDUCTOS DEFERENTES\nSe recibe pieza quirúrgica correspondiente a próstata íntegra acompañada de vesículas seminales y conductos deferentes anexos, con un peso calculado de 38.8 g. La glándula prostática mide 4.8 cm en su eje transversal (ancho), 4.2 cm en su eje craneocaudal (longitud base-ápice) y 3.5 cm en su eje anteroposterior (espesor), para un volumen elipsoidal de 70.56 cm³.\nAnexa a la base, la vesícula seminal derecha mide 3.2 x 1.4 x 0.8 cm, con conducto deferente de 1.5 cm. La vesícula seminal izquierda mide 3.0 x 1.3 x 0.7 cm, con conducto deferente de 1.4 cm.\n\nLa superficie externa capsular se encuentra íntegra, orientada y marcada tridimensionalmente según protocolo Pentacolor de Susan Lester:\n- Tinta amarilla: Cara anterior (estroma fibromuscular anterior).\n- Tinta roja: Caras lateral y posterior derechas.\n- Tinta negra: Cara posterior central.\n- Tinta naranja: Cara lateral izquierda.\n- Tinta verde: Margen apical (uretral distal) y margen de cuello vesical (proximal).\n\nSe resecan y procesan de forma independiente los márgenes apical (cono sagital) y de cuello vesical (cortes sagitales seriados). A los cortes transversales seriados del cuerpo prostático cada 3 a 4 mm, el parénquima muestra una zona periférica firme, alternando con nodularidad hiperplásica difusa en la zona de transición, sin lesión tumoral nodular destructiva macroscópicamente individualizable. Las vesículas seminales muestran engrosamiento indurado basal bilateral. Se incluye muestra representativa total en 8 casetes (Casetes 3A al 3H).",
        "microDesc": "Los cortes histológicos de la glándula prostática revelan una proliferación epitelial maligna de estirpe glandular dispuesta en acinos infiltrantes que compromete de forma bilateral ambos lóbulos prostáticos (zona periférica y zona de transición), abarcando aproximadamente entre el 30% y el 50% del volumen parenquimatoso total.\n\nLa arquitectura tumoral está constituida predominantemente por patrón 4 de Gleason (55% a 65% de la neoplasia), caracterizado por glándulas irregulares fusionadas, acinos mal formados con luces cribosas incipientes y nidos cribiformes no definidos, intercalados con un componente secundario correspondiente a patrón 3 de Gleason (35% a 45%), representado por acinos pequeños a medianos bien individualizados que infiltran libremente el estroma interglandular. No se identifican áreas de necrosis comedoniana ni patrón 5 sólido o de células sueltas. No se identifica carcinoma intraductal de próstata (IDC-P).\n\nSe identifica franca invasión perineural (IPN) intraglandular. Se constata invasión linfovascular (ILV) con presencia de émbolos tumorales intravasculares en capilares del estroma prostático.\n\nA nivel de la extensión tumoral:\n- La neoplasia se encuentra confinada periféricamente por la pseudocápsula prostática; no se identifica extensión extraprostática (EPE) hacia el tejido adiposo periprostático anterior, lateral ni posterior.\n- El margen del cuello vesical se encuentra libre de infiltración neoplásica.\n- Invasión de Vesículas Seminales (SVI): Se evidencia infiltración tumoral franca por adenocarcinoma acinar en la pared muscular propia (muscularis propria) de AMBAS vesículas seminales (bilateral), hallazgo histopatológico que define compromiso pT3b.\n\nMárgenes Quirúrgicos:\n- Todos los márgenes de resección quirúrgicos entintados (apical uretral, cuello vesical, anteriores, posterolaterales y posteriores) se encuentran libres de neoplasia invasora (Resección R0).\n- La distancia mínima entre el carcinoma invasor y el margen entintado más próximo es de 1.0 mm (a nivel posterolateral).\n\nEstudio de Ganglios Linfáticos (Linfadenectomía Pélvica Bilateral):\n- Frasco 1 (Ilíacos derechos): Metástasis de adenocarcinoma acinar en UNO de diez ganglios linfáticos aislados (1/10). El ganglio comprometido muestra un depósito tumoral metastásico mayor de 12 mm (macrometástasis), con EXTENSIÓN EXTRANODAL (ENE) presente, infiltrando la grasa perinodal.\n- Frasco 2 (Ilíacos izquierdos): Metástasis de adenocarcinoma acinar en CINCO de dieciocho ganglios linfáticos aislados (5/18). El mayor depósito metastásico supera 14 mm, con EXTENSIÓN EXTRANODAL (ENE) franca y desmoplasia estromal asociada.\n- Total ganglionar: Compromiso metastásico en SEIS de veintiocho ganglios regionales (6/28) con ENE(+).",
        "diagnostico": "PIEZA DE PROSTATECTOMÍA RADICAL Y LINFADENECTOMÍA PÉLVICA BILATERAL:\n\n1. ADENOCARCINOMA ACINAR PROSTÁTICO CONVENCIONAL.\n   - SCORE DE GLEASON: 4 + 3 = 7.\n   - GRUPO DE GRADO ISUP (2014 / 2022): GRUPO DE GRADO 3 (ISUP GRADE GROUP 3).\n   - COMPONENTE DE PATRÓN 4: 55% - 65% (PREDOMINANTE).\n   - PATRÓN CRIBIFORME: NO IDENTIFICADO.\n   - CARCINOMA INTRADUCTAL (IDC-P): NO IDENTIFICADO.\n\n2. EXTENSIÓN Y TOPOGRAFÍA:\n   - COMPROMISO TUMORAL: BILATERAL (LÓBULOS DERECHO E IZQUIERDO).\n   - VOLUMEN ESTIMADO DEL COMPROMISO: 30% A 50% DEL PARÉNQUIMA GLANDULAR.\n   - EXTENSIÓN EXTRAPROSTÁTICA EN GRASA PERIPROSTÁTICA (EPE): NO IDENTIFICADA.\n   - INVASIÓN DE CUELLO VESICAL: NO IDENTIFICADA.\n   - INVASIÓN DE VESÍCULAS SEMINALES: PRESENTE, BILATERAL (INFILTRACIÓN DE PARED MUSCULAR PROPIA).\n\n3. FACTORES HISTOPRONÓSTICOS:\n   - INVASIÓN PERINEURAL (IPN): IDENTIFICADA / PRESENTE.\n   - INVASIÓN LINFOVASCULAR (ILV): IDENTIFICADA / PRESENTE.\n\n4. MÁRGENES QUIRÚRGICOS DE RESECCIÓN:\n   - MÁRGENES QUIRÚRGICOS TOTALES LIBRES DE NEOPLASIA (ESTADO R0).\n   - DISTANCIA MÍNIMA AL MARGEN ENTINTADO MÁS PRÓXIMO: 1.0 mm (CARA POSTEROLATERAL).\n\n5. GANGLIOS LINFÁTICOS REGIONALES:\n   - METÁSTASIS DE ADENOCARCINOMA EN SEIS DE VEINTIOCHO GANGLIOS LINFÁTICOS REGIONALES (6/28):\n     * ILÍACOS DERECHOS: 1 GANGLIO POSITIVO DE 10 EXAMINADOS (1/10).\n     * ILÍACOS IZQUIERDOS: 5 GANGLIOS POSITIVOS DE 18 EXAMINADOS (5/18).\n   - EXTENSIÓN EXTRANODAL / EXTRAGANGLIONAR (ENE): PRESENTE BILATERALMENTE.\n   - DIMENSIÓN DEL DEPÓSITO METASTÁSICO MAYOR: > 10 mm (14 mm).\n\n6. PARÉNQUIMA PROSTÁTICO NO NEOPLÁSICO:\n   - HIPERPLASIA NODULAR BENIGNA (HPB) Y PROSTATITIS CRÓNICA LINFOCITARIA INESPECÍFICA.\n\n================================================================================\nESTADIFICACIÓN PATOLÓGICA PROTOCOLIZADA pTNM (AJCC 8.ª EDICIÓN / CAP v4.2.0.0):\n  * CATEGORÍA DEL TUMOR PRIMARIO (pT):  pT3b (Invasión tumoral de vesículas seminales bilateral)\n  * GANGLIOS LINFÁTICOS REGIONALES (pN): pN1  (Metástasis en 6 de 28 ganglios con ENE presente)\n  * ESTADO DE RESECCIÓN RESIDUAL (R):    R0   (Márgenes quirúrgicos microscópicamente negativos)\n================================================================================",
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
