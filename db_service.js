// db_service.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Base de Datos y Almacenamiento Local

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
    { id: 1, perfil: 'Administrador', dni: '41457466', nombres: 'JOSEPH CRISTOPHER CASTILLO CUENCA', usuario: '41457466', clave: 'Betasporina1g' },
    { id: 2, perfil: 'Usuario', dni: '', nombres: 'CLINICA LA MUJER', usuario: 'Mujersegura', clave: '212523' },
    { id: 3, perfil: 'Usuario', dni: '', nombres: 'CLÍNICA CARRIÓN', usuario: 'clinicacarrion', clave: '212523' }
];

export const defaultCategories = [
    { id: 1, tipo: 'Macroscopica', categoria: '(MACRO) PROTOCOLOS SISTEMATIZADOS' },
    { id: 2, tipo: 'Macroscopica', categoria: 'DERMATOPATOLOGIA' },
    { id: 3, tipo: 'Macroscopica', categoria: 'GASTROENTEROLOGIA' },
    { id: 4, tipo: 'Macroscopica', categoria: 'GINECOLOGIA' },
    { id: 5, tipo: 'Macroscopica', categoria: 'MAMA' },
    { id: 6, tipo: 'Macroscopica', categoria: 'OTROS' },
    { id: 7, tipo: 'Macroscopica', categoria: 'PAPANICOLAOU' },
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
    { id: 25, tipo: 'Microscopica', categoria: 'UROLOGÍA' }
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
                parsed.forEach(p => patientDatabase.push(p));
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
        try {
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));
        } catch(e) {
            console.error(e);
        }
    }

    patientDatabase.forEach(item => {
        if (!item.especimen) {
            if (item.service === 'Q') {
                const samples = ['BIOPSIA DE PIEL', 'VESÍCULA BILIAR', 'APÉNDICE CECAL', 'BIOPSIA GÁSTRICA', 'PIEZA QUIRÚRGICA'];
                item.especimen = samples[item.id % samples.length];
            } else if (item.service === 'I') {
                item.especimen = 'BLOQUE DE PARAFINA';
            } else {
                const samples = ['FROTIS PAPANICOLAOU', 'LÍQUIDO PLEURAL', 'CITOLOGÍA DE ORINA'];
                item.especimen = samples[item.id % samples.length];
            }
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
        try {
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));
            console.log('[Migration] Se corrigió el formato de dimensiones en los registros de paciente.');
        } catch (e) {
            console.error('Error al guardar base de datos migrada:', e);
        }
    }

    // 2. Categorías
    categoriesDatabase = JSON.parse(localStorage.getItem('categoriasDB')) || defaultCategories;
    if (!categoriesDatabase || categoriesDatabase.length < 25) {
        categoriesDatabase = defaultCategories;
        localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
    }

    // 3. Plantillas
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

        // 2. De-duplicación por título y categoría para evitar duplicados residuales
        const uniqueTemplates = [];
        const seen = new Set();
        templatesDatabase.forEach(t => {
            const key = `${t.categoryId}-${t.titulo}`;
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
        const dataStr = JSON.stringify(patientDatabase, null, 2);
        localStorage.setItem('patientDatabaseLocal', dataStr);
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

export function mapDbToPatient(dbRecord) {
    return {
        id: parseInt(dbRecord.id),
        service: dbRecord.service || 'Q',
        codAtencion: dbRecord.cod_atencion,
        dni: dbRecord.dni || "",
        medSolicitante: dbRecord.med_solicitante || "",
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
        especimen: dbRecord.especimen || "",
        macroDesc: dbRecord.macro_desc || "",
        microDesc: dbRecord.micro_desc || "",
        diagnostico: dbRecord.diagnostico || "",
        img01: dbRecord.img01 || null,
        img02: dbRecord.img02 || null,
        edad: parseInt(dbRecord.edad) || 0,
        sexo: dbRecord.sexo || "",
        casetes: parseInt(dbRecord.casetes) || 1,
        fContacto: dbRecord.f_contacto || "",
        telContacto: dbRecord.tel_contacto || "",
        doctor: dbRecord.doctor || "",
        motivoEstudio: dbRecord.motivo_estudio || "",
        catMacro: dbRecord.cat_macro || "",
        planMacro: dbRecord.plan_macro || "",
        catMicro: dbRecord.cat_micro || "",
        planMicro: dbRecord.plan_micro || ""
    };
}

export async function syncPatientsFromSupabase() {
    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined');
    if (!usingSupabase) return;

    try {
        console.log("[Supabase] Iniciando sincronización de pacientes...");
        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error("Error al obtener pacientes de Supabase:", error);
            return;
        }

        if (data && data.length > 0) {
            const parsedPatients = data.map(mapDbToPatient);
            
            patientDatabase.length = 0;
            parsedPatients.forEach(p => patientDatabase.push(p));

            // Guardar localmente
            localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));
            
            console.log(`[Supabase] Sincronizados ${parsedPatients.length} pacientes desde la nube.`);
            
            if (typeof window.refreshPatientTable === 'function') {
                window.refreshPatientTable();
            }
        }
    } catch (e) {
        console.error("Error en syncPatientsFromSupabase:", e);
    }
}

export function subscribePatientsRealtime() {
    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined');
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

                if (eventType === 'INSERT') {
                    const patient = mapDbToPatient(newRecord);
                    const idx = patientDatabase.findIndex(p => p.id === patient.id || p.codAtencion === patient.codAtencion);
                    if (idx !== -1) {
                        patientDatabase[idx] = patient;
                    } else {
                        patientDatabase.unshift(patient);
                    }
                } else if (eventType === 'UPDATE') {
                    const patient = mapDbToPatient(newRecord);
                    const idx = patientDatabase.findIndex(p => p.id === patient.id || p.codAtencion === patient.codAtencion);
                    if (idx !== -1) {
                        patientDatabase[idx] = patient;
                    } else {
                        patientDatabase.unshift(patient);
                    }
                } else if (eventType === 'DELETE') {
                    const idToDelete = oldRecord.id || (newRecord && newRecord.id);
                    if (idToDelete) {
                        const idx = patientDatabase.findIndex(p => p.id === idToDelete);
                        if (idx !== -1) {
                            patientDatabase.splice(idx, 1);
                        }
                    }
                }

                // Guardar localmente
                localStorage.setItem('patientDatabaseLocal', JSON.stringify(patientDatabase));

                // Refrescar tabla si está en pantalla
                if (typeof window.refreshPatientTable === 'function') {
                    window.refreshPatientTable();
                }
            }
        )
        .subscribe();
}

