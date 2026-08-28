import { patientDatabase, doctorsDatabase, triggerAutomaticBackup, categoriesDatabase, templatesDatabase, addTemplateToDatabase, mapPatientToDb, savePatient, deletePatient, cleanTextContentLocal } from './db_service.js?v=5.01';
import { renderTable, applyFilters } from './ui_tables.js?v=5.01';
import { populateModalDoctorsSelect } from './ui_admin.js?v=5.01';
import { closeModal } from './ui_editor.js?v=5.01';
import { synopticSchemas, compileSynopticReport } from './synoptic_schemas.js?v=5.01';


window.savePatient = savePatient;
window.deletePatient = deletePatient;

let editingCodAtencion = null;
let cropper01 = null;
let cropper02 = null;
let originalImg01Src = null;
let originalImg02Src = null;

// VARIABLES Y FUNCIONES DEL ASISTENTE SINÓPTICO INTERACTIVO
let activeSynopticState = {};
let activeSynopticSchemaId = null;

function switchEditorTab(tabId) {
    const reTabButtons = document.querySelectorAll('.tab-header-btn');
    reTabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.click();
        }
    });
}

function checkAndSetupSynopticAssistant(templateName) {
    const tabBtn = document.getElementById('re_tabBtnSynoptic');
    if (!tabBtn) return;

    const nameUpper = String(templateName || "").toUpperCase();
    if (nameUpper.includes("PROSTATA") || nameUpper.includes("PRÓSTATA") || nameUpper.includes("RTUP") || nameUpper.includes("TURP")) {
        activeSynopticSchemaId = "prostate_turp";
        activeSynopticState = {};
        tabBtn.style.display = "inline-block";
        renderSynopticForm("prostate_turp");
    } else if (nameUpper.includes("FILODES") || nameUpper.includes("PHYLLODES")) {
        activeSynopticSchemaId = "breast_phyllodes";
        activeSynopticState = {};
        tabBtn.style.display = "inline-block";
        renderSynopticForm("breast_phyllodes");
    } else if (nameUpper.includes("INVASIVO") || nameUpper.includes("INVASIVE")) {
        activeSynopticSchemaId = "breast_invasive_carcinoma";
        activeSynopticState = {};
        tabBtn.style.display = "inline-block";
        renderSynopticForm("breast_invasive_carcinoma");
    } else if (nameUpper.includes("ESOFAGO") || nameUpper.includes("ESÓFAGO") || nameUpper.includes("ESOPHAGUS")) {
        activeSynopticSchemaId = "esophagus";
        activeSynopticState = {};
        tabBtn.style.display = "inline-block";
        renderSynopticForm("esophagus");
    } else if (nameUpper.includes("APENDICE") || nameUpper.includes("APÉNDICE") || nameUpper.includes("APPENDIX")) {
        activeSynopticSchemaId = "appendix";
        activeSynopticState = {};
        tabBtn.style.display = "inline-block";
        renderSynopticForm("appendix");
    } else {
        tabBtn.style.display = "none";
        activeSynopticSchemaId = null;
        if (tabBtn.classList.contains('active')) {
            switchEditorTab('tab_descrip');
        }
    }
}

function renderSynopticForm(schemaId) {
    const schema = synopticSchemas[schemaId];
    const container = document.getElementById("synopticFormContainer");
    if (!schema || !container) return;

    activeSynopticSchemaId = schemaId;
    container.innerHTML = "";

    schema.sections.forEach(section => {
        const secDiv = document.createElement("div");
        secDiv.style.marginBottom = "20px";
        secDiv.style.borderBottom = "1px solid var(--border-color)";
        secDiv.style.paddingBottom = "15px";

        const secTitle = document.createElement("h4");
        secTitle.style.margin = "0 0 10px 0";
        secTitle.style.color = "var(--text-primary)";
        secTitle.style.fontSize = "0.95rem";
        secTitle.style.borderLeft = "3px solid #3b82f6";
        secTitle.style.paddingLeft = "8px";
        secTitle.textContent = section.name;
        secDiv.appendChild(secTitle);

        section.fields.forEach(field => {
            const fieldDiv = document.createElement("div");
            fieldDiv.id = `field_container_${field.id}`;
            fieldDiv.style.marginBottom = "12px";
            fieldDiv.style.display = "flex";
            fieldDiv.style.flexDirection = "column";
            fieldDiv.style.gap = "4px";

            if (field.dependsOn) {
                fieldDiv.style.display = "none";
            }

            const label = document.createElement("label");
            label.style.fontWeight = "600";
            label.style.fontSize = "0.85rem";
            label.style.color = "var(--text-secondary)";
            label.textContent = field.label;
            fieldDiv.appendChild(label);

            if (field.type === "radio") {
                const groupContainer = document.createElement("div");
                groupContainer.style.display = "flex";
                groupContainer.style.flexDirection = "column";
                groupContainer.style.gap = "6px";
                groupContainer.style.paddingLeft = "5px";

                field.options.forEach(opt => {
                    const optLabel = document.createElement("label");
                    optLabel.style.display = "flex";
                    optLabel.style.alignItems = "center";
                    optLabel.style.gap = "6px";
                    optLabel.style.fontSize = "0.8rem";
                    optLabel.style.cursor = "pointer";

                    const radio = document.createElement("input");
                    radio.type = "radio";
                    radio.name = field.id;
                    radio.value = opt.value;
                    radio.checked = activeSynopticState[field.id] === opt.value;
                    radio.addEventListener("change", (e) => {
                        activeSynopticState[field.id] = e.target.value;
                        handleDependencies();
                        updateCompiledPreview();
                    });

                    optLabel.appendChild(radio);
                    optLabel.appendChild(document.createTextNode(opt.label));

                    if (opt.hasInput) {
                        const extraInput = document.createElement("input");
                        extraInput.type = "text";
                        extraInput.className = "editor-input";
                        extraInput.style.marginLeft = "10px";
                        extraInput.style.padding = "2px 5px";
                        extraInput.style.fontSize = "0.8rem";
                        extraInput.style.display = activeSynopticState[field.id] === opt.value ? "inline-block" : "none";
                        extraInput.value = activeSynopticState[`${field.id}_extra`] || "";
                        extraInput.addEventListener("input", (e) => {
                            activeSynopticState[`${field.id}_extra`] = e.target.value;
                            updateCompiledPreview();
                        });
                        optLabel.appendChild(extraInput);

                        radio.addEventListener("change", (e) => {
                            extraInput.style.display = e.target.checked ? "inline-block" : "none";
                        });
                    }

                    groupContainer.appendChild(optLabel);
                });

                fieldDiv.appendChild(groupContainer);

            } else if (field.type === "select") {
                const select = document.createElement("select");
                select.className = "editor-select";
                select.style.fontSize = "0.8rem";
                select.style.padding = "4px 8px";

                const defaultOpt = document.createElement("option");
                defaultOpt.value = "";
                defaultOpt.textContent = "SELECCIONAR...";
                select.appendChild(defaultOpt);

                field.options.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt.value;
                    option.textContent = opt.label;
                    option.selected = activeSynopticState[field.id] === opt.value;
                    select.appendChild(option);
                });

                select.addEventListener("change", (e) => {
                    activeSynopticState[field.id] = e.target.value;
                    handleDependencies();
                    updateCompiledPreview();
                });

                fieldDiv.appendChild(select);

                const hasInputOption = field.options.find(o => o.hasInput);
                if (hasInputOption) {
                    const extraInput = document.createElement("input");
                    extraInput.type = "text";
                    extraInput.className = "editor-input";
                    extraInput.style.marginTop = "5px";
                    extraInput.style.padding = "4px 8px";
                    extraInput.style.fontSize = "0.8rem";
                    extraInput.style.display = activeSynopticState[field.id] === hasInputOption.value ? "block" : "none";
                    extraInput.placeholder = "Especificar...";
                    extraInput.value = activeSynopticState[`${field.id}_extra`] || "";
                    extraInput.addEventListener("input", (e) => {
                        activeSynopticState[`${field.id}_extra`] = e.target.value;
                        updateCompiledPreview();
                    });
                    fieldDiv.appendChild(extraInput);

                    select.addEventListener("change", (e) => {
                        extraInput.style.display = e.target.value === hasInputOption.value ? "block" : "none";
                    });
                }

            } else if (field.type === "checkbox") {
                const groupContainer = document.createElement("div");
                groupContainer.style.display = "flex";
                groupContainer.style.flexDirection = "column";
                groupContainer.style.gap = "6px";
                groupContainer.style.paddingLeft = "5px";

                if (!Array.isArray(activeSynopticState[field.id])) {
                    activeSynopticState[field.id] = [];
                }

                field.options.forEach(opt => {
                    const optLabel = document.createElement("label");
                    optLabel.style.display = "flex";
                    optLabel.style.alignItems = "center";
                    optLabel.style.gap = "6px";
                    optLabel.style.fontSize = "0.8rem";
                    optLabel.style.cursor = "pointer";

                    const cb = document.createElement("input");
                    cb.type = "checkbox";
                    cb.value = opt.value;
                    cb.checked = activeSynopticState[field.id].includes(opt.value);
                    cb.addEventListener("change", (e) => {
                        let currentList = activeSynopticState[field.id] || [];
                        if (e.target.checked) {
                            if (!currentList.includes(e.target.value)) currentList.push(e.target.value);
                        } else {
                            currentList = currentList.filter(v => v !== e.target.value);
                        }
                        activeSynopticState[field.id] = currentList;
                        updateCompiledPreview();
                    });

                    optLabel.appendChild(cb);
                    optLabel.appendChild(document.createTextNode(opt.label));

                    if (opt.hasInput) {
                        const extraInput = document.createElement("input");
                        extraInput.type = "text";
                        extraInput.className = "editor-input";
                        extraInput.style.marginLeft = "10px";
                        extraInput.style.padding = "2px 5px";
                        extraInput.style.fontSize = "0.8rem";
                        extraInput.style.display = activeSynopticState[field.id].includes(opt.value) ? "inline-block" : "none";
                        extraInput.value = activeSynopticState[`${field.id}_${opt.value}_extra`] || "";
                        extraInput.addEventListener("input", (e) => {
                            activeSynopticState[`${field.id}_${opt.value}_extra`] = e.target.value;
                            updateCompiledPreview();
                        });
                        optLabel.appendChild(extraInput);

                        cb.addEventListener("change", (e) => {
                            extraInput.style.display = e.target.checked ? "inline-block" : "none";
                        });
                    }

                    groupContainer.appendChild(optLabel);
                });

                fieldDiv.appendChild(groupContainer);

            } else if (field.type === "number") {
                const wrapper = document.createElement("div");
                wrapper.style.display = "flex";
                wrapper.style.alignItems = "center";
                wrapper.style.gap = "5px";

                const num = document.createElement("input");
                num.type = "number";
                num.className = "editor-input";
                num.style.fontSize = "0.85rem";
                num.style.padding = "4px 8px";
                num.style.width = "80px";
                num.value = activeSynopticState[field.id] || "";
                num.addEventListener("input", (e) => {
                    activeSynopticState[field.id] = e.target.value;
                    updateCompiledPreview();
                });

                wrapper.appendChild(num);
                if (field.suffix) {
                    const suf = document.createElement("span");
                    suf.style.fontSize = "0.8rem";
                    suf.textContent = field.suffix;
                    wrapper.appendChild(suf);
                }
                fieldDiv.appendChild(wrapper);

            } else if (field.type === "text") {
                const input = document.createElement("input");
                input.type = "text";
                input.className = "editor-input";
                input.style.fontSize = "0.85rem";
                input.style.padding = "4px 8px";
                input.value = activeSynopticState[field.id] || "";
                input.addEventListener("input", (e) => {
                    activeSynopticState[field.id] = e.target.value;
                    updateCompiledPreview();
                });
                fieldDiv.appendChild(input);
            }

            secDiv.appendChild(fieldDiv);
        });

        container.appendChild(secDiv);
    });

    const previewHeader = document.createElement("h4");
    previewHeader.style.margin = "20px 0 10px 0";
    previewHeader.style.color = "var(--text-primary)";
    previewHeader.style.fontSize = "0.9rem";
    previewHeader.textContent = "VISTA PREVIA EN TIEMPO REAL";
    container.appendChild(previewHeader);

    const previewBox = document.createElement("div");
    previewBox.id = "synopticReportPreviewBox";
    previewBox.style.padding = "10px";
    previewBox.style.backgroundColor = "rgba(0,0,0,0.2)";
    previewBox.style.borderRadius = "4px";
    previewBox.style.border = "1px dashed var(--border-color)";
    previewBox.style.fontSize = "0.8rem";
    previewBox.style.color = "#cbd5e1";
    previewBox.style.whiteSpace = "pre-wrap";
    previewBox.style.fontFamily = "monospace";
    previewBox.textContent = "(El reporte está vacío)";
    container.appendChild(previewBox);

    handleDependencies();
    updateCompiledPreview();
}

