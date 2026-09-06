true = True
false = False
null = None
# -*- coding: utf-8 -*-
# ColoRectal Resection Schema Builder
def build_colorectal_resection():
    return {
    "id": "colorectal_resection",
    "title": "Protocolo Sinóptico: Colon y Recto (Resección) - CAP v4.4.0.1 / AJCC 8va Ed.",
    "targetField": "microDesc",
    "sections": [
        {
            "name": "PROCEDIMIENTO Y ESPECÍMEN",
            "fields": [
                {
                    "id": "procedure",
                    "label": "Procedimiento Quirúrgico",
                    "type": "radio",
                    "options": [
                        {
                            "value": "right_hemicolectomy",
                            "label": "Hemicolectomía derecha"
                        },
                        {
                            "value": "transverse_colectomy",
                            "label": "Colectomía transversa"
                        },
                        {
                            "value": "left_hemicolectomy",
                            "label": "Hemicolectomía izquierda"
                        },
                        {
                            "value": "sigmoidectomy",
                            "label": "Sigmoidectomía"
                        },
                        {
                            "value": "lar",
                            "label": "Resección anterior baja (LAR)"
                        },
                        {
                            "value": "total_colectomy",
                            "label": "Colectomía total abdominal"
                        },
                        {
                            "value": "apr",
                            "label": "Resección abdominoperineal (APR)"
                        },
                        {
                            "value": "proctocolectomy",
                            "label": "Proctocolectomía total"
                        },
                        {
                            "value": "cecectomy",
                            "label": "Resección cecal (cequectomía)"
                        },
                        {
                            "value": "other",
                            "label": "Otro procedimiento (especificar)",
                            "hasInput": true
                        },
                        {
                            "value": "unspecified",
                            "label": "No especificado"
                        }
                    ],
                    "helpText": "Indica el procedimiento resectivo. En neoplasias rectales (LAR y APR), la técnica de escisión total del mesorrecto (TME) es el determinante oncológico estándar para el control locorregional y la prevención de recidivas."
                },
                {
                    "id": "mesorectal_envelope",
                    "label": "Evaluación Macroscópica del Mesorrecto (Obligatorio en cáncer de recto)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "na",
                            "label": "No aplicable (neoplasia de colon no rectal)"
                        },
                        {
                            "value": "complete",
                            "label": "Completo (Grado Quirke 1: mesorrecto intacto, liso, sin defectos >5 mm, sin exponer muscular propia)"
                        },
                        {
                            "value": "near_complete",
                            "label": "Casi completo (Grado Quirke 2: defectos moderados >5 mm, sin visualizar muscular propia)"
                        },
                        {
                            "value": "incomplete",
                            "label": "Incompleto (Grado Quirke 3: defectos profundos con exposición de muscular propia, margen circunferencial muy irregular)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No determinado (explicar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "(Nota A del CAP): Criterios de Quirke. Evalúa la calidad técnica de la escisión del mesorrecto fresca no peritonealizada. Un mesorrecto incompleto triplica el riesgo de recurrencia local (del 8% al 25%). Se califica según el área de peor calidad observada."
                }
            ]
        },
        {
            "name": "CARACTERÍSTICAS DEL TUMOR",
            "fields": [
                {
                    "id": "tumor_site",
                    "label": "Sitio Anatómico del Tumor (seleccionar todos los que apliquen)",
                    "type": "checkbox",
                    "options": [
                        {
                            "value": "cecum",
                            "label": "Ciego"
                        },
                        {
                            "value": "ileocecal_valve",
                            "label": "Válvula ileocecal"
                        },
                        {
                            "value": "ascending_colon",
                            "label": "Colon ascendente"
                        },
                        {
                            "value": "hepatic_flexure",
                            "label": "Ángulo hepático"
                        },
                        {
                            "value": "transverse_colon",
                            "label": "Colon transverso"
                        },
                        {
                            "value": "splenic_flexure",
                            "label": "Ángulo esplénico"
                        },
                        {
                            "value": "descending_colon",
                            "label": "Colon descendente"
                        },
                        {
                            "value": "sigmoid_colon",
                            "label": "Colon sigmoides"
                        },
                        {
                            "value": "rectosigmoid",
                            "label": "Unión rectosigmoidea"
                        },
                        {
                            "value": "rectum",
                            "label": "Recto"
                        },
                        {
                            "value": "colon_nos",
                            "label": "Colon, no especificado"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No determinado (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "(Nota B del CAP): Define el drenaje linfático regional y las asociaciones genómicas. El colon derecho tiene mayor frecuencia de inestabilidad de microsatélites (MSI-H), mutaciones BRAF V600E y vía serrada. El colon izquierdo presenta mayor inestabilidad cromosómica (CIN) y mutaciones KRAS/TP53."
                },
                {
                    "id": "rectal_tumor_location",
                    "label": "Localización del Tumor Rectal respecto a la Reflexión Peritoneal Anterior",
                    "type": "radio",
                    "options": [
                        {
                            "value": "na",
                            "label": "No aplicable (tumor de colon no rectal)"
                        },
                        {
                            "value": "above",
                            "label": "Completamente por encima de la reflexión peritoneal anterior"
                        },
                        {
                            "value": "below",
                            "label": "Completamente por debajo de la reflexión peritoneal anterior"
                        },
                        {
                            "value": "straddles",
                            "label": "Cruza o cabalga (straddles) la reflexión peritoneal anterior"
                        },
                        {
                            "value": "unspecified",
                            "label": "No especificado"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar (explicar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "(Nota B del CAP): La reflexión peritoneal separa el recto peritoneal (con serosa anterior y lateral) del recto subperitoneal (desprovisto de serosa, rodeado de mesorrecto circunferencial con alto riesgo de invasión del margen CRM)."
                },
                {
                    "id": "histologic_type",
                    "label": "Tipo Histológico (Clasificación OMS 5ta Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "adenocarcinoma",
                            "label": "Adenocarcinoma, no especificado de otra manera (convencional)"
                        },
                        {
                            "value": "mucinous",
                            "label": "Adenocarcinoma mucinoso (>50% de mucina extracelular)"
                        },
                        {
                            "value": "signet_ring",
                            "label": "Adenocarcinoma de células en anillo de sello (>50% de células en anillo de sello)"
                        },
                        {
                            "value": "poorly_cohesive",
                            "label": "Carcinoma pobremente cohesivo (incluye anillo de sello y otras variantes)"
                        },
                        {
                            "value": "medullary",
                            "label": "Carcinoma medular (sólido, abundante infiltrado linfoide, pushing border)"
                        },
                        {
                            "value": "serrated",
                            "label": "Adenocarcinoma serrado"
                        },
                        {
                            "value": "micropapillary",
                            "label": "Adenocarcinoma micropapilar (alta invasión linfática y ganglionar)"
                        },
                        {
                            "value": "adenoma_like",
                            "label": "Adenocarcinoma tipo adenoma-like (bien diferenciado)"
                        },
                        {
                            "value": "adenosquamous",
                            "label": "Carcinoma adenoescamoso"
                        },
                        {
                            "value": "undifferentiated",
                            "label": "Carcinoma indiferenciado, NOS"
                        },
                        {
                            "value": "sarcomatoid",
                            "label": "Carcinoma con componente sarcomatoide"
                        },
                        {
                            "value": "large_cell_ne",
                            "label": "Carcinoma neuroendocrino de células grandes"
                        },
                        {
                            "value": "small_cell_ne",
                            "label": "Carcinoma neuroendocrino de células pequeñas"
                        },
                        {
                            "value": "minen",
                            "label": "Neoplasia mixta neuroendocrina - no neuroendocrina (MiNEN) (especificar componentes)",
                            "hasInput": true
                        },
                        {
                            "value": "other",
                            "label": "Otro tipo histológico (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "(Nota C del CAP): El adenocarcinoma mucinoso requiere >=50% del volumen tumoral formado por lagos de mucina. El carcinoma medular se compone de sábanas sincitiales con marcada atipia, abundantes linfocitos intratumorales y borde expansivo no infiltrativo; se asocia típicamente a dMMR/MSI-H o Síndrome de Lynch y confiere buen pronóstico inicial. MiNEN exige al menos 30% de cada componente."
                },
                {
                    "id": "histologic_grade",
                    "label": "Grado Histológico (Diferenciación Glandular)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "low_grade",
                            "label": "Bajo grado (Bien a moderadamente diferenciado: >= 50% de formación glandular)"
                        },
                        {
                            "value": "high_grade",
                            "label": "Alto grado (Pobremente diferenciado a indiferenciado: < 50% de formación glandular)"
                        },
                        {
                            "value": "cannot_assess",
                            "label": "No puede ser evaluado / No aplicable"
                        }
                    ],
                    "helpText": "(Nota D del CAP): Sistema graduado de 2 niveles recomendado por la OMS. Se fundamenta en el porcentaje de formación glandular tubular. Los tumores MSI-H frecuentemente tienen aspecto de alto grado arquitectural pero comportamiento indolente."
                },
                {
                    "id": "tumor_size_greatest",
                    "label": "Dimensión Mayor del Tumor (cm)",
                    "type": "number",
                    "suffix": "cm",
                    "helpText": "Medición macroscópica de la mayor dimensión tumoral invasora."
                },
                {
                    "id": "tumor_size_add",
                    "label": "Dimensiones Adicionales (cm x cm)",
                    "type": "text",
                    "helpText": "Dimensiones secundarias (ancho y espesor en cm)."
                },
                {
                    "id": "macroscopic_perforation",
                    "label": "Perforación Macroscópica del Tumor",
                    "type": "radio",
                    "options": [
                        {
                            "value": "not_identified",
                            "label": "No identificada"
                        },
                        {
                            "value": "present_tumor",
                            "label": "Presente en el lecho tumoral"
                        },
                        {
                            "value": "present_not_tumor",
                            "label": "Presente en intestino adyacente (no en el tumor)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota F del CAP): La perforación en el lecho tumoral que comunica con la cavidad peritoneal cataloga al caso como pT4a y representa un riesgo muy alto de carcinomatosis y siembra peritoneal."
                }
            ]
        },
        {
            "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN PATOLÓGICA (pTNM)",
            "fields": [
                {
                    "id": "pt_category",
                    "label": "Tumor Primario (pT - AJCC 8va Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "ptx",
                            "label": "pTX: No puede ser evaluado"
                        },
                        {
                            "value": "pt0",
                            "label": "pT0: Sin evidencia de tumor primario"
                        },
                        {
                            "value": "ptis",
                            "label": "pTis: Carcinoma in situ (intramucoso: confinado a lámina propia o muscularis mucosae)"
                        },
                        {
                            "value": "pt1",
                            "label": "pT1: El tumor invade la submucosa"
                        },
                        {
                            "value": "pt2",
                            "label": "pT2: El tumor invade la muscular propia"
                        },
                        {
                            "value": "pt3",
                            "label": "pT3: El tumor invade a través de la muscular propia hacia tejidos pericolónicos / perirrectales / subserosa"
                        },
                        {
                            "value": "pt4a",
                            "label": "pT4a: El tumor penetra la superficie del peritoneo visceral (serosa)"
                        },
                        {
                            "value": "pt4b",
                            "label": "pT4b: El tumor invade directamente o está adherente a otros órganos o estructuras"
                        }
                    ],
                    "helpText": "(Nota E del CAP): Criterios AJCC 8va Edición. En pT4a, se requiere que las células tumorales alcancen la superficie mesotelial peritoneal visceral libre, con reacción mesotelial, fibrina o células exfoliadas. La invasión de grasa subserosa sin romper peritoneo permanece en pT3."
                },
                {
                    "id": "nodes_examined",
                    "label": "Total de Ganglios Linfáticos Regionales Examinados",
                    "type": "number",
                    "helpText": "(Nota E del CAP): Se exige un MÍNIMO de 12 ganglios linfáticos regionales examinados para clasificar confiablemente a un paciente como pN0. Con menos de 12 ganglios se incrementa el riesgo de subestadificación diagnóstica."
                },
                {
                    "id": "nodes_positive",
                    "label": "Número de Ganglios Linfáticos con Metástasis",
                    "type": "number",
                    "helpText": "Número de ganglios con metástasis microscópica o macroscópica (>0.2 mm). Las células tumorales aisladas (ITC <=0.2 mm) se clasifican como pN0(i+)."
                },
                {
                    "id": "extranodal_extension",
                    "label": "Extensión Extranodal (ENE)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "not_identified",
                            "label": "No identificada"
                        },
                        {
                            "value": "present",
                            "label": "Presente (ruptura capsular e invasión a grasa perinodal)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "Invasión tumoral más allá de la cápsula ganglionar hacia la grasa circundante. Factor pronóstico independiente de menor sobrevida libre de enfermedad."
                },
                {
                    "id": "tumor_deposits",
                    "label": "Depósitos Tumorales Satélites (Pericolónicos / Perirrectales)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "none",
                            "label": "No identificados"
                        },
                        {
                            "value": "present",
                            "label": "Presentes (especificar cantidad)",
                            "hasInput": true
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No determinado"
                        }
                    ],
                    "helpText": "(Nota L del CAP): Focos microscópicos discretos de tumor en grasa pericolónica/perirrectal dentro del territorio de drenaje, sin evidencia de ganglio residual, pared vascular ni nervio. Si todos los ganglios regionales son negativos (0 ganglios metastásicos) pero hay depósitos tumorales, se clasifica como pN1c."
                },
                {
                    "id": "pn_category",
                    "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "pnx",
                            "label": "pNX: No pueden ser evaluados"
                        },
                        {
                            "value": "pn0",
                            "label": "pN0: Sin metástasis en ganglios linfáticos regionales"
                        },
                        {
                            "value": "pn1a",
                            "label": "pN1a: Metástasis en 1 ganglio regional"
                        },
                        {
                            "value": "pn1b",
                            "label": "pN1b: Metástasis en 2 a 3 ganglios regionales"
                        },
                        {
                            "value": "pn1c",
                            "label": "pN1c: Sin ganglios metastásicos, pero con depósito(s) tumoral(es) satélite(s)"
                        },
                        {
                            "value": "pn2a",
                            "label": "pN2a: Metástasis en 4 a 6 ganglios regionales"
                        },
                        {
                            "value": "pn2b",
                            "label": "pN2b: Metástasis en 7 o más ganglios regionales"
                        }
                    ],
                    "helpText": "Categorización según el número absoluto de ganglios metastásicos y la presencia de depósitos satélites (pN1c)."
                },
                {
                    "id": "pm_category",
                    "label": "Metástasis a Distancia (pM - AJCC 8va Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "na",
                            "label": "No aplicable (estudio microscópico patológico no disponible)"
                        },
                        {
                            "value": "pm1a",
                            "label": "pM1a: Metástasis en 1 solo órgano o sitio sin metástasis peritoneal"
                        },
                        {
                            "value": "pm1b",
                            "label": "pM1b: Metástasis en >1 órgano o sitio sin metástasis peritoneal"
                        },
                        {
                            "value": "pm1c",
                            "label": "pM1c: Metástasis en superficie peritoneal (con o sin otros órganos)"
                        }
                    ],
                    "helpText": "pM1c denota carcinomatosis peritoneal, la cual confiere la tasa de sobrevida más baja en estadio IV."
                }
            ]
        },
        {
            "name": "MÁRGENES DE RESECCIÓN",
            "fields": [
                {
                    "id": "margin_proximal",
                    "label": "Margen Quirúrgico Proximal",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometido (especificar distancia en mm/cm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved",
                            "label": "Comprometido por carcinoma invasor"
                        }
                    ],
                    "helpText": "(Nota K del CAP): Margen tubular proximal. Consignar distancia libre al carcinoma invasor o a displasia de alto grado."
                },
                {
                    "id": "margin_distal",
                    "label": "Margen Quirúrgico Distal",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometido (especificar distancia en mm/cm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved",
                            "label": "Comprometido por carcinoma invasor"
                        }
                    ],
                    "helpText": "(Nota K del CAP): Margen tubular distal. En LAR/APR, un margen libre distal microscópico >= 1 cm tras fijación es oncológicamente adecuado."
                },
                {
                    "id": "margin_crm",
                    "label": "Margen Radial / Circunferencial (CRM / Fascia Mesorrectal / Pericólica)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "na",
                            "label": "No aplicable (segmento totalmente cubierto por peritoneo)"
                        },
                        {
                            "value": "uninvolved_gt_1mm",
                            "label": "No comprometido: Carcinoma invasor a más de 1.0 mm del margen entintado (especificar distancia en mm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved_lte_1mm",
                            "label": "COMPROMETIDO: Carcinoma invasor o depósito tumoral a 1.0 mm o menos (<=1.0 mm) de la tinta (especificar distancia en mm)",
                            "hasInput": true
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota K del CAP): Criterio internacional de CRM: Se considera POSITIVO (R1) si el tumor invasor, un depósito tumoral o un ganglio con invasión extracapsular dista 1.0 mm o menos (<=1.0 mm) de la tinta. Es el predictor independiente más potente de recurrencia locorregional en cáncer rectal y colon retroperitoneal."
                }
            ]
        },
        {
            "name": "INVASIONES Y BROTACIÓN TUMORAL (TUMOR BUDDING)",
            "fields": [
                {
                    "id": "lvi_small_vessel",
                    "label": "Invasión Linfática (Pequeños Vasos / Capilares)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "not_identified",
                            "label": "No identificada"
                        },
                        {
                            "value": "present",
                            "label": "Presente"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota G del CAP): Nidos tumorales dentro de canales endoteliales linfáticos o capilares. Distinguir de artefactos de retracción mediante visualización de endotelio verdadero."
                },
                {
                    "id": "lvi_large_vessel",
                    "label": "Invasión Venosa (Grandes Vasos / EMVI)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "not_identified",
                            "label": "No identificada"
                        },
                        {
                            "value": "intramural",
                            "label": "Presente intramural (dentro de la muscular propia)"
                        },
                        {
                            "value": "extramural_emvi",
                            "label": "Presente EXTRAMURAL (EMVI: venas del tejido adiposo subseroso / pericolónico)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota G del CAP): La Invasión Venosa Extramural (EMVI) es un predictor independiente de metástasis hepáticas hematógenas y sobrevida disminuida. Se reconoce por nidos tumorales rodeados de fibras musculares vasculares elásticas (tinción elástica de Verhoeff-Van Gieson)."
                },
                {
                    "id": "perineural_invasion",
                    "label": "Invasión Perineural (PNI)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "not_identified",
                            "label": "No identificada"
                        },
                        {
                            "value": "present",
                            "label": "Presente"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota G del CAP): Células tumorales dentro del espacio perineural o a lo largo del trayecto de filetes nerviosos. Factor pronóstico adverso de recidiva locorregional."
                },
                {
                    "id": "tumor_budding",
                    "label": "Brotación Tumoral (Tumor Budding - Consenso ITBCC 2016)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "bd1",
                            "label": "Bajo grado (Bd1: 0 a 4 brotes por campo hotspot de 0.785 mm²)"
                        },
                        {
                            "value": "bd2",
                            "label": "Grado intermedio (Bd2: 5 a 9 brotes por campo hotspot de 0.785 mm²)"
                        },
                        {
                            "value": "bd3",
                            "label": "Alto grado (Bd3: 10 o más brotes por campo hotspot de 0.785 mm²)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No determinado (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "(Nota H del CAP): Células aisladas o grupos <=4 células en el frente invasor. Evaluado en un área de hotspot de 0.785 mm² (campo 20x con ocular estándar FN 22mm). En cánceres T1 (pólipos resecados), Bd2 y Bd3 son factores de alto riesgo de metástasis ganglionar que ameritan colectomía oncológica. En estadio II, Bd3 es indicación de quimioterapia adyuvante."
                }
            ]
        },
        {
            "name": "RESPUESTA TERAPÉUTICA Y ESTUDIOS ESPECIALES",
            "fields": [
                {
                    "id": "treatment_effect",
                    "label": "Efecto del Tratamiento Neoadyuvante (Sistema Ryan / CAP)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "no_therapy",
                            "label": "Sin tratamiento neoadyuvante conocido"
                        },
                        {
                            "value": "score_0",
                            "label": "Score 0 (Respuesta completa: sin células tumorales viables detectables, respuesta patológica completa pCR)"
                        },
                        {
                            "value": "score_1",
                            "label": "Score 1 (Respuesta moderada: células tumorales escasas aisladas o grupos microscópicos dispersos)"
                        },
                        {
                            "value": "score_2",
                            "label": "Score 2 (Respuesta mínima: cáncer residual prominente superado por fibrosis/desmoplasia)"
                        },
                        {
                            "value": "score_3",
                            "label": "Score 3 (Pobre o nula respuesta: extenso cáncer residual sin fibrosis destructiva franca)"
                        }
                    ],
                    "helpText": "(Nota J del CAP): Sistema de graduación de regresión tumoral del CAP/Ryan. La respuesta patológica completa (Score 0) confiere un excelente pronóstico de sobrevida global a largo plazo."
                },
                {
                    "id": "mmr_ihc",
                    "label": "Reparación de Apareamiento de Bases (MMR por Inmunohistoquímica)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "intact_pmmr",
                            "label": "Expresión conservada en las 4 proteínas (pMMR: MLH1, MSH2, MSH6 y PMS2 nucleares positivas)"
                        },
                        {
                            "value": "loss_dmmr",
                            "label": "PÉRDIDA de expresión nuclear (dMMR - especificar proteínas ausentes)",
                            "hasInput": true
                        },
                        {
                            "value": "pending",
                            "label": "En proceso / Pendiente"
                        },
                        {
                            "value": "not_performed",
                            "label": "No realizado"
                        }
                    ],
                    "helpText": "(Nota M del CAP): Tamizaje universal obligatorio. La pérdida nuclear (dMMR) genera inestabilidad de microsatélites (MSI-H). En caso de pérdida dual de MLH1 y PMS2, debe realizarse prueba de mutación BRAF V600E o metilación del promotor de MLH1 para distinguir origen esporádico versus Síndrome de Lynch. Los casos dMMR/MSI-H son altamente sensibles a inmunoterapia anti-PD-1 (pembrolizumab)."
                },
                {
                    "id": "molecular_biomarkers",
                    "label": "Biomarcadores Moleculares Adicionales (KRAS, NRAS, BRAF, HER2)",
                    "type": "text",
                    "helpText": "(Nota M del CAP): Mutaciones en exones 2, 3 y 4 de KRAS y NRAS contraindican terapia anti-EGFR. BRAF V600E predice resistencia y comportamiento agresivo, permitiendo terapia dirigida con inhibidores de BRAF + cetuximab."
                }
            ]
        }
    ]
}
