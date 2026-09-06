true = True
false = False
null = None
# -*- coding: utf-8 -*-
# ColoRectal Biopsy / Polypectomy Schema Builder
def build_colorectal_biopsy():
    return {
    "id": "colorectal_biopsy",
    "title": "Protocolo Sinóptico: Colon y Recto (Biopsia / Polipectomía) - CAP v4.3.0.0",
    "targetField": "microDesc",
    "sections": [
        {
            "name": "PROCEDIMIENTO Y ESPECÍMEN",
            "fields": [
                {
                    "id": "procedure",
                    "label": "Procedimiento Endoscópico / Quirúrgico",
                    "type": "radio",
                    "options": [
                        {
                            "value": "polypectomy",
                            "label": "Polipectomía endoscópica (con asa)"
                        },
                        {
                            "value": "emr",
                            "label": "Resección mucosa endoscópica (EMR)"
                        },
                        {
                            "value": "esd",
                            "label": "Disección submucosa endoscópica (ESD)"
                        },
                        {
                            "value": "transanal_disk",
                            "label": "Escisión de disco transanal (TEM / TAMIS)"
                        },
                        {
                            "value": "forceps_biopsy",
                            "label": "Biopsia endoscópica con pinza (fórceps)"
                        },
                        {
                            "value": "other",
                            "label": "Otro procedimiento (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "Identifica el método de escisión endoscópica. En resecciones locales completas (polipectomía, EMR, ESD, TEM), la preservación anatómica orientada permite una evaluación fidedigna de los márgenes profundo y lateral."
                },
                {
                    "id": "specimen_integrity",
                    "label": "Integridad del Espécimen",
                    "type": "radio",
                    "options": [
                        {
                            "value": "intact",
                            "label": "Íntegro (pieza única orientable)"
                        },
                        {
                            "value": "fragmented",
                            "label": "Fragmentado (múltiples fragmentos / resección en piecemeal)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "La fragmentación del tejido o resección en 'piecemeal' impide evaluar con certeza el margen de resección profundo y lateral, imposibilitando descartar enfermedad residual."
                }
            ]
        },
        {
            "name": "TUMOR Y PÓLIPO DE ORIGEN",
            "fields": [
                {
                    "id": "tumor_site",
                    "label": "Sitio Anatómico de la Lesión",
                    "type": "select",
                    "options": [
                        {
                            "value": "cecum",
                            "label": "Ciego"
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
                        }
                    ],
                    "helpText": "(Nota A del CAP): Ubicación endoscópica del pólipo. Los adenomas y carcinomas de recto distal pueden manejarse mediante abordaje transanal o requerir resección radical según la profundidad de invasión."
                },
                {
                    "id": "polyp_type",
                    "label": "Tipo de Pólipo en el que se Originó el Carcinoma Invasor",
                    "type": "select",
                    "options": [
                        {
                            "value": "tubular",
                            "label": "Adenoma tubular"
                        },
                        {
                            "value": "tubulovillous",
                            "label": "Adenoma tubulovelloso"
                        },
                        {
                            "value": "villous",
                            "label": "Adenoma velloso"
                        },
                        {
                            "value": "sessile_serrated",
                            "label": "Lesión / pólipo serrado sésil (SSL)"
                        },
                        {
                            "value": "traditional_serrated",
                            "label": "Adenoma serrado tradicional (TSA)"
                        },
                        {
                            "value": "hamartomatous",
                            "label": "Pólipo hamartomatoso / Peutz-Jeghers / Juvenil"
                        },
                        {
                            "value": "none_de_novo",
                            "label": "Sin pólipo residual identificable (carcinoma de novo)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota G del CAP): La mayoría de los carcinomas colorrectales surgen sobre adenomas convencionales (vía supresora APC/CIN) o sobre lesiones serradas (vía serrada asociada a mutación BRAF e hipermetilación CIMP)."
                },
                {
                    "id": "polyp_config",
                    "label": "Configuración Macroscópica del Pólipo",
                    "type": "radio",
                    "options": [
                        {
                            "value": "pedunculated",
                            "label": "Pediculado (con tallo evidente)"
                        },
                        {
                            "value": "sessile",
                            "label": "Sésil (base ancha de implantación, sin tallo)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota D del CAP): La presencia de tallo permite aplicar la clasificación pronóstica de niveles de Haggitt, mientras que los pólipos sésiles se estratifican según la invasión de la submucosa (niveles de Kikuchi o medición micrométrica directa)."
                },
                {
                    "id": "histologic_type",
                    "label": "Tipo Histológico del Carcinoma Invasor",
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
                            "label": "Adenocarcinoma de células en anillo de sello"
                        },
                        {
                            "value": "medullary",
                            "label": "Carcinoma medular"
                        },
                        {
                            "value": "micropapillary",
                            "label": "Adenocarcinoma micropapilar"
                        },
                        {
                            "value": "other",
                            "label": "Otro tipo (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "(Nota B del CAP): Los tipos no convencionales como el carcinoma micropapilar y de células en anillo de sello tienen una alta tasa de metástasis ganglionar temprana incluso en lesiones T1."
                },
                {
                    "id": "histologic_grade",
                    "label": "Grado Histológico",
                    "type": "radio",
                    "options": [
                        {
                            "value": "low_grade",
                            "label": "Bajo grado (Bien a moderadamente diferenciado: >= 50% de formación glandular)"
                        },
                        {
                            "value": "high_grade",
                            "label": "Alto grado (Pobremente diferenciado: < 50% de formación glandular)"
                        }
                    ],
                    "helpText": "(Nota C del CAP): El alto grado histológico en un pólipo malignizado es un factor de alto riesgo independiente para metástasis en ganglios linfáticos regionales y justifica rescate quirúrgico con colectomía."
                }
            ]
        },
        {
            "name": "PROFUNDIDAD DE INVASIÓN Y ESTRATIFICACIÓN EN PÓLIPOS",
            "fields": [
                {
                    "id": "haggitt_level",
                    "label": "Nivel de Invasión de Haggitt (Para pólipos pediculados únicamente)",
                    "type": "radio",
                    "dependsOn": {
                        "field": "polyp_config",
                        "value": "pedunculated"
                    },
                    "options": [
                        {
                            "value": "level_1",
                            "label": "Nivel 1: Carcinoma invade la submucosa pero limitado a la cabeza del pólipo"
                        },
                        {
                            "value": "level_2",
                            "label": "Nivel 2: Carcinoma invade la submucosa a nivel del cuello del pólipo"
                        },
                        {
                            "value": "level_3",
                            "label": "Nivel 3: Carcinoma invade la submucosa a lo largo del tallo del pólipo"
                        },
                        {
                            "value": "level_4",
                            "label": "Nivel 4: Carcinoma invade la submucosa de la pared colónica por debajo del tallo"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota D del CAP): Clasificación de Haggitt. Los niveles 1, 2 y 3 tienen un riesgo muy bajo de metástasis ganglionar (<1%) si los márgenes están libres y no hay otros factores adversos. El nivel 4 eleva el riesgo de metástasis ganglionar al 10-15% y se equipara biológicamente a un pólipo sésil invasor."
                },
                {
                    "id": "submucosal_depth_microns",
                    "label": "Profundidad de Invasión Submucosa en Micrómetros (µm)",
                    "type": "number",
                    "suffix": "µm",
                    "helpText": "(Nota D del CAP): Criterio de Ueno/Kikuchi. Medida desde la muscularis mucosae hasta el punto más profundo de invasión. En pólipos sésiles, una invasión submucosa profunda (> 1000 µm / > 1 mm) se asocia a un riesgo de metástasis ganglionar del 6% al 12%, considerándose criterio de alto riesgo."
                },
                {
                    "id": "submucosal_width_microns",
                    "label": "Ancho de la Invasión Submucosa (µm o mm)",
                    "type": "number",
                    "suffix": "µm",
                    "helpText": "Anchura máxima del frente invasor submucoso. Lesiones con frente expansivo ancho (>2000 µm) presentan mayor frecuencia de compromiso vascular."
                }
            ]
        },
        {
            "name": "MÁRGENES DE RESECCIÓN EN LA BIOPSIA / POLIPECTOMÍA",
            "fields": [
                {
                    "id": "deep_margin_status",
                    "label": "Margen de Resección Profundo (Base / Tallo)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved_gt_1mm",
                            "label": "No comprometido: Distancia libre >= 1.0 mm (especificar distancia exacta en mm)",
                            "hasInput": true
                        },
                        {
                            "value": "close_lte_1mm",
                            "label": "Cercano: Carcinoma invasor a menos de 1.0 mm del margen entintado (especificar distancia en mm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved",
                            "label": "Comprometido: Carcinoma invasor presente en la superficie entintada de corte (0 mm)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No determinado por fragmentación o electrocauterio"
                        }
                    ],
                    "helpText": "(Nota D y K del CAP): En polipectomía, un margen profundo de resección < 1.0 mm (<1 mm) se considera POSITIVO o de ALTO RIESGO para persistencia tumoral local y metástasis residual en la pared colónica, justificando resección quirúrgica complementaria."
                },
                {
                    "id": "mucosal_margin_status",
                    "label": "Margen de Resección Mucoso (Lateral)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometido por carcinoma invasor ni por adenoma"
                        },
                        {
                            "value": "involved_adenoma",
                            "label": "Comprometido por adenoma residual (displasia)",
                            "hasInput": true
                        },
                        {
                            "value": "involved_carcinoma",
                            "label": "Comprometido por carcinoma invasor"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "El compromiso del margen lateral por displasia adenomatosa puede manejarse con vigilancia endoscópica o re-escisión local, a diferencia del compromiso por carcinoma invasor."
                }
            ]
        },
        {
            "name": "FACTORES HISTOLÓGICOS DE ALTO RIESGO",
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
                            "label": "Presente (linfática o venosa)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota E del CAP): La presencia de embolias tumorales linfovasculares es uno de los factores más fuertes de metástasis ganglionar en pólipos malignos (riesgo del 15% al 35%), constituyendo una indicación categórica de colectomía oncológica."
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
                    "helpText": "(Nota E del CAP): Células tumorales dentro o alrededor de filetes nerviosos en la submucosa."
                },
                {
                    "id": "tumor_budding",
                    "label": "Puntaje de Brotación Tumoral (Tumor Budding - ITBCC)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "bd1",
                            "label": "Bajo grado (Bd1: 0 a 4 brotes por 0.785 mm²)"
                        },
                        {
                            "value": "bd2",
                            "label": "Grado intermedio (Bd2: 5 a 9 brotes por 0.785 mm²)"
                        },
                        {
                            "value": "bd3",
                            "label": "Alto grado (Bd3: 10 o más brotes por 0.785 mm²)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No determinado"
                        }
                    ],
                    "helpText": "(Nota F del CAP): La brotación tumoral intermedia/alta (Bd2/Bd3) en la base de un pólipo pT1 incrementa significativamente el riesgo de compromiso ganglionar metastásico independientemente de otros factores."
                },
                {
                    "id": "high_risk_summary",
                    "label": "Resumen de Criterios de Alto Riesgo de Metástasis Ganglionar",
                    "type": "checkbox",
                    "options": [
                        {
                            "value": "none",
                            "label": "Sin factores de alto riesgo identificados (pólipo de bajo riesgo curado con polipectomía)"
                        },
                        {
                            "value": "margin_positive",
                            "label": "Margen de resección profundo positivo o cercano (< 1.0 mm)"
                        },
                        {
                            "value": "poorly_diff",
                            "label": "Grado histológico pobremente diferenciado (alto grado)"
                        },
                        {
                            "value": "lvi_positive",
                            "label": "Invasión linfovascular presente"
                        },
                        {
                            "value": "high_budding",
                            "label": "Brotación tumoral intermedia o alta (Bd2 o Bd3)"
                        },
                        {
                            "value": "deep_sm_invasion",
                            "label": "Invasión submucosa profunda (> 1000 µm o Haggitt nivel 4)"
                        },
                        {
                            "value": "fragmented",
                            "label": "Espécimen fragmentado que impide evaluación segura"
                        }
                    ],
                    "helpText": "(Nota D del CAP): Criterios de consenso internacional: La presencia de CUALQUIERA de estos factores de alto riesgo clasifica al pólipo como de ALTO RIESGO oncológico y justifica plantear rescate mediante resección quirúrgica radical (colectomía con linfadenectomía formal)."
                }
            ]
        }
    ]
}
