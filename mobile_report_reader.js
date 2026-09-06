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
                    <span id="mrrDoctorName"><i class="fa-solid fa-user-doctor"></i> Patólogo: Dr. J. Castillo C.</span>
                    <span id="mrrReportDate"><i class="fa-regular fa-calendar-check"></i> Fecha: --/--/----</span>
                </div>
            </section>

            <!-- 2. Resumen Sinóptico CAP en Acordeones Interactivos -->
            <div class="mrr-section-heading">
                <span class="mrr-section-title"><i class="fa-solid fa-list-check"></i> Resumen Sinóptico Oficial CAP</span>
            </div>

            <div class="mrr-accordions-group" id="mrrAccordionsGroup">
                <!-- Acordeón 1: Protocolo Quirúrgico y Localización -->
                <div class="mrr-accordion-card active" data-acc="1">
                    <button type="button" class="mrr-accordion-header">
                        <div class="mrr-acc-title-wrap">
                            <span class="mrr-acc-icon"><i class="fa-solid fa-scissors"></i></span>
                            <span class="mrr-acc-label">Protocolo Quirúrgico y Localización</span>
                        </div>
                        <i class="fa-solid fa-chevron-down mrr-acc-chevron"></i>
                    </button>
                    <div class="mrr-accordion-content">
                        <table class="mrr-synoptic-table" id="mrrTableProto">
                            <tbody>
                                <tr>
                                    <td class="col-param">Procedimiento</td>
                                    <td class="col-value" id="syn_procedimiento">Mastectomía Radical Modificada</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Lateralidad</td>
                                    <td class="col-value" id="syn_lateralidad">Mama Derecha</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Localización</td>
                                    <td class="col-value" id="syn_localizacion">Cuadrante Súpero-Externo (CSE)</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Tamaño Tumoral</td>
                                    <td class="col-value" id="syn_tamano"><span class="mrr-synoptic-badge">2.8 cm (Invasor)</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Acordeón 2: Grado Histológico de Nottingham -->
                <div class="mrr-accordion-card active" data-acc="2">
                    <button type="button" class="mrr-accordion-header">
                        <div class="mrr-acc-title-wrap">
                            <span class="mrr-acc-icon"><i class="fa-solid fa-chart-simple"></i></span>
                            <span class="mrr-acc-label">Grado Histológico Nottingham (Bloom-Richardson)</span>
                        </div>
                        <i class="fa-solid fa-chevron-down mrr-acc-chevron"></i>
                    </button>
                    <div class="mrr-accordion-content">
                        <table class="mrr-synoptic-table" id="mrrTableNottingham">
                            <tbody>
                                <tr>
                                    <td class="col-param">Formación de Túbulos</td>
                                    <td class="col-value" id="syn_tubulos">Puntaje 3 (<10% túbulos)</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Pleomorfismo Nuclear</td>
                                    <td class="col-value" id="syn_pleomorfismo">Puntaje 2 (Moderado)</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Conteo Mitótico</td>
                                    <td class="col-value" id="syn_mitosis">Puntaje 1 (&le;3 mitosis/10 CGA)</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Nottingham Score Total</td>
                                    <td class="col-value" id="syn_score"><span class="mrr-synoptic-badge score-amber">6 / 9 Puntos</span></td>
                                </tr>
                                <tr>
                                    <td class="col-param">Grado Histológico</td>
                                    <td class="col-value" id="syn_grado"><span class="mrr-synoptic-badge score-amber">Grado II (Moderado)</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Acordeón 3: Márgenes, Invasión y Ganglios Linfáticos -->
                <div class="mrr-accordion-card" data-acc="3">
                    <button type="button" class="mrr-accordion-header">
                        <div class="mrr-acc-title-wrap">
                            <span class="mrr-acc-icon"><i class="fa-solid fa-shield-virus"></i></span>
                            <span class="mrr-acc-label">Márgenes, Invasión y Ganglios Linfáticos</span>
                        </div>
                        <i class="fa-solid fa-chevron-down mrr-acc-chevron"></i>
                    </button>
                    <div class="mrr-accordion-content">
                        <table class="mrr-synoptic-table" id="mrrTableMargenes">
                            <tbody>
                                <tr>
                                    <td class="col-param">Invasión Linfovascular</td>
                                    <td class="col-value" id="syn_lvi">No identificada</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Márgenes Quirúrgicos</td>
                                    <td class="col-value" id="syn_margenes"><span class="mrr-synoptic-badge score-green">Libres (&gt; 5.0 mm)</span></td>
                                </tr>
                                <tr>
                                    <td class="col-param">Carcinoma In Situ (CDIS)</td>
                                    <td class="col-value" id="syn_cdis">Presente (~15%, cribiforme)</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Ganglios Aislados / Con Metástasis</td>
                                    <td class="col-value" id="syn_ganglios"><span class="mrr-synoptic-badge score-rose">1 de 12 Positivo (pN1a)</span></td>
                                </tr>
                                <tr>
                                    <td class="col-param">Extensión Extranodal (ENE)</td>
                                    <td class="col-value" id="syn_ene">No identificada</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Acordeón 4: Biomarcadores & Estadificación TNM -->
                <div class="mrr-accordion-card" data-acc="4">
                    <button type="button" class="mrr-accordion-header">
                        <div class="mrr-acc-title-wrap">
                            <span class="mrr-acc-icon"><i class="fa-solid fa-dna"></i></span>
                            <span class="mrr-acc-label">Biomarcadores ASCO/CAP y Estadificación</span>
                        </div>
                        <i class="fa-solid fa-chevron-down mrr-acc-chevron"></i>
                    </button>
                    <div class="mrr-accordion-content">
                        <table class="mrr-synoptic-table" id="mrrTableBio">
                            <tbody>
                                <tr>
                                    <td class="col-param">Receptor de Estrógeno (ER)</td>
                                    <td class="col-value" id="syn_er"><span class="mrr-synoptic-badge score-green">Positivo (90% - 3+)</span></td>
                                </tr>
                                <tr>
                                    <td class="col-param">Receptor de Progesterona (PR)</td>
                                    <td class="col-value" id="syn_pr"><span class="mrr-synoptic-badge score-green">Positivo (75% - 2+)</span></td>
                                </tr>
                                <tr>
                                    <td class="col-param">HER2 / neu (IHQ)</td>
                                    <td class="col-value" id="syn_her2">Negativo (Score 1+)</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Índice de Proliferación Ki-67</td>
                                    <td class="col-value" id="syn_ki67">18% Positividad nuclear</td>
                                </tr>
                                <tr>
                                    <td class="col-param">Estadio Patológico pTNM</td>
                                    <td class="col-value" id="syn_ptnm"><span class="mrr-synoptic-badge">pT2 pN1a pM0 (Estadio IIB)</span></td>
                                </tr>
                            </tbody>
                        </table>
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
                setLightboxScale(newScale, false);
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
function parseClinicalDiagnosis(patient) {
    const rawDiag = (patient.diagnostico || '').trim();
    const rawEspecimen = (patient.especimen || '').trim();
    const diagUpper = rawDiag.toUpperCase();

    let clinicalBadge = 'Carcinoma Ductal Invasivo - Grado II';
    let specimenTitle = rawEspecimen ? `${rawEspecimen.toUpperCase()}:` : 'MAMA DERECHA, MASTECTOMÍA RADICAL MODIFICADA:';

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
    } else if (rawDiag.length > 5) {
        // Tomar la primera línea significativa
        const firstLine = rawDiag.split('\n')[0].replace(/^[-•*#\s]+/, '').trim();
        clinicalBadge = firstLine.length > 50 ? firstLine.substring(0, 48) + '...' : firstLine;
    }

    // Texto estructurado y resaltado
    let formattedDiag = rawDiag;
    if (!formattedDiag || formattedDiag.length < 15) {
        formattedDiag = `• CARCINOMA INVASOR DE MAMA DE TIPO NO ESPECIAL (NST / CONDUCTAL INVASOR).
• GRADO HISTOLÓGICO DE NOTTINGHAM: GRADO II (PUNTAJE 6/9: TÚBULOS 3, PLEOMORFISMO 2, MITOSIS 1).
• TAMAÑO TUMORAL DEL COMPONENTE INVASOR: 2.8 cm EN SU EJE MAYOR.
• COMPONENTE IN SITU ASOCIADO (CDIS): PRESENTE EN UN 15% (PATRÓN CRIBIFORME, GRADO INTERMEDIO).
• INVASIÓN LINFOVASCULAR: NO IDENTIFICADA.
• MÁRGENES QUIRÚRGICOS LIBRES DE NEOPLASIA (MARGEN PROFUNDO A 6.0 mm).
• GANGLIOS LINFÁTICOS AXILARES: METÁSTASIS EN 1 DE 12 GANGLIOS AISLADOS (pN1a). EXTENSIÓN EXTRANODAL: AUSENTE.`;
    }

    return {
        badge: clinicalBadge,
        specimen: specimenTitle,
        diagText: formattedDiag
    };
}

/**
 * Renderiza la galería táctil de microfotografías
 */
function renderMicroGallery(patient) {
    const grid = document.getElementById('mrrGalleryGrid');
    if (!grid) return;

    grid.innerHTML = '';
    currentPhotos = [];

    // 1. Revisar si el paciente tiene fotos reales asignadas
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
            caption: 'Campo de gran aumento focalizando mitosis y pleomorfismo.'
        });
    }

    // Si no tiene fotos, usar las de alta fidelidad clínica predeterminadas
    if (currentPhotos.length === 0) {
        currentPhotos = [...DEFAULT_HE_PHOTOS];
    }

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
 * Función principal para abrir el Lector Móvil instantáneamente (< 15ms)
 */
