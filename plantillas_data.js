// Base de datos de plantillas estáticas (Desconectado de Supabase)
// El formato es: id (numerico), categoryId (numerico), titulo (string), macro (string), micro (string), diag (string)
// Categorias (ID Referencia - Gastro: 1, Gineco: 2, Piel: 3, Urologia: 11)

const defaultTemplates = [
    {
        id: 1,
        categoryId: 1, 
        titulo: "APENDICITIS AGUDA CONGESTIVA",
        macro: "Se recibe un espécimen de apendicectomía que mide [ longitud ] cm de longitud por [ diámetro ] cm de diámetro externo, con un peso de [ peso ] gramos. La superficie serosa es lisa, brillante y se observa moderadamente vascularizada y edematosa, sin evidencia de exudado fibrinoso, perforación ni gangrena. Al corte, la luz apendicular es [ permeable / ocluida ] y contiene material fecal de aspecto habitual. La pared muestra un grosor de [ grosor ] cm. La base de resección es regular. Se incluyen cortes representativos de la base, cuerpo y punta en [ N ] cassettes.",
        micro: "Se observan cortes histológicos de apéndice cecal que muestran mucosa con hiperplasia linfoide folicular conservada. La lámina propia y la submucosa exhiben congestión vascular moderada a severa, edema y un leve infiltrado inflamatorio crónico (linfocitos y células plasmáticas). La capa muscular propia y la serosa no presentan infiltración significativa por polimorfonucleares neutrófilos, microabscesos ni necrosis. La base de resección quirúrgica está libre de inflamación aguda.",
        diag: "APÉNDICE CECAL, APENDICECTOMÍA: APENDICITIS AGUDA CONGESTIVA/EDEMATOSA."
    },
    {
        id: 2,
        categoryId: 1,
        titulo: "APENDICITIS AGUDA SUPURADA",
        macro: "Se recibe apéndice cecal que mide [ longitud ] cm de longitud x [ diámetro ] cm de diámetro mayor, con peso de [ peso ] g. La serosa es deslustrada, hiperémica y está cubierta focalmente por exudado fibrino-purulento blanquecino-amarillento. No se observan áreas francas de necrosis, gangrena o perforación. Al corte, la pared está engrosada (hasta [ grosor ] cm) y la luz contiene material purulento y fecalito(s) de [ diámetro del fecalito ] cm. Se remiten muestras representativas (base, cuerpo, punta) en [ N ] casetes.",
        micro: "Cortes histológicos de apéndice cecal muestran un denso infiltrado inflamatorio agudo compuesto predominantemente por leucocitos polimorfonucleares neutrófilos. Dicho infiltrado compromete la mucosa, destruye parcialmente las criptas glandulares, y se extiende en todo el espesor de la pared afectando la submucosa, muscular propia y serosa (periapendicitis). Se asocia a congestión vascular marcada, edema severo y microabscesos focales. La serosa exhibe exudado fibrinopurulento. No se observa perforación.",
        diag: "APÉNDICE CECAL, APENDICECTOMÍA: APENDICITIS AGUDA SUPURADA (FLEMÁSTICA)."
    },
    {
        id: 3,
        categoryId: 1,
        titulo: "COLECISTITIS CRÓNICA CALCULOSA",
        macro: "Se recibe vesícula biliar íntegra/abierta que mide [ dimensiones ] cm y pesa [ peso ] g. La serosa es lisa, pardo-grisácea y opaca. Al corte, la pared presenta un grosor promedio de [ grosor ] cm y es elástica. La mucosa tiene un aspecto aterciopelado (reticular) y está teñida de pigmento biliar. La luz contiene bilis espesa y [ cantidad ] litos biliares (amarillos/verdosos/negros) poliédricos/esféricos, el mayor de [ diámetro mayor ] cm. El conducto cístico es permeable y no presenta litos. Se remiten muestras del fondo, cuerpo y cuello en [ N ] casetes.",
        micro: "Cortes de vesícula biliar que muestran mucosa con pliegues aplanados y presencia de invaginaciones epiteliales que penetran la capa muscular propia (Senos de Rokitansky-Aschoff). La lámina propia y la pared fibromuscular exhiben un infiltrado inflamatorio crónico moderado a severo (linfocitario y plasmocitario), asociado a fibrosis estromal intersticial e hipertrofia muscular. No se observan signos de malignidad, displasia ni inflamación aguda significativa.",
        diag: "VESÍCULA BILIAR, COLECISTECTOMÍA: COLECISTITIS CRÓNICA Y COLELITIASIS."
    },
    {
        id: 4,
        categoryId: 1,
        titulo: "COLECISTITIS AGUDA Y CRÓNICA CALCULOSA",
        macro: "Se recibe vesícula biliar que mide [ dimensiones ] cm y pesa [ peso ] g. La superficie serosa es irregular, congestiva, cubierta por adherencias fibrosas y placas de exudado fibrinoso. La pared está marcadamente engrosada (hasta [ grosor ] cm) e indurada. La luz contiene bilis purulenta/hemorrágica y múltiples cálculos (o cálculo único) impactados en el infundíbulo, el mayor de [ tamaño ] cm. La mucosa exhibe áreas focales de ulceración y necrosis superficial. Se remiten cortes representativos en [ N ] casetes.",
        micro: "Los cortes histológicos muestran vesícula biliar con pérdida extensa del epitelio mucoso y ulceración. La pared presenta hipertrofia muscular, fibrosis e invaginaciones glandulares profundas (Senos de Rokitansky-Aschoff). Sobre este fondo crónico, se superpone un abundante infiltrado inflamatorio agudo con numerosos polimorfonucleares neutrófilos, congestión vascular extrema, edema difuso, áreas focales de hemorragia y formación de microabscesos en la pared. La serosa presenta exudado fibrinoleucocitario reactivo.",
        diag: "VESÍCULA BILIAR, COLECISTECTOMÍA: COLECISTITIS AGUDA SUPURADA SOBRE FONDO CRÓNICO Y COLELITIASIS."
    },
    {
        id: 5,
        categoryId: 1,
        titulo: "SACO HERNIARIO INGUINAL",
        macro: "Se recibe espécimen rotulado como 'saco herniario' constituido por un fragmento de tejido membranoso, fibro-adiposo, de aspecto irregular, color blanquecino-amarillento, que mide en conjunto [ dimensiones ] cm. La superficie muestra tractos fibrosos y focos de congestión. Al corte, está conformado por tejido adiposo maduro y cordones de tejido conectivo denso. No se identifican áreas de necrosis ni nódulos sospechosos. Se incluye la totalidad del espécimen / muestras representativas en [ N ] casete(s).",
        micro: "El examen histológico revela un espécimen revestido focalmente por células mesoteliales (tejido peritoneal) descansando sobre una pared de tejido conectivo fibroso denso. El estroma muestra tejido adiposo unilocular maduro de morfología conservada, asociado a un leve infiltrado inflamatorio crónico linfocitario inespecífico y proliferación vascular (congestión). No se evidencia inflamación aguda granulomatosa, atrapamiento intestinal ni atipia celular (neoplasia maligna ausente).",
        diag: "TEJIDO MEMBRANOSO FIBRO-ADIPOSO, EXÉRESIS DE SACO HERNIARIO: SACO HERNIARIO FIBROSO, NEGATIVO PARA NEOPLASIA."
    },
    {
        id: 6,
        categoryId: 3,
        titulo: "LIPOMA (TEJIDO BLANDO)",
        macro: "Se recibe un fragmento de tejido nodular, blando, bien circunscrito/encapsulado, de coloración amarillenta uniforme, que mide [ dimensiones ] cm y pesa [ peso ] g. La superficie externa es lobulada y cubierta por una fina pseudocápsula brillante. Al corte, el espécimen está compuesto en su totalidad por tejido adiposo maduro unilocular, de consistencia untuosa, sin evidenciarse áreas de hemorragia, necrosis, calcificación, ni nódulos blanquecinos indurados. Se incluyen muestras representativas en [ N ] casetes.",
        micro: "Cortes histológicos muestran una lesión mesenquimal benigna de patrón nodular delimitada por una fina cápsula de tejido conectivo. La neoplasia está constituida exclusivamente por una proliferación difusa y ordenada de adipocitos maduros uniloculares (con grandes vacuolas de grasa que desplazan el núcleo a la periferia). Las células no presentan atipia nuclear, pleomorfismo, necrosis ni actividad mitótica aumentada. Está tabicada por finos septos fibrosos vascularizados.",
        diag: "TEJIDO BLANDO (LOCALIZACIÓN), EXÉRESIS: LIPOMA."
    },
    {
        id: 7,
        categoryId: 3,
        titulo: "QUISTE EPIDÉRMICO",
        macro: "Se recibe elipse de piel (o nódulo subcutáneo) que mide [ dimensiones ] cm. En el centro de la lesión se observa una estructura quística unilocular, renitente, de bordes bien delimitados. Al corte, la pared quística es delgada y la cavidad se encuentra ocupada en su totalidad por material untuoso, laminar, de color grisáceo a amarillento y de aspecto caseoso (queratina). No se evidencian proyecciones papilares intracomunitarias ni induración estromal. Se incluyen cortes de la pared quística en [ N ] casetes.",
        micro: "Los cortes exhiben una formación quística revestida por un epitelio escamoso estratificado queratinizante (epidermis) completo, el cual presenta una capa granulosa prominente. La luz del quiste está distendida por abundantes laminillas de queratina eosinófila. El estroma adyacente muestra tejido conectivo maduro, en ocasiones con un infiltrado linfohistiocitario crónico o reacción granulomatosa a cuerpo extraño de células gigantes si existe evidencia de ruptura previa de la pared.",
        diag: "PIEL (LOCALIZACIÓN), EXÉRESIS: QUISTE EPIDÉRMICO DE INCLUSIÓN."
    },
    {
        id: 8,
        categoryId: 3,
        titulo: "NEVUS INTRADÉRMICO",
        macro: "Se recibe losange de piel que mide [ dimensiones ] cm. La superficie epidérmica exhibe una lesión nodular sobreelevada / papilomatosa, circunscrita, de coloración parduzca (a veces hipopigmentada o del color de la piel adyacente), que mide [ diámetro ] cm. Los bordes son regulares. Al corte, el parénquima subyacente es blanquecino y firme. Los márgenes de resección quirúrgicos se observan macroscópicamente libres. Se incluye la totalidad del espécimen en [ N ] casete(s).",
        micro: "Los cortes histológicos muestran piel con epidermis de arquitectura conservada (sin atipia, acantosis focal) que cubre una proliferación de células névicas benignas dispuestas en nidos, cordones y sábanas localizadas exclusivamente en la dermis papilar y reticular (sin componente de unión dermoepidérmica activo). Las células névicas exhiben maduración normal hacia la profundidad (se vuelven más pequeñas y ahusadas tipo Schwanniano). No se observan pleomorfismo, macronucléolos, necrosis ni actividad mitótica aberrante.",
        diag: "PIEL (LOCALIZACIÓN), BIOPSIA ESCISIONAL: NEVUS INTRADÉRMICO."
    },
    {
        id: 9,
        categoryId: 2,
        titulo: "PÓLIPO ENDOMETRIAL",
        macro: "Se recibe frasco rotulado con nombre de la paciente conteniendo múltiples fragmentos tisulares, irregulares, de color pardo-grisáceo y consistencia blanda (legrado biópsico), o pólipo íntegro que mide [ dimensiones ] cm, de superficie lisa, coloración rojo-parda y base de implantación [ pediculada/sésil ]. Al corte, el tejido es de aspecto carnoso y homogéneo, sin áreas sólidas induradas o hemorrágicas llamativas. Se incluye todo el material procesado en [ N ] casetes.",
        micro: "El examen microscópico revela fragmentos de endometrio que configuran una lesión exofítica de arquitectura polipoide. Está constituida por glándulas endometriales de distribución irregular, con variabilidad en su tamaño (algunas de aspecto quísticamente dilatadas y otras tubulares). El estroma circundante es denso, fibroso y contiene vasos sanguíneos de paredes gruesas (vasos arteriales hialinizados característicos). Las glándulas no muestran atipia nuclear significativa ni arquitectura compleja proliferativa maligna.",
        diag: "ENDOMETRIO, BIOPSIA/LEGRADO: PÓLIPO ENDOMETRIAL."
    },
    {
        id: 10,
        categoryId: 2,
        titulo: "LEIOMIOMA UTERINO (MIOMATOSIS)",
        macro: "Se recibe útero/fragmento de miometrio que incluye nódulo(s) bien delimitado(s), de contorno esférico o irregular, que miden en conjunto o el mayor de ellos [ dimensiones ] cm y pesa(n) [ peso ] g. La superficie externa es firme y pseudo-encapsulada. Al corte, el tejido exhibe un patrón arremolinado, fascicular, de coloración blanquecino-grisácea y consistencia duro-elástica. No se observan áreas de necrosis caseosa, hemorragia macroscópica ni reblandecimiento atípico (mixomas). Se remiten muestras representativas en [ N ] casetes.",
        micro: "Cortes histológicos de los nódulos uterinos muestran una neoplasia mesenquimal benigna compuesta por haces y fascículos entrecruzados de células musculares lisas elongadas. Las células neoplásicas tienen abundante citoplasma eosinófilo fibrilar y núcleos en forma de cigarro (fusiformes) con bordes romos, sin atipia citológica, pleomorfismo ni nucleolos prominentes. La actividad mitótica es prácticamente nula o muy baja (menor a 2 mitosis por 10 CAP). No hay evidencia de necrosis coagulativa del tumor.",
        diag: "ÚTERO / MIOMETRIO, EXÉRESIS / HISTERECTOMÍA: LEIOMIOMA(S)."
    },
    {
        id: 11,
        categoryId: 22,
        titulo: "APENDICITIS AGUDA CONGESTIVA",
        macro: "se recibe pieza de apendicectomía de 7.5 cm de longitud y 1.2 cm de diámetro máximo, cubierta por una serosa de aspecto lustroso, con congestión vascular evidente y parches eritematosos focales. al corte transversal, la pared muestra un engrosamiento edematoso de hasta 0.4 cm, con luz parcialmente obliterada que contiene escaso material fecaloide amarillento; no se identifican lesiones polipoideas, masas, áreas de necrosis franca ni plastrón perforativo. el mesoapéndice no presenta hallazgos significativos.",
        micro: "se observa una marcada congestión vascular en todas las capas de la pared, con severo edema de la submucosa que expande los espacios interfibrilares. el infiltrado inflamatorio agudo, compuesto predominantemente por polimorfonucleares neutrófilos, se extiende desde la lámina propia hasta la muscularis mucosae, con focos de microabscesos crípticos y exudado fibrinoso en la superficie luminal. la capa muscular propia conserva su arquitectura sin evidencia de necrosis coagulativa, y la serosa presenta reacción mesotelial reactiva con leve infiltrado inflamatorio mixto perivascular. no se identifican granulomas, inclusiones virales, parásitos, ni cambios displásicos o neoplásicos en el epitelio. los márgenes quirúrgicos y el mesoapéndice se encuentran libres de proceso inflamatorio extenso.",
        diag: "APENDICITIS AGUDA CONGESTIVA (FASE EXUDATIVA TEMPRANA), SIN EVIDENCIA DE PERFORACIÓN, GANGRENA, ABSCESO O NEOPLASIA SUBYACENTE."
    },
    {
        id: 12,
        categoryId: 13,
        titulo: "APENDICITIS AGUDA CONGESTIVA",
        macro: "se recibe pieza de apendicectomía de 7.5 cm de longitud y 1.2 cm de diámetro máximo, cubierta por una serosa de aspecto lustroso, con congestión vascular evidente y parches eritematosos focales. al corte transversal, la pared muestra un engrosamiento edematoso de hasta 0.4 cm, con luz parcialmente obliterada que contiene escaso material fecaloide amarillento; no se identifican lesiones polipoideas, masas, áreas de necrosis franca ni plastrón perforativo. el mesoapéndice no presenta hallazgos significativos.",
        micro: "se observa una marcada congestión vascular en todas las capas de la pared, con severo edema de la submucosa que expande los espacios interfibrilares. el infiltrado inflamatorio agudo, compuesto predominantemente por polimorfonucleares neutrófilos, se extiende desde la lámina propia hasta la muscularis mucosae, con focos de microabscesos crípticos y exudado fibrinoso en la superficie luminal. la capa muscular propia conserva su arquitectura sin evidencia de necrosis coagulativa, y la serosa presenta reacción mesotelial reactiva con leve infiltrado inflamatorio mixto perivascular. no se identifican granulomas, inclusiones virales, parásitos, ni cambios displásicos o neoplásicos en el epitelio. los márgenes quirúrgicos y el mesoapéndice se encuentran libres de proceso inflamatorio extenso.",
        diag: "APENDICITIS AGUDA CONGESTIVA (FASE EXUDATIVA TEMPRANA), SIN EVIDENCIA DE PERFORACIÓN, GANGRENA, ABSCESO O NEOPLASIA SUBYACENTE."
    },
    {
        id: 13,
        categoryId: 22,
        titulo: "APENDICITIS AGUDA CONGESTIVA 2",
        macro: "se recibe pieza de apendicectomía que mide 7.5 cm de longitud y hasta 1.2 cm de diámetro máximo, cubierta por una serosa de aspecto congestivo, con vasos epicárdicos prominentes y discretas exudaciones fibrinoides focales, sin áreas de necrosis macroscópica ni plastrón fecal visible. al corte transversal, la luz se encuentra parcialmente obliterada por un contenido mucoso hemorrágico y la pared muestra un marcado engrosamiento edematoso con pérdida de la complacencia habitual, sin evidencia de perforación, absceso mural o lesiones tumorales asociadas.",
        micro: "los cortes histológicos revelan una pared apendicular con edema extenso de la submucosa y congestión vascular difusa, acompañada de un infiltrado inflamatorio agudo predominantemente neutrofílico que se extiende desde la lámina propia hacia la muscular propia, con focos de microabscesos crípticos y ulceración superficial del epitelio. se observa serositis reactiva con exudado fibrinoso y escasos linfocitos perivasculares, sin evidencia de granulomas, parásitos, cuerpos extraños, displasia epitelial ni neoplasia. la margen quirúrgica de resección es libre de inflamación transmural.",
        diag: "APENDICITIS AGUDA CONGESTIVA, SIN PERFORACIÓN NI SIGNOS DE GANGRENA; MÁRGENES QUIRÚRGICOS LIBRES."
    },
    {
        id: 14,
        categoryId: 13,
        titulo: "APENDICITIS AGUDA CONGESTIVA 2",
        macro: "se recibe pieza de apendicectomía que mide 7.5 cm de longitud y hasta 1.2 cm de diámetro máximo, cubierta por una serosa de aspecto congestivo, con vasos epicárdicos prominentes y discretas exudaciones fibrinoides focales, sin áreas de necrosis macroscópica ni plastrón fecal visible. al corte transversal, la luz se encuentra parcialmente obliterada por un contenido mucoso hemorrágico y la pared muestra un marcado engrosamiento edematoso con pérdida de la complacencia habitual, sin evidencia de perforación, absceso mural o lesiones tumorales asociadas.",
        micro: "los cortes histológicos revelan una pared apendicular con edema extenso de la submucosa y congestión vascular difusa, acompañada de un infiltrado inflamatorio agudo predominantemente neutrofílico que se extiende desde la lámina propia hacia la muscular propia, con focos de microabscesos crípticos y ulceración superficial del epitelio. se observa serositis reactiva con exudado fibrinoso y escasos linfocitos perivasculares, sin evidencia de granulomas, parásitos, cuerpos extraños, displasia epitelial ni neoplasia. la margen quirúrgica de resección es libre de inflamación transmural.",
        diag: "APENDICITIS AGUDA CONGESTIVA, SIN PERFORACIÓN NI SIGNOS DE GANGRENA; MÁRGENES QUIRÚRGICOS LIBRES."
    },
    {
        id: 15,
        categoryId: 22,
        titulo: "APENDICITIS AGUDA CONGESTIVA 3",
        macro: "se recibe pieza de apendicectomía que mide 7.5 cm de longitud y 1.2 cm de diámetro máximo, cubierta por una serosa de aspecto congestivo, brillante y con fina red vascular inyectada, sin exudado fibrinopurulento franco ni plastrón. al corte transversal, la pared se encuentra engrosada (0.4 cm), edematosa y firme; la luz contiene material fecaloide semilíquido y escaso moco, sin evidencia de abscesos, necrosis franca, perforación macroscópica ni lesiones polipoideas o tumorales en la mucosa.",
        micro: "se observa una marcada congestión vascular difusa, predominantemente en la submucosa y serosa, acompañada de edema intersticial que separa las fibras musculares de la capa muscular propia. el infiltrado inflamatorio agudo es neutrofílico, con patrón parcheado pero bien establecido, afectando la lámina propia y, de manera diagnóstica, extendiéndose a la muscular propia (miositis neutrofílica), sin llegar a constituir abscesos coalescentes ni microperforaciones. la serosa presenta hiperemia y escaso exudado inflamatorio agudo superficial, sin granulomas, células gigantes, elementos parasitarios ni cambios displásicos en el epitelio de revestimiento. los bordes quirúrgicos de resección (proximal y distal) están libres de inflamación transmural aguda y sin neoplasia.",
        diag: "APENDICITIS AGUDA CONGESTIVA, SIN EVIDENCIA DE PERFORACIÓN, NECROSIS TRANSMURAL, NI NEOPLASIA ASOCIADA."
    },
    {
        id: 16,
        categoryId: 13,
        titulo: "APENDICITIS AGUDA CONGESTIVA 3",
        macro: "se recibe pieza de apendicectomía que mide 7.5 cm de longitud y 1.2 cm de diámetro máximo, cubierta por una serosa de aspecto congestivo, brillante and con fina red vascular inyectada, sin exudado fibrinopurulento franco ni plastrón. al corte transversal, la pared se encuentra engrosada (0.4 cm), edematosa y firme; la luz contiene material fecaloide semilíquido y escaso moco, sin evidencia de abscesos, necrosis franca, perforación macroscópica ni lesiones polipoideas o tumorales en la mucosa.",
        micro: "se observa una marcada congestión vascular difusa, predominantemente en la submucosa y serosa, acompañada de edema intersticial que separa las fibras musculares de la capa muscular propia. el infiltrado inflamatorio agudo es neutrofílico, con patrón parcheado pero bien establecido, afectando la lámina propia y, de manera diagnóstica, extendiéndose a la muscular propia (miositis neutrofílica), sin llegar a constituir abscesos coalescentes ni microperforaciones. la serosa presenta hiperemia y escaso exudado inflamatorio agudo superficial, sin granulomas, células gigantes, elementos parasitarios ni cambios displásicos en el epitelio de revestimiento. los bordes quirúrgicos de resección (proximal y distal) están libres de inflamación transmural aguda y sin neoplasia.",
        diag: "APENDICITIS AGUDA CONGESTIVA, SIN EVIDENCIA DE PERFORACIÓN, NECROSIS TRANSMURAL, NI NEOPLASIA ASOCIADA."
    },
    {
        id: 17,
        categoryId: 3,
        titulo: "GASTRITIS CRÓNICA MODERADA ACTIVA",
        macro: "se recibe 2 biopsias gástricas la mayor de las cuales mide 0.4 cm y la menor de las cuales mide 0.2 cm. se incluye todo. 1 casete.",
        micro: "el estudio histológico muestra mucosa gástrica con arquitectura foveolar conservada en áreas, con infiltrado inflamatorio crónico de intensidad moderada (grado 2/3 según clasificación visual analógica) en la lámina propia, compuesto predominantemente por linfocitos y células plasmáticas, asociado a una actividad neutrofílica marcada (grado 2/3).\natrofia: no identificada\nmetaplasia: no identificada\ndisplasia: no identificada\nhelicobacter pylori: presente (+/+++)",
        diag: "GASTRITIS CRÓNICA MODERADA, ACTIVA, ASOCIADA A HELICOBACTER PYLORI."
    },
    {
        id: 18,
        categoryId: 12,
        titulo: "GASTRITIS CRÓNICA MODERADA ACTIVA",
        macro: "se recibe 2 biopsias gástricas la mayor de las cuales mide 0.4 cm y la menor de las cuales mide 0.2 cm. se incluye todo. 1 casete.",
        micro: "el estudio histológico muestra mucosa gástrica con arquitectura foveolar conservada en áreas, con infiltrado inflamatorio crónico de intensidad moderada (grado 2/3 según clasificación visual analógica) en la lámina propia, compuesto predominantemente por linfocitos y células plasmáticas, asociado a una actividad neutrofílica marcada (grado 2/3).\natrofia: no identificada\nmetaplasia: no identificada\ndisplasia: no identificada\nhelicobacter pylori: presente (+/+++)",
        diag: "GASTRITIS CRÓNICA MODERADA, ACTIVA, ASOCIADA A HELICOBACTER PYLORI."
    }
];

window.defaultTemplates = defaultTemplates;
