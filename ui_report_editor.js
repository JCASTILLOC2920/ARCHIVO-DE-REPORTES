import { patientDatabase, doctorsDatabase, triggerAutomaticBackup } from './db_service.js?v=3.2';
import { renderTable } from './ui_tables.js?v=3.2';
import { populateModalDoctorsSelect } from './ui_admin.js?v=3.2';

const supabase = window.supabase;
const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined');

function mapPatientToDb(record) {
    return {
        cod_atencion: record.codAtencion,
        dni: record.dni,
        nombres: record.nombres,
        apellidos: record.apellidos,
        paciente: record.paciente,
        sexo: record.sexo,
        edad: record.edad,
        telefono: record.telefono,
        fecha_contacto: record.fContacto,
        telef_contacto: record.telContacto,
        medico_solicitante: record.medSolicitante,
        motivo_estudio: record.motivoEstudio,
        especimen: record.especimen,
        doctor: record.doctor,
        casetes: record.casetes,
        diagnostico: record.diagnostico,
        cat_macro: record.catMacro,
        plan_macro: record.planMacro,
        macro_desc: record.macroDesc,
        cat_micro: record.catMicro,
        plan_micro: record.planMicro,
        micro_desc: record.microDesc,
        fecha_registro: record.fecRegistro,
        fecha_entrega: record.fecEntrega,
        img01: record.img01 || null,
        img02: record.img02 || null
    };
}

export let editingCodAtencion = null;
export let originalCodAtencion = null;

