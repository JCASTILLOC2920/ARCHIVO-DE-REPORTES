// chat_ia_asistente.js
// GRUPO 3 - MISIÓN 7: Arquitectura del Módulo IA Asistente (Groq LPU Copilot Read-Only)
// Gestiona el Modo IA Guardia con interruptor ON/OFF, temporizador de 15s / ausencia,
// consulta segura en memoria a la tabla de pacientes y cumplimiento estricto de bioseguridad (No alucinación de diagnósticos).

import { callGroqAPI, cleanLatexToPlainText } from './groq_copilot.js';

const STORAGE_KEY_GUARDIA = 'ai_guardia_active';
const STORAGE_KEY_AUSENTE = 'doctor_ausente';
const TIMER_SECONDS = 15;

// Almacén de temporizadores activos por chat / canal
const activeTimers = new Map();

/**
 * Inicializa el módulo de IA Asistente en la interfaz del doctor o chat clínico
 */
export function initAIGuardiaModule() {
    ensureAIToggleDOM();
    setupEventListeners();
    console.log("[IA Guardia] Módulo IA Asistente (Groq LPU Read-Only) inicializado correctamente.");
}

/**
 * Inyecta el interruptor [ Modo IA Guardia: ON / OFF ] en la barra de chat o panel superior
 */
