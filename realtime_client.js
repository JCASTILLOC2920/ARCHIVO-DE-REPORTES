/**
 * realtime_client.js - Módulo de Cliente en Tiempo Real (Grupo 3)
 * Conecta las Clínicas y Secretarias al daemon de sincronización en puerto 8085
 * mediante Server-Sent Events (SSE) y Polling Inteligente con fallback HTTP.
 */

(function() {
    window.RealtimeClient = {
        init: function(onRefreshCallback) {
            console.log("[Realtime Client] Inicializando circuito de recepción en tiempo real para clínicas...");
            
            // 1. Intentar conectar mediante Server-Sent Events (SSE)
            this.connectSSE(onRefreshCallback);

            // 2. Configurar Polling Inteligente de respaldo (cada 5 segundos) con detección de cambios por timestamp
            setInterval(() => {
                this.checkStatus(onRefreshCallback);
            }, 5000);
        },

        connectSSE: function(callback) {
            try {
                const sseUrl = "http://localhost:8085/api/events";
                const evtSource = new EventSource(sseUrl);

                evtSource.onmessage = function(event) {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.action === "refresh_reports") {
                            console.log("[Realtime SSE] Evento recibido: Actualizando expedientes en tiempo real (<1s).");
                            if (typeof callback === 'function') {
                                callback();
                            }
                        }
                    } catch (e) {
                        console.error("[Realtime SSE] Error parseando evento:", e);
                    }
                };

                evtSource.onerror = function(err) {
                    // Si SSE falla, el polling inteligente o reconexión automática actúa
                    evtSource.close();
                    setTimeout(() => {
                        window.RealtimeClient.connectSSE(callback);
                    }, 10000);
                };
            } catch (e) {
                console.warn("[Realtime SSE] No disponible, operando con Polling Inteligente HTTP.", e);
            }
        },

        checkStatus: function(callback) {
            fetch("http://localhost:8085/api/status", { cache: "no-store" })
                .then(res => res.json())
                .then(data => {
                    // Opcional: verificar si el timestamp cambió
                    if (data && data.timestamp) {
                        if (window._lastServerTimestamp && data.timestamp > window._lastServerTimestamp) {
                            console.log("[Realtime Polling] Cambio detectado en servidor. Refrescando interfaz...");
                            window._lastServerTimestamp = data.timestamp;
                            if (typeof callback === 'function') {
                                callback();
                            }
                        } else if (!window._lastServerTimestamp) {
                            window._lastServerTimestamp = data.timestamp;
                        }
                    }
                })
                .catch(() => {
                    // Servidor local inactivo o modo offline
                });
        },

        notifyDoctorSave: function(patientsData, successCallback) {
            fetch("http://localhost:8085/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patientsData)
            })
            .then(res => res.json())
            .then(res => {
                console.log("[Realtime Client] Sincronización instantánea enviada al daemon:", res);
                if (typeof successCallback === 'function') successCallback(res);
            })
            .catch(err => {
                console.warn("[Realtime Client] Sincronización local en modo offline completada.", err);
                if (typeof successCallback === 'function') successCallback({ status: "offline" });
            });
        }
    };
})();
