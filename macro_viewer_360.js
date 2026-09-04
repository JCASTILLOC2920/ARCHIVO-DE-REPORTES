/**
 * MACRO VIEWER 360° - Motor Clínico de Visualización Macroscópica 360°
 * Patología Quirúrgica Digital - 100% Client-Side, Costo $0, Cero Latencia
 * 
 * Funcionalidades:
 * 1. Extractor Equidistante de 24 Fotogramas (MP4, MOV, WebM) -> WebP 800x800
 * 2. Controlador Interactivo 360° en Canvas (Mouse Drag, Touch Swipe, Teclas Flecha <-/->, Inercia, Zoom, Auto-Spin y HUD de Grados)
 */

// ============================================================================
// 1. MOTOR DE EXTRACCIÓN EQUIDISTANTE DE 24 FOTOGRAMAS
// ============================================================================

/**
 * Extrae 24 fotogramas matemáticamente equidistantes de un video subido.
 * @param {File|Blob} videoFile - Archivo de video (MP4, MOV, WebM)
 * @param {Object} [options]
 * @param {number} [options.frameCount=24] - Cantidad de fotogramas (por defecto 24, i.e. 15° por frame)
 * @param {number} [options.targetWidth=800] - Ancho del fotograma
 * @param {number} [options.targetHeight=800] - Alto del fotograma
 * @param {number} [options.quality=0.82] - Calidad WebP
 * @param {Function} [options.onProgress] - Callback de progreso: ({ current, total, percentage, message })
 * @returns {Promise<{ frames: string[], duration: number, width: number, height: number }>}
 */
export async function extract24FramesFromVideo(videoFile, options = {}) {
    const {
        frameCount = 24,
        targetWidth = 800,
        targetHeight = 800,
        quality = 0.82,
        onProgress = null
    } = options;

    if (!videoFile) {
        throw new Error("No se ha seleccionado ningún archivo de video.");
    }

    const videoUrl = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const notifyProgress = async (current, total, msg = '') => {
        if (typeof onProgress === 'function') {
            const percentage = Math.round((current / total) * 100);
            const message = msg || `Extrayendo ángulo ${current}/${total} (${Math.round((current - 1) * (360 / total))}°)...`;
            onProgress({ current, total, percentage, message });
            await new Promise(r => setTimeout(r, 10)); // Ceder hilo a la UI
        }
    };

    try {
        await notifyProgress(0, frameCount, "Cargando video y calculando rotación...");

        // 1. Cargar metadatos
        await new Promise((resolve, reject) => {
            const onLoaded = () => { cleanup(); resolve(); };
            const onError = () => { cleanup(); reject(new Error("Formato de video no compatible o archivo dañado.")); };
            const cleanup = () => {
                video.removeEventListener('loadedmetadata', onLoaded);
                video.removeEventListener('error', onError);
            };
            video.addEventListener('loadedmetadata', onLoaded, { once: true });
            video.addEventListener('error', onError, { once: true });
            video.src = videoUrl;
        });

        // 2. Corregir duración en caso de WebM / streams con duración Infinity
        let duration = video.duration;
        if (!Number.isFinite(duration) || isNaN(duration) || duration <= 0) {
            duration = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error("Tiempo de espera agotado al leer duración del video.")), 6000);
                const onProbeTime = () => {
                    clearTimeout(timeout);
                    video.removeEventListener('timeupdate', onProbeTime);
                    const realDur = video.currentTime;
                    video.currentTime = 0;
                    video.addEventListener('seeked', () => resolve(realDur), { once: true });
                };
                video.addEventListener('timeupdate', onProbeTime);
                video.currentTime = 1e9; // Forzar lectura final
            });
        }

        if (duration <= 0) throw new Error("Duración del video no válida.");

        const videoW = video.videoWidth || 800;
        const videoH = video.videoHeight || 800;

        // Función de salto precisa con sincronización rVFC / rAF
        const seekToTime = (targetTime) => {
            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    cleanup();
                    resolve(); // Fallback si se excede el tiempo
                }, 3500);

                const cleanup = () => {
                    clearTimeout(timeoutId);
                    video.removeEventListener('seeked', onSeeked);
                    video.removeEventListener('error', onSeekErr);
                };

                const onSeekErr = (e) => { cleanup(); reject(new Error("Error al posicionar fotograma del video.")); };
                const onSeeked = () => {
                    cleanup();
                    if ('requestVideoFrameCallback' in video) {
                        let fired = false;
                        video.requestVideoFrameCallback(() => { fired = true; resolve(); });
                        setTimeout(() => { if (!fired) resolve(); }, 60);
                    } else {
                        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
                    }
                };

                video.addEventListener('seeked', onSeeked, { once: true });
                video.addEventListener('error', onSeekErr, { once: true });
                video.currentTime = targetTime;
            });
        };

        const frames = [];
        const epsilon = 0.05; // Protección límite fin de video

        for (let k = 0; k < frameCount; k++) {
            const theoreticalTime = k * (duration / frameCount);
            const safeTime = Math.min(theoreticalTime, Math.max(0, duration - epsilon));

            await seekToTime(safeTime);

            // Fondo neutro oscuro clínico
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // Relación de aspecto contain (ajuste óptico completo de la pieza quirúrgica)
            const scale = Math.min(targetWidth / videoW, targetHeight / videoH);
            const dw = videoW * scale;
            const dh = videoH * scale;
            const dx = (targetWidth - dw) / 2;
            const dy = (targetHeight - dh) / 2;

            ctx.drawImage(video, 0, 0, videoW, videoH, dx, dy, dw, dh);

            // Convertir a WebP
            const webpData = canvas.toDataURL('image/webp', quality);
            frames.push(webpData);

            await notifyProgress(k + 1, frameCount);
        }

        return {
            frames,
            duration,
            width: targetWidth,
            height: targetHeight
        };

    } finally {
        URL.revokeObjectURL(videoUrl);
        video.pause();
        video.removeAttribute('src');
        video.load();
        canvas.width = 0;
        canvas.height = 0;
    }
}