export function populateEditorModal(codAtencion) {
    const patient = patientDatabase.find(x => x.codAtencion === codAtencion);
    if (!patient) {
        if (typeof showToast === 'function') showToast(`No se encontró el registro ${codAtencion}.`, 'error');
        return false;
    }
    
    editingCodAtencion = codAtencion;
    originalCodAtencion = codAtencion;

    // Helper safely sets values
    const safeSet = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val !== undefined && val !== null ? val : "";
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
    
    safeSet('re_edad', patient.edad || 66);
    safeSet('re_telefono', patient.telefono || "987654321");
    safeSet('re_fContacto', patient.fContacto || "0");
    safeSet('re_telContacto', patient.telContacto || "0");
    safeSet('re_medSolicitante', patient.medSolicitante || "");
    safeSet('re_motivoEstudio', patient.motivoEstudio || patient.especimen || "MORCELADOS DE PRÓSTATA");
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
    safeSet('re_catMacro', patient.catMacro || "");
    safeSet('re_planMacro', patient.planMacro || "");
    safeSet('re_macroDesc', patient.macroDesc || "");
    safeSet('re_catMicro', patient.catMicro || "");
    safeSet('re_planMicro', patient.planMicro || "");
    safeSet('re_microDesc', patient.microDesc || "");

    // Clear files
    const filesTableBody = document.getElementById('re_filesTableBody');
    if (filesTableBody) filesTableBody.innerHTML = `<tr><td class="empty-table-cell">No hay información solicitada</td></tr>`;
    
    if (window.currentUploadedFileUrl) {
        URL.revokeObjectURL(window.currentUploadedFileUrl);
        window.currentUploadedFileUrl = null;
    }
    
    const fileStatus = document.getElementById('re_fileStatus');
    if (fileStatus) fileStatus.textContent = "Sin archivos seleccionados";
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
                if (window.currentUploadedFileUrl) {
                    URL.revokeObjectURL(window.currentUploadedFileUrl);
                }
                window.currentUploadedFileUrl = URL.createObjectURL(file);
                showToast("Solicitud de informe cargada con éxito", "success");
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
            if (typeof showToast === 'function') showToast(`Médico "${normalizedDoc}" registrado e ingresado con éxito.`, 'success');
        });
    }

    // Salir del editor
    const reBtnSalir = document.getElementById('re_btnSalir');
    if (reBtnSalir) {
        reBtnSalir.addEventListener('click', () => {
            document.getElementById('reportEditorModalOverlay').classList.remove('active');
        });
    }

    
    function getTempPatientFromEditor() {
        const selectedSexo = document.getElementById('re_sexo').value;
        const currentPatient = patientDatabase.find(x => x.codAtencion === editingCodAtencion);
        let img01 = '';
        let img02 = '';
        if (document.getElementById('re_img01PreviewContainer').style.display !== 'none') {
            img01 = document.getElementById('re_img01Preview').src;
        }
        if (document.getElementById('re_img02PreviewContainer').style.display !== 'none') {
            img02 = document.getElementById('re_img02Preview').src;
        }
        return {
            codAtencion: document.getElementById('re_codAtencion').value.trim(),
            dni: document.getElementById('re_dni').value,
            sexo: selectedSexo === 'MASCULINO' ? 'M' : (selectedSexo === 'FEMENINO' ? 'F' : 'O'),
            nombres: document.getElementById('re_nomPaciente').value,
            apellidos: document.getElementById('re_apePaciente').value,
            paciente: `${document.getElementById('re_apePaciente').value}, ${document.getElementById('re_nomPaciente').value}`,
            edad: parseInt(document.getElementById('re_edad').value) || 0,
            telefono: document.getElementById('re_telefono').value,
            fContacto: document.getElementById('re_fContacto').value,
            telContacto: document.getElementById('re_telContacto').value,
            medSolicitante: document.getElementById('re_medSolicitante').value,
            motivoEstudio: document.getElementById('re_motivoEstudio').value,
            especimen: document.getElementById('re_motivoEstudio').value,
            doctor: document.getElementById('re_doctor').value,
            casetes: parseInt(document.getElementById('re_casetes').value) || 1,
            diagnostico: document.getElementById('re_diagnostico').value,
            catMacro: document.getElementById('re_catMacro').value,
            planMacro: document.getElementById('re_planMacro').value,
            macroDesc: document.getElementById('re_macroDesc').value,
            microDesc: document.getElementById('re_microDesc').value,
            fecRegistro: document.getElementById('re_fecIngreso').value,
            fecEntrega: document.getElementById('re_fecEntregaReal').value,
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
            if (!fecEntregaInput.value) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                fecEntregaInput.value = `${yyyy}-${mm}-${dd}`;
            }
            const tempPatient = getTempPatientFromEditor();
            localStorage.setItem('printPatientData', JSON.stringify(tempPatient));
            window.open('imprimir.html?autoDownload=true', '_blank', 'width=950,height=1000');
        });
    }

    // Vista Previa button
    const reBtnPreview = document.getElementById('re_btnPreview');
    if (reBtnPreview) {
        reBtnPreview.addEventListener('click', () => {
            const tempPatient = getTempPatientFromEditor();
            localStorage.setItem('printPatientData', JSON.stringify(tempPatient));
            window.open('imprimir.html?autoDownload=false', '_blank', 'width=950,height=1000');
        });
    }


    // Guardar cambios del editor
    const reBtnGuardar = document.getElementById('re_btnGuardar');
    if (reBtnGuardar) {
        reBtnGuardar.addEventListener('click', () => {
            const patient = patientDatabase.find(x => x.codAtencion === editingCodAtencion);
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
                    if (originalCodAtencion && originalCodAtencion !== patient.codAtencion) {
                        supabase
                            .from('pacientes')
                            .update(dbRecord)
                            .eq('cod_atencion', originalCodAtencion)
                            .then(({ error }) => {
                                if (error) {
                                    console.error("Error al actualizar reporte en Supabase:", error);
                                    showToast("Error al guardar en la nube.", "error");
                                } else {
                                    showToast("Reporte actualizado en la nube con éxito.", "success");
                                }
                            });
                    } else {
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
                }

                // BACKUP AUTOMÁTICO (Automatización)
                if (typeof window.triggerAutomaticBackup === 'function') window.triggerAutomaticBackup();

                // Re-render table
                renderTable();

                // Hide modal (Desactivado a petición del usuario para no salir de la pantalla)
                // document.getElementById('reportEditorModalOverlay').classList.remove('active');
                showToast("Cambios guardados con éxito en la ficha del paciente", "success");
            }
        });
    }
}
