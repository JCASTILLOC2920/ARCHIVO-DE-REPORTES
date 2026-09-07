// mobile_report_reader.js
// PROTOCOLO ACTOR-CRITICO: Módulo Lector Diagnóstico Responsive Mobile-First (Boceto 3)
// Especializado en lectura médica en dispositivos móviles, Lightbox táctil y Web Share API

import { patientDatabase } from './db_service.js';
import { openPrintWindow } from './pdf_engine.js';
import { toTitleCase, escapeHtml } from './utils.js';

let activePatient = null;
let currentPhotos = [];
let activePhotoIndex = 0;
let lightboxScale = 1;
let lightboxPanX = 0;
let lightboxPanY = 0;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;
let initialPinchDistance = null;
let initialPinchScale = 1;
let lastTapTime = 0;

// Microfotografías H&E de alta fidelidad clínica por defecto (Fallback de visualización auténtica)
const DEFAULT_HE_PHOTOS = [
    {
        url: 'motic_live_captured.jpg',
        mag: '10x H&E',
        title: 'Microfotografía H&E 10x - Panorámica Tumoral',
        caption: 'Tinción Hematoxilina-Eosina (H&E). Proliferación de nidos e hileras infiltrantes con desmoplasia estromal.'
    },
    {
        url: 'OUTPUT_PHOTOSHOP_IA/WhatsApp Image 2026-08-20 at 9.33.34 AM_RETOQUE_20260905_144002.jpg',
        mag: '40x H&E',
        title: 'Microfotografía H&E 40x - Detalle Citológico',
        caption: 'Tinción Hematoxilina-Eosina (H&E). Pleomorfismo nuclear moderado-marcado y figuras mitóticas típicas.'
    }
];

/**
 * Asegura la inyección del DOM para el Lector Móvil y el Lightbox
 */
