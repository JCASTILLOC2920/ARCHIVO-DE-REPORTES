/**
 * Patient Registration Form - Client-side Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // Form and input elements
    const patientForm = document.getElementById('patientForm');
    const tipoServicioSelect = document.getElementById('tipoServicio') || document.getElementById('m_tipoServicio');
    const codAtencionInput = document.getElementById('codAtencion') || document.getElementById('m_codAtencion');
    const dniInput = document.getElementById('dni') || document.getElementById('m_dni');
    const nombresInput = document.getElementById('nombres') || document.getElementById('m_nombres');
    const apellidosInput = document.getElementById('apellidos') || document.getElementById('m_apellidos');
    const medSolicitanteSelect = document.getElementById('m_medSolicitante') || document.getElementById('medSolicitante');
    const fileUploadInput = document.getElementById('ordenServicio') || document.getElementById('m_ordenServicio');
    const fileUploadStatus = document.getElementById('fileUploadStatus') || document.getElementById('m_fileUploadStatus');
    const modalContainer = document.getElementById('patientRegistrationModal');
    const modalOverlay = document.getElementById('patientRegistrationModal') ? document.getElementById('patientRegistrationModal').parentElement : null;
    const fecRegistroInput = document.getElementById('fecRegistro') || document.getElementById('m_fecRegistro');
    const fecEntregaInput = document.getElementById('fecEntrega') || document.getElementById('m_fecEntrega');

    // Buttons
    const btnValidar = document.getElementById('btnValidar') || document.getElementById('m_btnValidar');
    const btnBuscar = document.getElementById('btnBuscar') || document.getElementById('m_btnBuscar');
    const btnCopiar = document.getElementById('btnCopiar') || document.getElementById('m_btnCopiar');
    const btnRegistro = document.getElementById('btnRegistro') || document.getElementById('m_btnRegistro');
    const btnSalir = document.getElementById('btnSalir') || document.getElementById('m_btnSalir');
    const closeHeaderBtn = document.getElementById('closeHeaderBtn');

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

        // Auto remove toast after 3.5 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3500);
    }

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
                document.getElementById('edad').value = data.edad;
                document.getElementById('sexo').value = data.sexo;
                document.getElementById('telefono').value = data.tel;
                
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
                } catch (e) {
                    console.error(e);
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
        const btnGuardar = document.getElementById('btnGuardar');
        const originalText = btnGuardar.innerText;
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

        setTimeout(() => {
            btnGuardar.disabled = false;
            btnGuardar.innerText = originalText;

            showToast(`¡Paciente ${nombres} ${apellidos} registrado exitosamente!`, 'success');
            
            // Option to reset form after success
            setTimeout(() => {
                if (confirm('¿Desea registrar otro paciente?')) {
                    patientForm.reset();
                    fileUploadStatus.innerText = 'Sin archivos seleccionados';
                    document.getElementById('costoTransp').value = '0';
                    document.getElementById('adelanto').value = '0';
                    if (fecRegistroInput) {
                        fecRegistroInput.value = formatDisplayDate(new Date());
                    }
                    if (fecEntregaInput) {
                        const deliveryDate = new Date();
                        deliveryDate.setDate(deliveryDate.getDate() + 5);
                        fecEntregaInput.value = formatDisplayDate(deliveryDate);
                    }
                } else {
                    window.location.href = 'reportes.html';
                }
            }, 500);
        }, 1500);
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
            
            const select = document.getElementById('medSolicitante');
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

    const btnDictado = document.getElementById('btnDictado');
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
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && activeEl.closest('#patientForm')) {
                insertTextAtCursor(activeEl, text);
            } else if (lastFocusedInput) {
                insertTextAtCursor(lastFocusedInput, text);
            } else {
                const defaultInput = document.getElementById('nombres');
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