// ============================================================================
// 2. CONTROLADOR INTERACTIVO 360° (CANVAS ENGINE)
// ============================================================================

export class Macro360Viewer {
    /**
     * @param {HTMLElement} container - Contenedor DOM donde se montará el visor
     * @param {Object} [options]
     */
    constructor(container, options = {}) {
        if (!container) throw new Error("Contenedor del visor 360° requerido.");
        this.container = container;
        this.options = Object.assign({
            frameCount: 24,
            autoSpinSpeed: 1.2, // grados por frame en auto-spin
            inertiaFriction: 0.92,
            minInertiaVelocity: 0.04,
            zoomMin: 1.0,
            zoomMax: 3.0,
            onAngleChange: null
        }, options);

        this.frames = []; // Array de DataURLs o URLs
        this.images = []; // Array de HTMLImageElement precargados
        this.currentAngle = 0; // Grados 0 a 359.99
        this.currentFrame = 0; // Índice 0 a 23
        this.isLoaded = false;
        this.isAutoSpinning = false;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartAngle = 0;
        this.lastPointerX = 0;
        this.lastPointerTime = 0;
        this.velocity = 0;
        this.rafId = null;

        // Zoom y Pan
        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.initialPinchDistance = null;

        this._setupDOM();
        this._bindEvents();
    }

