// utils.js - Módulo Centralizado de Utilidades Purificadas y Sanitizadores (JC PATH LAB)

export const cleanCodeFunc = (str) => String(str || '').trim().toLowerCase().replace(/[-_\\s]/g, '');

export function formatDisplayDate(dateStr) {
    if (!dateStr) return '---';
    if (dateStr instanceof Date) {
        const dd = String(dateStr.getDate()).padStart(2, '0');
        const mm = String(dateStr.getMonth() + 1).padStart(2, '0');
        const yyyy = dateStr.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }
    const str = String(dateStr).trim();
    if (str.includes('/')) return str;
    const parts = str.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return str;
}

// Expresiones regulares pre-compiladas estáticamente fuera de bucles (Máxima eficiencia CPU)
const REGEX_HTML_NBSP = /&nbsp;/gi;
const REGEX_HTML_AMP = /&amp;/gi;
const REGEX_HTML_SPANS = /<\\/?span[^>]*>/gi;
const REGEX_PAPA_NICOLAS = /\\bpap[áa]\\s*nicol[áa]s\\b/gi;
const REGEX_PAPA_NICO_VARIANTS = /\\bpapa?ni[co]o?l?[a-z]{0,6}\\b/gi;

export function correctPapanicolaouSpelling(text) {
    if (!text) return '';
    
    let result = String(text).replace(REGEX_HTML_NBSP, ' ').replace(REGEX_HTML_AMP, '&');
    result = result.replace(REGEX_HTML_SPANS, '');
    
    result = result.replace(REGEX_PAPA_NICOLAS, (match) => {
        if (match === match.toUpperCase()) return "PAPANICOLAOU";
        if (match[0] === match[0].toUpperCase()) return "Papanicolaou";
        return "papanicolaou";
    });
    
    result = result.replace(REGEX_PAPA_NICO_VARIANTS, (match) => {
        if (match === match.toUpperCase()) return "PAPANICOLAOU";
        if (match === match.toLowerCase()) return "papanicolaou";
        return "Papanicolaou";
    });
    
    return result;
}

