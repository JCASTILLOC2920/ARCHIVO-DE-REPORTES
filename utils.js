// utils.js - Módulo Centralizado de Utilidades Purificadas y Sanitizadores (JC PATH LAB)

export const cleanCodeFunc = (str) => String(str || '').trim().toLowerCase().replace(/[-_\s]/g, '');

export function formatDisplayDate(dateStr) {
    if (!dateStr) return '---';
    if (dateStr instanceof Date) {
        const dd = String(dateStr.getDate()).padStart(2, '0');
        const mm = String(dateStr.getMonth() + 1).padStart(2, '0');
        const yyyy = dateStr.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }
    const str = String(dateStr).trim();
    if (str.includes('/')) return str;
    const parts = str.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return str;
}

// Expresiones regulares pre-compiladas estáticamente fuera de bucles (Máxima eficiencia CPU)
const REGEX_HTML_NBSP = /&nbsp;/gi;
const REGEX_HTML_AMP = /&amp;/gi;
const REGEX_HTML_SPANS = /<\/?span[^>]*>/gi;
const REGEX_PAPA_NICOLAS = /\bpap[áa]\s*nicol[áa]s\b/gi;
const REGEX_PAPA_NICO_VARIANTS = /\bpapa?ni[co]o?l?[a-z]{0,6}\b/gi;

export function correctPapanicolaouSpelling(text) {
    if (!text) return '';
    
    let result = String(text).replace(REGEX_HTML_NBSP, ' ').replace(REGEX_HTML_AMP, '&');
    result = result.replace(REGEX_HTML_SPANS, '');
    
    result = result.replace(REGEX_PAPA_NICOLAS, (match) => {
        if (match === match.toUpperCase()) return "PAPANICOLAOU";
        if (match[0] === match[0].toUpperCase()) return "Papanicolaou";
        return "papanicolaou";
    });
    
    result = result.replace(REGEX_PAPA_NICO_VARIANTS, (match) => {
        if (match === match.toUpperCase()) return "PAPANICOLAOU";
        if (match === match.toLowerCase()) return "papanicolaou";
        return "Papanicolaou";
    });
    
    return result;
}