    _setupDOM() {
        this.container.innerHTML = `
            <div class="macro360-stage" style="position: relative; width: 100%; height: 100%; min-height: 420px; background: #020617; border-radius: 10px; overflow: hidden; display: flex; align-items: center; justify-content: center; user-select: none; touch-action: none;">
                <!-- Canvas de renderizado 60FPS -->
                <canvas class="macro360-canvas" style="width: 100%; height: 100%; object-fit: contain; cursor: grab; display: block;"></canvas>
                
                <!-- HUD de Información y Ángulo -->
                <div class="macro360-hud" style="position: absolute; top: 12px; left: 12px; display: flex; flex-direction: column; gap: 6px; pointer-events: none; z-index: 10;">
                    <div class="macro360-badge-angle" style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(6px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 20px; padding: 4px 12px; display: inline-flex; align-items: center; gap: 6px; color: #38bdf8; font-family: monospace; font-size: 0.85rem; font-weight: 800; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                        <i class="fa-solid fa-arrows-rotate" style="font-size: 0.75rem;"></i>
                        <span class="macro360-angle-txt">0°</span>
                        <span class="macro360-orientation-txt" style="color: #94a3b8; font-size: 0.72rem; font-weight: 600;">(Anterior)</span>
                    </div>
                    <div class="macro360-badge-frame" style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2px 8px; width: fit-content; color: #94a3b8; font-size: 0.7rem; font-family: monospace;">
                        Fotograma: <strong class="macro360-frame-txt" style="color: #f8fafc;">1/24</strong>
                    </div>
                </div>

                <!-- HUD de Controles Flotantes Superiores / Acciones -->
                <div class="macro360-hud-tools" style="position: absolute; top: 12px; right: 12px; display: flex; gap: 6px; z-index: 10;">
                    <button type="button" class="macro360-btn-tool" data-action="reset" title="Restablecer Posición y Zoom" style="background: rgba(15, 23, 42, 0.85); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
                        <i class="fa-solid fa-arrows-to-dot"></i>
                    </button>
                    <button type="button" class="macro360-btn-tool" data-action="toggle-spin" title="Giro Automático Continuo" style="background: rgba(15, 23, 42, 0.85); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
                        <i class="fa-solid fa-play"></i>
                    </button>
                    <button type="button" class="macro360-btn-tool" data-action="zoom-in" title="Acercar (Zoom)" style="background: rgba(15, 23, 42, 0.85); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <i class="fa-solid fa-magnifying-glass-plus"></i>
                    </button>
                    <button type="button" class="macro360-btn-tool" data-action="zoom-out" title="Alejar" style="background: rgba(15, 23, 42, 0.85); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <i class="fa-solid fa-magnifying-glass-minus"></i>
                    </button>
                </div>

                <!-- Barra Inferior de Navegación Rápida -->
                <div class="macro360-bottom-bar" style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.12); padding: 6px 14px; border-radius: 30px; z-index: 10; max-width: 90%;">
                    <button type="button" class="macro360-nav-btn" data-dir="-1" title="Girar a la Izquierda (Tecla Flecha Izquierda)" style="background: none; border: none; color: #38bdf8; font-size: 1.1rem; cursor: pointer; padding: 2px 6px;">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <input type="range" class="macro360-slider" min="0" max="23" value="0" step="1" style="width: 160px; accent-color: #38bdf8; cursor: pointer;">
                    <button type="button" class="macro360-nav-btn" data-dir="1" title="Girar a la Derecha (Tecla Flecha Derecha)" style="background: none; border: none; color: #38bdf8; font-size: 1.1rem; cursor: pointer; padding: 2px 6px;">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                    <span style="border-left: 1px solid rgba(255,255,255,0.15); height: 16px; margin: 0 4px;"></span>
                    <span style="color: #64748b; font-size: 0.72rem; font-weight: 600; white-space: nowrap;">
                        <i class="fa-solid fa-keyboard"></i> Use teclas ← / →
                    </span>
                </div>

                <!-- Overlay de Carga / Inicial -->
                <div class="macro360-loading-overlay" style="position: absolute; inset: 0; background: #0b1329; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; z-index: 20;">
                    <i class="fa-solid fa-arrows-spin fa-spin" style="font-size: 2.2rem; color: #38bdf8;"></i>
                    <span class="macro360-loading-txt" style="color: #cbd5e1; font-weight: 600; font-size: 0.88rem;">Cargando modelo macroscópico 360°...</span>
                </div>
            </div>
        `;

        this.canvas = this.container.querySelector('.macro360-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.angleTxt = this.container.querySelector('.macro360-angle-txt');
        this.orientTxt = this.container.querySelector('.macro360-orientation-txt');
        this.frameTxt = this.container.querySelector('.macro360-frame-txt');
        this.slider = this.container.querySelector('.macro360-slider');
        this.loadingOverlay = this.container.querySelector('.macro360-loading-overlay');
        this.btnToggleSpin = this.container.querySelector('[data-action="toggle-spin"]');

        this._resizeCanvas();
    }

    _resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = (rect.width || 800) * dpr;
        this.canvas.height = (rect.height || 600) * dpr;
        this.ctx.scale(dpr, dpr);
    }