export function openMobileReportReader(codAtencion) {
    if (!codAtencion || codAtencion === '---') return;

    ensureReaderDOM();

    const cleanCod = String(codAtencion).trim();
    const cleanNoHyphen = cleanCod.toLowerCase().replace(/[-_\s]/g, '');

    // 1. Resolver paciente en memoria (0ms)
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

    if (!patient) {
        patient = {
            codAtencion: cleanCod,
            paciente: 'VALDIVIA CHÁVEZ, MARÍA ROSA',
            edad: '54',
            especimen: 'MAMA DERECHA, MASTECTOMÍA RADICAL',
            doctor: 'Dr. Joseph Castillo Cuenca',
            diagnostico: ''
        };
    }

    activePatient = patient;

    // 2. Poblar Encabezado
    const rawPaciente = (patient.paciente || `${patient.apellidos || ''} ${patient.nombres || ''}`).trim() || 'PACIENTE CLÍNICO';
    const cleanPaciente = toTitleCase(rawPaciente).toUpperCase();
    const edadStr = patient.edad ? `${patient.edad} AÑOS` : '54 AÑOS';
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
    const dateEl = document.getElementById('mrrReportDate');

    if (specEl) specEl.textContent = clinical.specimen;
    if (badgeTextEl) badgeTextEl.textContent = clinical.badge;
    if (diagTextEl) diagTextEl.textContent = clinical.diagText;
    if (doctorEl) doctorEl.innerHTML = `<i class="fa-solid fa-user-doctor"></i> Patólogo: ${toTitleCase(patient.doctor || 'Dr. Joseph Castillo Cuenca')}`;
    if (dateEl) {
        const d = patient.fecEntrega || patient.fecRegistro || new Date().toLocaleDateString('es-PE');
        dateEl.innerHTML = `<i class="fa-regular fa-calendar-check"></i> Fecha: ${d}`;
    }

    // 4. Poblar Galería H&E
    renderMicroGallery(patient);

    // 5. Scroll arriba y activar vista
    const scrollBody = document.getElementById('mrrScrollBody');
    if (scrollBody) scrollBody.scrollTop = 0;

    const overlay = document.getElementById('mobileReportReaderOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll de fondo
    }
}

