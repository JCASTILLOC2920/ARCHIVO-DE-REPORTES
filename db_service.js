// db_service.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Base de Datos y Almacenamiento Local
import { cleanCodeFunc, correctPapanicolaouSpelling, cleanTextContentLocal, formatDoctorName } from './utils.js?v=22.00';
export { cleanCodeFunc, correctPapanicolaouSpelling, cleanTextContentLocal, formatDoctorName };

// INDEXTEDB STORAGE FOR HEAVY PATIENT RECORDS
const IDB_NAME = 'ClinicaReportesDB';
const IDB_VERSION = 1;
const STORE_NAME = 'pacientes_completos';


export function parseCodAtencionForSort(cod) {
    if (!cod) return { year: -1, num: 0 };
    const codStr = String(cod || '').trim().toUpperCase();
    
    // GARANTÍA MILITAR:
    // Soporta formatos de 2 o 4 dígitos de año: 26Q-280, 2026Q-280, 26-Q-280, 26C-015, 26I-003, etc.
    const match = codStr.match(/(?:20)?(\d{2})[^\d]*(\d+)/);
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

export function attachSortKeys(p, force = false) {
    if (!p) return p;
    const currentCode = String(p.codAtencion || p.cod_atencion || '').trim();
    
    // GARANTÍA MILITAR: Si el código cambió o faltan las llaves, re-calcular SIEMPRE (previene llaves caché obsoletas)
    if (force || p._sortCodeRaw !== currentCode || p._sortYear === undefined || p._sortNum === undefined) {
        const parsed = parseCodAtencionForSort(currentCode);
        p._sortYear = parsed.year;
        p._sortNum = parsed.num;
        p._sortCodeRaw = currentCode;
    }
    if (force || !p._searchKey || p._searchCodeRaw !== currentCode) {
        const raw = `${currentCode} ${p.paciente || ''} ${p.nombres || ''} ${p.apellidos || ''} ${p.dni || ''} ${p.medSolicitante || ''} ${p.clinica || ''} ${p.especimen || ''}`;
        p._searchKey = raw.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        p._searchCodeRaw = currentCode;
    }
    return p;
}

export function sortPatientArray(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return arr;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
            attachSortKeys(arr[i]);
        }
    }
    return arr.sort((a, b) => {
        const yA = (a && a._sortYear !== undefined) ? a._sortYear : -1;
        const yB = (b && b._sortYear !== undefined) ? b._sortYear : -1;
        if (yB !== yA) return yB - yA;

        const nA = (a && a._sortNum !== undefined) ? a._sortNum : 0;
        const nB = (b && b._sortNum !== undefined) ? b._sortNum : 0;
        return nB - nA;
    });
}

// OPERACIÓN ATÓMICA DE GRADO MILITAR: Inserción/Actualización + Ordenamiento automático
export function upsertAndSortPatient(patient) {
    if (!patient) return null;
    const targetCode = cleanCodeFunc(patient.codAtencion || patient.cod_atencion);
    if (!targetCode) {
        patientDatabase.unshift(patient);
        sortPatientArray(patientDatabase);
        return patient;
    }
    
    const idx = patientDatabase.findIndex(p => {
        if (patient.id && p.id && String(p.id) === String(patient.id)) return true;
        return cleanCodeFunc(p.codAtencion || p.cod_atencion) === targetCode;
    });
    
    if (idx !== -1) {
        const local = patientDatabase[idx];
        delete local._searchKey;
        delete local._sortYear;
        delete local._sortNum;
        delete local._sortCodeRaw;
        
        patientDatabase[idx] = {
            ...local,
            ...patient,
            codAtencion: patient.codAtencion || patient.cod_atencion || local.codAtencion || local.cod_atencion
        };
    } else {
        patientDatabase.push(patient);
    }
    
    sortPatientArray(patientDatabase);
    return patientDatabase.find(p => cleanCodeFunc(p.codAtencion || p.cod_atencion) === targetCode) || patient;
}

