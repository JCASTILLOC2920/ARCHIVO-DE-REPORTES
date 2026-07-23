import os
import subprocess

workspace_dir = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES"
node_path = r"C:\Users\DELL\AppData\Local\Programs\Python\Python313\Lib\site-packages\playwright\driver\node.exe"

editor_path = os.path.join(workspace_dir, "ui_report_editor.js")
with open(editor_path, "r", encoding="utf-8", errors="ignore") as f:
    editor_content = f.read()

# 1. Replace the image saving logic in saveReportEditorModal
old_save_images_target = """                // Save images safely
                const img01Cont = document.getElementById('re_img01PreviewContainer');
                const img01Prev = document.getElementById('re_img01Preview');
                if (img01Cont && img01Cont.style.display !== 'none' && img01Prev) {
                    patient.img01 = img01Prev.src;
                } else {
                    patient.img01 = "";
                }

                const img02Cont = document.getElementById('re_img02PreviewContainer');
                const img02Prev = document.getElementById('re_img02Preview');
                if (img02Cont && img02Cont.style.display !== 'none' && img02Prev) {
                    patient.img02 = img02Prev.src;
                } else {
                    patient.img02 = "";
                }"""

new_save_images_replacement = """                // Save images safely (with robust auto-crop / raw fallback if checkmark was not clicked)
                const img01Cont = document.getElementById('re_img01PreviewContainer');
                const img01Prev = document.getElementById('re_img01Preview');
                const img01Raw = document.getElementById('re_img01Raw');
                const img01Work = document.getElementById('re_img01Workspace');

                if (img01Cont && img01Cont.style.display !== 'none' && img01Prev && img01Prev.src) {
                    patient.img01 = img01Prev.src;
                } else if (img01Work && img01Work.style.display !== 'none' && cropper01) {
                    try {
                        const canvas = cropper01.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });
                        if (canvas) {
                            patient.img01 = canvas.toDataURL('image/jpeg', 0.65);
                        } else if (img01Raw && img01Raw.src) {
                            patient.img01 = img01Raw.src;
                        }
                    } catch (e) {
                        if (img01Raw && img01Raw.src) patient.img01 = img01Raw.src;
                    }
                } else if (img01Raw && img01Raw.src && img01Raw.src.startsWith('data:')) {
                    patient.img01 = img01Raw.src;
                } else {
                    patient.img01 = "";
                }

                const img02Cont = document.getElementById('re_img02PreviewContainer');
                const img02Prev = document.getElementById('re_img02Preview');
                const img02Raw = document.getElementById('re_img02Raw');
                const img02Work = document.getElementById('re_img02Workspace');

                if (img02Cont && img02Cont.style.display !== 'none' && img02Prev && img02Prev.src) {
                    patient.img02 = img02Prev.src;
                } else if (img02Work && img02Work.style.display !== 'none' && cropper02) {
                    try {
                        const canvas = cropper02.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });
                        if (canvas) {
                            patient.img02 = canvas.toDataURL('image/jpeg', 0.65);
                        } else if (img02Raw && img02Raw.src) {
                            patient.img02 = img02Raw.src;
                        }
                    } catch (e) {
                        if (img02Raw && img02Raw.src) patient.img02 = img02Raw.src;
                    }
                } else if (img02Raw && img02Raw.src && img02Raw.src.startsWith('data:')) {
                    patient.img02 = img02Raw.src;
                } else {
                    patient.img02 = "";
                }"""

# Clean windows carriage returns if any
editor_content_normalized = editor_content.replace('\r\n', '\n')
old_save_images_target_normalized = old_save_images_target.replace('\r\n', '\n')
new_save_images_replacement_normalized = new_save_images_replacement.replace('\r\n', '\n')

if old_save_images_target_normalized in editor_content_normalized:
    editor_content_normalized = editor_content_normalized.replace(old_save_images_target_normalized, new_save_images_replacement_normalized)
    print("SUCCESSFULLY REPLACED image saving logic in editor!")
else:
    print("Could not find exact old_save_images_target in editor!")

# 2. Replace the image retrieval logic in getTempPatientFromEditor
old_temp_images_target = """        const p1Box = document.getElementById('re_img01PreviewContainer');
        const p1Img = document.getElementById('re_img01Preview');
        if (p1Box && p1Box.style.display !== 'none' && p1Img) {
            img01 = p1Img.src || '';
        }

        const p2Box = document.getElementById('re_img02PreviewContainer');
        const p2Img = document.getElementById('re_img02Preview');
        if (p2Box && p2Box.style.display !== 'none' && p2Img) {
            img02 = p2Img.src || '';
        }"""

new_temp_images_replacement = """        const p1Box = document.getElementById('re_img01PreviewContainer');
        const p1Img = document.getElementById('re_img01Preview');
        const p1Raw = document.getElementById('re_img01Raw');
        const p1Work = document.getElementById('re_img01Workspace');

        if (p1Box && p1Box.style.display !== 'none' && p1Img && p1Img.src) {
            img01 = p1Img.src;
        } else if (p1Work && p1Work.style.display !== 'none' && cropper01) {
            try {
                const canvas = cropper01.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });
                img01 = canvas ? canvas.toDataURL('image/jpeg', 0.65) : (p1Raw ? p1Raw.src : '');
            } catch (e) {
                img01 = p1Raw ? p1Raw.src : '';
            }
        } else if (p1Raw && p1Raw.src && p1Raw.src.startsWith('data:')) {
            img01 = p1Raw.src;
        }

        const p2Box = document.getElementById('re_img02PreviewContainer');
        const p2Img = document.getElementById('re_img02Preview');
        const p2Raw = document.getElementById('re_img02Raw');
        const p2Work = document.getElementById('re_img02Workspace');

        if (p2Box && p2Box.style.display !== 'none' && p2Img && p2Img.src) {
            img02 = p2Img.src;
        } else if (p2Work && p2Work.style.display !== 'none' && cropper02) {
            try {
                const canvas = cropper02.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 });
                img02 = canvas ? canvas.toDataURL('image/jpeg', 0.65) : (p2Raw ? p2Raw.src : '');
            } catch (e) {
                img02 = p2Raw ? p2Raw.src : '';
            }
        } else if (p2Raw && p2Raw.src && p2Raw.src.startsWith('data:')) {
            img02 = p2Raw.src;
        }"""

old_temp_images_target_normalized = old_temp_images_target.replace('\r\n', '\n')
new_temp_images_replacement_normalized = new_temp_images_replacement.replace('\r\n', '\n')

if old_temp_images_target_normalized in editor_content_normalized:
    editor_content_normalized = editor_content_normalized.replace(old_temp_images_target_normalized, new_temp_images_replacement_normalized)
    print("SUCCESSFULLY REPLACED temp image retrieval in editor!")
else:
    print("Could not find exact old_temp_images_target in editor!")

with open(editor_path, "w", encoding="utf-8") as f:
    f.write(editor_content_normalized)

# Syntax Check
res = subprocess.run([node_path, "--check", editor_path], capture_output=True, text=True)
print("ui_report_editor.js syntax:", "OK" if res.returncode == 0 else "ERROR")
if res.returncode != 0:
    print(res.stderr)
