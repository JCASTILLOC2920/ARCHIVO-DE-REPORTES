true = True
false = False
null = None
# -*- coding: utf-8 -*-
# Esophagus Resection Schema Builder
def build_esophagus_resection():
    return {
    "id": "esophagus_resection",
    "title": "Protocolo Sinóptico: Esófago y Unión Esofagogástrica (Resección) - CAP v4.2.0.1 / AJCC 8va Ed.",
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
                            "value": "esophagectomy_transthoracic",
                            "label": "Esofaguectomía transtorácica (Ivor Lewis / McKeown en 3 campos)"
                        },
                        {
                            "value": "esophagectomy_transhiatal",
                            "label": "Esofaguectomía transhiatal"
                        },
                        {
                            "value": "esophagogastrectomy",
                            "label": "Esofagogastrectomía distal"
                        },
                        {
                            "value": "emr_esd",
                            "label": "Resección mucosa endoscópica (EMR / ESD)"
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
                    "helpText": "(Nota A del CAP): Describe el tipo de intervención quirúrgica. La esofaguectomía transtorácica permite una linfadenectomía mediastínica y celíaca más amplia que el abordaje transhiatal."
                }
            ]
        },
        {
            "name": "TUMOR Y SITIO ANATÓMICO",
            "fields": [
                {
                    "id": "tumor_site",
                    "label": "Sitio Anatómico del Tumor (seleccionar todos los que apliquen)",
                    "type": "checkbox",
                    "options": [
                        {
                            "value": "cervical",
                            "label": "Esófago cervical (15 a <20 cm de arcada dental)"
                        },
                        {
                            "value": "upper_thoracic",
                            "label": "Esófago torácico superior (20 a <25 cm de arcada dental)"
                        },
                        {
                            "value": "mid_thoracic",
                            "label": "Esófago torácico medio (25 a <30 cm de arcada dental)"
                        },
                        {
                            "value": "lower_thoracic",
                            "label": "Esófago torácico inferior (30 a 40 cm de arcada dental)"
                        },
                        {
                            "value": "egj",
                            "label": "Unión esofagogástrica (UEG)"
                        },
                        {
                            "value": "esophagus_nos",
                            "label": "Esófago, no especificado"
                        }
                    ],
                    "helpText": "(Nota B del CAP): La localización anatómica es determinante: los carcinomas de células escamosas predominan en el tercio medio y superior (asociados a tabaco y alcohol), mientras que los adenocarcinomas se concentran en el tercio inferior y UEG (asociados a reflujo gastroesofágico y esófago de Barrett)."
                },
                {
                    "id": "egj_relationship",
                    "label": "Relación del Tumor con la Unión Esofagogástrica (UEG)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "entirely_esophagus",
                            "label": "El tumor se encuentra enteramente en el esófago tubular sin comprometer la UEG"
                        },
                        {
                            "value": "epicenter_esophagus_invades_egj",
                            "label": "El punto medio (epicentro) del tumor está en el esófago distal Y cruza/compromete la UEG"
                        },
                        {
                            "value": "epicenter_at_egj",
                            "label": "El epicentro del tumor se encuentra exactamente en la UEG"
                        },
                        {
                            "value": "epicenter_stomach_lte_2cm",
                            "label": "El epicentro del tumor está a 2.0 cm o menos en el estómago proximal/cardias Y compromete la UEG"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota B del CAP): Regla AJCC 8va Edición: Un tumor cuyo epicentro se encuentra dentro de los 2 cm proximales del estómago (cardias) e involucra la UEG se clasifica y estadifica como CÁNCER DE ESÓFAGO. Si el epicentro dista más de 2 cm de la UEG hacia el estómago, se estadifica como CÁNCER GÁSTRICO."
                },
                {
                    "id": "egj_distance_cm",
                    "label": "Distancia del Centro del Tumor a la UEG (cm)",
                    "type": "number",
                    "suffix": "cm",
                    "helpText": "Medición en centímetros desde el centro geométrico del tumor hasta la unión esofagogástrica."
                },
                {
                    "id": "histologic_type",
                    "label": "Tipo Histológico (OMS 5ta Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "adenocarcinoma",
                            "label": "Adenocarcinoma (frecuentemente sobre esófago de Barrett)"
                        },
                        {
                            "value": "squamous_cell",
                            "label": "Carcinoma de células escamosas convencional (queratinizante o no queratinizante)"
                        },
                        {
                            "value": "basaloid_squamous",
                            "label": "Carcinoma de células escamosas basaloide"
                        },
                        {
                            "value": "spindle_squamous",
                            "label": "Carcinoma de células escamosas de células fusiformes (sarcomatoide)"
                        },
                        {
                            "value": "verrucous_squamous",
                            "label": "Carcinoma de células escamosas verrugoso"
                        },
                        {
                            "value": "adenosquamous",
                            "label": "Carcinoma adenoescamoso"
                        },
                        {
                            "value": "adenoid_cystic",
                            "label": "Carcinoma adenoide quístico"
                        },
                        {
                            "value": "mucoepidermoid",
                            "label": "Carcinoma mucoepidermoide"
                        },
                        {
                            "value": "neuroendocrine_large",
                            "label": "Carcinoma neuroendocrino de células grandes"
                        },
                        {
                            "value": "neuroendocrine_small",
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
                    "helpText": "(Nota C del CAP): El adenocarcinoma y el carcinoma de células escamosas tienen tablas de estadificación anatómica/pronóstica diferentes en la 8va edición del AJCC. El adenocarcinoma se origina típicamente sobre metaplasia columnar con células caliciformes (esófago de Barrett)."
                },
                {
                    "id": "histologic_grade",
                    "label": "Grado Histológico (Diferenciación)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "g1",
                            "label": "G1: Bien diferenciado"
                        },
                        {
                            "value": "g2",
                            "label": "G2: Moderadamente diferenciado"
                        },
                        {
                            "value": "g3",
                            "label": "G3: Pobremente diferenciado / indiferenciado"
                        },
                        {
                            "value": "gx",
                            "label": "GX: No puede ser evaluado"
                        }
                    ],
                    "helpText": "(Nota D del CAP): En el carcinoma de células escamosas, el grado histológico (G1 vs G2/G3) forma parte integral del agrupamiento de estadios pronósticos del AJCC 8va edición."
                },
                {
                    "id": "tumor_size_greatest",
                    "label": "Dimensión Mayor del Tumor (cm)",
                    "type": "number",
                    "suffix": "cm",
                    "helpText": "Mayor longitud tumoral en sentido longitudinal o circunferencial."
                },
                {
                    "id": "barrett_esophagus",
                    "label": "Esófago de Barrett Asociado",
                    "type": "radio",
                    "options": [
                        {
                            "value": "not_identified",
                            "label": "No identificado"
                        },
                        {
                            "value": "present_no_dysplasia",
                            "label": "Presente sin displasia en mucosa adyacente"
                        },
                        {
                            "value": "present_low_dysplasia",
                            "label": "Presente con displasia de bajo grado"
                        },
                        {
                            "value": "present_high_dysplasia",
                            "label": "Presente con displasia de alto grado"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar por tratamiento neoadyuvante previo"
                        }
                    ],
                    "helpText": "Presencia de mucosa columnar de tipo intestinal especializada (células caliciformes teñidas con azul alcian) en la mucosa esofágica tubular peritumoral."
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
                            "label": "pTX: No puede ser evaluado"
                        },
                        {
                            "value": "pt0",
                            "label": "pT0: Sin evidencia de tumor primario"
                        },
                        {
                            "value": "ptis",
                            "label": "pTis: Displasia de alto grado (carcinoma in situ / no invasivo)"
                        },
                        {
                            "value": "pt1a",
                            "label": "pT1a: El tumor invade la lámina propia o la muscularis mucosae"
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
                            "label": "pT3: El tumor invade la adventicia esofágica"
                        },
                        {
                            "value": "pt4a",
                            "label": "pT4a: El tumor invade estructuras adyacentes resecables (pleura, pericardio, diafragma, vena ácigos, peritoneo)"
                        },
                        {
                            "value": "pt4b",
                            "label": "pT4b: El tumor invade estructuras adyacentes irresecables (aorta, cuerpo vertebral, tráquea)"
                        }
                    ],
                    "helpText": "(Nota E del CAP): El esófago carece de cubierta serosa en la mayor parte de su trayecto torácico; la capa externa es una adventicia laxa de tejido conectivo. La invasión de la adventicia corresponde a pT3. La extensión a estructuras contiguas se divide en resecables quirúrgicamente (pT4a) e irresecables que contraindican cirugía curativa (pT4b)."
                },
                {
                    "id": "nodes_examined",
                    "label": "Total de Ganglios Linfáticos Regionales Examinados",
                    "type": "number",
                    "helpText": "(Nota I del CAP): El AJCC recomienda examinar un MÍNIMO de 15 ganglios linfáticos regionales para una estadificación pN confiable en esofaguectomía."
                },
                {
                    "id": "nodes_positive",
                    "label": "Número de Ganglios Linfáticos con Metástasis",
                    "type": "number",
                    "helpText": "Número total de ganglios con depósito metastásico de carcinoma."
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
                            "label": "Presente"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No determinado"
                        }
                    ],
                    "helpText": "Infiltración tumoral que atraviesa la cápsula del ganglio hacia el tejido adiposo mediastínico o perigástrico."
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
                            "value": "pn1",
                            "label": "pN1: Metástasis en 1 a 2 ganglios linfáticos regionales"
                        },
                        {
                            "value": "pn2",
                            "label": "pN2: Metástasis en 3 a 6 ganglios linfáticos regionales"
                        },
                        {
                            "value": "pn3",
                            "label": "pN3: Metástasis en 7 o más ganglios linfáticos regionales"
                        }
                    ],
                    "helpText": "Clasificación pN numérica estandarizada común tanto para adenocarcinoma como para carcinoma escamoso."
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
                            "label": "pM1: Metástasis a distancia presente (pulmón, hígado, ganglios no regionales [supraclaviculares en tumores distales])"
                        }
                    ],
                    "helpText": "Compromiso de órganos a distancia o ganglios linfáticos fuera del territorio de drenaje regional."
                }
            ]
        },
        {
            "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
            "fields": [
                {
                    "id": "margin_proximal",
                    "label": "Margen Quirúrgico Proximal (Esofágico)",
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
                    "helpText": "(Nota G del CAP): Margen tubular esofágico proximal."
                },
                {
                    "id": "margin_distal",
                    "label": "Margen Quirúrgico Distal (Gástrico)",
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
                    "helpText": "(Nota G del CAP): Margen tubular gástrico distal."
                },
                {
                    "id": "margin_crm_adventitial",
                    "label": "Margen Adventicial / Circunferencial (CRM)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved_gt_1mm",
                            "label": "No comprometido: Carcinoma a más de 1.0 mm de la tinta adventicial (especificar distancia en mm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved_lte_1mm",
                            "label": "COMPROMETIDO: Carcinoma a 1.0 mm o menos (<=1.0 mm) de la superficie adventicial entintada",
                            "hasInput": true
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota G del CAP): Al igual que en recto, el margen circunferencial adventicial (CRM) del esófago se considera POSITIVO si las células cancerosas distan <= 1.0 mm de la tinta externa. Un CRM positivo es un predictor crítico de recurrencia mediastínica local precoz."
                }
            ]
        },
        {
            "name": "INVASIONES, RESPUESTA AL TRATAMIENTO Y BIOMARCADORES",
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
                    "helpText": "Presencia de embolias en vasos linfáticos o venosos."
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
                    "helpText": "Infiltración del espacio perineural."
                },
                {
                    "id": "treatment_effect",
                    "label": "Efecto del Tratamiento Neoadyuvante (CAP / Ryan)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "no_therapy",
                            "label": "Sin terapia neoadyuvante conocida"
                        },
                        {
                            "value": "score_0",
                            "label": "Score 0 (Respuesta completa: ausencia de células neoplásicas viables, pCR)"
                        },
                        {
                            "value": "score_1",
                            "label": "Score 1 (Respuesta moderada: células tumorales residuales escasas aisladas)"
                        },
                        {
                            "value": "score_2",
                            "label": "Score 2 (Respuesta mínima: cáncer residual evidente con fibrosis desmoplásica)"
                        },
                        {
                            "value": "score_3",
                            "label": "Score 3 (Pobre o nula respuesta: extenso cáncer residual)"
                        }
                    ],
                    "helpText": "(Nota F del CAP): La respuesta patológica completa (Score 0) tras quimiorradioterapia neoadyuvante según protocolo CROSS triplica la sobrevida a 5 años tanto en adenocarcinoma como en carcinoma escamoso."
                },
                {
                    "id": "her2_ihc",
                    "label": "Estado de HER2 por IHQ (Relevante en Adenocarcinoma de Esófago distal / UEG)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "score_0",
                            "label": "Score 0 (Negativo)"
                        },
                        {
                            "value": "score_1",
                            "label": "Score 1+ (Negativo)"
                        },
                        {
                            "value": "score_2",
                            "label": "Score 2+ (Equívoco: requiere FISH)",
                            "hasInput": true
                        },
                        {
                            "value": "score_3",
                            "label": "Score 3+ (POSITIVO: tinción basolateral intensa en U)"
                        },
                        {
                            "value": "na_squamous",
                            "label": "No aplicable (Carcinoma de células escamosas)"
                        },
                        {
                            "value": "pending",
                            "label": "Pendiente"
                        }
                    ],
                    "helpText": "Evaluación con criterios de Hofman para seleccionar tratamiento con trastuzumab en adenocarcinomas de esófago distal y UEG."
                },
                {
                    "id": "pdl1_cps",
                    "label": "PD-L1 Combined Positive Score (CPS) / Tumor Proportion Score (TPS)",
                    "type": "number",
                    "helpText": "En carcinoma epidermoide de esófago (TPS >= 1% o CPS >= 10) y en adenocarcinoma de la UEG (CPS >= 5 o >= 10), predice respuesta favorable a inhibidores de PD-1 (Pembrolizumab o Nivolumab)."
                }
            ]
        }
    ]
}
