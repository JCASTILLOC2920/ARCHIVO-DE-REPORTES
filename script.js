/**
 * Patient Registration Form - Client-side Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
    function getFormElement(id) {
        if (document.getElementById('m_codAtencion')) {
            return document.getElementById('m_' + id) || document.getElementById(id);
        }
        return document.getElementById(id) || document.getElementById('m_' + id);
    }

    // Form and input elements
    const patientForm = document.getElementById('patientForm');
    const tipoServicioSelect = getFormElement('tipoServicio');
    const codAtencionInput = getFormElement('codAtencion');
    const dniInput = getFormElement('dni');
    const nombresInput = getFormElement('nombres');
    const apellidosInput = getFormElement('apellidos');
    const medSolicitanteSelect = getFormElement('medSolicitante');
    const fileUploadInput = getFormElement('ordenServicio');
    const fileUploadStatus = getFormElement('fileUploadStatus');
    const modalContainer = document.getElementById('patientRegistrationModal');
    const modalOverlay = document.getElementById('patientRegistrationModal') ? document.getElementById('patientRegistrationModal').parentElement : null;
    const fecRegistroInput = getFormElement('fecRegistro');
    const fecEntregaInput = getFormElement('fecEntrega');

    // Buttons
    const btnValidar = getFormElement('btnValidar');
    const btnBuscar = getFormElement('btnBuscar');
    const btnCopiar = getFormElement('btnCopiar');
    const btnRegistro = getFormElement('btnRegistro');
    const btnSalir = getFormElement('btnSalir');
    const closeHeaderBtn = getFormElement('closeHeaderBtn');

    // Sample database for DNI simulation
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

    // Inicializar fechas de registro y entrega
    if (fecRegistroInput) {
        fecRegistroInput.value = formatDisplayDate(new Date());
    }
    if (fecEntregaInput) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        fecEntregaInput.value = formatDisplayDate(deliveryDate);
    }

    /* ==========================================================================
       TOAST SYSTEM (NOTIFICACIONES FLOTANTES)
       ========================================================================== */
    const toastContainer = document.getElementById('toastContainer');
    
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconHtml = '<i class="fa-solid fa-circle-check"></i>';
        if (type === 'error') {
            iconHtml = '<i class="fa-solid fa-circle-exclamation"></i>';
        } else if (type === 'info') {
            iconHtml = '<i class="fa-solid fa-circle-info"></i>';
        }

        toast.innerHTML = `${iconHtml} <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3500);
    }
    window.showToast = showToast;

    // Autocompletar Código de Atención al seleccionar el Tipo de Servicio
    if (tipoServicioSelect) {
        tipoServicioSelect.addEventListener('change', () => {
            const currentYearLastTwo = String(new Date().getFullYear()).slice(-2);
            let prefix = '';
            if (tipoServicioSelect.value === 'EXAMEN DE MUESTRA POR HE') {
                prefix = `${currentYearLastTwo}Q-`;
            } else if (tipoServicioSelect.value === 'PAPANICOLAOU') {
                prefix = `${currentYearLastTwo}C-`;
            }

            if (prefix) {
                codAtencionInput.value = prefix;
                codAtencionInput.focus();
            } else {
                codAtencionInput.value = '';
            }
        });
    }

    /* ==========================================================================
       VALIDAR COD. ATENCION
       ========================================================================== */
    btnValidar.addEventListener('click', () => {
        const value = codAtencionInput.value.trim().toUpperCase();
        if (!value) {
            showToast('Por favor, ingrese un Código de Atención para validar.', 'error');
            codAtencionInput.focus();
            return;
        }

        // Check if code is repeated
        let repeated = false;
        const checkDuplicate = (dataArr) => {
            if (!Array.isArray(dataArr)) return false;
            return dataArr.some(item => {
                const cod = (item.cod_atencion || item.codAtencion || '').trim().toUpperCase();
                return cod === value;
            });
        };

        if (window.patientDatabase && checkDuplicate(window.patientDatabase)) repeated = true;
        else if (window.datosMigrados && checkDuplicate(window.datosMigrados)) repeated = true;
        else {
            const localBackup = localStorage.getItem('patientDatabaseLocal');
            if (localBackup) {
                try {
                    const parsed = JSON.parse(localBackup);
                    if (checkDuplicate(parsed)) repeated = true;
                } catch (e) {
                    console.error(e);
                }
            }
        }

        if (repeated) {
            alert(`El código de atención "${value}" ya está registrado. Por favor, cámbielo por otro.`);
            showToast(`Código duplicado: "${value}". Cambiar por otro.`, 'error');
            codAtencionInput.focus();
            return;
        }

        // Simple validation rule: check if it matches a clinical code pattern
        btnValidar.disabled = true;
        btnValidar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validando';

        setTimeout(() => {
            btnValidar.disabled = false;
            btnValidar.innerText = 'Validar';
            
            const pattern = /^[0-9]+[QIC]-[0-9]+$/i;
            const patternOld = /^[QIC]-[0-9]+$/i;
            if (pattern.test(value) || patternOld.test(value)) {
                showToast(`Código de Atención "${value}" validado con éxito y disponible.`, 'success');
            } else {
                showToast(`Código "${value}" validado y disponible (Formato sugerido: AÑOServicio-Número, ej: 26Q-214).`, 'info');
            }
        }, 800);
    });

    /* ==========================================================================
       BUSCAR DNI (SIMULACION DE CONSULTA API RENIEC)
       ========================================================================== */
    btnBuscar.addEventListener('click', performDniSearch);
    dniInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performDniSearch();
        }
    });

    function performDniSearch() {
        const dni = dniInput.value.trim();
        if (!dni || dni.length !== 8 || isNaN(dni)) {
            showToast('Por favor, ingrese un DNI válido de 8 dígitos.', 'error');
            dniInput.focus();
            return;
        }

        btnBuscar.disabled = true;
        btnBuscar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        setTimeout(() => {
            btnBuscar.disabled = false;
            btnBuscar.innerText = 'Buscar';

            if (dniDatabase[dni]) {
                const data = dniDatabase[dni];
                nombresInput.value = data.nombres.toUpperCase();
                apellidosInput.value = data.apellidos.toUpperCase();
                const edadEl = getFormElement('edad');
                if (edadEl) edadEl.value = data.edad;
                const sexoEl = getFormElement('sexo');
                if (sexoEl) sexoEl.value = data.sexo;
                const telefonoEl = getFormElement('telefono');
                if (telefonoEl) telefonoEl.value = data.tel;
                
                showToast('DNI encontrado en la base de datos de RENIEC. Datos cargados.', 'success');
            } else {
                showToast('DNI no encontrado. Por favor, registre los datos manualmente.', 'info');
                nombresInput.focus();
            }
        }, 1000);
    }

    /* ==========================================================================
       MEDICO SOLICITANTE: COPIAR Y REGISTRAR
       ========================================================================== */
    // Registrar Médico Solicitante
    btnCopiar.addEventListener('click', () => {
        const docName = medSolicitanteSelect.value.trim().toUpperCase();
        if (!docName) {
            showToast('Por favor, ingrese el nombre del médico para registrar.', 'error');
            medSolicitanteSelect.focus();
            return;
        }

        let normalizedDoc = docName;
        if (!normalizedDoc.startsWith('DR. ') && !normalizedDoc.startsWith('DRA. ') && !normalizedDoc.startsWith('DR ') && !normalizedDoc.startsWith('DRA ')) {
            const firstWord = normalizedDoc.split(' ').filter(w => w !== 'DR' && w !== 'DRA' && w !== 'DR.' && w !== 'DRA.')[0] || '';
            const namesFeminine = ['MARIA', 'ANA', 'CLAUDIA', 'SANDRA', 'ELIZABETH', 'ROSA', 'VIVIANA', 'MIRTHA', 'MERY', 'MARY', 'ELEANA', 'CYNTHIA', 'NATALY', 'CARMEN', 'LUZ', 'PATRICIA', 'JUANA', 'SILVIA', 'BEATRIZ', 'MONICA', 'LAURA', 'GABRIELA'];
            const isFem = namesFeminine.some(n => firstWord.toUpperCase().includes(n));
            normalizedDoc = (isFem ? 'DRA. ' : 'DR. ') + normalizedDoc;
        }

        const doctorsDB = window.doctorsDatabase || [];
        const exists = doctorsDB.some(d => d.doctor.trim().toUpperCase() === normalizedDoc.trim().toUpperCase());
        if (exists) {
            showToast(`El médico "${normalizedDoc}" ya se encuentra registrado.`, 'info');
            medSolicitanteSelect.value = normalizedDoc;
            return;
        }

        const docData = {
            doctor: normalizedDoc,
            colegiado: '',
            especializacion: '',
            tipo: 'DR. CLIENTE',
            provincia: '',
            telefono: '',
            correo: '',
            firma: ''
        };

        doctorsDB.unshift(docData);

        if (window.supabase && typeof window.SUPABASE_CONFIG !== 'undefined') {
            const supabase = window.supabase;
            const usingSupabase = !!(supabase && window.SUPABASE_CONFIG);
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
                        if (error) console.error("Error al registrar doctor en Supabase:", error);
                    });
            }
        }

        if (typeof window.populateModalDoctorsSelect === 'function') {
            window.populateModalDoctorsSelect();
        }

        medSolicitanteSelect.value = normalizedDoc;
        showToast(`Médico "${normalizedDoc}" registrado e ingresado con éxito.`, 'success');
    });

    // Guardar
    btnRegistro.addEventListener('click', () => {
        btnCopiar.click();
    });

    /* ==========================================================================
       MANEJO DE ARCHIVOS (ORDEN SERVICIO)
       ========================================================================== */
    fileUploadInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length === 0) {
            fileUploadStatus.innerText = 'Sin archivos seleccionados';
        } else if (files.length === 1) {
            fileUploadStatus.innerText = files[0].name;
        } else {
            fileUploadStatus.innerText = `${files.length} archivos seleccionados`;
        }
    });

    /* ==========================================================================
       INTERACCIONES DE SALIDA Y CIERRE (ANIMACION Y REAPERTURA)
       ========================================================================== */
    function closeModal() {
        modalContainer.style.transform = 'translateY(20px) scale(0.95)';
        modalContainer.style.opacity = '0';
        modalOverlay.style.opacity = '0';
        modalOverlay.style.transition = 'opacity 0.3s ease';
        modalContainer.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

        setTimeout(() => {
            window.location.href = 'reportes.html';
        }, 300);
    }

    function showReopenWidget() {
        // Create an elegant widget to reopen modal
        let widget = document.getElementById('reopenWidget');
        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'reopenWidget';
            widget.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 500;
                animation: modalAppear 0.3s ease;
            `;
            widget.innerHTML = `
                <h3 style="margin-bottom: 15px; color: var(--primary-color);">Formulario Cerrado</h3>
                <p style="margin-bottom: 20px; font-size: 0.9rem; color: #6b7280;">Puedes volver a abrir la ficha de registro del paciente presionando el botón de abajo.</p>
                <button type="button" class="btn btn-primary" id="btnReabrir">Abrir Ficha de Registro</button>
            `;
            document.body.appendChild(widget);

            document.getElementById('btnReabrir').addEventListener('click', () => {
                widget.remove();
                modalOverlay.style.display = 'flex';
                // Trigger reflow
                modalOverlay.offsetHeight;
                modalOverlay.style.opacity = '1';
                modalContainer.style.transform = 'translateY(0) scale(1)';
                modalContainer.style.opacity = '1';
            });
        }
    }

    btnSalir.addEventListener('click', closeModal);
    closeHeaderBtn.addEventListener('click', closeModal);

    /* ==========================================================================
       GUARDAR FORMULARIO
       ========================================================================== */
    patientForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Extra logic verification
        const nombres = nombresInput.value.trim();
        const apellidos = apellidosInput.value.trim();
        const value = (codAtencionInput.value || '').trim().toUpperCase();

        if (!nombres || !apellidos) {
            showToast('Por favor complete los campos obligatorios de Nombres y Apellidos.', 'error');
            return;
        }

        if (!value) {
            showToast('Por favor complete el Código de Atención.', 'error');
            codAtencionInput.focus();
            return;
        }

        // Check if code is repeated
        let repeated = false;
        const checkDuplicate = (dataArr) => {
            if (!Array.isArray(dataArr)) return false;
            return dataArr.some(item => {
                const cod = (item.cod_atencion || item.codAtencion || '').trim().toUpperCase();
                return cod === value;
            });
        };

        if (window.patientDatabase && checkDuplicate(window.patientDatabase)) repeated = true;
        else if (window.datosMigrados && checkDuplicate(window.datosMigrados)) repeated = true;
        else {
            const localBackup = localStorage.getItem('patientDatabaseLocal');
            if (localBackup) {
                try {
                    const parsed = JSON.parse(localBackup);
                    if (checkDuplicate(parsed)) repeated = true;
                } catch (err) {
                    console.error(err);
                }
            }
        }

        if (repeated) {
            alert(`El código de atención "${value}" ya está registrado. Por favor, cambie el código por otro ya que no se permiten códigos duplicados.`);
            showToast(`Código de Atención repetido: "${value}". Debe cambiarlo.`, 'error');
            codAtencionInput.focus();
            return;
        }

        // Show loading spinner in Save button
        const btnGuardar = getFormElement('btnGuardar');
        const originalText = btnGuardar ? btnGuardar.innerText : 'Guardar';
        if (btnGuardar) {
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
        }

        setTimeout(() => {
            try {
                // Helper to get form input values
                const getValueOf = (id) => {
                    const el = getFormElement(id);
                    return el ? el.value.trim() : '';
                };

                const getCheckedOf = (id) => {
                    const el = getFormElement(id);
                    return el ? el.checked : false;
                };

                const serviceVal = getValueOf('tipoServicio');
                let service = 'Q';
                let especimen = 'BIOPSIA';
                if (serviceVal === 'INMUNOHISTOQUIMICA') {
                    service = 'I';
                    especimen = 'BLOQUE PARAFINA';
                } else if (serviceVal === 'PAPANICOLAOU') {
                    service = 'C';
                    especimen = 'FROTIS PAP';
                } else if (serviceVal === 'CITOLOGÍA ESPECIAL') {
                    service = 'C';
                    especimen = 'MUESTRA CITOLÓGICA';
                } else if (serviceVal === 'REVISIÓN DE LAMINA') {
                    service = 'Q';
                    especimen = 'REVISIÓN DE LÁMINA';
                } else {
                    service = 'Q';
                    especimen = 'BIOPSIA';
                }

                const customEspecimen = getValueOf('telContacto'); // Labeled Órgano / Muestra
                if (customEspecimen) {
                    especimen = customEspecimen.toUpperCase();
                }

                const parseDisplayDate = (displayStr) => {
                    if (!displayStr) return '';
                    const parts = displayStr.split('/');
                    if (parts.length === 3) {
                        return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                    return displayStr;
                };

                const costo = parseFloat(getValueOf('costoTransp')) || 0;
                const adelanto = parseFloat(getValueOf('adelanto')) || 0;
                const resta = costo - adelanto;
                const pagado = !getCheckedOf('pagoPendiente');

                const nextId = window.patientDatabase && window.patientDatabase.length > 0
                    ? Math.max(...window.patientDatabase.map(x => x.id)) + 1
                    : 1;

                const newRecord = {
                    id: nextId,
                    service: service,
                    codAtencion: value,
                    dni: getValueOf('dni') || '0',
                    medSolicitante: getValueOf('medSolicitante').toUpperCase(),
                    nombres: nombres.toUpperCase(),
                    apellidos: apellidos.toUpperCase(),
                    paciente: `${nombres.toUpperCase()} ${apellidos.toUpperCase()}`,
                    especimen: especimen,
                    costo: costo,
                    adelanto: adelanto,
                    resta: resta,
                    fecRegistro: parseDisplayDate(getValueOf('fecRegistro')),
                    fecEntrega: parseDisplayDate(getValueOf('fecEntrega')),
                    pagado: pagado,
                    atrasado: false,

                    // Additional fields
                    edad: parseInt(getValueOf('edad')) || 0,
                    sexo: getValueOf('sexo').toUpperCase() || 'MASCULINO',
                    telefono: getValueOf('telefono'),
                    telContacto: customEspecimen.toUpperCase(),
                    motivoEstudio: getValueOf('motivoEstudio').toUpperCase(),
                    clinica: getValueOf('clinica').toUpperCase()
                };

                if (newRecord.medSolicitante === 'SELECCIONAR') newRecord.medSolicitante = '';
                if (newRecord.sexo === 'M' || newRecord.sexo === 'MASCULINO') newRecord.sexo = 'MASCULINO';
                else if (newRecord.sexo === 'F' || newRecord.sexo === 'FEMENINO') newRecord.sexo = 'FEMENINO';
                else newRecord.sexo = 'MASCULINO';

                // Add to global patient database array
                if (window.patientDatabase) {
                    window.patientDatabase.unshift(newRecord);
                }

                // Supabase insert if active
                if (window.supabase && typeof window.SUPABASE_CONFIG !== 'undefined') {
                    const dbRecord = {
                        service: newRecord.service || 'Q',
                        cod_atencion: newRecord.codAtencion,
                        dni: newRecord.dni || '',
                        nombres: newRecord.nombres || '',
                        apellidos: newRecord.apellidos || '',
                        paciente: newRecord.paciente || '',
                        sexo: newRecord.sexo || 'O',
                        edad: parseInt(newRecord.edad) || 0,
                        f_contacto: newRecord.fContacto || '',
                        tel_contacto: newRecord.telContacto || '',
                        med_solicitante: newRecord.medSolicitante || '',
                        motivo_estudio: newRecord.motivoEstudio || '',
                        especimen: newRecord.especimen || '',
                        doctor: newRecord.doctor || "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA",
                        casetes: parseInt(newRecord.casetes) || 1,
                        diagnostico: newRecord.diagnostico || "",
                        cat_macro: newRecord.catMacro || "",
                        plan_macro: newRecord.planMacro || "",
                        macro_desc: newRecord.macroDesc || "",
                        cat_micro: newRecord.catMicro || "",
                        plan_micro: newRecord.planMicro || "",
                        micro_desc: newRecord.microDesc || "",
                        fec_registro: newRecord.fecRegistro || '',
                        fec_entrega: newRecord.fecEntrega || '',
                        img01: null,
                        img02: null,
                        costo: parseFloat(newRecord.costo) || 0,
                        adelanto: parseFloat(newRecord.adelanto) || 0,
                        resta: parseFloat(newRecord.resta) || 0,
                        pagado: !!newRecord.pagado,
                        atrasado: !!newRecord.atrasado
                    };

                    window.supabase
                        .from('pacientes')
                        .insert([dbRecord])
                        .then(({ error }) => {
                            if (error) console.error("Error al insertar paciente en Supabase:", error);
                        });
                }

                // Trigger Local Storage backup
                if (typeof window.triggerAutomaticBackup === 'function') {
                    window.triggerAutomaticBackup();
                }

                // Refresh UI Table if applicable
                if (typeof window.refreshPatientTable === 'function') {
                    window.refreshPatientTable();
                }

                if (btnGuardar) {
                    btnGuardar.disabled = false;
                    btnGuardar.innerText = originalText;
                }

                showToast(`¡Paciente ${nombres} ${apellidos} registrado exitosamente!`, 'success');

                const isReportsPage = window.location.pathname.includes('reportes.html');

                if (isReportsPage) {
                    setTimeout(() => {
                        closeModal();
                        patientForm.reset();
                        if (fileUploadStatus) fileUploadStatus.innerText = 'Sin archivos seleccionados';
                        const costoTranspEl = getFormElement('costoTransp');
                        if (costoTranspEl) costoTranspEl.value = '0';
                        const adelantoEl = getFormElement('adelanto');
                        if (adelantoEl) adelantoEl.value = '0';
                        
                        // Reset registration/delivery dates to current / +5 days
                        if (fecRegistroInput) {
                            fecRegistroInput.value = formatDate(new Date());
                        }
                        if (fecEntregaInput) {
                            const deliveryDate = new Date();
                            deliveryDate.setDate(deliveryDate.getDate() + 5);
                            fecEntregaInput.value = formatDate(deliveryDate);
                        }
                    }, 500);
                } else {
                    // En la página de registro, limpiamos el formulario inmediatamente sin redirigir
                    patientForm.reset();
                    if (fileUploadStatus) fileUploadStatus.innerText = 'Sin archivos seleccionados';
                    const costoTranspEl = getFormElement('costoTransp');
                    if (costoTranspEl) costoTranspEl.value = '0';
                    const adelantoEl = getFormElement('adelanto');
                    if (adelantoEl) adelantoEl.value = '0';
                    
                    // Restablecer fechas de registro y entrega a hoy / +5 días
                    if (fecRegistroInput) {
                        fecRegistroInput.value = formatDate(new Date());
                    }
                    if (fecEntregaInput) {
                        const deliveryDate = new Date();
                        deliveryDate.setDate(deliveryDate.getDate() + 5);
                        fecEntregaInput.value = formatDate(deliveryDate);
                    }
                    
                    // Colocar el foco en el primer input (tipoServicio) para ingresar al siguiente paciente
                    if (tipoServicioSelect) {
                        tipoServicioSelect.focus();
                    }
                }

            } catch (err) {
                console.error(err);
                showToast('Ocurrió un error al guardar los datos del paciente.', 'error');
                if (btnGuardar) {
                    btnGuardar.disabled = false;
                    btnGuardar.innerText = originalText;
                }
            }
        }, 1000);
    });

    // Automatically convert all text inputs and textareas to uppercase on the fly
    document.querySelectorAll('input[type="text"], textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(start, end);
        });
    });

    // Cargar y poblar dinámicamente el listado de médicos solicitantes
    async function loadDoctorsSelect() {
        try {
            const response = await fetch('doctores.json');
            if (!response.ok) throw new Error('Error loading doctores.json');
            const doctors = await response.json();
            
            const select = getFormElement('medSolicitante');
            if (!select) return;

            select.innerHTML = '<option value="" selected>SELECCIONAR</option>';
            
            // Filtrar nombres únicos y ordenados de doctores válidos
            const uniqueDoctors = [...new Set(doctors
                .map(d => d.doctor.trim().toUpperCase())
                .filter(name => name && name !== 'SIN DATOS' && !name.includes('---'))
            )].sort();

            uniqueDoctors.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc;
                option.text = doc;
                select.appendChild(option);
            });
        } catch (err) {
            console.error('Error al cargar la lista de doctores:', err);
        }
    }
    
    loadDoctorsSelect();

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
            const targetName = btn.querySelector('.nav-item-text') ? btn.querySelector('.nav-item-text').innerText : target;
            showToast(`Módulo "${targetName.toUpperCase()}" en desarrollo.`, 'info');
        });
    });

    // --- LÓGICA DE DICTADO POR VOZ (GOOGLE WEB SPEECH) ---
    let dictationRecognition = null;
    let isDictating = false;
    let lastFocusedInput = null;

    // Registrar focus en los inputs para saber dónde insertar el dictado
    document.querySelectorAll('#patientForm input, #patientForm textarea, #patientForm select').forEach(el => {
        el.addEventListener('focus', () => {
            lastFocusedInput = el;
        });
    });

    const btnDictado = getFormElement('btnDictado');
    if (btnDictado) {
        btnDictado.addEventListener('click', () => {
            toggleDictation(btnDictado);
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
            { regex: /^(tipo de servicio|tipo servicio|servicio)\s+(.+)$/i, fieldId: 'tipoServicio' },
            { regex: /^(código de atención|codigo de atencion|código|codigo|atención|atencion)\s+(.+)$/i, fieldId: 'codAtencion' },
            { regex: /^(nombres?|nombre)\s+(.+)$/i, fieldId: 'nombres' },
            { regex: /^(apellidos?|apellido)\s+(.+)$/i, fieldId: 'apellidos' },
            { regex: /^(dni|documento|cédula|cedula)\s+(.+)$/i, fieldId: 'dni' },
            { regex: /^(edad)\s+(.+)$/i, fieldId: 'edad' },
            { regex: /^(teléfono|telefono|celular)\s+(.+)$/i, fieldId: 'telefono' },
            { regex: /^(sexo|género|genero)\s+(.+)$/i, fieldId: 'sexo' },
            { regex: /^(motivo|estudio|diagnóstico|diagnostico)\s+(.+)$/i, fieldId: 'motivoEstudio' },
            { regex: /^(clínica|clinica)\s+(.+)$/i, fieldId: 'clinica' },
            { regex: /^(costo|transporte|costo transporte)\s+(.+)$/i, fieldId: 'costoTransp' },
            { regex: /^(adelanto)\s+(.+)$/i, fieldId: 'adelanto' }
        ];

        let matched = false;
        for (const rule of rules) {
            const match = text.match(rule.regex);
            if (match) {
                let value = match[2].trim();
                const input = getFormElement(rule.fieldId);

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
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && activeEl.closest('#patientForm')) {
                insertTextAtCursor(activeEl, text);
            } else if (lastFocusedInput) {
                insertTextAtCursor(lastFocusedInput, text);
            } else {
                const defaultInput = getFormElement('nombres');
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

    // Forzar mayúsculas en el modelo de datos para todos los inputs de texto y textareas
    document.addEventListener('input', (e) => {
        const target = e.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            const type = target.getAttribute('type');
            // Ignorar inputs de tipo file, checkbox, radio, date, etc.
            if (target.tagName === 'TEXTAREA' || !type || ['text', 'search', 'email', 'url', 'tel', 'password'].includes(type.toLowerCase())) {
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const originalValue = target.value;
                const upperValue = originalValue.toUpperCase();
                if (originalValue !== upperValue) {
                    target.value = upperValue;
                    if (start !== null) {
                        target.setSelectionRange(start, end);
                    }
                }
            }
        }
    });
});
