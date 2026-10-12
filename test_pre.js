
        // Lógica de Zoom del Visor (Escalado Proporcional Sin Desbordamiento)
        let currentZoom = 1.0;
        window.changeZoom = (delta) => {
            currentZoom = Math.max(0.6, Math.min(2.0, parseFloat((currentZoom + delta).toFixed(2))));
            document.documentElement.style.setProperty('--pv-zoom', currentZoom);
            const zoomTxt = document.getElementById('pvZoomLevel');
            if (zoomTxt) zoomTxt.textContent = `${Math.round(currentZoom * 100)}%`;
        };

        window.resetZoom = () => {
            currentZoom = 1.0;
            document.documentElement.style.setProperty('--pv-zoom', 1.0);
            const zoomTxt = document.getElementById('pvZoomLevel');
            if (zoomTxt) zoomTxt.textContent = '100%';
        };

        window.adjustImagesAesthetics = () => {
            const imgContainers = document.querySelectorAll('.report-images');
            if (!imgContainers || imgContainers.length === 0) return;

            imgContainers.forEach(imgContainer => {
                const wrappers = imgContainer.querySelectorAll('.report-img-wrapper');
                if (wrappers.length === 0) {
                    imgContainer.remove();
                    return;
                }
                const imgs = imgContainer.querySelectorAll('.report-img');
                if (imgs.length === 0) {
                    imgContainer.remove();
                    return;
                }

                const isSingle = wrappers.length === 1;
                wrappers.forEach(wrapper => {
                    const img = wrapper.querySelector('.report-img');
                    if (isSingle) {
                        wrapper.style.setProperty('width', '204px', 'important');
                        wrapper.style.setProperty('height', '204px', 'important');
                        wrapper.style.setProperty('max-height', '204px', 'important');
                        wrapper.style.setProperty('aspect-ratio', '1 / 1', 'important');
                        wrapper.style.setProperty('margin', '0 auto', 'important');
                        if (img) {
                            img.style.setProperty('height', '100%', 'important');
                            img.style.setProperty('width', '100%', 'important');
                            img.style.setProperty('object-fit', 'contain', 'important');
                            img.style.setProperty('background-color', '#ffffff', 'important');
                        }
                    } else {
                        wrapper.style.setProperty('width', '166px', 'important');
                        wrapper.style.setProperty('height', '166px', 'important');
                        wrapper.style.setProperty('max-height', '171px', 'important');
                        wrapper.style.setProperty('aspect-ratio', '1 / 1', 'important');
                        if (img) {
                            img.style.setProperty('height', '100%', 'important');
                            img.style.setProperty('width', '100%', 'important');
                            img.style.setProperty('object-fit', 'contain', 'important');
                            img.style.setProperty('background-color', '#ffffff', 'important');
                        }
                    }
                });
            });
        };

        window.volverAEditar = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const codAtencion = urlParams.get('codAtencion') || urlParams.get('cod');
            if (window.opener && !window.opener.closed) {
                try {
                    if (codAtencion && typeof window.opener.handleAction === 'function') {
                        window.opener.handleAction('editar', codAtencion);
                    }
                    window.opener.focus();
                    window.close();
                    return;
                } catch (e) {
                    console.error(e);
                }
            }
            if (codAtencion) {
                window.location.href = `reportes.html?edit=${encodeURIComponent(codAtencion)}`;
            } else {
                window.location.href = 'reportes.html';
            }
        };

        function isValidImageSrc(src) {
            if (!src || typeof src !== 'string') return false;
            const clean = src.trim();
            if (!clean || clean === 'null' || clean === 'undefined' || clean === 'none' || clean === '{}' || clean === '[]' || clean === 'about:blank' || clean === '""') {
                return false;
            }
            if (clean.includes('/reportes.html') || clean.includes('/imprimir.html') || clean.endsWith('.html')) {
                return false;
            }
            if (clean.toLowerCase().startsWith('data:image/')) {
                return clean.length > 50 && clean.includes(';base64,') && !clean.endsWith(';base64,');
            }
            if (/^(https?:\/\/|blob:|\/|\.\/|[a-zA-Z0-9_\-\/\\.]+\.(jpg|jpeg|png|webp|gif|bmp))/i.test(clean)) {
                return true;
            }
            return clean.length > 20;
        }

        function extractImageSources(pat) {
            if (!pat) return { img01: null, img02: null, macro360: null };
            
            // Resolve Image 01
            let img01 = pat.img01 || pat.adjunto01 || pat.adjunto_01 || pat.foto01 || pat.foto_01 || 
                        pat.imagen01 || pat.imagen1 || pat.img1 || 
                        (Array.isArray(pat.imagenes) ? pat.imagenes[0] : (pat.imagenes && (pat.imagenes.img01 || pat.imagenes.adjunto01))) ||
                        (Array.isArray(pat.fotos) ? pat.fotos[0] : null) ||
                        (Array.isArray(pat.adjuntos) ? pat.adjuntos[0] : null) || null;

            // Resolve Image 02
            let img02 = pat.img02 || pat.adjunto02 || pat.adjunto_02 || pat.foto02 || pat.foto_02 || 
                        pat.imagen02 || pat.imagen2 || pat.img2 || 
                        (Array.isArray(pat.imagenes) ? pat.imagenes[1] : (pat.imagenes && (pat.imagenes.img02 || pat.imagenes.adjunto02))) ||
                        (Array.isArray(pat.fotos) ? pat.fotos[1] : null) ||
                        (Array.isArray(pat.adjuntos) ? pat.adjuntos[1] : null) || null;

            // Resolve Macro 360°
            let macro360 = null;
            if (Array.isArray(pat.macro360) && pat.macro360.length > 0) {
                macro360 = pat.macro360[0];
            } else if (typeof pat.macro360 === 'string' && pat.macro360) {
                try {
                    const parsed = JSON.parse(pat.macro360);
                    if (Array.isArray(parsed) && parsed.length > 0) macro360 = parsed[0];
                    else macro360 = pat.macro360;
                } catch (e) {
                    macro360 = pat.macro360;
                }
            }

            // Fallback robusto a sessionStorage / localStorage si alguna imagen no viene en el objeto pat
            if (!isValidImageSrc(img01) || !isValidImageSrc(img02) || !isValidImageSrc(macro360)) {
                try {
                    const localDataStr = sessionStorage.getItem('printPatientData') || localStorage.getItem('printPatientData');
                    if (localDataStr) {
                        const localPat = JSON.parse(localDataStr);
                        if (!isValidImageSrc(img01)) {
                            img01 = localPat.img01 || localPat.adjunto01 || localPat.foto01 || (Array.isArray(localPat.imagenes) ? localPat.imagenes[0] : null) || null;
                        }
                        if (!isValidImageSrc(img02)) {
                            img02 = localPat.img02 || localPat.adjunto02 || localPat.foto02 || (Array.isArray(localPat.imagenes) ? localPat.imagenes[1] : null) || null;
                        }
                        if (!isValidImageSrc(macro360) && localPat.macro360) {
                            macro360 = Array.isArray(localPat.macro360) ? localPat.macro360[0] : localPat.macro360;
                        }
                    }
                } catch (e) {}
            }

            return {
                img01: isValidImageSrc(img01) ? img01 : null,
                img02: isValidImageSrc(img02) ? img02 : null,
                macro360: isValidImageSrc(macro360) ? macro360 : null
            };
        }

        function normalizeGender(val, especimen, nombres) {
            const esp = String(especimen || '').toUpperCase();
            
            // 1. Heurística anatómica ABSOLUTA (va PRIMERO)
            if (esp.includes('ENDOMETR') || esp.includes('UTER') || esp.includes('ÚTER') || esp.includes('CERVIX') || esp.includes('CÉRVIZ') || esp.includes('CUELLO') || esp.includes('OVARIO') || esp.includes('MAMA') || esp.includes('PAP') || esp.includes('PAPANICOLAOU') || esp.includes('VAGIN') || esp.includes('VULV') || esp.includes('PLACENT') || esp.includes('GESTAC') || esp.includes('LEGRADO') || esp.includes('SALPING') || esp.includes('TROFOBLAST')) {
                return 'FEMENINO';
            }
            if (esp.includes('PROSTAT') || esp.includes('PRÓSTAT') || esp.includes('TESTICUL') || esp.includes('TESTÍC') || esp.includes('PENE') || esp.includes('ESCROT') || esp.includes('SEMINAL') || esp.includes('ORQUID') || esp.includes('CIRCUNCIS')) {
                return 'MASCULINO';
            }

            // 2. Valor explícito válido
            const raw = String(val || '').trim().toUpperCase();
            if (raw === 'F' || raw === 'FEMENINO' || raw === 'FEM' || raw.startsWith('FEM')) return 'FEMENINO';
            if (raw === 'M' || raw === 'MASCULINO' || raw === 'MASC' || raw.startsWith('MASC')) return 'MASCULINO';
            
            // 3. Heurística por nombre
            const nom = String(nombres || '').toUpperCase();
            const femaleNames = ['RAIZA', 'BRIGGITTE', 'MARIA', 'MARÍA', 'ROSA', 'ANA', 'CARMEN', 'NELLI', 'NELLY', 'LUCIA', 'LUCÍA', 'PATRICIA', 'GLORIA', 'ELIZABETH', 'CLAUDIA', 'SANDRA', 'VIVIANA', 'MIRTHA', 'MERY', 'MARY', 'ELEANA', 'CYNTHIA', 'NATALY', 'NATALIA', 'JUANA', 'SILVIA', 'BEATRIZ', 'MONICA', 'MÓNICA', 'LAURA', 'GABRIELA', 'YOLANDA', 'TERESA', 'JULIA', 'ESTHER', 'ISABEL', 'ROCIO', 'ROCÍO', 'PILAR', 'ANDREA', 'PAOLA', 'VANESSA', 'KAREN', 'JESSICA', 'FIORELLA', 'STEPHANIE', 'MILAGROS', 'LILIANA', 'KARINA', 'ANGELICA', 'ANGÉLICA', 'EVELYN', 'CECILIA', 'SONIA', 'SUSANA', 'DIANA', 'WENDY', 'LUCERO', 'MARYLUZ', 'PRUDENCIA', 'DAISY', 'EUGENIA', 'MARUJA', 'JUDITH', 'CELESTE', 'ZULEMA', 'SOPHIA', 'YESENIA', 'FLOR', 'CONSUELO', 'HILDA', 'NORA', 'FATIMA', 'FÁTIMA', 'GRACIELA', 'ALICIA', 'DELIA', 'ELSA', 'AMPARO', 'ROSARIO', 'SOLEDAD', 'VIRGINIA', 'CATALINA', 'EMILIA', 'ESPERANZA', 'LORENA', 'NADIA', 'VALERIA', 'CAMILA', 'SOFIA', 'SOFÍA', 'FERNANDA', 'ALEJANDRA', 'DANIELA', 'MARIANA', 'VERONICA', 'VERÓNICA'];
            const parts = nom.split(/[\s,]+/);
            for (const p of parts) {
                if (p && femaleNames.includes(p)) return 'FEMENINO';
            }

            if (raw === 'O' || raw === 'OTRO') return 'OTRO';
            return '';
        }

        