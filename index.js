// schemas/index.js
// Exportador unificado de los esquemas CAP – mantiene intactos los módulos origen
// y garantiza búsquedas O(1) con validación estricta en tiempo de carga.

import * as digestivo from './cap_digestivo.js';
import * as gyn from './cap_gyn_endocrine.js';
import * as liver from './cap_liver.js';
import * as urology from './cap_urology.js';

/**
 * Congela recursivamente un objeto y todos sus descendientes.
 * @param {object} obj
 * @returns {object}
 */
function deepFreeze(obj) {
  const props = Object.getOwnPropertyNames(obj);
  for (const p of props) {
    const v = obj[p];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) {
      deepFreeze(v);
    }
  }
  return Object.freeze(obj);
}

/**
 * Verifica que el valor sea un objeto plano (no clase, no array).
 * @param {*} o
 * @returns {boolean}
 */
function isPlainObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

/* ------------------------------------------------------------------ */
/* Construcción del registro central (Map) con validación determinista */
/* ------------------------------------------------------------------ */

const schemasMap = new Map();          // clave → esquema (O(1) get)
const globalKeys = new Set();          // para detectar colisiones entre esquemas

/**
 * Registra un esquema en el mapa global después de validar su forma
 * y asegurar que sus claves no colisionen con otras.
 * @param {string} name  Identificador interno del esquema
 * @param {object} schema Objeto exportado por el módulo de esquema
 */
function register(name, schema) {
  if (!isPlainObject(schema)) {
    throw new Error(`El esquema "${name}" debe exportar un objeto plano`);
  }

  for (const key of Object.keys(schema)) {
    if (globalKeys.has(key)) {
      throw new Error(`Clave duplicada "${key}" encontrada en el esquema "${name}"`);
    }
    globalKeys.add(key);
  }

  schemasMap.set(name, deepFreeze(schema));
}

/* Registro de los cuatro esquemas obligatorios */
register('digestivo', digestivo);
register('gyn', gyn);
register('liver', liver);
register('urology', urology);

/* ------------------------------------------------------------------ */
/* Exportador inmutable – API pública del módulo                        */
/* ------------------------------------------------------------------ */

const Exporter = {
  /**
   * Obtiene el esquema solicitado por nombre.
   * @param {string} name
   * @returns {object|null}
   */
  getSchema(name) {
    return schemasMap.get(name) || null;
  },

  /**
   * Lista los nombres de todos los esquemas disponibles.
   * @returns {string[]}
   */
  listSchemas() {
    return Array.from(schemasMap.keys());
  },

  // Acceso directo (también O(1) gracias al Map interno)
  digestivo: schemasMap.get('digestivo'),
  gyn: schemasMap.get('gyn'),
  liver: schemasMap.get('liver'),
  urology: schemasMap.get('urology')
};

export default Object.freeze(Exporter);
