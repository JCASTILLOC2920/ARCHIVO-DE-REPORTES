














































































































































































































































































































































































































                                                <input type=\"file\" id=\"ordenServicio\" name=\"ordenServicio\" class=\"file-upload-input\" multiple>\r
                                                <span id=\"fileUploadStatus\" class=\"file-upload-status-text\">Sin archivos seleccionados</span>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Costo Muestra -->\r
                                    <div class=\"form-row\">\r
                                        <label for=\"costo\" class=\"form-label\">Costo Muestra</label>\r
                                        <div class=\"form-control-wrapper\">\r
                                            <input type=\"number\" id=\"costo\" name=\"costo\" class=\"form-input\" value=\"0\" min=\"0\" step=\"0.01\" placeholder=\"0.00\">\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Costo Transp. -->\r
                                    <div class=\"form-row flex-column-layout\">\r
                                        <div class=\"row-flex\">\r
                                            <label for=\"costoTransp\" class=\"form-label\">Costo Transp.</label>\r
                                            <div class=\"form-control-wrapper\">\r
                                                <input type=\"number\" id=\"costoTransp\" name=\"costoTransp\" class=\"form-input\" value=\"0\" min=\"0\" step=\"0.01\">\r
                                            </div>\r
                                        </div>\r
                                        <!-- Pago Pendiente (Checkbox abajo de Costo Transp.) -->\r
                                        <div class=\"row-flex checkbox-row\">\r
                                            <div class=\"form-label-placeholder\"></div>\r
                                            <div class=\"form-control-wrapper checkbox-container\">\r
                                                <label class=\"checkbox-label\">\r
                                                    <input type=\"checkbox\" id=\"pagoPendiente\" name=\"pagoPendiente\" class=\"form-checkbox\">\r
                                                    <span class=\"checkbox-custom-text\">Pago Pendiente</span>\r
                                                </label>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Adelanto -->\r
                                    <div class=\"form-row\">\r
                                        <label for=\"adelanto\" class=\"form-label\">Adelanto</label>\r
                                        <div class=\"form-control-wrapper\">\r
                                            <input type=\"number\" id=\"adelanto\" name=\"adelanto\" class=\"form-input\" value=\"0\" min=\"0\" step=\"0.01\">\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Fec. Registro -->\r
                                    <div class=\"form-row\">\r
                                        <label for=\"fecRegistro\" class=\"form-label bold-label\">Fec. Registro</label>\r
                                        <div class=\"form-control-wrapper\">\r
                                            <input type=\"text\" id=\"fecRegistro\" name=\"fecRegistro\" class=\"form-input readonly-input\" readonly>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Fec. Probable-Entrega -->\r
                                    <div class=\"form-row\">\r
                                        <label for=\"fecEntrega\" class=\"form-label bold-label\">Fec. Probable-Entrega</label>\r
                                        <div class=\"form-control-wrapper\">\r
                                            <input type=\"text\" id=\"fecEntrega\" name=\"fecEntrega\" class=\"form-input readonly-input\" readonly>\r
                                        </div>\r
                                    </div>\r
                                </div>\r
                            </div>\r
\r
                            <!-- Separador de Línea -->\r
                            <hr class=\"form-divider\">\r
\r
                            <!-- Botones de Acción Inferiores -->\r
                            <footer class=\"form-actions\">\r
                                <button type=\"button\" id=\"btnSalir\" class=\"btn btn-muted\">Salir</button>\r
                                <button type=\"submit\" id=\"btnGuardar\" class=\"btn btn-success\">Guardar</button>\r
                            </footer>\r
                        </form>\r
                    </main>\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Mensajes Flotantes (Toasts) para feedback elegante -->\r
    <div id=\"toastContainer\" class=\"toast-container\"></div>\r
\r
    <!-- SDK de Supabase -->\r
    <script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2\" defer></script>\r
    <!-- Módulo Centralizado de Utilidades -->\r
    <script type=\"module\" src=\"utils.js?v=22.00\"></script>\r
    <!-- Configuración de Supabase -->\r
    <script src=\"supabase_config.js?v=22.00\" defer></script>\r
    <!-- Inicialización de Base de Datos y Seguridad (RBAC) -->\r
    <script type=\"module\">\r
        import { initLocalDatabases, patientDatabase, triggerAutomaticBackup, syncPatientsFromSupabase, savePatient, deletePatient } from './db_service.js?v=22.00';\r
        \r
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));\r
        if (!currentUser) {\r
            window.location.href = 'login.html';\r
        } else if (currentUser.perfil === 'Usuario') {\r
            window.location.href = 'reportes.html';\r
        } else {\r
            initLocalDatabases();\r
            window.patientDatabase = patientDatabase;\r
            window.triggerAutomaticBackup = triggerAutomaticBackup;\r
            window.savePatient = savePatient;\r
            window.deletePatient = deletePatient;\r
            syncPatientsFromSupabase();\r
        }\r
    </script>\r
    <!-- Script Externa -->\r
    <script src=\"script.js?v=5.01\" defer></script>\r
