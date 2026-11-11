/
├── ARCHITECTURE.md
├── main.py                          # Punto de entrada servidor FastAPI (puerto 8010)
├── config.py                        # Configuración global de puertos y endpoints IA
├── data/
│   ├── autodiagnosticos.json        # Plantillas de diagnóstico rápido
│   ├── cache_reniec_soberano.json   # Cache local de identidades DNI
│   └── catalogo_bayesiano.json      # Catálogo indexado de médicos y clínicas
├── modules/
│   ├── cortana/
│   │   ├── cortana_client.js        # Cliente JS con fallback y auto-reconexión a puerto 8010
│   │   └── cortana_service.py       # Endpoints FastAPI (/cortana/ask, /cortana/health)
│   ├── vlm/
│   │   ├── vlm_engine.py            # Orquestador VLM con Ollama/vLLM (OCR + Macroscopía)
│   │   └── vlm_client.js            # Captura de imagen / drag & drop en el editor
│   ├── boletas/
│   │   ├── boletas_storage.js       # Persistencia LocalFirst + Supabase
│   │   ├── boletas_pdf.js           # Generación de PDF en cliente (jsPDF)
│   │   └── boletas_ui.js            # Eventos y renderizado HTML
│   └── caja_negra/
│       └── caja_negra_client.js     # Time-machine de historial de pacientes
└── schemas/
    ├── cap_digestivo.js             # Protocolo CAP Digestivo
    ├── cap_gyn_endocrine.js         # Protocolo CAP Mama y Ginecología
    ├── cap_liver.js                 # Protocolo CAP Hígado
    ├── cap_urology.js               # Protocolo CAP Próstata/Urología
    └── index.js                     # Exportador unificado de esquemas CAP


## 28. REGLA INVIOLABLE: ORDENAMIENTO SLA DE INFORMES (🔴 INCONCLUSOS ARRIBA, 🟢 FIRMADOS ABAJO)
- Todos los listados de pacientes y tablas de reportes (reportes.html, ui_tables.js, main.js, db_service.js) deben priorizar primero los casos inconclusos o pendientes de firma (🔴 punto rojo).
- Los casos completados y firmados digitalmente (🟢 punto verde) deben agruparse estrictamente en segundo lugar.
- Dentro de cada grupo se respeta el orden cronológico descendente por código de atención / fecha.
