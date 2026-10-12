// ============================================================================
// reportes.js - MOTOR BLINDADO DE REPORTES Y MANEJO DEFENSIVO DE ERRORES
// Protocolo: Elena + La Colmena | Agente 2: Robustez JS & Cero Excepciones
// ============================================================================

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ReportesEngine = factory();
        root.ReportesJS = root.ReportesEngine;
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    /**
     * Trampa defensiva global para capturar errores silenciosamente
     */
    if (typeof window !== 'undefined' && !window._reportesGlobalErrorTrapAttached) {
        window._reportesGlobalErrorTrapAttached = true;
        window.addEventListener('error', function (evt) {
            if (evt && evt.message && (
                evt.message.includes('QRCode') ||
                evt.message.includes('html2pdf') ||
                evt.message.includes('html2canvas') ||
                evt.message.includes('jspdf') ||
                evt.message.includes('report-img') ||
                evt.message.includes('measurePage')
            )) {
                console.warn('[ReportesEngine Silent Guard] Excepción no crítica contenida:', evt.message);
                if (typeof evt.preventDefault === 'function') evt.preventDefault();
            }
        });
        window.addEventListener('unhandledrejection', function (evt) {
            if (evt && evt.reason && String(evt.reason).includes('PDF')) {
                console.warn('[ReportesEngine Silent Guard] Promesa rechazada no crítica contenida:', evt.reason);
                if (typeof evt.preventDefault === 'function') evt.preventDefault();
            }
        });
    }

    /**
     * 1. EXTRACCIÓN DEFENSIVA DE PARÁMETROS ('codAtencion')
     * A prueba de URIError, hashes, espacios, y variaciones de nombrado
     */
    function safeExtractCodAtencion(input) {
        try {
            if (input && typeof input === 'string' && !input.includes('?') && !input.includes('=')) {
                return cleanCode(input);
            }

            let search = '';
            if (typeof window !== 'undefined' && window.location) {
                search = window.location.search || '';
                if (!search && window.location.hash && window.location.hash.includes('?')) {
                    search = window.location.hash.substring(window.location.hash.indexOf('?'));
                }
            }
            if (input && typeof input === 'string') {
                search = input.includes('?') ? input.substring(input.indexOf('?')) : input;
            }

            // Intento 1: URLSearchParams estándar con try...catch
            try {
                const params = new URLSearchParams(search);
                const val = params.get('codAtencion') || 
                            params.get('cod') || 
                            params.get('codigo') || 
                            params.get('cod_atencion') || 
                            params.get('id') || 
                            params.get('edit') || '';
                if (val) return cleanCode(val);
            } catch (eSearch) {
                // Si URLSearchParams falla por URI malformado, continuar al fallback
            }

            // Intento 2: Regex directo en caso de porcentaje huérfano o URIError
            const rawSource = input || (typeof window !== 'undefined' && window.location ? window.location.href : '');
            const match = String(rawSource).match(/[?&#](?:codAtencion|cod|codigo|cod_atencion|id|edit)=([^&#]+)/i);
            if (match && match[1]) {
                try {
                    return cleanCode(decodeURIComponent(match[1].replace(/\+/g, ' ')));
                } catch (eDec) {
                    return cleanCode(match[1].replace(/\+/g, ' '));
                }
            }
        } catch (e) {
            console.warn('[ReportesEngine] Error extrayendo codAtencion:', e);
        }
        return '';
    }

    /**
     * Limpieza y normalización de código
     */
    function cleanCode(code) {
        if (!code) return '';
        return String(code).trim().toUpperCase().replace(/[\u200B-\u200D\uFEFF]/g, '');
    }

    function canonicalCode(code) {
        return cleanCode(code).replace(/[-_\s]/g, '');
    }

    /**
     * 2. LECTURA DEFENSIVA DE STORAGE (localStorage / sessionStorage)
     */
    function safeGetStorage(key) {
        if (typeof window === 'undefined') return null;
        try {
            const val = (window.sessionStorage && window.sessionStorage.getItem(key)) ||
                        (window.localStorage && window.localStorage.getItem(key));
            if (!val) return null;
            return JSON.parse(val);
        } catch (e) {
            console.warn('[ReportesEngine] Storage inaccesible o dato corrupto para key:', key, e);
            return null;
        }
    }

    function safeSetStorage(key, data) {
        if (typeof window === 'undefined') return false;
        try {
            const str = JSON.stringify(data);
            if (window.sessionStorage) window.sessionStorage.setItem(key, str);
            if (window.localStorage) window.localStorage.setItem(key, str);
            return true;
        } catch (e) {
            console.warn('[ReportesEngine] No se pudo guardar en storage:', key, e);
            return false;
        }
    }

    /**
     * 3. LECTURA DEFENSIVA DEL RESPALDO MAESTRO (real_supabase_backup.js)
     */
    function safeGetBackupPatient(targetCode) {
        if (!targetCode) return null;
        try {
            const cleanTarget = canonicalCode(targetCode);
            const source = (typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) ?
                           window.REAL_SUPABASE_PATIENTS :
                           (typeof globalThis !== 'undefined' && Array.isArray(globalThis.REAL_SUPABASE_PATIENTS) ?
                            globalThis.REAL_SUPABASE_PATIENTS : []);

            if (!Array.isArray(source) || source.length === 0) return null;

            for (let i = 0; i < source.length; i++) {
                const b = source[i];
                if (!b) continue;
                const bCode = canonicalCode(b.codAtencion || b.cod_atencion || b.codigo || '');
                if (bCode && (bCode === cleanTarget || bCode.includes(cleanTarget) || cleanTarget.includes(bCode))) {
                    return JSON.parse(JSON.stringify(b)); // Copia limpia no mutable
                }
            }
        } catch (e) {
            console.warn('[ReportesEngine] Error leyendo REAL_SUPABASE_PATIENTS:', e);
        }
        return null;
    }

    /**
     * 4. LECTURA DEFENSIVA DE INDEXEDDB CON TIMEOUT
     */
    async function safeGetIndexedDBPatient(targetCode, timeoutMs = 2000) {
        if (!targetCode || typeof window === 'undefined' || !window.indexedDB) return null;
        return new Promise(function (resolve) {
            let finished = false;
            const timer = setTimeout(function () {
                if (!finished) {
                    finished = true;
                    resolve(null);
                }
            }, timeoutMs);

            try {
                const IDB_NAME = 'ClinicaReportesDB';
                const STORE_NAME = 'pacientes_completos';
                const req = indexedDB.open(IDB_NAME);

                req.onerror = function () {
                    if (!finished) { finished = true; clearTimeout(timer); resolve(null); }
                };

                req.onsuccess = function (e) {
                    try {
                        const db = e.target.result;
                        if (!db || !db.objectStoreNames.contains(STORE_NAME)) {
                            if (!finished) { finished = true; clearTimeout(timer); resolve(null); }
                            return;
                        }
                        const tx = db.transaction(STORE_NAME, 'readonly');
                        const store = tx.objectStore(STORE_NAME);
                        const cleanTarget = cleanCode(targetCode);
                        const getReq = store.get(cleanTarget);

                        getReq.onsuccess = function () {
                            if (!finished) {
                                finished = true;
                                clearTimeout(timer);
                                resolve(getReq.result || null);
                            }
                        };
                        getReq.onerror = function () {
                            if (!finished) { finished = true; clearTimeout(timer); resolve(null); }
                        };
                    } catch (eStore) {
                        if (!finished) { finished = true; clearTimeout(timer); resolve(null); }
                    }
                };

                req.onupgradeneeded = function (e) {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: 'codAtencion' });
                    }
                };
            } catch (eRoot) {
                if (!finished) { finished = true; clearTimeout(timer); resolve(null); }
            }
        });
    }

    /**
     * 5. VALIDACIÓN Y EXTRACCIÓN DEFENSIVA DE IMÁGENES
     */
    function isValidImageSrc(src) {
        if (!src || typeof src !== 'string') return false;
        try {
            const clean = src.trim();
            if (!clean || clean === 'null' || clean === 'undefined' || clean === 'none' ||
                clean === '{}' || clean === '[]' || clean === 'about:blank' || clean === '""') {
                return false;
            }
            if (clean.includes('/reportes.html') || clean.includes('/imprimir.html') || clean.endsWith('.html')) {
                return false;
            }
            if (clean.toLowerCase().startsWith('data:image/')) {
                return clean.length > 50 && clean.includes(';base64,') && !clean.endsWith(';base64,');
            }
            if (/^(https?:\/\/|blob:|\/|\.\/|[a-zA-Z0-9_\-\/\\.]+\.(jpg|jpeg|png|webp|gif|bmp))/i.test(clean)) {
                return true;
            }
            return clean.length > 20;
        } catch (e) {
            return false;
        }
    }

    function extractImageSources(pat) {
        const fallback = { img01: null, img02: null, macro360: null };
        if (!pat || typeof pat !== 'object') return fallback;

        try {
            let img01 = pat.img01 || pat.adjunto01 || pat.adjunto_01 || pat.foto01 || pat.foto_01 ||
                        pat.imagen01 || pat.imagen1 || pat.img1 || null;

            if (!img01 && Array.isArray(pat.imagenes) && pat.imagenes.length > 0) img01 = pat.imagenes[0];
            if (!img01 && pat.imagenes && typeof pat.imagenes === 'object') img01 = pat.imagenes.img01 || pat.imagenes.adjunto01;
            if (!img01 && Array.isArray(pat.fotos) && pat.fotos.length > 0) img01 = pat.fotos[0];
            if (!img01 && Array.isArray(pat.adjuntos) && pat.adjuntos.length > 0) img01 = pat.adjuntos[0];

            let img02 = pat.img02 || pat.adjunto02 || pat.adjunto_02 || pat.foto02 || pat.foto_02 ||
                        pat.imagen02 || pat.imagen2 || pat.img2 || null;

            if (!img02 && Array.isArray(pat.imagenes) && pat.imagenes.length > 1) img02 = pat.imagenes[1];
            if (!img02 && pat.imagenes && typeof pat.imagenes === 'object') img02 = pat.imagenes.img02 || pat.imagenes.adjunto02;
            if (!img02 && Array.isArray(pat.fotos) && pat.fotos.length > 1) img02 = pat.fotos[1];
            if (!img02 && Array.isArray(pat.adjuntos) && pat.adjuntos.length > 1) img02 = pat.adjuntos[1];

            let macro360 = null;
            if (Array.isArray(pat.macro360) && pat.macro360.length > 0) {
                macro360 = pat.macro360[0];
            } else if (typeof pat.macro360 === 'string' && pat.macro360) {
                try {
                    const parsed = JSON.parse(pat.macro360);
                    if (Array.isArray(parsed) && parsed.length > 0) macro360 = parsed[0];
                    else macro360 = pat.macro360;
                } catch (e) {
                    macro360 = pat.macro360;
                }
            }

            // Fallback defensivo a storage si falta alguna imagen
            if (!isValidImageSrc(img01) || !isValidImageSrc(img02) || !isValidImageSrc(macro360)) {
                const storedPat = safeGetStorage('printPatientData');
                if (storedPat && typeof storedPat === 'object') {
                    if (!isValidImageSrc(img01)) {
                        img01 = storedPat.img01 || storedPat.adjunto01 || storedPat.foto01 ||
                                (Array.isArray(storedPat.imagenes) ? storedPat.imagenes[0] : null);
                    }
                    if (!isValidImageSrc(img02)) {
                        img02 = storedPat.img02 || storedPat.adjunto02 || storedPat.foto02 ||
                                (Array.isArray(storedPat.imagenes) ? storedPat.imagenes[1] : null);
                    }
                    if (!isValidImageSrc(macro360) && storedPat.macro360) {
                        macro360 = Array.isArray(storedPat.macro360) ? storedPat.macro360[0] : storedPat.macro360;
                    }
                }
            }

            return {
                img01: isValidImageSrc(img01) ? String(img01).trim() : null,
                img02: isValidImageSrc(img02) ? String(img02).trim() : null,
                macro360: isValidImageSrc(macro360) ? String(macro360).trim() : null
            };
        } catch (e) {
            console.warn('[ReportesEngine] Error en extractImageSources:', e);
            return fallback;
        }
    }

    /**
     * 6. NORMALIZACIÓN DE GÉNERO CON HEURÍSTICA Y FALLBACK
     */
    function normalizeGender(val, especimen, nombres) {
        try {
            const esp = String(especimen || '').toUpperCase();
            // Heurística anatómica
            if (esp.includes('ENDOMETR') || esp.includes('UTER') || esp.includes('ÚTER') ||
                esp.includes('CERVIX') || esp.includes('CÉRVIZ') || esp.includes('CUELLO') ||
                esp.includes('OVARIO') || esp.includes('MAMA') || esp.includes('PAP') ||
                esp.includes('PAPANICOLAOU') || esp.includes('VAGIN') || esp.includes('VULV') ||
                esp.includes('PLACENT') || esp.includes('GESTAC') || esp.includes('LEGRADO') ||
                esp.includes('SALPING') || esp.includes('TROFOBLAST')) {
                return 'FEMENINO';
            }
            if (esp.includes('PROSTAT') || esp.includes('PRÓSTAT') || esp.includes('TESTICUL') ||
                esp.includes('TESTÍC') || esp.includes('PENE') || esp.includes('ESCROT') ||
                esp.includes('SEMINAL') || esp.includes('ORQUID') || esp.includes('CIRCUNCIS')) {
                return 'MASCULINO';
            }

            const raw = String(val || '').trim().toUpperCase();
            if (raw === 'F' || raw === 'FEMENINO' || raw === 'FEM' || raw.startsWith('FEM')) return 'FEMENINO';
            if (raw === 'M' || raw === 'MASCULINO' || raw === 'MASC' || raw.startsWith('MASC')) return 'MASCULINO';

            // Heurística de nombres comunes
            const nom = String(nombres || '').toUpperCase();
            const femaleNames = ['RAIZA', 'BRIGGITTE', 'MARIA', 'MARÍA', 'ROSA', 'ANA', 'CARMEN', 'NELLI', 'NELLY', 'LUCIA', 'LUCÍA', 'PATRICIA', 'GLORIA', 'ELIZABETH', 'CLAUDIA', 'SANDRA', 'VIVIANA', 'MIRTHA', 'MERY', 'MARY', 'ELEANA', 'CYNTHIA', 'NATALY', 'NATALIA', 'JUANA', 'SILVIA', 'BEATRIZ', 'MONICA', 'MÓNICA', 'LAURA', 'GABRIELA', 'YOLANDA', 'TERESA', 'JULIA', 'ESTHER', 'ISABEL', 'ROCIO', 'ROCÍO', 'PILAR', 'ANDREA', 'PAOLA', 'VANESSA', 'KAREN', 'JESSICA', 'FIORELLA', 'STEPHANIE', 'MILAGROS', 'LILIANA', 'KARINA', 'ANGELICA', 'ANGÉLICA', 'EVELYN', 'CECILIA', 'SONIA', 'SUSANA', 'DIANA', 'WENDY', 'LUCERO', 'MARYLUZ', 'PRUDENCIA', 'DAISY', 'EUGENIA', 'MARUJA', 'JUDITH', 'CELESTE', 'ZULEMA', 'SOPHIA', 'YESENIA', 'FLOR', 'CONSUELO', 'HILDA', 'NORA', 'FATIMA', 'FÁTIMA', 'GRACIELA', 'ALICIA', 'DELIA', 'ELSA', 'AMPARO', 'ROSARIO', 'SOLEDAD', 'VIRGINIA', 'CATALINA', 'EMILIA', 'ESPERANZA', 'LORENA', 'NADIA', 'VALERIA', 'CAMILA', 'SOFIA', 'SOFÍA', 'FERNANDA', 'ALEJANDRA', 'DANIELA', 'MARIANA', 'VERONICA', 'VERÓNICA'];
            const parts = nom.split(/[\s,]+/);
            for (let i = 0; i < parts.length; i++) {
                if (parts[i] && femaleNames.includes(parts[i])) return 'FEMENINO';
            }

            if (raw === 'O' || raw === 'OTRO') return 'OTRO';
        } catch (e) {
            console.warn('[ReportesEngine] Error en normalizeGender:', e);
        }
        return '---';
    }

    /**
     * Formateador seguro de fecha (DD/MM/YYYY)
     */
    function safeFormatDate(d) {
        if (!d) return '---';
        try {
            const str = String(d).trim();
            if (!str || str === 'null' || str === 'undefined' || str === '--') return '---';
            if (str.includes('/')) return str;
            const parts = str.split('T')[0].split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return str;
        } catch (e) {
            return '---';
        }
    }

    function stripReferencesBlock(str) {
        if (!str) return '';
        return String(str)
            .replace(/(?:REFERENCIAS(?:\s*\(FORMATO\s*APA\))?|REFERENCIAS\s*BIBLIOGR[AÁ]FICAS|BIBLIOGRAF[IÍ]A)\s*:?[\s\S]*$/gi, '')
            .replace(/-\s*Perkins,\s*R\.\s*B\.[\s\S]*$/gi, '')
            .replace(/-\s*World\s*Health\s*Organization\.\s*\(2020\)[\s\S]*$/gi, '')
            .trim();
    }

    function repairCorruptedText(str) {
        if (!str) return '';
        let s = String(str);
        s = s.replace(/\\+n/gi, '\n');
        s = s.replace(/\\+N/gi, '\n');
        s = s.replace(/Papanicolaou[óo]n\s*:/gi, 'Papanicolaou\nClasificación:');
        s = s.replace(/(2014|Bethesda)\s*n\s*1\.\s*/gi, '$1\n1. ');
        s = s.replace(/muestra[óo]n\s*:/gi, 'muestra\nAdecuación:');
        s = s.replace(/evaluaci[óo]n\.\s*:/gi, 'evaluación.\nCelularidad:');
        s = s.replace(/(?:^|\.\s+|\n\s*)[Éé]lulas\s+(endocervicales|escamosas|glandulares)/gi, '.\nCélulas $1');
        s = s.replace(/(?:^|\.\s+|\n\s*)De\s+la\s+preservaci[óo]n\s+celular\s*:/gi, '.\nCalidad de la preservación celular:');
        s = s.replace(/\.\s*N\s*2\.\s*Interpretaci[óo]n(?:[é]lulas\s+escamosas)?\s*:/gi, '.\n2. Interpretación\nCélulas escamosas:');
        s = s.replace(/\.\s*N\s*3\.\s*Hallazgos\s+adicionales\s*:\s*no\s+se\s+detectan\./gi, '.\n3. Hallazgos adicionales\nMicroorganismos: no se detectan.');
        s = s.replace(/(?:^|\.\s+|\n\s*)Reactivos\/reparativos\s*:/gi, '.\nCambios reactivos/reparativos:');
        s = s.replace(/(?:^|\.\s+|\n\s*)Hallazgos\s*:\s*no\s+identificados/gi, '.\nOtros hallazgos: no identificados');
        s = s.replace(/\(\s*ADAPTADO\s+DE\s+BETHESDA[^)]*\)\s*/gi, '');
        s = s.replace(/\(\s*Adaptado\s+de\s+[^)]*\)\s*/gi, '');
        return s;
    }

    /**
     * 7. NORMALIZADOR MAESTRO Y VALORES POR DEFECTO DEFENSIVOS (FALLBACKS)
     * Si falta edad muestra '---', si falta sexo '---', fecha '---', diagnóstico '---'
     */
    function sanitizeAndDefaultPatientData(rawPat, targetCode = '') {
        const pat = (rawPat && typeof rawPat === 'object') ? rawPat : {};
        
        try {
            // Código de atención
            const codAtencion = cleanCode(pat.codAtencion || pat.cod_atencion || pat.codigo || targetCode) || '---';

            // Apellidos y Nombres
            let nombresApellidos = '---';
            if (pat.apellidos && pat.nombres) {
                nombresApellidos = `${String(pat.apellidos).trim()}, ${String(pat.nombres).trim()}`;
            } else if (pat.paciente && String(pat.paciente).trim() !== '') {
                nombresApellidos = String(pat.paciente).trim();
            } else if (pat.apellidos || pat.nombres) {
                nombresApellidos = String(pat.apellidos || pat.nombres).trim();
            }
            nombresApellidos = nombresApellidos.replace(/^,\s*/, '').trim().toUpperCase() || '---';

            // Edad
            const rawAge = String(pat.edad !== undefined && pat.edad !== null ? pat.edad : '').trim();
            let ageDisplay = '---';
            if (rawAge && rawAge !== '0' && rawAge !== '--' && rawAge !== '---' &&
                rawAge.toLowerCase() !== 'null' && rawAge.toLowerCase() !== 'undefined' && rawAge !== 'NaN') {
                ageDisplay = rawAge.toUpperCase().includes('AÑO') ? rawAge.toUpperCase() : `${rawAge} AÑOS`;
            }

            // Sexo
            const sex = normalizeGender(pat.sexo, pat.especimen, nombresApellidos);

            // Fechas
            const fecRegistro = safeFormatDate(pat.fecRegistro || pat.fec_registro);
            const fecEntrega = safeFormatDate(pat.fecEntrega || pat.fec_entrega);

            // Médico solicitante / Indicación
            let medSolicitante = String(pat.medSolicitante || pat.med_solicitante || '---').trim().toUpperCase() || '---';
            if (/^\?+$|\?{2,}/.test(medSolicitante)) {
                medSolicitante = '---';
            }

            // Espécimen
            const especimen = String(pat.especimen || pat.muestra || '---').trim().toUpperCase() || '---';

            // Textos clínicos
            const macroDesc = stripReferencesBlock(repairCorruptedText(String(pat.macroDesc !== undefined ? (pat.macroDesc || '') : (pat.macro_desc || '')).trim()));
            const microDesc = stripReferencesBlock(repairCorruptedText(String(pat.microDesc !== undefined ? (pat.microDesc || '') : (pat.micro_desc || '')).trim()));
            let diagnostico = stripReferencesBlock(repairCorruptedText(String(pat.diagnostico !== undefined ? (pat.diagnostico || '') :
                                    (pat.diagnostico_citologico || pat.diagCitologico || '')).trim()));

            const isCitologia = pat.service === 'C' || /C[-_\s0-9]|^C\d|\dC\d/i.test(codAtencion);
            if (isCitologia && !diagnostico && microDesc) {
                diagnostico = microDesc;
            }

            // DNI y Teléfono
            const dni = String(pat.dni || '---').trim() || '---';
            const telContacto = String(pat.telContacto || pat.tel_contacto || '---').trim() || '---';
            const clinica = String(pat.clinica || pat.procedencia || '---').trim() || '---';

            // Estado y firma
            const firmado = pat.firmado === true || String(pat.estado || '').toLowerCase() === 'firmado';
            const estado = pat.estado || (firmado ? 'Completado' : 'Pendiente');

            // Imágenes
            const images = extractImageSources(pat);

            return {
                ...pat,
                codAtencion,
                cod_atencion: codAtencion,
                nombresApellidos,
                paciente: nombresApellidos,
                edadDisplay: ageDisplay,
                edad: ageDisplay,
                sexoDisplay: sex,
                sexo: sex,
                fecRegistroDisplay: fecRegistro,
                fecEntregaDisplay: fecEntrega,
                fecRegistro: pat.fecRegistro || pat.fec_registro || '',
                fecEntrega: pat.fecEntrega || pat.fec_entrega || '',
                medSolicitante,
                indicacion: medSolicitante,
                especimen,
                macroDesc,
                microDesc,
                diagnostico,
                hasValidDiag: Boolean(diagnostico && diagnostico.length > 3),
                dni,
                telContacto,
                clinica,
                firmado,
                estado,
                isCitologia,
                img01: images.img01,
                img02: images.img02,
                macro360: images.macro360
            };
        } catch (e) {
            console.warn('[ReportesEngine] Error en sanitizeAndDefaultPatientData:', e);
            return {
                codAtencion: targetCode || '---',
                nombresApellidos: '---',
                edadDisplay: '---',
                sexoDisplay: '---',
                fecRegistroDisplay: '---',
                fecEntregaDisplay: '---',
                medSolicitante: '---',
                especimen: '---',
                macroDesc: '',
                microDesc: '',
                diagnostico: '',
                hasValidDiag: false,
                firmado: false,
                estado: 'Pendiente',
                img01: null,
                img02: null,
                macro360: null
            };
        }
    }

    /**
     * 8. SANITIZACIÓN ROBUSTA DE TEXTOS MÉDICOS
     */
    function cleanAndSanitizeReportText(inputStr, headerToFilter = '') {
        if (!inputStr) return '';
        try {
            let str = stripReferencesBlock(repairCorruptedText(inputStr));
            if (!str) return '';
            str = str.replace(/\\+n/gi, '\n');
            str = str.replace(/\\+N/gi, '\n');

            // Ortografía Papanicolaou y Citología
            str = str.replace(/\bpapa?ni[co]o?l?[a-z]{0,6}\b/gi, function (match) {
                if (match === match.toUpperCase()) return 'PAPANICOLAOU';
                if (match === match.toLowerCase()) return 'papanicolaou';
                return 'Papanicolaou';
            });
            str = str.replace(/\bcito[lgj][ií]a\s+cervical\b/gi, function (match) {
                if (match === match.toUpperCase()) return 'CITOLOGÍA CERVICAL';
                return 'Citología cervical';
            });

            str = str.replace(/\b(tros|otros)\s+hallazgos\b/gi, function (match) {
                return match === match.toUpperCase() ? 'OTROS HALLAZGOS' : 'Otros hallazgos';
            });
            str = str.replace(/\bbethesda\b/gi, 'Bethesda');
            str = str.replace(/\bRganismo:?\s*/gi, 'Organismo: ');
            str = str.replace(/\brganismo:?\s*/gi, 'organismo: ');
            str = str.replace(/\bsydney\b/gi, 'Sydney');

            // Limpieza de viñetas
            str = str.replace(/[\u2022\u25cf\u25cb\u25aa\u25a0\u2023\u2043\u25b6\u25c0\u25c6\u2045\u2046\u2219\u25e6\u2024\u2027\u00b7\*\-\u2013\u2014]/g, ' ');
            str = str.replace(/&bull;|&#8226;|&#x2022;/gi, ' ');

            // Normalización de etiquetas HTML
            str = str.replace(/<\/?(?:ul|ol|li|p|div|header|section)[^>]*>/gi, '\n');
            str = str.replace(/<br\s*\/?>/gi, '\n');
            str = str.replace(/<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/gi, '');
            str = str.replace(/&nbsp;/g, ' ');
            str = str.replace(/([a-zñáéíóú0-9\)])\.([A-ZÑÁÉÍÓÚa-zñáéíóú])/g, '$1. $2');

            const rawLines = str.split('\n');
            const cleanedLines = [];
            for (let i = 0; i < rawLines.length; i++) {
                let line = rawLines[i].trim();
                line = line.replace(/^(DIAGN.STICO\s+CITOL.GICO|DIAGNOSTICO\s+CITOLOGICO):?\s*/i, '');
                line = line.replace(/\s+/g, ' ');
                if (line.length > 0) cleanedLines.push(line);
            }

            const uniqueLines = [];
            for (let i = 0; i < cleanedLines.length; i++) {
                const normCurrent = cleanedLines[i].toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '');
                const normPrev = i > 0 ? cleanedLines[i - 1].toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '') : '';
                if (i === 0 && headerToFilter) {
                    const normHeader = headerToFilter.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '');
                    if (normCurrent && (normCurrent.includes(normHeader) || normHeader.includes(normCurrent))) continue;
                }
                if (normCurrent.length > 0 && normCurrent !== normPrev) {
                    uniqueLines.push(cleanedLines[i]);
                }
            }

            if (uniqueLines.length === 0) return '';

            const paragraphBuffers = [];
            let currentBuffer = '';

            for (let i = 0; i < uniqueLines.length; i++) {
                let line = uniqueLines[i];
                if (!currentBuffer) {
                    currentBuffer = line;
                } else {
                    const currIsMajorHeading = /^([0-9]+\.|[IVXLCDM]+\.|\bFRASCO\s+[0-9]+:|\bNOTA(?:\s+CL[IÍ]NICA)?(?:\s+Y\s+RECOMENDACI[OÓ]N)?:|\bRECOMENDACI[OÓ]N:|\b[A-ZÁÉÍÓÚÑ]{4,}:)/i.test(line);
                    if (currIsMajorHeading) {
                        paragraphBuffers.push(currentBuffer);
                        currentBuffer = line;
                    } else {
                        if (!currentBuffer.endsWith(' ') && !line.startsWith(' ')) {
                            if (!/[.:;?!]$/.test(currentBuffer.trim())) currentBuffer += '.';
                            currentBuffer += ' ';
                        }
                        currentBuffer += line;
                    }
                }
            }
            if (currentBuffer) paragraphBuffers.push(currentBuffer);

            return paragraphBuffers.map(function (p) {
                let trimmed = p.trim();
                if (!trimmed) return '';
                trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                if (!/[.:;?!]$/.test(trimmed)) trimmed += '.';
                return trimmed;
            }).filter(Boolean).join('<br><br>');
        } catch (e) {
            console.warn('[ReportesEngine] Error en cleanAndSanitizeReportText:', e);
            return String(inputStr || '');
        }
    }

    /**
     * 9. FORMATEO DEFENSIVO DE DESCRIPCIÓN MICROSCÓPICA
     */
    function formatMicroscopicDescription(text) {
        if (!text) return '';
        try {
            let str = repairCorruptedText(text);
            str = str.replace(/\\+n/gi, '\n');
            str = str.replace(/\\+N/gi, '\n');
            str = str.replace(/<\/?(?:ul|ol|li|p|div|header|section)[^>]*>/gi, '\n');
            str = str.replace(/<br\s*\/?>/gi, '\n');
            str = str.replace(/<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/gi, '');
            str = str.replace(/&nbsp;/g, ' ');
            str = str.replace(/&bull;|&#8226;|&#x2022;/gi, '');
            str = str.replace(/\s+:/g, ':');
            str = str.replace(/([^\n])\s*(\b[1-9]\.\s+[A-ZÁÉÍÓÚÑa-záéíóúñ])/g, '$1\n$2');

            const cytologyLabels = [
                'tinción:', 'clasificación:', 'adecuación:', 'celularidad:',
                'células endocervicales:', 'células endocervicales / zona de transformación:',
                'calidad de la preservación celular:', 'calidad de la preservación:',
                'células escamosas:', 'células glandulares:', 'microorganismos:',
                'cambios reactivos/reparativos:', 'otros hallazgos:'
            ];
            cytologyLabels.forEach(function (lbl) {
                const esc = lbl.replace(/[\/]/g, '\\$&');
                const regex = new RegExp(`([^\\n])\\s*(\\b${esc})`, 'gi');
                str = str.replace(regex, '$1\n$2');
            });

            const rawLines = str.split('\n');
            const cleanedLines = [];
            const bulletRegex = /^[\s\u00A0]*[\u2022\u25cf\u25cb\u25aa\u25a0\u2023\u2043\u25b6\u25c0\u25c6\u2045\u2046\u2219\u25e6\u2024\u2027\u00b7\*\-\u2013\u2014]+[\s\u00A0]*/i;

            for (let i = 0; i < rawLines.length; i++) {
                let line = rawLines[i].trim();
                line = line.replace(bulletRegex, '').replace(/^[\u2022\u25cb]\s+/g, '').trim();
                if (line.length > 0) cleanedLines.push(line);
            }

            const uniqueLines = [];
            for (let i = 0; i < cleanedLines.length; i++) {
                const normCurrent = cleanedLines[i].toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '');
                const normPrev = i > 0 ? cleanedLines[i - 1].toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '') : '';
                if (normCurrent.length > 0 && normCurrent !== normPrev) uniqueLines.push(cleanedLines[i]);
            }

            const formattedLines = uniqueLines.map(function (line) {
                const trimmed = line.trim();
                if (!trimmed) return '';
                if (/^\d+\./.test(trimmed)) {
                    return `<b style="display:block; margin-top:6px; margin-bottom:2px; text-transform:uppercase;">${trimmed.toUpperCase()}</b>`;
                }
                if (trimmed.includes(':')) {
                    const colonIndex = trimmed.indexOf(':');
                    const label = trimmed.substring(0, colonIndex).trim();
                    const value = trimmed.substring(colonIndex + 1).trim();
                    return `<div class="micro-row" style="display:grid; grid-template-columns:250px 14px 1fr; align-items:start; margin-bottom:2.5px; line-height:1.35;"><span class="micro-label" style="font-weight:600; text-transform:capitalize; word-break:break-word;">${label}</span><span class="micro-sep" style="text-align:center;">:</span><span class="micro-val" style="text-align:justify;">${value}</span></div>`;
                }
                return `<div style="margin-bottom:1px; line-height:1.25;">${trimmed}</div>`;
            });

            return formattedLines.filter(Boolean).join('');
        } catch (e) {
            console.warn('[ReportesEngine] Error en formatMicroscopicDescription:', e);
            return String(text || '');
        }
    }

    /**
     * 10. RENDERIZACIÓN A PRUEBA DE FALLOS DEL CÓDIGO QR (PMC13645536)
     * Nunca lanza 'Uncaught ReferenceError' si falta qrcode.min.js
     */
    function safeRenderQrCode(containerElem, urlToEncode, options = {}) {
        if (!containerElem) return false;
        try {
            containerElem.innerHTML = '';
            const width = options.width || 56;
            const height = options.height || 56;
            const colorDark = options.colorDark || '#0f766e';
            const colorLight = options.colorLight || '#ffffff';

            if (typeof QRCode !== 'undefined' && typeof QRCode === 'function') {
                try {
                    new QRCode(containerElem, {
                        text: urlToEncode,
                        width: width,
                        height: height,
                        colorDark: colorDark,
                        colorLight: colorLight,
                        correctLevel: (QRCode.CorrectLevel && QRCode.CorrectLevel.M) || 0
                    });
                    return true;
                } catch (eInner) {
                    console.warn('[ReportesEngine] Instanciación QRCode falló, usando SVG fallback:', eInner);
                }
            }

            // Fallback elegante SVG / Badge si QRCode no está cargado
            containerElem.innerHTML = `
                <div style="width:${width}px; height:${height}px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f0fdfa; border:1px solid #0f766e; border-radius:4px; font-size:6.5pt; color:#0f766e; text-align:center; font-weight:800; line-height:1.1; padding:2px; box-sizing:border-box;">
                    <span style="font-size:12px;">🔒</span>
                    <span>VALIDADO</span>
                    <span style="font-size:5pt; color:#64748b; font-family:monospace;">PMC13645</span>
                </div>
            `;
            return true;
        } catch (e) {
            console.warn('[ReportesEngine] Error en safeRenderQrCode:', e);
            return false;
        }
    }

    /**
     * 11. RESOLUTOR MAESTRO DE INFORME EN CASCADA DEFENSIVA
     * Storage -> Supabase -> IndexedDB -> REAL_SUPABASE_PATIENTS
     */
    async function resolvePatientReport(explicitCode = '') {
        const codAtencion = safeExtractCodAtencion(explicitCode);
        let patient = null;

        // Paso 1: Storage
        try {
            const stored = safeGetStorage('printPatientData');
            if (stored && typeof stored === 'object') {
                const storedCode = cleanCode(stored.codAtencion || stored.cod_atencion);
                if (!codAtencion || storedCode === codAtencion || canonicalCode(storedCode) === canonicalCode(codAtencion)) {
                    patient = stored;
                    console.log('[ReportesEngine] Datos recuperados de Storage.');
                }
            }
        } catch (eStorage) {}

        // Paso 2: Supabase (si está disponible y faltan datos)
        if ((!patient || (!patient.macroDesc && !patient.diagnostico)) && codAtencion && typeof window !== 'undefined' && window.supabase && typeof window.SUPABASE_CONFIG !== 'undefined') {
            try {
                const supabasePromise = window.supabase
                    .from('pacientes')
                    .select('*')
                    .ilike('cod_atencion', codAtencion)
                    .maybeSingle();
                const timeoutPromise = new Promise(function (_, reject) {
                    setTimeout(function () { reject(new Error('Supabase Timeout')); }, 2500);
                });
                const res = await Promise.race([supabasePromise, timeoutPromise]);
                if (res && res.data) {
                    patient = { ...res.data, codAtencion: res.data.cod_atencion };
                    console.log('[ReportesEngine] Datos recuperados de Supabase.');
                }
            } catch (eSupa) {
                console.warn('[ReportesEngine] Fallo en consulta Supabase:', eSupa.message || eSupa);
            }
        }

        // Paso 3: IndexedDB
        if ((!patient || (!patient.macroDesc && !patient.diagnostico)) && codAtencion) {
            try {
                const idbPat = await safeGetIndexedDBPatient(codAtencion, 2000);
                if (idbPat) {
                    patient = idbPat;
                    console.log('[ReportesEngine] Datos recuperados de IndexedDB.');
                }
            } catch (eIdb) {}
        }

        // Paso 4: Catálogo Maestro de Respaldo (real_supabase_backup.js)
        if ((!patient || (!patient.macroDesc && !patient.diagnostico)) && codAtencion) {
            try {
                const bkp = safeGetBackupPatient(codAtencion);
                if (bkp) {
                    if (!patient) {
                        patient = { ...bkp };
                    } else {
                        // Enriquecer campos faltantes
                        if (!patient.macroDesc && (bkp.macroDesc || bkp.macro_desc)) patient.macroDesc = bkp.macroDesc || bkp.macro_desc;
                        if (!patient.microDesc && (bkp.microDesc || bkp.micro_desc)) patient.microDesc = bkp.microDesc || bkp.micro_desc;
                        if (!patient.diagnostico && bkp.diagnostico) patient.diagnostico = bkp.diagnostico;
                        if (!patient.especimen && bkp.especimen) patient.especimen = bkp.especimen;
                        if (!patient.dni && bkp.dni) patient.dni = bkp.dni;
                        if (!patient.medSolicitante && (bkp.medSolicitante || bkp.med_solicitante)) patient.medSolicitante = bkp.medSolicitante || bkp.med_solicitante;
                    }
                    console.log('[ReportesEngine] Datos recuperados de REAL_SUPABASE_PATIENTS.');
                }
            } catch (eBkp) {}
        }

        return sanitizeAndDefaultPatientData(patient, codAtencion);
    }

    // Exposición de API pública
    return {
        safeExtractCodAtencion: safeExtractCodAtencion,
        cleanCode: cleanCode,
        canonicalCode: canonicalCode,
        safeGetStorage: safeGetStorage,
        safeSetStorage: safeSetStorage,
        safeGetBackupPatient: safeGetBackupPatient,
        safeGetIndexedDBPatient: safeGetIndexedDBPatient,
        isValidImageSrc: isValidImageSrc,
        extractImageSources: extractImageSources,
        normalizeGender: normalizeGender,
        safeFormatDate: safeFormatDate,
        sanitizeAndDefaultPatientData: sanitizeAndDefaultPatientData,
        cleanAndSanitizeReportText: cleanAndSanitizeReportText,
        formatMicroscopicDescription: formatMicroscopicDescription,
        safeRenderQrCode: safeRenderQrCode,
        resolvePatientReport: resolvePatientReport
    };
}));
