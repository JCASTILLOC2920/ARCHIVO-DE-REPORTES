path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

start_sig = "export function subscribePatientsRealtime()"
start_idx = content.find(start_sig)

end_sig = "let isSyncing = false;"
end_idx = content.find(end_sig)

if start_idx != -1 and end_idx != -1:
    replacement = """export function subscribePatientsRealtime() {
    try {
        const supabase = window.supabase;
        const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
        if (!usingSupabase) return;

        console.log("[Supabase] Suscribiéndose a cambios en tiempo real...");
        supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'pacientes'
                },
                (payload) => {
                    console.log("[Supabase] Cambio en base de datos recibido:", payload);
                    const eventType = payload.eventType;
                    const newRecord = payload.new;
                    const oldRecord = payload.old;

                    // Evitar doble re-renderizado por eco de cambios locales propios
                    const targetCode = (newRecord && newRecord.cod_atencion) || (oldRecord && oldRecord.cod_atencion);
                    if (targetCode) {
                        const lastSaved = recentlySavedLocalCodes.get(targetCode);
                        if (lastSaved && (Date.now() - lastSaved < 5000)) {
                            console.log(`[Supabase Realtime] Eco local omitido para ${targetCode}`);
                            return;
                        }
                    }

                    if (eventType === 'INSERT') {
                        const patient = mapDbToPatient(newRecord);
                        const idx = patientDatabase.findIndex(p => p.id === patient.id || p.codAtencion === patient.codAtencion);
                        if (idx !== -1) {
                            const local = patientDatabase[idx];
                            patient.macroDesc = patient.macroDesc || local.macroDesc || "";
                            patient.microDesc = patient.microDesc || local.microDesc || "";
                            patient.diagnostico = patient.diagnostico || local.diagnostico || "";
                            patient.img01 = patient.img01 || local.img01 || null;
                            patient.img02 = patient.img02 || local.img02 || null;
                            patient.solicitudInforme = local.solicitudInforme || null;
                            patientDatabase[idx] = patient;
                        } else {
                            patientDatabase.unshift(patient);
                        }
                        savePatientToIndexedDB(patientDatabase[idx] || patient);
                    } else if (eventType === 'UPDATE') {
                        const patient = mapDbToPatient(newRecord);
                        const idx = patientDatabase.findIndex(p => p.id === patient.id || p.codAtencion === patient.codAtencion);
                        if (idx !== -1) {
                            const local = patientDatabase[idx];
                            patient.macroDesc = patient.macroDesc || local.macroDesc || "";
                            patient.microDesc = patient.microDesc || local.microDesc || "";
                            patient.diagnostico = patient.diagnostico || local.diagnostico || "";
                            patient.img01 = patient.img01 || local.img01 || null;
                            patient.img02 = patient.img02 || local.img02 || null;
                            patient.solicitudInforme = local.solicitudInforme || null;
                            patientDatabase[idx] = patient;
                        } else {
                            patientDatabase.unshift(patient);
                        }
                        savePatientToIndexedDB(patientDatabase[idx] || patient);
                    } else if (eventType === 'DELETE') {
                        const idToDelete = oldRecord.id || (newRecord && newRecord.id);
                        if (idToDelete) {
                            const idx = patientDatabase.findIndex(p => p.id === idToDelete);
                            if (idx !== -1) {
                                const cod = patientDatabase[idx].codAtencion;
                                patientDatabase.splice(idx, 1);
                                if (cod) deletePatientFromIndexedDB(cod);
                            }
                        }
                    }

                    // Guardar localmente
                    triggerAutomaticBackup();

                    // Refrescar tabla si está en pantalla
                    if (typeof window.refreshPatientTable === 'function') {
                        window.refreshPatientTable();
                    }
                }
            )
            .subscribe();
    } catch (e) {
        console.error("[Supabase Realtime] Error en tiempo real:", e);
    }
}

"""
    new_content = content[:start_idx] + replacement + content[end_idx:]
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("SUCCESSFULLY REPLACED subscribePatientsRealtime using clean start/end offsets!")
else:
    print("Could not find start or end sig!")
