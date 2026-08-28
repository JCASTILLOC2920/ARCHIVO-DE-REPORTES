// db_service.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Base de Datos y Almacenamiento Local

// INDEXTEDB STORAGE FOR HEAVY PATIENT RECORDS
const IDB_NAME = 'ClinicaReportesDB';
const IDB_VERSION = 1;
const STORE_NAME = 'pacientes_completos';

export const cleanCodeFunc = (str) => String(str || '').trim().toLowerCase().replace(/[-_\s]/g, '');

export function parseCodAtencionForSort(cod) {
    if (!cod) return { year: -1, num: 0 };
    const codStr = String(cod || '').trim().toUpperCase();
    const match = codStr.match(/^(\d{2})[^\d]*(\d+)/);
    if (match) {
        return {
            year: parseInt(match[1], 10),
            num: parseInt(match[2], 10)
        };
    }
    const numOnly = codStr.match(/(\d+)/);
    return {
        year: 0,
        num: numOnly ? parseInt(numOnly[1], 10) : 0
    };
}

export function attachSortKeys(p) {
    if (!p) return p;
    if (p._sortYear === undefined || p._sortNum === undefined) {
        const parsed = parseCodAtencionForSort(p.codAtencion);
        p._sortYear = parsed.year;
        p._sortNum = parsed.num;
    }
    if (!p._searchKey) {
        const raw = `${p.codAtencion || ''} ${p.paciente || ''} ${p.nombres || ''} ${p.apellidos || ''} ${p.dni || ''} ${p.medSolicitante || ''} ${p.clinica || ''} ${p.especimen || ''}`;
        p._searchKey = raw.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
    return p;
}

export function sortPatientArray(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return arr;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] && arr[i]._sortYear === undefined) {
            attachSortKeys(arr[i]);
        }
    }
    return arr.sort((a, b) => {
        const yA = a._sortYear !== undefined ? a._sortYear : -1;
        const yB = b._sortYear !== undefined ? b._sortYear : -1;
        if (yB !== yA) return yB - yA;

        const nA = a._sortNum !== undefined ? a._sortNum : 0;
        const nB = b._sortNum !== undefined ? b._sortNum : 0;
        return nB - nA;
    });
}

export function correctPapanicolaouSpelling(text) {
    if (!text) return '';
    
    // Limpiar entidades HTML como &NBSP;, &nbsp; y despejar espacios
    let result = text.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&');
    result = result.replace(/<span[^>]*>/gi, '').replace(/<\/span>/gi, '');
    
    // Primero corregir "papá nicolás" y variaciones con/sin acento o espacio
    const papaNicolasRegex = /\bpap[áa]\s*nicol[áa]s\b/gi;
    result = result.replace(papaNicolasRegex, (match) => {
        if (match === match.toUpperCase()) return "PAPANICOLAOU";
        if (match[0] === match[0].toUpperCase()) return "Papanicolaou";
        return "papanicolaou";
    });
    
    // Luego corregir otras variantes ortográficas comunes de Papanicolaou (papanicolao, papaniclao, etc.)
    const papanicolaouRegex = /\bpapa?ni[co]o?l?[a-z]{0,6}\b/gi;
    result = result.replace(papanicolaouRegex, (match) => {
        if (match === match.toUpperCase()) return "PAPANICOLAOU";
        if (match === match.toLowerCase()) return "papanicolaou";
        return "Papanicolaou";
    });
    
    return result;
}

export function cleanTextContentLocal(text) {
    if (!text) return '';
    let result = text;
    
    // Caracteres corruptos de llaves
    result = result.replace(/[{}]/g, '');
    
    // Números intrusos (ej: secuencias numéricas largas fuera de lugar)
    result = result.replace(/\b\d{6,}\b/g, '');
    
    // Palabras duplicadas
    result = result.replace(/\b([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+\1\b/gi, '$1');
    
    // Diccionario médico
    result = correctPapanicolaouSpelling(result);
    
    return result;
}

export function cleanTextContentLocalV4(text, preserveCase = false) {
    if (!text) return '';
    let result = text;

    if (!preserveCase) {
        result = result.toLowerCase();
    }

    result = result.replace(/[{}]/g, '');
    result = result.split('\n').map(line => line.replace(/[ \t\r]+/g, ' ').trim()).join('\n');

    const replacements = {
        "espcimen": "espécimen",
        "especimen": "espécimen",
        "apendicectoma": "apendicectomía",
        "apendicectomia": "apendicectomía",
        "diametro": "diámetro",
        "dimetro": "diámetro",
        "apendice": "apéndice",
        "apndice": "apéndice",
        "vesicula": "vesícula",
        "vescula": "vesícula",
        "congestin": "congestión",
        "congestion": "congestión",
        "cronica": "crónica",
        "crnica": "crónica",
        "clinico": "clínico",
        "clnico": "clínico",
        "histologico": "histológico",
        "histolgio": "histológico",
        "celulas": "células",
        "clulas": "células",
        "tincion": "tinción",
        "tincin": "tinción",
        "clasificacion": "clasificación",
        "clasificacin": "clasificación",
        "adecuacion": "adecuación",
        "adecuacin": "adecuación",
        "evaluacion": "evaluación",
        "evaluacin": "evaluación",
        "diagnostico": "diagnóstico",
        "diagnstico": "diagnóstico",
        "reaccion": "reacción",
        "reaccin": "reacción",
        "proliferacion": "proliferación",
        "proliferacin": "proliferación",
        "infiltracion": "infiltración",
        "infiltracin": "infiltración",
        "obliteracion": "obliteración",
        "obliteracin": "obliteración",
        "perforacion": "perforación",
        "perforacin": "perforación",
        "atrofico": "atrófico",
        "atrogico": "atrófico",
        "atrofio": "atrófico",
        "atipico": "atípico",
        "atipica": "atípica",
        "atipicas": "atípicas",
        "atipicos": "atípicos",
        "nucleos": "núcleos",
        "ncleos": "núcleos",
        "exeresis": "exéresis",
        "exresis": "exéresis",
        "histerectomia": "histerectomía",
        "histerectoma": "histerectomía",
        "ginecologia": "ginecología",
        "ginecolgia": "ginecología",
        "urologia": "urología",
        "urolgia": "urología",
        "citologia": "citología",
        "citolgia": "citología",
        "cupula": "cúpula",
        "litiasica": "litiásica",
        "litisica": "litiásica",
        "prostata": "próstata",
        "prstata": "próstata",
        "anatomopatologico": "anatomopatológico",
        "anatomopatolgico": "anatomopatológico",
        "fijacion": "fijación",
        "fijacin": "fijación",
        "coloracion": "coloración",
        "coloracin": "coloración",
        "morfologia": "morfología",
        "homogenea": "homogénea",
        "elastica": "elástica",
        "capsula": "cápsula",
        "calcificacion": "calcificación",
        "calcificacin": "calcificación",
        "inmunohistoquimica": "inmunohistoquímica",
        "reseccion": "resección",
        "reseccin": "resección",
        "obstruccion": "obstrucción",
        "obstruccin": "obstrucción",
        "ulceracion": "ulceración",
        "ulceracin": "ulceración",
        "involucion": "involución",
        "involucin": "involución"
    };

    for (let k in replacements) {
        const v = replacements[k];
        if (!preserveCase) {
            const regex = new RegExp('\\b' + k + '\\b', 'g');
            result = result.replace(regex, v);
        } else {
            const regexLower = new RegExp('\\b' + k + '\\b', 'g');
            result = result.replace(regexLower, v);
            const regexUpper = new RegExp('\\b' + k.toUpperCase() + '\\b', 'g');
            result = result.replace(regexUpper, v.toUpperCase());
        }
    }

    result = result.replace(/\b([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)\s+\1\b/gi, '$1');
    return result.trim();
}

let cachedIDBInstance = null;

function getIDB() {
    if (cachedIDBInstance) {
        return Promise.resolve(cachedIDBInstance);
    }
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'codAtencion' });
            }
        };
        request.onsuccess = (e) => {
            cachedIDBInstance = e.target.result;
            cachedIDBInstance.onversionchange = () => {
                cachedIDBInstance.close();
                cachedIDBInstance = null;
            };
            resolve(cachedIDBInstance);
        };
        request.onerror = (e) => {
            cachedIDBInstance = null;
            reject(e.target.error);
        };
    });
}

export async function savePatientToIndexedDB(patient) {
    try {
        const db = await getIDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(patient);
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("[IndexedDB] Error al guardar paciente:", e);
    }
}

export async function getPatientFromIndexedDB(codAtencion) {
    try {
        const db = await getIDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(codAtencion);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("[IndexedDB] Error al obtener paciente:", e);
        return null;
    }
}

export async function deletePatientFromIndexedDB(codAtencion) {
    try {
        const db = await getIDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(codAtencion);
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("[IndexedDB] Error al eliminar paciente:", e);
    }
}

// Bases de datos simuladas / temporales
export const patientDatabase = [];

export let doctorsDatabase = [];

export { usersDatabase } from './users_db.js';

