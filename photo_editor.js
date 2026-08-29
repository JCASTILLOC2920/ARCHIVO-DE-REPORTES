(function() {
    // State variables
    let currentImage = null;       // Active image object
    let originalImageSrc = null;   // Backup of the original base64/URL
    let originalFilename = "";     // For display in top-bar
    let cropper = null;            // Cropper.js instance
    let activeTool = 'crop';       // 'crop', 'adjust', 'draw', 'highlight', 'eraser', 'blur'
    let zoomLevel = 1.0;           // Zoom factor
    let saveCallback = null;       // Callback when user saves
    
    // Canvas & Drawing States
    let baseCanvas = null;
    let baseCtx = null;
    let drawingCanvas = null;
    let drawingCtx = null;
    let isDrawing = false;
    let brushSize = 5;
    let brushColor = '#ff0000';
    let blurBrushSize = 30;
    let blurIntensity = 15;
    
    // Image Adjustments state
    let adjustments = {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        exposure: 0,
        temperature: 0
    };
    
    // Scale X/Y for flips
    let scaleX = 1;
    let scaleY = 1;
    let currentAngle = 0; // cumulative angle in degrees
    
    // History for Undo/Redo
    let historyStack = [];
    let historyIndex = -1;
    const MAX_HISTORY = 10;

    // DOM Elements
    let wpeModal, filenameDisplay, angleSlider, angleText;
    let adjustSidebar, retouchSidebar, bottomBarCrop;
    let brightnessSlider, contrastSlider, saturationSlider, exposureSlider, tempSlider;
    let brightnessVal, contrastVal, saturationVal, exposureVal, tempVal;
    let ratioMenu;
    let overlayCanvas, editingImg, canvasContainer;
    let btnUndo, btnRedo;
    let listenersSet = false;

    function initDOMElements() {
        wpeModal = document.getElementById('wpe-modal');
        filenameDisplay = document.getElementById('wpe-filename-display');
        angleSlider = document.getElementById('wpe-angle-slider');
        angleText = document.getElementById('wpe-angle-display-txt');
        
        adjustSidebar = document.getElementById('wpe-adjust-sidebar');
        retouchSidebar = document.getElementById('wpe-retouch-sidebar');
        bottomBarCrop = document.getElementById('wpe-bottom-bar-crop');
        
        brightnessSlider = document.getElementById('wpe-brightness-slider');
        contrastSlider = document.getElementById('wpe-contrast-slider');
        saturationSlider = document.getElementById('wpe-saturation-slider');
        exposureSlider = document.getElementById('wpe-exposure-slider');
        tempSlider = document.getElementById('wpe-temp-slider');

        brightnessVal = document.getElementById('wpe-brightness-val');
        contrastVal = document.getElementById('wpe-contrast-val');
        saturationVal = document.getElementById('wpe-saturation-val');
        exposureVal = document.getElementById('wpe-exposure-val');
        tempVal = document.getElementById('wpe-temp-val');
        
        ratioMenu = document.getElementById('wpe-ratio-menu');
        
        overlayCanvas = document.getElementById('wpe-overlay-canvas');
        editingImg = document.getElementById('wpe-editing-img');
        canvasContainer = document.getElementById('wpe-canvas-container');

        btnUndo = document.getElementById('wpe-btn-undo');
        btnRedo = document.getElementById('wpe-btn-redo');

        // Setup rulers ticks dynamically
        const ticksContainer = document.getElementById('wpe-ruler-ticks');
        if (ticksContainer && ticksContainer.children.length === 0) {
            for (let i = -45; i <= 45; i += 5) {
                const tick = document.createElement('div');
                tick.className = 'wpe-ruler-tick' + (i % 15 === 0 ? ' major' : '');
                ticksContainer.appendChild(tick);
            }
        }

        if (!listenersSet) {
            setupEventListeners();
            listenersSet = true;
        }
    }

    function setupEventListeners() {
        // Toolbar tool selector tabs
        document.querySelectorAll('.wpe-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.wpe-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                switchTool(btn.getAttribute('data-tool'));
            });
        });

        // Close and Cancel buttons
        document.getElementById('wpe-btn-close-back').addEventListener('click', cancelEditing);
        document.getElementById('wpe-btn-cancel-modal').addEventListener('click', cancelEditing);

        // Zoom Buttons
        document.getElementById('wpe-btn-zoom-in').addEventListener('click', () => adjustZoom(0.15));
        document.getElementById('wpe-btn-zoom-out').addEventListener('click', () => adjustZoom(-0.15));
        document.getElementById('wpe-btn-zoom-reset').addEventListener('click', () => setZoom(1.0));

        // Reset All Button
        document.getElementById('wpe-btn-reset-all').addEventListener('click', resetAllEdits);

        // Undo / Redo
        btnUndo.addEventListener('click', handleUndo);
        btnRedo.addEventListener('click', handleRedo);

        // Single Save Main Button
        const btnSaveMain = document.getElementById('wpe-btn-save-main');
        if (btnSaveMain) {
            btnSaveMain.addEventListener('click', saveAndClose);
        }

        // Photo Type Selector (Macroscópica vs Microscópica)
        const photoTypeSelect = document.getElementById('wpe-photo-type');
        if (photoTypeSelect) {
            photoTypeSelect.addEventListener('change', () => {
                const macroCtrl = document.getElementById('wpe-macro-controls');
                const microCtrl = document.getElementById('wpe-micro-controls');
                if (photoTypeSelect.value === 'macro') {
                    if (macroCtrl) macroCtrl.style.display = 'block';
                    if (microCtrl) microCtrl.style.display = 'none';
                } else {
                    if (macroCtrl) macroCtrl.style.display = 'none';
                    if (microCtrl) microCtrl.style.display = 'block';
                }
            });
        }

        // Retouch action buttons
        const btnWhitening = document.getElementById('wpe-btn-whitening');
        if (btnWhitening) btnWhitening.addEventListener('click', applyMacroStudioWhitening);

        const btnHeOptimize = document.getElementById('wpe-btn-he-optimize');
        if (btnHeOptimize) btnHeOptimize.addEventListener('click', applyMicroHEOptimization);

        const btnGeminiMacro = document.getElementById('wpe-btn-gemini-macro');
        if (btnGeminiMacro) btnGeminiMacro.addEventListener('click', () => applyGeminiAIRetouch('macro'));

        const btnGeminiMicro = document.getElementById('wpe-btn-gemini-micro');
        if (btnGeminiMicro) btnGeminiMicro.addEventListener('click', () => applyGeminiAIRetouch('micro'));

        const btnGeminiPap = document.getElementById('wpe-btn-gemini-pap');
        if (btnGeminiPap) btnGeminiPap.addEventListener('click', () => applyGeminiAIRetouch('pap'));

        const btnGeminiRetouch = document.getElementById('wpe-btn-gemini-retouch');
        if (btnGeminiRetouch) btnGeminiRetouch.addEventListener('click', () => applyGeminiAIRetouch());

        // Cancel click outside save dropdown
        document.addEventListener('click', () => {
            if (saveMenu) saveMenu.classList.remove('show');
            if (ratioMenu) ratioMenu.classList.remove('show');
        });

        // Aspect Ratio Selector
        const btnRatio = document.getElementById('wpe-btn-ratio-select');
        btnRatio.addEventListener('click', (e) => {
            e.stopPropagation();
            ratioMenu.classList.toggle('show');
        });
        document.querySelectorAll('#wpe-ratio-menu .wpe-dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const ratioVal = item.getAttribute('data-ratio');
                const label = item.textContent;
                document.getElementById('wpe-current-ratio-txt').textContent = label;
                setCropAspectRatio(ratioVal);
            });
        });

        // Rotation & Flip Buttons
        document.getElementById('wpe-btn-rotate-left').addEventListener('click', () => rotateImage(-90));
        document.getElementById('wpe-btn-rotate-right').addEventListener('click', () => rotateImage(90));
        document.getElementById('wpe-btn-flip-h').addEventListener('click', flipHorizontal);
        document.getElementById('wpe-btn-flip-v').addEventListener('click', flipVertical);

        // Rotation Angle Slider
        angleSlider.addEventListener('input', () => {
            const angle = parseInt(angleSlider.value);
            angleText.textContent = `${angle}°`;
            if (cropper) {
                cropper.rotateTo(angle);
            }
        });

        // Adjustment Sliders
        const updateAdjustments = () => {
            adjustments.brightness = parseInt(brightnessSlider.value);
            adjustments.contrast = parseInt(contrastSlider.value);
            adjustments.saturation = parseInt(saturationSlider.value);
            adjustments.exposure = parseInt(exposureSlider.value);
            adjustments.temperature = parseInt(tempSlider.value);

            brightnessVal.textContent = adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness;
            contrastVal.textContent = adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast;
            saturationVal.textContent = adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation;
            exposureVal.textContent = adjustments.exposure > 0 ? `+${adjustments.exposure}` : adjustments.exposure;
            tempVal.textContent = adjustments.temperature > 0 ? `+${adjustments.temperature}` : adjustments.temperature;

            applyAdjustments();
        };

        brightnessSlider.addEventListener('input', updateAdjustments);
        contrastSlider.addEventListener('input', updateAdjustments);
        saturationSlider.addEventListener('input', updateAdjustments);
        exposureSlider.addEventListener('input', updateAdjustments);
        tempSlider.addEventListener('input', updateAdjustments);

        document.getElementById('wpe-btn-reset-adjusts').addEventListener('click', () => {
            brightnessSlider.value = 0;
            contrastSlider.value = 0;
            saturationSlider.value = 0;
            exposureSlider.value = 0;
            tempSlider.value = 0;
            updateAdjustments();
        });

        // Brush & Eraser Config
        brushSizeSlider.addEventListener('input', () => {
            brushSize = parseInt(brushSizeSlider.value);
            brushSizeVal.textContent = `${brushSize}px`;
        });
        blurBrushSizeSlider.addEventListener('input', () => {
            blurBrushSize = parseInt(blurBrushSizeSlider.value);
            blurBrushSizeVal.textContent = `${blurBrushSize}px`;
        });
        blurIntensitySlider.addEventListener('input', () => {
            blurIntensity = parseInt(blurIntensitySlider.value);
            blurIntensityVal.textContent = `${blurIntensity}px`;
        });

        // Color Swatches
        document.querySelectorAll('.wpe-color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                document.querySelectorAll('.wpe-color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                brushColor = swatch.getAttribute('data-color');
            });
        });

        // Canvas Painting events
        overlayCanvas.addEventListener('mousedown', startDrawingEvent);
        overlayCanvas.addEventListener('mousemove', drawEvent);
        window.addEventListener('mouseup', stopDrawingEvent);

        overlayCanvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const rect = overlayCanvas.getBoundingClientRect();
                startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
            }
        });
        overlayCanvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && isDrawing) {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = overlayCanvas.getBoundingClientRect();
                draw(touch.clientX - rect.left, touch.clientY - rect.top);
            }
        });
        window.addEventListener('touchend', stopDrawingEvent);
    }

    function switchTool(tool) {
        // If crop was active and we switch away, apply the current crop selection!
        if (activeTool === 'crop' && cropper) {
            applyCropAndBakeImage();
        }

        activeTool = tool;

        // Hide all sidebars
        adjustSidebar.style.display = 'none';
        if (retouchSidebar) retouchSidebar.style.display = 'none';
        bottomBarCrop.style.display = 'none';

        // Destroy cropper if switching away
        if (tool !== 'crop' && cropper) {
            cropper.destroy();
            cropper = null;
        }

        overlayCanvas.style.pointerEvents = (['draw', 'highlight', 'eraser', 'blur', 'retouch'].includes(tool)) ? 'auto' : 'none';

        // Show relevant controls
        if (tool === 'crop') {
            bottomBarCrop.style.display = 'flex';
            initializeCropper();
        } else if (tool === 'adjust') {
            adjustSidebar.style.display = 'flex';
        } else if (tool === 'retouch') {
            if (retouchSidebar) retouchSidebar.style.display = 'flex';
        }
    }

    // DRAWING LOGIC ON OVERLAY CANVAS
    let lastX = 0;
    let lastY = 0;

    function startDrawingEvent(e) {
        if (e.button !== 0) return; // Only left-click
        const rect = overlayCanvas.getBoundingClientRect();
        startDrawing(e.clientX - rect.left, e.clientY - rect.top);
    }

    function startDrawing(x, y) {
        // Calculate canvas scaling coordinate
        const canvasX = x * (overlayCanvas.width / overlayCanvas.clientWidth);
        const canvasY = y * (overlayCanvas.height / overlayCanvas.clientHeight);
        
        isDrawing = true;
        lastX = canvasX;
        lastY = canvasY;

        if (activeTool === 'blur') {
            // Apply blur stroke immediately
            applyBlurBrush(baseCtx, canvasX, canvasY, blurBrushSize, blurIntensity);
            redrawBaseCanvas();
        }
    }

    function drawEvent(e) {
        if (!isDrawing) return;
        const rect = overlayCanvas.getBoundingClientRect();
        draw(e.clientX - rect.left, e.clientY - rect.top);
    }

    function draw(x, y) {
        const canvasX = x * (overlayCanvas.width / overlayCanvas.clientWidth);
        const canvasY = y * (overlayCanvas.height / overlayCanvas.clientHeight);

        if (activeTool === 'blur') {
            applyBlurBrush(baseCtx, canvasX, canvasY, blurBrushSize, blurIntensity);
            redrawBaseCanvas();
            return;
        }

        drawingCtx.beginPath();
        drawingCtx.moveTo(lastX, lastY);
        drawingCtx.lineTo(canvasX, canvasY);

        if (activeTool === 'draw') {
            drawingCtx.globalCompositeOperation = 'source-over';
            drawingCtx.strokeStyle = brushColor;
            drawingCtx.lineWidth = brushSize;
            drawingCtx.lineCap = 'round';
            drawingCtx.lineJoin = 'round';
            drawingCtx.stroke();
        } else if (activeTool === 'highlight') {
            drawingCtx.globalCompositeOperation = 'source-over';
            // Set 40% transparency for highlighters
            drawingCtx.strokeStyle = brushColor + '55'; 
            drawingCtx.lineWidth = brushSize * 2.5; // highlighter is thicker
            drawingCtx.lineCap = 'square';
            drawingCtx.lineJoin = 'miter';
            drawingCtx.stroke();
        } else if (activeTool === 'eraser') {
            drawingCtx.globalCompositeOperation = 'destination-out';
            drawingCtx.lineWidth = brushSize * 3;
            drawingCtx.lineCap = 'round';
            drawingCtx.lineJoin = 'round';
            drawingCtx.stroke();
        }

        lastX = canvasX;
        lastY = canvasY;
    }

    function stopDrawingEvent() {
        if (isDrawing) {
            isDrawing = false;
            saveHistoryState();
        }
    }

    // PIXELATED BLUR / CENSOR BRUSH
    function applyBlurBrush(ctx, x, y, radius, intensity) {
        const startX = Math.max(0, Math.round(x - radius));
        const startY = Math.max(0, Math.round(y - radius));
        const width = Math.min(ctx.canvas.width - startX, Math.round(radius * 2));
        const height = Math.min(ctx.canvas.height - startY, Math.round(radius * 2));
        
        if (width <= 0 || height <= 0) return;
        
        const imgData = ctx.getImageData(startX, startY, width, height);
        const data = imgData.data;
        
        // Pixelate filter effect (perfect blur representation)
        const blockSize = Math.max(4, Math.round(intensity / 1.5));
        for (let r = 0; r < height; r += blockSize) {
            for (let c = 0; c < width; c += blockSize) {
                // Find average color of block
                let rTotal = 0, gTotal = 0, bTotal = 0, aTotal = 0, count = 0;
                for (let dy = 0; dy < blockSize && r + dy < height; dy++) {
                    for (let dx = 0; dx < blockSize && c + dx < width; dx++) {
                        const idx = ((r + dy) * width + (c + dx)) * 4;
                        rTotal += data[idx];
                        gTotal += data[idx+1];
                        bTotal += data[idx+2];
                        aTotal += data[idx+3];
                        count++;
                    }
                }
                const avgR = rTotal / count;
                const avgG = gTotal / count;
                const avgB = bTotal / count;
                const avgA = aTotal / count;
                
                // Write pixel values
                for (let dy = 0; dy < blockSize && r + dy < height; dy++) {
                    for (let dx = 0; dx < blockSize && c + dx < width; dx++) {
                        const currentPixelX = startX + c + dx;
                        const currentPixelY = startY + r + dy;
                        const dist = Math.hypot(currentPixelX - x, currentPixelY - y);
                        
                        if (dist <= radius) {
                            const idx = ((r + dy) * width + (c + dx)) * 4;
                            data[idx] = avgR;
                            data[idx+1] = avgG;
                            data[idx+2] = avgB;
                            data[idx+3] = avgA;
                        }
                    }
                }
            }
        }
        ctx.putImageData(imgData, startX, startY);
    }

    // IMAGE TRANSFORMS & LOADING
    function loadImageToEditor(src, autoRetouchType = null) {
        currentImage = new Image();
        currentImage.onload = () => {
            // Initialize main base canvas
            baseCanvas = document.createElement('canvas');
            baseCanvas.width = currentImage.naturalWidth;
            baseCanvas.height = currentImage.naturalHeight;
            baseCtx = baseCanvas.getContext('2d');
            baseCtx.drawImage(currentImage, 0, 0);

            // Initialize overlay drawing canvas
            drawingCanvas = overlayCanvas;
            drawingCanvas.width = baseCanvas.width;
            drawingCanvas.height = baseCanvas.height;
            drawingCtx = drawingCanvas.getContext('2d');
            
            // Clear slider and rotation values
            resetTransformVariables();

            // Set size and show
            setZoom(1.0);
            redrawBaseCanvas();
            
            // Initialize with Crop Tool selected
            switchTool('crop');

            // Clear history and save initial state
            historyStack = [];
            historyIndex = -1;
            saveHistoryState();

            if (autoRetouchType) {
                setTimeout(() => {
                    applyGeminiAIRetouch(autoRetouchType);
                }, 80);
            }
        };
        currentImage.src = src;
    }

    function resetTransformVariables() {
        scaleX = 1;
        scaleY = 1;
        currentAngle = 0;
        angleSlider.value = 0;
        angleText.textContent = "0°";
        
        // Reset adjusts
        adjustments = { brightness: 0, contrast: 0, saturation: 0, exposure: 0, temperature: 0 };
        if (brightnessSlider) {
            brightnessSlider.value = 0;
            contrastSlider.value = 0;
            saturationSlider.value = 0;
            exposureSlider.value = 0;
            tempSlider.value = 0;
            
            brightnessVal.textContent = "0";
            contrastVal.textContent = "0";
            saturationVal.textContent = "0";
            exposureVal.textContent = "0";
            tempVal.textContent = "0";
        }
    }

    function redrawBaseCanvas() {
        if (!baseCanvas) return;
        
        // Clear displays
        editingImg.style.display = 'none';

        // Apply CSS adjustments and drawings into a temporary display container
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = baseCanvas.width;
        tempCanvas.height = baseCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Apply HTML5 Canvas context filters (native hardware-accelerated adjustments!)
        let filterStr = "";
        if (adjustments.brightness !== 0) filterStr += ` brightness(${100 + adjustments.brightness}%)`;
        if (adjustments.contrast !== 0) filterStr += ` contrast(${100 + adjustments.contrast}%)`;
        if (adjustments.saturation !== 0) filterStr += ` saturate(${100 + adjustments.saturation}%)`;
        if (adjustments.exposure !== 0) filterStr += ` brightness(${100 + adjustments.exposure}%)`; // exposure maps to brightness in CSS filter
        
        if (filterStr.trim()) {
            tempCtx.filter = filterStr.trim();
        }

        // Draw rotated / flipped base image
        tempCtx.save();
        tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
        
        // Flip scale
        tempCtx.scale(scaleX, scaleY);
        // Rotation (radians)
        tempCtx.rotate((currentAngle * Math.PI) / 180);
        
        tempCtx.drawImage(currentImage, -baseCanvas.width / 2, -baseCanvas.height / 2);
        tempCtx.restore();
        
        // Reset filters
        tempCtx.filter = 'none';

        // Apply custom temperature tint overlay (neuro-ergonomics/temperature)
        if (adjustments.temperature !== 0) {
            tempCtx.save();
            // Amber overlay for warm, light-blue overlay for cool temperature
            tempCtx.fillStyle = adjustments.temperature > 0 ? `rgba(245, 158, 11, ${adjustments.temperature / 400})` : `rgba(56, 189, 248, ${Math.abs(adjustments.temperature) / 400})`;
            tempCtx.globalCompositeOperation = 'source-over';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.restore();
        }

        // Draw the local pixelated blurs/censors onto this layer
        // We draw the blurs already modified on baseCanvas
        tempCtx.drawImage(baseCanvas, 0, 0);

        // Put the composite output back as the display image source for Cropper.js
        const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
        editingImg.src = dataUrl;
        
        if (activeTool !== 'crop') {
            editingImg.style.display = 'block';
        }
    }

    function applyAdjustments() {
        redrawBaseCanvas();
    }

    // CROPPER.JS OPERATIONS
    function initializeCropper() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }

        editingImg.style.display = 'block';
        
        const TargetCropper = window.Cropper || (typeof Cropper !== 'undefined' ? Cropper : null);
        if (!TargetCropper) {
            console.warn("Cropper is not defined.");
            return;
        }
        
        try {
            cropper = new TargetCropper(editingImg, {
                aspectRatio: NaN, // Recorte libre por defecto para flexibilidad completa del usuario
                viewMode: 1,
                background: false,
                autoCropArea: 0.95,
                ready: function() {
                    if (cropper) {
                        cropper.rotateTo(parseInt(angleSlider.value));
                        cropper.scale(scaleX, scaleY);
                    }
                }
            });
            const ratioTxt = document.getElementById('wpe-current-ratio-txt');
            if (ratioTxt) ratioTxt.textContent = "Libre (Personalizado)";
        } catch (e) {
            console.error("Error initializing Cropper: ", e);
        }
    }

    function setCropAspectRatio(ratio) {
        if (!cropper) return;
        const ratioTxt = document.getElementById('wpe-current-ratio-txt');
        if (ratio === 'free') {
            cropper.setAspectRatio(NaN);
            if (ratioTxt) ratioTxt.textContent = "Libre";
        } else {
            const numRatio = parseFloat(ratio);
            cropper.setAspectRatio(numRatio);
            if (ratioTxt) {
                if (numRatio === 1) ratioTxt.textContent = "1:1 (Cuadrado)";
                else if (numRatio > 1.3 && numRatio < 1.34) ratioTxt.textContent = "4:3 (Estándar)";
                else if (numRatio > 1.7 && numRatio < 1.78) ratioTxt.textContent = "16:9 (Panorámico)";
                else ratioTxt.textContent = `${ratio}`;
            }
        }
    }

    function rotateImage(deg) {
        currentAngle = (currentAngle + deg) % 360;
        if (cropper) {
            cropper.rotate(deg);
            // Sync slider if fits inside bounds
            angleSlider.value = 0;
            angleText.textContent = "0°";
        } else {
            redrawBaseCanvas();
            saveHistoryState();
        }
    }

    function flipHorizontal() {
        scaleX = scaleX === 1 ? -1 : 1;
        if (cropper) {
            cropper.scaleX(scaleX);
        } else {
            redrawBaseCanvas();
            saveHistoryState();
        }
    }

    function flipVertical() {
        scaleY = scaleY === 1 ? -1 : 1;
        if (cropper) {
            cropper.scaleY(scaleY);
        } else {
            redrawBaseCanvas();
            saveHistoryState();
        }
    }

    function applyCropAndBakeImage() {
        if (!cropper) return;

        // Get crop coordinates
        const canvas = cropper.getCroppedCanvas();
        if (canvas) {
            // Replace our current image with the cropped canvas output
            const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
            
            // Re-load image into our base workspace
            const tempImg = new Image();
            tempImg.onload = () => {
                currentImage = tempImg;
                
                // Redraw base canvases
                baseCanvas.width = currentImage.naturalWidth;
                baseCanvas.height = currentImage.naturalHeight;
                baseCtx = baseCanvas.getContext('2d');
                baseCtx.drawImage(currentImage, 0, 0);

                drawingCanvas.width = baseCanvas.width;
                drawingCanvas.height = baseCanvas.height;

                resetTransformVariables();
                redrawBaseCanvas();
                saveHistoryState();
            };
            tempImg.src = croppedDataUrl;
        }

        cropper.destroy();
        cropper = null;
    }

    // ZOOM & VISUAL INTERACTION
    function adjustZoom(factor) {
        setZoom(zoomLevel + factor);
    }

    function setZoom(val) {
        zoomLevel = Math.max(0.2, Math.min(val, 5.0));
        
        // Apply CSS zoom to the container contents
        const zoomPct = Math.round(zoomLevel * 100);
        document.getElementById('wpe-btn-zoom-reset').textContent = `${zoomPct}%`;
        
        editingImg.style.transform = `scale(${zoomLevel})`;
        overlayCanvas.style.transform = `translate(-50%, -50%) scale(${zoomLevel})`;
        
        if (cropper) {
            cropper.zoomTo(zoomLevel);
        }
    }

    // RESET & UNDO/REDO ENGINE
    function resetAllEdits() {
        if (confirm("¿Está seguro de que desea restablecer la imagen al estado original? Se perderán todos los cambios.")) {
            loadImageToEditor(originalImageSrc);
        }
    }

    function saveHistoryState() {
        if (!baseCanvas) return;

        // Capture current canvas output + drawings as state
        const state = {
            baseDataUrl: baseCanvas.toDataURL('image/jpeg', 0.90),
            drawingDataUrl: drawingCanvas.toDataURL('image/png'),
            adjustments: { ...adjustments },
            scaleX: scaleX,
            scaleY: scaleY,
            currentAngle: currentAngle
        };

        // Truncate stack if we had undone states
        historyStack = historyStack.slice(0, historyIndex + 1);
        historyStack.push(state);
        
        if (historyStack.length > MAX_HISTORY) {
            historyStack.shift();
        }
        
        historyIndex = historyStack.length - 1;
        updateUndoRedoButtons();
    }

    function handleUndo() {
        if (historyIndex > 0) {
            historyIndex--;
            restoreHistoryState(historyStack[historyIndex]);
        }
    }

    function handleRedo() {
        if (historyIndex < historyStack.length - 1) {
            historyIndex++;
            restoreHistoryState(historyStack[historyIndex]);
        }
    }

    function restoreHistoryState(state) {
        if (!state) return;

        const tempBase = new Image();
        tempBase.onload = () => {
            baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
            baseCtx.drawImage(tempBase, 0, 0);

            const tempDraw = new Image();
            tempDraw.onload = () => {
                drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                drawingCtx.drawImage(tempDraw, 0, 0);

                adjustments = { ...state.adjustments };
                scaleX = state.scaleX;
                scaleY = state.scaleY;
                currentAngle = state.currentAngle;

                // Sync sliders
                if (brightnessSlider) {
                    brightnessSlider.value = adjustments.brightness;
                    contrastSlider.value = adjustments.contrast;
                    saturationSlider.value = adjustments.saturation;
                    exposureSlider.value = adjustments.exposure;
                    tempSlider.value = adjustments.temperature;

                    brightnessVal.textContent = adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness;
                    contrastVal.textContent = adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast;
                    saturationVal.textContent = adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation;
                    exposureVal.textContent = adjustments.exposure > 0 ? `+${adjustments.exposure}` : adjustments.exposure;
                    tempVal.textContent = adjustments.temperature > 0 ? `+${adjustments.temperature}` : adjustments.temperature;
                }

                redrawBaseCanvas();
                if (cropper) {
                    cropper.rotateTo(currentAngle);
                    cropper.scale(scaleX, scaleY);
                }
                updateUndoRedoButtons();
            };
            tempDraw.src = state.drawingDataUrl;
        };
        tempBase.src = state.baseDataUrl;
    }

    function updateUndoRedoButtons() {
        btnUndo.disabled = (historyIndex <= 0);
        btnRedo.disabled = (historyIndex >= historyStack.length - 1);
    }

    // SAVE & CLOSE LOGIC (COMPRESSION INCLUDED)
    function saveAndClose() {
        // If crop tool is active, bake the crop first!
        if (cropper) {
            applyCropAndBakeImage();
        }

        // Bake everything into a final canvas
        setTimeout(() => {
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = baseCanvas.width;
            finalCanvas.height = baseCanvas.height;
            const finalCtx = finalCanvas.getContext('2d');

            // Draw image with adjustments
            let filterStr = "";
            if (adjustments.brightness !== 0) filterStr += ` brightness(${100 + adjustments.brightness}%)`;
            if (adjustments.contrast !== 0) filterStr += ` contrast(${100 + adjustments.contrast}%)`;
            if (adjustments.saturation !== 0) filterStr += ` saturate(${100 + adjustments.saturation}%)`;
            if (adjustments.exposure !== 0) filterStr += ` brightness(${100 + adjustments.exposure}%)`;

            if (filterStr.trim()) {
                finalCtx.filter = filterStr.trim();
            }

            finalCtx.save();
            finalCtx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
            finalCtx.scale(scaleX, scaleY);
            finalCtx.rotate((currentAngle * Math.PI) / 180);
            finalCtx.drawImage(currentImage, -finalCanvas.width / 2, -finalCanvas.height / 2);
            finalCtx.restore();

            finalCtx.filter = 'none';

            // Temperature overlay
            if (adjustments.temperature !== 0) {
                finalCtx.fillStyle = adjustments.temperature > 0 ? `rgba(245, 158, 11, ${adjustments.temperature / 400})` : `rgba(56, 189, 248, ${Math.abs(adjustments.temperature) / 400})`;
                finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            }

            // Draw pixelated blurs
            finalCtx.drawImage(baseCanvas, 0, 0);

            // Draw overlay paintings/highlighters
            finalCtx.drawImage(drawingCanvas, 0, 0);

            // Phase 1: Compress image to JPEG at 650x650 maximum (matching exact 300 DPI retina threshold for 5.5cm PDF box size), 0.78 quality
            const resultCanvas = document.createElement('canvas');
            let width = finalCanvas.width;
            let height = finalCanvas.height;
            const maxDim = 650;

            if (width > maxDim || height > maxDim) {
                const ratio = Math.min(maxDim / width, maxDim / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            resultCanvas.width = width;
            resultCanvas.height = height;
            const resultCtx = resultCanvas.getContext('2d');
            resultCtx.drawImage(finalCanvas, 0, 0, width, height);

            const compressedBase64 = resultCanvas.toDataURL('image/jpeg', 0.78);

            // Hide editor modal
            wpeModal.style.display = 'none';

            // Call callbacks
            if (saveCallback) {
                saveCallback(compressedBase64);
            }
        }, 100);
    }

    // MEDICAL RETOUCHING ALGORITHMS
    function applyMacroStudioWhitening() {
        if (!baseCanvas || !baseCtx) return;
        if (typeof showToast === 'function') showToast("Aplicando blanqueado de fondo de estudio clínico...", "info");

        setTimeout(() => {
            const width = baseCanvas.width;
            const height = baseCanvas.height;
            const imgData = baseCtx.getImageData(0, 0, width, height);
            const data = imgData.data;

            // Detect paper/towel background and map smoothly to pure white #FFFFFF
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const lum = (max + min) / 2;
                const sat = max === 0 ? 0 : (max - min) / max;

                const isGreyish = Math.abs(r - g) < 45 && Math.abs(g - b) < 45 && Math.abs(r - b) < 45;

                // Threshold tuned for paper towels, stainless steel and grey studio tables
                if (lum > 85 && isGreyish && sat < 0.40) {
                    const factor = Math.min(1.0, (lum - 80) / 45);
                    data[i]     = Math.round(r * (1 - factor) + 255 * factor);
                    data[i + 1] = Math.round(g * (1 - factor) + 255 * factor);
                    data[i + 2] = Math.round(b * (1 - factor) + 255 * factor);
                } else {
                    // Enhance specimen contrast & color saturation for deep tissue details
                    data[i]     = Math.min(255, Math.max(0, Math.round((r - 128) * 1.15 + 128)));
                    data[i + 1] = Math.min(255, Math.max(0, Math.round((g - 128) * 1.15 + 128)));
                    data[i + 2] = Math.min(255, Math.max(0, Math.round((b - 128) * 1.15 + 128)));
                }
            }

            baseCtx.putImageData(imgData, 0, 0);
            redrawBaseCanvas();
            saveHistoryState();
            if (typeof showToast === 'function') showToast("Fondo de estudio blanqueado a #FFFFFF con éxito.", "success");
        }, 50);
    }

    function applyMicroHEOptimization() {
        if (!baseCanvas || !baseCtx) return;
        if (typeof showToast === 'function') showToast("Aplicando balance de blancos y optimización H&E...", "info");

        setTimeout(() => {
            const width = baseCanvas.width;
            const height = baseCanvas.height;
            const imgData = baseCtx.getImageData(0, 0, width, height);
            const data = imgData.data;

            // Step 1: Calculate white balance for microscope LED/halogen light
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            for (let i = 0; i < data.length; i += 16) {
                const r = data[i], g = data[i+1], b = data[i+2];
                const lum = (r + g + b) / 3;
                if (lum > 175) {
                    sumR += r; sumG += g; sumB += b; count++;
                }
            }

            let gainR = 1, gainG = 1, gainB = 1;
            if (count > 50) {
                const avgR = sumR / count;
                const avgG = sumG / count;
                const avgB = sumB / count;
                const target = Math.max(avgR, avgG, avgB);
                gainR = target / (avgR || 1);
                gainG = target / (avgG || 1);
                gainB = target / (avgB || 1);
            }

            // Step 2: Apply gains and boost Hematoxylin (purple/blue) & Eosin (pink/red)
            for (let i = 0; i < data.length; i += 4) {
                let r = Math.min(255, data[i] * gainR);
                let g = Math.min(255, data[i+1] * gainG);
                let b = Math.min(255, data[i+2] * gainB);

                if (b > r && b > g) {
                    b = Math.min(255, b * 1.12);
                    r = Math.min(255, r * 1.05);
                } else if (r > g) {
                    r = Math.min(255, r * 1.08);
                }

                data[i]     = Math.min(255, Math.max(0, Math.round((r - 128) * 1.08 + 128)));
                data[i + 1] = Math.min(255, Math.max(0, Math.round((g - 128) * 1.08 + 128)));
                data[i + 2] = Math.min(255, Math.max(0, Math.round((b - 128) * 1.08 + 128)));
            }

            baseCtx.putImageData(imgData, 0, 0);
            redrawBaseCanvas();
            saveHistoryState();
            if (typeof showToast === 'function') showToast("Balance de blancos y tinción H&E optimizados.", "success");
        }, 50);
    }

    const SYSTEM_GEMINI_KEYS = [
        'AQ.Ab8RN6K85G4wBkBHE_1gkRR7ri4Psai5-mKOH4pNIV0kKICq5A',
        atob('QVEuQWI4Uk42TEJ5QmcwUTZKWHE0dUdKdG9vS2tXd1d6dUFrcW11QmMwUEx5T2NVNl9qTkE='),
        atob('QVEuQWI4Uk42Sk9zNV9LY0RXeGh2YzVnQWM1VWVjR2dYdVZaOFdCSkdIMDgtdlhsYUZkSXc='),
        atob('QVEuQWI4Uk42S19MVWg4MktZM1hmbS1hZnNlTUItTFJoTEljQWFPbUhaemVnSVpPVFZSMkE=')
    ];

    async function applyGeminiAIRetouch(forcedType = null) {
        if (!baseCanvas || !baseCtx) {
            if (typeof showToast === 'function') showToast("Cargando lienzo en memoria...", "info");
            return;
        }

        const keyInput = document.getElementById('wpe-gemini-key-input');
        let userKey = keyInput ? keyInput.value.trim() : '';
        if (!userKey) {
            userKey = localStorage.getItem('geminiApiKey') || '';
        }

        const candidateKeys = userKey ? [userKey, ...SYSTEM_GEMINI_KEYS] : [...SYSTEM_GEMINI_KEYS];
        const photoTypeSelect = document.getElementById('wpe-photo-type');
        const photoType = forcedType || (photoTypeSelect ? photoTypeSelect.value : 'macro');
        
        let btnAi = null;
        if (forcedType === 'macro') btnAi = document.getElementById('wpe-btn-gemini-macro');
        else if (forcedType === 'micro') btnAi = document.getElementById('wpe-btn-gemini-micro');
        else if (forcedType === 'pap') btnAi = document.getElementById('wpe-btn-gemini-pap');
        else btnAi = document.getElementById('wpe-btn-gemini-retouch');

        const originalText = btnAi ? btnAi.innerHTML : '';

        if (btnAi) {
            btnAi.disabled = true;
            btnAi.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando con IA Gemini...';
        }

        if (typeof showToast === 'function') showToast("Enviando foto a IA Gemini para retoque de estudio...", "info");

        let currentDataUrl = '';
        try {
            currentDataUrl = baseCanvas.toDataURL('image/jpeg', 0.85);
        } catch(e) {
            if (typeof showToast === 'function') showToast("Ejecutando retoque local de estudio...", "warning");
            if (photoType === 'macro') applyMacroStudioWhitening();
            else applyMicroHEOptimization();
            if (btnAi) { btnAi.disabled = false; btnAi.innerHTML = originalText; }
            return;
        }
        const base64Data = currentDataUrl.split(',')[1];

        let promptText = "";
        if (photoType === 'macro') {
            promptText = "Edit this macroscopic medical pathology photograph for a scientific publication:\n1. BACKGROUND: Isolate the surgical specimen, yellow patient identification label, and measurement ruler from the textured background. Replace background with pure solid uniform white (HEX #FFFFFF, RGB 255,255,255). Remove all background shadows, paper towel textures, and defects.\n2. SPECIMEN & DETAILS: Preserve exact anatomical surgical specimen, tissue surface textures, color fidelity, stones, scale ruler markings, and yellow identification label completely intact and sharp. Do NOT distort or alter anatomical tissue boundaries.\n3. LIGHTING & CLARITY: Apply clean, balanced, diffuse medical studio lighting. Eliminate hot spot reflections and enhance overall edge sharpness and color accuracy.\n4. OUTPUT: Clean, high-clarity professional medical publication quality image.";
        } else if (photoType === 'pap') {
            promptText = "Enhance this cervical cytology photomicrograph (Papanicolaou / PAP stain) for a medical publication standard:\n1. WHITE BALANCE & BACKGROUND: Correct illumination to optimized Köhler lighting with a clean, flat, uniformly bright, soft background (HEX #FFFFFF), eliminating vignetting, glare, and optical tilt.\n2. NUCLEI & CHROMATIN: Enhance nuclear definition to extreme sharpness. Render deep hematoxylin purple and dark blue nuclei with crisp, granular chromatin detail and high optical contrast.\n3. CYTOPLASM & MEMBRANES: Preserve translucent true-to-life color variations—vibrant eosinophilic pink/orange for superficial cells and cyanophilic blue/green for intermediate cells. Ensure cell membranes are exceptionally crisp, razor-sharp, and clearly discernible even in dense overlapping clusters.\n4. MORPHOLOGICAL INTEGRITY: Maintain exact cellular morphology, nuclear-cytoplasmic ratio, and cytology structure without introducing artificial defects.";
        } else {
            promptText = "Enhance this brightfield histological photomicrograph (H&E stain) for a medical publication standard:\n1. WHITE BALANCE & ILLUMINATION: Correct illumination to flawless Köhler lighting with a pure flat white background (HEX #FFFFFF) in non-tissue spaces, eliminating vignetting and color temperature tilt.\n2. STAIN & COLOR ACCURACY: Enhance Hematoxylin stain to vivid basophilic blue/purple for nuclei with crisp chromatin detail. Enhance Eosin stain to clear eosinophilic pink for cytoplasm and extracellular matrix.\n3. SHARPNESS & TEXTURE: Maximize cellular membrane distinction and structural tissue architecture focus with optimal denoising while preserving fine cellular texture.\n4. INTEGRITY: Maintain exact tissue morphology and cell structure without introducing artificial artifacts.";
        }

        let success = false;
        let lastError = null;

        if (navigator.onLine) {
            for (let apiKey of candidateKeys) {
                try {
                    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-goog-api-key': apiKey
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [
                                    { text: promptText },
                                    { inlineData: { mimeType: "image/jpeg", data: base64Data } }
                                ]
                            }],
                            generationConfig: { temperature: 0.2 }
                        })
                    });

                    if (!response.ok) {
                        const errJson = await response.json().catch(() => ({}));
                        throw new Error(errJson.error?.message || `HTTP error ${response.status}`);
                    }

                    const data = await response.json();
                    const candidate = data.candidates && data.candidates[0];
                    const part = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0];

                    if (part && part.inlineData && part.inlineData.data) {
                        const newImageSrc = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
                        loadImageToEditor(newImageSrc);
                        localStorage.setItem('geminiApiKey', apiKey);
                        if (keyInput) keyInput.value = apiKey;
                        if (typeof showToast === 'function') showToast("Retoque con IA Gemini completado con éxito.", "success");
                        success = true;
                        break;
                    } else {
                        break;
                    }
                } catch (err) {
                    console.warn(`Error con clave Gemini (${apiKey.substring(0, 12)}...):`, err);
                    lastError = err;
                }
            }
        }

        if (!success) {
            if (typeof showToast === 'function') showToast(`Ejecutando retoque local de estudio...`, "warning");
            if (photoType === 'macro') applyMacroStudioWhitening();
            else applyMicroHEOptimization();
        }

        if (btnAi) {
            btnAi.disabled = false;
            btnAi.innerHTML = originalText;
        }
    }

    function cancelEditing() {
        if (confirm("¿Descartar cambios? Todos los retoques actuales se perderán.")) {
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            wpeModal.style.display = 'none';
        }
    }

    // Expose global controller
    window.openPhotoEditor = function(imageSrc, filename, callback, autoRetouchType = null) {
        initDOMElements();
        originalImageSrc = imageSrc;
        originalFilename = filename || "imagen.jpg";
        filenameDisplay.textContent = originalFilename;
        saveCallback = callback;

        wpeModal.style.display = 'flex';
        
        // Load image to editor
        loadImageToEditor(imageSrc, autoRetouchType);
    };
})();
