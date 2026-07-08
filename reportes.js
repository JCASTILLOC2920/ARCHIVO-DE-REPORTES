/* ==========================================================================
   LOGICA DEL DASHBOARD DE REPORTES Y LISTADO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Configuración y Cliente de Supabase
    let supabase = null;
    let usingSupabase = false;

    if (window.supabase && typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        try {
            supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            usingSupabase = true;
            console.log("Supabase inicializado correctamente.");
            
            // Colorear de verde el icono de base de datos en el header
            setTimeout(() => {
                const dbIcon = document.querySelector('.header-utility-btn i.fa-database');
                if (dbIcon) {
                    dbIcon.style.color = '#22c55e';
                    dbIcon.parentElement.title = 'Conectado a la base de datos en la nube (Supabase)';
                }
            }, 500);
        } catch (e) {
            console.error("Error al inicializar Supabase:", e);
        }
    }

    function mapDbToPatient(item) {
        return {
            id: item.id,
            service: item.service,
            codAtencion: item.cod_atencion,
            dni: item.dni || '0',
            medSolicitante: item.med_solicitante || '',
            nombres: item.nombres || '',
            apellidos: item.apellidos || '',
            paciente: item.paciente || `${item.nombres} ${item.apellidos}`,
            costo: parseFloat(item.costo) || 0,
            adelanto: parseFloat(item.adelanto) || 0,
            resta: parseFloat(item.resta) || 0,
            fecRegistro: item.fec_registro,
            fecEntrega: item.fec_entrega,
            pagado: item.pagado || false,
            atrasado: item.atrasado || false,
            especimen: item.especimen || '',
            macroDesc: item.macro_desc || '',
            microDesc: item.micro_desc || '',
            diagnostico: item.diagnostico || '',
            img01: item.img01 || '',
            img02: item.img02 || '',
            edad: parseInt(item.edad) || 0,
            sexo: item.sexo || 'MASCULINO',
            casetes: parseInt(item.casetes) || 1,
            fContacto: item.f_contacto || '0',
            telContacto: item.tel_contacto || '0',
            doctor: item.doctor || '',
            motivoEstudio: item.motivo_estudio || '',
            catMacro: item.cat_macro || '',
            planMacro: item.plan_macro || '',
            catMicro: item.cat_micro || '',
            planMicro: item.plan_micro || ''
        };
    }

    function mapPatientToDb(record) {
        return {
            service: record.service,
            cod_atencion: record.codAtencion,
            dni: record.dni || '0',
            med_solicitante: record.medSolicitante || '',
            nombres: record.nombres || '',
            apellidos: record.apellidos || '',
            paciente: record.paciente || `${record.nombres} ${record.apellidos}`,
            costo: record.costo || 0,
            adelanto: record.adelanto || 0,
            resta: record.resta || 0,
            fec_registro: record.fecRegistro,
            fec_entrega: record.fecEntrega,
            pagado: record.pagado || false,
            atrasado: record.atrasado || false,
            especimen: record.especimen || '',
            macro_desc: record.macroDesc || '',
            micro_desc: record.microDesc || '',
            diagnostico: record.diagnostico || '',
            img01: record.img01 || '',
            img02: record.img02 || '',
            edad: record.edad || 0,
            sexo: record.sexo || 'MASCULINO',
            casetes: record.casetes || 1,
            f_contacto: record.fContacto || '0',
            tel_contacto: record.telContacto || '0',
            doctor: record.doctor || '',
            motivo_estudio: record.motivoEstudio || '',
            cat_macro: record.catMacro || '',
            plan_macro: record.planMacro || '',
            cat_micro: record.catMicro || '',
            plan_micro: record.planMicro || ''
        };
    }

    async function syncDatabase() {
        if (!usingSupabase) {
            renderTable();
            await loadDoctorsData();
            return;
        }

        try {
            const { data: pacientesData, error: pacientesError } = await supabase
                .from('pacientes')
                .select('*');

            if (pacientesError) throw pacientesError;

            if (pacientesData) {
                patientDatabase.length = 0;
                pacientesData.forEach(item => {
                    patientDatabase.push(mapDbToPatient(item));
                });
            }

            const { data: usuariosData, error: usuariosError } = await supabase
                .from('usuarios')
                .select('*');
            
            if (!usuariosError && usuariosData) {
                usersDatabase.length = 0;
                usuariosData.forEach(u => {
                    usersDatabase.push({
                        id: u.id,
                        perfil: u.perfil || 'Personal',
                        dni: u.dni || '',
                        nombres: u.nombres || '',
                        usuario: u.usuario || '',
                        clave: u.clave || ''
                    });
                });
            }

            const { data: doctoresData, error: doctoresError } = await supabase
                .from('doctores')
                .select('*');
            
            if (!doctoresError && doctoresData) {
                doctorsDatabase.length = 0;
                doctoresData.forEach(d => {
                    doctorsDatabase.push({
                        doctor: d.nombre,
                        colegiado: d.cmp || '',
                        especializacion: d.rne || '',
                        tipo: d.tipo || 'DR. CLIENTE',
                        provincia: d.provincia || '',
                        telefono: d.telefono || '',
                        correo: d.correo || '',
                        firma: d.firma || ''
                    });
                });
            } else {
                await loadDoctorsData();
            }

            populateModalDoctorsSelect();
            applyDoctorFilters();
            applyUserFilters();
            renderTable();
            showToast("Base de datos sincronizada con la nube (Supabase).", "success");
        } catch (error) {
            console.error("Error al sincronizar base de datos:", error);
            showToast("Error de conexión a la nube. Usando base de datos local.", "error");
            renderTable();
            await loadDoctorsData();
        }
    }

    // Base de datos de prueba
    const patientDatabase = [
        // Servicio Q (muestra HE)
        { id: 1, service: 'Q', codAtencion: '26Q-208', dni: '0', medSolicitante: 'DRA. LAURA SAIRE BOCANGEL', nombres: 'CLEOFE', apellidos: 'CACCNAHUARAY HUILCAHUARI', paciente: 'CLEOFE CACCNAHUARAY HUILCAHUARI', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-07-04', fecEntrega: '2026-07-09', pagado: false, atrasado: false },
        { id: 2, service: 'Q', codAtencion: '26Q-207', dni: '0', medSolicitante: 'DR. VICTOR CASTAÑEDA ROBLES', nombres: 'PEDRO', apellidos: 'NEIRA HUCARPOMA', paciente: 'PEDRO NEIRA HUCARPOMA', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-07-04', fecEntrega: '2026-07-09', pagado: false, atrasado: false },
        { id: 3, service: 'Q', codAtencion: '26Q-206', dni: '4534', medSolicitante: '', nombres: 'WETR', apellidos: 'WERWE', paciente: 'WETR WERWE', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-07-04', fecEntrega: '2026-07-09', pagado: false, atrasado: false },
        { id: 4, service: 'Q', codAtencion: '26Q-205', dni: '74145054', medSolicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA', nombres: 'MAGDALENA', apellidos: 'BANCES SANCHEZ', paciente: 'MAGDALENA BANCES SANCHEZ', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-07-04', fecEntrega: '2026-07-09', pagado: true, atrasado: false },
        { id: 5, service: 'Q', codAtencion: '26Q-204', dni: '44559608', medSolicitante: 'DR. JUAN JESÚS MARREROS LLOCLLA', nombres: 'MERLI', apellidos: 'AREVALO ARMAS', paciente: 'MERLI AREVALO ARMAS', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-07-04', fecEntrega: '2026-07-09', pagado: true, atrasado: false },
        { id: 6, service: 'Q', codAtencion: '26Q-203', dni: '567', medSolicitante: 'DR. LAURO MACEDONIO TAPIA SILVA', nombres: 'SDF', apellidos: 'SDFSD', paciente: 'SDF SDFSD', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-07-04', fecEntrega: '2026-07-09', pagado: false, atrasado: false },
        { id: 7, service: 'Q', codAtencion: '26Q-202', dni: '52543535', medSolicitante: '', nombres: 'CVC', apellidos: 'XCV', paciente: 'CVC XCV', costo: 0, adelanto: 0, resta: 0, fecRegistro: '2026-07-04', fecEntrega: '2026-07-09', pagado: false, atrasado: false },
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

    // Inicializar especímenes de prueba de forma dinámica para la BD existente
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

    // Elementos del DOM
    const tableBody = document.getElementById('tableBody');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const filterForm = document.getElementById('filterForm');
    const btnBuscar = document.getElementById('btnBuscarReportes');
    const btnNuevoPaciente = document.getElementById('btnNuevoPaciente');

    // Estado actual de la vista
    let currentService = 'Q';

    // Estado y base de datos para Doctores
    let doctorsDatabase = [];
    let filteredDoctors = [];
    let currentDoctorPage = 1;
    let doctorPageLength = 10;

    // Estado y base de datos para Usuarios
    let usersDatabase = [
        { id: 1, perfil: 'Administrador', dni: '25837985', nombres: 'ELEANA ROSARIO , MIRANDA CARPIO', usuario: 'emiranda', clave: 'eleana123' },
        { id: 2, perfil: 'Administrador', dni: '47318848', nombres: 'CYNTHIA , QUISPE MENDOZA', usuario: 'cquispe', clave: 'cynthia456' },
        { id: 3, perfil: 'Personal', dni: '47456307', nombres: 'NATALY , GUILLERMO DOMINGUEZ', usuario: 'nguillermo', clave: 'nataly789' },
        { id: 4, perfil: 'Personal Biopath', dni: '46203707', nombres: 'ROSA MARIA , HEREDIA LEON', usuario: 'rheredia', clave: 'rosa123' },
        { id: 5, perfil: 'Personal Biopath', dni: '72850081', nombres: 'VIVIANA , VELASQUEZ SALINAS', usuario: 'vvelasquez', clave: 'viviana456' },
        { id: 6, perfil: 'Personal Biopath', dni: '40551445', nombres: 'MIRTHA , AFILER HORNA', usuario: 'mafiler', clave: 'mirtha789' },
        { id: 7, perfil: 'Administrador', dni: '45436914', nombres: 'MERY , QUISPE MENDOZA', usuario: 'mquispe', clave: 'mery123' },
        { id: 8, perfil: 'Personal', dni: '41457467', nombres: 'MARY , ALFAPREVENIR', usuario: 'malfa', clave: 'mary456' },
        { id: 9, perfil: 'Administrador', dni: '41457468', nombres: 'JOSEHP CHRISTOPHER , CASTILLO CUENCA', usuario: 'jcastillo', clave: 'josehp789' },
        { id: 10, perfil: 'Personal Biopath', dni: '70251815', nombres: 'Sandra , Castañeda Saavedra', usuario: 'scastaneda', clave: 'sandra123' },
        { id: 11, perfil: 'Personal', dni: '43849102', nombres: 'PEDRO , NEIRA HUCARPOMA', usuario: 'pneira', clave: 'pedro456' },
        { id: 12, perfil: 'Administrador', dni: '41092834', nombres: 'LAURA , SAIRE BOCANGEL', usuario: 'lsaire', clave: 'laura789' },
        { id: 13, perfil: 'Personal Biopath', dni: '48192039', nombres: 'JUAN , MARREROS LLOCLLA', usuario: 'jmarreros', clave: 'juan123' },
        { id: 14, perfil: 'Personal', dni: '49102934', nombres: 'LAURO , TAPIA SILVA', usuario: 'ltapia', clave: 'lauro456' }
    ];
    let filteredUsers = [];
    let currentUserPage = 1;
    let userPageLength = 10;

    // Estado y base de datos para Categorías de Plantillas
    let categoriesDatabase = [
        { id: 1, tipo: 'Macroscopica', categoria: '(MACRO) PROTOCOLOS SISTEMATIZADOS' },
        { id: 2, tipo: 'Macroscopica', categoria: 'DERMATOPATOLOGIA' },
        { id: 3, tipo: 'Macroscopica', categoria: 'GASTROENTEROLOGIA' },
        { id: 4, tipo: 'Macroscopica', categoria: 'GINECOLOGIA' },
        { id: 5, tipo: 'Macroscopica', categoria: 'MAMA' },
        { id: 6, tipo: 'Macroscopica', categoria: 'OTROS' },
        { id: 7, tipo: 'Macroscopica', categoria: 'PAPANICOLAOU' },
        { id: 8, tipo: 'Macroscopica', categoria: 'PARTES BLANDAS' },
        { id: 9, tipo: 'Macroscopica', categoria: 'UROLOGÍA' },
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
        { id: 21, tipo: 'Microscopica', categoria: 'OFTALMOPATOLOGIA' }
    ];
    let filteredCategories = [];
    let currentCategoryPage = 1;
    let categoryPageLength = 10;

    const viewPatients = document.getElementById('view-patients');
    const viewDoctors = document.getElementById('view-doctors');
    const viewUsers = document.getElementById('view-users');
    const viewTemplates = document.getElementById('view-templates');

    function showView(viewId) {
        // Desactivar todos los botones laterales activos
        document.querySelectorAll('.sidebar-nav .nav-item-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (viewId === 'doctor') {
            if (viewPatients) viewPatients.style.display = 'none';
            if (viewUsers) viewUsers.style.display = 'none';
            if (viewTemplates) viewTemplates.style.display = 'none';
            if (viewDoctors) viewDoctors.style.display = 'flex';
            
            // Activar botón DOCTOR
            const docBtn = document.querySelector('.nav-item-btn[data-target="doctor"]');
            if (docBtn) docBtn.classList.add('active');
        } else if (viewId === 'user') {
            if (viewPatients) viewPatients.style.display = 'none';
            if (viewDoctors) viewDoctors.style.display = 'none';
            if (viewTemplates) viewTemplates.style.display = 'none';
            if (viewUsers) viewUsers.style.display = 'flex';
            
            // Activar botón USUARIO (ahora LISTA DE USUARIOS)
            const userBtn = document.querySelector('.nav-item-btn[data-target="usuario"]');
            if (userBtn) userBtn.classList.add('active');
        } else if (viewId === 'template' || viewId === 'plantilla') {
            if (viewPatients) viewPatients.style.display = 'none';
            if (viewDoctors) viewDoctors.style.display = 'none';
            if (viewUsers) viewUsers.style.display = 'none';
            if (viewTemplates) viewTemplates.style.display = 'flex';
            
            // Activar botón PLANTILLA (ahora LISTA DE PLANTILLAS)
            const plantBtn = document.querySelector('.nav-item-btn[data-target="plantilla"]');
            if (plantBtn) plantBtn.classList.add('active');
        } else {
            if (viewDoctors) viewDoctors.style.display = 'none';
            if (viewUsers) viewUsers.style.display = 'none';
            if (viewTemplates) viewTemplates.style.display = 'none';
            if (viewPatients) viewPatients.style.display = 'flex';
            
            // Activar botón LISTADO DE PACIENTES
            const pacBtn = document.querySelector('a.nav-item-btn[href="reportes.html"]');
            if (pacBtn) pacBtn.classList.add('active');
        }
    }

    async function loadDoctorsData() {
        if (doctorsDatabase.length > 0) {
            applyDoctorFilters();
            return;
        }

        try {
            const response = await fetch('doctores.json');
            if (!response.ok) throw new Error('Error al leer doctores.json');
            doctorsDatabase = await response.json();
            
            // Llenar el select de Med. Solicitante en el modal de registro de paciente
            populateModalDoctorsSelect();

            applyDoctorFilters();
        } catch (error) {
            console.error('Error al cargar la lista de doctores:', error);
            if (window.location.protocol === 'file:') {
                showToast('Aviso: Ejecute la app con un servidor local (ej: Live Server) para cargar la lista de doctores.json debido a restricciones del navegador.', 'info');
            } else {
                showToast('Error al cargar la lista de doctores desde el servidor.', 'error');
            }
        }
    }

    function loadUsersData() {
        applyUserFilters();
    }

    function applyUserFilters() {
        const query = (document.getElementById('usersSearchInput')?.value || '').trim().toLowerCase();
        
        filteredUsers = usersDatabase.filter(u => {
            const perfil = (u.perfil || '').toLowerCase();
            const dni = (u.dni || '').toString().toLowerCase();
            const nombres = (u.nombres || '').toLowerCase();
            const usuario = (u.usuario || '').toLowerCase();
            const clave = (u.clave || '').toLowerCase();

            return perfil.includes(query) || 
                   dni.includes(query) || 
                   nombres.includes(query) ||
                   usuario.includes(query) ||
                   clave.includes(query);
        });

        currentUserPage = 1;
        renderUsersTable();
    }

    function renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const lengthVal = document.getElementById('usersPageLength')?.value || '10';
        userPageLength = lengthVal === 'all' ? filteredUsers.length : parseInt(lengthVal, 10);

        const totalRecords = filteredUsers.length;
        const totalPages = Math.ceil(totalRecords / userPageLength) || 1;

        if (currentUserPage > totalPages) {
            currentUserPage = totalPages;
        }

        const startIndex = (currentUserPage - 1) * userPageLength;
        const endIndex = Math.min(startIndex + userPageLength, totalRecords);

        const pageRecords = filteredUsers.slice(startIndex, endIndex);

        if (pageRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px; color: #64748b;">
                        No se encontraron registros de usuarios.
                    </td>
                </tr>
            `;
            const infoDiv = document.getElementById('usersTableInfo');
            if (infoDiv) infoDiv.innerText = 'Mostrando 0 a 0 de 0 registros';
            renderUsersPagination(totalPages);
            return;
        }

        pageRecords.forEach((item, index) => {
            const rowIndex = startIndex + index + 1;
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${rowIndex}</td>
                <td>${item.perfil}</td>
                <td>${item.dni}</td>
                <td>${item.nombres.toUpperCase()}</td>
                <td>${item.usuario || '---'}</td>
                <td>${item.clave || '---'}</td>
                <td class="action-cell">
                    <button type="button" class="action-btn edit-btn" title="Editar Usuario" onclick="handleUserAction('editar', ${startIndex + index})">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button type="button" class="action-btn lock-btn" style="color: #475569;" title="Bloquear/Desbloquear Usuario" onclick="handleUserAction('bloquear', ${startIndex + index})">
                        <i class="fa-solid fa-lock"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button type="button" class="action-btn approve-btn" style="color: #22c55e;" title="Activar/Desactivar Usuario" onclick="handleUserAction('aprobar', ${startIndex + index})">
                        <i class="fa-solid fa-circle-check"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update info text
        const infoDiv = document.getElementById('usersTableInfo');
        if (infoDiv) {
            infoDiv.innerText = `Mostrando del ${startIndex + 1} al ${endIndex} de un total: ${totalRecords} registros`;
        }

        renderUsersPagination(totalPages);
    }

    function renderUsersPagination(totalPages) {
        const container = document.getElementById('usersPagination');
        if (!container) return;

        container.innerHTML = '';

        // Anterior button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'pagination-btn';
        prevBtn.innerText = 'Anterior';
        prevBtn.disabled = currentUserPage === 1;
        prevBtn.onclick = () => {
            if (currentUserPage > 1) {
                currentUserPage--;
                renderUsersTable();
            }
        };
        container.appendChild(prevBtn);

        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.type = 'button';
            pageBtn.className = `pagination-btn ${i === currentUserPage ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.onclick = () => {
                currentUserPage = i;
                renderUsersTable();
            };
            container.appendChild(pageBtn);
        }

        // Siguiente button
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'pagination-btn';
        nextBtn.innerText = 'Siguiente';
        nextBtn.disabled = currentUserPage === totalPages;
        nextBtn.onclick = () => {
            if (currentUserPage < totalPages) {
                currentUserPage++;
                renderUsersTable();
            }
        };
        container.appendChild(nextBtn);
    }

    window.handleUserAction = function(action, globalIndex) {
        const user = filteredUsers[globalIndex];
        if (!user) return;

        if (action === 'editar') {
            showToast(`Editar usuario: ${user.nombres}`, 'info');
        } else if (action === 'bloquear') {
            showToast(`Usuario ${user.nombres} bloqueado/desbloqueado con éxito.`, 'success');
        } else if (action === 'aprobar') {
            showToast(`Estado de usuario ${user.nombres} cambiado.`, 'success');
        }
    };

    function loadCategoriesData() {
        applyCategoryFilters();
    }

    function applyCategoryFilters() {
        const query = (document.getElementById('categoriesSearchInput')?.value || '').trim().toLowerCase();
        
        filteredCategories = categoriesDatabase.filter(c => {
            const tipo = (c.tipo || '').toLowerCase();
            const cat = (c.categoria || '').toLowerCase();

            return tipo.includes(query) || cat.includes(query);
        });

        currentCategoryPage = 1;
        renderCategoriesTable();
    }

    function renderCategoriesTable() {
        const tbody = document.getElementById('categoriesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const lengthVal = document.getElementById('categoriesPageLength')?.value || '10';
        categoryPageLength = lengthVal === 'all' ? filteredCategories.length : parseInt(lengthVal, 10);

        const totalRecords = filteredCategories.length;
        const totalPages = Math.ceil(totalRecords / categoryPageLength) || 1;

        if (currentCategoryPage > totalPages) {
            currentCategoryPage = totalPages;
        }

        const startIndex = (currentCategoryPage - 1) * categoryPageLength;
        const endIndex = Math.min(startIndex + categoryPageLength, totalRecords);

        const pageRecords = filteredCategories.slice(startIndex, endIndex);

        if (pageRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">
                        No se encontraron registros de categorías.
                    </td>
                </tr>
            `;
            const infoDiv = document.getElementById('categoriesTableInfo');
            if (infoDiv) infoDiv.innerText = 'Mostrando 0 a 0 de 0 registros';
            renderCategoriesPagination(totalPages);
            return;
        }

        pageRecords.forEach((item, index) => {
            const rowIndex = startIndex + index + 1;
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${rowIndex}</td>
                <td>${item.tipo}</td>
                <td>${item.categoria.toUpperCase()}</td>
                <td class="action-cell">
                    <button type="button" class="action-btn edit-btn" title="Editar Categoría" onclick="handleCategoryAction('editar', ${startIndex + index})">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button type="button" class="action-btn approve-btn" style="color: #22c55e;" title="Activar/Desactivar Categoría" onclick="handleCategoryAction('aprobar', ${startIndex + index})">
                        <i class="fa-solid fa-circle-check"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button type="button" class="action-btn delete-btn" title="Eliminar Categoría" onclick="handleCategoryAction('eliminar', ${startIndex + index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update info text
        const infoDiv = document.getElementById('categoriesTableInfo');
        if (infoDiv) {
            infoDiv.innerText = `Mostrando del ${startIndex + 1} al ${endIndex} de un total: ${totalRecords} registros`;
        }

        renderCategoriesPagination(totalPages);
    }

    function renderCategoriesPagination(totalPages) {
        const container = document.getElementById('categoriesPagination');
        if (!container) return;

        container.innerHTML = '';

        // Anterior button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'pagination-btn';
        prevBtn.innerText = 'Anterior';
        prevBtn.disabled = currentCategoryPage === 1;
        prevBtn.onclick = () => {
            if (currentCategoryPage > 1) {
                currentCategoryPage--;
                renderCategoriesTable();
            }
        };
        container.appendChild(prevBtn);

        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.type = 'button';
            pageBtn.className = `pagination-btn ${i === currentCategoryPage ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.onclick = () => {
                currentCategoryPage = i;
                renderCategoriesTable();
            };
            container.appendChild(pageBtn);
        }

        // Siguiente button
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'pagination-btn';
        nextBtn.innerText = 'Siguiente';
        nextBtn.disabled = currentCategoryPage === totalPages;
        nextBtn.onclick = () => {
            if (currentCategoryPage < totalPages) {
                currentCategoryPage++;
                renderCategoriesTable();
            }
        };
        container.appendChild(nextBtn);
    }

    window.handleCategoryAction = function(action, globalIndex) {
        const cat = filteredCategories[globalIndex];
        if (!cat) return;

        if (action === 'editar') {
            const newName = prompt('Editar nombre de la categoría:', cat.categoria);
            if (newName && newName.trim()) {
                const dbIndex = categoriesDatabase.findIndex(x => x.id === cat.id);
                if (dbIndex !== -1) {
                    categoriesDatabase[dbIndex].categoria = newName.trim();
                    applyCategoryFilters();
                    showToast('Categoría modificada con éxito.', 'success');
                }
            }
        } else if (action === 'aprobar') {
            showToast(`Categoría "${cat.categoria}" validada/activada.`, 'success');
        } else if (action === 'eliminar') {
            if (confirm(`¿Está seguro de eliminar la categoría "${cat.categoria}"?`)) {
                categoriesDatabase = categoriesDatabase.filter(x => x.id !== cat.id);
                applyCategoryFilters();
                showToast('Categoría eliminada con éxito.', 'success');
            }
        }
    };

    function populateModalDoctorsSelect() {
        const select = document.getElementById('m_medSolicitante');
        if (!select) return;
        
        // Mantener la opción por defecto
        select.innerHTML = '<option value="" selected>SELECCIONAR</option>';
        
        // Obtener médicos únicos
        const uniqueDoctors = [...new Set(doctorsDatabase
            .map(d => d.doctor.trim().toUpperCase())
            .filter(name => name && name !== 'SIN DATOS' && !name.includes('---'))
        )].sort();

        uniqueDoctors.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc;
            option.text = doc;
            select.appendChild(option);
        });
    }

    function applyDoctorFilters() {
        const query = (document.getElementById('doctorsSearchInput')?.value || '').trim().toLowerCase();
        
        filteredDoctors = doctorsDatabase.filter(d => {
            const name = (d.doctor || '').toLowerCase();
            const tipo = (d.tipo || '').toLowerCase();
            const prov = (d.provincia || '').toLowerCase();
            const esp = (d.especializacion || '').toLowerCase();
            const col = (d.colegiado || '').toString().toLowerCase();
            const tel = (d.telefono || '').toString().toLowerCase();
            const mail = (d.correo || '').toLowerCase();

            return name.includes(query) || 
                   tipo.includes(query) || 
                   prov.includes(query) || 
                   esp.includes(query) || 
                   col.includes(query) || 
                   tel.includes(query) || 
                   mail.includes(query);
        });

        currentDoctorPage = 1;
        renderDoctorsTable();
    }

    function renderDoctorsTable() {
        const tbody = document.getElementById('doctorsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const lengthVal = document.getElementById('doctorsPageLength')?.value || '10';
        doctorPageLength = lengthVal === 'all' ? filteredDoctors.length : parseInt(lengthVal, 10);

        const totalRecords = filteredDoctors.length;
        const totalPages = Math.ceil(totalRecords / doctorPageLength) || 1;

        if (currentDoctorPage > totalPages) {
            currentDoctorPage = totalPages;
        }

        const startIndex = (currentDoctorPage - 1) * doctorPageLength;
        const endIndex = Math.min(startIndex + doctorPageLength, totalRecords);

        const pageRecords = filteredDoctors.slice(startIndex, endIndex);

        if (pageRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align: center; padding: 20px; color: #64748b;">
                        No se encontraron registros de doctores.
                    </td>
                </tr>
            `;
            renderDoctorsPagination(totalPages);
            return;
        }

        pageRecords.forEach((item, index) => {
            const rowIndex = startIndex + index + 1;
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${rowIndex}</td>
                <td><strong>${item.tipo || '---'}</strong></td>
                <td>${item.provincia || '---'}</td>
                <td><strong>${item.doctor || '---'}</strong></td>
                <td>${item.especializacion || '---'}</td>
                <td>${item.colegiado || '---'}</td>
                <td>${item.telefono || '---'}</td>
                <td>${item.correo || '---'}</td>
                <td>${item.firma || '---'}</td>
                <td class="action-cell">
                    <button type="button" class="action-btn edit-btn" title="Editar Doctor" onclick="handleDoctorAction('editar', ${startIndex + index})">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button type="button" class="action-btn" style="color: #22c55e;" title="Validar Doctor" onclick="handleDoctorAction('validar', ${startIndex + index})">
                        <i class="fa-solid fa-circle-check"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button type="button" class="action-btn delete-btn" title="Eliminar Doctor" onclick="handleDoctorAction('eliminar', ${startIndex + index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        renderDoctorsPagination(totalPages);
    }

    function renderDoctorsPagination(totalPages) {
        const container = document.getElementById('doctorsPagination');
        if (!container) return;

        container.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevBtn.disabled = currentDoctorPage === 1;
        prevBtn.onclick = () => {
            if (currentDoctorPage > 1) {
                currentDoctorPage--;
                renderDoctorsTable();
            }
        };
        container.appendChild(prevBtn);

        // Page buttons
        let startPage = Math.max(1, currentDoctorPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.type = 'button';
            pageBtn.className = `pagination-btn ${i === currentDoctorPage ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.onclick = () => {
                currentDoctorPage = i;
                renderDoctorsTable();
            };
            container.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.disabled = currentDoctorPage === totalPages;
        nextBtn.onclick = () => {
            if (currentDoctorPage < totalPages) {
                currentDoctorPage++;
                renderDoctorsTable();
            }
        };
        container.appendChild(nextBtn);
    }

    const doctorModalOverlay = document.getElementById('doctorModalOverlay');
    const doctorForm = document.getElementById('doctorForm');
    const btnCancelarDoctor = document.getElementById('btnCancelarDoctor');
    const closeDoctorModalBtn = document.getElementById('closeDoctorModalBtn');
    let editingDoctorIndex = null;

    function openDoctorModal(index = null) {
        editingDoctorIndex = index;
        const titleEl = document.getElementById('doctorModalTitle');
        
        if (index !== null) {
            if (titleEl) titleEl.innerText = 'Editar Doctor';
            const doc = filteredDoctors[index];
            if (doc) {
                document.getElementById('d_tipo').value = doc.tipo || 'DR. CLIENTE';
                document.getElementById('d_provincia').value = doc.provincia || '';
                document.getElementById('d_doctor').value = doc.doctor || '';
                document.getElementById('d_especializacion').value = doc.especializacion || '';
                document.getElementById('d_colegiado').value = doc.colegiado || '';
                document.getElementById('d_telefono').value = doc.telefono || '';
                document.getElementById('d_correo').value = doc.correo || '';
            }
        } else {
            if (titleEl) titleEl.innerText = 'Registrar Doctor';
            if (doctorForm) doctorForm.reset();
        }
        
        if (doctorModalOverlay) doctorModalOverlay.classList.add('active');
    }

    function closeDoctorModal() {
        if (doctorModalOverlay) doctorModalOverlay.classList.remove('active');
        if (doctorForm) doctorForm.reset();
        editingDoctorIndex = null;
    }

    if (closeDoctorModalBtn) closeDoctorModalBtn.addEventListener('click', closeDoctorModal);
    if (btnCancelarDoctor) btnCancelarDoctor.addEventListener('click', closeDoctorModal);
    if (doctorModalOverlay) {
        doctorModalOverlay.addEventListener('click', (e) => {
            if (e.target === doctorModalOverlay) closeDoctorModal();
        });
    }

    // Auto-uppercase inputs in Doctor modal
    document.querySelectorAll('#doctorModalOverlay input[type="text"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(start, end);
        });
    });

    if (doctorForm) {
        doctorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const tipo = document.getElementById('d_tipo').value;
            const provincia = document.getElementById('d_provincia').value.trim().toUpperCase();
            const doctor = document.getElementById('d_doctor').value.trim().toUpperCase();
            const especializacion = document.getElementById('d_especializacion').value.trim().toUpperCase();
            const colegiado = document.getElementById('d_colegiado').value.trim();
            const telefono = document.getElementById('d_telefono').value.trim();
            const correo = document.getElementById('d_correo').value.trim();

            if (!doctor) {
                showToast('Por favor complete el campo obligatorio del nombre del Doctor.', 'error');
                return;
            }

            const docData = {
                tipo,
                provincia,
                doctor,
                especializacion,
                colegiado,
                telefono,
                correo,
                firma: ''
            };

            const btnSave = document.getElementById('btnGuardarDoctor');
            const originalText = btnSave.innerText;
            btnSave.disabled = true;
            btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

            setTimeout(() => {
                btnSave.disabled = false;
                btnSave.innerText = originalText;

                if (editingDoctorIndex !== null) {
                    const oldDoc = filteredDoctors[editingDoctorIndex];
                    if (oldDoc) {
                        const oldName = oldDoc.doctor;
                        // Update in filtered list
                        filteredDoctors[editingDoctorIndex] = docData;
                        // Update in main database list
                        const dbIndex = doctorsDatabase.findIndex(d => d.doctor === oldName);
                        if (dbIndex !== -1) {
                            doctorsDatabase[dbIndex] = docData;
                        }

                        if (usingSupabase) {
                            supabase
                                .from('doctores')
                                .update({
                                    nombre: docData.doctor,
                                    cmp: docData.colegiado,
                                    rne: docData.especializacion,
                                    tipo: docData.tipo,
                                    provincia: docData.provincia,
                                    telefono: docData.telefono,
                                    correo: docData.correo,
                                    firma: docData.firma
                                })
                                .eq('nombre', oldName)
                                .then(({ error }) => {
                                    if (error) console.error("Error al actualizar doctor en Supabase:", error);
                                });
                        }
                    }
                    showToast(`Doctor "${doctor}" actualizado exitosamente.`, 'success');
                } else {
                    doctorsDatabase.unshift(docData);

                    if (usingSupabase) {
                        supabase
                            .from('doctores')
                            .insert([{
                                nombre: docData.doctor,
                                cmp: docData.colegiado,
                                rne: docData.especializacion,
                                tipo: docData.tipo,
                                provincia: docData.provincia,
                                telefono: docData.telefono,
                                correo: docData.correo,
                                firma: docData.firma
                            }])
                            .then(({ error }) => {
                                if (error) console.error("Error al insertar doctor en Supabase:", error);
                            });
                    }
                    showToast(`Doctor "${doctor}" registrado exitosamente.`, 'success');
                }

                applyDoctorFilters();
                populateModalDoctorsSelect();
                closeDoctorModal();
            }, 1000);
        });
    }

    window.handleDoctorAction = function(action, globalIndex) {
        const doctor = filteredDoctors[globalIndex];
        if (!doctor) return;

        if (action === 'editar') {
            openDoctorModal(globalIndex);
        } else if (action === 'validar') {
            showToast(`Doctor "${doctor.doctor}" validado correctamente.`, 'success');
        } else if (action === 'eliminar') {
            if (confirm(`¿Está seguro de eliminar de forma permanente al doctor "${doctor.doctor}"?`)) {
                const viejoNombre = doctor.doctor;
                // Eliminar de filteredDoctors
                filteredDoctors.splice(globalIndex, 1);
                // Eliminar de doctorsDatabase
                const dbIndex = doctorsDatabase.findIndex(d => d.doctor === viejoNombre);
                if (dbIndex !== -1) {
                    doctorsDatabase.splice(dbIndex, 1);
                }

                if (usingSupabase) {
                    supabase
                        .from('doctores')
                        .delete()
                        .eq('nombre', viejoNombre)
                        .then(({ error }) => {
                            if (error) console.error("Error al eliminar doctor en Supabase:", error);
                        });
                }
                showToast(`Doctor "${viejoNombre}" eliminado.`, 'error');
                renderDoctorsTable();
                populateModalDoctorsSelect();
            }
        }
    };

    // Inicialización de mayúsculas en inputs de filtro
    document.querySelectorAll('.filter-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(start, end);
        });
    });

    // Renderizar la tabla de datos
    function renderTable(data = patientDatabase) {
        tableBody.innerHTML = '';

        // Filtrar por servicio activo
        const filteredByService = data.filter(item => item.service === currentService);

        if (filteredByService.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="13" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                        No se encontraron registros de pacientes para los filtros seleccionados.
                    </td>
                </tr>
            `;
            return;
        }

        // Ordenar de mayor a menor por el número en el código de atención
        function parseCodAtencionNumber(cod) {
            if (!cod) return 0;
            const match = cod.match(/\d+$/);
            return match ? parseInt(match[0], 10) : 0;
        }

        filteredByService.sort((a, b) => {
            return parseCodAtencionNumber(b.codAtencion) - parseCodAtencionNumber(a.codAtencion);
        });

        filteredByService.forEach((item, index) => {
            const row = document.createElement('tr');

            // Determinar clases de estado
            const paymentClass = item.pagado ? 'payment-completed' : 'payment-pending';
            const dateClass = item.atrasado ? 'date-delay' : 'date-normal';

            // Formatear monedas
            const costoText = `S/ ${item.costo.toFixed(2)}`;
            const adelantoText = `S/ ${item.adelanto.toFixed(2)}`;

            // Formatear el nombre de paciente: Nombre y luego Apellido
            let pacienteName = item.paciente;
            if (pacienteName.includes(',')) {
                const parts = pacienteName.split(',');
                pacienteName = `${parts[0].trim()} ${parts[1].trim()}`;
            }

            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${item.codAtencion}</strong></td>
                <td>${item.dni}</td>
                <td>${item.medSolicitante || '---'}</td>
                <td>${pacienteName}</td>
                <td>${item.especimen || '---'}</td>
                <td class="${paymentClass}">${costoText}</td>
                <td class="${paymentClass}">${adelantoText}</td>
                <td style="text-align: center;">${formatDisplayDate(item.fecRegistro)}</td>
                <td class="${dateClass}">${formatDisplayDate(item.fecEntrega)}</td>
                <td class="action-cell">
                    <button class="action-btn edit-btn" title="Editar Registro" onclick="handleAction('editar', '${item.codAtencion}')">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button class="action-btn" title="Ver Detalles" onclick="handleAction('ver', '${item.codAtencion}')">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button class="action-btn" title="Imprimir Reporte" onclick="handleAction('pdf', '${item.codAtencion}')">
                        <i class="fa-solid fa-file-lines"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button class="action-btn delete-btn" title="Eliminar Registro" onclick="handleAction('eliminar', '${item.codAtencion}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Cambiar de pestañas de servicio
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentService = button.getAttribute('data-service');
            applyFilters();
        });
    });

    // Lógica del botón de búsqueda / filtros
    btnBuscar.addEventListener('click', applyFilters);

    function applyFilters() {
        const fecInicio = document.getElementById('fecInicio').value;
        const fecFinal = document.getElementById('fecFinal').value;
        const codAtencion = document.getElementById('codAtencion').value.trim().toUpperCase();
        const nomPaciente = document.getElementById('nomPaciente').value.trim().toUpperCase();
        const apePaciente = document.getElementById('apePaciente').value.trim().toUpperCase();
        const dni = document.getElementById('dni').value.trim();
        const medSolicitante = document.getElementById('medSolicitante').value.trim().toUpperCase();

        const filteredData = patientDatabase.filter(item => {
            // Filtro de Código
            if (codAtencion && !item.codAtencion.includes(codAtencion)) return false;
            
            // Filtro de DNI
            if (dni && !item.dni.includes(dni)) return false;

            // Filtro de Nombre / Apellido en la columna Paciente
            // La base de datos tiene "APELLIDO, NOMBRE" o similar. Buscaremos parciales.
            if (nomPaciente && !item.paciente.includes(nomPaciente)) return false;
            if (apePaciente && !item.paciente.includes(apePaciente)) return false;

            // Filtro de Médico Solicitante
            if (medSolicitante && !item.medSolicitante.includes(medSolicitante)) return false;

            // Filtro de Rango de Fechas
            if (fecInicio) {
                if (new Date(item.fecEntrega) < new Date(fecInicio)) return false;
            }
            if (fecFinal) {
                if (new Date(item.fecEntrega) > new Date(fecFinal)) return false;
            }

            return true;
        });

        renderTable(filteredData);
        showToast('Filtros aplicados con éxito.', 'success');
    }

    // --- LÓGICA DE LA VENTANA MODAL DE PACIENTES ---
    let editingCodAtencion = null;

    const registrationModalOverlay = document.getElementById('registrationModalOverlay');
    const closeHeaderBtn = document.getElementById('closeHeaderBtn');
    const m_btnSalir = document.getElementById('m_btnSalir');
    const m_patientForm = document.getElementById('patientForm');

    // Elementos del formulario de la modal
    const m_tipoServicio = document.getElementById('m_tipoServicio');
    const m_codAtencion = document.getElementById('m_codAtencion');
    const m_btnValidar = document.getElementById('m_btnValidar');
    const m_dni = document.getElementById('m_dni');
    const m_btnBuscar = document.getElementById('m_btnBuscar');
    const m_nombres = document.getElementById('m_nombres');
    const m_apellidos = document.getElementById('m_apellidos');
    const m_edad = document.getElementById('m_edad');
    const m_telefono = document.getElementById('m_telefono');
    const m_sexo = document.getElementById('m_sexo');
    const m_fContacto = document.getElementById('m_fContacto');
    const m_telContacto = document.getElementById('m_telContacto');
    const m_medSolicitante = document.getElementById('m_medSolicitante');
    const m_btnCopiar = document.getElementById('m_btnCopiar');
    const m_btnRegistro = document.getElementById('m_btnRegistro');
    const m_motivoEstudio = document.getElementById('m_motivoEstudio');
    const m_costoTransp = document.getElementById('m_costoTransp');
    const m_pagoPendiente = document.getElementById('m_pagoPendiente');
    const m_adelanto = document.getElementById('m_adelanto');
    const m_clinica = document.getElementById('m_clinica');
    const m_ordenServicio = document.getElementById('m_ordenServicio');
    const m_fileUploadStatus = document.getElementById('m_fileUploadStatus');
    const m_fecEntrega = document.getElementById('m_fecEntrega');
    const m_fecRegistro = document.getElementById('m_fecRegistro');

    // Autocompletar Código de Atención al seleccionar el Tipo de Servicio
    m_tipoServicio.addEventListener('change', () => {
        const currentYearLastTwo = String(new Date().getFullYear()).slice(-2);
        if (m_tipoServicio.value === 'EXAMEN DE MUESTRA POR HE') {
            m_codAtencion.value = `${currentYearLastTwo}Q-`;
        } else if (m_tipoServicio.value === 'PAPANICOLAOU') {
            m_codAtencion.value = `${currentYearLastTwo}C-`;
        }
    });

    // Base de datos simulada para DNI
    const dniDatabase = {
        '11111111': { nombres: 'Carlos Andrés', apellidos: 'Mendoza Rivas', edad: '34', sexo: 'M', tel: '987654321' },
        '22222222': { nombres: 'María Elena', apellidos: 'López Huamán', edad: '28', sexo: 'F', tel: '955443322' },
        '33333333': { nombres: 'Jorge Luis', apellidos: 'Quispe Mamani', edad: '45', sexo: 'M', tel: '912345678' },
        '44444444': { nombres: 'Ana Sofía', apellidos: 'Castillo Vega', edad: '19', sexo: 'F', tel: '966778899' },
        '55555555': { nombres: 'Roberto Carlos', apellidos: 'Guerrero Silva', edad: '52', sexo: 'M', tel: '944112233' }
    };

    // Helpers para formato de fecha (DD/MM/YYYY)
    function formatDate(date) {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }

    function formatDisplayDate(dateStr) {
        if (!dateStr) return '';
        if (dateStr instanceof Date) return formatDate(dateStr);
        if (dateStr.includes('/')) return dateStr;
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    }

    function parseDisplayDate(displayStr) {
        if (!displayStr) return '';
        const parts = displayStr.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return displayStr;
    }

    function subtractDays(dateStr, days) {
        if (!dateStr) return new Date();
        const date = new Date(dateStr + 'T00:00:00');
        if (isNaN(date.getTime())) return new Date();
        date.setDate(date.getDate() - days);
        return date;
    }

    // Cerrar la modal
    function closeModal() {
        registrationModalOverlay.classList.remove('active');
        m_patientForm.reset();
        editingCodAtencion = null;

        // Reset positioning styles
        const modalContainer = document.getElementById('patientRegistrationModal');
        if (modalContainer) {
            modalContainer.style.position = '';
            modalContainer.style.top = '';
            modalContainer.style.left = '';
            modalContainer.style.transform = '';
            modalContainer.style.margin = '';
        }
    }

    closeHeaderBtn.addEventListener('click', closeModal);
    m_btnSalir.addEventListener('click', closeModal);

    // Cerrar haciendo clic fuera
    registrationModalOverlay.addEventListener('click', (e) => {
        if (e.target === registrationModalOverlay) {
            closeModal();
        }
    });

    // Abrir modal para nuevo registro
    btnNuevoPaciente.addEventListener('click', () => {
        editingCodAtencion = null;
        document.getElementById('modalTitle').innerText = 'Registro Paciente';
        m_patientForm.reset();
        m_fileUploadStatus.innerText = 'Sin archivos seleccionados';
        m_costoTransp.value = '0';
        m_adelanto.value = '0';

        // Fecha de Registro (hoy)
        const today = new Date();
        m_fecRegistro.value = formatDisplayDate(today);

        // Calcular entrega fecha probable (hoy + 5 dias)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        m_fecEntrega.value = formatDisplayDate(deliveryDate);

        registrationModalOverlay.classList.add('active');
    });

    // Vincular el botón del menú lateral izquierdo para que abra el modal imitando el clic en "Paciente"
    const sidebarBtnRegistroPacientes = document.getElementById('sidebarBtnRegistroPacientes');
    if (sidebarBtnRegistroPacientes) {
        sidebarBtnRegistroPacientes.addEventListener('click', (e) => {
            e.preventDefault();
            const appContainer = document.getElementById('appContainer');
            if (appContainer) {
                appContainer.classList.remove('sidebar-active');
            }
            btnNuevoPaciente.click();
        });
    }

    // Validar código de atención
    m_btnValidar.addEventListener('click', () => {
        const value = m_codAtencion.value.trim();
        if (!value) {
            showToast('Por favor, ingrese un Código de Atención para validar.', 'error');
            m_codAtencion.focus();
            return;
        }

        m_btnValidar.disabled = true;
        m_btnValidar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validando';

        setTimeout(() => {
            m_btnValidar.disabled = false;
            m_btnValidar.innerText = 'Validar';
            
            const pattern = /^[QIC]-[0-9]+$/i;
            if (pattern.test(value)) {
                showToast(`Código de Atención "${value}" validado con éxito.`, 'success');
            } else {
                showToast(`Formato recomendado: Q, I o C seguido de guión y número (Ej: Q-452). Código aceptado.`, 'info');
            }
        }, 800);
    });

    // Buscar DNI
    function performDniSearch() {
        const dni = m_dni.value.trim();
        if (!dni || dni.length !== 8 || isNaN(dni)) {
            showToast('Por favor, ingrese un DNI válido de 8 dígitos.', 'error');
            m_dni.focus();
            return;
        }

        m_btnBuscar.disabled = true;
        m_btnBuscar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        setTimeout(() => {
            m_btnBuscar.disabled = false;
            m_btnBuscar.innerText = 'Buscar';

            if (dniDatabase[dni]) {
                const data = dniDatabase[dni];
                m_nombres.value = data.nombres.toUpperCase();
                m_apellidos.value = data.apellidos.toUpperCase();
                m_edad.value = data.edad;
                m_sexo.value = data.sexo;
                m_telefono.value = data.tel;
                
                showToast('DNI encontrado en la base de datos de RENIEC. Datos cargados.', 'success');
            } else {
                showToast('DNI no encontrado. Por favor, registre los datos manualmente.', 'info');
                m_nombres.focus();
            }
        }, 1000);
    }

    m_btnBuscar.addEventListener('click', performDniSearch);
    m_dni.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performDniSearch();
        }
    });

    // Médico solicitante: copiar
    m_btnCopiar.addEventListener('click', () => {
        const selectedOption = m_medSolicitante.options[m_medSolicitante.selectedIndex];
        if (!selectedOption.value) {
            showToast('Por favor, seleccione un Médico Solicitante para copiar.', 'error');
            m_medSolicitante.focus();
            return;
        }

        const doctorName = selectedOption.text;
        navigator.clipboard.writeText(doctorName)
            .then(() => {
                showToast(`Copiado al portapapeles: "${doctorName}"`, 'success');
            })
            .catch(err => {
                showToast('No se pudo copiar el texto automáticamente.', 'error');
            });
    });

    // Médico solicitante: registrar
    m_btnRegistro.addEventListener('click', () => {
        const newDoctor = prompt('Ingrese el nombre completo del nuevo Médico Solicitante:');
        if (newDoctor === null) return;
        
        const trimmedDoctor = newDoctor.trim().toUpperCase();
        if (!trimmedDoctor) {
            showToast('El nombre del médico no puede estar vacío.', 'error');
            return;
        }

        const option = document.createElement('option');
        const value = 'med_custom_' + Date.now();
        option.value = value;
        option.text = trimmedDoctor;
        m_medSolicitante.appendChild(option);
        m_medSolicitante.value = value;

        showToast(`Médico "${trimmedDoctor}" registrado e ingresado con éxito.`, 'success');
    });

    // Subida de archivos
    m_ordenServicio.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length === 0) {
            m_fileUploadStatus.innerText = 'Sin archivos seleccionados';
        } else if (files.length === 1) {
            m_fileUploadStatus.innerText = files[0].name;
        } else {
            m_fileUploadStatus.innerText = `${files.length} archivos seleccionados`;
        }
    });

    // Guardado del formulario (Crear / Editar)
    m_patientForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombres = m_nombres.value.trim();
        const apellidos = m_apellidos.value.trim();

        if (!nombres || !apellidos) {
            showToast('Por favor complete los campos obligatorios de Nombres y Apellidos.', 'error');
            return;
        }

        const btnGuardar = document.getElementById('m_btnGuardar');
        const originalText = btnGuardar.innerText;
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

        setTimeout(() => {
            btnGuardar.disabled = false;
            btnGuardar.innerText = originalText;

            // Determinar servicio
            // Determinar servicio y espécimen
            let service = 'Q';
            let especimen = 'BIOPSIA';
            const selectedServiceVal = m_tipoServicio.value;
            if (selectedServiceVal === 'INMUNOHISTOQUIMICA') {
                service = 'I';
                especimen = 'BLOQUE PARAFINA';
            } else if (selectedServiceVal === 'PAPANICOLAOU') {
                service = 'C';
                especimen = 'FROTIS PAP';
            } else if (selectedServiceVal === 'CITOLOGÍA ESPECIAL') {
                service = 'C';
                especimen = 'MUESTRA CITOLÓGICA';
            } else if (selectedServiceVal === 'REVISIÓN DE LAMINA') {
                service = 'Q';
                especimen = 'REVISIÓN DE LÁMINA';
            } else {
                service = 'Q';
                especimen = 'BIOPSIA';
            }

            const costo = parseFloat(m_costoTransp.value) || 0;
            const adelanto = parseFloat(m_adelanto.value) || 0;
            const resta = costo - adelanto;
            const pagado = !m_pagoPendiente.checked;

            if (editingCodAtencion) {
                // Editar registro existente
                const record = patientDatabase.find(x => x.codAtencion === editingCodAtencion);
                if (record) {
                    record.service = service;
                    record.codAtencion = m_codAtencion.value.trim().toUpperCase();
                    record.dni = m_dni.value.trim();
                    record.medSolicitante = m_medSolicitante.options[m_medSolicitante.selectedIndex].text;
                    if (record.medSolicitante === 'SELECCIONAR') record.medSolicitante = '';
                    record.nombres = nombres.toUpperCase();
                    record.apellidos = apellidos.toUpperCase();
                    record.paciente = `${nombres.toUpperCase()} ${apellidos.toUpperCase()}`;
                    record.especimen = especimen;
                    record.costo = costo;
                    record.adelanto = adelanto;
                    record.resta = resta;
                    record.pagado = pagado;
                    record.fecRegistro = parseDisplayDate(m_fecRegistro.value);
                    record.fecEntrega = parseDisplayDate(m_fecEntrega.value);

                    if (usingSupabase) {
                        const dbRecord = mapPatientToDb(record);
                        supabase
                            .from('pacientes')
                            .upsert([dbRecord], { onConflict: 'cod_atencion' })
                            .then(({ error }) => {
                                if (error) console.error("Error al actualizar paciente en Supabase:", error);
                            });
                    }
                }
                showToast(`¡Paciente actualizado exitosamente!`, 'success');
            } else {
                // Crear nuevo registro
                const nextId = patientDatabase.length > 0 ? Math.max(...patientDatabase.map(x => x.id)) + 1 : 1;
                const newRecord = {
                    id: nextId,
                    service: service,
                    codAtencion: m_codAtencion.value.trim().toUpperCase() || `26${service}-${100 + nextId}`,
                    dni: m_dni.value.trim() || '0',
                    medSolicitante: m_medSolicitante.options[m_medSolicitante.selectedIndex].text,
                    nombres: nombres.toUpperCase(),
                    apellidos: apellidos.toUpperCase(),
                    paciente: `${nombres.toUpperCase()} ${apellidos.toUpperCase()}`,
                    especimen: especimen,
                    costo: costo,
                    adelanto: adelanto,
                    resta: resta,
                    fecRegistro: parseDisplayDate(m_fecRegistro.value),
                    fecEntrega: parseDisplayDate(m_fecEntrega.value),
                    pagado: pagado,
                    atrasado: false
                };
                if (newRecord.medSolicitante === 'SELECCIONAR') newRecord.medSolicitante = '';
                patientDatabase.unshift(newRecord); // Añadir al inicio de la lista
                
                if (usingSupabase) {
                    const dbRecord = mapPatientToDb(newRecord);
                    supabase
                        .from('pacientes')
                        .insert([dbRecord])
                        .then(({ error }) => {
                            if (error) console.error("Error al insertar paciente en Supabase:", error);
                        });
                }
                showToast(`¡Paciente ${nombres} ${apellidos} registrado exitosamente!`, 'success');
            }

            renderTable();
            closeModal();
        }, 1200);
    });

    // Auto mayúsculas en campos de texto de la modal
    document.querySelectorAll('#registrationModalOverlay input[type="text"], #registrationModalOverlay textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(start, end);
        });
    });

    // Crear notificaciones elegantes tipo toast en el listado
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '<i class="fa-solid fa-circle-check"></i>';
        if (type === 'error') icon = '<i class="fa-solid fa-circle-xmark"></i>';
        if (type === 'info') icon = '<i class="fa-solid fa-circle-info"></i>';

        toast.innerHTML = `${icon} <span>${message}</span>`;
        document.body.appendChild(toast);

        // Estilos rápidos inline para toasts en reportes
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0284c7'};
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            font-size: 0.85rem;
            animation: toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        `;

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- LÓGICA DE MENÚ LATERAL Y ACORDEÓN ---
    const appContainer = document.getElementById('appContainer');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const adminGroupBtn = document.getElementById('adminGroupBtn');
    const adminGroup = document.getElementById('adminGroup');

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                appContainer.classList.toggle('sidebar-active');
            } else {
                appContainer.classList.toggle('collapsed');
            }
        });
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => {
            appContainer.classList.remove('sidebar-active');
        });
    }

    if (adminGroupBtn && adminGroup) {
        adminGroupBtn.addEventListener('click', () => {
            adminGroup.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-item-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-target');
            if (target === 'doctor') {
                showView('doctor');
                loadDoctorsData();
            } else if (target === 'usuario') {
                showView('user');
                loadUsersData();
            } else if (target === 'plantilla') {
                showView('template');
                loadCategoriesData();
            } else {
                const targetName = btn.querySelector('.nav-item-text') ? btn.querySelector('.nav-item-text').innerText : target;
                showToast(`Módulo "${targetName.toUpperCase()}" en desarrollo.`, 'info');
            }
        });
    });

    // Escuchar controles de la vista de doctores
    const doctorsSearchInput = document.getElementById('doctorsSearchInput');
    if (doctorsSearchInput) {
        doctorsSearchInput.addEventListener('input', applyDoctorFilters);
    }

    const doctorsPageLength = document.getElementById('doctorsPageLength');
    if (doctorsPageLength) {
        doctorsPageLength.addEventListener('change', renderDoctorsTable);
    }

    const btnNuevoDoctor = document.getElementById('btnNuevoDoctor');
    if (btnNuevoDoctor) {
        btnNuevoDoctor.addEventListener('click', () => {
            openDoctorModal();
        });
    }

    const btnNuevaEspecializacion = document.getElementById('btnNuevaEspecializacion');
    if (btnNuevaEspecializacion) {
        btnNuevaEspecializacion.addEventListener('click', () => {
            showToast('Módulo "Nueva Especialización" en desarrollo.', 'info');
        });
    }

    const btnExportarDoctores = document.getElementById('btnExportarDoctores');
    if (btnExportarDoctores) {
        btnExportarDoctores.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(doctorsDatabase, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "doctores_exportados.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast('Exportación de doctores iniciada.', 'success');
        });
    }

    // Escuchar controles de la vista de usuarios
    const usersSearchInput = document.getElementById('usersSearchInput');
    if (usersSearchInput) {
        usersSearchInput.addEventListener('input', applyUserFilters);
    }

    const usersPageLength = document.getElementById('usersPageLength');
    if (usersPageLength) {
        usersPageLength.addEventListener('change', renderUsersTable);
    }

    const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
    if (btnNuevoUsuario) {
        btnNuevoUsuario.addEventListener('click', () => {
            showToast('Módulo "Nuevo Usuario" en desarrollo.', 'info');
        });
    }

    // Escuchar controles de la vista de categorías y plantillas
    const categoriesSearchInput = document.getElementById('categoriesSearchInput');
    if (categoriesSearchInput) {
        categoriesSearchInput.addEventListener('input', applyCategoryFilters);
    }

    const categoriesPageLength = document.getElementById('categoriesPageLength');
    if (categoriesPageLength) {
        categoriesPageLength.addEventListener('change', renderCategoriesTable);
    }

    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const catTipo = document.getElementById('catTipo').value;
            const catNombre = document.getElementById('catNombre').value.trim();

            if (!catTipo || !catNombre) {
                showToast('Por favor, complete todos los campos.', 'error');
                return;
            }

            const newId = categoriesDatabase.length > 0 ? Math.max(...categoriesDatabase.map(x => x.id)) + 1 : 1;
            categoriesDatabase.unshift({
                id: newId,
                tipo: catTipo,
                categoria: catNombre
            });

            categoryForm.reset();
            applyCategoryFilters();
            showToast('Categoría guardada con éxito.', 'success');
        });
    }

    // Toggle de Sub-pestañas
    const subtabCategories = document.getElementById('subtabCategories');
    const subtabTemplates = document.getElementById('subtabTemplates');
    const categoriesTabContent = document.getElementById('categories-tab-content');
    const templatesTabContent = document.getElementById('templates-tab-content');

    if (subtabCategories && subtabTemplates && categoriesTabContent && templatesTabContent) {
        subtabCategories.addEventListener('click', () => {
            subtabCategories.classList.add('active');
            subtabCategories.style.color = '#0284c7';
            subtabCategories.style.borderBottom = '2px solid #0284c7';
            subtabCategories.style.fontWeight = '600';

            subtabTemplates.classList.remove('active');
            subtabTemplates.style.color = '#64748b';
            subtabTemplates.style.borderBottom = 'none';
            subtabTemplates.style.fontWeight = '500';

            categoriesTabContent.style.display = 'block';
            templatesTabContent.style.display = 'none';
        });

        subtabTemplates.addEventListener('click', () => {
            subtabTemplates.classList.add('active');
            subtabTemplates.style.color = '#0284c7';
            subtabTemplates.style.borderBottom = '2px solid #0284c7';
            subtabTemplates.style.fontWeight = '600';

            subtabCategories.classList.remove('active');
            subtabCategories.style.color = '#64748b';
            subtabCategories.style.borderBottom = 'none';
            subtabCategories.style.fontWeight = '500';

            categoriesTabContent.style.display = 'none';
            templatesTabContent.style.display = 'block';
        });
    }

    // Inicializar tabla y sincronizar base de datos
    syncDatabase().then(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('view') === 'doctor') {
            showView('doctor');
        } else if (urlParams.get('view') === 'user') {
            showView('user');
            loadUsersData();
        } else if (urlParams.get('view') === 'template' || urlParams.get('view') === 'plantilla') {
            showView('template');
            loadCategoriesData();
        }
    });

    // Exportar función global para manejar acciones del listado
    window.handleAction = function(action, codAtencion) {
        if (action === 'editar') {
            const patient = patientDatabase.find(x => x.codAtencion === codAtencion);
            if (patient) {
                editingCodAtencion = codAtencion;
                
                // Map database values back to the new full-screen report editor
                document.getElementById('re_codAtencion').value = patient.codAtencion;
                document.getElementById('re_dni').value = patient.dni || "0";
                
                // Map patient names and surnames
                let nomVal = "";
                let apeVal = "";
                if (patient.nombres && patient.apellidos) {
                    nomVal = patient.nombres;
                    apeVal = patient.apellidos;
                } else {
                    const parts = patient.paciente.split(',');
                    if (parts.length > 1) {
                        apeVal = parts[0].trim();
                        nomVal = parts[1].trim();
                    } else {
                        apeVal = '';
                        nomVal = patient.paciente;
                    }
                }
                document.getElementById('re_nomPaciente').value = nomVal;
                document.getElementById('re_apePaciente').value = apeVal;
                
                // Set default values if not present
                document.getElementById('re_sexo').value = patient.sexo || "MASCULINO";
                document.getElementById('re_edad').value = patient.edad || 66;
                document.getElementById('re_telefono').value = patient.telefono || "987654321";
                document.getElementById('re_fContacto').value = patient.fContacto || "0";
                document.getElementById('re_telContacto').value = patient.telContacto || "0";
                
                // Med Solicitante
                const medSelect = document.getElementById('re_medSolicitante');
                if (patient.medSolicitante) {
                    let matched = false;
                    for (let option of medSelect.options) {
                        if (option.text.toUpperCase() === patient.medSolicitante.toUpperCase() || option.value.toUpperCase() === patient.medSolicitante.toUpperCase()) {
                            medSelect.value = option.value;
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) {
                        // Create a new option
                        const opt = document.createElement('option');
                        opt.value = patient.medSolicitante;
                        opt.text = patient.medSolicitante;
                        medSelect.appendChild(opt);
                        medSelect.value = patient.medSolicitante;
                    }
                } else {
                    medSelect.value = "SELECCIONAR";
                }
                
                document.getElementById('re_motivoEstudio').value = patient.motivoEstudio || patient.especimen || "MORCELADOS DE PRÓSTATA";
                document.getElementById('re_fecEntrega').value = formatDisplayDate(patient.fecEntrega);
                document.getElementById('re_doctor').value = patient.doctor || "DR. JOSEHP CASTILLO";
                document.getElementById('re_casetes').value = patient.casetes || 1;
                
                document.getElementById('re_diagnostico').value = patient.diagnostico || "";
                
                document.getElementById('re_catMacro').value = patient.catMacro || "";
                document.getElementById('re_planMacro').value = patient.planMacro || "";
                document.getElementById('re_macroDesc').value = patient.macroDesc || "";
                
                document.getElementById('re_catMicro').value = patient.catMicro || "";
                document.getElementById('re_planMicro').value = patient.planMicro || "";
                document.getElementById('re_microDesc').value = patient.microDesc || "";
                
                // Files table clear
                document.getElementById('re_filesTableBody').innerHTML = `<tr><td class="empty-table-cell">No hay información solicitada</td></tr>`;
                document.getElementById('re_fileStatus').textContent = "Sin archivos seleccionados";
                document.getElementById('re_fileInput').value = "";
                
                // Map images
                const img01PreviewContainer = document.getElementById('re_img01PreviewContainer');
                const img01UploadZone = document.getElementById('re_img01UploadZone');
                const img01Preview = document.getElementById('re_img01Preview');
                
                if (patient.img01) {
                    img01Preview.src = patient.img01;
                    img01UploadZone.style.display = 'none';
                    img01PreviewContainer.style.display = 'flex';
                } else {
                    img01Preview.src = "";
                    img01PreviewContainer.style.display = 'none';
                    img01UploadZone.style.display = 'flex';
                }
                
                const img02PreviewContainer = document.getElementById('re_img02PreviewContainer');
                const img02UploadZone = document.getElementById('re_img02UploadZone');
                const img02Preview = document.getElementById('re_img02Preview');
                
                if (patient.img02) {
                    img02Preview.src = patient.img02;
                    img02UploadZone.style.display = 'none';
                    img02PreviewContainer.style.display = 'flex';
                } else {
                    img02Preview.src = "";
                    img02PreviewContainer.style.display = 'none';
                    img02UploadZone.style.display = 'flex';
                }
                
                // Open modal overlay
                document.getElementById('reportEditorModalOverlay').classList.add('active');
            } else {
                showToast(`No se encontró el registro ${codAtencion}.`, 'error');
            }
        } else if (action === 'ver') {
            alert(`Ficha Clínica del Paciente\nCódigo: ${codAtencion}\nDatos completos listados de forma detallada en modal.`);
        } else if (action === 'pdf') {
            const patient = patientDatabase.find(x => x.codAtencion === codAtencion);
            if (patient) {
                localStorage.setItem('printPatientData', JSON.stringify(patient));
                window.open('imprimir.html', '_blank', 'width=950,height=1000');
            } else {
                showToast(`No se encontró el registro ${codAtencion}.`, 'error');
            }
        } else if (action === 'eliminar') {
            if (confirm(`¿Está seguro de eliminar de forma permanente el registro ${codAtencion}?`)) {
                showToast(`Registro ${codAtencion} eliminado de la base de datos.`, 'error');
                // Simulación de borrado
                const idx = patientDatabase.findIndex(x => x.codAtencion === codAtencion);
                if (idx !== -1) {
                    patientDatabase.splice(idx, 1);
                    renderTable();
                }

                if (usingSupabase) {
                    supabase
                        .from('pacientes')
                        .delete()
                        .eq('cod_atencion', codAtencion)
                        .then(({ error }) => {
                            if (error) console.error("Error al eliminar paciente en Supabase:", error);
                        });
                }
            }
        } else if (action === 'ticket') {
            showToast(`Imprimiendo ticket de barra para el tubo de muestra del código ${codAtencion}...`, 'success');
        }
    };

    // --- HACER LA MODAL ARRASTRABLE (DRAGGABLE) ---
    const modalContainer = document.getElementById('patientRegistrationModal');
    const modalHeader = modalContainer ? modalContainer.querySelector('.modal-header') : null;
    
    if (modalContainer && modalHeader) {
        makeElementDraggable(modalContainer, modalHeader);
    }

    function makeElementDraggable(elmnt, dragHandle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        dragHandle.style.cursor = 'grab';
        dragHandle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            // Evitar arrastre si se hace clic en botones/iconos del header
            if (e.target.closest('.close-btn') || e.target.closest('button') || e.target.closest('i')) {
                return;
            }
            e.preventDefault();
            
            // Posición inicial del mouse
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Congelar a posición absoluta en píxeles de viewport
            const rect = elmnt.getBoundingClientRect();
            elmnt.style.position = 'absolute';
            elmnt.style.top = rect.top + 'px';
            elmnt.style.left = rect.left + 'px';
            elmnt.style.transform = 'none';
            elmnt.style.margin = '0';
            
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            dragHandle.style.cursor = 'grabbing';
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            dragHandle.style.cursor = 'grab';
        }
    }

    // --- LÓGICA DE DICTADO POR VOZ (GOOGLE WEB SPEECH) ---
    let dictationRecognition = null;
    let isDictating = false;
    let lastFocusedInput = null;

    // Registrar focus en los inputs para saber dónde insertar el dictado
    document.querySelectorAll('#patientRegistrationModal input, #patientRegistrationModal textarea, #patientRegistrationModal select').forEach(el => {
        el.addEventListener('focus', () => {
            lastFocusedInput = el;
        });
    });

    const m_btnDictado = document.getElementById('m_btnDictado');
    if (m_btnDictado) {
        m_btnDictado.addEventListener('click', () => {
            toggleDictation(m_btnDictado);
        });
    }

    function toggleDictation(btn) {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!window.SpeechRecognition) {
            showToast("Su navegador no soporta el dictado por voz de Google.", "error");
            return;
        }

        if (isDictating) {
            stopDictation(btn);
        } else {
            startDictation(btn);
        }
    }

    function startDictation(btn) {
        dictationRecognition = new window.webkitSpeechRecognition();
        dictationRecognition.lang = 'es-PE';
        dictationRecognition.continuous = true;
        dictationRecognition.interimResults = false;

        dictationRecognition.onstart = () => {
            isDictating = true;
            btn.classList.add('listening');
            btn.innerHTML = '<i class="fa-solid fa-microphone fa-beat" style="color: #ffffff;"></i> Escuchando...';
            showToast("Micrófono activado. Hable ahora...", "success");
        };

        dictationRecognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            if (event.error === 'not-allowed') {
                showToast("Acceso al micrófono denegado. Permítalo en su navegador.", "error");
            } else {
                showToast(`Error de dictado: ${event.error}`, "error");
            }
            stopDictation(btn);
        };

        dictationRecognition.onend = () => {
            stopDictation(btn);
        };

        dictationRecognition.onresult = (event) => {
            const resultIndex = event.resultIndex;
            const transcript = event.results[resultIndex][0].transcript.trim();
            console.log("Dictado:", transcript);
            processDictationResult(transcript);
        };

        dictationRecognition.start();
    }

    function stopDictation(btn) {
        if (dictationRecognition) {
            dictationRecognition.onend = null;
            dictationRecognition.onerror = null;
            dictationRecognition.stop();
            dictationRecognition = null;
        }
        isDictating = false;
        btn.classList.remove('listening');
        btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Llenado por dictado';
    }

    function processDictationResult(text) {
        const rules = [
            { regex: /^(tipo de servicio|tipo servicio|servicio)\s+(.+)$/i, fieldId: 'm_tipoServicio' },
            { regex: /^(código de atención|codigo de atencion|código|codigo|atención|atencion)\s+(.+)$/i, fieldId: 'm_codAtencion' },
            { regex: /^(nombres?|nombre)\s+(.+)$/i, fieldId: 'm_nombres' },
            { regex: /^(apellidos?|apellido)\s+(.+)$/i, fieldId: 'm_apellidos' },
            { regex: /^(dni|documento|cédula|cedula)\s+(.+)$/i, fieldId: 'm_dni' },
            { regex: /^(edad)\s+(.+)$/i, fieldId: 'm_edad' },
            { regex: /^(teléfono|telefono|celular)\s+(.+)$/i, fieldId: 'm_telefono' },
            { regex: /^(sexo|género|genero)\s+(.+)$/i, fieldId: 'm_sexo' },
            { regex: /^(motivo|estudio|diagnóstico|diagnostico)\s+(.+)$/i, fieldId: 'm_motivoEstudio' },
            { regex: /^(clínica|clinica)\s+(.+)$/i, fieldId: 'm_clinica' },
            { regex: /^(costo|transporte|costo transporte)\s+(.+)$/i, fieldId: 'm_costoTransp' },
            { regex: /^(adelanto)\s+(.+)$/i, fieldId: 'm_adelanto' }
        ];

        let matched = false;
        for (const rule of rules) {
            const match = text.match(rule.regex);
            if (match) {
                let value = match[2].trim();
                const input = document.getElementById(rule.fieldId);

                if (input) {
                    if (input.tagName === 'SELECT') {
                        const valLower = value.toLowerCase();
                        if (input.id.includes('tipoServicio')) {
                            if (valLower.includes('examen') || valLower.includes('muestra') || valLower.includes('he')) {
                                input.value = 'EXAMEN DE MUESTRA POR HE';
                            } else if (valLower.includes('papanicolau') || valLower.includes('papanicolaou')) {
                                input.value = 'PAPANICOLAOU';
                            }
                        } else if (input.id.includes('sexo')) {
                            if (valLower.includes('masculino') || valLower === 'm' || valLower === 'hombre') {
                                input.value = 'M';
                            } else if (valLower.includes('femenino') || valLower === 'f' || valLower === 'mujer') {
                                input.value = 'F';
                            } else {
                                input.value = 'O';
                            }
                        }
                    } else {
                        if (rule.fieldId.includes('nombres') || rule.fieldId.includes('apellidos')) {
                            value = value.toUpperCase();
                        }
                        if (rule.fieldId.includes('codAtencion') || rule.fieldId.includes('dni')) {
                            value = value.replace(/\s+/g, '').toUpperCase();
                        }
                        input.value = value;
                    }

                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    showToast(`Campo actualizado: ${value}`, "success");
                    matched = true;
                    break;
                }
            }
        }

        if (!matched) {
            let activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && activeEl.closest('#patientRegistrationModal')) {
                insertTextAtCursor(activeEl, text);
            } else if (lastFocusedInput) {
                insertTextAtCursor(lastFocusedInput, text);
            } else {
                const defaultInput = document.getElementById('m_nombres');
                if (defaultInput) {
                    insertTextAtCursor(defaultInput, text);
                }
            }
        }
    }

    function insertTextAtCursor(input, text) {
        if (input.id.includes('nombres') || input.id.includes('apellidos')) {
            text = text.toUpperCase();
        }
        if (input.id.includes('codAtencion') || input.id.includes('dni')) {
            text = text.replace(/\s+/g, '').toUpperCase();
        }
        
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const val = input.value;

        if (!val) {
            input.value = text;
        } else {
            const separator = (input.id.includes('codAtencion') || input.id.includes('dni')) ? '' : ' ';
            input.value = val.substring(0, start) + (start > 0 && val[start-1] !== ' ' && separator ? separator : '') + text + val.substring(end);
        }

        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.focus();

        const newPos = start + text.length + (val ? 1 : 0);
        input.setSelectionRange(newPos, newPos);
        showToast("Texto añadido", "success");
    }

    // --- LÓGICA DEL NUEVO EDITOR DE REPORTES (PANTALLA COMPLETA) ---

    // Tab switching logic
    const reTabButtons = document.querySelectorAll('.tab-header-btn');
    reTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            reTabButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // File upload logic
    const reFileInput = document.getElementById('re_fileInput');
    const reBtnElegirArchivos = document.getElementById('re_btnElegirArchivos');
    const reBtnCarga = document.getElementById('re_btnCarga');
    const reFileStatus = document.getElementById('re_fileStatus');
    const reFilesTableBody = document.getElementById('re_filesTableBody');

    if (reBtnElegirArchivos && reFileInput) {
        reBtnElegirArchivos.addEventListener('click', () => reFileInput.click());
    }

    if (reFileInput && reFileStatus) {
        reFileInput.addEventListener('change', () => {
            if (reFileInput.files.length > 0) {
                reFileStatus.textContent = reFileInput.files.length + " archivo(s) seleccionado(s)";
            } else {
                reFileStatus.textContent = "Sin archivos seleccionados";
            }
        });
    }

    if (reBtnCarga && reFileInput && reFilesTableBody) {
        reBtnCarga.addEventListener('click', () => {
            if (reFileInput.files.length > 0) {
                reFilesTableBody.innerHTML = "";
                for (let i = 0; i < reFileInput.files.length; i++) {
                    const file = reFileInput.files[i];
                    const row = document.createElement('tr');
                    row.innerHTML = `<td><i class="fa-regular fa-file-lines" style="margin-right: 8px; color: #2563eb;"></i> ${file.name}</td>`;
                    reFilesTableBody.appendChild(row);
                }
                showToast("Archivos cargados al servicio con éxito", "success");
            } else {
                showToast("Seleccione al menos un archivo para cargar", "error");
            }
        });
    }

    // Image 01 attachment upload
    const reImg01Input = document.getElementById('re_img01Input');
    const reImg01UploadZone = document.getElementById('re_img01UploadZone');
    const reImg01PreviewContainer = document.getElementById('re_img01PreviewContainer');
    const reImg01Preview = document.getElementById('re_img01Preview');
    const reBtnRemoveImg01 = document.getElementById('re_btnRemoveImg01');

    if (reImg01Input) {
        reImg01Input.addEventListener('change', () => {
            const file = reImg01Input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    reImg01Preview.src = e.target.result;
                    reImg01UploadZone.style.display = 'none';
                    reImg01PreviewContainer.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (reBtnRemoveImg01) {
        reBtnRemoveImg01.addEventListener('click', (e) => {
            e.stopPropagation();
            reImg01Input.value = "";
            reImg01Preview.src = "";
            reImg01PreviewContainer.style.display = 'none';
            reImg01UploadZone.style.display = 'flex';
        });
    }

    // Image 02 attachment upload
    const reImg02Input = document.getElementById('re_img02Input');
    const reImg02UploadZone = document.getElementById('re_img02UploadZone');
    const reImg02PreviewContainer = document.getElementById('re_img02PreviewContainer');
    const reImg02Preview = document.getElementById('re_img02Preview');
    const reBtnRemoveImg02 = document.getElementById('re_btnRemoveImg02');

    if (reImg02Input) {
        reImg02Input.addEventListener('change', () => {
            const file = reImg02Input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    reImg02Preview.src = e.target.result;
                    reImg02UploadZone.style.display = 'none';
                    reImg02PreviewContainer.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (reBtnRemoveImg02) {
        reBtnRemoveImg02.addEventListener('click', (e) => {
            e.stopPropagation();
            reImg02Input.value = "";
            reImg02Preview.src = "";
            reImg02PreviewContainer.style.display = 'none';
            reImg02UploadZone.style.display = 'flex';
        });
    }

    // Copiar Médico Solicitante
    const reBtnCopiarMed = document.getElementById('re_btnCopiarMed');
    if (reBtnCopiarMed) {
        reBtnCopiarMed.addEventListener('click', () => {
            const medVal = document.getElementById('re_medSolicitante').value;
            if (medVal && medVal !== 'SELECCIONAR') {
                navigator.clipboard.writeText(medVal).then(() => {
                    showToast("Nombre del médico copiado al portapapeles", "success");
                }).catch(() => {
                    showToast("No se pudo copiar el texto", "error");
                });
            } else {
                showToast("Seleccione un médico válido para copiar", "warning");
            }
        });
    }

    // Salir del editor
    const reBtnSalir = document.getElementById('re_btnSalir');
    if (reBtnSalir) {
        reBtnSalir.addEventListener('click', () => {
            document.getElementById('reportEditorModalOverlay').classList.remove('active');
        });
    }

    // Firma button
    const reBtnFirma = document.getElementById('re_btnFirma');
    if (reBtnFirma) {
        reBtnFirma.addEventListener('click', () => {
            showToast("Insertando firma digital del patólogo en el reporte...", "success");
        });
    }

    // Vista Previa button
    const reBtnPreview = document.getElementById('re_btnPreview');
    if (reBtnPreview) {
        reBtnPreview.addEventListener('click', () => {
            showToast("Generando vista previa del informe anatomopatológico...", "info");
        });
    }

    // Guardar cambios del editor
    const reBtnGuardar = document.getElementById('re_btnGuardar');
    if (reBtnGuardar) {
        reBtnGuardar.addEventListener('click', () => {
            const patient = patientDatabase.find(x => x.codAtencion === editingCodAtencion);
            if (patient) {
                // Save the fields back to patient database
                patient.dni = document.getElementById('re_dni').value;
                
                const selectedSexo = document.getElementById('re_sexo').value;
                patient.sexo = selectedSexo === 'MASCULINO' ? 'M' : (selectedSexo === 'FEMENINO' ? 'F' : 'O');
                
                patient.nombres = document.getElementById('re_nomPaciente').value;
                patient.apellidos = document.getElementById('re_apePaciente').value;
                patient.paciente = `${patient.apellidos}, ${patient.nombres}`;
                
                patient.edad = parseInt(document.getElementById('re_edad').value) || 0;
                patient.telefono = document.getElementById('re_telefono').value;
                patient.fContacto = document.getElementById('re_fContacto').value;
                patient.telContacto = document.getElementById('re_telContacto').value;
                
                patient.medSolicitante = document.getElementById('re_medSolicitante').value;
                patient.motivoEstudio = document.getElementById('re_motivoEstudio').value;
                patient.especimen = patient.motivoEstudio;
                
                patient.doctor = document.getElementById('re_doctor').value;
                patient.casetes = parseInt(document.getElementById('re_casetes').value) || 1;
                
                patient.diagnostico = document.getElementById('re_diagnostico').value;
                
                patient.catMacro = document.getElementById('re_catMacro').value;
                patient.planMacro = document.getElementById('re_planMacro').value;
                patient.macroDesc = document.getElementById('re_macroDesc').value;
                
                patient.catMicro = document.getElementById('re_catMicro').value;
                patient.planMicro = document.getElementById('re_planMicro').value;
                patient.microDesc = document.getElementById('re_microDesc').value;
                
                // Save images
                if (document.getElementById('re_img01PreviewContainer').style.display !== 'none') {
                    patient.img01 = document.getElementById('re_img01Preview').src;
                } else {
                    patient.img01 = "";
                }
                
                if (document.getElementById('re_img02PreviewContainer').style.display !== 'none') {
                    patient.img02 = document.getElementById('re_img02Preview').src;
                } else {
                    patient.img02 = "";
                }

                if (usingSupabase) {
                    const dbRecord = mapPatientToDb(patient);
                    supabase
                        .from('pacientes')
                        .upsert([dbRecord], { onConflict: 'cod_atencion' })
                        .then(({ error }) => {
                            if (error) {
                                console.error("Error al guardar reporte en Supabase:", error);
                                showToast("Error al guardar en la nube.", "error");
                            } else {
                                showToast("Reporte guardado en la nube con éxito.", "success");
                            }
                        });
                }
                
                // Re-render table
                renderTable();
                
                // Hide modal
                document.getElementById('reportEditorModalOverlay').classList.remove('active');
                showToast("Cambios guardados con éxito en la ficha del paciente", "success");
            }
        });
    }

    // Rich text editor support function
    window.formatEditorText = function(textareaId, command) {
        const textarea = document.getElementById(textareaId);
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = "";
        
        if (command === 'bold') {
            replacement = `**${selectedText}**`;
        } else if (command === 'italic') {
            replacement = `*${selectedText}*`;
        } else if (command === 'underline') {
            replacement = `_${selectedText}_`;
        } else if (command === 'list') {
            replacement = `\n- ${selectedText}`;
        } else if (command === 'indent') {
            replacement = `    ${selectedText}`;
        } else if (command === 'left' || command === 'center' || command === 'right' || command === 'justify') {
            replacement = `[align-${command}]${selectedText}[/align]`;
        } else {
            replacement = selectedText;
        }
        
        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    };
});

// Estilos de animación globales agregados dinámicamente si no existen
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes toastIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes toastOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(20px); }
}
`;
document.head.appendChild(styleSheet);