function handleDependencies() {
    if (!activeSynopticSchemaId) return;
    const schema = synopticSchemas[activeSynopticSchemaId];

    schema.sections.forEach(section => {
        section.fields.forEach(field => {
            if (field.dependsOn) {
                const depVal = activeSynopticState[field.dependsOn.field];
                const containerEl = document.getElementById(`field_container_${field.id}`);
                if (containerEl) {
                    let match = false;
                    if (field.dependsOn.value && depVal === field.dependsOn.value) match = true;
                    if (field.dependsOn.values && field.dependsOn.values.includes(depVal)) match = true;

                    if (match) {
                        containerEl.style.display = "flex";
                    } else {
                        containerEl.style.display = "none";
                        delete activeSynopticState[field.id];
                    }
                }
            }
        });
    });
}

function updateCompiledPreview() {
    const previewBox = document.getElementById("synopticReportPreviewBox");
    if (!previewBox || !activeSynopticSchemaId) return;

    const reportText = compileSynopticReport(activeSynopticSchemaId, activeSynopticState);
    previewBox.innerHTML = reportText ? reportText.replace(/\n/g, "<br>") : "(El reporte está vacío)";
}

export function resetEditorCropperWorkspaces() {
    if (cropper01) {
        try { cropper01.destroy(); } catch (e) {}
        cropper01 = null;
    }
    if (cropper02) {
        try { cropper02.destroy(); } catch (e) {}
        cropper02 = null;
    }

    const ws01 = document.getElementById('re_img01Workspace');
    const act01 = document.getElementById('re_img01Actions');
    const raw01 = document.getElementById('re_img01Raw');
    const input01 = document.getElementById('re_img01Input');
    if (ws01) ws01.style.display = 'none';
    if (act01) act01.style.display = 'none';
    if (raw01) raw01.src = '';
    if (input01) input01.value = '';

    if (window.currentUploadedFileUrl && window.currentUploadedFileUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(window.currentUploadedFileUrl); } catch (e) {}
        window.currentUploadedFileUrl = null;
    }

    const ws02 = document.getElementById('re_img02Workspace');
    const act02 = document.getElementById('re_img02Actions');
    const raw02 = document.getElementById('re_img02Raw');
    const input02 = document.getElementById('re_img02Input');
    if (ws02) ws02.style.display = 'none';
    if (act02) act02.style.display = 'none';
    if (raw02) raw02.src = '';
    if (input02) input02.value = '';
}
let originalCodAtencion = null;

const supabase = window.supabase;
const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');

// DICCIONARIO DE AUTOCORRECCIÓN CLÍNICA (ORTOGRAFÍA Y ACENTOS DETERMINÍSTICOS)
const CLINICAL_SPELLING_DICT = {
    "diagnostico": "diagnóstico",
    "DIAGNOSTICO": "DIAGNÓSTICO",
    "histologico": "histológico",
    "HISTOLOGICO": "HISTOLÓGICO",
    "estomago": "estómago",
    "ESTOMAGO": "ESTÓMAGO",
    "cronica": "crónica",
    "CRONICA": "CRÓNICA",
    "cronico": "crónico",
    "CRONICO": "CRÓNICO",
    "granulacion": "granulación",
    "GRANULACION": "GRANULACIÓN",
    "ulcera": "úlcera",
    "ULCERA": "ÚLCERA",
    "ulcerado": "ulcerado",
    "ulcerada": "ulcerada",
    "ulceracion": "ulceración",
    "ULCERACION": "ULCERACIÓN",
    "atipico": "atípico",
    "ATIPICO": "ATÍPICO",
    "atipica": "atípica",
    "ATIPICA": "ATÍPICA",
    "prostatica": "prostática",
    "PROSTATICA": "PROSTÁTICA",
    "utero": "útero",
    "UTERO": "ÚTERO",
    "cervix": "cérvix",
    "CERVIX": "CÉRVIX",
    "infeccion": "infección",
    "INFECCION": "INFECCIÓN",
    "linfatico": "linfático",
    "LINFATICO": "LINFÁTICO",
    "lesion": "lesión",
    "LESION": "LESIÓN",
    "inflamacion": "inflamación",
    "INFLAMACION": "INFLAMACIÓN",
    "infiltracion": "infiltración",
    "INFILTRACION": "INFILTRACIÓN",
    "lamina": "lámina",
    "LAMINA": "LÁMINA",
    "especimenes": "especímenes",
    "ESPECIMENES": "ESPECÍMENES",
    "polipo": "pólipo",
    "POLIPO": "PÓLIPO",
    "nodulo": "nódulo",
    "NODULO": "NÓDULO",
    "celula": "célula",
    "CELULA": "CÉLULA",
    "celulas": "células",
    "CELULAS": "CÉLULAS",
    "nucleo": "núcleo",
    "NUCLEO": "NÚCLEO",
    "nucleos": "núcleos",
    "NUCLEOS": "NÚCLEOS",
    "glandula": "glándula",
    "GLANDULA": "GLÁNDULA",
    "glandulas": "glándulas",
    "GLANDULAS": "GLÁNDULAS",
    "esofago": "esófago",
    "ESOFAGO": "ESÓFAGO",
    "pilorico": "pilórico",
    "PILORICO": "PILÓRICO",
    "citologia": "citología",
    "CITOLOGIA": "CITOLOGÍA",
    "citologico": "citológico",
    "CITOLOGICO": "CITOLÓGICO",
    "citologica": "citológica",
    "CITOLOGICA": "CITOLÓGICA",
    "reaccion": "reacción",
    "REACCION": "REACCIÓN",
    "evaluacion": "evaluación",
    "EVALUACION": "EVALUACIÓN",
    "observacion": "observación",
    "OBSERVACION": "OBSERVACIÓN",
    "observaciones": "observaciones",
    "OBSERVACIONES": "OBSERVACIONES",
    "Rganismo": "Organismo",
    "rganismo": "organismo",
    "sydney": "Sydney",
    "SYDNEY": "SYDNEY",
    "topografia": "topografía",
    "TOPOGRAFIA": "TOPOGRAFÍA",
    "helicobacter": "Helicobacter",
    "HELICOBACTER": "HELICOBACTER"
};

