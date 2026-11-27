/**
 * ARCHIVO OBJETIVO: conector_dictado_cortana.js
 * AUTORIDAD SUPREMA: Dr. José Castillo / JC Path Lab
 * DIRECTIVAS: Goliath Omega-Argón v12.0 - Conexión de Dictado Cortana & KRYPTON
 */

(function() {
    'use strict';

    const CORTANA_API_URL = 'http://127.0.0.1:8799/api/conversar';
    const KRYPTON_PARSER_URL = 'http://127.0.0.1:8010/cortana/ask';

    let isRecording = false;
    let recognitionInstance = null;

    function initDictadoCortana() {
        const btnDictado = document.getElementById('btnLlenadoDictado') || document.querySelector('[data-action="dictado-cortana"]');
        
        if (!btnDictado) {
            // Si el botón no existe aún en el DOM, creamos un observador o salimos ordenadamente
            return;
        }

        btnDictado.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDictado(btnDictado);
        });
    }

    function toggleDictado(btn) {
        if (!isRecording) {
            iniciarEscuchaCortana(btn);
        } else {
            detenerEscuchaCortana(btn);
        }
    }

    function iniciarEscuchaCortana(btn) {
        isRecording = true;
        btn.classList.add('dictando-activo');
        btn.style.boxShadow = '0 0 15px #0284C7';
        btn.innerHTML = '<i class="fas fa-microphone-alt animate-pulse"></i> Escuchando...';

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('El reconocimiento de voz no está soportado en este navegador. Usando simulación de Cortana.');
            simularDictadoCortana(btn);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionInstance = new SpeechRecognition();
        recognitionInstance.lang = 'es-PE';
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;

        recognitionInstance.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            procesarTextoDictado(transcript);
        };

        recognitionInstance.onerror = function(event) {
            console.error('Error en reconocimiento Cortana:', event.error);
            detenerEscuchaCortana(btn);
        };

        recognitionInstance.onend = function() {
            if (isRecording) {
                detenerEscuchaCortana(btn);
            }
        };

        try {
            recognitionInstance.start();
        } catch (err) {
            console.error('No se pudo iniciar SpeechRecognition:', err);
            simularDictadoCortana(btn);
        }
    }

    function detenerEscuchaCortana(btn) {
        isRecording = false;
        btn.classList.remove('dictando-activo');
        btn.style.boxShadow = '';
        btn.innerHTML = '<i class="fas fa-microphone"></i> Llenado por Dictado';

        if (recognitionInstance) {
            try {
                recognitionInstance.stop();
            } catch (err) {
                console.error('Error al detener reconocimiento:', err);
            }
        }
    }

    function simularDictadoCortana(btn) {
        setTimeout(() => {
            const textoEjemplo = "Paciente Juan Pérez DNI 45678912 edad 45 años varón médico Dr. Castillo clínica San Pablo costo 250 adelanto 100 muestra biopsia gástrica";
            procesarTextoDictado(textoEjemplo);
            detenerEscuchaCortana(btn);
        }, 3000);
    }

    async function procesarTextoDictado(texto) {
        if (!texto || texto.trim() === '') return;
        
        try {
            const response = await fetch(CORTANA_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: texto, contexto: 'extraccion_datos_paciente' })
            });

            if (!response.ok) {
                throw new Error('Error al conectar con Cortana API local');
            }

            const data = await response.json();
            autocompletarCamposFormulario(data.resultado || extraerDatosHeuristica(texto));
        } catch (error) {
            console.warn('Fallback a parser heurístico local por error en API Cortana:', error);
            const datosExtraidos = extraerDatosHeuristica(texto);
            autocompletarCamposFormulario(datosExtraidos);
        }
    }

    function extraerDatosHeuristica(texto) {
        const datos = {
            dni: '',
            nombres: '',
            apellidos: '',
            edad: '',
            sexo: '',
            medico: '',
            clinica: '',
            costo: '',
            adelanto: '',
            muestra: ''
        };

        const dniMatch = texto.match(/dni\s*(\d{8})/i);
        if (dniMatch) datos.dni = dniMatch[1];

        const edadMatch = texto.match(/edad\s*(\d{1,3})/i);
        if (edadMatch) datos.edad = edadMatch[1];

        const costoMatch = texto.match(/costo\s*(\d+)/i);
        if (costoMatch) datos.costo = costoMatch[1];

        const adelantoMatch = texto.match(/adelanto\s*(\d+)/i);
        if (adelantoMatch) datos.adelanto = adelantoMatch[1];

        if (/varón|masculino|hombre/i.test(texto)) datos.sexo = 'M';
        if (/mujer|femenino/i.test(texto)) datos.sexo = 'F';

        datos.muestra = texto;
        return datos;
    }

    function autocompletarCamposFormulario(datos) {
        if (!datos) return;

        const mapeoIDs = {
            dni: document.getElementById('dniPaciente') || document.getElementById('dni'),
            nombres: document.getElementById('nombresPaciente') || document.getElementById('nombres'),
            apellidos: document.getElementById('apellidosPaciente') || document.getElementById('apellidos'),
            edad: document.getElementById('edadPaciente') || document.getElementById('edad'),
            sexo: document.getElementById('sexoPaciente') || document.getElementById('sexo'),
            medico: document.getElementById('medicoPaciente') || document.getElementById('medico'),
            clinica: document.getElementById('clinicaPaciente') || document.getElementById('clinica'),
            costo: document.getElementById('costoEstudio') || document.getElementById('costo'),
            adelanto: document.getElementById('adelantoEstudio') || document.getElementById('adelanto'),
            muestra: document.getElementById('muestraDetalle') || document.getElementById('muestra')
        };

        Object.keys(mapeoIDs).forEach(key => {
            const elemento = mapeoIDs[key];
            if (elemento && datos[key]) {
                elemento.value = datos[key];
                animarCampoModificado(elemento);
            }
        });
    }

    function animarCampoModificado(elemento) {
        elemento.style.transition = 'background-color 0.5s ease, border-color 0.5s ease';
        const originalBg = elemento.style.backgroundColor;
        const originalBorder = elemento.style.borderColor;

        elemento.style.backgroundColor = 'rgba(2, 132, 199, 0.15)';
        elemento.style.borderColor = '#0284C7';

        setTimeout(() => {
            elemento.style.backgroundColor = originalBg;
            elemento.style.borderColor = originalBorder;
        }, 1200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDictadoCortana);
    } else {
        initDictadoCortana();
    }

    window.ConectorDictadoCortana = {
        init: initDictadoCortana,
        procesarTexto: procesarTextoDictado
    };

})();