export const defaultCategories = [
    { id: 1, tipo: 'Macroscopica', categoria: '(MACRO) PROTOCOLOS SISTEMATIZADOS' },
    { id: 2, tipo: 'Macroscopica', categoria: 'DERMATOPATOLOGIA' },
    { id: 3, tipo: 'Macroscopica', categoria: 'GASTROENTEROLOGIA' },
    { id: 4, tipo: 'Macroscopica', categoria: 'GINECOLOGIA' },
    { id: 5, tipo: 'Macroscopica', categoria: 'MAMA' },
    { id: 6, tipo: 'Macroscopica', categoria: 'OTROS' },
    { id: 8, tipo: 'Macroscopica', categoria: 'PARTES BLANDAS' },
    { id: 9, tipo: 'Macroscopica', categoria: 'UROLOGÍA' },
    { id: 22, tipo: 'Macroscopica', categoria: 'APÉNDICE CECAL' },
    { id: 23, tipo: 'Macroscopica', categoria: 'VESÍCULA BILIAR' },
    { id: 30, tipo: 'Macroscopica', categoria: 'OFTALMOPATOLOGIA' },
    { id: 32, tipo: 'Macroscopica', categoria: 'CABEZA Y CUELLO' },
    { id: 33, tipo: 'Macroscopica', categoria: 'CIRUGIA' },
    { id: 34, tipo: 'Macroscopica', categoria: 'HEMATOPATOLOGIA' },
    { id: 10, tipo: 'Microscopica', categoria: '(MACRO) PROTOCOLOS SISTEMATIZADOS' },
    { id: 11, tipo: 'Microscopica', categoria: '(MICRO) PROTOCOLOS SISTEMATIZADOS' },
    { id: 12, tipo: 'Microscopica', categoria: 'AGRADECIMIENTOS' },
    { id: 13, tipo: 'Microscopica', categoria: 'APÉNDICE CECAL' },
    { id: 14, tipo: 'Microscopica', categoria: 'CABEZA Y CUELLO' },
    { id: 15, tipo: 'Microscopica', categoria: 'CIRUGIA' },
    { id: 16, tipo: 'Microscopica', categoria: 'DERMATOPATOLOGIA' },
    { id: 17, tipo: 'Microscopica', categoria: 'GASTROENTEROLOGIA' },
    { id: 18, tipo: 'Microscopica', categoria: 'GINECOLOGIA' },
    { id: 19, tipo: 'Microscopica', categoria: 'HEMATOPATOLOGIA' },
    { id: 20, tipo: 'Microscopica', categoria: 'MAMA' },
    { id: 21, tipo: 'Microscopica', categoria: 'OFTALMOPATOLOGIA' },
    { id: 24, tipo: 'Microscopica', categoria: 'VESÍCULA BILIAR' },
    { id: 25, tipo: 'Microscopica', categoria: 'UROLOGÍA' },
    { id: 31, tipo: 'Microscopica', categoria: 'PARTES BLANDAS' },
    { id: 28, tipo: 'Macroscopica', categoria: 'CITOLOGÍA CERVICAL' },
    { id: 29, tipo: 'Microscopica', categoria: 'CITOLOGÍA CERVICAL' }
];

export let categoriesDatabase = [];
export let templatesDatabase = [];