export function autoCorrectClinicalText(html) {
    if (!html) return '';
    return html.replace(/(<[^>]*>)|([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)/g, (match, p1, p2) => {
        if (p1) return p1; // Preservar etiquetas HTML
        const corrected = CLINICAL_SPELLING_DICT[p2];
        return corrected !== undefined ? corrected : p2;
    });
}

export function fixMedicalCapitalization(text) {
    if (!text) return '';
    text = autoCorrectClinicalText(text);

    // Corregir etiquetas HTML duplicadas o anidadas como <b><b>...</b></b>
    text = text.replace(/<b>\s*<b>/gi, '<b>').replace(/<\/b>\s*<\/b>/gi, '</b>');

    // Corregir errores de tecla Mayús invertida al inicio de frase o al final (ej: "sE INCLUYE MUESTRA..." -> "Se incluye muestra...")
    text = text.replace(/(^|\.\s*|\n+)(sE|sE\s+[A-Z\s]+)/gi, (match, prefix, phrase) => {
        let clean = phrase.toLowerCase().trim();
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        // Formatear casetes al final
        clean = clean.replace(/1 casete/gi, '1 casete').replace(/muestra representativa/gi, 'muestra representativa');
        return prefix + clean;
    });

    // Corregir ortografía de Papanicolaou y Citología Cervical
    const papanicolaouRegex = /\bpapa?ni[co]o?l?[a-z]{0,6}\b/gi;
    text = text.replace(papanicolaouRegex, (match) => {
        if (match === match.toUpperCase()) return 'PAPANICOLAOU';
        if (match === match.toLowerCase()) return 'papanicolaou';
        return 'Papanicolaou';
    });
    
    const citologiaRegex = /\bcito[lgj][iá]a\s+cervical\b/gi;
    text = text.replace(citologiaRegex, (match) => {
        if (match === match.toUpperCase()) return 'CITOLOGÍA CERVICAL';
        if (match.startsWith('C') || match.startsWith('c')) {
            return match[0] === 'C' ? 'Citología cervical' : 'citología cervical';
        }
        return 'citología cervical';
    });

    if (text.includes('<') && text.includes('>')) {
        return text.replace(/(>|\.\s+|^\s*)([a-záéíóúñ])/gi, (match, prefix, char) => {
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
            div.style.backgroundColor = 'var(--bg-readonly)';
            div.style.cursor = 'not-allowed';
        } else {
            div.style.backgroundColor = 'var(--bg-general)';
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
    resetEditorCropperWorkspaces();
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

    let s = patient.sexo || "";
    if (!s || s.trim() === '') {
        const esp = String(patient.especimen || "").toUpperCase();
        if (esp.includes('ENDOMETR') || esp.includes('UTER') || esp.includes('CERVIX') || esp.includes('CUELLO') || esp.includes('OVARIO') || esp.includes('MAMA') || esp.includes('PAP') || esp.includes('VAGIN') || esp.includes('PLACENT')) {
            s = 'FEMENINO';
        } else if (esp.includes('PROSTAT') || esp.includes('TESTICUL') || esp.includes('PENE') || esp.includes('ESCROT') || esp.includes('SEMINAL')) {
            s = 'MASCULINO';
        } else {
            s = 'MASCULINO';
        }
    }
    safeSet('re_sexo', (s === 'M' || s === 'MASCULINO') ? 'MASCULINO' : ((s === 'F' || s === 'FEMENINO') ? 'FEMENINO' : 'MASCULINO'));
    
    const finalEdadDisplay = (patient.edad !== undefined && patient.edad !== null && String(patient.edad).trim() !== '' && String(patient.edad).trim() !== '0') ? String(patient.edad).trim() : '--';
    safeSet('re_edad', finalEdadDisplay);
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
    safeSet('re_clinica', patient.clinica || "");
    safeSet('re_diagnostico', patient.diagnostico || "");
    // Populate templates dynamically according to patient's service
    if (typeof window.populateEditorTemplates === 'function') {
        window.populateEditorTemplates(patient.service || 'Q');
    }
    
    // Auto-detectar especialidades según el órgano / espécimen si vienen vacías
    const especimenText = String(patient.especimen || patient.telContacto || '').toUpperCase();
    let defaultCatMacroId = patient.catMacro || "";
    let defaultCatMicroId = patient.catMicro || "";

    if (!defaultCatMacroId || !defaultCatMicroId) {
        if (especimenText.includes('VESICUL') || especimenText.includes('VESÍCUL') || especimenText.includes('COLECIST')) {
            defaultCatMacroId = defaultCatMacroId || "23";
            defaultCatMicroId = defaultCatMicroId || "24";
        } else if (especimenText.includes('APENDIC') || especimenText.includes('APÉNDIC')) {
            defaultCatMacroId = defaultCatMacroId || "22";
            defaultCatMicroId = defaultCatMicroId || "13";
        } else if (especimenText.includes('PROSTAT') || especimenText.includes('PRÓSTAT') || especimenText.includes('RTUP') || especimenText.includes('TURP')) {
            defaultCatMacroId = defaultCatMacroId || "9";
            defaultCatMicroId = defaultCatMicroId || "25";
        } else if (especimenText.includes('GASTR') || especimenText.includes('ESTOMAG') || especimenText.includes('ESTÓMAG')) {
            defaultCatMacroId = defaultCatMacroId || "3";
            defaultCatMicroId = defaultCatMicroId || "17";
        } else if (especimenText.includes('CERVIX') || especimenText.includes('CÉRVIZ') || especimenText.includes('ENDOMETR') || especimenText.includes('UTER') || especimenText.includes('CUELLO')) {
            defaultCatMacroId = defaultCatMacroId || "4";
            defaultCatMicroId = defaultCatMicroId || "18";
        } else if (especimenText.includes('PAP') || especimenText.includes('CITOLOG')) {
            defaultCatMacroId = defaultCatMacroId || "28";
            defaultCatMicroId = defaultCatMicroId || "29";
        }
    }

    safeSet('re_catMacro', defaultCatMacroId);
    if (typeof window.actualizarPlantillasSegunEspecialidad === 'function') {
        window.actualizarPlantillasSegunEspecialidad('macro', defaultCatMacroId);
    }
    safeSet('re_planMacro', patient.planMacro || "");
    safeSet('re_macroDesc', patient.macroDesc || "");
    
    safeSet('re_catMicro', defaultCatMicroId);
    safeSet('re_catDiag', defaultCatMicroId);
    if (typeof window.actualizarPlantillasSegunEspecialidad === 'function') {
        window.actualizarPlantillasSegunEspecialidad('micro', defaultCatMicroId);
        window.actualizarPlantillasSegunEspecialidad('diag', defaultCatMicroId);
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
        const rawImg = document.getElementById(`re_${id}Raw`);
        const workspace = document.getElementById(`re_${id}Workspace`);
        const actions = document.getElementById(`re_${id}Actions`);

        if (workspace) workspace.style.display = 'none';
        if (actions) actions.style.display = 'none';
        if (rawImg) rawImg.src = '';

        if (src && String(src).trim() !== '' && preview && previewContainer) {
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
    originalImg01Src = patient.img01 || '';
    originalImg02Src = patient.img02 || '';

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isClinic = currentUser && currentUser.perfil === 'Usuario';
    setEditorReadOnlyState(isClinic);

    const spec = patient.especimen || "";
    checkAndSetupSynopticAssistant(spec);

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
            const targetPane = document.getElementById(tabId);
            if (targetPane) targetPane.classList.add('active');

            // Refrescar y recalcular lienzo de Cropper al alternar a pestañas de imagen
            setTimeout(() => {
                if (tabId === 'tab_img01' && miniCropperInstances['img01']) {
                    try { miniCropperInstances['img01'].resize(); } catch(e){}
                } else if (tabId === 'tab_img02' && miniCropperInstances['img02']) {
                    try { miniCropperInstances['img02'].resize(); } catch(e){}
                }
            }, 100);
        });
    });

    const btnCopiar = document.getElementById("btnCopiarSynoptic");
    if (btnCopiar) {
        btnCopiar.onclick = () => {
            if (!activeSynopticSchemaId) return;
            const schema = synopticSchemas[activeSynopticSchemaId];
            const reportText = compileSynopticReport(activeSynopticSchemaId, activeSynopticState);
            if (!reportText) {
                showToast("El reporte está vacío, selecciona algunas opciones primero", "warning");
                return;
            }

            const targetFieldId = "re_" + schema.targetField;
            const targetEl = document.getElementById(targetFieldId);
            if (targetEl) {
                let formattedHtml = reportText.replace(/\n/g, '<br>');
                const confirmAppend = confirm("¿Desea anexar esta plantilla al final del reporte actual? (Haga clic en Cancelar para reemplazar todo el contenido)");
                const currentContent = targetEl.innerHTML.trim();
                if (confirmAppend && currentContent !== '' && currentContent !== '<br>') {
                    targetEl.innerHTML = currentContent + "<br><br>" + formattedHtml;
                } else {
                    targetEl.innerHTML = formattedHtml;
                }
                showToast("Reporte sinóptico copiado con éxito", "success");
                switchEditorTab("tab_descrip");
            }
        };
    }

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

    // Helper function to compress images using Canvas API (650px max, 0.78 quality matching exact 300 DPI retina threshold for 5.5cm PDF box size)
    function compressImage(fileOrDataUrl, maxWidth = 650, maxHeight = 650, quality = 0.78) {
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

    // Instancias de Mini-Editor Cropper en vivo
    const miniCropperInstances = {};

    function getCropperClass() {
        if (typeof window.Cropper === 'function') return window.Cropper;
        if (typeof Cropper === 'function') return Cropper;
        if (window.Cropper && typeof window.Cropper.default === 'function') return window.Cropper.default;
        return null;
    }

    async function getCropperClassAsync() {
        let cls = getCropperClass();
        if (cls) return cls;

        return new Promise((resolve) => {
            try {
                if (!document.querySelector('link[href*="cropper"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css';
                    document.head.appendChild(link);
                }

                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js';
                script.onload = () => resolve(getCropperClass());
                script.onerror = () => resolve(null);
                document.head.appendChild(script);
            } catch(e) {
                resolve(null);
            }
        });
    }

    async function setupMiniCropper(targetKey, fileOrDataUrl) {
        const rawImg = document.getElementById(`re_${targetKey}Raw`);
        const cropStep = document.getElementById(`re_${targetKey}CropStep`);
        const workspace = document.getElementById(`re_${targetKey}Workspace`);
        const previewContainer = document.getElementById(`re_${targetKey}PreviewContainer`);
        const actions = document.getElementById(`re_${targetKey}Actions`);

        if (!rawImg || !cropStep || !workspace) return;

        if (miniCropperInstances[targetKey]) {
            try {
                miniCropperInstances[targetKey].destroy();
            } catch (err) {}
            delete miniCropperInstances[targetKey];
        }

        try {
            const optimizedDataUrl = (typeof fileOrDataUrl === 'string') 
                ? fileOrDataUrl 
                : await compressImage(fileOrDataUrl, 1600, 1600, 0.90);

            cropStep.style.display = 'block';
            workspace.style.display = 'block';
            if (actions) actions.style.display = 'flex';
            if (previewContainer) previewContainer.style.display = 'none';

            // Reset slider y botones de proporción
            const slider = document.getElementById(`re_angleSlider_${targetKey}`);
            const angleTxt = document.getElementById(`re_angleTxt_${targetKey}`);
            const btn11 = document.getElementById(`re_btnRatio11_${targetKey}`);
            const btn43 = document.getElementById(`re_btnRatio43_${targetKey}`);

            if (slider) slider.value = 0;
            if (angleTxt) angleTxt.textContent = '0°';
            if (btn11) btn11.classList.add('active');
            if (btn43) btn43.classList.remove('active');

            void workspace.offsetHeight;

            let isInitialized = false;
            const initCropper = async () => {
                if (isInitialized) return;
                isInitialized = true;

                if (miniCropperInstances[targetKey]) {
                    try { miniCropperInstances[targetKey].destroy(); } catch(err){}
                }

                const CropperClass = await getCropperClassAsync();
                if (!CropperClass) {
                    console.error("[MiniCropper Error] Librería Cropper.js no encontrada.");
                    notifyUser("Error: La librería de recorte no está cargada. Intente recargar la página (F5).", "error");
                    return;
                }

                try {
                    rawImg.style.display = 'block';
                    const cropperInstance = new CropperClass(rawImg, {
                        aspectRatio: 1,       // Default 1:1 Cuadrado
                        viewMode: 1,          // Mantener la caja de recorte dentro del marco de la foto
                        dragMode: 'move',     // Permite arrastrar la caja y la foto
                        autoCrop: true,
                        autoCropArea: 0.75,   // 75% de la foto: deja un 25% de margen libre alrededor para arrastrar la caja libremente
                        responsive: true,
                        restore: false,
                        modal: true,
                        guides: true,
                        center: true,
                        highlight: true,
                        background: false,
                        cropBoxMovable: true,  // HABILITA MOVER LA CAJA AZUL CON EL RATÓN
                        cropBoxResizable: true,// HABILITA CAMBIAR TAMAÑO CON TIRADORES
                        toggleDragModeOnDblclick: true,
                        zoomable: true,
                        scalable: true,
                        rotatable: true,
                        ready: function() {
                            console.log(`[MiniCropper Success] Instancia ${targetKey} optimizada y lista.`);
                            try {
                                cropperInstance.resize();
                                cropperInstance.crop();
                                setTimeout(() => {
                                    try {
                                        const canvasData = cropperInstance.getCanvasData();
                                        if (canvasData && canvasData.width > 0) {
                                            const side = Math.min(canvasData.width, canvasData.height) * 0.70;
                                            const left = canvasData.left + (canvasData.width - side) / 2;
                                            const top = canvasData.top + (canvasData.height - side) / 2;
                                            cropperInstance.setCropBoxData({
                                                left: left,
                                                top: top,
                                                width: side,
                                                height: side
                                            });
                                        }
                                    } catch(err){}
                                }, 50);
                            } catch(e){}
                        }
                    });

                    miniCropperInstances[targetKey] = cropperInstance;
                } catch (err) {
                    console.error(`[MiniCropper Exception ${targetKey}]`, err);
                }
            };

            rawImg.onload = () => {
                initCropper();
            };
            rawImg.src = optimizedDataUrl;
            if (rawImg.complete && rawImg.naturalWidth > 0) {
                initCropper();
            }
        } catch (err) {
            console.error("Error al preparar recortador:", err);
        }
    }

    // Vincular controles de Proporción (1:1 / 4:3), Rotación y Recorte para ambos adjuntos
    ['img01', 'img02'].forEach(key => {
        const btnResetCrop = document.getElementById(`re_btnResetCrop_${key}`);
        const btn11 = document.getElementById(`re_btnRatio11_${key}`);
        const btn43 = document.getElementById(`re_btnRatio43_${key}`);
        const btnRotLeft = document.getElementById(`re_btnRotateLeft_${key}`);
        const btnRotRight = document.getElementById(`re_btnRotateRight_${key}`);
        const slider = document.getElementById(`re_angleSlider_${key}`);
        const angleTxt = document.getElementById(`re_angleTxt_${key}`);
        const btnCrop = document.getElementById(`re_btnCrop${key === 'img01' ? 'Img01' : 'Img02'}`);
        const btnCancel = document.getElementById(`re_btnCancelCrop${key === 'img01' ? 'Img01' : 'Img02'}`);
        const cropStep = document.getElementById(`re_${key}CropStep`);
        const preview = document.getElementById(`re_${key}Preview`);
        const previewContainer = document.getElementById(`re_${key}PreviewContainer`);

        if (btnResetCrop) {
            btnResetCrop.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    const rawImg = document.getElementById(`re_${key}Raw`);
                    if (rawImg && rawImg.src) {
                        if (miniCropperInstances[key]) {
                            try { miniCropperInstances[key].destroy(); } catch(err){}
                            delete miniCropperInstances[key];
                        }
                        setupMiniCropper(key, rawImg.src);
                        notifyUser("Caja de recorte restablecida al centro.", "info");
                    }
                } catch (err) {
                    console.error("Error al reajustar recorte:", err);
                }
            });
        }

        if (btn11) {
            btn11.addEventListener('click', (e) => {
                e.preventDefault();
                btn11.classList.add('active');
                if (btn43) btn43.classList.remove('active');
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.setAspectRatio === 'function') {
                    cropper.setAspectRatio(1);
                }
            });
        }
        if (btn43) {
            btn43.addEventListener('click', (e) => {
                e.preventDefault();
                btn43.classList.add('active');
                if (btn11) btn11.classList.remove('active');
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.setAspectRatio === 'function') {
                    cropper.setAspectRatio(4 / 3);
                }
            });
        }
        if (btnRotLeft) {
            btnRotLeft.addEventListener('click', (e) => {
                e.preventDefault();
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.rotate === 'function') {
                    cropper.rotate(-90);
                } else {
                    notifyUser("Suba o vuelva a seleccionar la imagen para activar la rotación.", "info");
                }
            });
        }
        if (btnRotRight) {
            btnRotRight.addEventListener('click', (e) => {
                e.preventDefault();
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.rotate === 'function') {
                    cropper.rotate(90);
                } else {
                    notifyUser("Suba o vuelva a seleccionar la imagen para activar la rotación.", "info");
                }
            });
        }
        if (slider) {
            slider.addEventListener('input', () => {
                const val = parseInt(slider.value) || 0;
                if (angleTxt) angleTxt.textContent = `${val}°`;
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.rotateTo === 'function') {
                    cropper.rotateTo(val);
                }
            });
        }
        if (btnCrop) {
            btnCrop.addEventListener('click', async (e) => {
                e.preventDefault();
                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.getCroppedCanvas === 'function') {
                    const canvas = cropper.getCroppedCanvas();
                    if (canvas) {
                        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
                        const finalBase64 = await compressImage(croppedDataUrl, 650, 650, 0.78);
                        if (preview) preview.src = finalBase64;
                        if (previewContainer) previewContainer.style.display = 'flex';
                        if (cropStep) cropStep.style.display = 'none';
                        try { cropper.destroy(); } catch(err){}
                    } else {
                        notifyUser("Error al obtener el recorte de la imagen.", "error");
                    }
                } else {
                    notifyUser("Por favor vuelva a seleccionar la imagen para recortar.", "info");
                }
            });
        }
        if (btnCancel) {
            btnCancel.addEventListener('click', (e) => {
                e.preventDefault();
                if (cropStep) cropStep.style.display = 'none';
                if (miniCropperInstances[key]) {
                    try { miniCropperInstances[key].destroy(); } catch(err){}
                    delete miniCropperInstances[key];
                }
            });
        }

        // Vincular los 3 botones directos de IA (Macro, Micro H&E, Citologia PAP) tanto para Step 2 como Step 3
        ['Macro', 'Micro', 'Pap'].forEach(type => {
            const btnPrimary = document.getElementById(`re_btnAi${type}_${key}`);
            const btnStep2 = document.getElementById(`re_btnAi${type}_${key}_step2`);

            const handleAiRetouch = () => {
                const previewImg = document.getElementById(`re_${key}Preview`);
                const rawImg = document.getElementById(`re_${key}Raw`);
                let src = '';

                const cropper = miniCropperInstances[key];
                if (cropper && typeof cropper.getCroppedCanvas === 'function') {
                    try {
                        const cvs = cropper.getCroppedCanvas();
                        if (cvs) src = cvs.toDataURL('image/jpeg', 0.90);
                    } catch(e) {}
                }

                if (!src) {
                    src = (previewImg && previewImg.src && !previewImg.src.endsWith('/reportes.html')) ? previewImg.src : (rawImg ? rawImg.src : '');
                }

                if (!src || src.endsWith('/reportes.html')) {
                    notifyUser("Por favor cargue una imagen primero.", "warning");
                    return;
                }

                if (typeof window.openPhotoEditor === 'function') {
                    window.openPhotoEditor(src, `Muestra_${key}.jpg`, (retouchedBase64) => {
                        if (previewImg) previewImg.src = retouchedBase64;
                        if (previewContainer) previewContainer.style.display = 'flex';
                        if (cropStep) cropStep.style.display = 'none';
                        const actions = document.getElementById(`re_${key}Actions`);
                        if (actions) actions.style.display = 'none';
                    });
                    setTimeout(() => {
                        const targetBtn = document.getElementById(`wpe-btn-gemini-${type.toLowerCase()}`);
                        if (targetBtn) targetBtn.click();
                    }, 250);
                }
            };

            if (btnPrimary) btnPrimary.onclick = (e) => { e.preventDefault(); handleAiRetouch(); };
            if (btnStep2) btnStep2.onclick = (e) => { e.preventDefault(); handleAiRetouch(); };
        });
    });

    // Carga e iniciación del Mini-Editor para Adjunto Imagen 01
    const reImg01Input = document.getElementById('re_img01Input');
    const reImg01PreviewContainer = document.getElementById('re_img01PreviewContainer');
    const reImg01Preview = document.getElementById('re_img01Preview');
    const reBtnRemoveImg01 = document.getElementById('re_btnRemoveImg01');
    const reBtnEditImg01 = document.getElementById('re_btnEditImg01');

    if (reImg01Input) {
        reImg01Input.addEventListener('change', () => {
            const file = reImg01Input.files[0];
            if (file) {
                notifyUser("Abriendo Mini-Editor de recorte y rotación...", "info");
                setupMiniCropper('img01', file);
            }
        });
    }

    if (reBtnEditImg01) {
        reBtnEditImg01.addEventListener('click', () => {
            if (reImg01Preview && reImg01Preview.src) {
                if (typeof window.openPhotoEditor === 'function') {
                    window.openPhotoEditor(reImg01Preview.src, "Muestra_01.jpg", (croppedBase64) => {
                        reImg01Preview.src = croppedBase64;
                        reImg01PreviewContainer.style.display = 'flex';
                        notifyUser("Imagen 1 retocada con éxito.", "success");
                    });
                } else {
                    notifyUser("El editor interactivo aún se está cargando. La imagen ya está lista.", "info");
                }
            }
        });
    }

    if (reBtnRemoveImg01) {
        reBtnRemoveImg01.addEventListener('click', (e) => {
            e.stopPropagation();
            reImg01Input.value = "";
            reImg01Preview.src = "";
            reImg01PreviewContainer.style.display = 'none';
            originalImg01Src = ""; // Clear original source to delete completely
        });
    }

    // Carga e iniciación del Mini-Editor para Adjunto Imagen 02
    const reImg02Input = document.getElementById('re_img02Input');
    const reImg02PreviewContainer = document.getElementById('re_img02PreviewContainer');
    const reImg02Preview = document.getElementById('re_img02Preview');
    const reBtnRemoveImg02 = document.getElementById('re_btnRemoveImg02');
    const reBtnEditImg02 = document.getElementById('re_btnEditImg02');

    if (reImg02Input) {
        reImg02Input.addEventListener('change', () => {
            const file = reImg02Input.files[0];
            if (file) {
                notifyUser("Abriendo Mini-Editor de recorte y rotación...", "info");
                setupMiniCropper('img02', file);
            }
        });
    }

    if (reBtnEditImg02) {
        reBtnEditImg02.addEventListener('click', () => {
            if (reImg02Preview && reImg02Preview.src) {
                if (typeof window.openPhotoEditor === 'function') {
                    window.openPhotoEditor(reImg02Preview.src, "Muestra_02.jpg", (croppedBase64) => {
                        reImg02Preview.src = croppedBase64;
                        reImg02PreviewContainer.style.display = 'flex';
                        notifyUser("Imagen 2 retocada con éxito.", "success");
                    });
                } else {
                    notifyUser("El editor interactivo aún se está cargando. La imagen ya está lista.", "info");
                }
            }
        });
    }

    if (reBtnRemoveImg02) {
        reBtnRemoveImg02.addEventListener('click', (e) => {
            e.stopPropagation();
            reImg02Input.value = "";
            reImg02Preview.src = "";
            reImg02PreviewContainer.style.display = 'none';
            originalImg02Src = ""; // Clear original source to delete completely
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

    // Auto-asignación en vivo de clínica al ingresar o seleccionar médico solicitante
    const reMedInput = document.getElementById('re_medSolicitante');
    const reClinicaInput = document.getElementById('re_clinica');
    if (reMedInput && reClinicaInput) {
        const autoAssignClinicLive = () => {
            const val = (reMedInput.value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (val.includes('marreros') || val.includes('lloclla')) {
                reClinicaInput.value = 'CLINICA LA MUJER';
            } else if (val.includes('escalante')) {
                reClinicaInput.value = 'CLÍNICA SAN CLEMENTE';
            } else if (val.includes('sanchez orellana') || val.includes('becerra') || val.includes('ulfe')) {
                reClinicaInput.value = 'CLÍNICA CARRIÓN';
            } else if (val.includes('saire') || val.includes('bocangel')) {
                reClinicaInput.value = 'CLÍNICA ALFA PREVENIR';
            }
        };
        reMedInput.addEventListener('input', autoAssignClinicLive);
        reMedInput.addEventListener('change', autoAssignClinicLive);
    }

    // Registrar Clínica
    const reBtnCopiarClinica = document.getElementById('re_btnCopiarClinica');
    if (reBtnCopiarClinica) {
        reBtnCopiarClinica.addEventListener('click', () => {
            const clinicaName = document.getElementById('re_clinica').value.trim().toUpperCase();
            if (!clinicaName) {
                notifyUser('Por favor, ingrese el nombre de la clínica para registrar.', 'error');
                document.getElementById('re_clinica').focus();
                return;
            }

            const existsInDoctors = doctorsDatabase.some(d => (d.doctor || '').trim().toUpperCase() === clinicaName);
            const existsInPatients = patientDatabase.some(p => (p.clinica || '').trim().toUpperCase() === clinicaName);

            if (existsInDoctors || existsInPatients) {
                notifyUser(`La clínica "${clinicaName}" ya se encuentra registrada.`, 'info');
                const el = document.getElementById('re_clinica');
                if (el) el.value = clinicaName;
                return;
            }

            const clinicaData = {
                doctor: clinicaName,
                colegiado: '',
                especializacion: '',
                tipo: 'CLINICA',
                provincia: '',
                telefono: '',
                correo: '',
                firma: ''
            };

            doctorsDatabase.unshift(clinicaData);
            if (typeof populateModalDoctorsSelect === 'function') populateModalDoctorsSelect();

            if (usingSupabase) {
                supabase
                    .from('doctores')
                    .insert([{
                        nombre: clinicaData.doctor,
                        tipo: 'CLINICA'
                    }])
                    .then(({ error }) => {
                        if (error) console.error("Error al registrar clínica en Supabase:", error);
                    });
            }

            const el = document.getElementById('re_clinica');
            if (el) el.value = clinicaName;
            notifyUser(`Clínica "${clinicaName}" registrada e ingresada con éxito.`, 'success');
        });
    }

    // Salir del editor
    const reBtnSalir = document.getElementById('re_btnSalir');
    if (reBtnSalir) {
        reBtnSalir.addEventListener('click', () => {
            if (typeof window.refreshPatientTable === 'function') {
                window.refreshPatientTable();
            } else if (typeof applyFilters === 'function') {
                applyFilters(false);
            }
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
        const p1Raw = document.getElementById('re_img01Raw');
        const p1Work = document.getElementById('re_img01Workspace');

        if (p1Box && p1Box.style.display !== 'none' && p1Img && p1Img.src) {
            img01 = p1Img.src;
        } else if (p1Work && p1Work.style.display !== 'none' && cropper01) {
            try {
                const canvas = cropper01.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });
                img01 = canvas ? canvas.toDataURL('image/jpeg', 0.65) : (p1Raw ? p1Raw.src : '');
            } catch (e) {
                img01 = p1Raw ? p1Raw.src : '';
            }
        } else if (p1Raw && p1Raw.src && p1Raw.src.startsWith('data:')) {
            img01 = p1Raw.src;
        }

        const p2Box = document.getElementById('re_img02PreviewContainer');
        const p2Img = document.getElementById('re_img02Preview');
        const p2Raw = document.getElementById('re_img02Raw');
        const p2Work = document.getElementById('re_img02Workspace');

        if (p2Box && p2Box.style.display !== 'none' && p2Img && p2Img.src) {
            img02 = p2Img.src;
        } else if (p2Work && p2Work.style.display !== 'none' && cropper02) {
            try {
                const canvas = cropper02.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });
                img02 = canvas ? canvas.toDataURL('image/jpeg', 0.65) : (p2Raw ? p2Raw.src : '');
            } catch (e) {
                img02 = p2Raw ? p2Raw.src : '';
            }
        } else if (p2Raw && p2Raw.src && p2Raw.src.startsWith('data:')) {
            img02 = p2Raw.src;
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
            edad: (getVal('re_edad') && getVal('re_edad') !== '0' && getVal('re_edad') !== '--') ? getVal('re_edad') : '--',
            telefono: getVal('re_telefono'),
            fContacto: getVal('re_fContacto'),
            telContacto: getVal('re_telContacto'),
            medSolicitante: getVal('re_medSolicitante'),
            motivoEstudio: getVal('re_motivoEstudio'),
            especimen: getVal('re_telContacto'),
            doctor: getVal('re_doctor'),
            casetes: parseInt(getVal('re_casetes')) || 1,
            clinica: getVal('re_clinica'),
            diagnostico: autoCorrectClinicalText(getHtml('re_diagnostico')),
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


    // Función auxiliar para guardar datos del editor en la base de datos y Supabase
    function saveEditorDataToDatabase(shouldNotify = true) {
        const cleanCode = String(originalCodAtencion || editingCodAtencion || '').trim().toLowerCase();
        const cleanNoHyphen = cleanCode.replace(/[-_\s]/g, '');
        let patient = patientDatabase.find(x => {
            const code = String(x.codAtencion || '').trim().toLowerCase();
            return code === cleanCode || code.replace(/[-_\s]/g, '') === cleanNoHyphen;
        });

        if (!patient) {
            const newCod = document.getElementById('re_codAtencion') ? document.getElementById('re_codAtencion').value.trim() : (originalCodAtencion || editingCodAtencion);
            patient = { codAtencion: newCod || originalCodAtencion || editingCodAtencion };
            patientDatabase.unshift(patient);
        }

        if (patient) {
            // Guardar campos en el objeto local del paciente
            const newCodAtencion = document.getElementById('re_codAtencion').value.trim();
            const codeChanged = originalCodAtencion && originalCodAtencion !== newCodAtencion;

            // Clonar para evitar mutar el original en patientDatabase antes del borrado
            const targetPatient = codeChanged ? { ...patient } : patient;
            if (codeChanged) {
                delete targetPatient.id; // Evitar conflictos de clave primaria al insertar nuevo registro
            }

            targetPatient.codAtencion = newCodAtencion;
            targetPatient.dni = document.getElementById('re_dni').value;

            const selectedSexo = document.getElementById('re_sexo').value;
            targetPatient.sexo = selectedSexo === 'MASCULINO' ? 'M' : (selectedSexo === 'FEMENINO' ? 'F' : 'O');
            targetPatient.fecRegistro = document.getElementById('re_fecIngreso').value;
            targetPatient.fecEntrega = document.getElementById('re_fecEntregaReal').value;

            targetPatient.nombres = document.getElementById('re_nomPaciente').value;
            targetPatient.apellidos = document.getElementById('re_apePaciente').value;
            targetPatient.paciente = `${targetPatient.apellidos}, ${targetPatient.nombres}`;

            const rawEdadVal = document.getElementById('re_edad').value.trim();
            targetPatient.edad = (rawEdadVal && rawEdadVal !== '0' && rawEdadVal !== '--') ? rawEdadVal : '--';
            targetPatient.telefono = document.getElementById('re_telefono').value;
            targetPatient.fContacto = document.getElementById('re_fContacto').value;
            targetPatient.telContacto = document.getElementById('re_telContacto').value;

            targetPatient.medSolicitante = document.getElementById('re_medSolicitante').value;
            targetPatient.motivoEstudio = document.getElementById('re_motivoEstudio').value;
            targetPatient.especimen = targetPatient.telContacto;

            targetPatient.doctor = document.getElementById('re_doctor').value;
            targetPatient.casetes = parseInt(document.getElementById('re_casetes').value) || 1;
            targetPatient.clinica = document.getElementById('re_clinica') ? document.getElementById('re_clinica').value : (targetPatient.clinica || '');

            targetPatient.diagnostico = autoCorrectClinicalText(document.getElementById('re_diagnostico').innerHTML);

            targetPatient.catMacro = document.getElementById('re_catMacro').value;
            targetPatient.planMacro = document.getElementById('re_planMacro').value;
            targetPatient.macroDesc = fixMedicalCapitalization(document.getElementById('re_macroDesc').innerHTML);

            targetPatient.catMicro = document.getElementById('re_catMicro').value;
            targetPatient.planMicro = document.getElementById('re_planMicro').value;
            targetPatient.microDesc = fixMedicalCapitalization(document.getElementById('re_microDesc').innerHTML);

            // Guardar Solicitud de Informe
            if (window.currentUploadedFileBase64) {
                targetPatient.solicitudInforme = window.currentUploadedFileBase64;
            } else {
                targetPatient.solicitudInforme = "";
            }

            // Guardar imágenes de forma segura
            const img01Cont = document.getElementById('re_img01PreviewContainer');
            const img01Prev = document.getElementById('re_img01Preview');
            const img01Raw = document.getElementById('re_img01Raw');
            const img01Work = document.getElementById('re_img01Workspace');

            if (img01Cont && img01Cont.style.display !== 'none' && img01Prev && img01Prev.src) {
                targetPatient.img01 = img01Prev.src;
            } else if (img01Work && img01Work.style.display !== 'none' && cropper01) {
                try {
                    const canvas = cropper01.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });
                    if (canvas) {
                        targetPatient.img01 = canvas.toDataURL('image/jpeg', 0.65);
                    } else if (img01Raw && img01Raw.src) {
                        targetPatient.img01 = img01Raw.src;
                    }
                } catch (e) {
                    if (img01Raw && img01Raw.src) targetPatient.img01 = img01Raw.src;
                }
            } else if (img01Raw && img01Raw.src && img01Raw.src.startsWith('data:')) {
                targetPatient.img01 = img01Raw.src;
            } else {
                targetPatient.img01 = "";
            }

            const img02Cont = document.getElementById('re_img02PreviewContainer');
            const img02Prev = document.getElementById('re_img02Preview');
            const img02Raw = document.getElementById('re_img02Raw');
            const img02Work = document.getElementById('re_img02Workspace');

            if (img02Cont && img02Cont.style.display !== 'none' && img02Prev && img02Prev.src) {
                targetPatient.img02 = img02Prev.src;
            } else if (img02Work && img02Work.style.display !== 'none' && cropper02) {
                try {
                    const canvas = cropper02.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });
                    if (canvas) {
                        targetPatient.img02 = canvas.toDataURL('image/jpeg', 0.65);
                    } else if (img02Raw && img02Raw.src) {
                        targetPatient.img02 = img02Raw.src;
                    }
                } catch (e) {
                    if (img02Raw && img02Raw.src) targetPatient.img02 = img02Raw.src;
                }
            } else if (img02Raw && img02Raw.src && img02Raw.src.startsWith('data:')) {
                targetPatient.img02 = img02Raw.src;
            } else {
                targetPatient.img02 = "";
            }

            // Manejar cambio de código de atención
            if (codeChanged) {
                if (typeof window.deletePatient === 'function') {
                    window.deletePatient(originalCodAtencion);
                } else {
                    const oldIdx = patientDatabase.findIndex(x => x.codAtencion === originalCodAtencion);
                    if (oldIdx !== -1) patientDatabase.splice(oldIdx, 1);
                }
                originalCodAtencion = newCodAtencion;
                editingCodAtencion = newCodAtencion;
            }

            // Guardar cambios a IndexedDB y encolar envío a Supabase
            if (typeof window.savePatient === 'function') {
                window.savePatient(targetPatient);
            } else {
                const idx = patientDatabase.findIndex(x => x.codAtencion === targetPatient.codAtencion);
                if (idx !== -1) {
                    patientDatabase[idx] = targetPatient;
                } else {
                    patientDatabase.unshift(targetPatient);
                }
                if (typeof window.triggerAutomaticBackup === 'function') window.triggerAutomaticBackup();
                if (typeof window.refreshPatientTable === 'function') window.refreshPatientTable(); else applyFilters(false);
            }

            if (shouldNotify) {
                notifyUser("Cambios guardados con éxito en la ficha del paciente", "success");
            } else {
                notifyUser("Sincronizando cambios con la nube en tiempo real...", "info");
            }
            return targetPatient;
        }
        return null;
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

            // Asegurar que si el diagnóstico está en blanco se coloque la firma de confirmación
            const diagEl = document.getElementById('re_diagnostico');
            if (diagEl) {
                const cleanDiagText = (diagEl.textContent || diagEl.innerText || '').trim();
                if (!cleanDiagText) {
                    diagEl.innerHTML = '<b>INFORME COMPLETO Y FIRMADO POR PATOLOGÍA.</b>';
                }
            }

            // Guardar primero para que los cambios se suban a Supabase inmediatamente
            const savedPatient = saveEditorDataToDatabase(false);
            if (savedPatient) {
                savedPatient.firmado = true;
                savedPatient.estado = 'Completado';
                if (typeof window.savePatient === 'function') {
                    window.savePatient(savedPatient);
                }
            }

            const tempPatient = savedPatient || getTempPatientFromEditor();
            tempPatient.firmado = true;
            tempPatient.estado = 'Completado';

            try {
                localStorage.setItem('printPatientData', JSON.stringify(tempPatient));
            } catch (e) {
                console.error("[Firma] Error guardando printPatientData:", e);
            }

            // Refrescar tabla inmediatamente para mostrar el estado COMPLETADO respetando la página actual
            if (typeof window.refreshPatientTable === 'function') {
                window.refreshPatientTable();
            } else if (typeof applyFilters === 'function') {
                applyFilters(false);
            }

            notifyUser("Informe FIRMADO correctamente. El estado cambió a COMPLETADO.", "success");

            const printUrl = `imprimir.html?autoDownload=true&codAtencion=${encodeURIComponent(tempPatient.codAtencion || '')}`;
            window.open(printUrl, '_blank', 'width=950,height=1000');
        });
    }

    // Vista Previa button
    const reBtnPreview = document.getElementById('re_btnPreview');
    if (reBtnPreview) {
        reBtnPreview.addEventListener('click', () => {
            // Guardar primero para que los cambios se suban a Supabase inmediatamente
            const savedPatient = saveEditorDataToDatabase(false);
            const tempPatient = savedPatient || getTempPatientFromEditor();

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
            saveEditorDataToDatabase(true);
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

        let plantillas = [];
        if (categoriaId) {
            const categoryObj = (categoriesDatabase || []).find(c => String(c.id) === String(categoriaId));
            if (categoryObj) {
                const catName = (categoryObj.categoria || '').trim().toUpperCase();
                const matchingCatIds = (categoriesDatabase || [])
                    .filter(c => (c.categoria || '').trim().toUpperCase() === catName)
                    .map(c => String(c.id));
                plantillas = (templatesDatabase || []).filter(t => matchingCatIds.includes(String(t.categoryId)));
            } else {
                plantillas = (templatesDatabase || []).filter(t => String(t.categoryId) === String(categoriaId));
            }

            // Exclusión estricta de plantillas ginecológicas / endometriales si la especialidad seleccionada es Apéndice Cecal
            const isApendiceCat = categoryObj && (categoryObj.categoria || '').toUpperCase().includes('APÉNDICE');
            if (isApendiceCat || String(categoriaId) === '22' || String(categoriaId) === '13') {
                plantillas = plantillas.filter(t => {
                    const tit = (t.titulo || '').toUpperCase();
                    return !tit.includes('ENDOMETR') && !tit.includes('PÓLIPO') && !tit.includes('POLIPO') && !tit.includes('LEIOMIOMA') && !tit.includes('CERVIX');
                });
            }
        }
        
        // Si no hay categoría seleccionada, filtrar según el espécimen del formulario
        if (!plantillas || plantillas.length === 0) {
            const telContactoVal = document.getElementById('re_telContacto') ? document.getElementById('re_telContacto').value.toUpperCase() : '';
            if (telContactoVal.includes('VESICUL') || telContactoVal.includes('VESÍCUL') || telContactoVal.includes('COLECIST')) {
                plantillas = (templatesDatabase || []).filter(t => {
                    const tit = (t.titulo || '').toUpperCase();
                    return tit.includes('COLECIST') || tit.includes('VESICUL') || tit.includes('VESÍCUL') || t.categoryId === 23 || t.categoryId === 24;
                });
            } else if (telContactoVal.includes('APENDIC') || telContactoVal.includes('APÉNDIC')) {
                plantillas = (templatesDatabase || []).filter(t => {
                    const tit = (t.titulo || '').toUpperCase();
                    return (t.categoryId === 22 || t.categoryId === 13 || tit.includes('APENDIC')) && !tit.includes('ENDOMETR') && !tit.includes('PÓLIPO') && !tit.includes('POLIPO');
                });
            } else if (telContactoVal.includes('ENDOMETR') || telContactoVal.includes('CERVIX') || telContactoVal.includes('CÉRVIZ') || telContactoVal.includes('UTER') || telContactoVal.includes('CUELLO') || telContactoVal.includes('PÓLIPO') || telContactoVal.includes('POLIPO')) {
                plantillas = (templatesDatabase || []).filter(t => {
                    const tit = (t.titulo || '').toUpperCase();
                    return t.categoryId === 4 || t.categoryId === 18 || tit.includes('ENDOMETR') || tit.includes('CERVIX') || tit.includes('CÉRVIZ') || tit.includes('LEIOMIOMA') || tit.includes('PÓLIPO') || tit.includes('POLIPO');
                });
            } else {
                plantillas = [...(templatesDatabase || [])];
            }
        }

        // Ordenar alfabéticamente por título para fácil localización
        plantillas.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));

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
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.categoria;

            const t = (cat.tipo || '').toLowerCase();
            if (t.includes('macro')) {
                catMacro.appendChild(option.cloneNode(true));
            } else if (t.includes('micro')) {
                catMicro.appendChild(option.cloneNode(true));
                catDiag.appendChild(option.cloneNode(true));
            } else {
                catMacro.appendChild(option.cloneNode(true));
                catMicro.appendChild(option.cloneNode(true));
                catDiag.appendChild(option.cloneNode(true));
            }
        });

        // Poblar de inmediato los tres combos de plantillas (Macro, Micro, Diagnóstico) con todas las plantillas
        actualizarPlantillasSegunEspecialidad('macro', catMacro.value);
        actualizarPlantillasSegunEspecialidad('micro', catMicro.value);
        actualizarPlantillasSegunEspecialidad('diag', catDiag.value);
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

    // --- TEMPLATE DROPDOWNS COORDINATION ---
    function coordinarCategorias(sourceTipo, selectedCategoryId) {
        if (!selectedCategoryId) return;
        
        // Si la fuente es macro, es completamente independiente
        if (sourceTipo === 'macro') return;

        const cats = categoriesDatabase || [];
        const sourceCat = cats.find(c => String(c.id) === String(selectedCategoryId));
        if (!sourceCat) return;
        
        const sourceName = (sourceCat.categoria || '').trim().toUpperCase();
        
        // Sincronizar categorías por nombre homólogo únicamente entre micro y diag
        cats.forEach(c => {
            const name = (c.categoria || '').trim().toUpperCase();
            if (name === sourceName && c.tipo === 'Microscopica') {
                if (sourceTipo !== 'micro') {
                    const el = document.getElementById('re_catMicro');
                    if (el && el.value !== String(c.id)) {
                        el.value = c.id;
                        actualizarPlantillasSegunEspecialidad('micro', c.id);
                    }
                }
                if (sourceTipo !== 'diag') {
                    const el = document.getElementById('re_catDiag');
                    if (el && el.value !== String(c.id)) {
                        el.value = c.id;
                        actualizarPlantillasSegunEspecialidad('diag', c.id);
                    }
                }
            }
        });
    }

    function coordinarPlantillaSeleccionada(sourceTipo, selectedTemplateId) {
        // 'macro' es completamente independiente y no se sincroniza
        if (sourceTipo === 'micro' || sourceTipo === 'diag') {
            const targetTipo = sourceTipo === 'micro' ? 'diag' : 'micro';
            let el = null;
            if (targetTipo === 'micro') el = document.getElementById('re_planMicro');
            if (targetTipo === 'diag') el = document.getElementById('re_planDiag');
            
            if (el) {
                const hasOption = Array.from(el.options).some(o => o.value === String(selectedTemplateId));
                if (hasOption && el.value !== String(selectedTemplateId)) {
                    el.value = selectedTemplateId;
                }
            }
        }

        const selectedTemplate = templatesDatabase.find(t => String(t.id) === String(selectedTemplateId));
        if (selectedTemplate) {
            checkAndSetupSynopticAssistant(selectedTemplate.plantilla || selectedTemplate.titulo || "");
        }
    }

    const catMacro = document.getElementById('re_catMacro');
    const catMicro = document.getElementById('re_catMicro');
    const catDiag = document.getElementById('re_catDiag');

    if (catMacro) catMacro.addEventListener('change', (e) => {
        actualizarPlantillasSegunEspecialidad('macro', e.target.value);
        coordinarCategorias('macro', e.target.value);
    });
    if (catMicro) catMicro.addEventListener('change', (e) => {
        actualizarPlantillasSegunEspecialidad('micro', e.target.value);
        coordinarCategorias('micro', e.target.value);
    });
    if (catDiag) catDiag.addEventListener('change', (e) => {
        actualizarPlantillasSegunEspecialidad('diag', e.target.value);
        coordinarCategorias('diag', e.target.value);
    });

    const planMacro = document.getElementById('re_planMacro');
    const planMicro = document.getElementById('re_planMicro');
    const planDiag = document.getElementById('re_planDiag');

    if (planMacro) planMacro.addEventListener('change', (e) => coordinarPlantillaSeleccionada('macro', e.target.value));
    if (planMicro) planMicro.addEventListener('change', (e) => coordinarPlantillaSeleccionada('micro', e.target.value));
    if (planDiag) planDiag.addEventListener('change', (e) => coordinarPlantillaSeleccionada('diag', e.target.value));
    
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

    // --- INTEGRACIÓN DE ASISTENTE AI (DEEPSEEK) ---
    const aiBtnGenDiag = document.getElementById('ai_btn_gen_diag');
    const aiDiagInput = document.getElementById('ai_diag_input');
    const aiBtnGenClinical = document.getElementById('ai_btn_gen_clinical');

    if (aiBtnGenDiag && aiDiagInput) {
        aiBtnGenDiag.addEventListener('click', () => {
            const diagnostico = aiDiagInput.value.trim();
            if (diagnostico === '') {
                showToast('Por favor, escribe un diagnóstico.', 'warning');
                return;
            }
            
            const promptText = `Asume el rol de un anatomopatológo senior del MD Anderson Cancer Center.Redacta un informe anatomopatológico completo de ${diagnostico}.\n\nEn base al diagnostico proporcionado redacta lo siguiente, informe antomopatologico: \nMacroscopía: un párrafo conciso.\nMicroscopía: un párrafo con los criterios  diagnosticos.\nDiagnóstico: una línea final clara y sin ambigüedad.`;
            
            navigator.clipboard.writeText(promptText).then(() => {
                showToast('Prompt de Diagnóstico copiado. Abriendo DeepSeek...', 'success');
                setTimeout(() => {
                    window.open('https://chat.deepseek.com/', '_blank');
                }, 800);
            }).catch(err => {
                console.error('Error al copiar:', err);
                showToast('Error al copiar el prompt automáticamente.', 'error');
            });
        });
    }

    if (aiBtnGenClinical) {
        aiBtnGenClinical.addEventListener('click', () => {
            // Obtener datos dinámicos de los inputs de la ficha
            const edad = document.getElementById('re_edad') ? document.getElementById('re_edad').value.trim() : '--';
            const sexo = document.getElementById('re_sexo') ? document.getElementById('re_sexo').value : 'No disponible';
            const muestra = document.getElementById('re_telContacto') ? document.getElementById('re_telContacto').value.trim() : 'No disponible';
            const historia = document.getElementById('re_motivoEstudio') ? document.getElementById('re_motivoEstudio').value.trim() : 'No disponible';
            
            // Especialidad por código de atención
            const codAtencion = document.getElementById('re_codAtencion') ? document.getElementById('re_codAtencion').value.trim() : '';
            const especialidad = codAtencion.toUpperCase().includes('C') ? 'ginecología' : 'gastroenterología';

            const promptText = `DATOS DEL PACIENTE:
Edad: ${edad || 'No disponible'}
Sexo: ${sexo || 'No disponible'}
Localización/Muestra: ${muestra || 'No disponible'}
Hallazgos clínicos/Historia: ${historia || 'No disponible'}
Especialidad: ${especialidad}

HALLAZGOS PATOLÓGICOS:
Descripción macroscópica: No disponible (generar basada en la muestra)
Descripción microscópica: No disponible (generar basada en los hallazgos clínicos)
Inmunohistoquímica: No disponible
Otros estudios: No disponible
Antecedentes relevantes: No disponible

Eres un anatomopatólogo senior del MD Anderson Cancer Center, especializado en ${especialidad}. Basándote EXCLUSIVAMENTE en los datos proporcionados, genera un reporte preliminar estructurado que incluya:
Descripción macroscópica en un párrafo y microscópica en un párrafo
Interpretación de hallazgos inmunohistoquímicos (si están disponibles)
Diagnósticos diferenciales priorizados
Estudios complementarios necesarios para confirmar / descartar diagnósticos
Conclusión preliminar y recomendaciones

INSTRUCCIONES ESPECÍFICAS:
Si algún dato marcado como "No disponible" es crítico para el diagnóstico, menciónalo explícitamente en la sección de estudios complementarios.
Estructura el reporte usando los mismos encabezados solicitados.
Mantén un lenguaje técnico apropiado para comunicación entre especialistas.`;

            navigator.clipboard.writeText(promptText).then(() => {
                showToast('Prompt Clínico copiado. Abriendo DeepSeek...', 'success');
                setTimeout(() => {
                    window.open('https://chat.deepseek.com/', '_blank');
                }, 800);
            }).catch(err => {
                console.error('Error al copiar:', err);
                showToast('Error al copiar el prompt automáticamente.', 'error');
            });
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

    for (let fieldId of fields) {
        const el = document.getElementById(fieldId);
        if (!el) continue;
        
        const textNodes = [];
        walkTextNodes(el, textNodes);
        
        for (let node of textNodes) {
            const originalText = node.nodeValue;
            let clean = cleanTextContentLocal(originalText);
            clean = autoCorrectClinicalText(clean);
            
            if (clean !== originalText) {
                node.nodeValue = clean;
                modificationsCount++;
            }
        }
    }

    if (typeof notifyUser === 'function') {
        notifyUser(`Autocorrección completada de forma local y determinista. Correcciones aplicadas: ${modificationsCount}`, 'success');
    }
};

window.updateOpenEditorIfMatches = function(updatedPatient) {
    if (!editingCodAtencion || !updatedPatient) return;
    const cleanOpen = String(editingCodAtencion).trim().toLowerCase().replace(/[-_\s]/g, '');
    const cleanUpdated = String(updatedPatient.codAtencion || '').trim().toLowerCase().replace(/[-_\s]/g, '');
    
    if (cleanOpen === cleanUpdated) {
        const macroEl = document.getElementById('re_macroDesc');
        const microEl = document.getElementById('re_microDesc');
        const diagEl = document.getElementById('re_diagnostico');
        
        // Solo actualizar si el objeto remoto de verdad contiene texto NO VACÍO para evitar borrar la pantalla del usuario
        if (macroEl && updatedPatient.macroDesc && updatedPatient.macroDesc.trim() !== '') {
            const currentLocal = macroEl.innerText ? macroEl.innerText.trim() : '';
            if (!currentLocal || document.activeElement !== macroEl) {
                const val = updatedPatient.macroDesc;
                macroEl.innerHTML = val.includes('<') ? val.toLowerCase() : val.toLowerCase().replace(/\n/g, '<br>');
            }
        }
        if (microEl && updatedPatient.microDesc && updatedPatient.microDesc.trim() !== '') {
            const currentLocal = microEl.innerText ? microEl.innerText.trim() : '';
            if (!currentLocal || document.activeElement !== microEl) {
                const val = updatedPatient.microDesc;
                microEl.innerHTML = val.includes('<') ? val.toLowerCase() : val.toLowerCase().replace(/\n/g, '<br>');
            }
        }
        if (diagEl && updatedPatient.diagnostico && updatedPatient.diagnostico.trim() !== '') {
            const currentLocal = diagEl.innerText ? diagEl.innerText.trim() : '';
            if (!currentLocal || document.activeElement !== diagEl) {
                let val = updatedPatient.diagnostico;
                let formattedVal = val.includes('<') ? val.toUpperCase() : val.toUpperCase().replace(/\n/g, '<br>');
                if (formattedVal && !formattedVal.startsWith('<b>') && !formattedVal.startsWith('<strong>')) {
                    formattedVal = `<b>${formattedVal}</b>`;
                }
                diagEl.innerHTML = formattedVal;
            }
        }
        
        if (typeof showToast === 'function') {
            showToast("Informe actualizado en tiempo real con cambios de la nube.", "info");
        }
    }
};

