/**
 * VARIANTES - Herramientas > Eléctricas > Amoladoras
 * Ruta: admin/src/variantes/herramientas/electricas/amoladoras/variantes.js
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
      "Amoladora angular 4.5\" / 115 mm",
      "Amoladora angular 5\" / 125 mm",
      "Amoladora angular 7\" / 180 mm",
      "Amoladora angular 9\" / 230 mm",
      "Amoladora a batería 4.5\"",
      "Amoladora a batería 5\"",
      "Amoladora recta (die grinder)",
      "Amoladora de banco / esmeril"
    ]
  },

  potencia_w: {
    tipo: "texto",
    requerido: false,
    opciones: ["500–700 W", "700–900 W", "900–1200 W", "1200–1600 W", "1600–2400 W", "2400 W+"]
  },

  rpm_max: {
    tipo: "texto",
    requerido: false,
    opciones: ["6000 rpm", "8500 rpm", "10000 rpm", "11000 rpm", "12000 rpm", "13000 rpm"]
  },

  diametro_disco: {
    tipo: "texto",
    requerido: false,
    opciones: ["115 mm (4.5\")", "125 mm (5\")", "150 mm (6\")", "180 mm (7\")", "230 mm (9\")"]
  },

  proteccion: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Sin protección reinicio",
      "Con protección reinicio automático",
      "Con freno electrónico",
      "Con sistema antivibraciones",
      "Con regulación electrónica velocidad"
    ]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Amarillo + negro (DeWalt)", "Rojo + negro (Milwaukee)", "Verde (Bosch)",
      "Azul (Makita)", "Verde oscuro (Metabo)", "Rojo (AEG)", "Naranja (Ridgid)", "Genérico"
    ]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Solo amoladora",
      "Con 1 disco de corte",
      "Con kit discos (corte + desbaste + lija)",
      "Con maletín + accesorios",
      "Con batería + cargador (inalámbrica)"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "DeWalt DWE402 / DCG413",
      "Milwaukee AGO 13-125 / M18 FUEL",
      "Bosch GWS 700 / GWS 18V",
      "Makita GA5030 / DGA504",
      "Metabo W 850-125 / WB 18 LT BL",
      "Hikoki G13SR4 / G18DSL",
      "Ryobi ONE+ PCL710",
      "AEG WS13-125XE",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
