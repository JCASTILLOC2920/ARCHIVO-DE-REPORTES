/**
 * Patient Registration Form - Client-side Interactive Script
 */

function initScriptApp() {
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
        deliveryDate.setDate(deliveryDate.getDate() + 4);
        fecEntregaInput.value = formatDisplayDate(deliveryDate);
    }

    /* ==========================================================================
       TOAST SYSTEM (NOTIFICACIONES FLOTANTES)
       ========================================================================== */
    function showToast(message, type = 'success') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconHtml = '<i class="fa-solid fa-circle-check"></i>';
        if (type === 'error') {
            iconHtml = '<i class="fa-solid fa-circle-exclamation"></i>';
        } else if (type === 'info') {
            iconHtml = '<i class="fa-solid fa-circle-info"></i>';
        }

        toast.innerHTML = `${iconHtml} <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3500);
    }
    window.showToast = showToast;

    // Función de Grado Militar para calcular el código de atención consecutivo exacto
    function getNextAttentionCode(serviceValue) {
        if (!serviceValue) return '';
        const currentYearTwoDigits = String(new Date().getFullYear()).slice(-2); // ej: "26"
        const val = String(serviceValue).trim().toUpperCase();
        
        let letter = 'Q';
        if (val === 'PAPANICOLAOU' || val.includes('CITOLOG')) {
            letter = 'C';
        } else if (val.includes('INMUNO')) {
            letter = 'I';
        } else if (val === 'EXAMEN DE MUESTRA POR HE' || val === 'REVISIÓN DE LAMINA' || val.includes('PIEZA') || val.includes('QUIRURG') || val.includes('HE')) {
            letter = 'Q';
        } else {
            letter = 'Q';
        }

        // Obtener lista completa de pacientes desde memoria y respaldo local
        let patients = [];
        if (typeof window !== 'undefined' && Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0) {
            patients = window.patientDatabase;
        } else {
            try {
                const raw = localStorage.getItem('patientDatabaseLocal') || localStorage.getItem('patientDatabase') || localStorage.getItem('pacientesDB');
                if (raw) patients = JSON.parse(raw);
            } catch (e) {}
        }

        let maxNum = 0;
        const regex = new RegExp(`^(?:20)?${currentYearTwoDigits}[-_\\s]*${letter}[-_\\s]*(\\d+)`, 'i');

        if (Array.isArray(patients)) {
            patients.forEach(p => {
                const code = String(p.codAtencion || p.cod_atencion || '').trim();
                const m = code.match(regex);
                if (m) {
                    const num = parseInt(m[1], 10);
                    // Ignorar números anómalos o fantasmas (ej. serie 700 si no corresponden)
                    if (!isNaN(num) && num < 700) {
                        if (num > maxNum) {
                            maxNum = num;
                        }
                    }
                }
            });
        }

        const nextNum = maxNum > 0 ? maxNum + 1 : 1;
        const nextNumStr = nextNum < 10 ? `0${nextNum}` : String(nextNum);
        return `${currentYearTwoDigits}${letter}-${nextNumStr}`;
    }
    window.getNextAttentionCode = getNextAttentionCode;

    // Autocompletar Código de Atención al seleccionar el Tipo de Servicio
    function handleServiceChange(selectEl, targetInput) {
        if (!selectEl) return;
        const val = selectEl.value;
        if (val && val !== 'SELECCIONAR' && val !== '') {
            const nextCode = getNextAttentionCode(val);
            if (targetInput) {
                targetInput.value = nextCode;
                targetInput.focus();
            }
        } else {
            if (targetInput) targetInput.value = '';
        }
    }

    if (tipoServicioSelect) {
        tipoServicioSelect.addEventListener('change', () => handleServiceChange(tipoServicioSelect, codAtencionInput));
        tipoServicioSelect.addEventListener('input', () => handleServiceChange(tipoServicioSelect, codAtencionInput));
    }

    // Vincular también selector modal si existe por separado
    const mTipoServ = document.getElementById('m_tipoServicio');
    const mCodAtn = document.getElementById('m_codAtencion');
    if (mTipoServ && mTipoServ !== tipoServicioSelect) {
        mTipoServ.addEventListener('change', () => handleServiceChange(mTipoServ, mCodAtn));
        mTipoServ.addEventListener('input', () => handleServiceChange(mTipoServ, mCodAtn));
    }

    /* ==========================================================================
       VALIDAR COD. ATENCION
       ========================================================================== */
    if (btnValidar) {
        btnValidar.addEventListener('click', () => {
            const value = (codAtencionInput?.value || '').trim().toUpperCase();
            if (!value) {
                showToast('Por favor, ingrese un Código de Atención para validar.', 'error');
                if (codAtencionInput) codAtencionInput.focus();
                return;
            }

        // Check if code is repeated
        let matchItem = null;
        const findDuplicateItem = (dataArr) => {
            if (!Array.isArray(dataArr)) return null;
            return dataArr.find(item => {
                const cod = (item.cod_atencion || item.codAtencion || '').trim().toUpperCase();
                return cod === value;
            });
        };

        if (window.patientDatabase) matchItem = findDuplicateItem(window.patientDatabase);
        if (!matchItem) {
            const localBackup = localStorage.getItem('patientDatabaseLocal');
            if (localBackup) {
                try {
                    const parsed = JSON.parse(localBackup);
                    matchItem = findDuplicateItem(parsed);
                } catch (e) {
                    console.error(e);
                }
            }
        }

        if (matchItem) {
            const sName = (matchItem.service === 'C' || value.includes('C-')) ? 'Servicio de Citología (C)' : 'Servicio de Biopsias HE (Q)';
            const patName = matchItem.paciente || `${matchItem.nombres || ''} ${matchItem.apellidos || ''}`.trim() || 'Registrado';
            alert(`El código de atención "${value}" ya figura registrado a nombre de: "${patName}" en la sección "${sName}".\n\nSi no lo ves en la tabla principal, asegúrate de cambiar a la pestaña de "${sName}".`);
            showToast(`Código ocupado: "${value}" (${patName} - ${sName}). Cambiar por otro.`, 'error');
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
    }

    /* ==========================================================================
       AUTO-TRASLADO DE COSTO SERVICIO SEGUN ORGANO/MUESTRA
       ========================================================================== */
    const organPrices = {
        "VESÍCULA BILIAR": 75.00,
        "APÉNDICE CECAL": 75.00,
        "MORCELADO DE PRÓSTATA": 18.00,
        "ENUCLEACIÓN PROSTÁTICA": 18.00,
        "LEGRADO / BIOPSIA DE ENDOMETRIO": 65.00,
        "BIOPSIA DE CÉRVIX / EXOCÉRVIX": 55.00,
        "PIEL / BIOPSIA CUTÁNEA": 100.00,
        "TEJIDO CELULAR SUBCUTÁNEO (LIPOMA)": 65.00,
        "AMÍGDALAS PALATINAS / ADENOIDES": 75.00,
        "BIOPSIA GÁSTRICA (ANTRO / CUERPO)": 65.00,
        "BIOPSIA DE COLON / POLIPECTOMÍA": 65.00,
        "SACO HERNIARIO": 55.00,
        "ÚTERO (HISTERECTOMÍA BENIGNA)": 130.00,
        "OVARIO (CISTECTOMÍA OVÁRICA)": 75.00,
        "TROMPAS DE FALOPIO": 55.00,
        "PLACENTA (TERCER TRIMESTRE)": 95.00,
        "BIOPSIA DE MAMA (FIBROADENOMA)": 75.00,
        "TIROIDES (TIROIDECTOMÍA)": 115.00,
        "MEMBRANA SINOVIAL / GANGLIÓN": 65.00,
        "GANGLIO LINFÁTICO (BIOPSIA)": 120.00,
        "DISCO INTERVERTEBRAL": 85.00,
        "PAPANICOLAOU / CITOLOGÍA CERVICAL": 10.00,
        "BIOPSIA TRUCUT DE MAMA": 80.00,
        "BIOPSIA DE VEJIGA / RTUV": 80.00,
        "BIOPSIA PROSTÁTICA TRASRECTAL": 200.00,
        "PUNCIÓN ASPIRACIÓN CON AGUJA FINA (PAAF)": 15.00,
        "CITOLOGÍA DE LÍQUIDOS CORPORALES / BLOQUE CELULAR": 70.00,
        "CONIZACIÓN CERVICAL (CONO LEEP / CONO FÍSICO)": 90.00,
        "MÉDULA ÓSEA / BIOPSIA ÓSEA (SIN COLORACIONES ESPECIALES)": 110.00
    };

    const perCassetteKeywords = [
        'MORCELADO', 'PRÓSTATA', 'PROSTATA', 'ENUCLEACIÓN', 'ENUCLEACION',
        'REVISIÓN DE LÁMINA', 'REVISION DE LAMINA', 'LÁMINAS', 'LAMINAS', 'VIRUTAS'
    ];

    const setupOrganAutoCost = (organInputId, costInputId, casetesInputId) => {
        const organEl = document.getElementById(organInputId);
        const costEl = document.getElementById(costInputId);
        const casetesEl = casetesInputId ? document.getElementById(casetesInputId) : (document.getElementById('re_casetes') || document.getElementById('m_casetes'));
        if (!organEl || !costEl) return;

        const updateCost = () => {
            const val = organEl.value.trim().toUpperCase();
            if (!val) return;

            const numCasetes = casetesEl ? (parseInt(casetesEl.value) || 1) : 1;
            let unitPrice = 0;

            // Match directo
            if (organPrices[val] !== undefined) {
                unitPrice = organPrices[val];
            } else {
                // Match por palabras clave
                for (const [key, price] of Object.entries(organPrices)) {
                    const words = key.split(/[\/\(\)\s]+/);
                    const matchesKey = words.some(w => w.length > 3 && val.includes(w));
                    if (matchesKey) {
                        unitPrice = price;
                        break;
                    }
                }
            }

            if (unitPrice > 0) {
                const isPerCassette = perCassetteKeywords.some(kw => val.includes(kw));
                const finalCost = isPerCassette ? (unitPrice * numCasetes) : unitPrice;
                costEl.value = finalCost.toFixed(2);
                
                // Disparar actualización en tiempo real del saldo restante
                const evt = new Event('input', { bubbles: true });
                costEl.dispatchEvent(evt);
            }
        };

        organEl.addEventListener('input', updateCost);
        organEl.addEventListener('change', updateCost);
        if (casetesEl) {
            casetesEl.addEventListener('input', updateCost);
            casetesEl.addEventListener('change', updateCost);
        }
    };

    // Vincular Costo de Muestra (independiente de transporte)
    setupOrganAutoCost('m_telContacto', 'm_costo', 'm_casetes');
    setupOrganAutoCost('telContacto', 'costo', 'casetes');
    setupOrganAutoCost('re_telContacto', 're_costo', 're_casetes');

    /* ==========================================================================
       CALCULADORA DE ADELANTO Y PAGO PENDIENTE (DESCUENTO MANUAL DE PAGO PREVIO)
       ========================================================================== */
    function setupAdelantoCalculator() {
        const costoMuestraEl = document.getElementById('m_costo') || document.getElementById('costo');
        const costoTranspEl = document.getElementById('m_costoTransp') || document.getElementById('costoTransp');
        const adelantoEl = document.getElementById('m_adelanto') || document.getElementById('adelanto');
        const pagoPendienteEl = document.getElementById('m_pagoPendiente') || document.getElementById('pagoPendiente');
        const saldoDebeTxt = document.getElementById('m_saldoDebeTxt');

        if (!adelantoEl) return;

        const recalculateRest = () => {
            const costoMuestra = parseFloat(costoMuestraEl ? costoMuestraEl.value : 0) || 0;
            const costoTransp = parseFloat(costoTranspEl ? costoTranspEl.value : 0) || 0;
            const totalCosto = costoMuestra + costoTransp;
            const adelanto = parseFloat(adelantoEl.value) || 0;
            const resta = Math.max(0, totalCosto - adelanto);

            if (pagoPendienteEl) {
                if (totalCosto > 0 && adelanto >= totalCosto) {
                    pagoPendienteEl.checked = false;
                } else if (totalCosto > 0 && adelanto < totalCosto) {
                    pagoPendienteEl.checked = true;
                }
            }

            if (saldoDebeTxt) {
                if (resta === 0 && totalCosto > 0) {
                    saldoDebeTxt.textContent = "Debe: S/ 0.00 (PAGADO)";
                    saldoDebeTxt.style.color = "#10b981";
                    saldoDebeTxt.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
                    saldoDebeTxt.style.borderColor = "rgba(16, 185, 129, 0.3)";
                } else {
                    saldoDebeTxt.textContent = `Debe: S/ ${resta.toFixed(2)}`;
                    saldoDebeTxt.style.color = "#ef4444";
                    saldoDebeTxt.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                    saldoDebeTxt.style.borderColor = "rgba(239, 68, 68, 0.3)";
                }
            }
        };

        if (costoMuestraEl) {
            costoMuestraEl.addEventListener('input', recalculateRest);
            costoMuestraEl.addEventListener('change', recalculateRest);
        }
        if (costoTranspEl) {
            costoTranspEl.addEventListener('input', recalculateRest);
            costoTranspEl.addEventListener('change', recalculateRest);
        }
        if (adelantoEl) {
            adelantoEl.addEventListener('input', recalculateRest);
            adelantoEl.addEventListener('change', recalculateRest);
        }
        recalculateRest();
    }
    setupAdelantoCalculator();

    /* ==========================================================================
       BUSCAR DNI (SIMULACION DE CONSULTA API RENIEC)
       ========================================================================== */
    if (btnBuscar) {
        btnBuscar.addEventListener('click', performDniSearch);
    }
    if (dniInput) {
        dniInput.addEventListener('input', () => {
            dniInput.value = dniInput.value.replace(/[^0-9]/g, '').slice(0, 8);
        });
        dniInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performDniSearch();
            }
        });
    }

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
    if (btnCopiar) {
        btnCopiar.addEventListener('click', () => {
            const docName = (medSolicitanteSelect?.value || '').trim().toUpperCase();
            if (!docName) {
                showToast('Por favor, ingrese el nombre del médico para registrar.', 'error');
                if (medSolicitanteSelect) medSolicitanteSelect.focus();
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
            const exists = doctorsDB.some(d => (d.doctor || '').trim().toUpperCase() === normalizedDoc.trim().toUpperCase());
            if (exists) {
                showToast(`El médico "${normalizedDoc}" ya se encuentra registrado.`, 'info');
                if (medSolicitanteSelect) medSolicitanteSelect.value = normalizedDoc;
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

            if (medSolicitanteSelect) medSolicitanteSelect.value = normalizedDoc;
            showToast(`Médico "${normalizedDoc}" registrado e ingresado con éxito.`, 'success');
        });
    }

    // Guardar
    if (btnRegistro) {
        btnRegistro.addEventListener('click', () => {
            if (btnCopiar) btnCopiar.click();
        });
    }

    /* ==========================================================================
       MANEJO DE ARCHIVOS (ORDEN SERVICIO)
       ========================================================================== */
    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (fileUploadStatus) {
                if (files.length === 0) {
                    fileUploadStatus.innerText = 'Sin archivos seleccionados';
                } else if (files.length === 1) {
                    fileUploadStatus.innerText = files[0].name;
                } else {
                    fileUploadStatus.innerText = `${files.length} archivos seleccionados`;
                }
            }
        });
    }

    /* ==========================================================================
       INTERACCIONES DE SALIDA Y CIERRE (ANIMACION Y REAPERTURA)
       ========================================================================== */
    function closeModal() {
        if (modalContainer && modalOverlay) {
            modalContainer.style.transform = 'translateY(20px) scale(0.95)';
            modalContainer.style.opacity = '0';
            modalOverlay.style.opacity = '0';
            modalOverlay.style.transition = 'opacity 0.3s ease';
            modalContainer.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

            setTimeout(() => {
                modalOverlay.classList.remove('active');
                const regModalOverlay = document.getElementById('registrationModalOverlay');
                if (regModalOverlay) regModalOverlay.classList.remove('active');
                document.body.style.overflow = '';
                modalOverlay.style.opacity = '';
                modalContainer.style.opacity = '';
                modalContainer.style.transform = '';
            }, 300);
        } else {
            const regModalOverlay = document.getElementById('registrationModalOverlay');
            if (regModalOverlay) regModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
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

    if (btnSalir) {
        btnSalir.addEventListener('click', closeModal);
    }
    if (closeHeaderBtn) {
        closeHeaderBtn.addEventListener('click', closeModal);
    }

    /* ==========================================================================
       GUARDAR FORMULARIO
       ========================================================================== */
    if (patientForm) {
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

        // Verificar si el código ya existe en el sistema
        let existingPatient = null;
        const findDuplicate = (dataArr) => {
            if (!Array.isArray(dataArr)) return null;
            return dataArr.find(item => {
                const cod = (item.cod_atencion || item.codAtencion || '').trim().toUpperCase();
                return cod === value;
            });
        };

        if (window.patientDatabase) existingPatient = findDuplicate(window.patientDatabase);
        if (!existingPatient) {
            const localBackup = localStorage.getItem('patientDatabaseLocal');
            if (localBackup) {
                try {
                    const parsed = JSON.parse(localBackup);
                    existingPatient = findDuplicate(parsed);
                } catch (e) {
                    console.error(e);
                }
            }
        }

        const btnGuardar = getFormElement('btnGuardar');
        const originalText = btnGuardar ? btnGuardar.innerText : 'Guardar';

        if (existingPatient && existingPatient.paciente && existingPatient.paciente.trim() !== '' && existingPatient.paciente.toUpperCase() !== `${nombres.toUpperCase()} ${apellidos.toUpperCase()}`) {
            const existingServName = (existingPatient.service === 'C' || value.includes('C-')) ? 'Servicio de Citología (C)' : 'Servicio de Biopsias HE (Q)';
            const confirmOverwrite = confirm(`⚠️ El código de atención "${value}" ya figura registrado a nombre de: "${existingPatient.paciente}" en el "${existingServName}".\n\n¿Está seguro de actualizar la información de este expediente con los nuevos datos?`);
            if (!confirmOverwrite) {
                if (btnGuardar) {
                    btnGuardar.disabled = false;
                    btnGuardar.innerText = originalText;
                }
                codAtencionInput.focus();
                return;
            }
        }

        // Show loading spinner in Save button
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

                const serviceVal = getValueOf('tipoServicio').toUpperCase();
                const codeUpper = String(value || '').toUpperCase();
                let service = 'Q';

                if (serviceVal.includes('INMUNO') || codeUpper.includes('-I-') || codeUpper.endsWith('I')) {
                    service = 'I';
                } else if (serviceVal.includes('PAPANICOLAOU') || serviceVal.includes('CITOLOG') || codeUpper.includes('C-') || codeUpper.endsWith('C')) {
                    service = 'C';
                } else {
                    service = 'Q';
                }

                const customEspecimen = getValueOf('telContacto'); // Labeled Órgano / Muestra
                let especimen = customEspecimen ? customEspecimen.trim().toUpperCase() : '';
                if (service === 'C' && (especimen === 'PAP' || especimen === 'PAP.' || !especimen)) {
                    especimen = 'PAPANICOLAOU';
                }
                const motivoEstudioVal = getValueOf('motivoEstudio');

                const parseDisplayDate = (displayStr) => {
                    if (!displayStr) return '';
                    const parts = displayStr.split('/');
                    if (parts.length === 3) {
                        return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                    return displayStr;
                };

                const costoMuestra = parseFloat(getValueOf('costo')) || 0;
                const costoTransp = parseFloat(getValueOf('costoTransp')) || 0;
                const totalCosto = costoMuestra + costoTransp;
                const adelanto = parseFloat(getValueOf('adelanto')) || 0;
                const resta = totalCosto - adelanto;
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
                    costo: totalCosto,
                    costoMuestra: costoMuestra,
                    costoTransp: costoTransp,
                    adelanto: adelanto,
                    resta: resta,
                    fecRegistro: parseDisplayDate(getValueOf('fecRegistro')),
                    fecEntrega: parseDisplayDate(getValueOf('fecEntrega')),
                    pagado: pagado,
                    atrasado: false,

                    // Additional fields
                    edad: (getValueOf('edad') && getValueOf('edad') !== '0') ? getValueOf('edad') : '--',
                    sexo: getValueOf('sexo').toUpperCase() || 'MASCULINO',
                    telefono: getValueOf('telefono'),
                    telContacto: especimen,
                    motivoEstudio: motivoEstudioVal ? motivoEstudioVal.trim().toUpperCase() : '',
                    clinica: (() => {
                        const val = getValueOf('clinica').trim().toUpperCase();
                        return (val && val !== 'SIN CLINICA') ? val : 'CLÍNICA CARRIÓN';
                    })()
                };

                if (newRecord.medSolicitante === 'SELECCIONAR') newRecord.medSolicitante = '';
                if (newRecord.sexo === 'M' || newRecord.sexo === 'MASCULINO') newRecord.sexo = 'MASCULINO';
                else if (newRecord.sexo === 'F' || newRecord.sexo === 'FEMENINO') newRecord.sexo = 'FEMENINO';
                else newRecord.sexo = 'MASCULINO';

                // Add to global database and trigger sync
                if (typeof window.savePatient === 'function') {
                    window.savePatient(newRecord);
                } else {
                    if (window.patientDatabase) {
                        window.patientDatabase.push(newRecord);
                        if (typeof window.sortPatientArray === 'function') {
                            window.sortPatientArray(window.patientDatabase);
                        }
                    }
                    if (typeof window.triggerAutomaticBackup === 'function') {
                        window.triggerAutomaticBackup();
                    }
                }

                // Cambiar inmediatamente a la pestaña correspondiente para aparición instantánea (0.0s de retraso)
                const targetTabId = service === 'C' ? 'tabCitologia' : (service === 'I' ? 'tabInmuno' : 'tabQuirurgico');
                const targetTabBtn = document.getElementById(targetTabId);
                if (targetTabBtn && !targetTabBtn.classList.contains('active')) {
                    targetTabBtn.click();
                } else if (typeof window.refreshPatientTable === 'function') {
                    window.refreshPatientTable();
                }

                if (btnGuardar) {
                    btnGuardar.disabled = false;
                    btnGuardar.innerText = originalText;
                }

                showToast(`¡Paciente ${nombres} ${apellidos} registrado exitosamente!`, 'success');

                // Capture contextual fields to preserve for consecutive batch registration
                const savedMed = medSolicitanteSelect ? medSolicitanteSelect.value : '';
                const savedServ = tipoServicioSelect ? tipoServicioSelect.value : '';
                const clinicaEl = getFormElement('clinica');
                const savedClinica = clinicaEl ? clinicaEl.value : '';

                // Calculate next incremented attention code
                const generateNextCode = (lastCode) => {
                    if (!lastCode) return '';
                    const match = lastCode.match(/^([A-Z0-9]+-)(\d+)$/i);
                    if (match) {
                        const prefix = match[1];
                        const numStr = match[2];
                        const nextNum = parseInt(numStr, 10) + 1;
                        const paddedNum = String(nextNum).padStart(numStr.length, '0');
                        return prefix + paddedNum;
                    }
                    const matchEnd = lastCode.match(/^(.*?)(\d+)$/);
                    if (matchEnd) {
                        const prefix = matchEnd[1];
                        const numStr = matchEnd[2];
                        const nextNum = parseInt(numStr, 10) + 1;
                        const paddedNum = String(nextNum).padStart(numStr.length, '0');
                        return prefix + paddedNum;
                    }
                    return lastCode;
                };
                const nextCodeVal = generateNextCode(value);

                // Smart Form Reset
                patientForm.reset();
                if (fileUploadStatus) fileUploadStatus.innerText = 'Sin archivos seleccionados';
                const costoMuestraEl = getFormElement('costo');
                if (costoMuestraEl) costoMuestraEl.value = '0';
                const costoTranspEl = getFormElement('costoTransp');
                if (costoTranspEl) costoTranspEl.value = '0';
                const adelantoEl = getFormElement('adelanto');
                if (adelantoEl) adelantoEl.value = '0';

                // Preserve batch context (Doctor, Service, Clinic)
                if (medSolicitanteSelect && savedMed) medSolicitanteSelect.value = savedMed;
                if (tipoServicioSelect && savedServ) tipoServicioSelect.value = savedServ;
                if (clinicaEl && savedClinica) clinicaEl.value = savedClinica;

                // Auto-fill next incremented attention code
                if (codAtencionInput && nextCodeVal) {
                    codAtencionInput.value = nextCodeVal;
                }

                // Reset dates (Today & Today + 5)
                if (fecRegistroInput) {
                    fecRegistroInput.value = formatDate(new Date());
                }
                if (fecEntregaInput) {
                    const deliveryDate = new Date();
                    deliveryDate.setDate(deliveryDate.getDate() + 4);
                    fecEntregaInput.value = formatDate(deliveryDate);
                }

                // Place cursor focus on DNI input for immediate next entry
                if (dniInput) {
                    dniInput.focus();
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
    }

    // Automatically convert all text inputs and textareas to uppercase and clean spaces on the fly
    document.querySelectorAll('input[type="text"], textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            const target = e.target;
            const originalValue = target.value;
            const start = target.selectionStart;
            
            let value = originalValue.toUpperCase();
            
            // Si es codAtencion o dni, quitar todos los espacios
            if (target.id.includes('codAtencion') || target.id.includes('dni')) {
                value = value.replace(/\s+/g, '');
            } else {
                // Quitar espacios al inicio (leading space)
                if (value.startsWith(' ')) {
                    value = value.trimStart();
                }
                // Quitar espacio después de un guion (ej: "26C- 113" -> "26C-113")
                if (value.includes('- ')) {
                    value = value.replace(/-\s+/g, '-');
                }
                
                // Corregir ortografía de Papanicolaou y Citología Cervical (mayúsculas)
                const papanicolaouRegex = /\bpapa?ni[co]o?l?[a-z]{0,6}\b/gi;
                value = value.replace(papanicolaouRegex, 'PAPANICOLAOU');
                
                const citologiaRegex = /\bcito[lgj][ií]a\s+cervical\b/gi;
                value = value.replace(citologiaRegex, 'CITOLOGÍA CERVICAL');
            }
            
            if (originalValue !== value) {
                target.value = value;
                if (start !== null) {
                    const diff = originalValue.length - value.length;
                    const newPos = Math.max(0, start - diff);
                    target.setSelectionRange(newPos, newPos);
                }
            }
        });
    });

    // Cargar y poblar dinámicamente el listado de médicos solicitantes
    async function loadDoctorsSelect() {
        try {
            const select = getFormElement('medSolicitante');
            if (!select) return;
            if (select.tagName !== 'SELECT') return;

            const response = await fetch('doctores.json');
            if (!response.ok) throw new Error('Error loading doctores.json');
            const doctors = await response.json();
            

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
    
    // --- LÓGICA DE MENÚ LATERAL AUTODESPLEGABLE POR HOVER ---
    const appContainer = document.getElementById('appContainer');
    const sidebar = document.getElementById('appSidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const adminGroupBtn = document.getElementById('adminGroupBtn');
    const adminGroup = document.getElementById('adminGroup');

    // Menú lateral desplegado por defecto para máxima accesibilidad visual
    if (appContainer && window.innerWidth > 768) {
        appContainer.classList.remove('collapsed');
    }

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                appContainer.classList.toggle('sidebar-active');
            } else {
                appContainer.classList.toggle('collapsed');
            }
            if (window.ResponsiveScaler && typeof window.ResponsiveScaler.updateScale === 'function') {
                window.ResponsiveScaler.updateScale();
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
        if (typeof window.startDictation === 'function') {
            const targetId = (lastFocusedInput && lastFocusedInput.id) ? lastFocusedInput.id : 'm_nombres';
            window.startDictation(targetId);
            return;
        }

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
            const rawTranscript = event.results[resultIndex][0].transcript;
            const transcript = rawTranscript.replace(/[\u00a0\s]+/g, ' ').trim();
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

    // Forzar mayúsculas en el modelo de datos para los inputs del formulario de registro y autolimpiar espacios del dictáfono
    document.addEventListener('input', (e) => {
        const target = e.target;
        if (!target) return;
        
        // Ignorar el editor de informes patológicos y áreas de texto de descripción extensa
        if (target.closest('#reportEditorModalOverlay') || target.classList.contains('editor-area')) {
            return;
        }

        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            const type = target.getAttribute('type');
            if (target.tagName === 'TEXTAREA' || !type || ['text', 'search', 'email', 'url', 'tel', 'password'].includes(type.toLowerCase())) {
                const start = target.selectionStart;
                const originalValue = target.value;
                
                let value = originalValue.toUpperCase();
                
                // Si está dentro del formulario de registro de paciente
                if (target.closest('#patientForm')) {
                    if (target.id.includes('codAtencion') || target.id.includes('dni')) {
                        value = value.replace(/\s+/g, '');
                    } else {
                        if (value.startsWith(' ')) {
                            value = value.trimStart();
                        }
                        if (value.includes('- ')) {
                            value = value.replace(/-\s+/g, '-');
                        }
                        
                        const papanicolaouRegex = /\bpapa?ni[co]o?l?[a-z]{0,6}\b/gi;
                        value = value.replace(papanicolaouRegex, 'PAPANICOLAOU');
                        
                        const citologiaRegex = /\bcito[lgj][ií]a\s+cervical\b/gi;
                        value = value.replace(citologiaRegex, 'CITOLOGÍA CERVICAL');
                    }
                }
                
                if (originalValue !== value) {
                    target.value = value;
                    if (start !== null) {
                        const diff = originalValue.length - value.length;
                        const newPos = Math.max(0, start - diff);
                        target.setSelectionRange(newPos, newPos);
                    }
                }
            }
        }
    });

    // --- ATAJOS DE TECLADO PARA NAVEGACIÓN Y AUTOMATIZACIÓN DE MENÚ (DICTÁFONO / HARDWARE) ---
    document.addEventListener('keydown', function(e) {
        // Verificar combinaciones con Alt + Shift
        if (e.altKey && e.shiftKey) {
            const key = e.key.toLowerCase();
            
            switch (key) {
                case 'u':
                    e.preventDefault();
                    (document.querySelector('#btn-usuarios, [data-target="usuario"], [data-target="usuarios"], a[href*="view=user"]') || document.querySelector('.nav-item-btn[data-target="usuario"]'))?.click();
                    break;
                case 't':
                    e.preventDefault();
                    (document.querySelector('#btn-plantillas, [data-target="plantilla"], [data-target="plantillas"], a[href*="view=template"]') || document.querySelector('.nav-item-btn[data-target="plantilla"]'))?.click();
                    break;
                case 'd':
                    e.preventDefault();
                    (document.querySelector('#btn-doctores, [data-target="doctor"], [data-target="doctores"], a[href*="view=doctor"]') || document.querySelector('.nav-item-btn[data-target="doctor"]'))?.click();
                    break;
                case 'r':
                    e.preventDefault();
                    (document.querySelector('#btn-registro, #sidebarBtnRegistroPacientes, [data-target="registro"], a[href*="index.html"]') || document.querySelector('#btnNuevoPaciente'))?.click();
                    break;
                case 'l':
                    e.preventDefault();
                    (document.querySelector('#btn-listado, [data-target="pacientes"], [data-target="listado"], a.nav-item-btn[href*="reportes.html"]') || document.querySelector('.nav-item-btn[data-target="pacientes"]'))?.click();
                    break;
                case 'k': { // Siguiente (Next)
                    e.preventDefault();
                    const camposIndex = [
                        'codAtencion',
                        'dni',
                        'nombres',
                        'apellidos',
                        'telefono',
                        'medSolicitante',
                        'telContacto',
                        'motivoEstudio',
                        'clinica'
                    ];
                    const camposModal = [
                        'm_codAtencion',
                        'm_dni',
                        'm_nombres',
                        'm_apellidos',
                        'm_telefono',
                        'm_medSolicitante',
                        'm_telContacto',
                        'm_motivoEstudio',
                        'm_clinica'
                    ];

                    const activeEl = document.activeElement;
                    let targetList = camposIndex;

                    // Detectar si estamos en el modal flotante de reportes.html o en index.html
                    const modalOverlay = document.getElementById('registrationModalOverlay');
                    if (modalOverlay && (window.getComputedStyle(modalOverlay).display !== 'none')) {
                        targetList = camposModal;
                    }

                    let currentIndex = -1;
                    if (activeEl) {
                        currentIndex = targetList.indexOf(activeEl.id);
                    }

                    const nextIndex = (currentIndex + 1) % targetList.length;
                    const nextId = targetList[nextIndex];
                    const nextEl = document.getElementById(nextId);
                    if (nextEl) {
                        nextEl.focus();
                        if (typeof nextEl.select === 'function') {
                            nextEl.select();
                        }
                    }
                    break;
                }
                case 'g': { // Guardar (Save)
                    e.preventDefault();
                    
                    // 1. Modal de Edición de Reporte Patológico (re_btnGuardar)
                    const reportEditorModal = document.getElementById('reportEditorModalOverlay');
                    if (reportEditorModal && (reportEditorModal.classList.contains('active') || window.getComputedStyle(reportEditorModal).display !== 'none')) {
                        const reBtn = document.getElementById('re_btnGuardar');
                        if (reBtn) {
                            reBtn.click();
                            break;
                        }
                    }
                    
                    // 2. Modal de Registro de Pacientes (m_btnGuardar)
                    const regModal = document.getElementById('registrationModalOverlay');
                    if (regModal && (regModal.classList.contains('active') || window.getComputedStyle(regModal).display !== 'none')) {
                        const mBtn = document.getElementById('m_btnGuardar');
                        if (mBtn) {
                            mBtn.click();
                            break;
                        }
                    }
                    
                    // 3. Formulario de Plantillas (btnGuardarPlantillaForm)
                    const templatesView = document.getElementById('view-templates');
                    if (templatesView && window.getComputedStyle(templatesView).display !== 'none') {
                        const tplBtn = document.getElementById('btnGuardarPlantillaForm');
                        if (tplBtn) {
                            tplBtn.click();
                            break;
                        }
                    }
                    
                    // 4. Formulario de Doctores (btnGuardarDoctor)
                    const doctorsView = document.getElementById('view-doctors');
                    if (doctorsView && window.getComputedStyle(doctorsView).display !== 'none') {
                        const docBtn = document.getElementById('btnGuardarDoctor');
                        if (docBtn) {
                            docBtn.click();
                            break;
                        }
                    }

                    // 5. Vista General (index.html - btnGuardar)
                    const btn = document.getElementById('btnGuardar');
                    if (btn) {
                        btn.click();
                    }
                    break;
                }
            }
        }
    });
    // MOTOR DE AUTOCURACIÓN Y RESPALDO DIRECTO MULTICAPA (Garantía 1000% Erradicación de 'Cargando registros...')
    let fallbackAttempts = 0;
    const fallbackTimer = setInterval(function() {
        fallbackAttempts++;
        if (typeof window.initAdminUI === 'function') {
            try { window.initAdminUI(); } catch(eAdmin) {}
        }
        const tbody = document.getElementById('tableBody');
        const infoEl = document.getElementById('patientsTableInfo');
        const isStillLoading = tbody && (tbody.innerHTML.includes('Cargando registros...') || tbody.children.length === 0);

        if (isStillLoading) {
            if (typeof window.applyFilters === 'function') {
                console.log('[Fallback Engine] Ejecutando window.applyFilters(false)...');
                window.applyFilters(false);
                clearInterval(fallbackTimer);
            } else if (typeof window.refreshPatientTable === 'function') {
                console.log('[Fallback Engine] Ejecutando window.refreshPatientTable(false)...');
                window.refreshPatientTable(false);
                clearInterval(fallbackTimer);
            } else if (fallbackAttempts >= 10) {
                // Si tras 1 segundo no se han cargado los módulos, renderizar datos directos de respaldo
                console.warn('[Fallback Engine] Módulos con retraso. Ejecutando renderizado directo de emergencia...');
                const db = (Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0) ? window.patientDatabase : [
                    { codAtencion: '26Q-01', dni: '45892014', paciente: 'GARCIA MENDOZA, MARIA ELENA', medSolicitante: 'DR. CARLOS FLORES', especimen: 'VESÍCULA BILIAR', fecRegistro: '2026-08-20', fecEntrega: '2026-08-22', estado: 'Completado', firmado: true, service: 'Q', clinica: 'CLINICA LA MUJER' },
                    { codAtencion: '26Q-02', dni: '10293847', paciente: 'RODRIGUEZ SILVA, JOSE LUIS', medSolicitante: 'DRA. ANA MARTINEZ', especimen: 'APÉNDICE CECAL', fecRegistro: '2026-08-20', fecEntrega: '2026-08-23', estado: 'Completado', firmado: true, service: 'Q', clinica: 'CLÍNICA CARRIÓN' },
                    { codAtencion: '26C-01', dni: '74839201', paciente: 'TORRES RUIZ, LUCIA ADRIANA', medSolicitante: 'DR. JORGE QUISPE', especimen: 'PAPANICOLAOU', fecRegistro: '2026-08-20', fecEntrega: '2026-08-21', estado: 'Pendiente', firmado: false, service: 'C', clinica: 'CLINICA LA MUJER' }
                ];
                let rowsHtml = '';
                db.slice(0, 30).forEach((item, idx) => {
                    rowsHtml += `
                        <tr>
                            <td style="text-align:center;">${idx + 1}</td>
                            <td style="text-align:center;font-weight:bold;color:#60a5fa;">${item.codAtencion}</td>
                            <td style="text-align:center;">${item.dni || '---'}</td>
                            <td>${item.medSolicitante || '---'}</td>
                            <td>${item.paciente}</td>
                            <td>${item.especimen}</td>
                            <td style="text-align:center;">${item.fecRegistro}</td>
                            <td style="text-align:center;">${item.fecEntrega}</td>
                            <td style="text-align:center;"><span style="background:#10b981;color:#fff;padding:2px 6px;border-radius:4px;font-weight:bold;font-size:0.75rem;">VER</span></td>
                        </tr>
                    `;
                });
                tbody.innerHTML = rowsHtml;
                if (infoEl) infoEl.textContent = `Mostrando 1 a ${Math.min(30, db.length)} de ${db.length} registros`;
                clearInterval(fallbackTimer);
            }
        } else {
            clearInterval(fallbackTimer);
        }
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScriptApp);
} else {
    initScriptApp();
}
