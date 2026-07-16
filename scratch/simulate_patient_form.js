// Custom DOM simulation sandbox for verifying script.js
const fs = require('fs');

console.log('[Simulation] Setting up lightweight DOM environment...');

// Mock local storage
const localStorageMock = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = String(value); },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; }
};

// Elements registry
const elements = {};

class MockElement {
    constructor(id, tagName = 'INPUT') {
        this.id = id;
        this.tagName = tagName;
        this.value = '';
        this.checked = false;
        this.listeners = {};
        this.innerText = '';
        this.style = {};
        this.parentElement = {
            id: id + '_parent',
            style: {}
        };
    }

    addEventListener(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    dispatchEvent(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    focus() {
        // console.log(`[DOM] Element ${this.id} focused.`);
    }

    appendChild(child) {}

    reset() {
        this.value = '';
        this.checked = false;
    }
}

// Global DOM Mocks
global.window = {
    location: {
        pathname: '/ARCHIVO-DE-REPORTES/reportes.html'
    },
    patientDatabase: [],
    datosMigrados: [],
    supabase: null
};
global.localStorage = localStorageMock;
global.setTimeout = (cb, ms) => cb(); // Execute immediately in simulation
global.fetch = (url) => {
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
            { "doctor": "DRA. MERCEDES PAUCAR TICSE" }
        ])
    });
};

const eventListeners = {};
global.document = {
    addEventListener(event, callback) {
        if (!eventListeners[event]) eventListeners[event] = [];
        eventListeners[event].push(callback);
    },
    getElementById(id) {
        if (!elements[id]) {
            elements[id] = new MockElement(id);
        }
        return elements[id];
    },
    createElement(tagName) {
        return {
            className: '',
            style: { animation: '' },
            innerHTML: '',
            remove() {}
        };
    },
    appendChild(el) {},
    querySelectorAll(selector) {
        return [];
    }
};

// Mock showToast
global.showToast = (msg, type) => {
    console.log(`[Toast ${type.toUpperCase()}] ${msg}`);
};

console.log('[Simulation] Loading script.js...');
const scriptCode = fs.readFileSync('script.js', 'utf8');

// Evaluate script.js in the global scope
eval(scriptCode);

// Trigger DOMContentLoaded
console.log('[Simulation] Dispatching DOMContentLoaded event...');
if (eventListeners['DOMContentLoaded']) {
    eventListeners['DOMContentLoaded'].forEach(cb => cb());
}

// SIMULATION CASE 1: Form Elements mapping prioritizes m_ prefixes in reportes.html
console.log('\n--- Simulation 1: Selecting elements on reportes.html ---');
const tipoServicio = document.getElementById('m_tipoServicio');
const codAtencion = document.getElementById('m_codAtencion');
const editCodAtencion = document.getElementById('codAtencion'); // Report editor field / standard field

console.log('Value of m_codAtencion before selection change:', codAtencion.value);

// Change service type to 'EXAMEN DE MUESTRA POR HE'
console.log('Changing service type to: EXAMEN DE MUESTRA POR HE');
tipoServicio.value = 'EXAMEN DE MUESTRA POR HE';
tipoServicio.dispatchEvent('change');

console.log('Value of m_codAtencion after change (expected 26Q-):', codAtencion.value);
console.log('Value of filter codAtencion after change (expected empty):', editCodAtencion.value);

// SIMULATION CASE 2: Input custom code and submit form without duplicates alert
console.log('\n--- Simulation 2: Input custom code (26O-214) and submit form ---');
codAtencion.value = '26O-214'; // User typed 26O-214
document.getElementById('m_nombres').value = 'ELIZABETH TEST';
document.getElementById('m_apellidos').value = 'HUMAREDA TEST';

const form = document.getElementById('patientForm');

let alertTriggered = false;
global.alert = (msg) => {
    alertTriggered = true;
    console.error('[ALERT TRIGGERED]', msg);
};

console.log('Submitting patientForm...');
form.dispatchEvent('submit', { preventDefault() {} });

if (alertTriggered) {
    console.error('\n[SIMULATION FAILED] Alert was triggered! The form did not save correctly.');
    process.exit(1);
} else {
    console.log('\n[SIMULATION SUCCESS] Form submitted successfully! No duplicate alerts were triggered.');
}
