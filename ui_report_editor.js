import { patientDatabase, doctorsDatabase, triggerAutomaticBackup, categoriesDatabase, templatesDatabase, addTemplateToDatabase, mapPatientToDb, savePatient, deletePatient, cleanTextContentLocal } from './db_service.js?v=3.8';
import { renderTable } from './ui_tables.js?v=3.8';
import { populateModalDoctorsSelect } from './ui_admin.js?v=3.8';
import { closeModal } from './ui_editor.js?v=3.8';

window.savePatient = savePatient;
window.deletePatient = deletePatient;

let editingCodAtencion = null;
let originalCodAtencion = null;

const supabase = window.supabase;
const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined');


export function fixMedicalCapitalization(text) {
    if (!text) return '';
    
    // Corregir ortografía de Papanicolaou y Citología Cervical
    const papanicolaouRegex = /\bpapa?ni[co]o?l?[a-z]{0,6}\b/gi;
    text = text.replace(papanicolaouRegex, (match) => {
        if (match === match.toUpperCase()) return 'PAPANICOLAOU';
        if (match === match.toLowerCase()) return 'papanicolaou';
        return 'Papanicolaou';
    });
    
    const citologiaRegex = /\bcito[lgj][ií]a\s+cervical\b/gi;
    text = text.replace(citologiaRegex, (match) => {
        if (match === match.toUpperCase()) return 'CITOLOGÍA CERVICAL';
        if (match.startsWith('C') || match.startsWith('c')) {
            return match[0] === 'C' ? 'Citología cervical' : 'citología cervical';
        }
        return 'citología cervical';
    });

    if (text.includes('<') && text.includes('>')) {
        return text.replace(/(>|\.\s+|^\s*)([a-zñáéíóú])/gi, (match, prefix, char) => {
            return prefix + char.toUpperCase();
        });
    }
    return text.split(/(\.\s+|\n+)/).map((segment, idx) => {
        if (idx % 2 === 0 && segment.length > 0) {
            let trimmed = segment.trimStart();
            let leadingSpace = segment.substring(0, segment.length - trimmed.length);
            if (trimmed.length > 0) {
                trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
            }
            return leadingSpace + trimmed;
        }
        return segment;
    }).join('');
}

function notifyUser(msg, type = 'success') {
    if (typeof window.showToast === 'function') {
        window.showToast(msg, type);
    } else if (typeof showToast === 'function') {
        showToast(msg, type);
    } else {
        alert(msg);
    }
}

function setEditorReadOnlyState(isReadOnly) {
    const modal = document.getElementById('reportEditorModalOverlay');
    if (!modal) return;
    
    // Inputs, Selects, Textareas
    const inputs = modal.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.id !== 're_btnSalir' && !input.classList.contains('close-btn')) {
            input.disabled = isReadOnly;
        }
    });

    // Divs editables
    const editables = modal.querySelectorAll('div[contenteditable]');
    editables.forEach(div => {
        div.setAttribute('contenteditable', isReadOnly ? 'false' : 'true');
        if (isReadOnly) {
            div.style.backgroundColor = '#f1f5f9';
            div.style.cursor = 'not-allowed';
        } else {
            div.style.backgroundColor = '#ffffff';
            div.style.cursor = 'text';
        }
    });
    
    // Botones del editor
    const btnGuardar = document.getElementById('re_btnGuardar');
    if (btnGuardar) {
        btnGuardar.style.display = isReadOnly ? 'none' : '';
    }
    
    const btnUnlockCode = document.getElementById('re_btnUnlockCode');
    if (btnUnlockCode) {
        btnUnlockCode.style.display = isReadOnly ? 'none' : '';
    }
    
    const actionButtons = modal.querySelectorAll('.file-upload-label-btn, .upload-zone, .btn-dictado, .tb-btn, .editor-btn-primary, .editor-btn-secondary');
    actionButtons.forEach(btn => {
        if (btn.id !== 're_btnSalir' && btn.id !== 're_btnVerSolicitud' && btn.id !== 're_btnFirma' && btn.id !== 're_btnPreview') {
            btn.style.display = isReadOnly ? 'none' : '';
        }
    });
}

function setFieldLockState(inputId, buttonId, isLocked) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    if (input) {
        input.readOnly = isLocked;
        if (isLocked) {
            input.classList.add('readonly-field');
        } else {
            input.classList.remove('readonly-field');
        }
    }
    if (button) {
        button.innerHTML = isLocked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';
    }
}