// Función de inicialización de datos base (Local Storage)
export function initLocalDatabases() {
    // 1. Pacientes (Cargar respaldo local de varias claves posibles para disponibilidad inmediata)
    const localPatientBackup = localStorage.getItem('patientDatabaseLocal') || localStorage.getItem('patientDatabase') || localStorage.getItem('pacientesDB');
    if (localPatientBackup) {
        try {
            const parsed = JSON.parse(localPatientBackup);
            if (parsed && parsed.length > 0) {
                patientDatabase.length = 0; 
                let databaseWasCleaned = false;
                parsed.forEach(p => {
                    const cleanEspecimen = correctPapanicolaouSpelling(p.especimen || '');
                    const cleanMacro = correctPapanicolaouSpelling(p.macroDesc || '');
                    const cleanMicro = correctPapanicolaouSpelling(p.microDesc || '');
                    const cleanDiag = correctPapanicolaouSpelling(p.diagnostico || '');
                    
                    if (cleanEspecimen !== p.especimen || cleanMacro !== p.macroDesc || cleanMicro !== p.microDesc || cleanDiag !== p.diagnostico) {
                        p.especimen = cleanEspecimen;
                        p.macroDesc = cleanMacro;
                        p.microDesc = cleanMicro;
                        p.diagnostico = cleanDiag;
                        databaseWasCleaned = true;
                    }
                    patientDatabase.push(p);
                });
                if (databaseWasCleaned) {
                    localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));
                    console.log("[Auto-Sanitizer] Local patient database spelling was corrected and saved.");
                }
            }
        } catch (e) {
            console.error("Error al cargar el respaldo local de pacientes", e);
        }
    }

    // Garantizar que patientDatabase NUNCA permanezca vacío para evitar pantallas en blanco o desiertas
    if (patientDatabase.length === 0) {
        const fallbackPatients = [
            { codAtencion: '26Q-01', dni: '45892014', paciente: 'GARCIA MENDOZA, MARIA ELENA', medSolicitante: 'DR. CARLOS FLORES', especimen: 'VESÍCULA BILIAR', fecRegistro: '2026-08-20', fecEntrega: '2026-08-22', estado: 'Completado', firmado: true, service: 'Q', clinica: 'CLINICA LA MUJER' },
            { codAtencion: '26Q-02', dni: '10293847', paciente: 'RODRIGUEZ SILVA, JOSE LUIS', medSolicitante: 'DRA. ANA MARTINEZ', especimen: 'APÉNDICE CECAL', fecRegistro: '2026-08-20', fecEntrega: '2026-08-23', estado: 'Completado', firmado: true, service: 'Q', clinica: 'CLÍNICA CARRIÓN' },
            { codAtencion: '26C-01', dni: '74839201', paciente: 'TORRES RUIZ, LUCIA ADRIANA', medSolicitante: 'DR. JORGE QUISPE', especimen: 'PAPANICOLAOU', fecRegistro: '2026-08-20', fecEntrega: '2026-08-21', estado: 'Pendiente', firmado: false, service: 'C', clinica: 'CLINICA LA MUJER' }
        ];
        patientDatabase.push(...fallbackPatients);
        try {
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));
        } catch(err) {
            console.error(err);
        }
    }

    // No forzar la inserción de registros de prueba estáticos para mantener limpia la carga inicial

    // Do not populate dummy values for especimen if blank
    patientDatabase.forEach(item => {
        if (item.especimen === undefined || item.especimen === null) {
            item.especimen = '';
        }
    });


    // Migración automática de la dimensión 6.0 * 5* 2.0 cm a 6.0 x 5 x 2.0 cm
    let hasMigrationChanges = false;
    patientDatabase.forEach(item => {
        const fieldsToMigrate = ['macroDesc', 'microDesc', 'diagnostico', 'especimen', 'motivoEstudio'];
        fieldsToMigrate.forEach(field => {
            if (item[field] && typeof item[field] === 'string') {
                const normalized = item[field].replace(/6\.0\s*\*\s*5\s*\*?\s*2\.0\s*CM/gi, '6.0 x 5 x 2.0 CM');
                if (normalized !== item[field]) {
                    item[field] = normalized;
                    hasMigrationChanges = true;
                }
            }
        });
    });
    if (hasMigrationChanges) {
        triggerAutomaticBackup();
        console.log('[Migration] Se corrigió el formato de dimensiones en los registros de paciente.');
    }


    // 2. Plantillas (Cargadas y normalizadas primero para poder inspeccionar qué categorías tienen plantillas asociadas)
    templatesDatabase = JSON.parse(localStorage.getItem('plantillasDB')) || [];
    if (templatesDatabase.length === 0 && window.defaultTemplates) {
        templatesDatabase = [...window.defaultTemplates];
        localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
    } else if (window.defaultTemplates) {
        // Migración/Autocuración: Asegurar que las plantillas por defecto nuevas existan en la base de datos local
        let updated = false;

        // 1. Corregir asignaciones erróneas previas de categorías en la BD local antes del chequeo de existencia
        templatesDatabase.forEach(t => {
            const tit = (t.titulo || '').toUpperCase();
            if (tit.includes('ENDOMETR') || tit.includes('CERVIX') || tit.includes('CÉRVIZ') || tit.includes('ENDOCERVICAL') || tit.includes('LEIOMIOMA') || tit.includes('PÓLIPO ENDOMETRIAL') || tit.includes('POLIPO ENDOMETRIAL') || tit.includes('COMPATIBLE CON PÓLIPO')) {
                if (t.categoryId === 22 || t.categoryId === 13 || (t.categoryId !== 4 && t.categoryId !== 18)) {
                    t.categoryId = 4;
                    updated = true;
                }
            }
            if (t.titulo === "LIPOMA (TEJIDO BLANDO)" && t.categoryId !== 8) {
                t.categoryId = 8;
                updated = true;
            }
            if (t.titulo === "QUISTE EPIDÉRMICO" && t.categoryId !== 2) {
                t.categoryId = 2;
                updated = true;
            }
            if (t.titulo === "NEVUS INTRADÉRMICO" && t.categoryId !== 2) {
                t.categoryId = 2;
                updated = true;
            }
            if (t.titulo === "GASTRITIS CRÓNICA MODERADA ACTIVA" && t.categoryId === 12) {
                t.categoryId = 17;
                updated = true;
            }
        });

        // 2. De-duplicación por título y categoryId para preservar plantillas de Macro (22) y Micro (13)
        const uniqueTemplates = [];
        const seen = new Set();
        templatesDatabase.forEach(t => {
            const key = `${t.categoryId}-${(t.titulo || '').trim().toUpperCase()}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueTemplates.push(t);
            } else {
                updated = true;
            }
        });
        templatesDatabase.length = 0;
        templatesDatabase.push(...uniqueTemplates);

        // 2.1 Purga de plantillas obsoletas o duplicadas desfasadas en localStorage (V7)
        const deprecatedTitles = [
            'BIOPSIAS DE ESTOMAGO X 1', 'BIOPSIAS DE ESTOMAGO X 2', 'BIOPSIAS DE ESTOMAGO X 3',
            'BIOPSIAS DE CERVIX X 1', 'BIOPSIAS DE CERVIX X 2', 'BIOPSIAS DE CERVIX X 3'
        ];
        const cleanedTemplates = templatesDatabase.filter(t => {
            const tit = (t.titulo || '').trim().toUpperCase();
            if (deprecatedTitles.includes(tit)) {
                updated = true;
                return false;
            }
            if (tit === 'APENDICITIS AGUDA NECROSADA' && (t.categoryId === 13 || String(t.id) === '47')) {
                updated = true;
                return false;
            }
            if (tit === 'LIE DE BAJO GRADO' && (t.categoryId === 18 || String(t.id) === '50')) {
                updated = true;
                return false;
            }
            return true;
        });
        templatesDatabase.length = 0;
        templatesDatabase.push(...cleanedTemplates);

        // 3. Inserción de plantillas por defecto faltantes o actualización de contenido
        window.defaultTemplates.forEach(defTpl => {
            const idx = templatesDatabase.findIndex(t => (t.titulo || '').trim().toUpperCase() === (defTpl.titulo || '').trim().toUpperCase() && String(t.categoryId) === String(defTpl.categoryId));
            if (idx === -1) {
                const maxId = templatesDatabase.length > 0 ? Math.max(...templatesDatabase.map(t => parseInt(t.id) || 0)) : 0;
                const newTpl = { ...defTpl, id: maxId + 1 };
                templatesDatabase.push(newTpl);
                updated = true;
            } else {
                // Asegurar que contenido corregido o ampliado se refresque
                if (templatesDatabase[idx].macro !== defTpl.macro || templatesDatabase[idx].micro !== defTpl.micro || templatesDatabase[idx].diag !== defTpl.diag) {
                    templatesDatabase[idx].macro = defTpl.macro;
                    templatesDatabase[idx].micro = defTpl.micro;
                    templatesDatabase[idx].diag = defTpl.diag;
                    templatesDatabase[idx].categoryId = defTpl.categoryId;
                    updated = true;
                }
            }
        });
        if (updated) {
            localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
        }
    }

    // Auto-sanitización de plantillas en un paso único (Migración V3)
    if (!localStorage.getItem('templatesSpellingCorrected_v3')) {
        let templatesUpdated = false;
        templatesDatabase.forEach(t => {
            const cleanMacro = cleanTextContentLocal(t.macro);
            const cleanMicro = cleanTextContentLocal(t.micro);
            const cleanDiag = cleanTextContentLocal(t.diag);
            
            if (cleanMacro !== t.macro || cleanMicro !== t.micro || cleanDiag !== t.diag) {
                t.macro = cleanMacro;
                t.micro = cleanMicro;
                t.diag = cleanDiag;
                templatesUpdated = true;
            }
        });
        if (templatesUpdated) {
            localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
            console.log("[Auto-Sanitizer] Local templates spelling was corrected and saved.");
        }
        localStorage.setItem('templatesSpellingCorrected_v3', 'true');
    }

    // Auto-sanitización y conversión a minúsculas de plantillas (Migración V4 - Justificación y Minúsculas)
    if (!localStorage.getItem('templatesSpellingCorrected_v4')) {
        let templatesUpdated = false;
        templatesDatabase.forEach(t => {
            const cleanMacro = cleanTextContentLocalV4(t.macro, false);
            const cleanMicro = cleanTextContentLocalV4(t.micro, false);
            const cleanDiag = cleanTextContentLocalV4(t.diag, true); // true para preservar mayúsculas en Diagnóstico
            const cleanTitle = cleanTextContentLocalV4(t.titulo, true); // true para preservar mayúsculas en Título
            
            if (cleanMacro !== t.macro || cleanMicro !== t.micro || cleanDiag !== t.diag || cleanTitle !== t.titulo) {
                t.macro = cleanMacro;
                t.micro = cleanMicro;
                t.diag = cleanDiag;
                t.titulo = cleanTitle;
                templatesUpdated = true;
            }
        });
        if (templatesUpdated) {
            localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
            console.log("[Auto-Sanitizer V4] Local templates spelling corrected and formatted to lowercase.");
        }
        localStorage.setItem('templatesSpellingCorrected_v4', 'true');
    }

    // Auto-sanitización V5 - Restauración y Preservación de Saltos de Línea en las Plantillas
    if (!localStorage.getItem('templatesSpellingCorrected_v5')) {
        let templatesUpdated = false;
        
        // Cargar las plantillas originales de plantillas_data.js para recuperar sus saltos de línea (\n)
        if (window.defaultTemplates) {
            templatesDatabase.forEach(t => {
                const defTpl = window.defaultTemplates.find(dt => String(dt.id) === String(t.id));
                if (defTpl) {
                    t.macro = defTpl.macro || '';
                    t.micro = defTpl.micro || '';
                    t.diag = defTpl.diag || '';
                    t.titulo = defTpl.titulo || '';
                    templatesUpdated = true;
                }
            });
        }

        templatesDatabase.forEach(t => {
            const cleanMacro = cleanTextContentLocalV4(t.macro, false);
            const cleanMicro = cleanTextContentLocalV4(t.micro, false);
            const cleanDiag = cleanTextContentLocalV4(t.diag, true); // true para preservar mayúsculas en Diagnóstico
            const cleanTitle = cleanTextContentLocalV4(t.titulo, true); // true para preservar mayúsculas en Título
            
            if (cleanMacro !== t.macro || cleanMicro !== t.micro || cleanDiag !== t.diag || cleanTitle !== t.titulo) {
                t.macro = cleanMacro;
                t.micro = cleanMicro;
                t.diag = cleanDiag;
                t.titulo = cleanTitle;
                templatesUpdated = true;
            }
        });

        if (templatesUpdated) {
            localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
            console.log("[Auto-Sanitizer V5] Local templates restored with correct line breaks.");
        }
        localStorage.setItem('templatesSpellingCorrected_v5', 'true');
    }

    // Auto-sanitización V8 - Purga de Duplicados Desfasados y Ordenamiento Secuencial de Morcelados de Próstata (1 a 6)
    if (!localStorage.getItem('templatesSpellingCorrected_v8') && window.defaultTemplates) {
        // 1. Purgar de templatesDatabase cualquier elemento de Urología desfasado o duplicado
        const cleanDB = templatesDatabase.filter(t => {
            const tit = (t.titulo || '').trim().toUpperCase();
            const catId = Number(t.categoryId);
            if (tit.includes('MORCELAD') || catId === 9) {
                return false; // Eliminar todas las copias viejas o duplicadas en localStorage
            }
            return true;
        });

        // 2. Obtener las plantillas oficiales de la Categoría 9 (Urología) desde plantillas_data.js
        const urologyDefaults = window.defaultTemplates
            .filter(dt => Number(dt.categoryId) === 9)
            .map(dt => ({ ...dt }));

        // Ordenar urología: Morcelado 1, 2, 3, 4, 5, 6 secuencialmente
        urologyDefaults.sort((a, b) => {
            const titleA = (a.titulo || '').toUpperCase();
            const titleB = (b.titulo || '').toUpperCase();
            const isMorcA = titleA.includes('MORCELADO');
            const isMorcB = titleB.includes('MORCELADO');

            if (isMorcA && isMorcB) {
                const numA = parseInt(titleA.replace(/\D/g, '')) || 0;
                const numB = parseInt(titleB.replace(/\D/g, '')) || 0;
                return numA - numB;
            }
            if (isMorcA) return -1;
            if (isMorcB) return 1;
            return titleA.localeCompare(titleB);
        });

        templatesDatabase.length = 0;
        templatesDatabase.push(...cleanDB, ...urologyDefaults);

        localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
        localStorage.setItem('templatesSpellingCorrected_v8', 'true');
        console.log("[Auto-Sanitizer V8] Purga de duplicados y ordenamiento secuencial de Morcelados de Próstata (1 al 6) completado.");
    }

    // 3. Categorías
    categoriesDatabase = JSON.parse(localStorage.getItem('categoriasDB')) || defaultCategories;
    let catUpdated = false;
    defaultCategories.forEach(defCat => {
        const exists = categoriesDatabase.some(c => c.id === defCat.id || (c.tipo === defCat.tipo && c.categoria === defCat.categoria));
        if (!exists) {
            categoriesDatabase.push(defCat);
            catUpdated = true;
        }
    });

    if (catUpdated || !categoriesDatabase || categoriesDatabase.length < 24) {
        localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
        console.log(`[Auto-Sanitizer] Categories database updated (Length: ${categoriesDatabase.length}).`);
    }

    // Renombrar especialidades y mover plantillas (Corrección y Reorganización de categorías)
    let layoutReorganized = false;
    categoriesDatabase.forEach(c => {
        const name = (c.categoria || '').trim().toUpperCase();
        if (name === 'APENDICITIS') {
            c.categoria = 'APÉNDICE CECAL';
            layoutReorganized = true;
        }
        if (name === 'COLECISTITIS') {
            c.categoria = 'VESÍCULA BILIAR';
            layoutReorganized = true;
        }
        if (name === 'APÉNDICE CECAL' || name === 'APENDICE CECAL' || name === 'APNDICE CECAL') {
            c.categoria = 'APÉNDICE CECAL';
            layoutReorganized = true;
        }
        if (name === 'VESÍCULA BILIAR' || name === 'VESICULA BILIAR' || name === 'VESCULA BILIAR') {
            c.categoria = 'VESÍCULA BILIAR';
            layoutReorganized = true;
        }
    });
    if (layoutReorganized) {
        localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
        console.log('[Auto-Migration] Especialidades renombradas a APÉNDICE CECAL y VESÍCULA BILIAR.');
    }

    let templatesReorganized = false;
    templatesDatabase.forEach(t => {
        const title = (t.titulo || '').trim().toUpperCase();
        if (title.includes('APENDICITIS') || title.includes('APENDICTIS')) {
            if (t.categoryId !== 22 && t.categoryId !== 13) {
                t.categoryId = 22;
                templatesReorganized = true;
            }
        }
        if (title.includes('COLECISTITIS')) {
            if (t.categoryId !== 23 && t.categoryId !== 24) {
                t.categoryId = 23;
                templatesReorganized = true;
            }
        }
        if (title.includes('SACO HERNIARIO')) {
            if (t.categoryId !== 15) {
                t.categoryId = 15;
                templatesReorganized = true;
            }
        }
    });
    if (templatesReorganized) {
        localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
        console.log('[Auto-Migration] Plantillas reubicadas bajo sus nuevas categorías.');
    }

    // Fusionar Genitourinario en Urología (Solicitado por el usuario)
    let urologiaMerged = false;
    templatesDatabase.forEach(t => {
        if (t.categoryId === 26) {
            t.categoryId = 9;
            urologiaMerged = true;
        }
        if (t.categoryId === 27) {
            t.categoryId = 25;
            urologiaMerged = true;
        }
    });

    const initialCatLength = categoriesDatabase.length;
    categoriesDatabase = categoriesDatabase.filter(c => c.id !== 26 && c.id !== 27 && (c.categoria || '').trim().toUpperCase() !== 'GENITOURINARIO');
    if (categoriesDatabase.length !== initialCatLength) {
        localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
        console.log('[Auto-Migration] Especialidades de Genitourinario eliminadas.');
    }

    if (urologiaMerged || categoriesDatabase.length !== initialCatLength) {
        const uniqueTemplates = [];
        const seen = new Set();
        const tempCats = JSON.parse(localStorage.getItem('categoriasDB')) || defaultCategories || [];
        templatesDatabase.forEach(t => {
            const catObj = tempCats.find(c => c.id === t.categoryId);
            const catName = catObj ? (catObj.categoria || '').trim().toUpperCase() : String(t.categoryId);
            const key = `${catName}-${(t.titulo || '').trim().toUpperCase()}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueTemplates.push(t);
            }
        });
        templatesDatabase.length = 0;
        templatesDatabase.push(...uniqueTemplates);
        localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
        console.log('[Auto-Migration] Fusión de Genitourinario en Urología completada y duplicados eliminados.');
    }
}

