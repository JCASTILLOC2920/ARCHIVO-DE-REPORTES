// db_service.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Base de Datos y Almacenamiento Local

// INDEXTEDB STORAGE FOR HEAVY PATIENT RECORDS
const IDB_NAME = 'ClinicaReportesDB';
const IDB_VERSION = 1;
const STORE_NAME = 'pacientes_completos';

export function correctPapanicolaouSpelling(text) {
    if (!text) return '';
    
    // Primero corregir "papá nicolás" y variaciones con/sin acento o espacio
    const papaNicolasRegex = /\bpap[áa]\s*nicol[áa]s\b/gi;
    let result = text.replace(papaNicolasRegex, (match) => {
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
    result = result.replace(/\s+/g, ' ');

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

function getIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'codAtencion' });
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
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
export const patientDatabase = [
    // Servicio Q (muestra HE)
    {
        id: 200,
        service: 'Q',
        codAtencion: '26Q-209',
        dni: '0',
        medSolicitante: 'DR. JHON VILCA',
        nombres: 'NORIEL',
        apellidos: 'CUEVA CASTAÑEDA',
        paciente: 'NORIEL CUEVA CASTAÑEDA',
        costo: 0,
        adelanto: 0,
        resta: 0,
        fecRegistro: '2026-01-12',
        fecEntrega: '2026-01-15',
        pagado: true,
        atrasado: false,
        especimen: 'TEJIDO PROSTÁTICO (MORCELADOS)',
        macroDesc: 'PARCIALMENTE FIJADO EN FORMOL, SE RECIBEN MÚLTIPLES FRAGMENTOS DE TEJIDO PROSTÁTICO OBTENIDOS POR MORCELADO, DE MORFOLOGÍA IRREGULAR CON BORDES ANGULADOS, COLORACIÓN HOMOGÉNEA PARDO-GRISÁCEA, CONSISTENCIA ELÁSTICA Y SUPERFICIE DE CORTE UNIFORME SIN NÓDULOS IDENTIFICABLES; EL MATERIAL EN CONJUNTO PESA 18.3GRAMOS Y MIDE 6.0 x 5 x 2.0 CM. SE INCLUYE MUESTRA REPRESENTATIVA EN 2 CASSETTES. DESCRIPCIÓN BASADA EN SUSAN C. LESTER. (2010). MANUAL OF SURGICAL PATHOLOGY. THIRD EDITION. ELSEVIER INC.',
        microDesc: 'LAS SECCIONES HISTOLÓGICAS MUESTRAN ARQUITECTURA PROSTÁTICA CON UN PATRÓN NODULAR BIEN DELIMITADO. LOS NÓDULOS ESTÁN COMPUESTOS POR UNA MEZCLA PROLIFERATIVA DE ELEMENTOS GLANDULARES Y ESTROMALES. LAS GLÁNDULAS PRESENTAN UN TAMAÑO Y FORMA VARIABLES, REVESTIDAS POR EL EPITELIO COLUMNAR PSEUDOESTRATIFICADO DE DOBLE CAPA (CÉLULAS BASALES Y LUMINALES), SIN ATIPIA CITOLÓGICA SIGNIFICATIVA. EL ESTROMA ESTÁ CONSTITUIDO POR TEJIDO FIBROMUSCULAR DENSO, CON ÁREAS DE HIPERCELLULARIDAD FIBROBLÁSTICA. NO SE OBSERVAN GLÁNDULAS CON INFILTRACIÓN ESTROMAL, PATRÓN CRIBIFORME, NUCLEOLOS PROMINENTES, NI MUCINA COLOIDE INTRACELULAR.',
        diagnostico: 'TEJIDO PROSTÁTICO (MORCELADOS):\n\nHIPERPLASIA NODULAR PROSTÁTICA\n\nNEGATIVO PARA MALIGNIDAD',
        casetes: 2,
        edad: 59,
        sexo: 'MASCULINO',
        doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
        catMacro: '',
        planMacro: '',
        catMicro: '',
        planMicro: ''
    },
    { id: 1, service: 'Q', codAtencion: '26Q-208', dni: '0', medSolicitante: 'DRA. LAURA SAIRE BOCANGEL', nombres: 'CLEOFE', apellidos: 'CACCNAHUARAY HUILCAHUARI', paciente: 'CLEOFE CACCNAHUARAY HUILCAHUARI', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-07-04', fecEntrega: '2026-07-09', pagado: false, atrasado: false },
    { id: 8, service: 'Q', codAtencion: '26Q-201', dni: '3432423', medSolicitante: '', nombres: 'SDF', apellidos: 'DSFDS', paciente: 'SDF DSFDS', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-07-04', fecEntrega: '2026-07-09', pagado: false, atrasado: false },
    { id: 9, service: 'Q', codAtencion: '26Q-200', dni: '123232', medSolicitante: '', nombres: 'EDDF', apellidos: 'DFSDFDF', paciente: 'EDDF DFSDFDF', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-07-04', fecEntrega: '2026-07-09', pagado: false, atrasado: false },
    { id: 10, service: 'Q', codAtencion: '26Q-199', dni: '47587447', medSolicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA', nombres: 'LICET MELANI', apellidos: 'CRUZ CAQUI', paciente: 'LICET MELANI CRUZ CAQUI', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-06-30', fecEntrega: '2026-07-05', pagado: true, atrasado: true },
    { id: 11, service: 'Q', codAtencion: '26Q-198', dni: '0', medSolicitante: 'DR. JORGE ALBERTO MUÑANTE ARZAPALO', nombres: 'ISABEL', apellidos: 'CATAÑO DE LA ROSA', paciente: 'ISABEL CATAÑO DE LA ROSA', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-06-29', fecEntrega: '2026-07-04', pagado: false, atrasado: true },
    { id: 12, service: 'Q', codAtencion: '26Q-197', dni: '06054896', medSolicitante: 'DR. JAIME VICTOR BECERRA ULFE', nombres: 'ANGEL MARCOS', apellidos: 'MONTOLLA MILLARES', paciente: 'ANGEL MARCOS MONTOLLA MILLARES', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-06-19', fecEntrega: '2026-06-24', pagado: true, atrasado: true },
    { id: 13, service: 'Q', codAtencion: '26Q-196', dni: '72718224', medSolicitante: 'DR. JAIME VICTOR BECERRA ULFE', nombres: 'HERYES DORA', apellidos: 'SALAZAR CRUZ', paciente: 'HERYES DORA SALAZAR CRUZ', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-06-19', fecEntrega: '2026-06-24', pagado: false, atrasado: true },
    { id: 14, service: 'Q', codAtencion: '26Q-195', dni: '28600628', medSolicitante: 'DR. EMERSON CASAFRANCA LUZA', nombres: 'IRMA YOLANDA', apellidos: 'CONDORI RUIZ', paciente: 'IRMA YOLANDA CONDORI RUIZ', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-06-18', fecEntrega: '2026-06-23', pagado: false, atrasado: true },
    { id: 15, service: 'Q', codAtencion: '26Q-194', dni: '70848956', medSolicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA', nombres: 'SOL ESTEPHANÍA', apellidos: 'ROMERO VALDERRAMA', paciente: 'SOL ESTEPHANÍA ROMERO VALDERRAMA', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-06-18', fecEntrega: '2026-06-23', pagado: true, atrasado: false },
    { id: 16, service: 'Q', codAtencion: '26Q-193', dni: '42078047', medSolicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA', nombres: 'JUANA ISABEL', apellidos: 'CARLOS MANAYAY', paciente: 'JUANA ISABEL CARLOS MANAYAY', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-06-18', fecEntrega: '2026-06-23', pagado: true, atrasado: false },
    { id: 17, service: 'Q', codAtencion: '26Q-192', dni: '0', medSolicitante: 'DR. JORGE QUIROZ CHURA', nombres: 'LUIS', apellidos: 'CARRANZA TRUJILLO', paciente: 'LUIS CARRANZA TRUJILLO', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-06-18', fecEntrega: '2026-06-23', pagado: false, atrasado: true },
    { id: 18, service: 'Q', codAtencion: '26Q-191', dni: '20101969', medSolicitante: '', nombres: 'ROCIO SOLEDAD', apellidos: 'CONDOR MATOS', paciente: 'ROCIO SOLEDAD CONDOR MATOS', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-06-13', fecEntrega: '2026-06-18', pagado: false, atrasado: true },
    { id: 19, service: 'Q', codAtencion: '26Q-190', dni: '00255990', medSolicitante: 'DR. JAIME VICTOR BECERRA ULFE', nombres: 'ÓSCAR ALEJANDRO', apellidos: 'FLORES DAMIÁN', paciente: 'ÓSCAR ALEJANDRO FLORES DAMIÁN', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-06-12', fecEntrega: '2026-06-17', pagado: true, atrasado: false },

    // Servicio I (Inmunohistoquimica)
    { id: 1, service: 'I', codAtencion: '26I-040', dni: '43210987', medSolicitante: 'DR. JAIME VICTOR BECERRA ULFE', nombres: 'ALEJANDRA', apellidos: 'ROJAS VALLE', paciente: 'ALEJANDRA ROJAS VALLE', costo: 150, adelanto: 50, resta: 100, fecRegistro: '2026-07-03', fecEntrega: '2026-07-08', pagado: false, atrasado: false },
    { id: 2, service: 'I', codAtencion: '26I-039', dni: '32109876', medSolicitante: 'DRA. LAURA SAIRE BOCANGEL', nombres: 'MATEO', apellidos: 'RAMIREZ PINTO', paciente: 'MATEO RAMIREZ PINTO', costo: 200, adelanto: 200, resta: 0, fecRegistro: '2026-06-29', fecEntrega: '2026-07-04', pagado: true, atrasado: true },

    // Servicio C (Citología)
    { id: 1, service: 'C', codAtencion: '26C-112', dni: '09876543', medSolicitante: 'DR. JORGE QUIROZ CHURA', nombres: 'SOFIA', apellidos: 'HUAMAN MEZA', paciente: 'SOFIA HUAMAN MEZA', costo: 80, adelanto: 80, resta: 0, fecRegistro: '2026-07-02', fecEntrega: '2026-07-07', pagado: true, atrasado: false },
    { id: 2, service: 'C', codAtencion: '26C-111', dni: '76543210', medSolicitante: 'DRA. CLAUDIA BENAVENTE', nombres: 'VALERIA', apellidos: 'CASTRO MORA', paciente: 'VALERIA CASTRO MORA', costo: 80, adelanto: 20, resta: 60, fecRegistro: '2026-06-20', fecEntrega: '2026-06-25', pagado: false, atrasado: true }
];

export let doctorsDatabase = [];

export const usersDatabase = [
    { id: 1, perfil: 'Administrador', dni: '41457466', nombres: 'JOSEHP CRISTOPHER CASTILLO CUENCA', usuario: '41457466', clave: 'Betasporina1g' },
    { id: 2, perfil: 'Usuario', dni: '', nombres: 'CLINICA LA MUJER', usuario: 'Mujersegura', clave: '212523' },
    { id: 3, perfil: 'Usuario', dni: '', nombres: 'CLÍNICA CARRIÓN', usuario: 'clinicacarrion', clave: '212523' },
    { id: 4, perfil: 'Usuario', dni: '', nombres: 'CLÍNICA SAN CLEMENTE', usuario: 'sanclemente', clave: '112603' }
];

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
    { id: 28, tipo: 'Macroscopica', categoria: 'CITOLOGÍA CERVICAL' },
    { id: 29, tipo: 'Microscopica', categoria: 'CITOLOGÍA CERVICAL' }
];

export let categoriesDatabase = [];
export let templatesDatabase = [];

// Función de inicialización de datos base (Local Storage)
export function initLocalDatabases() {
    // 1. Pacientes
    const localPatientBackup = localStorage.getItem('patientDatabaseLocal');
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

    // Asegurar que el paciente 26Q-209 esté en la base de datos
    const existsCueva = patientDatabase.some(p => p.codAtencion === '26Q-209');
    if (!existsCueva) {
        const cuevaPatient = {
            id: patientDatabase.length > 0 ? Math.max(...patientDatabase.map(x => x.id)) + 1 : 1,
            service: 'Q',
            codAtencion: '26Q-209',
            dni: '0',
            medSolicitante: 'DR. JHON VILCA',
            nombres: 'NORIEL',
            apellidos: 'CUEVA CASTAÑEDA',
            paciente: 'NORIEL CUEVA CASTAÑEDA',
            costo: 0,
            adelanto: 0,
            resta: 0,
            fecRegistro: '2026-01-12',
            fecEntrega: '2026-01-15',
            pagado: true,
            atrasado: false,
            especimen: 'TEJIDO PROSTÁTICO (MORCELADOS)',
            macroDesc: 'PARCIALMENTE FIJADO EN FORMOL, SE RECIBEN MÚLTIPLES FRAGMENTOS DE TEJIDO PROSTÁTICO OBTENIDOS POR MORCELADO, DE MORFOLOGÍA IRREGULAR CON BORDES ANGULADOS, COLORACIÓN HOMOGÉNEA PARDO-GRISÁCEA, CONSISTENCIA ELÁSTICA Y SUPERFICIE DE CORTE UNIFORME SIN NÓDULOS IDENTIFICABLES; EL MATERIAL EN CONJUNTO PESA 18.3GRAMOS Y MIDE 6.0 x 5 x 2.0 CM. SE INCLUYE MUESTRA REPRESENTATIVA EN 2 CASSETTES. DESCRIPCIÓN BASADA EN SUSAN C. LESTER. (2010). MANUAL OF SURGICAL PATHOLOGY. THIRD EDITION. ELSEVIER INC.',
            microDesc: 'LAS SECCIONES HISTOLÓGICAS MUESTRAN ARQUITECTURA PROSTÁTICA CON UN PATRÓN NODULAR BIEN DELIMITADO. LOS NÓDULOS ESTÁN COMPUESTOS POR UNA MEZCLA PROLIFERATIVA DE ELEMENTOS GLANDULARES Y ESTROMALES. LAS GLÁNDULAS PRESENTAN UN TAMAÑO Y FORMA VARIABLES, REVESTIDAS POR EL EPITELIO COLUMNAR PSEUDOESTRATIFICADO DE DOBLE CAPA (CÉLULAS BASALES Y LUMINALES), SIN ATIPIA CITOLÓGICA SIGNIFICATIVA. EL ESTROMA ESTÁ CONSTITUIDO POR TEJIDO FIBROMUSCULAR DENSO, CON ÁREAS DE HIPERCELLULARIDAD FIBROBLÁSTICA. NO SE OBSERVAN GLÁNDULAS CON INFILTRACIÓN ESTROMAL, PATRÓN CRIBIFORME, NUCLEOLOS PROMINENTES, NI MUCINA COLOIDE INTRACELULAR.',
            diagnostico: 'TEJIDO PROSTÁTICO (MORCELADOS):\n\nHIPERPLASIA NODULAR PROSTÁTICA\n\nNEGATIVO PARA MALIGNIDAD',
            casetes: 2,
            edad: 59,
            sexo: 'MASCULINO',
            doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
            catMacro: '',
            planMacro: '',
            catMicro: '',
            planMicro: ''
        };
        patientDatabase.unshift(cuevaPatient);
        triggerAutomaticBackup();
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
    if (templatesDatabase.length === 0 && window.defaultTemplates) {
        templatesDatabase = [...window.defaultTemplates];
        localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
    } else if (window.defaultTemplates) {
        // Migración/Autocuración: Asegurar que las plantillas por defecto nuevas existan en la base de datos local
        let updated = false;

        // 1. Corregir asignaciones erróneas previas de categorías en la BD local antes del chequeo de existencia
        templatesDatabase.forEach(t => {
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
            if (t.titulo === "PÓLIPO ENDOMETRIAL" && t.categoryId !== 4) {
                t.categoryId = 4;
                updated = true;
            }
            if (t.titulo === "LEIOMIOMA UTERINO (MIOMATOSIS)" && t.categoryId !== 4) {
                t.categoryId = 4;
                updated = true;
            }
            if (t.titulo === "GASTRITIS CRÓNICA MODERADA ACTIVA" && t.categoryId === 12) {
                t.categoryId = 17;
                updated = true;
            }
        });

        // 2. De-duplicación por título y nombre de categoría para evitar duplicados residuales
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
            } else {
                updated = true;
            }
        });
        templatesDatabase.length = 0;
        templatesDatabase.push(...uniqueTemplates);

        // 3. Inserción de plantillas por defecto faltantes
        window.defaultTemplates.forEach(defTpl => {
            const exists = templatesDatabase.some(t => String(t.categoryId) === String(defTpl.categoryId) && t.titulo === defTpl.titulo);
            if (!exists) {
                const maxId = templatesDatabase.length > 0 ? Math.max(...templatesDatabase.map(t => parseInt(t.id) || 0)) : 0;
                const newTpl = { ...defTpl, id: maxId + 1 };
                templatesDatabase.push(newTpl);
                updated = true;
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

    // 3. Categorías
    categoriesDatabase = JSON.parse(localStorage.getItem('categoriasDB')) || defaultCategories;
    let catUpdated = false;
    defaultCategories.forEach(defCat => {
        const defCatName = (defCat.categoria || '').trim().toUpperCase();
        
        // Evitar agregar de vuelta categorías de Citología/Papanicolaou sin plantillas asociadas
        if (defCatName === 'CITOLOGÍA CERVICAL' || defCatName === 'CITOLOGIA CERVICAL') {
            const hasTemplates = templatesDatabase.some(t => String(t.categoryId) === String(defCat.id));
            if (!hasTemplates) return; // Si no tiene plantillas asociadas, omitir
        }

        const exists = categoriesDatabase.some(c => c.id === defCat.id || (c.tipo === defCat.tipo && c.categoria === defCat.categoria));
        if (!exists) {
            categoriesDatabase.push(defCat);
            catUpdated = true;
        }
    });

    // Auto-sanitización final de categorías: borrar "PAPANICOLAOU" y "CITOLOGÍA CERVICAL" sin plantillas
    const initialCategoriesLength = categoriesDatabase.length;
    categoriesDatabase = categoriesDatabase.filter(c => {
        const catName = (c.categoria || '').trim().toUpperCase();
        if (catName === 'PAPANICOLAOU' || catName === 'PAPANICOLAU') return false;
        if (catName === 'CITOLOGÍA CERVICAL' || catName === 'CITOLOGIA CERVICAL') {
            const hasTemplates = templatesDatabase.some(t => String(t.categoryId) === String(c.id));
            if (!hasTemplates) return false;
        }
        return true;
    });

    if (categoriesDatabase.length !== initialCategoriesLength) {
        catUpdated = true;
    }

    if (catUpdated || !categoriesDatabase || categoriesDatabase.length < 24) {
        localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
        console.log(`[Auto-Sanitizer] Categories database sanitized and updated (Length: ${categoriesDatabase.length}).`);
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
    localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
    return newTemplate;
}

// Respaldo automático
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
    return {
        id: parseInt(dbRecord.id),
        service: dbRecord.service || 'Q',
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
        edad: parseInt(dbRecord.edad) || 0,
        sexo: dbRecord.sexo || "",
        casetes: parseInt(dbRecord.casetes) || 1,
        fContacto: dbRecord.f_contacto || "",
        telContacto: dbRecord.tel_contacto || "",
        doctor: formatDoctorName(dbRecord.doctor || ""),
        motivoEstudio: dbRecord.motivo_estudio || "",
        catMacro: dbRecord.cat_macro || "",
        planMacro: dbRecord.plan_macro || "",
        catMicro: dbRecord.cat_micro || "",
        planMicro: dbRecord.plan_micro || ""
    };
}

export function mapPatientToDb(record) {
    return {
        service: record.service || 'Q',
        cod_atencion: record.codAtencion,
        dni: record.dni || '',
        nombres: record.nombres || '',
        apellidos: record.apellidos || '',
        paciente: record.paciente || '',
        sexo: record.sexo || 'O',
        edad: parseInt(record.edad) || 0,
        f_contacto: record.fContacto || '',
        tel_contacto: record.telContacto || '',
        med_solicitante: formatDoctorName(record.medSolicitante || ''),
        motivo_estudio: record.motivoEstudio || '',
        especimen: correctPapanicolaouSpelling(record.especimen || ''),
        doctor: formatDoctorName(record.doctor || 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA'),
        casetes: parseInt(record.casetes) || 1,
        diagnostico: correctPapanicolaouSpelling(record.diagnostico || ''),
        cat_macro: record.catMacro || '',
        plan_macro: record.planMacro || '',
        macro_desc: correctPapanicolaouSpelling(record.macroDesc || ''),
        cat_micro: record.catMicro || '',
        plan_micro: record.planMicro || '',
        micro_desc: correctPapanicolaouSpelling(record.microDesc || ''),
        fec_registro: record.fecRegistro || '',
        fec_entrega: record.fecEntrega || '',
        img01: record.img01 || null,
        img02: record.img02 || null,
        costo: parseFloat(record.costo) || 0,
        adelanto: parseFloat(record.adelanto) || 0,
        resta: parseFloat(record.resta) || 0,
        pagado: !!record.pagado,
        atrasado: !!record.atrasado
    };
}

export async function fetchFullPatientDetails(codAtencion) {
    if (!codAtencion) return null;
    const cleanCode = String(codAtencion).trim().toLowerCase();
    const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');

    let local = patientDatabase.find(p => {
        const pCode = String(p.codAtencion || '').trim().toLowerCase();
        return pCode === cleanCode || pCode.replace(/[-_\s]/g, '') === cleanNoHyphen;
    });

    // Fast path 1: Si los detalles ya existen en memoria local, retornar el objeto paciente
    if (local && (local._detailsFetched || local.macroDesc || local.microDesc || local.diagnostico || local.img01 || local.img02)) {
        return local;
    }

    // Fast path 2: Intentar cargar de IndexedDB local
    try {
        const dbPat = await getPatientFromIndexedDB(codAtencion);
        if (dbPat) {
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

    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');

    if (usingSupabase && navigator.onLine) {
        try {
            console.log(`[Supabase] Cargando detalles diferidos para paciente: ${codAtencion}`);
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
                    savePatientToIndexedDB(local);
                    triggerAutomaticBackup();
                } else {
                    patientDatabase.push(mapped);
                    local = mapped;
                    savePatientToIndexedDB(local);
                    triggerAutomaticBackup();
                }
                return local;
            }
        } catch (e) {
            console.error("Excepción en fetchFullPatientDetails:", e);
        }
    }

    return local;
}

export async function syncPatientsFromSupabase() {
    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
    if (!usingSupabase) return;

    try {
        console.log("[Supabase] Iniciando sincronización completa de pacientes...");
        const LIGHT_COLUMNS = 'id, service, cod_atencion, dni, med_solicitante, nombres, apellidos, paciente, costo, adelanto, resta, fec_registro, fec_entrega, pagado, atrasado, especimen, edad, sexo, doctor, motivo_estudio, casetes, f_contacto, tel_contacto';

        const { data, error } = await supabase
            .from('pacientes')
            .select(LIGHT_COLUMNS)
            .order('id', { ascending: false });

        if (error) {
            console.error("Error al obtener pacientes de Supabase:", error);
            return;
        }

        if (data && data.length > 0) {
            const parsedPatients = data.map(mapDbToPatient);
            const cleanCode = (str) => String(str || '').trim().toLowerCase().replace(/[-_\s]/g, '');
            
            // 1. Identificar pacientes locales que no están en Supabase (no sincronizados)
            const unsyncedPatients = patientDatabase.filter(local => 
                !parsedPatients.some(db => cleanCode(db.codAtencion) === cleanCode(local.codAtencion))
            );

            // 2. Fusión inteligente para preservar descripciones y fotos locales que vinieron vacías
            const mergedPatients = parsedPatients.map(db => {
                const local = patientDatabase.find(l => cleanCode(l.codAtencion) === cleanCode(db.codAtencion));
                if (local) {
                    return {
                        ...db,
                        macroDesc: db.macroDesc || local.macroDesc || "",
                        microDesc: db.microDesc || local.microDesc || "",
                        diagnostico: db.diagnostico || local.diagnostico || "",
                        img01: db.img01 || local.img01 || null,
                        img02: db.img02 || local.img02 || null,
                        solicitudInforme: local.solicitudInforme || null
                    };
                }
                return db;
            });

            // 3. Re-poblar base de datos local
            patientDatabase.length = 0;
            mergedPatients.forEach(p => patientDatabase.push(p));
            
            // Agregar los no sincronizados para evitar pérdida de datos
            unsyncedPatients.forEach(p => {
                patientDatabase.push(p);
                // Subir asíncronamente a la nube
                console.log(`[Supabase] Auto-sincronizando paciente local no registrado en la nube: ${p.codAtencion}`);
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

            // Guardar localmente
            triggerAutomaticBackup();
            
            console.log(`[Supabase] Sincronizados ${parsedPatients.length} pacientes desde la nube, manteniendo ${unsyncedPatients.length} registros locales pendientes.`);
            
            if (typeof window.refreshPatientTable === 'function') {
                window.refreshPatientTable();
            }
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
export function queueSyncWrite(actionType, codAtencion, dbRecord) {
    let queue = JSON.parse(localStorage.getItem('pendingSyncWrites')) || [];
    
    // De-duplicación inteligente para optimizar llamadas
    const existingIdx = queue.findIndex(item => item.codAtencion === codAtencion);
    if (existingIdx !== -1) {
        if (actionType === 'DELETE') {
            queue[existingIdx] = { type: 'DELETE', codAtencion, dbRecord: null, timestamp: Date.now() };
        } else {
            queue[existingIdx] = { type: 'SAVE', codAtencion, dbRecord, timestamp: Date.now() };
        }
    } else {
        queue.push({ type: actionType, codAtencion, dbRecord, timestamp: Date.now() });
    }
    
    localStorage.setItem('pendingSyncWrites', JSON.stringify(queue));
    updateSyncStatusUI();
}

// 2. Procesar la cola de sincronización
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
        
        try {
            if (item.type === 'SAVE') {
                const { error } = await supabase
                    .from('pacientes')
                    .upsert([item.dbRecord], { onConflict: 'cod_atencion' });
                if (error) {
                    errorMsg = error.message;
                } else {
                    success = true;
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
            // Parar el procesamiento temporalmente si hay problemas de conexión/red
            break;
        }
    }
    
    isSyncing = false;
    updateSyncStatusUI();
}

// 3. Centralizar el guardado/inserción de pacientes
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
    queueSyncWrite('SAVE', patient.codAtencion, mapPatientToDb(patient));
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
    queueSyncWrite('DELETE', codAtencion, null);
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

