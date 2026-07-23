path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\ui_report_editor.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# 1. Add cropper variables and reset function at top
top_target = "let editingCodAtencion = null;"
top_replacement = """let editingCodAtencion = null;
let cropper01 = null;
let cropper02 = null;

export function resetEditorCropperWorkspaces() {
    if (cropper01) {
        try { cropper01.destroy(); } catch (e) {}
        cropper01 = null;
    }
    if (cropper02) {
        try { cropper02.destroy(); } catch (e) {}
        cropper02 = null;
    }

    const ws01 = document.getElementById('re_img01Workspace');
    const act01 = document.getElementById('re_img01Actions');
    const raw01 = document.getElementById('re_img01Raw');
    const input01 = document.getElementById('re_img01Input');
    if (ws01) ws01.style.display = 'none';
    if (act01) act01.style.display = 'none';
    if (raw01) raw01.src = '';
    if (input01) input01.value = '';

    const ws02 = document.getElementById('re_img02Workspace');
    const act02 = document.getElementById('re_img02Actions');
    const raw02 = document.getElementById('re_img02Raw');
    const input02 = document.getElementById('re_img02Input');
    if (ws02) ws02.style.display = 'none';
    if (act02) act02.style.display = 'none';
    if (raw02) raw02.src = '';
    if (input02) input02.value = '';
}"""

content = content.replace(top_target, top_replacement, 1)

# 2. Call resetEditorCropperWorkspaces inside populateEditorModal
pop_target = "export function populateEditorModal(codAtencion) {\n    if (!codAtencion) return false;"
pop_replacement = """export function populateEditorModal(codAtencion) {
    resetEditorCropperWorkspaces();
    if (!codAtencion) return false;"""

content = content.replace(pop_target, pop_replacement, 1)

# 3. Update setupImage
setup_target = """    const setupImage = (id, src) => {
        const preview = document.getElementById(`re_${id}Preview`);
        const previewContainer = document.getElementById(`re_${id}PreviewContainer`);
        const uploadZone = document.getElementById(`re_${id}UploadZone`);
        if (src && preview && previewContainer) {
            preview.src = src;
            previewContainer.style.display = 'flex';
            if (uploadZone) uploadZone.style.display = 'none';
        } else if (preview && previewContainer) {
            preview.src = "";
            previewContainer.style.display = 'none';
            if (uploadZone) uploadZone.style.display = 'flex';
        }
    };"""

setup_replacement = """    const setupImage = (id, src) => {
        const preview = document.getElementById(`re_${id}Preview`);
        const previewContainer = document.getElementById(`re_${id}PreviewContainer`);
        const uploadZone = document.getElementById(`re_${id}UploadZone`);
        const rawImg = document.getElementById(`re_${id}Raw`);
        const workspace = document.getElementById(`re_${id}Workspace`);
        const actions = document.getElementById(`re_${id}Actions`);

        if (workspace) workspace.style.display = 'none';
        if (actions) actions.style.display = 'none';
        if (rawImg) rawImg.src = '';

        if (src && String(src).trim() !== '' && preview && previewContainer) {
            preview.src = src;
            previewContainer.style.display = 'flex';
            if (uploadZone) uploadZone.style.display = 'none';
        } else if (preview && previewContainer) {
            preview.src = "";
            previewContainer.style.display = 'none';
            if (uploadZone) uploadZone.style.display = 'flex';
        }
    };"""

content = content.replace(setup_target, setup_replacement, 1)

# 4. Remove inner declarations let cropper01 = null; and let cropper02 = null;
content = content.replace("let cropper01 = null;", "// cropper01 uses top-level", 1)
content = content.replace("let cropper02 = null;", "// cropper02 uses top-level", 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESSFULLY APPLIED CROPPER RESET FIX TO ui_report_editor.js!")
