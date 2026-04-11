/**
 * VARIANTES - Herramientas > Manuales > Llaves
 * Ruta: admin/src/variantes/herramientas/manuales/llaves/variantes.js
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Usar cuando ver la foto del color/acabado es esencial.
 * tipo: "texto"  → selector de chips / botones de texto para opciones técnicas.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]
  },

  tipo: {
    tipo: "texto",
    requerido: true,
    opciones: [
      "Llave fija / Boca fija (plana)",
      "Llave combinada (fija + corona)",
      "Llave de corona / Ring",
      "Llave ajustable / Francesa",
      "Llave inglesa / Stillson (tuberías)",
      "Llave Allen / Hexagonal set",
      "Llave Torx set",
      "Llave de impacto manual",
      "Llave de trinquete / Ratchet + dados",
      "Set de dados métricos (mm)",
      "Set de dados imperiales (pulgadas)",
      "Set combinado (trinquete + dados + accesorios)",
      "Llave dinamométrica / Torquímetro",
      "Llave de cadena",
      "Llave de correa (filtro aceite)"
    ]
  },

  medidas_mm: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "6–7 mm", "8–9 mm", "10–11 mm", "12–13 mm", "14–15 mm",
      "16–17 mm", "18–19 mm", "10–32 mm (set completo)",
      "1/4\" + 3/8\" + 1/2\" (set dados)"
    ]
  },

  material: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Acero cromo vanadio (CrV)",
      "Acero cromo molibdeno (CrMo)",
      "Acero inoxidable",
      "Acero forjado 45C",
      "Acero con recubrimiento anti-óxido"
    ]
  },

  piezas_set: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Pieza individual", "Set 6 piezas", "Set 8 piezas", "Set 10 piezas",
      "Set 12 piezas", "Set 14 piezas", "Set 17 piezas", "Set 21 piezas",
      "Set 40 piezas", "Set 72+ piezas"
    ]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del set o llave. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Plateado / Cromo (estándar)", "Negro mate (fosfatado)", "Negro + rojo (Milwaukee)",
      "Amarillo + negro (Stanley)", "Rojo + negro (Snap-on look)",
      "Set en maleta negra", "Set en maletín rojo", "Genérico plateado"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Snap-on",
      "Bahco S-1000 / Ergo",
      "Facom J.200 / OGV",
      "Stanley FatMax / STMT",
      "DeWalt DWMT73803 / DWMT81534",
      "Milwaukee SHOCKWAVE / Ratchet",
      "Craftsman CMMT / VERSASTACK",
      "Wera Joker / Zyklop",
      "Truper",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
