path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\plantillas_data.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

last_idx = content.find("PÓLIPO ENDOCERVICAL CON INFLAMACIÓN AGUDA")
bracket_idx = content.find("];", last_idx)

if last_idx != -1 and bracket_idx != -1:
    new_template_str = """,
    {
        id: 33,
        categoryId: 4,
        titulo: "BIOPSIA ENDOMETRIAL CON MATERIAL HEMÁTICO E HIPERPLASIA SIMPLE",
        macro: "se recibe una muestra de curetaje endometrial que consiste en un volumen total aproximado de 1.5 cc, compuesto en un 70% por coágulos hemáticos oscuros y fragmentos fibrinoides, y en un 30% por tejido de aspecto friable, pardogrisáceo y de consistencia blanda. el material remitido se incluye en su totalidad para procesamiento histológico en dos casetes.",
        micro: "los cortes histológicos revelan un patrón mixto donde predominan extensos depósitos de sangre aguda y material fibrinoide. en las áreas de epitelio endometrial viable, se observa un endometrio en fase proliferativa que muestra un incremento en la densidad glandular con una relación glándula/estroma superior a la esperada para la fase del ciclo. las glándulas presentan morfología variable, con formas redondeadas u ovaladas, algunas ligeramente anguladas, pero sin evidencia de complejidad arquitectural (no hay fenestración, empapelamiento ni brotes). el epitelio glandular es columnar, con núcleos seudoestratificados de cromatina fina, uniformes en tamaño y forma, con nucléolos inconspicuos o ausentes, y con polaridad mantenida. no se identifican atipias citológicas (nucleomegalia, hipercromasia, irregularidades de la membrana nuclear ni nucléolos prominentes). el estroma es compacto, celular y muestra actividad mitótica escasa, sin atipia estromal. no se observan cambios preneoplásicos de mayor grado ni elementos de malignidad.",
        diag: "ENDOMETRIO, CURETAJE:\\nENDOMETRIO CON HIPERPLASIA SIMPLE (GLANDULAR Y ESTROMAL) SIN ATIPIA CITOLÓGICA, EN UN CONTEXTO DE MATERIAL HEMÁTICO ABUNDANTE; NEGATIVA PARA HIPERPLASIA ATÍPICA O CARCINOMA."
    }"""
    
    new_content = content[:bracket_idx].rstrip() + new_template_str + "\n];" + content[bracket_idx+2:]
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("SUCCESSFULLY ADDED BIOPSIA ENDOMETRIAL TEMPLATE ID 33!")
else:
    print("Failed to find target positions in plantillas_data.js!")
