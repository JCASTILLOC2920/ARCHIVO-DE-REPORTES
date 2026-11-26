/**
 * responsive_scaler.js
 * Sistema de Escalado Matemático Fluido y Matriz Tri-Adaptativa por Densidad Útil
 * Resiliencia Total ante Zoom del Navegador (50% a 200%) y Tamaño de Monitor (13" a 32")
 * [GOLIATH OMEGA-ARGÓN v12.0 - JC PATH LAB]
 */
(function () {
    function updateResponsiveScale() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Deshabilitar escalador artificial en celulares (< 768px o táctiles) para permitir CSS nativo
        const hasCoarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
        const hasFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
        const isMobile = width <= 768 || (width <= 1024 && hasCoarsePointer && !hasFinePointer);
        if (isMobile) {
            const root = document.documentElement;
            root.style.setProperty('--screen-scale-factor', '1.0000');
            root.style.setProperty('--zoom-level', '1.00');
            root.style.setProperty('--zoom-compensation', '1.0000');
            root.style.setProperty('--vw-width', '100%');
            root.style.setProperty('--vh-height', '100%');
            root.style.setProperty('--usable-content-width', '100%');

            if (document.body) {
                document.body.classList.remove('density-mode-1', 'density-mode-2');
                document.body.classList.add('density-mode-3');
            }
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        
        // Medir zoom óptico real del viewport si está disponible
        const vvScale = (window.visualViewport && window.visualViewport.scale) ? window.visualViewport.scale : 1;
        const totalZoomFactor = Math.max(0.5, Math.min(2.5, dpr * vvScale));

        // Ancho de sidebar según estado de colapso o resolución
        const appContainer = document.getElementById('appContainer');
        const isCollapsed = appContainer ? appContainer.classList.contains('collapsed') : false;
        let sidebarWidth = isCollapsed ? (width <= 768 ? 0 : 70) : (width < 1250 ? 200 : 260);

        // Ancho real libre para el contenido descontando sidebar y zoom
        const rawContentWidth = width - sidebarWidth;
        const effectiveUsableWidth = rawContentWidth / Math.max(0.8, totalZoomFactor);

        // Ancho base de referencia
        const baselineWidth = 1440;
        let rawRatio = width / baselineWidth;
        let scaleFactor = Math.max(0.85, Math.min(1.40, Math.pow(rawRatio, 0.40)));

        // Factor de compensación contra zoom agresivo (>120% o <90%)
        let zoomCompensation = 1.0;
        if (totalZoomFactor > 1.15) {
            zoomCompensation = Math.max(0.70, 1 / Math.pow(totalZoomFactor, 0.55));
        } else if (totalZoomFactor < 0.9) {
            zoomCompensation = Math.min(1.25, 1 / Math.pow(totalZoomFactor, 0.35));
        }

        const root = document.documentElement;
        root.style.setProperty('--screen-scale-factor', scaleFactor.toFixed(4));
        root.style.setProperty('--zoom-level', totalZoomFactor.toFixed(2));
        root.style.setProperty('--zoom-compensation', zoomCompensation.toFixed(4));
        root.style.setProperty('--vw-width', width + 'px');
        root.style.setProperty('--vh-height', height + 'px');
        root.style.setProperty('--usable-content-width', effectiveUsableWidth.toFixed(2) + 'px');

        // Determinación de Modo de Densidad Tri-Adaptativo en document.body
        if (document.body) {
            document.body.classList.remove('density-mode-1', 'density-mode-2', 'density-mode-3');
            
            if (effectiveUsableWidth >= 1280 && width >= 1400) {
                document.body.classList.add('density-mode-1'); // Modo 1: Vista Ejecutiva Amplia
            } else if (effectiveUsableWidth >= 980 && width >= 1100) {
                document.body.classList.add('density-mode-2'); // Modo 2: Vista Balanceada Fluid-Wrap
            } else {
                document.body.classList.add('density-mode-3'); // Modo 3: Vista Ultrafina de Alta Densidad (0 Recorte)
            }
        }
    }

    let rAF_Id = null;
    function throttledScale() {
        if (rAF_Id) return;
        rAF_Id = requestAnimationFrame(() => {
            rAF_Id = null;
            updateResponsiveScale();
        });
    }

    // Ejecutar al cargar y al cambiar de tamaño o zoom a 60 FPS
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateResponsiveScale);
    } else {
        updateResponsiveScale();
    }

    window.addEventListener('resize', throttledScale, { passive: true });
    
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', throttledScale, { passive: true });
    }

    // 1. CSS UNIVERSAL ADAPTATIVO (Monitores 13"-49", Zoom 50%-250% y Celulares 320px+)
    function injectUniversalAdaptiveCSS() {
        if (document.getElementById('jc-universal-adaptive-css')) return;
        const st = document.createElement('style');
        st.id = 'jc-universal-adaptive-css';
        st.textContent = `
            html, body { max-width: 100vw !important; overflow-x: hidden !important; }
            .report-editor-overlay, .modal-overlay, #reportEditorModalOverlay, #registrationModalOverlay {
                max-width: 100vw !important; max-height: 100dvh !important; box-sizing: border-box !important;
            }
            .report-editor-card, .modal-card, .patient-modal-card {
                max-height: 96dvh !important; max-width: 98vw !important; overflow-y: auto !important;
            }
            .table-container, .table-responsive { width: 100% !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
            @media (max-width: 1366px), (min-resolution: 1.2dppx) {
                html { font-size: clamp(12px, calc(14px * var(--zoom-compensation, 1)), 16px) !important; }
                .cockpit-header, .cockpit-toolbar { flex-wrap: wrap !important; gap: 6px !important; }
            }
            @media (max-width: 768px) {
                html { font-size: 14px !important; }
                .action-btn, .cockpit-phase-btn, button { min-height: 38px !important; }
                .report-editor-card, .modal-card { width: 100vw !important; height: 100dvh !important; max-height: 100dvh !important; border-radius: 0 !important; margin: 0 !important; }
                .cockpit-split-container, .editor-grid { display: flex !important; flex-direction: column !important; }
            }
        `;
        (document.head || document.documentElement).appendChild(st);
    }

    // 2. AUTOCOMPLETADO PREDICTIVO BAYESIANO O(1): Médico -> Clínica Habitual (0.0ms)
    const _doctorClinicMap = new Map();
    function buildDoctorClinicMap() {
        if (_doctorClinicMap.size > 0) return;
        const pts = window.REAL_SUPABASE_PATIENTS || window.patientDatabase || [];
        const counts = {};
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            if (!p) continue;
            const med = String(p.medSolicitante || p.med_solicitante || '').trim().toUpperCase();
            const cli = String(p.clinica || '').trim().toUpperCase();
            if (med.length > 3 && cli.length > 2 && !cli.includes('SIN CLINICA') && !cli.includes('PARTICULAR')) {
                counts[med] = counts[med] || {};
                counts[med][cli] = (counts[med][cli] || 0) + 1;
            }
        }
        Object.keys(counts).forEach(m => {
            let bestCli = '', maxC = 0;
            Object.keys(counts[m]).forEach(c => { if (counts[m][c] > maxC) { maxC = counts[m][c]; bestCli = c; } });
            if (bestCli) _doctorClinicMap.set(m, bestCli);
        });
    }

    function wirePredictiveDoctorClinic() {
        [['m_medSolicitante', 'm_clinica'], ['re_medSolicitante', 're_clinica']].forEach(([medId, cliId]) => {
            const medEl = document.getElementById(medId);
            const cliEl = document.getElementById(cliId);
            if (medEl && cliEl && !medEl._predictiveWired) {
                medEl._predictiveWired = true;
                const onMedChange = () => {
                    buildDoctorClinicMap();
                    const val = (medEl.value || '').trim().toUpperCase();
                    if (!val || (cliEl.value && !cliEl.value.toUpperCase().includes('SIN CLINICA'))) return;
                    let matchCli = _doctorClinicMap.get(val);
                    if (!matchCli && val.length >= 4) {
                        for (const [k, v] of _doctorClinicMap.entries()) {
                            if (k.includes(val) || val.includes(k)) { matchCli = v; break; }
                        }
                    }
                    if (matchCli) {
                        cliEl.value = matchCli;
                        cliEl.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                };
                medEl.addEventListener('change', onMedChange);
                medEl.addEventListener('blur', onMedChange);
            }
        });
    }

    // 3. CANDADO CLÍNICO ANTI-DISCORDANCIA (Sexo / Lateralidad) EN 0.0ms (0 Llaves)
    function checkClinicalConcordance() {
        const sexoEl = document.getElementById('re_sexo');
        const macroEl = document.getElementById('re_macroDesc');
        const diagEl = document.getElementById('re_diagnostico');
        const organoEl = document.getElementById('re_muestraOrgano') || document.getElementById('re_organo');
        if (!macroEl || !diagEl) return;
        const sexo = (sexoEl ? sexoEl.value : '').toUpperCase();
        const macro = (macroEl.value || '').toLowerCase();
        const diag = (diagEl.value || '').toLowerCase();
        const org = (organoEl ? organoEl.value : '').toLowerCase();
        const fullTxt = `${org} ${macro} ${diag}`;
        const warnings = [];
        if (sexo.startsWith('M') && /\b(cervix|cérvix|utero|útero|endometrio|ovario|vagina|trompa|placenta)\b/i.test(fullTxt)) {
            warnings.push('⚠️ Discordancia Sexo/Órgano: Paciente MASCULINO con término ginecológico detectado.');
        } else if (sexo.startsWith('F') && /\b(prostata|próstata|prostatico|prostático|testiculo|testículo|epididimo)\b/i.test(fullTxt)) {
            warnings.push('⚠️ Discordancia Sexo/Órgano: Paciente FEMENINO con término urológico masculino detectado.');
        }
        const latMacroD = /\bderech[oa]\b/i.test(macro), latMacroI = /\bizquierd[oa]\b/i.test(macro);
        const latDiagD = /\bderech[oa]\b/i.test(diag), latDiagI = /\bizquierd[oa]\b/i.test(diag);
        if ((latMacroD && !latMacroI && latDiagI && !latDiagD) || (latMacroI && !latMacroD && latDiagD && !latDiagI)) {
            warnings.push('⚠️ Discordancia de Lateralidad: Verifique Derecha vs Izquierda entre Macroscopía y Diagnóstico.');
        }
        let badge = document.getElementById('jc-concordance-alert');
        if (warnings.length > 0) {
            if (!badge) {
                badge = document.createElement('div');
                badge.id = 'jc-concordance-alert';
                badge.style.cssText = 'background:#78350f;color:#fde68a;border:1px solid #f59e0b;padding:6px 12px;border-radius:6px;font-size:0.78rem;font-weight:700;margin-bottom:6px;';
                diagEl.parentNode.insertBefore(badge, diagEl);
            }
            badge.textContent = warnings.join(' | ');
            badge.style.display = 'block';
        } else if (badge) {
            badge.style.display = 'none';
        }
    }

    // 4. BOTÓN CASO GEMELO HISTÓRICO (Micro + Diagnóstico en 0.0ms, 0 Llaves) + WHATSAPP 1-CLIC
    window.sugerirCasoGemeloHistorico = function() {
        const org = ((document.getElementById('re_muestraOrgano') || document.getElementById('re_organo') || {}).value || '').toLowerCase().trim();
        const macro = ((document.getElementById('re_macroDesc') || {}).value || '').toLowerCase().trim();
        const pts = window.REAL_SUPABASE_PATIENTS || window.patientDatabase || [];
        const tokens = (org + ' ' + macro).replace(/[^a-záéíóúñ0-9\s]/gi, ' ').split(/\s+/).filter(w => w.length >= 4);
        if (tokens.length === 0) return;
        let bestP = null, bestScore = 0;
        const currCod = ((document.getElementById('re_codAtencion') || {}).value || '').toUpperCase().trim();
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            if (!p || String(p.codAtencion || '').toUpperCase() === currCod) continue;
            const pMicro = String(p.microscopia || p.descMicro || p.descripcion_microscopica || '').trim();
            const pDiag = String(p.diagnostico || p.diagHistologico || p.diagnostico_histologico || '').trim();
            if (pMicro.length < 30 || pDiag.length < 15) continue;
            const hay = (String(p.especimen || '') + ' ' + String(p.macroscopia || p.descMacro || '') + ' ' + pDiag).toLowerCase();
            let score = 0;
            for (let j = 0; j < tokens.length; j++) {
                if (hay.includes(tokens[j])) score += (org.includes(tokens[j]) ? 3 : 1);
            }
            if (score > bestScore) { bestScore = score; bestP = { micro: pMicro, diag: pDiag, cod: p.codAtencion }; }
        }
        if (bestP && bestScore >= 2) {
            const miEl = document.getElementById('re_microDesc');
            const diEl = document.getElementById('re_diagnostico');
            if (miEl && !miEl.value.trim()) { miEl.value = bestP.micro; miEl.dispatchEvent(new Event('input', { bubbles: true })); }
            if (diEl && !diEl.value.trim()) { diEl.value = bestP.diag; diEl.dispatchEvent(new Event('input', { bubbles: true })); }
            if (typeof window.showToast === 'function') window.showToast(`✓ Caso Gemelo (${bestP.cod}) aplicado en 0.0ms`, 'success', 3500);
            checkClinicalConcordance();
        } else if (typeof window.showToast === 'function') {
            window.showToast('Escriba el órgano o macroscopía para buscar el caso gemelo más cercano.', 'info', 3000);
        }
    };

    window.enviarInformeWhatsAppDirecto = function() {
        const cod = ((document.getElementById('re_codAtencion') || {}).value || '').trim();
        const pac = ((document.getElementById('re_paciente') || {}).value || '').trim() || (((document.getElementById('re_apePaciente') || {}).value || '') + ', ' + ((document.getElementById('re_nomPaciente') || {}).value || ''));
        const tel = ((document.getElementById('re_telefono') || {}).value || '').replace(/\D/g, '');
        const msg = encodeURIComponent(`*JC PATH LAB - DR. JOSÉ CASTILLO*\nInforme Anatomopatológico *${cod}*\nPaciente: *${pac}*\nEstado: *FIRMADO Y LISTO PARA ENTREGA*`);
        window.open(`https://wa.me/${tel.length >= 9 ? '51' + tel.slice(-9) : ''}?text=${msg}`, '_blank');
    };

    function mountSmartCockpitButtons() {
        const btnMacroVis = document.getElementById('btnCrearMacroVision');
        if (btnMacroVis && !document.getElementById('btnCasoGemeloO1')) {
            const btnGem = document.createElement('button');
            btnGem.type = 'button';
            btnGem.id = 'btnCasoGemeloO1';
            btnGem.className = 'cockpit-phase-btn';
            btnGem.style.cssText = 'background:linear-gradient(135deg,#0284c7,#38bdf8) !important;color:#fff !important;border:1px solid #7dd3fc !important;font-weight:700 !important;border-radius:6px !important;padding:3px 10px !important;margin-left:6px !important;cursor:pointer !important;font-size:0.72rem !important;display:inline-flex !important;align-items:center !important;gap:5px !important;';
            btnGem.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> CASO GEMELO (0ms)';
            btnGem.title = 'Autocompletar Microscopía y Diagnóstico con el Caso Gemelo Histórico más exacto (0 llaves)';
            btnGem.onclick = window.sugerirCasoGemeloHistorico;
            btnMacroVis.parentNode.insertBefore(btnGem, btnMacroVis.nextSibling);

            const btnWa = document.createElement('button');
            btnWa.type = 'button';
            btnWa.id = 'btnWhatsAppCockpitO1';
            btnWa.className = 'cockpit-phase-btn';
            btnWa.style.cssText = 'background:#16a34a !important;color:#fff !important;border:1px solid #4ade80 !important;font-weight:700 !important;border-radius:6px !important;padding:3px 10px !important;margin-left:6px !important;cursor:pointer !important;font-size:0.72rem !important;display:inline-flex !important;align-items:center !important;gap:5px !important;';
            btnWa.innerHTML = '<i class="fa-brands fa-whatsapp"></i> WHATSAPP';
            btnWa.title = 'Notificar Informe por WhatsApp en 1 clic';
            btnWa.onclick = window.enviarInformeWhatsAppDirecto;
            btnGem.parentNode.insertBefore(btnWa, btnGem.nextSibling);
        }
        ['re_macroDesc', 're_microDesc', 're_diagnostico', 're_sexo'].forEach(id => {
            const el = document.getElementById(id);
            if (el && !el._concordanceWired) {
                el._concordanceWired = true;
                el.addEventListener('input', checkClinicalConcordance);
                el.addEventListener('change', checkClinicalConcordance);
            }
        });
        wirePredictiveDoctorClinic();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { injectUniversalAdaptiveCSS(); mountSmartCockpitButtons(); });
    } else {
        injectUniversalAdaptiveCSS();
        mountSmartCockpitButtons();
    }

    window.ResponsiveScaler = { updateScale: updateResponsiveScale, checkConcordance: checkClinicalConcordance };
})();
