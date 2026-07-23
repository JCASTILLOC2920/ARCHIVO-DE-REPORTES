path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\plantillas_data.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's search for the last closing bracket of the defaultTemplates array.
# The array ends right before "window.defaultTemplates = defaultTemplates;"
# We can find where "MORCELADOS DE PR" is, and then find the next "];"
last_idx = content.find("MORCELADOS DE PR")
bracket_idx = content.find("];", last_idx)

if last_idx != -1 and bracket_idx != -1:
    # Insert new template right before "];"
    new_template_str = """,
    {
        id: 32,
        categoryId: 4,
        titulo: "PÓLIPO ENDOCERVICAL CON INFLAMACIÓN AGUDA Y TEJIDO DE GRANULACIÓN",
        macro: "se recibe un fragmento polipoide de tejido blando, de consistencia firme-elástica, que mide 1.8 x 1.2 x 0.9 cm en sus dimensiones máximas. la superficie externa es ligeramente lobulada, de color pardo-rojiza, con áreas focales de aspecto hemorrágico. el corte transversal muestra una estructura sólida de aspecto mixoide y vascular, sin áreas quísticas ni focos indurados evidentes. el espécimen se incluye en su totalidad en dos casetes.",
        micro: "el estudio histológico revela una lesión polipoide exofítica cubierta por epitelio cilíndrico simple mucosecretor, de tipo endocervical, con áreas de metaplasia escamosa inmadura focal. el estroma del pólipo está expandido por un tejido de granulación exuberante, caracterizado por una proliferación de capilares delgados de disposición perpendicular a la superficie, rodeados por un estroma edematoso y mixoide con inflamación crónica de base. destaca un infiltrado inflamatorio agudo extenso, compuesto por abundantes neutrófilos polimorfonucleares, que se extienden desde la superficie epitelial (exocitosis) hacia el estroma superficial, asociado a depósitos de fibrina y eritrocitos extravasados. no se identifican atipias citológicas ni arquitecturales en el epitelio de cobertura, ni en las glándulas endocervicales subyacentes. el estroma carece de células fusiformes atípicas, figuras mitóticas anormales o necrosis tumoral. los bordes de resección muestran márgenes libres de lesión.",
        diag: "PÓLIPO ENDOCERVICAL, EXÉRESIS:\\nPÓLIPO ENDOCERVICAL CON INFLAMACIÓN AGUDA ACTIVA Y TEJIDO DE GRANULACIÓN EXUBERANTE, NEGATIVO PARA DISPLASIA O MALIGNIDAD."
    }"""
    
    new_content = content[:bracket_idx].rstrip() + new_template_str + "\n];" + content[bracket_idx+2:]
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("SUCCESSFULLY INSERTED GINECOLOGIA TEMPLATE!")
else:
    print("Failed to find target positions in plantillas_data.js!")
