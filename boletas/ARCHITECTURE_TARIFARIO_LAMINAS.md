# ARQUITECTURA: TARIFARIO POR LÁMINAS Y DESGLOSE EN REPORTE DE BOLETAS
**Director General:** Dr. José Castillo  
**Mando Supremo:** Dr. José Castillo (`jclab59@gmail.com`)  
**Módulo Objetivo:** `C:\Users\HP\Desktop\repositorio\reportedeboletas\antigravity.js`

---

## 1. REGLAS DE NEGOCIO DEL TARIFARIO ESCALONADO (CLÍNICA LA MUJER)
Para "CENTRO MÉDICO CLÍNICA DE LA MUJER S.A.C." (id: 2 o coincidencia con "La Mujer"):
- **Regla Escalonada de Láminas:**
  * 1 Lámina  -> S/ 40.00
  * 2 Láminas -> S/ 60.00
  * 3 Láminas -> S/ 80.00
  * Fórmula general: `costo = 40.0 + (num_laminas - 1) * 20.0` (para `num_laminas >= 1`).
- Para otras clínicas sin convenio por lámina:
  * Aplica `tarifaBase` por defecto (ej. S/ 70.00).

---

## 2. DESGLOSE DINÁMICO EN UI (`buildCostoInputs`)
En `buildCostoInputs`:
- Cada muestra incluye:
  * Selector / Input de Número de Láminas (1, 2, 3...) cuando el cliente es Clínica La Mujer.
  * Al cambiar el número de láminas, el costo de la muestra se recalcula automáticamente (`40`, `60`, `80`).
  * Campos opcionales para: Código de Biopsia (ej. 26Q-343) y Nombre de Paciente.
  * Cálculo reactivo inmediato del total a facturar (`calcularTotal()`).

---

## 3. GENERACIÓN DE BOLETA / COMPROBANTE EN PDF (jsPDF)
- Renderizado de tabla limpia y profesional:
  * Columnas: `Item`, `Código`, `Paciente`, `Descripción / Muestra`, `Láminas`, `Importe (S/)`.
  * Total en letras y número exacto.
  * Zero-Trust Hash SHA-256 y QR de validación.
  * **ESTRICTAMENTE PROHIBIDO:** No incluir textos como "PENDIENTE", "EN ADMISIÓN", ni asteriscos innecesarios en la boleta final. Todos los ítems facturados deben figurar en estado de servicio prestado y liquidado.
