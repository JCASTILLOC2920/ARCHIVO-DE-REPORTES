// script.js - Lógica UI Global, Menú Lateral e Interacción de Pantalla
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando UI global script.js...");

    // 1. Alternar Menú Lateral (Sidebar Collapse / Toggle)
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const appSidebar = document.getElementById('appSidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');

    if (sidebarToggleBtn && appSidebar) {
        sidebarToggleBtn.addEventListener('click', function() {
            appSidebar.classList.toggle('collapsed');
            if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active');
        });
    }

    if (sidebarBackdrop && appSidebar) {
        sidebarBackdrop.addEventListener('click', function() {
            appSidebar.classList.remove('collapsed');
            sidebarBackdrop.classList.remove('active');
        });
    }

    // 2. Navegación del Menú Lateral (Cambio de Vistas / Pestañas)
    const navItemBtns = document.querySelectorAll('.nav-item-btn[data-target]');
    const dashboardViews = document.querySelectorAll('.dashboard-view');

    navItemBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');

            // Remover estado activo de todos los botones
            document.querySelectorAll('.nav-item-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Ocultar todas las vistas
            dashboardViews.forEach(v => v.style.display = 'none');

            // Mostrar vista objetivo
            const targetView = document.getElementById('view-' + target + 's') || document.getElementById('view-' + target);
            if (targetView) {
                targetView.style.display = 'block';
            } else if (target === 'paciente' || target === 'listado') {
                const patientView = document.getElementById('view-patients') || document.getElementById('view-pacientes');
                if (patientView) patientView.style.display = 'block';
            }
        });
    });

    // Enlace de Registro de Pacientes en Sidebar
    const btnRegPacientes = document.getElementById('sidebarBtnRegistroPacientes');
    if (btnRegPacientes) {
        btnRegPacientes.addEventListener('click', function(e) {
            // Si existe modal de nuevo paciente, abrirlo
            const modal = document.getElementById('patientModal') || document.getElementById('modalRegistro');
            if (modal) {
                modal.style.display = 'flex';
                e.preventDefault();
            }
        });
    }

if (closeHeaderBtn) {\r
        closeHeaderBtn.addEventListener('click', closeModal);\r
    }\r