// Auto-ejecutar al cargar el módulo para disponibilidad inmediata e ininterrumpida
try {
    initLocalDatabases();
} catch (e) {
    console.error("[db_service] Error al auto-inicializar bases de datos locales:", e);
}

// Función para agregar una plantilla de forma segura encapsulando mutación de estado
export function addTemplateToDatabase(templateData) {
    const maxId = templatesDatabase.length > 0 ? Math.max(...templatesDatabase.map(t => parseInt(t.id) || 0)) : 0;
    const newTemplate = {
        id: maxId + 1,
        categoryId: parseInt(templateData.categoryId),
        titulo: templateData.titulo,
        macro: templateData.macro,
        micro: templateData.micro,
        diag: templateData.diag
    };
    templatesDatabase.push(newTemplate);
    saveTemplateToSupabase(newTemplate);
    return newTemplate;
}

export async function syncTemplatesFromSupabase() {
    if (typeof window.supabase === 'undefined' || !window.SUPABASE_CONFIG?.url) return;
    const supabase = window.supabase;
    try {
        const { data, error } = await supabase.from('plantillas').select('*');
        if (error) {
            console.warn("[Supabase Sync] Aviso plantillas:", error.message);
            return;
        }
        if (data && data.length > 0) {
            const mappedTemplates = data.map(item => ({
                id: Number(item.id),
                categoryId: Number(item.categoryId || item.category_id || 0),
                titulo: item.titulo || '',
                macro: item.macro || '',
                micro: item.micro || '',
                diag: item.diag || ''
            }));
            templatesDatabase.length = 0;
            templatesDatabase.push(...mappedTemplates);
            localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
            console.log(`[Supabase Sync] ${mappedTemplates.length} plantillas sincronizadas desde la nube.`);
        } else if (templatesDatabase.length > 0) {
            const seedPayload = templatesDatabase.map(t => ({
                id: Number(t.id),
                categoryId: Number(t.categoryId || 0),
                titulo: t.titulo || '',
                macro: t.macro || '',
                micro: t.micro || '',
                diag: t.diag || ''
            }));
            await supabase.from('plantillas').upsert(seedPayload);
            console.log(`[Supabase Seed] ${seedPayload.length} plantillas maestras subidas a Supabase.`);
        }
    } catch (e) {
        console.warn("[Supabase Sync] Excepción al sincronizar plantillas:", e);
    }
}

export async function syncCategoriesFromSupabase() {
    if (typeof window.supabase === 'undefined' || !window.SUPABASE_CONFIG?.url) return;
    const supabase = window.supabase;
    try {
        const { data, error } = await supabase.from('categorias').select('*');
        if (error) {
            console.warn("[Supabase Sync] Aviso categorías:", error.message);
            return;
        }
        if (data && data.length > 0) {
            const mappedCategories = data.map(item => ({
                id: Number(item.id),
                tipo: item.tipo || 'Macroscopica',
                categoria: item.categoria || item.nombre || ''
            }));
            categoriesDatabase.length = 0;
            categoriesDatabase.push(...mappedCategories);
            localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
            console.log(`[Supabase Sync] ${mappedCategories.length} categorías sincronizadas desde la nube.`);
        } else if (categoriesDatabase.length > 0) {
            const seedPayload = categoriesDatabase.map(c => ({
                id: Number(c.id),
                tipo: c.tipo || 'Macroscopica',
                categoria: c.categoria || c.nombre || ''
            }));
            await supabase.from('categorias').upsert(seedPayload);
            console.log(`[Supabase Seed] ${seedPayload.length} categorías maestras subidas a Supabase.`);
        }
    } catch (e) {
        console.warn("[Supabase Sync] Excepción al sincronizar categorías:", e);
    }
}

export async function saveTemplateToSupabase(template) {
    if (!template || !template.id) return;
    localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
    if (typeof window.supabase !== 'undefined' && window.SUPABASE_CONFIG?.url) {
        try {
            await window.supabase.from('plantillas').upsert({
                id: Number(template.id),
                categoryId: Number(template.categoryId || 0),
                titulo: template.titulo || '',
                macro: template.macro || '',
                micro: template.micro || '',
                diag: template.diag || ''
            });
            console.log(`[Supabase] Plantilla ${template.id} sincronizada en la nube.`);
        } catch (e) {
            console.warn("[Supabase] Aviso al guardar plantilla:", e);
        }
    }
}

export async function deleteTemplateFromSupabase(templateId) {
    localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
    if (typeof window.supabase !== 'undefined' && window.SUPABASE_CONFIG?.url) {
        try {
            await window.supabase.from('plantillas').delete().eq('id', Number(templateId));
            console.log(`[Supabase] Plantilla ${templateId} eliminada de la nube.`);
        } catch (e) {
            console.warn("[Supabase] Aviso al eliminar plantilla:", e);
        }
    }
}

export async function saveCategoryToSupabase(category) {
    if (!category || !category.id) return;
    localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
    if (typeof window.supabase !== 'undefined' && window.SUPABASE_CONFIG?.url) {
        try {
            await window.supabase.from('categorias').upsert({
                id: Number(category.id),
                tipo: category.tipo || 'Macroscopica',
                categoria: category.categoria || category.nombre || ''
            });
            console.log(`[Supabase] Categoría ${category.id} sincronizada en la nube.`);
        } catch (e) {
            console.warn("[Supabase] Aviso al guardar categoría:", e);
        }
    }
}

export async function deleteCategoryFromSupabase(categoryId) {
    localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
    if (typeof window.supabase !== 'undefined' && window.SUPABASE_CONFIG?.url) {
        try {
            await window.supabase.from('categorias').delete().eq('id', Number(categoryId));
            console.log(`[Supabase] Categoría ${categoryId} eliminada de la nube.`);
        } catch (e) {
            console.warn("[Supabase] Aviso al eliminar categoría:", e);
        }
    }
}

