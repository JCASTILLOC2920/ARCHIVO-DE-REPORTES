/**
 * Caja Negra Temporal (Time-Machine Client Module)
 * Permite listar historiales de pacientes y viajar en el tiempo para restaurar o visualizar estados previos.
 */

window.CajaNegraTemporal = {
    async tomarSnapshot(pacienteId, datosPaciente) {
        try {
            console.log(`[CajaNegra] Tomando snapshot automático para paciente ${pacienteId}...`);
            // Guardar en localStorage como almacenamiento cliente robusto y exportable
            const key = `caja_negra_${pacienteId}`;
            let historial = JSON.parse(localStorage.getItem(key) || '[]');
            
            const ahora = new Date();
            const timestampStr = ahora.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-') + `_${ahora.getMilliseconds()}`;
            
            const snapshot = {
                timestamp: ahora.toISOString(),
                epoch: ahora.getTime(),
                id_snapshot: timestampStr,
                datos: JSON.parse(JSON.stringify(datosPaciente))
            };
            
            historial.push(snapshot);
            // Mantener últimos 50 snapshots por paciente
            if (historial.length > 50) {
                historial.shift();
            }
            
            localStorage.setItem(key, JSON.stringify(historial));
            console.log(`[CajaNegra] Snapshot guardado con éxito: ${timestampStr}`);
            return true;
        } catch (e) {
            console.error('[CajaNegra] Error tomando snapshot:', e);
            return false;
        }
    },

    obtenerHistorial(pacienteId) {
        try {
            const key = `caja_negra_${pacienteId}`;
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            console.error('[CajaNegra] Error obteniendo historial:', e);
            return [];
        }
    },

    viajarEnElTiempo(pacienteId, epochTimestamp) {
        const historial = this.obtenerHistorial(pacienteId);
        if (historial.length === 0) return null;

        if (!epochTimestamp) {
            // Retorna el último
            return historial[historial.length - 1].datos;
        }

        // Buscar el snapshot más cercano que no supere el timestamp objetivo
        let mejor = historial[0];
        for (let snap of historial) {
            if (snap.epoch <= epochTimestamp) {
                mejor = snap;
            }
        }
        return mejor.datos;
    },

    renderizarModalViajeEnElTiempo(pacienteId, pacienteNombre) {
        const historial = this.obtenerHistorial(pacienteId);
        
        // Crear modal interactivo
        let modal = document.getElementById('cajaNegraModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'cajaNegraModal';
            modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;';
            document.body.appendChild(modal);
        }

        let listaHtml = historial.length === 0 ? '<p style="color:#666;">No hay snapshots históricos registrados todavía para este paciente. Se registrará uno cada vez que guardes.</p>' :
            historial.map((s, idx) => `
                <div style="background:#f8f9fa;border:1px solid #ddd;padding:10px;margin-bottom:8px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>#${idx + 1} - ${new Date(s.epoch).toLocaleString()}</strong>
                        <div style="font-size:12px;color:#555;">ID: ${s.id_snapshot} | Diagnóstico: ${(s.datos.diagnostico || s.datos.re_diagnostico || 'Sin diagnóstico').substring(0, 40)}...</div>
                    </div>
                    <div>
                        <button onclick="window.CajaNegraTemporal.restaurarSnapshot('${pacienteId}', ${s.epoch})" style="background:#2b6cb0;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-weight:600;">Viajar a este estado</button>
                    </div>
                </div>
            `).reverse().join('');

        modal.innerHTML = `
            <div style="background:white;width:650px;max-height:85vh;border-radius:10px;padding:25px;box-shadow:0 10px 25px rgba(0,0,0,0.3);display:flex;flex-direction:column;">
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding-bottom:12px;margin-bottom:15px;">
                    <h2 style="margin:0;color:#2c3e50;font-size:20px;">🕰️ Caja Negra Temporal - Historial de Paciente</h2>
                    <button onclick="document.getElementById('cajaNegraModal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#888;">&times;</button>
                </div>
                <p style="margin-top:0;color:#555;font-size:14px;">Paciente: <strong>${pacienteNombre || pacienteId}</strong></p>
                <div style="overflow-y:auto;flex-grow:1;max-height:50vh;padding-right:5px;">
                    ${listaHtml}
                </div>
                <div style="border-top:1px solid #eee;padding-top:12px;margin-top:15px;text-align:right;">
                    <button onclick="document.getElementById('cajaNegraModal').remove()" style="background:#e2e8f0;color:#333;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600;">Cerrar</button>
                </div>
            </div>
        `;
    },

    restaurarSnapshot(pacienteId, epoch) {
        const datos = this.viajarEnElTiempo(pacienteId, epoch);
        if (datos) {
            if (typeof window.cargarDatosEnEditor === 'function') {
                window.cargarDatosEnEditor(datos);
                alert(`🚀 Viaje en el tiempo exitoso al estado del ${new Date(epoch).toLocaleString()}. Formulario restaurado.`);
                document.getElementById('cajaNegraModal').remove();
            } else {
                alert('Estado recuperado en consola. Revisa los datos.');
                console.log('Datos restaurados:', datos);
            }
        }
    }
};

console.log('[CajaNegra] Módulo cliente cargado correctamente.');
