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

            // Descargar plantillas de Supabase (aislado para no romper si no existe la tabla)
            try {
                const { data: plantillasData, error: plantillasError } = await supabase
                    .from('plantillas')
                    .select('*');
                
                if (!plantillasError && plantillasData && plantillasData.length > 0) {
                    templatesDatabase.length = 0;
                    plantillasData.forEach(p => {
                        templatesDatabase.push({
                            id: p.id,
                            categoryId: p.categoryId,
                            titulo: p.titulo || '',
                            macro: p.macro || '',
                            micro: p.micro || '',
                            diag: p.diag || ''
                        });
                    });
                    localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
                    // Si se descargaron plantillas de la nube, ignoramos el borrado inicial
                    localStorage.setItem('wipedForDarkClonV2', 'true');
                    localStorage.setItem('wipedForCleanWeb', 'true');
                    if (typeof poblarSelectoresEspecialidadReportes === 'function') poblarSelectoresEspecialidadReportes();
                    if (typeof renderTemplatesTreeView === 'function') renderTemplatesTreeView();
                }
            } catch (err) {
                console.warn('Tabla plantillas no existe aún en Supabase o error:', err);
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
    const defaultCategories = [
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

    let categoriesDatabase = JSON.parse(localStorage.getItem('categoriasDB')) || defaultCategories;
    
    if (!categoriesDatabase || categoriesDatabase.length < 24) {
        categoriesDatabase = defaultCategories;
        localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
    }

    // Base de datos de Plantillas
    
    // Base de datos de Plantillas
    let templatesDatabase = JSON.parse(localStorage.getItem('plantillasDB')) || [];
    
    // Si est vaco, inicializar con defaultTemplates de plantillas_data.js
    if (templatesDatabase.length === 0 && window.defaultTemplates) {
        templatesDatabase = [...window.defaultTemplates];
        localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
    }


    // --- BARRIDO TOTAL A PETICIÓN DEL USUARIO PARA CREACIÓN EN WEB ---
    if (!localStorage.getItem('wipedForCleanWeb')) {
        categoriesDatabase = [];
        templatesDatabase = [];
        localStorage.removeItem('categoriasDB');
        localStorage.removeItem('plantillasDB');
        localStorage.setItem('wipedForCleanWeb', 'true');
        
        // Wipe Supabase silently
        ).catch(e => console.warn(e));
        }
    }
    // ------------------------------------------------------------------


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

            if (item.isNew || item.isEditing) {
                row.innerHTML = `
                    <td>${rowIndex}</td>
                    <td>
                        <select class="user-inline-perfil filter-input" style="padding:4px; width:100%;">
                            <option value="Administrador" ${item.perfil === 'Administrador' ? 'selected' : ''}>Administrador</option>
                            <option value="Usuario" ${item.perfil === 'Usuario' || item.perfil === 'Personal' ? 'selected' : ''}>Usuario</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" class="user-inline-dni filter-input" value="${item.dni || ''}" placeholder="DNI" style="padding:4px; width:100%;">
                    </td>
                    <td>
                        <input type="text" class="user-inline-nombres filter-input" value="${item.nombres || ''}" placeholder="Nombre Completo" style="padding:4px; width:100%; text-transform: uppercase;">
                    </td>
                    <td>
                        <input type="text" class="user-inline-usuario filter-input" value="${item.usuario || ''}" placeholder="Usuario" style="padding:4px; width:100%;">
                    </td>
                    <td>
                        <input type="text" class="user-inline-clave filter-input" value="${item.clave || ''}" placeholder="Clave" style="padding:4px; width:100%;">
                    </td>
                    <td class="action-cell" colspan="3" style="text-align: center;">
                        <button type="button" class="action-btn save-btn" style="color: #22c55e; margin-right: 10px;" title="Guardar Usuario" onclick="saveInlineUser(${startIndex + index})">
                            <i class="fa-solid fa-floppy-disk"></i>
                        </button>
                        <button type="button" class="action-btn delete-btn" style="color: #ef4444;" title="Cancelar" onclick="cancelInlineUser(${startIndex + index})">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td>${rowIndex}</td>
                    <td>${item.perfil === 'Personal' ? 'Usuario' : item.perfil}</td>
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
            }
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

    window.handleUserAction = function (action, globalIndex) {
        const user = filteredUsers[globalIndex];
        if (!user) return;

        if (action === 'editar') {
            if (usersDatabase.some(u => u.isNew || u.isEditing)) {
                showToast('Ya hay un usuario en edición o borrador. Guarde o cancele antes de continuar.', 'warning');
                return;
            }
            user.isEditing = true;
            renderUsersTable();
        } else if (action === 'bloquear') {
            showToast(`Usuario ${user.nombres} bloqueado/desbloqueado con éxito.`, 'success');
        } else if (action === 'aprobar') {
            showToast(`Estado de usuario ${user.nombres} cambiado.`, 'success');
        }
    };

    let activeTemplateTab = 'Macroscopica';

    function loadCategoriesData() {
        applyCategoryFilters();
    }

    function applyCategoryFilters() {
        const query = (document.getElementById('categoriesSearchInput')?.value || '').trim().toLowerCase();

        filteredCategories = categoriesDatabase.filter(c => {
            const tipo = (c.tipo || '').toLowerCase();
            const cat = (c.categoria || '').toLowerCase();

            return tipo === activeTemplateTab.toLowerCase() && cat.includes(query);
        });

        renderCategoriesList();
    }

    function renderCategoriesList() {
        const container = document.getElementById('categoriesListContainer');
        if (!container) return;

        container.innerHTML = '';

        if (filteredCategories.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 0.9rem;">
                    No se encontraron categorías.
                </div>
            `;
            return;
        }

        filteredCategories.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'category-item-btn';
            btn.style.cssText = `
                display: flex; justify-content: space-between; align-items: center;
                width: 100%; padding: 12px 15px; background: white; border: 1px solid #e2e8f0;
                border-radius: 6px; cursor: pointer; transition: all 0.2s; text-align: left;
                color: #334155; font-weight: 500;
            `;

            // Hover effect can be added via class or inline events
            btn.onmouseenter = () => { if (!btn.classList.contains('active-cat')) btn.style.background = '#f8fafc'; };
            btn.onmouseleave = () => { if (!btn.classList.contains('active-cat')) btn.style.background = 'white'; };

            btn.innerHTML = `
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.categoria.toUpperCase()}</span>
                <div style="display: flex; gap: 8px;">
                    <i class="fa-solid fa-pencil" style="color: #64748b; font-size: 0.85rem;" title="Editar" onclick="event.stopPropagation(); handleCategoryAction('editar', ${index})"></i>
                    <i class="fa-solid fa-trash" style="color: #ef4444; font-size: 0.85rem;" title="Eliminar" onclick="event.stopPropagation(); handleCategoryAction('eliminar', ${index})"></i>
                </div>
            `;

            btn.onclick = () => {
                // Remove active styling from all
                document.querySelectorAll('.category-item-btn').forEach(b => {
                    b.classList.remove('active-cat');
                    b.style.background = 'white';
                    b.style.borderColor = '#e2e8f0';
                    b.style.color = '#334155';
                });

                // Add active styling
                btn.classList.add('active-cat');
                btn.style.background = '#f0f9ff';
                btn.style.borderColor = '#38bdf8';
                btn.style.color = '#0369a1';

                showTemplatesForCategory(item);
            };

            container.appendChild(btn);
        });
    }

        // --- NUEVA L�GICA DE GESTOR DE PLANTILLAS (ESTILO DESKTOP) ---

    // Poblar combo de Especialidades
    function poblarComboEspecialidades() {
        const combo = document.getElementById('tplCategoria');
        if (!combo) return;
        combo.innerHTML = '<option value="">Seleccione especialidad...</option>';
        
        // Agrupar �nicas
        const unicas = [...new Set(categoriesDatabase.map(c => c.categoria))].sort();
        unicas.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            combo.appendChild(opt);
        });
    }

    window.limpiarEditorPlantilla = function() {
        document.getElementById('templateForm').reset();
        document.getElementById('tplId').value = '';
    }

    function renderTemplatesTreeView() {
        const treeContainer = document.getElementById('templatesTreeView');
        if (!treeContainer) return;
        treeContainer.innerHTML = '';

        const searchTerm = (document.getElementById('tplSearch').value || '').toLowerCase();

        // Agrupar plantillas por categor�a
        const grouped = {};
        let cats = JSON.parse(localStorage.getItem('categoriasDB')) || [];
    cats.forEach(cat => {
            const catName = cat.categoria;
            if (!grouped[catName]) grouped[catName] = { id: cat.id, name: catName, templates: [] };
            
            const tpls = templatesDatabase.filter(t => t.categoryId === cat.id);
            tpls.forEach(t => {
                if (t.titulo.toLowerCase().includes(searchTerm) || catName.toLowerCase().includes(searchTerm)) {
                    grouped[catName].templates.push(t);
                }
            });
        });

        // Renderizar
        Object.values(grouped).sort((a,b) => a.name.localeCompare(b.name)).forEach(group => {
            if (group.templates.length === 0 && searchTerm) return; // Ocultar si no hay coincidencias en busqueda

            // Header Categoría
            const catRow = document.createElement('div');
            catRow.style.cssText = 'display: flex; padding: 8px 15px; background: #334155; color: white; cursor: pointer; border-bottom: 1px solid #2b3548; font-weight: 600; font-size: 0.9rem; align-items: center;';
            catRow.innerHTML = `
                <div style="flex: 2; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-caret-down"></i> ${group.name}
                </div>
                <div style="flex: 0.5; text-align: center; color: #94a3b8; font-size: 0.8rem;"></div>
                <div style="flex: 2; color: #94a3b8; font-size: 0.8rem;">[${group.templates.length} plantillas]</div>
            `;
            treeContainer.appendChild(catRow);

            // Plantillas
            const tplContainer = document.createElement('div');
            group.templates.forEach(tpl => {
                const row = document.createElement('div');
                row.style.cssText = 'display: flex; padding: 8px 15px; background: #2b3548; color: #cbd5e1; border-bottom: 1px solid #1e293b; font-size: 0.85rem; cursor: pointer; transition: background 0.2s; align-items: center; font-weight: bold;';
                row.onmouseenter = () => row.style.background = '#3b82f6';
                row.onmouseleave = () => row.style.background = '#2b3548';
                
                row.onclick = () => window.cargarEditorPlantilla(tpl.id);

                row.innerHTML = `
                    <div style="flex: 2; padding-left: 20px;"></div>
                    <div style="flex: 0.5; text-align: center;">${tpl.id}</div>
                    <div style="flex: 2; display: flex; justify-content: space-between; align-items: center;">
                        ${tpl.titulo}
                        <button class="action-btn delete-btn" onclick="event.stopPropagation(); window.eliminarPlantilla(${tpl.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                tplContainer.appendChild(row);
            });

            // Toggle logic
            catRow.onclick = () => {
                const icon = catRow.querySelector('i');
                if (tplContainer.style.display === 'none') {
                    tplContainer.style.display = 'block';
                    icon.className = 'fa-solid fa-caret-down';
                } else {
                    tplContainer.style.display = 'none';
                    icon.className = 'fa-solid fa-caret-right';
                }
            };

            treeContainer.appendChild(tplContainer);
        });
    }

    // Buscador
    const searchInput = document.getElementById('tplSearch');
    if (searchInput) {
        searchInput.addEventListener('input', renderTemplatesTreeView);
    }

    window.cargarEditorPlantilla = function(id) {
        const tpl = templatesDatabase.find(t => t.id === id);
        if (!tpl) return;
        
        document.getElementById('tplId').value = tpl.id;
        document.getElementById('tplTitulo').value = tpl.titulo || '';
        
        // Migraci�n de datos viejos: Si tiene 'contenido' pero no macro/micro/diag, lo metemos a micro
        if (tpl.contenido && !tpl.micro) {
            document.getElementById('tplMicro').value = tpl.contenido;
        } else {
            document.getElementById('tplMicro').value = tpl.micro || '';
        }
        
        document.getElementById('tplMacro').value = tpl.macro || '';
        document.getElementById('tplDiag').value = tpl.diag || '';

        // Buscar categoría en la BD
        const catObj = categoriesDatabase.find(c => c.id === tpl.categoryId);
        if (catObj) {
            document.getElementById('tplCategoria').value = catObj.categoria;
        }
    }

    window.guardarPlantilla = async function() {
        const idInput = document.getElementById('tplId').value;
        const titulo = document.getElementById('tplTitulo').value.trim();
        const macro = document.getElementById('tplMacro').value.trim();
        const micro = document.getElementById('tplMicro').value.trim();
        const diag = document.getElementById('tplDiag').value.trim();
        const catNombre = document.getElementById('tplCategoria').value;

        if (!titulo || !catNombre) {
            showToast('Especialidad y Nombre de plantilla son obligatorios.', 'error');
            return;
        }

        // Buscar o crear categoría en macro/micro
        let catObj = categoriesDatabase.find(c => c.categoria === catNombre);
        if (!catObj) {
            showToast('Categoría no encontrada.', 'error');
            return;
        }

        let currentPlantilla = null;

        if (idInput) {
            // Actualizar
            const idx = templatesDatabase.findIndex(t => t.id == idInput);
            if (idx !== -1) {
                templatesDatabase[idx].titulo = titulo;
                templatesDatabase[idx].macro = macro;
                templatesDatabase[idx].micro = micro;
                templatesDatabase[idx].diag = diag;
                templatesDatabase[idx].categoryId = catObj.id;
                currentPlantilla = templatesDatabase[idx];
                showToast('Plantilla actualizada localmente.', 'success');
            }
        } else {
            // Crear
            const newId = templatesDatabase.length > 0 ? Math.max(...templatesDatabase.map(x => x.id)) + 1 : 1;
            currentPlantilla = {
                id: newId,
                categoryId: catObj.id,
                titulo: titulo,
                macro: macro,
                micro: micro,
                diag: diag
            };
            templatesDatabase.push(currentPlantilla);
            showToast('Plantilla creada localmente.', 'success');
        }

        localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
        window.limpiarEditorPlantilla();
        renderTemplatesTreeView();

        // (Desconectado de Supabase - Solo local)
        if (typeof showToast === 'function') showToast('Seleccione una plantilla primero', 'error');
        else alert('Seleccione una plantilla primero');
        return;
    }

    let tpls2 = JSON.parse(localStorage.getItem('plantillasDB')) || [];
    const plantilla = tpls2.find(t => String(t.id) === String(plantillaId));
    if (!plantilla) return;

    const textoAInsertar = plantilla[propertyName] || '';
    if (!textoAInsertar) {
        if (typeof showToast === 'function') showToast('La plantilla no tiene contenido en esta secciÃ³n', 'warning');
        return;
    }

    const textarea = document.getElementById(textareaId);
    if (textarea) {
        // Reemplazar si estÃ¡ vacÃ­o, o concatenar si ya hay texto
        if (textarea.value.trim() === '') {
            textarea.value = textoAInsertar;
        } else {
            textarea.value = textarea.value.trim() + "\n\n" + textoAInsertar;
        }
        if (typeof showToast === 'function') showToast('Plantilla insertada correctamente', 'success');
    }
};
// ============================================================================
// LOGICA DE CREACION RAPIDA DE PLANTILLAS
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    const btnCrearPlantilla = document.getElementById('re_btnCrearPlantilla');
    const fastTemplateModal = document.getElementById('fastTemplateModal');
    const btnCloseFastTemplate = document.getElementById('btnCloseFastTemplate');
    const btnCancelFastTemplate = document.getElementById('btnCancelFastTemplate');
    const btnSaveFastTemplate = document.getElementById('btnSaveFastTemplate');
    const fastTemplateTitle = document.getElementById('fastTemplateTitle');
    const fastTemplateCategory = document.getElementById('fastTemplateCategory');

    if (!btnCrearPlantilla || !fastTemplateModal) return;

    function openFastTemplateModal() {
        // Poblar categorias
        fastTemplateCategory.innerHTML = '<option value="">Seleccione una especialidad</option>';
        const cats = JSON.parse(localStorage.getItem('categoriasDB')) || [];
        cats.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.categoria;
            fastTemplateCategory.appendChild(option);
        });

        fastTemplateTitle.value = '';
        fastTemplateModal.classList.add('active');
    }

    function closeFastTemplateModal() {
        fastTemplateModal.classList.remove('active');
    }

    btnCrearPlantilla.addEventListener('click', openFastTemplateModal);
    btnCloseFastTemplate.addEventListener('click', closeFastTemplateModal);
    btnCancelFastTemplate.addEventListener('click', closeFastTemplateModal);

    btnSaveFastTemplate.addEventListener('click', async () => {
        const titulo = fastTemplateTitle.value.trim().toUpperCase();
        const categoryId = fastTemplateCategory.value;

        if (!titulo || !categoryId) {
            if (typeof showToast === 'function') showToast('Por favor, ingrese un nombre y seleccione una especialidad.', 'warning');
            else alert('Faltan datos');
            return;
        }

        const macro = document.getElementById('re_descMacro').value || '';
        const micro = document.getElementById('re_descMicro').value || '';
        const diag = document.getElementById('re_diagnostico').value || '';

        if (!macro && !micro && !diag) {
            if (typeof showToast === 'function') showToast('Los campos de la plantilla estn vacos.', 'warning');
            return;
        }

        let templatesDB = JSON.parse(localStorage.getItem('plantillasDB')) || [];
        const maxId = templatesDB.length > 0 ? Math.max(...templatesDB.map(t => parseInt(t.id) || 0)) : 0;
        const newTemplate = {
            id: maxId + 1,
            categoryId: parseInt(categoryId),
            titulo: titulo,
            macro: macro,
            micro: micro,
            diag: diag
        };

        templatesDB.push(newTemplate);
        localStorage.setItem('plantillasDB', JSON.stringify(templatesDB));

        // (Desconectado de Supabase - Solo local)
        if (typeof showToast === 'function') showToast('Plantilla guardada y sincronizada.', 'success');
        
        // Actualizar UI
        if (typeof poblarSelectoresEspecialidadReportes === 'function') poblarSelectoresEspecialidadReportes();
        if (typeof renderTemplatesTreeView === 'function') renderTemplatesTreeView();

        closeFastTemplateModal();
    });
});
