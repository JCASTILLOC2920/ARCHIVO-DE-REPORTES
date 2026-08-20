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

        const btnGeminiRetouch = document.getElementById('wpe-btn-gemini-retouch');
        if (btnGeminiRetouch) btnGeminiRetouch.addEventListener('click', applyGeminiAIRetouch);

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

        overlayCanvas.style.pointerEvents = 'none';

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
    function loadImageToEditor(src) {
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
        
        if (typeof Cropper === 'undefined') {
            console.warn("Cropper is not defined. Skipping cropper instantiation.");
            if (typeof showToast === 'function') {
                showToast("Recorte temporalmente no disponible. El resto de herramientas (filtros, brillo, pincel, censura) están listas.", "warning");
            }
            return;
        }
        
        try {
            cropper = new Cropper(editingImg, {
                aspectRatio: 1.0, // Fixed 1:1 proportional crop by default for PDF alignment
                viewMode: 1,
                background: false,
                autoCropArea: 0.95,
                ready: function() {
                    // Synchronize current visual settings
                    if (cropper) {
                        cropper.rotateTo(parseInt(angleSlider.value));
                        cropper.scale(scaleX, scaleY);
                    }
                }
            });
            const ratioTxt = document.getElementById('wpe-current-ratio-txt');
            if (ratioTxt) ratioTxt.textContent = "1:1 (Cuadrado)";
        } catch (e) {
            console.error("Error initializing Cropper: ", e);
        }
    }

    function setCropAspectRatio(ratio) {
        if (!cropper) return;
        if (ratio === 'free') {
            cropper.setAspectRatio(NaN);
        } else {
            cropper.setAspectRatio(parseFloat(ratio));
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

            // Phase 1: Compress image to JPEG at 800x800 maximum, 0.65 quality (imperceptible compression, highly fluid)
            const resultCanvas = document.createElement('canvas');
            let width = finalCanvas.width;
            let height = finalCanvas.height;
            const maxDim = 800;

            if (width > maxDim || height > maxDim) {
                const ratio = Math.min(maxDim / width, maxDim / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            resultCanvas.width = width;
            resultCanvas.height = height;
            const resultCtx = resultCanvas.getContext('2d');
            resultCtx.drawImage(finalCanvas, 0, 0, width, height);

            const compressedBase64 = resultCanvas.toDataURL('image/jpeg', 0.65);

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

            // Detect greyish/shadowed paper/desk background and map smoothly to pure white #FFFFFF
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const lum = (max + min) / 2;
                const sat = max === 0 ? 0 : (max - min) / max;

                const isGreyish = Math.abs(r - g) < 32 && Math.abs(g - b) < 32 && Math.abs(r - b) < 32;

                if (lum > 115 && isGreyish && sat < 0.35) {
                    const factor = Math.min(1.0, (lum - 110) / 60);
                    data[i]     = Math.round(r * (1 - factor) + 255 * factor);
                    data[i + 1] = Math.round(g * (1 - factor) + 255 * factor);
                    data[i + 2] = Math.round(b * (1 - factor) + 255 * factor);
                } else {
                    // Enhance specimen contrast & color saturation
                    data[i]     = Math.min(255, Math.max(0, Math.round((r - 128) * 1.12 + 128)));
                    data[i + 1] = Math.min(255, Math.max(0, Math.round((g - 128) * 1.12 + 128)));
                    data[i + 2] = Math.min(255, Math.max(0, Math.round((b - 128) * 1.12 + 128)));
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

    async function applyGeminiAIRetouch() {
        const keyInput = document.getElementById('wpe-gemini-key-input');
        let apiKey = keyInput ? keyInput.value.trim() : '';
        if (!apiKey) {
            apiKey = localStorage.getItem('geminiApiKey') || '';
        }

        if (!apiKey) {
            const userKey = prompt("Ingrese su clave de API de Gemini para el retoque fotográfico con IA:");
            if (userKey) {
                apiKey = userKey.trim();
                localStorage.setItem('geminiApiKey', apiKey);
                if (keyInput) keyInput.value = apiKey;
            } else {
                if (typeof showToast === 'function') showToast("Se requiere una API Key de Gemini. Ejecutando retoque local de estudio...", "warning");
                const photoType = document.getElementById('wpe-photo-type') ? document.getElementById('wpe-photo-type').value : 'macro';
                if (photoType === 'macro') applyMacroStudioWhitening();
                else applyMicroHEOptimization();
                return;
            }
        } else {
            localStorage.setItem('geminiApiKey', apiKey);
        }

        const photoType = document.getElementById('wpe-photo-type') ? document.getElementById('wpe-photo-type').value : 'macro';
        const btnAi = document.getElementById('wpe-btn-gemini-retouch');
        const originalText = btnAi ? btnAi.innerHTML : '';
        if (btnAi) {
            btnAi.disabled = true;
            btnAi.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando con IA Gemini...';
        }

        if (typeof showToast === 'function') showToast("Enviando foto a IA Gemini para retoque de estudio...", "info");

        try {
            const currentDataUrl = baseCanvas.toDataURL('image/jpeg', 0.85);
            const base64Data = currentDataUrl.split(',')[1];

            let promptText = "";
            if (photoType === 'macro') {
                promptText = "Transforma esta fotografía macroscópica de anatomía patológica para un informe médico profesional. Remueve el fondo gris de la mesa y reemplázalo por blanco puro #FFFFFF. Aumenta el contraste y nitidez del órgano y de la regla graduada sin alterar la estructura del espécimen.";
            } else {
                promptText = "Transforma esta fotomicrografía histológica (tinción H&E) para un informe patológico profesional. Corrige el balance de blancos de la luz de microscopio, aumenta la nitidez de los núcleos celulares de hematoxilina y el contraste de la eosina sin distorsionar la arquitectura tisular.";
            }

            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                if (typeof showToast === 'function') showToast("Retoque con IA Gemini completado con éxito.", "success");
            } else {
                if (photoType === 'macro') applyMacroStudioWhitening();
                else applyMicroHEOptimization();
                if (typeof showToast === 'function') showToast("Retoque procesado localmente con éxito.", "success");
            }
        } catch (err) {
            console.error("Error en Retoque Gemini:", err);
            if (typeof showToast === 'function') showToast(`Error Gemini: ${err.message}. Aplicando retoque local de estudio...`, "warning");
            if (photoType === 'macro') applyMacroStudioWhitening();
            else applyMicroHEOptimization();
        } finally {
            if (btnAi) {
                btnAi.disabled = false;
                btnAi.innerHTML = originalText;
            }
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
    window.openPhotoEditor = function(imageSrc, filename, callback) {
        initDOMElements();
        originalImageSrc = imageSrc;
        originalFilename = filename || "imagen.jpg";
        filenameDisplay.textContent = originalFilename;
        saveCallback = callback;

        wpeModal.style.display = 'flex';
        
        // Load image to editor
        loadImageToEditor(imageSrc);
    };
})();
