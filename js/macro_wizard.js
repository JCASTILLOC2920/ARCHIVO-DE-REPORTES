/**
 * Motor de Asistente de Macroscopía Guiada ("Tipo Soldado") - Ginecología Lester (Quistes de Anexo)
 * La Colmena - Arquitectura de Plantillas Clínicas
 */

export const gynMacroWizardConfig = {
    "QUISTE DE OVARIO: CISTOADENOMA SEROSO (MACROSCOPÍA LESTER)": {
        chips: {
            lateralidad: ["Izquierdo", "Derecho", "Bilateral"],
            capsula: ["Íntegra", "Lisa y brillante", "Con áreas fibrinosas", "Rupta"],
            pared: ["Fina y translúcida", "Levemente engrosada", "Firme"],
            liquido: ["Claro y acuoso", "Amarillento / Citrino", "Seroso translúcido"],
            revestimiento: ["Liso y brillante", "Con finas trabéculas", "Aplanado"],
            trompa: ["Sin alteraciones", "Ingurgitada", "Adherida a la lesión"]
        },
        defaultValues: {
            lateralidad: "Izquierdo",
            peso: "45.5",
            largo: "8.5",
            ancho: "6.0",
            espesor: "4.2",
            pared: "fina y translúcida (2-3 mm de grosor)",
            liquido: "claro y acuoso (citrino)",
            revestimiento: "liso, brillante y sin formaciones papilares visibles",
            trompa_dim: "5.0 x 0.8 x 0.6",
            trompa_estado: "sin alteraciones macroscópicas aparentes",
            n: "3",
            casetes: "1A y 1B: pared quística representativa; 1C: trompa de Falopio"
        },
        template: "Se recibe espécimen correspondiente a anexo ovárico [lateralidad], que pesa [peso] g y mide [dimensiones] cm (volumen calculado: [volumen] cm³). La superficie externa se encuentra [capsula]. Al corte, presenta estructura unilocular que contiene líquido [liquido]. La pared quística es [pared]. El revestimiento interno es [revestimiento]. Se acompaña de trompa de Falopio que mide [trompa_dim] cm y se encuentra [trompa_estado]. Se remiten [n] casetes ([casetes]). <small>Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.) / WHO Classification of Tumours</small>"
    },
    "QUISTE DE OVARIO: CISTOADENOMA MUCINOSO (MACROSCOPÍA LESTER)": {
        chips: {
            lateralidad: ["Izquierdo", "Derecho", "Bilateral"],
            capsula: ["Íntegra", "Lisa", "Firme con áreas multinodulares"],
            pared: ["Multilocular con tabiques finos", "Engrosada con múltiples lóculos", "Fibrosa"],
            liquido: ["Mucinoso espeso y tenaz", "Gelatinoso claro", "Mucoid-hemorrágico"],
            revestimiento: ["Liso", "Mucinoso lustroso", "Con focos de engrosamiento focal"],
            trompa: ["Normal", "Congestiva", "Adherida"]
        },
        defaultValues: {
            lateralidad: "Derecho",
            peso: "120.0",
            largo: "12.0",
            ancho: "10.0",
            espesor: "8.0",
            pared: "multilocular con múltiples lóculos de diverso tamaño y tabiques de 3-4 mm",
            liquido: "mucinoso, espeso y tenaz de coloración ámbar claro",
            revestimiento: "liso y lustroso con áreas de secreción mucoide",
            trompa_dim: "6.0 x 1.0 x 0.8",
            trompa_estado: "congestiva y libre de adherencias tumorales",
            n: "5",
            casetes: "2A a 2D: muestreo representativo de múltiples lóculos, áreas sólidas y tabiques; 2E: trompa de Falopio"
        },
        template: "Se recibe espécimen correspondiente a anexo ovárico [lateralidad], con un peso de [peso] g y dimensiones de [dimensiones] cm (volumen estimado: [volumen] cm³). Superficie externa [capsula]. Al corte, la lesión es [pared], conteniendo líquido [liquido]. El revestimiento interno es [revestimiento]. Se observa trompa de Falopio ipsilateral que mide [trompa_dim] cm y se encuentra [trompa_estado]. Se procesan [n] casetes ([casetes]). <small>Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.) / WHO Classification of Tumours</small>"
    },
    "QUISTE DE OVARIO: TERATOMA QUÍSTICO MADURO / DERMOIDE (MACROSCOPÍA LESTER)": {
        chips: {
            lateralidad: ["Izquierdo", "Derecho", "Bilateral"],
            capsula: ["Íntegra, lisa y nacarada", "Firme", "Con adherencias laxas"],
            pared: ["Fibrosa engrosada", "Con tubérculo de Rokitansky prominente"],
            contenido: ["Secreción sebácea densa con abundante cabello", "Material adiposo y restos pilosos"],
            rokitansky: ["Presente (prominente con estructuras dentarias/cartílago)", "Sólido bien delimitado"],
            trompa: ["Sin alteraciones", "Ligeramente elongada"]
        },
        defaultValues: {
            lateralidad: "Izquierdo",
            peso: "85.0",
            largo: "7.5",
            ancho: "6.5",
            espesor: "5.0",
            pared: "fibrosa de 4-6 mm de grosor con protuberancia focal (tubérculo de Rokitansky) que mide 2.5 x 2.0 cm",
            cabello_long: "12",
            rokitansky: "tubérculo de Rokitansky firme, blanquecino con inclusión de formaciones dentarias y tejido cartilaginoso",
            contenido: "abundante material sebáceo amarillo y mechones de cabello de hasta 12 cm de longitud",
            trompa_dim: "5.5 x 0.9 x 0.7",
            trompa_estado: "sin alteraciones macroscópicas",
            n: "4",
            casetes: "3A y 3B: tubérculo de Rokitansky y estructuras anexas (piel, faneras, cartílago, dientes); 3C: pared quística representativa; 3D: trompa de Falopio"
        },
        template: "Se recibe espécimen de anexo ovárico [lateralidad], que pesa [peso] g y mide [dimensiones] cm (volumen calculado: [volumen] cm³). La superficie externa es [capsula]. Al corte, cavidad única que contiene [contenido]. La pared es [pared], destacando la presencia de [rokitansky]. Se acompaña de trompa de Falopio que mide [trompa_dim] cm y se encuentra [trompa_estado]. Se procesan [n] casetes ([casetes]). <small>Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.) / WHO Classification of Tumours</small>"
    },
    "QUISTE DE OVARIO: ENDOMETRIOMA / QUISTE DE CHOCOLATE (MACROSCOPÍA LESTER)": {
        chips: {
            lateralidad: ["Izquierdo", "Derecho", "Bilateral"],
            capsula: ["Adherente con fibrosis superficial", "Firme y pigmentada"],
            pared: ["Fibrosa gruesa, rugosa", "Con tinción parduzca de hemosiderina"],
            liquido: ["Líquido espeso pardo oscuro ('chocolate')", "Sanguinolento coagulado"],
            revestimiento: ["Rugoso, pardo-rojizo", "Friable con pigmento melánico/hemosiderínico"],
            trompa: ["Adherida al quiste", "Con fimbrias engrosadas"]
        },
        defaultValues: {
            lateralidad: "Derecho",
            peso: "55.0",
            largo: "6.0",
            ancho: "5.0",
            espesor: "4.0",
            pared: "fibrosa, engrosada (4-5 mm), con superficie interna de aspecto aterciopelado y coloración pardo oscura",
            liquido: "líquido viscoso de color pardo oscuro ('chocolate')",
            revestimiento: "rugoso, friable, impregnado de pigmento pardo",
            trompa_dim: "5.0 x 0.8 x 0.6",
            trompa_estado: "con adherencias laxas peritubáricas",
            n: "3",
            casetes: "4A y 4B: pared quística representativa con focos pardo-rojizos; 4C: parénquima ovárico adyacente y trompa de Falopio"
        },
        template: "Se recibe espécimen de anexo ovárico [lateralidad], que pesa [peso] g y mide [dimensiones] cm (volumen calculado: [volumen] cm³). Superficie externa [capsula]. Al corte, cavidad quística que expulsa [liquido]. La pared es [pared]. El revestimiento interno es [revestimiento]. Se observa trompa de Falopio que mide [trompa_dim] cm y se encuentra [trompa_estado]. Se remiten [n] casetes ([casetes]). <small>Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.) / WHO Classification of Tumours</small>"
    },
    "QUISTE DE OVARIO: QUISTE FISIOLÓGICO FOLICULAR / LÚTEO (MACROSCOPÍA LESTER)": {
        chips: {
            lateralidad: ["Izquierdo", "Derecho"],
            capsula: ["Lisa, brillante y delgada", "Íntegra"],
            pared: ["Fina, translúcida", "Levemente plegada de color amarillo-anaranjado"],
            liquido: ["Claro, seroso y fluido", "Hemorrágico escaso"],
            revestimiento: ["Liso y brillante", "Plegado festoneado (lúteo)"],
            trompa: ["Normal"]
        },
        defaultValues: {
            lateralidad: "Izquierdo",
            peso: "15.0",
            largo: "3.5",
            ancho: "3.0",
            espesor: "2.5",
            pared: "fina (1-2 mm), con ribete de parénquima ovárico congestivo",
            liquido: "claro y seroso",
            revestimiento: "liso y brillante con pliegues festonados de tonalidad amarillenta",
            trompa_dim: "4.5 x 0.7 x 0.5",
            trompa_estado: "sin alteraciones macroscópicas",
            n: "2",
            casetes: "5A: pared quística representativa; 5B: corteza ovárica y parénquima adyacente"
        },
        template: "Se recibe espécimen de ovario [lateralidad], que pesa [peso] g y mide [dimensiones] cm (volumen calculado: [volumen] cm³). Superficie externa [capsula]. Al corte, quiste unilocular con pared [pared], que contiene líquido [liquido] y revestimiento [revestimiento]. Se acompaña de trompa de Falopio que mide [trompa_dim] cm y se encuentra [trompa_estado]. Se procesan [n] casetes ([casetes]). <small>Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.) / WHO Classification of Tumours</small>"
    },
    "QUISTE DE ANEXO: QUISTE PARATUBÁRICO / HIDÁTIDE DE MORGAGNI (MACROSCOPÍA LESTER)": {
        chips: {
            lateralidad: ["Izquierdo", "Derecho"],
            ubicacion: ["Pendulado de la fimbria tubárica", "En el mesosalpinx libre"],
            pared: ["Muy fina, traslúcida y membranosa"],
            liquido: ["Líquido claro acuoso"],
            trompa: ["Adyacente sin infiltración", "Normal"]
        },
        defaultValues: {
            lateralidad: "Derecho",
            peso: "8.0",
            largo: "2.0",
            ancho: "1.5",
            espesor: "1.2",
            pared: "fina y traslúcida de < 1 mm de espesor",
            liquido: "claro y acuoso",
            ubicacion: "pendulado del mesosalpinx próximo a las fimbrias tubáricas",
            trompa_dim: "6.0 x 0.8 x 0.6",
            trompa_estado: "íntegra y sin alteraciones intrínsecas",
            n: "2",
            casetes: "6A: quiste paratubárico y su unión al mesosalpinx; 6B: trompa de Falopio en cortes longitudinales y transversales"
        },
        template: "Se recibe espécimen constituido por trompa de Falopio y lesión quística paratubárica [lateralidad]. La trompa mide [trompa_dim] cm y se encuentra [trompa_estado]. Dependiente del mesosalpinx se identifica quiste unilocular que mide [dimensiones] cm (volumen calculado: [volumen] cm³), ubicado [ubicacion], con pared [pared] y contenido [liquido]. Se procesan [n] casetes ([casetes]). <small>Lester, S. C. (2010). Manual of Surgical Pathology (3rd ed.) / WHO Classification of Tumours</small>"
    }
};

