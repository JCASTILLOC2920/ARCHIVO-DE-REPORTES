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

// GARANTÍA DE RETROCOMPATIBILIDAD ABSOLUTA EN WINDOW
if (typeof window !== 'undefined') {
    window.cleanCodeFunc = cleanCodeFunc;
    window.formatDisplayDate = formatDisplayDate;
    window.correctPapanicolaouSpelling = correctPapanicolaouSpelling;
    window.cleanTextContentLocal = cleanTextContentLocal;
    window.formatDoctorName = formatDoctorName;
    window.toTitleCase = toTitleCase;
}