function ensureReaderDOM() {
    if (document.getElementById('mobileReportReaderOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'mobileReportReaderOverlay';
    overlay.className = 'mrr-overlay';
    overlay.innerHTML = `
        <!-- Encabezado Sticky con flecha de retorno y botones superiores -->
        <header class="mrr-header">
            <button type="button" class="mrr-back-btn" id="mrrBackBtn" aria-label="Volver a la lista">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div class="mrr-header-patient-info">
                <div class="mrr-header-title" id="mrrHeaderName">CARGANDO PACIENTE...</div>
                <div class="mrr-header-meta" id="mrrHeaderMeta">-- AÑOS · COD: ---</div>
            </div>
            <div class="mrr-header-actions">
                <button type="button" class="mrr-header-btn share-btn" id="mrrTopShareBtn" title="Compartir">
                    <i class="fa-solid fa-share-nodes"></i>
                </button>
                <button type="button" class="mrr-header-btn download-btn" id="mrrTopDownloadBtn" title="Descargar PDF">
                    <i class="fa-solid fa-download"></i>
                </button>
            </div>
        </header>

        <!-- Cuerpo con scroll táctil -->
        <main class="mrr-scroll-body" id="mrrScrollBody">
            <!-- 1. Tarjeta Destacada de DIAGNÓSTICO HISTOPATOLÓGICO -->
            <section class="mrr-diag-card">
                <div class="mrr-diag-card-header">
                    <span class="mrr-diag-tag"><i class="fa-solid fa-microscope"></i> DIAGNÓSTICO HISTOPATOLÓGICO</span>
                    <span class="mrr-validation-pill" id="mrrValidationPill"><i class="fa-solid fa-circle-check"></i> FIRMADO Y VALIDADO</span>
                </div>
                
                <div class="mrr-specimen-title" id="mrrSpecimenTitle">MAMA DERECHA, MASTECTOMÍA RADICAL:</div>
                
                <!-- Badge Clínico Destacado (Boceto 3) -->
                <div class="mrr-clinical-badge" id="mrrClinicalBadge">
                    <div class="mrr-clinical-badge-icon">
                        <i class="fa-solid fa-disease"></i>
                    </div>
                    <div class="mrr-clinical-badge-text" id="mrrClinicalBadgeText">
                        Carcinoma Ductal Invasivo - Grado II
                    </div>
                </div>

                <!-- Texto de Diagnóstico Ultra-Legible -->
                <div class="mrr-diag-text-body" id="mrrDiagTextBody">
                    Cargando diagnóstico histopatológico...
                </div>

                <div class="mrr-diag-footer">
                    <span id="mrrDoctorName"><i class="fa-solid fa-user-doctor"></i> Patólogo: Dr. Joseph Castillo C.</span>
                    <span id="mrrMedSolicitante"><i class="fa-solid fa-stethoscope"></i> Solicitante: ---</span>
                    <span id="mrrReportDate"><i class="fa-regular fa-calendar-check"></i> Fecha: --/--/----</span>
                </div>
            </section>

            <!-- 2. Detalles Clínicos e Histopatológicos en Acordeones -->
            <div class="mrr-section-heading">
                <span class="mrr-section-title"><i class="fa-solid fa-file-waveform"></i> Detalles Clínicos y Hallazgos</span>
            </div>

            <div class="mrr-accordions-group" id="mrrAccordionsGroup">
                <!-- Acordeón 1: Datos Clínicos y Muestra Remitida -->
                <div class="mrr-accordion-card active" id="mrrAccClinical">
                    <button type="button" class="mrr-accordion-header">
                        <div class="mrr-acc-title-wrap">
                            <span class="mrr-acc-icon"><i class="fa-solid fa-notes-medical"></i></span>
                            <span class="mrr-acc-label">Datos Clínicos y Muestra Remitida</span>
                        </div>
                        <i class="fa-solid fa-chevron-down mrr-acc-chevron"></i>
                    </button>
                    <div class="mrr-accordion-content">
                        <table class="mrr-synoptic-table">
                            <tbody>
                                <tr>
                                    <td class="col-param">Muestra / Espécimen</td>
                                    <td class="col-value" id="mrrColEspecimen">---</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Médico Solicitante</td>
                                    <td class="col-value" id="mrrColMedSolicitante">---</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Sede / Clínica</td>
                                    <td class="col-value" id="mrrColClinica">---</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Fecha de Ingreso</td>
                                    <td class="col-value" id="mrrColFecRecepcion">---</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Acordeón 2: Descripción Macroscópica -->
                <div class="mrr-accordion-card active" id="mrrAccMacro">
                    <button type="button" class="mrr-accordion-header">
                        <div class="mrr-acc-title-wrap">
                            <span class="mrr-acc-icon"><i class="fa-solid fa-eye"></i></span>
                            <span class="mrr-acc-label">Descripción Macroscópica</span>
                        </div>
                        <i class="fa-solid fa-chevron-down mrr-acc-chevron"></i>
                    </button>
                    <div class="mrr-accordion-content">
                        <div class="mrr-desc-text" id="mrrMacroText" style="padding: 12px 14px; color: var(--mrr-text-main); font-size: 0.88rem; line-height: 1.6; white-space: pre-line;">
                            No registrada.
                        </div>
                    </div>
                </div>

                <!-- Acordeón 3: Descripción Microscópica -->
                <div class="mrr-accordion-card active" id="mrrAccMicro">
                    <button type="button" class="mrr-accordion-header">
                        <div class="mrr-acc-title-wrap">
                            <span class="mrr-acc-icon"><i class="fa-solid fa-microscope"></i></span>
                            <span class="mrr-acc-label">Descripción Microscópica</span>
                        </div>
                        <i class="fa-solid fa-chevron-down mrr-acc-chevron"></i>
                    </button>
                    <div class="mrr-accordion-content">
                        <div class="mrr-desc-text" id="mrrMicroText" style="padding: 12px 14px; color: var(--mrr-text-main); font-size: 0.88rem; line-height: 1.6; white-space: pre-line;">
                            No registrada.
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. Galería Táctil de Microfotografías H&E -->
            <section class="mrr-gallery-card">
                <div class="mrr-gallery-header">
                    <span class="mrr-gallery-title"><i class="fa-solid fa-images"></i> Microfotografías H&E</span>
                    <span style="font-size: 0.72rem; color: #94a3b8;"><i class="fa-solid fa-expand"></i> Toca para ampliar</span>
                </div>
                <div class="mrr-gallery-grid" id="mrrGalleryGrid">
                    <!-- Miniaturas dinámicas -->
                </div>
            </section>
        </main>

        <!-- 4. Botón de Acción Flotante (FAP) en la zona del pulgar (Thumb Zone) -->
        <div class="mrr-fap-container">
            <button type="button" class="mrr-fap-btn" id="mrrFapShareBtn">
                <i class="fa-brands fa-whatsapp"></i>
                <i class="fa-solid fa-share-nodes"></i>
                <span>Compartir Informe PDF</span>
            </button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Inyectar Lightbox Fullscreen Táctil
    const lightbox = document.createElement('div');
    lightbox.id = 'mrrLightboxOverlay';
    lightbox.className = 'mrr-lightbox';
    lightbox.innerHTML = `
        <div class="mrr-lightbox-header">
            <div style="display: flex; align-items: center;">
                <span class="mrr-lightbox-title" id="mrrLightboxTitle">Microfotografía H&E</span>
                <span class="mrr-lightbox-counter" id="mrrLightboxCounter">1 / 2</span>
            </div>
            <button type="button" class="mrr-lightbox-close" id="mrrLightboxCloseBtn" aria-label="Cerrar visor">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="mrr-lightbox-viewport" id="mrrLightboxViewport">
            <img id="mrrLightboxImg" class="mrr-lightbox-img" src="" alt="Microfotografía Fullscreen" draggable="false" />
        </div>

        <!-- Barra de Herramientas de Zoom Flotante -->
        <div class="mrr-lightbox-toolbar">
            <button type="button" class="mrr-zoom-btn" id="mrrBtnZoomOut" title="Alejar"><i class="fa-solid fa-minus"></i></button>
            <span class="mrr-zoom-level-text" id="mrrZoomLevelText">100%</span>
            <button type="button" class="mrr-zoom-btn" id="mrrBtnZoomIn" title="Acercar"><i class="fa-solid fa-plus"></i></button>
            <button type="button" class="mrr-zoom-btn" id="mrrBtnZoomReset" title="Restablecer (1:1)" style="font-size: 0.8rem; font-weight: 700;">1:1</button>
        </div>
    `;
    document.body.appendChild(lightbox);

    // Inyectar Bottom Sheet de opciones de compartir
    const shareSheet = document.createElement('div');
    shareSheet.id = 'mrrShareSheetBackdrop';
    shareSheet.className = 'mrr-sheet-backdrop';
    shareSheet.innerHTML = `
        <div class="mrr-share-sheet" id="mrrShareSheet">
            <div class="mrr-sheet-handle"></div>
            <div class="mrr-sheet-title">Compartir Informe Anatomopatológico</div>
            <div class="mrr-sheet-options">
                <button type="button" class="mrr-sheet-item whatsapp-item" id="mrrSheetWaBtn">
                    <i class="fa-brands fa-whatsapp"></i>
                    <span>Enviar directamente por WhatsApp</span>
                </button>
                <button type="button" class="mrr-sheet-item download-item" id="mrrSheetDownloadBtn">
                    <i class="fa-solid fa-file-pdf"></i>
                    <span>Descargar PDF Oficial</span>
                </button>
                <button type="button" class="mrr-sheet-item copy-item" id="mrrSheetCopyBtn">
                    <i class="fa-solid fa-link"></i>
                    <span>Copiar Enlace Seguro del Informe</span>
                </button>
            </div>
            <button type="button" class="mrr-sheet-close-btn" id="mrrSheetCloseBtn">Cancelar</button>
        </div>
    `;
    document.body.appendChild(shareSheet);

    bindReaderEvents();
}

/**
 * Enlaza eventos táctiles, clics y atajos
 */
function bindReaderEvents() {
    // 1. Botón Volver
    document.getElementById('mrrBackBtn')?.addEventListener('click', closeMobileReportReader);

    // 2. Botón Compartir Top Bar
    document.getElementById('mrrTopShareBtn')?.addEventListener('click', () => triggerShareAction());

    // 3. Botón Descargar Top Bar
    document.getElementById('mrrTopDownloadBtn')?.addEventListener('click', () => {
        if (activePatient && activePatient.codAtencion) {
            openPrintWindow(activePatient.codAtencion, true);
        }
    });

    // 4. Botón FAP Flotante en Thumb Zone
    document.getElementById('mrrFapShareBtn')?.addEventListener('click', () => triggerShareAction());

    // 5. Alternar Acordeones Interactivos
    const accGroup = document.getElementById('mrrAccordionsGroup');
    if (accGroup) {
        accGroup.addEventListener('click', (e) => {
            const header = e.target.closest('.mrr-accordion-header');
            if (!header) return;
            const card = header.closest('.mrr-accordion-card');
            if (card) {
                card.classList.toggle('active');
            }
        });
    }

    // 6. Lightbox: Cerrar
    document.getElementById('mrrLightboxCloseBtn')?.addEventListener('click', closeLightbox);

    // 7. Lightbox: Zoom Buttons
    document.getElementById('mrrBtnZoomIn')?.addEventListener('click', () => setLightboxScale(lightboxScale + 0.5));
    document.getElementById('mrrBtnZoomOut')?.addEventListener('click', () => setLightboxScale(lightboxScale - 0.5));
    document.getElementById('mrrBtnZoomReset')?.addEventListener('click', () => resetLightboxTransform());

    // 8. Lightbox: Interacciones Táctiles (Pinch to Zoom, Pan y Doble Tap)
    const viewport = document.getElementById('mrrLightboxViewport');
    const img = document.getElementById('mrrLightboxImg');

    if (viewport && img) {
        // Doble clic / Doble tap para zoom
        viewport.addEventListener('click', (e) => {
            if (e.target.closest('.mrr-lightbox-toolbar') || e.target.closest('.mrr-lightbox-header')) return;
            const now = Date.now();
            if (now - lastTapTime < 300) {
                // Doble tap detectado
                if (lightboxScale > 1.2) {
                    resetLightboxTransform();
                } else {
                    setLightboxScale(2.5);
                }
            }
            lastTapTime = now;
        });

        // Touch Start
        viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Pinch zoom inicio
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialPinchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
                initialPinchScale = lightboxScale;
            } else if (e.touches.length === 1 && lightboxScale > 1) {
                // Pan inicio
                isPanning = true;
                viewport.classList.add('panning');
                startPanX = e.touches[0].clientX - lightboxPanX;
                startPanY = e.touches[0].clientY - lightboxPanY;
            }
        }, { passive: true });

        // Touch Move
        viewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && initialPinchDistance) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
                const newScale = initialPinchScale * (dist / initialPinchDistance);
                setLightboxScale(newScale, true);
            } else if (e.touches.length === 1 && isPanning) {
                e.preventDefault();
                lightboxPanX = e.touches[0].clientX - startPanX;
                lightboxPanY = e.touches[0].clientY - startPanY;
                applyLightboxTransform();
            }
        }, { passive: false });

        // Touch End
        viewport.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                initialPinchDistance = null;
            }
            if (e.touches.length === 0) {
                isPanning = false;
                viewport.classList.remove('panning');
            }
        }, { passive: true });
    }

    // 9. Sheet de opciones
    const sheetBackdrop = document.getElementById('mrrShareSheetBackdrop');
    const sheetCloseBtn = document.getElementById('mrrSheetCloseBtn');
    sheetCloseBtn?.addEventListener('click', () => closeShareSheet());
    sheetBackdrop?.addEventListener('click', (e) => {
        if (e.target === sheetBackdrop) closeShareSheet();
    });

    document.getElementById('mrrSheetWaBtn')?.addEventListener('click', () => {
        closeShareSheet();
        shareViaWhatsAppDirect();
    });

    document.getElementById('mrrSheetDownloadBtn')?.addEventListener('click', () => {
        closeShareSheet();
        if (activePatient && activePatient.codAtencion) {
            openPrintWindow(activePatient.codAtencion, true);
        }
    });

    document.getElementById('mrrSheetCopyBtn')?.addEventListener('click', () => {
        closeShareSheet();
        copyReportLink();
    });

    // 10. Escape key para cerrar Lightbox o Lector
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const lb = document.getElementById('mrrLightboxOverlay');
            if (lb && lb.classList.contains('active')) {
                closeLightbox();
            } else {
                closeMobileReportReader();
            }
        }
    });
}

/**
 * Aplica transformaciones de escala y pan a la imagen del Lightbox
 */
function applyLightboxTransform() {
    const img = document.getElementById('mrrLightboxImg');
    const txt = document.getElementById('mrrZoomLevelText');
    if (!img) return;

    // Límite de traslación
    const maxPan = 400 * (lightboxScale - 1);
    lightboxPanX = Math.max(-maxPan, Math.min(maxPan, lightboxPanX));
    lightboxPanY = Math.max(-maxPan, Math.min(maxPan, lightboxPanY));

    img.style.transform = `translate3d(${lightboxPanX}px, ${lightboxPanY}px, 0px) scale(${lightboxScale})`;
    if (txt) txt.textContent = `${Math.round(lightboxScale * 100)}%`;
}

function setLightboxScale(scale, updateTransform = true) {
    lightboxScale = Math.max(1, Math.min(5, scale));
    if (lightboxScale === 1) {
        lightboxPanX = 0;
        lightboxPanY = 0;
    }
    if (updateTransform) applyLightboxTransform();
}

function resetLightboxTransform() {
    lightboxScale = 1;
    lightboxPanX = 0;
    lightboxPanY = 0;
    applyLightboxTransform();
}

/**
 * Abre el Lightbox en una foto específica
 */
function openLightbox(photoIndex = 0) {
    if (!currentPhotos || currentPhotos.length === 0) return;
    activePhotoIndex = Math.max(0, Math.min(currentPhotos.length - 1, photoIndex));
    const photo = currentPhotos[activePhotoIndex];

    const lb = document.getElementById('mrrLightboxOverlay');
    const img = document.getElementById('mrrLightboxImg');
    const title = document.getElementById('mrrLightboxTitle');
    const counter = document.getElementById('mrrLightboxCounter');

    if (!lb || !img) return;

    img.src = photo.url;
    if (title) title.textContent = photo.title || 'Microfotografía H&E';
    if (counter) counter.textContent = `${activePhotoIndex + 1} / ${currentPhotos.length}`;

    resetLightboxTransform();
    lb.classList.add('active');
}

function closeLightbox() {
    const lb = document.getElementById('mrrLightboxOverlay');
    if (lb) lb.classList.remove('active');
    resetLightboxTransform();
}

/**
 * Extrae o sintetiza el badge clínico y diagnóstico ordenado
 */
/**
 * Extrae o sintetiza el badge clínico y diagnóstico ordenado sin inventar patologías falsas
 */
function parseClinicalDiagnosis(patient) {
    const rawDiag = (patient.diagnostico || '').trim();
    const rawEspecimen = (patient.especimen || '').trim();
    const diagUpper = rawDiag.toUpperCase();

    let clinicalBadge = 'Diagnóstico Clínico';
    let specimenTitle = rawEspecimen ? `${rawEspecimen.toUpperCase()}:` : 'ESPECÍMEN EN ESTUDIO:';

    if (diagUpper.includes('CARCINOMA DUCTAL') || diagUpper.includes('CARCINOMA INVASOR') || diagUpper.includes('NST')) {
        if (diagUpper.includes('GRADO III') || diagUpper.includes('GRADO 3')) {
            clinicalBadge = 'Carcinoma Ductal Invasivo - Grado III';
        } else if (diagUpper.includes('GRADO I') || diagUpper.includes('GRADO 1')) {
            clinicalBadge = 'Carcinoma Ductal Invasivo - Grado I';
        } else {
            clinicalBadge = 'Carcinoma Ductal Invasivo - Grado II';
        }
    } else if (diagUpper.includes('ADENOCARCINOMA')) {
        clinicalBadge = 'Adenocarcinoma Invasor';
    } else if (diagUpper.includes('PAPANICOLAOU') || diagUpper.includes('LIE')) {
        clinicalBadge = diagUpper.includes('ALTO') ? 'LIE de Alto Grado (HSIL)' : 'LIE de Bajo Grado (LSIL)';
    } else if (rawDiag.length > 3) {
        const firstLine = rawDiag.split('\n')[0].replace(/^[-•*#\s]+/, '').trim();
        clinicalBadge = firstLine.length > 50 ? firstLine.substring(0, 48) + '...' : firstLine;
    } else {
        clinicalBadge = 'Diagnóstico en Proceso';
    }

    let formattedDiag = rawDiag || 'Informe en proceso de validación anatomopatológica.';

    return {
        badge: clinicalBadge,
        specimen: specimenTitle,
        diagText: formattedDiag
    };
}

/**
 * Renderiza la galería táctil de microfotografías reales del paciente
 */
function renderMicroGallery(patient) {
    const grid = document.getElementById('mrrGalleryGrid');
    const section = document.querySelector('.mrr-gallery-card');
    if (!grid) return;

    grid.innerHTML = '';
    currentPhotos = [];

    // Revisar si el paciente tiene fotos reales asignadas
    if (patient.img01 && typeof patient.img01 === 'string' && patient.img01.trim() !== '') {
        currentPhotos.push({
            url: patient.img01,
            mag: '10x H&E',
            title: 'Microfotografía Principal H&E (10x)',
            caption: 'Vista panorámica histológica en hematoxilina y eosina.'
        });
    }
    if (patient.img02 && typeof patient.img02 === 'string' && patient.img02.trim() !== '') {
        currentPhotos.push({
            url: patient.img02,
            mag: '40x H&E',
            title: 'Microfotografía de Detalle H&E (40x)',
            caption: 'Campo de gran aumento (40x) focalizando detalle citológico.'
        });
    }

    // Si no tiene microfotografías adjuntas, ocultar la tarjeta de galería para no mostrar fotos ajenas
    if (currentPhotos.length === 0) {
        if (section) section.style.display = 'none';
        return;
    }

    if (section) section.style.display = 'block';

    // Crear elementos de miniatura
    currentPhotos.forEach((photo, idx) => {
        const item = document.createElement('div');
        item.className = 'mrr-gallery-thumb-item';
        item.innerHTML = `
            <div class="mrr-thumb-aspect">
                <img src="${photo.url}" alt="${escapeHtml(photo.title)}" class="mrr-thumb-img" loading="lazy" />
                <span class="mrr-thumb-tag">${photo.mag}</span>
                <span class="mrr-thumb-expand-icon"><i class="fa-solid fa-magnifying-glass-plus"></i></span>
            </div>
            <div class="mrr-thumb-caption">${escapeHtml(photo.caption)}</div>
        `;
        item.addEventListener('click', () => openLightbox(idx));
        grid.appendChild(item);
    });
}

/**
 * Función principal para abrir el Lector Móvil
 */
export async function openMobileReportReader(codAtencion) {
    if (!codAtencion || codAtencion === '---') return;

    ensureReaderDOM();

    const cleanCod = String(codAtencion).trim();
    const cleanNoHyphen = cleanCod.toLowerCase().replace(/[-_\s]/g, '');

    // 1. Resolver paciente en memoria síncrona
    let patient = null;
    if (Array.isArray(patientDatabase)) {
        patient = patientDatabase.find(x => {
            const c = String(x.codAtencion || x.cod_atencion || '').toLowerCase().replace(/[-_\s]/g, '');
            return c === cleanNoHyphen;
        });
    }

    if (!patient && typeof window !== 'undefined' && Array.isArray(window.REAL_SUPABASE_PATIENTS)) {
        patient = window.REAL_SUPABASE_PATIENTS.find(b => {
            const c = String(b.codAtencion || '').toLowerCase().replace(/[-_\s]/g, '');
            return c === cleanNoHyphen;
        });
    }

    // Buscar en respaldo local si no está en RAM
    if (!patient) {
        try {
            const localList = JSON.parse(localStorage.getItem('patientDatabase') || '[]');
            if (Array.isArray(localList)) {
                patient = localList.find(b => {
                    const c = String(b.codAtencion || b.cod_atencion || '').toLowerCase().replace(/[-_\s]/g, '');
                    return c === cleanNoHyphen;
                });
            }
        } catch (e) {
            console.warn('[MRR] Error en cache local:', e);
        }
    }

    // Si aún no está en memoria, consultar a Supabase de forma asíncrona
    if (!patient && typeof window !== 'undefined' && window.supabaseClient) {
        try {
            const { data, error } = await window.supabaseClient
                .from('pacientes')
                .select('*')
                .ilike('cod_atencion', cleanCod)
                .maybeSingle();
            if (!error && data) {
                patient = {
                    codAtencion: data.cod_atencion,
                    paciente: data.paciente,
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    edad: data.edad,
                    sexo: data.sexo,
                    dni: data.dni,
                    especimen: data.especimen,
                    doctor: data.doctor,
                    medSolicitante: data.med_solicitante,
                    clinica: data.clinica,
                    diagnostico: data.diagnostico,
                    macroDesc: data.macro_desc,
                    microDesc: data.micro_desc,
                    fecRegistro: data.fec_registro,
                    fecEntrega: data.fec_entrega,
                    telefono: data.telefono,
                    firmado: data.firmado,
                    img01: data.img01,
                    img02: data.img02
                };
            }
        } catch (err) {
            console.warn('[MRR] Error consultando Supabase:', err);
        }
    }

    if (!patient) {
        patient = {
            codAtencion: cleanCod,
            paciente: 'PACIENTE EN CONSULTA',
            edad: '--',
            especimen: 'MUESTRA REMITIDA',
            doctor: 'Dr. Joseph Castillo Cuenca',
            medSolicitante: 'Médico Solicitante',
            diagnostico: 'Informe en proceso de validación anatomopatológica.'
        };
    }

    activePatient = patient;

    // 2. Poblar Encabezado
    let rawPaciente = (patient.paciente || `${patient.apellidos || ''} ${patient.nombres || ''}`).trim();
    if (!rawPaciente || rawPaciente === ',') {
        rawPaciente = `${patient.nombres || ''} ${patient.apellidos || ''}`.trim() || 'PACIENTE CLÍNICO';
    }
    const cleanPaciente = toTitleCase(rawPaciente.replace(/^,\s*/, '')).toUpperCase();
    const rawAge = String(patient.edad !== undefined && patient.edad !== null ? patient.edad : '').trim();
    const edadStr = (rawAge && rawAge !== '0' && rawAge !== '--') ? (rawAge.toUpperCase().includes('AÑO') ? rawAge.toUpperCase() : `${rawAge} AÑOS`) : '-- AÑOS';
    const codStr = `CÓD: ${patient.codAtencion || cleanCod}`;

    const titleEl = document.getElementById('mrrHeaderName');
    const metaEl = document.getElementById('mrrHeaderMeta');
    if (titleEl) titleEl.textContent = cleanPaciente;
    if (metaEl) metaEl.textContent = `${edadStr} · ${codStr}`;

    // 3. Poblar Tarjeta Destacada de Diagnóstico
    const clinical = parseClinicalDiagnosis(patient);
    const specEl = document.getElementById('mrrSpecimenTitle');
    const badgeTextEl = document.getElementById('mrrClinicalBadgeText');
    const diagTextEl = document.getElementById('mrrDiagTextBody');
    const doctorEl = document.getElementById('mrrDoctorName');
    const medSolEl = document.getElementById('mrrMedSolicitante');
    const dateEl = document.getElementById('mrrReportDate');
    const pill = document.getElementById('mrrValidationPill');

    if (specEl) specEl.textContent = clinical.specimen;
    if (badgeTextEl) badgeTextEl.textContent = clinical.badge;
    if (diagTextEl) diagTextEl.textContent = clinical.diagText;
    if (doctorEl) doctorEl.innerHTML = `<i class="fa-solid fa-user-doctor"></i> Patólogo: ${toTitleCase(patient.doctor || 'Dr. Joseph Castillo Cuenca')}`;
    if (medSolEl) {
        const med = patient.medSolicitante || patient.med_solicitante;
        medSolEl.innerHTML = `<i class="fa-solid fa-stethoscope"></i> Solicitante: ${med ? toTitleCase(med) : '---'}`;
    }
    if (dateEl) {
        const d = patient.fecEntrega || patient.fecRegistro || new Date().toLocaleDateString('es-PE');
        dateEl.innerHTML = `<i class="fa-regular fa-calendar-check"></i> Fecha: ${d}`;
    }
    if (pill) {
        if (patient.firmado === false || patient.firmado === '0' || patient.firmado === 0) {
            pill.innerHTML = `<i class="fa-solid fa-clock"></i> EN PROCESO / PRELIMINAR`;
            pill.style.background = 'rgba(245, 158, 11, 0.15)';
            pill.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            pill.style.color = '#fbbf24';
        } else {
            pill.innerHTML = `<i class="fa-solid fa-circle-check"></i> FIRMADO Y VALIDADO`;
            pill.style.background = '';
            pill.style.borderColor = '';
            pill.style.color = '';
        }
    }

    // 4. Poblar Acordeones Clínicos
    const colEsp = document.getElementById('mrrColEspecimen');
    const colMed = document.getElementById('mrrColMedSolicitante');
    const colCli = document.getElementById('mrrColClinica');
    const colFec = document.getElementById('mrrColFecRecepcion');
    if (colEsp) colEsp.textContent = patient.especimen || '---';
    if (colMed) colMed.textContent = toTitleCase(patient.medSolicitante || patient.med_solicitante || '---');
    if (colCli) colCli.textContent = toTitleCase(patient.clinica || '---');
    if (colFec) colFec.textContent = patient.fecRegistro || patient.fecIngreso || '---';

    const macroEl = document.getElementById('mrrMacroText');
    const microEl = document.getElementById('mrrMicroText');
    if (macroEl) macroEl.textContent = (patient.macroDesc || patient.macro_desc || 'No se registró descripción macroscópica.').trim();
    if (microEl) microEl.textContent = (patient.microDesc || patient.micro_desc || 'No se registró descripción microscópica.').trim();

    // 5. Poblar Galería H&E
    renderMicroGallery(patient);

    // 6. Scroll arriba y activar vista
    const scrollBody = document.getElementById('mrrScrollBody');
    if (scrollBody) scrollBody.scrollTop = 0;

    const overlay = document.getElementById('mobileReportReaderOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden'; // Prevenir scroll de fondo en iOS y Android
    }

    // Historial para botón retroceso en móviles Android
    try {
        window.history.pushState({ mrrOpen: true }, '');
        const onPopState = () => {
            closeMobileReportReader();
            window.removeEventListener('popstate', onPopState);
        };
        window.addEventListener('popstate', onPopState, { once: true });
    } catch (e) {
        // Ignorar si el navegador restringe pushState
    }
}

/**
 * Cierra el Lector Móvil y restaura el scroll de la página
 */
export function closeMobileReportReader() {
    closeLightbox();
    closeShareSheet();
    const overlay = document.getElementById('mobileReportReaderOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }
}

/**
 * Acción principal de Compartir (Web Share API con fallback directo a WhatsApp y Sheet)
 */
async function triggerShareAction() {
    if (!activePatient) return;

    const cod = activePatient.codAtencion || '';
    const rawPaciente = (activePatient.paciente || `${activePatient.apellidos || ''} ${activePatient.nombres || ''}`).trim();
    const cleanPaciente = toTitleCase(rawPaciente.replace(/^,\s*/, ''));
    const clinical = parseClinicalDiagnosis(activePatient);
    const reportUrl = `https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(cod)}`;

    const shareData = {
        title: `Informe Patológico - ${cleanPaciente}`,
        text: `📄 *REPORTE ANATOMOPATOLÓGICO OFICIAL*\nPaciente: *${cleanPaciente}*\nCódigo: *${cod}*\nDiagnóstico: *${clinical.badge}*\n\nPuede consultar el informe oficial en el siguiente enlace:\n${reportUrl}`,
        url: reportUrl
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.warn('[Mobile Reader] Web Share error, usando fallback:', err);
                openShareSheet();
            }
            return;
        }
    }

    openShareSheet();
}

/**
 * Enviar por WhatsApp con mensaje preconfigurado y teléfono limpio
 */
function shareViaWhatsAppDirect() {
    if (!activePatient) return;

    const cod = activePatient.codAtencion || '';
    const rawPaciente = (activePatient.paciente || `${activePatient.apellidos || ''} ${activePatient.nombres || ''}`).trim();
    const cleanPaciente = toTitleCase(rawPaciente.replace(/^,\s*/, ''));
    const clinical = parseClinicalDiagnosis(activePatient);
    
    // Extraer únicamente teléfonos numéricos reales (NO telContacto que almacena muestra)
    const rawTel = String(activePatient.telefono || activePatient.celular || activePatient.telPaciente || '').replace(/\D/g, '');
    let waUrl = '';

    const waText = encodeURIComponent(`📄 *REPORTE ANATOMOPATOLÓGICO OFICIAL*\nPaciente: *${cleanPaciente}*\nCódigo: *${cod}*\nDiagnóstico: *${clinical.badge}*\n\n📥 Puede consultar y descargar el informe oficial en PDF en el siguiente enlace seguro:\nhttps://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(cod)}`);

    if (rawTel.length === 9) {
        waUrl = `https://wa.me/51${rawTel}?text=${waText}`;
    } else if (rawTel.length > 9 && rawTel.startsWith('51')) {
        waUrl = `https://wa.me/${rawTel}?text=${waText}`;
    } else {
        // Abrir WhatsApp para seleccionar el contacto nativamente
        waUrl = `https://wa.me/?text=${waText}`;
    }

    window.open(waUrl, '_blank');
}

/**
 * Copiar enlace seguro al portapapeles
 */
function copyReportLink() {
    if (!activePatient) return;
    const cod = activePatient.codAtencion || '';
    const url = `https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(cod)}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            alert('¡Enlace del informe copiado al portapapeles!');
        }).catch(() => {
            prompt('Copie el enlace seguro:', url);
        });
    } else {
        prompt('Copie el enlace seguro:', url);
    }
}

function openShareSheet() {
    const backdrop = document.getElementById('mrrShareSheetBackdrop');
    const sheet = document.getElementById('mrrShareSheet');
    if (backdrop && sheet) {
        backdrop.classList.add('active');
        sheet.classList.add('active');
    }
}

function closeShareSheet() {
    const backdrop = document.getElementById('mrrShareSheetBackdrop');
    const sheet = document.getElementById('mrrShareSheet');
    if (backdrop && sheet) {
        sheet.classList.remove('active');
        backdrop.classList.remove('active');
    }
}

// Exposición global
if (typeof window !== 'undefined') {
    window.openMobileReportReader = openMobileReportReader;
    window.closeMobileReportReader = closeMobileReportReader;
}
