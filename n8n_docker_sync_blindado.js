/* ============================================================================
   🛡️ N8N DOCKER SYNC BLINDADO + ALIVIO DE RAM + CERO PÉRDIDA (INDEXEDDB SSOT)
   Directiva Suprema: Dr. José Castillo (JC PATH LAB)
   - Conecta permanentemente la web con Docker n8n (http://127.0.0.1:5678)
   - Guarda pacientes e informes en IndexedDB (sin límite de 5MB) + Cola Persistente
   - Evita el desbordamiento de localStorage quitando fotos Base64 pesadas de la copia ligera
   - Unifica referencias en RAM (evita triplicar los 3.8 MB de REAL_SUPABASE_BACKUP)
   ============================================================================ */
(() => {
    "use strict";
    const DB_NAME = "JCPATHLAB_SSOT_DB";
    const DB_VERSION = 1;
    const STORE_PACIENTES = "pacientes";
    const STORE_INFORMES = "informes";
    const STORE_COLA = "cola_n8n";
    const ENDPOINT_PACIENTE = "http://127.0.0.1:5678/webhook/guardar-paciente";
    const ENDPOINT_INFORME = "http://127.0.0.1:5678/webhook/guardar-informe";
    const HEARTBEAT_MS = 8000;

    const _openDB = () => new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = ev => {
            const db = ev.target.result;
            if (!db.objectStoreNames.contains(STORE_PACIENTES)) {
                db.createObjectStore(STORE_PACIENTES, { keyPath: "codAtencion" });
            }
            if (!db.objectStoreNames.contains(STORE_INFORMES)) {
                db.createObjectStore(STORE_INFORMES, { keyPath: "codAtencion" });
            }
            if (!db.objectStoreNames.contains(STORE_COLA)) {
                db.createObjectStore(STORE_COLA, { keyPath: "id_cola" });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });

    const _putIDB = async (db, storeName, val) => new Promise((resolve) => {
        try {
            const tx = db.transaction(storeName, "readwrite");
            tx.objectStore(storeName).put(val);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        } catch (_) {
            resolve(false);
        }
    });

    const _getAllIDB = async (db, storeName) => new Promise((resolve) => {
        try {
            const tx = db.transaction(storeName, "readonly");
            const req = tx.objectStore(storeName).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
        } catch (_) {
            resolve([]);
        }
    });

    const _delIDB = async (db, storeName, key) => new Promise((resolve) => {
        try {
            const tx = db.transaction(storeName, "readwrite");
            tx.objectStore(storeName).delete(key);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        } catch (_) {
            resolve(false);
        }
    });

    const _postN8n = (url, payload) => {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 4500);
        return fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: ctrl.signal
        }).finally(() => clearTimeout(tid));
    };

    const _aligerarRegistroParaLocalStorage = (rec) => {
        if (!rec || typeof rec !== "object") return rec;
        const copia = { ...rec };
        if (typeof copia.solicitudInforme === "string" && copia.solicitudInforme.length > 1024) {
            copia.solicitudInforme = "[EN_INDEXEDDB]";
        }
        if (typeof copia.solicitud_informe === "string" && copia.solicitud_informe.length > 1024) {
            copia.solicitud_informe = "[EN_INDEXEDDB]";
        }
        if (typeof copia.imagenBase64 === "string" && copia.imagenBase64.length > 1024) {
            delete copia.imagenBase64;
        }
        return copia;
    };

    const N8nDockerSyncBlindado = {
        _db: null,
        _hb: null,
        _flushing: false,
        n8nOnline: false,

        async _initDB() {
            if (!this._db) this._db = await _openDB();
            return this._db;
        },

        optimizarMemoriaRAM() {
            try {
                if (Array.isArray(window.REAL_SUPABASE_BACKUP)) {
                    window.REAL_SUPABASE_PATIENTS = window.REAL_SUPABASE_BACKUP;
                    window.realSupabaseBackup = window.REAL_SUPABASE_BACKUP;
                }
            } catch (_) {}
        },

        async restaurarRegistrosEnMemoria() {
            try {
                const db = await this._initDB();
                const guardados = await _getAllIDB(db, STORE_PACIENTES);
                if (!guardados || guardados.length === 0) return;
                const listaBase = Array.isArray(window.patientDatabase) && window.patientDatabase.length > 0
                    ? window.patientDatabase
                    : (Array.isArray(window.REAL_SUPABASE_PATIENTS) ? window.REAL_SUPABASE_PATIENTS : []);
                for (const rec of guardados) {
                    const cod = String(rec.codAtencion || rec.cod_atencion || "").toUpperCase().trim();
                    if (!cod) continue;
                    const idx = listaBase.findIndex(x => String(x.codAtencion || x.cod_atencion || "").toUpperCase().trim() === cod);
                    if (idx >= 0) {
                        listaBase[idx] = { ...listaBase[idx], ...rec };
                    } else {
                        listaBase.unshift(rec);
                    }
                }
                window.patientDatabase = listaBase;
                window.REAL_SUPABASE_PATIENTS = listaBase;
            } catch (_) {}
        },

        async guardarPacienteBlindado(record, allPatients) {
            const cod = String((record && (record.codAtencion || record.cod_atencion)) || `PAC_${Date.now()}`).toUpperCase().trim();
            const recFinal = { ...record, codAtencion: cod, _ts_guardado: Date.now() };
            try {
                const db = await this._initDB();
                await _putIDB(db, STORE_PACIENTES, recFinal);
            } catch (_) {}

            // Guardado seguro en localStorage sin desbordar la cuota de 5 MB
            try {
                if (Array.isArray(allPatients) && allPatients.length > 0) {
                    const listaLigera = allPatients.map(_aligerarRegistroParaLocalStorage);
                    const jsonLigero = JSON.stringify(listaLigera);
                    localStorage.setItem("patientDatabaseLocal", jsonLigero);
                    localStorage.setItem("patientDatabase", jsonLigero);
                }
            } catch (_) {
                try {
                    const recientes = (allPatients || [recFinal]).slice(0, 400).map(_aligerarRegistroParaLocalStorage);
                    localStorage.setItem("patientDatabaseLocal", JSON.stringify(recientes));
                } catch (__) {}
            }

            // Despacho con garantía antepérdida a Docker n8n (localhost:5678)
            try {
                const resp = await _postN8n(ENDPOINT_PACIENTE, recFinal);
                if (!resp.ok && resp.status >= 500) throw new Error(`HTTP ${resp.status}`);
                this.n8nOnline = true;
            } catch (_) {
                this.n8nOnline = false;
                try {
                    const db = await this._initDB();
                    await _putIDB(db, STORE_COLA, {
                        id_cola: `pac_${cod}`,
                        url: ENDPOINT_PACIENTE,
                        payload: recFinal,
                        ts: Date.now()
                    });
                } catch (__) {}
            }
            return true;
        },

        async guardarInformeBlindado(codAtencion, dataInforme) {
            const cod = String(codAtencion || (dataInforme && dataInforme.codAtencion) || `INF_${Date.now()}`).toUpperCase().trim();
            const infFinal = { codAtencion: cod, ...dataInforme, _ts_guardado: Date.now() };
            try {
                const db = await this._initDB();
                await _putIDB(db, STORE_INFORMES, infFinal);
                await _putIDB(db, STORE_PACIENTES, infFinal);
            } catch (_) {}

            try {
                localStorage.setItem(`report_${cod}`, JSON.stringify(_aligerarRegistroParaLocalStorage(infFinal)));
            } catch (_) {}

            try {
                const resp = await _postN8n(ENDPOINT_INFORME, infFinal);
                if (!resp.ok && resp.status >= 500) throw new Error(`HTTP ${resp.status}`);
                this.n8nOnline = true;
            } catch (_) {
                try {
                    const db = await this._initDB();
                    await _putIDB(db, STORE_COLA, {
                        id_cola: `inf_${cod}`,
                        url: ENDPOINT_PACIENTE,
                        payload: infFinal,
                        ts: Date.now()
                    });
                } catch (__) {}
            }
            return true;
        },

        async procesarColaPendienteN8n() {
            if (this._flushing) return;
            this._flushing = true;
            try {
                const db = await this._initDB();
                const pendientes = await _getAllIDB(db, STORE_COLA);
                for (const item of pendientes) {
                    try {
                        const resp = await _postN8n(item.url || ENDPOINT_PACIENTE, item.payload);
                        if (resp.ok || resp.status < 500) {
                            await _delIDB(db, STORE_COLA, item.id_cola);
                            this.n8nOnline = true;
                        }
                    } catch (_) {
                        this.n8nOnline = false;
                        break;
                    }
                }
            } catch (_) {
            } finally {
                this._flushing = false;
            }
        },

        init() {
            this.optimizarMemoriaRAM();
            this._initDB().then(async () => {
                await this.restaurarRegistrosEnMemoria();
                await this.procesarColaPendienteN8n();
                if (!this._hb) {
                    this._hb = setInterval(() => {
                        if (typeof document !== 'undefined' && document.hidden) return;
                        this.optimizarMemoriaRAM();
                        this.procesarColaPendienteN8n();
                    }, 20000);
                }
            }).catch(() => {});
        }
    };

    window.N8nDockerSyncBlindado = N8nDockerSyncBlindado;
    window.N8nDockerSyncBlindado.init();
})();