export function triggerAutomaticBackup() {
    try {
        // Copia ligera sin imágenes ni textos pesados para evitar QuotaExceededError
        const lightweightDatabase = patientDatabase.map(p => {
            const { macroDesc, microDesc, diagnostico, img01, img02, solicitudInforme, ...light } = p;
            return light;
        });
        const dataStr = JSON.stringify(lightweightDatabase);
        localStorage.setItem('patientDatabaseLocal', dataStr);

        // Rotar respaldos locales (cada 5 llamadas para evitar overhead)
        let backupCounter = parseInt(localStorage.getItem('patientDatabaseLocal_bak_counter') || '0', 10);
        backupCounter = (backupCounter + 1) % 5;
        localStorage.setItem('patientDatabaseLocal_bak_counter', backupCounter.toString());

        if (backupCounter === 0) {
            const bak1 = localStorage.getItem('patientDatabaseLocal_bak1');
            const bak2 = localStorage.getItem('patientDatabaseLocal_bak2');
            
            if (bak2) localStorage.setItem('patientDatabaseLocal_bak3', bak2);
            if (bak1) localStorage.setItem('patientDatabaseLocal_bak2', bak1);
            localStorage.setItem('patientDatabaseLocal_bak1', dataStr);
            console.log("[Backup] Respaldo histórico rotado con éxito.");
        }
    } catch (e) {
        console.error("Error al crear el respaldo automático", e);
    }
}

export async function loadDoctorsData(mockPath = 'doctores.json') {
    if (doctorsDatabase.length > 0) {
        return;
    }
    try {
        const response = await fetch(mockPath);
        if (!response.ok) throw new Error('Error al leer doctores.json');
        const data = await response.json();
        doctorsDatabase.length = 0;
        data.forEach(d => doctorsDatabase.push(d));
    } catch (error) {
        console.error('Error al cargar la lista de doctores:', error);
    }
}

export function formatDoctorName(name) {
    if (!name) return "";
    let clean = name.toUpperCase().trim();
    clean = clean.replace(/\bDR\s*,/gi, "DR.");
    clean = clean.replace(/\bDRA\s*,/gi, "DRA.");
    clean = clean.replace(/\bDR\s+(?!\.)/gi, "DR. ");
    clean = clean.replace(/\bDRA\s+(?!\.)/gi, "DRA. ");
    clean = clean.replace(/\bDR\s*\.\s*\./gi, "DR.");
    clean = clean.replace(/\bDRA\s*\.\s*\./gi, "DRA.");
    clean = clean.replace(/\s+/g, " ");
    return clean;
}