export function cleanTextContentLocal(text) {
    if (!text) return '';
    let result = String(text);
    result = result.replace(/[{}]/g, '');
    result = result.replace(/\b\d{6,}\b/g, '');
    result = result.replace(/\b([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+\1\b/gi, '$1');
    result = correctPapanicolaouSpelling(result);
    return result;
}

export function formatDoctorName(name) {
    if (!name) return "";
    let clean = String(name).toUpperCase().trim();
    clean = clean.replace(/\bDR\s*,/gi, "DR.");
    clean = clean.replace(/\bDRA\s*,/gi, "DRA.");
    clean = clean.replace(/\bDR\s+(?!\.)/gi, "DR. ");
    clean = clean.replace(/\bDRA\s+(?!\.)/gi, "DRA. ");
    clean = clean.replace(/\bDR\s*\.\s*\./gi, "DR.");
    clean = clean.replace(/\bDRA\s*\.\s*\./gi, "DRA.");
    clean = clean.replace(/\s+/g, " ");
    return clean;
}

export function toTitleCase(str) {
    if (!str) return '';
    const minorWords = ['de', 'del', 'la', 'las', 'los', 'y', 'o', 'en'];
    return String(str).toLowerCase().split(/\s+/).map((word, idx) => {
        if (minorWords.includes(word) && idx > 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

export function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function sanitizeDateForPg(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const str = dateStr.trim();
    if (!str || str === '---' || str === '-') return null;
    
    // Si ya viene como YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
    }
    // Si viene como DD/MM/YYYY
    const dmyMatch = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
    if (dmyMatch) {
        return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
    }
    return null;
}

export function normalizeSexo(val, especimen = '', nombres = '') {
    const esp = String(especimen || '').toUpperCase();
    
    // 1. Heurística anatómica ABSOLUTA (va PRIMERO - inviolable biológicamente)
    if (esp.includes('ENDOMETR') || esp.includes('UTER') || esp.includes('ÚTER') || esp.includes('CERVIX') || esp.includes('CÉRVIZ') || esp.includes('CUELLO') || esp.includes('OVARIO') || esp.includes('MAMA') || esp.includes('PAP') || esp.includes('PAPANICOLAOU') || esp.includes('VAGIN') || esp.includes('VULV') || esp.includes('PLACENT') || esp.includes('GESTAC') || esp.includes('LEGRADO') || esp.includes('SALPING') || esp.includes('TROFOBLAST')) {
        return 'FEMENINO';
    }
    if (esp.includes('PROSTAT') || esp.includes('PRÓSTAT') || esp.includes('TESTICUL') || esp.includes('TESTÍC') || esp.includes('PENE') || esp.includes('ESCROT') || esp.includes('SEMINAL') || esp.includes('ORQUID') || esp.includes('CIRCUNCIS')) {
        return 'MASCULINO';
    }

    // 2. Valor explícito válido ingresado por el usuario
    const raw = String(val || '').trim().toUpperCase();
    if (raw === 'F' || raw === 'FEMENINO' || raw === 'FEM' || raw.startsWith('FEM')) return 'FEMENINO';
    if (raw === 'M' || raw === 'MASCULINO' || raw === 'MASC' || raw.startsWith('MASC')) return 'MASCULINO';
    
    // 3. Heurística por nombre
    const nom = String(nombres || '').toUpperCase();
    const femaleNames = ['RAIZA', 'BRIGGITTE', 'MARIA', 'MARÍA', 'ROSA', 'ANA', 'CARMEN', 'NELLI', 'NELLY', 'LUCIA', 'LUCÍA', 'PATRICIA', 'GLORIA', 'ELIZABETH', 'CLAUDIA', 'SANDRA', 'VIVIANA', 'MIRTHA', 'MERY', 'MARY', 'ELEANA', 'CYNTHIA', 'NATALY', 'NATALIA', 'JUANA', 'SILVIA', 'BEATRIZ', 'MONICA', 'MÓNICA', 'LAURA', 'GABRIELA', 'YOLANDA', 'TERESA', 'JULIA', 'ESTHER', 'ISABEL', 'ROCIO', 'ROCÍO', 'PILAR', 'ANDREA', 'PAOLA', 'VANESSA', 'KAREN', 'JESSICA', 'FIORELLA', 'STEPHANIE', 'MILAGROS', 'LILIANA', 'KARINA', 'ANGELICA', 'ANGÉLICA', 'EVELYN', 'CECILIA', 'SONIA', 'SUSANA', 'DIANA', 'WENDY', 'LUCERO', 'MARYLUZ', 'PRUDENCIA', 'DAISY', 'EUGENIA', 'MARUJA', 'JUDITH', 'CELESTE', 'ZULEMA', 'SOPHIA', 'YESENIA', 'FLOR', 'CONSUELO', 'HILDA', 'ELVA', 'NORA', 'FATIMA', 'FÁTIMA', 'GRACIELA', 'ALICIA', 'DELIA', 'ELSA', 'AMPARO', 'ROSARIO', 'SOLEDAD', 'VIRGINIA', 'CATALINA', 'EMILIA', 'ESPERANZA', 'LORENA', 'NADIA', 'VALERIA', 'CAMILA', 'SOFIA', 'SOFÍA', 'FERNANDA', 'ALEJANDRA', 'DANIELA', 'MARIANA', 'VERONICA', 'VERÓNICA'];
    const maleNames = ['CARLOS', 'JOSE', 'JUAN', 'LUIS', 'MIGUEL', 'PEDRO', 'MANUEL', 'FRANCISCO', 'ANTONIO', 'JAVIER', 'ANDRES', 'ANDRÉS', 'JORGE', 'ROBERTO', 'MARIO', 'RAFAEL', 'FERNANDO', 'ENRIQUE', 'PABLO', 'RICARDO', 'ALEJANDRO', 'VICTOR', 'VÍCTOR', 'HUGO', 'OSCAR', 'ÓSCAR', 'GUSTAVO', 'RODRIGO', 'IVAN', 'IVÁN', 'FELIX', 'FÉLIX', 'SERGIO', 'ANGEL', 'ÁNGEL', 'ALBERTO', 'ALAN', 'EDGAR', 'CHRISTIAN', 'BRYAN', 'KEVIN', 'JHON', 'JOHN', 'ABEL', 'MARCOS', 'DAVID', 'DANIEL', 'GABRIEL', 'SANTIAGO', 'SEBASTIAN', 'SEBASTIÁN', 'NICOLAS', 'NICOLÁS', 'MARTIN', 'MARTÍN', 'RAMIRO', 'FREDDY', 'FREDY', 'GILBERTO', 'GONZALO', 'ERNESTO', 'ALFREDO', 'ARMANDO', 'ARTURO', 'AUGUSTO', 'BENJAMIN', 'CESAR', 'CÉSAR', 'CLAUDIO', 'DIEGO', 'DOMINGO', 'EDUARDO', 'EMILIO', 'ESTEBAN', 'EUGENIO', 'FABIAN', 'FABIÁN', 'GERARDO', 'GERMAN', 'GERMÁN', 'GIOVANNI', 'HENRY', 'HERBERT', 'JULIO', 'MARLON', 'MAURICIO', 'MAX', 'NILTON', 'NOE', 'NOÉ', 'ORLANDO', 'OSWALDO', 'PATRICIO', 'PAUL', 'RAUL', 'RAÚL', 'RENATO', 'RICHARD', 'ROLANDO', 'ROMAN', 'ROMÁN', 'RUBEN', 'RUBÉN', 'SAMUEL', 'SAUL', 'SAÚL', 'TEODORO', 'TOMAS', 'TOMÁS', 'WALTER', 'WILLIAM', 'WILMER'];
    const parts = nom.split(/[\s,]+/);
    for (const p of parts) {
        if (p && femaleNames.includes(p)) return 'FEMENINO';
        if (p && maleNames.includes(p)) return 'MASCULINO';
    }

    if (raw === 'O' || raw === 'OTRO') return 'OTRO';
    return '';
}

// GARANTÍA DE RETROCOMPATIBILIDAD ABSOLUTA EN WINDOW
if (typeof window !== 'undefined') {
    window.cleanCodeFunc = cleanCodeFunc;
    window.formatDisplayDate = formatDisplayDate;
    window.correctPapanicolaouSpelling = correctPapanicolaouSpelling;
    window.cleanTextContentLocal = cleanTextContentLocal;
    window.formatDoctorName = formatDoctorName;
    window.toTitleCase = toTitleCase;
    window.escapeHtml = escapeHtml;
    window.sanitizeDateForPg = sanitizeDateForPg;
    window.normalizeSexo = normalizeSexo;
}


// [ORQUESTADOR COLMENA - AGENTE 5]: Consolidación segura de escapeHtml y sanitización
if (typeof window !== 'undefined' && !window.colmenaEscapeHtmlSafe) {
    window.colmenaEscapeHtmlSafe = function(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
}

// 2. SISTEMA DE TOASTS DE CORTESÍA CLÍNICA (showToast)
export function showToast(title, message, type = 'success', duration = 3500) {
    if (typeof document === 'undefined') return;

    let container = document.getElementById('jc-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'jc-toast-container';
        container.style.cssText = 'position: fixed; top: 24px; right: 24px; z-index: 999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none; max-width: 380px; width: 100%;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `jc-toast jc-toast-${type}`;

    let borderColor = '#22c55e'; // success
    let iconClass = 'fa-solid fa-circle-check';
    let iconBg = 'rgba(34, 197, 94, 0.15)';

    if (type === 'info') {
        borderColor = '#3b82f6';
        iconClass = 'fa-solid fa-circle-info';
        iconBg = 'rgba(59, 130, 246, 0.15)';
    } else if (type === 'warning') {
        borderColor = '#f59e0b';
        iconClass = 'fa-solid fa-triangle-exclamation';
        iconBg = 'rgba(245, 158, 11, 0.15)';
    } else if (type === 'error') {
        borderColor = '#ef4444';
        iconClass = 'fa-solid fa-circle-xmark';
        iconBg = 'rgba(239, 68, 68, 0.15)';
    }

    toast.style.cssText = `
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px;
        background: rgba(15, 23, 42, 0.88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid ${borderColor};
        border-left: 5px solid ${borderColor};
        border-radius: 12px;
        box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.45);
        color: #f1f5f9;
        font-family: inherit;
        font-size: 0.88rem;
        animation: jcToastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(-15px);
    `;

    toast.innerHTML = `
        <div style="flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: ${iconBg}; display: flex; align-items: center; justify-content: center; color: ${borderColor}; font-size: 0.95rem;">
            <i class="${iconClass}"></i>
        </div>
        <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px;">
            <div style="font-weight: 700; color: #ffffff; font-size: 0.92rem; letter-spacing: -0.01em;">${escapeHtml(title)}</div>
            ${message ? `<div style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.35;">${escapeHtml(message)}</div>` : ''}
        </div>
        <button type="button" class="jc-toast-close" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 1rem; padding: 2px; transition: color 0.2s;" aria-label="Cerrar">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    // Animación inyectada si no existe
    if (!document.getElementById('jc-toast-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'jc-toast-styles';
        styleSheet.textContent = `
            @keyframes jcToastSlideIn {
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes jcToastFadeOut {
                to { opacity: 0; transform: translateY(-15px) scale(0.95); }
            }
            @media print {
                #jc-toast-container { display: none !important; }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.jc-toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    const timeoutId = setTimeout(() => {
        removeToast(toast);
    }, duration);

    function removeToast(el) {
        if (!el || el.dataset.removing === 'true') return;
        el.dataset.removing = 'true';
        clearTimeout(timeoutId);
        el.style.animation = 'jcToastFadeOut 0.3s ease forwards';
        setTimeout(() => {
            el.remove();
        }, 300);
    }
}

if (typeof window !== 'undefined') {
    window.showToast = showToast;
}