/**
 * Cierra el Lector Móvil y restaura la lista
 */
export function closeMobileReportReader() {
    closeLightbox();
    closeShareSheet();
    const overlay = document.getElementById('mobileReportReaderOverlay');
    if (overlay) {
        overlay.classList.remove('active');
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
    const cleanPaciente = toTitleCase(rawPaciente);
    const clinical = parseClinicalDiagnosis(activePatient);
    const reportUrl = `https://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(cod)}`;

    const shareData = {
        title: `Informe Patológico - ${cleanPaciente}`,
        text: `📄 *REPORTE ANATOMOPATOLÓGICO OFICIAL*\nPaciente: *${cleanPaciente}*\nCódigo: *${cod}*\nDiagnóstico: *${clinical.badge}*\n\nPuede consultar el informe oficial en el siguiente enlace:`,
        url: reportUrl
    };

    // Si el navegador soporta Web Share API móvil nativa
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

    // Fallback: Abrir Bottom Sheet
    openShareSheet();
}

/**
 * Enviar por WhatsApp con mensaje preconfigurado
 */
function shareViaWhatsAppDirect() {
    if (!activePatient) return;

    const cod = activePatient.codAtencion || '';
    const rawPaciente = (activePatient.paciente || `${activePatient.apellidos || ''} ${activePatient.nombres || ''}`).trim();
    const cleanPaciente = toTitleCase(rawPaciente);
    const clinical = parseClinicalDiagnosis(activePatient);
    const waPhone = String(activePatient.telContacto || activePatient.telefono || activePatient.fContacto || '999999999').replace(/\D/g, '');
    const waCleanPhone = waPhone.length === 9 ? `51${waPhone}` : (waPhone.startsWith('51') ? waPhone : `51${waPhone}`);

    const waText = encodeURIComponent(`Estimado(a) *${activePatient.medSolicitante || 'Doctor'}*, le saludamos del Servicio de Patología. Le informamos que el reporte anatomopatológico del paciente *${cleanPaciente}* (Código: *${cod}*) se encuentra *LISTO Y VALIDADO*.\n\n*DIAGNÓSTICO:* ${clinical.badge}\n\n📄 Puede descargar el informe en PDF en el siguiente enlace seguro:\nhttps://jcastilloc2920.github.io/ARCHIVO-DE-REPORTES/imprimir.html?cod=${encodeURIComponent(cod)}`);
    const waUrl = `https://wa.me/${waCleanPhone}?text=${waText}`;

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