function ensureAIToggleDOM() {
    if (document.getElementById('aiGuardiaContainer')) return;

    // Buscar el header del chat o barra de canales
    const channelBar = document.querySelector('.drawer-channel-bar') || document.querySelector('.drawer-header') || document.body;
    
    const container = document.createElement('div');
    container.id = 'aiGuardiaContainer';
    container.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        background: linear-gradient(135deg, #0f172a, #1e293b);
        border-bottom: 1px solid #334155;
        color: #f8fafc;
        font-family: 'Inter', sans-serif;
        font-size: 0.78rem;
    `;

    const isActive = localStorage.getItem(STORAGE_KEY_GUARDIA) === 'true';
    const isAbsent = localStorage.getItem(STORAGE_KEY_AUSENTE) === 'true';

    container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-robot" style="color: #38bdf8; font-size: 0.95rem;"></i>
            <span style="font-weight: 700; letter-spacing: 0.3px;">IA Guardia (Groq LPU)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
            <label class="ai-switch-label" style="display: flex; align-items: center; cursor: pointer; gap: 6px;">
                <span id="aiGuardiaStatusText" style="font-size: 0.7rem; font-weight: 600; color: ${isActive ? '#4ade80' : '#94a3b8'};">${isActive ? 'ON' : 'OFF'}</span>
                <input type="checkbox" id="aiGuardiaToggle" ${isActive ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: #0284c7;">
            </label>
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 0.7rem; color: #cbd5e1;" title="Marcar como ausente para activar IA inmediata">
                <input type="checkbox" id="aiAbsentToggle" ${isAbsent ? 'checked' : ''} style="accent-color: #f59e0b;"> Ausente
            </label>
        </div>
    `;

    if (channelBar.nextSibling) {
        channelBar.parentNode.insertBefore(container, channelBar.nextSibling);
    } else {
        channelBar.appendChild(container);
    }
}

/**
 * Configura los eventos del interruptor y estado de ausencia
 */
function setupEventListeners() {
    const toggle = document.getElementById('aiGuardiaToggle');
    const statusText = document.getElementById('aiGuardiaStatusText');
    const absentToggle = document.getElementById('aiAbsentToggle');

    if (toggle) {
        toggle.addEventListener('change', (e) => {
            const active = e.target.checked;
            localStorage.setItem(STORAGE_KEY_GUARDIA, active ? 'true' : 'false');
            if (statusText) {
                statusText.textContent = active ? 'ON' : 'OFF';
                statusText.style.color = active ? '#4ade80' : '#94a3b8';
            }
            console.log(`[IA Guardia] Modo IA Guardia cambiado a: ${active ? 'ON' : 'OFF'}`);
        });
    }

    if (absentToggle) {
        absentToggle.addEventListener('change', (e) => {
            const absent = e.target.checked;
            localStorage.setItem(STORAGE_KEY_AUSENTE, absent ? 'true' : 'false');
            console.log(`[IA Guardia] Estado de ausencia cambiado a: ${absent}`);
        });
    }
}

/**
 * Obtiene la base de datos de pacientes en memoria (Supabase real o local)
 */
function getPatientsMemoryPool() {
    if (typeof window !== 'undefined') {
        if (Array.isArray(window.REAL_SUPABASE_PATIENTS) && window.REAL_SUPABASE_PATIENTS.length > 0) {
            return window.REAL_SUPABASE_PATIENTS;
        }
        if (Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0) {
            return window.patientDatabase;
        }
    }
    return [];
}

/**
 * Busca pacientes relevantes en memoria basados en texto del mensaje (DNI, código de atención o nombre)
 */
function searchPatientsInContext(text) {
    const patients = getPatientsMemoryPool();
    if (!patients || patients.length === 0) return [];

    const cleanText = (text || '').toLowerCase();
    
    // Extraer posibles códigos de atención o DNI o nombres
    return patients.filter(p => {
        if (!p) return false;
        const cod = String(p.codAtencion || p.cod_atencion || '').toLowerCase();
        const dni = String(p.dni || '').toLowerCase();
        const pacienteNom = String(p.paciente || p.nombres || '').toLowerCase();
        
        return (cod && cleanText.includes(cod)) ||
               (dni && cleanText.includes(dni)) ||
               (pacienteNom && cleanText.split(' ').some(part => part.length > 3 && cleanText.includes(part)));
    }).slice(0, 5); // Limitar a 5 casos relevantes
}

/**
 * Intercepta o recibe un mensaje entrante de una clínica.
 * Inicia el temporizador de 15 segundos si el doctor no responde.
 */
export function onClinicMessageReceived(messageObj) {
    const isGuardiaActive = localStorage.getItem(STORAGE_KEY_GUARDIA) === 'true';
    if (!isGuardiaActive) return; // IA deshabilitada

    const messageId = messageObj.id || `msg_${Date.now()}`;
    const clinicName = messageObj.remitente || 'Clínica';
    const messageText = messageObj.texto || messageObj.content || '';

    console.log(`[IA Guardia] Mensaje recibido de ${clinicName}: "${messageText}". Iniciando temporizador de ${TIMER_SECONDS}s...`);

    // Cancelar temporizador previo si existía para este canal
    if (activeTimers.has(clinicName)) {
        clearTimeout(activeTimers.get(clinicName));
    }

    const timer = setTimeout(async () => {
        activeTimers.delete(clinicName);
        
        // Verificar si el doctor ya respondió o si el modo sigue activo
        const stillActive = localStorage.getItem(STORAGE_KEY_GUARDIA) === 'true';
        const isAbsent = localStorage.getItem(STORAGE_KEY_AUSENTE) === 'true';
        
        // Si el doctor respondió recientemente (marcado en window), podemos omitir,
        // pero si está ausente o pasaron 15s sin respuesta del doctor, la IA actúa.
        if (!stillActive) return;

        console.log(`[IA Guardia] Tiempo límite (${TIMER_SECONDS}s) cumplido sin respuesta del doctor (Ausente: ${isAbsent}). Activando Copiloto Groq LPU...`);
        await executeAIGuardiaResponse(messageObj);

    }, TIMER_SECONDS * 1000);

    activeTimers.set(clinicName, timer);
}

/**
 * Notifica que el doctor ha respondido manualmente, cancelando el temporizador de la IA.
 */
export function onDoctorMessageSent(clinicName) {
    if (activeTimers.has(clinicName)) {
        clearTimeout(activeTimers.get(clinicName));
        activeTimers.delete(clinicName);
        console.log(`[IA Guardia] Doctor respondió a ${clinicName}. Temporizador de IA cancelado.`);
    }
}

/**
 * Ejecuta el análisis de la IA y genera la respuesta administrativa respetando la Bioseguridad estricta.
 */
async function executeAIGuardiaResponse(messageObj) {
    const clinicName = messageObj.remitente || 'Clínica';
    const messageText = messageObj.texto || messageObj.content || '';

    // Buscar pacientes relacionados en memoria
    const matchingPatients = searchPatientsInContext(messageText);

    let patientContextStr = "No se encontraron registros de pacientes directamente asociados en la memoria local.";
    if (matchingPatients.length > 0) {
        patientContextStr = matchingPatients.map(p => 
            `- Código: ${p.codAtencion || p.cod_atencion || 'N/D'} | Paciente: ${p.paciente || p.nombres || 'N/D'} | DNI: ${p.dni || 'N/D'} | Estado: ${p.estado || p.status || 'Registrado'} | Fecha Ingreso: ${p.fecha || p.fechaIngreso || 'N/D'} | Médico Solicitante: ${p.medSolicitante || p.doctor || 'N/D'}`
        ).join('\n');
    }

    const systemPrompt = `Eres el Asistente IA de Guardia de "JC Path Lab" (Dr. Joseph Castillo Cuenca).
Tu función es actuar como Copiloto Read-Only para atender consultas de clínicas y hospitales cuando el patólogo se encuentra ocupado o ausente.

REGLAS DE BIOSEGURIDAD ESTRICTA (LEY DE ORO):
1. PROHIBIDO ALUCINAR DIAGNÓSTICOS PATOLÓGICOS: Bajo ninguna circunstancia debes inventar, deducir o especular sobre resultados histopatológicos, malignidad, grados de displasia o diagnósticos médicos.
2. ALCANCE PERMITIDO: Solo puedes informar estado administrativo, código de atención, fecha de ingreso, si el informe ya está firmado/disponible en el sistema, y tiempos estimados de entrega.
3. TONO: Profesional, institucional, cortés y preciso en español médico.

DATOS DE PACIENTES ENCONTRADOS EN MEMORIA PARA ESTA CONSULTA:
${patientContextStr}

Responde de forma concisa y directa al mensaje de la clínica basándote exclusivamente en los datos administrativos anteriores.`;

    const userPrompt = `Mensaje de la clínica (${clinicName}): "${messageText}"`;

    try {
        const rawResponse = await callGroqAPI([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], false, 350);

        const cleanResponse = cleanLatexToPlainText(rawResponse);
        const aiMessage = `[IA Guardia - Groq LPU]: ${cleanResponse}`;

        console.log(`[IA Guardia] Respuesta generada: ${aiMessage}`);

        // Insertar en la interfaz de chat si existe la función global
        if (typeof window !== 'undefined' && typeof window.appendChatMessage === 'function') {
            window.appendChatMessage({
                remitente: 'Asistente IA (Guardia)',
                receptor: clinicName,
                texto: aiMessage,
                timestamp: new Date().toLocaleTimeString(),
                isAI: true
            });
        } else {
            // Fallback: Disparar evento personalizado
            const event = new CustomEvent('ai_guardia_response', {
                detail: { clinic: clinicName, text: aiMessage }
            });
            window.dispatchEvent(event);
        }

    } catch (error) {
        console.error("[IA Guardia] Error al consultar Groq LPU:", error);
    }
}

// Exponer en window para integración global
if (typeof window !== 'undefined') {
    window.initAIGuardiaModule = initAIGuardiaModule;
    window.onClinicMessageReceived = onClinicMessageReceived;
    window.onDoctorMessageSent = onDoctorMessageSent;
}