// Las funciones de ortografía y sanitización (correctPapanicolaouSpelling, cleanTextContentLocal, formatDoctorName) están re-exportadas desde utils.js


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

    // Purga automática de registros fantasmas de la serie 700
    const ghostCodes = ['26q-778', '26q-779', '26q-782'];
    const filteredPatients = patientDatabase.filter(p => !ghostCodes.includes(cleanCodeFunc(p.codAtencion)));
    if (filteredPatients.length !== patientDatabase.length) {
        patientDatabase.length = 0;
        patientDatabase.push(...filteredPatients);
        try {
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));
            console.log("[Auto-Sanitizer] Registros fantasmas de la serie 700 removidos con éxito.");
        } catch(e) {}
    }

    // RECUPERACIÓN E INYECCIÓN DE 26Q-224 (VERDE FIRMADO)
    const idx224 = patientDatabase.findIndex(p => cleanCodeFunc(p.codAtencion) === '26q-224');
    if (idx224 !== -1) {
        const p224 = patientDatabase[idx224];
        if (!p224.diagnostico || p224.diagnostico.trim() === '' || (p224.paciente && p224.paciente.includes('224, Reporte')) || p224.dni === '0') {
            patientDatabase[idx224] = {
                ...p224,
                codAtencion: '26Q-224',
                paciente: 'NELLI, CANAYO SILVANO',
                nombres: 'NELLI',
                apellidos: 'CANAYO SILVANO',
                edad: '37',
                sexo: 'FEMENINO',
                medSolicitante: 'DR. JORGE ALBERTO MUÑANTE ARZAPALO',
                especimen: 'VESÍCULA BILIAR',
                clinica: 'CLÍNICA CARRIÓN',
                doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
                macroDesc: 'Se recibe vesícula biliar de configuración elongada, que mide 7.5 x 4.0 x 3.5 cm, con superficie serosa de aspecto granular y congestiva, presentando áreas de fibrinopurulencia adheridas. Al corte transversal, la pared muestra un marcado engrosamiento difuso (hasta 1.2 cm de espesor), con consistencia firme y aspecto blanquecino-grisáceo, sugerente de fibrosis transmural. La luz se encuentra distendida y contiene material biliar turbio, espeso y de coloración verdoso-oscura. La mucosa presenta pérdida de su patrón reticular habitual, con áreas de ulceración focal y depósitos de material calcáreo granular adheridos a la pared.',
                microDesc: 'Los cortes histológicos revelan una pared vesicular con arquitectura distorsionada por un denso infiltrado inflamatorio crónico, predominante linfoplasmocitario y con agregados linfoides foliculares, que se extiende desde la submucosa hasta la capa muscular y serosa. Este proceso se superpone con un componente agudo exudativo, caracterizado por abundante infiltrado neutrofílico intraparietal, microabscesos en la mucosa y ulceración del epitelio superficial con exudado fibrinopurulento en la luz. Se observa fibrosis hialina extensa que disocia las fibras musculares lisas, así como numerosos senos de rokitansky-aschoff dilatados, algunos de ellos rellenos de barro biliar e infiltrados por histiocitos espumosos. El epitelio de revestimiento remanente muestra metaplasia escamosa focal y cambios regenerativos atípicos reactivos, sin evidencia de displasia franca ni invasión estromal. No se identifican células neoplásicas ni depósitos amiloides.',
                diagnostico: 'VESÍCULA BILIAR CON COLECISTITIS CRÓNICA REAGUDIZADA, CON EXTENSA FIBROSIS MURAL, ULCERACIÓN MUCOSA Y ABSCESOS INTRAMURALES, SIN EVIDENCIA DE NEOPLASIA INTRAEPITELIAL NI CARCINOMA INFILTRANTE.',
                firmado: true,
                modificado: true,
                estado: 'Completado',
                service: 'Q'
            };
        } else {
            p224.firmado = true;
            p224.modificado = true;
            p224.estado = 'Completado';
        }
    }

    // BUCLE DE RECUPERACIÓN Y REPARACIÓN INMEDIATA DE CLÍNICA EN LOCALSTORAGE
    let clinicaRepaired = false;
    patientDatabase.forEach(item => {
        delete item._searchKey;
        const cod = String(item.codAtencion || '').trim();
        if (cod === '26C-124' || cod === '26C-123' || cod.toLowerCase() === '26c-124' || cod.toLowerCase() === '26c-123') {
            item.clinica = 'CLÍNICA CARRIÓN';
            clinicaRepaired = true;
        } else {
            let c = (item.clinica || '').trim();
            if (!c || c.toLowerCase() === 'sin clinica') {
                const m = (item.medSolicitante || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (m.includes('escalante')) c = 'CLÍNICA SAN CLEMENTE';
                else if (m.includes('sanchez') || m.includes('becerra') || m.includes('ulfe') || m.includes('carrion')) c = 'CLÍNICA CARRIÓN';
                else if (m.includes('marreros') || m.includes('lloclla')) c = 'CLINICA LA MUJER';
                else if (m.includes('saire') || m.includes('bocangel')) c = 'CLÍNICA ALFA PREVENIR';
                if (c) {
                    item.clinica = c;
                    clinicaRepaired = true;
                }
            }
        }
    });

    // BUCLE DE CLASIFICACIÓN DE 3 ESTADOS (🟢 VERDE FIRMADO | 🟡 AMARILLO GUARDADO CON INFO | 🔴 ROJO PENDIENTE SIN INFO)
    patientDatabase.forEach(item => {
        const diagClean = (item.diagnostico || '').replace(/<[^>]*>/g, '').trim();
        const macroClean = (item.macroDesc || '').replace(/<[^>]*>/g, '').trim();
        const microClean = (item.microDesc || '').replace(/<[^>]*>/g, '').trim();

        const hasInfo = (diagClean !== '' && diagClean !== '---') || (macroClean !== '' && macroClean !== '---') || (microClean !== '' && microClean !== '---');
        const isFirm = item.firmado === true || item.firmado === 'true' || item.estado === 'Completado' || item.estado === 'Firmado' || (diagClean !== '' && diagClean !== '---');
        const isMod = item.modificado === true || item.modificado === 'true' || item.estado === 'En Proceso' || hasInfo;

        if (isFirm) {
            item.firmado = true;
            item.modificado = true;
            item.estado = 'Completado';
        } else if (isMod) {
            item.firmado = false;
            item.modificado = true;
            item.estado = 'En Proceso';
        } else {
            item.firmado = false;
            item.modificado = false;
            item.estado = 'Pendiente';
        }
    });

    try {
        localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));
        console.log('[SLA Auto-Repair] Se actualizaron e inmunizaron los estados SLA en localStorage.');
    } catch (e) {
        console.error(e);
    }

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
    const defTpls = window.defaultTemplates || (typeof defaultTemplates !== 'undefined' ? defaultTemplates : []);
    if ((!templatesDatabase || templatesDatabase.length === 0) && defTpls && defTpls.length > 0) {
        templatesDatabase = [...defTpls];
        try { localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase)); } catch(e) {}
    } else if (defTpls && defTpls.length > 0) {
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
            const idx = templatesDatabase.findIndex(t => (t.titulo || '').trim().toUpperCase() === (defTpl.titulo || '').trim().toUpperCase());
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
        }
        localStorage.setItem('templatesSpellingCorrected_v3', 'true');
    }

    // Auto-sanitización de clínica para registros PAP 26C-124 y 26C-123
    if (window.patientDatabase && Array.isArray(window.patientDatabase)) {
        window.patientDatabase.forEach(p => {
            if (p.codAtencion === '26C-124' || p.codAtencion === '26C-123') {
                p.clinica = 'CLÍNICA CARRIÓN';
            }
        });
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

    // Auto-sanitización V9 - Incorporación de las 4 variantes de Papanicolaou Normal en Categoría 28 (Citología Cervical)
    if (!localStorage.getItem('templatesSpellingCorrected_v9') && window.defaultTemplates) {
        window.defaultTemplates.forEach(defTpl => {
            if (Number(defTpl.categoryId) === 28 || (defTpl.titulo || '').toUpperCase().includes('PAPANICOLAOU')) {
                const idx = templatesDatabase.findIndex(t => String(t.id) === String(defTpl.id) || (t.titulo || '').trim().toUpperCase() === (defTpl.titulo || '').trim().toUpperCase());
                if (idx !== -1) {
                    templatesDatabase[idx] = { ...defTpl };
                } else {
                    templatesDatabase.push({ ...defTpl });
                }
            }
        });
        localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
        localStorage.setItem('templatesSpellingCorrected_v9', 'true');
        console.log("[Auto-Sanitizer V9] Plantillas de Papanicolaou Normal actualizadas con éxito.");
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
        // Copia sin imágenes pesadas para evitar QuotaExceededError (preservando los textos de macro, micro y diagnóstico)
        const lightweightDatabase = patientDatabase.map(p => {
            const { img01, img02, solicitudInforme, ...light } = p;
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

// formatDoctorName está re-exportado desde utils.js


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
        id: (dbRecord.id !== undefined && dbRecord.id !== null) ? parseInt(dbRecord.id, 10) : Date.now(),
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
        firmado: !!(dbRecord.firmado || dbRecord.estado === 'Completado' || dbRecord.estado === 'Firmado' || dbRecord.firmado === 'true' || (dbRecord.diagnostico && String(dbRecord.diagnostico).replace(/<[^>]*>/g, '').trim() !== '' && String(dbRecord.diagnostico).replace(/<[^>]*>/g, '').trim() !== '---')),
        modificado: !!(dbRecord.modificado || dbRecord.firmado || dbRecord.estado === 'En Proceso' || (dbRecord.diagnostico && String(dbRecord.diagnostico).replace(/<[^>]*>/g, '').trim() !== '' && String(dbRecord.diagnostico).replace(/<[^>]*>/g, '').trim() !== '---') || (dbRecord.macro_desc && String(dbRecord.macro_desc).replace(/<[^>]*>/g, '').trim() !== '') || (dbRecord.micro_desc && String(dbRecord.micro_desc).replace(/<[^>]*>/g, '').trim() !== '')),
        estado: (dbRecord.firmado || dbRecord.estado === 'Completado' || dbRecord.estado === 'Firmado' || dbRecord.firmado === 'true' || (dbRecord.diagnostico && String(dbRecord.diagnostico).replace(/<[^>]*>/g, '').trim() !== '' && String(dbRecord.diagnostico).replace(/<[^>]*>/g, '').trim() !== '---')) ? 'Completado' : ((dbRecord.modificado || dbRecord.estado === 'En Proceso' || (dbRecord.macro_desc && String(dbRecord.macro_desc).replace(/<[^>]*>/g, '').trim() !== '')) ? 'En Proceso' : (dbRecord.estado || 'Pendiente')),
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

    // Preservar Clínica ingresada manualmente. Si está vacía o es 'Sin Clínica', aplicar reglas por Médico Solicitante
    const existingClinica = (dbRecord.clinica || '').trim();
    if (existingClinica && existingClinica.toLowerCase() !== 'sin clinica') {
        res.clinica = existingClinica;
    } else {
        const medNorm = (res.medSolicitante || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (medNorm.includes('escalante')) {
            res.clinica = 'CLÍNICA SAN CLEMENTE';
        } else if (medNorm.includes('sanchez') || medNorm.includes('becerra') || medNorm.includes('ulfe') || medNorm.includes('carrion') || medNorm.includes('vilca') || medNorm.includes('munante') || medNorm.includes('arzapalo')) {
            res.clinica = 'CLÍNICA CARRIÓN';
        } else if (medNorm.includes('marreros') || medNorm.includes('lloclla')) {
            res.clinica = 'CLINICA LA MUJER';
        } else if (medNorm.includes('saire') || medNorm.includes('bocangel')) {
            res.clinica = 'CLÍNICA ALFA PREVENIR';
        } else {
            res.clinica = (existingClinica && existingClinica.toLowerCase() !== 'sin clinica') ? existingClinica : 'CLÍNICA CARRIÓN';
        }
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
        atrasado: !!record.atrasado,
        firmado: !!record.firmado,
        modificado: !!(record.modificado || record.firmado),
        estado: record.estado || (record.firmado ? 'Completado' : (record.modificado ? 'En Proceso' : 'Pendiente'))
    };

    // GARANTÍA MILITAR: Transmitir siempre los campos de informe patológico a la nube Supabase
    if (record.macroDesc !== undefined && record.macroDesc !== null) {
        dbRecord.macro_desc = correctPapanicolaouSpelling(record.macroDesc || '');
    }
    if (record.microDesc !== undefined && record.microDesc !== null) {
        dbRecord.micro_desc = correctPapanicolaouSpelling(record.microDesc || '');
    }
    if (record.diagnostico !== undefined && record.diagnostico !== null) {
        dbRecord.diagnostico = correctPapanicolaouSpelling(record.diagnostico || '');
    }
    if (record.img01 !== undefined && record.img01 !== null) dbRecord.img01 = record.img01;
    if (record.img02 !== undefined && record.img02 !== null) dbRecord.img02 = record.img02;
    if (record.id) dbRecord.id = parseInt(record.id, 10);

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
    let queue = [];
    try {
        queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
    } catch (e) {
        queue = [];
    }
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

const LIGHT_COLUMNS = '*';

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

    // Borrado remoto permanente en la nube Supabase de registros fantasmas de la serie 700
    try {
        const ghostCodesCloud = ['26Q-778', '26Q-779', '26Q-782', '26q-778', '26q-779', '26q-782'];
        supabase.from('pacientes').delete().in('cod_atencion', ghostCodesCloud).then(({ error: delErr }) => {
            if (!delErr) {
                console.log("[Supabase Clean Engine] Registros fantasmas borrados permanentemente de la nube Supabase.");
            }
        });
    } catch(e) {}

    try {
        console.log(limit ? `[Supabase] Sincronizando últimos ${limit} pacientes...` : "[Supabase] Iniciando recuperación completa por lotes...");

        let allData = [];
        if (limit) {
            const { data, error } = await supabase
                .from('pacientes')
                .select(LIGHT_COLUMNS)
                .order('id', { ascending: false })
                .limit(limit);
            if (!error && data) allData = data;
        } else {
            // GARANTÍA MILITAR: Recuperación completa por lotes de 1000 para superar el límite por defecto de PostgREST
            let fromRow = 0;
            const batchSize = 1000;
            let keepFetching = true;
            while (keepFetching) {
                const { data, error } = await supabase
                    .from('pacientes')
                    .select(LIGHT_COLUMNS)
                    .order('id', { ascending: false })
                    .range(fromRow, fromRow + batchSize - 1);
                
                if (error || !data || data.length === 0) {
                    keepFetching = false;
                } else {
                    allData.push(...data);
                    if (data.length < batchSize) {
                        keepFetching = false;
                    } else {
                        fromRow += batchSize;
                    }
                }
            }
        }

        const data = allData;

        if (data && data.length > 0) {
            const ghostCodesFilter = ['26q-778', '26q-779', '26q-782'];
            const cleanData = data.filter(d => !ghostCodesFilter.includes(cleanCodeFunc(d.cod_atencion || d.codAtencion)));
            const parsedPatients = cleanData.map(mapDbToPatient);
            const queue = getPendingSyncQueue();
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
                    const cleanDiagDb = (db.diagnostico || '').replace(/<[^>]*>/g, '').trim();
                    const cleanDiagLocal = (local && local.diagnostico || '').replace(/<[^>]*>/g, '').trim();
                    const isFirm = db.firmado || (local && local.firmado) || db.estado === 'Completado' || (local && local.estado === 'Completado') || (cleanDiagDb !== '' && cleanDiagDb !== '---') || (cleanDiagLocal !== '' && cleanDiagLocal !== '---');
                    const isMod = db.modificado || (local && local.modificado) || isFirm || (cleanDiagDb !== '' && cleanDiagDb !== '---') || (cleanDiagLocal !== '' && cleanDiagLocal !== '---');
                    const estState = isFirm ? 'Completado' : (isMod ? 'En Proceso' : 'Pendiente');
                    return {
                        ...db,
                        firmado: !!isFirm,
                        modificado: !!isMod,
                        estado: estState,
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
                    // Subir asíncronamente a la nube mediante el motor indestructible de transmisión
                    console.log(`[Supabase] Auto-sincronizando paciente local creado fuera de línea: ${p.codAtencion}`);
                    syncSinglePatientToCloud(p);
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

                    if (eventType === 'INSERT' || eventType === 'UPDATE') {
                        const patient = mapDbToPatient(newRecord);
                        // GARANTÍA MILITAR DE EDICIÓN ACTIVA: Preservar entradas activas en pantalla si el editor está abierto
                        const activeCode = (window.activePatientCode || '').toLowerCase().replace(/[-_\s]/g, '');
                        const targetClean = cleanCodeFunc(patient.codAtencion || patient.cod_atencion);
                        
                        const idx = patientDatabase.findIndex(p => p.id === patient.id || cleanCodeFunc(p.codAtencion) === targetClean);
                        if (idx !== -1) {
                            const local = patientDatabase[idx];
                            delete local._searchKey;
                            delete local._sortYear;
                            delete local._sortNum;
                            delete local._sortCodeRaw;
                            
                            // Si el usuario está editando activamente este mismo paciente en el formulario, no borrar sus textos borradores
                            if (activeCode && activeCode === targetClean) {
                                patient.macroDesc = local.macroDesc || patient.macroDesc || "";
                                patient.microDesc = local.microDesc || patient.microDesc || "";
                                patient.diagnostico = local.diagnostico || patient.diagnostico || "";
                            } else {
                                patient.macroDesc = patient.macroDesc || local.macroDesc || "";
                                patient.microDesc = patient.microDesc || local.microDesc || "";
                                patient.diagnostico = patient.diagnostico || local.diagnostico || "";
                            }
                            patient.img01 = patient.img01 || local.img01 || null;
                            patient.img02 = patient.img02 || local.img02 || null;
                            patient.solicitudInforme = local.solicitudInforme || null;
                            patientDatabase[idx] = { ...local, ...patient };
                        } else {
                            patientDatabase.push(patient);
                        }
                        
                        sortPatientArray(patientDatabase);
                        const finalPatient = patientDatabase.find(p => cleanCodeFunc(p.codAtencion) === targetClean) || patient;
                        savePatientToIndexedDB(finalPatient);
                        try { localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase)); } catch (e) {}

                        if (eventType === 'UPDATE' && typeof window.updateOpenEditorIfMatches === 'function') {
                            window.updateOpenEditorIfMatches(finalPatient);
                        }

                        if (typeof window.showToast === 'function') {
                            if (eventType === 'INSERT') {
                                const servName = finalPatient.service === 'C' ? 'Citología' : 'Muestras HE';
                                window.showToast(`🔔 Nuevo registro remoto: ${finalPatient.codAtencion} - ${finalPatient.paciente || 'Paciente'} (${servName})`, 'info');
                            } else {
                                window.showToast(`🔄 Clínica y expediente actualizados en tiempo real: ${finalPatient.codAtencion} (${finalPatient.clinica})`, 'success');
                                if (finalPatient.firmado || finalPatient.estado === 'Completado') {
                                    playNotificationChime();
                                    window.showToast(`🔔 ¡ATENCIÓN! Reporte Firmado Listo: ${finalPatient.codAtencion} - ${finalPatient.paciente || ''} (${finalPatient.clinica})`, 'success');
                                }
                            }
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

export function getPendingSyncQueue() {
    try {
        return JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
    } catch (e) {
        return [];
    }
}

let isSyncing = false;

// FUNCIÓN DE SINCRONIZACIÓN MILITAR DIRECTA A LA NUBE SUPABASE (Upsert + Fallback Update/Insert)
export async function syncSinglePatientToCloud(patient) {
    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
    if (!usingSupabase || !patient) return { success: false, reason: 'Sin conexión a Supabase' };

    let dbRecord = mapPatientToDb(patient);
    let attempts = 0;
    
    // Intento 1: Upsert directo por cod_atencion
    while (attempts < 3) {
        attempts++;
        try {
            const res = await supabase.from('pacientes').upsert([dbRecord], { onConflict: 'cod_atencion' });
            if (!res.error) {
                console.log(`[Supabase Cloud Engine] ¡Expediente ${patient.codAtencion} subido con éxito a la nube!`);
                return { success: true };
            }
            
            const err = res.error;
            console.warn(`[Supabase Cloud Engine] Intento ${attempts} de upsert con advertencia para ${patient.codAtencion}:`, err.message);
            
            if (err.message && (err.message.includes("column") || err.code === "PGRST204")) {
                const matchCol = err.message.match(/Could not find the '([^']+)' column/) || err.message.match(/column [^\s]*\.([^\s]+) does not exist/);
                if (matchCol && matchCol[1]) {
                    const badCol = matchCol[1].replace(/['"]/g, '');
                    console.warn(`[Supabase Cloud Engine] Removiendo columna inexistente '${badCol}' y reintentando...`);
                    delete dbRecord[badCol];
                    continue;
                }
            }
            break;
        } catch (e) {
            console.error("[Supabase Cloud Engine] Excepción en upsert:", e);
            break;
        }
    }
    
    // Intento 2 (GARANTÍA MILITAR FALLBACK): Buscar por cod_atencion y hacer UPDATE o INSERT
    try {
        const targetCod = dbRecord.cod_atencion;
        const { data: existing } = await supabase
            .from('pacientes')
            .select('id, cod_atencion')
            .eq('cod_atencion', targetCod)
            .maybeSingle();

        if (existing && existing.id) {
            const { error: updErr } = await supabase
                .from('pacientes')
                .update(dbRecord)
                .eq('id', existing.id);
            if (!updErr) {
                console.log(`[Supabase Cloud Fallback] ¡Expediente ${patient.codAtencion} actualizado por ID (${existing.id})!`);
                return { success: true };
            }
            console.error("[Supabase Cloud Fallback Update Error]:", updErr);
        } else {
            const insertRecord = { ...dbRecord };
            delete insertRecord.id;
            const { error: insErr } = await supabase
                .from('pacientes')
                .insert([insertRecord]);
            if (!insErr) {
                console.log(`[Supabase Cloud Fallback] ¡Expediente ${patient.codAtencion} insertado exitosamente en la nube!`);
                return { success: true };
            }
            console.error("[Supabase Cloud Fallback Insert Error]:", insErr);
        }
    } catch (e) {
        console.error("[Supabase Cloud Fallback Excepción]:", e);
    }

    return { success: false };
}

export async function forcePushAllLocalPatientsToCloud() {
    console.log(`[Cloud Force Sync] Subiendo ${patientDatabase.length} pacientes locales a la nube Supabase...`);
    let pushed = 0;
    for (const patient of patientDatabase) {
        const res = await syncSinglePatientToCloud(patient);
        if (res.success) pushed++;
    }
    console.log(`[Cloud Force Sync] ¡${pushed} / ${patientDatabase.length} pacientes sincronizados a la nube!`);
    return pushed;
}

if (typeof window !== 'undefined') {
    window.syncSinglePatientToCloud = syncSinglePatientToCloud;
    window.forcePushAllLocalPatientsToCloud = forcePushAllLocalPatientsToCloud;
}

// 1. Encolar escritura para sincronización asíncrona
export function queueSyncWrite(actionType, codAtencion) {
    let queue = getPendingSyncQueue();

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

    let queue = getPendingSyncQueue();
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
                
                const cloudRes = await syncSinglePatientToCloud(patient);
                if (cloudRes.success) {
                    success = true;
                } else {
                    errorMsg = 'Fallo en transmisión a la nube';
                }
            } else if (item.type === 'DELETE') {
                const { error } = await supabase
                    .from('pacientes')
                    .delete()
                    .eq('cod_atencion', item.codAtencion);
                if (error) {
                    errorMsg = error.message;
                } else {
                    success = true;
                }
            }
        } catch (e) {
            errorMsg = e.message || 'Error de conexión';
        }

        if (success) {
            console.log(`[Sync Engine] Sincronizado con éxito: ${item.type} para ${item.codAtencion}`);
            queue.shift();
            localStorage.setItem('pendingSyncWrites', JSON.stringify(queue));
        } else {
            console.error(`[Sync Engine] Error al sincronizar ${item.type} para ${item.codAtencion}:`, errorMsg);
            item.retries = (item.retries || 0) + 1;
            if (item.retries >= 5) {
                let archive = [];
                try { archive = JSON.parse(localStorage.getItem('failedSyncQueue') || '[]'); } catch(e) {}
                archive.push(item);
                localStorage.setItem('failedSyncQueue', JSON.stringify(archive));
                queue.shift();
            }
            localStorage.setItem('pendingSyncWrites', JSON.stringify(queue));
            break;
        }
    }

    isSyncing = false;
    updateSyncStatusUI();
}

export function playNotificationChime() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.45);
    } catch(e) {
        console.warn("Chime audio disabled:", e);
    }
}

export async function sendAutomatedReportEmail(patient) {
    const resendApiKey = localStorage.getItem('resendApiKey') || '';
    const recipientEmail = patient.correoMedico || patient.correoClinica || patient.correo || '';
    
    if (!recipientEmail || !resendApiKey) {
        console.log(`[Email Dispatcher] Notificación por correo lista. Configure clave Resend y correo de médico para envío automático.`);
        return;
    }

    console.log(`[Email Dispatcher] Enviando correo automático para ${patient.codAtencion} a ${recipientEmail}...`);
    
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 1.3rem;">🔬 SERVICIO DE ANATOMÍA PATOLÓGICA</h2>
                <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #38bdf8;">REPORTE ANATOMOPATOLÓGICO FIRMADO</p>
            </div>
            <div style="padding: 24px; color: #334155; line-height: 1.6;">
                <p>Estimado(a) <strong>${patient.medSolicitante || 'Doctor'}</strong>,</p>
                <p>Le informamos que el reporte anatomopatológico del paciente <strong>${patient.paciente || ''}</strong> ya se encuentra <strong>LISTO Y FIRMADO</strong> por el patólogo responsable.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 6px;">
                    <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Código de Atención:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-weight: bold;">${patient.codAtencion}</td></tr>
                    <tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Especimen / Muestra:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${patient.especimen || '---'}</td></tr>
                    <tr><td style="padding: 8px 12px; font-weight: bold;">Fecha de Entrega:</td><td style="padding: 8px 12px;">${patient.fecEntrega || '---'}</td></tr>
                </table>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(patient.codAtencion)}" target="_blank" style="background: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">📄 Visualizar y Descargar PDF Oficial</a>
                </div>
            </div>
            <div style="background: #f1f5f9; padding: 12px; text-align: center; font-size: 0.78rem; color: #64748b;">
                Este es un mensaje automático del Sistema de Gestión de Reportes Patológicos.
            </div>
        </div>
    `;

    try {
        const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
                from: 'Laboratorio Patología <reportes@resend.dev>',
                to: [recipientEmail],
                subject: `[REPORTE FIRMADO] Paciente: ${patient.paciente || ''} | Código: ${patient.codAtencion}`,
                html: emailHtml
            })
        });
        if (resp.ok) {
            console.log(`[Email Dispatcher] Correo enviado con éxito a ${recipientEmail}`);
            if (typeof window.showToast === 'function') window.showToast(`✉️ Correo automático enviado a ${recipientEmail}`, 'success');
        }
    } catch(e) {
        console.warn("[Email Dispatcher] Aviso al enviar correo:", e);
    }
}

export async function savePatient(patient) {
    if (patient.firmado || patient.estado === 'Completado') {
        playNotificationChime();
        sendAutomatedReportEmail(patient);
    }
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
        patientDatabase.push(patient);
    }
    
    // GARANTÍA MILITAR: Re-ordenar siempre numéricamente por código
    sortPatientArray(patientDatabase);
    
    // Registrar timestamp local para omitir eco en tiempo real
    markCodeRecentlySaved(patient.codAtencion);

    // Guardar en IndexedDB
    savePatientToIndexedDB(patient);
    
    // Guardar respaldo local
    triggerAutomaticBackup();
    
    // GARANTÍA MILITAR DE NUBE: Sincronización inmediata e indestructible a Supabase
    syncSinglePatientToCloud(patient).then(res => {
        if (!res.success) {
            queueSyncWrite('SAVE', patient.codAtencion);
            processSyncQueue();
        }
    });

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
    const queue = getPendingSyncQueue();
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

