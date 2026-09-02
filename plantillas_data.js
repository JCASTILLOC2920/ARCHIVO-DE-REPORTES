// Base de datos de plantillas estáticas (Desconectado de Supabase)
// Formato: id (num), categoryId (num), titulo (string), macro (string), micro (string), diag (string)
// Categorías ordenadas alfabéticamente por especialidad médica

const defaultTemplates = [
    {
        id: 1,
        categoryId: 2,
        titulo: "NEVUS INTRADÉRMICO",
        macro: "se recibe losange de piel que mide [ dimensiones ] cm. la superficie epidérmica exhibe una lesión nodular sobreelevada / papilomatosa, circunscrita, de coloración parduzca (a veces hipopigmentada o del color de la piel adyacente), que mide [ diámetro ] cm. los bordes son regulares. al corte, el parénquima subyacente es blanquecino y firme. los márgenes de resección quirúrgicos se observan macroscópicamente libres. se incluye la totalidad del espécimen en [ n ] casete(s).",
        micro: "los cortes histológicos muestran piel con epidermis de arquitectura conservada (sin atipia, acantosis focal) que cubre una proliferación de células névicas benignas dispuestas en nidos, cordones y sábanas localizadas exclusivamente en la dermis papilar y reticular (sin componente de unión dermoepidérmica activo). las células névicas exhiben maduración normal hacia la profundidad (se vuelven más pequeñas y ahusadas tipo schwanniano). no se observan pleomorfismo, macronucléolos, necrosis ni actividad mitótica aberrante.",
        diag: "PIEL (LOCALIZACIÓN), BIOPSIA ESCISIONAL: NEVUS INTRADÉRMICO."
    },
    {
        id: 2,
        categoryId: 2,
        titulo: "QUISTE EPIDÉRMICO",
        macro: "se recibe elipse de piel (o nódulo subcutáneo) que mide [ dimensiones ] cm. en el centro de la lesión se observa una estructura quística unilocular, renitente, de bordes bien delimitados. al corte, la pared quística es delgada y la cavidad se encuentra ocupada en su totalidad por material untuoso, laminar, de color grisáceo a amarillento y de aspecto caseoso (queratina). no se evidencian proyecciones papilares intracomunitarias ni induración estromal. se incluyen cortes de la pared quística en [ n ] casetes.",
        micro: "los cortes exhiben una formación quística revestida por un epitelio escamoso estratificado queratinizante (epidermis) completo, el cual presenta una capa granulosa prominente. la luz del quiste está distendida por abundantes laminillas de queratina eosinófila. el estroma adyacente muestra tejido conectivo maduro, en ocasiones con un infiltrado linfohistiocitario crónico o reacción granulomatosa a cuerpo extraño de células gigantes si existe evidencia de ruptura previa de la pared.",
        diag: "PIEL (LOCALIZACIÓN), EXÉRESIS: QUISTE EPIDÉRMICO DE INCLUSIÓN."
    },
    {
        id: 3,
        categoryId: 3,
        titulo: "BIOPSIAS DE ESTÓMAGO X 1",
        macro: "se recibe 1 biopsia de estómago que mide 0.3 x 0.2 cm, de color blanco grisáceo. se incluye la totalidad de la muestra en 1 casete.",
        micro: "",
        diag: ""
    },
    {
        id: 4,
        categoryId: 3,
        titulo: "BIOPSIAS DE ESTÓMAGO X 2",
        macro: "se reciben 2 biopsias de estómago que miden entre 0.3 cm y 0.2 cm, de color blanco grisáceo. se incluye la totalidad de la muestra en 1 casete.",
        micro: "",
        diag: ""
    },
    {
        id: 5,
        categoryId: 3,
        titulo: "BIOPSIAS DE ESTÓMAGO X 3",
        macro: "se reciben 3 biopsias de estómago, la mayor de las cuales mide 0.4 cm y la menor mide 0.2 cm, de color blanco grisáceo. se incluye la totalidad de la muestra en 1 casete.",
        micro: "",
        diag: ""
    },
    {
        id: 6,
        categoryId: 3,
        titulo: "GASTRITIS CRÓNICA MODERADA ACTIVA",
        macro: "se reciben 2 biopsias gástricas, la mayor de las cuales mide 0.4 cm y la menor mide 0.2 cm. se incluye la totalidad de la muestra en 1 casete.",
        micro: "el estudio histológico muestra mucosa gástrica con arquitectura foveolar conservada en áreas, exhibiendo un infiltrado inflamatorio crónico de intensidad moderada (grado 2/3 según la escala visual analógica del sistema sydney) en la lámina propia, compuesto predominantemente por linfocitos y células plasmáticas, asociado a una actividad neutrofílica moderada (grado 2/3).\n• atrofia: no identificada\n• metaplasia: no identificada\n• displasia: no identificada\n• helicobacter pylori: presente (+/+++)",
        diag: "MUESTRA GÁSTRICA, BIOPSIA:\nGASTRITIS CRÓNICA MODERADA, ACTIVA, ASOCIADA A HELICOBACTER PYLORI.\n\nNOTA: EVALUACIÓN HISTOPATOLÓGICA REALIZADA BAJO LOS CRITERIOS DEL SISTEMA SYDNEY ACTUALIZADO (HOUSTON, 1994)."
    },
    {
        id: 51,
        categoryId: 3,
        titulo: "GASTRITIS CRÓNICA LEVE NO ACTIVA",
        macro: "se reciben 2 biopsias gástricas, la mayor de las cuales mide 0.4 cm y la menor mide 0.2 cm. se incluye la totalidad de la muestra en 1 casete.",
        micro: "el estudio histológico muestra mucosa gástrica con arquitectura foveolar conservada, exhibiendo un discreto infiltrado inflamatorio crónico de intensidad leve (grado 1/3 según la escala visual analógica del sistema sydney) en la lámina propia, compuesto por linfocitos y células plasmáticas maduras. no se observa actividad polimorfonuclear neutrofílica.\n• atrofia: no identificada\n• metaplasia: no identificada\n• displasia: no identificada\n• helicobacter pylori: no se observan (0/+++)",
        diag: "MUESTRA GÁSTRICA, BIOPSIA:\nGASTRITIS CRÓNICA LEVE, NO ACTIVA.\n\nNOTA: EVALUACIÓN HISTOPATOLÓGICA REALIZADA BAJO LOS CRITERIOS DEL SISTEMA SYDNEY ACTUALIZADO (HOUSTON, 1994)."
    },
    {
        id: 65,
        categoryId: 3,
        titulo: "GASTRITIS CRÓNICA LEVE NO ACTIVA ASOCIADA A GASTROPATÍA REACTIVA",
        macro: "se reciben 2 biopsias gástricas, la mayor de las cuales mide 0.4 cm y la menor mide 0.2 cm. se incluye la totalidad de la muestra en 1 casete.",
        micro: "el estudio histológico muestra mucosa gástrica que exhibe hiperplasia foveolar caracterizada por elongación, tortuosidad e hipercromasia foveolar focal, con repleción/depleción mucinosa apical y congestión capilar superficial en la lámina propia, asociada a proliferación de fibras musculares lisas que se proyectan verticalmente desde la muscularis mucosae. la lámina propia presenta un discreto infiltrado inflamatorio crónico de intensidad leve (grado 1/3 según la escala visual analógica del sistema sydney), compuesto predominantemente por linfocitos y células plasmáticas maduras. no se observa actividad neutrofílica epitelial ni intracríptica (grado 0/3).\n• atrofia: no identificada\n• metaplasia: no identificada\n• displasia: no identificada\n• helicobacter pylori: no se observan (0/+++)",
        diag: "MUESTRA GÁSTRICA (ANTRO / CUERPO), BIOPSIA:\n- GASTRITIS CRÓNICA LEVE, NO ACTIVA.\n- CAMBIOS HISTOLÓGICOS COMPATIBLES CON GASTROPATÍA REACTIVA (QUÍMICA / POR REFLUJO BILIAR O AINEs).\n- NEGATIVO PARA ATROFIA GLANDULAR, METAPLASIA INTESTINAL O MALIGNIDAD EN EL MATERIAL EXAMINADO.\n\nNOTA: EVALUACIÓN HISTOPATOLÓGICA REALIZADA BAJO LOS CRITERIOS DEL SISTEMA SYDNEY ACTUALIZADO (HOUSTON, 1994)."
    },
    {
        id: 52,
        categoryId: 3,
        titulo: "GASTRITIS CRÓNICA SEVERA ACTIVA CON HELICOBACTER PYLORI",
        macro: "se reciben 2 biopsias gástricas, la mayor de las cuales mide 0.4 cm y la menor mide 0.2 cm. se incluye la totalidad de la muestra en 1 casete.",
        micro: "el estudio histológico muestra mucosa gástrica con distorsión foveolar focal, exhibiendo un denso e intenso infiltrado inflamatorio crónico (grado 3/3 según la escala visual analógica del sistema sydney) que expande la lámina propia, compuesto por abundantes linfocitos, células plasmáticas y folículos linfoides con centros germinales. se acompaña de una marcada actividad neutrofílica (grado 3/3) con infiltración neutrofílica del epitelio foveolar y abscesos crípticos.\n• atrofia: no identificada\n• metaplasia: no identificada\n• displasia: no identificada\n• helicobacter pylori: presente (++/+++ a +++/+++)",
        diag: "MUESTRA GÁSTRICA, BIOPSIA:\nGASTRITIS CRÓNICA SEVERA, ACTIVA, ASOCIADA A HELICOBACTER PYLORI.\n\nNOTA: EVALUACIÓN HISTOPATOLÓGICA REALIZADA BAJO LOS CRITERIOS DEL SISTEMA SYDNEY ACTUALIZADO (HOUSTON, 1994)."
    },
    {
        id: 53,
        categoryId: 3,
        titulo: "GASTRITIS CRÓNICA MODERADA ACTIVA CON ATROFIA Y METAPLASIA ASOCIADA A HELICOBACTER PYLORI",
        macro: "se reciben 2 biopsias gástricas, la mayor de las cuales mide 0.4 cm y la menor mide 0.2 cm. se incluye la totalidad de la muestra en 1 casete.",
        micro: "el estudio histológico muestra mucosa gástrica con distorsión de la arquitectura foveolar, exhibiendo un infiltrado inflamatorio crónico de intensidad moderada (grado 2/3 según la escala visual analógica del sistema sydney) en la lámina propia, compuesto por linfocitos y células plasmáticas, asociado a una actividad neutrofílica moderada (grado 2/3). se reconoce atrofia glandular focal caracterizada por pérdida moderada de glándulas propias y reemplazo por estroma fibrovascular, acompañado de focos de metaplasia intestinal completa con presencia de células caliciformes y borde en cepillo.\n• atrofia: presente (focal / leve a moderada)\n• metaplasia: presente (metaplasia intestinal focal)\n• displasia: no identificada\n• helicobacter pylori: presente (+/+++ a ++/+++)",
        diag: "MUESTRA GÁSTRICA, BIOPSIA:\nGASTRITIS CRÓNICA MODERADA, ACTIVA, CON ATROFIA GLANDULAR FOCAL Y METAPLASIA INTESTINAL, ASOCIADA A HELICOBACTER PYLORI.\n\nNOTA: EVALUACIÓN HISTOPATOLÓGICA REALIZADA BAJO LOS CRITERIOS DEL SISTEMA SYDNEY ACTUALIZADO (HOUSTON, 1994)."
    },
    {
        id: 54,
        categoryId: 3,
        titulo: "PÓLIPO DE GLÁNDULAS FÚNDICAS",
        macro: "se recibe un fragmento polipoide de consistencia blanda, superficie mucosa lisa y color pardo-amarillento, que mide 0.8 x 0.6 x 0.4 cm. es sésil, con base de resección aparentemente íntegra. se incluye en su totalidad para procesamiento histológico. 1 casete.",
        micro: "los cortes histológicos muestran mucosa gástrica de cuerpo/fundus con arquitectura conservada, pero glándulas oxínticas notablemente dilatadas de forma quística y ectásicas, revestidas por epitelio cúbico o aplanado, con diferenciación celular dual (células principales basófilas y parietales eosinófilas, con núcleos centrales). no se identifica atipia citológica significativa, aumento mitótico ni displasia de alto grado ni de bajo grado. el estroma adyacente es edematoso y escasamente inflamatorio, sin metaplasia intestinal, atrofia glandular, infección por helicobacter pylori ni proliferación neuroendocrina. los bordes de resección se encuentran libres de lesión.",
        diag: "ESTÓMAGO (CUERPO / FUNDUS), POLIPECTOMÍA / BIOPSIA:\nPÓLIPO DE GLÁNDULAS FÚNDICAS (FGP).\nMARGEN DE RESECCIÓN LIBRE DE LESIÓN.\nNEGATIVO PARA DISPLASIA NI MALIGNIDAD EN EL MATERIAL EXAMINADO."
    },
    {
        id: 7,
        categoryId: 4,
        titulo: "BIOPSIA ENDOMETRIAL CON MATERIAL HEMÁTICO E HIPERPLASIA SIMPLE",
        macro: "se recibe una muestra de curetaje endometrial que consiste en un volumen total aproximado de 1.5 cc, compuesto en un 70% por coágulos hemáticos oscuros y fragmentos fibrinoides, y en un 30% por tejido de aspecto friable, pardogrisáceo y de consistencia blanda. el material remitido se incluye en su totalidad para procesamiento histológico en dos casetes.",
        micro: "los cortes histológicos revelan un patrón mixto donde predominan extensos depósitos de sangre aguda y material fibrinoide. en las áreas de epitelio endometrial viable, se observa un endometrio en fase proliferativa que muestra un incremento en la densidad glandular con una relación glándula/estroma superior a la esperada para la fase del ciclo. las glándulas presentan morfología variable, con formas redondeadas u ovaladas, algunas ligeramente anguladas, pero sin evidencia de complejidad arquitectural (no hay fenestración, empapelamiento ni brotes). el epitelio glandular es columnar, con núcleos seudoestratificados de cromatina fina, uniformes en tamaño y forma, con nucléolos inconspicuos o ausentes, y con polaridad mantenida. no se identifican atipias citológicas (nucleomegalia, hipercromasia, irregularidades de la membrana nuclear ni nucléolos prominentes). el estroma es compacto, celular y muestra actividad mitótica escasa, sin atipia estromal. no se observan cambios preneoplásicos de mayor grado ni elementos de malignidad.",
        diag: "ENDOMETRIO, CURETAJE:\nENDOMETRIO CON HIPERPLASIA SIMPLE (GLANDULAR Y ESTROMAL) SIN ATIPIA CITOLÓGICA, EN UN CONTEXTO DE MATERIAL HEMÁTICO ABUNDANTE; NEGATIVA PARA HIPERPLASIA ATÍPICA O CARCINOMA."
    },
    {
        id: 8,
        categoryId: 4,
        titulo: "BIOPSIAS DE CÉRVIX X 1",
        macro: "se recibe 1 biopsia de cérvix que mide 0.3 x 0.2 cm, de color blanco grisáceo. se incluye la totalidad de la muestra en 1 casete.",
        micro: "",
        diag: ""
    },
    {
        id: 9,
        categoryId: 4,
        titulo: "BIOPSIAS DE CÉRVIX X 2",
        macro: "se reciben 2 biopsias de cérvix que miden entre 0.3 cm y 0.2 cm, de color blanco grisáceo. se incluye la totalidad de la muestra en 1 casete.",
        micro: "",
        diag: ""
    },
    {
        id: 10,
        categoryId: 4,
        titulo: "BIOPSIAS DE CÉRVIX X 3",
        macro: "se reciben 3 biopsias de cérvix, la mayor de las cuales mide 0.4 cm y la menor mide 0.2 cm, de color blanco grisáceo. se incluye la totalidad de la muestra en 1 casete.",
        micro: "",
        diag: ""
    },
    {
        id: 11,
        categoryId: 4,
        titulo: "COMPATIBLE CON PÓLIPO ENDOMETRIAL FRAGMENTADO",
        macro: "se reciben múltiples fragmentos tisulares de aspecto papilado y firme, de color pardo-amarillento, con áreas más translúcidas y consistencia elástica, que en conjunto miden aproximadamente 2.0 x 1.5 x 0.8 cm; no se identifica una base pediculada íntegra ni lesión quística macroscópicamente evidente, y el material se remite íntegro para procesamiento histológico.",
        micro: "los cortes histológicos muestran fragmentos de mucosa endometrial con glándulas de morfología variable, algunas de ellas dilatadas y quísticas, revestidas por epitelio cilíndrico simple sin atipia citológica ni arquitectural, rodeadas por estroma endometrial denso y fibroblástico, de aspecto fibroso y con focos de hialinización perivascular, junto a vasos sanguíneos de pared engrosada y ectásicos; el patrón estromal es característico de pólipo endometrial, si bien la fragmentación impide evaluar la continuidad con el endometrio basal o la presencia de un eje vascular central único; no se identifican mitosis atípicas, necrosis tumoral, infiltración estromal ni fenómenos de hiperplasia compleja o carcinoma in situ; el endometrio circundante (cuando se identifica) muestra fase secretora temprana, sin evidencia de lesiones sincrónicas.",
        diag: "BIOPSIA ENDOMETRIAL: PÓLIPO ENDOMETRIAL FRAGMENTADO, SIN EVIDENCIA DE ATIPIA EPITELIAL NI MALIGNIDAD."
    },
    {
        id: 12,
        categoryId: 4,
        titulo: "LEIOMIOMA UTERINO (MIOMATOSIS)",
        macro: "se recibe útero/fragmento de miometrio que incluye nódulo(s) bien delimitado(s), de contorno esférico o irregular, que miden en conjunto o el mayor de ellos [ dimensiones ] cm y pesa(n) [ peso ] g. la superficie externa es firme y pseudo-encapsulada. al corte, el tejido exhibe un patrón arremolinado, fascicular, de coloración blanquecino-grisácea y consistencia duro-elástica. no se observan áreas de necrosis caseosa, hemorragia macroscópica ni reblandecimiento atípico (mixomas). se remiten muestras representativas en [ n ] casetes.",
        micro: "cortes histológicos de los nódulos uterinos muestran una neoplasia mesenquimal benigna compuesta por haces y fascículos entrecruzados de células musculares lisas elongadas. las células neoplásicas tienen abundante citoplasma eosinófilo fibrilar y núcleos en forma de cigarro (fusiformes) con bordes romos, sin atipia citológica, pleomorfismo ni nucleolos prominentes. la actividad mitótica es prácticamente nula o muy baja (menor a 2 mitosis por 10 cap). no hay evidencia de necrosis coagulativa del tumor.",
        diag: "ÚTERO / MIOMETRIO, EXÉRESIS / HISTERECTOMÍA: LEIOMIOMA(S)."
    },
    {
        id: 13,
        categoryId: 4,
        titulo: "MUESTRA ENDOMETRIAL INSUFICIENTE PARA DIAGNÓSTICO",
        macro: "se recibe un único fragmento mucoide de aproximadamente 0.1 cm. consistencia viscosa y aspecto translúcido. ante la ausencia de tejido sólido, se incluye la totalidad de la muestra en un casete.",
        micro: "los cortes muestran material mucinoso acelular con escasos histiocitos y células epiteliales descamadas aisladas. no se identifica estroma ni glándulas endometriales. la muestra es insuficiente y carece de tejido representativo para diagnóstico.",
        diag: "MUESTRA ENDOMETRIAL INSUFICIENTE PARA DIAGNÓSTICO ANATOMOPATOLÓGICO.\n\nEL ESPÉCIMEN CONTIENE ÚNICAMENTE MATERIAL MUCOIDE SIN TEJIDO ENDOMETRIAL REPRESENTATIVO. SE SUGIERE NUEVA TOMA DE MUESTRA PARA EVALUACIÓN HISTOLÓGICA ADECUADA.\n\nNOTA DEL PATÓLOGO: EL MOCO AISLADO ES INESPECÍFICO Y NO PERMITE DESCARTAR PATOLOGÍA DE FONDO. SE REQUIERE CORRELACIÓN CLÍNICA Y NUEVA BIOPSIA."
    },
    {
        id: 14,
        categoryId: 4,
        titulo: "PÓLIPO ENDOCERVICAL CON INFLAMACIÓN AGUDA Y TEJIDO DE GRANULACIÓN",
        macro: "se recibe un fragmento polipoide de tejido blando, de consistencia firme-elástica, que mide 1.8 x 1.2 x 0.9 cm en sus dimensiones máximas. la superficie externa es ligeramente lobulada, de color pardo-rojiza, con áreas focales de aspecto hemorrágico. el corte transversal muestra una estructura sólida de aspecto mixoide y vascular, sin áreas quísticas ni focos indurados evidentes. el espécimen se incluye en su totalidad en dos casetes.",
        micro: "el estudio histológico revela una lesión polipoide exofítica cubierta por epitelio cilíndrico simple mucosecretor, de tipo endocervical, con áreas de metaplasia escamosa inmadura focal. el estroma del pólipo está expandido por un tejido de granulación exuberante, caracterizado por una proliferación de capilares delgados de disposición perpendicular a la superficie, rodeados por un estroma edematoso y mixoide con inflamación crónica de base. destaca un infiltrado inflamatorio agudo extenso, compuesto por abundantes neutrófilos polimorfonucleares, que se extienden desde la superficie epitelial (exocitosis) hacia el estroma superficial, asociado a depósitos de fibrina y eritrocitos extravasados. no se identifican atipias citológicas ni arquitecturales en el epitelio de cobertura, ni en las glándulas endocervicales subyacentes. el estroma carece de células fusiformes atípicas, figuras mitóticas anormales o necrosis tumoral. los bordes de resección muestran márgenes libres de lesión.",
        diag: "PÓLIPO ENDOCERVICAL, EXÉRESIS:\nPÓLIPO ENDOCERVICAL CON INFLAMACIÓN AGUDA ACTIVA Y TEJIDO DE GRANULACIÓN EXUBERANTE, NEGATIVO PARA DISPLASIA O MALIGNIDAD."
    },
    {
        id: 15,
        categoryId: 4,
        titulo: "PÓLIPO ENDOMETRIAL",
        macro: "se recibe frasco rotulado con nombre de la paciente conteniendo múltiples fragmentos tisulares, irregulares, de color pardo-grisáceo y consistencia blanda (legrado biópsico), o pólipo íntegro que mide [ dimensiones ] cm, de superficie lisa, coloración rojo-parda y base de implantación [ pediculada/sésil ]. al corte, el tejido es de aspecto carnoso y homogéneo, sin áreas sólidas induradas o hemorrágicas llamativas. se incluye todo el material procesado en [ n ] casetes.",
        micro: "el examen microscópico revela fragmentos de endometrio que configuran una lesión exofítica de arquitectura polipoide. está constituida por glándulas endometriales de distribución irregular, con variabilidad en su tamaño (algunas de aspecto quísticamente dilatadas y otras tubulares). el estroma circundante es denso, fibroso y contiene vasos sanguíneos de paredes gruesas (vasos arteriales hialinizados característicos). las glándulas no muestran atipia nuclear significativa ni arquitectura compleja proliferativa maligna.",
        diag: "ENDOMETRIO, BIOPSIA/LEGRADO: PÓLIPO ENDOMETRIAL."
    },
    {
        id: 16,
        categoryId: 8,
        titulo: "LIPOMA (TEJIDO BLANDO)",
        macro: "se recibe espécimen de tejido nodular, blando, bien circunscrito, de coloración amarillenta uniforme, que mide [ dimensiones ] cm y pesa [ peso ] g. la superficie externa es lobulada, cubierta por una tenue pseudocápsula. al corte, la lesión está formada por tejido adiposo maduro unilocular, homogéneo y untuoso, sin áreas de hemorragia, necrosis ni induraciones. se incluye muestra representativa en 1 casete.",
        micro: "el estudio histológico (H&E) muestra una neoplasia mesenquimal benigna circunscrita por una fina cápsula conectiva. la lesión está constituida exclusivamente por una proliferación ordenada de adipocitos maduros uniloculares con vacuolas lipídicas que desplazan el núcleo a la periferia. no se aprecian atipia nuclear, pleomorfismo, lipoblastos, necrosis ni mitosis. el tumor está tabicado por finos septos fibrosos vascularizados.",
        diag: "TEJIDO BLANDO (LOCALIZACIÓN), EXÉRESIS / RESECCIÓN:\n- LIPOMA CONVENCIONAL BENIGNO.\n- MÁRGENES QUIRÚRGICOS LIBRES DE NEOPLASIA."
    },
    {
        id: 66,
        categoryId: 8,
        titulo: "FIBROLIPOMA DE TEJIDO BLANDO",
        macro: "se recibe espécimen de tejido blando, de configuración ovoide, que mide 4.5 x 3.2 x 2.0 cm y pesa 28 g. la superficie externa es parcialmente lobulada, de consistencia elástica y color amarillo pálido. al corte, la lesión es heterogénea: predominan áreas adiposas amarillo dorado, bien delimitadas, entre las que se intercalan bandas firmes, blanco-grisáceas y de aspecto fibrilar, que ocupan aproximadamente el 30% de la superficie de corte. los bordes quirúrgicos se marcan con tinta china. 1 casete.",
        micro: "el estudio histológico (H&E) revela una proliferación neoplásica benigna, bien circunscrita, compuesta por una población dual. el componente mayoritario está formado por adipocitos maduros de morfología uniforme, sin atipia nuclear, lipoblastos ni figuras de mitosis, dispuestos en lóbulos separados por finos septos fibrosos. el componente fibroso consiste en bandas extensas de colágeno hialinizado, denso y paucicelular, con fibroblastos fusiformes de núcleos regulares, alargados y sin pleomorfismo, que entrecruzan y disecan el tejido adiposo sin sustituirlo. no se observan necrosis tumoral, actividad mitótica atípica, células gigantes multinucleadas, metaplasia condroide ni osificación. la inmunohistoquímica muestra positividad para S-100 en adipocitos y vimentina en el estroma fibroso, con Ki-67 inferior al 1%. los márgenes quirúrgicos evaluados se encuentran libres de neoplasia a una distancia de 3 mm.",
        diag: "TEJIDO BLANDO (LOCALIZACIÓN), EXÉRESIS / RESECCIÓN:\n- FIBROLIPOMA MADURO BENIGNO.\n- MÁRGENES QUIRÚRGICOS DE RESECCIÓN LIBRES DE LESIÓN TUMORAL (DISTANCIA MÍNIMA: 3 MM)."
    },
    {
        id: 67,
        categoryId: 8,
        titulo: "FIBROLIPOMA 2",
        macro: "se recibe fragmento de tejido conectivo-adiposo de aspecto nodular, de 4.5 x 3.2 x 2.0 cm y peso de 28 g, de contorno ovoide y consistencia blanda-elástica. la superficie externa muestra lóbulos cubiertos por una tenue cápsula fibrosa. las secciones parenquimatosas exhiben una superficie de corte untuosa, amarillo brillante, tabicada por múltiples tractos y septos fibrosos firmes de coloración blanco-nacarada, los cuales abarcan el 30% del volumen tumoral. se efectúa margen entintado periférico. 1 casete.",
        micro: "las secciones histológicas coloreadas con H&E muestran una neoplasia mesenquimatosa benigna circunscrita, caracterizada por un patrón estromal mixto. se aprecia una prolífica población de adipocitos uninucleados maduros de citoplasma claro ópticamente vacío y núcleo periférico aplanado, desprovisto de atipias o pleomorfismo. intercalados entre las sábanas adiposas, se identifican prominentes haces de estroma colágeno denso hialinizado con fibroblastos bien diferenciados de morfología fusocelular sin mitosis ni atipia. la inmunofenotipificación corrobora reactividad estromal para vimentina y nuclear/citoplasmática para S-100 en el componente graso, con un índice de proliferación celular Ki-67 < 1%. no hay lipoblastos, necrosis ni células multinucleadas. los bordes de resección se encuentran despejados de lesión a 3 mm.",
        diag: "TEJIDO BLANDO (LOCALIZACIÓN), EXÉRESIS SURGICAL / RESECCIÓN:\n- FIBROLIPOMA BENIGNO (VARIANTE HISTOLÓGICA DE LIPOMA CON ESTROMA FIBROSO PROMINENTE).\n- BORDES QUIRÚRGICOS LIBRES DE COMPROMISO NEOPLÁSICO (MARGEN MÍNIMO DE SEGURIDAD: 3 MM)."
    },
    {
        id: 68,
        categoryId: 8,
        titulo: "LIPOMA 2",
        macro: "se recibe pieza quirúrgica nodular de tejido blando, bien delimitada, de 4.0 x 3.0 x 2.2 cm y 22 g de peso. la superficie exterior es lobulada y amarillenta, revestida por delicada cápsula transparente. al seccionamiento, la masa muestra un parénquima homogéneo de aspecto graso maduro, de tonalidad amarillo oro brillante y consistencia blanda, desprovisto de áreas de necrosis, degeneración quística o tabiques gruesos indurados. se entintan los bordes y se incluye muestra representativa en 1 casete.",
        micro: "las secciones histológicas coloreadas con H&E demuestran una proliferación tumoral benigna circunscrita de estirpe adiposa madura. el parénquima se compone uniformemente de lóbulos de adipocitos uniloculares normotípicos con amplia vacuola citoplasmática clara y núcleos excéntricos pequeños sin hipercromasia ni nucléolos prominentes. la arquitectura lobular está sustentada por finos septos de colágeno hialino con delgados capilares. ausencia total de lipoblastos, pleomorfismo nuclear, mitosis atípicas o focos de necrosis tumoral. los bordes de resección tisular se encuentran despejados de lesión.",
        diag: "TEJIDO BLANDO (LOCALIZACIÓN), RESECCIÓN / EXÉRESIS COMPLETA:\n- LIPOMA BENIGNO DE TEJIDO BLANDO.\n- LÍMITES QUIRÚRGICOS DE RESECCIÓN NO COMPROMETIDOS POR LA NEOPLASIA."
    },
    {
        id: 17,
        categoryId: 9,
        titulo: "LIQUEN SIMPLE CRÓNICO EN PENE",
        macro: "un fragmento tisular de piel y mucosa de pene que mide 1.0 x 0.7 x 0.4 cm, de superficie irregular y color blanquecino-rosado. el espécimen se orienta, procesa e incluye íntegramente en un solo bloque.",
        micro: "las secciones histológicas teñidas con hematoxilina-eosina muestran un fragmento de tejido cutáneo-mucoso revestido por epitelio escamoso estratificado que exhibe hiperqueratosis ortoqueratósica prominente, acantosis regular de las crestas epidérmicas y papilomatosis focal leve sin atipia citológica significativa.\n\nno se identifican figuras mitóticas atípicas, pérdida de la polaridad madurativa, pleomorfismo nuclear ni puentes intercelulares alterados que sugieran displasia o carcinoma epidermoide in situ / infiltrante. el estroma subyacente consta de tejido conectivo fibrovascular que muestra un infiltrado inflamatorio mononuclear crónico perivascular leve a moderado. no hay evidencia de invasión linfovascular ni perineural en los campos examinados.",
        diag: "HIPERPLASIA ESCAMOSA BENIGNA, COMPATIBLE CON LIQUEN SIMPLE CRÓNICO (LSC).\n\nJUSTIFICACIÓN: EL PATRÓN DE ACANTOSIS REGULAR (ENGROSAMIENTO EPIDÉRMICO) JUNTO CON HIPERQUERATOSIS Y EL INFILTRADO INFLAMATORIO CRÓNICO DÉRMICO SUPERFICIAL ES EL CUADRO CLÁSICO DE UNA RESPUESTA REACTIVA SECUNDARIA A FRICCIÓN CRÓNICA, RASCADO O IRRITACIÓN PROLONGADA EN LA ZONA GENITAL.\n\nNEGATIVO PARA MALIGNIDAD\nSE SUGIERE SEGUIMIENTO Y CONTROL DEL PACIENTE"
    },
    {
        id: 18,
        categoryId: 9,
        titulo: "MORCELADO DE PRÓSTATA 1",
        macro: "Se recibe producto de morcelado de próstata, múltiples fragmentos de tejido, de coloración pardo-amarillenta y consistencia elástica, con dimensiones entre 0.2 y 1.8 cm y un peso en conjunto de 12.5 g. Se incluye muestra representativa. 4 casetes.",
        micro: "Se observa una proliferación nodular mixta, estromal y glandular, característica de hiperplasia prostática benigna. Los acinos glandulares son de tamaño variable, muchos ectásicos, revestidos por un epitelio de doble capa con capa basal conservada e identificable. El estroma es fibromuscular hiperplásico, con escaso infiltrado inflamatorio crónico focal y corpúsculos amiláceos intraluminares. No se aprecian patrones cribiformes, nidos sólidos, invasión estromal ni perineural. Las células secretoras mantienen polaridad basal, sin nucléolos prominentes, y no hay pérdida de la capa basal ni glomerulaciones que sugieran PIN de alto grado o adenocarcinoma. No se identifican proliferaciones acinares atípicas.",
        diag: "MORCELADO DE PRÓSTATA: HIPERPLASIA NODULAR PROSTÁTICA BENIGNA. SIN EVIDENCIA DE PIN DE ALTO GRADO NI CARCINOMA."
    },
    {
        id: 19,
        categoryId: 9,
        titulo: "MORCELADO DE PRÓSTATA 2",
        macro: "Se recibe espécimen constituido por abundantes fragmentos morcelados de tejido prostático, de aspecto pardo-grisáceo y consistencia blanda-elástica, agrupando dimensiones de conjunto de 4.5 x 3.5 x 2.0 cm y un peso total de 28.0 g. Se incluye muestra representativa. 5 casetes.",
        micro: "El examen histológico muestra parénquima prostático con distorsión nodular de los componentes glandular y estromal. Las glándulas hiperplásicas presentan contornos ramificados con revestimiento bicapa celular preservado, exhibiendo una hilera de células basales continuas sin atipia citológica ni mitosis. El estroma interglandular demuestra proliferación de elementos fusocelulares lisos hiperplásicos acompañados de fibrosis moderada y corpúsculos amiláceos intratubulares. No se observan nidos sólidos, atipias cribiformes, necrosis ni invasión perineural o vascular. Ausencia de proliferaciones acinares atípicas o signos de malignidad.",
        diag: "PRODUCTO DE MORCELADO PROSTÁTICO: HIPERPLASIA ADENOMATOSA NODULAR BENIGNA CON CAMBIOS ESTROMALES ASOCIADOS. NEGATIVO PARA NEOPLASIA MALIGNA."
    },
    {
        id: 20,
        categoryId: 9,
        titulo: "MORCELADO DE PRÓSTATA 3",
        macro: "Se reciben múltiples fragmentos tisulares irregulares de morcelación prostática, de coloración pardo-rosada con zonas amarillentas, de consistencia firme-elástica, midiendo en volumen global 5.2 x 4.0 x 2.2 cm con un peso acumulado de 34.5 g. Se incluye muestra representativa. 6 casetes.",
        micro: "Las secciones histológicas revelan parénquima prostático sustituido por nidos hiperplásicos bien circunscritos de arquitectura mixta epitelio-estromal. Los acinos prostáticos muestran dilataciones quísticas luminales revestidos por epitelio cilíndrico bilaminar sin atipias citológicas ni nucléolos prominentes. La capa basal externa permanece continua e intacta en toda la muestra. El estroma de soporte evidencia proliferación fibromuscular con discreto infiltrado inflamatorio linfoplasmocitario intersticial inespecífico. No se evidencian patrones de crecimiento atípicos ni cambios de PIN de alto grado o carcinoma invasor.",
        diag: "TEJIDO PROSTÁTICO (OBTENIDO POR MORCELADO): HIPERPLASIA NODULAR PROSTÁTICA BENIGNA CON LEVE PROSTATITIS CRÓNICA INESPECÍFICA."
    },
    {
        id: 21,
        categoryId: 9,
        titulo: "MORCELADO DE PRÓSTATA 4",
        macro: "Se recibe producto de morcelado de próstata, conformado por numerosos fragmentos tisulares filamentosos e irregulares de color pardo-amarillento, de consistencia elástica, abarcando un volumen de 5.8 x 4.2 x 2.5 cm y un peso neto de 41.0 g. Se incluye muestra representativa. 7 casetes.",
        micro: "Los cortes histológicos confirman parénquima prostático con severa hiperplasia adenomiomatosa nodular benigna. Las unidades acinares están dilatadas y bordeadas por doble hilera celular epitelial y basal sin desorganización ni atipias nucleares. Se identifican múltiples corpúsculos amiláceos intraluminares. El estroma demuestra hiperplasia de haces musculares lisos entremezclados con fibras colágenas regulares sin pleomorfismo ni necrosis. Negativo para invasión perineural, fisonomía cribiforme o pérdida de células basales. Sin evidencia de adenocarcinoma acinar prostático.",
        diag: "MORCELADO PROSTÁTICO: HIPERPLASIA NODULAR BENIGNA PROSTÁTICA (HNPB) DE PREDOMINIO GLANDULAR Y ESTROMAL."
    },
    {
        id: 22,
        categoryId: 9,
        titulo: "MORCELADO DE PRÓSTATA 5",
        macro: "Se recibe espécimen prostático obtenido por morcelado, integrado por abundantes virutas de tejido de aspecto lobulado, de coloración grisácea-rosada y consistencia elástica firme, pesando en conjunto 48.5 g y midiendo en conjunto 6.0 x 4.5 x 2.8 cm. Se incluye muestra representativa. 8 casetes.",
        micro: "Se aprecia tejido prostático caracterizado por hiperplasia nodular fibroepitelial benigna. La población acinar prostática exhibe luces glandulares ectásicas revestidas por epitelio secretor maduro de polaridad basal conservada y capa basal continua bien definida. El componente estromal presenta hipertrofia e hiperplasia de células musculares lisas de disposición regular con escasos focos de infiltrado inflamatorio mononucleado de intensidad leve. No se aprecian mitosis atípicas, desestructuración acinar, nidos cribiformes ni focos sospechosos de PIN de alto grado o malignidad.",
        diag: "PRODUCTO DE MORCELADO DE PRÓSTATA: HIPERPLASIA FIBROEPITELIAL PROSTÁTICA BENIGNA. SIN SIGNOS DE MALIGNIDAD EN EL MATERIAL EXAMINADO."
    },
    {
        id: 23,
        categoryId: 9,
        titulo: "MORCELADO DE PRÓSTATA 6",
        macro: "Se reciben múltiples fragmentos morcelados de tejido prostático de consistencia elástica suave, de color pardo-amarillento con áreas blanquecinas, midiendo en conjunto 6.5 x 5.0 x 3.0 cm y con un peso total acumulado de 55.0 g. Se incluye muestra representativa. 9 casetes.",
        micro: "El examen microscópico demuestra arquitectura prostática distorsionada por voluminosos nódulos hiperplásicos adenomatosos. Los acinos exhiben replegamientos papilares intraluminares benignos y doble capa celular con clara preservación del estrato basal. Se identifican corpúsculos amiláceos en la luz glandular y discreto infiltrado inflamatorio crónico linfohistiocitaria periglandular. El estroma muestra proliferación de bandas musculares lisas regularmente dispuestas. No se observan microglándulas atípicas, nucléolos prominentes, invasión perineural ni atipia nuclear. Ausencia de neoplasia maligna.",
        diag: "FRAGMENTOS PROSTÁTICOS MORCELADOS: HIPERPLASIA NODULAR ADENOMATOSA PROSTÁTICA BENIGNA CON PROSTATITIS CRÓNICA LEVE."
    },
    {
        id: 24,
        categoryId: 9,
        titulo: "TESTÍCULOS POR TRATAMIENTO CA",
        macro: "Se reciben dos piezas quirúrgicas correspondientes a testículos izquierdo y derecho, de dimensiones (3.2 x 2.0 x 1.5 cm y 3.0 x 1.8 x 1.4 cm, respectivamente) y peso 12 g y 10 g. La superficie externa es lisa y de color pardo-grisáceo. En la sección transversal, el parénquima testicular muestra una coloración homogénea pardo-amarillenta, con pérdida de la diferenciación lobulillar habitual y ausencia total de nódulos, quistes o áreas hemorrágicas. Los cordones espermáticos, de 3 cm de longitud, presentan un diámetro conservado y aspecto macroscópicamente anodino, sin evidencia de engrosamientos ni tumoraciones. Se incluye muestra representativa. 4 casetes.",
        micro: "Los cortes histológicos revelan atrofia testicular difusa, caracterizada por túbulos seminíferos de diámetro marcadamente reducido, con engrosamiento hialino y fibrosis peritubular prominente. La espermatogénesis se encuentra disminuida, ocasionalmente se observan células de Leydig en agregados intersticiales, compatibles con hiperplasia reactiva. No se identifican células neoplásicas germinales intraepiteliales (carcinoma in situ) ni evidencia de tumor invasivo. En los cortes del cordón espermático (incluyendo el conducto deferente, estructuras vasculares y tejido adiposo circundante), no se observa infiltración por células malignas; los elementos del cordón presentan características de viabilidad tisular preservada, sin necrosis ni artefactos significativos que comprometan la evaluación del margen.",
        diag: "TESTÍCULOS BILATERALES CON CAMBIOS ATRÓFICOS, SIN EVIDENCIA DE NEOPLASIA MALIGNA. MÁRGENES DEL CORDÓN ESPERMÁTICO VIABLES Y LIBRES DE TUMOR."
    },
    {
        id: 25,
        categoryId: 15,
        titulo: "SACO HERNIARIO INGUINAL",
        macro: "se recibe espécimen rotulado como 'saco herniario' constituido por un fragmento de tejido membranoso, fibro-adiposo, de aspecto irregular, color blanquecino-amarillento, que mide en conjunto [ dimensiones ] cm. la superficie muestra tractos fibrosos y focos de congestión. al corte, está conformado por tejido adiposo maduro y cordones de tejido conectivo denso. no se identifican áreas de necrosis ni nódulos sospechosos. se incluye la totalidad del espécimen / muestras representativas en [ n ] casete(s).",
        micro: "el examen histológico revela un espécimen revestido focalmente por células mesoteliales (tejido peritoneal) descansando sobre una pared de tejido conectivo fibroso denso. el estroma muestra tejido adiposo unilocular maduro de morfología conservada, asociado a un leve infiltrado inflamatorio crónico linfocitario inespecífico y proliferación vascular (congestión). no se evidencia inflamación aguda granulomatosa, atrapamiento intestinal ni atipia celular (neoplasia maligna ausente).",
        diag: "TEJIDO MEMBRANOSO FIBRO-ADIPOSO, EXÉRESIS DE SACO HERNIARIO: SACO HERNIARIO FIBROSO, NEGATIVO PARA NEOPLASIA."
    },
    {
        id: 26,
        categoryId: 18,
        titulo: "CERVICITIS CRÓNICA SEVERA CON CAMBIOS GLANDULARES REACTIVOS Y HEMORRAGIA",
        macro: "",
        micro: "los cortes muestran fragmentos de tejido correspondientes a mucosa endocervical. la arquitectura general revela criptas y glándulas endocervicales revestidas por un epitelio cilíndrico simple mucosecretor. se observan marcados cambios reactivos en el epitelio glandular, caracterizados por un leve agrandamiento nuclear y una focal pérdida de la mucina apical, secundarios al entorno inflamatorio. algunas glándulas presentan dilatación quística. el hallazgo más prominente es un denso y extenso infiltrado inflamatorio en el estroma. este infiltrado es de carácter crónico, constituido predominantemente por linfocitos y células plasmáticas, el cual expande el estroma endocervical. se asocian áreas de marcada congestión vascular y extensos focos de hemorragia intersticial y superficial reciente. a los aumentos proporcionados, la maduración epitelial (donde es evaluable) parece conservada y no se identifican atipias citológicas significativas, pérdida de la polaridad nuclear, figuras mitóticas atípicas, ni reacción estromal desmoplásica. no hay evidencia morfológica de neoplasia intraepitelial cervical (nic/hsil), adenocarcinoma in situ (ais) ni carcinoma invasor en los campos evaluados.",
        diag: "CÉRVIX, BIOPSIA:\nMUCOSA ENDOCERVICAL CON CERVICITIS CRÓNICA SEVERA Y CAMBIOS GLANDULARES REACTIVOS.\nEXTENSA CONGESTIÓN VASCULAR Y HEMORRAGIA RECIENTE.\nNEGATIVO PARA DISPLASIA Y MALIGNIDAD EN EL MATERIAL EXAMINADO.\n\nCOMENTARIO:\nLOS HALLAZGOS SON CONSISTENTES CON UN PROCESO INFLAMATORIO SEVERO DE NATURALEZA BENIGNA (CERVICITIS). SE SUGIERE CORRELACIÓN CLÍNICA PARA DESCARTAR ETIOLOGÍAS INFECCIOSAS ESPECÍFICAS U OTRAS CAUSAS DE INFLAMACIÓN PÉLVICA/CERVICAL SEVERA."
    },
    {
        id: 27,
        categoryId: 18,
        titulo: "LIE DE ALTO GRADO NIC2",
        macro: "",
        micro: "se observa epitelio escamoso estratificado no queratinizado que muestra pérdida de la maduración y polaridad en los dos tercios inferiores del espesor epitelial, con marcada hipercromasia nuclear, pleomorfismo y aumento de la relación núcleo-citoplasmática. se identifican figuras mitóticas, incluyendo algunas atípicas, localizadas por encima del tercio basal pero sin alcanzar el tercio superficial. la membrana basal permanece íntegra y sin evidencia de invasión estromal en los cortes examinados. el estroma subyacente presenta un infiltrado inflamatorio crónico inespecífico y congestión vascular. no se identifican coilocitos francos en esta muestra, aunque la atipia citopática es sugestiva de infección por vph de alto riesgo.",
        diag: "LESIÓN ESCAMOSA INTRAEPITELIAL DE ALTO GRADO (NIC 2) – NEOPLASIA INTRAEPITELIAL CERVICAL GRADO 2 (AFECTACIÓN DE LOS DOS TERCIOS INFERIORES DEL EPITELIO, CON ACTIVIDAD MITÓTICA AUMENTADA Y ATIPIA CITOLÓGICA MARCADA, SIN INVASIÓN)."
    },
    {
        id: 49,
        categoryId: 4,
        titulo: "LIE DE BAJO GRADO",
        macro: "se recibe un fragmento tisular único, de aspecto mucoso, de aproximadamente 0.3 x 0.2 x 0.1 cm, de color grisáceo-blanquecino y consistencia blanda. se incluye en su totalidad en cassette para su procesamiento histológico.",
        micro: "el estudio histológico con tinción de hematoxilina-eosina (h&e) revela un epitelio escamoso estratificado que conserva su maduración vertical y su patrón de maduración hacia la superficie. en los tercios medio y superficial se observan cambios coilocitóticos característicos: células escamosas con halos perinucleares claros y bien delimitados, asociados a núcleos ligeramente aumentados de tamaño, hipercromáticos, con membrana nuclear irregular y contornos angulados. se aprecia leve aumento de la relación núcleo/citoplasma en estos estratos, sin extenderse al tercio basal. la actividad mitótica es escasa, limitada al estrato basal, y no se identifican mitosis atípicas. el estroma subyacente es fibroso, con discreto infiltrado inflamatorio crónico inespecífico. no se evidencian signos de invasión estromal ni de afectación de márgenes.",
        diag: "CÉRVIX UTERINO, BIOPSIA: LESIÓN ESCAMOSA INTRAEPITELIAL DE BAJO GRADO (LSIL), EQUIVALENTE A NEOPLASIA INTRAEPITELIAL CERVICAL GRADO 1 (NIC 1)."
    },
    {
        id: 28,
        categoryId: 21,
        titulo: "PTERIGIÓN POLIPOIDE",
        macro: "se recibe espécimen fijado en formol amortiguado al 10%, constituido por una formación polipoide de tejido conjuntival, de superficie lisa y brillante, coloración grisácea-amarillenta, de consistencia fibroelástica, que mide [ dimensiones ] cm en sus ejes mayores; se secciona íntegramente y se incluye en su totalidad para estudio histológico.",
        micro: "se observa una lesión exofítica revestida por epitelio escamoso estratificado, con focos de paraqueratosis superficial y áreas de adelgazamiento epitelial. el estroma subyacente muestra una marcada proliferación fibrovascular con presencia de fibras de colágeno hialinizadas y un prominente componente de degeneración elastoide (basofilia actínica), dispuesto en agregados irregulares. el estroma presenta un infiltrado inflamatorio crónico inespecífico, de predominio linfoplasmocitario, acompañado de congestión vascular. no se identifican atipias citológicas, figuras mitóticas atípicas, ni evidencia de invasión neoplásica. los márgenes quirúrgicos de resección se encuentran libres de lesión.",
        diag: "TEJIDO CONJUNTIVAL CON CAMBIOS MORFOLÓGICOS COMPATIBLES CON PTERIGIÓN POLIPOIDE, SIN EVIDENCIA DE DISPLASIA NI MALIGNIDAD."
    },
    {
        id: 29,
        categoryId: 22,
        titulo: "APENDICITIS AGUDA CONGESTIVA",
        macro: "se recibe un espécimen de apendicectomía que mide [ longitud ] cm de longitud por [ diámetro ] cm de diámetro externo, con un peso de [ peso ] gramos. la superficie serosa es lisa, brillante y se observa moderadamente vascularizada y edematosa, sin evidencia de exudado fibrinoso, perforación ni gangrena. al corte, la luz apendicular es [ permeable / ocluida ] y contiene material fecal de aspecto habitual. la pared muestra un grosor de [ grosor ] cm. la base de resección es regular. se incluyen cortes representativos de la base, cuerpo y punta en [ n ] cassettes.",
        micro: "se observan cortes histológicos de apéndice cecal que muestran mucosa con hiperplasia linfoide folicular conservada. la lámina propia y la submucosa exhiben congestión vascular moderada a severa, edema y un leve infiltrado inflamatorio crónico (linfocitos y células plasmáticas). la capa muscular propia y la serosa no presentan infiltración significativa por polimorfonucleares neutrófilos, microabscesos ni necrosis. la base de resección quirúrgica está libre de inflamación aguda.",
        diag: "APÉNDICE CECAL, APENDICECTOMÍA: APENDICITIS AGUDA CONGESTIVA/EDEMATOSA."
    },
    {
        id: 30,
        categoryId: 22,
        titulo: "APENDICITIS AGUDA CONGESTIVA",
        macro: "se recibe pieza de apendicectomía de 7.5 cm de longitud y 1.2 cm de diámetro máximo, cubierta por una serosa de aspecto lustroso, con congestión vascular evidente y parches eritematosos focales. al corte transversal, la pared muestra un engrosamiento edematoso de hasta 0.4 cm, con luz parcialmente obliterada que contiene escaso material fecaloide amarillento; no se identifican lesiones polipoideas, masas, áreas de necrosis franca ni plastrón perforativo. el mesoapéndice no presenta hallazgos significativos. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "se observa una marcada congestión vascular en todas las capas de la pared, con severo edema de la submucosa que expande los espacios interfibrilares. el infiltrado inflamatorio agudo, compuesto predominantemente por polimorfonucleares neutrófilos, se extiende desde la lámina propia hasta la muscularis mucosae, con focos de microabscesos crípticos y exudado fibrinoso en la superficie luminal. la capa muscular propia conserva su arquitectura sin evidencia de necrosis coagulativa, y la serosa presenta reacción mesotelial reactiva con leve infiltrado inflamatorio mixto perivascular. no se identifican granulomas, inclusiones virales, parásitos, ni cambios displásicos o neoplásicos en el epitelio. los márgenes quirúrgicos y el mesoapéndice se encuentran libres de proceso inflamatorio extenso.",
        diag: "APENDICITIS AGUDA CONGESTIVA (FASE EXUDATIVA TEMPRANA), SIN EVIDENCIA DE PERFORACIÓN, GANGRENA, ABSCESO O NEOPLASIA SUBYACENTE."
    },
    {
        id: 31,
        categoryId: 22,
        titulo: "APENDICITIS AGUDA CONGESTIVA 2",
        macro: "se recibe pieza de apendicectomía que mide 7.5 cm de longitud y hasta 1.2 cm de diámetro máximo, cubierta por una serosa de aspecto congestivo, con vasos epicárdicos prominentes y discretas exudaciones fibrinoides focales, sin áreas de necrosis macroscópica ni plastrón fecal visible. al corte transversal, la luz se encuentra parcialmente obliterada por un contenido mucoso hemorrágico y la pared muestra un marcado engrosamiento edematoso con pérdida de la complacencia habitual, sin evidencia de perforación, absceso mural o lesiones tumorales asociadas. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "los cortes histológicos revelan una pared apendicular con edema extenso de la submucosa y congestión vascular difusa, acompañada de un infiltrado inflamatorio agudo predominantemente neutrofílico que se extiende desde la lámina propia hacia la muscular propia, con focos de microabscesos crípticos y ulceración superficial del epitelio. se observa serositis reactiva con exudado fibrinoso y escasos linfocitos perivasculares, sin evidencia de granulomas, parásitos, cuerpos extraños, displasia epitelial ni neoplasia. la margen quirúrgica de resección es libre de inflamación transmural.",
        diag: "APENDICITIS AGUDA CONGESTIVA, SIN PERFORACIÓN NI SIGNOS DE GANGRENA; MÁRGENES QUIRÚRGICOS LIBRES."
    },
    {
        id: 32,
        categoryId: 22,
        titulo: "APENDICITIS AGUDA CONGESTIVA 3",
        macro: "se recibe pieza de apendicectomía que mide 7.5 cm de longitud y 1.2 cm de diámetro máximo, cubierta por una serosa de aspecto congestivo, brillante y con fina red vascular inyectada, sin exudado fibrinopurulento franco ni plastrón. al corte transversal, la pared se encuentra engrosada (0.4 cm), edematosa y firme; la luz contiene material fecaloide semilíquido y escaso moco, sin evidencia de abscesos, necrosis franca, perforación macroscópica ni lesiones polipoideas o tumorales en la mucosa. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "se observa una marcada congestión vascular difusa, predominantemente en la submucosa y serosa, acompañada de edema intersticial que separa las fibras musculares de la capa muscular propia. el infiltrado inflamatorio agudo es neutrofílico, con patrón parcheado pero bien establecido, afectando la lámina propia y, de manera diagnóstica, extendiéndose a la muscular propia (miositis neutrofílica), sin llegar a constituir abscesos coalescentes ni microperforaciones. la serosa presenta hiperemia y escaso exudado inflamatorio agudo superficial, sin granulomas, células gigantes, elementos parasitarios ni cambios displásicos en el epitelio de revestimiento. los bordes quirúrgicos de resección (proximal y distal) están libres de inflamación transmural aguda y sin neoplasia.",
        diag: "APENDICITIS AGUDA CONGESTIVA, SIN EVIDENCIA DE PERFORACIÓN, NECROSIS TRANSMURAL, NI NEOPLASIA ASOCIADA."
    },
    {
        id: 33,
        categoryId: 22,
        titulo: "APENDICITIS AGUDA SUPURADA",
        macro: "se recibe pieza de apendicectomía que mide 7.2 x 1.4 x 1.1 cm, cubierta por serosa congestiva, opaca y con exudado fibrinopurulento de aspecto granular en tercio distal. en los cortes seriados, la pared está engrosada y edematosa (hasta 0.5 cm de espesor), con la luz distendida y rellena por material purulento amarillento-verdoso. los bordes de sección quirúrgica presentan aspecto macroscópicamente viable. se incluye muestra representativa. 3 cortes. 1 casete.",
        micro: "el estudio histológico evidencia una inflamación aguda transmural extensa, con un denso infiltrado de polimorfonucleares neutrófilos que necrosa y ulcera la mucosa, atraviesa la muscularis mucosae y se diseca a través de la muscularis propia, con formación de microabscesos intramurales. la reacción inflamatoria se extiende hasta la serosa, donde se aprecian depósitos de fibrina organizada con exudado purulento y congestión vascular marcada. no se identifican granulomas epitelioides, células gigantes, parásitos ni inclusiones virales. tras un minucioso rastreo de la totalidad de la pieza, se descartan cambios de tipo mucinoso (ausencia de mucina extraluminal, seudomixoma o implantación peritoneal), atipia epitelial significativa, lesiones serradas ni componentes neoplásicos sólidos o quísticos. el margen de resección proximal se observa libre de inflamación transmural aguda, aunque presenta leve edema submucoso reactivo.",
        diag: "APENDICITIS AGUDA SUPURADA (FLEGMONOSA) TRANSMURAL, CON PERIAPENDICITIS FIBRINOPURULENTA Y FECALITOSIS. MARGEN DE RESECCIÓN QUIRÚRGICA LIBRE DE PROCESO INFLAMATORIO AGUDO TRANSMURAL. SIN EVIDENCIA DE NEOPLASIA MUCINOSA, LESIÓN EPITELIAL PREMALIGNA NI PROCESO PARASITARIO."
    },
    {
        id: 46,
        categoryId: 22,
        titulo: "APENDICITIS AGUDA NECROSADA",
        macro: "se recibe apéndice cecal de 7.5 cm de longitud y 1.8 cm de diámetro máximo, con superficie serosa congestiva, opaca y cubierta por exudado fibrinopurulento de aspecto amarillento-grisáceo; al corte transversal se observa pared engrosada (hasta 0.6 cm), luz distendida con contenido hemático-purulento, y mucosa de aspecto friable, desvitalizada y de coloración pardo-negruzca, sin evidencia de perforación franca ni plastrón apendicular en los cortes seriados realizados. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "los cortes histológicos evidencian un proceso inflamatorio agudo transmural severo, con denso infiltrado de neutrófilos que afecta la mucosa, submucosa y capas musculares, asociado a extensa necrosis por coagulación y necrosis fibrinoide de la pared, con pérdida casi total de la arquitectura críptica, ulceración mucosa y hemorragia intersticial. la serosa presenta reacción mesotelial reactiva con exudado purulento adherente. se identifican trombos fibrinosos en vasos de pequeño y mediano calibre submucosos, así como congestión vascular marcada y depósitos de fibrina en el intersticio. no se observan elementos parasitarios (como enterobius vermicularis) ni estructuras compatibles con neoplasia epitelial o neuroendocrina en los múltiples niveles examinados. los márgenes quirúrgicos (base apendicular) están libres de inflamación transmural activa y necrosis.",
        diag: "APÉNDICE CECAL: APENDICITIS AGUDA NECROSANTE (GANGRENOSA) TRANSMURAL, CON PERIAPENDICITIS FIBRINOPURULENTA, SIN EVIDENCIA DE PERFORACIÓN EN LOS CORTES EVALUADOS."
    },
    {
        id: 34,
        categoryId: 23,
        titulo: "COLECISTITIS AGUDA Y CRÓNICA CALCULOSA",
        macro: "se recibe vesícula biliar que mide [ dimensiones ] cm y pesa [ peso ] g. la superficie serosa es irregular, congestiva, cubierta por adherencias fibrosas y placas de exudado fibrinoso. la pared está marcadamente engrosada (hasta [ grosor ] cm) e indurada. la luz contiene bilis purulenta/hemorrágica y múltiples cálculos (o cálculo único) impactados en el infundíbulo, el mayor de [ tamaño ] cm. la mucosa exhibe áreas focales de ulceración y necrosis superficial. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "los cortes histológicos muestran vesícula biliar con pérdida extensa del epitelio mucoso y ulceración. la pared presenta hipertrofia muscular, fibrosis e invaginaciones glandulares profundas (senos de rokitansky-aschoff). sobre este fondo crónico, se superpone un abundante infiltrado inflamatorio agudo con numerosos polimorfonucleares neutrófilos, congestión vascular extrema, edema difuso, áreas focales de hemorragia y formación de microabscesos en la pared. la serosa presenta exudado fibrinoleucocitario reactivo.",
        diag: "VESÍCULA BILIAR, COLECISTECTOMÍA: COLECISTITIS AGUDA SUPURADA SOBRE FONDO CRÓNICO Y COLELITIASIS."
    },
    {
        id: 35,
        categoryId: 23,
        titulo: "COLECISTITIS CRÓNICA CALCULOSA",
        macro: "se recibe vesícula biliar íntegra/abierta que mide [ dimensiones ] cm y pesa [ peso ] g. la serosa es lisa, pardo-grisácea y opaca. al corte, la pared presenta un grosor promedio de [ grosor ] cm y es elástica. la mucosa tiene un aspecto aterciopelado (reticular) y está teñida de pigmento biliar. la luz contiene bilis espesa y [ cantidad ] litos biliares (amarillos/verdosos/negros) poliédricos/esféricos, el mayor de [ diámetro mayor ] cm. el conducto cístico es permeable y no presenta litos. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "cortes de vesícula biliar que muestran mucosa con pliegues aplanados y presencia de invaginaciones epiteliales que penetran la capa muscular propia (senos de rokitansky-aschoff). la lámina propia y la pared fibromuscular exhiben un infiltrado inflamatorio crónico moderado a severo (linfocitario y plasmocitario), asociado a fibrosis estromal intersticial e hipertrofia muscular. no se observan signos de malignidad, displasia ni inflamación aguda significativa.",
        diag: "VESÍCULA BILIAR, COLECISTECTOMÍA: COLECISTITIS CRÓNICA Y COLELITIASIS."
    },
    {
        id: 36,
        categoryId: 23,
        titulo: "COLECISTITIS CRÓNICA LITIÁSICA CON METAPLASIA",
        macro: "se recibe pieza de vesícula biliar de 8.5 x 3.2 x 2.0 cm, con serosa de aspecto brillante y superficie ligeramente irregular. la pared muestra engrosamiento difuso (hasta 0.5 cm) con áreas de fibrosis. al corte, la luz contiene bilis espesa y numerosos cálculos pigmentarios oscuros, de entre 0.2 y 0.8 cm, de superficie facetada. la mucosa presenta un patrón reticulado y engrosado, con áreas de aspecto velloso, sin pólipos ni masas evidentes. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "se observa mucosa con pérdida focal del epitelio cilíndrico, junto a áreas de metaplasia escamosa y focalmente metaplasia intestinal con células caliciformes. la lámina propia y la muscularis mucosae muestran un denso infiltrado inflamatorio crónico, predominantemente linfoplasmocitario, con algunos agregados linfoides foliculares. la capa muscular presenta hiperplasia e hipertrofia de sus fibras, con bandas de fibrosis intersticial que se extienden hasta la adventicia. se identifican múltiples senos de rokitansky-aschoff dilatados, algunos con microabscesos de colesterol y restos de bilis. no se observan atipias citológicas significativas, figuras mitóticas atípicas ni invasión neoplásica. los bordes quirúrgicos de resección (conducto cístico y arteria) están libres de proceso inflamatorio significativo.",
        diag: "COLECISTITIS CRÓNICA LITIÁSICA, CON METAPLASIA ESCAMOSA Y METAPLASIA INTESTINAL FOCAL, SIN EVIDENCIA DE DISPLASIA NI NEOPLASIA."
    },
    {
        id: 37,
        categoryId: 23,
        titulo: "COLECISTITIS CRÓNICA LITIÁSICA CON METAPLASIA 2",
        macro: "se recibe pieza de colecistectomía que mide 9.0 x 3.5 x 2.2 cm, con serosa opaca y adherencias fibrosas tenues en su superficie. la pared está engrosada de forma irregular alcanzando los 0.6 cm. al corte transversal, la cavidad contiene bilis parda de consistencia viscosa y múltiples cálculos facetados oscuros de 0.3 a 0.7 cm de diámetro. la mucosa exhibe patrón reticular aplanado con zonas granulares, libre de lesiones exofíticas o infiltrativas. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "los cortes histológicos revelan mucosa biliar con erosión focal del epitelio de revestimiento, alternando con focos de metaplasia de tipo escamoso y áreas discretas de metaplasia intestinal con células productoras de mucina. en el corion y la capa fibromuscular se evidencia un infiltrado inflamatorio de tipo crónico, constituido por linfocitos y células plasmáticas maduras, con agregación folicular linfoide. la muscular propia está engrosada por hipertrofia celular y tractos de colágeno denso. se aprecian senos de rokitansky-aschoff invaginados y dilatados. no hay signos de atipia celular ni neoplasia. márgenes quirúrgicos de sección del cístico sin compromiso.",
        diag: "VESÍCULA BILIAR (COLECISTECTOMÍA): COLECISTITIS CRÓNICA LITIÁSICA, CON CAMBIOS METAPLÁSICOS ESCAMOSOS E INTESTINALES FOCALES, LIBRE DE MALIGNIDAD."
    },
    {
        id: 38,
        categoryId: 23,
        titulo: "COLECISTITIS CRÓNICA LITIÁSICA CON METAPLASIA 3",
        macro: "se recibe espécimen de vesícula biliar abierto de 8.0 x 3.0 x 2.0 cm, con superficie externa parda, congestiva y deslustrada. la pared es elástica con grosor máximo de 0.4 cm. a la apertura, la luz aloja bilis lodosa y múltiples detritos litiásicos oscuros de tamaños variables entre 0.2 y 0.5 cm. la mucosa se encuentra engrosada con aspecto reticulado tosco, sin induraciones sospechosas ni vegetaciones. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "el examen microscópico muestra mucosa con hiperplasia foveolar y extensas zonas de metaplasia escamosa bien diferenciada, asociada a focos de metaplasia intestinal caliciforme. la lámina propia presenta congestión vascular y un infiltrado inflamatorio crónico linfohistiocitario moderado. la capa muscular propia muestra cambios de hipertrofia y fibrosis cicatrizal intersticial. se identifican frecuentes invaginaciones epiteliales correspondientes a senos de rokitansky-aschoff. no se detecta atipia estructural ni celular sospechosa de malignidad. el conducto cístico y arteria muestran bordes de resección libres.",
        diag: "COLECISTITIS CRÓNICA LITIÁSICA, CON METAPLASIA ESCAMOSA Y METAPLASIA INTESTINAL COMPATIBLE, NEGATIVO PARA DISPLASIA O CARCINOMA."
    },
    {
        id: 39,
        categoryId: 23,
        titulo: "COLECISTITIS CRÓNICA REAGUDIZADA",
        macro: "se recibe vesícula biliar de configuración elongada, que mide 9.5 x 4.0 x 3.5 cm, con superficie serosa de aspecto granular y congestiva, presentando áreas de fibrinopurulencia adheridas. al corte transversal, la pared muestra un marcado engrosamiento difuso (hasta 1.2 cm de espesor), con consistencia firme y aspecto blanquecino-grisáceo, sugerente de fibrosis transmural. la luz se encuentra distendida y contiene material biliar turbio, espeso y de coloración verdoso-oscura, junto con un único cálculo pigmentario pardo-negruzco, de superficie irregular, que mide 1.8 cm en su eje mayor. la mucosa presenta pérdida de su patrón reticular habitual, con áreas de ulceración focal y depósitos de material calcáreo granular adheridos a la pared. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "los cortes histológicos revelan una pared vesicular con arquitectura distorsionada por un denso infiltrado inflamatorio crónico, predominante linfoplasmocitario y con agregados linfoides foliculares, que se extiende desde la submucosa hasta la capa muscular y serosa. este proceso se superpone con un componente agudo exudativo, caracterizado por abundante infiltrado neutrofílico intraparietal, microabscesos en la mucosa y ulceración del epitelio superficial con exudado fibrinopurulento en la luz. se observa fibrosis hialina extensa que disocia las fibras musculares lisas, así como numerosos senos de rokitansky-aschoff dilatados, algunos de ellos rellenos de barro biliar e infiltrados por histiocitos espumosos. el epitelio de revestimiento remanente muestra metaplasia escamosa focal y cambios regenerativos atípicos reactivos, sin evidencia de displasia franca ni invasión estromal. no se identifican células neoplásicas ni depósitos amiloides.",
        diag: "VESÍCULA BILIAR CON COLECISTITIS CRÓNICA LITIÁSICA REAGUDIZADA, CON EXTENSA FIBROSIS MURAL, ULCERACIÓN MUCOSA Y ABSCESOS INTRAMURALES, SIN EVIDENCIA DE NEOPLASIA INTRAEPITELIAL NI CARCINOMA INFILTRANTE."
    },
    {
        id: 40,
        categoryId: 23,
        titulo: "COLECISTITIS CRÓNICA REAGUDIZADA 2",
        macro: "se recibe espécimen de colecistectomía piriforme de 10.0 x 4.5 x 3.0 cm. la superficie externa se observa deslustrada, de coloración parduzca con parches eritematosos y depósito purulento laxo. al corte, la pared tiene un espesor de 1.0 cm, mostrando consistencia aumentada y aspecto nacarado. la cavidad contiene abundante bilis purulenta de coloración verdosa y un cálculo único facetado de 1.5 cm de diámetro. la mucosa está erosionada de manera focal con parches hemorrágicos. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "los cortes de vesícula biliar muestran mucosa con descamación y necrosis epitelial focal. se aprecia un denso y difuso infiltrado inflamatorio mixto: linfoplasmocitos y abundantes polimorfonucleares neutrófilos, formando microabscesos en las criptas y extendiéndose hacia la muscular propia y tejido conectivo subseroso. la muscular exhibe bandas de colagenización antigua e hipertrofia celular. se identifican invaginaciones de rokitansky-aschoff con restos celulares e histiocitos con pigmento biliar. no se constatan atipias arquitecturales ni malignidad.",
        diag: "COLECISTITIS CRÓNICA REAGUDIZADA LITIÁSICA, CON ULCERACIÓN EXTENSA Y FIBROSIS TRANSMURAL, SIN SIGNOS DE NEOPLASIA."
    },
    {
        id: 41,
        categoryId: 23,
        titulo: "COLECISTITIS CRÓNICA REAGUDIZADA 3",
        macro: "se recibe pieza de vesícula biliar que mide 9.0 x 4.0 x 3.2 cm. la serosa se presenta congestiva, con vasos inyectados y membranas de fibrina sobre su superficie. al corte transversal, la pared mide hasta 0.9 cm de espesor y muestra aspecto fibroso blanquecino. la luz está ocupada por bilis espesa mezclada con detritos y un lito pigmentado ovoide de 2.0 cm. la mucosa se observa aplanada y congestiva, con áreas denudadas. se incluye muestra representativa, 3 cortes. 1 casete.",
        micro: "el examen microscópico exhibe mucosa vesicular con ulceración epitelial activa y exudado fibrino-leucocitario. en el corion se observa infiltrado inflamatorio crónico linfohistiocitario con formación de folículos linfoides, asociado a una marcada infiltración de neutrófilos que compromete la túnica muscular. la pared presenta fibrosis colágena cicatrizal y distorsión de haces musculares. se observan senos de rokitansky-aschoff dilatados. los cambios regenerativos epiteliales son benignos y reactivos. márgenes de sección libres.",
        diag: "COLECISTITIS CRÓNICA REAGUDIZADA LITIÁSICA, ASOCIADA A FIBROSIS PARIETAL Y ULCERACIÓN AGUDA DE LA MUCOSA, LIBRE DE MALIGNIDAD."
    },
    {
        id: 42,
        categoryId: 28,
        titulo: "PAPANICOLAOU ATRÓFICO",
        macro: "se recibe 1 extendido cervicovaginal convencional.",
        micro: "tinción: Papanicolaou\n\nclasificación: sistema Bethesda 2014\n\n1. adecuación de la muestra\n\nadecuación: satisfactoria para evaluación.\n\ncelularidad: adecuada (conformada predominantemente por células parabasales y basales).\n\ncélulas endocervicales / zona de transformación: presentes.\n\ncalidad de la preservación celular: adecuada.\n\n2. interpretación\n\ncélulas escamosas: ausencia de atipia. se observan cambios morfológicos propios de estado atrófico.\n\ncélulas glandulares: endocervicales presentes sin alteraciones.\n\n3. hallazgos adicionales\n\nmicroorganismos: no se detectan.\n\ncambios reactivos/reparativos: cambios celulares asociados a atrofia. inflamación aguda de intensidad leve.\n\notros hallazgos: no identificados.",
        diag: "DIAGNÓSTICO CITOLÓGICO\n(ADAPTADO DE BETHESDA SYSTEM 2014, NATIONAL INSTITUTES OF HEALTH)\nNEGATIVO PARA LESIÓN ESCAMOSA INTRAEPITELIAL O NEOPLASIA MALIGNA.\n- FROTIS CON PATRÓN ATRÓFICO."
    },
    {
        id: 43,
        categoryId: 28,
        titulo        micro: "tinción: Papanicolaou\n\nclasificación: sistema Bethesda 2014\n\n1. adecuación de la muestra\nadecuación: satisfactoria para evaluación.\ncelularidad: adecuada con presencia de componente de la zona de transformación (células endocervicales / metaplásicas).\ncalidad de la preservación celular: adecuada.\n\n2. interpretación\ncélulas escamosas: intermedias y superficiales de contornos regulares y cromatina uniforme. ausencia de atipia nuclear ni citoplásmica.\ncélulas glandulares: endocervicales presentes sin alteraciones.\n\n3. hallazgos adicionales\nmicroorganismos: flora bacilar saprófita habitual (lactobacillus spp. / bacilos de Döderlein).\ncambios reactivos/reparativos: no identificados.\notros hallazgos: no se observan microorganismos patógenos ni evidencia de atipia intraepitelial.",
        diag: "DIAGNÓSTICO CITOLÓGICO\n(ADAPTADO DE BETHESDA SYSTEM 2014, NATIONAL INSTITUTES OF HEALTH)\nNEGATIVO PARA LESIÓN ESCAMOSA INTRAEPITELIAL O NEOPLASIA MALIGNA (NILM).\n- EXTENDIDO TRÓFICO DENTRO DE LÍMITES NORMALES."
    },
    {
        id: 55,
        categoryId: 28,
        titulo: "PAPANICOLAOU NORMAL (CON INFLAMACIÓN LEVE INESPECÍFICA)",
        macro: "se recibe 1 extendido cervicovaginal convencional.",
        micro: "tinción: Papanicolaou\n\nclasificación: sistema Bethesda 2014\n\n1. adecuación de la muestra\nadecuación: satisfactoria para evaluación.\ncelularidad: adecuada con buena representación escamosa y endocervical.\ncalidad de la preservación celular: adecuada.\n\n2. interpretación\ncélulas escamosas: maduración conservada. se observan cambios celulares reactivos/reparativos leves secundarios a proceso inflamatorio inespecífico. núcleos de tamaño uniforme sin hipercromasia.\ncélulas glandulares: endocervicales presentes.\n\n3. hallazgos adicionales\nmicroorganismos: no detectados.\ncambios reactivos/reparativos: inflamación aguda de intensidad leve.\notros hallazgos: fondo con moderados polimorfonucleares leucocitarios y escaso moco de fondo.",
        diag: "DIAGNÓSTICO CITOLÓGICO\n(ADAPTADO DE BETHESDA SYSTEM 2014, NATIONAL INSTITUTES OF HEALTH)\nNEGATIVO PARA LESIÓN ESCAMOSA INTRAEPITELIAL O NEOPLASIA MALIGNA (NILM).\n- CAMBIOS CELULARES REACTIVOS ASOCIADOS A INFLAMACIÓN LEVE INESPECÍFICA."
    },
    {
        id: 56,
        categoryId: 28,
        titulo: "PAPANICOLAOU NORMAL (CON CITÓLISIS FISIOLÓGICA)",
        macro: "se recibe 1 extendido cervicovaginal convencional.",
        micro: "tinción: Papanicolaou\n\nclasificación: sistema Bethesda 2014\n\n1. adecuación de la muestra\nadecuación: satisfactoria para evaluación.\ncelularidad: adecuada con componente de zona de transformación presente.\ncalidad de la preservación celular: adecuada.\n\n2. interpretación\ncélulas escamosas: predominio de células intermedias. se observa citólisis fisiológica prominente con presencia de núcleos libres desnudos de aspecto benigno y restos citoplásmicos fragmentados.\ncélulas glandulares: endocervicales presentes sin atipia.\n\n3. hallazgos adicionales\nmicroorganismos: abundante flora lactobacilar de Döderlein asociada a fenómeno citolítico.\ncambios reactivos/reparativos: no identificados.\notros hallazgos: ausencia de atipia nuclear, koilocitos o células displásicas.",
        diag: "DIAGNÓSTICO CITOLÓGICO\n(ADAPTADO DE BETHESDA SYSTEM 2014, NATIONAL INSTITUTES OF HEALTH)\nNEGATIVO PARA LESIÓN ESCAMOSA INTRAEPITELIAL O NEOPLASIA MALIGNA (NILM).\n- EXTENDIDO CON CAMBIOS CITOLÍTICOS FISIOLÓGICOS BENIGNOS."
    },
    {
        id: 57,
        categoryId: 28,
        titulo: "PAPANICOLAOU NORMAL (PATRÓN HIPOESTROGÉNICO / TRANSIOLÓGICO)",
        macro: "se recibe 1 extendido cervicovaginal convencional.",
        micro: "tinción: Papanicolaou\n\nclasificación: sistema Bethesda 2014\n\n1. adecuación de la muestra\nadecuación: satisfactoria para evaluación.\ncelularidad: adecuada con escaso moco de fondo.\ncalidad de la preservación celular: adecuada.\n\n2. interpretación\ncélulas escamosas: compuestas predominantemente por células intermedias y parabasales de núcleos monótonos y redondos. proporción núcleo-citoplasma adecuada para el estadio hormonal.\ncélulas glandulares: endocervicales presentes.\n\n3. hallazgos adicionales\nmicroorganismos: escasa flora bacilar habitual.\ncambios reactivos/reparativos: no identificados.\notros hallazgos: no se observan microorganismos patógenos ni signos de atipia nuclear escamosa o glandular.",
        diag: "DIAGNÓSTICO CITOLÓGICO\n(ADAPTADO DE BETHESDA SYSTEM 2014, NATIONAL INSTITUTES OF HEALTH)\nNEGATIVO PARA LESIÓN ESCAMOSA INTRAEPITELIAL O NEOPLASIA MALIGNA (NILM).\n- PATRÓN HIPOESTROGÉNICO / TRANSIOLÓGICO SIN ATIPIA."
    },
    {
        id: 62,
        categoryId: 28,
        titulo: "PAPANICOLAOU NORMAL (PATRÓN GESTACIONAL / NAVICULAR)",
        macro: "se recibe 1 extendido cervicovaginal convencional.",
        micro: "tinción: Papanicolaou\n\nclasificación: sistema Bethesda 2014\n\n1. adecuación de la muestra\nadecuación: satisfactoria para evaluación.\ncelularidad: adecuada con excelente representación de la zona de transformación (células endocervicales mucíparas y metaplásicas).\ncalidad de la preservación celular: adecuada.\n\n2. interpretación\ncélulas escamosas: marcado predominio de células intermedias naviculares (ricas en glucógeno citoplásmico) con bordes plegados característicos. se observa citólisis fisiológica por flora lactobacilar. núcleos monótonos de tamaño uniforme, sin atipia nuclear ni signos de displasia.\ncélulas glandulares: endocervicales presentes en grupos y sábanas de aspecto reactivo fisiológico propio del estado gestacional.\n\n3. hallazgos adicionales\nmicroorganismos: abundante flora bacilar de Döderlein.\ncambios reactivos/reparativos: frotis compatible con patrón gestacional (navicular/citolítico). inflamación de intensidad leve.\notros hallazgos: no se observan microorganismos patógenos ni atipias escamosas o glandulares.",NÓSTICO CITOLÓGICO\n(ADAPTADO DE BETHESDA SYSTEM 2014, NATIONAL INSTITUTES OF HEALTH)\nNEGATIVO PARA LESIÓN ESCAMOSA INTRAEPITELIAL O NEOPLASIA MALIGNA (NILM).\n- PATRÓN HIPOESTROGÉNICO / TRANSIOLÓGICO SIN ATIPIA."
    },
    {
        id: 62,
        categoryId: 28,
        titulo: "PAPANICOLAOU NORMAL (PATRÓN GESTACIONAL / NAVICULAR)",
        macro: "se recibe 1 extendido cervicovaginal convencional.",
        micro: "tinción: Papanicolaou\n\nclasificación: sistema Bethesda 2014\n\n1. adecuación de la muestra\nadecuación: satisfactoria para evaluación.\ncelularidad: adecuada con excelente representación de la zona de transformación (células endocervicales mucíparas y metaplásicas).\ncalidad de la preservación celular: adecuada.\n\n2. interpretación\ncélulas escamosas: marcado predominio de células intermedias naviculares (ricas en glucógeno citoplásmico) con bordes plegados característicos. se observa citólisis fisiológica por flora lactobacilar. núcleos monótonos de tamaño uniforme, sin atipia nuclear ni signos de displasia.\ncélulas glandulares: endocervicales presentes en grupos y sábanas de aspecto reactivo fisiológico propio del estado gestacional.\n\n3. hallazgos adicionales\nmicroorganismos: abundante flora bacilar de Döderlein.\ncambios reactivos/reparativos: frotis compatible con patrón gestacional (navicular/citolítico). inflamación de intensidad leve.\notros hallazgos: no se observan microorganismos patógenos ni atipias escamosas o glandulares.",
        diag: "DIAGNÓSTICO CITOLÓGICO\n(ADAPTADO DE BETHESDA SYSTEM 2014, NATIONAL INSTITUTES OF HEALTH)\nNEGATIVO PARA LESIÓN ESCAMOSA INTRAEPITELIAL O NEOPLASIA MALIGNA (NILM).\n- EXTENDIDO CON CAMBIOS CELULARES FISIOLÓGICOS ASOCIADOS A GESTACIÓN (PATRÓN NAVICULAR Y CITOLÍTICO BENIGNO)."
    },
    {
        id: 58,
        categoryId: 28,
        titulo: "PAPANICOLAOU - ASCUS (ATIPIA ESCAMOSA DE SIGNIFICADO INCIERTO)",
        macro: "se recibe 1 extendido cervicovaginal convencional.",
        micro: "tinción: Papanicolaou\n\nclasificación: sistema Bethesda 2014\n\n1. adecuación de la muestra\nadecuación: satisfactoria para evaluación.\ncelularidad: adecuada con presencia de componente de la zona de transformación.\ncalidad de la preservación celular: adecuada.\n\n2. interpretación\ncélulas escamosas: se identifican células escamosas intermedias y superficiales con leve agrandamiento nuclear (2 a 3 veces el área de un núcleo intermedio normal), discreta hipercromasia y contornos nucleares ligeramente irregulares, pero sin atipia citopática coilocítica franca ni criterios definitivos para lesión intraepitelial.\ncélulas glandulares: endocervicales presentes sin atipia.\n\n3. hallazgos adicionales\nmicroorganismos: flora bacilar habitual.\ncambios reactivos/reparativos: inflamación leve a moderada de fondo.\notros hallazgos: no se identifican patógenos específicos.",
        diag: "DIAGNÓSTICO CITOLÓGICO\n(ADAPTADO DE BETHESDA SYSTEM 2014, NATIONAL INSTITUTES OF HEALTH)\nATIPIA DE CÉLULAS ESCAMOSAS DE SIGNIFICADO INCIERTO (ASC-US).\n- SE SUGIERE PRUEBA MOLECULAR PARA VPH DE ALTO RIESGO O REPETIR CITOLOGÍA CERVICOVAGINAL EN 6 MESES SEGÚN GUÍAS ASCCP."
    },
    {
        id: 59,
        categoryId: 28,
        titulo: "PAPANICOLAOU - LIE DE BAJO GRADO (LSIL / VPH - NIC 1)",
        macro: "se recibe 1 extendido cervicovaginal convencional.",
        micro: "tinción: Papanicolaou\n\nclasificación: sistema Bethesda 2014\n\n1. adecuación de la muestra\nadecuación: satisfactoria para evaluación.\ncelularidad: adecuada con componente de la zona de transformación presente.\ncalidad de la preservación celular: adecuada.\n\n2. interpretación\ncélulas escamosas: presencia de células escamosas superficiales e intermedias que muestran atipia citopática patognomónica de infección por vph (coilocitos), caracterizada por halo perinuclear claro nítido y delimitado, núcleos agrandados, hipercrómicos, de contornos angulados e irregulares con membrana nuclear engrosada. se reconocen binucleaciones focales y disqueratocitos aislados.\ncélulas glandulares: endocervicales sin alteraciones.\n\n3. hallazgos adicionales\nmicroorganismos: no se detectan patógenos específicos.\ncambios reactivos/reparativos: inflamación de intensidad leve a moderada.\notros hallazgos: ausencia de células parabasales atípicas ni mitosis anormales.",
        diag: "DIAGNÓSTICO CITOLÓGICO\n(ADAPTADO DE BETHESDA SYSTEM 2014, NATIONAL INSTITUTES OF HEALTH)\nLESIÓN ESCAMOSA INTRAEPITELIAL DE BAJO GRADO (LSIL).\n- CAMBIOS CITOPÁTICOS POR VPH / NEOPLASIA INTRAEPITELIAL CERVICAL GRADO 1 (NIC 1).\n- SE SUGIERE EVALUACIÓN COLPOSCÓPICA Y CORRELACIÓN HISTOPATOLÓGICA SEGÚN GUÍAS ASCCP."
    },
    {
        id: 60,
        categoryId: 28,
        titulo: "PAPANICOLAOU - ASCH (ATIPIA ESCAMOSA NO PERMITE DESCARTAR LIE DE ALTO GRADO)",
        macro: "se recibe 1 extendido cervicovaginal convencional.",
        micro: "tinción: Papanicolaou\n\nclasificación: sistema Bethesda 2014\n\n1. adecuación de la muestra\nadecuación: satisfactoria para evaluación.\ncelularidad: adecuada con presencia de elementos endocervicales.\ncalidad de la preservación celular: adecuada.\n\n2. interpretación\ncélulas escamosas: se identifican grupos y células pequeñas parabasales/metaplásicas aisladas que presentan una relación núcleo/citoplasma marcadamente aumentada, hipercromasia nuclear y membranas nucleares irregulares. las alteraciones citológicas son cuantitativamente insuficientes para un diagnóstico concluyente de hsil, pero impiden excluir con certeza una lesión intraepitelial de alto grado.\ncélulas glandulares: ausentes de atipia.\n\n3. hallazgos adicionales\nmicroorganismos: no se identifican.\ncambios reactivos/reparativos: inflamación moderada de fondo.\notros hallazgos: se sugiere correlación con biopsia dirigida.",
        diag: "DIAGNÓSTICO CITOLÓGICO\n(ADAPTADO DE BETHESDA SYSTEM 2014, NATIONAL INSTITUTES OF HEALTH)\nATIPIA DE CÉLULAS ESCAMOSAS EN LAS QUE NO SE PUEDE EXCLUIR UNA LESIÓN INTRAEPITELIAL DE ALTO GRADO (ASC-H).\n- SE SUGIERE EVALUACIÓN COLPOSCÓPICA PRIORITARIA Y BIOPSIA DIRIGIDA SEGÚN GUÍAS ASCCP."
    },
    {
        id: 61,
        categoryId: 28,
        titulo: "PAPANICOLAOU - LIE DE ALTO GRADO (HSIL / NIC 2 - NIC 3)",
        macro: "se recibe 1 extendido cervicovaginal convencional.",
        micro: "tinción: Papanicolaou\n\nclasificación: sistema Bethesda 2014\n\n1. adecuación de la muestra\nadecuación: satisfactoria para evaluación.\ncelularidad: adecuada con zona de transformación representada.\ncalidad de la preservación celular: adecuada.\n\n2. interpretación\ncélulas escamosas: presencia de células escamosas atípicas de tipo parabasal y metaplásico (pequeñas a medianas) dispuestas en células aisladas y placas densas sincitiales. exhiben marcada relación núcleo/citoplasma aumentada, núcleos hipercromáticos con distribución irregular de la cromatina, escotaduras y muescas en la membrana nuclear. se reconocen queratinocitos atípicos y disqueratocitos. ausencia de diátesis tumoral de fondo (sin necrosis tumoral franca), lo que descarta invasión en la muestra evaluada.\ncélulas glandulares: endocervicales presentes sin atipia glandular primaria.\n\n3. hallazgos adicionales\nmicroorganismos: no detectados.\ncambios reactivos/reparativos: inflamación de fondo de intensidad moderada.\notros hallazgos: hallazgos compatibles con nic 2 / nic 3.",
        diag: "DIAGNÓSTICO CITOLÓGICO\n(ADAPTADO DE BETHESDA SYSTEM 2014, NATIONAL INSTITUTES OF HEALTH)\nLESIÓN ESCAMOSA INTRAEPITELIAL DE ALTO GRADO (HSIL).\n- COMPATIBLE CON NEOPLASIA INTRAEPITELIAL CERVICAL GRADO 2 / GRADO 3 (NIC 2 / NIC 3 / CARCINOMA IN SITU).\n- SE SUGIERE COLPOSCOPIA INMEDIATA Y BIOPSIA DIRIGIDA SEGÚN GUÍAS ASCCP."
    },
    {
        id: 45,
        categoryId: 32,
        titulo: "TRAGO ACCESORIO (APÉNDICE PREAURICULAR)",
        macro: "el espécimen recibido consiste en una pieza de tejido blando de forma ovoide, de dimensiones 1.2 x 0.9 x 0.6 cm, cubierta por una superficie cutánea de color piel, lisa y brillante, con un discreto reborde cartilaginoso palpable en su interior. la superficie de resección profunda presenta bordes limpios y bien delimitados, sin evidencias de hemorragia o necrosis. el corte transversal muestra un núcleo firme, blanquecino y homogéneo, compatible con tejido cartilaginoso maduro, rodeado por un estroma fibroadiposo amarillento.",
        micro: "el estudio histológico de la lesión revela un nódulo dérmico bien circunscrito, no encapsulado, cubierto por una epidermis de estratificación conservada y sin signos de atipia queratinocítica. en la dermis reticular se identifica un núcleo central de cartílago elástico maduro, con condrocitos dispuestos en lagunas, de morfología uniforme y sin binucleaciones atípicas, rodeado por un pericondrio íntegro. el estroma adyacente muestra anejos cutáneos maduros, incluyendo folículos pilosos y glándulas sebáceas de aspecto normal, inmersos en un tejido conjuntivo fibroadiposo. no se observan mitosis atípicas, necrosis tumoral, figuras de permeación perineural ni angioinvasión. los márgenes quirúrgicos (profundo y periféricos) se encuentran libres de lesión, con un margen de seguridad mayor a 1 mm en todos los ejes.",
        diag: "TRAGO ACCESORIO (APÉNDICE PREAURICULAR) DE CARACTERÍSTICAS BENIGNAS, CON CARTÍLAGO ELÁSTICO MADURO, SIN EVIDENCIA DE ATIPIA, Y CON MÁRGENES QUIRÚRGICOS NEGATIVOS PARA TUMOR."
    },
    {
        id: 63,
        categoryId: 4,
        titulo: "RESTOS PLACENTARIOS / CONTENIDO ENDOUTERINO RETENIDO (CRITERIOS MD ANDERSON)",
        macro: "se reciben múltiples fragmentos tisulares de aspecto membranoso y velloso, de coloración gris-rojiza a pardo-hemática, mezclados con coágulos sanguíneos de reciente formación, que en conjunto miden aproximadamente 3.5 x 3.0 x 1.2 cm y pesan 5.8 gramos; el material se remite íntegramente para estudio histológico tras fijación en formol tamponado al 10% en [ n ] casete(s).",
        micro: "el estudio con hematoxilina-eosina evidencia la presencia de vellosidades coriónicas de morfología conservada, tapizadas por dos capas de trofoblasto (citotrofoblasto interno y sincitiotrofoblasto externo), con escasos signos de degeneración hidrópica o hialinización estromales, que en áreas muestran una ligera fibrosis estromal intervellosa. el tejido endometrial adyacente revela decidua basal con cambios necróticos focales y un infiltrado inflamatorio crónico inespecífico (linfocitario y ocasional plasmocitario) en la interfase, sin evidencia de granulomas ni necrosis fibrinoide extensa. los espacios vasculares deciduales muestran trombos organizados en fase de recanalización, compatibles con tejido placentario retenido de larga evolución.\n\nEVALUACIÓN MD ANDERSON DE ENFERMEDAD TROFOB LÁSTICA GESTACIONAL (ETG):\n• atipia citológica trofoblástica: no identificada.\n• proliferación trofoblástica circunferencial: ausente.\n• formación de cisternas / cambios molares: ausentes (sin evidencia de mola hidatiforme completa o parcial).\n• invasión o malignidad: ausente (negativo para coriocarcinoma o tumor trofoblástico del sitio placentario).",
        diag: "ENDOMETRIO / TEJIDO ENDOUTERINO, CURETAJE / LEGRADO UTERINO INSTRUMENTAL (LUI):\n- RESTOS PLACENTARIOS (VELLOSIDADES CORIÓNICAS Y DECIDUA BASAL) COMPATIBLES CON CONTENIDO ENDOUTERINO RETENIDO.\n- VASCULOPATÍA DECIDUAL Y TROMBOSIS VASCULAR RECANALIZADA ASOCIADA A RETENCIÓN PROLONGADA.\n- SIN EVIDENCIA DE ATIPIA TROFOB LÁSTICA, CAMBIOS MOLARES (ENFERMEDAD TROFOB LÁSTICA GESTACIONAL) NI NEOPLASIA GESTACIONAL EN EL MATERIAL EXAMINADO."
    },
    {
        id: 64,
        categoryId: 4,
        titulo: "RESTOS PLACENTARIOS / LEGRADO UTERINO (VOLUMEN 20 CC)",
        macro: "se reciben múltiples fragmentos tisulares de aspecto membranoso y velloso, de coloración gris-rojiza a pardo-hemática, mezclados con coágulos sanguíneos de reciente formación, que en conjunto hacen un volumen de 20 cc. se incluye muestra representativa en 2 casetes.",
        micro: "en los cortes histológicos se observa la presencia de vellosidades coriónicas de morfología conservada, tapizadas por dos capas de trofoblasto (citotrofoblasto interno y sincitiotrofoblasto externo), con escasos signos de degeneración hidrópica o hialinización estromales, que en áreas muestran una ligera fibrosis estromal intervellosa.\n• atipia citológica trofoblástica: no identificada.\n• proliferación trofoblástica circunferencial: ausente.\n• formación de cisternas / cambios molares: ausentes.",
        diag: "TEJIDO ENDOUTERINO, CURETAJE / LEGRADO UTERINO INSTRUMENTAL (LUI):\n- RESTOS PLACENTARIOS (VELLOSIDADES CORIÓNICAS Y DECIDUA BASAL) COMPATIBLES CON CONTENIDO ENDOUTERINO RETENIDO, SIN EVIDENCIA DE ATIPIA."
    },
    {
        id: 69,
        categoryId: 4,
        titulo: "HIPERPLASIA SIMPLE SIN ATIPIA",
        macro: "se reciben en fijador múltiples fragmentos irregulares de tejido blando, pardo-rojizos y francamente hemorrágicos, que en conjunto miden 1.5 x 1.0 x 0.4 cm. se procesa la totalidad de la muestra en un bloque de parafina.",
        micro: "los cortes muestran tejido endometrial con incremento difuso en la densidad glandular y alteración de la relación glándula/estroma (>1:1), con glándulas de tamaños variados, dilataciones quísticas y contornos tortuosos. el epitelio conserva la polaridad nuclear, con núcleos monótonos y sin atipia citológica ni pleomorfismo; el estroma interglandular persiste celular, con extravasación hemática focal y artefactos de compresión mecánica.",
        diag: "BIOPSIA DE ENDOMETRIO:\n- COMPATIBLE CON HIPERPLASIA ENDOMETRIAL SIN ATIPIA.\n\nRECOMENDACIÓN: SE SUGIERE CORRELACIÓN CLÍNICO-ECOGRÁFICA Y TRATAMIENTO CONSERVADOR CON PROGESTÁGENOS, CON CONTROL DE SEGUIMIENTO PARA VERIFICAR LA REGRESIÓN DE LA LESIÓN."
    }
];

if (typeof window !== 'undefined') {
    window.defaultTemplates = defaultTemplates;
}