// db_service.js
// PROTOCOLO ACTOR-CRITICO: Módulo de Base de Datos y Almacenamiento Local

// Bases de datos simuladas / temporales
export const patientDatabase = [
    // Servicio Q (muestra HE)
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
    { id: 24, tipo: 'Microscopica', categoria: 'VESÍCULA BILIAR' }
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

    // 2. Categorías
    categoriesDatabase = JSON.parse(localStorage.getItem('categoriasDB')) || defaultCategories;
    if (!categoriesDatabase || categoriesDatabase.length < 24) {
        categoriesDatabase = defaultCategories;
        localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
    }

    // 3. Plantillas
    templatesDatabase = JSON.parse(localStorage.getItem('plantillasDB')) || [];
    if (templatesDatabase.length === 0 && window.defaultTemplates) {
        templatesDatabase = [...window.defaultTemplates];
        localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
    }
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