export function cleanTextContentLocal(text) {
    if (!text) return '';
    let result = String(text);
    result = result.replace(/[{}]/g, '');
    result = result.replace(/\\b\\d{6,}\\b/g, '');
    result = result.replace(/\\b([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\\s+\\1\\b/gi, '$1');
    result = correctPapanicolaouSpelling(result);
    return result;
}

export function formatDoctorName(name) {
    if (!name) return "";
    let clean = String(name).toUpperCase().trim();
    clean = clean.replace(/\\bDR\\s*,/gi, "DR.");
    clean = clean.replace(/\\bDRA\\s*,/gi, "DRA.");
    clean = clean.replace(/\\bDR\\s+(?!\\.)/gi, "DR. ");
    clean = clean.replace(/\\bDRA\\s+(?!\\.)/gi, "DRA. ");
    clean = clean.replace(/\\bDR\\s*\\.\\s*\\./gi, "DR.");
    clean = clean.replace(/\\bDRA\\s*\\.\\s*\\./gi, "DRA.");
    clean = clean.replace(/\\s+/g, " ");
    return clean;
}

export function toTitleCase(str) {
    if (!str) return '';
    const minorWords = ['de', 'del', 'la', 'las', 'los', 'y', 'o', 'en'];
    return String(str).toLowerCase().split(/\\s+/).map((word, idx) => {
        if (minorWords.includes(word) && idx > 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

// GARANTÍA DE RETROCOMPATIBILIDAD ABSOLUTA EN WINDOW
if (typeof window !== 'undefined') {
    window.cleanCodeFunc = cleanCodeFunc;
    window.formatDisplayDate = formatDisplayDate;
    window.correctPapanicolaouSpelling = correctPapanicolaouSpelling;
    window.cleanTextContentLocal = cleanTextContentLocal;
    window.formatDoctorName = formatDoctorName;
    window.toTitleCase = toTitleCase;
}

    const totalRecords = filteredByService.length;\r
    const totalPages = Math.ceil(totalRecords / rowsPerPage);\r
    \r
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;\r
    if (currentPage < 1) currentPage = 1;\r
    sessionStorage.setItem('activeTablePage', String(currentPage));\r
\r
    const startIndex = (currentPage - 1) * rowsPerPage;\r
    const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);\r
    \r
    const currentSet = filteredByService.slice(startIndex, endIndex);\r
\r
    let currentUser = {};\r
    try {\r
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}') || {};\r
    } catch (e) {\r
        currentUser = {};\r
    }\r
    const isAdmin = currentUser.perfil === 'Administrador';\r
\r
    const createRow = (item, index) => {\r
        const row = document.createElement('tr');\r
        const getSla = (typeof window.getPatientSlaStatus === 'function') ? window.getPatientSlaStatus : (x => ({\r
            isFirmado: x.firmado === true || x.estado === 'Completado',\r
            isModificado: x.modificado === true || x.estado === 'En Proceso',\r
            color: x.firmado ? '#10b981' : (x.modificado ? '#f59e0b' : '#e11d48'),\r
            dotClass: x.firmado ? 'dot-green date-completed' : (x.modificado ? 'dot-yellow date-urgent' : 'dot-red date-delay'),\r
            title: x.firmado ? 'Informe Firmado y Listo para Presentar' : (x.modificado ? 'Información Editada y Guardada (Pendiente de Firma)' : 'Pendiente (Sin información ingresada)')\r
        }));\r
\r
        const sla = getSla(item);\r
        const isFirmado = sla.isFirmado;\r
        const isModificado = sla.isModificado;\r
        const dotBgColor = sla.color;\r
        const dotClass = sla.dotClass;\r
        const dotTitle = sla.title;\r
\r
        const costoVal = parseFloat(item.costo) || 0;\r
        const adelantoVal = parseFloat(item.adelanto) || 0;\r
        const costoText = `S/ ${costoVal.toFixed(2)}`;\r
        const adelantoText = `S/ ${adelantoVal.toFixed(2)}`;\r
\r
        let pacienteName = '';\r
        const rawApellidos = (item.apellidos || '').trim();\r
        const rawNombres = (item.nombres || '').trim();\r
        const rawPaciente = (item.paciente || '').trim();\r
\r
        if (rawApellidos && rawNombres) {\r
            pacienteName = `${toTitleCase(rawApellidos)}, ${toTitleCase(rawNombres)}`;\r
        } else if (rawPaciente.includes(',')) {\r
            const parts = rawPaciente.split(',');\r
            pacienteName = `${toTitleCase(parts[0].trim())}, ${toTitleCase(parts[1] || '').trim()}`;\r
        } else if (rawPaciente) {\r
            const words = rawPaciente.split(/\\s+/);\r
            if (words.length >= 3) {\r
                const ap = words.slice(0, 2).join(' ');\r
                const nom = words.slice(2).join(' ');\r
                pacienteName = `${toTitleCase(ap)}, ${toTitleCase(nom)}`;\r
            } else {\r
                pacienteName = toTitleCase(rawPaciente);\r
            }\r
        } else {\r
            pacienteName = '---';\r
        }\r
\r
        let especimenText = (item.especimen !== undefined && item.especimen !== null ? item.especimen : '').trim();\r
        if (especimenText) {\r
            especimenText = toTitleCase(correctPapanicolaouSpelling(especimenText));\r
            // Reemplazo explícito y obligatorio de Pap por Papanicolaou en la columna de espécimen\r
            especimenText = especimenText\r
                .replace(/\\bPap\\b/gi, 'Papanicolaou')\r
                .replace(/\\bPap\\.\\b/gi, 'Papanicolaou')\r
                .replace(/\\bVeicula\\b/g, 'Vesícula')\r
                .replace(/\\bveicula\\b/g, 'vesícula')\r
                .replace(/\\bVescula\\b/g, 'Vesícula')\r
                .replace(/\\bvescula\\b/g, 'vesícula')\r
                .replace(/\\bApndice\\b/g, 'Apéndice')\r
                .replace(/\\bapndice\\b/g, 'apéndice')\r
                .replace(/\\bApendice\\b/g, 'Apéndice')\r
                .replace(/\\bapendice\\b/g, 'apéndice')\r
                .replace(/\\bEstomago\\b/g, 'Estómago')\r
                .replace(/\\bestomago\\b/g, 'estómago')\r
                .replace(/\\bPolipo\\b/g, 'Pólipo')\r
                .replace(/\\bpolipo\\b/g, 'pólipo')\r
                .replace(/\\bLitiasica\\b/g, 'Litiásica')\r
                .replace(/\\blitiasica\\b/g, 'litiásica')\r
                .replace(/\\bUtero\\b/g, 'Útero');\r
        } else {\r
            especimenText = '---';\r
        }\r
        const safeCod = String(item.codAtencion || '').replace(/'/g, "\\\'");\r
\r
        const waPhone = String(item.telContacto || item.telefono || item.fContacto || '999999999').replace(/\\D/g, '');\r
        const waCleanPhone = waPhone.length === 9 ? `51${waPhone}` : (waPhone.startsWith('51') ? waPhone : `51${waPhone}`);\r
        const waText = encodeURIComponent(`Estimado(a) *${item.medSolicitante || 'Doctor'}*, le saludamos del Servicio de Patología. Le informamos que el reporte anatomopatológico del paciente *${pacienteName}* (Código: *${item.codAtencion || ''}*, Muestra: *${especimenText}*) se encuentra *LISTO Y FIRMADO*. 📄 Puede descargar el informe en PDF en el siguiente enlace seguro: https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(item.codAtencion || '')}`);\r
        const waUrl = `https://wa.me/${waCleanPhone}?text=${waText}`;\r
        const waBtnHtml = `<a href="${waUrl}" target="_blank" class="action-btn whatsapp-btn" title="Enviar Notificación por WhatsApp a 1-Clic"><i class="fa-brands fa-whatsapp"></i> WA</a>`;\r
\r
        let actionsHtml = '';\r
        const pendingFix = item.solicitud_correccion && item.solicitud_correccion.estado === 'pendiente';\r
\r
        if (isAdmin) {\r
            const fixBannerHtml = pendingFix ? `\r
                <div style="background:#fffbeb;border:1px solid #f59e0b;padding:4px 8px;border-radius:6px;margin-bottom:6px;font-size:0.75rem;color:#92400e;">\r
                    <b>🟡 Solicitud Clínica La Mujer:</b> Cambiar a <b>"${item.solicitud_correccion.nombre_solicitado}"</b>\r
                    <div style="margin-top:3px;display:flex;gap:4px;">\r
                        <button style="background:#10b981;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-weight:bold;" onclick="window.aceptarCorreccionYRefirmar('${safeCod}')"><i class="fa-solid fa-check"></i> ACEPTAR Y RE-FIRMAR (1 Clic)</button>\r
                        <button style="background:#ef4444;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;" onclick="window.rechazarCorreccion('${safeCod}')"><i class="fa-solid fa-xmark"></i> Rechazar</button>\r
                    </div>\r







































































































































































































                                                <input type="file" id="ordenServicio" name="ordenServicio" class="file-upload-input" multiple>\r
                                                <span id="fileUploadStatus" class="file-upload-status-text">Sin archivos seleccionados</span>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Costo Muestra -->\r
                                    <div class="form-row">\r
                                        <label for="costo" class="form-label">Costo Muestra</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="number" id="costo" name="costo" class="form-input" value="0" min="0" step="0.01" placeholder="0.00">\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Costo Transp. -->\r
                                    <div class="form-row flex-column-layout">\r
                                        <div class="row-flex">\r
                                            <label for="costoTransp" class="form-label">Costo Transp.</label>\r
                                            <div class="form-control-wrapper">\r
                                                <input type="number" id="costoTransp" name="costoTransp" class="form-input" value="0" min="0" step="0.01">\r
                                            </div>\r
                                        </div>\r
                                        <!-- Pago Pendiente (Checkbox abajo de Costo Transp.) -->\r
                                        <div class="row-flex checkbox-row">\r
                                            <div class="form-label-placeholder"></div>\r
                                            <div class="form-control-wrapper checkbox-container">\r
                                                <label class="checkbox-label">\r
                                                    <input type="checkbox" id="pagoPendiente" name="pagoPendiente" class="form-checkbox">\r
                                                    <span class="checkbox-custom-text">Pago Pendiente</span>\r
                                                </label>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Adelanto -->\r
                                    <div class="form-row">\r
                                        <label for="adelanto" class="form-label">Adelanto</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="number" id="adelanto" name="adelanto" class="form-input" value="0" min="0" step="0.01">\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Fec. Registro -->\r
                                    <div class="form-row">\r
                                        <label for="fecRegistro" class="form-label bold-label">Fec. Registro</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="text" id="fecRegistro" name="fecRegistro" class="form-input readonly-input" readonly>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Fec. Probable-Entrega -->\r
                                    <div class="form-row">\r
                                        <label for="fecEntrega" class="form-label bold-label">Fec. Probable-Entrega</label>\r
                                        <div class="form-control-wrapper">\r
                                            <input type="text" id="fecEntrega" name="fecEntrega" class="form-input readonly-input" readonly>\r
                                        </div>\r
                                    </div>\r
                                </div>\r
                            </div>\r
\r
                            <!-- Separador de Línea -->\r
                            <hr class="form-divider">\r
\r
                            <!-- Botones de Acción Inferiores -->\r
                            <footer class="form-actions">\r
                                <button type="button" id="btnSalir" class="btn btn-muted">Salir</button>\r
                                <button type="submit" id="btnGuardar" class="btn btn-success">Guardar</button>\r
                            </footer>\r
                        </form>\r
                    </main>\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Mensajes Flotantes (Toasts) para feedback elegante -->\r
    <div id="toastContainer" class="toast-container"></div>\r
\r
    <!-- SDK de Supabase -->\r
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>\r
    <!-- Módulo Centralizado de Utilidades -->\r
    <script type="module" src="utils.js?v=22.00"></script>\r
    <!-- Configuración de Supabase -->\r
    <script src="supabase_config.js?v=22.00" defer></script>\r
    <!-- Inicialización de Base de Datos y Seguridad (RBAC) -->\r
    <script type="module">\r
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
    <script src="script.js?v=5.01" defer></script>\r
</body>\r
</html>\r
