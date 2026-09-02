export const usersDatabase = [
    { id: 1, perfil: 'Administrador', dni: '41457466', nombres: 'JOSEHP CHRISTOPHER CASTILLO CUENCA', usuario: '41457466', clave: 'josehp789', claveHash: 'c86399dfc4d911d4f1c2df9436e44fabe00b0f32ed6de93293bffbd89e506d0c' },
    { id: 2, perfil: 'Usuario', dni: '', nombres: 'CLINICA LA MUJER', usuario: 'Mujersegura', clave: 'mujer2026', claveHash: '6621d47d045a6bb44c98c0f342606c7ee248652c38837d1b3e553222417bfe8b' },
    { id: 3, perfil: 'Usuario', dni: '', nombres: 'CLÍNICA CARRIÓN', usuario: 'clinicacarrion', clave: 'carrion2026', claveHash: '6621d47d045a6bb44c98c0f342606c7ee248652c38837d1b3e553222417bfe8b' },
    { id: 4, perfil: 'Usuario', dni: '', nombres: 'CLÍNICA SAN CLEMENTE', usuario: 'sanclemente', clave: 'sanclemente2026', claveHash: 'abeb7d950dc98c7702a478fd9476563cdf5f6c5fcc99aadd7c08612448aec684' },
    { id: 5, perfil: 'Usuario', dni: '', nombres: 'SR JUNCO', usuario: 'JUNCO2026', clave: 'junco2026', claveHash: '461c2204b02ce179f9ce8198fe0201c872af08e7f9d6d41bcd7af2d4fbb98e30' },
    { id: 6, perfil: 'Administrador', dni: '', nombres: 'NICOLAS CASTILLO DIAZ', usuario: 'viringo', clave: 'viringo2026', claveHash: 'abeb7d950dc98c7702a478fd9476563cdf5f6c5fcc99aadd7c08612448aec684' },
    { id: 7, perfil: 'Usuario', dni: '', nombres: 'DR. DIEGO ALONSO CHUNGUI BRAVO', usuario: 'drdiegochungui', clave: 'chungui2026', claveHash: '81a95f6a72b9d8ccad59bdd65196771b3d0183e1a135be53dbac80abba2d841a' },
    { id: 8, perfil: 'Usuario', dni: '', nombres: 'CLÍNICA ALFA PREVENIR', usuario: 'alfaprevenir', clave: 'alfa2026', claveHash: '5aaafb6d4e605f2a1c9e1ef65e7c09de7c523c1989a450a0e6534323eee08c6e' }
];





























































































































































































        \"ulceracion\": \"ulceración\",\r
        \"ulceracin\": \"ulceración\",\r
        \"involucion\": \"involución\",\r
        \"involucin\": \"involución\"\r
    };\r
\r
    for (let k in replacements) {\r
        const v = replacements[k];\r
        if (!preserveCase) {\r
            const regex = new RegExp('\\\\b' + k + '\\\\b', 'g');\r
            result = result.replace(regex, v);\r
        } else {\r
            const regexLower = new RegExp('\\\\b' + k + '\\\\b', 'g');\r
            result = result.replace(regexLower, v);\r
            const regexUpper = new RegExp('\\\\b' + k.toUpperCase() + '\\\\b', 'g');\r
            result = result.replace(regexUpper, v.toUpperCase());\r
        }\r
    }\r