export function populateEditorModal(codAtencion) {
    if (!codAtencion) return false;
    let patient = null;
    if (typeof codAtencion === 'object' && codAtencion !== null) {
        patient = codAtencion;
    } else {
        const cleanCode = String(codAtencion).trim().toLowerCase();
        const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
        patient = patientDatabase.find(x => {
            const code = String(x.codAtencion || '').trim().toLowerCase();
            return code === cleanCode || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
        });
    }

    if (!patient) {
        if (typeof showToast === 'function') showToast(`No se encontró el registro ${codAtencion}.`, 'error');
        return false;
    }
    
    editingCodAtencion = patient.codAtencion || codAtencion;
    originalCodAtencion = patient.codAtencion || codAtencion;

    setFieldLockState('re_codAtencion', 're_btnUnlockCode', true);

    // Helper safely sets values
    const safeSet = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            const isContentEditable = el.getAttribute('contenteditable') === 'true' || el.tagName === 'DIV';
            if (isContentEditable) {
                let formattedVal = val !== undefined && val !== null ? String(val) : "";
                if (id === 're_macroDesc' || id === 're_microDesc') {
                    formattedVal = formattedVal.includes('<') ? formattedVal.toLowerCase() : formattedVal.toLowerCase().replace(/\n/g, '<br>');
                } else if (id === 're_diagnostico') {
                    formattedVal = formattedVal.includes('<') ? formattedVal.toUpperCase() : formattedVal.toUpperCase().replace(/\n/g, '<br>');
                    if (formattedVal && !formattedVal.startsWith('<b>') && !formattedVal.startsWith('<strong>')) {
                        formattedVal = `<b>${formattedVal}</b>`;
                    }
                }
                el.innerHTML = formattedVal;
            } else {
                el.value = val !== undefined && val !== null ? val : "";
            }
        }
    };

    safeSet('re_codAtencion', patient.codAtencion);
    safeSet('re_dni', patient.dni || "0");

    let nomVal = "", apeVal = "";
    if (patient.nombres && patient.apellidos) {
        nomVal = patient.nombres;
        apeVal = patient.apellidos;
    } else if (patient.paciente) {
        const parts = patient.paciente.split(',');
        if (parts.length > 1) {
            apeVal = parts[0].trim();
            nomVal = parts[1].trim();
        } else {
            apeVal = '';
            nomVal = patient.paciente;
        }
    }
    safeSet('re_nomPaciente', nomVal);
    safeSet('re_apePaciente', apeVal);

    const s = patient.sexo || "MASCULINO";
    safeSet('re_sexo', (s === 'M' || s === 'MASCULINO') ? 'MASCULINO' : ((s === 'F' || s === 'FEMENINO') ? 'FEMENINO' : 'MASCULINO'));
    
    safeSet('re_edad', patient.edad || "");
    safeSet('re_telefono', patient.telefono || patient.fContacto || "");
    safeSet('re_fContacto', patient.fContacto || "");
    safeSet('re_telContacto', patient.especimen || patient.telContacto || "");
    safeSet('re_medSolicitante', patient.medSolicitante || "");
    safeSet('re_motivoEstudio', patient.motivoEstudio || "");
    safeSet('re_fecIngreso', patient.fecRegistro || "");
    safeSet('re_fecEntregaReal', patient.fecEntrega || "");

    if (patient.fecRegistro) {
        const d = new Date(patient.fecRegistro + 'T00:00:00');
        if (!isNaN(d.getTime())) {
            d.setDate(d.getDate() + 5);
            safeSet('re_fecProbable', d.toISOString().split('T')[0]);
        }
    } else {
        safeSet('re_fecProbable', "");
    }
    
    safeSet('re_doctor', "DR. JOSEHP CHRISTOPHER CASTILLO CUENCA");
    safeSet('re_casetes', patient.casetes || 1);
    safeSet('re_diagnostico', patient.diagnostico || "");
    // Populate templates dynamically according to patient's service
    if (typeof window.populateEditorTemplates === 'function') {
        window.populateEditorTemplates(patient.service || 'Q');
    }
    
    safeSet('re_catMacro', patient.catMacro || "");
    if (typeof window.actualizarPlantillasSegunEspecialidad === 'function') {
        window.actualizarPlantillasSegunEspecialidad('macro', patient.catMacro || "");
    }
    safeSet('re_planMacro', patient.planMacro || "");
    safeSet('re_macroDesc', patient.macroDesc || "");
    
    safeSet('re_catMicro', patient.catMicro || "");
    if (typeof window.actualizarPlantillasSegunEspecialidad === 'function') {
        window.actualizarPlantillasSegunEspecialidad('micro', patient.catMicro || "");
        window.actualizarPlantillasSegunEspecialidad('diag', patient.catMicro || "");
    }
    safeSet('re_planMicro', patient.planMicro || "");
    safeSet('re_planDiag', patient.planMicro || "");
    safeSet('re_microDesc', patient.microDesc || "");

    // Clear files
    const filesTableBody = document.getElementById('re_filesTableBody');
    if (filesTableBody) filesTableBody.innerHTML = `<tr><td class="empty-table-cell">No hay información solicitada</td></tr>`;
    
    if (window.currentUploadedFileUrl && window.currentUploadedFileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(window.currentUploadedFileUrl);
    }
    window.currentUploadedFileUrl = null;
    window.currentUploadedFileBase64 = null;
    
    const fileStatus = document.getElementById('re_fileStatus');
    if (patient.solicitudInforme) {
        window.currentUploadedFileUrl = patient.solicitudInforme;
        window.currentUploadedFileBase64 = patient.solicitudInforme;
        if (fileStatus) fileStatus.textContent = "Solicitud cargada (guardada)";
    } else {
        if (fileStatus) fileStatus.textContent = "Sin archivos seleccionados";
    }
    safeSet('re_fileInput', "");

    // Map Images
    const setupImage = (id, src) => {
        const preview = document.getElementById(`re_${id}Preview`);
        const previewContainer = document.getElementById(`re_${id}PreviewContainer`);
        const uploadZone = document.getElementById(`re_${id}UploadZone`);
        if (src && preview && previewContainer) {
            preview.src = src;
            previewContainer.style.display = 'flex';
            if (uploadZone) uploadZone.style.display = 'none';
        } else if (preview && previewContainer) {
            preview.src = "";
            previewContainer.style.display = 'none';
            if (uploadZone) uploadZone.style.display = 'flex';
        }
    };
    setupImage('img01', patient.img01);
    setupImage('img02', patient.img02);

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isClinic = currentUser && currentUser.perfil === 'Usuario';
    setEditorReadOnlyState(isClinic);

    return true;
}
export function initReportEditorLogic() {
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
    const reBtnVerSolicitud = document.getElementById('re_btnVerSolicitud');

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

    if (reBtnCarga && reFileInput) {
        reBtnCarga.addEventListener('click', () => {
            if (reFileInput.files.length > 0) {
                const file = reFileInput.files[0];
                
                // Mostrar estado de carga y compresión
                const originalText = reBtnCarga.textContent;
                reBtnCarga.disabled = true;
                reBtnCarga.textContent = "Comprimiendo...";
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        
                        // Escalar proporcionalmente si excede 1600px para ahorrar espacio
                        const maxDimension = 1600;
                        if (width > maxDimension || height > maxDimension) {
                            const ratio = Math.min(maxDimension / width, maxDimension / height);
                            width = Math.round(width * ratio);
                            height = Math.round(height * ratio);
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Convertir a formato WebP de alta compresión (con fallback a JPEG)
                        const exportFormat = 'image/webp';
                        const exportQuality = 0.65;
                        
                        canvas.toBlob((blob) => {
                            const finalBlob = blob || file; // fallback al original si falla canvas.toBlob
                            const isCompressed = !!blob;
                            
                            if (window.currentUploadedFileUrl && window.currentUploadedFileUrl.startsWith('blob:')) {
                                URL.revokeObjectURL(window.currentUploadedFileUrl);
                            }
                            window.currentUploadedFileUrl = URL.createObjectURL(finalBlob);
                            
                            // Convertir finalBlob a Base64 para guardado persistente
                            const readerBase64 = new FileReader();
                            readerBase64.onloadend = function() {
                                window.currentUploadedFileBase64 = readerBase64.result;
                            };
                            readerBase64.readAsDataURL(finalBlob);
                            
                            const origSizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";
                            const compSizeStr = (finalBlob.size / 1024).toFixed(0) + " KB";
                            
                            if (isCompressed) {
                                showToast(`Solicitud cargada y optimizada (${origSizeStr} → ${compSizeStr})`, "success");
                                if (reFileStatus) {
                                    reFileStatus.textContent = `${file.name} (${compSizeStr} - optimizado)`;
                                }
                            } else {
                                showToast("Solicitud cargada con éxito", "success");
                            }
                            
                            reBtnCarga.disabled = false;
                            reBtnCarga.textContent = originalText;
                        }, exportFormat, exportQuality);
                    };
                    img.onerror = function() {
                        showToast("Error al procesar la imagen. Verifique el archivo.", "error");
                        reBtnCarga.disabled = false;
                        reBtnCarga.textContent = originalText;
                    };
                    img.src = e.target.result;
                };
                reader.onerror = function() {
                    showToast("Error al leer el archivo.", "error");
                    reBtnCarga.disabled = false;
                    reBtnCarga.textContent = originalText;
                };
                reader.readAsDataURL(file);
            } else {
                showToast("Seleccione al menos un archivo para cargar", "error");
            }
        });
    }

    if (reBtnVerSolicitud) {
        reBtnVerSolicitud.addEventListener('click', () => {
            if (window.currentUploadedFileUrl) {
                window.open(window.currentUploadedFileUrl, '_blank');
            } else {
                showToast("No se ha cargado ninguna solicitud de informe", "error");
            }
        });
    }

    // Código de atención change confirmation prompt
    const reCodAtencionInput = document.getElementById('re_codAtencion');
    if (reCodAtencionInput) {
        reCodAtencionInput.addEventListener('change', () => {
            const newValue = reCodAtencionInput.value.trim();
            if (originalCodAtencion && newValue !== originalCodAtencion) {
                const confirmChange = confirm("¿Seguro que quiere cambiar el código de atención?");
                if (!confirmChange) {
                    reCodAtencionInput.value = originalCodAtencion;
                }
            }
        });
    }

    // Helper function to compress images using Canvas API
    function compressImage(fileOrDataUrl, maxWidth = 800, maxHeight = 800, quality = 0.65) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Downscale if image exceeds max dimensions
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed jpeg data URL
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = (err) => {
                reject(err);
            };

            if (typeof fileOrDataUrl === 'string') {
                img.src = fileOrDataUrl;
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(fileOrDataUrl);
            }
        });
    }

    // Image 01 attachment upload
    const reImg01Input = document.getElementById('re_img01Input');
    const reImg01Workspace = document.getElementById('re_img01Workspace');
    const reImg01Raw = document.getElementById('re_img01Raw');
    const reImg01Actions = document.getElementById('re_img01Actions');
    const reBtnCropImg01 = document.getElementById('re_btnCropImg01');
    const reBtnCancelCropImg01 = document.getElementById('re_btnCancelCropImg01');
    const reImg01PreviewContainer = document.getElementById('re_img01PreviewContainer');
    const reImg01Preview = document.getElementById('re_img01Preview');
    const reBtnRemoveImg01 = document.getElementById('re_btnRemoveImg01');

    let cropper01 = null;

    if (reImg01Input) {
        reImg01Input.addEventListener('change', () => {
            const file = reImg01Input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    reImg01Raw.src = e.target.result;
                    reImg01Workspace.style.display = 'block';
                    reImg01Actions.style.display = 'flex';
                    reImg01PreviewContainer.style.display = 'none';
                    
                    if (cropper01) cropper01.destroy();
                    cropper01 = new Cropper(reImg01Raw, {
                        aspectRatio: 4 / 3,
                        viewMode: 1,
                        background: false
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (reBtnCropImg01) {
        reBtnCropImg01.addEventListener('click', () => {
            if (!cropper01) return;
            showToast("Recortando y comprimiendo...", "info");
            const canvas = cropper01.getCroppedCanvas({
                maxWidth: 800,
                maxHeight: 800
            });
            if (canvas) {
                const croppedBase64 = canvas.toDataURL('image/jpeg', 0.65);
                reImg01Preview.src = croppedBase64;
                reImg01Workspace.style.display = 'none';
                reImg01Actions.style.display = 'none';
                reImg01PreviewContainer.style.display = 'flex';
                cropper01.destroy();
                cropper01 = null;
                showToast("Imagen 1 recortada con éxito.", "success");
            }
        });
    }

    if (reBtnCancelCropImg01) {
        reBtnCancelCropImg01.addEventListener('click', () => {
            reImg01Input.value = "";
            reImg01Workspace.style.display = 'none';
            reImg01Actions.style.display = 'none';
            if (cropper01) {
                cropper01.destroy();
                cropper01 = null;
            }
        });
    }

    if (reBtnRemoveImg01) {
        reBtnRemoveImg01.addEventListener('click', (e) => {
            e.stopPropagation();
            reImg01Input.value = "";
            reImg01Preview.src = "";
            reImg01PreviewContainer.style.display = 'none';
        });
    }

    // Image 02 attachment upload
    const reImg02Input = document.getElementById('re_img02Input');
    const reImg02Workspace = document.getElementById('re_img02Workspace');
    const reImg02Raw = document.getElementById('re_img02Raw');
    const reImg02Actions = document.getElementById('re_img02Actions');
    const reBtnCropImg02 = document.getElementById('re_btnCropImg02');
    const reBtnCancelCropImg02 = document.getElementById('re_btnCancelCropImg02');
    const reImg02PreviewContainer = document.getElementById('re_img02PreviewContainer');
    const reImg02Preview = document.getElementById('re_img02Preview');
    const reBtnRemoveImg02 = document.getElementById('re_btnRemoveImg02');

    let cropper02 = null;

    if (reImg02Input) {
        reImg02Input.addEventListener('change', () => {
            const file = reImg02Input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    reImg02Raw.src = e.target.result;
                    reImg02Workspace.style.display = 'block';
                    reImg02Actions.style.display = 'flex';
                    reImg02PreviewContainer.style.display = 'none';
                    
                    if (cropper02) cropper02.destroy();
                    cropper02 = new Cropper(reImg02Raw, {
                        aspectRatio: 4 / 3,
                        viewMode: 1,
                        background: false
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (reBtnCropImg02) {
        reBtnCropImg02.addEventListener('click', () => {
            if (!cropper02) return;
            showToast("Recortando y comprimiendo...", "info");
            const canvas = cropper02.getCroppedCanvas({
                maxWidth: 800,
                maxHeight: 800
            });
            if (canvas) {
                const croppedBase64 = canvas.toDataURL('image/jpeg', 0.65);
                reImg02Preview.src = croppedBase64;
                reImg02Workspace.style.display = 'none';
                reImg02Actions.style.display = 'none';
                reImg02PreviewContainer.style.display = 'flex';
                cropper02.destroy();
                cropper02 = null;
                showToast("Imagen 2 recortada con éxito.", "success");
            }
        });
    }

    if (reBtnCancelCropImg02) {
        reBtnCancelCropImg02.addEventListener('click', () => {
            reImg02Input.value = "";
            reImg02Workspace.style.display = 'none';
            reImg02Actions.style.display = 'none';
            if (cropper02) {
                cropper02.destroy();
                cropper02 = null;
            }
        });
    }

    if (reBtnRemoveImg02) {
        reBtnRemoveImg02.addEventListener('click', (e) => {
            e.stopPropagation();
            reImg02Input.value = "";
            reImg02Preview.src = "";
            reImg02PreviewContainer.style.display = 'none';
        });
    }

    // Registrar Médico Solicitante
    const reBtnCopiarMed = document.getElementById('re_btnCopiarMed');
    if (reBtnCopiarMed) {
        reBtnCopiarMed.addEventListener('click', () => {
            const docName = document.getElementById('re_medSolicitante').value.trim().toUpperCase();
            if (!docName || docName === 'SELECCIONAR') {
                showToast('Por favor, ingrese el nombre del médico para registrar.', 'error');
                document.getElementById('re_medSolicitante').focus();
                return;
            }

            let normalizedDoc = docName;
            if (!normalizedDoc.startsWith('DR. ') && !normalizedDoc.startsWith('DRA. ') && !normalizedDoc.startsWith('DR ') && !normalizedDoc.startsWith('DRA ')) {
                const firstWord = normalizedDoc.split(' ').filter(w => w !== 'DR' && w !== 'DRA' && w !== 'DR.' && w !== 'DRA.')[0] || '';
                const namesFeminine = ['MARIA', 'ANA', 'CLAUDIA', 'SANDRA', 'ELIZABETH', 'ROSA', 'VIVIANA', 'MIRTHA', 'MERY', 'MARY', 'ELEANA', 'CYNTHIA', 'NATALY', 'CARMEN', 'LUZ', 'PATRICIA', 'JUANA', 'SILVIA', 'BEATRIZ', 'MONICA', 'LAURA', 'GABRIELA'];
                const isFem = namesFeminine.some(n => firstWord.toUpperCase().includes(n));
                normalizedDoc = (isFem ? 'DRA. ' : 'DR. ') + normalizedDoc;
            }

            const exists = doctorsDatabase.some(d => d.doctor.trim().toUpperCase() === normalizedDoc.trim().toUpperCase());
            if (exists) {
                showToast(`El médico "${normalizedDoc}" ya se encuentra registrado.`, 'info');
                (function(){ const el = document.getElementById('re_medSolicitante'); if(el) { el.value = normalizedDoc; } else { console.warn('Missing element: re_medSolicitante'); } })();
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

            doctorsDatabase.unshift(docData);
            populateModalDoctorsSelect();
            
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

            const el = document.getElementById('re_medSolicitante'); 
            if(el) { el.value = normalizedDoc; }
            notifyUser(`Médico "${normalizedDoc}" registrado e ingresado con éxito.`, 'success');
        });
    }

    // Salir del editor
    const reBtnSalir = document.getElementById('re_btnSalir');
    if (reBtnSalir) {
        reBtnSalir.addEventListener('click', () => {
            if (typeof closeModal === 'function') {
                closeModal('reportEditorModalOverlay');
            } else if (typeof window.closeModal === 'function') {
                window.closeModal('reportEditorModalOverlay');
            } else {
                const m = document.getElementById('reportEditorModalOverlay');
                if (m) {
                    m.classList.remove('active');
                    m.style.display = 'none';
                    document.body.style.overflow = '';
                }
            }
        });
    }

    
    function getTempPatientFromEditor() {
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };
        const getHtml = (id) => {
            const el = document.getElementById(id);
            return el ? el.innerHTML : '';
        };

        const selectedSexo = getVal('re_sexo');
        let img01 = '';
        let img02 = '';

        const p1Box = document.getElementById('re_img01PreviewContainer');
        const p1Img = document.getElementById('re_img01Preview');
        if (p1Box && p1Box.style.display !== 'none' && p1Img) {
            img01 = p1Img.src || '';
        }

        const p2Box = document.getElementById('re_img02PreviewContainer');
        const p2Img = document.getElementById('re_img02Preview');
        if (p2Box && p2Box.style.display !== 'none' && p2Img) {
            img02 = p2Img.src || '';
        }

        const nom = getVal('re_nomPaciente');
        const ape = getVal('re_apePaciente');
        const cod = getVal('re_codAtencion').trim();
        const existingPat = patientDatabase.find(x => x.codAtencion === cod || (originalCodAtencion && x.codAtencion === originalCodAtencion));
        const service = (existingPat && existingPat.service) ? existingPat.service : (cod.toUpperCase().includes('C') ? 'C' : 'Q');

        return {
            service: service,
            codAtencion: cod,
            dni: getVal('re_dni'),
            sexo: selectedSexo === 'MASCULINO' ? 'M' : (selectedSexo === 'FEMENINO' ? 'F' : 'O'),
            nombres: nom,
            apellidos: ape,
            paciente: `${ape}, ${nom}`,
            edad: parseInt(getVal('re_edad')) || 0,
            telefono: getVal('re_telefono'),
            fContacto: getVal('re_fContacto'),
            telContacto: getVal('re_telContacto'),
            medSolicitante: getVal('re_medSolicitante'),
            motivoEstudio: getVal('re_motivoEstudio'),
            especimen: getVal('re_telContacto'),
            doctor: getVal('re_doctor'),
            casetes: parseInt(getVal('re_casetes')) || 1,
            diagnostico: getHtml('re_diagnostico'),
            catMacro: getVal('re_catMacro'),
            planMacro: getVal('re_planMacro'),
            macroDesc: fixMedicalCapitalization(getHtml('re_macroDesc')),
            microDesc: fixMedicalCapitalization(getHtml('re_microDesc')),
            fecRegistro: getVal('re_fecIngreso'),
            fecEntrega: getVal('re_fecEntregaReal'),
            img01: img01,
            img02: img02
        };
    }


    // Firma button
    const reBtnFirma = document.getElementById('re_btnFirma');
    if (reBtnFirma) {
        reBtnFirma.addEventListener('click', () => {
            // Auto-generar fecha de entrega si está vacía
            const fecEntregaInput = document.getElementById('re_fecEntregaReal');
            if (fecEntregaInput && !fecEntregaInput.value) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                fecEntregaInput.value = `${yyyy}-${mm}-${dd}`;
            }
            const tempPatient = getTempPatientFromEditor();
            try {
                localStorage.setItem('printPatientData', JSON.stringify(tempPatient));
            } catch (e) {
                console.error("[Firma] Error guardando printPatientData:", e);
            }
            const printUrl = `imprimir.html?autoDownload=true&codAtencion=${encodeURIComponent(tempPatient.codAtencion || '')}`;
            window.open(printUrl, '_blank', 'width=950,height=1000');
        });
    }

    // Vista Previa button
    const reBtnPreview = document.getElementById('re_btnPreview');
    if (reBtnPreview) {
        reBtnPreview.addEventListener('click', () => {
            const tempPatient = getTempPatientFromEditor();
            try {
                localStorage.setItem('printPatientData', JSON.stringify(tempPatient));
            } catch (e) {
                console.error("[Vista Previa] Error guardando printPatientData:", e);
            }
            const printUrl = `imprimir.html?autoDownload=false&codAtencion=${encodeURIComponent(tempPatient.codAtencion || '')}`;
            window.open(printUrl, '_blank', 'width=1200,height=950');
        });
    }


    // Guardar cambios del editor
    const reBtnGuardar = document.getElementById('re_btnGuardar');
    if (reBtnGuardar) {
        reBtnGuardar.addEventListener('click', () => {
            const cleanCode = String(originalCodAtencion || editingCodAtencion || '').trim().toLowerCase();
            const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
            const patient = patientDatabase.find(x => {
                const code = String(x.codAtencion || '').trim().toLowerCase();
                return code === cleanCode || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
            });

            if (patient) {
                // Save the fields back to patient database
                const newCodAtencion = document.getElementById('re_codAtencion').value.trim();
                patient.codAtencion = newCodAtencion;
                patient.dni = document.getElementById('re_dni').value;

                const selectedSexo = document.getElementById('re_sexo').value;
                patient.sexo = selectedSexo === 'MASCULINO' ? 'M' : (selectedSexo === 'FEMENINO' ? 'F' : 'O');
                patient.fecRegistro = document.getElementById('re_fecIngreso').value;
                patient.fecEntrega = document.getElementById('re_fecEntregaReal').value;

                patient.nombres = document.getElementById('re_nomPaciente').value;
                patient.apellidos = document.getElementById('re_apePaciente').value;
                patient.paciente = `${patient.apellidos}, ${patient.nombres}`;

                patient.edad = parseInt(document.getElementById('re_edad').value) || 0;
                patient.telefono = document.getElementById('re_telefono').value;
                patient.fContacto = document.getElementById('re_fContacto').value;
                patient.telContacto = document.getElementById('re_telContacto').value;

                patient.medSolicitante = document.getElementById('re_medSolicitante').value;
                patient.motivoEstudio = document.getElementById('re_motivoEstudio').value;
                patient.especimen = patient.telContacto;

                patient.doctor = document.getElementById('re_doctor').value;
                patient.casetes = parseInt(document.getElementById('re_casetes').value) || 1;

                patient.diagnostico = document.getElementById('re_diagnostico').innerHTML;

                patient.catMacro = document.getElementById('re_catMacro').value;
                patient.planMacro = document.getElementById('re_planMacro').value;
                patient.macroDesc = fixMedicalCapitalization(document.getElementById('re_macroDesc').innerHTML);

                patient.catMicro = document.getElementById('re_catMicro').value;
                patient.planMicro = document.getElementById('re_planMicro').value;
                patient.microDesc = fixMedicalCapitalization(document.getElementById('re_microDesc').innerHTML);

                // Save Solicitud de Informe
                if (window.currentUploadedFileBase64) {
                    patient.solicitudInforme = window.currentUploadedFileBase64;
                } else {
                    patient.solicitudInforme = "";
                }

                // Save images safely
                const img01Cont = document.getElementById('re_img01PreviewContainer');
                const img01Prev = document.getElementById('re_img01Preview');
                if (img01Cont && img01Cont.style.display !== 'none' && img01Prev) {
                    patient.img01 = img01Prev.src;
                } else {
                    patient.img01 = "";
                }

                const img02Cont = document.getElementById('re_img02PreviewContainer');
                const img02Prev = document.getElementById('re_img02Preview');
                if (img02Cont && img02Cont.style.display !== 'none' && img02Prev) {
                    patient.img02 = img02Prev.src;
                } else {
                    patient.img02 = "";
                }

                if (originalCodAtencion && originalCodAtencion !== patient.codAtencion) {
                    if (typeof window.deletePatient === 'function') {
                        window.deletePatient(originalCodAtencion);
                    } else {
                        const oldIdx = patientDatabase.findIndex(x => x.codAtencion === originalCodAtencion);
                        if (oldIdx !== -1) patientDatabase.splice(oldIdx, 1);
                    }
                }

                if (typeof window.savePatient === 'function') {
                    window.savePatient(patient);
                } else {
                    const idx = patientDatabase.findIndex(x => x.codAtencion === patient.codAtencion);
                    if (idx !== -1) {
                        patientDatabase[idx] = patient;
                    } else {
                        patientDatabase.unshift(patient);
                    }
                    if (typeof window.triggerAutomaticBackup === 'function') window.triggerAutomaticBackup();
                    renderTable();
                }

                // Hide modal (Desactivado a petición del usuario para no salir de la pantalla)
                // document.getElementById('reportEditorModalOverlay').classList.remove('active');
                notifyUser("Cambios guardados con éxito en la ficha del paciente", "success");
            }
        });
    }

    // --- TEMPLATE POPULATION AND SELECTION IN EDITOR MODAL ---
    function actualizarPlantillasSegunEspecialidad(tipo, categoriaId) {
        let selectPlan;
        if (tipo === 'macro') selectPlan = document.getElementById('re_planMacro');
        else if (tipo === 'micro') selectPlan = document.getElementById('re_planMicro');
        else if (tipo === 'diag') selectPlan = document.getElementById('re_planDiag');

        if (!selectPlan) return;

        selectPlan.innerHTML = '<option value="">SELECCIONAR PLANTILLA</option>';

        if (!categoriaId) return;

        // Buscar el objeto de categoría actual para obtener su nombre
        const categoryObj = (categoriesDatabase || []).find(c => String(c.id) === String(categoriaId));
        let plantillas = [];
        if (categoryObj) {
            const catName = (categoryObj.categoria || '').trim().toUpperCase();
            // Obtener todas las IDs de categorías que comparten este nombre (ej: macro y micro)
            const matchingCatIds = (categoriesDatabase || [])
                .filter(c => (c.categoria || '').trim().toUpperCase() === catName)
                .map(c => c.id);
            // Filtrar plantillas que pertenecen a cualquiera de estas categorías coincidentes
            plantillas = (templatesDatabase || []).filter(t => matchingCatIds.includes(t.categoryId));
        } else {
            // Fallback por si la categoría no existe en la base de datos
            plantillas = (templatesDatabase || []).filter(t => String(t.categoryId) === String(categoriaId));
        }

        plantillas.forEach(tpl => {
            const opt = document.createElement('option');
            opt.value = tpl.id;
            opt.textContent = tpl.titulo;
            selectPlan.appendChild(opt);
        });
    }
    window.actualizarPlantillasSegunEspecialidad = actualizarPlantillasSegunEspecialidad;

    function populateEditorTemplates(service = 'Q') {
        const catMacro = document.getElementById('re_catMacro');
        const catMicro = document.getElementById('re_catMicro');
        const catDiag = document.getElementById('re_catDiag');

        if (!catMacro || !catMicro || !catDiag) return;

        // Limpiar combos
        [catMacro, catMicro, catDiag].forEach(select => {
            select.innerHTML = '<option value="">SELECCIONAR</option>';
        });

        // Poblar especialidades
        const cats = categoriesDatabase || [];
        cats.forEach(cat => {
            const catName = (cat.categoria || '').trim().toUpperCase();

            // Filtrado según el servicio de la ficha (C = Citología, otros = Quirúrgico/Inmuno)
            if (service === 'C') {
                if (catName !== 'CITOLOGÍA CERVICAL') return;
            } else {
                if (catName === 'CITOLOGÍA CERVICAL') return;
            }

            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.categoria;

            if (cat.tipo === 'Macroscopica') {
                catMacro.appendChild(option.cloneNode(true));
            } else if (cat.tipo === 'Microscopica') {
                catMicro.appendChild(option.cloneNode(true));
                catDiag.appendChild(option.cloneNode(true));
            } else {
                catMacro.appendChild(option.cloneNode(true));
                catMicro.appendChild(option.cloneNode(true));
                catDiag.appendChild(option.cloneNode(true));
            }
        });
    }
    window.populateEditorTemplates = populateEditorTemplates;

    window.insertarPlantilla = function(tipo) {
        if (tipo === 'macro') {
            const selectPlan = document.getElementById('re_planMacro');
            if (!selectPlan) return;
            const plantillaId = selectPlan.value;
            if (!plantillaId) {
                showToast('Seleccione una plantilla primero', 'error');
                return;
            }
            const plantilla = templatesDatabase.find(t => String(t.id) === String(plantillaId));
            if (!plantilla) return;
            let textoAInsertar = plantilla.macro || '';
            if (!textoAInsertar) {
                showToast('La plantilla no tiene contenido macroscópico', 'warning');
                return;
            }
            textoAInsertar = fixMedicalCapitalization(textoAInsertar);
            const textarea = document.getElementById('re_macroDesc');
            if (textarea) {
                let formattedHtml = textoAInsertar.replace(/\n/g, '<br>');
                const currentContent = textarea.innerHTML.trim();
                if (currentContent === '' || currentContent === '<br>') {
                    textarea.innerHTML = formattedHtml;
                } else {
                    textarea.innerHTML = currentContent + "<br><br>" + formattedHtml;
                }
                showToast('Plantilla macroscópica insertada', 'success');
            }
        } 
        else if (tipo === 'micro') {
            const selectPlan = document.getElementById('re_planMicro');
            if (!selectPlan) return;
            const plantillaId = selectPlan.value;
            if (!plantillaId) {
                showToast('Seleccione una plantilla primero', 'error');
                return;
            }
            const plantilla = templatesDatabase.find(t => String(t.id) === String(plantillaId));
            if (!plantilla) return;

            let microText = plantilla.micro || '';
            let diagText = plantilla.diag || '';

            if (!microText && !diagText) {
                showToast('La plantilla no tiene contenido en esta sección', 'warning');
                return;
            }

            let insertedSomething = false;

            if (microText) {
                microText = fixMedicalCapitalization(microText);
                const textareaMicro = document.getElementById('re_microDesc');
                if (textareaMicro) {
                    let formattedHtml = microText.replace(/\n/g, '<br>');
                    const currentContent = textareaMicro.innerHTML.trim();
                    if (currentContent === '' || currentContent === '<br>') {
                        textareaMicro.innerHTML = formattedHtml;
                    } else {
                        textareaMicro.innerHTML = currentContent + "<br><br>" + formattedHtml;
                    }
                    insertedSomething = true;
                }
            }

            if (diagText) {
                diagText = diagText.toUpperCase();
                const textareaDiag = document.getElementById('re_diagnostico');
                if (textareaDiag) {
                    let formattedHtml = `<b>${diagText.replace(/\n/g, '<br>')}</b>`;
                    const currentContent = textareaDiag.innerHTML.trim();
                    if (currentContent === '' || currentContent === '<br>') {
                        textareaDiag.innerHTML = formattedHtml;
                    } else {
                        textareaDiag.innerHTML = currentContent + "<br><br>" + formattedHtml;
                    }
                    insertedSomething = true;
                }
            }

            if (insertedSomething) {
                showToast('Plantilla microscópica y diagnóstico insertados', 'success');
            }
        } 
        else if (tipo === 'diag') {
            const selectPlan = document.getElementById('re_planDiag');
            if (!selectPlan) return;
            const plantillaId = selectPlan.value;
            if (!plantillaId) {
                showToast('Seleccione una plantilla primero', 'error');
                return;
            }
            const plantilla = templatesDatabase.find(t => String(t.id) === String(plantillaId));
            if (!plantilla) return;
            let textoAInsertar = plantilla.diag || '';
            if (!textoAInsertar) {
                showToast('La plantilla no tiene contenido diagnóstico', 'warning');
                return;
            }
            textoAInsertar = textoAInsertar.toUpperCase();
            const textarea = document.getElementById('re_diagnostico');
            if (textarea) {
                let formattedHtml = `<b>${textoAInsertar.replace(/\n/g, '<br>')}</b>`;
                const currentContent = textarea.innerHTML.trim();
                if (currentContent === '' || currentContent === '<br>') {
                    textarea.innerHTML = formattedHtml;
                } else {
                    textarea.innerHTML = currentContent + "<br><br>" + formattedHtml;
                }
                showToast('Plantilla de diagnóstico insertada', 'success');
            }
        }
    };

    const catMacro = document.getElementById('re_catMacro');
    const catMicro = document.getElementById('re_catMicro');
    const catDiag = document.getElementById('re_catDiag');

    if (catMacro) catMacro.addEventListener('change', (e) => actualizarPlantillasSegunEspecialidad('macro', e.target.value));
    if (catMicro) catMicro.addEventListener('change', (e) => actualizarPlantillasSegunEspecialidad('micro', e.target.value));
    if (catDiag) catDiag.addEventListener('change', (e) => actualizarPlantillasSegunEspecialidad('diag', e.target.value));
    
    populateEditorTemplates();

    // --- LOGICA DE CREACION RAPIDA DE PLANTILLAS ---
    const btnCrearPlantilla = document.getElementById('re_btnCrearPlantilla');
    const fastTemplateModal = document.getElementById('fastTemplateModal');
    const btnCloseFastTemplate = document.getElementById('btnCloseFastTemplate');
    const btnCancelFastTemplate = document.getElementById('btnCancelFastTemplate');
    const btnSaveFastTemplate = document.getElementById('btnSaveFastTemplate');
    const fastTemplateTitle = document.getElementById('fastTemplateTitle');
    const fastTemplateCategory = document.getElementById('fastTemplateCategory');

    if (btnCrearPlantilla && fastTemplateModal) {
        function openFastTemplateModal() {
            // Poblar especialidades
            fastTemplateCategory.innerHTML = '<option value="">Seleccione una especialidad</option>';
            const cats = categoriesDatabase || [];
            // Agrupar únicas por su nombre de categoría
            const unicas = [...new Set(cats.map(c => c.categoria))].sort();
            unicas.forEach(catName => {
                const catObj = cats.find(c => c.categoria === catName);
                if (catObj) {
                    const option = document.createElement('option');
                    option.value = catObj.id;
                    option.textContent = catName;
                    fastTemplateCategory.appendChild(option);
                }
            });

            fastTemplateTitle.value = '';
            fastTemplateModal.classList.add('active');
        }

        function closeFastTemplateModal() {
            fastTemplateModal.classList.remove('active');
        }

        btnCrearPlantilla.addEventListener('click', openFastTemplateModal);
        if (btnCloseFastTemplate) btnCloseFastTemplate.addEventListener('click', closeFastTemplateModal);
        if (btnCancelFastTemplate) btnCancelFastTemplate.addEventListener('click', closeFastTemplateModal);

        if (btnSaveFastTemplate) {
            btnSaveFastTemplate.addEventListener('click', () => {
                console.log("[TemplateSave] Botón clickeado");
                const titulo = fastTemplateTitle.value.trim().toUpperCase();
                const categoryId = fastTemplateCategory.value;
                console.log("[TemplateSave] Datos modal:", { titulo, categoryId });

                if (!titulo || !categoryId) {
                    showToast('Por favor, ingrese un nombre y seleccione una especialidad.', 'warning');
                    return;
                }

                const macro = document.getElementById('re_macroDesc') ? fixMedicalCapitalization(document.getElementById('re_macroDesc').innerHTML.trim()) : '';
                const micro = document.getElementById('re_microDesc') ? fixMedicalCapitalization(document.getElementById('re_microDesc').innerHTML.trim()) : '';
                const diag = document.getElementById('re_diagnostico') ? document.getElementById('re_diagnostico').innerHTML.trim() : '';
                console.log("[TemplateSave] Textos:", { macro, micro, diag });

                if (!macro && !micro && !diag) {
                    showToast('Los campos de la plantilla están vacíos.', 'warning');
                    return;
                }

                // Guardar usando la función encapsulada de db_service
                const newTemplate = addTemplateToDatabase({
                    categoryId: parseInt(categoryId),
                    titulo: titulo,
                    macro: macro,
                    micro: micro,
                    diag: diag
                });

                console.log("[TemplateSave] Guardado con éxito:", newTemplate);
                showToast('Plantilla creada con éxito.', 'success');

                // Si el gestor de plantillas está abierto o tiene la vista tree, refrescarla
                if (typeof window.poblarComboEspecialidades === 'function') window.poblarComboEspecialidades();
                if (typeof window.renderTemplatesTreeView === 'function') window.renderTemplatesTreeView();
                
                // Recargar las plantillas en el editor de reportes
                populateEditorTemplates();

                // Forzar la actualización inmediata de los combos del editor según especialidad seleccionada
                const catMacroVal = document.getElementById('re_catMacro') ? document.getElementById('re_catMacro').value : '';
                const catMicroVal = document.getElementById('re_catMicro') ? document.getElementById('re_catMicro').value : '';
                const catDiagVal = document.getElementById('re_catDiag') ? document.getElementById('re_catDiag').value : '';

                actualizarPlantillasSegunEspecialidad('macro', catMacroVal);
                actualizarPlantillasSegunEspecialidad('micro', catMicroVal);
                actualizarPlantillasSegunEspecialidad('diag', catDiagVal);

                 closeFastTemplateModal();
            });
        }
    }

    // Event listeners to toggle lock state on code, reception date, and delivery date
    const setupLockToggle = (inputId, buttonId) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                const input = document.getElementById(inputId);
                if (input) {
                    const currentlyLocked = input.readOnly;
                    setFieldLockState(inputId, buttonId, !currentlyLocked);
                }
            });
        }
    };
    setupLockToggle('re_codAtencion', 're_btnUnlockCode');

    // Auto-calculate probable delivery date (Recepción + 5 days) when Reception Date changes
    const fecIngresoInput = document.getElementById('re_fecIngreso');
    if (fecIngresoInput) {
        fecIngresoInput.addEventListener('change', () => {
            const val = fecIngresoInput.value;
            if (val) {
                const d = new Date(val + 'T00:00:00');
                if (!isNaN(d.getTime())) {
                    d.setDate(d.getDate() + 5);
                    const probableInput = document.getElementById('re_fecProbable');
                    if (probableInput) {
                        probableInput.value = d.toISOString().split('T')[0];
                    }
                }
            }
        });
    }
}

export function formatEditorText(elementId, command, value = null) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.focus();
    
    if (command === 'bold') {
        document.execCommand('bold', false, null);
    } else if (command === 'italic') {
        document.execCommand('italic', false, null);
    } else if (command === 'underline') {
        document.execCommand('underline', false, null);
    } else if (command === 'uppercase') {
        const selection = window.getSelection();
        if (selection.rangeCount && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const text = range.toString();
            const replacement = text === text.toUpperCase() ? text.toLowerCase() : text.toUpperCase();
            range.deleteContents();
            range.insertNode(document.createTextNode(replacement));
        } else {
            const text = el.innerText;
            el.innerText = text === text.toUpperCase() ? text.toLowerCase() : text.toUpperCase();
        }
    } else if (command === 'left') {
        document.execCommand('justifyLeft', false, null);
    } else if (command === 'center') {
        document.execCommand('justifyCenter', false, null);
    } else if (command === 'right') {
        document.execCommand('justifyRight', false, null);
    } else if (command === 'justify') {
        document.execCommand('justifyFull', false, null);
    } else if (command === 'list') {
        document.execCommand('insertUnorderedList', false, null);
    } else if (command === 'number-list') {
        document.execCommand('insertOrderedList', false, null);
    } else if (command === 'font') {
        document.execCommand('fontName', false, value);
    } else if (command === 'size') {
        const selection = window.getSelection();
        if (selection.rangeCount && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.fontSize = value;
            range.surroundContents(span);
        }
    }
}
window.formatEditorText = formatEditorText;

window.runGlobalAutocorrect = async function() {
    const fields = ['re_macroDesc', 're_microDesc', 're_diagnostico'];
    let modificationsCount = 0;
    const isOnline = navigator.onLine;
    let modeUsed = isOnline ? 'Nube' : 'Local';

    function walkTextNodes(node, textNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.nodeValue.trim() !== '') {
                textNodes.push(node);
            }
        } else {
            for (let child of Array.from(node.childNodes)) {
                walkTextNodes(child, textNodes);
            }
        }
    }

    async function processTextWithLanguageTool(text) {
        try {
            const response = await fetch('https://api.languagetoolplus.com/v2/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ text: text, language: 'es' })
            });
            if (!response.ok) throw new Error('LanguageTool API error');
            const data = await response.json();
            
            if (!data.matches || data.matches.length === 0) {
                return { text, modified: false };
            }
            
            let newText = text;
            let modified = false;
            
            // Ordenar matches por offset de forma ascendente
            data.matches.sort((a, b) => a.offset - b.offset);
            
            // Aplicar desde atrás hacia adelante
            for (let i = data.matches.length - 1; i >= 0; i--) {
                const match = data.matches[i];
                if (match.replacements && match.replacements.length > 0) {
                    const repl = match.replacements[0].value;
                    newText = newText.substring(0, match.offset) + repl + newText.substring(match.offset + match.length);
                    modified = true;
                    modificationsCount++;
                }
            }
            return { text: newText, modified };
        } catch (e) {
            console.warn('Fallo en LanguageTool, usando cleanTextContentLocal', e);
            modeUsed = 'Respaldo Local';
            const localClean = cleanTextContentLocal(text);
            if (localClean !== text) modificationsCount++;
            return { text: localClean, modified: localClean !== text };
        }
    }

    const tasks = [];

    for (let fieldId of fields) {
        const el = document.getElementById(fieldId);
        if (!el) continue;
        
        const textNodes = [];
        walkTextNodes(el, textNodes);
        
        for (let node of textNodes) {
            const originalText = node.nodeValue;
            if (isOnline) {
                tasks.push((async () => {
                    const result = await processTextWithLanguageTool(originalText);
                    if (result.modified) {
                        node.nodeValue = result.text;
                    }
                })());
            } else {
                const localClean = cleanTextContentLocal(originalText);
                if (localClean !== originalText) {
                    node.nodeValue = localClean;
                    modificationsCount++;
                }
            }
        }
    }

    if (tasks.length > 0) {
        notifyUser('Autocorrigiendo con la Nube...', 'info');
        await Promise.all(tasks);
    }

    notifyUser(`Autocorrección completada. Modo: ${modeUsed}. Correcciones aplicadas: ${modificationsCount}`, 'success');
};