</body>\r
</html>\r


















































































































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
            const confirmOverwrite = confirm(`⚠️ El código de atención \"${value}\" ya figura registrado a nombre de: \"${existingPatient.paciente}\" en el \"${existingServName}\".\
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
            btnGuardar.innerHTML = '<i class=\"fa-solid fa-spinner fa-spin\"></i> Guardando...';\r
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
                    const match = lastCode.match(/^([A-Z0-9]+-)(\\d+)$/i);\r
                    if (match) {\r
                        const prefix = match[1];\r
                        const numStr = match[2];\r
                        const nextNum = parseInt(numStr, 10) + 1;\r
                        const paddedNum = String(nextNum).padStart(numStr.length, '0');\r
                        return prefix + paddedNum;\r
                    }\r
                    const matchEnd = lastCode.match(/^(.*?)(\\d+)$/);\r
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



























































































































































































































        </div>\r
    </div>\r
\r
\r
\r
    <!-- Modal para Crear Plantilla Rápida -->\r
    <div id=\"fastTemplateModal\" class=\"floating-modal-overlay\">\r
        <main class=\"modal-container\" style=\"max-width: 400px; padding: 20px;\">\r
            <header class=\"modal-header\">\r
                <h2><i class=\"fa-solid fa-folder-plus\"></i> Guardar como Plantilla</h2>\r
                <button type=\"button\" class=\"close-btn\" id=\"btnCloseFastTemplate\">&times;</button>\r
            </header>\r
            <div class=\"modal-body\" style=\"padding: 15px 0;\">\r
                <p style=\"margin-bottom: 15px; color: #555;\">Se guardará el texto actual de Descripción Macroscópica, Microscópica y Diagnóstico.</p>\r
                <div class=\"form-group\" style=\"margin-bottom: 15px;\">\r
                    <label for=\"fastTemplateTitle\">Nombre de la Plantilla:</label>\r
                    <input type=\"text\" id=\"fastTemplateTitle\" class=\"form-input\" placeholder=\"Ej: APENDICITIS AGUDA...\" required style=\"width: 100%; padding: 8px;\">\r
                </div>\r
                <div class=\"form-group\" style=\"margin-bottom: 15px;\">\r
                    <label for=\"fastTemplateCategory\">Especialidad (Categoría):</label>\r
                    <select id=\"fastTemplateCategory\" class=\"form-select\" required style=\"width: 100%; padding: 8px;\">\r
                        <option value=\"\">Seleccione una especialidad</option>\r
                    </select>\r
                </div>\r
            </div>\r
            <div class=\"modal-footer\" style=\"display: flex; justify-content: flex-end; gap: 10px;\">\r
                <button type=\"button\" class=\"btn btn-secondary\" id=\"btnCancelFastTemplate\">Cancelar</button>\r
                <button type=\"button\" class=\"btn btn-primary\" id=\"btnSaveFastTemplate\">Guardar Plantilla</button>\r
            </div>\r
        </main>\r
    </div>\r
\r
    <!-- Base de Datos de Plantillas Estática -->\r
    <script src=\"plantillas_data.js\" defer></script>\r
    \r
    <!-- Referencia al archivo script.js global (Diseño/Menú UI Principal) -->\r
    <script src=\"script.js\" defer></script>\r
    <!-- SDK de Supabase -->\r
    <script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2\" defer></script>\r
    <!-- Configuración de Supabase -->\r
    <script src=\"supabase_config.js\" defer></script>\r
    <!-- Datos Antiguos -->\r
    <script src=\"datos_migrados.js\" defer></script>\r
    <!-- Script de Lógica del Listado -->\r
    <script src=\"motor_groq.js\" defer></script>\r
    <script src=\"reportes.js?v=5\" defer></script>\r
</body>\r
</html>\r












































































































































































            <div class=\"modal-footer\" style=\"display: flex; justify-content: flex-end; gap: 10px;\">
                <button type=\"button\" class=\"btn btn-secondary\" id=\"btnCancelFastTemplate\">Cancelar</button>
                <button type=\"button\" class=\"btn btn-primary\" id=\"btnSaveFastTemplate\">Guardar Plantilla</button>
            </div>
        </main>
    </div>

    <!-- Base de Datos de Plantillas Estática -->
    <script src=\"plantillas_data.js\" defer></script>
    
    <!-- Referencia al archivo script.js global (Diseño/Menú UI Principal) -->
    <script src=\"script.js\" defer></script>
    <!-- SDK de Supabase -->
    <script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2\" defer></script>
    <!-- Configuración de Supabase -->
    <script src=\"supabase_config.js?v=23.00\" defer></script>
    <!-- Módulo Principal de la Aplicación -->
    <script type=\"module\" src=\"main.js?v=23.00\"></script>
</body>
</html>
