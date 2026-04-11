/**
 * VARIANTES - Herramientas > Eléctricas > Sierras
 * Ruta: admin/src/variantes/herramientas/electricas/sierras/variantes.js
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
      "Sierra circular con cable",
      "Sierra circular a batería",
      "Sierra caladora / Jigsaw con cable",
      "Sierra caladora a batería",
      "Sierra sable / Recip saw",
      "Sierra de mesa / Table saw",
      "Sierra de inglete / Miter saw",
      "Sierra de cinta / Band saw",
      "Sierra de cadena / Motosierra",
      "Sierra de cadena a batería",
      "Multiherramienta oscilante"
    ]
  },

  potencia_w: {
    tipo: "texto",
    requerido: false,
    opciones: ["400–600 W", "600–900 W", "900–1200 W", "1200–1800 W", "1800–2400 W", "2400 W+"]
  },

  diametro_hoja_mm: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "No aplica", "130 mm", "140 mm", "150 mm", "160 mm",
      "165 mm", "184 mm", "190 mm", "210 mm", "250 mm+"
    ]
  },

  voltaje_bateria: {
    tipo: "texto",
    requerido: false,
    opciones: ["No aplica (cable)", "18V", "20V MAX", "36V / 40V", "54V / 60V"]
  },

  profundidad_corte_mm: {
    tipo: "texto",
    requerido: false,
    opciones: ["Hasta 40 mm", "40–55 mm", "55–65 mm", "65–75 mm", "75–90 mm", "90 mm+"]
  },

  color_producto: {
    tipo: "imagen",
    requerido: false,
    nota: "El vendedor sube foto real del producto. El cliente elige la imagen en el client.",
    guia_vendedor: [
      "Amarillo + negro (DeWalt)", "Rojo (Milwaukee / Skilsaw)", "Verde (Bosch)",
      "Azul (Makita)", "Naranja (Ridgid)", "Verde oscuro (Metabo)", "Genérico"
    ]
  },

  incluye: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "Solo sierra (sin hoja)",
      "Con hoja de corte incluida",
      "Con 2 hojas + maletín",
      "Con batería + cargador",
      "Kit completo en maletín"
    ]
  },

  marca: {
    tipo: "texto",
    requerido: false,
    opciones: [
      "DeWalt DCS570 / DCS7485",
      "Milwaukee M18 FUEL / 6390-21",
      "Bosch GKS 18V / GTS 10",
      "Makita DSS611 / DCS552",
      "Metabo KGS 216 / STA 18 LTX",
      "STIHL MS 180 / MSA 120 (motosierra)",
      "Husqvarna 120 / 450e (motosierra)",
      "Ridgid R8654SB",
      "Genérico"
    ]
  }

}; // fin variantes

export function getAtributos() { return variantes; }
