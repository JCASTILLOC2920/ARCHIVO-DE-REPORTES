const fs = require('fs');
let reportes = fs.readFileSync('reportes.js', 'utf8');

const getTempStr = `
    function getTempPatientFromEditor() {
        const selectedSexo = document.getElementById('re_sexo').value;
        const currentPatient = patientDatabase.find(x => x.codAtencion === editingCodAtencion);
        let img01 = '';
        let img02 = '';
        if (document.getElementById('re_img01PreviewContainer').style.display !== 'none') {
            img01 = document.getElementById('re_img01Preview').src;
        }
        if (document.getElementById('re_img02PreviewContainer').style.display !== 'none') {
            img02 = document.getElementById('re_img02Preview').src;
        }
        return {
            codAtencion: document.getElementById('re_codAtencion').value.trim(),
            dni: document.getElementById('re_dni').value,
            sexo: selectedSexo === 'MASCULINO' ? 'M' : (selectedSexo === 'FEMENINO' ? 'F' : 'O'),
            nombres: document.getElementById('re_nomPaciente').value,
            apellidos: document.getElementById('re_apePaciente').value,
            paciente: \`\${document.getElementById('re_apePaciente').value}, \${document.getElementById('re_nomPaciente').value}\`,
            edad: parseInt(document.getElementById('re_edad').value) || 0,
            telefono: document.getElementById('re_telefono').value,
            fContacto: document.getElementById('re_fContacto').value,
            telContacto: document.getElementById('re_telContacto').value,
            medSolicitante: document.getElementById('re_medSolicitante').value,
            motivoEstudio: document.getElementById('re_motivoEstudio').value,
            especimen: document.getElementById('re_motivoEstudio').value,
            doctor: document.getElementById('re_doctor').value,
            casetes: parseInt(document.getElementById('re_casetes').value) || 1,
            diagnostico: document.getElementById('re_diagnostico').value,
            catMacro: document.getElementById('re_catMacro').value,
            planMacro: document.getElementById('re_planMacro').value,
            macroDesc: document.getElementById('re_macroDesc').value,
            microDesc: document.getElementById('re_microDesc').value,
            fecRegistro: currentPatient ? currentPatient.fecRegistro : '',
            fecEntrega: currentPatient ? currentPatient.fecEntrega : '',
            img01: img01,
            img02: img02
        };
    }
`;

reportes = reportes.replace(
    /\/\/ Firma button[\s\S]*?reBtnFirma\.addEventListener\('click', \(\) => {[\s\S]*?showToast\(\"Insertando firma digital del patólogo en el reporte\.\.\.\", \"success\"\);[\s\S]*?}\);\s*}\s*\/\/ Vista Previa button[\s\S]*?reBtnPreview\.addEventListener\('click', \(\) => {[\s\S]*?localStorage\.setItem\('printPatientData', JSON\.stringify\(tempPatient\)\);\s*window\.open\('imprimir\.html\?autoDownload=true', '_blank', 'width=950,height=1000'\);\s*}\);\s*}/,
    getTempStr + `

    // Firma button
    const reBtnFirma = document.getElementById('re_btnFirma');
    if (reBtnFirma) {
        reBtnFirma.addEventListener('click', () => {
            const tempPatient = getTempPatientFromEditor();
            localStorage.setItem('printPatientData', JSON.stringify(tempPatient));
            window.open('imprimir.html?autoDownload=true', '_blank', 'width=950,height=1000');
        });
    }

    // Vista Previa button
    const reBtnPreview = document.getElementById('re_btnPreview');
    if (reBtnPreview) {
        reBtnPreview.addEventListener('click', () => {
            const tempPatient = getTempPatientFromEditor();
            localStorage.setItem('printPatientData', JSON.stringify(tempPatient));
            window.open('imprimir.html?autoDownload=false', '_blank', 'width=950,height=1000');
        });
    }
`
);

fs.writeFileSync('reportes.js', reportes);
