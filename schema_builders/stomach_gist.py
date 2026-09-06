true = True
false = False
null = None
# -*- coding: utf-8 -*-
# Stomach GIST Resection Schema Builder
def build_stomach_gist_resection():
    return {
    "id": "stomach_gist_resection",
    "title": "Protocolo Sinóptico: Tumor del Estroma Gastrointestinal - GIST (Resección) - CAP v4.3.0.0 / AJCC 8va Ed.",
    "targetField": "microDesc",
    "sections": [
        {
            "name": "INFORMACIÓN CLÍNICA Y PROCEDIMIENTO",
            "fields": [
                {
                    "id": "associated_syndrome",
                    "label": "Síndrome Asociado",
                    "type": "radio",
                    "options": [
                        {
                            "value": "none",
                            "label": "Ninguno conocido (caso esporádico)"
                        },
                        {
                            "value": "nf1",
                            "label": "Neurofibromatosis tipo 1 (NF1)"
                        },
                        {
                            "value": "carney_triad",
                            "label": "Tríada de Carney (GIST gástrico, paraganglioma, condroma pulmonar)"
                        },
                        {
                            "value": "carney_stratakis",
                            "label": "Síndrome de Carney-Stratakis (GIST familiar y paraganglioma, deficiencia SDH)"
                        },
                        {
                            "value": "other",
                            "label": "Otro síndrome (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "Los GIST sindrómicos (ej: asociados a NF1 o deficiencia de succinato deshidrogenasa SDH) a menudo son gástricos multifocales, carecen de mutaciones KIT/PDGFRA y tienen menor sensibilidad al tratamiento estándar con imatinib."
                },
                {
                    "id": "preresection_treatment",
                    "label": "Tratamiento Previo a la Resección (Inhibidores de Tirosina Quinasa TKI)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "none",
                            "label": "Sin tratamiento previo conocido (paciente virgen de tratamiento)"
                        },
                        {
                            "value": "imatinib",
                            "label": "Imatinib mesilato"
                        },
                        {
                            "value": "other_tki",
                            "label": "Otro agente TKI (sunitinib, regorafenib, ripretinib, avapritinib)",
                            "hasInput": true
                        },
                        {
                            "value": "unspecified",
                            "label": "Tratamiento recibido pero agente no especificado"
                        }
                    ],
                    "helpText": "(Nota C del CAP): El tratamiento neoadyuvante con imatinib induce cambios citológicos e histológicos marcados (degeneración mixoide, hialinización y reducción drástica de figuras mitóticas). El recuento mitótico tras TKI no refleja con exactitud el riesgo biológico basal."
                },
                {
                    "id": "procedure",
                    "label": "Procedimiento Quirúrgico",
                    "type": "radio",
                    "options": [
                        {
                            "value": "wedge_resection",
                            "label": "Gastrectomía en cuña (resección gástrica no anatómica)"
                        },
                        {
                            "value": "subtotal_gastrectomy",
                            "label": "Gastrectomía subtotal / distal"
                        },
                        {
                            "value": "total_gastrectomy",
                            "label": "Gastrectomía total"
                        },
                        {
                            "value": "enucleation",
                            "label": "Enucleación local"
                        },
                        {
                            "value": "segmental_bowel",
                            "label": "Resección segmentaria de intestino delgado / colon"
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
                    "helpText": "A diferencia del adenocarcinoma, los GIST raramente dan metástasis a ganglios linfáticos regionales (<1-2%), por lo que la resección en cuña R0 con márgenes libres sin linfadenectomía formal suele ser suficiente."
                }
            ]
        },
        {
            "name": "CARACTERÍSTICAS DEL TUMOR Y MORFOLOGÍA",
            "fields": [
                {
                    "id": "tumor_focality",
                    "label": "Focalidad Tumoral",
                    "type": "radio",
                    "options": [
                        {
                            "value": "unifocal",
                            "label": "Unifocal (tumor único)"
                        },
                        {
                            "value": "multifocal",
                            "label": "Multifocal (múltiples nódulos tumorales sincrónicos - especificar número y tamaños)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "La multifocalidad en el estómago puede indicar GIST primario múltiple (asociado a mutaciones germinales en KIT o deficiencia en SDH) o implantes metastásicos peritoneales sincrónicos."
                },
                {
                    "id": "tumor_site",
                    "label": "Sitio Anatómico del Tumor Primario",
                    "type": "select",
                    "options": [
                        {
                            "value": "stomach",
                            "label": "Estómago (fondo, cuerpo, antro)"
                        },
                        {
                            "value": "duodenum",
                            "label": "Duodeno"
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
                            "value": "colon",
                            "label": "Colon"
                        },
                        {
                            "value": "rectum",
                            "label": "Recto"
                        },
                        {
                            "value": "omentum_mesentery",
                            "label": "Epiplón / Mesenterio / Peritoneo (GIST extraintestinal / EGIST)"
                        },
                        {
                            "value": "other",
                            "label": "Otro sitio anatómico (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "(Nota A del CAP): El sitio anatómico es un factor determinante en la estratificación de riesgo de Miettinen/AFIP: a igual tamaño e índice mitótico, los GIST gástricos tienen un pronóstico SIGNIFICATIVAMENTE más favorable que los GIST de intestino delgado, colon o recto."
                },
                {
                    "id": "histologic_type",
                    "label": "Tipo Histológico Celular",
                    "type": "radio",
                    "options": [
                        {
                            "value": "spindle_cell",
                            "label": "Fusocelular (70%: fascículos o verticilos de células fusiformes con núcleos alargados y extremos romos)"
                        },
                        {
                            "value": "epitheloid",
                            "label": "Epitelioide (20%: células poligonales o redondeadas en nidos/sábanas con citoplasma eosinófilo o claro)"
                        },
                        {
                            "value": "mixed",
                            "label": "Mixto fusocelular y epitelioide (10%)"
                        }
                    ],
                    "helpText": "El tipo fusocelular es el más común (70%), mientras que el tipo epitelioide (20%) predomina en GIST con mutaciones en PDGFRA (D842V) y en GIST deficientes en complejo SDH (succinato deshidrogenasa)."
                },
                {
                    "id": "tumor_size_greatest",
                    "label": "Dimensión Mayor del Tumor (cm)",
                    "type": "number",
                    "suffix": "cm",
                    "helpText": "(Nota D del CAP): Parámetro crítico de la clasificación de riesgo de Miettinen y de la estadificación pT: <= 2.0 cm, > 2.0 a 5.0 cm, > 5.0 a 10.0 cm, > 10.0 cm."
                },
                {
                    "id": "mitotic_count_5mm2",
                    "label": "Conteo Mitótico Exacto por 5 mm² de Tumor",
                    "type": "number",
                    "helpText": "(Nota B del CAP): Estandarización de 5 mm²: En microscopios antiguos, 5 mm² equivalían a 50 campos de gran aumento (HPF) con ocular de campo visual FN 18-20 mm. En microscopios modernos con oculares de gran campo (FN 22 mm), 5 mm² se abarcan en aproximadamente 20 a 25 campos de gran aumento (40x). Se debe contar en la zona de mayor densidad mitótica (hotspot)."
                },
                {
                    "id": "mitotic_rate",
                    "label": "Tasa Mitótica (Punto de Corte de Riesgo)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "low_lte_5",
                            "label": "Tasa mitótica baja: Menor o igual a 5 mitosis por 5 mm² (<= 5 / 5 mm²)"
                        },
                        {
                            "value": "high_gt_5",
                            "label": "Tasa mitótica alta: Mayor a 5 mitosis por 5 mm² (> 5 / 5 mm²)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "(Nota B del CAP): Punto de corte crucial (>5 mitosis por 5 mm²) que divide los tumores en bajo versus alto grado histológico y define el grupo de riesgo para progresión metastásica."
                },
                {
                    "id": "necrosis",
                    "label": "Necrosis Tumoral",
                    "type": "radio",
                    "options": [
                        {
                            "value": "not_identified",
                            "label": "No identificada"
                        },
                        {
                            "value": "present",
                            "label": "Presente (especificar porcentaje aproximado)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "La necrosis tumoral espontánea extensa (no debida a tratamiento) es un marcador de alta agresividad biológica en GIST."
                },
                {
                    "id": "tumor_rupture",
                    "label": "Rotura Tumoral (Espontánea o Quirúrgica)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "not_identified",
                            "label": "No identificada (pseudocápsula intacta)"
                        },
                        {
                            "value": "present",
                            "label": "PRESENTE (perforación de la cápsula tumoral, derrame intraabdominal o fractura de la masa)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "Factor de impacto catastrófico: La rotura tumoral (sea preoperatoria o por maniobras quirúrgicas) derrama células tumorales en la cavidad peritoneal e implica un riesgo de recurrencia peritoneal cercano al 100%. Clasifica al paciente AUTOMÁTICAMENTE en el grupo de RIESGO MUY ALTO independientemente del tamaño tumoral o del número de mitosis, requiriendo terapia adyuvante indefinida con imatinib."
                }
            ]
        },
        {
            "name": "ESTRATIFICACIÓN DE RIESGO Y CLASIFICACIÓN pTNM",
            "fields": [
                {
                    "id": "risk_stratification_afip",
                    "label": "Estratificación de Riesgo de Recurrencia / Progresión (Criterios de Miettinen / AFIP)",
                    "type": "select",
                    "options": [
                        {
                            "value": "none_very_low",
                            "label": "Ninguno / Riesgo Muy Bajo (ej: gástrico <=2 cm con <=5 mitosis/5 mm²)"
                        },
                        {
                            "value": "low",
                            "label": "Riesgo Bajo (ej: gástrico 2.1 a 5 cm con <=5 mitosis/5 mm²)"
                        },
                        {
                            "value": "moderate",
                            "label": "Riesgo Moderado (ej: gástrico 5.1 a 10 cm con <=5 mitosis/5 mm²)"
                        },
                        {
                            "value": "high",
                            "label": "Riesgo Alto (ej: gástrico >10 cm o >5 mitosis/5 mm², o cualquier tamaño con rotura tumoral)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No determinado"
                        }
                    ],
                    "helpText": "(Nota D del CAP): Tabla pronóstica de Miettinen y Lasota (AFIP). Para tumores gástricos: <=2 cm y <=5 mit = Riesgo nulo/muy bajo; 2.1-5 cm y <=5 mit = Bajo (1.9%); 5.1-10 cm y <=5 mit = Moderado (3.6%); >10 cm y <=5 mit = Alto (12%). Si las mitosis superan 5/5 mm²: <=2 cm = Ninguno (0%); 2.1-5 cm = Alto (16%); 5.1-10 cm = Alto (55%); >10 cm = Alto (86%)."
                },
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
                            "value": "pt1",
                            "label": "pT1: Tumor de 2.0 cm o menos en su mayor dimensión (<= 2 cm)"
                        },
                        {
                            "value": "pt2",
                            "label": "pT2: Tumor mayor de 2.0 cm pero no mayor de 5.0 cm (> 2 a 5 cm)"
                        },
                        {
                            "value": "pt3",
                            "label": "pT3: Tumor mayor de 5.0 cm pero no mayor de 10.0 cm (> 5 a 10 cm)"
                        },
                        {
                            "value": "pt4",
                            "label": "pT4: Tumor mayor de 10.0 cm en su mayor dimensión (> 10 cm)"
                        }
                    ],
                    "helpText": "(Nota F del CAP): La estadificación pT para GIST depende exclusivamente de la mayor dimensión del tumor primario medida macroscópica y microscópicamente."
                },
                {
                    "id": "pn_category",
                    "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "pn0",
                            "label": "pN0: Sin metástasis ganglionares regionales (o ganglios no resecados clínicamente negativos)"
                        },
                        {
                            "value": "pn1",
                            "label": "pN1: Metástasis en ganglios linfáticos regionales presente"
                        },
                        {
                            "value": "pnx",
                            "label": "pNX: No evaluable"
                        }
                    ],
                    "helpText": "(Nota E del CAP): Las metástasis ganglionares son extraordinariamente raras en GIST adultos (<1%). Si no se identifican ganglios macroscópicos en el espécimen de resección y clínicamente no hubo sospecha, el caso se asigna por convención a pN0 en lugar de pNX."
                },
                {
                    "id": "pm_category",
                    "label": "Metástasis a Distancia (pM - AJCC 8va Ed.)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "na",
                            "label": "No aplicable (sin confirmación patológica de metástasis a distancia)"
                        },
                        {
                            "value": "pm1",
                            "label": "pM1: Metástasis a distancia presente (sitios más frecuentes: hígado, epiplón y peritoneo)"
                        }
                    ],
                    "helpText": "Los sitios predominantes de diseminación metastásica en GIST son el hígado (vía hematógena portal) y la cavidad peritoneal."
                }
            ]
        },
        {
            "name": "MÁRGENES DE RESECCIÓN QUIRÚRGICA",
            "fields": [
                {
                    "id": "margin_status",
                    "label": "Estado de los Márgenes Quirúrgicos de Resección",
                    "type": "radio",
                    "options": [
                        {
                            "value": "r0",
                            "label": "R0: Márgenes libres de tumor (márgenes microscópicos no comprometidos, especificar distancia)",
                            "hasInput": true
                        },
                        {
                            "value": "r1",
                            "label": "R1: Margen microscópicamente comprometido por tumor en la superficie entintada de sección quirúrgica"
                        },
                        {
                            "value": "r2",
                            "label": "R2: Margen macroscópicamente comprometido (enfermedad residual macroscópica)"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "La resección completa R0 sin romper la pseudocápsula es el objetivo quirúrgico curativo primordial."
                }
            ]
        },
        {
            "name": "INMUNOHISTOQUÍMICA Y GENÉTICA MOLECULAR",
            "fields": [
                {
                    "id": "cd117_kit",
                    "label": "Inmunohistoquímica KIT (CD117)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "positive_diffuse",
                            "label": "POSITIVO fuerte y difuso (citoplasmático / membranoso / perinuclear dot-like) (>95% de GIST)"
                        },
                        {
                            "value": "positive_focal",
                            "label": "Positivo focal"
                        },
                        {
                            "value": "negative",
                            "label": "Negativo (<5% de casos, típicamente GIST mutados en PDGFRA o deficientes en SDH)"
                        },
                        {
                            "value": "pending",
                            "label": "Pendiente"
                        }
                    ],
                    "helpText": "(Nota G del CAP): CD117 es el marcador diagnóstico patognomónico clásico del GIST. Tinción citoplasmática difusa con refuerzo perinuclear."
                },
                {
                    "id": "dog1_ano1",
                    "label": "Inmunohistoquímica DOG1 (Discovered on GIST-1 / Anoctamina 1)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "positive",
                            "label": "POSITIVO (membranoso y citoplasmático)"
                        },
                        {
                            "value": "negative",
                            "label": "Negativo"
                        },
                        {
                            "value": "pending",
                            "label": "Pendiente"
                        }
                    ],
                    "helpText": "(Nota G del CAP): Marcador altamente sensible y específico, especialmente útil para diagnosticar GIST CD117-negativos con mutaciones en PDGFRA o deficientes en KIT."
                },
                {
                    "id": "sdhb_ihc",
                    "label": "Inmunohistoquímica SDHB (Subunidad B de Succinato Deshidrogenasa)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "intact",
                            "label": "Expresión granular citoplasmática conservada (GIST no deficiente en complejo SDH)"
                        },
                        {
                            "value": "loss_deficient",
                            "label": "PÉRDIDA de expresión (GIST deficiente en SDH / síndrome de Carney / Carney-Stratakis)"
                        },
                        {
                            "value": "not_performed",
                            "label": "No realizado"
                        }
                    ],
                    "helpText": "La pérdida de expresión mitocondrial de SDHB identifica los GIST deficientes en el complejo SDH, típicos de pacientes jóvenes y niños con tumores gástricos multifocales epitelioides."
                },
                {
                    "id": "mutation_analysis",
                    "label": "Análisis Mutacional por Secuenciación (KIT y PDGFRA)",
                    "type": "text",
                    "helpText": "(Nota G del CAP): Mutaciones en KIT (exón 11 [más común, excelente respuesta a imatinib], exón 9 [requiere dosis doble de 800 mg de imatinib], exones 13 y 17). Mutación PDGFRA exón 18 D842V confiere resistencia primaria completa a imatinib, respondiendo a avapritinib."
                }
            ]
        }
    ]
}