\r
    /* ==========================================================================\r
       GUARDAR FORMULARIO\r
       ========================================================================== */\r
    if (patientForm) {\r
        patientForm.addEventListener('submit', (e) => {\r
            e.preventDefault();\r
\r
        // Extra logic verification\r
        const nombres = nombresInput.value.trim();\r
        const apellidos = apellidosInput.value.trim();\r
        const value = (codAtencionInput.value || '').trim().toUpperCase();\r
\r
        if (!nombres || !apellidos) {\r
            showToast('Por favor complete los campos obligatorios de Nombres y Apellidos.', 'error');\r
            return;\r
        }\r
\r
        if (!value) {\r
            showToast('Por favor complete el Código de Atención.', 'error');\r
            codAtencionInput.focus();\r
            return;\r
        }\r
\r
        // Verificar si el código ya existe en el sistema\r
        let existingPatient = null;\r
        const findDuplicate = (dataArr) => {\r
            if (!Array.isArray(dataArr)) return null;\r
            return dataArr.find(item => {\r
                const cod = (item.cod_atencion || item.codAtencion || '').trim().toUpperCase();\r
                return cod === value;\r
            });\r
        };\r
\r
        if (window.patientDatabase) existingPatient = findDuplicate(window.patientDatabase);\r
        if (!existingPatient) {\r
            const localBackup = localStorage.getItem('patientDatabaseLocal');\r
            if (localBackup) {\r
                try {\r
                    const parsed = JSON.parse(localBackup);\r
                    existingPatient = findDuplicate(parsed);\r
                } catch (e) {\r
                    console.error(e);\r
                }\r
            }\r
        }\r
\r
        const btnGuardar = getFormElement('btnGuardar');\r
        const originalText = btnGuardar ? btnGuardar.innerText : 'Guardar';\r
\r
        if (existingPatient && existingPatient.paciente && existingPatient.paciente.trim() !== '' && existingPatient.paciente.toUpperCase() !== `${nombres.toUpperCase()} ${apellidos.toUpperCase()}`) {\r
            const existingServName = (existingPatient.service === 'C' || value.includes('C-')) ? 'Servicio de Citología (C)' : 'Servicio de Biopsias HE (Q)';\r
            const confirmOverwrite = confirm(`⚠️ El código de atención "${value}" ya figura registrado a nombre de: "${existingPatient.paciente}" en el "${existingServName}".\
            if (!confirmOverwrite) {\r
                if (btnGuardar) {\r
                    btnGuardar.disabled = false;\r
                    btnGuardar.innerText = originalText;\r
                }\r
                codAtencionInput.focus();\r
                return;\r
            }\r
        }\r
\r
        // Show loading spinner in Save button\r
        if (btnGuardar) {\r
            btnGuardar.disabled = true;\r
            btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';\r
        }\r
\r
        setTimeout(() => {\r
            try {\r
                // Helper to get form input values\r
                const getValueOf = (id) => {\r
                    const el = getFormElement(id);\r
                    return el ? el.value.trim() : '';\r
                };\r
\r
                const getCheckedOf = (id) => {\r
                    const el = getFormElement(id);\r
                    return el ? el.checked : false;\r
                };\r
\r
                const serviceVal = getValueOf('tipoServicio').toUpperCase();\r
                const codeUpper = String(value || '').toUpperCase();\r
                let service = 'Q';\r
\r
                if (serviceVal.includes('INMUNO') || codeUpper.includes('-I-') || codeUpper.endsWith('I')) {\r
                    service = 'I';\r
                } else if (serviceVal.includes('PAPANICOLAOU') || serviceVal.includes('CITOLOG') || codeUpper.includes('C-') || codeUpper.endsWith('C')) {\r
                    service = 'C';\r
                } else {\r
                    service = 'Q';\r
                }\r
\r
                const customEspecimen = getValueOf('telContacto'); // Labeled Órgano / Muestra\r
                let especimen = customEspecimen ? customEspecimen.trim().toUpperCase() : '';\r
                if (service === 'C' && (especimen === 'PAP' || especimen === 'PAP.' || !especimen)) {\r
                    especimen = 'PAPANICOLAOU';\r
                }\r
                const motivoEstudioVal = getValueOf('motivoEstudio');\r
\r
                const parseDisplayDate = (displayStr) => {\r
                    if (!displayStr) return '';\r
                    const parts = displayStr.split('/');\r
                    if (parts.length === 3) {\r
                        return `${parts[2]}-${parts[1]}-${parts[0]}`;\r
                    }\r
                    return displayStr;\r
                };\r
\r
                const costoMuestra = parseFloat(getValueOf('costo')) || 0;\r
                const costoTransp = parseFloat(getValueOf('costoTransp')) || 0;\r
                const totalCosto = costoMuestra + costoTransp;\r
                const adelanto = parseFloat(getValueOf('adelanto')) || 0;\r
                const resta = totalCosto - adelanto;\r
                const pagado = !getCheckedOf('pagoPendiente');\r
\r
                const nextId = window.patientDatabase && window.patientDatabase.length > 0\r
                    ? Math.max(...window.patientDatabase.map(x => x.id)) + 1\r
                    : 1;\r
\r
                const newRecord = {\r
                    id: nextId,\r
                    service: service,\r
                    codAtencion: value,\r
                    dni: getValueOf('dni') || '0',\r
                    medSolicitante: getValueOf('medSolicitante').toUpperCase(),\r
                    nombres: nombres.toUpperCase(),\r
                    apellidos: apellidos.toUpperCase(),\r
                    paciente: `${nombres.toUpperCase()} ${apellidos.toUpperCase()}`,\r
                    especimen: especimen,\r
                    costo: totalCosto,\r
                    costoMuestra: costoMuestra,\r
                    costoTransp: costoTransp,\r
                    adelanto: adelanto,\r
                    resta: resta,\r
                    fecRegistro: parseDisplayDate(getValueOf('fecRegistro')),\r
                    fecEntrega: parseDisplayDate(getValueOf('fecEntrega')),\r
                    pagado: pagado,\r
                    atrasado: false,\r
\r
                    // Additional fields\r
                    edad: (getValueOf('edad') && getValueOf('edad') !== '0') ? getValueOf('edad') : '--',\r
                    sexo: getValueOf('sexo').toUpperCase() || 'MASCULINO',\r
                    telefono: getValueOf('telefono'),\r
                    telContacto: especimen,\r
                    motivoEstudio: motivoEstudioVal ? motivoEstudioVal.trim().toUpperCase() : '',\r
                    clinica: (() => {\r
                        const val = getValueOf('clinica').trim().toUpperCase();\r
                        return (val && val !== 'SIN CLINICA') ? val : 'CLÍNICA CARRIÓN';\r
                    })()\r
                };\r
\r
                if (newRecord.medSolicitante === 'SELECCIONAR') newRecord.medSolicitante = '';\r
                if (newRecord.sexo === 'M' || newRecord.sexo === 'MASCULINO') newRecord.sexo = 'MASCULINO';\r
                else if (newRecord.sexo === 'F' || newRecord.sexo === 'FEMENINO') newRecord.sexo = 'FEMENINO';\r
                else newRecord.sexo = 'MASCULINO';\r
\r
                // Add to global database and trigger sync\r
                if (typeof window.savePatient === 'function') {\r
                    window.savePatient(newRecord);\r
                } else {\r
                    if (window.patientDatabase) {\r
                        window.patientDatabase.push(newRecord);\r
                        if (typeof window.sortPatientArray === 'function') {\r
                            window.sortPatientArray(window.patientDatabase);\r
                        }\r
                    }\r
                    if (typeof window.triggerAutomaticBackup === 'function') {\r
                        window.triggerAutomaticBackup();\r
                    }\r
                }\r
\r
                // Cambiar inmediatamente a la pestaña correspondiente para aparición instantánea (0.0s de retraso)\r
                const targetTabId = service === 'C' ? 'tabCitologia' : (service === 'I' ? 'tabInmuno' : 'tabQuirurgico');\r
                const targetTabBtn = document.getElementById(targetTabId);\r
                if (targetTabBtn && !targetTabBtn.classList.contains('active')) {\r
                    targetTabBtn.click();\r
                } else if (typeof window.refreshPatientTable === 'function') {\r
                    window.refreshPatientTable();\r
                }\r
\r
                if (btnGuardar) {\r
                    btnGuardar.disabled = false;\r
                    btnGuardar.innerText = originalText;\r
                }\r
\r
                showToast(`¡Paciente ${nombres} ${apellidos} registrado exitosamente!`, 'success');\r
\r
                // Capture contextual fields to preserve for consecutive batch registration\r
                const savedMed = medSolicitanteSelect ? medSolicitanteSelect.value : '';\r
                const savedServ = tipoServicioSelect ? tipoServicioSelect.value : '';\r
                const clinicaEl = getFormElement('clinica');\r
                const savedClinica = clinicaEl ? clinicaEl.value : '';\r
\r
                // Calculate next incremented attention code\r
                const generateNextCode = (lastCode) => {\r
                    if (!lastCode) return '';\r
                    const match = lastCode.match(/^([A-Z0-9]+-)(\d+)$/i);\r
                    if (match) {\r
                        const prefix = match[1];\r
                        const numStr = match[2];\r
                        const nextNum = parseInt(numStr, 10) + 1;\r
                        const paddedNum = String(nextNum).padStart(numStr.length, '0');\r
                        return prefix + paddedNum;\r
                    }\r
                    const matchEnd = lastCode.match(/^(.*?)(\d+)$/);\r
                    if (matchEnd) {\r
                        const prefix = matchEnd[1];\r
                        const numStr = matchEnd[2];\r
                        const nextNum = parseInt(numStr, 10) + 1;\r
                        const paddedNum = String(nextNum).padStart(numStr.length, '0');\r
                        return prefix + paddedNum;\r
                    }\r
                    return lastCode;\r
                };\r
                const nextCodeVal = generateNextCode(value);\r
\r
                // Smart Form Reset\r
                patientForm.reset();\r
                if (fileUploadStatus) fileUploadStatus.innerText = 'Sin archivos seleccionados';\r
                const costoMuestraEl = getFormElement('costo');\r
                if (costoMuestraEl) costoMuestraEl.value = '0';\r
                const costoTranspEl = getFormElement('costoTransp');\r
                if (costoTranspEl) costoTranspEl.value = '0';\r
                const adelantoEl = getFormElement('adelanto');\r
                if (adelantoEl) adelantoEl.value = '0';\r
\r
                // Preserve batch context (Doctor, Service, Clinic)\r
                if (medSolicitanteSelect && savedMed) medSolicitanteSelect.value = savedMed;\r
                if (tipoServicioSelect && savedServ) tipoServicioSelect.value = savedServ;\r
                if (clinicaEl && savedClinica) clinicaEl.value = savedClinica;\r
\r
                // Auto-fill next incremented attention code\r
                if (codAtencionInput && nextCodeVal) {\r
                    codAtencionInput.value = nextCodeVal;\r
                }\r
\r
});