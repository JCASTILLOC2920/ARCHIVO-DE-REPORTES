path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

target = """            const imgContainer = document.getElementById('imagesContainer');
            if (imgContainer && (patient.img01 || patient.img02)) {
                imgContainer.style.display = 'flex';
                if (patient.img01) {
                    const img = document.createElement('img');
                    img.src = patient.img01;
                    img.className = 'report-img';
                    imgContainer.appendChild(img);
                }
                if (patient.img02) {
                    const img = document.createElement('img');
                    img.src = patient.img02;
                    img.className = 'report-img';
                    imgContainer.appendChild(img);
                }
            }"""

replacement = """            const imgContainer = document.getElementById('imagesContainer');
            if (imgContainer) {
                imgContainer.innerHTML = '';
                if ((patient.img01 && String(patient.img01).trim() !== '') || (patient.img02 && String(patient.img02).trim() !== '')) {
                    imgContainer.style.display = 'flex';
                    if (patient.img01 && String(patient.img01).trim() !== '') {
                        const img = document.createElement('img');
                        img.src = patient.img01;
                        img.className = 'report-img';
                        imgContainer.appendChild(img);
                    }
                    if (patient.img02 && String(patient.img02).trim() !== '') {
                        const img = document.createElement('img');
                        img.src = patient.img02;
                        img.className = 'report-img';
                        imgContainer.appendChild(img);
                    }
                } else {
                    imgContainer.style.display = 'none';
                }
            }"""

if target in content:
    new_content = content.replace(target, replacement, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("SUCCESSFULLY UPDATED imprimir.html!")
else:
    print("TARGET NOT FOUND IN imprimir.html!")
