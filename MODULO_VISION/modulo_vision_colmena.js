/**
 * MÓDULO VISIÓN CLÍNICO-PATOLÓGICO
 * JC PATH LAB - La Colmena Soberana
 * Director General: Dr. José Castillo (jclab59@gmail.com)
 * Archivo: modulo_vision_colmena.js
 */

(function (global) {
    'use strict';

    const CONFIG = {
        ENDPOINTS: {
            ORDEN_MEDICA: 'http://localhost:8010/api/vision/orden-medica',
            MACROSCOPIA: 'http://localhost:8010/api/vision/macroscopia'
        },
        TIMEOUT_MS: 30000,
        MAX_FILE_SIZE_MB: 10,
        ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
    };

    const UI = {
        NOTIFICATION_CONTAINER: '#colmena-notifications',
        PATIENT_FIELDS: {
            CODIGO_ATENCION: '#pac-codigo-atencion',
            DNI: '#pac-dni',
            NOMBRES: '#pac-nombres',
            MEDICO: '#pac-medico-solicitante',
            SEDE: '#pac-sede-clinica',
            MUESTRA: '#pac-muestra-remitida'
        },
        MACROSCOPIA_FIELD: '#editor-macroscopia'
    };

    class VisionColmena {
        constructor() {
            this._initUI();
        }

        _initUI() {
            if (!document.querySelector(UI.NOTIFICATION_CONTAINER)) {
                const container = document.createElement('div');
                container.id = 'colmena-notifications';
                container.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                `;
                document.body.appendChild(container);
            }
        }

        _notify(message, type = 'info') {
            const container = document.querySelector(UI.NOTIFICATION_CONTAINER);
            if (!container) return;

            const notification = document.createElement('div');
            const colors = {
                success: '#28a745',
                error: '#dc3545',
                warning: '#ffc107',
                info: '#007bff'
            };

            notification.style.cssText = `
                background: ${colors[type] || colors.info};
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 14px;
                animation: slideIn 0.3s ease-out;
                max-width: 350px;
            `;
            notification.textContent = message;
            container.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        }

        _validateFile(file) {
            if (!file) throw new Error('No se proporcionó archivo de imagen.');
            if (!CONFIG.ACCEPTED_TYPES.includes(file.type)) {
                throw new Error(`Tipo de archivo no soportado: ${file.type}. Use JPEG, PNG o WEBP.`);
            }
            if (file.size > CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
                throw new Error(`El archivo excede el tamaño máximo de ${CONFIG.MAX_FILE_SIZE_MB}MB.`);
            }
        }

        _fileToDataUrl(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Error al leer el archivo.'));
                reader.readAsDataURL(file);
            });
        }

        async _fetchWithTimeout(url, options, timeout = CONFIG.TIMEOUT_MS) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('Tiempo de espera agotado. Verifique la conexión con el backend de visión (PC4/CORTANA).');
                }
                throw error;
            }
        }

        async procesarOrdenMedica(fileODataUrl) {
            try {
                let dataUrl;
                if (fileODataUrl instanceof File) {
                    this._validateFile(fileODataUrl);
                    dataUrl = await this._fileToDataUrl(fileODataUrl);
                } else if (typeof fileODataUrl === 'string' && fileODataUrl.startsWith('data:image')) {
                    dataUrl = fileODataUrl;
                } else {
                    throw new Error('Formato de entrada inválido. Use un objeto File o una Data URL.');
                }

                this._notify('Procesando orden médica con visión artificial...', 'info');

                const response = await this._fetchWithTimeout(CONFIG.ENDPOINTS.ORDEN_MEDICA, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: dataUrl })
                });

                const data = response.data || response;

                const fieldMappings = {
                    [UI.PATIENT_FIELDS.CODIGO_ATENCION]: data.codigo_atencion || data.codigoAtencion,
                    [UI.PATIENT_FIELDS.DNI]: data.dni,
                    [UI.PATIENT_FIELDS.NOMBRES]: data.nombres_apellidos || data.nombres,
                    [UI.PATIENT_FIELDS.MEDICO]: data.medico_solicitante || data.medico,
                    [UI.PATIENT_FIELDS.SEDE]: data.sede_clinica || data.sede,
                    [UI.PATIENT_FIELDS.MUESTRA]: data.muestra_remitida || data.muestra
                };

                let filledCount = 0;
                Object.entries(fieldMappings).forEach(([selector, value]) => {
                    const element = document.querySelector(selector);
                    if (element && value) {
                        element.value = value;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        filledCount++;
                    }
                });

                if (filledCount > 0) {
                    this._notify(`Orden médica procesada. ${filledCount} campos autocompletados.`, 'success');
                } else {
                    this._notify('No se extrajeron datos válidos de la imagen.', 'warning');
                }

                return { success: true, data };
            } catch (error) {
                this._notify(`Error al procesar orden médica: ${error.message}`, 'error');
                return { success: false, error: error.message };
            }
        }

        async procesarMuestraMacroscopica(fileODataUrl) {
            try {
                let dataUrl;
                if (fileODataUrl instanceof File) {
                    this._validateFile(fileODataUrl);
                    dataUrl = await this._fileToDataUrl(fileODataUrl);
                } else if (typeof fileODataUrl === 'string' && fileODataUrl.startsWith('data:image')) {
                    dataUrl = fileODataUrl;
                } else {
                    throw new Error('Formato de entrada inválido. Use un objeto File o una Data URL.');
                }

                this._notify('Analizando muestra quirúrgica para redactar macroscopía...', 'info');

                const response = await this._fetchWithTimeout(CONFIG.ENDPOINTS.MACROSCOPIA, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: dataUrl })
                });

                const data = response.data || response;
                const macroscopiaTexto = data.macroscopia || data.descripcion || data.texto;

                if (!macroscopiaTexto) {
                    throw new Error('El backend no devolvió texto de macroscopía válido.');
                }

                const macroField = document.querySelector(UI.MACROSCOPIA_FIELD);
                if (macroField) {
                    macroField.value = macroscopiaTexto;
                    macroField.dispatchEvent(new Event('input', { bubbles: true }));
                    this._notify('Macroscopía redactada y cargada en el editor.', 'success');
                } else {
                    this._notify('Campo de macroscopía no encontrado en el editor.', 'warning');
                }

                return { success: true, data: { macroscopia: macroscopiaTexto } };
            } catch (error) {
                this._notify(`Error al procesar macroscopía: ${error.message}`, 'error');
                return { success: false, error: error.message };
            }
        }
    }

    global.VisionColmena = VisionColmena;
    global.visionColmena = new VisionColmena();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = VisionColmena;
    }

})(window);