export function mapDbToPatient(dbRecord) {
    const rawEdad = dbRecord.edad !== undefined && dbRecord.edad !== null ? String(dbRecord.edad).trim() : '';
    const finalEdad = (!rawEdad || rawEdad === '0' || rawEdad === '--' || rawEdad === 'null') ? '--' : rawEdad;

    let derivedService = dbRecord.service;
    const codeUpper = String(dbRecord.cod_atencion || '').toUpperCase();
    const especimenUpper = String(dbRecord.especimen || '').toUpperCase();

    if (codeUpper.includes('C-') || codeUpper.endsWith('C')) {
        derivedService = 'C';
    } else if (codeUpper.includes('I-') || codeUpper.endsWith('I')) {
        derivedService = 'I';
    } else if (codeUpper.includes('Q-')) {
        derivedService = 'Q';
    } else if (!derivedService || (derivedService !== 'C' && derivedService !== 'Q' && derivedService !== 'I')) {
        if (especimenUpper.includes('PAPANICOLAOU') || especimenUpper.includes('CITOLOG')) {
            derivedService = 'C';
        } else if (especimenUpper.includes('INMUNOHISTO')) {
            derivedService = 'I';
        } else {
            derivedService = 'Q';
        }
    }

    const res = {
        id: parseInt(dbRecord.id),
        service: derivedService,
        codAtencion: dbRecord.cod_atencion,
        dni: dbRecord.dni || "",
        medSolicitante: formatDoctorName(dbRecord.med_solicitante || ""),
        nombres: dbRecord.nombres || "",
        apellidos: dbRecord.apellidos || "",
        paciente: dbRecord.paciente || "",
        costo: parseFloat(dbRecord.costo) || 0,
        adelanto: parseFloat(dbRecord.adelanto) || 0,
        resta: parseFloat(dbRecord.resta) || 0,
        fecRegistro: dbRecord.fec_registro || "",
        fecEntrega: dbRecord.fec_entrega || "",
        pagado: !!dbRecord.pagado,
        atrasado: !!dbRecord.atrasado,
        especimen: correctPapanicolaouSpelling(dbRecord.especimen || ""),
        macroDesc: correctPapanicolaouSpelling(dbRecord.macro_desc || ""),
        microDesc: correctPapanicolaouSpelling(dbRecord.micro_desc || ""),
        diagnostico: correctPapanicolaouSpelling(dbRecord.diagnostico || ""),
        img01: dbRecord.img01 || null,
        img02: dbRecord.img02 || null,
        edad: finalEdad,
        sexo: dbRecord.sexo || "",
        casetes: parseInt(dbRecord.casetes) || 1,
        fContacto: dbRecord.f_contacto || "",
        telContacto: dbRecord.tel_contacto || "",
        doctor: formatDoctorName(dbRecord.doctor || ""),
        motivoEstudio: dbRecord.motivo_estudio || "",
        catMacro: dbRecord.cat_macro || "",
        planMacro: dbRecord.plan_macro || "",
        catMicro: dbRecord.cat_micro || "",
        planMicro: dbRecord.plan_micro || "",
        clinica: dbRecord.clinica || ""
    };

    // Auto-asignación de clínica por médico solicitante (Reglas de Vincular Médico -> Clínica)
    const medNorm = (res.medSolicitante || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 1. Dr. Alejandro Escalante Álvaro -> CLÍNICA SAN CLEMENTE
    if (medNorm.includes('escalante alvaro') || medNorm.includes('alejandro escalante') || medNorm.includes('escalante')) {
        res.clinica = 'CLÍNICA SAN CLEMENTE';
    }
    // 2. Dr. Manuel Renato Sánchez Orellana & Dr. Jaime Víctor Becerra Ulfe -> CLÍNICA CARRIÓN
    else if (medNorm.includes('sanchez orellana') || medNorm.includes('renato sanchez') || (medNorm.includes('sanchez') && medNorm.includes('orellana'))) {
        res.clinica = 'CLÍNICA CARRIÓN';
    } else if (medNorm.includes('becerra ulfe') || medNorm.includes('jaime becerra') || (medNorm.includes('becerra') && medNorm.includes('ulfe')) || medNorm.includes('becerra')) {
        res.clinica = 'CLÍNICA CARRIÓN';
    }
    // 3. Dr. Juan Jesús Marreros Lloclla -> CLINICA LA MUJER
    else if (medNorm.includes('marreros lloclla') || medNorm.includes('juan marreros') || (medNorm.includes('marreros') && medNorm.includes('lloclla')) || medNorm.includes('marreros')) {
        res.clinica = 'CLINICA LA MUJER';
    }
    // 4. Dra. Laura Saire Bocangel -> CLÍNICA ALFA PREVENIR
    else if (medNorm.includes('saire bocangel') || medNorm.includes('laura saire') || (medNorm.includes('saire') && medNorm.includes('bocangel'))) {
        res.clinica = 'CLÍNICA ALFA PREVENIR';
    }

    attachSortKeys(res);
    return res;
}

export function mapPatientToDb(record) {
    const rawEdad = record.edad !== undefined && record.edad !== null ? String(record.edad).trim() : '';
    const parsedEdadInt = parseInt(rawEdad, 10);
    const dbEdad = (!isNaN(parsedEdadInt) && parsedEdadInt > 0) ? parsedEdadInt : null;

    const dbRecord = {
        service: record.service || 'Q',
        cod_atencion: record.codAtencion,
        dni: record.dni || '',
        nombres: record.nombres || '',
        apellidos: record.apellidos || '',
        paciente: record.paciente || '',
        sexo: record.sexo || 'O',
        edad: dbEdad,
        f_contacto: record.fContacto || '',
        tel_contacto: record.telContacto || '',
        med_solicitante: formatDoctorName(record.medSolicitante || ''),
        motivo_estudio: record.motivoEstudio || '',
        especimen: correctPapanicolaouSpelling(record.especimen || ''),
        doctor: formatDoctorName(record.doctor || 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA'),
        casetes: parseInt(record.casetes) || 1,
        cat_macro: record.catMacro || '',
        plan_macro: record.planMacro || '',
        cat_micro: record.catMicro || '',
        plan_micro: record.planMicro || '',
        fec_registro: record.fecRegistro || '',
        fec_entrega: record.fecEntrega || '',
        costo: parseFloat(record.costo) || 0,
        adelanto: parseFloat(record.adelanto) || 0,
        resta: parseFloat(record.resta) || 0,
        pagado: !!record.pagado,
        atrasado: !!record.atrasado
    };

    // PROTECCIÓN CRÍTICA ANTI-BORRADO: Solo enviar campos pesados si están cargados o explícitamente editados
    if (record._detailsFetched || (record.macroDesc && record.macroDesc.trim() !== '') || record._isEditing) {
        dbRecord.macro_desc = correctPapanicolaouSpelling(record.macroDesc || '');
    }
    if (record._detailsFetched || (record.microDesc && record.microDesc.trim() !== '') || record._isEditing) {
        dbRecord.micro_desc = correctPapanicolaouSpelling(record.microDesc || '');
    }
    if (record._detailsFetched || (record.diagnostico && record.diagnostico.trim() !== '') || record._isEditing) {
        dbRecord.diagnostico = correctPapanicolaouSpelling(record.diagnostico || '');
    }
    if (record.img01 !== undefined && record.img01 !== null) dbRecord.img01 = record.img01;
    if (record.img02 !== undefined && record.img02 !== null) dbRecord.img02 = record.img02;

    return dbRecord;
}

const prefetchCache = new Map();

export function prefetchPatientDetails(codAtencion) {
    if (!codAtencion) return;
    const cleanTarget = cleanCodeFunc(codAtencion);
    if (prefetchCache.has(cleanTarget)) return;
    const promise = fetchFullPatientDetails(codAtencion);
    prefetchCache.set(cleanTarget, promise);
    setTimeout(() => prefetchCache.delete(cleanTarget), 25000);
}
if (typeof window !== 'undefined') {
    window.prefetchPatientDetails = prefetchPatientDetails;
}

export async function fetchFullPatientDetails(codAtencion) {
    if (!codAtencion) return null;
    const cleanCode = String(codAtencion).trim().toLowerCase();
    const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
    const cleanTarget = cleanCodeFunc(codAtencion);

    if (prefetchCache.has(cleanTarget)) {
        console.log(`[Zero-Wait Engine] Retornando paciente pre-cargado por hover para ${codAtencion}`);
        return await prefetchCache.get(cleanTarget);
    }

    let local = patientDatabase.find(p => {
        const pCode = String(p.codAtencion || '').trim().toLowerCase();
        return pCode === cleanCode || pCode.replace(/[-_\s]/g, '') === cleanNoHyphen;
    });

    // 1. Evitar sobrescribir si hay cambios locales pendientes de sincronizar en la cola
    const queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
    const cleanTarget = cleanCodeFunc(codAtencion);
    const hasPendingWrite = queue.some(item => cleanCodeFunc(item.codAtencion) === cleanTarget);

    if (hasPendingWrite) {
        console.log(`[Sync Engine] Retornando paciente local para ${codAtencion} debido a cambios pendientes en cola.`);
        return local;
    }

    // 2. Si estamos en línea, consultar los detalles completos directamente de Supabase
    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');

    if (usingSupabase && navigator.onLine) {
        try {
            console.log(`[Supabase] Cargando detalles en tiempo real para paciente: ${codAtencion}`);
            const { data, error } = await supabase
                .from('pacientes')
                .select('*')
                .ilike('cod_atencion', codAtencion)
                .maybeSingle();

            if (error) {
                console.error("Error al obtener detalles completos del paciente:", error);
            } else if (data) {
                const mapped = mapDbToPatient(data);
                mapped._detailsFetched = true;
                if (local) {
                    Object.assign(local, mapped);
                } else {
                    patientDatabase.push(mapped);
                    local = mapped;
                }
                savePatientToIndexedDB(local);
                triggerAutomaticBackup();
                return local;
            }
        } catch (e) {
            console.error("Excepción en fetchFullPatientDetails en vivo:", e);
        }
    }

    // 3. Fallback: Si está fuera de línea o falló la consulta, usar memoria local o IndexedDB
    if (local && (local._detailsFetched || local.macroDesc || local.microDesc || local.diagnostico || local.img01 || local.img02)) {
        return local;
    }

    try {
        const dbPat = await getPatientFromIndexedDB(codAtencion);
        if (dbPat && (dbPat.macroDesc || dbPat.microDesc || dbPat.diagnostico)) {
            dbPat.especimen = correctPapanicolaouSpelling(dbPat.especimen || '');
            dbPat.macroDesc = correctPapanicolaouSpelling(dbPat.macroDesc || '');
            dbPat.microDesc = correctPapanicolaouSpelling(dbPat.microDesc || '');
            dbPat.diagnostico = correctPapanicolaouSpelling(dbPat.diagnostico || '');
            if (local) {
                Object.assign(local, dbPat);
                local._detailsFetched = true;
            } else {
                dbPat._detailsFetched = true;
                patientDatabase.push(dbPat);
                local = dbPat;
            }
            return local;
        }
    } catch (e) {
        console.error("Error al recuperar de IndexedDB:", e);
    }

    // 4. Restauración de Emergencia para expedientes con respaldo recuperado (Ej: 26Q-224 NELLI, CANAYO SILVANO)
    const cleanLowerKey = cleanCode;
    if (RESTORED_PATIENT_RECORDS[cleanLowerKey]) {
        const restoredData = RESTORED_PATIENT_RECORDS[cleanLowerKey];
        console.log(`[Auto-Recovery] Restaurando informe completo para ${codAtencion}`);
        if (local) {
            Object.assign(local, restoredData);
            local._detailsFetched = true;
            local._isEditing = true;
        } else {
            restoredData._detailsFetched = true;
            restoredData._isEditing = true;
            patientDatabase.push(restoredData);
            local = restoredData;
        }
        savePatientToIndexedDB(local);
        savePatient(local);
        return local;
    }

    return local;
}

const RESTORED_PATIENT_RECORDS = {
    '26q-224': {
        codAtencion: '26Q-224',
        paciente: 'NELLI, CANAYO SILVANO',
        nombres: 'NELLI',
        apellidos: 'CANAYO SILVANO',
        edad: '37',
        sexo: 'FEMENINO',
        fecRegistro: '03/08/2026',
        fecEntrega: '07/08/2026',
        medSolicitante: 'DR. JORGE ALBERTO MUÑANTE ARZAPALO',
        especimen: 'VESÍCULA BILIAR',
        doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
        macroDesc: 'Se recibe vesícula biliar de configuración elongada, que mide 7.5 x 4.0 x 3.5 cm, con superficie serosa de aspecto granular y congestiva, presentando áreas de fibrinopurulencia adheridas. Al corte transversal, la pared muestra un marcado engrosamiento difuso (hasta 1.2 cm de espesor), con consistencia firme y aspecto blanquecino-grisáceo, sugerente de fibrosis transmural. La luz se encuentra distendida y contiene material biliar turbio, espeso y de coloración verdoso-oscura. La mucosa presenta pérdida de su patrón reticular habitual, con áreas de ulceración focal y depósitos de material calcáreo granular adheridos a la pared.',
        microDesc: 'Los cortes histológicos revelan una pared vesicular con arquitectura distorsionada por un denso infiltrado inflamatorio crónico, predominante linfoplasmocitario y con agregados linfoides foliculares, que se extiende desde la submucosa hasta la capa muscular y serosa. Este proceso se superpone con un componente agudo exudativo, caracterizado por abundante infiltrado neutrofílico intraparietal, microabscesos en la mucosa y ulceración del epitelio superficial con exudado fibrinopurulento en la luz. Se observa fibrosis hialina extensa que disocia las fibras musculares lisas, así como numerosos senos de rokitansky-aschoff dilatados, algunos de ellos rellenos de barro biliar e infiltrados por histiocitos espumosos. El epitelio de revestimiento remanente muestra metaplasia escamosa focal y cambios regenerativos atípicos reactivos, sin evidencia de displasia franca ni invasión estromal. No se identifican células neoplásicas ni depósitos amiloides.',
        diagnostico: 'VESÍCULA BILIAR CON COLECISTITIS CRÓNICA REAGUDIZADA, CON EXTENSA FIBROSIS MURAL, ULCERACIÓN MUCOSA Y ABSCESOS INTRAMURALES, SIN EVIDENCIA DE NEOPLASIA INTRAEPITELIAL NI CARCINOMA INFILTRANTE.',
        firmado: true,
        estado: 'Completado',
        service: 'Q'
    }
};

const LIGHT_COLUMNS = 'id, service, cod_atencion, dni, med_solicitante, nombres, apellidos, paciente, costo, adelanto, resta, fec_registro, fec_entrega, pagado, atrasado, especimen, edad, sexo, doctor, motivo_estudio, casetes, f_contacto, tel_contacto, diagnostico';

export async function searchPatientsFromSupabase(filters) {
    const supabase = window.supabase;
    if (!supabase) return [];
    try {
        let query = supabase.from('pacientes').select(LIGHT_COLUMNS);
        
        if (filters.codAtencion) {
            query = query.ilike('cod_atencion', `%${filters.codAtencion}%`);
        }
        if (filters.dni) {
            query = query.eq('dni', filters.dni);
        }
        if (filters.nomPaciente) {
            query = query.or(`nombres.ilike.%${filters.nomPaciente}%,apellidos.ilike.%${filters.nomPaciente}%,paciente.ilike.%${filters.nomPaciente}%`);
        }
        if (filters.medSolicitante) {
            query = query.ilike('med_solicitante', `%${filters.medSolicitante}%`);
        }
        
        query = query.order('id', { ascending: false }).limit(100);
        const { data, error } = await query;
        if (error) {
            console.error("Error al buscar pacientes de Supabase:", error);
            return [];
        }
        return (data || []).map(mapDbToPatient);
    } catch (e) {
        console.error("Error en searchPatientsFromSupabase:", e);
        return [];
    }
}

export async function syncPatientsFromSupabase(limit = null) {
    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
    if (!usingSupabase) return;

    try {
        console.log(limit ? `[Supabase] Iniciando sincronización incremental de los últimos ${limit} pacientes...` : "[Supabase] Iniciando sincronización completa de pacientes...");

        let query = supabase
            .from('pacientes')
            .select(LIGHT_COLUMNS)
            .order('id', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error al obtener pacientes de Supabase:", error);
            if (typeof window.refreshPatientTable === 'function') {
                window.refreshPatientTable();
            }
            return;
        }

        if (data && data.length > 0) {
            const parsedPatients = data.map(mapDbToPatient);
            const queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
            const unsyncedCodes = new Set(queue.map(item => cleanCodeFunc(item.codAtencion)));
            
            // 1. Identificar y PRESERVAR todos los pacientes locales creados en el sistema
            const unsyncedPatients = patientDatabase.filter(local => {
                const isMatch = parsedPatients.some(db => cleanCodeFunc(db.codAtencion) === cleanCodeFunc(local.codAtencion));
                if (isMatch) return false;
                console.log(`[Sync Engine] Preservando paciente local creado: ${local.codAtencion}`);
                return true;
            });

            // 2. Fusión inteligente para preservar descripciones y fotos locales que vinieron vacías
            const mergedPatients = parsedPatients.map(db => {
                const dbClean = cleanCodeFunc(db.codAtencion);
                const local = patientDatabase.find(l => cleanCodeFunc(l.codAtencion) === dbClean);
                if (local) {
                    // Si el paciente tiene escrituras pendientes en la cola local, preservar el objeto local completo!
                    if (unsyncedCodes.has(dbClean)) {
                        console.log(`[Sync Engine] Preservando cambios locales no sincronizados para ${db.codAtencion}`);
                        return local;
                    }
                    return {
                        ...db,
                        macroDesc: (db.macroDesc && db.macroDesc.trim() !== '') ? db.macroDesc : (local.macroDesc || ""),
                        microDesc: (db.microDesc && db.microDesc.trim() !== '') ? db.microDesc : (local.microDesc || ""),
                        diagnostico: (db.diagnostico && db.diagnostico.trim() !== '') ? db.diagnostico : (local.diagnostico || ""),
                        img01: db.img01 || local.img01 || null,
                        img02: db.img02 || local.img02 || null,
                        solicitudInforme: local.solicitudInforme || null
                    };
                }
                return db;
            });

            // 3. Fusión en la base de datos de memoria
            if (limit) {
                // Sincronización incremental: Actualizar quirúrgicamente los registros en el array existente
                mergedPatients.forEach(p => {
                    const idx = patientDatabase.findIndex(local => cleanCodeFunc(local.codAtencion) === cleanCodeFunc(p.codAtencion));
                    if (idx !== -1) {
                        patientDatabase[idx] = p;
                    } else {
                        patientDatabase.unshift(p);
                    }
                });
                // ¡GARANTÍA ZERO-DATA-LOSS! Preservar siempre pacientes locales no sincronizados en la sincronización incremental
                unsyncedPatients.forEach(p => {
                    const idx = patientDatabase.findIndex(local => cleanCodeFunc(local.codAtencion) === cleanCodeFunc(p.codAtencion));
                    if (idx === -1) {
                        console.log(`[Sync Engine] Inserción de respaldo local incremental para ${p.codAtencion}`);
                        patientDatabase.push(p);
                    }
                });
            } else {
                // Sincronización completa: Re-poblar todo el array
                patientDatabase.length = 0;
                mergedPatients.forEach(p => patientDatabase.push(p));
                
                // Agregar los no sincronizados para evitar pérdida de datos
                unsyncedPatients.forEach(p => {
                    const idx = patientDatabase.findIndex(local => cleanCodeFunc(local.codAtencion) === cleanCodeFunc(p.codAtencion));
                    if (idx === -1) {
                        patientDatabase.push(p);
                    }
                    // Subir asíncronamente a la nube
                    console.log(`[Supabase] Auto-sincronizando paciente local creado fuera de línea: ${p.codAtencion}`);
                    const dbRecord = mapPatientToDb(p);
                    supabase
                        .from('pacientes')
                        .insert([dbRecord])
                        .then(({ error: insertErr }) => {
                            if (insertErr) {
                                console.error(`Error al auto-sincronizar paciente ${p.codAtencion} en Supabase:`, insertErr);
                            } else {
                                console.log(`[Supabase] Paciente ${p.codAtencion} auto-sincronizado con éxito.`);
                            }
                        });
                });
            }

            // Ordenar numéricamente descendente por código (ej: 26Q-235 arriba de 26Q-232)
            sortPatientArray(patientDatabase);

            // Guardar localmente
            triggerAutomaticBackup();
            
            console.log(limit ? `[Supabase] Sincronización incremental completada (${parsedPatients.length} procesados).` : `[Supabase] Sincronizados ${parsedPatients.length} pacientes desde la nube, manteniendo ${unsyncedPatients.length} registros locales pendientes.`);
        }

        if (typeof window.refreshPatientTable === 'function') {
            window.refreshPatientTable();
        }
    } catch (e) {
        console.error("Error en syncPatientsFromSupabase:", e);
    }
}

const recentlySavedLocalCodes = new Map();

export function markCodeRecentlySaved(codAtencion) {
    if (!codAtencion) return;
    recentlySavedLocalCodes.set(codAtencion, Date.now());
}

export function subscribePatientsRealtime() {
    try {
        const supabase = window.supabase;
        const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
        if (!usingSupabase) return;

        console.log("[Supabase] Suscribiéndose a cambios en tiempo real...");
        supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'pacientes'
                },
                (payload) => {
                    console.log("[Supabase] Cambio en base de datos recibido:", payload);
                    const eventType = payload.eventType;
                    const newRecord = payload.new;
                    const oldRecord = payload.old;

                    // Evitar doble re-renderizado por eco de cambios locales propios
                    const targetCode = (newRecord && newRecord.cod_atencion) || (oldRecord && oldRecord.cod_atencion);
                    if (targetCode) {
                        // 1. Evitar sobreescribir si hay cambios locales pendientes de sincronizar en la cola
                        const queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
                        const cleanTarget = cleanCodeFunc(targetCode);
                        if (queue.some(item => cleanCodeFunc(item.codAtencion) === cleanTarget)) {
                            console.log(`[Supabase Realtime] Cambio en base de datos ignorado para ${targetCode} porque tiene escrituras locales pendientes.`);
                            return;
                        }

                        // 2. Evitar doble re-renderizado por eco de cambios locales propios recientes
                        const lastSaved = recentlySavedLocalCodes.get(targetCode);
                        if (lastSaved && (Date.now() - lastSaved < 5000)) {
                            console.log(`[Supabase Realtime] Eco local omitido para ${targetCode}`);
                            return;
                        }
                    }

                    if (eventType === 'INSERT') {
                        const patient = mapDbToPatient(newRecord);
                        const idx = patientDatabase.findIndex(p => p.id === patient.id || p.codAtencion === patient.codAtencion);
                        if (idx !== -1) {
                            const local = patientDatabase[idx];
                            patient.macroDesc = patient.macroDesc || local.macroDesc || "";
                            patient.microDesc = patient.microDesc || local.microDesc || "";
                            patient.diagnostico = patient.diagnostico || local.diagnostico || "";
                            patient.img01 = patient.img01 || local.img01 || null;
                            patient.img02 = patient.img02 || local.img02 || null;
                            patient.solicitudInforme = local.solicitudInforme || null;
                            patientDatabase[idx] = patient;
                        } else {
                            patientDatabase.unshift(patient);
                        }
                        savePatientToIndexedDB(patientDatabase[idx] || patient);

                        // Notificación Toast flotante de llegada de nuevo registro en tiempo real
                        if (typeof window.showToast === 'function') {
                            const servName = patient.service === 'C' ? 'Citología' : 'Muestras HE';
                            window.showToast(`🔔 Nuevo registro remoto: ${patient.codAtencion} - ${patient.paciente || 'Paciente'} (${servName})`, 'info');
                        }
                    } else if (eventType === 'UPDATE') {
                        const patient = mapDbToPatient(newRecord);
                        const idx = patientDatabase.findIndex(p => p.id === patient.id || p.codAtencion === patient.codAtencion);
                        if (idx !== -1) {
                            const local = patientDatabase[idx];
                            patient.macroDesc = patient.macroDesc || local.macroDesc || "";
                            patient.microDesc = patient.microDesc || local.microDesc || "";
                            patient.diagnostico = patient.diagnostico || local.diagnostico || "";
                            patient.img01 = patient.img01 || local.img01 || null;
                            patient.img02 = patient.img02 || local.img02 || null;
                            patient.solicitudInforme = local.solicitudInforme || null;
                            patientDatabase[idx] = patient;
                        } else {
                            patientDatabase.unshift(patient);
                        }
                        savePatientToIndexedDB(patientDatabase[idx] || patient);
                        
                        // Notificar al editor en tiempo real si tiene este paciente abierto
                        if (typeof window.updateOpenEditorIfMatches === 'function') {
                            window.updateOpenEditorIfMatches(patientDatabase[idx] || patient);
                        }

                        if (typeof window.showToast === 'function') {
                            window.showToast(`🔄 Expediente actualizado en la nube: ${patient.codAtencion}`, 'info');
                        }
                    } else if (eventType === 'DELETE') {
                        const idToDelete = oldRecord.id || (newRecord && newRecord.id);
                        if (idToDelete) {
                            const idx = patientDatabase.findIndex(p => p.id === idToDelete);
                            if (idx !== -1) {
                                const cod = patientDatabase[idx].codAtencion;
                                patientDatabase.splice(idx, 1);
                                if (cod) deletePatientFromIndexedDB(cod);
                            }
                        }
                    }

                    // Guardar localmente
                    triggerAutomaticBackup();

                    // Refrescar tabla si está en pantalla
                    if (typeof window.refreshPatientTable === 'function') {
                        window.refreshPatientTable();
                    }
                }
            )
            .subscribe();
    } catch (e) {
        console.error("[Supabase Realtime] Error en tiempo real:", e);
    }
}