    /**
     * Carga y precarga un conjunto de 24 fotogramas
     * @param {string[]} framesArray - Array de DataURLs o URLs de los 24 frames
     */
    async loadFrames(framesArray) {
        if (!framesArray || !Array.isArray(framesArray) || framesArray.length === 0) {
            this.loadingOverlay.style.display = 'flex';
            this.loadingOverlay.querySelector('.macro360-loading-txt').textContent = "No hay datos 360° cargados.";
            this.loadingOverlay.querySelector('i').className = "fa-solid fa-cube";
            return;
        }

        this.frames = framesArray;
        this.options.frameCount = framesArray.length;
        this.loadingOverlay.style.display = 'flex';
        this.loadingOverlay.querySelector('.macro360-loading-txt').textContent = "Precargando fotogramas 360°...";

        // Precargar todas las imágenes en paralelo
        const loadPromises = framesArray.map((src, index) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = src;
            });
        });

        this.images = await Promise.all(loadPromises);
        this.isLoaded = true;
        this.loadingOverlay.style.display = 'none';

        // Iniciar en fotograma 0 (Ángulo 0°)
        this.setAngle(0);
        this._startRenderLoop();
    }

    setAngle(angleDeg) {
        // Normalizar a [0, 360)
        let norm = ((angleDeg % 360) + 360) % 360;
        this.currentAngle = norm;

        const count = this.options.frameCount || 24;
        const degPerFrame = 360 / count;

        // Mapeo simétrico al fotograma más cercano
        const frameIdx = Math.floor((norm + (degPerFrame / 2)) / degPerFrame) % count;
        this.currentFrame = frameIdx;

        this._updateHUD();
        this._render();

        if (typeof this.options.onAngleChange === 'function') {
            this.options.onAngleChange(this.currentAngle, this.currentFrame);
        }
    }

    _updateHUD() {
        const roundedDeg = Math.round(this.currentAngle);
        if (this.angleTxt) this.angleTxt.textContent = `${roundedDeg}°`;
        if (this.frameTxt) this.frameTxt.textContent = `${this.currentFrame + 1}/${this.options.frameCount}`;
        if (this.slider && document.activeElement !== this.slider) {
            this.slider.value = this.currentFrame;
        }

        // Orientación anatómica cardinal
        let orient = '';
        if (roundedDeg >= 338 || roundedDeg < 23) orient = '(Anterior)';
        else if (roundedDeg >= 23 && roundedDeg < 68) orient = '(Anterolateral Der.)';
        else if (roundedDeg >= 68 && roundedDeg < 113) orient = '(Lateral Der. 90°)';
        else if (roundedDeg >= 113 && roundedDeg < 158) orient = '(Posterolateral Der.)';
        else if (roundedDeg >= 158 && roundedDeg < 203) orient = '(Posterior 180°)';
        else if (roundedDeg >= 203 && roundedDeg < 248) orient = '(Posterolateral Izq.)';
        else if (roundedDeg >= 248 && roundedDeg < 293) orient = '(Lateral Izq. 270°)';
        else if (roundedDeg >= 293 && roundedDeg < 338) orient = '(Anterolateral Izq.)';

        if (this.orientTxt) this.orientTxt.textContent = orient;
    }

    _render() {
        if (!this.isLoaded || !this.images[this.currentFrame]) return;

        const rect = this.canvas.getBoundingClientRect();
        const w = rect.width || 800;
        const h = rect.height || 600;
        const img = this.images[this.currentFrame];

        this.ctx.save();
        this.ctx.clearRect(0, 0, w, h);

        // Fondo de estudio fotográfico médico (degradado sutil)
        const bgGrad = this.ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, Math.max(w, h));
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, w, h);

        // Transformaciones de Zoom y Pan
        this.ctx.translate(w / 2 + this.panX, h / 2 + this.panY);
        this.ctx.scale(this.scale, this.scale);

        // Dibujar imagen centrada y escalada proporcionalmente
        const imgW = img.naturalWidth || 800;
        const imgH = img.naturalHeight || 800;
        const scaleFit = Math.min((w * 0.92) / imgW, (h * 0.92) / imgH);
        const dw = imgW * scaleFit;
        const dh = imgH * scaleFit;

        this.ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        this.ctx.restore();
    }

    _startRenderLoop() {
        if (this.rafId) cancelAnimationFrame(this.rafId);

        const loop = () => {
            // Manejo de Inercia de giro
            if (!this.isDragging && Math.abs(this.velocity) > this.options.minInertiaVelocity) {
                this.setAngle(this.currentAngle + this.velocity);
                this.velocity *= this.options.inertiaFriction;
            } else if (!this.isDragging && Math.abs(this.velocity) <= this.options.minInertiaVelocity) {
                this.velocity = 0;
            }

            // Manejo de Auto-Spin
            if (this.isAutoSpinning && !this.isDragging) {
                this.setAngle(this.currentAngle + this.options.autoSpinSpeed);
            }

            this.rafId = requestAnimationFrame(loop);
        };

        this.rafId = requestAnimationFrame(loop);
    }

    _bindEvents() {
        // Redimensionamiento
        window.addEventListener('resize', () => {
            this._resizeCanvas();
            this._render();
        });

        // Pointer Events (Mouse + Touch unificado)
        this.canvas.addEventListener('pointerdown', (e) => {
            this.canvas.setPointerCapture(e.pointerId);
            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.dragStartAngle = this.currentAngle;
            this.lastPointerX = e.clientX;
            this.lastPointerTime = performance.now();
            this.velocity = 0;
            this.canvas.style.cursor = 'grabbing';
        });

        this.canvas.addEventListener('pointermove', (e) => {
            if (!this.isDragging) return;

            const now = performance.now();
            const dt = Math.max(1, now - this.lastPointerTime);
            const dx = e.clientX - this.lastPointerX;
            
            // Sensibilidad: 360 grados por el ancho del visor
            const rect = this.canvas.getBoundingClientRect();
            const viewerW = rect.width || 800;
            const degDelta = -(dx / viewerW) * 360;

            this.velocity = (degDelta / dt) * 16.67; // Normalizado a 60fps
            this.setAngle(this.currentAngle + degDelta);

            this.lastPointerX = e.clientX;
            this.lastPointerTime = now;
        });

        const endDrag = (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            try { this.canvas.releasePointerCapture(e.pointerId); } catch(err){}
            this.canvas.style.cursor = 'grab';
        };

        this.canvas.addEventListener('pointerup', endDrag);
        this.canvas.addEventListener('pointercancel', endDrag);

        // Navegación por Teclado (Flechas Izquierda / Derecha / A / D)
        window.addEventListener('keydown', (e) => {
            // Solo actuar si el tab 360 o el editor están activos
            const tab360 = document.getElementById('tab_macro360');
            if (!tab360 || !tab360.classList.contains('active')) return;
            if (['input', 'textarea', 'select'].includes(document.activeElement?.tagName?.toLowerCase())) return;

            const degStep = 360 / (this.options.frameCount || 24); // 15°
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                this.setAngle(this.currentAngle - degStep);
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                this.setAngle(this.currentAngle + degStep);
            } else if (e.key === ' ') {
                e.preventDefault();
                this.toggleAutoSpin();
            }
        });

        // Zoom con Rueda del Ratón
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
            this.setScale(this.scale + zoomDelta);
        }, { passive: false });

        // Controles de Botones HUD
        this.container.querySelectorAll('.macro360-btn-tool').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');
                if (action === 'reset') this.resetView();
                else if (action === 'toggle-spin') this.toggleAutoSpin();
                else if (action === 'zoom-in') this.setScale(this.scale + 0.25);
                else if (action === 'zoom-out') this.setScale(this.scale - 0.25);
            });
        });

        // Botones de Flecha en Barra Inferior
        this.container.querySelectorAll('.macro360-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const dir = parseInt(btn.getAttribute('data-dir'), 10) || 1;
                const degStep = 360 / (this.options.frameCount || 24);
                this.setAngle(this.currentAngle + (dir * degStep));
            });
        });

        // Slider Inferior de Fotogramas
        if (this.slider) {
            this.slider.addEventListener('input', (e) => {
                const frameIdx = parseInt(e.target.value, 10);
                const degPerFrame = 360 / (this.options.frameCount || 24);
                this.setAngle(frameIdx * degPerFrame);
            });
        }
    }

    setScale(newScale) {
        this.scale = Math.max(this.options.zoomMin, Math.min(this.options.zoomMax, newScale));
        if (this.scale <= 1.05) {
            this.panX = 0;
            this.panY = 0;
        }
        this._render();
    }

    resetView() {
        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.velocity = 0;
        this.setAngle(0);
    }

    toggleAutoSpin() {
        this.isAutoSpinning = !this.isAutoSpinning;
        if (this.btnToggleSpin) {
            this.btnToggleSpin.innerHTML = this.isAutoSpinning ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
            this.btnToggleSpin.style.color = this.isAutoSpinning ? '#10b981' : '#38bdf8';
            this.btnToggleSpin.title = this.isAutoSpinning ? 'Pausar Giro' : 'Giro Automático';
        }
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.isLoaded = false;
        this.frames = [];
        this.images = [];
    }
}

// Exportar al objeto global de window para acceso desde cualquier script
if (typeof window !== 'undefined') {
    window.extract24FramesFromVideo = extract24FramesFromVideo;
    window.Macro360Viewer = Macro360Viewer;
}
