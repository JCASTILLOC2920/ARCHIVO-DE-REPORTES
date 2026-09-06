true = True
false = False
null = None
# -*- coding: utf-8 -*-
# Appendix Resection Schema Builder
def build_appendix_resection():
    return {
    "id": "appendix_resection",
    "title": "Protocolo Sinóptico: Apéndice Cecal (Resección) - CAP v5.1.0.0 / AJCC 8va Ed.",
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
                            "value": "appendectomy",
                            "label": "Apendicectomía (laparoscópica o abierta)"
                        },
                        {
                            "value": "cecectomy",
                            "label": "Cequectomía (resección parcial de ciego)"
                        },
                        {
                            "value": "right_hemicolectomy",
                            "label": "Hemicolectomía derecha (resección ileocecal formal)"
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
                    "helpText": "(Nota A del CAP): Tipo de intervención quirúrgica. En LAMN no complicado con margen cecal libre, la apendicectomía simple suele ser curativa. En adenocarcinoma invasor o adenocarcinoma de células caliciformes (GCA) de alto grado, se requiere hemicolectomía derecha oncológica para linfadenectomía regional."
                }
            ]
        },
        {
            "name": "CARACTERÍSTICAS DEL TUMOR Y LOCALIZACIÓN",
            "fields": [
                {
                    "id": "tumor_site",
                    "label": "Sitio Anatómico en el Apéndice",
                    "type": "checkbox",
                    "options": [
                        {
                            "value": "tip",
                            "label": "Punta apendicular"
                        },
                        {
                            "value": "body",
                            "label": "Cuerpo / tercio medio"
                        },
                        {
                            "value": "base",
                            "label": "Base apendicular"
                        },
                        {
                            "value": "diffuse",
                            "label": "Difuso / compromiso de toda la longitud del órgano"
                        }
                    ],
                    "helpText": "(Nota B del CAP): La localización en la base apendicular incrementa el riesgo de margen quirúrgico proximal comprometido e invasión directa del ciego."
                },
                {
                    "id": "base_involvement",
                    "label": "Compromiso de la Base del Apéndice",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometida (base libre de neoplasia)"
                        },
                        {
                            "value": "involved",
                            "label": "COMPROMETIDA por neoplasia / mucina neoplásica"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "El compromiso de la base exige correlación directa con el margen de resección proximal del ciego."
                },
                {
                    "id": "histologic_type",
                    "label": "Tipo Histológico (OMS 5ta Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "lamn",
                            "label": "Neoplasia mucinosa apendicular de bajo grado (LAMN)"
                        },
                        {
                            "value": "hamn",
                            "label": "Neoplasia mucinosa apendicular de alto grado (HAMN)"
                        },
                        {
                            "value": "mucinous_adenocarcinoma",
                            "label": "Adenocarcinoma mucinoso (>50% de mucina con invasión estromal destructiva)"
                        },
                        {
                            "value": "adenocarcinoma_colonic",
                            "label": "Adenocarcinoma no mucinoso (tipo colónico convencional)"
                        },
                        {
                            "value": "signet_ring",
                            "label": "Carcinoma de células en anillo de sello / pobremente cohesivo"
                        },
                        {
                            "value": "gca_grade_1",
                            "label": "Adenocarcinoma de células caliciformes (GCA) - Grado 1 (túbulos uniformes, <25% sólido/anillo de sello)"
                        },
                        {
                            "value": "gca_grade_2",
                            "label": "Adenocarcinoma de células caliciformes (GCA) - Grado 2 (25% a 50% de nidos irregulares/anillo de sello)"
                        },
                        {
                            "value": "gca_grade_3",
                            "label": "Adenocarcinoma de células caliciformes (GCA) - Grado 3 (>50% de patrón sólido o pleomórfico)"
                        },
                        {
                            "value": "net_g1",
                            "label": "Tumor neuroendocrino bien diferenciado (NET G1 / carcinoide)"
                        },
                        {
                            "value": "other",
                            "label": "Otro tipo histológico (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "(Nota C del CAP): LAMN se define por epitelio mucinoso con atipia de bajo grado que crece en empuje ('pushing border') con disección de mucina a través de la pared apendicular adelgazada o hialinizada, sin infiltración destructiva estromal. El Adenocarcinoma de Células Caliciformes (GCA) es una neoplasia anfícrina exclusiva del apéndice que se subclasifica en 3 grados (según consenso Tang/OMS) con impacto pronóstico crítico."
                },
                {
                    "id": "peritoneal_mucin",
                    "label": "Mucina Extra-Apendicular / Peritoneal (Pseudomixoma Peritoneal)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "none",
                            "label": "No identificada (mucina confinada estrictamente a la luz o pared apendicular)"
                        },
                        {
                            "value": "acellular_serosa",
                            "label": "Mucina ACELULAR en serosa apendicular o peritoneo adyacente"
                        },
                        {
                            "value": "cellular_peritoneal",
                            "label": "Mucina CELULAR (con células epiteliales viables) en serosa o cavidad peritoneal"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota C y I del CAP): Distinción pronóstica fundamental en neoplasias mucinosas: La presencia de mucina ACELULAR (sin células neoplásicas) en el peritoneo confiere un pronóstico sustancialmente más favorable que la presencia de epitelio neoplásico flotante (mucina CELULAR), la cual define el pseudomixoma peritoneal florido con riesgo elevado de progresión masiva."
                },
                {
                    "id": "histologic_grade",
                    "label": "Grado Histológico",
                    "type": "radio",
                    "options": [
                        {
                            "value": "g1_low",
                            "label": "G1: Bajo grado (Bien diferenciado / concordante con LAMN)"
                        },
                        {
                            "value": "g2_mod",
                            "label": "G2: Moderadamente diferenciado"
                        },
                        {
                            "value": "g3_high",
                            "label": "G3: Alto grado (Pobremente diferenciado / HAMN / células en anillo de sello)"
                        },
                        {
                            "value": "cannot_assess",
                            "label": "No aplicable"
                        }
                    ],
                    "helpText": "(Nota D del CAP): El grado histológico del tumor apendicular y del componente peritoneal debe ser concordante. El grado alto en el peritoneo predice una sobrevida significativamente menor tras cirugía citorreductora e HIPEC."
                },
                {
                    "id": "tumor_size_greatest",
                    "label": "Dimensión Mayor del Tumor / Masa Apendicular (cm)",
                    "type": "number",
                    "suffix": "cm",
                    "helpText": "Diámetro mayor del tumor apendicular o del apéndice ectásico con mucocele."
                }
            ]
        },
        {
            "name": "PROFUNDIDAD DE INVASIÓN Y ESTADIFICACIÓN (pTNM - AJCC 8va Ed.)",
            "fields": [
                {
                    "id": "pt_category_lamn",
                    "label": "Categoría pT Específica para LAMN (Neoplasia Mucinosa de Bajo Grado)",
                    "type": "select",
                    "dependsOn": {
                        "field": "histologic_type",
                        "value": "lamn"
                    },
                    "options": [
                        {
                            "value": "ptis_lamn",
                            "label": "pTis(LAMN): LAMN confinado al apéndice (mucina o epitelio que diseca muscular o subserosa pero con serosa peritoneal intacta)"
                        },
                        {
                            "value": "pt3_lamn",
                            "label": "pT3: LAMN que invade directamente el mesoapéndice pero sin romper la serosa peritoneal"
                        },
                        {
                            "value": "pt4a_lamn",
                            "label": "pT4a: LAMN que penetra la serosa peritoneal visceral (mucina o epitelio neoplásico en la superficie serosa externa)"
                        },
                        {
                            "value": "pt4b_lamn",
                            "label": "pT4b: LAMN que invade directamente otros órganos o estructuras adyacentes"
                        }
                    ],
                    "helpText": "(Nota I del CAP): Clasificación exclusiva para LAMN en la 8va edición: Las categorías pT1 y pT2 NO se aplican a LAMN debido a la atrofia parietal y el crecimiento empujante. Si la mucina o el epitelio de bajo grado disecan la pared hasta la subserosa pero la serosa mesotelial externa está intacta, se clasifica como pTis(LAMN). Si la mucina o células rompen la serosa hacia la cavidad libre, se reclasifica como pT4a."
                },
                {
                    "id": "pt_category_adenocarcinoma",
                    "label": "Categoría pT para Adenocarcinoma Convencional y GCA",
                    "type": "select",
                    "options": [
                        {
                            "value": "ptx",
                            "label": "pTX: No evaluable"
                        },
                        {
                            "value": "pt0",
                            "label": "pT0: Sin tumor primario"
                        },
                        {
                            "value": "ptis",
                            "label": "pTis: Carcinoma in situ (intramucoso)"
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
                            "label": "pT3: El tumor invade la subserosa o el mesoapéndice"
                        },
                        {
                            "value": "pt4a",
                            "label": "pT4a: El tumor penetra la superficie del peritoneo visceral (serosa)"
                        },
                        {
                            "value": "pt4b",
                            "label": "pT4b: El tumor invade directamente otros órganos contiguos (ciego, íleon, pared abdominal)"
                        }
                    ],
                    "helpText": "Estadificación convencional AJCC para carcinomas invasivos destructivos."
                },
                {
                    "id": "nodes_examined",
                    "label": "Total de Ganglios Linfáticos Regionales Examinados",
                    "type": "number",
                    "helpText": "(Nota I del CAP): Mínimo recomendado de 12 ganglios en caso de hemicolectomía derecha. En apendicectomía aislada habitualmente se evalúan solo ganglios del mesoapéndice (0 a 3)."
                },
                {
                    "id": "nodes_positive",
                    "label": "Número de Ganglios con Metástasis",
                    "type": "number",
                    "helpText": "Número de ganglios metastásicos."
                },
                {
                    "id": "pn_category",
                    "label": "Ganglios Linfáticos Regionales (pN - AJCC 8va Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "pn0",
                            "label": "pN0: Sin metástasis ganglionares"
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
                            "label": "pN1c: Depósitos tumorales en mesoapéndice sin metástasis ganglionares"
                        },
                        {
                            "value": "pn2",
                            "label": "pN2: Metástasis en 4 o más ganglios regionales"
                        },
                        {
                            "value": "pnx",
                            "label": "pNX: No evaluable"
                        }
                    ],
                    "helpText": "Clasificación ganglionar según AJCC 8va edición."
                },
                {
                    "id": "pm_category",
                    "label": "Metástasis a Distancia (pM - Subclasificación Peritoneal AJCC 8va Ed.)",
                    "type": "select",
                    "options": [
                        {
                            "value": "na",
                            "label": "No aplicable (sin diseminación confirmada)"
                        },
                        {
                            "value": "pm1a",
                            "label": "pM1a: Diseminación intraperitoneal de MUCINA ACELULAR exclusivamente"
                        },
                        {
                            "value": "pm1b",
                            "label": "pM1b: Metástasis peritoneal con CÉLULAS EPITELIALES de bajo grado (LAMN / G1)"
                        },
                        {
                            "value": "pm1c",
                            "label": "pM1c: Metástasis peritoneal de ALTO GRADO (con células en anillo de sello o adenocarcinoma G2/G3), o metástasis a distancia extraperitoneal"
                        }
                    ],
                    "helpText": "(Nota I del CAP): Subclasificación pronóstica revolucionaria en el apéndice: pM1a (mucina acelular) tiene una excelente supervivencia (>85% a 5 años); pM1b (células epiteliales de bajo grado) tiene pronóstico intermedio tras peritonectomía e HIPEC; pM1c (células de alto grado/anillo de sello) tiene mal pronóstico."
                }
            ]
        },
        {
            "name": "MÁRGENES QUIRÚRGICOS DE RESECCIÓN",
            "fields": [
                {
                    "id": "margin_proximal_cecal",
                    "label": "Margen Proximal de Resección (Base Apendicular / Cecal)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometido (especificar distancia libre en mm)",
                            "hasInput": true
                        },
                        {
                            "value": "involved_lamn_mucin",
                            "label": "COMPROMETIDO por epitelio neoplásico / mucina acelular de LAMN"
                        },
                        {
                            "value": "involved_carcinoma",
                            "label": "COMPROMETIDO por adenocarcinoma invasor"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "(Nota H del CAP): En apendicectomía por LAMN, un margen cecal comprometido por epitelio neoplásico obliga a valorar la re-escisión de la base cecal o cequectomía para evitar recurrencia peritoneal tardía."
                },
                {
                    "id": "margin_mesoappendix",
                    "label": "Margen Radial / Mesentérico (Mesoapéndice)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "uninvolved",
                            "label": "No comprometido"
                        },
                        {
                            "value": "involved",
                            "label": "Comprometido por tumor / mucina"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar"
                        }
                    ],
                    "helpText": "Borde vascular de resección del mesoapéndice."
                }
            ]
        },
        {
            "name": "INVASIONES Y ESTUDIOS ESPECIALES",
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
                    "helpText": "(Nota F del CAP): En LAMN la invasión vascular está ausente. Es muy prevalente en adenocarcinoma convencional y adenocarcinoma de células caliciformes (GCA)."
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
                    "helpText": "(Nota G del CAP): Invasión de filetes nerviosos en la pared apendicular o mesoapéndice."
                }
            ]
        }
    ]
}
