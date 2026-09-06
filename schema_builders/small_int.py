true = True
false = False
null = None
# -*- coding: utf-8 -*-
# Small Intestine Resection Schema Builder
def build_small_intestine_resection():
    return {
    "id": "small_intestine_resection",
    "title": "Protocolo Sinóptico: Intestino Delgado (Resección) - CAP v4.3.0.0 / AJCC 8va Ed.",
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
                            "value": "segmental_resection",
                            "label": "Resección segmentaria de intestino delgado (yeyuno / íleon)"
                        },
                        {
                            "value": "duodenectomy",
                            "label": "Duodenectomía segmental"
                        },
                        {
                            "value": "pancreaticoduodenectomy",
                            "label": "Pancreatoduodenectomía (procedimiento de Whipple)"
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
                    "helpText": "Tipo de resección quirúrgica. Las neoplasias duodenales a menudo requieren pancreatoduodenectomía cefálica para lograr márgenes libres y linfadenectomía peripancreática adecuada."
                }
            ]
        },
        {
            "name": "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
            "fields": [
                {
                    "id": "tumor_site",
                    "label": "Sitio Anatómico del Tumor",
                    "type": "select",
                    "options": [
                        {
                            "value": "duodenum",
                            "label": "Duodeno (no ampular: primera, tercera o cuarta porción)"
                        },
                        {
                            "value": "jejunum",
                            "label": "Yeyuno"
                        },
                        {
                            "value": "ileum",
                            "label": "Íleon"
                        },
                        {
                            "value": "meckel_diverticulum",
                            "label": "Divertículo de Meckel"
                        },
                        {
                            "value": "small_intestine_nos",
                            "label": "Intestino delgado, no especificado"
                        }
                    ],
                    "helpText": "(Nota A del CAP): El sitio anatómico tiene implicancias etiológicas: los adenocarcinomas duodenales representan más del 50% de los cánceres del intestino delgado y se asocian a poliposis adenomatosa familiar (PAF); los yeyunales e ileales se asocian frecuentemente a enfermedad celíaca o enfermedad de Crohn de larga evolución."
                },
                {
                    "id": "histologic_type",
                    "label": "Tipo Histológico (OMS 5ta Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "adenocarcinoma",
                            "label": "Adenocarcinoma convencional"
                        },
                        {
                            "value": "mucinous",
                            "label": "Adenocarcinoma mucinoso (>50% de mucina)"
                        },
                        {
                            "value": "signet_ring",
                            "label": "Carcinoma de células en anillo de sello / pobremente cohesivo"
                        },
                        {
                            "value": "adenosquamous",
                            "label": "Carcinoma adenoescamoso"
                        },
                        {
                            "value": "medullary",
                            "label": "Carcinoma medular (asociado a MSI-H / Lynch)"
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
                            "value": "undifferentiated",
                            "label": "Carcinoma indiferenciado"
                        },
                        {
                            "value": "other",
                            "label": "Otro tipo histológico (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "(Nota B del CAP): Los adenocarcinomas de intestino delgado comparten características morfológicas y moleculares con los colorrectales (frecuente inestabilidad de microsatélites dMMR/MSI-H, especialmente en el contexto de Síndrome de Lynch)."
                },
                {
                    "id": "histologic_grade",
                    "label": "Grado Histológico",
                    "type": "radio",
                    "options": [
                        {
                            "value": "g1",
                            "label": "G1: Bien diferenciado (>95% de formación glandular)"
                        },
                        {
                            "value": "g2",
                            "label": "G2: Moderadamente diferenciado (50% a 95% de formación glandular)"
                        },
                        {
                            "value": "g3",
                            "label": "G3: Pobremente diferenciado (<50% de formación glandular)"
                        },
                        {
                            "value": "gx",
                            "label": "GX: No puede ser evaluado"
                        }
                    ],
                    "helpText": "(Nota C del CAP): Sistema graduado de diferenciación glandular."
                },
                {
                    "id": "tumor_size_greatest",
                    "label": "Dimensión Mayor del Tumor (cm)",
                    "type": "number",
                    "suffix": "cm",
                    "helpText": "Dimensión mayor del tumor invasor en centímetros."
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
                            "label": "Presente en el lecho tumoral (pT4a)"
                        },
                        {
                            "value": "present_not_tumor",
                            "label": "Presente en intestino vecino no tumoral"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "La perforación transmural espontánea o mecánica en el lecho del tumor se asocia a diseminación peritoneal."
                }
            ]
        },
        {
            "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN (pTNM - AJCC 8va Ed.)",
            "fields": [
                {
                    "id": "pt_category",
                    "label": "Tumor Primario (pT - AJCC 8va Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "ptx",
                            "label": "pTX: No evaluable"
                        },
                        {
                            "value": "pt0",
                            "label": "pT0: Sin evidencia de tumor primario"
                        },
                        {
                            "value": "ptis",
                            "label": "pTis: Carcinoma in situ (intramucoso)"
                        },
                        {
                            "value": "pt1a",
                            "label": "pT1a: El tumor invade la lámina propia"
                        },
                        {
                            "value": "pt1b",
                            "label": "pT1b: El tumor invade la submucosa"
                        },
                        {
                            "value": "pt2",
                            "label": "pT2: El tumor invade la muscular propia"
                        },
                        {
                            "value": "pt3",
                            "label": "pT3: El tumor invade la subserosa o tejido perimuscular no peritonealizado (mesenterio/retroperitoneo) <= 2 cm"
                        },
                        {
                            "value": "pt4",
                            "label": "pT4: El tumor penetra la serosa (peritoneo visceral) O invade directamente otros órganos/tejido perimuscular > 2 cm"
                        }
                    ],
                    "helpText": "(Nota F del CAP): En el duodeno retroperitoneal (que carece de serosa posterior), la invasión del tejido retroperitoneal adiposo con una profundidad menor o igual a 2 cm se clasifica como pT3; si sobrepasa los 2 cm de profundidad o invade el páncreas, se clasifica como pT4. En yeyuno e íleon, la perforación de la serosa peritoneal visceral es pT4."
                },
                {
                    "id": "nodes_examined",
                    "label": "Total de Ganglios Linfáticos Regionales Examinados",
                    "type": "number",
                    "helpText": "(Nota F del CAP): El consenso AJCC 8va edición recomienda un MÍNIMO de 8 ganglios linfáticos regionales examinados para una estadificación pN0 certera en resecciones de intestino delgado."
                },
                {
                    "id": "nodes_positive",
                    "label": "Número de Ganglios Linfáticos con Metástasis",
                    "type": "number",
                    "helpText": "Número de ganglios con metástasis microscópica o macroscópica."
                },
                {
                    "id": "pn_category",
                    "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "pnx",
                            "label": "pNX: No evaluable"
                        },
                        {
                            "value": "pn0",
                            "label": "pN0: Sin metástasis en ganglios linfáticos regionales"
                        },
                        {
                            "value": "pn1",
                            "label": "pN1: Metástasis en 1 a 2 ganglios linfáticos regionales"
                        },
                        {
                            "value": "pn2",
                            "label": "pN2: Metástasis en 3 o más ganglios linfáticos regionales"
                        }
                    ],
                    "helpText": "Clasificación cuantitativa según el número de ganglios positivos."
                },
                {
                    "id": "pm_category",
                    "label": "Metástasis a Distancia (pM - AJCC 8va Ed.)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "na",
                            "label": "No aplicable"
                        },
                        {
                            "value": "pm1",
                            "label": "pM1: Metástasis a distancia presente (hígado, peritoneo, pulmón)"
                        }
                    ],
                    "helpText": "Diseminación tumoral a distancia."
                }
            ]
        },
        {
            "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
            "fields": [
                {
                    "id": "margin_proximal",
                    "label": "Margen Quirúrgico Proximal",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometido (especificar distancia libre en mm/cm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved",
                            "label": "Comprometido por carcinoma invasor"
                        }
                    ],
                    "helpText": "(Nota E del CAP): Margen entérico proximal."
                },
                {
                    "id": "margin_distal",
                    "label": "Margen Quirúrgico Distal",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometido (especificar distancia libre en mm/cm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved",
                            "label": "Comprometido por carcinoma invasor"
                        }
                    ],
                    "helpText": "(Nota E del CAP): Margen entérico distal."
                },
                {
                    "id": "margin_mesenteric_radial",
                    "label": "Margen Mesentérico / Radial (Retroperitoneal en Duodeno)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved_gt_1mm",
                            "label": "No comprometido: Carcinoma a más de 1.0 mm de la tinta (especificar distancia en mm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved_lte_1mm",
                            "label": "COMPROMETIDO: Carcinoma a 1.0 mm o menos (<=1.0 mm) de la tinta",
                            "hasInput": true
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota E del CAP): El margen mesentérico o radial vascularizado no peritonealizado se considera positivo si el tumor dista <= 1.0 mm de la superficie entintada."
                }
            ]
        },
        {
            "name": "INVASIONES Y BIOMARCADORES",
            "fields": [
                {
                    "id": "lvi",
                    "label": "Invasión Linfovascular (LVI)",
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
                    "helpText": "Embolias tumorales en vasos linfáticos o venosos."
                },
                {
                    "id": "pni",
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
                    "helpText": "Invasión de filetes nerviosos en la pared o mesenterio."
                },
                {
                    "id": "treatment_effect",
                    "label": "Efecto del Tratamiento Neoadyuvante (CAP / Ryan)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "no_therapy",
                            "label": "Sin terapia presúrgica"
                        },
                        {
                            "value": "score_0",
                            "label": "Score 0: Respuesta completa (sin células viables)"
                        },
                        {
                            "value": "score_1",
                            "label": "Score 1: Respuesta moderada"
                        },
                        {
                            "value": "score_2",
                            "label": "Score 2: Respuesta mínima"
                        },
                        {
                            "value": "score_3",
                            "label": "Score 3: Pobre o nula respuesta"
                        }
                    ],
                    "helpText": "(Nota D del CAP): Gradación de regresión tumoral."
                },
                {
                    "id": "mmr_status",
                    "label": "Proteínas de Reparación de Apareamiento (MMR por IHQ)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "pmmr",
                            "label": "pMMR: Expresión conservada en las 4 proteínas"
                        },
                        {
                            "value": "dmmr",
                            "label": "dMMR: PÉRDIDA de expresión nuclear (asociado a Síndrome de Lynch)",
                            "hasInput": true
                        },
                        {
                            "value": "pending",
                            "label": "Pendiente"
                        }
                    ],
                    "helpText": "El carcinoma de intestino delgado es una de las neoplasias características del espectro tumoral del Síndrome de Lynch (mutaciones MLH1, MSH2, MSH6, PMS2)."
                }
            ]
        }
    ]
}
