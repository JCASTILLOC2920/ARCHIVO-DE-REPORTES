path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\main.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

target = """    syncPatientsFromSupabase();
    subscribePatientsRealtime();
    updateSyncStatusUI();"""

replacement = """    syncPatientsFromSupabase();
    subscribePatientsRealtime();
    updateSyncStatusUI();

    // Auto-refresco multi-dispositivo para clínicas en tiempo real (al volver a la pestaña o cada 20s)
    window.addEventListener('focus', () => {
        syncPatientsFromSupabase();
    });
    setInterval(() => {
        syncPatientsFromSupabase();
    }, 20000);"""

if target in content:
    new_content = content.replace(target, replacement, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("SUCCESSFULLY UPDATED main.js!")
else:
    print("TARGET NOT FOUND IN main.js!")
