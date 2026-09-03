// synoptic_schemas.js
// PROTOCOLO ACTOR-CRITICO: Definición de Esquemas Sinópticos y Compilador en Español

export const synopticSchemas = {
    prostate_turp: {
        id: "prostate_turp",
        title: "Protocolo Sinóptico: Cáncer de Próstata (RTUP / Enucleación)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "radio",
                        options: [
                            { value: "rtup", label: "Resección transuretral de la próstata (RTUP)" },
                            { value: "enucleation", label: "Enucleación (prostatectomía simple o subtotal)" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    }
                ]
            },
            {
                name: "TUMOR",
                fields: [
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico",
                        type: "select",
                        options: [
                            { value: "acinar_conv", label: "Adenocarcinoma acinar, convencional (habitual)" },
                            { value: "acinar_signet", label: "Adenocarcinoma acinar, tipo células en anillo de sello" },
                            { value: "acinar_pleomorphic", label: "Adenocarcinoma acinar, de células gigantes pleomórficas" },
                            { value: "acinar_sarcomatoid", label: "Adenocarcinoma acinar, sarcomatoide" },
                            { value: "acinar_pin_like", label: "Adenocarcinoma acinar, similar a neoplasia intraepitelial prostática" },
                            { value: "intraductal_isolated", label: "Carcinoma intraductal aislado" },
                            { value: "ductal_adenocarcinoma", label: "Adenocarcinoma ductal" },
                            { value: "adenosquamous", label: "Carcinoma adenoescamoso" },
                            { value: "squamous_cell", label: "Carcinoma de células escamosas" },
                            { value: "basal_cell", label: "Carcinoma de células basales (quístico adenoide)" },
                            { value: "neuroendocrine_diff", label: "Adenocarcinoma con diferenciación neuroendocrina" },
                            { value: "neuroendocrine_tumor", label: "Tumor neuroendocrino bien diferenciado" },
                            { value: "small_cell", label: "Carcinoma neuroendocrino de células pequeñas" },
                            { value: "large_cell", label: "Carcinoma neuroendocrino de células grandes" },
                            { value: "other_type", label: "Otro tipo histológico (especificar)", hasInput: true },
                            { value: "undetermined", label: "Carcinoma, tipo no determinado" }
                        ]
                    },
                    {
                        id: "gleason_group",
                        label: "Grado Histológico (Gleason Score / Grupo de Grado)",
                        type: "select",
                        options: [
                            { value: "na", label: "No aplicable" },
                            { value: "cannot_assess", label: "No puede ser evaluado" },
                            { value: "g1", label: "Grupo de grado 1 (Gleason 3 + 3 = 6)" },
                            { value: "g2", label: "Grupo de grado 2 (Gleason 3 + 4 = 7)" },
                            { value: "g3", label: "Grupo de grado 3 (Gleason 4 + 3 = 7)" },
                            { value: "g4_44", label: "Grupo de grado 4 (Gleason 4 + 4 = 8)" },
                            { value: "g4_35", label: "Grupo de grado 4 (Gleason 3 + 5 = 8)" },
                            { value: "g4_53", label: "Grupo de grado 4 (Gleason 5 + 3 = 8)" },
                            { value: "g5_45", label: "Grupo de grado 5 (Gleason 4 + 5 = 9)" },
                            { value: "g5_54", label: "Grupo de grado 5 (Gleason 5 + 4 = 9)" },
                            { value: "g5_55", label: "Grupo de grado 5 (Gleason 5 + 5 = 10)" }
                        ]
                    },
                    {
                        id: "pattern4_pct_g2",
                        label: "Porcentaje de Patrón 4 (Solo para Grupo de Grado 2)",
                        type: "radio",
                        dependsOn: { field: "gleason_group", value: "g2" },
                        options: [
                            { value: "lte_5", label: "Menor o igual al 5%" },
                            { value: "6_10", label: "6 - 10%" },
                            { value: "11_20", label: "11 - 20%" },
                            { value: "21_30", label: "21 - 30%" },
                            { value: "31_40", label: "31 - 40%" },
                            { value: "gt_40", label: "Mayor al 40%" }
                        ]
                    },
                    {
                        id: "pattern4_pct_g3",
                        label: "Porcentaje de Patrón 4 (Solo para Grupo de Grado 3)",
                        type: "radio",
                        dependsOn: { field: "gleason_group", value: "g3" },
                        options: [
                            { value: "lt_61", label: "Menor al 61%" },
                            { value: "61_70", label: "61 - 70%" },
                            { value: "71_80", label: "71 - 80%" },
                            { value: "81_90", label: "81 - 90%" },
                            { value: "gt_90", label: "Mayor al 90%" }
                        ]
                    },
                    {
                        id: "pattern4_high",
                        label: "Especificar % de Patrón 4 (Gleason Score mayor a 7)",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "gleason_group", values: ["g4_44", "g4_35", "g4_53", "g5_45", "g5_54", "g5_55"] }
                    },
                    {
                        id: "pattern5_high",
                        label: "Especificar % de Patrón 5 (Gleason Score mayor a 7)",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "gleason_group", values: ["g4_44", "g4_35", "g4_53", "g5_45", "g5_54", "g5_55"] }
                    },
                    {
                        id: "intraductal_carcinoma",
                        label: "Carcinoma Intraductal (IDC)",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificado" },
                            { value: "present", label: "Presente" }
                        ]
                    },
                    {
                        id: "idc_graded",
                        label: "¿IDC incorporado en el Grado?",
                        type: "radio",
                        dependsOn: { field: "intraductal_carcinoma", value: "present" },
                        options: [
                            { value: "yes", label: "Sí" },
                            { value: "no", label: "No" },
                            { value: "undetermined", label: "No se puede determinar (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "cribriform_glands",
                        label: "Glándulas Cribiformes (Gleason 7 u 8 únicamente)",
                        type: "radio",
                        options: [
                            { value: "na", label: "No aplicable" },
                            { value: "not_identified", label: "No identificado" },
                            { value: "present", label: "Presente" },
                            { value: "undetermined", label: "No se puede determinar (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "treatment_effect",
                        label: "Efecto del Tratamiento",
                        type: "checkbox",
                        options: [
                            { value: "no_therapy", label: "Sin terapia presúrgica conocida" },
                            { value: "not_identified", label: "No identificado" },
                            { value: "radiation", label: "Efecto de radioterapia presente (especificar)", hasInput: true },
                            { value: "hormonal", label: "Efecto de terapia hormonal presente (especificar)", hasInput: true },
                            { value: "other", label: "Efecto de otra terapia presente (especificar)", hasInput: true },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    }
                ]
            },
            {
                name: "CUANTIFICACIÓN DEL TUMOR",
                fields: [
                    {
                        id: "quant_mode",
                        label: "Tipo de Cuantificación",
                        type: "radio",
                        options: [
                            { value: "turp", label: "Para especímenes de RTUP" },
                            { value: "enucleation", label: "Para enucleaciones y otros especímenes" }
                        ]
                    },
                    {
                        id: "turp_pct",
                        label: "Porcentaje estimado de próstata involucrada por el tumor",
                        type: "select",
                        dependsOn: { field: "quant_mode", value: "turp" },
                        options: [
                            { value: "lt_1", label: "Menor al 1%" },
                            { value: "1_5", label: "1 - 5%" },
                            { value: "6_10", label: "6 - 10%" },
                            { value: "11_20", label: "11 - 20%" },
                            { value: "21_30", label: "21 - 30%" },
                            { value: "31_40", label: "31 - 40%" },
                            { value: "41_50", label: "41 - 50%" },
                            { value: "51_60", label: "51 - 60%" },
                            { value: "61_70", label: "61 - 70%" },
                            { value: "71_80", label: "71 - 80%" },
                            { value: "81_90", label: "81 - 90%" },
                            { value: "gt_90", label: "Mayor al 90%" },
                            { value: "undetermined", label: "No se puede determinar (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "positive_chips",
                        label: "Número de fragmentos (chips) positivos",
                        type: "number",
                        dependsOn: { field: "quant_mode", value: "turp" }
                    },
                    {
                        id: "total_chips",
                        label: "Número total de fragmentos (chips)",
                        type: "number",
                        dependsOn: { field: "quant_mode", value: "turp" }
                    },
                    {
                        id: "dominant_nodule_dim",
                        label: "Dimensión mayor del nódulo dominante (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "quant_mode", value: "enucleation" }
                    },
                    {
                        id: "dominant_nodule_add_w",
                        label: "Ancho del nódulo dominante (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "quant_mode", value: "enucleation" }
                    },
                    {
                        id: "dominant_nodule_add_h",
                        label: "Alto del nódulo dominante (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "quant_mode", value: "enucleation" }
                    },
                    {
                        id: "enucleation_pct",
                        label: "Porcentaje estimado de tejido prostático involucrado por el tumor",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "quant_mode", value: "enucleation" }
                    }
                ]
            },
            {
                name: "INVASIONES Y OTROS HALLAZGOS",
                fields: [
                    {
                        id: "periprostatic_fat",
                        label: "Invasión de Grasa Periprostática",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" },
                            { value: "equivocal", label: "Equívoca (explicar)", hasInput: true },
                            { value: "undetermined", label: "No se puede determinar (explicar)", hasInput: true }
                        ]
                    },
                    {
                        id: "seminal_vesicle",
                        label: "Invasión de Vesícula Seminal",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" },
                            { value: "equivocal", label: "Equívoca (explicar)", hasInput: true },
                            { value: "undetermined", label: "No se puede determinar (explicar)", hasInput: true }
                        ]
                    },
                    {
                        id: "lymphovascular",
                        label: "Invasión Linfática y/o Vascular",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "perineural",
                        label: "Invasión Perineural",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" }
                        ]
                    },
                    {
                        id: "additional_findings",
                        label: "Hallazgos Adicionales",
                        type: "checkbox",
                        options: [
                            { value: "none", label: "Ninguno identificado" },
                            { value: "aip", label: "Proliferación intraductal atípica (PIA)" },
                            { value: "pin", label: "Neoplasia intraepitelial prostática de alto grado (PIN)" },
                            { value: "adenosis", label: "Hiperplasia adenomatosa atípica (adenosis)" },
                            { value: "nodular_hyperplasia", label: "Hiperplasia prostática nodular" },
                            { value: "inflammation", label: "Inflamación (especificar tipo)", hasInput: true },
                            { value: "other", label: "Otros (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "comments",
                        label: "Comentarios Adicionales",
                        type: "text"
                    }
                ]
            }
        ]
    },
    breast_phyllodes: {
        id: "breast_phyllodes",
        title: "Protocolo Sinóptico: Tumor Filodes de la Mama (Resección)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "radio",
                        options: [
                            { value: "excision", label: "Escisión (menor que mastectomía total)" },
                            { value: "mastectomy", label: "Mastectomía total (incluyendo preservación de pezón/piel)" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    },
                    {
                        id: "laterality",
                        label: "Lateralidad del Espécimen",
                        type: "radio",
                        options: [
                            { value: "right", label: "Derecha" },
                            { value: "left", label: "Izquierda" },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    }
                ]
            },
            {
                name: "TUMOR",
                fields: [
                    {
                        id: "site",
                        label: "Sitio del Tumor (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        options: [
                            { value: "uoq", label: "Cuadrante superior externo (CSE)" },
                            { value: "loq", label: "Cuadrante inferior externo (CIE)" },
                            { value: "uiq", label: "Cuadrante superior interno (CSI)" },
                            { value: "liq", label: "Cuadrante inferior interno (CII)" },
                            { value: "central", label: "Central" },
                            { value: "nipple", label: "Pezón" },
                            { value: "clock", label: "Posición del reloj (especificar en comentario o campo extra)", hasInput: true },
                            { value: "other", label: "Otro sitio (especificar)", hasInput: true },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    },
                    {
                        id: "nipple_distance",
                        label: "Distancia desde el pezón (cm)",
                        type: "number",
                        suffix: "cm"
                    },
                    {
                        id: "size",
                        label: "Dimensión mayor del tumor (mm)",
                        type: "number",
                        suffix: "mm"
                    },
                    {
                        id: "additional_w",
                        label: "Dimensión adicional: Ancho (mm)",
                        type: "number",
                        suffix: "mm"
                    },
                    {
                        id: "additional_h",
                        label: "Dimensión adicional: Alto (mm)",
                        type: "number",
                        suffix: "mm"
                    },
                    {
                        id: "cannot_assess_size",
                        label: "No se puede determinar el tamaño (especificar)",
                        type: "text"
                    },
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico",
                        type: "radio",
                        options: [
                            { value: "benign", label: "Tumor filodes, benigno" },
                            { value: "borderline", label: "Tumor filodes, borderline (limítrofe)" },
                            { value: "malignant", label: "Tumor filodes, maligno" }
                        ]
                    },
                    {
                        id: "cellularity",
                        label: "Celularidad Estromal",
                        type: "radio",
                        options: [
                            { value: "mild", label: "Leve (núcleos estromales no se superponen)" },
                            { value: "moderate", label: "Moderada (algunos núcleos se superponen)" },
                            { value: "marked", label: "Marcada (muchos núcleos se superponen)" }
                        ]
                    },
                    {
                        id: "atypia",
                        label: "Atipia Estromal",
                        type: "radio",
                        options: [
                            { value: "none", label: "Ninguna" },
                            { value: "mild", label: "Leve (variación nuclear mínima, cromatina uniforme)" },
                            { value: "moderate", label: "Moderada (mayor variación nuclear, membranas irregulares)" },
                            { value: "marked", label: "Marcada (pleomorfismo nuclear marcado, hipercromasia)" }
                        ]
                    },
                    {
                        id: "overgrowth",
                        label: "Crecimiento Excesivo Estromal (Stromal Overgrowth)",
                        type: "radio",
                        options: [
                            { value: "absent", label: "Ausente" },
                            { value: "present", label: "Presente" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "mitotic_mode",
                        label: "Tasa Mitótica",
                        type: "radio",
                        options: [
                            { value: "none", label: "Ninguna identificada" },
                            { value: "hpf", label: "Especificar número de mitosis por 10 HPFs", hasInput: true },
                            { value: "mm2", label: "Especificar número de mitosis por mm2", hasInput: true },
                            { value: "cannot_assess", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "tumor_border",
                        label: "Borde Histológico del Tumor",
                        type: "radio",
                        options: [
                            { value: "circumscribed", label: "Circunscrito (bien definido, empujando)" },
                            { value: "infiltrative", label: "Infiltrativo (permeativo)" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "infiltrative_extent",
                        label: "Extensión del borde infiltrativo",
                        type: "radio",
                        dependsOn: { field: "tumor_border", value: "infiltrative" },
                        options: [
                            { value: "focal", label: "Focal" },
                            { value: "extensive", label: "Extenso" }
                        ]
                    },
                    {
                        id: "heterologous_elements",
                        label: "Elementos Heterólogos Malignos",
                        type: "select",
                        options: [
                            { value: "not_identified", label: "No identificados" },
                            { value: "liposarcoma", label: "Liposarcoma (excluyendo liposarcoma bien diferenciado)" },
                            { value: "osteosarcoma", label: "Osteosarcoma" },
                            { value: "chondrosarcoma", label: "Condrosarcoma" },
                            { value: "other", label: "Otro elemento (especificar)", hasInput: true }
                        ]
                    }
                ]
            },
            {
                name: "MÁRGENES",
                fields: [
                    {
                        id: "margin_status",
                        label: "Estado de los Márgenes para el Tumor Filodes",
                        type: "radio",
                        options: [
                            { value: "negative", label: "Todos los márgenes negativos para tumor filodes" },
                            { value: "positive", label: "Tumor filodes presente en el margen (positivo)" }
                        ]
                    },
                    {
                        id: "closest_margins",
                        label: "Margen(es) más cercano(s)",
                        type: "checkbox",
                        dependsOn: { field: "margin_status", value: "negative" },
                        options: [
                            { value: "anterior", label: "Anterior" },
                            { value: "posterior", label: "Posterior" },
                            { value: "superior", label: "Superior" },
                            { value: "inferior", label: "Inferior" },
                            { value: "medial", label: "Medial" },
                            { value: "lateral", label: "Lateral" },
                            { value: "other", label: "Otro margen (especificar)", hasInput: true },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "margin_dist_mode",
                        label: "Distancia al margen más cercano",
                        type: "radio",
                        dependsOn: { field: "margin_status", value: "negative" },
                        options: [
                            { value: "exact", label: "Distancia exacta (mm)", hasInput: true },
                            { value: "less_than", label: "Menor a (mm)", hasInput: true },
                            { value: "greater_than", label: "Mayor a (mm)", hasInput: true },
                            { value: "cannot_assess", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "involved_margins",
                        label: "Margen(es) Comprometido(s) (Positivos)",
                        type: "checkbox",
                        dependsOn: { field: "margin_status", value: "positive" },
                        options: [
                            { value: "anterior", label: "Anterior" },
                            { value: "posterior", label: "Posterior" },
                            { value: "superior", label: "Superior" },
                            { value: "inferior", label: "Inferior" },
                            { value: "medial", label: "Medial" },
                            { value: "lateral", label: "Lateral" },
                            { value: "other", label: "Otro margen (especificar)", hasInput: true },
                            { value: "cannot_assess", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "margin_comments",
                        label: "Comentarios sobre Márgenes",
                        type: "text"
                    }
                ]
            },
            {
                name: "GANGLIOS LINFÁTICOS REGIONALES",
                fields: [
                    {
                        id: "node_status",
                        label: "Estado de los Ganglios Linfáticos Regionales",
                        type: "radio",
                        options: [
                            { value: "na", label: "No aplicable (no se enviaron ni encontraron ganglios)" },
                            { value: "present", label: "Ganglios linfáticos regionales presentes" }
                        ]
                    },
                    {
                        id: "node_eval",
                        label: "Evaluación de Ganglios",
                        type: "radio",
                        dependsOn: { field: "node_status", value: "present" },
                        options: [
                            { value: "all_negative", label: "Todos los ganglios negativos para tumor" },
                            { value: "positive", label: "Metástasis presente (tumor detectado en ganglios)" }
                        ]
                    },
                    {
                        id: "nodes_positive",
                        label: "Número de ganglios comprometidos (ej. '3', 'al menos 1')",
                        type: "text",
                        dependsOn: { field: "node_eval", value: "positive" }
                    },
                    {
                        id: "nodes_examined",
                        label: "Número total de ganglios examinados (ej. '12', 'al menos 5')",
                        type: "text",
                        dependsOn: { field: "node_status", value: "present" }
                    },
                    {
                        id: "node_comments",
                        label: "Comentarios sobre Ganglios",
                        type: "text"
                    }
                ]
            },
            {
                name: "METÁSTASIS A DISTANCIA",
                fields: [
                    {
                        id: "metastasis",
                        label: "Sitio(s) distante(s) involucrado(s)",
                        type: "radio",
                        options: [
                            { value: "na", label: "No aplicable / Sin evidencia" },
                            { value: "present", label: "Metástasis a distancia presente (especificar sitio)", hasInput: true },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    }
                ]
            },
            {
                name: "CLASIFICACIÓN DE ESTADIO PATOLÓGICO (pTNM, AJCC 8.ª EDICIÓN)",
                fields: [
                    {
                        id: "staging_applicable",
                        label: "Clasificación de Estadio (Solo aplica a tumores filodes malignos)",
                        type: "radio",
                        options: [
                            { value: "na", label: "No aplicable (el tumor es benigno o borderline)" },
                            { value: "malignant", label: "El tumor es maligno (asignar categorías pT, pN, pM)" }
                        ]
                    },
                    {
                        id: "tnm_descriptors",
                        label: "Descriptores TNM (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        dependsOn: { field: "staging_applicable", value: "malignant" },
                        options: [
                            { value: "na", label: "No aplicable" },
                            { value: "m", label: "m (múltiple)" },
                            { value: "r", label: "r (recurrente)" },
                            { value: "y", label: "y (post-tratamiento)" }
                        ]
                    },
                    {
                        id: "pt_category",
                        label: "Categoría pT",
                        type: "select",
                        dependsOn: { field: "staging_applicable", value: "malignant" },
                        options: [
                            { value: "ptx", label: "pT no asignado (no determinado por info disponible)" },
                            { value: "pt0", label: "pT0: Sin evidencia de tumor primario" },
                            { value: "pt1", label: "pT1: Tumor de 5 cm o menos en su dimensión mayor" },
                            { value: "pt2", label: "pT2: Tumor de más de 5 cm pero no más de 10 cm" },
                            { value: "pt3", label: "pT3: Tumor de más de 10 cm pero no más de 15 cm" },
                            { value: "pt4", label: "pT4: Tumor de más de 15 cm en su dimensión mayor" }
                        ]
                    },
                    {
                        id: "pn_category",
                        label: "Categoría pN",
                        type: "select",
                        dependsOn: { field: "staging_applicable", value: "malignant" },
                        options: [
                            { value: "pnx", label: "pN no asignado (no determinado por info disponible)" },
                            { value: "pn0", label: "pN0: Sin metástasis en ganglios linfáticos regionales" },
                            { value: "pn1", label: "pN1: Metástasis en ganglios linfáticos regionales" }
                        ]
                    },
                    {
                        id: "pm_category",
                        label: "Categoría pM (requerido solo si se confirma patológicamente)",
                        type: "radio",
                        dependsOn: { field: "staging_applicable", value: "malignant" },
                        options: [
                            { value: "na", label: "No aplicable (no determinada a partir de la muestra)" },
                            { value: "pm1", label: "pM1: Metástasis a distancia confirmada patológicamente" }
                        ]
                    }
                ]
            },
            {
                name: "HALLAZGOS ADICIONALES",
                fields: [
                    {
                        id: "additional_findings",
                        label: "Hallazgos Adicionales (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        options: [
                            { value: "none", label: "Ninguno identificado" },
                            { value: "fibroepithelial", label: "Proliferación fibroepitelial coexistente (fibroadenoma o cambio fibroadenomatoide)" },
                            { value: "adh", label: "Hiperplasia ductal atípica (HDA)" },
                            { value: "alh", label: "Hiperplasia lobulillar atípica (HLA)" },
                            { value: "other", label: "Otros hallazgos (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "comments",
                        label: "Comentarios / Notas Clínicas",
                        type: "text"
                    }
                ]
            }
        ]
    },
    breast_invasive_carcinoma: {
        id: "breast_invasive_carcinoma",
        title: "Protocolo Sinóptico: Carcinoma Invasivo de la Mama (Resección)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "radio",
                        options: [
                            { value: "excision", label: "Escisión (incluye tumorectomía/mastectomía parcial)" },
                            { value: "mastectomy", label: "Mastectomía total (incluyendo preservación de pezón/piel)" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    },
                    {
                        id: "laterality",
                        label: "Lateralidad del Espécimen",
                        type: "radio",
                        options: [
                            { value: "right", label: "Derecha" },
                            { value: "left", label: "Izquierda" },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    }
                ]
            },
            {
                name: "TUMOR",
                fields: [
                    {
                        id: "focality",
                        label: "Focalidad del Tumor",
                        type: "radio",
                        options: [
                            { value: "unifocal", label: "Unifocal" },
                            { value: "multifocal", label: "Multifocal" },
                            { value: "multi_similar", label: "Focos múltiples con características similares" },
                            { value: "multi_different", label: "Focos múltiples con características diferentes" },
                            { value: "other", label: "Otro (especificar)", hasInput: true },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "site",
                        label: "Sitio del Tumor (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        options: [
                            { value: "uoq", label: "Cuadrante superior externo (CSE)" },
                            { value: "loq", label: "Cuadrante inferior externo (CIE)" },
                            { value: "uiq", label: "Cuadrante superior interno (CSI)" },
                            { value: "liq", label: "Cuadrante inferior interno (CII)" },
                            { value: "central", label: "Central" },
                            { value: "nipple", label: "Pezón" },
                            { value: "other", label: "Otro sitio (especificar)", hasInput: true },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    },
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico",
                        type: "select",
                        options: [
                            { value: "ductal_nos", label: "Carcinoma invasivo sin tipo especial (ductal)" },
                            { value: "ductal_pattern", label: "Carcinoma invasivo con patrón morfológico específico (especificar)", hasInput: true },
                            { value: "lobular_classic", label: "Carcinoma lobulillar invasivo, clásico" },
                            { value: "lobular_variant", label: "Carcinoma lobulillar invasivo, variante (especificar)", hasInput: true },
                            { value: "mixed", label: "Tipos histológicos mixtos (especificar tipos y %)", hasInput: true },
                            { value: "tubular", label: "Carcinoma tubular, puro o > 90%" },
                            { value: "cribriform", label: "Carcinoma cribiforme invasivo, puro o > 90%" },
                            { value: "mucinous", label: "Carcinoma mucinoso, puro o > 90%" },
                            { value: "micropapillary", label: "Carcinoma micropapilar invasivo, puro o > 90%" },
                            { value: "apocrine", label: "Carcinoma apocrino invasivo" },
                            { value: "metaplastic_spindle", label: "Carcinoma metaplásico, células fusiformes" },
                            { value: "metaplastic_heterologous", label: "Carcinoma metaplásico, con diferenciación heteróloga" },
                            { value: "metaplastic_squamous", label: "Carcinoma metaplásico, células escamosas" },
                            { value: "metaplastic_mixed", label: "Carcinoma metaplásico, mixto (especificar tipos y %)", hasInput: true },
                            { value: "metaplastic_adenosquamous", label: "Carcinoma metaplásico, tipo adenoescamoso de bajo grado" },
                            { value: "metaplastic_fibromatosis", label: "Carcinoma metaplásico, tipo similar a fibromatosis de bajo grado" },
                            { value: "metaplastic_other", label: "Carcinoma metaplásico, otro tipo (especificar)", hasInput: true },
                            { value: "solid_papillary", label: "Carcinoma papilar sólido invasivo" },
                            { value: "adenoid_cystic", label: "Carcinoma quístico adenoide, clásico" },
                            { value: "secretory", label: "Carcinoma secretor" },
                            { value: "other_type", label: "Otro tipo histológico (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "grade_applicable",
                        label: "Grado Histológico (Nottingham)",
                        type: "radio",
                        options: [
                            { value: "na", label: "No aplicable (sin carcinoma residual o solo microinvasión)" },
                            { value: "graded", label: "Evaluar grado histológico (Nottingham)" }
                        ]
                    },
                    {
                        id: "tubule_formation",
                        label: "Formación de Túbulos",
                        type: "radio",
                        dependsOn: { field: "grade_applicable", value: "graded" },
                        options: [
                            { value: "score1", label: "Score 1 (> 75% del área tumoral)" },
                            { value: "score2", label: "Score 2 (10% a 75% del área tumoral)" },
                            { value: "score3", label: "Score 3 (< 10% del área tumoral)" }
                        ]
                    },
                    {
                        id: "nuclear_pleomorphism",
                        label: "Pleomorfismo Nuclear",
                        type: "radio",
                        dependsOn: { field: "grade_applicable", value: "graded" },
                        options: [
                            { value: "score1", label: "Score 1 (atipia mínima, cromatina uniforme)" },
                            { value: "score2", label: "Score 2 (atipia moderada, nucléolos visibles pero pequeños)" },
                            { value: "score3", label: "Score 3 (atipia marcada, variación prominente de tamaño y forma)" }
                        ]
                    },
                    {
                        id: "mitotic_score",
                        label: "Tasa Mitótica (Score)",
                        type: "radio",
                        dependsOn: { field: "grade_applicable", value: "graded" },
                        options: [
                            { value: "score1", label: "Score 1" },
                            { value: "score2", label: "Score 2" },
                            { value: "score3", label: "Score 3" }
                        ]
                    },
                    {
                        id: "overall_grade",
                        label: "Grado Global (Nottingham)",
                        type: "radio",
                        dependsOn: { field: "grade_applicable", value: "graded" },
                        options: [
                            { value: "g1", label: "Grado 1 (Score total de 3, 4 o 5)" },
                            { value: "g2", label: "Grado 2 (Score total de 6 o 7)" },
                            { value: "g3", label: "Grado 3 (Score total de 8 o 9)" }
                        ]
                    },
                    {
                        id: "size",
                        label: "Dimensión mayor del foco invasivo contiguo (mm)",
                        type: "number",
                        suffix: "mm"
                    },
                    {
                        id: "dcis_status",
                        label: "Carcinoma Ductal In Situ (DCIS)",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificado" },
                            { value: "present", label: "Presente" }
                        ]
                    },
                    {
                        id: "dcis_percent",
                        label: "Porcentaje de DCIS en el volumen tumoral total (%)",
                        type: "number",
                        suffix: "%",
                        dependsOn: { field: "dcis_status", value: "present" }
                    },
                    {
                        id: "dcis_size",
                        label: "Dimensión estimada mayor del DCIS (mm)",
                        type: "number",
                        suffix: "mm",
                        dependsOn: { field: "dcis_status", value: "present" }
                    },
                    {
                        id: "dcis_nuclear_grade",
                        label: "Grado Nuclear del DCIS",
                        type: "radio",
                        dependsOn: { field: "dcis_status", value: "present" },
                        options: [
                            { value: "g1", label: "Grado I (bajo)" },
                            { value: "g2", label: "Grado II (intermedio)" },
                            { value: "g3", label: "Grado III (alto)" }
                        ]
                    },
                    {
                        id: "dcis_necrosis",
                        label: "Necrosis en DCIS",
                        type: "radio",
                        dependsOn: { field: "dcis_status", value: "present" },
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "focal", label: "Focal (focos pequeños)" },
                            { value: "comedo", label: "Central / Comedonecrosis" }
                        ]
                    },
                    {
                        id: "lymphovascular",
                        label: "Invasión Linfática y/o Vascular",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "focal", label: "Presente, focal" },
                            { value: "extensive", label: "Presente, extensa" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    }
                ]
            },
            {
                name: "MÁRGENES",
                fields: [
                    {
                        id: "margin_status_invasive",
                        label: "Estado de Márgenes para Carcinoma Invasivo",
                        type: "radio",
                        options: [
                            { value: "free_gt_2", label: "Todos los márgenes libres mayor a 2 mm de carcinoma invasivo" },
                            { value: "close_lte_2", label: "Carcinoma invasivo presente a 2 mm o menos de los márgenes" }
                        ]
                    },
                    {
                        id: "involved_margins_invasive",
                        label: "Márgenes comprometidos por tumor invasivo (especificar)",
                        type: "text",
                        dependsOn: { field: "margin_status_invasive", value: "close_lte_2" }
                    },
                    {
                        id: "margin_status_dcis",
                        label: "Estado de Márgenes para DCIS",
                        type: "radio",
                        options: [
                            { value: "free_gt_2", label: "Todos los márgenes libres mayor a 2 mm de DCIS" },
                            { value: "close_lte_2", label: "DCIS presente a 2 mm o menos de los márgenes" }
                        ]
                    },
                    {
                        id: "involved_margins_dcis",
                        label: "Márgenes comprometidos por DCIS (especificar)",
                        type: "text",
                        dependsOn: { field: "margin_status_dcis", value: "close_lte_2" }
                    }
                ]
            },
            {
                name: "GANGLIOS LINFÁTICOS REGIONALES",
                fields: [
                    {
                        id: "node_status",
                        label: "Estado de los Ganglios Linfáticos Regionales",
                        type: "radio",
                        options: [
                            { value: "na", label: "No aplicable (no se enviaron ni encontraron ganglios)" },
                            { value: "present", label: "Ganglios linfáticos regionales presentes" }
                        ]
                    },
                    {
                        id: "nodes_positive",
                        label: "Número total de ganglios con metástasis / positivos (ej. '2')",
                        type: "text",
                        dependsOn: { field: "node_status", value: "present" }
                    },
                    {
                        id: "nodes_examined",
                        label: "Número total de ganglios examinados (ej. '10')",
                        type: "text",
                        dependsOn: { field: "node_status", value: "present" }
                    },
                    {
                        id: "extranodal_extension",
                        label: "Extensión Extraganglionar (ENE)",
                        type: "radio",
                        dependsOn: { field: "node_status", value: "present" },
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente (especificar tamaño en mm)", hasInput: true }
                        ]
                    }
                ]
            },
            {
                name: "CLASIFICACIÓN DE ESTADIO PATOLÓGICO (pTNM, AJCC 8.ª EDICIÓN)",
                fields: [
                    {
                        id: "pt_category",
                        label: "Categoría pT",
                        type: "select",
                        options: [
                            { value: "ptx", label: "pT no asignado" },
                            { value: "pt0", label: "pT0: Sin evidencia de tumor primario" },
                            { value: "ptis_dcis", label: "pTis (DCIS): Carcinoma ductal in situ" },
                            { value: "ptis_paget", label: "pTis (Paget): Enfermedad de Paget del pezón aislada" },
                            { value: "pt1mi", label: "pT1mi: Tumor <= 1 mm en dimensión mayor" },
                            { value: "pt1a", label: "pT1a: Tumor > 1 mm pero <= 5 mm" },
                            { value: "pt1b", label: "pT1b: Tumor > 5 mm pero <= 10 mm" },
                            { value: "pt1c", label: "pT1c: Tumor > 10 mm pero <= 20 mm" },
                            { value: "pt2", label: "pT2: Tumor > 20 mm pero <= 50 mm" },
                            { value: "pt3", label: "pT3: Tumor > 50 mm" },
                            { value: "pt4a", label: "pT4a: Extensión a la pared torácica" },
                            { value: "pt4b", label: "pT4b: Ulceración o nódulos satélites ipsilaterales en la piel" },
                            { value: "pt4c", label: "pT4c: Coexisten T4a y T4b" },
                            { value: "pt4d", label: "pT4d: Carcinoma inflamatorio" }
                        ]
                    },
                    {
                        id: "pn_category",
                        label: "Categoría pN",
                        type: "select",
                        options: [
                            { value: "pnx", label: "pN no asignado" },
                            { value: "pn0", label: "pN0: Sin metástasis regionales (o solo ITCs)" },
                            { value: "pn0_i_plus", label: "pN0 (i+): Solo células tumorales aisladas (< 0.2 mm)" },
                            { value: "pn1mi", label: "pN1mi: Micrometástasis (> 0.2 mm y <= 2.0 mm)" },
                            { value: "pn1a", label: "pN1a: Metástasis en 1 a 3 ganglios axilares (> 2.0 mm)" },
                            { value: "pn1b", label: "pN1b: Metástasis en ganglios mamarios internos ipsilaterales centinela" },
                            { value: "pn1c", label: "pN1c: Coexisten pN1a y pN1b" },
                            { value: "pn2a", label: "pN2a: Metástasis en 4 a 9 ganglios axilares" },
                            { value: "pn2b", label: "pN2b: Metástasis en ganglios mamarios internos clínicamente detectados" },
                            { value: "pn3a", label: "pN3a: Metástasis en 10 o más ganglios axilares, o infraclaviculares" },
                            { value: "pn3b", label: "pN3b: Metástasis axilares y mamarias internas combinadas" },
                            { value: "pn3c", label: "pN3c: Metástasis en ganglios supraclaviculares ipsilaterales" }
                        ]
                    },
                    {
                        id: "pm_category",
                        label: "Categoría pM",
                        type: "radio",
                        options: [
                            { value: "na", label: "No aplicable (no determinada a partir de la muestra)" },
                            { value: "pm1", label: "pM1: Metástasis a distancia confirmada patológicamente" }
                        ]
                    }
                ]
            },
            {
                name: "ESTUDIOS ESPECIALES (BIOMARCADORES DE MAMA)",
                fields: [
                    {
                        id: "er_status",
                        label: "Receptor de Estrógeno (ER)",
                        type: "radio",
                        options: [
                            { value: "positive", label: "Positivo (especificar %)", hasInput: true },
                            { value: "negative", label: "Negativo" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "pgr_status",
                        label: "Receptor de Progesterona (PgR)",
                        type: "radio",
                        options: [
                            { value: "positive", label: "Positivo (especificar %)", hasInput: true },
                            { value: "negative", label: "Negativo" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "her2_ihc",
                        label: "HER2 por Inmunohistoquímica (IHC)",
                        type: "radio",
                        options: [
                            { value: "score0", label: "Negativo (Score 0)" },
                            { value: "score1", label: "Negativo (Score 1+)" },
                            { value: "score2", label: "Equívoco (Score 2+)" },
                            { value: "score3", label: "Positivo (Score 3+)" }
                        ]
                    },
                    {
                        id: "her2_ish",
                        label: "HER2 por Hibridación In Situ (ISH)",
                        type: "radio",
                        options: [
                            { value: "negative", label: "Negativo (No amplificado)" },
                            { value: "positive", label: "Positivo (Amplificado)" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "ki67",
                        label: "Tasa de Proliferación Ki-67 (%)",
                        type: "number",
                        suffix: "%"
                    },
                    {
                        id: "comments",
                        label: "Comentarios Adicionales",
                        type: "text"
                    }
                ]
            }
        ]
    },
    esophagus: {
        id: "esophagus",
        title: "Protocolo Sinóptico: Esófago (Resección)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "radio",
                        options: [
                            { value: "endoscopic", label: "Resección endoscópica" },
                            { value: "esophagectomy", label: "Esofaguectomía" },
                            { value: "esophagogastrectomy", label: "Esofagogastrectomía" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true },
                            { value: "unspecified", label: "No especificado" }
                        ]
                    }
                ]
            },
            {
                name: "TUMOR",
                fields: [
                    {
                        id: "site",
                        label: "Sitio del Tumor (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        options: [
                            { value: "cervical", label: "Esófago cervical (proximal) (especificar)", hasInput: true },
                            { value: "mid_upper", label: "Esófago medio, esófago torácico superior (especificar)", hasInput: true },
                            { value: "mid_middle", label: "Esófago medio, esófago torácico medio (especificar)", hasInput: true },
                            { value: "mid_nos", label: "Esófago medio, no especificado (especificar)", hasInput: true },
                            { value: "distal", label: "Esófago distal (esófago torácico inferior) (especificar)", hasInput: true },
                            { value: "egj", label: "Unión esofagogástrica (UEG) (especificar)", hasInput: true },
                            { value: "proximal_stomach", label: "Estómago proximal / cardias (especificar)", hasInput: true },
                            { value: "other", label: "Otro (especificar)", hasInput: true },
                            { value: "nos", label: "Esófago, no especificado" }
                        ]
                    },
                    {
                        id: "junction_relationship",
                        label: "Relación del Tumor con la Unión Esofagogástrica (UEG)",
                        type: "radio",
                        options: [
                            { value: "entirely_esophagus", label: "El tumor está completamente en el esófago tubular sin comprometer la UEG" },
                            { value: "midpoint_distal", label: "El punto medio del tumor está en el esófago distal Y compromete la UEG" },
                            { value: "midpoint_egj", label: "El punto medio del tumor se encuentra en la UEG" },
                            { value: "midpoint_stomach", label: "El punto medio está a 2 cm o menos en el estómago proximal/cardias y compromete la UEG" },
                            { value: "unspecified", label: "No especificado" },
                            { value: "undetermined", label: "No se puede determinar (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "junction_distance",
                        label: "Distancia del centro del tumor a la UEG (cm)",
                        type: "number",
                        suffix: "cm"
                    },
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico",
                        type: "select",
                        options: [
                            { value: "adenocarcinoma", label: "Adenocarcinoma" },
                            { value: "adenoid_cystic", label: "Carcinoma quístico adenoide" },
                            { value: "mucoepidermoid", label: "Carcinoma mucoepidermoide" },
                            { value: "adenosquamous", label: "Carcinoma adenoescamoso" },
                            { value: "squamous_cell", label: "Carcinoma de células escamosas" },
                            { value: "basaloid_squamous", label: "Carcinoma de células escamosas basaloide" },
                            { value: "spindle_squamous", label: "Carcinoma de células escamosas de células fusiformes" },
                            { value: "verrucous_squamous", label: "Carcinoma de células escamosas verrugoso" },
                            { value: "undifferentiated", label: "Carcinoma indiferenciado" },
                            { value: "lymphoepithelioma", label: "Carcinoma tipo linfoepitelioma" },
                            { value: "large_cell_neuroendocrine", label: "Carcinoma neuroendocrino de células grandes" },
                            { value: "small_cell_neuroendocrine", label: "Carcinoma neuroendocrino de células pequeñas" },
                            { value: "neuroendocrine_pd", label: "Carcinoma neuroendocrino (pobremente diferenciado)" },
                            { value: "mixed_squamous_ne", label: "Carcinoma mixto de células escamosas - neuroendocrino" },
                            { value: "mixed_adenocarcinoma_ne", label: "Carcinoma mixto adenocarcinoma - neuroendocrino" },
                            { value: "mixed_adenocarcinoma_net", label: "Carcinoma mixto adenocarcinoma - tumor neuroendocrino" },
                            { value: "net_g1", label: "Tumor neuroendocrino G1, bien diferenciado" },
                            { value: "net_g2", label: "Tumor neuroendocrino G2, bien diferenciado" },
                            { value: "net_g3", label: "Tumor neuroendocrino G3, bien diferenciado" },
                            { value: "other_type", label: "Otro tipo histológico (especificar)", hasInput: true },
                            { value: "undetermined", label: "Carcinoma, tipo no determinado" }
                        ]
                    },
                    {
                        id: "grade",
                        label: "Grado Histológico",
                        type: "radio",
                        options: [
                            { value: "g1", label: "G1: Bien diferenciado" },
                            { value: "g2", label: "G2: Moderadamente diferenciado" },
                            { value: "g3", label: "G3: Pobremente diferenciado, indiferenciado" },
                            { value: "other", label: "Otro (especificar)", hasInput: true },
                            { value: "gx", label: "GX: No se puede evaluar" },
                            { value: "na", label: "No aplicable" }
                        ]
                    },
                    {
                        id: "size",
                        label: "Dimensión mayor del tumor (cm)",
                        type: "number",
                        suffix: "cm"
                    },
                    {
                        id: "additional_w",
                        label: "Dimensión adicional: Ancho (cm)",
                        type: "number",
                        suffix: "cm"
                    },
                    {
                        id: "additional_h",
                        label: "Dimensión adicional: Alto (cm)",
                        type: "number",
                        suffix: "cm"
                    },
                    {
                        id: "cannot_assess_size",
                        label: "No se puede determinar el tamaño (explicar)",
                        type: "text"
                    },
                    {
                        id: "extent",
                        label: "Extensión del Tumor (Profundidad de Invasión)",
                        type: "radio",
                        options: [
                            { value: "dysplasia", label: "Displasia de alto grado / Carcinoma in situ (limitado al epitelio)" },
                            { value: "lamina_propria", label: "Invade la lámina propia" },
                            { value: "muscularis_mucosae", label: "Invade la muscularis mucosae" },
                            { value: "submucosa", label: "Invade la submucosa" },
                            { value: "muscularis_propria", label: "Invade la muscularis propria" },
                            { value: "adventitia", label: "Invade la adventicia" },
                            { value: "adjacent", label: "Invade estructura(s) u órgano(s) adyacente(s) (especificar en comentario o campo extra)", hasInput: true },
                            { value: "no_primary", label: "Sin evidencia de tumor primario" }
                        ]
                    },
                    {
                        id: "treatment_effect",
                        label: "Efecto del Tratamiento Previo",
                        type: "radio",
                        options: [
                            { value: "no_therapy", label: "Sin terapia presúrgica conocida" },
                            { value: "score_0", label: "Presente, sin células tumorales viables (Respuesta Completa, Score 0)" },
                            { value: "score_1", label: "Presente, células aisladas o pequeños grupos (Respuesta Casi Completa, Score 1)" },
                            { value: "score_2", label: "Presente, regresión evidente pero mayor a células aisladas (Respuesta Parcial, Score 2)" },
                            { value: "present_nos", label: "Presente (no especificado)" },
                            { value: "score_3", label: "Ausente, cáncer residual extenso sin regresión (Respuesta Pobre/Nula, Score 3)" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "lymphovascular",
                        label: "Invasión Linfovascular",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "perineural",
                        label: "Invasión Perineural",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    }
                ]
            },
            {
                name: "MÁRGENES",
                fields: [
                    {
                        id: "margin_status",
                        label: "Estado de Márgenes para Carcinoma Invasivo",
                        type: "radio",
                        options: [
                            { value: "negative", label: "Todos los márgenes negativos para carcinoma invasivo" },
                            { value: "positive", label: "Carcinoma invasivo presente en el margen (positivo)" }
                        ]
                    },
                    {
                        id: "closest_margins",
                        label: "Margen(es) más cercano(s) (si es negativo)",
                        type: "checkbox",
                        dependsOn: { field: "margin_status", value: "negative" },
                        options: [
                            { value: "proximal", label: "Proximal (especificar)", hasInput: true },
                            { value: "distal", label: "Distal (especificar)", hasInput: true },
                            { value: "radial", label: "Radial (especificar)", hasInput: true },
                            { value: "mucosal", label: "Mucoso (especificar)", hasInput: true },
                            { value: "deep", label: "Profundo (especificar)", hasInput: true },
                            { value: "other", label: "Otro margen (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "margin_distance_val",
                        label: "Distancia al margen más cercano (especificar valor)",
                        type: "text",
                        dependsOn: { field: "margin_status", value: "negative" }
                    },
                    {
                        id: "involved_margins",
                        label: "Margen(es) Comprometido(s) (si es positivo)",
                        type: "checkbox",
                        dependsOn: { field: "margin_status", value: "positive" },
                        options: [
                            { value: "proximal", label: "Proximal (especificar)", hasInput: true },
                            { value: "distal", label: "Distal (especificar)", hasInput: true },
                            { value: "radial", label: "Radial (especificar)", hasInput: true },
                            { value: "mucosal", label: "Mucoso (especificar)", hasInput: true },
                            { value: "deep", label: "Profundo (especificar)", hasInput: true },
                            { value: "other", label: "Otro margen (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "margin_dysplasia",
                        label: "Estado de Márgenes para Displasia / Metaplasia Intestinal",
                        type: "checkbox",
                        options: [
                            { value: "negative", label: "Todos los márgenes negativos para displasia" },
                            { value: "low_grade_squamous", label: "Displasia escamosa de bajo grado presente en el margen" },
                            { value: "high_grade_squamous", label: "Displasia escamosa de alto grado presente en el margen" },
                            { value: "low_grade_glandular", label: "Displasia glandular de bajo grado presente en el margen" },
                            { value: "high_grade_glandular", label: "Displasia glandular de alto grado presente en el margen" },
                            { value: "barrett", label: "Metaplasia intestinal (Esófago de Barrett) sin displasia presente en el margen" }
                        ]
                    },
                    {
                        id: "margin_comments",
                        label: "Comentarios sobre Márgenes",
                        type: "text"
                    }
                ]
            },
            {
                name: "GANGLIOS LINFÁTICOS REGIONALES",
                fields: [
                    {
                        id: "node_status",
                        label: "Estado de los Ganglios Linfáticos Regionales",
                        type: "radio",
                        options: [
                            { value: "na", label: "No aplicable (no se enviaron ni encontraron ganglios)" },
                            { value: "present", label: "Ganglios linfáticos regionales presentes" }
                        ]
                    },
                    {
                        id: "nodes_positive",
                        label: "Número total de ganglios con metástasis / positivos (ej. '3')",
                        type: "text",
                        dependsOn: { field: "node_status", value: "present" }
                    },
                    {
                        id: "nodes_examined",
                        label: "Número total de ganglios examinados (ej. '15')",
                        type: "text",
                        dependsOn: { field: "node_status", value: "present" }
                    },
                    {
                        id: "node_comments",
                        label: "Comentarios sobre Ganglios",
                        type: "text"
                    }
                ]
            },
            {
                name: "METÁSTASIS A DISTANCIA",
                fields: [
                    {
                        id: "metastasis",
                        label: "Metástasis a Distancia",
                        type: "checkbox",
                        options: [
                            { value: "na", label: "No aplicable / Sin evidencia" },
                            { value: "non_regional_nodes", label: "Ganglios linfáticos no regionales (especificar)", hasInput: true },
                            { value: "liver", label: "Hígado (especificar)", hasInput: true },
                            { value: "other", label: "Otros sitios (especificar)", hasInput: true },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    }
                ]
            },
            {
                name: "CLASIFICACIÓN DE ESTADIO PATOLÓGICO (pTNM, AJCC 8.ª EDICIÓN)",
                fields: [
                    {
                        id: "tnm_descriptors",
                        label: "Descriptores TNM (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        options: [
                            { value: "na", label: "No aplicable (especificar)", hasInput: true },
                            { value: "m", label: "m (múltiples tumores primarios)" },
                            { value: "r", label: "r (recurrente)" },
                            { value: "y", label: "y (post-tratamiento)" }
                        ]
                    },
                    {
                        id: "pt_category",
                        label: "Categoría pT",
                        type: "select",
                        options: [
                            { value: "ptx", label: "pT no asignado" },
                            { value: "pt0", label: "pT0: Sin evidencia de tumor primario" },
                            { value: "ptis", label: "pTis: Displasia de alto grado (carcinoma in situ)" },
                            { value: "pt1a", label: "pT1a: Invade lámina propia o muscularis mucosae" },
                            { value: "pt1b", label: "pT1b: Invade submucosa" },
                            { value: "pt1_nos", label: "pT1 (subcategoría no determinada)" },
                            { value: "pt2", label: "pT2: Invade muscularis propria" },
                            { value: "pt3", label: "pT3: Invade adventicia" },
                            { value: "pt4a", label: "pT4a: Invade pleura, pericardio, vena ácigos, diafragma o peritoneo" },
                            { value: "pt4b", label: "pT4b: Invade aorta, cuerpo vertebral o vía aérea" },
                            { value: "pt4_nos", label: "pT4 (subcategoría no determinada)" }
                        ]
                    },
                    {
                        id: "pn_category",
                        label: "Categoría pN",
                        type: "select",
                        options: [
                            { value: "pnx", label: "pN no asignado" },
                            { value: "pn0", label: "pN0: Sin metástasis en ganglios regionales" },
                            { value: "pn1", label: "pN1: Metástasis en 1 a 2 ganglios regionales" },
                            { value: "pn2", label: "pN2: Metástasis en 3 a 6 ganglios regionales" },
                            { value: "pn3", label: "pN3: Metástasis en 7 o más ganglios regionales" }
                        ]
                    },
                    {
                        id: "pm_category",
                        label: "Categoría pM",
                        type: "radio",
                        options: [
                            { value: "na", label: "No aplicable (no determinada a partir de la muestra)" },
                            { value: "pm1", label: "pM1: Metástasis a distancia" }
                        ]
                    }
                ]
            },
            {
                name: "HALLAZGOS ADICIONALES",
                fields: [
                    {
                        id: "additional_findings",
                        label: "Hallazgos Adicionales (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        options: [
                            { value: "none", label: "Ninguno identificado" },
                            { value: "barrett", label: "Metaplasia intestinal (Esófago de Barrett)" },
                            { value: "low_grade_squamous", label: "Displasia escamosa de bajo grado" },
                            { value: "high_grade_squamous", label: "Displasia escamosa de alto grado" },
                            { value: "low_grade_glandular", label: "Displasia glandular de bajo grado" },
                            { value: "high_grade_glandular", label: "Displasia glandular de alto grado" },
                            { value: "esophagitis", label: "Esofagitis (especificar tipo)", hasInput: true },
                            { value: "gastritis", label: "Gastritis (especificar tipo)", hasInput: true },
                            { value: "other", label: "Otros hallazgos (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "comments",
                        label: "Comentarios / Notas Clínicas",
                        type: "text"
                    }
                ]
            }
        ]
    },
    appendix: {
        id: "appendix",
        title: "Protocolo Sinóptico: Apéndice (Resección)",
        targetField: "microDesc",
        sections: [
            {
                name: "ESPECÍMEN",
                fields: [
                    {
                        id: "procedure",
                        label: "Procedimiento Quirúrgico",
                        type: "radio",
                        options: [
                            { value: "appendectomy", label: "Apendicectomía" },
                            { value: "right_colectomy", label: "Colectomía derecha" },
                            { value: "cecectomy", label: "Cecectomía" },
                            { value: "other", label: "Otro procedimiento (especificar)", hasInput: true }
                        ]
                    }
                ]
            },
            {
                name: "TUMOR",
                fields: [
                    {
                        id: "site",
                        label: "Sitio del Tumor (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        options: [
                            { value: "proximal", label: "Mitad proximal del apéndice" },
                            { value: "distal", label: "Mitad distal del apéndice" },
                            { value: "diffuse", label: "Compromiso difuso del apéndice" },
                            { value: "other", label: "Otro sitio (especificar)", hasInput: true },
                            { value: "nos", label: "Apéndice, no especificado" }
                        ]
                    },
                    {
                        id: "base_involvement",
                        label: "Compromiso de la Base del Apéndice",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificado" },
                            { value: "present", label: "Presente" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "histologic_type",
                        label: "Tipo Histológico",
                        type: "select",
                        options: [
                            { value: "adenocarcinoma", label: "Adenocarcinoma" },
                            { value: "mucinous_adenocarcinoma", label: "Adenocarcinoma mucinoso" },
                            { value: "lamn", label: "Neoplasia mucinosa apendicular de bajo grado (LAMN)" },
                            { value: "hamn", label: "Neoplasia mucinosa apendicular de alto grado (HAMN)" },
                            { value: "signet_ring", label: "Carcinoma de células en anillo de sello" },
                            { value: "goblet", label: "Adenocarcinoma de células caliciformes (Goblet cell)" },
                            { value: "neuroendocrine_carcinoma", label: "Carcinoma neuroendocrino" },
                            { value: "large_cell_ne", label: "Carcinoma neuroendocrino de células grandes" },
                            { value: "small_cell_ne", label: "Carcinoma neuroendocrino de células pequeñas" },
                            { value: "mixed_ne_non_ne", label: "Neoplasia mixta neuroendocrina-no neuroendocrina (MiNEN)" },
                            { value: "medullary", label: "Carcinoma medular" },
                            { value: "squamous", label: "Carcinoma de células escamosas" },
                            { value: "adenosquamous", label: "Carcinoma adenoescamoso" },
                            { value: "undifferentiated", label: "Carcinoma indiferenciado" },
                            { value: "other_type", label: "Otro tipo histológico (especificar)", hasInput: true },
                            { value: "undetermined", label: "Carcinoma, tipo no determinado" }
                        ]
                    },
                    {
                        id: "grade",
                        label: "Grado Histológico",
                        type: "radio",
                        options: [
                            { value: "g1", label: "G1: Bien diferenciado" },
                            { value: "g2", label: "G2: Moderadamente diferenciado" },
                            { value: "g3", label: "G3: Pobremente diferenciado" },
                            { value: "other", label: "Otro (especificar)", hasInput: true },
                            { value: "gx", label: "GX: No se puede evaluar" },
                            { value: "na", label: "No aplicable" }
                        ]
                    },
                    {
                        id: "size",
                        label: "Dimensión mayor del tumor (cm)",
                        type: "number",
                        suffix: "cm"
                    },
                    {
                        id: "additional_w",
                        label: "Dimensión adicional: Ancho (cm)",
                        type: "number",
                        suffix: "cm"
                    },
                    {
                        id: "additional_h",
                        label: "Dimensión adicional: Alto (cm)",
                        type: "number",
                        suffix: "cm"
                    },
                    {
                        id: "cannot_assess_size",
                        label: "No se puede determinar el tamaño (explicar)",
                        type: "text"
                    },
                    {
                        id: "deposits",
                        label: "Depósitos Tumorales",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificados" },
                            { value: "present", label: "Presentes (especificar número)", hasInput: true }
                        ]
                    },
                    {
                        id: "extent",
                        label: "Extensión del Tumor (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        options: [
                            { value: "lamina_propria", label: "El tumor invade la lámina propia o muscularis mucosa" },
                            { value: "mucin_submucosa", label: "Mucina acelular invade la submucosa" },
                            { value: "tumor_submucosa", label: "El tumor invade la submucosa" },
                            { value: "mucin_muscularis", label: "Mucina acelular invade la muscularis propria" },
                            { value: "tumor_muscularis", label: "El tumor invade la muscularis propria" },
                            { value: "mucin_subserosa", label: "Mucina acelular invade la subserosa o el mesoapéndice sin extenderse a la serosa" },
                            { value: "tumor_subserosa", label: "El tumor invade a través de la muscularis propria hacia la subserosa o el mesoapéndice sin extenderse a la serosa" },
                            { value: "mucin_serosa", label: "Mucina acelular invade el peritoneo visceral (serosa)" },
                            { value: "tumor_serosa", label: "El tumor invade el peritoneo visceral (serosa)" },
                            { value: "adjacent", label: "El tumor invade directamente órgano(s) o estructura(s) adyacente(s) (especificar)", hasInput: true },
                            { value: "undetermined", label: "No se puede determinar" },
                            { value: "no_primary", label: "Sin evidencia de tumor primario" }
                        ]
                    },
                    {
                        id: "lymphovascular",
                        label: "Invasión Linfovascular",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    },
                    {
                        id: "perineural",
                        label: "Invasión Perineural",
                        type: "radio",
                        options: [
                            { value: "not_identified", label: "No identificada" },
                            { value: "present", label: "Presente" },
                            { value: "undetermined", label: "No se puede determinar" }
                        ]
                    }
                ]
            },
            {
                name: "MÁRGENES",
                fields: [
                    {
                        id: "margin_status_invasive",
                        label: "Estado de Márgenes para Carcinoma Invasivo",
                        type: "radio",
                        options: [
                            { value: "negative", label: "Todos los márgenes negativos para carcinoma invasivo" },
                            { value: "positive", label: "Carcinoma invasivo presente en el margen (positivo)" }
                        ]
                    },
                    {
                        id: "mesenteric_distance",
                        label: "Distancia al margen mesentérico más cercano (especificar en cm o mm)",
                        type: "text",
                        dependsOn: { field: "margin_status_invasive", value: "negative" }
                    },
                    {
                        id: "involved_margins_invasive",
                        label: "Margen(es) Comprometido(s) por Carcinoma Invasivo (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        dependsOn: { field: "margin_status_invasive", value: "positive" },
                        options: [
                            { value: "proximal", label: "Proximal" },
                            { value: "mesenteric", label: "Mesentérico" },
                            { value: "other", label: "Otro margen (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "margin_status_non_invasive",
                        label: "Estado de Márgenes para Tumor No Invasivo (incluye LAMN, HAMN, displasia)",
                        type: "checkbox",
                        options: [
                            { value: "negative", label: "Todos los márgenes negativos para tumor no invasivo" },
                            { value: "low_grade_proximal", label: "Displasia de bajo grado presente en el margen proximal" },
                            { value: "high_grade_proximal", label: "Displasia de alto grado presente en el margen proximal" },
                            { value: "lamn_present", label: "Neoplasia mucinosa apendicular de bajo grado (LAMN) presente en el margen" },
                            { value: "hamn_present", label: "Neoplasia mucinosa apendicular de alto grado (HAMN) presente en el margen" }
                        ]
                    },
                    {
                        id: "margin_comments",
                        label: "Comentarios sobre Márgenes",
                        type: "text"
                    }
                ]
            },
            {
                name: "GANGLIOS LINFÁTICOS REGIONALES",
                fields: [
                    {
                        id: "node_status",
                        label: "Estado de los Ganglios Linfáticos Regionales",
                        type: "radio",
                        options: [
                            { value: "na", label: "No aplicable (no se enviaron ni encontraron ganglios)" },
                            { value: "present", label: "Ganglios linfáticos regionales presentes" }
                        ]
                    },
                    {
                        id: "nodes_positive",
                        label: "Número total de ganglios con metástasis / positivos (ej. '1')",
                        type: "text",
                        dependsOn: { field: "node_status", value: "present" }
                    },
                    {
                        id: "nodes_examined",
                        label: "Número total de ganglios examinados (ej. '12')",
                        type: "text",
                        dependsOn: { field: "node_status", value: "present" }
                    },
                    {
                        id: "node_comments",
                        label: "Comentarios sobre Ganglios",
                        type: "text"
                    }
                ]
            },
            {
                name: "METÁSTASIS A DISTANCIA",
                fields: [
                    {
                        id: "metastasis",
                        label: "Metástasis a Distancia",
                        type: "checkbox",
                        options: [
                            { value: "na", label: "No aplicable / Sin evidencia" },
                            { value: "non_regional_nodes", label: "Ganglios linfáticos no regionales (especificar)", hasInput: true },
                            { value: "mucin_only", label: "Mucina acelular intraperitoneal sin células tumorales identificables" },
                            { value: "peritoneal_metastasis", label: "Metástasis intraperitoneal celular (depósitos con células tumorales)" },
                            { value: "ovary", label: "Ovario (especificar)", hasInput: true },
                            { value: "fallopian", label: "Trompa de Falopio (especificar)", hasInput: true },
                            { value: "spleen", label: "Bazo (especificar)", hasInput: true },
                            { value: "liver", label: "Hígado (especificar)", hasInput: true },
                            { value: "lung", label: "Pulmón (especificar)", hasInput: true },
                            { value: "other", label: "Otro sitio extraperitoneal (especificar)", hasInput: true }
                        ]
                    }
                ]
            },
            {
                name: "CLASIFICACIÓN DE ESTADIO PATOLÓGICO (pTNM, AJCC 9.ª EDICIÓN)",
                fields: [
                    {
                        id: "tnm_descriptors",
                        label: "Descriptores TNM (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        options: [
                            { value: "na", label: "No aplicable" },
                            { value: "m", label: "m (múltiples tumores primarios)" },
                            { value: "r", label: "r (recurrente)" },
                            { value: "y", label: "y (post-tratamiento)" }
                        ]
                    },
                    {
                        id: "pt_category",
                        label: "Categoría pT",
                        type: "select",
                        options: [
                            { value: "ptx", label: "pT no asignado" },
                            { value: "pt0", label: "pT0: Sin evidencia de tumor primario" },
                            { value: "ptis", label: "pTis: Carcinoma in situ (intramucosal)" },
                            { value: "ptis_lamn", label: "pTis (LAMN): Neoplasia mucinosa de bajo grado confinada a muscularis propria" },
                            { value: "pt1", label: "pT1: Invade submucosa" },
                            { value: "pt2", label: "pT2: Invade muscularis propria" },
                            { value: "pt3", label: "pT3: Invade subserosa o mesoapéndice" },
                            { value: "pt4a", label: "pT4a: Invade peritoneo visceral (incluye mucina/células en serosa)" },
                            { value: "pt4b", label: "pT4b: Invade directamente otros órganos o estructuras" },
                            { value: "pt4_nos", label: "pT4 (subcategoría no determinada)" }
                        ]
                    },
                    {
                        id: "pn_category",
                        label: "Categoría pN",
                        type: "select",
                        options: [
                            { value: "pnx", label: "pN no asignado" },
                            { value: "pn0", label: "pN0: Sin metástasis regionales" },
                            { value: "pn1a", label: "pN1a: Metástasis en 1 ganglio regional" },
                            { value: "pn1b", label: "pN1b: Metástasis en 2 a 3 ganglios regionales" },
                            { value: "pn1c", label: "pN1c: Sin metástasis ganglionares, pero depósitos tumorales en subserosa/mesenterio" },
                            { value: "pn1_nos", label: "pN1 (subcategoría no determinada)" },
                            { value: "pn2", label: "pN2: Metástasis en 4 o más ganglios regionales" }
                        ]
                    },
                    {
                        id: "pm_category",
                        label: "Categoría pM",
                        type: "select",
                        options: [
                            { value: "na", label: "No aplicable (no determinada a partir de la muestra)" },
                            { value: "pm1a", label: "pM1a: Mucina acelular intraperitoneal aislada" },
                            { value: "pm1b", label: "pM1b: Metástasis intraperitoneal celular únicamente" },
                            { value: "pm1c", label: "pM1c: Metástasis a sitios extraperitoneales (fuera del peritoneo)" },
                            { value: "pm1_nos", label: "pM1 (subcategoría no determinada)" }
                        ]
                    }
                ]
            },
            {
                name: "HALLAZGOS ADICIONALES",
                fields: [
                    {
                        id: "additional_findings",
                        label: "Hallazgos Adicionales (seleccionar todos los que apliquen)",
                        type: "checkbox",
                        options: [
                            { value: "none", label: "Ninguno identificado" },
                            { value: "appendicitis", label: "Apendicitis" },
                            { value: "perforation", label: "Perforación (fuera del tumor)" },
                            { value: "uc", label: "Colitis ulcerativa" },
                            { value: "crohn", label: "Enfermedad de Crohn" },
                            { value: "diverticulosis", label: "Diverticulosis" },
                            { value: "serrated", label: "Lesión/adenoma/pólipo serrado sésil" },
                            { value: "other", label: "Otros hallazgos (especificar)", hasInput: true }
                        ]
                    },
                    {
                        id: "comments",
                        label: "Comentarios / Notas Clínicas",
                        type: "text"
                    }
                ]
            }
        ]
    }
};

// Función de compilado del reporte final en base al estado de los inputs
export function compileSynopticReport(schemaId, state) {
    const schema = synopticSchemas[schemaId];
    if (!schema) return "";

    let text = `<b>RESUMEN DE CASO: ${schema.title.toUpperCase()}</b>\n\n`;

    schema.sections.forEach(section => {
        let sectionHasData = false;
        let sectionText = `<b>${section.name}</b>\n`;

        section.fields.forEach(field => {
            // Check dependency
            if (field.dependsOn) {
                const depVal = state[field.dependsOn.field];
                if (field.dependsOn.value && depVal !== field.dependsOn.value) return;
                if (field.dependsOn.values && !field.dependsOn.values.includes(depVal)) return;
            }

            const val = state[field.id];
            if (val === undefined || val === null || val === "") return;

            sectionHasData = true;

            if (field.type === "radio" || field.type === "select") {
                const opt = field.options.find(o => o.value === val);
                    let label = opt.label;
                    if (opt.hasInput) {
                        const extra = state[`${field.id}_extra`] || "";
                        if (label.includes("(especificar)") || label.includes("(explicar)")) {
                            label = label.replace("(especificar)", extra).replace("(explicar)", extra);
                        } else {
                            label += `: ${extra}`;
                        }
                    }
                    sectionText += `• ${field.label}: ${label}\n`;
                }
            } else if (field.type === "checkbox") {
                if (Array.isArray(val) && val.length > 0) {
                    let labels = val.map(v => {
                        const opt = field.options.find(o => o.value === v);
                        if (opt) {
                            let label = opt.label;
                            if (opt.hasInput) {
                                const extra = state[`${field.id}_${v}_extra`] || "";
                                if (label.includes("(especificar tipo)") || label.includes("(especificar)")) {
                                    label = label.replace("(especificar tipo)", extra).replace("(especificar)", extra);
                                } else {
                                    label += `: ${extra}`;
                                }
                            }
                            return label;
                        }
                        return v;
                    });
                    sectionText += `• ${field.label}: ${labels.join(", ")}\n`;
                }
            } else if (field.type === "number") {
                const suffix = field.suffix || "";
                sectionText += `• ${field.label}: ${val} ${suffix}\n`;
            } else if (field.type === "text") {
                sectionText += `• ${field.label}: ${val}\n`;
            }
        });

        if (sectionHasData) {
            text += sectionText + `\n`;
        }
    });

    return text.trim();
}