/**
 * Renderiza el modal interactivo tipo "soldado" para plantillas ginecológicas de quistes de anexo
 */
export function renderMacroWizardModal(templateTitle, onComplete) {
    const config = gynMacroWizardConfig[templateTitle];
    if (!config) {
        console.warn("No hay wizard configurado para:", templateTitle);
        return null;
    }

    const modalId = "macroWizardModal";
    let existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = modalId;
    modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.75); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px);";

    let html = `
        <div style="background: #1e293b; color: #f8fafc; padding: 25px; border-radius: 14px; width: 680px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); font-family: system-ui, sans-serif; border: 1px solid #334155;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #334155; padding-bottom: 12px;">
                <div>
                    <h3 style="margin: 0; font-size: 1.2rem; color: #38bdf8;"><i class="fa-solid fa-wand-magic-sparkles"></i> Asistente de Macroscopía Guiada (Protocolo Soldado - Lester)</h3>
                    <p style="margin: 4px 0 0 0; font-size: 0.82rem; color: #94a3b8;">${templateTitle}</p>
                </div>
                <button type="button" id="closeWizardBtn" style="background: transparent; border: none; color: #94a3b8; font-size: 1.3rem; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form id="wizardForm" style="display: flex; flex-direction: column; gap: 14px;">
    `;

    // Sección de Dimensiones y Cálculo Volumétrico Automático (Elipsoide)
    html += `
        <div style="background: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid #334155;">
            <h4 style="margin: 0 0 10px 0; font-size: 0.9rem; color: #38bdf8;"><i class="fa-solid fa-ruler-combined"></i> Dimensiones 3D y Cálculo Volumétrico Automático</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 10px;">
                <div>
                    <label style="font-size: 0.75rem; color: #cbd5e1; display: block; margin-bottom: 3px;">Largo (cm):</label>
                    <input type="text" id="wiz_largo" value="${config.defaultValues.largo || '5.0'}" style="width: 100%; background: #1e293b; border: 1px solid #475569; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 0.85rem;" required>
                </div>
                <div>
                    <label style="font-size: 0.75rem; color: #cbd5e1; display: block; margin-bottom: 3px;">Ancho (cm):</label>
                    <input type="text" id="wiz_ancho" value="${config.defaultValues.ancho || '4.0'}" style="width: 100%; background: #1e293b; border: 1px solid #475569; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 0.85rem;" required>
                </div>
                <div>
                    <label style="font-size: 0.75rem; color: #cbd5e1; display: block; margin-bottom: 3px;">Espesor (cm):</label>
                    <input type="text" id="wiz_espesor" value="${config.defaultValues.espesor || '3.0'}" style="width: 100%; background: #1e293b; border: 1px solid #475569; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 0.85rem;" required>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 8px 12px; border-radius: 6px; font-size: 0.85rem;">
                <span style="color: #94a3b8;">Volumen Elipsoidal Calculado (V = (π/6) * L * A * E):</span>
                <b id="calc_volumen" style="color: #34d399; font-size: 0.95rem;">-- cm³</b>
            </div>
        </div>
    `;

    // Campos generales con chips
    html += `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
                <label style="font-size: 0.78rem; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 4px;">Peso (g):</label>
                <input type="text" id="wiz_peso" value="${config.defaultValues.peso || '30.0'}" style="width: 100%; background: #0f172a; border: 1px solid #475569; color: #fff; padding: 7px 10px; border-radius: 6px; font-size: 0.85rem;" required>
            </div>
            <div>
                <label style="font-size: 0.78rem; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 4px;">Lateralidad:</label>
                <select id="wiz_lateralidad" style="width: 100%; background: #0f172a; border: 1px solid #475569; color: #fff; padding: 7px 10px; border-radius: 6px; font-size: 0.85rem;">
                    ${(config.chips.lateralidad || ["Izquierdo", "Derecho", "Bilateral"]).map(opt => `<option value="${opt.toLowerCase()}" ${config.defaultValues.lateralidad === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </div>
        </div>
    `;

    // Renderizar chips / opciones rápidas para las demás variables clave
    const skipKeys = ['lateralidad', 'peso', 'largo', 'ancho', 'espesor'];
    for (const [key, val] of Object.entries(config.defaultValues)) {
        if (skipKeys.includes(key)) continue;
        const chipsArr = config.chips && config.chips[key] ? config.chips[key] : null;
        
        html += `
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 0.78rem; font-weight: 600; color: #cbd5e1; text-transform: capitalize;">${key.replace('_', ' ')}:</label>
                <input type="text" id="wiz_${key}" value="${val}" style="background: #0f172a; border: 1px solid #475569; color: #fff; padding: 7px 10px; border-radius: 6px; font-size: 0.85rem;" required>
                ${chipsArr ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 3px;">
                        ${chipsArr.map(chip => `<button type="button" class="chip-btn" data-target="wiz_${key}" data-value="${chip}" style="background: #334155; border: none; color: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-size: 0.73rem; cursor: pointer; transition: background 0.2s;">${chip}</button>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    html += `
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; border-top: 1px solid #334155; padding-top: 15px;">
                    <button type="button" id="cancelWizard" style="background: #475569; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">Cancelar</button>
                    <button type="submit" style="background: #0284c7; color: #fff; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem;"><i class="fa-solid fa-check"></i> Generar Macroscopía e Inyectar</button>
                </div>
            </form>
        </div>
    `;

    modal.innerHTML = html;
    document.body.appendChild(modal);

    // Lógica de cálculo de volumen en tiempo real
    const calcVolumen = () => {
        const l = parseFloat(document.getElementById("wiz_largo").value) || 0;
        const a = parseFloat(document.getElementById("wiz_ancho").value) || 0;
        const e = parseFloat(document.getElementById("wiz_espesor").value) || 0;
        const v = (Math.PI / 6) * l * a * e;
        const volStr = v > 0 ? v.toFixed(1) : "--";
        document.getElementById("calc_volumen").innerText = `${volStr} cm³`;
        return volStr;
    };

    ['wiz_largo', 'wiz_ancho', 'wiz_espesor'].forEach(id => {
        document.getElementById(id).oninput = calcVolumen;
    });
    calcVolumen();

    // Manejo de clicks en chips
    modal.querySelectorAll('.chip-btn').forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.getAttribute('data-target');
            const val = btn.getAttribute('data-value');
            const inputEl = document.getElementById(targetId);
            if (inputEl) {
                inputEl.value = val.toLowerCase();
            }
        };
        btn.onmouseover = () => btn.style.background = '#0284c7';
        btn.onmouseout = () => btn.style.background = '#334155';
    });

    document.getElementById("closeWizardBtn").onclick = () => modal.remove();
    document.getElementById("cancelWizard").onclick = () => modal.remove();

    document.getElementById("wizardForm").onsubmit = (e) => {
        e.preventDefault();
        const largo = document.getElementById("wiz_largo").value.trim();
        const ancho = document.getElementById("wiz_ancho").value.trim();
        const espesor = document.getElementById("wiz_espesor").value.trim();
        const dimensiones = `${largo} x ${ancho} x ${espesor}`;
        const volumen = calcVolumen();

        const answers = {
            dimensiones,
            volumen,
            lateralidad: document.getElementById("wiz_lateralidad").value,
            peso: document.getElementById("wiz_peso").value.trim()
        };

        for (const key of Object.keys(config.defaultValues)) {
            if (['lateralidad', 'peso', 'largo', 'ancho', 'espesor'].includes(key)) continue;
            const el = document.getElementById(`wiz_${key}`);
            if (el) {
                answers[key] = el.value.trim();
            }
        }

        const generatedText = applyWizardAnswersToTemplate(config.template, answers);
        modal.remove();
        if (typeof onComplete === "function") {
            onComplete(generatedText);
        }
    };
}

export function applyWizardAnswersToTemplate(macroTemplateText, answers) {
    let result = macroTemplateText;
    for (const [key, val] of Object.entries(answers)) {
        result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), val);
    }
    return result;
}