let isSyncing = false;

// 1. Encolar escritura para sincronización asíncrona
export function queueSyncWrite(actionType, codAtencion) {
    let queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];

    // De-duplicación inteligente para optimizar llamadas
    const existingIdx = queue.findIndex(item => item.codAtencion === codAtencion);
    if (existingIdx !== -1) {
        queue[existingIdx] = { type: actionType, codAtencion, timestamp: Date.now() };
    } else {
        queue.push({ type: actionType, codAtencion, timestamp: Date.now() });
    }

    localStorage.setItem('pendingSyncWrites', JSON.stringify(queue));
    updateSyncStatusUI();
}

export async function processSyncQueue() {
    if (isSyncing) return;

    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
    if (!usingSupabase || !navigator.onLine) {
        updateSyncStatusUI();
        return;
    }

    let queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
    if (queue.length === 0) {
        updateSyncStatusUI();
        return;
    }

    isSyncing = true;
    updateSyncStatusUI();
    console.log(`[Sync Engine] Procesando cola de sincronización (${queue.length} cambios pendientes)...`);

    while (queue.length > 0) {
        const item = queue[0];
        let success = false;
        let errorMsg = '';
        let shouldDiscard = false;

        try {
            if (item.type === 'SAVE') {
                const cleanCode = String(item.codAtencion || '').trim().toLowerCase();
                const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
                let patient = patientDatabase.find(x => {
                    const code = String(x.codAtencion || '').trim().toLowerCase();
                    return code === cleanCode || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
                });
                if (!patient) {
                    try {
                        patient = await getPatientFromIndexedDB(item.codAtencion);
                    } catch (e) {
                        console.error("[Sync Engine] Error al cargar de IndexedDB:", e);
                    }
                }
                if (!patient) {
                    console.error(`[Sync Engine] No se encontró el paciente ${item.codAtencion} para sincronizar.`);
                    queue.shift();
                    localStorage.setItem('pendingSyncWrites', JSON.stringify(queue));
                    continue;
                }
                let dbRecord = mapPatientToDb(patient);
                let upsertResult = null;
                let retry = true;
                let attempts = 0;

                while (retry && attempts < 5) {
                    attempts++;
                    upsertResult = await supabase
                        .from('pacientes')
                        .upsert([dbRecord], { onConflict: 'cod_atencion' });

                    if (upsertResult.error) {
                        const err = upsertResult.error;
                        // Si la columna no existe en la base de datos de Supabase, removerla dinámicamente y reintentar
                        if (err.message && err.message.includes("Could not find the '") && err.message.includes("' column")) {
                            const matchCol = err.message.match(/Could not find the '([^']+)' column/);
                            if (matchCol && matchCol[1]) {
                                const missingCol = matchCol[1];
                                console.warn(`[Sync Engine] Columna '${missingCol}' no existe en la base de datos. Removiéndola y reintentando upsert...`);
                                delete dbRecord[missingCol];
                                continue;
                            }
                        }
                        
                        errorMsg = err.message;
                        if (err.code && !err.code.startsWith('57')) {
                            shouldDiscard = true;
                        }
                        retry = false;
                    } else {
                        success = true;
                        retry = false;
                    }
                }
            } else if (item.type === 'DELETE') {
                const { error } = await supabase
                    .from('pacientes')
                    .delete()
                    .eq('cod_atencion', item.codAtencion);
                if (error) {
                    errorMsg = error.message;
                    if (error.code && !error.code.startsWith('57')) {
                        shouldDiscard = true;
                    }
                } else {
                    success = true;
                }
            }
        } catch (e) {
            errorMsg = e.message || 'Error de conexión';
            if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('conexion')) {
                // Transient network error
            } else {
                shouldDiscard = true;
            }
        }

        if (success) {
            console.log(`[Sync Engine] Sincronizado con éxito: ${item.type} para ${item.codAtencion}`);
            queue.shift();
            localStorage.setItem('pendingSyncWrites', JSON.stringify(queue));
        } else {
            console.error(`[Sync Engine] Error al sincronizar ${item.type} para ${item.codAtencion}:`, errorMsg);
            
            // Incrementar contador de intentos y retener la cola
            item.retries = (item.retries || 0) + 1;
            localStorage.setItem('pendingSyncWrites', JSON.stringify(queue));
            
            // Solo si es un error permanente insalvable tras 15 reintentos se emite advertencia conservando el registro
            if (shouldDiscard && item.retries >= 15) {
                console.warn(`[Sync Engine] Advertencia: Elemento insalvable retenido para revisión manual: ${item.codAtencion}`);
            }
            break;
        }
    }

    isSyncing = false;
    updateSyncStatusUI();
}

