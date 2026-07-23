import os
import subprocess

workspace_dir = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES"
node_path = r"C:\Users\DELL\AppData\Local\Programs\Python\Python313\Lib\site-packages\playwright\driver\node.exe"

# 1. Update db_service.js
db_path = os.path.join(workspace_dir, "db_service.js")
with open(db_path, "r", encoding="utf-8", errors="ignore") as f:
    db_content = f.read()

# Replace local usingSupabase declarations
db_content = db_content.replace(
    "const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined');",
    "const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');"
)

# Wrap subscribePatientsRealtime in a try-catch block
sub_target = """export function subscribePatientsRealtime() {
    const supabase = window.supabase;
    const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
    if (!usingSupabase) return;

    console.log("[Supabase] Suscribindose a cambios en tiempo real...");
    supabase
        .channel('schema-db-changes')"""

sub_replacement = """export function subscribePatientsRealtime() {
    try {
        const supabase = window.supabase;
        const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');
        if (!usingSupabase) return;

        console.log("[Supabase] Suscribiéndose a cambios en tiempo real...");
        if (typeof supabase.channel !== 'function') {
            console.warn("[Supabase Realtime] supabase.channel no es una función. Desactivando tiempo real.");
            return;
        }
        supabase
            .channel('schema-db-changes')"""

# We should also wrap the end of subscribePatientsRealtime.
# Let's find where subscribePatientsRealtime ends.
# It ends right before another function or export.
# Let's see: it ends with:
#     .subscribe();
# }
end_target = """.subscribe();
}"""

end_replacement = """.subscribe();
    } catch (e) {
        console.error("[Supabase Realtime] Error en tiempo real:", e);
    }
}"""

if sub_target in db_content:
    db_content = db_content.replace(sub_target, sub_replacement)
    print("Wrapped subscribePatientsRealtime starts!")
else:
    # If the target matches slightly differently due to characters
    db_content = db_content.replace(
        "export function subscribePatientsRealtime() {",
        "export function subscribePatientsRealtime() {\n    try {"
    )
    # And we'll just add the matching try/catch at the end manually or via replace
    print("Applied fallback try wrapper to start of subscribePatientsRealtime")

# Let's find where subscribePatientsRealtime function ends in db_service.js to insert the closing catch block
lines = db_content.splitlines()
inside = False
braces = 0
for idx, line in enumerate(lines):
    if "export function subscribePatientsRealtime()" in line:
        inside = True
        braces = 0
    if inside:
        clean = line.split("//")[0]
        braces += clean.count('{') - clean.count('}')
        if braces == 0:
            lines[idx] = """    } catch (e) {
        console.error("[Supabase Realtime] Error en tiempo real:", e);
    }
}"""
            print(f"Inserted catch block at line {idx+1}")
            break

db_content = "\n".join(lines)

with open(db_path, "w", encoding="utf-8") as f:
    f.write(db_content)

# 2. Update ui_report_editor.js usingSupabase check
editor_path = os.path.join(workspace_dir, "ui_report_editor.js")
with open(editor_path, "r", encoding="utf-8", errors="ignore") as f:
    editor_content = f.read()

editor_content = editor_content.replace(
    "const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined');",
    "const usingSupabase = !!(supabase && typeof window.SUPABASE_CONFIG !== 'undefined' && typeof supabase.from === 'function');"
)
with open(editor_path, "w", encoding="utf-8") as f:
    f.write(editor_content)

# 3. Update pdf_engine.js imports
pdf_path = os.path.join(workspace_dir, "pdf_engine.js")
with open(pdf_path, "r", encoding="utf-8", errors="ignore") as f:
    pdf_content = f.read()

pdf_content = pdf_content.replace("db_service.js?v=3.7", "db_service.js?v=3.8")
with open(pdf_path, "w", encoding="utf-8") as f:
    f.write(pdf_content)

# 4. Bind defaultTemplates to window in plantillas_data.js
plantillas_path = os.path.join(workspace_dir, "plantillas_data.js")
with open(plantillas_path, "r", encoding="utf-8", errors="ignore") as f:
    plantillas_content = f.read()

if "window.defaultTemplates =" not in plantillas_content:
    plantillas_content += "\nwindow.defaultTemplates = defaultTemplates;\n"
    with open(plantillas_path, "w", encoding="utf-8") as f:
        f.write(plantillas_content)
    print("Bound defaultTemplates to window!")

# 5. Check syntax using playwright node.exe
res = subprocess.run([node_path, "--check", db_path], capture_output=True, text=True)
if res.returncode == 0:
    print("db_service.js SYNTAX OK")
else:
    print("db_service.js SYNTAX ERROR:")
    print(res.stderr)
