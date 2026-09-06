true = True
false = False
null = None
# -*- coding: utf-8 -*-
# Stomach Resection Schema Builder
def build_stomach_resection():
    return {
    "id": "stomach_resection",
    "title": "Protocolo Sinóptico: Estómago (Resección) - CAP v4.4.0.0 / AJCC 8va Ed.",
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
                            "value": "total_gastrectomy",
                            "label": "Gastrectomía total"
                        },
                        {
                            "value": "distal_gastrectomy",
                            "label": "Gastrectomía subtotal / distal"
                        },
                        {
                            "value": "proximal_gastrectomy",
                            "label": "Gastrectomía proximal"
                        },
                        {
                            "value": "wedge_resection",
                            "label": "Gastrectomía en cuña (resección atípica)"
                        },
                        {
                            "value": "esd_emr",
                            "label": "Resección endoscópica (ESD / EMR)"
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
                    "helpText": "(Nota A del CAP): Tipo de resección gástrica. Las gastrectomías oncológicas por adenocarcinoma habitualmente incluyen omentectomía y linfadenectomía D1/D2 según guías JGCA/NCCN."
                }
            ]
        },
        {
            "name": "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
            "fields": [
                {
                    "id": "tumor_site",
                    "label": "Sitio Anatómico del Tumor (seleccionar todos los que apliquen)",
                    "type": "checkbox",
                    "options": [
                        {
                            "value": "cardia",
                            "label": "Cardias"
                        },
                        {
                            "value": "fundus",
                            "label": "Fondo gástrico"
                        },
                        {
                            "value": "body",
                            "label": "Cuerpo gástrico"
                        },
                        {
                            "value": "antrum",
                            "label": "Antro gástrico"
                        },
                        {
                            "value": "pylorus",
                            "label": "Píloro"
                        },
                        {
                            "value": "lesser_curvature",
                            "label": "Curvatura menor"
                        },
                        {
                            "value": "greater_curvature",
                            "label": "Curvatura mayor"
                        },
                        {
                            "value": "anterior_wall",
                            "label": "Pared anterior"
                        },
                        {
                            "value": "posterior_wall",
                            "label": "Pared posterior"
                        },
                        {
                            "value": "stomach_nos",
                            "label": "Estómago, no especificado"
                        }
                    ],
                    "helpText": "(Nota B del CAP): La localización condiciona las cadenas ganglionares de drenaje (estaciones japonesas de la 1 a la 16). Los tumores antropilóricos drenan a ganglios subpilóricos y suprapilóricos; los de curvatura menor a ganglios gástricos izquierdos y del tronco celíaco."
                },
                {
                    "id": "egj_involvement",
                    "label": "Compromiso de la Unión Esofagogástrica (UEG) y Clasificación de Siewert",
                    "type": "radio",
                    "options": [
                        {
                            "value": "no_egj",
                            "label": "No compromete la Unión Esofagogástrica (epicentro enteramente gástrico >2 cm de la UEG)"
                        },
                        {
                            "value": "siewert_1",
                            "label": "Siewert Tipo I: Adenocarcinoma de esófago distal (epicentro 1 a 5 cm por encima de la UEG)"
                        },
                        {
                            "value": "siewert_2",
                            "label": "Siewert Tipo II: Adenocarcinoma del verdadero cardias/UEG (epicentro de 1 cm sobre a 2 cm bajo la UEG)"
                        },
                        {
                            "value": "siewert_3",
                            "label": "Siewert Tipo III: Adenocarcinoma subcardial (epicentro 2 a 5 cm bajo la UEG con invasión proximal)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota B del CAP): Regla estricta del AJCC 8va Edición: Si el punto medio (epicentro) del tumor se encuentra a 2.0 cm o menos de la UEG E invade el esófago tubular distal, el tumor DEBE ser clasificado y estadificado usando el protocolo de Esófago. Los tumores con epicentro a más de 2.0 cm de la UEG en el estómago proximal, o que no cruzan hacia el esófago, se estadifican usando el protocolo de Estómago."
                },
                {
                    "id": "egj_distance_cm",
                    "label": "Distancia del Centro del Tumor a la UEG (cm)",
                    "type": "number",
                    "suffix": "cm",
                    "helpText": "Distancia en centímetros desde el centro geométrico de la masa tumoral hasta la línea Z / unión esofagogástrica anatómica."
                },
                {
                    "id": "histologic_type_who",
                    "label": "Tipo Histológico (Clasificación de la OMS 5ta Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "tubular",
                            "label": "Adenocarcinoma tubular"
                        },
                        {
                            "value": "papillary",
                            "label": "Adenocarcinoma papilar"
                        },
                        {
                            "value": "mucinous",
                            "label": "Adenocarcinoma mucinoso (>50% de mucina extracelular)"
                        },
                        {
                            "value": "poorly_cohesive_signet",
                            "label": "Carcinoma pobremente cohesivo, tipo células en anillo de sello (>50% de células en anillo de sello)"
                        },
                        {
                            "value": "poorly_cohesive_other",
                            "label": "Carcinoma pobremente cohesivo, otras variantes no anillo de sello"
                        },
                        {
                            "value": "mixed_carcinoma",
                            "label": "Carcinoma mixto (componentes glandulares tubulares y componentes no cohesivos)"
                        },
                        {
                            "value": "medullary_ebv",
                            "label": "Carcinoma medular / carcinoma gástrico con estroma linfoide abundante (asociado a virus Epstein-Barr EBV)"
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
                            "value": "undifferentiated",
                            "label": "Carcinoma indiferenciado"
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
                    "helpText": "(Nota C del CAP): El carcinoma pobremente cohesivo incluye el subtipo clásico de anillo de sello (con abundante vacuola citoplasmática de mucina que desplaza el núcleo hacia la periferia) y variantes sin anillo de sello. El carcinoma con estroma linfoide (rico en TILs) con frecuencia es positivo para EBV (EBER por hibridación in situ) o dMMR/MSI-H."
                },
                {
                    "id": "lauren_classification",
                    "label": "Clasificación de Lauren del Adenocarcinoma",
                    "type": "radio",
                    "options": [
                        {
                            "value": "intestinal",
                            "label": "Tipo Intestinal (glándulas cohesivas bien o moderadamente diferenciadas, asociado a gastritis atrófica y metaplasia intestinal)"
                        },
                        {
                            "value": "diffuse",
                            "label": "Tipo Difuso (células aisladas no cohesivas, células en anillo de sello, patrón infiltrativo linitis plástica, mutación/pérdida de E-cadherina CDH1)"
                        },
                        {
                            "value": "mixed",
                            "label": "Tipo Mixto (componentes intestinales y difusos coexistentes en proporciones significativas)"
                        },
                        {
                            "value": "indeterminate",
                            "label": "Indeterminado"
                        }
                    ],
                    "helpText": "(Nota C del CAP): Clasificación de Lauren: El tipo Intestinal predomina en pacientes mayores, varones y zonas de alta prevalencia de H. pylori, siguiendo la cascada de Correa. El tipo Difuso ocurre a menudo en pacientes más jóvenes, no se asocia a metaplasia intestinal, muestra pérdida de expresión membranosa de E-cadherina (CDH1) y presenta un patrón de diseminación peritoneal/linfática difusa altamente agresivo."
                },
                {
                    "id": "histologic_grade",
                    "label": "Grado Histológico (Diferenciación)",
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
                            "label": "G3: Pobremente diferenciado (<50% de formación glandular, incluye carcinomas de células en anillo de sello)"
                        },
                        {
                            "value": "gx",
                            "label": "GX: El grado no puede ser evaluado"
                        }
                    ],
                    "helpText": "(Nota D del CAP): Sistema de 3 grados basado en la formación de túbulos glandulares. Los carcinomas de células en anillo de sello y pobremente cohesivos se asignan automáticamente a Grado 3."
                },
                {
                    "id": "tumor_size_greatest",
                    "label": "Dimensión Mayor del Tumor (cm)",
                    "type": "number",
                    "suffix": "cm",
                    "helpText": "Medición macroscópica y microscópica de la mayor extensión tumoral invasora."
                },
                {
                    "id": "tumor_size_add",
                    "label": "Dimensiones Adicionales (cm x cm)",
                    "type": "text",
                    "helpText": "Dimensiones adicionales del tumor (ej: 4.2 x 3.0 cm)."
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
                            "label": "pTX: El tumor primario no puede ser evaluado"
                        },
                        {
                            "value": "pt0",
                            "label": "pT0: Sin evidencia de tumor primario"
                        },
                        {
                            "value": "ptis",
                            "label": "pTis: Carcinoma in situ (intramucoso sin invasión de la lámina propia/muscularis mucosae)"
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
                            "label": "pT3: El tumor invade el tejido conectivo subseroso sin perforar el peritoneo visceral ni estructuras adyacentes"
                        },
                        {
                            "value": "pt4a",
                            "label": "pT4a: El tumor penetra la serosa (peritoneo visceral gástrico)"
                        },
                        {
                            "value": "pt4b",
                            "label": "pT4b: El tumor invade directamente órganos o estructuras adyacentes (bazo, colon transverso, hígado, páncreas, diafragma, epiplón)"
                        }
                    ],
                    "helpText": "(Nota J del CAP): Criterios de la 8va Edición del AJCC: En pT1a (cáncer gástrico temprano intramucoso), el riesgo de metástasis ganglionar es <3%, siendo susceptible de curación por disección endoscópica (ESD). En pT1b (invasión submucosa), el riesgo salta a 15-20%. Para pT4a, el tumor debe alcanzar la superficie mesotelial peritoneal visceral libre. La extensión continua a epiplón mayor o menor sin invadir otros órganos se clasifica como pT3 a menos que rompa la superficie peritoneal libre del epiplón (pT4a)."
                },
                {
                    "id": "nodes_examined",
                    "label": "Número Total de Ganglios Linfáticos Regionales Examinados",
                    "type": "number",
                    "helpText": "(Nota I del CAP): El AJCC y el CAP establecen que se deben examinar un MÍNIMO de 16 ganglios linfáticos regionales para una estadificación pN confiable (linfadenectomía D2 estándar típicamente rinde >=16 a 25 ganglios). Si se aíslan menos de 16 ganglios, existe riesgo sustancial de subclasificar la categoría N."
                },
                {
                    "id": "nodes_positive",
                    "label": "Número de Ganglios Linfáticos con Metástasis",
                    "type": "number",
                    "helpText": "Número de ganglios con metástasis microscópica o macroscópica de adenocarcinoma."
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
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "Ruptura de la cápsula ganglionar con invasión hacia la grasa periganglionar."
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
                            "value": "pn3a",
                            "label": "pN3a: Metástasis en 7 a 15 ganglios linfáticos regionales"
                        },
                        {
                            "value": "pn3b",
                            "label": "pN3b: Metástasis en 16 o más ganglios linfáticos regionales"
                        }
                    ],
                    "helpText": "(Nota I del CAP): La división de pN3 en pN3a (7 a 15 ganglios) y pN3b (>=16 ganglios) es un cambio crítico de la 8va edición debido a la marcada diferencia en la sobrevida global a 5 años entre ambos grupos."
                },
                {
                    "id": "pm_category",
                    "label": "Metástasis a Distancia (pM - AJCC 8va Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "na",
                            "label": "No aplicable (sin confirmación patológica)"
                        },
                        {
                            "value": "pm1",
                            "label": "pM1: Metástasis a distancia presente (incluye citología peritoneal positiva o metástasis ganglionar retropancreática/mesentérica)"
                        }
                    ],
                    "helpText": "Nota importante: Una citología de lavado peritoneal positiva para células malignas durante la laparoscopia se clasifica automáticamente como metástasis a distancia (M1)."
                }
            ]
        },
        {
            "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
            "fields": [
                {
                    "id": "margin_proximal",
                    "label": "Margen Quirúrgico Proximal (Esofágico / Gástrico)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometido (especificar distancia en cm/mm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved",
                            "label": "Comprometido por carcinoma invasor"
                        }
                    ],
                    "helpText": "(Nota H del CAP): En gastrectomías, el compromiso del margen proximal por células tumorales infiltrantes (frecuente en carcinoma difuso/anillo de sello) obliga a considerar re-resección intraoperatoria."
                },
                {
                    "id": "margin_distal",
                    "label": "Margen Quirúrgico Distal (Duodenal / Gástrico)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometido (especificar distancia en cm/mm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved",
                            "label": "Comprometido por carcinoma invasor"
                        }
                    ],
                    "helpText": "(Nota H del CAP): Margen duodenal o gástrico distal."
                },
                {
                    "id": "margin_omental",
                    "label": "Márgenes de Resección Omentales (Epiplón Mayor y Menor)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometidos"
                        },
                        {
                            "value": "involved",
                            "label": "Comprometidos por carcinoma invasor"
                        },
                        {
                            "value": "na",
                            "label": "No aplicable"
                        }
                    ],
                    "helpText": "Evalúa el borde libre de resección del tejido graso del epiplón mayor y menor resecado en bloque."
                }
            ]
        },
        {
            "name": "INVASIONES Y EFECTO DEL TRATAMIENTO",
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
                            "label": "Presente (linfática o venosa)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota F del CAP): Invasión de canales linfáticos o venas de la submucosa, muscular o subserosa. Factor pronóstico independiente adverso."
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
                    "helpText": "(Nota G del CAP): Invasión tumoral de espacios perineurales en la pared gástrica. Altamente prevalente en el adenocarcinoma difuso / células en anillo de sello."
                },
                {
                    "id": "treatment_effect",
                    "label": "Efecto del Tratamiento Neoadyuvante (CAP / Ryan o Becker)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "no_therapy",
                            "label": "Sin quimioterapia presúrgica conocida"
                        },
                        {
                            "value": "score_0",
                            "label": "Score 0 / Becker 1a: Respuesta patológica completa (sin células tumorales viables)"
                        },
                        {
                            "value": "score_1",
                            "label": "Score 1 / Becker 1b: Respuesta casi completa (<10% de células tumorales viables)"
                        },
                        {
                            "value": "score_2",
                            "label": "Score 2 / Becker 2: Respuesta parcial (10% a 50% de células tumorales viables)"
                        },
                        {
                            "value": "score_3",
                            "label": "Score 3 / Becker 3: Pobre o nula respuesta (>50% de células tumorales viables)"
                        }
                    ],
                    "helpText": "(Nota E del CAP): Cuantificación de la regresión histológica tras quimioterapia perioperatoria (ej: esquema FLOT). La respuesta patológica completa o casi completa se asocia a mejoría dramática en la sobrevida libre de recurrencia."
                }
            ]
        },
        {
            "name": "ESTUDIOS DE BIOMARCADORES Y ONCOLOGÍA DIRIGIDA",
            "fields": [
                {
                    "id": "her2_ihc",
                    "label": "Estado de HER2 por Inmunohistoquímica (Criterios de Hofman para Cáncer Gástrico)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "score_0",
                            "label": "Score 0 (Negativo: sin tinción o tinción membranosa en <10% de células en resección)"
                        },
                        {
                            "value": "score_1",
                            "label": "Score 1+ (Negativo: tinción membranosa débil/apenas visible en >=10% de células)"
                        },
                        {
                            "value": "score_2",
                            "label": "Score 2+ (Equívoco: tinción basolateral membranosa moderada completa/incompleta en >=10% de células)"
                        },
                        {
                            "value": "score_3",
                            "label": "Score 3+ (POSITIVO: tinción basolateral membranosa intensa en U en >=10% de células)"
                        },
                        {
                            "value": "pending",
                            "label": "Pendiente / En proceso"
                        },
                        {
                            "value": "not_performed",
                            "label": "No realizado"
                        }
                    ],
                    "helpText": "Criterios diagnósticos específicos de Hofman para cáncer gástrico: a diferencia de la mama, las glándulas gástricas son polarizadas y muestran frecuentemente tinción membranosa basolateral incompleta (en forma de 'U'). Los casos Score 2+ requieren prueba refleja por hibridación in situ (FISH/CISH). Los casos Score 3+ o FISH amplificado son candidatos a terapia dirigida con Trastuzumab."
                },
                {
                    "id": "her2_fish",
                    "label": "HER2 por Hibridación In Situ (FISH / CISH)",
                    "type": "radio",
                    "dependsOn": {
                        "field": "her2_ihc",
                        "value": "score_2"
                    },
                    "options": [
                        {
                            "value": "amplified",
                            "label": "AMPLIFICADO (Ratio HER2/CEP17 >= 2.0 o copia promedio de HER2 >= 6.0 señales/célula)"
                        },
                        {
                            "value": "not_amplified",
                            "label": "No amplificado (Ratio HER2/CEP17 < 2.0 y copias de HER2 < 4.0)"
                        },
                        {
                            "value": "pending",
                            "label": "En proceso / Pendiente"
                        }
                    ],
                    "helpText": "Estudio confirmatorio para casos HER2 IHQ 2+ equívocos."
                },
                {
                    "id": "mmr_status",
                    "label": "Estado de Reparación de Apareamiento (MMR por IHQ / MSI)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "pmmr",
                            "label": "pMMR / MSS: Expresión nuclear conservada en las 4 proteínas (MLH1, PMS2, MSH2, MSH6)"
                        },
                        {
                            "value": "dmmr",
                            "label": "dMMR / MSI-H: PÉRDIDA de expresión nuclear de proteínas MMR",
                            "hasInput": true
                        },
                        {
                            "value": "pending",
                            "label": "Pendiente"
                        }
                    ],
                    "helpText": "El fenotipo dMMR/MSI-H se observa en el 8-10% de carcinomas gástricos y predice una excelente respuesta a inhibidores de PD-1 (pembrolizumab), pero una respuesta reducida a la quimioterapia clásica perioperatoria con 5-FU/platino."
                },
                {
                    "id": "pdl1_cps",
                    "label": "PD-L1 Combined Positive Score (CPS)",
                    "type": "number",
                    "helpText": "CPS = (Número de células tumorales + linfocitos + macrófagos con tinción de membrana para PD-L1) / (Número total de células tumorales viables) x 100. Puntos de corte terapéuticos: CPS >= 1 y CPS >= 5 seleccionan pacientes para adición de Pembrolizumab o Nivolumab a la quimioterapia en primera línea."
                },
                {
                    "id": "claudin_18_2",
                    "label": "Expresión de Claudina 18.2 (Para terapia con Zolbetuximab)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "positive",
                            "label": "POSITIVO (Tinción membranosa de intensidad moderada a fuerte [2+/3+] en >= 75% de las células tumorales)"
                        },
                        {
                            "value": "negative",
                            "label": "Negativo (< 75% de células tumorales con tinción 2+/3+)"
                        },
                        {
                            "value": "not_performed",
                            "label": "No evaluado"
                        }
                    ],
                    "helpText": "Criterio biomarcador para el anticuerpo monoclonal Zolbetuximab: exige tinción membranosa al menos moderada (2+/3+) en un mínimo del 75% de las células neoplásicas."
                }
            ]
        }
    ]
}