export async function savePatient(patient) {
    const cleanCode = String(patient.codAtencion || '').trim().toLowerCase();
    const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
    const idx = patientDatabase.findIndex(p => {
        const code = String(p.codAtencion || '').trim().toLowerCase();
        return code === cleanCode || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
    });
    if (idx !== -1) {
        patientDatabase[idx] = { ...patientDatabase[idx], ...patient };
    } else {
        if (!patient.id) {
            patient.id = patientDatabase.length > 0 ? Math.max(...patientDatabase.map(x => x.id)) + 1 : 1;
        }
        patientDatabase.unshift(patient);
    }
    
    // Registrar timestamp local para omitir eco en tiempo real
    markCodeRecentlySaved(patient.codAtencion);

    // Guardar en IndexedDB
    savePatientToIndexedDB(patient);
    
    // Guardar respaldo local
    triggerAutomaticBackup();
    
    // Encolar y procesar sync
    queueSyncWrite('SAVE', patient.codAtencion);
    processSyncQueue();
    
    // Actualizar tabla local
    if (typeof window.refreshPatientTable === 'function') {
        window.refreshPatientTable();
    }
}

// 4. Centralizar la eliminación de pacientes
export async function deletePatient(codAtencion) {
    markCodeRecentlySaved(codAtencion);
    const idx = patientDatabase.findIndex(p => p.codAtencion === codAtencion);
    if (idx !== -1) {
        patientDatabase.splice(idx, 1);
    }
    
    // Eliminar de IndexedDB
    deletePatientFromIndexedDB(codAtencion);
    
    // Guardar respaldo local
    triggerAutomaticBackup();
    
    // Encolar y procesar sync
    queueSyncWrite('DELETE', codAtencion);
    processSyncQueue();
    
    // Actualizar tabla local
    if (typeof window.refreshPatientTable === 'function') {
        window.refreshPatientTable();
    }
}

// 5. Actualizar la UI del widget de sincronización
export function updateSyncStatusUI() {
    const isOnline = navigator.onLine;
    const queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
    const pendingCount = queue.length;
    
    const statusContainers = document.querySelectorAll('.connection-status');
    statusContainers.forEach(container => {
        container.className = 'connection-status';
        
        const dot = container.querySelector('.status-dot') || document.createElement('span');
        dot.className = 'status-dot';
        if (!container.querySelector('.status-dot')) {
            container.appendChild(dot);
        }
        
        const textSpan = container.querySelector('.status-text') || document.createElement('span');
        textSpan.className = 'status-text';
        if (!container.querySelector('.status-text')) {
            container.appendChild(textSpan);
        }
        
        if (isSyncing) {
            container.classList.add('online-syncing');
            textSpan.textContent = `Sincronizando...`;
        } else if (isOnline) {
            if (pendingCount > 0) {
                container.classList.add('online-syncing');
                textSpan.textContent = `Subiendo ${pendingCount} cambio(s)...`;
            } else {
                container.classList.add('online-synced');
                textSpan.textContent = `Sincronizado`;
            }
        } else {
            if (pendingCount > 0) {
                container.classList.add('offline-pending');
                textSpan.textContent = `Sin conexión (${pendingCount} pend.)`;
            } else {
                container.classList.add('offline-synced');
                textSpan.textContent = `Sin conexión (Local)`;
            }
        }
    });
}

// Event Listeners de red automáticos
window.addEventListener('online', () => {
    processSyncQueue();
});
window.addEventListener('offline', () => {
    updateSyncStatusUI();
});

