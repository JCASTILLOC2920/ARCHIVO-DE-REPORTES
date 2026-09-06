true = True
false = False
null = None
# -*- coding: utf-8 -*-
# Stomach GIST Biopsy Schema Builder
def build_stomach_gist_biopsy():
    return {
    "id": "stomach_gist_biopsy",
    "title": "Protocolo Sinóptico: Tumor del Estroma Gastrointestinal - GIST (Biopsia) - CAP v4.3.0.0",
    "targetField": "microDesc",
    "sections": [
        {
            "name": "INFORMACIÓN CLÍNICA Y ESPÉCIMEN",
            "fields": [
                {
                    "id": "procedure",
                    "label": "Procedimiento de Obtención de la Biopsia",
                    "type": "radio",
                    "options": [
                        {
                            "value": "endoscopic_core",
                            "label": "Biopsia endoscópica con aguja gruesa guiada por USE (EUS-FNB)"
                        },
                        {
                            "value": "endoscopic_forceps",
                            "label": "Biopsia endoscópica con pinza (fórceps)"
                        },
                        {
                            "value": "percutaneous_core",
                            "label": "Biopsia percutánea con aguja gruesa (core needle biopsy)"
                        },
                        {
                            "value": "laparoscopic_incisional",
                            "label": "Biopsia incisional laparoscópica"
                        },
                        {
                            "value": "other",
                            "label": "Otro procedimiento (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "En lesiones subepiteliales gástricas, la punción-biopsia guiada por ultrasonografía endoscópica (EUS-FNB) con aguja de corte histológico ofrece el mayor rendimiento diagnóstico para obtener cilindros tisulares evaluables."
                },
                {
                    "id": "preresection_treatment",
                    "label": "Tratamiento Previo con TKI (Imatinib u otros)",
                    "type": "radio",
                    "options": [
                        {
                            "value": "none",
                            "label": "Sin tratamiento previo conocido"
                        },
                        {
                            "value": "imatinib",
                            "label": "Recibiendo imatinib"
                        },
                        {
                            "value": "other",
                            "label": "Otro agente TKI (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "El tratamiento con imatinib induce cambios mixoides y arresto de figuras mitóticas."
                }
            ]
        },
        {
            "name": "EVALUACIÓN HISTOLÓGICA DE LA BIOPSIA",
            "fields": [
                {
                    "id": "tumor_site",
                    "label": "Sitio Anatómico de la Lesión",
                    "type": "select",
                    "options": [
                        {
                            "value": "stomach",
                            "label": "Estómago"
                        },
                        {
                            "value": "duodenum",
                            "label": "Duodeno"
                        },
                        {
                            "value": "jejunum_ileum",
                            "label": "Yeyuno / Íleon"
                        },
                        {
                            "value": "colon_rectum",
                            "label": "Colon / Recto"
                        },
                        {
                            "value": "other",
                            "label": "Otro sitio anatómico (especificar)",
                            "hasInput": true
                        }
                    ],
                    "helpText": "Localización anatómica comunicada por el endoscopista o radiólogo."
                },
                {
                    "id": "histologic_type",
                    "label": "Tipo Histológico Celular",
                    "type": "radio",
                    "options": [
                        {
                            "value": "spindle_cell",
                            "label": "Fusocelular (células fusiformes con núcleos elongados)"
                        },
                        {
                            "value": "epitheloid",
                            "label": "Epitelioide (células redondeadas poligonales)"
                        },
                        {
                            "value": "mixed",
                            "label": "Mixto fusocelular y epitelioide"
                        },
                        {
                            "value": "cannot_determine",
                            "label": "No se puede determinar por material escaso"
                        }
                    ],
                    "helpText": "Morfología celular observada en los cortes histológicos de la biopsia."
                },
                {
                    "id": "mitotic_rate",
                    "label": "Tasa Mitótica en el Material de Biopsia",
                    "type": "radio",
                    "options": [
                        {
                            "value": "low_lte_5",
                            "label": "Baja: Menor o igual a 5 mitosis por 5 mm² (<=5/5 mm² en cilindro tisular representativo)"
                        },
                        {
                            "value": "high_gt_5",
                            "label": "Alta: Mayor a 5 mitosis por 5 mm² (>5/5 mm²)"
                        },
                        {
                            "value": "inadequate_sample",
                            "label": "Material de biopsia insuficiente para abarcar 5 mm² de tumor viable"
                        }
                    ],
                    "helpText": "(Nota B del CAP): Alerta diagnóstica en biopsias: Debido al tamaño limitado de los cilindros de biopsia (que a menudo miden menos de 5 mm² de área total), el recuento mitótico puede subestimar el riesgo biológico real de la neoplasia."
                },
                {
                    "id": "necrosis",
                    "label": "Necrosis",
                    "type": "radio",
                    "options": [
                        {
                            "value": "not_identified",
                            "label": "No identificada"
                        },
                        {
                            "value": "present",
                            "label": "Presente"
                        }
                    ],
                    "helpText": "Presencia de necrosis focal o confluente en los fragmentos de la biopsia."
                }
            ]
        },
        {
            "name": "INMUNOHISTOQUÍMICA Y ESTUDIOS MOLECULARES",
            "fields": [
                {
                    "id": "cd117_kit",
                    "label": "KIT (CD117) por Inmunohistoquímica",
                    "type": "radio",
                    "options": [
                        {
                            "value": "positive",
                            "label": "POSITIVO (tinción citoplasmática/membranosa difusa)"
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
                    "helpText": "Confirmación diagnóstica primaria esencial para confirmar diagnóstico de GIST en biopsias pequeñas."
                },
                {
                    "id": "dog1_ano1",
                    "label": "DOG1 (Anoctamina 1) por Inmunohistoquímica",
                    "type": "radio",
                    "options": [
                        {
                            "value": "positive",
                            "label": "POSITIVO"
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
                    "helpText": "Complemento diagnóstico para descartar falsos negativos de CD117."
                },
                {
                    "id": "molecular_testing",
                    "label": "Estudio Mutacional Solicitado (KIT / PDGFRA)",
                    "type": "text",
                    "helpText": "Recomendado antes de iniciar terapia neoadyuvante con imatinib para confirmar susceptibilidad molecular (ej: descartar mutación de resistencia primaria PDGFRA D842V)."
                }
            ]
        }
    ]
}
