true = True
false = False
null = None
# -*- coding: utf-8 -*-
# Gallbladder Resection Schema Builder
def build_gallbladder_resection():
    return {
    "id": "gallbladder_resection",
    "title": "Protocolo Sinóptico: Vesícula Biliar (Resección) - CAP v4.3.0.0 / AJCC 8va Ed.",
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
                            "value": "cholecystectomy_simple",
                            "label": "Colecistectomía simple (laparoscópica o abierta)"
                        },
                        {
                            "value": "cholecystectomy_radical",
                            "label": "Colecistectomía radical / extendida (con resección de lecho hepático [segmentos IVb/V] y linfadenectomía portal)"
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
                    "helpText": "(Nota A del CAP): Cáncer incidental de vesícula biliar: Es común que el carcinoma sea un hallazgo histopatológico insospechado tras una colecistectomía rutinaria por litiasis. En estadios >= pT1b o pT2, la colecistectomía simple es insuficiente y amerita reoperación oncológica radical con resección en cuña del lecho hepático y linfadenectomía del ligamento hepatoduodenal."
                }
            ]
        },
        {
            "name": "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
            "fields": [
                {
                    "id": "tumor_site",
                    "label": "Sitio Anatómico y Superficie Vesicular Afectada",
                    "type": "radio",
                    "options": [
                        {
                            "value": "peritoneal_side",
                            "label": "Superficie peritoneal libre (fondo, cuerpo o cuello ventral cubierto por serosa peritoneal)"
                        },
                        {
                            "value": "hepatic_side",
                            "label": "Superficie hepática no peritonealizada (lecho vesicular íntimamente adosado al hígado)"
                        },
                        {
                            "value": "both_circumferential",
                            "label": "Ambas superficies (compromiso circunferencial / difuso)"
                        },
                        {
                            "value": "cystic_duct",
                            "label": "Conducto cístico"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No determinado (pieza abierta sin orientación anatómica)"
                        }
                    ],
                    "helpText": "(Nota A y I del CAP): Distinción pronóstica fundamental: La vesícula carece de serosa en su lecho hepático y se adosa directamente al parénquima por una capa laxa de tejido conectivo perimuscular rica en venas que drenan al hígado. Los tumores del lado hepático tienen acceso directo precoz al parénquima hepático y peor pronóstico que los del lado peritoneal."
                },
                {
                    "id": "histologic_type",
                    "label": "Tipo Histológico (OMS 5ta Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "adenocarcinoma_biliary",
                            "label": "Adenocarcinoma, tipo biliar (convencional)"
                        },
                        {
                            "value": "adenocarcinoma_intestinal",
                            "label": "Adenocarcinoma, tipo intestinal"
                        },
                        {
                            "value": "adenocarcinoma_foveolar",
                            "label": "Adenocarcinoma, tipo foveolar (gástrico)"
                        },
                        {
                            "value": "mucinous",
                            "label": "Adenocarcinoma mucinoso (>50% de mucina)"
                        },
                        {
                            "value": "clear_cell",
                            "label": "Adenocarcinoma de células claras"
                        },
                        {
                            "value": "signet_ring",
                            "label": "Carcinoma de células en anillo de sello / pobremente cohesivo"
                        },
                        {
                            "value": "icpn_invasive",
                            "label": "Neoplasia papilar intravesicular (ICPN) con carcinoma invasor asociado"
                        },
                        {
                            "value": "adenosquamous",
                            "label": "Carcinoma adenoescamoso"
                        },
                        {
                            "value": "squamous_cell",
                            "label": "Carcinoma de células escamosas"
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
                    "helpText": "(Nota B del CAP): El adenocarcinoma tipo biliar es el más frecuente. La neoplasia papilar intravesicular (ICPN) es una lesión precursora adenomatosa que forma masas exofíticas intraluminales con mejor pronóstico general, debiendo consignarse el porcentaje y profundidad del componente invasor destructivo."
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
                    "helpText": "(Nota C del CAP): El grado pobremente diferenciado se asocia fuertemente a invasión vascular, perineural y metástasis a distancia."
                },
                {
                    "id": "tumor_size_greatest",
                    "label": "Dimensión Mayor del Tumor Invasor (cm)",
                    "type": "number",
                    "suffix": "cm",
                    "helpText": "(Nota D del CAP): Medida de la mayor dimensión del carcinoma invasor en centímetros."
                }
            ]
        },
        {
            "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN PATOLÓGICA (pTNM - AJCC 8va Ed.)",
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
                            "label": "pTis: Carcinoma in situ (neoplasia intraepitelial biliar de alto grado BilIN-3 o ICPN no invasor)"
                        },
                        {
                            "value": "pt1a",
                            "label": "pT1a: El tumor invade la lámina propia"
                        },
                        {
                            "value": "pt1b",
                            "label": "pT1b: El tumor invade la capa muscular propia"
                        },
                        {
                            "value": "pt2a",
                            "label": "pT2a: El tumor invade el tejido conectivo perimuscular en el LADO PERITONEAL (sin sobrepasar serosa)"
                        },
                        {
                            "value": "pt2b",
                            "label": "pT2b: El tumor invade el tejido conectivo perimuscular en el LADO HEPÁTICO (sin invadir el parénquima hepático)"
                        },
                        {
                            "value": "pt3",
                            "label": "pT3: El tumor perfora la serosa (peritoneo visceral) Y/O invade directamente el hígado o un órgano vecino (estómago, duodeno, colon, páncreas)"
                        },
                        {
                            "value": "pt4",
                            "label": "pT4: El tumor invade la vena porta principal o arteria hepática, o invade >=2 órganos extrahepáticos"
                        }
                    ],
                    "helpText": "(Nota I del CAP): Avance crítico de la 8va edición del AJCC: La bifurcación de pT2 en pT2a (lado peritoneal) y pT2b (lado hepático). La sobrevida a 5 años en pT2a es aproximadamente del 65%, mientras que en pT2b cae al 33% debido a la alta tasa de diseminación hematógena microscópica directa hacia los sinusoides hepáticos y afectación ganglionar portal."
                },
                {
                    "id": "nodes_examined",
                    "label": "Total de Ganglios Linfáticos Regionales Examinados",
                    "type": "number",
                    "helpText": "(Nota I del CAP): El AJCC recomienda examinar un MÍNIMO de 6 ganglios linfáticos regionales (ganglio del conducto cístico, ganglios del colédoco, arteria hepática y vena porta) para una estadificación N certera."
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
                            "label": "pN0: Sin metástasis en ganglios regionales"
                        },
                        {
                            "value": "pn1",
                            "label": "pN1: Metástasis en 1 a 3 ganglios linfáticos regionales"
                        },
                        {
                            "value": "pn2",
                            "label": "pN2: Metástasis en 4 o más ganglios linfáticos regionales"
                        }
                    ],
                    "helpText": "En la 8va edición, la categoría N se basa en el recuento numérico (pN1: 1 a 3 ganglios; pN2: >=4 ganglios), reemplazando la antigua clasificación puramente anatómica."
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
                            "label": "pM1: Metástasis a distancia confirmada (peritoneo, pulmón, ganglios celíacos/paraórticos distantes)"
                        }
                    ],
                    "helpText": "Los ganglios celíacos, mesentéricos superiores o paraórticos se consideran metástasis a distancia (M1)."
                }
            ]
        },
        {
            "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
            "fields": [
                {
                    "id": "margin_cystic_duct",
                    "label": "Margen de Resección del Conducto Cístico",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometido (especificar distancia libre en mm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved_carcinoma",
                            "label": "COMPROMETIDO por carcinoma invasor"
                        },
                        {
                            "value": "involved_dysplasia",
                            "label": "COMPROMETIDO por neoplasia intraepitelial / displasia de alto grado",
                            "hasInput": true
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota H del CAP): Margen crítico en la colecistectomía simple. Si el conducto cístico muestra carcinoma o displasia de alto grado en la tinta, existe riesgo inminente de tumor residual en la confluencia con el colédoco, requiriendo resección de la vía biliar principal."
                },
                {
                    "id": "margin_liver_bed",
                    "label": "Margen del Lecho Hepático / Tejido Fibroadiposo Hepático",
                    "type": "radio",
                    "options": [
                        {
                            "value": "na_peritoneal_side",
                            "label": "No aplicable (tumor confinado a cara peritoneal)"
                        },
                        {
                            "value": "uninvolved",
                            "label": "No comprometido (especificar distancia en mm al lecho entintado)",
                            "hasInput": true
                        },
                        {
                            "value": "involved",
                            "label": "COMPROMETIDO por carcinoma invasor"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota H del CAP): Superficie externa de fijación al hígado. Si el lecho está comprometido (R1), se requiere re-resección en cuña del parénquima hepático adyacente."
                }
            ]
        },
        {
            "name": "INVASIONES Y FACTORES ADICIONALES",
            "fields": [
                {
                    "id": "lvi",
                    "label": "Invasión Linfática y/o Vascular (LVI)",
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
                    "helpText": "(Nota E del CAP): La invasión linfovascular es altamente prevalente en cáncer de vesícula y predice fuertemente micrometástasis hepáticas y ganglionares."
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
                    "helpText": "(Nota F del CAP): La rica red autonómica del lecho hepático y ligamento hepatoduodenal favorece la diseminación perineural precoz hacia el tronco celíaco."
                },
                {
                    "id": "treatment_effect",
                    "label": "Efecto del Tratamiento Neoadyuvante (CAP / Ryan)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "no_therapy",
                            "label": "Sin quimioterapia/radioterapia presúrgica"
                        },
                        {
                            "value": "score_0",
                            "label": "Score 0: Respuesta completa (sin células tumorales viables)"
                        },
                        {
                            "value": "score_1",
                            "label": "Score 1: Respuesta moderada (células tumorales aisladas)"
                        },
                        {
                            "value": "score_2",
                            "label": "Score 2: Respuesta mínima (cáncer residual prominente)"
                        },
                        {
                            "value": "score_3",
                            "label": "Score 3: Pobre o nula respuesta"
                        }
                    ],
                    "helpText": "(Nota G del CAP): Evaluación del tratamiento presúrgico."
                }
            ]
        }
    ]
}