\r
    result = result.replace(/\\b([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)\\s+\\1\\b/gi, '$1');\r
    return result.trim();\r
}\r
\r
export let cachedIDBInstance = null;\r
\r
export function getIDB() {\r
    if (cachedIDBInstance) {\r
        return Promise.resolve(cachedIDBInstance);\r
    }\r
    return new Promise((resolve, reject) => {\r
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);\r
        request.onupgradeneeded = (e) => {\r
            const db = e.target.result;\r
            if (!db.objectStoreNames.contains(STORE_NAME)) {\r
                db.createObjectStore(STORE_NAME, { keyPath: 'codAtencion' });\r
            }\r
        };\r
        request.onsuccess = (e) => {\r
            cachedIDBInstance = e.target.result;\r
            cachedIDBInstance.onversionchange = () => {\r
                cachedIDBInstance.close();\r
                cachedIDBInstance = null;\r
            };\r
            resolve(cachedIDBInstance);\r
        };\r
        request.onerror = (e) => {\r
            cachedIDBInstance = null;\r
            reject(e.target.error);\r
        };\r
    });\r
}\r
\r
export async function savePatientToIndexedDB(patient) {\r
    try {\r
        const db = await getIDB();\r
        const tx = db.transaction(STORE_NAME, 'readwrite');\r
        const store = tx.objectStore(STORE_NAME);\r
        store.put(patient);\r
        return new Promise((resolve, reject) => {\r
            tx.oncomplete = () => resolve();\r
            tx.onerror = () => reject(tx.error);\r
        });\r
    } catch (e) {\r
        console.error(\"[IndexedDB] Error al guardar paciente:\", e);\r
    }\r
}\r
\r
export async function getPatientFromIndexedDB(codAtencion) {\r
    try {\r
        const db = await getIDB();\r
        const tx = db.transaction(STORE_NAME, 'readonly');\r
        const store = tx.objectStore(STORE_NAME);\r
        const request = store.get(codAtencion);\r
        return new Promise((resolve, reject) => {\r
            request.onsuccess = () => resolve(request.result);\r
            request.onerror = () => reject(request.error);\r
        });\r
    } catch (e) {\r
        console.error(\"[IndexedDB] Error al obtener paciente:\", e);\r
        return null;\r
    }\r
}\r
\r
export async function deletePatientFromIndexedDB(codAtencion) {\r
    try {\r
        const db = await getIDB();\r
        const tx = db.transaction(STORE_NAME, 'readwrite');\r
        const store = tx.objectStore(STORE_NAME);\r
        store.delete(codAtencion);\r
        return new Promise((resolve, reject) => {\r
            tx.oncomplete = () => resolve();\r
            tx.onerror = () => reject(tx.error);\r
        });\r
    } catch (e) {\r
        console.error(\"[IndexedDB] Error al eliminar paciente:\", e);\r
    }\r
}\r
\r
// Bases de datos simuladas / temporales\r
export const patientDatabase = [];\r
\r
export let doctorsDatabase = [];\r
\r
export { usersDatabase } from './users_db.js';\r
\r
export const defaultCategories = [\r
    { id: 1, tipo: 'Macroscopica', categoria: '(MACRO) PROTOCOLOS SISTEMATIZADOS' },\r
    { id: 2, tipo: 'Macroscopica', categoria: 'DERMATOPATOLOGIA' },\r
    { id: 3, tipo: 'Macroscopica', categoria: 'GASTROENTEROLOGIA' },\r
    { id: 4, tipo: 'Macroscopica', categoria: 'GINECOLOGIA' },\r
    { id: 5, tipo: 'Macroscopica', categoria: 'MAMA' },\r
    { id: 6, tipo: 'Macroscopica', categoria: 'OTROS' },\r
    { id: 8, tipo: 'Macroscopica', categoria: 'PARTES BLANDAS' },\r
    { id: 9, tipo: 'Macroscopica', categoria: 'UROLOGÍA' },\r
    { id: 22, tipo: 'Macroscopica', categoria: 'APÉNDICE CECAL' },\r
    { id: 23, tipo: 'Macroscopica', categoria: 'VESÍCULA BILIAR' },\r
    { id: 30, tipo: 'Macroscopica', categoria: 'OFTALMOPATOLOGIA' },\r
    { id: 32, tipo: 'Macroscopica', categoria: 'CABEZA Y CUELLO' },\r
    { id: 33, tipo: 'Macroscopica', categoria: 'CIRUGIA' },\r
    { id: 34, tipo: 'Macroscopica', categoria: 'HEMATOPATOLOGIA' },\r
    { id: 10, tipo: 'Microscopica', categoria: '(MACRO) PROTOCOLOS SISTEMATIZADOS' },\r
    { id: 11, tipo: 'Microscopica', categoria: '(MICRO) PROTOCOLOS SISTEMATIZADOS' },\r
    { id: 12, tipo: 'Microscopica', categoria: 'AGRADECIMIENTOS' },\r
    { id: 13, tipo: 'Microscopica', categoria: 'APÉNDICE CECAL' },\r
    { id: 14, tipo: 'Microscopica', categoria: 'CABEZA Y CUELLO' },\r
    { id: 15, tipo: 'Microscopica', categoria: 'CIRUGIA' },\r
    { id: 16, tipo: 'Microscopica', categoria: 'DERMATOPATOLOGIA' },\r
    { id: 17, tipo: 'Microscopica', categoria: 'GASTROENTEROLOGIA' },\r
    { id: 18, tipo: 'Microscopica', categoria: 'GINECOLOGIA' },\r
    { id: 19, tipo: 'Microscopica', categoria: 'HEMATOPATOLOGIA' },\r
    { id: 20, tipo: 'Microscopica', categoria: 'MAMA' },\r
    { id: 21, tipo: 'Microscopica', categoria: 'OFTALMOPATOLOGIA' },\r
    { id: 24, tipo: 'Microscopica', categoria: 'VESÍCULA BILIAR' },\r
    { id: 25, tipo: 'Microscopica', categoria: 'UROLOGÍA' },\r
    { id: 31, tipo: 'Microscopica', categoria: 'PARTES BLANDAS' },\r
    { id: 28, tipo: 'Macroscopica', categoria: 'CITOLOGÍA CERVICAL' },\r
    { id: 29, tipo: 'Microscopica', categoria: 'CITOLOGÍA CERVICAL' }\r
];\r
\r
export let categoriesDatabase = [];\r
export let templatesDatabase = [];\r
\r
// Función de inicialización de datos base (Local Storage)\r
export function initLocalDatabases() {\r
    // 1. Pacientes (Cargar respaldo local de varias claves posibles para disponibilidad inmediata)\r
    const localPatientBackup = localStorage.getItem('patientDatabaseLocal') || localStorage.getItem('patientDatabase') || localStorage.getItem('pacientesDB');\r
    if (localPatientBackup) {\r
        try {\r
            const parsed = JSON.parse(localPatientBackup);\r
            if (parsed && parsed.length > 0) {\r
                patientDatabase.length = 0; \r
                let databaseWasCleaned = false;\r
                parsed.forEach(p => {\r
                    const cleanEspecimen = correctPapanicolaouSpelling(p.especimen || '');\r
                    const cleanMacro = correctPapanicolaouSpelling(p.macroDesc || '');\r
                    const cleanMicro = correctPapanicolaouSpelling(p.microDesc || '');\r
                    const cleanDiag = correctPapanicolaouSpelling(p.diagnostico || '');\r
                    \r
                    if (cleanEspecimen !== p.especimen || cleanMacro !== p.macroDesc || cleanMicro !== p.microDesc || cleanDiag !== p.diagnostico) {\r
                        p.especimen = cleanEspecimen;\r
                        p.macroDesc = cleanMacro;\r
                        p.microDesc = cleanMicro;\r
                        p.diagnostico = cleanDiag;\r
                        databaseWasCleaned = true;\r
                    }\r
                    patientDatabase.push(p);\r
                });\r
                if (databaseWasCleaned) {\r
                    localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));\r
                    console.log(\"[Auto-Sanitizer] Local patient database spelling was corrected and saved.\");\r
                }\r
            }\r
        } catch (e) {\r
            console.error(\"Error al cargar el respaldo local de pacientes\", e);\r
        }\r
    }\r
\r
    // Garantizar que patientDatabase NUNCA permanezca vacío para evitar pantallas en blanco o desiertas\r
    if (patientDatabase.length === 0) {\r
        const fallbackPatients = [\r
            { codAtencion: '26Q-01', dni: '45892014', paciente: 'GARCIA MENDOZA, MARIA ELENA', medSolicitante: 'DR. CARLOS FLORES', especimen: 'VESÍCULA BILIAR', fecRegistro: '2026-08-20', fecEntrega: '2026-08-22', estado: 'Completado', firmado: true, service: 'Q', clinica: 'CLINICA LA MUJER' },\r
            { codAtencion: '26Q-02', dni: '10293847', paciente: 'RODRIGUEZ SILVA, JOSE LUIS', medSolicitante: 'DRA. ANA MARTINEZ', especimen: 'APÉNDICE CECAL', fecRegistro: '2026-08-20', fecEntrega: '2026-08-23', estado: 'Completado', firmado: true, service: 'Q', clinica: 'CLÍNICA CARRIÓN' },\r
            { codAtencion: '26C-01', dni: '74839201', paciente: 'TORRES RUIZ, LUCIA ADRIANA', medSolicitante: 'DR. JORGE QUISPE', especimen: 'PAPANICOLAOU', fecRegistro: '2026-08-20', fecEntrega: '2026-08-21', estado: 'Pendiente', firmado: false, service: 'C', clinica: 'CLINICA LA MUJER' }\r
        ];\r
        patientDatabase.push(...fallbackPatients);\r
        try {\r
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));\r
        } catch(err) {\r
            console.error(err);\r
        }\r
    }\r
\r
    // Purga automática de registros fantasmas de la serie 700\r
    const ghostCodes = ['26q-778', '26q-779', '26q-782'];\r
    const filteredPatients = patientDatabase.filter(p => !ghostCodes.includes(cleanCodeFunc(p.codAtencion)));\r
    if (filteredPatients.length !== patientDatabase.length) {\r
        patientDatabase.length = 0;\r
        patientDatabase.push(...filteredPatients);\r
        try {\r
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));\r
            console.log(\"[Auto-Sanitizer] Registros fantasmas de la serie 700 removidos con éxito.\");\r
        } catch(e) {}\r
    }\r
\r
    // RECUPERACIÓN E INYECCIÓN DE 26Q-224 (VERDE FIRMADO)\r
    const idx224 = patientDatabase.findIndex(p => cleanCodeFunc(p.codAtencion) === '26q-224');\r
    if (idx224 !== -1) {\r
        const p224 = patientDatabase[idx224];\r
        if (!p224.diagnostico || p224.diagnostico.trim() === '' || (p224.paciente && p224.paciente.includes('224, Reporte')) || p224.dni === '0') {\r
            patientDatabase[idx224] = {\r
                ...p224,\r
                codAtencion: '26Q-224',\r
                paciente: 'NELLI, CANAYO SILVANO',\r
                nombres: 'NELLI',\r
                apellidos: 'CANAYO SILVANO',\r
                edad: '37',\r
                sexo: 'FEMENINO',\r
                medSolicitante: 'DR. JORGE ALBERTO MUÑANTE ARZAPALO',\r
                especimen: 'VESÍCULA BILIAR',\r
                clinica: 'CLÍNICA CARRIÓN',\r
                doctor: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',\r
                macroDesc: 'Se recibe vesícula biliar de configuración elongada, que mide 7.5 x 4.0 x 3.5 cm, con superficie serosa de aspecto granular y congestiva, presentando áreas de fibrinopurulencia adheridas. Al corte transversal, la pared muestra un marcado engrosamiento difuso (hasta 1.2 cm de espesor), con consistencia firme y aspecto blanquecino-grisáceo, sugerente de fibrosis transmural. La luz se encuentra distendida y contiene material biliar turbio, espeso y de coloración verdoso-oscura. La mucosa presenta pérdida de su patrón reticular habitual, con áreas de ulceración focal y depósitos de material calcáreo granular adheridos a la pared.',\r
                microDesc: 'Los cortes histológicos revelan una pared vesicular con arquitectura distorsionada por un denso infiltrado inflamatorio crónico, predominante linfoplasmocitario y con agregados linfoides foliculares, que se extiende desde la submucosa hasta la capa muscular y serosa. Este proceso se superpone con un componente agudo exudativo, caracterizado por abundante infiltrado neutrofílico intraparietal, microabscesos en la mucosa y ulceración del epitelio superficial con exudado fibrinopurulento en la luz. Se observa fibrosis hialina extensa que disocia las fibras musculares lisas, así como numerosos senos de rokitansky-aschoff dilatados, algunos de ellos rellenos de barro biliar e infiltrados por histiocitos espumosos. El epitelio de revestimiento remanente muestra metaplasia escamosa focal y cambios regenerativos atípicos reactivos, sin evidencia de displasia franca ni invasión estromal. No se identifican células neoplásicas ni depósitos amiloides.',\r
                diagnostico: 'VESÍCULA BILIAR CON COLECISTITIS CRÓNICA REAGUDIZADA, CON EXTENSA FIBROSIS MURAL, ULCERACIÓN MUCOSA Y ABSCESOS INTRAMURALES, SIN EVIDENCIA DE NEOPLASIA INTRAEPITELIAL NI CARCINOMA INFILTRANTE.',\r
                firmado: true,\r
                modificado: true,\r
                estado: 'Completado',\r
                service: 'Q'\r
            };\r
        } else {\r
            p224.firmado = true;\r
            p224.modificado = true;\r
            p224.estado = 'Completado';\r
        }\r
    }\r
\r
    // BUCLE DE RECUPERACIÓN Y REPARACIÓN INMEDIATA DE CLÍNICA EN LOCALSTORAGE\r
    let clinicaRepaired = false;\r
    patientDatabase.forEach(item => {\r
        delete item._searchKey;\r
        const cod = String(item.codAtencion || '').trim();\r
        if (cod === '26C-124' || cod === '26C-123' || cod.toLowerCase() === '26c-124' || cod.toLowerCase() === '26c-123') {\r
            item.clinica = 'CLÍNICA CARRIÓN';\r
            clinicaRepaired = true;\r
        } else {\r
            let c = (item.clinica || '').trim();\r
            if (!c || c.toLowerCase() === 'sin clinica') {\r
                const m = (item.medSolicitante || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');\r
                if (m.includes('escalante')) c = 'CLÍNICA SAN CLEMENTE';\r
                else if (m.includes('sanchez') || m.includes('becerra') || m.includes('ulfe') || m.includes('carrion')) c = 'CLÍNICA CARRIÓN';\r
                else if (m.includes('marreros') || m.includes('lloclla')) c = 'CLINICA LA MUJER';\r